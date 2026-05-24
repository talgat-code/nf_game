"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BossTauntProps {
  text: string | null;
  /** Used to re-trigger animation even if text is the same. */
  triggerKey: number;
}

export function BossTaunt({ text, triggerKey }: BossTauntProps) {
  const [visible, setVisible] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: triggerKey forces re-run on same text
  useEffect(() => {
    if (!text) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [text, triggerKey]);

  return (
    <AnimatePresence mode="wait">
      {visible && text && (
        <motion.div
          key={triggerKey}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative bg-void border border-neon-magenta px-4 py-2 max-w-full"
          style={{ boxShadow: "0 0 12px #ff3dbb40" }}
        >
          {/* Speech-bubble tail */}
          <div
            aria-hidden
            className="absolute -bottom-2 left-6 w-3 h-3 bg-void border-r border-b border-neon-magenta"
            style={{ transform: "rotate(45deg)" }}
          />
          <p className="text-neon-magenta text-xs font-mono italic leading-snug">
            <span className="text-text-muted font-hud not-italic">► </span>
            "{text}"
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
