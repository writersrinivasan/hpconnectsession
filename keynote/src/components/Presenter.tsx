"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { nextPos, prevPos, SlideView, Stage, useDeck } from "./Deck";
import { SLIDES } from "./slides";

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function Presenter() {
  const { pos, go } = useDeck("presenter");
  const [t0, setT0] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown", "Enter"].includes(e.key)) {
        e.preventDefault();
        go(nextPos);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(prevPos);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [go]);

  const S = SLIDES[pos.i];
  const nxt = nextPos(pos);
  const elapsed = Math.max(0, Math.floor((now - t0) / 1000));

  return (
    <div className="flex h-screen flex-col gap-4 bg-[#08070a] p-5 text-ink">
      <header className="flex items-center gap-6">
        <div className="font-display text-2xl">
          Presenter <span className="gold-text italic">view</span>
        </div>
        <div className="text-ink-3">
          {pos.i + 1}/{SLIDES.length} · {S.chapter}
          {S.steps > 0 && <span className="text-gold"> · build {pos.s + 1}/{S.steps + 1}</span>}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="font-mono text-3xl text-gold">{fmt(elapsed)}</div>
          <button onClick={() => setT0(Date.now())} className="rounded-full border border-white/15 p-2" aria-label="Reset timer">
            <RotateCcw size={16} />
          </button>
          <div className="font-mono text-xl text-ink-3">{new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[1.6fr_1fr] gap-4">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="relative flex-1 overflow-hidden rounded-2xl border border-gold/40">
            <Stage>
              <SlideView pos={pos} />
            </Stage>
          </div>
          <div className="flex gap-3">
            <button onClick={() => go(prevPos)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 py-3 text-lg">
              <ChevronLeft /> Back
            </button>
            <button onClick={() => go(nextPos)} className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gold py-3 text-lg font-bold text-black">
              Next <ChevronRight />
            </button>
          </div>
        </div>
        <div className="flex min-h-0 flex-col gap-4">
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.3em] text-ink-3">Up next · {SLIDES[nxt.i].title}</div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 opacity-80">
              <Stage>
                <SlideView pos={nxt} mini />
              </Stage>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-2 text-[11px] uppercase tracking-[0.3em] text-gold">Speaker notes · {S.title}</div>
            <p className="text-[22px] leading-relaxed">{S.notes}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
