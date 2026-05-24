"use client";

import { cn } from "@/lib/utils";

interface CodeExplanationProps {
  code: string;
  explanations: Record<number, string>;
  className?: string;
}

export function CodeExplanation({ code, explanations, className }: CodeExplanationProps) {
  const lines = code.split("\n");

  return (
    <div className={cn("flex flex-col gap-px text-xs", className)}>
      {lines.map((line, idx) => {
        const lineNum = idx + 1;
        const explanation = explanations[lineNum];
        const isBug = explanation?.toLowerCase().includes("bug");

        return (
          <div
            key={lineNum}
            className={cn(
              "flex gap-3 px-2 py-1.5 border-l-2 font-mono",
              isBug
                ? "border-neon-magenta bg-neon-magenta/10"
                : explanation
                  ? "border-surface-3 bg-surface/50"
                  : "border-transparent",
            )}
          >
            <span className="text-text-dim shrink-0 w-6 text-right tabular-nums">
              {lineNum}
            </span>
            <div className="flex-1 min-w-0 space-y-1">
              <pre className="text-text whitespace-pre-wrap break-all">{line || " "}</pre>
              {explanation && (
                <p
                  className={cn(
                    "text-[11px] leading-snug italic",
                    isBug ? "text-neon-magenta" : "text-text-muted",
                  )}
                >
                  {isBug && "⚠ "}
                  {explanation}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
