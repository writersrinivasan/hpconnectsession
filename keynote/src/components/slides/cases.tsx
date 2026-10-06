"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, ExternalLink, Factory, Fingerprint, FlaskConical, Gauge, Lock, Package, Radar, Shirt, ShieldCheck, Soup, Truck } from "lucide-react";
import { ease, Eyebrow, Footnote, Frame, Reveal, Step, Title, type SlideProps } from "../kit";

export const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL ?? "http://localhost:3001";

const CASES = [
  {
    icon: Factory,
    v: "Manufacturing · Tier-2 auto components",
    t: "RFQ to quote in minutes, not days",
    pain: "Quotes took 2–3 days because the owner checked stock, capacity, quality clauses and price by hand. Urgent RFQs went to competitors.",
    agents: ["Intake", "Supervisor", "Inventory (MCP→ERP)", "Quality (RAG)", "Compliance", "Procurement (A2A)", "Pricing", "Dispatch"],
    guard: "Discount above 5% or margin under the floor → Sales Head / MD approval",
    measure: "Quote turnaround · win rate · margin leakage",
  },
  {
    icon: Shirt,
    v: "Textiles · garment exporter",
    t: "Buyers get answers before they chase",
    pain: "Merchandisers spent their days answering “where is my order?” from overseas buyers, pulling status out of WhatsApp groups and Excel.",
    agents: ["WhatsApp intake", "Production-status (MCP→ERP)", "Compliance-docs (RAG)", "Buyer-update writer"],
    guard: "No delivery promise without a confirmed production slot; buyer data stays tokenised",
    measure: "Buyer response time · on-time delivery · chargebacks",
  },
  {
    icon: Truck,
    v: "Distribution · FMCG distributor",
    t: "Collections and GST on autopilot, exceptions to humans",
    pain: "High DSO and month-end GST mismatches. Two accountants spent most of the month chasing payments and reconciling GSTR-2B against Tally.",
    agents: ["Receivables (MCP→Tally)", "Reminder writer", "GST reconciler", "Exception router"],
    guard: "Never threaten or offer waivers; disputes go straight to a human",
    measure: "DSO · ITC leakage · hours spent on reconciliation",
  },
  {
    icon: Soup,
    v: "Food processing · spice exporter",
    t: "Batch release with the rulebook built in",
    pain: "Batch documents were checked manually against FSSAI and buyer specs. Missing lab values were found late, after shipping was booked.",
    agents: ["Batch-record reader", "Spec checker (RAG)", "Lab-result validator", "Release recommender"],
    guard: "AI recommends; only Quality Head releases. Every check is cited and logged.",
    measure: "Batch rejections · release lead time · audit findings",
  },
];

export function CaseStudies({ step }: SlideProps) {
  const c = CASES[Math.min(step, CASES.length - 1)];
  return (
    <Frame>
      <Eyebrow>Case studies across verticals</Eyebrow>
      <div className="mt-6 flex items-end justify-between">
        <Title className="!text-[72px]">
          Four MSMEs. <span className="gold-text italic">One pattern.</span>
        </Title>
        <div className="flex gap-3 pb-4">
          {CASES.map((x, i) => (
            <span key={x.v} className={`h-3 rounded-full transition-all duration-500 ${i === Math.min(step, 3) ? "w-14 bg-gold" : "w-3 bg-white/20"}`} />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={c.v} initial={{ opacity: 0, x: 80, filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: -80, filter: "blur(10px)" }} transition={{ duration: 0.7, ease }} className="mt-10 grid grid-cols-[1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-4 text-[24px] text-gold">
              <c.icon size={34} /> {c.v}
            </div>
            <div className="mt-4 font-display text-[64px] leading-[1.03]">{c.t}</div>
            <div className="mt-8 text-[20px] tracking-[0.3em] text-ink-3">THE PAIN</div>
            <p className="mt-3 text-[27px] leading-snug text-ink-2">{c.pain}</p>
          </div>
          <div className="space-y-6">
            <div className="glass !rounded-3xl p-7">
              <div className="text-[20px] tracking-[0.3em] text-ink-3">AGENT TEAM</div>
              <div className="mt-4 flex flex-wrap gap-3">
                {c.agents.map((a) => (
                  <span key={a} className="rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-[21px] text-gold">
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div className="glass !rounded-3xl border-crimson/30 p-7">
              <div className="text-[20px] tracking-[0.3em] text-ink-3">GUARDRAIL THAT MATTERS</div>
              <div className="mt-3 text-[25px] text-ink">{c.guard}</div>
            </div>
            <div className="glass !rounded-3xl p-7">
              <div className="text-[20px] tracking-[0.3em] text-ink-3">MEASURE BEFORE & AFTER</div>
              <div className="mt-3 text-[25px] text-ink">{c.measure}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <Footnote>Illustrative composites based on common MSME engagement patterns. Swap in named client stories and measured results where you have permission.</Footnote>
    </Frame>
  );
}

export function LiveDemo() {
  const watch = [
    ["01", "Standard RFQ", "Watch agents fan out, call MCP tools, and source steel from a supplier over A2A"],
    ["02", "Rush + 12% discount", "Watch the policy engine pause the run for the MD's approval"],
    ["03", "Prompt injection", "Watch hidden instructions get quarantined"],
    ["04", "Restricted party + PII", "Watch personal data get tokenised and the deal hard-stopped"],
  ];
  return (
    <div className="absolute inset-0">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="absolute inset-0" style={{ background: "radial-gradient(50% 50% at 70% 50%, rgba(255,46,58,0.18), transparent 70%)" }} />
      <Frame className="grid grid-cols-[1fr_760px] items-center gap-16">
        <div>
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="relative flex h-5 w-5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-75" />
                <span className="relative inline-flex h-5 w-5 rounded-full bg-crimson" />
              </span>
              <span className="eyebrow !text-crimson">Live demo</span>
            </div>
          </Reveal>
          <Title className="mt-6 !text-[96px]">
            Let&apos;s watch a <span className="gold-text italic">factory think.</span>
          </Title>
          <Reveal delay={0.5} className="mt-8 text-[30px] leading-snug text-ink-2">
            Thendral Precision Components: a fictional 140-person auto-component maker in Hosur, run by a team of LangGraph agents. Every step is visible.
          </Reveal>
          <Reveal delay={0.8} className="mt-12">
            <a href={STUDIO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 rounded-full bg-gradient-to-r from-[#ffd84d] to-[#ff9d00] px-12 py-6 text-[32px] font-bold text-black shadow-[0_0_80px_rgba(251,193,5,0.45)]">
              <Radar size={36} /> Open AgentOps Studio <ExternalLink size={28} />
            </a>
            <div className="mt-4 text-[20px] text-ink-3">
              Press <kbd className="rounded border border-white/20 px-2">L</kbd> to launch · {STUDIO_URL}
            </div>
          </Reveal>
        </div>
        <div className="space-y-5">
          {watch.map(([n, t, d], i) => (
            <Reveal key={n} delay={0.4 + i * 0.15} className="glass flex gap-6 !rounded-3xl p-6">
              <span className="font-mono text-[34px] text-gold">{n}</span>
              <div>
                <div className="font-display text-[36px] leading-none">{t}</div>
                <div className="mt-2 text-[21px] text-ink-2">{d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Frame>
    </div>
  );
}

const PILLARS = [
  { icon: ShieldCheck, t: "Guardrails", d: "PII redaction, injection defence, policy limits, groundedness checks" },
  { icon: Lock, t: "Security", d: "Least-privilege tools, signed agent-to-agent calls, secrets kept out of prompts" },
  { icon: Fingerprint, t: "Audit trail", d: "Every decision hash-chained. Tampering shows up immediately." },
  { icon: Activity, t: "Observability", d: "A trace for every agent step, model call and tool call" },
  { icon: FlaskConical, t: "Evals", d: "A golden test set must pass before every release" },
  { icon: Gauge, t: "Monitoring", d: "Cost per run, latency, autonomy rate, escalations, drift" },
];

export function TrustStack({ step }: SlideProps) {
  return (
    <Frame>
      <Eyebrow>Trust · safety · governance</Eyebrow>
      <Title className="mt-6">
        A demo needs a model. <span className="gold-text italic">Production needs a trust stack.</span>
      </Title>
      <div className="mt-14 grid grid-cols-3 gap-7">
        {PILLARS.map((p, i) => (
          <Step key={p.t} step={step} at={i < 3 ? 0 : 1}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 3) * 0.12, ease }} className="glass h-full !rounded-3xl p-8">
              <p.icon size={44} className="text-gold" />
              <div className="mt-4 font-display text-[46px] leading-none">{p.t}</div>
              <div className="mt-3 text-[23px] leading-snug text-ink-2">{p.d}</div>
            </motion.div>
          </Step>
        ))}
      </div>
    </Frame>
  );
}

export function Economics({ step }: SlideProps) {
  return (
    <Frame className="grid grid-cols-2 items-center gap-20">
      <div>
        <Eyebrow>The economics</Eyebrow>
        <Title className="mt-6">
          An agent run costs <span className="gold-text italic">rupees.</span>
          <br />A lost RFQ costs <span className="text-[#ff8a8f] italic">lakhs.</span>
        </Title>
        <Reveal delay={0.5} className="mt-10 text-[28px] leading-snug text-ink-2">
          In today&apos;s demo, one full quote run uses about 6 model calls and roughly 2,500 tokens. The Studio measures this live for every run.
        </Reveal>
      </div>
      <div className="space-y-6">
        <Reveal delay={0.4} className="glass !rounded-3xl p-8">
          <div className="text-[20px] tracking-[0.3em] text-ink-3">VALUE PER MONTH</div>
          <div className="mt-3 font-mono text-[30px] leading-relaxed">
            <span className="text-gold">hours saved</span> × cost per hour
            <br />+ <span className="text-gold">extra orders won</span> × margin
            <br />+ <span className="text-gold">errors avoided</span> × cost per error
          </div>
        </Reveal>
        <Step step={step} at={1} className="glass !rounded-3xl p-8">
          <div className="text-[20px] tracking-[0.3em] text-ink-3">COST PER MONTH</div>
          <div className="mt-3 font-mono text-[30px] leading-relaxed">
            runs × <span className="text-gold">cost per run</span>
            <br />+ platform &amp; integration
            <br />+ <span className="text-gold">human review time</span>
          </div>
        </Step>
        <Step step={step} at={2}>
          <div className="flex items-center gap-4 rounded-3xl border border-gold/50 bg-gold/10 px-8 py-5 text-[26px]">
            <Package className="text-gold" size={34} /> Pay back on one workflow before you scale to the next.
          </div>
        </Step>
      </div>
    </Frame>
  );
}

const MYTHS = [
  ["“AI will replace my staff.”", "It removes the waiting, not the people. Staff move to exceptions, customers and growth."],
  ["“We need big data first.”", "Start with the data already in Tally, email and your SOPs."],
  ["“It's too expensive for an MSME.”", "A run costs rupees. Start with one workflow and a 90-day plan."],
  ["“Just plug in ChatGPT.”", "A chatbot answers. An agent system acts, with rules, approvals and an audit trail."],
  ["“AI is a black box.”", "Traces, audit logs and evals let you inspect every decision."],
];

export function Myths({ step }: SlideProps) {
  return (
    <Frame>
      <Eyebrow>Myths vs reality</Eyebrow>
      <Title className="mt-6">
        What MSME owners <span className="gold-text italic">ask me most.</span>
      </Title>
      <div className="mt-12 space-y-4">
        {MYTHS.map(([m, r], i) => (
          <motion.div key={m} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12, ease }} className="grid grid-cols-[700px_1fr] items-center gap-10 border-b border-white/10 pb-4">
            <span className={`font-display text-[38px] italic transition-colors duration-500 ${step >= 1 ? "text-ink-3 line-through decoration-crimson/70" : "text-ink"}`}>{m}</span>
            <Step step={step} at={1}>
              <span className="text-[27px] text-ink">{r}</span>
            </Step>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}
