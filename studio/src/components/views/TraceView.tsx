"use client";
import { useMemo, useState } from "react";
import { Activity, Sparkles } from "lucide-react";
import type { LlmCallInfo, Span } from "@/lib/types";
import { useRun } from "../run-store";
import { Chip, Empty, ms, Panel, Stat, usd } from "../ui";

const KIND_COLOR: Record<Span["kind"], string> = {
  run: "#f5efe3",
  node: "#fbc105",
  llm: "#ff9d00",
  tool: "#3ddc97",
  retrieval: "#4cc9f0",
  a2a: "#a78bfa",
  guard: "#7d776d",
};

export function TraceView() {
  const { events, metrics, runId, status } = useRun();
  const [sel, setSel] = useState<string | null>(null);
  const spans = useMemo(() => {
    const m = new Map<string, Span>();
    for (const e of events) if (e.type === "span") m.set(e.span.id, e.span);
    return [...m.values()];
  }, [events]);
  const llm = events.flatMap((e) => (e.type === "llm" ? [e.call] : [])) as LlmCallInfo[];

  // Depth-first order: run → nodes (by start) → children.
  const ordered = useMemo(() => {
    const kids = new Map<string | null, Span[]>();
    for (const s of spans) kids.set(s.parentId, [...(kids.get(s.parentId) ?? []), s]);
    for (const v of kids.values()) v.sort((a, b) => a.start - b.start);
    const out: { s: Span; depth: number }[] = [];
    const walk = (p: string | null, d: number) => {
      for (const s of kids.get(p) ?? []) {
        out.push({ s, depth: d });
        walk(s.id, d + 1);
      }
    };
    const ids = new Set(spans.map((s) => s.id));
    for (const s of spans) {
      if ((!s.parentId || !ids.has(s.parentId)) && !out.some((o) => o.s.id === s.id)) {
        out.push({ s, depth: 0 });
        walk(s.id, 1);
      }
    }
    return out;
  }, [spans]);

  if (!spans.length) return <Empty>Run a scenario in Mission Control. Every agent step, model call, tool call and guardrail check shows up here as a trace (OpenTelemetry-style).</Empty>;
  const t0 = Math.min(...spans.map((s) => s.start));
  const t1 = Math.max(...spans.map((s) => s.end ?? s.start));
  const span = Math.max(1, t1 - t0);
  const detail = spans.find((s) => s.id === sel);

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_380px] gap-3">
      <Panel title={`Trace · ${runId}`} icon={<Activity size={13} className="text-gold" />} right={<Chip tone="gold">{status}</Chip>} bodyClass="overflow-y-auto scroll-thin">
        <div className="sticky top-0 z-10 flex gap-4 border-b hairline bg-[#0d0b11]/95 px-4 py-2 text-[11px] text-ink-3">
          {Object.entries(KIND_COLOR).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1">
              <i className="inline-block h-2 w-3 rounded-sm" style={{ background: c }} />
              {k}
            </span>
          ))}
          <span className="ml-auto font-mono">0 → {ms(span)}</span>
        </div>
        <div className="px-4 py-2">
          {ordered.map(({ s, depth }) => {
            const left = ((s.start - t0) / span) * 100;
            const width = Math.max(0.6, (((s.end ?? s.start) - s.start) / span) * 100);
            return (
              <button key={s.id} onClick={() => setSel(s.id)} className={`grid w-full grid-cols-[260px_1fr] items-center gap-3 rounded-md py-[3px] text-left hover:bg-white/5 ${sel === s.id ? "bg-white/10" : ""}`}>
                <div className="truncate text-[12px]" style={{ paddingLeft: depth * 14, color: depth === 0 ? "#f5efe3" : s.kind === "node" ? "#ffe9a8" : "#b9b2a5" }}>
                  {s.name}
                </div>
                <div className="relative h-4">
                  <div className="absolute top-1 h-2.5 rounded-[3px]" style={{ left: `${left}%`, width: `${width}%`, background: KIND_COLOR[s.kind], opacity: s.kind === "guard" ? 0.6 : 0.9 }} />
                  <span className="absolute top-0 font-mono text-[10px] text-ink-3" style={{ left: `calc(${Math.min(left + width, 92)}% + 6px)` }}>
                    {ms((s.end ?? s.start) - s.start)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Panel>
      <div className="flex min-h-0 flex-col gap-3">
        <Panel title="Run totals">
          <div className="grid grid-cols-3 gap-4 p-4">
            <Stat label="Spans" value={spans.length} />
            <Stat label="LLM calls" value={metrics.llmCalls} />
            <Stat label="Cost" value={usd(metrics.costUsd)} />
            <Stat label="Input tok" value={metrics.inputTokens.toLocaleString()} />
            <Stat label="Output tok" value={metrics.outputTokens.toLocaleString()} />
            <Stat label="Wall time" value={ms(span)} />
          </div>
        </Panel>
        {detail ? (
          <Panel title="Span attributes" bodyClass="p-4 overflow-auto scroll-thin">
            <div className="mb-2 font-semibold">{detail.name}</div>
            <pre className="whitespace-pre-wrap text-[11.5px] text-ink-2">{JSON.stringify({ id: detail.id, parent: detail.parentId, kind: detail.kind, durationMs: (detail.end ?? 0) - detail.start, ...detail.attrs }, null, 2)}</pre>
          </Panel>
        ) : (
          <Panel title="LLM calls" icon={<Sparkles size={13} className="text-gold" />} className="min-h-0 flex-1" bodyClass="overflow-y-auto scroll-thin p-3 space-y-2">
            {llm.map((c, i) => (
              <details key={i} className="rounded-xl border hairline bg-white/[0.03] px-3 py-2 text-[12px]">
                <summary className="cursor-pointer">
                  <b>{c.agent}</b> · {c.purpose} <span className="float-right font-mono text-ink-3">{ms(c.durationMs)}</span>
                </summary>
                <div className="mt-1 font-mono text-[11px] text-ink-3">
                  {c.model} · {c.inputTokens}→{c.outputTokens} tok · {usd(c.costUsd)} {c.simulated && "· simulated"}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-ink-3">Prompt (PII already tokenised)</div>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-2 text-[11px] text-ink-2">{c.promptPreview}</pre>
                <div className="mt-2 text-[10px] uppercase tracking-widest text-ink-3">Output</div>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-black/30 p-2 text-[11px] text-ink-2">{c.outputPreview}</pre>
              </details>
            ))}
          </Panel>
        )}
      </div>
    </div>
  );
}
