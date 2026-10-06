// Agent-to-Agent (A2A) protocol — the supplier's sales agent lives at its own HTTP endpoint,
// publishes an Agent Card for discovery and accepts JSON-RPC `message/send` calls.
import { SUPPLIER } from "./data/company";

export function agentCard(origin: string) {
  return {
    protocolVersion: "0.3.0",
    name: `${SUPPLIER.name} — Sales Agent`,
    description: "Returns binding raw-material quotations for EN8 steel bars and SG Iron castings.",
    url: `${origin}/api/a2a/supplier`,
    version: "1.2.0",
    provider: { organization: SUPPLIER.name, url: "https://example.com/srimurugan" },
    capabilities: { streaming: false, pushNotifications: false },
    defaultInputModes: ["application/json"],
    defaultOutputModes: ["application/json"],
    securitySchemes: { bearer: { type: "http", scheme: "bearer" } },
    security: [{ bearer: [] }],
    skills: [
      {
        id: "raw-material-quote",
        name: "Raw material quotation",
        description: "Quote price per kg, available quantity and delivery for a material grade.",
        tags: ["EN8", "SG Iron", "steel", "castings"],
        examples: ['{"material":"EN8 Steel","qtyKg":1800,"neededByDays":7}'],
      },
    ],
  };
}

const SUPPLIER_RATES: Record<string, { rate: number; days: number; availableKg: number }> = {
  "EN8 Steel": { rate: 81.5, days: 5, availableKg: 25000 },
  "SG Iron 450/10": { rate: 95, days: 6, availableKg: 40000 },
};

/** The supplier agent's own logic (it would run on the supplier's infrastructure). */
export function supplierHandle(data: { material: string; qtyKg: number; neededByDays: number }) {
  const r = SUPPLIER_RATES[data.material];
  if (!r) return { state: "rejected" as const, reason: `We do not supply ${data.material}` };
  return {
    state: "completed" as const,
    quote: {
      supplier: SUPPLIER.name,
      material: data.material,
      ratePerKg: r.rate,
      qtyKg: Math.min(data.qtyKg, r.availableKg),
      deliveryDays: r.days,
      quoteRef: `SMA-Q-${Math.floor(Math.random() * 90000) + 10000}`,
      validTill: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
    },
  };
}
