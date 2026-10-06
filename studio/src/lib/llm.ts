// Claude wrapper used by every agent.
// LIVE: official Anthropic SDK → Claude (structured outputs, refusal fallback, token + cost accounting).
// SIM:  deterministic "stage-safe" responses with realistic latency, so the keynote demo never
//       depends on venue Wi-Fi. Any live failure degrades to SIM and is surfaced as a warning.
import Anthropic from "@anthropic-ai/sdk";
import type { RunCtx } from "./context";
import { store } from "./store";

export const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";
// USD per million tokens (Claude Opus 5.5). Update if you switch models.
const PRICE = { input: 4, output: 20 };
const MAX_LLM_CALLS_PER_RUN = 14;

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

export const hasCredentials = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

export function effectiveMode(): "live" | "sim" {
  if (store.mode === "live") return "live";
  if (store.mode === "sim") return "sim";
  return hasCredentials() ? "live" : "sim";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const estTokens = (s: string) => Math.ceil(s.length / 3.8);

interface LlmArgs<T> {
  agent: string;
  purpose: string;
  system: string;
  prompt: string;
  /** JSON schema → Claude structured output. Omit for free text. */
  schema?: Record<string, unknown>;
  simulate: () => T;
  parentSpan: string | null;
  maxTokens?: number;
}

export async function callClaude<T = string>(ctx: RunCtx, a: LlmArgs<T>): Promise<T> {
  const run = ctx.run;
  const span = ctx.startSpan(`llm: ${a.purpose}`, "llm", a.parentSpan, { agent: a.agent, model: MODEL });
  const t0 = Date.now();
  run.prompts.push(`${a.system}\n${a.prompt}`);

  if (run.metrics.llmCalls >= MAX_LLM_CALLS_PER_RUN) {
    ctx.guard({ stage: "budget", rule: "LLM call budget", verdict: "block", detail: `Run exceeded ${MAX_LLM_CALLS_PER_RUN} model calls` }, span.id);
    throw new Error("LLM call budget exceeded");
  }

  let result: T;
  let inputTokens = estTokens(a.system + a.prompt);
  let outputTokens = 0;
  let simulated = run.mode === "sim";
  let model = MODEL;

  if (!simulated) {
    try {
      const res = await getClient().beta.messages.create({
        model: MODEL,
        max_tokens: a.maxTokens ?? 4000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low", ...(a.schema ? { format: { type: "json_schema", schema: a.schema } } : {}) },
        system: a.system,
        messages: [{ role: "user", content: a.prompt }],
      });
      if (res.stop_reason === "refusal") throw new Error("Model declined the request (refusal)");
      const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
      result = (a.schema ? JSON.parse(text) : text.trim()) as T;
      inputTokens = res.usage.input_tokens;
      outputTokens = res.usage.output_tokens;
      model = res.model;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      ctx.emit("warning", { text: `Live Claude call failed (${msg.slice(0, 120)}). Falling back to stage-safe simulation for this step.` });
      simulated = true;
    }
  }

  if (simulated) {
    await sleep(450 + Math.random() * 700);
    result = a.simulate();
    outputTokens = estTokens(typeof result === "string" ? result : JSON.stringify(result)) + 120;
  }

  const durationMs = Date.now() - t0;
  const costUsd = (inputTokens * PRICE.input + outputTokens * PRICE.output) / 1e6;
  run.metrics.llmCalls++;
  run.metrics.inputTokens += inputTokens;
  run.metrics.outputTokens += outputTokens;
  run.metrics.costUsd += costUsd;
  ctx.endSpan(span, { inputTokens, outputTokens, costUsd: Number(costUsd.toFixed(5)), simulated });
  const out = typeof result! === "string" ? (result as string) : JSON.stringify(result!);
  ctx.emit("llm", {
    call: {
      agent: a.agent,
      model,
      purpose: a.purpose,
      inputTokens,
      outputTokens,
      costUsd,
      durationMs,
      simulated,
      promptPreview: a.prompt.slice(0, 600),
      outputPreview: out.slice(0, 600),
    },
  });
  return result!;
}
