"use client";
import { useEffect, useState } from "react";
import { Gauge, ShieldAlert, Timer } from "lucide-react";
import type { RunMetrics, RunStatus } from "@/lib/types";
import { NODES } from "../graph-layout";
import { Chip, Empty, ms, Panel, StatusChip, usd } from "../ui";

interface Row {
  runId: string;
  scenarioId: string;
  source: "studio" | "eval";
  mode: string;
  status: RunStatus;
  startedAt: number;
  metrics: RunMetrics;
  approver: string | null;
  decision: string | null;
}
interface Data {
  runs: Row[];
  guardByRule: Record<string, number>;
  nodeAvgMs: Record<string, number>;
}

const BAR = "#c98f00";

function HBars({ data, fmt }: { data: [string, number][]; fmt: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d[1]));
  if (!data.length) return <Empty>No data yet.</Empty>;
  return (
    <div className="space-y-1.5">
      {data.map(([k, v]) => (
        <div key={k} className="group grid grid-cols-[150px_1fr_56px] items-center gap-2 text-[11.5px]" title={`${k}: ${fmt(v)}`}>
          <span className="truncate text-ink-2">{k}</span>
          <div className="h-3 rounded-r-[4px] bg-white/[0.03]">
            <div className="h-3 rounded-r-[4px] transition-all group-hover:brightness-125" style={{ width: `${(v / max) * 100}%`, background: BAR }} />
          </div>
          <span className="text-right font-mono text-ink">{fmt(v)}</span>
        </div>
      ))}
    </div>
  );
}

export function MonitorView() {
  const [d, setD] = useState<Data | null>(null);
  const [withEvals, setWithEvals] = useState(false);
  const [hover, setHover] = useState<Row | null>(null);

  useEffect(() => {
    const load = () =>
      fetch("/api/metrics")
        .then((r) => r.json())
        .then(setD);
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  const runs = (d?.runs ?? []).filter((r) => withEvals || r.source === "studio");
  const finished = runs.filter((r) => r.status !== "running" && r.status !== "awaiting_approval");
  const lat = finished.map((r) => r.metrics.durationMs).sort((a, b) => a - b);
  const p95 = lat.length ? lat[Math.min(lat.length - 1, Math.floor(lat.length * 0.95))] : 0;
  const autonomous = finished.filter((r) => r.status === "completed" && !r.approver).length;
  const hitl = finished.filter((r) => r.approver).length;
  const cost = finished.reduce((s, r) => s + r.metrics.costUsd, 0);
  const trips = finished.reduce((s, r) => s + r.metrics.guardTrips, 0);
  const maxLat = Math.max(1, ...lat);
  const label = (id: string) => NODES.find((n) => n.id === id)?.label ?? id;

  const kpis = [
    { l: "Runs", v: String(runs.length), h: `${finished.length} finished` },
    { l: "Autonomous", v: finished.length ? `${Math.round((autonomous / finished.length) * 100)}%` : "—", h: "completed with no human" },
    { l: "Escalated to human", v: finished.length ? `${Math.round((hitl / finished.length) * 100)}%` : "—", h: `${hitl} runs` },
    { l: "p95 latency", v: ms(p95), h: "end-to-end" },
    { l: "Avg cost / run", v: finished.length ? usd(cost / finished.length) : "—", h: `≈ ₹${finished.length ? ((cost / finished.length) * 88).toFixed(2) : "0"}` },
    { l: "Guardrail trips", v: String(trips), h: "flags, blocks, redactions" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-6 gap-3">
          {kpis.map((k) => (
            <div key={k.l} className="glass px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-3">{k.l}</div>
              <div className="font-display text-3xl text-ink">{k.v}</div>
              <div className="text-[11px] text-ink-3">{k.h}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
        <Panel
          title="End-to-end latency per run"
          icon={<Timer size={13} className="text-gold" />}
          className="col-span-2"
          right={
            <label className="flex items-center gap-1.5 text-[11px] text-ink-2">
              <input type="checkbox" checked={withEvals} onChange={(e) => setWithEvals(e.target.checked)} /> include eval runs
            </label>
          }
          bodyClass="p-4 flex flex-col"
        >
          {!finished.length ? (
            <Empty>Run some scenarios. Every production run reports latency, cost, tokens and guardrail trips.</Empty>
          ) : (
            <>
              <div className="relative flex min-h-0 flex-1 items-end gap-[2px] border-b border-l hairline pl-1" onMouseLeave={() => setHover(null)}>
                {finished.map((r) => (
                  <div key={r.runId} onMouseEnter={() => setHover(r)} className="flex h-full flex-1 cursor-default items-end" style={{ maxWidth: 46 }}>
                    <div className="w-full rounded-t-[4px] transition-all hover:brightness-125" style={{ height: `${(r.metrics.durationMs / maxLat) * 100}%`, background: BAR, opacity: hover && hover.runId !== r.runId ? 0.45 : 1 }} />
                  </div>
                ))}
                <span className="absolute -left-1 top-0 -translate-x-full pr-1 font-mono text-[10px] text-ink-3">{ms(maxLat)}</span>
              </div>
              <div className="mt-2 h-10 text-[12px] text-ink-2">
                {hover ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-ink">{hover.runId}</span> {hover.scenarioId} <StatusChip status={hover.status} /> {ms(hover.metrics.durationMs)} · {usd(hover.metrics.costUsd)} · {hover.metrics.llmCalls} LLM · {hover.metrics.guardTrips} trips
                  </div>
                ) : (
                  <span className="text-ink-3">Hover a bar for run details · newest on the right</span>
                )}
              </div>
            </>
          )}
        </Panel>
        <Panel title="Guardrail trips by rule" icon={<ShieldAlert size={13} className="text-gold" />} bodyClass="p-4 overflow-y-auto scroll-thin">
          <HBars data={Object.entries(d?.guardByRule ?? {}).sort((a, b) => b[1] - a[1])} fmt={(n) => String(n)} />
        </Panel>
        <Panel title="Avg time per agent" icon={<Gauge size={13} className="text-gold" />} bodyClass="p-4 overflow-y-auto scroll-thin">
          <HBars data={Object.entries(d?.nodeAvgMs ?? {}).map(([k, v]) => [label(k), v] as [string, number]).sort((a, b) => b[1] - a[1])} fmt={ms} />
        </Panel>
        <Panel title="Recent runs" className="col-span-2" bodyClass="overflow-y-auto scroll-thin">
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-[#0d0b11] text-left text-[10.5px] uppercase tracking-wider text-ink-3">
              <tr>
                {["Run", "Scenario", "Status", "Human", "Latency", "LLM", "Cost", "Mode"].map((h) => (
                  <th key={h} className="px-3 py-2 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...runs].reverse().map((r) => (
                <tr key={r.runId} className="border-t hairline">
                  <td className="px-3 py-1.5 font-mono text-ink-2">{r.runId}</td>
                  <td className="px-3 py-1.5">{r.scenarioId}</td>
                  <td className="px-3 py-1.5">
                    <StatusChip status={r.status} />
                  </td>
                  <td className="px-3 py-1.5 text-ink-2">{r.approver ? `${r.approver}${r.decision ? ` · ${r.decision}` : ""}` : "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{ms(r.metrics.durationMs)}</td>
                  <td className="px-3 py-1.5 font-mono">{r.metrics.llmCalls}</td>
                  <td className="px-3 py-1.5 font-mono">{usd(r.metrics.costUsd)}</td>
                  <td className="px-3 py-1.5">
                    <Chip tone={r.mode === "live" ? "gold" : "neutral"}>{r.mode}</Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
