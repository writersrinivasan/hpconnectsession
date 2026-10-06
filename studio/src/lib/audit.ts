// Tamper-evident audit ledger: every entry carries the SHA-256 of the previous one,
// so editing any historical record breaks the chain from that point forward.
import { createHash } from "node:crypto";
import { store } from "./store";
import type { AuditEntry } from "./types";

const GENESIS = "0".repeat(64);

function canonical(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`)
    .join(",")}}`;
}

function digest(e: Omit<AuditEntry, "hash">) {
  return createHash("sha256")
    .update(`${e.seq}|${e.ts}|${e.runId}|${e.actor}|${e.action}|${canonical(e.details)}|${e.prevHash}`)
    .digest("hex");
}

export function appendAudit(runId: string, actor: string, action: string, details: Record<string, unknown>): AuditEntry {
  const prev = store.ledger.at(-1);
  const base = {
    seq: (prev?.seq ?? 0) + 1,
    ts: new Date().toISOString(),
    runId,
    actor,
    action,
    details,
    prevHash: prev?.hash ?? GENESIS,
  };
  const entry: AuditEntry = { ...base, hash: digest(base) };
  store.ledger.push(entry);
  return entry;
}

export function verifyLedger() {
  let prevHash = GENESIS;
  for (const e of store.ledger) {
    const { hash, ...rest } = e;
    if (e.prevHash !== prevHash) return { ok: false, brokenAt: e.seq, reason: "prevHash does not link to previous entry" };
    if (digest(rest) !== hash) return { ok: false, brokenAt: e.seq, reason: "entry contents do not match its hash" };
    prevHash = hash;
  }
  return { ok: true, brokenAt: null, reason: `${store.ledger.length} entries verified` };
}

const tampered = new Map<number, Record<string, unknown>>();

/** Demo only: silently edit an entry's details the way an insider might. */
export function tamper(seq?: number) {
  const target = seq ? store.ledger.find((e) => e.seq === seq) : store.ledger.findLast((e) => e.action.includes("approv") || e.action.includes("quote"));
  if (!target) return null;
  tampered.set(target.seq, structuredClone(target.details));
  target.details = { ...target.details, note: "edited after the fact", discountPct: 45 };
  return target.seq;
}

export function restore() {
  for (const [seq, details] of tampered) {
    const e = store.ledger.find((x) => x.seq === seq);
    if (e) e.details = details;
  }
  tampered.clear();
}
