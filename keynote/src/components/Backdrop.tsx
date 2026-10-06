"use client";
import { useEffect, useRef } from "react";

/** Slow aurora + drifting gold dust. Mood changes per act via `tone`. */
export function Backdrop({ tone = "gold", dim = false, still = false }: { tone?: "gold" | "red" | "violet" | "dark"; dim?: boolean; still?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (still) return;
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const W = (c.width = 1920);
    const H = (c.height = 1080);
    const motes = Array.from({ length: 90 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.25 - 0.05,
      a: Math.random() * 0.5 + 0.15,
      tw: Math.random() * Math.PI * 2,
    }));
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        m.tw += 0.02;
        if (m.y < -10) {
          m.y = H + 10;
          m.x = Math.random() * W;
        }
        const alpha = m.a * (0.6 + 0.4 * Math.sin(m.tw));
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
        g.addColorStop(0, `rgba(255, 214, 102, ${alpha})`);
        g.addColorStop(1, "rgba(255, 214, 102, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [still]);

  const palette = {
    gold: ["rgba(251,193,5,0.20)", "rgba(255,46,58,0.13)"],
    red: ["rgba(255,46,58,0.22)", "rgba(255,157,0,0.12)"],
    violet: ["rgba(140,100,255,0.16)", "rgba(251,193,5,0.10)"],
    dark: ["rgba(251,193,5,0.06)", "rgba(255,46,58,0.05)"],
  }[tone];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000" style={{ opacity: dim ? 0.35 : 1 }}>
      <div className="aurora-a absolute -left-[20%] -top-[30%] h-[110%] w-[80%] rounded-full blur-[120px] transition-colors duration-[1500ms]" style={{ background: `radial-gradient(closest-side, ${palette[0]}, transparent)` }} />
      <div className="aurora-b absolute -bottom-[40%] -right-[15%] h-[110%] w-[75%] rounded-full blur-[120px] transition-colors duration-[1500ms]" style={{ background: `radial-gradient(closest-side, ${palette[1]}, transparent)` }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />
      {!still && <canvas ref={canvas} className="absolute inset-0 h-full w-full" />}
    </div>
  );
}
