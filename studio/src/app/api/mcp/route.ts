import { describeServers } from "@/lib/mcp";
import { agentCard } from "@/lib/a2a";
import { TOOL_ALLOWLIST } from "@/lib/guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return Response.json({ servers: await describeServers(), agentCard: agentCard(new URL(req.url).origin), allowlist: TOOL_ALLOWLIST });
}
