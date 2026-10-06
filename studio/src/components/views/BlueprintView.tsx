"use client";
import { motion } from "framer-motion";
import { Activity, Bot, BookOpen, Brain, ClipboardCheck, Fingerprint, FlaskConical, Gauge, Lock, Network, Plug, ShieldCheck, UserCheck, Workflow } from "lucide-react";

const LAYERS = [
  {
    name: "Experience",
    tone: "#f5efe3",
    items: [
      { icon: UserCheck, t: "Humans in the loop", d: "Sales Head / MD approve exceptions" },
      { icon: Activity, t: "Ops console", d: "This studio: live view of every agent" },
    ],
  },
  {
    name: "Orchestration",
    tone: "#fbc105",
    items: [
      { icon: Workflow, t: "LangGraph state machine", d: "Supervisor, parallel fan-out, conditional routes" },
      { icon: UserCheck, t: "interrupt() + checkpointer", d: "Pause, save state, resume after approval" },
    ],
  },
  {
    name: "Agents",
    tone: "#ffb020",
    items: [
      { icon: Bot, t: "8 specialist agents", d: "Intake, Inventory, Quality, Compliance, Procurement, Pricing, Dispatch, Supervisor" },
      { icon: Brain, t: "LLM where it adds value", d: "Extraction, reasoning, writing. Arithmetic stays in code." },
    ],
  },
  {
    name: "Connectivity",
    tone: "#3ddc97",
    items: [
      { icon: Plug, t: "MCP servers", d: "ERP & email exposed as discoverable tools" },
      { icon: Network, t: "A2A protocol", d: "Agent Cards + JSON-RPC to supplier agents" },
    ],
  },
  {
    name: "Knowledge",
    tone: "#4cc9f0",
    items: [
      { icon: BookOpen, t: "Hybrid RAG", d: "Vector + BM25 over SOPs, policies, contracts" },
      { icon: ClipboardCheck, t: "Citations", d: "Every requirement traceable to a source chunk" },
    ],
  },
];

const TRUST = [
  { icon: ShieldCheck, t: "Guardrails", d: "PII, injection, policy, groundedness" },
  { icon: Lock, t: "Security", d: "Least-privilege tools, bearer auth, PII vault" },
  { icon: Fingerprint, t: "Audit trail", d: "SHA-256 hash-chained ledger" },
  { icon: Activity, t: "Observability", d: "Spans for every node, LLM call and tool call" },
  { icon: FlaskConical, t: "Evals", d: "Golden set + deterministic scorers + LLM judge" },
  { icon: Gauge, t: "Monitoring", d: "Latency, cost, autonomy rate, guard trips" },
];

export function BlueprintView() {
  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_330px] gap-4 overflow-y-auto scroll-thin">
      <div className="space-y-2.5">
        <div className="mb-3">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink-3">The whole stack in a nutshell</div>
          <h2 className="font-display text-4xl">
            An <span className="gold-text italic">agentic MSME</span> is a system, not a chatbot.
          </h2>
        </div>
        {LAYERS.map((l, i) => (
          <motion.div key={l.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="glass grid grid-cols-[150px_1fr_1fr] items-center gap-3 px-4 py-3" style={{ borderLeft: `3px solid ${l.tone}` }}>
            <div className="font-display text-xl" style={{ color: l.tone }}>
              {l.name}
            </div>
            {l.items.map((it) => (
              <div key={it.t} className="flex items-start gap-2.5">
                <it.icon size={18} style={{ color: l.tone }} className="mt-0.5 shrink-0" />
                <div>
                  <div className="text-[13.5px] font-semibold text-ink">{it.t}</div>
                  <div className="text-[12px] text-ink-2">{it.d}</div>
                </div>
              </div>
            ))}
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass flex items-center gap-4 px-4 py-3" style={{ borderLeft: "3px solid #a78bfa" }}>
          <div className="w-[150px] font-display text-xl text-violet">Models</div>
          <div className="text-[13px] text-ink-2">
            Claude via the Anthropic SDK, with structured outputs, refusal fallback, and token and cost accounting. A <b className="text-ink">stage-safe simulator</b> takes over if there&apos;s no network. Each model call is one replaceable part of the system.
          </div>
        </motion.div>
      </div>
      <div className="glass flex flex-col gap-2 p-4" style={{ background: "linear-gradient(180deg, rgba(251,193,5,0.08), rgba(255,59,59,0.05))" }}>
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Trust layer · wraps everything</div>
        <div className="font-display text-2xl leading-tight">Autonomy is earned, not granted.</div>
        {TRUST.map((t, i) => (
          <motion.div key={t.t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }} className="flex items-start gap-3 rounded-xl bg-black/25 px-3 py-2.5">
            <t.icon size={18} className="mt-0.5 text-gold" />
            <div>
              <div className="text-[13.5px] font-semibold">{t.t}</div>
              <div className="text-[12px] text-ink-2">{t.d}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
