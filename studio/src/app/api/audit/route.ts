import { restore, tamper, verifyLedger } from "@/lib/audit";
import { store } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ entries: store.ledger.slice(-300), verification: verifyLedger() });
}

export async function POST(req: Request) {
  const { action, seq } = (await req.json()) as { action: "tamper" | "restore"; seq?: number };
  const touched = action === "tamper" ? tamper(seq) : (restore(), null);
  return Response.json({ touched, verification: verifyLedger() });
}
