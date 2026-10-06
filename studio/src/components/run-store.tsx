"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { ApprovalRequest, InboundEmail, NodeId, Quote, RunEvent, RunMetrics, RunSnapshot, RunStatus } from "@/lib/types";
import { SCENARIOS } from "@/lib/data/company";
import { EDGES, type SatelliteId } from "./graph-layout";

export type NodeState = "idle" | "active" | "done" | "paused";

export interface Flash {
  id: number;
  sat: SatelliteId;
  node: NodeId;
}

interface State {
  threadId: string | null;
  runId: string | null;
  scenarioId: string | null;
  email: InboundEmail | null;
  mode: "live" | "sim" | null;
  model: string | null;
  status: RunStatus | "idle";
  events: RunEvent[];
  nodes: Partial<Record<NodeId, NodeState>>;
  summaries: Partial<Record<NodeId, string>>;
  edges: Set<string>;
  endOrder: Partial<Record<NodeId, number>>;
  snapshot: Partial<RunSnapshot>;
  metrics: RunMetrics;
  interrupt: { approval: ApprovalRequest; quote: Quote | null } | null;
  flashes: Flash[];
  startedAt: number | null;
}

const zeroMetrics: RunMetrics = { durationMs: 0, llmCalls: 0, inputTokens: 0, outputTokens: 0, costUsd: 0, toolCalls: 0, guardTrips: 0 };

const initial: State = {
  threadId: null,
  runId: null,
  scenarioId: null,
  email: null,
  mode: null,
  model: null,
  status: "idle",
  events: [],
  nodes: {},
  summaries: {},
  edges: new Set(),
  endOrder: {},
  snapshot: {},
  metrics: zeroMetrics,
  interrupt: null,
  flashes: [],
  startedAt: null,
};

type Action =
  | { type: "reset"; scenarioId: string; email: InboundEmail }
  | { type: "event"; e: RunEvent }
  | { type: "unflash"; id: number }
  | { type: "resuming" };

let flashSeq = 0;
const AGENT_NODE: Record<string, NodeId> = {
  "Supervisor": "supervisor",
  "Inventory Agent": "inventory",
  "Quality Agent": "quality",
  "Compliance Agent": "compliance",
  "Procurement Agent": "procurement",
  "Pricing Agent": "pricing",
  "Dispatch Agent": "dispatch",
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "reset":
      return { ...initial, edges: new Set(), endOrder: {}, scenarioId: a.scenarioId, email: a.email, status: "running", startedAt: Date.now() };
    case "resuming":
      return { ...s, interrupt: null, status: "running", nodes: { ...s.nodes, human: "active" } };
    case "unflash":
      return { ...s, flashes: s.flashes.filter((f) => f.id !== a.id) };
    case "event": {
      const e = a.e;
      const n: State = { ...s, events: [...s.events, e] };
      switch (e.type) {
        case "run.start":
          return { ...n, threadId: e.threadId, runId: e.runId, mode: e.mode, model: e.model };
        case "node.start": {
          // Light the edge actually taken: every finished predecessor for the join node,
          // otherwise only the most recently finished one (the node that routed here).
          const edges = new Set(s.edges);
          const preds = EDGES.filter((ed) => ed.to === e.node && s.nodes[ed.from] === "done");
          const lit = e.node === "synthesis" ? preds : preds.sort((a, b) => (s.endOrder[b.from] ?? 0) - (s.endOrder[a.from] ?? 0)).slice(0, 1);
          for (const ed of lit) edges.add(`${ed.from}>${ed.to}`);
          return { ...n, nodes: { ...s.nodes, [e.node]: "active" }, edges };
        }
        case "node.end":
          return { ...n, nodes: { ...s.nodes, [e.node]: "done" }, summaries: { ...s.summaries, [e.node]: e.summary }, endOrder: { ...s.endOrder, [e.node]: n.events.length } };
        case "state":
          return { ...n, snapshot: { ...s.snapshot, ...e.patch } };
        case "llm":
          return {
            ...n,
            metrics: {
              ...s.metrics,
              llmCalls: s.metrics.llmCalls + 1,
              inputTokens: s.metrics.inputTokens + e.call.inputTokens,
              outputTokens: s.metrics.outputTokens + e.call.outputTokens,
              costUsd: s.metrics.costUsd + e.call.costUsd,
            },
          };
        case "tool": {
          const sat: SatelliteId | null = e.server.startsWith("A2A") ? "supplier" : e.server.includes("comms") ? "comms" : e.server.includes("erp") ? "erp" : null;
          const node = AGENT_NODE[e.agent];
          const flashes = sat && node ? [...s.flashes, { id: ++flashSeq, sat, node }] : s.flashes;
          return { ...n, flashes, metrics: { ...s.metrics, toolCalls: s.metrics.toolCalls + (e.server.startsWith("thendral") ? 1 : 0) } };
        }
        case "rag": {
          const node = AGENT_NODE[e.agent];
          return node ? { ...n, flashes: [...s.flashes, { id: ++flashSeq, sat: "kb", node }] } : n;
        }
        case "guard":
          return e.verdict.verdict === "pass" ? n : { ...n, metrics: { ...s.metrics, guardTrips: s.metrics.guardTrips + 1 } };
        case "interrupt":
          return { ...n, interrupt: { approval: e.approval, quote: e.quote }, status: "awaiting_approval", nodes: { ...s.nodes, human: "paused" } };
        case "run.end":
          return { ...n, status: e.status, metrics: { ...e.metrics } };
        default:
          return n;
      }
    }
  }
}

interface Ctx extends State {
  run: (scenarioId: string, email?: InboundEmail) => Promise<void>;
  decide: (d: { decision: "approved" | "rejected"; approverName: string; comment?: string; counterDiscountPct?: number | null }) => Promise<void>;
}

const RunContext = createContext<Ctx | null>(null);

async function pump(res: Response, onEvent: (e: RunEvent) => void) {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const p of parts) if (p.startsWith("data: ")) onEvent(JSON.parse(p.slice(6)));
  }
}

export function RunProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const busy = useRef(false);

  const onEvent = useCallback((e: RunEvent) => dispatch({ type: "event", e }), []);

  useEffect(() => {
    const latest = state.flashes.at(-1);
    if (!latest) return;
    const t = setTimeout(() => dispatch({ type: "unflash", id: latest.id }), 1600);
    return () => clearTimeout(t);
  }, [state.flashes]);

  const run = useCallback(
    async (scenarioId: string, email?: InboundEmail) => {
      if (busy.current) return;
      busy.current = true;
      try {
        const res = await fetch("/api/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(email ? { email } : { scenarioId }) });
        dispatch({ type: "reset", scenarioId, email: email ?? SCENARIOS.find((s) => s.id === scenarioId)!.email });
        await pump(res, onEvent);
      } finally {
        busy.current = false;
      }
    },
    [onEvent],
  );

  const decide = useCallback<Ctx["decide"]>(
    async (d) => {
      if (!state.threadId) return;
      dispatch({ type: "resuming" });
      const res = await fetch("/api/run/resume", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ threadId: state.threadId, ...d }) });
      await pump(res, onEvent);
    },
    [state.threadId, onEvent],
  );

  const value = useMemo(() => ({ ...state, run, decide }), [state, run, decide]);
  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRun() {
  const c = useContext(RunContext);
  if (!c) throw new Error("useRun outside RunProvider");
  return c;
}
