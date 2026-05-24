"use client";

import { cn } from "@/lib/utils";

interface CRTOverlayProps {
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export function CRTOverlay({ className, intensity = "medium" }: CRTOverlayProps) {
  return (
    <>
      {/* Scanlines */}
      <div
        aria-hidden
        className={cn("pointer-events-none fixed inset-0 z-50", className)}
        style={{
          backgroundImage:
            intensity === "low"
              ? "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)"
              : intensity === "high"
                ? "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 3px)"
                : "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)",
          mixBlendMode: "multiply",
        }}
      />
      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      {/* CRT flicker animation */}
      <style>{`
        @keyframes crt-flicker {
          0%   { opacity: 1; }
          92%  { opacity: 1; }
          93%  { opacity: 0.97; }
          94%  { opacity: 1; }
          98%  { opacity: 1; }
          99%  { opacity: 0.96; }
          100% { opacity: 1; }
        }
        .crt-flicker {
          animation: crt-flicker 6s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .crt-flicker { animation: none; }
        }
      `}</style>
    </>
  );
}
