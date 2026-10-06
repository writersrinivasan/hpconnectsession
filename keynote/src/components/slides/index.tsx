"use client";
import type { ComponentType } from "react";
import type { SlideProps } from "../kit";
import { AgenticStack, DataStrategy, Deployment, IndustryExplorer, ModelSelection, RagExplained } from "./deepdive";
import { AgentAnatomy, Evolution, FounderIsTheAPI, GrowthEngines, Section } from "./act1";
import { CaseStudies, Economics, LiveDemo, Myths, TrustStack } from "./cases";
import { Checklist, Closing } from "./close";
import { Agenda, ColdOpen, Speaker, TitleSlide } from "./opening";
import { AutonomyLadder, Roadmap, UseCaseMatrix } from "./roadmap";

export interface SlideDef {
  id: string;
  title: string;
  chapter: string;
  tone: "gold" | "red" | "violet" | "dark";
  steps: number; // number of extra build steps (0 = none)
  notes: string;
  C: ComponentType<SlideProps>;
}

const sec = (n: string, title: React.ReactNode, sub: string) => {
  const S = () => <Section n={n} title={title} sub={sub} />;
  S.displayName = `Section${n}`;
  return S;
};

export const SLIDES: SlideDef[] = [
  {
    id: "cold-open",
    title: "Cold open",
    chapter: "Opening",
    tone: "dark",
    steps: 3,
    notes: "Lights low. Speak slowly. Advance one line at a time. Let '2:09 AM' land in silence for two seconds. Then: 'This isn't science fiction. You'll see it running live in 40 minutes.'",
    C: ColdOpen,
  },
  {
    id: "title",
    title: "Title",
    chapter: "Opening",
    tone: "gold",
    steps: 0,
    notes: "Welcome everyone and thank HP Connect. One-line promise: by the end, every person here will know exactly which workflow to give to an AI agent first, and how to do it safely.",
    C: TitleSlide,
  },
  {
    id: "speaker",
    title: "About the speaker",
    chapter: "Opening",
    tone: "gold",
    steps: 1,
    notes: "Keep it to 60 seconds. Clinical data and SAS at TCS, Accenture, Thomson Reuters, IBM Watson Health. Then founder of Career Mudhra and now One Yoto. The point: 'I've built enterprise systems AND trained 40,000 people to use them, so today is about both the tech and the team.' Advance to reveal the timeline.",
    C: Speaker,
  },
  {
    id: "agenda",
    title: "Agenda",
    chapter: "Opening",
    tone: "gold",
    steps: 0,
    notes: "This mirrors the HP Connect agenda. Promise the live demo in chapter 4, which keeps energy high through the theory.",
    C: Agenda,
  },
  {
    id: "ch1",
    title: "Chapter 1",
    chapter: "1 · Growth engines",
    tone: "gold",
    steps: 0,
    notes: "Chapter 1: why now, and why MSMEs specifically.",
    C: sec("01", <>Workflows into <span className="gold-text italic">growth engines</span></>, "Why agentic AI is the first technology that scales an MSME without scaling its headcount."),
  },
  {
    id: "founder-api",
    title: "The founder is the API",
    chapter: "1 · Growth engines",
    tone: "red",
    steps: 2,
    notes: "Ask: 'How many of you got a work WhatsApp after 10 pm yesterday?' Hands up. That's the founder-as-API problem. Advance: the spokes turn red. Advance again for the MSME stats. They're approximate, so verify against the latest Ministry of MSME annual report before you speak.",
    C: FounderIsTheAPI,
  },
  {
    id: "evolution",
    title: "Evolution of automation",
    chapter: "1 · Growth engines",
    tone: "gold",
    steps: 2,
    notes: "Rules, then RPA, then chatbots. The leap is from answering to acting. Advance twice to light up 'AI agents' and 'Agent teams'. Key line: 'A chatbot tells you the stock level. An agent reorders the steel.'",
    C: Evolution,
  },
  {
    id: "anatomy",
    title: "Anatomy of an agent",
    chapter: "1 · Growth engines",
    tone: "gold",
    steps: 1,
    notes: "Perceive, reason, act, reflect: the loop. Use the analogy of a smart new employee: a goal, a brain, access to systems, a handbook (RAG), and a manager's rules (guardrails). Advance to add memory and guardrails.",
    C: AgentAnatomy,
  },
  {
    id: "engines",
    title: "Growth engines by function",
    chapter: "1 · Growth engines",
    tone: "gold",
    steps: 0,
    notes: "Ask the room which card hurts most. Quick poll by show of hands; sales and finance usually win. Remember the answer and refer back to it in the checklist.",
    C: GrowthEngines,
  },
  {
    id: "ch2",
    title: "Chapter 2",
    chapter: "2 · Roadmap",
    tone: "violet",
    steps: 0,
    notes: "Chapter 2: the implementation roadmap.",
    C: sec("02", <>The AI implementation <span className="gold-text italic">roadmap</span></>, "Ninety days from idea to a governed agent in production, without betting the company."),
  },
  {
    id: "roadmap",
    title: "90-day roadmap",
    chapter: "2 · Roadmap",
    tone: "violet",
    steps: 3,
    notes: "Reveal one phase per click. Stress phase 3: shadow mode, where the agent works next to the human for 2–4 weeks before anyone trusts it. Most failures skip the baseline in phase 1, so they can never prove ROI.",
    C: Roadmap,
  },
  {
    id: "ladder",
    title: "Autonomy ladder",
    chapter: "2 · Roadmap",
    tone: "violet",
    steps: 1,
    notes: "Advance to spotlight L3. Line: 'You wouldn't give a new hire the company cheque book on day one. Same with agents.' L3 means it acts inside limits and escalates outside them. You'll see exactly that in the demo.",
    C: AutonomyLadder,
  },
  {
    id: "matrix",
    title: "Choosing the first use case",
    chapter: "2 · Roadmap",
    tone: "violet",
    steps: 1,
    notes: "Top-right quadrant: high value, data already exists. The generic company chatbot is the most common waste of money; call it out with a smile.",
    C: UseCaseMatrix,
  },
  {
    id: "ch3",
    title: "Chapter 3",
    chapter: "3 · Deep dives",
    tone: "gold",
    steps: 0,
    notes: "Chapter 3: data, models, deployment, and how the pieces connect.",
    C: sec("03", <>Industry <span className="gold-text italic">deep dives</span></>, "Data strategy, model selection and deployment workflows: the three decisions that make or break an agent."),
  },
  {
    id: "data",
    title: "Data strategy",
    chapter: "3 · Deep dives",
    tone: "gold",
    steps: 1,
    notes: "Tacit knowledge is the hidden goldmine. Your best supervisor's judgement can become an SOP the agent reads. Advance for the pipeline and stress the DPDP Act: personal data must be governed before it ever touches a model.",
    C: DataStrategy,
  },
  {
    id: "rag",
    title: "RAG explained",
    chapter: "3 · Deep dives",
    tone: "gold",
    steps: 2,
    notes: "Open-book exam analogy: the model doesn't memorise your price book, it looks things up every time and shows its source. Advance through ingest, then retrieve, then the 'no source, no answer' principle.",
    C: RagExplained,
  },
  {
    id: "models",
    title: "Model selection",
    chapter: "3 · Deep dives",
    tone: "gold",
    steps: 1,
    notes: "Don't pick a favourite model; route by task. In the demo the price is computed by plain code and the AI only explains it. That gets a laugh and builds trust. Mention that AI PCs and workstations now make small on-prem models practical for sensitive shop-floor data.",
    C: ModelSelection,
  },
  {
    id: "deploy",
    title: "Deployment workflows",
    chapter: "3 · Deep dives",
    tone: "gold",
    steps: 1,
    notes: "Three deployment patterns, then the release pipeline. Evaluate and Shadow are highlighted because MSMEs skip them most often.",
    C: Deployment,
  },
  {
    id: "stack",
    title: "Orchestration, A2A, MCP, RAG",
    chapter: "3 · Deep dives",
    tone: "violet",
    steps: 4,
    notes: "Build it up click by click: orchestrator and specialists, then MCP (USB-C), A2A (phone line between companies' agents), RAG (library), and finally the trust ring. This is the exact architecture of the live demo.",
    C: AgenticStack,
  },
  {
    id: "industries",
    title: "Industry explorer",
    chapter: "3 · Deep dives",
    tone: "gold",
    steps: 3,
    notes: "Each click (or tab) switches industry: manufacturing, textiles, food processing, distribution. Ask which industry the room is from and click that tab first.",
    C: IndustryExplorer,
  },
  {
    id: "ch4",
    title: "Chapter 4",
    chapter: "4 · Case studies",
    tone: "red",
    steps: 0,
    notes: "Chapter 4: stories, then the live demo.",
    C: sec("04", <>Case studies &amp; a <span className="gold-text italic">live factory</span></>, "Four verticals, one pattern, and then we watch the agents work in real time."),
  },
  {
    id: "cases",
    title: "Case studies",
    chapter: "4 · Case studies",
    tone: "red",
    steps: 3,
    notes: "Advance through four cases. These are illustrative composites; say so out loud, and swap in named client stories where you have permission. The common pattern: specialist agents, one guardrail that really matters, and a before/after metric.",
    C: CaseStudies,
  },
  {
    id: "demo",
    title: "Live demo",
    chapter: "4 · Case studies",
    tone: "red",
    steps: 0,
    notes: "Press L or click to open the Studio. Suggested order: 01 standard (show the graph and A2A conversation) → 02 rush (approve at a counter of 8%) → 03 injection → Audit Trail tab, then 'Tamper with a record' (crowd favourite) → Evals tab, run all → Monitoring. Backup: the Studio's Stage-safe mode needs no internet.",
    C: LiveDemo,
  },
  {
    id: "ch5",
    title: "Chapter 5",
    chapter: "5 · Trust & action",
    tone: "gold",
    steps: 0,
    notes: "Chapter 5: making it safe, making it pay, and what to do next.",
    C: sec("05", <>Trust, economics &amp; your <span className="gold-text italic">next move</span></>, "Guardrails, audit and evals turn a clever demo into a system you can bet the business on."),
  },
  {
    id: "trust",
    title: "Trust stack",
    chapter: "5 · Trust & action",
    tone: "gold",
    steps: 1,
    notes: "Tie each pillar back to what they just saw in the Studio: guardrails caught the injection, audit caught the tamper, evals ran 9 tests, monitoring showed cost per run.",
    C: TrustStack,
  },
  {
    id: "economics",
    title: "Economics",
    chapter: "5 · Trust & action",
    tone: "gold",
    steps: 2,
    notes: "Use the cost-per-run number from the Studio's metric strip if you ran it live. The formula slide gives owners a way to build their own business case.",
    C: Economics,
  },
  {
    id: "myths",
    title: "Myths vs reality",
    chapter: "5 · Trust & action",
    tone: "red",
    steps: 1,
    notes: "Read the myths in the owner's voice, then advance to strike them through and show reality. Good moment for audience questions.",
    C: Myths,
  },
  {
    id: "checklist",
    title: "Quick action checklist",
    chapter: "5 · Trust & action",
    tone: "gold",
    steps: 0,
    notes: "Interactive: click each item as you explain it. Ask the room to photograph this slide. The ticks persist in the browser.",
    C: Checklist,
  },
  {
    id: "close",
    title: "Thank you",
    chapter: "Close",
    tone: "gold",
    steps: 0,
    notes: "Close with the line: 'Don't automate tasks. Architect outcomes.' Pause. Invite them to scan the QR and share which workflow they'll start with on Monday.",
    C: Closing,
  },
];
