import dynamic from "next/dynamic";
import type { EditorProps, SupportedLanguage } from "./EditorInner";

export type { SupportedLanguage, EditorProps };

const EditorInner = dynamic(
  () => import("./EditorInner").then((m) => m.EditorInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[200px] items-center justify-center border border-surface-2 bg-surface text-neon-cyan text-xs tracking-widest font-hud">
        INITIALIZING EDITOR...
      </div>
    ),
  },
);

export function Editor(props: EditorProps) {
  return <EditorInner {...props} />;
}
