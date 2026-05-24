"use client";

import MonacoEditor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useCallback } from "react";
import { CYBERPUNK_THEME_ID, cyberpunkTheme } from "@/lib/monaco-theme";
import { cn } from "@/lib/utils";

export type SupportedLanguage = "javascript" | "typescript" | "python" | "go" | "rust";

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: SupportedLanguage;
  readOnly?: boolean;
  className?: string;
  height?: string | number;
}

export function EditorInner({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
  className,
  height = "100%",
}: EditorProps) {
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    monaco.editor.defineTheme(CYBERPUNK_THEME_ID, cyberpunkTheme);
  }, []);

  const handleMount: OnMount = useCallback((editor) => {
    editor.updateOptions({
      fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
      fontSize: 14,
      lineHeight: 22,
      letterSpacing: 0.5,
    });
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-surface-2",
        "focus-within:border-neon-cyan transition-colors duration-200",
        className,
      )}
    >
      <div className="absolute right-3 top-2 z-10 text-xs text-text-dim font-hud tracking-widest uppercase select-none pointer-events-none">
        {language}
      </div>

      <MonacoEditor
        height={height}
        language={language}
        theme={CYBERPUNK_THEME_ID}
        value={value}
        onChange={(val) => onChange(val ?? "")}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 4,
          lineNumbersMinChars: 3,
          renderLineHighlight: "line",
          scrollbar: { vertical: "auto", horizontal: "hidden", verticalScrollbarSize: 6 },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          renderWhitespace: "none",
          cursorBlinking: "phase",
          cursorStyle: "line",
          tabSize: 2,
          padding: { top: 16, bottom: 16 },
        }}
        loading={
          <div className="flex h-full min-h-[200px] items-center justify-center bg-surface text-neon-cyan text-xs tracking-widest font-hud">
            INITIALIZING MONACO...
          </div>
        }
      />
    </div>
  );
}
