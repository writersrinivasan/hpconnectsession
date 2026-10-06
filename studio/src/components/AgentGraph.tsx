"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, BookOpen, Building2, CheckCircle2, Cpu, Database, Flag, Mail, PauseCircle, ShieldCheck, UserCheck, Workflow } from "lucide-react";
import { EDGES, NODES, NODE_H, NODE_W, SATELLITES, type SatelliteId } from "./graph-layout";
import { useRun, type NodeState } from "./run-store";

const pos = Object.fromEntries(NODES.map((n) => [n.id, n]));

function edgePath(fx: number, fy: number, tx: number, ty: number, faint?: boolean) {
  if (faint) {
    const y = 545;
    return `M ${fx} ${fy + NODE_H / 2} C ${fx} ${y}, ${tx - 60} ${y}, ${tx - NODE_W / 2} ${ty}`;
  }
  if (Math.abs(fx - tx) < 5) return `M ${fx} ${fy + (ty > fy ? NODE_H / 2 : -NODE_H / 2)} L ${tx} ${ty + (ty > fy ? -NODE_H / 2 : NODE_H / 2)}`;
  const sx = fx + NODE_W / 2;
  const ex = tx - NODE_W / 2;
  const mx = (sx + ex) / 2;
  return `M ${sx} ${fy} C ${mx} ${fy}, ${mx} ${ty}, ${ex} ${ty}`;
}

const KIND_ICON = { guard: ShieldCheck, agent: Bot, supervisor: Workflow, human: UserCheck, end: Flag };
const SAT_ICON: Record<SatelliteId, typeof Database> = { kb: BookOpen, erp: Database, comms: Mail, supplier: Building2 };

const stateStyle = (st: NodeState | undefined, kind: string) => {
  if (st === "active") return { stroke: "#fbc105", fill: "rgba(251,193,5,0.14)", text: "#fff6d6" };
  if (st === "paused") return { stroke: "#ff9d00", fill: "rgba(255,157,0,0.16)", text: "#ffe2b0" };
  if (st === "done") return { stroke: kind === "guard" ? "rgba(61,220,151,0.75)" : "rgba(251,193,5,0.55)", fill: "rgba(255,255,255,0.05)", text: "#f5efe3" };
  return { stroke: "rgba(255,255,255,0.14)", fill: "rgba(255,255,255,0.025)", text: "#8c867b" };
};

export function AgentGraph() {
  const { nodes, edges, summaries, flashes, status } = useRun();
  const activeSats = new Set(flashes.map((f) => f.sat));

  return (
    <svg viewBox="0 18 1200 572" className="h-full w-full" role="img" aria-label="Live LangGraph agent workflow">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbc105" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fbc105" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="edgeGold" x1="0" x2="1">
          <stop offset="0%" stopColor="#ffdd66" />
          <stop offset="100%" stopColor="#ff9d00" />
        </linearGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* organisation boundary */}
      <rect x="18" y="108" width="1170" height="470" rx="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 8" />
      <text x="34" y="134" fill="#6f695f" fontSize="12" letterSpacing="2">THENDRAL PRECISION · AGENT RUNTIME (LANGGRAPH)</text>

      {/* satellite links (flash on use) */}
      <AnimatePresence>
        {flashes.map((f) => {
          const s = SATELLITES[f.sat];
          const n = pos[f.node];
          return (
            <motion.line
              key={f.id}
              x1={s.x}
              y1={s.y}
              x2={n.x}
              y2={n.y}
              stroke={f.sat === "supplier" ? "#a78bfa" : f.sat === "kb" ? "#4cc9f0" : "#3ddc97"}
              strokeWidth={2}
              className="flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
            />
          );
        })}
      </AnimatePresence>

      {/* edges */}
      {EDGES.map((e) => {
        const f = pos[e.from];
        const t = pos[e.to];
        const d = edgePath(f.x, f.y, t.x, t.y, e.faint);
        const lit = edges.has(`${e.from}>${e.to}`);
        const live = lit && nodes[e.to] === "active";
        return (
          <g key={`${e.from}-${e.to}`}>
            <path d={d} fill="none" stroke={lit ? "url(#edgeGold)" : "rgba(255,255,255,0.09)"} strokeWidth={lit ? 2.4 : 1.4} strokeDasharray={e.faint && !lit ? "3 6" : undefined} />
            {live && (
              <>
                <path d={d} fill="none" stroke="#fff3c4" strokeWidth={2.4} className="flow" opacity={0.9} />
                <circle r="5" fill="#fff3c4">
                  <animateMotion dur="0.9s" repeatCount="indefinite" path={d} />
                </circle>
              </>
            )}
          </g>
        );
      })}

      {/* satellites */}
      {(Object.keys(SATELLITES) as SatelliteId[]).map((k) => {
        const s = SATELLITES[k];
        const Icon = SAT_ICON[k];
        const on = activeSats.has(k);
        const color = k === "supplier" ? "#a78bfa" : k === "kb" ? "#4cc9f0" : "#3ddc97";
        return (
          <g key={k} transform={`translate(${s.x - 98}, ${s.y - 24})`}>
            <rect width="196" height="48" rx="12" fill={on ? `${color}22` : "rgba(255,255,255,0.03)"} stroke={on ? color : "rgba(255,255,255,0.12)"} strokeDasharray={k === "supplier" ? "5 4" : undefined} />
            <foreignObject x="10" y="13" width="22" height="22">
              <Icon size={20} color={on ? color : "#8c867b"} />
            </foreignObject>
            <text x="38" y="21" fill={on ? "#fff" : "#cfc8bb"} fontSize="14" fontWeight={600}>
              {s.label}
            </text>
            <text x="38" y="38" fill="#7d776d" fontSize="11.5">
              {s.sub}
            </text>
          </g>
        );
      })}

      {/* nodes */}
      {NODES.map((n) => {
        const st = nodes[n.id];
        const sty = stateStyle(st, n.kind);
        const Icon = st === "paused" ? PauseCircle : st === "done" && n.kind === "guard" ? CheckCircle2 : n.id === "pricing" ? Cpu : KIND_ICON[n.kind];
        return (
          <g key={n.id} transform={`translate(${n.x - NODE_W / 2}, ${n.y - NODE_H / 2})`}>
            {(st === "active" || st === "paused") && (
              <>
                <ellipse cx={NODE_W / 2} cy={NODE_H / 2} rx={NODE_W * 0.85} ry={NODE_H * 1.2} fill="url(#glow)" />
                <rect width={NODE_W} height={NODE_H} rx="14" fill="none" stroke={sty.stroke} strokeWidth="2" className="halo" />
              </>
            )}
            <rect width={NODE_W} height={NODE_H} rx="14" fill={sty.fill} stroke={sty.stroke} strokeWidth={st ? 1.8 : 1.2} />
            <foreignObject x="10" y="10" width="22" height="22">
              <Icon size={19} color={sty.stroke === "rgba(255,255,255,0.14)" ? "#6f695f" : sty.stroke} />
            </foreignObject>
            <text x="34" y="25" fill={sty.text} fontSize="14.5" fontWeight={650}>
              {n.label}
            </text>
            {!summaries[n.id] && (
              <text x="11" y="50" fill={st ? "#a69f92" : "#5e594f"} fontSize="12">
                {n.sub}
              </text>
            )}
            {summaries[n.id] && (
              <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} x={11} y={50} fill="#fbc105" fontSize="11.5" fontFamily="var(--font-mono)">
                {summaries[n.id]!.length > 17 ? `${summaries[n.id]!.slice(0, 16)}…` : summaries[n.id]}
              </motion.text>
            )}
          </g>
        );
      })}

      {status === "idle" && (
        <text x="600" y="590" textAnchor="middle" fill="#6f695f" fontSize="12" letterSpacing="3">
          PICK A SCENARIO TO WAKE THE AGENTS
        </text>
      )}
    </svg>
  );
}
