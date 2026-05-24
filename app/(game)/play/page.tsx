"use client";

import { useState } from "react";
import { Editor } from "@/components/game/Editor";
import { GlitchText } from "@/components/effects/GlitchText";
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

// ─── HP bar ───────────────────────────────────────────────────────────────────
function HPBar({
  current,
  max,
  color,
  label,
}: {
  current: number;
  max: number;
  color: string;
  label: string;
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const blocks = Math.round(pct / 10);
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-muted text-xs font-hud tracking-widest w-24 shrink-0">
        {label}
      </span>
      <div className="flex gap-px border border-surface-2 p-px">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-3 w-4 transition-colors duration-300"
            style={{ backgroundColor: i < blocks ? color : "#353560" }}
          />
        ))}
      </div>
      <span className="text-sm font-hud tabular-nums w-16" style={{ color }}>
        {current}/{max}
      </span>
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

// ─── Test case preview (before submit) ────────────────────────────────────────
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

  async function handleSubmit() {
    if (state === "running" || phase !== "fighting") return;
    setState("running");
    setResponse(null);

    try {
      const res = await fetch("/api/execute-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: "javascript",
          testCases: CHALLENGE.testCases,
        }),
      });
      const data: ExecuteResponse = await res.json();
      setResponse(data);
      setAttempts((a) => a + 1);

      if (data.passed) {
        const newBossHp = Math.max(0, bossHp - DAMAGE_ON_BOSS);
        setBossHp(newBossHp);
        if (newBossHp <= 0) setPhase("won");
      } else {
        const newPlayerHp = Math.max(0, playerHp - DAMAGE_ON_WRONG);
        setPlayerHp(newPlayerHp);
        if (newPlayerHp <= 0) setPhase("lost");
      }
    } catch {
      setResponse({ passed: false, results: [], error: "Network error" });
    } finally {
      setState("idle");
    }
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

  // ─── Game over screen ───────────────────────────────────────────────────────
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
    <main className="flex min-h-screen flex-col">
      {/* HUD */}
      <header className="flex items-center justify-between border-b border-surface-2 bg-surface px-6 py-3">
        <GlitchText
          as="h1"
          text={BOSS.name}
          className="text-xl text-neon-magenta text-glow-magenta"
        />
        <div className="flex flex-col gap-1 items-end">
          <HPBar label="BOSS HP" current={bossHp} max={BOSS.maxHp} color="#ff3dbb" />
          <HPBar label="PLAYER HP" current={playerHp} max={PLAYER_MAX_HP} color="#00f0ff" />
        </div>
      </header>

      {/* Main: two columns (left = challenge info, right = editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-0 flex-1">
        {/* ── Left: challenge info panel ───────────────────────────────── */}
        <aside className="border-r border-surface-2 bg-surface flex flex-col">
          <div className="p-5 border-b border-surface-2">
            <p className="text-neon-amber text-xs font-hud tracking-widest uppercase">
              ► Challenge
            </p>
            <h2 className="text-neon-cyan text-lg mt-1 font-bold tracking-wider">
              {CHALLENGE.title}
            </h2>
          </div>

          <div className="p-5 border-b border-surface-2">
            <p className="text-text text-sm leading-relaxed">{CHALLENGE.prompt}</p>
          </div>

          <div className="p-5 border-b border-surface-2">
            <p className="text-text-muted text-xs font-hud tracking-widest uppercase mb-2">
              ► Test cases ({CHALLENGE.testCases.length})
            </p>
            <div className="space-y-px bg-void border border-surface-2 py-2">
              {CHALLENGE.testCases.map((tc, i) => (
                <TestPreview key={i} tc={tc} idx={i} />
              ))}
            </div>
          </div>

          <div className="p-5 border-b border-surface-2">
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

          <div className="p-5 mt-auto">
            <p className="text-text-dim text-xs font-hud tracking-widest uppercase">
              ► Stats
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="text-text-muted">Attempts</div>
              <div className="text-neon-cyan font-hud text-right">{attempts}</div>
              <div className="text-text-muted">Damage / hit</div>
              <div className="text-neon-green font-hud text-right">{DAMAGE_ON_BOSS}</div>
              <div className="text-text-muted">Penalty / miss</div>
              <div className="text-neon-magenta font-hud text-right">−{DAMAGE_ON_WRONG}</div>
            </div>
          </div>
        </aside>

        {/* ── Right: editor + terminal ─────────────────────────────────── */}
        <section className="flex flex-col bg-void min-w-0">
          {/* Editor */}
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

          {/* Terminal */}
          <div className="flex-1 bg-void min-h-[200px]">
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
                    ? `ERROR`
                    : `${response.results.filter((r) => r.passed).length}/${response.results.length} PASSED${response.runtimeMs ? ` · ${response.runtimeMs}ms` : ""}`}
                </span>
              )}
            </div>
            <div className="p-3 font-mono text-xs space-y-1">
              {!response && (
                <p className="text-text-dim">
                  {state === "running"
                    ? "$ executing solution.js..."
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
    </main>
  );
}
