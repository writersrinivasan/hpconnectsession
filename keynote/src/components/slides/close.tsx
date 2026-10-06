"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { Check, Globe, Link2, Mail } from "lucide-react";
import { ease, Eyebrow, Frame, Reveal, Title } from "../kit";

const CHECKLIST = [
  ["Name one workflow", "that steals the owner's time every week"],
  ["Measure the baseline", "time, errors and cost, before any AI"],
  ["Map the data", "where it lives: Tally, Excel, email, WhatsApp, people's heads"],
  ["Write the rules down", "discount limits, approvals, never-do-this lists"],
  ["Pick the autonomy level", "start at L2 (draft), earn L3 (act within limits)"],
  ["Choose models by task", "frontier for judgement, small for volume, code for maths"],
  ["Connect via MCP", "never copy-paste between systems"],
  ["Add guardrails + human approval", "before anything leaves the company"],
  ["Build 20 golden test cases", "evals before go-live, re-run on every change"],
  ["Monitor weekly", "cost per run, accuracy, escalation rate, ROI"],
];

const KEY = "oneyoto-checklist";

export function Checklist() {
  const [done, setDone] = useState<number[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const toggle = (i: number) =>
    setDone((d) => {
      const next = d.includes(i) ? d.filter((x) => x !== i) : [...d, i];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  return (
    <Frame>
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Quick action checklist</Eyebrow>
          <Title className="mt-6">
            Ten things to do on <span className="gold-text italic">Monday morning.</span>
          </Title>
        </div>
        <Reveal delay={0.4} className="pb-4 text-right">
          <div className="font-display text-[80px] leading-none text-gold">
            {done.length}
            <span className="text-ink-3">/10</span>
          </div>
          <div className="text-[20px] text-ink-3">click to tick off together</div>
        </Reveal>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-x-10 gap-y-4">
        {CHECKLIST.map(([t, d], i) => {
          const on = done.includes(i);
          return (
            <motion.button
              key={t}
              onClick={() => toggle(i)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07, ease }}
              className={`flex items-center gap-6 rounded-3xl border px-7 py-5 text-left transition ${on ? "border-gold/60 bg-gold/10" : "border-white/10 bg-white/[0.03] hover:border-gold/30"}`}
            >
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 transition ${on ? "border-gold bg-gold text-black" : "border-white/25"}`}>{on ? <Check size={30} strokeWidth={3} /> : <span className="font-mono text-[20px] text-ink-3">{i + 1}</span>}</span>
              <span>
                <span className="block font-display text-[32px] leading-tight">{t}</span>
                <span className="block text-[20px] text-ink-2">{d}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </Frame>
  );
}

export function Closing() {
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL("https://www.linkedin.com/in/writersrinivasan", { margin: 1, width: 360, color: { dark: "#0a0807", light: "#fbf6ea" } }).then(setQr);
  }, []);
  return (
    <div className="absolute inset-0">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} className="absolute inset-0" style={{ background: "radial-gradient(55% 55% at 50% 40%, rgba(251,193,5,0.18), transparent 70%)" }} />
      <Frame className="flex flex-col items-center justify-center text-center">
        <Reveal>
          <Image src="/brand/yoto-logo-transparent.png" alt="One Yoto" width={300} height={125} className="h-[90px] w-auto" />
        </Reveal>
        <Reveal delay={0.4} className="mt-14">
          <h2 className="font-display text-[120px] leading-[1] tracking-[-0.03em]">
            Don&apos;t automate tasks.
            <br />
            <span className="gold-text italic">Architect outcomes.</span>
          </h2>
        </Reveal>
        <Reveal delay={1} className="mt-16 flex items-center gap-16">
          <div className="space-y-4 text-left text-[28px]">
            <div className="font-display text-[44px]">Srinivasan Ramanujam</div>
            <div className="text-gold">Founder &amp; Chief AI Architect · One Yoto</div>
            <div className="flex items-center gap-3 text-ink-2">
              <Link2 className="text-gold" /> linkedin.com/in/writersrinivasan
            </div>
            <div className="flex items-center gap-3 text-ink-2">
              <Globe className="text-gold" /> writersrinivasan.com
            </div>
            <div className="flex items-center gap-3 text-ink-2">
              <Mail className="text-gold" /> writersrinivasan@gmail.com
            </div>
          </div>
          {qr && (
            <div className="rounded-3xl border border-gold/40 bg-[#fbf6ea] p-4 shadow-[0_0_80px_rgba(251,193,5,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code to Srinivasan's LinkedIn" className="h-[220px] w-[220px]" />
              <div className="mt-1 text-[16px] font-semibold text-black">Connect on LinkedIn</div>
            </div>
          )}
        </Reveal>
        <Reveal delay={1.4} className="mt-12 text-[24px] tracking-[0.35em] text-ink-3">
          THANK YOU · HP CONNECT AI WORKSHOP
        </Reveal>
      </Frame>
    </div>
  );
}
