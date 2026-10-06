# HP Connect AI Workshop: One Yoto

**Transform MSME Workflows into Growth Engines with AI**, a keynote and live demo by Srinivasan Ramanujam (Founder & Chief AI Architect, One Yoto).

| App | What it is | URL |
| --- | --- | --- |
| `keynote/` | Cinematic, app-based presentation (Next.js 16, Framer Motion), 29 slides following the HP Connect agenda | http://localhost:3000 |
| `studio/` | **AgentOps Studio**: a live multi-agent AI system for a fictional Hosur auto-component MSME (LangGraph, MCP, A2A, RAG, Claude) | http://localhost:3001 |

## Show-day quick start

```bash
./start.sh          # production build of both apps
./start.sh dev      # hot-reload dev servers instead
```

Open the keynote, press **F** for fullscreen, and press **P** to open the presenter view on your laptop screen.

### Keynote controls

| Key | Action |
| --- | --- |
| → / Space / Enter | Next build step or slide |
| ← | Back |
| O | Slide overview |
| N | Speaker notes overlay (single-screen setups) |
| P | Presenter view: current slide, next slide, notes, timer (synced) |
| L | Launch AgentOps Studio in a new tab |
| B | Blackout |
| F | Fullscreen |

The URL hash (`#12.2` = slide 12, build 2) keeps your place if you refresh.

### Live Claude vs Stage-safe mode

The Studio runs every agent through Claude (`claude-opus-5-5`, Anthropic SDK). Add your key to switch it on:

```bash
cp studio/.env.example studio/.env.local   # then set ANTHROPIC_API_KEY
```

- **Auto** (default): live if a key is present, otherwise simulated.
- **Live Claude**: always calls Claude. If a call fails (no network, venue Wi-Fi), that one step falls back to simulation and the UI shows a warning.
- **Stage-safe**: deterministic simulation with realistic timing. Fully offline, so the demo cannot fail on stage.

Rehearse in Live mode at least once with your key before the event.

## Suggested demo flow (about 8 minutes)

1. **Mission Control → 01 Standard RFQ.** Three agents fan out in parallel, ERP tools are called over MCP, the quality agent cites the quality manual (RAG), and steel is sourced from a supplier's agent over **A2A**. The quote goes out autonomously.
2. **02 Rush + 12% discount.** The policy engine pauses the LangGraph run (`interrupt()`). Approve as MD with a counter-offer of 8% and watch the agents resume.
3. **03 Prompt injection.** Hidden HTML instructions are quarantined; the security flag forces human review.
4. **04 Restricted party + PII.** PAN, Aadhaar, phone and bank details are tokenised before the model sees them, and screening hard-stops the deal.
5. **Audit Trail → "Tamper with a record".** The SHA-256 hash chain breaks at the edited entry. Then *Restore*.
6. **Evals → Run all.** Nine golden cases with deterministic scorers (plus an LLM judge in live mode).
7. **Monitoring.** Autonomy rate, escalations, p95 latency, cost per run, guardrail trips.
8. **Audience challenge.** Let someone type an email and try to break the agents.

Keys **1–9** switch Studio views.

## Studio architecture

```
guard_in → intake → supervisor ─┬→ inventory  (MCP → ERP)        ─┐
                                ├→ quality    (RAG → IATF manual) ─┼→ synthesis ─┬→ procurement (A2A → supplier agent) → pricing
                                └→ compliance (MCP + RAG)         ─┘             ├→ pricing (deterministic costing + LLM rationale)
                                                                                 └→ finalize (hard stop)
pricing → guard_out (policy) ─┬→ dispatch (MCP → email) → finalize
                              └→ human (LangGraph interrupt) ─┬→ dispatch
                                                              └→ finalize (rejected)
```

| Concern | Where |
| --- | --- |
| Orchestration (StateGraph, parallel fan-out, conditional routing, HITL interrupt + checkpointer) | `studio/src/lib/agents/graph.ts` |
| MCP servers (official SDK: `thendral-erp`, `thendral-comms`) | `studio/src/lib/mcp.ts` |
| A2A supplier agent (Agent Card + JSON-RPC `message/send`, bearer auth) | `studio/src/lib/a2a.ts`, `studio/src/app/api/a2a/supplier/route.ts` |
| Hybrid RAG (section chunking, hashed TF-IDF vectors + BM25, RRF) | `studio/src/lib/rag.ts`, `studio/src/lib/data/knowledge.ts` |
| Guardrails (PII vault, injection detector, RBAC, A2A confidentiality, policy, groundedness) | `studio/src/lib/guardrails.ts` |
| Audit (hash-chained ledger, verify, tamper demo) | `studio/src/lib/audit.ts` |
| Observability (spans, tokens, cost per call) | `studio/src/lib/context.ts`, `studio/src/lib/llm.ts` |
| Evals (golden set, scorers, LLM judge) | `studio/src/lib/evals.ts` |

State is in memory (it resets when the server restarts). In production you'd back it with Postgres, Redis and an OpenTelemetry collector, and swap the offline embedder for a hosted embedding model and vector DB.

## Before the event: please verify

- **MSME figures** on the "founder is the API" slide (~6.3 crore MSMEs, ~30% of GDP, ~45% of exports) are approximate. Check them against the latest Ministry of MSME annual report.
- **Case studies** are labelled as illustrative composites. Swap in named client stories and measured results where you have permission.
- The company, customers, supplier and denied-party list in the Studio are fictional.
