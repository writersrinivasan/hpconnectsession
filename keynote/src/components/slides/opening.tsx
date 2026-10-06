"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Rocket, Users } from "lucide-react";
import { ease, Eyebrow, Frame, Reveal, Step, Title, type SlideProps } from "../kit";

export function ColdOpen({ step }: SlideProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <Step step={step} at={0}>
        <div className="font-display text-[64px] italic text-ink-2">It&apos;s 2:07 AM in Hosur.</div>
      </Step>
      <Step step={step} at={1} className="mt-8">
        <div className="font-display text-[64px] leading-tight text-ink">
          An OEM emails a request for 5,000 parts.
          <br />
          <span className="text-ink-2">The owner is asleep. Sales is asleep. The ERP is asleep.</span>
        </div>
      </Step>
      <Step step={step} at={2} className="mt-14">
        <div className="font-display text-[110px] leading-none">
          By <span className="gold-text italic">2:09 AM</span>, the quote is ready.
        </div>
      </Step>
      <Step step={step} at={3} className="mt-10">
        <div className="text-[30px] tracking-wide text-ink-2">Checked against stock, quality rules and the price book. And waiting for one human to approve it.</div>
      </Step>
    </div>
  );
}

export function TitleSlide() {
  return (
    <div className="absolute inset-0">
      <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2.2, ease }} className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 50% 45%, rgba(251,193,5,0.16), transparent 70%)" }} />
      <Frame className="flex flex-col justify-center">
        <Reveal delay={0.2}>
          <div className="flex items-center gap-6">
            <Image src="/brand/yoto-logo-transparent.png" alt="One Yoto" width={220} height={92} preload className="h-[72px] w-auto" />
            <div className="h-14 w-px bg-white/15" />
            <div className="eyebrow">HP Connect · AI Workshop</div>
          </div>
        </Reveal>
        <Reveal delay={0.5} className="mt-16">
          <h1 className="font-display text-[148px] leading-[0.95] tracking-[-0.03em]">
            Transform MSME Workflows
            <br />
            into <span className="gold-text italic">Growth Engines</span> with AI
          </h1>
        </Reveal>
        <Reveal delay={1.1} className="mt-14 flex items-center gap-8 text-[30px] text-ink-2">
          <span className="text-ink">Srinivasan Ramanujam</span>
          <span className="h-2 w-2 rounded-full bg-gold" />
          <span>Founder &amp; Chief AI Architect, One Yoto</span>
        </Reveal>
        <Reveal delay={1.4} className="mt-6 text-[22px] tracking-[0.3em] text-ink-3">
          ORCHESTRATION · AGENTS · A2A · MCP · RAG · GUARDRAILS · EVALS
        </Reveal>
      </Frame>
      <div className="light-sweep absolute bottom-0 left-0 h-[3px] w-full overflow-hidden bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
    </div>
  );
}

const TIMELINE = [
  { y: "2006", t: "TCS", d: "Clinical statistical analyst" },
  { y: "2008", t: "Accenture", d: "Lead, clinical SAS team" },
  { y: "2009", t: "Infosys", d: "Technology lead, healthcare & insurance" },
  { y: "2010", t: "Thomson Reuters", d: "Lead, SAS" },
  { y: "2013", t: "Truven Health · IBM Watson Health", d: "Asst. manager · Above & Beyond award" },
  { y: "2017", t: "Career Mudhra", d: "Founder · ed-tech for thousands" },
  { y: "2021", t: "One Yoto · Deep Mind Systems", d: "Founder · Agentic AI products" },
];

export function Speaker({ step }: SlideProps) {
  return (
    <Frame className="grid grid-cols-[560px_1fr] gap-20">
      <Reveal className="relative self-center" y={40}>
        <div className="absolute -inset-6 rounded-[44px] bg-gradient-to-br from-gold/40 via-amber/10 to-crimson/30 blur-2xl" />
        <div className="relative overflow-hidden rounded-[40px] border border-white/15">
          <Image src="/brand/srinivasan.png" alt="Srinivasan Ramanujam" width={560} height={560} preload className="h-[640px] w-[560px] object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-8 pt-24">
            <div className="font-display text-[44px] leading-none">Srinivasan Ramanujam</div>
            <div className="mt-2 text-[22px] text-gold">GenAI &amp; Agentic AI Consultant · Founder, One Yoto</div>
          </div>
        </div>
      </Reveal>
      <div className="flex flex-col justify-center">
        <Eyebrow>Your guide today</Eyebrow>
        <Title className="mt-6 !text-[72px]">
          Engineer. Founder. Teacher.
          <br />
          <span className="gold-text italic">Builder of AI teammates.</span>
        </Title>
        <div className="mt-12 grid grid-cols-4 gap-6">
          {[
            { icon: Rocket, n: "25+", l: "years in software" },
            { icon: Users, n: "40,000+", l: "professionals trained" },
            { icon: GraduationCap, n: "1,000+", l: "educators trained" },
            { icon: BookOpen, n: "5", l: "books in Tamil" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={0.4 + i * 0.12} className="glass !rounded-3xl p-6">
              <s.icon className="text-gold" size={30} />
              <div className="mt-3 font-display text-[54px] leading-none">{s.n}</div>
              <div className="mt-2 text-[20px] text-ink-2">{s.l}</div>
            </Reveal>
          ))}
        </div>
        <Step step={step} at={1} className="mt-12">
          <div className="relative">
            <div className="absolute left-0 right-0 top-[11px] h-px bg-gradient-to-r from-gold/10 via-gold/50 to-crimson/60" />
            <div className="grid grid-cols-7 gap-3">
              {TIMELINE.map((t, i) => (
                <motion.div key={t.y} initial={{ opacity: 0, y: 10 }} animate={step >= 1 ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.12 }}>
                  <div className={`h-6 w-6 rounded-full border-2 ${i === TIMELINE.length - 1 ? "border-crimson bg-crimson shadow-[0_0_24px_#ff2e3a]" : "border-gold bg-black"}`} />
                  <div className="mt-3 font-mono text-[18px] text-gold">{t.y}</div>
                  <div className="mt-1 text-[19px] font-semibold leading-tight">{t.t}</div>
                  <div className="mt-1 text-[15px] leading-snug text-ink-3">{t.d}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </Step>
      </div>
    </Frame>
  );
}

const AGENDA = [
  { n: "01", t: "Transform MSME workflows into growth engines", d: "From tools that answer to teammates that act" },
  { n: "02", t: "AI implementation roadmap", d: "90 days, four phases, one workflow at a time" },
  { n: "03", t: "Industry deep dives", d: "Data strategy · model selection · deployment workflows" },
  { n: "04", t: "Real-world case studies & live demo", d: "Manufacturing, textiles, distribution, food processing" },
  { n: "05", t: "Quick action checklist", d: "What to do on Monday morning" },
];

export function Agenda() {
  return (
    <Frame className="flex flex-col justify-center">
      <Eyebrow>Today&apos;s journey</Eyebrow>
      <Title className="mt-6">
        Five stops. <span className="gold-text italic">One live factory.</span>
      </Title>
      <div className="mt-16 space-y-5">
        {AGENDA.map((a, i) => (
          <motion.div key={a.n} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.13, duration: 0.8, ease }} className="group flex items-baseline gap-10 border-b border-white/10 pb-5">
              <span className="font-mono text-[28px] text-gold">{a.n}</span>
              <span className="font-display text-[50px] leading-none">{a.t}</span>
              <span className="ml-auto text-[24px] text-ink-3">{a.d}</span>
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}
