import { GlitchText } from "@/components/effects/GlitchText";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <GlitchText
          as="h1"
          text="CODE CRUSADERS"
          className="text-5xl text-neon-cyan text-glow-cyan"
        />
        <p className="mt-4 text-text-muted text-sm tracking-widest uppercase">
          A cyberpunk coding roguelike
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <a
          href="/class-select"
          className="border border-neon-cyan px-8 py-3 text-neon-cyan hover:bg-neon-cyan hover:text-void transition-colors duration-200 tracking-widest uppercase text-sm"
        >
          Start Run
        </a>
        <p className="text-text-dim text-xs tracking-widest">
          Pick your stack. Battle bosses. Permadeath enabled.
        </p>
      </div>

      <div className="absolute bottom-4 right-4 text-text-dim text-xs font-hud">
        v0.1-alpha
      </div>
    </main>
  );
}
