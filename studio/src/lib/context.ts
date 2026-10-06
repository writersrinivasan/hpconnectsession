// Run context: one place where events, spans (tracing), audit entries and metrics are produced.
// Every agent receives a ctx, so observability is a property of the platform, not of each agent.
import { randomUUID } from "node:crypto";
import { appendAudit } from "./audit";
import { store, type RunRecord } from "./store";
import type { GuardVerdict, NodeId, RunEvent, RunSnapshot, Span } from "./types";

type Payload<T extends RunEvent["type"]> = Omit<Extract<RunEvent, { type: T }>, "type" | "ts">;

export class RunCtx {
  constructor(public run: RunRecord) {}

  emit<T extends RunEvent["type"]>(type: T, payload: Payload<T>) {
    const evt = { type, ts: Date.now(), ...payload } as unknown as RunEvent;
    this.run.events.push(evt);
    store.listeners.get(this.run.threadId)?.(evt);
  }

  startSpan(name: string, kind: Span["kind"], parentId: string | null, attrs: Span["attrs"] = {}): Span {
    const span: Span = { id: randomUUID().slice(0, 8), parentId, runId: this.run.runId, name, kind, start: Date.now(), attrs };
    this.run.spans.push(span);
    return span;
  }

  endSpan(span: Span, attrs: Span["attrs"] = {}) {
    span.end = Date.now();
    Object.assign(span.attrs, attrs);
    this.emit("span", { span: { ...span, attrs: { ...span.attrs } } });
  }

  audit(actor: string, action: string, details: Record<string, unknown>) {
    const entry = appendAudit(this.run.runId, actor, action, details);
    this.emit("audit", { entry });
  }

  guard(v: GuardVerdict, parentSpan: string | null) {
    if (v.verdict !== "pass") this.run.metrics.guardTrips++;
    const s = this.startSpan(`guard: ${v.rule}`, "guard", parentSpan, { verdict: v.verdict, stage: v.stage });
    this.endSpan(s);
    this.emit("guard", { verdict: v });
    if (v.verdict !== "pass") this.audit("Guardrail", `guard.${v.verdict}`, { rule: v.rule, detail: v.detail });
  }

  patch(p: Partial<RunSnapshot>) {
    Object.assign(this.run.snapshot, p);
    this.emit("state", { patch: p });
  }

  say(from: string, to: string, channel: "handoff" | "report" | "a2a" | "human", content: string) {
    this.emit("message", { from, to, channel, content });
  }

  think(agent: string, text: string) {
    this.emit("thought", { agent, text });
  }
}

export const NODE_META: Record<NodeId, { label: string; agent: string }> = {
  guard_in: { label: "Input Guardrail", agent: "Guardrail" },
  intake: { label: "Intake Agent", agent: "Intake Agent" },
  supervisor: { label: "Supervisor", agent: "Supervisor" },
  inventory: { label: "Inventory Agent", agent: "Inventory Agent" },
  quality: { label: "Quality Agent", agent: "Quality Agent" },
  compliance: { label: "Compliance Agent", agent: "Compliance Agent" },
  synthesis: { label: "Supervisor · Synthesis", agent: "Supervisor" },
  procurement: { label: "Procurement Agent", agent: "Procurement Agent" },
  pricing: { label: "Pricing Agent", agent: "Pricing Agent" },
  guard_out: { label: "Output Guardrail", agent: "Guardrail" },
  human: { label: "Human Approval", agent: "Human" },
  dispatch: { label: "Dispatch Agent", agent: "Dispatch Agent" },
  finalize: { label: "Close & Audit", agent: "Supervisor" },
};

export const ctxFor = (threadId: string) => {
  const run = store.runs.get(threadId);
  if (!run) throw new Error(`Unknown run ${threadId}`);
  return new RunCtx(run);
};
