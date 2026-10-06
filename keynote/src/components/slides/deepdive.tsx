"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Boxes, Cloud, Cpu, Database, FileText, Gauge, GitBranch, Lock, MessageCircle, Mic, Network, Plug, Search, Server, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Card, ease, Eyebrow, Footnote, Frame, Reveal, Step, Title, type SlideProps } from "../kit";

// ───────────── Data strategy ─────────────
const DATA = [
  { icon: Database, t: "Structured", eg: "Tally, ERP, GST returns", tip: "Connect directly, read-only first" },
  { icon: FileText, t: "Semi-structured", eg: "Excel sheets, invoices, POs, drawings", tip: "Extract with AI, validate with rules" },
  { icon: MessageCircle, t: "Unstructured", eg: "Email, WhatsApp, SOPs, voice notes", tip: "Index with RAG, keep the source link" },
  { icon: Mic, t: "Tacit", eg: "Know-how in your senior people's heads", tip: "Interview them, turn it into SOPs" },
];

export function DataStrategy({ step }: SlideProps) {
  return (
    <Frame>
      <Eyebrow>Deep dive · Data strategy</Eyebrow>
      <Title className="mt-6">
        Models are rented. <span className="gold-text italic">Your data is the moat.</span>
      </Title>
      <div className="mt-14 grid grid-cols-4 gap-6">
        {DATA.map((d, i) => (
          <Reveal key={d.t} delay={0.3 + i * 0.12}>
            <Card className="h-full !p-7">
              <d.icon size={40} className="text-gold" />
              <div className="mt-4 font-display text-[42px] leading-none">{d.t}</div>
              <div className="mt-3 text-[22px] text-ink-2">{d.eg}</div>
              <div className="mt-5 border-t border-white/10 pt-4 text-[20px] text-gold">{d.tip}</div>
            </Card>
          </Reveal>
        ))}
      </div>
      <Step step={step} at={1} className="mt-12">
        <div className="flex items-center gap-4 text-[26px]">
          {["Inventory", "Clean", "Govern (DPDP Act)", "Index for RAG", "Connect via MCP", "Measure quality"].map((s, i, a) => (
            <div key={s} className="flex items-center gap-4">
              <span className={`rounded-full px-6 py-3 ${i === 2 ? "border border-crimson/50 bg-crimson/10 text-[#ff9aa0]" : "border border-white/15 bg-white/5"}`}>{s}</span>
              {i < a.length - 1 && <ArrowRight className="text-gold" />}
            </div>
          ))}
        </div>
      </Step>
    </Frame>
  );
}

// ───────────── RAG ─────────────
type RagItem = { icon: typeof Database; t: string; d: string };

function RagRow({ items, at, label, step }: { items: RagItem[]; at: number; label: string; step: number }) {
  return (
    <Step step={step} at={at}>
      <div className="mb-4 text-[20px] tracking-[0.3em] text-ink-3">{label}</div>
      <div className="flex items-center gap-5">
        {items.map((s, i) => (
          <div key={s.t} className="flex items-center gap-5">
            <div className="glass w-[330px] !rounded-3xl p-6">
              <s.icon size={34} className="text-gold" />
              <div className="mt-3 font-display text-[36px] leading-none">{s.t}</div>
              <div className="mt-2 text-[20px] text-ink-2">{s.d}</div>
            </div>
            {i < items.length - 1 && <ArrowRight size={34} className="text-gold" />}
          </div>
        ))}
      </div>
    </Step>
  );
}

export function RagExplained({ step }: SlideProps) {
  const ingest = [
    { icon: FileText, t: "Your documents", d: "SOPs, price book, contracts" },
    { icon: Boxes, t: "Chunk", d: "Split by section" },
    { icon: Sparkles, t: "Embed", d: "Meaning → numbers" },
    { icon: Database, t: "Index", d: "Vector + keyword" },
  ];
  const ask = [
    { icon: MessageCircle, t: "Question", d: "“What discount can AI approve?”" },
    { icon: Search, t: "Retrieve", d: "Top passages, hybrid search" },
    { icon: BookOpen, t: "Ground", d: "Passages added to prompt" },
    { icon: ShieldCheck, t: "Answer + cite", d: "“Up to 5% [PB-2026#4]”" },
  ];
  return (
    <Frame>
      <Eyebrow>Deep dive · RAG (Retrieval-Augmented Generation)</Eyebrow>
      <Title className="mt-6">
        RAG is an <span className="gold-text italic">open-book exam</span> for AI.
      </Title>
      <div className="mt-14 space-y-12">
        <RagRow items={ingest} at={0} label="ONCE · INGEST" step={step} />
        <RagRow items={ask} at={1} label="EVERY QUESTION · RETRIEVE & ANSWER" step={step} />
      </div>
      <Step step={step} at={2} className="mt-10 text-[28px] text-ink-2">
        No source, no answer. Every claim the agent makes should point back to <span className="text-gold">your own document</span>.
      </Step>
    </Frame>
  );
}

// ───────────── Model selection ─────────────
const OPTIONS = [
  { t: "Frontier API", eg: "Claude, GPT, Gemini", icon: Cloud },
  { t: "Open-weight, your cloud", eg: "Llama, Qwen, Mistral, Gemma", icon: Server },
  { t: "Small model, on-prem / AI PC", eg: "Quantised 3–14B models", icon: Cpu },
  { t: "Specialists", eg: "OCR, vision, speech, Indic language models", icon: Mic },
];
const CRITERIA: [string, number[]][] = [
  ["Reasoning & judgement", [3, 2, 1, 1]],
  ["Data stays in your walls", [1, 2, 3, 2]],
  ["Low cost per task at volume", [1, 2, 3, 3]],
  ["Easy to set up & run", [3, 2, 1, 2]],
  ["Tamil / Hindi / Indic", [2, 2, 1, 3]],
];

export function ModelSelection({ step }: SlideProps) {
  return (
    <Frame>
      <Eyebrow>Deep dive · Model selection</Eyebrow>
      <Title className="mt-6">
        There is no best model. <span className="gold-text italic">Only the right model for each task.</span>
      </Title>
      <div className="mt-12 grid grid-cols-[440px_repeat(4,1fr)] items-center gap-x-6 gap-y-4">
        <div />
        {OPTIONS.map((o, i) => (
          <Reveal key={o.t} delay={0.3 + i * 0.1} className="glass !rounded-3xl p-5 text-center">
            <o.icon size={34} className="mx-auto text-gold" />
            <div className="mt-2 text-[24px] font-semibold leading-tight">{o.t}</div>
            <div className="mt-1 text-[17px] text-ink-3">{o.eg}</div>
          </Reveal>
        ))}
        {CRITERIA.map(([c, scores], r) => (
          <motion.div key={c} className="contents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + r * 0.1 }}>
            <div className="text-[24px] text-ink-2">{c}</div>
            {scores.map((s, i) => (
              <div key={i} className="flex justify-center gap-2.5">
                {[1, 2, 3].map((k) => (
                  <span key={k} className={`h-5 w-5 rounded-full ${k <= s ? "bg-gold shadow-[0_0_14px_rgba(251,193,5,0.6)]" : "bg-white/10"}`} />
                ))}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
      <Step step={step} at={1} className="mt-12">
        <div className="glass flex items-center gap-8 !rounded-3xl border-gold/40 px-10 py-6 text-[28px]">
          <Workflow className="shrink-0 text-gold" size={40} />
          <span>
            <b className="text-gold">Route by task:</b> frontier models for judgement, small models for volume, <b>plain code for arithmetic</b>, and specialist models for eyes and ears.
          </span>
        </div>
      </Step>
      <Footnote>Ratings are directional (●●● = strongest). Re-check prices and capabilities when you choose; this market changes every quarter.</Footnote>
    </Frame>
  );
}

// ───────────── Deployment workflows ─────────────
const PATTERNS = [
  { icon: Cloud, t: "Cloud API", for: "Fastest start, frontier quality", watch: "Redact PII before calling; check data-retention terms" },
  { icon: Lock, t: "Private cloud / VPC", for: "Regulated data, enterprise buyers", watch: "Higher setup; same models via cloud marketplaces" },
  { icon: Cpu, t: "Edge & on-prem", for: "Shop floor, offline, data that can't leave", watch: "Smaller models; AI PCs and workstations make this practical" },
];
const PIPE = [
  { t: "Build", d: "graph + tools" },
  { t: "Evaluate", d: "golden test set" },
  { t: "Shadow", d: "runs beside humans" },
  { t: "Canary", d: "10% of traffic" },
  { t: "Production", d: "inside limits" },
  { t: "Monitor", d: "cost, quality, drift" },
];

export function Deployment({ step }: SlideProps) {
  return (
    <Frame>
      <Eyebrow>Deep dive · Deployment workflows</Eyebrow>
      <Title className="mt-6">
        Ship agents like software: <span className="gold-text italic">tested, staged, watched.</span>
      </Title>
      <div className="mt-12 grid grid-cols-3 gap-7">
        {PATTERNS.map((p, i) => (
          <Reveal key={p.t} delay={0.3 + i * 0.12}>
            <Card className="h-full !p-7">
              <p.icon size={40} className="text-gold" />
              <div className="mt-3 font-display text-[44px] leading-none">{p.t}</div>
              <div className="mt-4 text-[23px] text-ink">{p.for}</div>
              <div className="mt-3 text-[20px] text-ink-3">⚠ {p.watch}</div>
            </Card>
          </Reveal>
        ))}
      </div>
      <Step step={step} at={1} className="mt-14">
        <div className="flex items-center justify-between">
          {PIPE.map((p, i) => (
            <div key={p.t} className="flex items-center">
              <motion.div initial={false} animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }} transition={{ delay: i * 0.15 }} className={`w-[230px] rounded-3xl border px-6 py-5 text-center ${p.t === "Evaluate" || p.t === "Shadow" ? "border-gold/60 bg-gold/10" : "border-white/12 bg-white/[0.04]"}`}>
                <div className="font-display text-[34px] leading-none">{p.t}</div>
                <div className="mt-2 text-[19px] text-ink-2">{p.d}</div>
              </motion.div>
              {i < PIPE.length - 1 && <GitBranch size={26} className="mx-2 rotate-90 text-gold/70" />}
            </div>
          ))}
        </div>
      </Step>
    </Frame>
  );
}

// ───────────── The agentic stack (orchestration, A2A, MCP) ─────────────
const ORCH = { x: 960, y: 650 };
const AGENTS = [
  { x: 580, y: 500, t: "Quality agent", icon: ShieldCheck },
  { x: 1340, y: 500, t: "Pricing agent", icon: Gauge },
  { x: 580, y: 820, t: "Inventory agent", icon: Boxes },
  { x: 1340, y: 820, t: "Procurement agent", icon: Network },
];
const RAG_BOX = { x: 960, y: 360 };
const MCP_BOX = { x: 220, y: 820 };
const A2A_BOX = { x: 1700, y: 820 };

function Box({ x, y, w, children, className = "", show = true }: { x: number; y: number; w: number; children: React.ReactNode; className?: string; show?: boolean }) {
  return (
    <motion.div initial={false} animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }} transition={{ duration: 0.6, ease }} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-3xl border bg-[#0d0b10] text-center ${className}`} style={{ left: x, top: y, width: w }}>
      {children}
    </motion.div>
  );
}

export function AgenticStack({ step }: SlideProps) {
  const line = (a: { x: number; y: number }, b: { x: number; y: number }, color: string, on = true) => on && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={3} className="flow" />;
  return (
    <div className="absolute inset-0">
      <Frame className="!pb-0">
        <Eyebrow>How it fits together</Eyebrow>
        <Title className="mt-6 !text-[70px]">
          Orchestration, A2A, MCP and RAG <span className="gold-text italic">in one picture.</span>
        </Title>
      </Frame>
      <svg viewBox="0 0 1920 1080" className="absolute inset-0 h-full w-full">
        {AGENTS.map((a) => (
          <g key={a.t}>{line(ORCH, a, "rgba(251,193,5,0.6)")}</g>
        ))}
        {line(MCP_BOX, AGENTS[2], "#3ddc97", step >= 1)}
        {line(A2A_BOX, AGENTS[3], "#a78bfa", step >= 2)}
        {line(RAG_BOX, AGENTS[0], "#4cc9f0", step >= 3)}
        {line(RAG_BOX, AGENTS[1], "#4cc9f0", step >= 3)}
      </svg>
      <Box x={ORCH.x} y={ORCH.y} w={320} className="border-gold/60 p-7 shadow-[0_0_90px_-10px_rgba(251,193,5,0.55)]">
        <Workflow size={50} className="mx-auto text-gold" />
        <div className="mt-2 font-display text-[42px] leading-none">Orchestrator</div>
        <div className="mt-2 text-[20px] italic text-ink-2">the shift supervisor (LangGraph)</div>
      </Box>
      {AGENTS.map((a) => (
        <Box key={a.t} x={a.x} y={a.y} w={270} className="border-white/15 p-5">
          <a.icon size={34} className="mx-auto text-gold" />
          <div className="mt-2 font-display text-[30px] leading-none">{a.t}</div>
        </Box>
      ))}
      <Box x={MCP_BOX.x} y={MCP_BOX.y} w={300} show={step >= 1} className="border-[#3ddc97]/60 p-6 text-left">
        <Plug size={36} className="text-[#3ddc97]" />
        <div className="mt-2 font-display text-[38px] leading-none">MCP</div>
        <div className="mt-2 text-[20px] leading-snug text-ink-2">
          <b className="text-[#3ddc97]">USB-C for AI.</b> Tally, ERP and email become tools any agent can use.
        </div>
      </Box>
      <Box x={A2A_BOX.x} y={A2A_BOX.y} w={330} show={step >= 2} className="border-[#a78bfa]/60 p-6 text-left">
        <Network size={36} className="text-[#a78bfa]" />
        <div className="mt-2 font-display text-[38px] leading-none">A2A</div>
        <div className="mt-2 text-[20px] leading-snug text-ink-2">
          <b className="text-[#a78bfa]">The phone line between agents.</b> Your procurement agent negotiates with the supplier&apos;s agent.
        </div>
      </Box>
      <Box x={RAG_BOX.x} y={RAG_BOX.y} w={420} show={step >= 3} className="border-[#4cc9f0]/60 px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          <BookOpen size={32} className="text-[#4cc9f0]" />
          <span className="font-display text-[36px]">RAG</span>
        </div>
        <div className="text-[20px] text-ink-2">the company library, with citations</div>
      </Box>
      <Step step={step} at={4} className="absolute bottom-[56px] left-1/2 -translate-x-1/2">
        <div className="whitespace-nowrap rounded-full border border-crimson/50 bg-crimson/10 px-10 py-4 text-[26px]">
          <ShieldCheck className="mr-3 inline text-[#ff8a8f]" /> All of it inside guardrails, an audit trail, evals and monitoring
        </div>
      </Step>
    </div>
  );
}

// ───────────── Industry explorer (interactive) ─────────────
const VERTICALS = [
  {
    k: "Manufacturing",
    where: "Auto components · Hosur, Coimbatore, Pune",
    data: "ERP item master & routings, machine logs, drawings, quality manuals, RFQ emails",
    models: "Frontier LLM for RFQ reading and reasoning; vision for drawings and defects; small on-prem model for shop-floor Q&A",
    deploy: "Hybrid: cloud LLM via API for documents, edge for machine data, MCP to ERP",
    agents: "RFQ→quote team · capacity planner · CAPA assistant · maintenance watcher",
    kpi: "Quote turnaround · win rate · OEE · PPM defects",
  },
  {
    k: "Textiles & Apparel",
    where: "Exporters · Tiruppur, Surat, Ludhiana",
    data: "Buyer tech packs, PO sheets, compliance audits, production updates in WhatsApp groups",
    models: "Multilingual LLM; Indic speech-to-text for Tamil/Hindi voice notes; vision for fabric defects",
    deploy: "Cloud + WhatsApp Business API; RAG over each buyer's compliance manual",
    agents: "Buyer order-status agent · compliance-document agent · sampling tracker",
    kpi: "On-time delivery · chargebacks · buyer response time",
  },
  {
    k: "Food Processing",
    where: "Spices, dairy, snacks · FSSAI regulated",
    data: "Batch records, lab results, cold-chain sensor logs, FSSAI rules, recipes",
    models: "Small anomaly models on sensor data; LLM + RAG for regulation and SOP questions",
    deploy: "Edge gateway in the plant for sensors; cloud for reporting and audits",
    agents: "Batch-release checker · shelf-life & expiry agent · recall-readiness agent",
    kpi: "Batch rejections · waste % · audit readiness",
  },
  {
    k: "Distribution & Trading",
    where: "FMCG, pharma and hardware distributors",
    data: "Tally sales and receivables, GSTR-2B, WhatsApp orders, scheme circulars",
    models: "Fast low-cost model for high-volume order parsing; frontier model for exceptions",
    deploy: "Cloud SaaS + MCP connector to Tally; WhatsApp as the front door",
    agents: "Order-capture agent · collections agent · GST reconciliation · scheme-claim agent",
    kpi: "DSO · order errors · input-tax-credit leakage",
  },
];

export function IndustryExplorer({ step }: SlideProps) {
  const [pick, setPick] = useState<number | null>(null);
  const idx = pick ?? Math.min(step, VERTICALS.length - 1);
  const v = VERTICALS[idx];
  const rows: [string, string, typeof Database][] = [
    ["Data strategy", v.data, Database],
    ["Model selection", v.models, Sparkles],
    ["Deployment", v.deploy, Cloud],
    ["Agents", v.agents, Workflow],
    ["KPIs that matter", v.kpi, Gauge],
  ];
  return (
    <Frame>
      <Eyebrow>Industry deep dives</Eyebrow>
      <Title className="mt-6 !text-[72px]">
        Same playbook. <span className="gold-text italic">Different data, models and rules.</span>
      </Title>
      <div className="mt-10 flex gap-4">
        {VERTICALS.map((x, i) => (
          <button key={x.k} onClick={() => setPick(i)} className={`rounded-full border px-7 py-3 text-[24px] transition ${i === idx ? "border-gold bg-gold text-black" : "border-white/15 text-ink-2 hover:border-gold/50"}`}>
            {x.k}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={v.k} initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -20, filter: "blur(8px)" }} transition={{ duration: 0.5, ease }} className="mt-10">
          <div className="text-[24px] text-ink-3">{v.where}</div>
          <div className="mt-6 grid grid-cols-1 gap-4">
            {rows.map(([k, val, Icon]) => (
              <div key={k} className="glass grid grid-cols-[360px_1fr] items-center gap-6 !rounded-3xl px-8 py-5">
                <div className="flex items-center gap-4">
                  <Icon size={30} className="text-gold" />
                  <span className="font-display text-[32px]">{k}</span>
                </div>
                <span className="text-[25px] leading-snug text-ink-2">{val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}
