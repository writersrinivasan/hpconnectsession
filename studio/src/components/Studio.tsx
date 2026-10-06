"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, BookOpen, Fingerprint, FlaskConical, Gauge, Layers, Network, Radar, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { COMPANY } from "@/lib/data/company";
import { MissionControl } from "./MissionControl";
import { RunProvider, useRun } from "./run-store";
import { AuditView } from "./views/AuditView";
import { BlueprintView } from "./views/BlueprintView";
import { EvalsView } from "./views/EvalsView";
import { GuardrailsView } from "./views/GuardrailsView";
import { KnowledgeView } from "./views/KnowledgeView";
import { MonitorView } from "./views/MonitorView";
import { ProtocolsView } from "./views/ProtocolsView";
import { TraceView } from "./views/TraceView";

const VIEWS = [
  { id: "mission", label: "Mission Control", sub: "Orchestration · A2A", icon: Radar, C: MissionControl },
  { id: "trace", label: "Observability", sub: "Traces & spans", icon: Activity, C: TraceView },
  { id: "guard", label: "Guardrails", sub: "Safety & security", icon: ShieldCheck, C: GuardrailsView },
  { id: "audit", label: "Audit Trail", sub: "Hash-chained ledger", icon: Fingerprint, C: AuditView },
  { id: "rag", label: "Knowledge", sub: "RAG", icon: BookOpen, C: KnowledgeView },
  { id: "proto", label: "Protocols", sub: "MCP & A2A", icon: Network, C: ProtocolsView },
  { id: "evals", label: "Evals", sub: "Regression suite", icon: FlaskConical, C: EvalsView },
  { id: "monitor", label: "Monitoring", sub: "Production KPIs", icon: Gauge, C: MonitorView },
  { id: "blueprint", label: "Blueprint", sub: "Stack in a nutshell", icon: Layers, C: BlueprintView },
] as const;

interface Cfg {
  mode: "auto" | "live" | "sim";
  effective: "live" | "sim";
  hasCredentials: boolean;
  model: string;
}

function ModeSwitch() {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setCfg);
  }, []);
  const set = async (mode: Cfg["mode"]) => setCfg(await fetch("/api/config", { method: "POST", body: JSON.stringify({ mode }) }).then((r) => r.json()));
  if (!cfg) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-full border hairline bg-black/30 p-0.5 text-[11.5px]">
        {(["auto", "live", "sim"] as const).map((m) => (
          <button key={m} onClick={() => set(m)} className={`flex items-center gap-1 rounded-full px-3 py-1 ${cfg.mode === m ? "bg-gold font-semibold text-black" : "text-ink-2"}`}>
            {m === "live" ? <Zap size={11} /> : m === "sim" ? <Sparkles size={11} /> : null}
            {m === "auto" ? "Auto" : m === "live" ? "Live Claude" : "Stage-safe"}
          </button>
        ))}
      </div>
      <span className="text-[11px] text-ink-3">
        {cfg.effective === "live" ? `→ ${cfg.model}` : cfg.hasCredentials ? "→ simulation" : "→ simulation (no API key)"}
      </span>
    </div>
  );
}

function RunBadge() {
  const { runId, status } = useRun();
  if (!runId) return null;
  return (
    <span className="font-mono text-[11px] text-ink-3">
      {runId} · {status}
    </span>
  );
}

export function Studio() {
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>("mission");
  const Active = VIEWS.find((v) => v.id === view)!.C;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName.match(/INPUT|TEXTAREA/)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= VIEWS.length) setView(VIEWS[n - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <RunProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <header className="flex items-center gap-4 border-b hairline px-5 py-2.5">
          <Image src="/brand/yoto-logo-transparent.png" alt="One Yoto" width={78} height={32} preload className="h-7 w-auto" />
          <div className="h-7 w-px bg-white/10" />
          <div>
            <div className="font-display text-[19px] leading-none">
              AgentOps <span className="gold-text italic">Studio</span>
              <span className="ml-3 font-sans text-[12px] text-ink-3">· {VIEWS.find((v) => v.id === view)!.label}: {VIEWS.find((v) => v.id === view)!.sub}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-ink-3">
              {COMPANY.name} · {COMPANY.city} · {COMPANY.employees} people · {COMPANY.sector}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <RunBadge />
            <ModeSwitch />
          </div>
        </header>
        <div className="flex min-h-0 flex-1">
          <nav className="flex w-[84px] shrink-0 flex-col items-stretch gap-1 border-r hairline px-2 py-2.5">
            {VIEWS.map((v, i) => {
              const on = v.id === view;
              return (
                <button key={v.id} onClick={() => setView(v.id)} title={`${v.label} · ${v.sub} (${i + 1})`} className={`relative flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition ${on ? "text-ink" : "text-ink-3 hover:bg-white/[0.04] hover:text-ink-2"}`}>
                  {on && <motion.div layoutId="navpill" className="absolute inset-0 rounded-xl border border-gold/30 bg-gold/[0.09]" transition={{ type: "spring", damping: 26, stiffness: 300 }} />}
                  <v.icon size={19} className={`relative ${on ? "text-gold" : ""}`} />
                  <span className="relative text-center text-[10px] leading-tight">{v.label}</span>
                </button>
              );
            })}
          </nav>
          <main className="min-h-0 min-w-0 flex-1 p-3">
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8, filter: "blur(4px)" }} transition={{ duration: 0.28 }} className="h-full">
                <Active />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </RunProvider>
  );
}
