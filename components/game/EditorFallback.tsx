"use client";

import { cn } from "@/lib/utils";

interface EditorFallbackProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
  height?: string | number;
}

// Plain textarea with cyberpunk styling. Used while Monaco loads,
// or as a permanent replacement if Monaco fails to mount.
export function EditorFallback({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
  className,
  height = 500,
}: EditorFallbackProps) {
  // Simple line counter for visual line numbers
  const lineCount = Math.max(value.split("\n").length, 20);
  const heightStyle =
    typeof height === "number" ? { height: `${height}px` } : { height };

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-surface-2 bg-void",
        "focus-within:border-neon-cyan transition-colors duration-200",
        className,
      )}
      style={heightStyle}
    >
      {/* Language badge */}
      <div className="absolute right-3 top-2 z-10 text-xs text-text-dim font-hud tracking-widest uppercase select-none pointer-events-none">
        {language}
      </div>

      <div className="flex h-full">
        {/* Line numbers gutter */}
        <div
          className="select-none bg-surface text-text-dim text-right pr-2 pt-4 text-xs leading-[22px] font-mono"
          style={{ minWidth: "3rem" }}
          aria-hidden
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code area */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          className="flex-1 bg-void text-text font-mono text-sm leading-[22px] p-4 outline-none resize-none border-0 caret-neon-cyan"
          style={{
            fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
            letterSpacing: "0.5px",
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
