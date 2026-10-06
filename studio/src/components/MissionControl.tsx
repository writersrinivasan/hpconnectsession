"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bug, Factory, FileText, Inbox, Mail, PenLine, Play, ShieldAlert, Siren, Sparkles, Timer, UserCheck, Zap } from "lucide-react";
import { SCENARIOS } from "@/lib/data/company";
import type { InboundEmail } from "@/lib/types";
import { AgentGraph } from "./AgentGraph";
import { Feed } from "./Feed";
import { useRun } from "./run-store";
import { Chip, Empty, inr, ms, Panel, Stat, StatusChip, usd } from "./ui";

const ACCENT = {
  gold: { ring: "border-gold/50", glow: "from-gold/20", Icon: Factory },
  amber: { ring: "border-warn/50", glow: "from-warn/20", Icon: Siren },
  red: { ring: "border-bad/50", glow: "from-bad/20", Icon: Bug },
  violet: { ring: "border-violet/50", glow: "from-violet/20", Icon: ShieldAlert },
};

function Scenarios({ onCustom }: { onCustom: () => void }) {
  const { run, status, scenarioId } = useRun();
  const busy = status === "running";
  return (
    <Panel title="Inbox · sales@thendral.in" icon={<Inbox size={13} className="text-gold" />} bodyClass="space-y-2 p-2.5">
      {SCENARIOS.map((s, i) => {
        const a = ACCENT[s.accent];
        const active = scenarioId === s.id;
        return (
          <motion.button
            key={s.id}
            disabled={busy}
            onClick={() => run(s.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative w-full overflow-hidden rounded-2xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${active ? a.ring : "border-white/8"} bg-white/[0.025]`}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.glow} to-transparent opacity-0 transition group-hover:opacity-100 ${active ? "opacity-100" : ""}`} />
            <div className="relative flex items-start gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/5">
                <a.Icon size={16} className="text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                  <span className="text-ink-3">0{i + 1}</span> {s.title}
                </div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-ink-2">{s.tagline}</div>
              </div>
              <Play size={14} className="mt-1 text-ink-3 group-hover:text-gold" />
            </div>
          </motion.button>
        );
      })}
      <button disabled={busy} onClick={onCustom} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-2.5 text-[12.5px] text-ink-2 hover:border-gold/50 hover:text-gold disabled:opacity-50">
        <PenLine size={14} /> Audience challenge: write an email
      </button>
    </Panel>
  );
}

function highlight(text: string) {
  // Visualise what the input guardrail will see: PII and hidden instructions.
  const re = /(<!--[\s\S]*?-->|\b[A-Z]{5}\d{4}[A-Z]\b|\b\d{4}\s?\d{4}\s?\d{4}\b|\+91[\s-]?\d{5}[\s-]?\d{5}|\bA\/c \d{9,18}\b|\b[A-Z]{4}0[A-Z0-9]{6}\b|ignore (?:all )?previous instructions[^\n]*)/gi;
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className={`rounded px-0.5 ${/<!--|ignore/i.test(part) ? "bg-bad/25 text-[#ffb3b3]" : "bg-cyan/20 text-cyan"}`}>
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function EmailView() {
  const { email, snapshot } = useRun();
  return (
    <Panel
      title="Incoming email"
      icon={<Mail size={13} className="text-gold" />}
      className="min-h-0 flex-1"
      right={snapshot.piiFindings?.length ? <Chip tone="cyan">{snapshot.piiFindings.length} PII tokenised</Chip> : snapshot.injection?.detected ? <Chip tone="bad">injection</Chip> : null}
      bodyClass="overflow-y-auto scroll-thin"
    >
      {!email ? (
        <Empty>Select a scenario. Each one is a real-looking email landing in an MSME&apos;s sales inbox.</Empty>
      ) : (
        <div className="p-4 text-[12.5px]">
          <div className="font-semibold text-ink">{email.subject}</div>
          <div className="mb-2 text-[11px] text-ink-3">from {email.fromName}</div>
          <pre className="whitespace-pre-wrap font-sans leading-relaxed text-ink-2">{highlight(email.body)}</pre>
        </div>
      )}
    </Panel>
  );
}

function MetricStrip() {
  const { metrics, status, mode, model, startedAt, events } = useRun();
  const lastTs = events.at(-1)?.ts ?? startedAt ?? 0;
  const elapsed = status === "idle" || !startedAt ? 0 : (metrics.durationMs || lastTs - startedAt);
  return (
    <div className="glass grid grid-cols-[1.6fr_repeat(5,minmax(0,1fr))] items-center gap-4 px-5 py-2.5">
      <div className="flex flex-col gap-1">
        <StatusChip status={status} />
        <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
          {mode === "live" ? <Zap size={11} className="text-gold" /> : <Sparkles size={11} />}
          {mode ? (mode === "live" ? `Live · ${model}` : "Stage-safe simulation") : "—"}
        </div>
      </div>
      <Stat label="Elapsed" value={ms(elapsed)} />
      <Stat label="LLM calls" value={metrics.llmCalls} />
      <Stat label="Tokens" value={(metrics.inputTokens + metrics.outputTokens).toLocaleString()} />
      <Stat label="Cost" value={`₹${(metrics.costUsd * 88).toFixed(2)}`} hint={usd(metrics.costUsd)} />
      <Stat label="Tools/Guards" value={`${metrics.toolCalls}/${metrics.guardTrips}`} />
    </div>
  );
}

function Outcome() {
  const { snapshot, status } = useRun();
  const [tab, setTab] = useState<"quote" | "email" | "quality">("quote");
  const q = snapshot.quote;
  return (
    <Panel
      title="Outcome"
      icon={<FileText size={13} className="text-gold" />}
      className="h-full"
      right={
        <div className="flex gap-1 text-[11px]">
          {(["quote", "quality", "email"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-2.5 py-0.5 capitalize ${tab === t ? "bg-white/10 text-ink" : "text-ink-3"}`}>
              {t === "quality" ? "Requirements" : t}
            </button>
          ))}
        </div>
      }
      bodyClass="overflow-y-auto scroll-thin"
    >
      {snapshot.outcome && (
        <div className={`mx-4 mt-3 rounded-xl border px-3 py-2 text-[13px] ${status === "completed" ? "border-ok/30 bg-ok/10 text-ok" : status === "blocked" || status === "rejected" ? "border-bad/30 bg-bad/10 text-[#ffb3b3]" : "border-violet/30 bg-violet/10 text-violet"}`}>
          {snapshot.outcome}
        </div>
      )}
      {tab === "quote" &&
        (q ? (
          <div className="grid grid-cols-[1fr_1.3fr] gap-4 p-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-3">Unit price</div>
              <div className="font-display text-4xl text-gold">{inr(q.unitPrice)}</div>
              <div className="mt-1 text-[13px] text-ink-2">
                Total <b className="text-ink">{inr(q.total)}</b> · lead {q.leadTimeDays} d
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <Chip tone={q.marginPct >= 18 ? "ok" : "bad"}>margin {q.marginPct.toFixed(1)}%</Chip>
                {q.discountPct > 0 && <Chip tone="warn">discount {q.discountPct}%</Chip>}
                {q.rushSurchargePct > 0 && <Chip tone="gold">rush +{q.rushSurchargePct}%</Chip>}
              </div>
              {q.partialPlan && <div className="mt-2 text-[12px] text-warn">Split delivery: {q.partialPlan}</div>}
              <p className="mt-3 text-[12px] italic leading-snug text-ink-2">{q.rationale}</p>
            </div>
            <table className="h-fit w-full text-[12px]">
              <tbody>
                {q.breakdown.map((b) => (
                  <tr key={b.label} className="border-b hairline">
                    <td className="py-1.5 text-ink-2">{b.label}</td>
                    <td className={`py-1.5 text-right font-mono ${b.perUnit < 0 ? "text-warn" : "text-ink"}`}>{inr(b.perUnit)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-2 text-ink-3">Internal cost / unit (never shown to customer)</td>
                  <td className="pt-2 text-right font-mono text-ink-3">{inr(q.costPerUnit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>The price is calculated by code, not by the AI, and explained by the AI with citations.</Empty>
        ))}
      {tab === "quality" &&
        (snapshot.quality ? (
          <ul className="space-y-1.5 p-4 text-[12.5px]">
            {snapshot.quality.requirements.map((r) => (
              <li key={r} className="flex gap-2 text-ink-2">
                <span className="text-gold">◆</span>
                {r}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Grounded requirements from the quality manual will appear here.</Empty>
        ))}
      {tab === "email" &&
        (snapshot.emailDraft ? (
          <div className="p-4">
            {snapshot.sentMessageId && <Chip tone="ok">sent via MCP · {snapshot.sentMessageId}</Chip>}
            <pre className="mt-2 whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed text-ink-2">{snapshot.emailDraft}</pre>
          </div>
        ) : (
          <Empty>The customer email is drafted by the AI, then checked for leaks and for prices that don&apos;t match the costing engine.</Empty>
        ))}
    </Panel>
  );
}

function ApprovalModal() {
  const { interrupt, decide, snapshot } = useRun();
  const rfqName = snapshot.rfq?.customerName;
  const [counter, setCounter] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  if (!interrupt) return null;
  const { approval, quote } = interrupt;
  const asked = quote?.discountPct ?? 0;
  const name = approval.approver === "Managing Director" ? "Managing Director" : "Sales Head";
  const go = (decision: "approved" | "rejected") => {
    decide({ decision, approverName: name, comment: comment || undefined, counterDiscountPct: decision === "approved" && counter !== null ? counter : null });
    setCounter(null);
    setComment("");
  };
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div initial={{ y: 30, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 22 }} className="glass w-[560px] overflow-hidden !rounded-3xl border-warn/30">
          <div className="shimmer h-1" />
          <div className="p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-warn">
              <UserCheck size={14} /> Human-in-the-loop · LangGraph interrupt()
            </div>
            <h3 className="mt-2 font-display text-3xl text-ink">
              Approval needed from the <span className="gold-text italic">{approval.approver}</span>
            </h3>
            <p className="mt-1 text-[13px] text-ink-2">The run is paused and saved. Nothing has been sent to {rfqName ?? "the customer"}. Your decision is recorded in the audit ledger.</p>
            <ul className="mt-4 space-y-1.5">
              {approval.reasons.map((r) => (
                <li key={r} className="flex gap-2 rounded-lg bg-warn/10 px-3 py-1.5 text-[13px] text-[#ffe2b0]">
                  <ShieldAlert size={14} className="mt-0.5 shrink-0 text-warn" /> {r}
                </li>
              ))}
            </ul>
            {quote && (
              <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl border hairline bg-white/[0.03] p-3">
                <Stat label="Unit price" value={inr(quote.unitPrice)} />
                <Stat label="Order value" value={`₹${(quote.total / 1e5).toFixed(1)} L`} />
                <Stat label="Margin" value={`${quote.marginPct.toFixed(1)}%`} />
              </div>
            )}
            {asked > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-[12px] text-ink-2">
                  <span>Counter-offer discount</span>
                  <span className="font-mono text-gold">
                    {counter ?? asked}% {counter === null && <span className="text-ink-3">(as requested)</span>}
                  </span>
                </div>
                <input type="range" min={0} max={asked} step={1} value={counter ?? asked} onChange={(e) => setCounter(Number(e.target.value))} className="w-full" />
              </div>
            )}
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment for the audit trail (optional)" className="mt-3 w-full rounded-xl border hairline bg-black/30 px-3 py-2 text-[13px] outline-none focus:border-gold/50" />
            <div className="mt-5 flex gap-3">
              <button onClick={() => go("rejected")} className="flex-1 rounded-xl border border-bad/40 py-2.5 text-[14px] font-semibold text-bad hover:bg-bad/10">
                Reject
              </button>
              <button onClick={() => go("approved")} className="flex-[2] rounded-xl bg-gradient-to-r from-[#ffd84d] to-[#ff9d00] py-2.5 text-[14px] font-bold text-black shadow-[0_0_30px_rgba(251,193,5,0.35)] hover:brightness-110">
                Approve{counter !== null && counter !== asked ? ` at ${counter}%` : ""} &amp; resume agents
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CustomEmail({ onClose }: { onClose: () => void }) {
  const { run } = useRun();
  const [e, setE] = useState<InboundEmail>({
    from: "buyer@vardhanmotors.in",
    fromName: "Audience Member · Vardhan Motors",
    subject: "RFQ from the audience",
    body: "Please quote 2,500 nos of BCB-220, delivery in 14 days. Can you give us 6% discount?\n\nThanks",
  });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-[620px] !rounded-3xl p-6" onClick={(x) => x.stopPropagation()}>
        <h3 className="font-display text-2xl">Audience challenge: try to break the agents</h3>
        <p className="mt-1 text-[12.5px] text-ink-2">
          Parts: BCB-220, HSG-118, FLG-75. Customer domains: vardhanmotors.in, agrimax.co.in, nordwerk-mobility.de. Try asking for discounts, hiding instructions, or adding personal details.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <input className="rounded-xl border hairline bg-black/30 px-3 py-2 text-[13px]" value={e.from} onChange={(x) => setE({ ...e, from: x.target.value })} />
          <input className="rounded-xl border hairline bg-black/30 px-3 py-2 text-[13px]" value={e.subject} onChange={(x) => setE({ ...e, subject: x.target.value })} />
        </div>
        <textarea rows={8} className="mt-2 w-full rounded-xl border hairline bg-black/30 px-3 py-2 font-mono text-[12.5px]" value={e.body} onChange={(x) => setE({ ...e, body: x.target.value })} />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-[13px] text-ink-2">
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              run("custom", e);
            }}
            className="rounded-xl bg-gold px-5 py-2 text-[13px] font-bold text-black"
          >
            Send to agents
          </button>
        </div>
      </div>
    </div>
  );
}

export function MissionControl() {
  const [custom, setCustom] = useState(false);
  return (
    <div className="grid h-full min-h-0 grid-cols-[290px_minmax(0,1fr)_370px] gap-3">
      <div className="flex min-h-0 flex-col gap-3">
        <Scenarios onCustom={() => setCustom(true)} />
        <EmailView />
      </div>
      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1.9fr)_minmax(0,1fr)] gap-3">
        <MetricStrip />
        <div className="glass relative min-h-0 overflow-hidden p-2">
          <AgentGraph />
          <div className="absolute bottom-3 left-4 flex gap-3 text-[10.5px] text-ink-3">
            <span className="flex items-center gap-1">
              <i className="inline-block size-2 rounded-full bg-cyan" /> RAG retrieval
            </span>
            <span className="flex items-center gap-1">
              <i className="inline-block size-2 rounded-full bg-ok" /> MCP tool call
            </span>
            <span className="flex items-center gap-1">
              <i className="inline-block size-2 rounded-full bg-violet" /> A2A message
            </span>
            <span className="flex items-center gap-1">
              <Timer size={11} /> parallel fan-out after Supervisor
            </span>
          </div>
        </div>
        <Outcome />
      </div>
      <Feed />
      <ApprovalModal />
      {custom && <CustomEmail onClose={() => setCustom(false)} />}
    </div>
  );
}
