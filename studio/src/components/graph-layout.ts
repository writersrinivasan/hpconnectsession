import type { NodeId } from "@/lib/types";

export const NODES: { id: NodeId; label: string; sub: string; x: number; y: number; kind: "guard" | "agent" | "supervisor" | "human" | "end" }[] = [
  { id: "guard_in", label: "Input Guard", sub: "PII · injection", x: 80, y: 300, kind: "guard" },
  { id: "intake", label: "Intake", sub: "LLM extraction", x: 222, y: 300, kind: "agent" },
  { id: "supervisor", label: "Supervisor", sub: "orchestrator", x: 368, y: 300, kind: "supervisor" },
  { id: "inventory", label: "Inventory", sub: "MCP · ERP", x: 510, y: 150, kind: "agent" },
  { id: "quality", label: "Quality", sub: "RAG · IATF", x: 510, y: 300, kind: "agent" },
  { id: "compliance", label: "Compliance", sub: "RAG · screening", x: 510, y: 450, kind: "agent" },
  { id: "synthesis", label: "Synthesis", sub: "supervisor", x: 660, y: 300, kind: "supervisor" },
  { id: "procurement", label: "Procurement", sub: "A2A client", x: 780, y: 160, kind: "agent" },
  { id: "pricing", label: "Pricing", sub: "costing engine", x: 870, y: 300, kind: "agent" },
  { id: "guard_out", label: "Output Guard", sub: "policy engine", x: 990, y: 300, kind: "guard" },
  { id: "human", label: "Human (HITL)", sub: "Sales Head / MD", x: 990, y: 465, kind: "human" },
  { id: "dispatch", label: "Dispatch", sub: "MCP · email", x: 1120, y: 300, kind: "agent" },
  { id: "finalize", label: "Close & Audit", sub: "ledger", x: 1120, y: 465, kind: "end" },
];

export const EDGES: { from: NodeId; to: NodeId; faint?: boolean }[] = [
  { from: "guard_in", to: "intake" },
  { from: "intake", to: "supervisor" },
  { from: "supervisor", to: "inventory" },
  { from: "supervisor", to: "quality" },
  { from: "supervisor", to: "compliance" },
  { from: "inventory", to: "synthesis" },
  { from: "quality", to: "synthesis" },
  { from: "compliance", to: "synthesis" },
  { from: "synthesis", to: "procurement" },
  { from: "synthesis", to: "pricing" },
  { from: "procurement", to: "pricing" },
  { from: "pricing", to: "guard_out" },
  { from: "guard_out", to: "dispatch" },
  { from: "guard_out", to: "human" },
  { from: "human", to: "dispatch" },
  { from: "human", to: "finalize" },
  { from: "dispatch", to: "finalize" },
  { from: "synthesis", to: "finalize", faint: true },
  { from: "supervisor", to: "finalize", faint: true },
];

/** Satellite systems the agents reach out to. */
export const SATELLITES = {
  kb: { label: "Knowledge Base", sub: "6 SOPs · hybrid RAG", x: 330, y: 58 },
  erp: { label: "ERP MCP Server", sub: "thendral-erp · 6 tools", x: 115, y: 58 },
  comms: { label: "Comms MCP Server", sub: "thendral-comms", x: 1095, y: 58 },
  supplier: { label: "Sri Murugan Alloys", sub: "external agent · A2A", x: 780, y: 58 },
} as const;

export type SatelliteId = keyof typeof SATELLITES;

export const NODE_W = 128;
export const NODE_H = 64;
