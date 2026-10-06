// The supplier's agent endpoint (A2A). GET = Agent Card (discovery); POST = JSON-RPC message/send.
import { agentCard, supplierHandle } from "@/lib/a2a";
import { SUPPLIER } from "@/lib/data/company";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return Response.json(agentCard(new URL(req.url).origin));
}

export async function POST(req: Request) {
  const rpc = await req.json();
  const err = (code: number, message: string, status = 200) => Response.json({ jsonrpc: "2.0", id: rpc?.id ?? null, error: { code, message } }, { status });
  if (req.headers.get("authorization") !== `Bearer ${SUPPLIER.token}`) return err(-32001, "Unauthorized: invalid bearer token", 401);
  if (rpc?.method !== "message/send") return err(-32601, "Method not found");
  const part = rpc.params?.message?.parts?.find((p: { kind: string }) => p.kind === "data");
  if (!part) return err(-32602, "Expected a data part");
  const r = supplierHandle(part.data);
  const taskId = crypto.randomUUID();
  return Response.json({
    jsonrpc: "2.0",
    id: rpc.id,
    result: {
      kind: "task",
      id: taskId,
      contextId: rpc.params.message.contextId ?? crypto.randomUUID(),
      status: { state: r.state, timestamp: new Date().toISOString() },
      artifacts: r.state === "completed" ? [{ artifactId: crypto.randomUUID(), name: "raw-material-quotation", parts: [{ kind: "data", data: r.quote }] }] : [],
    },
  });
}
