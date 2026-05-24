"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { EditorFallback } from "./EditorFallback";
import type { EditorProps, SupportedLanguage } from "./EditorInner";

export type { SupportedLanguage, EditorProps };

const MONACO_LOAD_TIMEOUT_MS = 6000;

const EditorInner = dynamic(
  () => import("./EditorInner").then((m) => m.EditorInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[200px] items-center justify-center bg-surface text-neon-cyan text-xs tracking-widest font-hud">
        INITIALIZING EDITOR...
      </div>
    ),
  },
);

// Editor with graceful degradation:
//   - Tries Monaco (real syntax highlighting + IDE features)
//   - Falls back to styled textarea if Monaco fails to load in 6s
export function Editor(props: EditorProps) {
  const [monacoFailed, setMonacoFailed] = useState(false);
  const [monacoLoaded, setMonacoLoaded] = useState(false);

  useEffect(() => {
    if (monacoLoaded) return;
    const timer = setTimeout(() => {
      if (!monacoLoaded) setMonacoFailed(true);
    }, MONACO_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [monacoLoaded]);

  // Listen for Monaco's mount event via a global flag on the window
  useEffect(() => {
    const check = () => {
      // @ts-expect-error — global flag set by EditorInner.onMount
      if (window.__MONACO_LOADED__) setMonacoLoaded(true);
    };
    const interval = setInterval(check, 200);
    return () => clearInterval(interval);
  }, []);

  if (monacoFailed) {
    return <EditorFallback {...props} />;
  }

  return <EditorInner {...props} />;
}
