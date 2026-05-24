"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { GlitchText } from "@/components/effects/GlitchText";
import { BossPanel } from "@/components/game/BossPanel";
import { CodeExplanation } from "@/components/game/CodeExplanation";
import { Editor } from "@/components/game/Editor";
import { MusicPlayer } from "@/components/game/MusicPlayer";
import { getBossForClass } from "@/lib/challenges/list";
import { runJsInSandbox } from "@/lib/js-runner";
import type { ExecuteResponse, TestResult } from "@/lib/types";

const PLAYER_MAX_HP = 100;
const DAMAGE_ON_WRONG = 20;
const BOSS_MAX_HP = 100;

type Phase = "fighting" | "won" | "lost";
type SubmitState = "idle" | "running";
type RightTab = "boss" | "explain";

// ─── Player HP bar ────────────────────────────────────────────────────────────
function PlayerHPBar({ hp, max }: { hp: number; max: number }) {
  const pct = Math.max(0, (hp / max) * 100);
  return (
    <div className="px-4 py-2 bg-surface border border-surface-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-text-muted text-xs font-hud tracking-widest uppercase">► You</span>
        <span className="text-neon-cyan text-sm font-hud font-bold tabular-nums">
          {hp} / {max}
        </span>
      </div>
      <div className="h-2 bg-void border border-surface-3 overflow-hidden">
        <motion.div
          className="h-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
          style={{
            background: "linear-gradient(90deg, #00f0ff 0%, #00ddee 100%)",
            boxShadow: "0 0 8px #00f0ff",
          }}
        />
      </div>
    </div>
  );
}

// ─── Test row ─────────────────────────────────────────────────────────────────
function TestRow({ result, idx }: { result: TestResult; idx: number }) {
  return (
    <div
      className={`flex items-center gap-4 px-3 py-1.5 text-xs font-mono border-l-2 ${
        result.passed
          ? "border-neon-green bg-neon-green/5 text-neon-green"
          : "border-neon-magenta bg-neon-magenta/10 text-neon-magenta"
      }`}
    >
      <span className="w-6 text-text-muted shrink-0">#{idx + 1}</span>
      <span className="w-12">{result.passed ? "✓ PASS" : "✗ FAIL"}</span>
      <span className="text-text-muted">in={result.input}</span>
      <span className="text-text">→ {result.actual || "(empty)"}</span>
      {!result.passed && <span className="text-text-muted ml-auto">want={result.expected}</span>}
    </div>
  );
}

function TestPreview({ tc, idx }: { tc: { input: string; expected: string }; idx: number }) {
  return (
    <div className="flex items-center gap-3 px-3 py-1 text-xs font-mono text-text-muted">
      <span className="text-text-dim w-6">#{idx + 1}</span>
      <span>solution({tc.input})</span>
      <span className="text-text-dim">→</span>
      <span className="text-neon-cyan">{tc.expected}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void" />}>
      <PlayPageInner />
    </Suspense>
  );
}

function PlayPageInner() {
  const params = useSearchParams();
  const classId = params.get("class");
  const boss = useMemo(() => getBossForClass(classId), [classId]);
  const totalChallenges = boss.challenges.length;
  const damagePerHit = Math.ceil(BOSS_MAX_HP / totalChallenges);

  const [challengeIdx, setChallengeIdx] = useState(0);
  const challenge = boss.challenges[challengeIdx];
  const [code, setCode] = useState(challenge.starterCode);
  const [state, setState] = useState<SubmitState>("idle");
  const [response, setResponse] = useState<ExecuteResponse | null>(null);
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [phase, setPhase] = useState<Phase>("fighting");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>("boss");

  async function handleSubmit() {
    if (state === "running" || phase !== "fighting") return;
    setState("running");
    setResponse(null);

    const sandboxResult = await runJsInSandbox(code, challenge.testCases);
    const data: ExecuteResponse = {
      passed: sandboxResult.ok && sandboxResult.results.every((r) => r.passed),
      results: sandboxResult.results,
      error: sandboxResult.error,
      runtimeMs: sandboxResult.runtimeMs,
    };
    setResponse(data);
    setAttempts((a) => a + 1);

    if (data.passed) {
      const newBossHp = Math.max(0, bossHp - damagePerHit);
      setBossHp(newBossHp);

      // Advance to next challenge after a beat
      setTimeout(() => {
        if (newBossHp <= 0) {
          setPhase("won");
        } else if (challengeIdx < totalChallenges - 1) {
          const nextIdx = challengeIdx + 1;
          setChallengeIdx(nextIdx);
          setCode(boss.challenges[nextIdx].starterCode);
          setResponse(null);
          setShowHint(false);
        } else {
          setPhase("won");
        }
      }, 2000);
    } else {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 400);
      const newPlayerHp = Math.max(0, playerHp - DAMAGE_ON_WRONG);
      setPlayerHp(newPlayerHp);
      if (newPlayerHp <= 0) setPhase("lost");
    }

    setState("idle");
  }

  // ─── Win screen ─────────────────────────────────────────────────────────────
  if (phase === "won") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <GlitchText
          as="h1"
          text={`${boss.name} DEFEATED`}
          className="text-4xl text-neon-green text-glow-green text-center"
        />
        <p className="text-text text-sm tracking-widest">
          Cleared {challengeIdx + 1} challenge{challengeIdx !== 0 ? "s" : ""} in{" "}
          <span className="text-neon-green">{attempts}</span> total attempts.
        </p>
        <a
          href="/class-select"
          className="border border-neon-green px-8 py-3 text-neon-green hover:bg-neon-green hover:text-void transition-colors duration-200 tracking-widest uppercase text-sm"
        >
          Continue Run →
        </a>
      </main>
    );
  }

  if (phase === "lost") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <GlitchText as="h1" text="YOU DIED" className="text-5xl text-neon-magenta text-glow-magenta" />
        <p className="text-text-muted text-sm tracking-widest">
          The Wraith nullified your memory. Run terminated.
        </p>
        <a
          href="/"
          className="border border-neon-magenta px-8 py-3 text-neon-magenta hover:bg-neon-magenta hover:text-void transition-colors duration-200 tracking-widest uppercase text-sm"
        >
          New Run
        </a>
      </main>
    );
  }

  // ─── Fight screen ───────────────────────────────────────────────────────────
  return (
    <motion.main
      animate={screenShake ? { x: [0, -8, 10, -6, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col"
    >
      {/* HUD */}
      <header className="flex items-center justify-between border-b border-surface-2 bg-surface px-6 py-3">
        <div className="flex items-center gap-4">
          <GlitchText
            as="h1"
            text="CODE CRUSADERS"
            className="text-lg text-neon-cyan text-glow-cyan"
          />
          <span className="text-text-dim text-xs font-hud tracking-widest">
            {boss.languageLabel} · CHALLENGE {challengeIdx + 1} / {totalChallenges}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <MusicPlayer />
          <span className="text-text-muted text-xs font-hud tracking-widest">
            ATTEMPT {attempts} · {state === "running" ? "EXECUTING..." : phase.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Main: three columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_380px] gap-0 flex-1">
        {/* ── LEFT: Challenge info ────────────────────────────────────── */}
        <aside className="border-r border-surface-2 bg-surface flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-surface-2">
            <p className="text-neon-amber text-xs font-hud tracking-widest uppercase">
              ► Challenge {challengeIdx + 1}
            </p>
            <h2 className="text-neon-cyan text-base mt-1 font-bold tracking-wider">
              {challenge.title}
            </h2>
          </div>

          <div className="p-4 border-b border-surface-2">
            <p className="text-text text-sm leading-relaxed">{challenge.prompt}</p>
          </div>

          <div className="p-4 border-b border-surface-2">
            <p className="text-text-muted text-xs font-hud tracking-widest uppercase mb-2">
              ► Test cases ({challenge.testCases.length})
            </p>
            <div className="space-y-px bg-void border border-surface-2 py-2">
              {challenge.testCases.map((tc, i) => (
                <TestPreview key={i} tc={tc} idx={i} />
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-surface-2">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-neon-amber text-xs font-hud tracking-widest uppercase hover:text-neon-cyan transition-colors"
            >
              {showHint ? "▼ Hide hint" : "► Reveal hint"}
            </button>
            {showHint && (
              <p className="mt-2 text-text-muted text-sm leading-relaxed italic">
                💡 {challenge.hint}
              </p>
            )}
          </div>

          <div className="p-4 mt-auto">
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="text-text-muted">Damage / hit</div>
              <div className="text-neon-green font-hud text-right">+{damagePerHit}</div>
              <div className="text-text-muted">Penalty / miss</div>
              <div className="text-neon-magenta font-hud text-right">−{DAMAGE_ON_WRONG}</div>
            </div>
          </div>
        </aside>

        {/* ── CENTER: Editor + Terminal ───────────────────────────────── */}
        <section className="flex flex-col bg-void min-w-0">
          <div className="border-b border-surface-2">
            <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-surface-2">
              <span className="text-text-muted text-xs font-hud tracking-widest uppercase">
                ► solution.js
              </span>
              <span className="text-text-dim text-xs font-hud">
                lines: {code.split("\n").length}
              </span>
            </div>
            <Editor
              value={code}
              onChange={setCode}
              language="javascript"
              height={420}
              className="w-full border-0"
            />
          </div>

          <div className="flex-1 bg-void min-h-[180px]">
            <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-surface-2">
              <span className="text-text-muted text-xs font-hud tracking-widest uppercase">
                ► terminal
              </span>
              {response && (
                <span
                  className={`text-xs font-hud tracking-widest ${
                    response.passed ? "text-neon-green" : "text-neon-magenta"
                  }`}
                >
                  {response.error
                    ? "ERROR"
                    : `${response.results.filter((r) => r.passed).length}/${response.results.length} PASSED${response.runtimeMs ? ` · ${response.runtimeMs}ms` : ""}`}
                </span>
              )}
            </div>
            <div className="p-3 font-mono text-xs space-y-1">
              {!response && (
                <p className="text-text-dim">
                  {state === "running"
                    ? "$ executing solution.js in sandbox..."
                    : "$ waiting for input — press SUBMIT to run tests"}
                </p>
              )}
              {response?.error && <p className="text-neon-magenta">✗ {response.error}</p>}
              {response?.results.map((r, i) => (
                <TestRow key={i} result={r} idx={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── RIGHT: Tabs — Boss / Explain ───────────────────────────── */}
        <aside className="border-l border-surface-2 bg-surface flex flex-col">
          {/* Tab switcher */}
          <div className="flex border-b border-surface-2">
            <button
              type="button"
              onClick={() => setRightTab("boss")}
              className={cn(
                "flex-1 px-4 py-2 text-xs font-hud tracking-widest uppercase transition-colors",
                rightTab === "boss"
                  ? "bg-surface-2 text-neon-magenta border-b-2 border-neon-magenta"
                  : "text-text-muted hover:text-text",
              )}
            >
              ► Boss
            </button>
            <button
              type="button"
              onClick={() => setRightTab("explain")}
              className={cn(
                "flex-1 px-4 py-2 text-xs font-hud tracking-widest uppercase transition-colors",
                rightTab === "explain"
                  ? "bg-surface-2 text-neon-cyan border-b-2 border-neon-cyan"
                  : "text-text-muted hover:text-text",
              )}
            >
              ► Explain
            </button>
          </div>

          {rightTab === "boss" ? (
            <div className="flex flex-col gap-3 p-3 flex-1">
              <BossPanel
                name={boss.name}
                imageSrc={boss.imageSrc}
                hp={bossHp}
                maxHp={BOSS_MAX_HP}
                className="flex-1 min-h-[400px]"
              />
              <PlayerHPBar hp={playerHp} max={PLAYER_MAX_HP} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3">
              <p className="text-text-muted text-xs font-hud tracking-widest uppercase mb-2 px-2">
                ► Line-by-line breakdown
              </p>
              <CodeExplanation code={code} explanations={challenge.explanations} />
            </div>
          )}
        </aside>
      </div>

      {/* Action bar */}
      <footer className="flex items-center justify-between border-t border-surface-2 bg-surface px-6 py-3">
        <span className="text-text-muted text-xs font-hud tracking-widest">
          {state === "running"
            ? "EXECUTING IN SANDBOX..."
            : attempts > 0
              ? `LAST: ${response?.passed ? "HIT" : "MISS"} · ATTEMPT ${attempts}`
              : "READY"}
        </span>
        <button
          type="button"
          disabled={state === "running"}
          onClick={handleSubmit}
          className="border border-neon-green px-10 py-2.5 text-neon-green text-sm tracking-widest uppercase font-bold hover:bg-neon-green hover:text-void disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {state === "running" ? "Running..." : "Submit ↵"}
        </button>
      </footer>
    </motion.main>
  );
}

// Local cn (avoid extra import in this file)
function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}
