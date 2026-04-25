"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#FF3D7F", "#FF6B9D", "#0A0A0A", "#e5e5e5", "#FFD700", "#60a5fa"];

export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.5 - 20,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      speed: Math.random() * 3 + 1.5,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    let frame: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        p.y += p.speed;
        p.angle += p.spin;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }} />;
}
