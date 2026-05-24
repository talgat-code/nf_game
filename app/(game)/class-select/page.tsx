import { GlitchText } from "@/components/effects/GlitchText";

const CLASSES = [
  {
    id: "frontend-mage",
    name: "Frontend Mage",
    stack: "React · TS · Tailwind",
    ability: "console.log() reveals one hint per boss",
    weakness: "Algorithm bosses",
    color: "neon-cyan",
  },
  {
    id: "backend-paladin",
    name: "Backend Paladin",
    stack: "Go · Postgres",
    ability: "defer cleanup() removes one active debuff",
    weakness: "UI-flavored bosses",
    color: "neon-green",
  },
  {
    id: "systems-berserker",
    name: "Systems Berserker",
    stack: "Rust · WASM",
    ability: "unsafe { } doubles damage, spawns 1 bug on miss",
    weakness: "High-level bosses",
    color: "neon-magenta",
  },
] as const;

export default function ClassSelectPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 p-8">
      <div className="text-center">
        <GlitchText as="h1" text="SELECT YOUR CLASS" className="text-4xl text-neon-amber text-glow-amber" />
        <p className="mt-2 text-text-muted text-xs tracking-widest uppercase">
          Choose your stack. It determines your language, abilities, and weaknesses.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full max-w-5xl">
        {CLASSES.map((cls) => (
          <a
            key={cls.id}
            href={`/play?class=${cls.id}`}
            className="group flex flex-col gap-4 border border-text-dim p-6 hover:border-neon-cyan transition-colors duration-200"
          >
            <GlitchText
              as="h2"
              text={cls.name}
              className="text-xl text-neon-cyan text-glow-cyan"
              animateOnMount={false}
            />
            <p className="text-text-muted text-xs tracking-widest">{cls.stack}</p>
            <div className="mt-auto flex flex-col gap-2 border-t border-text-dim pt-4">
              <p className="text-xs text-neon-green">
                <span className="text-text-muted">Ability: </span>
                {cls.ability}
              </p>
              <p className="text-xs text-neon-magenta">
                <span className="text-text-muted">Weak to: </span>
                {cls.weakness}
              </p>
            </div>
          </a>
        ))}
      </div>

      <a href="/" className="text-text-dim text-xs tracking-widest hover:text-text transition-colors">
        ← Back
      </a>
    </main>
  );
}
