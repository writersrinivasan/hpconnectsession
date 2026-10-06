// Real Model Context Protocol servers (official SDK) exposing the MSME's systems as tools.
// Agents talk to them through an MCP client over an in-memory transport — the same protocol
// you'd use over stdio or Streamable HTTP to reach Tally, an MES, or a mail server.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { z } from "zod";
import { CUSTOMERS, DENIED_PARTIES, FREE_HOURS_21D, PARTS, RAW_STOCK_KG, findPart, type Machine } from "./data/company";

const json = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v) }] });

function erpServer() {
  const s = new McpServer({ name: "thendral-erp", version: "2.4.0" });
  s.registerTool(
    "get_part_master",
    { description: "Look up a part in the item master: material, gross weight, routing, standard lead time.", inputSchema: { partNo: z.string() } },
    async ({ partNo }) => {
      const p = findPart(partNo);
      return json(p ? { found: true, ...p } : { found: false, partNo, known: PARTS.map((x) => x.partNo) });
    },
  );
  s.registerTool(
    "get_customer",
    { description: "Fetch customer master: tier, payment terms, country.", inputSchema: { email: z.string() } },
    async ({ email }) => {
      const domain = email.split("@")[1] ?? "";
      const c = CUSTOMERS.find((x) => x.domain === domain);
      return json(c ?? { found: false, domain });
    },
  );
  s.registerTool(
    "check_inventory",
    { description: "Finished-goods and raw-material stock for a part.", inputSchema: { partNo: z.string() } },
    async ({ partNo }) => {
      const p = findPart(partNo)!;
      return json({ partNo, finishedStock: p.finishedStock, material: p.material, rawStockKg: RAW_STOCK_KG[p.material] });
    },
  );
  s.registerTool(
    "check_capacity",
    {
      description: "Free machine hours in the planning window.",
      inputSchema: { machine: z.enum(["CNC VMC", "CNC Turning", "CNC HMC"]), withinDays: z.number() },
    },
    async ({ machine, withinDays }) =>
      json({ machine, withinDays, freeHours: Math.round((FREE_HOURS_21D[machine as Machine] * Math.min(withinDays, 21)) / 21) }),
  );
  s.registerTool(
    "screen_party",
    { description: "Screen a company name against the denied-party list.", inputSchema: { party: z.string() } },
    async ({ party }) => {
      const hit = DENIED_PARTIES.find((d) => party.toLowerCase().includes(d.name.toLowerCase()));
      return json({ party, match: Boolean(hit), listRef: hit?.ref ?? null });
    },
  );
  s.registerTool(
    "create_quote_draft",
    {
      description: "Create a quotation record in the ERP.",
      inputSchema: { customerId: z.string(), partNo: z.string(), qty: z.number(), unitPrice: z.number() },
    },
    async (a) => json({ quoteNo: `QT-26-${String(Math.floor(Math.random() * 9000) + 1000)}`, status: "draft", ...a }),
  );
  return s;
}

function commsServer() {
  const s = new McpServer({ name: "thendral-comms", version: "1.1.0" });
  s.registerTool(
    "send_email",
    { description: "Send an email from sales@thendral.in (sandboxed in the demo).", inputSchema: { to: z.string(), subject: z.string(), body: z.string() } },
    async ({ to, subject }) => json({ messageId: `<${Date.now().toString(36)}@mail.thendral.in>`, to, subject, sandbox: true, status: "queued" }),
  );
  return s;
}

interface McpHub {
  clients: Record<"erp" | "comms", Client>;
}

const g = globalThis as unknown as { __mcp?: Promise<McpHub> };

async function connect(server: McpServer, name: string) {
  const [clientT, serverT] = InMemoryTransport.createLinkedPair();
  await server.connect(serverT);
  const client = new Client({ name: `agentops-${name}-client`, version: "1.0.0" });
  await client.connect(clientT);
  return client;
}

export function mcpHub(): Promise<McpHub> {
  return (g.__mcp ??= (async () => ({
    clients: { erp: await connect(erpServer(), "erp"), comms: await connect(commsServer(), "comms") },
  }))());
}

export async function callMcp<T = Record<string, unknown>>(server: "erp" | "comms", tool: string, args: Record<string, unknown>): Promise<T> {
  const hub = await mcpHub();
  const res = await hub.clients[server].callTool({ name: tool, arguments: args });
  const block = (res.content as { type: string; text?: string }[])[0];
  return JSON.parse(block?.text ?? "{}") as T;
}

export async function describeServers() {
  const hub = await mcpHub();
  const out = [];
  for (const [key, c] of Object.entries(hub.clients)) {
    const info = c.getServerVersion();
    const { tools } = await c.listTools();
    out.push({ key, name: info?.name, version: info?.version, transport: "in-memory (stdio / Streamable HTTP in prod)", tools });
  }
  return out;
}
