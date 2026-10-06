"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BookOpen, Brain, Database, Network, ShieldAlert, ShieldCheck, Sparkles, User } from "lucide-react";
import type { RunEvent } from "@/lib/types";
import { useRun } from "./run-store";
import { Chip, Empty, ms, Panel, usd } from "./ui";

const AGENT_COLOR: Record<string, string> = {
  Supervisor: "#fbc105",
  "Intake Agent": "#ffd57a",
  "Inventory Agent": "#3ddc97",
  "Quality Agent": "#4cc9f0",
  "Compliance Agent": "#ff8fa3",
  "Procurement Agent": "#a78bfa",
  "Pricing Agent": "#ffb020",
  "Dispatch Agent": "#7ee0ff",
  Guardrail: "#3ddc97",
};
const colorOf = (name: string) => AGENT_COLOR[name] ?? (name.includes("(agent)") ? "#c4b5fd" : "#f5efe3");

function Avatar({ name }: { name: string }) {
  const c = colorOf(name);
  const initials = name.replace(/\(agent\)/, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("");
  return (
    <div className="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold" style={{ background: `${c}22`, color: c, boxShadow: `inset 0 0 0 1px ${c}55` }}>
      {initials}
    </div>
  );
}

function Item({ e }: { e: RunEvent }) {
  switch (e.type) {
    case "message":
      return (
        <div className="flex gap-2.5">
          <Avatar name={e.from} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-3">
              <span style={{ color: colorOf(e.from) }} className="font-semibold">
                {e.from}
              </span>
              <ArrowRight size={11} />
              <span style={{ color: colorOf(e.to) }}>{e.to}</span>
              {e.channel === "a2a" && <Chip tone="violet">A2A</Chip>}
              {e.channel === "human" && <Chip tone="warn">human</Chip>}
              {e.channel === "handoff" && <Chip>handoff</Chip>}
            </div>
            <div className={`mt-1 rounded-xl rounded-tl-sm px-3 py-2 text-[13px] leading-snug ${e.channel === "a2a" ? "border border-violet/30 bg-violet/10" : "bg-white/[0.05]"}`}>{e.content}</div>
          </div>
        </div>
      );
    case "thought":
      return (
        <div className="flex gap-2 pl-1 text-[12.5px] italic text-ink-2">
          <Brain size={14} className="mt-0.5 shrink-0 text-gold/70" />
          <span>
            <span className="not-italic font-semibold" style={{ color: colorOf(e.agent) }}>
              {e.agent}:
            </span>{" "}
            {e.text}
          </span>
        </div>
      );
    case "tool":
      return (
        <div className="rounded-lg border border-ok/20 bg-ok/[0.06] px-3 py-1.5 font-mono text-[11.5px]">
          <div className="flex items-center gap-1.5 text-ok">
            {e.server.startsWith("A2A") ? <Network size={12} /> : <Database size={12} />}
            <span className="text-ink-2">{e.agent}</span> → {e.server} · <b>{e.tool}</b>
            {e.durationMs > 0 && <span className="ml-auto text-ink-3">{ms(e.durationMs)}</span>}
          </div>
          <div className="truncate text-ink-3">{JSON.stringify(e.result)}</div>
        </div>
      );
    case "rag":
      return (
        <div className="rounded-lg border border-cyan/20 bg-cyan/[0.06] px-3 py-1.5 text-[11.5px]">
          <div className="flex items-center gap-1.5 text-cyan">
            <BookOpen size={12} /> <span className="text-ink-2">{e.agent}</span> retrieved for <i className="text-ink">“{e.query}”</i>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {e.hits.map((h) => (
              <Chip key={h.chunkId} tone="cyan">
                {h.chunkId} · {h.score}
              </Chip>
            ))}
          </div>
        </div>
      );
    case "llm":
      return (
        <div className="flex items-center gap-2 font-mono text-[11px] text-ink-3">
          <Sparkles size={12} className="text-gold" />
          <span className="text-ink-2">{e.call.agent}</span> · {e.call.purpose} · {e.call.inputTokens}→{e.call.outputTokens} tok · {usd(e.call.costUsd)} · {ms(e.call.durationMs)}
          {e.call.simulated && <Chip>sim</Chip>}
        </div>
      );
    case "guard": {
      const v = e.verdict;
      if (v.verdict === "pass" && v.stage === "tool") return null;
      const tone = v.verdict === "pass" ? "ok" : v.verdict === "redact" ? "cyan" : v.verdict === "flag" ? "warn" : "bad";
      const Icon = v.verdict === "pass" ? ShieldCheck : ShieldAlert;
      return (
        <div className={`flex items-start gap-2 rounded-lg border px-3 py-1.5 text-[12px] ${v.verdict === "block" ? "border-bad/40 bg-bad/10" : "border-white/10 bg-white/[0.03]"}`}>
          <Icon size={14} className={`mt-0.5 shrink-0 ${tone === "ok" ? "text-ok" : tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : "text-cyan"}`} />
          <div>
            <Chip tone={tone}>{v.verdict.toUpperCase()}</Chip> <b className="text-ink">{v.rule}</b>
            <div className="text-ink-2">{v.detail}</div>
          </div>
        </div>
      );
    }
    case "warning":
      return (
        <div className="flex gap-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-1.5 text-[12px] text-warn">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {e.text}
        </div>
      );
    case "interrupt":
      return (
        <div className="flex gap-2 rounded-lg border border-warn/50 bg-warn/10 px-3 py-2 text-[13px]">
          <User size={15} className="mt-0.5 text-warn" />
          <span>
            <b className="text-warn">Paused for {e.approval.approver}.</b> {e.approval.reasons.join(" · ")}
          </span>
        </div>
      );
    default:
      return null;
  }
}

const FILTERS = {
  conversation: ["message", "thought", "interrupt", "warning"],
  all: ["message", "thought", "tool", "rag", "llm", "guard", "warning", "interrupt"],
} as const;

export function Feed() {
  const { events, status } = useRun();
  const [filter, setFilter] = useState<keyof typeof FILTERS>("conversation");
  const ref = useRef<HTMLDivElement>(null);
  const shown = useMemo(() => events.map((e, i) => ({ e, i })).filter(({ e }) => (FILTERS[filter] as readonly string[]).includes(e.type)), [events, filter]);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [shown.length]);

  return (
    <Panel
      title="Agent-to-agent conversation"
      icon={<Network size={13} className="text-gold" />}
      className="h-full"
      right={
        <div className="flex rounded-full border hairline p-0.5 text-[11px]">
          {(Object.keys(FILTERS) as (keyof typeof FILTERS)[]).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-2.5 py-0.5 capitalize ${filter === k ? "bg-gold text-black" : "text-ink-2"}`}>
              {k === "all" ? "Everything" : "Conversation"}
            </button>
          ))}
        </div>
      }
      bodyClass="overflow-hidden"
    >
      <div ref={ref} className="scroll-thin h-full space-y-2.5 overflow-y-auto px-4 py-3">
        {shown.length === 0 && <Empty>{status === "idle" ? "Agents will talk to each other here: handoffs, reports, A2A calls to suppliers, and human approvals." : "Starting…"}</Empty>}
        <AnimatePresence initial={false}>
          {shown.map(({ e, i }) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Item e={e} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Panel>
  );
}
