"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, FileText, Search } from "lucide-react";
import { Chip, Empty, Panel } from "../ui";

interface Doc {
  id: string;
  title: string;
  owner: string;
  updated: string;
  chunks: { id: string; section: string; text: string; tokens: number }[];
}
interface Hit {
  chunkId: string;
  docTitle: string;
  section: string;
  text: string;
  score: number;
  vectorScore: number;
  bm25Score: number;
}

const PIPE = ["SOPs & policies", "Section-aware chunking", "Embeddings + BM25 index", "Hybrid retrieval (RRF)", "Grounded answer + citations"];
const SAMPLES = ["What discount can the AI approve on its own?", "EN8 material certificate", "Can we share customer name with supplier?", "export packaging requirements"];

export function KnowledgeView() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState(SAMPLES[0]);
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    fetch("/api/rag")
      .then((r) => r.json())
      .then((d) => setDocs(d.docs));
  }, []);

  const ask = async (query = q) => {
    setQ(query);
    const r = await fetch("/api/rag", { method: "POST", body: JSON.stringify({ query, k: 4 }) }).then((x) => x.json());
    setHits(r.hits);
  };

  const maxV = Math.max(0.001, ...hits.map((h) => h.vectorScore));
  const maxB = Math.max(0.001, ...hits.map((h) => h.bm25Score));

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="glass flex items-center gap-2 px-4 py-3 text-[12px]">
        {PIPE.map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 ${i === 3 ? "bg-gold text-black font-semibold" : "bg-white/5 text-ink-2"}`}>{p}</span>
            {i < PIPE.length - 1 && <ArrowRight size={13} className="text-ink-3" />}
          </div>
        ))}
        <span className="ml-auto text-[11px] text-ink-3">Runs offline · swap in your embedding model + vector DB for production</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] gap-3">
        <Panel title="Company knowledge base" icon={<BookOpen size={13} className="text-gold" />} bodyClass="overflow-y-auto scroll-thin p-2">
          {docs.map((d) => (
            <div key={d.id} className="mb-1">
              <button onClick={() => setOpen(open === d.id ? null : d.id)} className="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left hover:bg-white/5">
                <FileText size={15} className="mt-0.5 text-gold" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-ink">{d.title}</div>
                  <div className="text-[11px] text-ink-3">
                    {d.id} · {d.owner} · {d.chunks.length} chunks · {d.updated}
                  </div>
                </div>
              </button>
              {open === d.id &&
                d.chunks.map((c) => (
                  <div key={c.id} className="mb-1 ml-7 rounded-lg bg-black/25 px-2.5 py-1.5 text-[11.5px]">
                    <div className="font-mono text-cyan">
                      {c.id} · {c.section} · {c.tokens} tok
                    </div>
                    <div className="text-ink-2">{c.text}</div>
                  </div>
                ))}
            </div>
          ))}
        </Panel>
        <Panel title="Ask the knowledge base" icon={<Search size={13} className="text-gold" />} bodyClass="overflow-y-auto scroll-thin p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask();
            }}
            className="flex gap-2"
          >
            <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 rounded-xl border hairline bg-black/30 px-4 py-2.5 text-[14px] outline-none focus:border-gold/50" />
            <button className="rounded-xl bg-gold px-5 text-[13px] font-bold text-black">Retrieve</button>
          </form>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SAMPLES.map((s) => (
              <button key={s} onClick={() => ask(s)} className="rounded-full border hairline px-2.5 py-0.5 text-[11.5px] text-ink-2 hover:border-gold/40 hover:text-gold">
                {s}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {hits.length === 0 && <Empty>Retrieval uses two methods together: vector similarity finds similar meaning, BM25 finds exact terms like “EN8” or “PPAP”. Reciprocal Rank Fusion merges the two rankings.</Empty>}
            {hits.map((h, i) => (
              <motion.div key={h.chunkId + q} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-2xl border hairline bg-white/[0.03] p-3">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="font-display text-xl text-gold">#{i + 1}</span>
                  <Chip tone="cyan">{h.chunkId}</Chip>
                  <span className="text-ink">{h.docTitle}</span>
                  <span className="text-ink-3">› {h.section}</span>
                  <span className="ml-auto font-mono text-ink-2">fused {h.score}</span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{h.text}</p>
                <div className="mt-2 grid grid-cols-2 gap-3 text-[10.5px] text-ink-3">
                  {[
                    ["vector (semantic)", h.vectorScore, maxV],
                    ["BM25 (keyword)", h.bm25Score, maxB],
                  ].map(([l, v, m]) => (
                    <div key={l as string}>
                      <div className="flex justify-between">
                        <span>{l}</span>
                        <span className="font-mono">{v as number}</span>
                      </div>
                      <div className="mt-0.5 h-1.5 rounded-full bg-white/5">
                        <div className="h-1.5 rounded-full bg-[#c98f00]" style={{ width: `${Math.max(2, ((v as number) / (m as number)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
