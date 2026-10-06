// Deterministic costing engine. Teaching point: LLMs reason and explain; code does the arithmetic.
import { MACHINE_RATE, MATERIAL_RATE, POLICY, type Part } from "./data/company";
import type { InventoryReport, Quote, SupplierQuote } from "./types";

const r2 = (n: number) => Math.round(n * 100) / 100;

export function computeQuote(part: Part, inv: InventoryReport, qty: number, deliveryDays: number, discountPct: number, sq: SupplierQuote | null): Omit<Quote, "rationale"> {
  // Blend material rate when part of the steel comes from the partner supplier.
  const ownRate = MATERIAL_RATE[part.material];
  const blendedRate =
    sq && inv.rawNeededKg > 0
      ? (ownRate * (inv.rawNeededKg - sq.qtyKg) + sq.ratePerKg * sq.qtyKg) / inv.rawNeededKg
      : ownRate;
  const material = part.grossKg * blendedRate;
  const machining = part.operations.reduce((s, o) => s + (o.cycleMin / 60) * MACHINE_RATE[o.machine], 0);
  const overhead = (material + machining) * (POLICY.overheadPct / 100);
  const cost = material + machining + overhead;
  const listPrice = cost / (1 - POLICY.targetMarginPct / 100);
  const rush = deliveryDays < part.standardLeadDays ? POLICY.rushSurchargePct : 0;
  const unit = listPrice * (1 + rush / 100) * (1 - discountPct / 100);
  const margin = ((unit - cost) / unit) * 100;
  const partialPlan =
    inv.feasibleQtyByDeadline < qty
      ? `${inv.feasibleQtyByDeadline.toLocaleString("en-IN")} pcs within ${deliveryDays} days, balance ${(qty - inv.feasibleQtyByDeadline).toLocaleString("en-IN")} pcs in a second lot`
      : null;
  return {
    unitPrice: r2(unit),
    total: r2(unit * qty),
    costPerUnit: r2(cost),
    marginPct: r2(margin),
    discountPct,
    rushSurchargePct: rush,
    leadTimeDays: Math.max(deliveryDays, sq ? sq.deliveryDays + 4 : 0),
    partialPlan,
    breakdown: [
      { label: `Material (${part.grossKg} kg × ₹${blendedRate.toFixed(2)})`, perUnit: r2(material) },
      { label: "Machining", perUnit: r2(machining) },
      { label: `Overhead ${POLICY.overheadPct}%`, perUnit: r2(overhead) },
      { label: `Target margin ${POLICY.targetMarginPct}%`, perUnit: r2(listPrice - cost) },
      ...(rush ? [{ label: `Rush surcharge ${rush}%`, perUnit: r2(listPrice * (rush / 100)) }] : []),
      ...(discountPct ? [{ label: `Discount ${discountPct}%`, perUnit: -r2(listPrice * (1 + rush / 100) * (discountPct / 100)) }] : []),
    ],
  };
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
