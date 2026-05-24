import { GlitchText } from "@/components/effects/GlitchText";

const CLASSES = [
  {
    id: "frontend-mage",
    name: "Frontend Mage",
    stack: "React · TS · Tailwind",
    ability: "console.log() reveals one hint per boss",
    weakness: "Algorithm bosses",
    firstBoss: "Null Pointer Wraith",
    bossImg: "/sprites/null-pointer-wraith.png",
    accent: "text-neon-cyan",
    border: "border-neon-cyan",
  },
  {
    id: "backend-paladin",
    name: "Backend Paladin",
    stack: "Go · Postgres",
    ability: "defer cleanup() removes one active debuff",
    weakness: "UI-flavored bosses",
    firstBoss: "Memory Leak Demon",
    bossImg: "/sprites/memory-leak-demon.png",
    accent: "text-neon-green",
    border: "border-neon-green",
  },
  {
    id: "systems-berserker",
    name: "Systems Berserker",
    stack: "Rust · WASM",
    ability: "unsafe { } doubles damage, spawns 1 bug on miss",
    weakness: "High-level bosses",
    firstBoss: "Stack Overflow // Exception King",
    bossImg: "/sprites/exception-king.png",
    accent: "text-neon-magenta",
    border: "border-neon-magenta",
  },
] as const;

export default function ClassSelectPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-6">
      <div className="text-center">
        <GlitchText
          as="h1"
          text="SELECT YOUR CLASS"
          className="text-4xl text-neon-amber text-glow-amber"
        />
        <p className="mt-2 text-text-muted text-xs tracking-widest uppercase">
          Pick your stack. Each class faces a different first boss.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full max-w-6xl">
        {CLASSES.map((cls) => (
          <a
            key={cls.id}
            href={`/play?class=${cls.id}`}
            className={`group flex flex-col gap-3 border border-surface-2 bg-surface p-5 hover:${cls.border} hover:bg-surface-2 transition-all duration-200`}
          >
            {/* Boss preview */}
            <div className="relative h-48 -mx-5 -mt-5 mb-2 bg-void border-b border-surface-2 overflow-hidden">
              {/* biome-ignore lint/performance/noImgElement: boss preview, optimized size not critical */}
              <img
                src={cls.bossImg}
                alt={cls.firstBoss}
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 40%, rgba(22,22,42,0.8) 100%)",
                }}
              />
              <span className="absolute bottom-2 left-3 text-[10px] font-hud tracking-widest text-text-muted uppercase">
                ► First boss
              </span>
              <span className={`absolute bottom-2 right-3 text-xs font-hud tracking-widest ${cls.accent}`}>
                {cls.firstBoss}
              </span>
            </div>

            <GlitchText
              as="h2"
              text={cls.name}
              className={`text-xl ${cls.accent}`}
              animateOnMount={false}
            />
            <p className="text-text-muted text-xs tracking-widest">{cls.stack}</p>
            <div className="mt-auto flex flex-col gap-2 border-t border-surface-2 pt-3">
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

      <a
        href="/"
        className="text-text-dim text-xs tracking-widest hover:text-text transition-colors"
      >
        ← Back
      </a>
    </main>
  );
}
