"use client";
// Shared slide primitives. Every slide is laid out on a fixed 1920×1080 stage.
import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

export interface SlideProps {
  step: number;
}

export function Reveal({ children, delay = 0, y = 28, className = "", ...rest }: { children: ReactNode; delay?: number; y?: number; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div initial={{ opacity: 0, y, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, delay, ease }} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/** Appears only when the presenter has advanced to `at` (builds within a slide). */
export function Step({ step, at, children, className = "", y = 24 }: { step: number; at: number; children: ReactNode; className?: string; y?: number }) {
  return (
    <motion.div
      initial={false}
      animate={step >= at ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y, filter: "blur(8px)" }}
      transition={{ duration: 0.75, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay} y={12}>
      <div className="eyebrow flex items-center gap-4">
        <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold" />
        {children}
      </div>
    </Reveal>
  );
}

export function Title({ children, delay = 0.1, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <Reveal delay={delay}>
      <h2 className={`font-display text-[84px] leading-[1.02] tracking-[-0.02em] text-ink ${className}`}>{children}</h2>
    </Reveal>
  );
}

export function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`absolute inset-0 px-[120px] pb-[110px] pt-[100px] ${className}`}>{children}</div>;
}

export function Card({ children, className = "", glow }: { children: ReactNode; className?: string; glow?: string }) {
  return (
    <div className={`glass relative overflow-hidden p-8 ${className}`} style={glow ? { boxShadow: `0 0 80px -30px ${glow}` } : undefined}>
      {children}
    </div>
  );
}

export function Tag({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "red" | "ink" }) {
  const t = { gold: "border-gold/40 text-gold bg-gold/10", red: "border-crimson/40 text-[#ff8a8f] bg-crimson/10", ink: "border-white/15 text-ink-2 bg-white/5" }[tone];
  return <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[18px] ${t}`}>{children}</span>;
}

export function Footnote({ children }: { children: ReactNode }) {
  return <div className="absolute bottom-[56px] left-[120px] text-[16px] text-ink-3">{children}</div>;
}
