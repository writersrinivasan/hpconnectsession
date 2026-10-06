"use client";
import { useEffect, useState } from "react";
import { Cable, Network, Plug, Wrench } from "lucide-react";
import { Chip, Panel } from "../ui";

interface Server {
  key: string;
  name: string;
  version: string;
  transport: string;
  tools: { name: string; description: string; inputSchema: { properties?: Record<string, { type?: string; enum?: string[] }>; required?: string[] } }[];
}

export function ProtocolsView() {
  const [data, setData] = useState<{ servers: Server[]; agentCard: Record<string, unknown> } | null>(null);
  const [rpc, setRpc] = useState<string>("");
  useEffect(() => {
    fetch("/api/mcp")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const tryA2A = async (auth: boolean) => {
    const res = await fetch("/api/a2a/supplier", {
      method: "POST",
      headers: { "content-type": "application/json", ...(auth ? { authorization: "Bearer a2a-demo-token-thendral" } : {}) },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "message/send", params: { message: { role: "user", kind: "message", messageId: "demo-1", parts: [{ kind: "data", data: { material: "EN8 Steel", qtyKg: 1800, neededByDays: 7 } }] } } }),
    });
    setRpc(`HTTP ${res.status}\n${JSON.stringify(await res.json(), null, 2)}`);
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-2 gap-3">
      <Panel
        title="MCP: how agents use tools"
        icon={<Plug size={13} className="text-gold" />}
        right={<Chip tone="ok">discovered live via tools/list</Chip>}
        bodyClass="overflow-y-auto scroll-thin p-4 space-y-4"
      >
        <p className="text-[13px] text-ink-2">
          <b className="text-ink">Model Context Protocol</b> is like a <span className="gold-text font-semibold">USB-C port for AI</span>. Connect your ERP, Tally, MES or email once as an MCP server, and any agent can find and use those tools in a standard, controlled way.
        </p>
        {data?.servers.map((s) => (
          <div key={s.key} className="rounded-2xl border hairline bg-white/[0.03] p-3">
            <div className="flex items-center gap-2">
              <Cable size={15} className="text-ok" />
              <b>{s.name}</b>
              <Chip>v{s.version}</Chip>
              <span className="ml-auto text-[11px] text-ink-3">{s.transport}</span>
            </div>
            <div className="mt-2 grid gap-1.5">
              {s.tools.map((t) => (
                <div key={t.name} className="rounded-lg bg-black/25 px-3 py-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[12px] text-ok">
                    <Wrench size={11} /> {t.name}(
                    <span className="text-ink-2">
                      {Object.entries(t.inputSchema.properties ?? {})
                        .map(([k, v]) => `${k}: ${v.enum ? v.enum.join("|") : v.type}`)
                        .join(", ")}
                    </span>
                    )
                  </div>
                  <div className="text-[11.5px] text-ink-3">{t.description}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Panel>
      <Panel title="A2A: how agents talk to other companies' agents" icon={<Network size={13} className="text-violet" />} right={<Chip tone="violet">JSON-RPC 2.0 · Agent Card</Chip>} bodyClass="overflow-y-auto scroll-thin p-4 space-y-3">
        <p className="text-[13px] text-ink-2">
          <b className="text-ink">Agent-to-Agent</b> is the <span className="gold-text font-semibold">phone line between agents</span> at different companies. Your procurement agent finds the supplier&apos;s sales agent through its <i>Agent Card</i>, signs in, and negotiates. Nobody sends an email.
        </p>
        <div className="text-[11px] uppercase tracking-[0.2em] text-ink-3">Agent Card (GET /api/a2a/supplier)</div>
        <pre className="max-h-72 overflow-auto rounded-xl bg-black/35 p-3 text-[11px] leading-relaxed text-violet">{JSON.stringify(data?.agentCard, null, 2)}</pre>
        <div className="flex gap-2">
          <button onClick={() => tryA2A(true)} className="flex-1 rounded-xl bg-violet/90 py-2 text-[13px] font-semibold text-black">
            Send message/send (with token)
          </button>
          <button onClick={() => tryA2A(false)} className="flex-1 rounded-xl border border-bad/40 py-2 text-[13px] text-bad">
            Try without a token
          </button>
        </div>
        {rpc && <pre className="max-h-64 overflow-auto rounded-xl bg-black/35 p-3 text-[11px] text-ink-2">{rpc}</pre>}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[12px]">
          <div className="rounded-xl border border-ok/25 bg-ok/[0.06] p-3">
            <b className="text-ok">MCP</b>
            <div className="text-ink-2">agent ↔ tool / data. Inside your company. You control the server.</div>
          </div>
          <div className="rounded-xl border border-violet/25 bg-violet/[0.06] p-3">
            <b className="text-violet">A2A</b>
            <div className="text-ink-2">agent ↔ agent. Across companies. Each side keeps its own logic private.</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
