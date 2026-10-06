import { corpusSummary, search } from "@/lib/rag";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ docs: corpusSummary() });
}

export async function POST(req: Request) {
  const { query, k } = (await req.json()) as { query: string; k?: number };
  return Response.json({ hits: search(query ?? "", k ?? 4) });
}
