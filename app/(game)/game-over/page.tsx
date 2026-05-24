import { GlitchText } from "@/components/effects/GlitchText";

export default function GameOverPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <GlitchText as="h1" text="YOU DIED" className="text-6xl text-neon-magenta text-glow-magenta" />
      <p className="text-text-muted text-sm tracking-widest">Run ended. Permadeath is real.</p>
      <a
        href="/"
        className="border border-neon-magenta px-8 py-3 text-neon-magenta hover:bg-neon-magenta hover:text-void transition-colors duration-200 tracking-widest uppercase text-sm"
      >
        Start New Run
      </a>
    </main>
  );
}
