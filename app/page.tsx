import { GlitchText } from "@/components/effects/GlitchText";
import { DottedEyeLogo } from "@/components/effects/DottedEyeLogo";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      {/* Logo */}
      <div className="relative">
        <DottedEyeLogo size={240} className="text-neon-cyan opacity-90" />
        <div
          className="absolute inset-0 -z-10 blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #00f0ff 0%, transparent 70%)" }}
        />
      </div>

      {/* Title */}
      <div className="text-center space-y-3">
        <GlitchText
          as="h1"
          text="CODE CRUSADERS"
          className="text-5xl text-neon-cyan text-glow-cyan"
        />
        <p className="text-text-muted text-xs tracking-[0.4em] uppercase">
          A cyberpunk coding roguelike
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <a
          href="/class-select"
          className="border border-neon-cyan px-10 py-3 text-neon-cyan hover:bg-neon-cyan hover:text-void transition-all duration-200 tracking-widest uppercase text-sm font-bold hover:shadow-[0_0_20px_#00f0ff]"
        >
          ► Start Run
        </a>
        <p className="text-text-dim text-xs tracking-widest">
          Pick your stack · Battle bosses · Permadeath enabled
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 right-4 text-text-dim text-xs font-hud tracking-widest">
        v0.1-alpha
      </div>
    </main>
  );
}
