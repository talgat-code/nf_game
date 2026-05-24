"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!?><[]{}|";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  animateOnMount?: boolean;
  duration?: number;
}

export function GlitchText({
  text,
  className,
  as: Tag = "span",
  animateOnMount = true,
  duration = 800,
}: GlitchTextProps) {
  const [displayed, setDisplayed] = useState(animateOnMount ? "" : text);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animateOnMount) return;

    const start = performance.now();
    const len = text.length;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * len);

      const next = text
        .split("")
        .map((char, i) => {
          if (i < revealedCount) return char;
          if (char === " ") return " ";
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplayed(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, animateOnMount, duration]);

  return (
    <Tag
      className={cn("font-hud tracking-widest", className)}
      aria-label={text}
    >
      {displayed || text}
    </Tag>
  );
}
