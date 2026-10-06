"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, KeyRound, Lock, Minus, ShieldCheck, ShieldHalf, X } from "lucide-react";
import type { GuardVerdict } from "@/lib/types";
import { useRun } from "../run-store";
import { Chip, Empty, Panel } from "../ui";

const LAYERS: { stage: GuardVerdict["stage"]; title: string; desc: string; rules: string[] }[] = [
  { stage: "input", title: "1 · Input guardrails", desc: "Before any model sees the data", rules: ["PII redaction (DPDP Act)", "Prompt-injection detector"] },
  { stage: "tool", title: "2 · Tool permissions (RBAC)", desc: "Least privilege for every agent", rules: ["Tool allow-list (RBAC)"] },
  { stage: "a2a", title: "3 · Inter-agent boundary", desc: "What may leave the company", rules: ["Supplier confidentiality (SUP-SOP)"] },
  { stage: "output", title: "4 · Output & policy", desc: "Deterministic business rules + groundedness", rules: ["Discount authority", "Margin floor", "Order value threshold", "Confidential data leakage", "Groundedness (numbers)"] },
  { stage: "budget", title: "5 · Budgets & rate limits", desc: "Stops runaway loops and runaway bills", rules: ["LLM call budget"] },
];

const verdictTone = (v?: GuardVerdict["verdict"]) => (v === "pass" ? "ok" : v === "redact" ? "cyan" : v === "flag" ? "warn" : v === "block" ? "bad" : "neutral");

export function GuardrailsView() {
  const { events, snapshot } = useRun();
  const [allow, setAllow] = useState<Record<string, string[]>>({});
  useEffect(() => {
    fetch("/api/mcp")
      .then((r) => r.json())
      .then((d) => setAllow(d.allowlist));
  }, []);

  const latest = useMemo(() => {
    const m = new Map<string, GuardVerdict>();
    for (const e of events) if (e.type === "guard") {
      const prev = m.get(e.verdict.rule);
      const rank = { pass: 0, redact: 1, flag: 2, block: 3 };
      if (!prev || rank[e.verdict.verdict] >= rank[prev.verdict]) m.set(e.verdict.rule, e.verdict);
    }
    return m;
  }, [events]);

  const tools = [...new Set(Object.values(allow).flat())];
  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-3">
      <Panel title="Defense in depth: five layers around a probabilistic core" icon={<ShieldHalf size={13} className="text-gold" />} bodyClass="overflow-y-auto scroll-thin p-4 space-y-3">
        {LAYERS.map((l, i) => (
          <motion.div key={l.stage} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl border hairline bg-white/[0.03] p-3">
            <div className="flex items-baseline justify-between">
              <div className="font-semibold text-ink">{l.title}</div>
              <div className="text-[11px] text-ink-3">{l.desc}</div>
            </div>
            <div className="mt-2 space-y-1.5">
              {l.rules.map((r) => {
                const v = latest.get(r);
                return (
                  <div key={r} className="flex items-start gap-2 rounded-lg bg-black/25 px-3 py-1.5 text-[12.5px]">
                    <Chip tone={verdictTone(v?.verdict)} className="mt-0.5 w-16 justify-center">
                      {v ? v.verdict.toUpperCase() : "—"}
                    </Chip>
                    <div>
                      <div className="text-ink">{r}</div>
                      {v && <div className="text-[11.5px] text-ink-2">{v.detail}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </Panel>
      <div className="flex min-h-0 flex-col gap-3">
        <Panel title="PII vault (reversible tokenisation)" icon={<KeyRound size={13} className="text-gold" />} bodyClass="p-4">
          {snapshot.piiFindings?.length ? (
            <div className="space-y-1.5">
              {snapshot.piiFindings.map((f) => (
                <div key={f.token} className="flex items-center justify-between rounded-lg bg-black/25 px-3 py-1.5 font-mono text-[12px]">
                  <span className="text-cyan">{f.token}</span>
                  <span className="flex items-center gap-1 text-ink-3">
                    <Lock size={11} /> encrypted · {f.kind}
                  </span>
                </div>
              ))}
              <p className="pt-2 text-[12px] text-ink-2">The model only ever sees the tokens. Real values go back in only at the final MCP send step, inside your own network.</p>
            </div>
          ) : (
            <Empty>Run scenario 04 to watch PAN, Aadhaar, phone and bank details get tokenised before reaching the LLM.</Empty>
          )}
        </Panel>
        <Panel title="Least-privilege tool matrix" icon={<ShieldCheck size={13} className="text-gold" />} className="min-h-0 flex-1" bodyClass="overflow-auto scroll-thin p-3">
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="text-ink-3">
                <th className="py-1 text-left font-normal">Agent</th>
                {tools.map((t) => (
                  <th key={t} className="px-1 py-1 font-mono font-normal [writing-mode:vertical-rl] rotate-180">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(allow).map(([agent, list]) => (
                <tr key={agent} className="border-t hairline">
                  <td className="py-1.5 pr-2 text-ink-2">{agent}</td>
                  {tools.map((t) => (
                    <td key={t} className="text-center">
                      {list.includes(t) ? <Check size={14} className="mx-auto text-ok" aria-label="allowed" /> : <Minus size={12} className="mx-auto text-ink-3/40" aria-label="denied" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-3">
            <X size={12} className="text-bad" /> Calls outside this matrix are blocked by the runtime and logged to the audit ledger. Only the Dispatch Agent can send email.
          </p>
        </Panel>
      </div>
    </div>
  );
}
