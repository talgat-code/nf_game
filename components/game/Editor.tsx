"use client";

import MonacoEditor, { loader, type OnMount } from "@monaco-editor/react";
import { useCallback, useRef } from "react";
import { CYBERPUNK_THEME_ID, cyberpunkTheme } from "@/lib/monaco-theme";
import { cn } from "@/lib/utils";

// Load Monaco from CDN — avoids worker bundling issues in Next.js App Router
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs",
  },
});

export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "go"
  | "rust";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: SupportedLanguage;
  readOnly?: boolean;
  className?: string;
}

export function Editor({
  value,
  onChange,
  language = "javascript",
  readOnly = false,
  className,
}: EditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme(CYBERPUNK_THEME_ID, cyberpunkTheme);
    monaco.editor.setTheme(CYBERPUNK_THEME_ID);
    editor.updateOptions({
      fontFamily: "'JetBrains Mono', Consolas, monospace",
      fontSize: 14,
      lineHeight: 22,
      fontLigatures: true,
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
        height="100%"
        language={language}
        theme={CYBERPUNK_THEME_ID}
        value={value}
        onChange={(val) => onChange(val ?? "")}
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
          scrollbar: {
            vertical: "auto",
            horizontal: "hidden",
            verticalScrollbarSize: 6,
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          renderWhitespace: "none",
          cursorBlinking: "phase",
          cursorStyle: "line",
          tabSize: 2,
          padding: { top: 16, bottom: 16 },
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-surface text-neon-cyan text-xs tracking-widest font-hud">
            INITIALIZING EDITOR...
          </div>
        }
      />
    </div>
  );
}
