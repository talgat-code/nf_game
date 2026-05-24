"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BossPanelProps {
  name: string;
  hp: number;
  maxHp: number;
  imageSrc?: string;
  className?: string;
}

type BossAnimState = "idle" | "hit" | "defeated";

export function BossPanel({
  name,
  hp,
  maxHp,
  imageSrc = "/sprites/null-pointer-wraith.png",
  className,
}: BossPanelProps) {
  const [animState, setAnimState] = useState<BossAnimState>("idle");
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; value: number }[]>([]);
  const [prevHp, setPrevHp] = useState(hp);
  const [imageError, setImageError] = useState(false);

  // Detect hp changes → trigger animation
  useEffect(() => {
    if (hp === prevHp) return;
    const dmg = prevHp - hp;

    if (hp <= 0) {
      setAnimState("defeated");
    } else if (dmg > 0) {
      setAnimState("hit");
      const id = Date.now();
      setDamageNumbers((d) => [...d, { id, value: dmg }]);
      setTimeout(() => {
        setDamageNumbers((d) => d.filter((n) => n.id !== id));
      }, 1200);
      setTimeout(() => setAnimState("idle"), 600);
    }

    setPrevHp(hp);
  }, [hp, prevHp]);

  const hpPct = Math.max(0, (hp / maxHp) * 100);

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-surface-2 bg-surface",
        "flex flex-col",
        className,
      )}
    >
      {/* Boss name banner */}
      <div className="px-4 py-2 bg-surface-2 border-b border-surface-3 flex items-center justify-between">
        <span className="text-neon-magenta text-sm font-hud tracking-widest uppercase text-glow-magenta">
          ◤ {name} ◥
        </span>
        <span className="text-text-muted text-xs font-hud tracking-widest">
          BOSS
        </span>
      </div>

      {/* Boss image with damage animations */}
      <div className="relative flex-1 flex items-center justify-center bg-void overflow-hidden min-h-[280px]">
        {/* Animated scanline overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,240,255,0.3) 2px, rgba(0,240,255,0.3) 3px)",
          }}
        />

        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          animate={
            animState === "hit"
              ? {
                  x: [0, -12, 14, -10, 8, -4, 0],
                  rotate: [0, -2, 2, -1, 1, 0],
                  filter: [
                    "brightness(1) hue-rotate(0deg)",
                    "brightness(2) hue-rotate(-30deg) saturate(2)",
                    "brightness(1.6) hue-rotate(20deg) saturate(1.5)",
                    "brightness(1) hue-rotate(0deg) saturate(1)",
                  ],
                }
              : animState === "defeated"
                ? {
                    opacity: [1, 0.3, 0.7, 0.1, 0.5, 0],
                    scale: [1, 1.1, 0.9, 1.2, 0.5, 0],
                    filter: [
                      "blur(0px)",
                      "blur(4px) hue-rotate(180deg)",
                      "blur(8px) hue-rotate(-180deg)",
                      "blur(12px)",
                    ],
                  }
                : {}
          }
          transition={{ duration: animState === "defeated" ? 1.5 : 0.5 }}
        >
          {imageError ? (
            <BossPlaceholder />
          ) : (
            // Plain img — no Next.js Image since we want it to fail gracefully
            // and the file may not exist yet (user adds it)
            // biome-ignore lint/performance/noImgElement: graceful fallback to placeholder
            <img
              src={imageSrc}
              alt={name}
              onError={() => setImageError(true)}
              className="max-h-[260px] w-auto object-contain drop-shadow-[0_0_20px_rgba(255,61,187,0.4)]"
            />
          )}
        </motion.div>

        {/* Floating damage numbers */}
        <AnimatePresence>
          {damageNumbers.map((d) => (
            <motion.div
              key={d.id}
              initial={{ y: 0, opacity: 0, scale: 0.5 }}
              animate={{ y: -80, opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 text-4xl font-bold font-hud text-neon-amber pointer-events-none"
              style={{ textShadow: "0 0 12px #ffaa00, 0 0 24px #ff6600" }}
            >
              −{d.value}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Flash on hit */}
        {animState === "hit" && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-neon-magenta pointer-events-none"
            aria-hidden
          />
        )}
      </div>

      {/* HP bar */}
      <div className="px-4 py-3 bg-surface-2 border-t border-surface-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-text-muted text-xs font-hud tracking-widest uppercase">
            ► Health
          </span>
          <span className="text-neon-magenta text-sm font-hud font-bold tabular-nums">
            {hp} / {maxHp}
          </span>
        </div>
        <div className="h-3 bg-void border border-surface-3 overflow-hidden">
          <motion.div
            className="h-full"
            animate={{ width: `${hpPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background:
                "linear-gradient(90deg, #ff3dbb 0%, #ff00aa 50%, #ff3dbb 100%)",
              boxShadow: "0 0 12px #ff00aa, inset 0 0 6px #ff66cc",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── CSS-art fallback if image doesn't exist ─────────────────────────────────
function BossPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-text-muted">
      <div className="relative">
        <div className="text-8xl text-neon-magenta opacity-70 text-glow-magenta select-none">
          👁
        </div>
        <div className="absolute -inset-4 border-2 border-neon-magenta opacity-30 animate-pulse" />
      </div>
      <p className="text-neon-magenta text-xs font-hud tracking-widest text-glow-magenta">
        [ ENTITY UNRENDERED ]
      </p>
      <p className="text-text-dim text-xs">
        save image → public/sprites/null-pointer-wraith.png
      </p>
    </div>
  );
}
