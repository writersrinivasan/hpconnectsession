// Offline hybrid RAG: section-aware chunking + hashed TF-IDF vectors + BM25, fused with
// Reciprocal Rank Fusion. Runs with zero network, so the demo can't fail on venue Wi-Fi.
// In production you would swap `embed()` for a hosted embedding model and a vector DB.
import { KNOWLEDGE_BASE } from "./data/knowledge";
import type { Citation } from "./types";

export interface Chunk {
  id: string;
  docId: string;
  docTitle: string;
  section: string;
  text: string;
  tokens: string[];
  vector: Float32Array;
}

const DIM = 512;
const STOP = new Set(
  "a an the and or of to for in on at by with is are be may must from as per any every each this that it its into than then their there these those not no only all our your we you they".split(" "),
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => t.replace(/(ing|ed|es|s)$/, (m) => (t.length > 4 ? "" : m)));
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function chunkDocs(): Omit<Chunk, "vector">[] {
  const out: Omit<Chunk, "vector">[] = [];
  for (const doc of KNOWLEDGE_BASE) {
    const sections = doc.body.split(/^## /m).filter(Boolean);
    sections.forEach((sec, i) => {
      const [heading, ...rest] = sec.split("\n");
      const text = rest.join(" ").replace(/\s+/g, " ").trim();
      out.push({
        id: `${doc.id}#${i + 1}`,
        docId: doc.id,
        docTitle: doc.title,
        section: heading.trim(),
        text,
        tokens: tokenize(`${heading} ${heading} ${text}`),
      });
    });
  }
  return out;
}

const raw = chunkDocs();
const df = new Map<string, number>();
for (const c of raw) for (const t of new Set(c.tokens)) df.set(t, (df.get(t) ?? 0) + 1);
const N = raw.length;
const idf = (t: string) => Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
const avgLen = raw.reduce((s, c) => s + c.tokens.length, 0) / N;

/** Hashed TF-IDF embedding over unigrams + bigrams, L2-normalised. */
export function embed(tokens: string[]): Float32Array {
  const v = new Float32Array(DIM);
  const feats = [...tokens, ...tokens.slice(1).map((t, i) => `${tokens[i]}_${t}`)];
  for (const f of feats) {
    const h = hash(f);
    v[h % DIM] += (h & 1 ? 1 : -1) * idf(f.split("_")[0]);
  }
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < DIM; i++) v[i] /= n;
  return v;
}

export const CHUNKS: Chunk[] = raw.map((c) => ({ ...c, vector: embed(c.tokens) }));

function bm25(q: string[], c: Chunk, k1 = 1.4, b = 0.75) {
  let s = 0;
  for (const t of new Set(q)) {
    const f = c.tokens.filter((x) => x === t).length;
    if (!f) continue;
    s += idf(t) * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * c.tokens.length) / avgLen)));
  }
  return s;
}

export interface Hit extends Citation {
  vectorScore: number;
  bm25Score: number;
}

export function search(query: string, k = 3, filterDocs?: string[]): Hit[] {
  const qt = tokenize(query);
  const qv = embed(qt);
  const pool = filterDocs ? CHUNKS.filter((c) => filterDocs.includes(c.docId)) : CHUNKS;
  const scored = pool.map((c) => {
    let dot = 0;
    for (let i = 0; i < DIM; i++) dot += qv[i] * c.vector[i];
    return { c, vec: dot, bm: bm25(qt, c) };
  });
  const byVec = [...scored].sort((a, b) => b.vec - a.vec);
  const byBm = [...scored].sort((a, b) => b.bm - a.bm);
  const rrf = new Map<string, number>();
  byVec.forEach((s, i) => rrf.set(s.c.id, (rrf.get(s.c.id) ?? 0) + 1 / (60 + i)));
  byBm.forEach((s, i) => rrf.set(s.c.id, (rrf.get(s.c.id) ?? 0) + 1 / (60 + i)));
  return scored
    .map((s) => ({ ...s, fused: rrf.get(s.c.id)! }))
    .sort((a, b) => b.fused - a.fused)
    .slice(0, k)
    .map((s) => ({
      chunkId: s.c.id,
      docId: s.c.docId,
      docTitle: s.c.docTitle,
      section: s.c.section,
      text: s.c.text,
      score: Number((s.fused * 30).toFixed(3)),
      vectorScore: Number(s.vec.toFixed(3)),
      bm25Score: Number(s.bm.toFixed(2)),
    }));
}

export function corpusSummary() {
  return KNOWLEDGE_BASE.map((d) => ({
    id: d.id,
    title: d.title,
    owner: d.owner,
    updated: d.updated,
    chunks: CHUNKS.filter((c) => c.docId === d.id).map((c) => ({ id: c.id, section: c.section, text: c.text, tokens: c.tokens.length })),
  }));
}
