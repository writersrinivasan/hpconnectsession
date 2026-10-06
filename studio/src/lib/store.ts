// Process-wide singletons (survive Next.js hot reloads via globalThis).
// A real deployment would back these with Postgres / Redis / an OTel collector.
import { MemorySaver } from "@langchain/langgraph";
import type { AuditEntry, Mode, RunEvent, RunMetrics, RunSnapshot, RunStatus, Span } from "./types";

export interface RunRecord {
  runId: string;
  threadId: string;
  scenarioId: string;
  source: "studio" | "eval";
  mode: "live" | "sim";
  startedAt: number;
  endedAt?: number;
  status: RunStatus;
  events: RunEvent[];
  spans: Span[];
  metrics: RunMetrics;
  snapshot: RunSnapshot;
  prompts: string[];
  nodeDurations: Record<string, number>;
}

interface Store {
  checkpointer: MemorySaver;
  runs: Map<string, RunRecord>;
  listeners: Map<string, (e: RunEvent) => void>;
  ledger: AuditEntry[];
  mode: Mode;
}

const g = globalThis as unknown as { __agentops?: Store };

export const store: Store =
  g.__agentops ??
  (g.__agentops = {
    checkpointer: new MemorySaver(),
    runs: new Map(),
    listeners: new Map(),
    ledger: [],
    mode: "auto",
  });

export const emptyMetrics = (): RunMetrics => ({
  durationMs: 0,
  llmCalls: 0,
  inputTokens: 0,
  outputTokens: 0,
  costUsd: 0,
  toolCalls: 0,
  guardTrips: 0,
});

export const emptySnapshot = (): RunSnapshot => ({
  rfq: null,
  inventory: null,
  quality: null,
  compliance: null,
  supplierQuote: null,
  quote: null,
  approval: null,
  emailDraft: null,
  sentMessageId: null,
  piiFindings: [],
  injection: null,
  risk: "low",
  outcome: null,
});
