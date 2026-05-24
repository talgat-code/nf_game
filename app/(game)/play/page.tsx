"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Editor } from "@/components/game/Editor";
import { BossPanel } from "@/components/game/BossPanel";
import { GlitchText } from "@/components/effects/GlitchText";
import { runJsInSandbox } from "@/lib/js-runner";
import type { ExecuteResponse, TestResult } from "@/lib/types";

// ─── Challenge definition ─────────────────────────────────────────────────────
const CHALLENGE = {
  title: "ARRAY TRAVERSAL: NULL-PATCHED",
  prompt:
    "The Wraith has poisoned your loop bounds. The function should return the sum of all numbers in the array, but it overruns the end and reads garbage.",
  hint: "Look carefully at the loop condition. What's the last valid index of an array of length n?",
  starterCode: `// Fix the bug: return the sum of all numbers in the array.
function solution(nums) {
  let total = 0;
  for (let i = 0; i <= nums.length; i++) {
    total += nums[i];
  }
  return total;
}`,
  testCases: [
    { input: "[1, 2, 3]", expected: "6" },
    { input: "[0]", expected: "0" },
    { input: "[-1, 1]", expected: "0" },
    { input: "[10, 20, 30]", expected: "60" },
    { input: "[100]", expected: "100" },
  ],
};

const BOSS = { name: "NULL POINTER WRAITH", maxHp: 100, startHp: 100 };
const PLAYER_MAX_HP = 100;
const DAMAGE_ON_WRONG = 20;
const DAMAGE_ON_BOSS = 35;

type Phase = "fighting" | "won" | "lost";
type SubmitState = "idle" | "running";

// ─── Player HP bar ────────────────────────────────────────────────────────────
function PlayerHPBar({ hp, max }: { hp: number; max: number }) {
  const pct = Math.max(0, (hp / max) * 100);
  return (
    <div className="px-4 py-2 bg-surface border border-surface-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-text-muted text-xs font-hud tracking-widest uppercase">
          ► You
        </span>
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
      {!result.passed && (
        <span className="text-text-muted ml-auto">want={result.expected}</span>
      )}
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
  const [code, setCode] = useState(CHALLENGE.starterCode);
  const [state, setState] = useState<SubmitState>("idle");
  const [response, setResponse] = useState<ExecuteResponse | null>(null);
  const [bossHp, setBossHp] = useState(BOSS.startHp);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [phase, setPhase] = useState<Phase>("fighting");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  async function handleSubmit() {
    if (state === "running" || phase !== "fighting") return;
    setState("running");
    setResponse(null);

    const sandboxResult = await runJsInSandbox(code, CHALLENGE.testCases);
    const data: ExecuteResponse = {
      passed: sandboxResult.ok && sandboxResult.results.every((r) => r.passed),
      results: sandboxResult.results,
      error: sandboxResult.error,
      runtimeMs: sandboxResult.runtimeMs,
    };
    setResponse(data);
    setAttempts((a) => a + 1);

    if (data.passed) {
      const newBossHp = Math.max(0, bossHp - DAMAGE_ON_BOSS);
      setBossHp(newBossHp);
      if (newBossHp <= 0) {
        setTimeout(() => setPhase("won"), 2000);
      }
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
        <GlitchText as="h1" text="BOSS DEFEATED" className="text-5xl text-neon-green text-glow-green" />
        <p className="text-text text-sm tracking-widest">
          The Null Pointer Wraith collapses. Solved in{" "}
          <span className="text-neon-green">{attempts}</span> attempt{attempts !== 1 ? "s" : ""}.
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
      animate={
        screenShake
          ? { x: [0, -8, 10, -6, 4, 0] }
          : {}
      }
      transition={{ duration: 0.4 }}
      className="flex min-h-screen flex-col"
    >
      {/* HUD */}
      <header className="flex items-center justify-between border-b border-surface-2 bg-surface px-6 py-3">
        <GlitchText
          as="h1"
          text="CODE CRUSADERS"
          className="text-lg text-neon-cyan text-glow-cyan"
        />
        <div className="text-text-muted text-xs font-hud tracking-widest">
          ATTEMPT {attempts || 0} · {state === "running" ? "EXECUTING..." : phase.toUpperCase()}
        </div>
      </header>

      {/* Main: three-section grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_360px] gap-0 flex-1">
        {/* ── LEFT: Challenge info ────────────────────────────────────── */}
        <aside className="border-r border-surface-2 bg-surface flex flex-col">
          <div className="p-4 border-b border-surface-2">
            <p className="text-neon-amber text-xs font-hud tracking-widest uppercase">
              ► Challenge
            </p>
            <h2 className="text-neon-cyan text-base mt-1 font-bold tracking-wider">
              {CHALLENGE.title}
            </h2>
          </div>

          <div className="p-4 border-b border-surface-2">
            <p className="text-text text-sm leading-relaxed">{CHALLENGE.prompt}</p>
          </div>

          <div className="p-4 border-b border-surface-2">
            <p className="text-text-muted text-xs font-hud tracking-widest uppercase mb-2">
              ► Test cases ({CHALLENGE.testCases.length})
            </p>
            <div className="space-y-px bg-void border border-surface-2 py-2">
              {CHALLENGE.testCases.map((tc, i) => (
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
                💡 {CHALLENGE.hint}
              </p>
            )}
          </div>

          <div className="p-4 mt-auto">
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="text-text-muted">Damage / hit</div>
              <div className="text-neon-green font-hud text-right">+{DAMAGE_ON_BOSS}</div>
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
              {response?.error && (
                <p className="text-neon-magenta">✗ {response.error}</p>
              )}
              {response?.results.map((r, i) => (
                <TestRow key={i} result={r} idx={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── RIGHT: Boss panel + Player HP ───────────────────────────── */}
        <aside className="border-l border-surface-2 bg-surface flex flex-col gap-3 p-3">
          <BossPanel
            name={BOSS.name}
            hp={bossHp}
            maxHp={BOSS.maxHp}
            className="flex-1 min-h-[400px]"
          />
          <PlayerHPBar hp={playerHp} max={PLAYER_MAX_HP} />
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
