import { resume, sse, SSE_HEADERS, type Decision } from "@/lib/agents/runner";
import { store } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { threadId, ...decision } = (await req.json()) as Decision & { threadId: string };
  const run = store.runs.get(threadId);
  if (!run || run.status !== "awaiting_approval") return Response.json({ error: "No run awaiting approval" }, { status: 404 });
  return new Response(sse(run, () => resume(run, decision)), { headers: SSE_HEADERS });
}
