"use client";
import { motion } from "framer-motion";
import { Compass, Database, FlaskConical, Rocket } from "lucide-react";
import { ease, Eyebrow, Frame, Reveal, Step, Title, type SlideProps } from "../kit";

const PHASES = [
  {
    icon: Compass,
    w: "Weeks 1–2",
    t: "Discover",
    pts: ["Pick ONE painful, frequent workflow", "Measure today: time, errors, cost", "Write down the rules people follow", "Name the human owner"],
    out: "A one-page use-case brief",
  },
  {
    icon: Database,
    w: "Weeks 3–5",
    t: "Foundation",
    pts: ["List and clean the data it touches", "Build the knowledge base (SOPs → RAG)", "Connect systems via MCP", "Set up PII and access controls"],
    out: "Data + tools the agent can trust",
  },
  {
    icon: FlaskConical,
    w: "Weeks 6–10",
    t: "Pilot",
    pts: ["Build the agent graph with human approval", "Create 20–50 golden test cases (evals)", "Run in shadow mode next to humans", "Tune prompts, policies and tools"],
    out: "Evidence: accuracy, time saved",
  },
  {
    icon: Rocket,
    w: "Weeks 11–13+",
    t: "Scale",
    pts: ["Go live inside clear limits", "Monitor cost, latency, escalations", "Raise autonomy as trust is earned", "Clone the pattern to the next workflow"],
    out: "A repeatable AI operating model",
  },
];

export function Roadmap({ step }: SlideProps) {
  return (
    <Frame className="flex flex-col">
      <Eyebrow>AI implementation roadmap</Eyebrow>
      <Title className="mt-6">
        Ninety days. Four phases. <span className="gold-text italic">One workflow at a time.</span>
      </Title>
      <div className="relative mt-16 flex-1">
        <div className="absolute left-0 right-0 top-[38px] h-[3px] bg-white/10" />
        <motion.div className="absolute left-0 top-[38px] h-[3px] bg-gradient-to-r from-gold to-crimson" initial={{ width: "0%" }} animate={{ width: `${Math.min(100, (step + 1) * 25)}%` }} transition={{ duration: 1, ease }} />
        <div className="grid grid-cols-4 gap-8">
          {PHASES.map((p, i) => (
            <Step key={p.t} step={step} at={i} className="relative">
              <div className="grid h-[78px] w-[78px] place-items-center rounded-full border-2 border-gold bg-black shadow-[0_0_40px_rgba(251,193,5,0.35)]">
                <p.icon size={36} className="text-gold" />
              </div>
              <div className="mt-6 font-mono text-[22px] text-gold">{p.w}</div>
              <div className="font-display text-[58px] leading-none">{p.t}</div>
              <ul className="mt-6 space-y-3 text-[23px] leading-snug text-ink-2">
                {p.pts.map((x) => (
                  <li key={x} className="flex gap-3">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-3 text-[20px] text-gold">→ {p.out}</div>
            </Step>
          ))}
        </div>
      </div>
    </Frame>
  );
}

const LADDER = [
  { l: "L0", t: "Manual", d: "Humans do everything", eg: "Owner types every quote" },
  { l: "L1", t: "Assist", d: "AI answers questions", eg: "Chatbot looks up price book" },
  { l: "L2", t: "Draft", d: "AI prepares, human sends", eg: "Quote drafted, sales sends it" },
  { l: "L3", t: "Act within limits", d: "AI acts inside policy, escalates outside it", eg: "Auto-send if discount ≤ 5%, else ask MD" },
  { l: "L4", t: "Autonomous", d: "AI runs end to end, humans audit", eg: "Reorders raw material on its own" },
  { l: "L5", t: "Self-improving", d: "AI tunes its own process", eg: "Rare. Not for MSMEs yet." },
];

export function AutonomyLadder({ step }: SlideProps) {
  return (
    <Frame className="grid grid-cols-[1fr_980px] items-center gap-16">
      <div>
        <Eyebrow>The autonomy ladder</Eyebrow>
        <Title className="mt-6">
          Autonomy is <span className="gold-text italic">earned,</span>
          <br />
          not granted.
        </Title>
        <Reveal delay={0.5} className="mt-10 text-[30px] leading-snug text-ink-2">
          Start at <b className="text-ink">L2</b>. Move to <b className="text-gold">L3</b> once the evals and audit trail prove the agent is reliable. Most MSME value sits at L3.
        </Reveal>
      </div>
      <div className="flex flex-col-reverse gap-3">
        {LADDER.map((r, i) => {
          const sweet = r.l === "L3";
          return (
            <motion.div
              key={r.l}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: step >= 1 && !sweet && r.l !== "L2" ? 0.35 : 1, x: 0, scale: step >= 1 && sweet ? 1.04 : 1 }}
              transition={{ delay: step >= 1 ? 0 : 0.2 + i * 0.1, duration: 0.7, ease }}
              className={`grid grid-cols-[96px_300px_1fr] items-center gap-6 rounded-3xl border px-7 py-5 ${sweet ? "border-gold bg-gold/15 shadow-[0_0_70px_-10px_rgba(251,193,5,0.6)]" : "border-white/10 bg-white/[0.03]"}`}
              style={{ marginLeft: `${(5 - i) * 0}px` }}
            >
              <span className={`font-mono text-[40px] ${sweet ? "text-gold" : "text-ink-3"}`}>{r.l}</span>
              <div>
                <div className="font-display text-[36px] leading-none">{r.t}</div>
                <div className="mt-1 text-[19px] text-ink-2">{r.d}</div>
              </div>
              <div className="text-[21px] italic text-ink-3">{r.eg}</div>
            </motion.div>
          );
        })}
      </div>
    </Frame>
  );
}

const CASES = [
  { t: "RFQ → quotation", v: 92, f: 70 },
  { t: "Collections follow-up", v: 78, f: 86 },
  { t: "GST reconciliation", v: 68, f: 63 },
  { t: "WhatsApp order intake", v: 56, f: 84 },
  { t: "Quality CAPA drafting", v: 62, f: 38 },
  { t: "Demand forecasting", v: 86, f: 28 },
  { t: "Fully autonomous procurement", v: 36, f: 24 },
  { t: "Generic company chatbot", v: 18, f: 82 },
];

export function UseCaseMatrix({ step }: SlideProps) {
  const W = 900;
  const H = 700;
  return (
    <Frame className="grid grid-cols-[640px_1fr] items-center gap-20">
      <div>
        <Eyebrow>Choosing your first use case</Eyebrow>
        <Title className="mt-6 !text-[76px]">
          High value. <br />
          <span className="gold-text italic">Data you already have.</span>
        </Title>
        <Reveal delay={0.5} className="mt-10 space-y-5 text-[27px] leading-snug text-ink-2">
          <p>Good first agents are frequent, rule-based, and annoying. They touch data already sitting in Tally, Excel or email.</p>
          <Step step={step} at={1}>
            <p className="text-ink">
              Skip the <span className="text-[#ff8a8f]">generic chatbot</span>. Postpone <span className="text-[#ff8a8f]">moonshots</span> until your data is ready.
            </p>
          </Step>
        </Reveal>
      </div>
      <div className="relative" style={{ width: W, height: H }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="absolute right-0 top-0 rounded-tr-[28px] border border-gold/40 bg-gold/[0.08]" style={{ width: W / 2, height: H / 2 }}>
          <span className="absolute right-6 top-5 font-display text-[30px] italic text-gold">Start here</span>
        </motion.div>
        <div className="absolute bottom-0 left-0 h-full w-[3px] bg-white/25" />
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/25" />
        <div className="absolute -left-14 top-1/2 -translate-y-1/2 rotate-180 text-[20px] tracking-[0.3em] text-ink-3 [writing-mode:vertical-rl]">BUSINESS VALUE</div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[20px] tracking-[0.3em] text-ink-3">FEASIBILITY · DATA READINESS</div>
        {CASES.map((c, i) => {
          const good = c.v > 50 && c.f > 50;
          return (
            <motion.div key={c.t} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.1, type: "spring", damping: 14 }} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: (c.f / 100) * W, top: H - (c.v / 100) * H }}>
              <div className={`h-6 w-6 rounded-full ${good ? "bg-gold shadow-[0_0_30px_#fbc105]" : "border-2 border-white/40 bg-black"}`} />
              <div className={`mt-2 whitespace-nowrap text-[20px] ${good ? "text-ink" : "text-ink-3"}`}>{c.t}</div>
            </motion.div>
          );
        })}
      </div>
    </Frame>
  );
}
