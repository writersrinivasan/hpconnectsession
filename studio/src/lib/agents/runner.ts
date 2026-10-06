// Starts / resumes graph runs and turns them into an event stream for the UI (SSE) or evals.
import { randomUUID } from "node:crypto";
import { Command } from "@langchain/langgraph";
import { RunCtx } from "../context";
import { effectiveMode, MODEL } from "../llm";
import { emptyMetrics, emptySnapshot, store, type RunRecord } from "../store";
import type { InboundEmail, RunEvent, RunStatus } from "../types";
import { graph } from "./graph";

export interface StartArgs {
  scenarioId: string;
  email: InboundEmail;
  origin: string;
  source?: "studio" | "eval";
}

export function createRun(a: StartArgs): RunRecord {
  const threadId = `thr_${randomUUID().slice(0, 8)}`;
  const run: RunRecord = {
    runId: `run_${randomUUID().slice(0, 8)}`,
    threadId,
    scenarioId: a.scenarioId,
    source: a.source ?? "studio",
    mode: effectiveMode(),
    startedAt: Date.now(),
    status: "running",
    events: [],
    spans: [],
    metrics: emptyMetrics(),
    snapshot: emptySnapshot(),
    prompts: [],
    nodeDurations: {},
  };
  store.runs.set(threadId, run);
  return run;
}

async function drive(run: RunRecord, input: unknown): Promise<RunStatus> {
  const ctx = new RunCtx(run);
  const config = { configurable: { thread_id: run.threadId }, streamMode: "updates" as const, recursionLimit: 40 };
  let interrupted = false;
  try {
    for await (const chunk of await graph().stream(input as never, config)) {
      if ("__interrupt__" in chunk) {
        interrupted = true;
        const snap = run.snapshot;
        ctx.emit("interrupt", { approval: snap.approval!, quote: snap.quote });
      }
    }
    if (interrupted) {
      run.status = "awaiting_approval";
      return run.status;
    }
    const state = await graph().getState({ configurable: { thread_id: run.threadId } });
    run.status = (state.values.status as RunStatus) ?? "completed";
  } catch (err) {
    run.status = "error";
    ctx.emit("warning", { text: `Run failed: ${String(err)}` });
  }
  run.endedAt = Date.now();
  run.metrics.durationMs = run.endedAt - run.startedAt;
  const root = run.spans.find((s) => s.kind === "run");
  if (root) ctx.endSpan(root, { status: run.status });
  ctx.emit("run.end", { status: run.status, metrics: run.metrics });
  return run.status;
}

export function start(run: RunRecord, a: StartArgs) {
  const ctx = new RunCtx(run);
  ctx.startSpan(`run ${run.scenarioId}`, "run", null, { scenario: run.scenarioId, mode: run.mode });
  ctx.emit("run.start", { runId: run.runId, threadId: run.threadId, scenarioId: run.scenarioId, mode: run.mode, model: MODEL });
  return drive(run, {
    threadId: run.threadId,
    origin: a.origin,
    email: a.email,
    status: "running",
    risk: "low",
  });
}

export interface Decision {
  decision: "approved" | "rejected";
  approverName: string;
  comment?: string;
  counterDiscountPct?: number | null;
}

export function resume(run: RunRecord, d: Decision) {
  run.status = "running";
  return drive(run, new Command({ resume: d }));
}

/** Wrap a run in a Server-Sent Events stream. */
export function sse(run: RunRecord, work: () => Promise<unknown>) {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      const send = (e: RunEvent) => controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
      store.listeners.set(run.threadId, send);
      work().finally(() => {
        store.listeners.delete(run.threadId);
        controller.close();
      });
    },
    cancel() {
      store.listeners.delete(run.threadId);
    },
  });
}

export const SSE_HEADERS = {
  "content-type": "text/event-stream; charset=utf-8",
  "cache-control": "no-cache, no-transform",
  connection: "keep-alive",
};
