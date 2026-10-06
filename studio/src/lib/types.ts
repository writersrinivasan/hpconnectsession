// Shared types for the AgentOps Studio — used by the LangGraph runtime (server) and the UI (client).

export type NodeId =
  | "guard_in"
  | "intake"
  | "supervisor"
  | "inventory"
  | "quality"
  | "compliance"
  | "synthesis"
  | "procurement"
  | "pricing"
  | "guard_out"
  | "human"
  | "dispatch"
  | "finalize";

export type RunStatus =
  | "running"
  | "awaiting_approval"
  | "completed"
  | "blocked"
  | "rejected"
  | "needs_info"
  | "error";

export type Mode = "auto" | "live" | "sim";

export interface InboundEmail {
  from: string;
  fromName: string;
  subject: string;
  body: string;
}

export interface Scenario {
  id: string;
  title: string;
  tagline: string;
  teaches: string[];
  accent: "gold" | "amber" | "red" | "violet";
  email: InboundEmail;
}

export interface RFQ {
  customerId: string | null;
  customerName: string;
  partNo: string | null;
  qty: number;
  deliveryDays: number;
  discountPct: number;
  shipTo: string;
  notes: string;
}

export interface PiiFinding {
  kind: string;
  token: string;
}

export interface InjectionFinding {
  detected: boolean;
  score: number;
  snippets: string[];
}

export interface Citation {
  chunkId: string;
  docId: string;
  docTitle: string;
  section: string;
  score: number;
  text: string;
}

export interface InventoryReport {
  partName: string;
  material: string;
  finishedStock: number;
  toProduce: number;
  rawNeededKg: number;
  rawStockKg: number;
  shortfallKg: number;
  capacity: { machine: string; hoursNeeded: number; hoursFree: number; ok: boolean }[];
  feasibleQtyByDeadline: number;
  standardLeadDays: number;
}

export interface QualityReport {
  requirements: string[];
  ppapLevel: string;
  citations: Citation[];
}

export interface ComplianceReport {
  status: "clear" | "blocked";
  reasons: string[];
  citations: Citation[];
  screening: { party: string; match: boolean; listRef?: string }[];
}

export interface SupplierQuote {
  supplier: string;
  material: string;
  ratePerKg: number;
  qtyKg: number;
  deliveryDays: number;
  quoteRef: string;
  validTill: string;
}

export interface Quote {
  unitPrice: number;
  total: number;
  costPerUnit: number;
  marginPct: number;
  discountPct: number;
  rushSurchargePct: number;
  leadTimeDays: number;
  partialPlan: string | null;
  breakdown: { label: string; perUnit: number }[];
  rationale: string;
}

export interface ApprovalRequest {
  required: boolean;
  approver: "Sales Head" | "Managing Director" | null;
  reasons: string[];
  decision?: "approved" | "rejected";
  approverName?: string;
  comment?: string;
}

export interface GuardVerdict {
  stage: "input" | "output" | "tool" | "a2a" | "budget";
  rule: string;
  verdict: "pass" | "flag" | "block" | "redact";
  detail: string;
}

export interface Span {
  id: string;
  parentId: string | null;
  runId: string;
  name: string;
  kind: "run" | "node" | "llm" | "tool" | "retrieval" | "a2a" | "guard";
  start: number;
  end?: number;
  attrs: Record<string, string | number | boolean>;
}

export interface AuditEntry {
  seq: number;
  ts: string;
  runId: string;
  actor: string;
  action: string;
  details: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

export interface LlmCallInfo {
  agent: string;
  model: string;
  purpose: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  durationMs: number;
  simulated: boolean;
  promptPreview: string;
  outputPreview: string;
}

export type RunEvent =
  | { type: "run.start"; runId: string; threadId: string; scenarioId: string; mode: "live" | "sim"; model: string; ts: number }
  | { type: "node.start"; node: NodeId; ts: number }
  | { type: "node.end"; node: NodeId; ts: number; durationMs: number; summary: string }
  | { type: "message"; from: string; to: string; channel: "handoff" | "report" | "a2a" | "human"; content: string; ts: number }
  | { type: "thought"; agent: string; text: string; ts: number }
  | { type: "tool"; agent: string; server: string; tool: string; args: unknown; result: unknown; durationMs: number; ts: number }
  | { type: "rag"; agent: string; query: string; hits: Citation[]; ts: number }
  | { type: "llm"; call: LlmCallInfo; ts: number }
  | { type: "guard"; verdict: GuardVerdict; ts: number }
  | { type: "audit"; entry: AuditEntry; ts: number }
  | { type: "span"; span: Span; ts: number }
  | { type: "state"; patch: Partial<RunSnapshot>; ts: number }
  | { type: "interrupt"; approval: ApprovalRequest; quote: Quote | null; ts: number }
  | { type: "warning"; text: string; ts: number }
  | { type: "run.end"; status: RunStatus; ts: number; metrics: RunMetrics };

export interface RunMetrics {
  durationMs: number;
  llmCalls: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  toolCalls: number;
  guardTrips: number;
}

export interface RunSnapshot {
  rfq: RFQ | null;
  inventory: InventoryReport | null;
  quality: QualityReport | null;
  compliance: ComplianceReport | null;
  supplierQuote: SupplierQuote | null;
  quote: Quote | null;
  approval: ApprovalRequest | null;
  emailDraft: string | null;
  sentMessageId: string | null;
  piiFindings: PiiFinding[];
  injection: InjectionFinding | null;
  risk: "low" | "medium" | "high";
  outcome: string | null;
}
