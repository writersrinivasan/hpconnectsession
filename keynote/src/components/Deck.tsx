"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid3x3, MonitorPlay, X } from "lucide-react";
import { Backdrop } from "./Backdrop";
import { STUDIO_URL } from "./slides/cases";
import { SLIDES } from "./slides";

export interface Pos {
  i: number;
  s: number;
}

const CHANNEL = "oneyoto-deck";
// The deck renders client-only, so the starting slide can be read straight from the URL hash.
function fromHash(): Pos {
  const m = (typeof window !== "undefined" ? window.location.hash : "").match(/#(\d+)(?:\.(\d+))?/);
  return m ? { i: clamp(Number(m[1]) - 1, 0, SLIDES.length - 1), s: Number(m[2] ?? 0) } : { i: 0, s: 0 };
}
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export function nextPos(p: Pos): Pos {
  if (p.s < SLIDES[p.i].steps) return { i: p.i, s: p.s + 1 };
  return p.i < SLIDES.length - 1 ? { i: p.i + 1, s: 0 } : p;
}
export function prevPos(p: Pos): Pos {
  if (p.s > 0) return { i: p.i, s: p.s - 1 };
  return p.i > 0 ? { i: p.i - 1, s: SLIDES[p.i - 1].steps } : p;
}

/** Shared position state, synced between the audience deck and the presenter view. */
export function useDeck(role: "deck" | "presenter") {
  const [pos, setPos] = useState<Pos>(() => (role === "deck" ? fromHash() : { i: 0, s: 0 }));
  const chan = useRef<BroadcastChannel | null>(null);
  const posRef = useRef(pos);

  useEffect(() => {
    const c = new BroadcastChannel(CHANNEL);
    chan.current = c;
    c.onmessage = (e) => {
      if (e.data?.type === "pos") {
        posRef.current = e.data.pos;
        setPos(e.data.pos);
      }
      // A newly opened presenter view asks the deck where we are.
      if (e.data?.type === "hello" && role === "deck") c.postMessage({ type: "pos", pos: posRef.current });
    };
    if (role === "presenter") c.postMessage({ type: "hello" });
    return () => c.close();
  }, [role]);

  useEffect(() => {
    if (role === "deck") history.replaceState(null, "", `#${pos.i + 1}${pos.s ? `.${pos.s}` : ""}`);
  }, [pos, role]);

  // Only explicit navigation is broadcast, so opening a window never moves the other one.
  const go = useCallback((p: Pos | ((p: Pos) => Pos)) => {
    const next = typeof p === "function" ? p(posRef.current) : p;
    posRef.current = next;
    setPos(next);
    chan.current?.postMessage({ type: "pos", pos: next });
  }, []);
  return { pos, go };
}

export function Stage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current!.parentElement!;
    // ResizeObserver fires once on observe, which sets the initial scale.
    const ro = new ResizeObserver(() => setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={`absolute left-1/2 top-1/2 h-[1080px] w-[1920px] overflow-hidden ${className}`} style={{ transform: `translate(-50%, -50%) scale(${scale})`, opacity: scale ? 1 : 0 }}>
      {children}
    </div>
  );
}

export function SlideView({ pos, mini = false }: { pos: Pos; mini?: boolean }) {
  const S = SLIDES[pos.i];
  const chromeless = ["cold-open", "title", "close"].includes(S.id) || S.id.startsWith("ch");
  return (
    <div className="grain absolute inset-0 bg-[#050407]">
      <Backdrop tone={S.tone} dim={S.id === "cold-open"} still={mini} />
      <AnimatePresence mode="wait">
        <motion.div
          key={S.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.035, filter: "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.985, filter: "blur(10px)" }}
          transition={{ duration: mini ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <S.C step={pos.s} />
        </motion.div>
      </AnimatePresence>
      {!chromeless && (
        <>
          <Image src="/brand/yoto-logo-transparent.png" alt="" width={120} height={50} className="absolute bottom-[44px] right-[120px] h-[34px] w-auto opacity-80" />
          <div className="absolute right-[270px] bottom-[50px] text-[16px] tracking-[0.3em] text-ink-3">{S.chapter.toUpperCase()}</div>
        </>
      )}
      <div className="absolute bottom-0 left-0 h-[4px] bg-gradient-to-r from-gold via-amber to-crimson transition-all duration-700" style={{ width: `${((pos.i + 1) / SLIDES.length) * 100}%` }} />
    </div>
  );
}

export function Deck() {
  const { pos, go } = useDeck("deck");
  const [overview, setOverview] = useState(false);
  const [notes, setNotes] = useState(false);
  const [black, setBlack] = useState(false);
  const [hud, setHud] = useState(true);
  const hideT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const poke = useCallback(() => {
    setHud(true);
    clearTimeout(hideT.current);
    hideT.current = setTimeout(() => setHud(false), 2200);
  }, []);

  useEffect(() => {
    hideT.current = setTimeout(() => setHud(false), 2200);
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName.match(/INPUT|TEXTAREA/)) return;
      const k = e.key.toLowerCase();
      if (["arrowright", " ", "pagedown", "enter"].includes(k)) {
        e.preventDefault();
        go(nextPos);
      } else if (["arrowleft", "pageup", "backspace"].includes(k)) {
        e.preventDefault();
        go(prevPos);
      } else if (k === "home") go({ i: 0, s: 0 });
      else if (k === "end") go({ i: SLIDES.length - 1, s: 0 });
      else if (k === "o") setOverview((v) => !v);
      else if (k === "escape") {
        setOverview(false);
        setNotes(false);
      } else if (k === "n") setNotes((v) => !v);
      else if (k === "b" || k === ".") setBlack((v) => !v);
      else if (k === "f") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
      } else if (k === "l") window.open(STUDIO_URL, "_blank");
      else if (k === "p") window.open("/presenter", "oneyoto-presenter", "width=1400,height=860");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousemove", poke);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousemove", poke);
    };
  }, [go, poke]);

  const S = SLIDES[pos.i];
  return (
    <div className={`fixed inset-0 bg-black ${hud ? "" : "cursor-none"}`}>
      <Stage>
        <SlideView pos={pos} />
      </Stage>

      <AnimatePresence>{black && <motion.div className="fixed inset-0 z-40 bg-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBlack(false)} />}</AnimatePresence>

      {/* HUD */}
      <motion.div animate={{ opacity: hud && !overview ? 1 : 0 }} className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-2 text-[13px] text-ink-2 backdrop-blur">
        <button onClick={() => go(prevPos)} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Previous">
          <ChevronLeft size={18} />
        </button>
        <span className="min-w-[110px] text-center font-mono">
          {pos.i + 1} / {SLIDES.length}
          {S.steps > 0 && <span className="text-gold"> · {pos.s + 1}/{S.steps + 1}</span>}
        </span>
        <button onClick={() => go(nextPos)} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Next">
          <ChevronRight size={18} />
        </button>
        <span className="mx-1 h-4 w-px bg-white/15" />
        <button onClick={() => setOverview(true)} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Overview (O)">
          <Grid3x3 size={16} />
        </button>
        <button onClick={() => window.open("/presenter", "oneyoto-presenter", "width=1400,height=860")} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Presenter view (P)">
          <MonitorPlay size={16} />
        </button>
        <span className="pl-1 text-[11px] text-ink-3">← → · O · N · P · F · B · L</span>
      </motion.div>

      {/* Notes overlay (when you have a single screen) */}
      <AnimatePresence>
        {notes && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-20 left-1/2 z-30 w-[min(900px,90vw)] -translate-x-1/2 rounded-2xl border border-gold/30 bg-black/85 p-5 text-[17px] leading-relaxed text-ink backdrop-blur">
            <div className="mb-1 text-[11px] uppercase tracking-[0.3em] text-gold">Speaker notes · {S.title}</div>
            {S.notes}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview grid */}
      <AnimatePresence>
        {overview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black/92 p-10 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-display text-3xl">
                Slide <span className="gold-text italic">overview</span>
              </div>
              <button onClick={() => setOverview(false)} className="rounded-full border border-white/15 p-2" aria-label="Close overview">
                <X />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-5">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    go({ i, s: 0 });
                    setOverview(false);
                  }}
                  className="group text-left"
                >
                  <div className={`relative aspect-video overflow-hidden rounded-xl border ${i === pos.i ? "border-gold shadow-[0_0_30px_rgba(251,193,5,0.4)]" : "border-white/10 group-hover:border-gold/50"}`}>
                    <Stage>
                      <SlideView pos={{ i, s: s.steps }} mini />
                    </Stage>
                  </div>
                  <div className="mt-2 flex gap-2 text-[13px]">
                    <span className="font-mono text-gold">{i + 1}</span>
                    <span className="text-ink-2">{s.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
