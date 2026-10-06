import { effectiveMode, hasCredentials, MODEL } from "@/lib/llm";
import { store } from "@/lib/store";
import type { Mode } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const view = () => ({ mode: store.mode, effective: effectiveMode(), hasCredentials: hasCredentials(), model: MODEL });

export async function GET() {
  return Response.json(view());
}

export async function POST(req: Request) {
  const { mode } = (await req.json()) as { mode: Mode };
  if (["auto", "live", "sim"].includes(mode)) store.mode = mode;
  return Response.json(view());
}
