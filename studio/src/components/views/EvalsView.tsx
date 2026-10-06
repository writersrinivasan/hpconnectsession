"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FlaskConical, Loader2, Play, XCircle } from "lucide-react";
import { Chip, ms, Panel, usd } from "../ui";

interface Case {
  id: string;
  name: string;
  category: string;
  expect: Record<string, unknown>;
}
interface Result {
  scores: { name: string; pass: boolean; detail: string }[];
  metrics: { durationMs: number; costUsd: number; llmCalls: number };
  mode: string;
}

export function EvalsView() {
  const [cases, setCases] = useState<Case[]>([]);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [current, setCurrent] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch("/api/evals")
      .then((r) => r.json())
      .then((d) => setCases(d.cases));
  }, []);

  const runSuite = async () => {
    setRunning(true);
    setResults({});
    const res = await fetch("/api/evals", { method: "POST" });
    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const parts = buf.split("\n\n");
      buf = parts.pop() ?? "";
      for (const p of parts) {
        if (!p.startsWith("data: ")) continue;
        const e = JSON.parse(p.slice(6));
        if (e.type === "case.start") setCurrent(e.id);
        if (e.type === "case.end") setResults((r) => ({ ...r, [e.id]: e }));
      }
    }
    setCurrent(null);
    setRunning(false);
  };

  const done = Object.values(results);
  const checks = done.flatMap((r) => r.scores);
  const passedCases = done.filter((r) => r.scores.every((s) => s.pass)).length;
  const scorerNames = [...new Set(checks.map((c) => c.name))];

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_340px] gap-3">
      <Panel
        title="Regression eval suite · golden dataset"
        icon={<FlaskConical size={13} className="text-gold" />}
        right={
          <button onClick={runSuite} disabled={running} className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[12px] font-bold text-black disabled:opacity-60">
            {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} {running ? "Running…" : "Run all evals"}
          </button>
        }
        bodyClass="overflow-y-auto scroll-thin p-3 space-y-2"
      >
        {cases.map((c) => {
          const r = results[c.id];
          const pass = r?.scores.every((s) => s.pass);
          return (
            <motion.div key={c.id} layout className={`rounded-2xl border p-3 ${current === c.id ? "border-gold/60 bg-gold/[0.06]" : r ? (pass ? "border-ok/25 bg-ok/[0.04]" : "border-bad/40 bg-bad/[0.06]") : "border-white/8 bg-white/[0.02]"}`}>
              <div className="flex items-center gap-2 text-[13px]">
                {current === c.id ? <Loader2 size={15} className="animate-spin text-gold" /> : r ? pass ? <CheckCircle2 size={15} className="text-ok" /> : <XCircle size={15} className="text-bad" /> : <span className="size-[15px] rounded-full border border-white/20" />}
                <span className="font-mono text-ink-3">{c.id}</span>
                <span className="font-medium text-ink">{c.name}</span>
                <Chip className="ml-auto">{c.category}</Chip>
              </div>
              {r && (
                <div className="mt-2 flex flex-wrap gap-1.5 pl-6">
                  {r.scores.map((s) => (
                    <span key={s.name} title={s.detail} className={`rounded-md px-2 py-0.5 text-[11px] ${s.pass ? "bg-ok/10 text-ok" : "bg-bad/15 text-bad"}`}>
                      {s.pass ? "✓" : "✗"} {s.name}
                      <span className="ml-1 text-ink-3">{s.detail}</span>
                    </span>
                  ))}
                  <span className="ml-auto font-mono text-[11px] text-ink-3">
                    {ms(r.metrics.durationMs)} · {usd(r.metrics.costUsd)} · {r.mode}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </Panel>
      <div className="flex flex-col gap-3">
        <Panel title="Scorecard" bodyClass="p-5">
          <div className="text-center">
            <div className="font-display text-6xl text-gold">{done.length ? Math.round((passedCases / done.length) * 100) : "—"}%</div>
            <div className="text-[12px] text-ink-2">
              {passedCases}/{done.length || cases.length} cases pass · {checks.filter((c) => c.pass).length}/{checks.length} checks
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {scorerNames.map((n) => {
              const xs = checks.filter((c) => c.name === n);
              const p = xs.filter((c) => c.pass).length;
              return (
                <div key={n} className="text-[11.5px]">
                  <div className="flex justify-between text-ink-2">
                    <span>{n}</span>
                    <span className="font-mono">
                      {p}/{xs.length}
                    </span>
                  </div>
                  <div className="mt-0.5 h-1.5 rounded-full bg-white/5">
                    <div className="h-1.5 rounded-full bg-[#c98f00]" style={{ width: `${(p / xs.length) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Why evals?" bodyClass="p-4 text-[12.5px] text-ink-2 space-y-2">
          <p>
            A demo shows that something <i>can</i> work. Evals show that it <i>keeps</i> working after you change a prompt, the model, or a policy.
          </p>
          <p>Each release has to pass this suite: routing, escalation, injection defence, PII safety, leak checks, groundedness and latency. With a live model, Claude also grades email quality as an <b className="text-ink">LLM judge</b>.</p>
        </Panel>
      </div>
    </div>
  );
}
