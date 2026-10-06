import { createRun, resume, start } from "@/lib/agents/runner";
import { EVAL_CASES, score } from "@/lib/evals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ cases: EVAL_CASES.map(({ id, name, category, expect }) => ({ id, name, category, expect })) });
}

/** Runs the suite sequentially and streams one result per case (NDJSON over SSE). */
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
      for (const c of EVAL_CASES) {
        send({ type: "case.start", id: c.id });
        const args = { scenarioId: `eval:${c.id}`, email: c.email, origin, source: "eval" as const };
        const run = createRun(args);
        await start(run, args);
        const scores = await score(c, run);
        // Close out HITL pauses so eval runs don't linger as "awaiting approval".
        if (run.status === "awaiting_approval") await resume(run, { decision: "rejected", approverName: "Eval Harness", comment: "auto-closed after scoring" });
        send({ type: "case.end", id: c.id, runId: run.runId, mode: run.mode, scores, metrics: run.metrics });
      }
      send({ type: "suite.end" });
      controller.close();
    },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache" } });
}
