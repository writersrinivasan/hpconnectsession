import { SCENARIOS } from "@/lib/data/company";
import { createRun, sse, SSE_HEADERS, start } from "@/lib/agents/runner";
import type { InboundEmail } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { scenarioId?: string; email?: InboundEmail };
  const scenario = SCENARIOS.find((s) => s.id === body.scenarioId);
  const email = body.email ?? scenario?.email;
  if (!email) return Response.json({ error: "scenarioId or email required" }, { status: 400 });
  const args = { scenarioId: scenario?.id ?? "custom", email, origin: new URL(req.url).origin };
  const run = createRun(args);
  return new Response(sse(run, () => start(run, args)), { headers: SSE_HEADERS });
}
