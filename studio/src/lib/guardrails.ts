// Guardrails: deterministic, explainable checks that wrap every probabilistic step.
import { POLICY, SUPPLIER } from "./data/company";
import type { ApprovalRequest, GuardVerdict, InjectionFinding, PiiFinding, Quote } from "./types";

// ---------- PII: reversible tokenisation (vault) ----------
const PII_PATTERNS: { kind: string; re: RegExp }[] = [
  { kind: "BANK_AC", re: /\b(?:a\/c|account)\s*(?:no\.?)?\s*\d{9,18}\b/gi },
  { kind: "AADHAAR", re: /\b\d{4}\s?\d{4}\s?\d{4}\b/g },
  { kind: "PAN", re: /\b[A-Z]{5}\d{4}[A-Z]\b/g },
  { kind: "IFSC", re: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g },
  { kind: "PHONE", re: /\+91[\s-]?\d{5}[\s-]?\d{5}\b/g },
  { kind: "EMAIL", re: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g },
];

export function redactPII(text: string) {
  const vault: Record<string, string> = {};
  const findings: PiiFinding[] = [];
  let out = text;
  for (const { kind, re } of PII_PATTERNS) {
    let i = 0;
    out = out.replace(re, (m) => {
      const token = `⟦${kind}_${++i}⟧`;
      vault[token] = m;
      findings.push({ kind, token });
      return token;
    });
  }
  return { text: out, vault, findings };
}

export function restorePII(text: string, vault: Record<string, string>) {
  return Object.entries(vault).reduce((t, [k, v]) => t.split(k).join(v), text);
}

export function containsRawPII(text: string) {
  return PII_PATTERNS.filter((p) => p.kind !== "EMAIL").some((p) => new RegExp(p.re.source, p.re.flags).test(text));
}

// ---------- Prompt-injection detection ----------
const INJECTION_SIGNALS: { re: RegExp; weight: number; label: string }[] = [
  { re: /ignore (all )?(previous|prior|above) instructions/i, weight: 0.5, label: "instruction override" },
  { re: /system (override|prompt)|you are now|admin mode|developer mode/i, weight: 0.35, label: "role hijack" },
  { re: /<!--[\s\S]*?-->/, weight: 0.2, label: "hidden HTML comment" },
  { re: /(include|send|share|attach).{0,40}(internal|supplier|cost|margin|price list)/i, weight: 0.35, label: "data exfiltration" },
  { re: /approve.{0,20}\d{2}\s?%/i, weight: 0.25, label: "policy bypass" },
];

export function detectInjection(text: string): InjectionFinding & { sanitized: string; labels: string[] } {
  let score = 0;
  const labels: string[] = [];
  for (const s of INJECTION_SIGNALS)
    if (s.re.test(text)) {
      score += s.weight;
      labels.push(s.label);
    }
  const snippets: string[] = [];
  let sanitized = text.replace(/<!--[\s\S]*?-->/g, (m) => {
    snippets.push(m.replace(/\s+/g, " ").slice(0, 220));
    return "[QUARANTINED: hidden instructions removed by input guardrail]";
  });
  sanitized = sanitized
    .split("\n")
    .map((line) => {
      if (INJECTION_SIGNALS.slice(0, 2).some((s) => s.re.test(line)) || /approve.{0,20}\d{2}\s?%/i.test(line)) {
        snippets.push(line.trim());
        return "[QUARANTINED: suspected instruction injection]";
      }
      return line;
    })
    .join("\n");
  score = Math.min(1, Number(score.toFixed(2)));
  return { detected: score >= 0.5, score, snippets, sanitized, labels };
}

// ---------- Tool RBAC ----------
export const TOOL_ALLOWLIST: Record<string, string[]> = {
  "Supervisor": ["erp.get_part_master", "erp.get_customer"],
  "Inventory Agent": ["erp.check_inventory", "erp.check_capacity"],
  "Compliance Agent": ["erp.screen_party"],
  "Dispatch Agent": ["erp.create_quote_draft", "comms.send_email"],
  "Quality Agent": [],
  "Procurement Agent": [],
  "Pricing Agent": [],
};

export function checkToolPermission(agent: string, qualifiedTool: string): GuardVerdict {
  const ok = TOOL_ALLOWLIST[agent]?.includes(qualifiedTool) ?? false;
  return {
    stage: "tool",
    rule: "Tool allow-list (RBAC)",
    verdict: ok ? "pass" : "block",
    detail: ok ? `${agent} → ${qualifiedTool} permitted` : `${agent} is not allowed to call ${qualifiedTool}`,
  };
}

// ---------- Outbound A2A confidentiality ----------
export function a2aOutboundCheck(payload: Record<string, unknown>, customerName: string): GuardVerdict {
  const s = JSON.stringify(payload).toLowerCase();
  const leaks = [customerName.toLowerCase(), "price", "margin", "drawing"].filter((w) => w && s.includes(w));
  return {
    stage: "a2a",
    rule: "Supplier confidentiality (SUP-SOP)",
    verdict: leaks.length ? "block" : "pass",
    detail: leaks.length
      ? `Outbound message to ${SUPPLIER.name} contained: ${leaks.join(", ")}`
      : `Only grade, quantity and date shared with ${SUPPLIER.name}. Customer identity withheld.`,
  };
}

// ---------- Output policy ----------
export function policyCheck(quote: Quote, orderValue: number, risk: "low" | "medium" | "high", newCustomer: boolean) {
  const verdicts: GuardVerdict[] = [];
  const reasons: string[] = [];
  let approver: ApprovalRequest["approver"] = null;
  const rank = (a: ApprovalRequest["approver"]) => (a === "Managing Director" ? 2 : a === "Sales Head" ? 1 : 0);
  const need = (who: "Sales Head" | "Managing Director", why: string) => {
    reasons.push(why);
    if (rank(who) > rank(approver)) approver = who;
  };

  if (quote.discountPct > POLICY.salesHeadDiscountAuthorityPct) need("Managing Director", `Discount ${quote.discountPct}% exceeds the 10% Sales Head limit`);
  else if (quote.discountPct > POLICY.agentDiscountAuthorityPct) need("Sales Head", `Discount ${quote.discountPct}% exceeds the agent's 5% authority`);
  verdicts.push({
    stage: "output",
    rule: "Discount authority",
    verdict: quote.discountPct > POLICY.agentDiscountAuthorityPct ? "flag" : "pass",
    detail: `Requested ${quote.discountPct}% · agent limit ${POLICY.agentDiscountAuthorityPct}%`,
  });

  if (quote.marginPct < POLICY.marginFloorPct) need("Managing Director", `Margin ${quote.marginPct.toFixed(1)}% is below the 18% floor`);
  verdicts.push({
    stage: "output",
    rule: "Margin floor",
    verdict: quote.marginPct < POLICY.marginFloorPct ? "flag" : "pass",
    detail: `Margin ${quote.marginPct.toFixed(1)}% · floor ${POLICY.marginFloorPct}%`,
  });

  if (orderValue > POLICY.mdApprovalOrderValueInr) need("Managing Director", `Order value ₹${(orderValue / 1e5).toFixed(1)} L exceeds ₹40 L`);
  verdicts.push({
    stage: "output",
    rule: "Order value threshold",
    verdict: orderValue > POLICY.mdApprovalOrderValueInr ? "flag" : "pass",
    detail: `₹${(orderValue / 1e5).toFixed(2)} L · threshold ₹40 L`,
  });

  if (risk === "high") need("Sales Head", "Security: inbound email contained a prompt-injection attempt");
  if (newCustomer) need("Sales Head", "New customer without a credit rating");

  return { verdicts, approval: { required: reasons.length > 0, approver, reasons } as ApprovalRequest };
}

/** Checks the customer-facing email: groundedness (numbers match engine) + no confidential leakage. */
export function emailCheck(email: string, quote: Quote): GuardVerdict[] {
  const lower = email.toLowerCase();
  const confidential = ["margin", "cost sheet", "machine hour", SUPPLIER.name.toLowerCase(), "₹78", "₹92", "₹245", "overhead"].filter((w) =>
    lower.includes(w),
  );
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const grounded = email.includes(fmt(quote.unitPrice));
  return [
    {
      stage: "output",
      rule: "Confidential data leakage",
      verdict: confidential.length ? "block" : "pass",
      detail: confidential.length ? `Draft mentions: ${confidential.join(", ")}` : "No cost, margin or supplier data in customer email",
    },
    {
      stage: "output",
      rule: "Groundedness (numbers)",
      verdict: grounded ? "pass" : "block",
      detail: grounded ? `Unit price ₹${fmt(quote.unitPrice)} matches costing engine` : "Email price does not match the costing engine",
    },
  ];
}
