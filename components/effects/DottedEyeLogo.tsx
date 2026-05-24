"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface DottedEyeLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

// Procedural halftone eye — generates dot pattern that resembles an iris.
// Inspired by digital surveillance / "all-seeing eye" aesthetics.
export function DottedEyeLogo({
  size = 200,
  className,
  animated = true,
}: DottedEyeLogoProps) {
  const dots = useMemo(() => generateEyeDots(size), [size]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("text-text", className)}
      aria-label="Code Crusaders logo"
    >
      <title>Code Crusaders — All-seeing eye</title>
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill="currentColor"
          opacity={dot.opacity}
        >
          {animated && i % 23 === 0 && (
            <animate
              attributeName="opacity"
              values={`${dot.opacity};${dot.opacity * 0.3};${dot.opacity}`}
              dur={`${3 + (i % 5)}s`}
              repeatCount="indefinite"
            />
          )}
        </circle>
      ))}
    </svg>
  );
}

// Generates a halftone eye pattern using polar distance from center
function generateEyeDots(size: number): Array<{
  x: number;
  y: number;
  r: number;
  opacity: number;
}> {
  const dots: Array<{ x: number; y: number; r: number; opacity: number }> = [];
  const cx = size / 2;
  const cy = size / 2;
  const eyeRadiusX = size * 0.48;
  const eyeRadiusY = size * 0.32;
  const irisRadius = size * 0.18;
  const pupilRadius = size * 0.08;
  const spacing = size / 50;

  for (let y = 0; y < size; y += spacing) {
    for (let x = 0; x < size; x += spacing) {
      // Stagger every other row for hex-like packing
      const offsetX = (y / spacing) % 2 === 0 ? 0 : spacing / 2;
      const px = x + offsetX;
      const py = y;

      const dx = px - cx;
      const dy = py - cy;

      // Is point inside the eye ellipse?
      const inEye =
        (dx * dx) / (eyeRadiusX * eyeRadiusX) +
          (dy * dy) / (eyeRadiusY * eyeRadiusY) <
        1;
      if (!inEye) continue;

      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 1.2;
      let opacity = 0.55;

      // Pupil — solid dark center
      if (dist < pupilRadius) {
        r = 2.3;
        opacity = 1;
      }
      // Iris — densest dots
      else if (dist < irisRadius) {
        r = 1.8;
        opacity = 0.95 - (dist / irisRadius) * 0.3;
      }
      // Outer iris glow
      else if (dist < irisRadius * 1.6) {
        const t = (dist - irisRadius) / (irisRadius * 0.6);
        r = 1.6 - t * 0.4;
        opacity = 0.6 - t * 0.2;
      }
      // Sclera (eye white) — sparse dots
      else {
        r = 0.9;
        opacity = 0.35;
      }

      dots.push({ x: px, y: py, r, opacity });
    }
  }

  return dots;
}
