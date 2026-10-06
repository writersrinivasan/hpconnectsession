"use client";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, Link2, Link2Off, RotateCcw, ShieldCheck, ShieldX, Skull } from "lucide-react";
import type { AuditEntry } from "@/lib/types";
import { Chip, Empty, Panel } from "../ui";

interface Verification {
  ok: boolean;
  brokenAt: number | null;
  reason: string;
}

export function AuditView() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [v, setV] = useState<Verification | null>(null);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/audit").then((x) => x.json());
    setEntries(r.entries);
    setV(r.verification);
  }, []);
  useEffect(() => {
    fetch("/api/audit")
      .then((x) => x.json())
      .then((r) => {
        setEntries(r.entries);
        setV(r.verification);
      });
  }, []);

  const act = async (action: "tamper" | "restore") => {
    await fetch("/api/audit", { method: "POST", body: JSON.stringify({ action }) });
    setChecking(true);
    await new Promise((r) => setTimeout(r, 900));
    await load();
    setChecking(false);
  };

  const verify = async () => {
    setChecking(true);
    await new Promise((r) => setTimeout(r, 700));
    await load();
    setChecking(false);
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_360px] gap-3">
      <Panel title="Tamper-evident audit ledger (SHA-256 hash chain)" icon={<Fingerprint size={13} className="text-gold" />} right={<Chip>{entries.length} entries</Chip>} bodyClass="overflow-y-auto scroll-thin p-4">
        {entries.length === 0 ? (
          <Empty>Every agent decision, guardrail trip and human approval gets written here. Run a scenario first.</Empty>
        ) : (
          <div className="space-y-0">
            {[...entries].reverse().map((e) => {
              const broken = v && !v.ok && v.brokenAt !== null && e.seq >= v.brokenAt;
              const origin = v && !v.ok && v.brokenAt === e.seq;
              return (
                <motion.div key={e.seq} layout className="relative pl-8">
                  <div className={`absolute left-[11px] top-0 h-full w-px ${broken ? "bg-bad/60" : "bg-gold/25"}`} />
                  <div className={`absolute left-0 top-3 grid size-6 place-items-center rounded-full border ${broken ? "border-bad bg-bad/20" : "border-gold/40 bg-[#14110a]"}`}>
                    {broken ? <Link2Off size={12} className="text-bad" /> : <Link2 size={12} className="text-gold" />}
                  </div>
                  <div className={`mb-2 rounded-xl border px-3 py-2 ${origin ? "border-bad bg-bad/15 shadow-[0_0_30px_rgba(255,77,79,0.35)]" : broken ? "border-bad/30 bg-bad/[0.06]" : "border-white/8 bg-white/[0.03]"}`}>
                    <div className="flex items-center gap-2 text-[12px]">
                      <span className="font-mono text-ink-3">#{e.seq}</span>
                      <b className="text-ink">{e.action}</b>
                      <span className="text-ink-2">by {e.actor}</span>
                      <span className="ml-auto font-mono text-[10.5px] text-ink-3">{e.runId} · {e.ts.slice(11, 19)}</span>
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] text-ink-2">{JSON.stringify(e.details)}</div>
                    <div className="mt-1 flex gap-3 font-mono text-[10px] text-ink-3">
                      <span>prev {e.prevHash.slice(0, 12)}…</span>
                      <span className={broken ? "text-bad" : "text-gold/80"}>hash {e.hash.slice(0, 12)}…</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Panel>
      <div className="flex flex-col gap-3">
        <Panel title="Integrity" bodyClass="p-5">
          <motion.div key={String(v?.ok) + String(checking)} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
            {checking ? (
              <div className="shimmer h-24 w-24 rounded-full" />
            ) : v?.ok ? (
              <ShieldCheck size={80} className="text-ok drop-shadow-[0_0_25px_rgba(61,220,151,0.5)]" />
            ) : (
              <ShieldX size={80} className="text-bad drop-shadow-[0_0_25px_rgba(255,77,79,0.6)]" />
            )}
            <div className={`mt-3 font-display text-2xl ${v?.ok ? "text-ok" : "text-bad"}`}>{checking ? "Re-hashing chain…" : v?.ok ? "Chain intact" : `Tampering detected at #${v?.brokenAt}`}</div>
            <div className="mt-1 text-[12px] text-ink-2">{v?.reason}</div>
          </motion.div>
          <button onClick={verify} className="mt-5 w-full rounded-xl border border-gold/40 py-2 text-[13px] text-gold hover:bg-gold/10">
            Verify entire chain
          </button>
        </Panel>
        <Panel title="Live demo: the insider edit" bodyClass="p-5 space-y-3 text-[13px] text-ink-2">
          <p>Someone with database access quietly changes an old approval record, for example to make it look like a 45% discount was approved.</p>
          <p>Each record holds the hash of the one before it, so a single edit breaks every link after it. Auditors can see exactly where it happened.</p>
          <button onClick={() => act("tamper")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-bad/90 py-2.5 font-semibold text-white hover:bg-bad">
            <Skull size={15} /> Tamper with a record
          </button>
          <button onClick={() => act("restore")} className="flex w-full items-center justify-center gap-2 rounded-xl border hairline py-2 text-ink-2 hover:text-ink">
            <RotateCcw size={14} /> Restore original
          </button>
        </Panel>
      </div>
    </div>
  );
}
