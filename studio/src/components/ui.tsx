"use client";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Clock3, OctagonX, PauseCircle, ShieldAlert, XCircle } from "lucide-react";
import type { RunStatus } from "@/lib/types";

export function Panel({ title, icon, right, children, className = "", bodyClass = "" }: { title?: ReactNode; icon?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={`glass flex min-h-0 flex-col ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b hairline px-4 py-2.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-2">
            {icon}
            {title}
          </div>
          {right}
        </header>
      )}
      <div className={`min-h-0 flex-1 ${bodyClass}`}>{children}</div>
    </section>
  );
}

export function Chip({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: "neutral" | "gold" | "ok" | "warn" | "bad" | "violet" | "cyan"; className?: string }) {
  const tones = {
    neutral: "border-white/10 bg-white/5 text-ink-2",
    gold: "border-gold/40 bg-gold/10 text-gold",
    ok: "border-ok/40 bg-ok/10 text-ok",
    warn: "border-warn/40 bg-warn/10 text-warn",
    bad: "border-bad/40 bg-bad/10 text-bad",
    violet: "border-violet/40 bg-violet/10 text-violet",
    cyan: "border-cyan/40 bg-cyan/10 text-cyan",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]} ${className}`}>{children}</span>;
}

export const STATUS_META: Record<RunStatus | "idle", { label: string; tone: "neutral" | "gold" | "ok" | "warn" | "bad" | "violet"; Icon: typeof CheckCircle2 }> = {
  idle: { label: "Idle", tone: "neutral", Icon: Clock3 },
  running: { label: "Agents working", tone: "gold", Icon: Clock3 },
  awaiting_approval: { label: "Awaiting human approval", tone: "warn", Icon: PauseCircle },
  completed: { label: "Completed", tone: "ok", Icon: CheckCircle2 },
  blocked: { label: "Blocked by compliance", tone: "bad", Icon: OctagonX },
  rejected: { label: "Rejected by human", tone: "bad", Icon: XCircle },
  needs_info: { label: "Clarification needed", tone: "violet", Icon: AlertTriangle },
  error: { label: "Error", tone: "bad", Icon: ShieldAlert },
};

export function StatusChip({ status }: { status: RunStatus | "idle" }) {
  const m = STATUS_META[status];
  return (
    <Chip tone={m.tone}>
      <m.Icon size={12} />
      {m.label}
    </Chip>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-3">{label}</div>
      <div className="mt-0.5 truncate font-mono text-[17px] font-semibold text-ink tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-ink-3">{hint}</div>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="flex h-full min-h-32 items-center justify-center px-6 text-center text-sm text-ink-3">{children}</div>;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const usd = (n: number) => `$${n.toFixed(n < 0.1 ? 4 : 3)}`;
export const ms = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}s` : `${Math.round(n)}ms`);
