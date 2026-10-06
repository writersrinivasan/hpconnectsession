import { store } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const runs = [...store.runs.values()].sort((a, b) => a.startedAt - b.startedAt);
  const guardByRule: Record<string, number> = {};
  const nodeTotals: Record<string, { total: number; n: number }> = {};
  for (const r of runs) {
    for (const e of r.events) if (e.type === "guard" && e.verdict.verdict !== "pass") guardByRule[e.verdict.rule] = (guardByRule[e.verdict.rule] ?? 0) + 1;
    for (const [k, v] of Object.entries(r.nodeDurations)) {
      nodeTotals[k] ??= { total: 0, n: 0 };
      nodeTotals[k].total += v;
      nodeTotals[k].n++;
    }
  }
  return Response.json({
    runs: runs.map((r) => ({
      runId: r.runId,
      threadId: r.threadId,
      scenarioId: r.scenarioId,
      source: r.source,
      mode: r.mode,
      status: r.status,
      startedAt: r.startedAt,
      metrics: r.metrics,
      approver: r.snapshot.approval?.approver ?? null,
      decision: r.snapshot.approval?.decision ?? null,
    })),
    guardByRule,
    nodeAvgMs: Object.fromEntries(Object.entries(nodeTotals).map(([k, v]) => [k, Math.round(v.total / v.n)])),
  });
}
