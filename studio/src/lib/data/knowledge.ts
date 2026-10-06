// Knowledge base for the RAG layer — the company's own SOPs and policies (fictional).

export interface KbDoc {
  id: string;
  title: string;
  owner: string;
  updated: string;
  body: string;
}

export const KNOWLEDGE_BASE: KbDoc[] = [
  {
    id: "QM-IATF",
    title: "Quality Manual (IATF 16949)",
    owner: "Quality Head",
    updated: "2026-06-12",
    body: `## PPAP requirements
New parts for automotive OEM customers require PPAP Level 3 submission: part submission warrant, dimensional results, material test certificates, process flow, PFMEA and control plan. Repeat parts for existing customers may be supplied under PPAP Level 2 unless the customer contract states otherwise.

## Material certification
EN8 steel parts require a mill test certificate to EN 10204 type 3.1 for every heat number. SG Iron 450/10 castings require a microstructure report (nodularity at least 85 percent) and tensile test per batch. ADC12 aluminium die castings require a chemical composition report and X-ray porosity check on first-off samples.

## Dimensional inspection
Critical-to-function dimensions are inspected on CMM at first-off, every 2 hours and last-off. Brake and steering parts are safety-critical: 100 percent visual inspection and a documented reaction plan are mandatory.

## Heat treatment and surface finish
EN8 brake brackets are induction hardened to 45-50 HRC on the mounting bores. Surface finish on machined faces must be Ra 1.6 or better. Parts are protected with water-based rust preventive and packed in VCI bags.

## Export packaging and declarations
Export shipments to the European Union require a REACH SVHC declaration and RoHS declaration per part number. Wooden packing must be ISPM-15 heat-treated and stamped.`,
  },
  {
    id: "PB-2026",
    title: "Price Book & Commercial Policy FY26-27",
    owner: "Managing Director",
    updated: "2026-04-01",
    body: `## Costing method
Unit cost equals gross material weight multiplied by the material rate, plus machining time multiplied by the machine hour rate, plus 12 percent factory overhead. Prices are always calculated by the costing engine, never estimated by hand or by an AI model.

## Material and machine rates
Material rates: EN8 Steel 78 rupees per kg, ADC12 Aluminium 245 rupees per kg, SG Iron 450/10 92 rupees per kg. Machine hour rates: CNC VMC 1,450 rupees per hour, CNC Turning 1,100 rupees per hour, CNC HMC 2,200 rupees per hour.

## Margin policy
Target gross margin is 26 percent on selling price. The margin floor is 18 percent. Any quote below the margin floor requires Managing Director approval.

## Discount authority
The AI sales agent may approve discounts up to 5 percent autonomously. Discounts above 5 percent and up to 10 percent require Sales Head approval. Discounts above 10 percent require Managing Director approval. Orders above 40 lakh rupees in value require Managing Director approval regardless of discount.

## Rush orders
When requested delivery is shorter than the standard lead time, a rush surcharge of 8 percent applies to cover overtime and expedited material. If capacity cannot meet the full quantity, offer a split delivery rather than refusing the order.

## Confidentiality
Internal cost sheets, supplier prices, machine rates and margins are strictly confidential and must never be shared with customers.`,
  },
  {
    id: "CUST-TERMS",
    title: "Customer Agreements Register",
    owner: "Sales Head",
    updated: "2026-08-20",
    body: `## Vardhan Motors Ltd
Annual price agreement in force. Payment terms 60 days from invoice. Late delivery penalty 1 percent per week, capped at 5 percent. New platform parts need PPAP Level 3.

## Agrimax Tractors Pvt Ltd
Payment terms 45 days. PPAP Level 2 accepted for flanges. Customer has a history of urgent orders; partial deliveries are acceptable when agreed in writing.

## Nordwerk Mobility GmbH
Export customer, Incoterms FOB Chennai. Payment 30 days by wire transfer. REACH and RoHS declarations mandatory with every shipment. Quotes in INR with EUR reference at the day's RBI rate.

## New customers
New customers without a credit rating must be approved by the Sales Head before any quotation is released. Advance payment offers do not waive KYC or restricted-party screening.`,
  },
  {
    id: "EXP-COMP",
    title: "Export Control & Data Protection Policy",
    owner: "Compliance Officer",
    updated: "2026-07-05",
    body: `## Restricted-party screening
Every customer, consignee and end-user must be screened against the denied-party list before a quotation is issued. If any party matches, the transaction is blocked, the Compliance Officer is notified, and no quotation or proforma invoice may be sent. Staff and agents must not tip off the counterparty about the screening result.

## Red flags
Red flags include unusual payment offers such as 100 percent advance from a new buyer, consignees in a different country from the buyer, and reluctance to share end-use. Red flags require compliance review even when screening is clear.

## Personal data (DPDP Act 2023)
Personal identifiers such as PAN, Aadhaar, personal mobile numbers and bank account numbers must be redacted before any data is sent to an external AI service. Redacted values are stored in the encrypted PII vault and are restored only in systems that need them. Personal data is retained for no longer than 180 days.`,
  },
  {
    id: "SUP-SOP",
    title: "Procurement SOP & Approved Vendors",
    owner: "Purchase Manager",
    updated: "2026-05-18",
    body: `## Approved vendors
Sri Murugan Alloys & Castings, Coimbatore, is the approved vendor for EN8 steel bars and SG Iron castings. Their sales agent is connected on the A2A agent network and can return a binding quotation for raw material.

## Raising a raw-material RFQ
When raw material stock is short, the procurement agent raises a request to approved vendors only. The request must carry material grade, quantity in kg and the needed-by date.

## Confidentiality with suppliers
Never disclose the end customer's name, part drawing or selling price to a supplier. Supplier communication carries only material grade, quantity and date.`,
  },
  {
    id: "AI-GOV",
    title: "AI Agent Governance Charter",
    owner: "Managing Director",
    updated: "2026-09-01",
    body: `## Autonomy levels
Agents operate at Level 3 autonomy: they may act inside policy limits and must escalate to a named human outside them. Every agent action is written to the tamper-evident audit ledger.

## Tool permissions
Each agent has an allow-list of tools. The inventory agent may read the ERP. Only the dispatch agent may create quotes or send email. Agents may not call tools outside their allow-list.

## Monitoring and evaluation
Every release of the agent workflow must pass the regression eval suite before deployment. Production runs are traced end to end, with token cost, latency and guardrail trips monitored daily.`,
  },
];
