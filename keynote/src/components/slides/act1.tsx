"use client";
import { motion } from "framer-motion";
import { Brain, Calculator, ClipboardCheck, Eye, Factory, FileSpreadsheet, Hammer, Headphones, IndianRupee, MessageCircle, RefreshCcw, ShieldCheck, Truck, User, Users, Wrench, Zap } from "lucide-react";
import { Card, ease, Eyebrow, Footnote, Frame, Reveal, Step, Title, type SlideProps } from "../kit";

export function Section({ n, title, sub }: { n: string; title: React.ReactNode; sub: string }) {
  return (
    <div className="absolute inset-0 flex items-center px-[160px]">
      <motion.div initial={{ opacity: 0, scale: 1.3 }} animate={{ opacity: 0.09, scale: 1 }} transition={{ duration: 1.6, ease }} className="pointer-events-none absolute right-[80px] font-display text-[720px] italic leading-none text-gold">
        {n}
      </motion.div>
      <div className="relative">
        <Eyebrow>Chapter {n}</Eyebrow>
        <Reveal delay={0.25}>
          <h2 className="mt-8 max-w-[1300px] font-display text-[128px] leading-[0.98] tracking-[-0.03em]">{title}</h2>
        </Reveal>
        <Reveal delay={0.6} className="mt-10 max-w-[1100px] text-[34px] leading-snug text-ink-2">
          {sub}
        </Reveal>
      </div>
    </div>
  );
}

const SPOKES = [
  { icon: MessageCircle, t: "WhatsApp orders" },
  { icon: FileSpreadsheet, t: "Excel & Tally" },
  { icon: IndianRupee, t: "Pricing calls" },
  { icon: Truck, t: "Dispatch" },
  { icon: Users, t: "Hiring" },
  { icon: ClipboardCheck, t: "Quality issues" },
  { icon: Calculator, t: "GST & collections" },
  { icon: Headphones, t: "Customer escalations" },
];

export function FounderIsTheAPI({ step }: SlideProps) {
  const R = 330;
  return (
    <Frame className="grid grid-cols-[1fr_820px] items-center gap-12">
      <div>
        <Eyebrow>The MSME reality</Eyebrow>
        <Title className="mt-6">
          In most MSMEs, <br />
          the <span className="gold-text italic">founder is the API.</span>
        </Title>
        <Reveal delay={0.5} className="mt-10 space-y-5 text-[30px] leading-snug text-ink-2">
          <p>Every quote, exception and approval waits for one person&apos;s phone.</p>
          <Step step={step} at={1}>
            <p className="text-ink">
              The business can&apos;t grow faster than the owner can reply.{" "}
              <span className="text-gold">That is the bottleneck AI agents remove.</span>
            </p>
          </Step>
        </Reveal>
        <Step step={step} at={2} className="mt-10 grid grid-cols-3 gap-5">
          {[
            ["~6.3 Cr", "MSMEs in India"],
            ["~30%", "of GDP"],
            ["~45%", "of exports"],
          ].map(([n, l]) => (
            <div key={l} className="glass !rounded-3xl p-6">
              <div className="font-display text-[56px] leading-none text-gold">{n}</div>
              <div className="mt-2 text-[20px] text-ink-2">{l}</div>
            </div>
          ))}
        </Step>
      </div>
      <div className="relative h-[820px]">
        <svg viewBox="-410 -410 820 820" className="absolute inset-0 h-full w-full">
          {SPOKES.map((s, i) => {
            const a = (i / SPOKES.length) * Math.PI * 2 - Math.PI / 2;
            return <line key={s.t} x1={0} y1={0} x2={Math.cos(a) * R} y2={Math.sin(a) * R} stroke={step >= 1 ? "rgba(255,46,58,0.6)" : "rgba(251,193,5,0.35)"} strokeWidth={2} className="flow" />;
          })}
        </svg>
        <motion.div animate={step >= 1 ? { scale: [1, 1.06, 1], boxShadow: ["0 0 60px rgba(255,46,58,0.4)", "0 0 120px rgba(255,46,58,0.7)", "0 0 60px rgba(255,46,58,0.4)"] } : {}} transition={{ repeat: Infinity, duration: 1.6 }} className="absolute left-1/2 top-1/2 grid h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-gold bg-black text-center">
          <div>
            <User size={54} className="mx-auto text-gold" />
            <div className="mt-1 font-display text-[28px]">Owner</div>
          </div>
        </motion.div>
        {SPOKES.map((s, i) => {
          const a = (i / SPOKES.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <motion.div key={s.t} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.08, ease }} className="glass absolute flex w-[220px] -translate-x-1/2 -translate-y-1/2 items-center gap-3 !rounded-2xl px-4 py-3" style={{ left: `calc(50% + ${Math.cos(a) * R}px)`, top: `calc(50% + ${Math.sin(a) * R}px)` }}>
              <s.icon size={26} className="shrink-0 text-gold" />
              <span className="text-[20px] leading-tight">{s.t}</span>
            </motion.div>
          );
        })}
      </div>
      <Footnote>MSME figures: approximate, as commonly cited by the Ministry of MSME. Check the latest annual report before quoting.</Footnote>
    </Frame>
  );
}

const ERAS = [
  { y: "2000s", t: "Rules & ERP", d: "If-this-then-that. Rigid.", icon: Wrench },
  { y: "2015", t: "RPA bots", d: "Copy-paste robots. Break when screens change.", icon: Hammer },
  { y: "2023", t: "Chatbots & copilots", d: "Answer questions. A human still does the work.", icon: MessageCircle },
  { y: "2025", t: "AI agents", d: "Plan, use tools, act toward a goal.", icon: Brain },
  { y: "2026 →", t: "Agent teams", d: "Specialists that coordinate, under human governance.", icon: Users },
];

export function Evolution({ step }: SlideProps) {
  return (
    <Frame className="flex flex-col justify-center">
      <Eyebrow>How automation evolved</Eyebrow>
      <Title className="mt-6">
        From tools that <i className="text-ink-2">answer</i> to teammates that <span className="gold-text italic">act.</span>
      </Title>
      <div className="relative mt-24">
        <div className="absolute left-0 right-0 top-[44px] h-[3px] rounded-full bg-gradient-to-r from-white/10 via-gold/60 to-crimson" />
        <div className="grid grid-cols-5 gap-8">
          {ERAS.map((e, i) => {
            const on = step >= Math.max(0, i - 2);
            const hero = i >= 3;
            return (
              <motion.div key={e.t} initial={false} animate={{ opacity: on ? 1 : 0.15, y: on ? 0 : 20 }} transition={{ duration: 0.7, ease }}>
                <div className={`grid h-[90px] w-[90px] place-items-center rounded-full border-2 ${hero ? "border-gold bg-gold/15 shadow-[0_0_50px_rgba(251,193,5,0.45)]" : "border-white/20 bg-black"}`}>
                  <e.icon size={38} className={hero ? "text-gold" : "text-ink-3"} />
                </div>
                <div className="mt-8 font-mono text-[22px] text-gold">{e.y}</div>
                <div className={`mt-2 font-display text-[44px] leading-tight ${hero ? "" : "text-ink-2"}`}>{e.t}</div>
                <div className="mt-3 text-[22px] leading-snug text-ink-3">{e.d}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}

const LOOP = [
  { icon: Eye, t: "Perceive", d: "Read the email, the ERP, the PDF" },
  { icon: Brain, t: "Reason", d: "Plan the next step toward the goal" },
  { icon: Zap, t: "Act", d: "Call tools: ERP, email, other agents" },
  { icon: RefreshCcw, t: "Reflect", d: "Check the result, retry or escalate" },
];

export function AgentAnatomy({ step }: SlideProps) {
  const R = 270;
  return (
    <Frame className="grid grid-cols-[1fr_760px] items-center gap-16">
      <div>
        <Eyebrow>What is an AI agent?</Eyebrow>
        <Title className="mt-6">
          A goal, a brain, <br />
          tools, memory, <span className="gold-text italic">and rules.</span>
        </Title>
        <div className="mt-12 space-y-4 text-[28px]">
          {[
            ["Goal", "“Send an accurate, profitable quote within 10 minutes.”"],
            ["Brain (LLM)", "Understands messy language and decides what to do next."],
            ["Tools", "ERP, Tally, email, WhatsApp, connected through MCP."],
            ["Memory & knowledge", "Your SOPs, price book and past orders, searched with RAG."],
            ["Guardrails", "What it must never do, and when it must ask a human."],
          ].map(([k, v], i) => (
            <Step key={k} step={step} at={i < 3 ? 0 : 1} className="flex gap-6">
              <span className="w-[260px] shrink-0 font-semibold text-gold">{k}</span>
              <span className="text-ink-2">{v}</span>
            </Step>
          ))}
        </div>
      </div>
      <div className="relative h-[760px]">
        <svg viewBox="-380 -380 760 760" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#fbc105" />
              <stop offset="1" stopColor="#ff2e3a" />
            </linearGradient>
          </defs>
          <circle r={R} fill="none" stroke="url(#ring)" strokeWidth={3} className="flow" opacity={0.8} />
          <circle r={12} fill="#fff3c2">
            <animateMotion dur="6s" repeatCount="indefinite" path={`M 0 ${-R} A ${R} ${R} 0 1 1 -0.1 ${-R} Z`} />
          </circle>
        </svg>
        <div className="absolute left-1/2 top-1/2 grid h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold/50 bg-gold/10 text-center shadow-[0_0_120px_rgba(251,193,5,0.35)]">
          <div>
            <Brain size={64} className="mx-auto text-gold" />
            <div className="mt-2 font-display text-[34px]">Agent</div>
          </div>
        </div>
        {LOOP.map((l, i) => {
          const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
          return (
            <motion.div key={l.t} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.2, ease }} className="glass absolute w-[250px] -translate-x-1/2 -translate-y-1/2 !rounded-3xl !bg-[#0d0b0f] p-5 text-center" style={{ left: `calc(50% + ${Math.cos(a) * R}px)`, top: `calc(50% + ${Math.sin(a) * R}px)` }}>
              <l.icon size={34} className="mx-auto text-gold" />
              <div className="mt-2 font-display text-[32px] leading-none">{l.t}</div>
              <div className="mt-2 text-[17px] leading-snug text-ink-2">{l.d}</div>
            </motion.div>
          );
        })}
      </div>
    </Frame>
  );
}

const ENGINES = [
  { icon: IndianRupee, f: "Sales", from: "Quotes in 2–3 days", to: "Quotes in minutes, with margin protected", agent: "RFQ → quote agent team" },
  { icon: Factory, f: "Operations", from: "Planning on whiteboards", to: "Capacity-aware plans, re-run every hour", agent: "Planning + inventory agents" },
  { icon: Calculator, f: "Finance", from: "Month-end GST scramble", to: "Daily reconciliation, flagged exceptions", agent: "GST + collections agents" },
  { icon: ShieldCheck, f: "Quality", from: "CAPA files nobody reads", to: "Root cause drafted from your own history", agent: "Quality RAG agent" },
  { icon: MessageCircle, f: "Customer", from: "Missed WhatsApp orders", to: "Every enquiry answered, logged, followed up", agent: "WhatsApp sales agent" },
  { icon: Users, f: "People", from: "Founder interviews everyone", to: "Screened shortlists with reasons", agent: "Hiring screener agent" },
];

export function GrowthEngines() {
  return (
    <Frame>
      <Eyebrow>From workflow to growth engine</Eyebrow>
      <Title className="mt-6">
        Every repetitive workflow is a <span className="gold-text italic">growth engine</span> waiting to start.
      </Title>
      <div className="mt-14 grid grid-cols-3 gap-7">
        {ENGINES.map((e, i) => (
          <Reveal key={e.f} delay={0.3 + i * 0.1}>
            <Card className="h-full !p-7">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold/15">
                  <e.icon size={30} className="text-gold" />
                </div>
                <div className="font-display text-[40px]">{e.f}</div>
              </div>
              <div className="mt-5 text-[22px] text-ink-3 line-through decoration-crimson/70">{e.from}</div>
              <div className="mt-2 text-[25px] leading-snug text-ink">{e.to}</div>
              <div className="mt-4 text-[18px] text-gold">{e.agent}</div>
            </Card>
          </Reveal>
        ))}
      </div>
      <Footnote>The shifts shown are typical patterns, not guaranteed outcomes. Always measure your own baseline first.</Footnote>
    </Frame>
  );
}
