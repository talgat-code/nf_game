"use client";

import { useState } from "react";
import { Editor } from "@/components/game/Editor";
import { GlitchText } from "@/components/effects/GlitchText";
import type { ExecuteResponse } from "@/lib/types";

// ─── Challenge definition ─────────────────────────────────────────────────────
const CHALLENGE = {
  prompt:
    "The array traversal is corrupted. Fix the off-by-one error before the Wraith nullifies your variables.",
  starterCode: `// Fix the bug: this function should return
// the sum of all numbers in the array.
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
  ],
};

const BOSS = {
  name: "NULL POINTER WRAITH",
  maxHp: 100,
  startHp: 100,
};

const PLAYER_MAX_HP = 100;
const DAMAGE_ON_WRONG = 20;
const DAMAGE_ON_BOSS = 35;

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
      <span className="text-text-muted text-xs font-hud tracking-widest w-20 shrink-0">
        {label}
      </span>
      <div className="flex gap-px">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-3 w-4 transition-colors duration-300"
            style={{
              backgroundColor: i < blocks ? color : "#1a1a2e",
            }}
          />
        ))}
      </div>
      <span className="text-xs font-hud" style={{ color }}>
        {current}/{max}
      </span>
    </div>
  );
}

// ─── Test result row ──────────────────────────────────────────────────────────
function TestRow({
  result,
  idx,
}: {
  result: { input: string; expected: string; actual: string; passed: boolean };
  idx: number;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-3 py-2 text-xs font-mono border-l-2 ${
        result.passed
          ? "border-neon-green bg-neon-green/5 text-neon-green"
          : "border-neon-magenta bg-neon-magenta/5 text-neon-magenta"
      }`}
    >
      <span className="w-4 text-text-muted shrink-0">#{idx + 1}</span>
      <span className={result.passed ? "text-neon-green" : "text-neon-magenta"}>
        {result.passed ? "✓ PASS" : "✗ FAIL"}
      </span>
      <span className="text-text-muted">in={result.input}</span>
      <span className="text-text">got={result.actual || "undefined"}</span>
      {!result.passed && (
        <span className="text-text-muted ml-auto">want={result.expected}</span>
      )}
    </div>
  );
}

type Phase = "fighting" | "won" | "lost";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlayPage() {
  const [code, setCode] = useState(CHALLENGE.starterCode);
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<ExecuteResponse | null>(null);
  const [bossHp, setBossHp] = useState(BOSS.startHp);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [phase, setPhase] = useState<Phase>("fighting");
  const [attempts, setAttempts] = useState(0);
  const [lastResult, setLastResult] = useState<"pass" | "fail" | null>(null);

  async function handleSubmit() {
    if (running || phase !== "fighting") return;
    setRunning(true);
    setResponse(null);
    setLastResult(null);

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
        setLastResult("pass");
        const newBossHp = Math.max(0, bossHp - DAMAGE_ON_BOSS);
        setBossHp(newBossHp);
        if (newBossHp <= 0) setPhase("won");
      } else {
        setLastResult("fail");
        const newPlayerHp = Math.max(0, playerHp - DAMAGE_ON_WRONG);
        setPlayerHp(newPlayerHp);
        if (newPlayerHp <= 0) setPhase("lost");
      }
    } catch {
      setResponse({ passed: false, results: [], error: "Network error" });
    } finally {
      setRunning(false);
    }
  }

  // ── Win screen ──
  if (phase === "won") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <GlitchText
          as="h1"
          text="BOSS DEFEATED"
          className="text-5xl text-neon-green text-glow-green"
        />
        <p className="text-text text-sm tracking-widest">
          The Null Pointer Wraith has been vanquished. Dealt{" "}
          <span className="text-neon-green">{DAMAGE_ON_BOSS} dmg</span> in{" "}
          {attempts} attempt{attempts !== 1 ? "s" : ""}.
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

  // ── Game over screen ──
  if (phase === "lost") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
        <GlitchText
          as="h1"
          text="YOU DIED"
          className="text-5xl text-neon-magenta text-glow-magenta"
        />
        <p className="text-text-muted text-sm tracking-widest">
          The Null Pointer Wraith consumed your memory. Run ended.
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

  // ── Fight screen ──
  return (
    <main className="flex min-h-screen flex-col gap-0">
      {/* ── HUD ── */}
      <header className="flex items-center justify-between border-b border-surface-2 bg-surface px-6 py-3">
        <GlitchText
          as="h1"
          text={BOSS.name}
          className="text-xl text-neon-magenta text-glow-magenta"
        />
        <div className="flex flex-col gap-1 items-end">
          <HPBar
            label="BOSS HP"
            current={bossHp}
            max={BOSS.maxHp}
            color="#ff00aa"
          />
          <HPBar
            label="PLAYER HP"
            current={playerHp}
            max={PLAYER_MAX_HP}
            color="#00f0ff"
          />
        </div>
      </header>

      {/* ── Challenge prompt ── */}
      <div className="border-b border-surface-2 bg-surface-2 px-6 py-3">
        <p className="text-text text-sm leading-relaxed">
          <span className="text-neon-amber font-bold tracking-widest uppercase text-xs mr-2">
            Challenge ·
          </span>
          {CHALLENGE.prompt}
        </p>
        {attempts > 0 && lastResult && (
          <p
            className={`mt-1 text-xs font-hud tracking-widest ${
              lastResult === "pass" ? "text-neon-green" : "text-neon-magenta"
            }`}
          >
            {lastResult === "pass"
              ? `► HIT! Dealt ${DAMAGE_ON_BOSS} damage to the Wraith.`
              : `► MISS! The Wraith strikes back — ${DAMAGE_ON_WRONG} damage taken.`}
          </p>
        )}
      </div>

      {/* ── Editor + output ── */}
      <div className="flex flex-1 flex-col gap-0 min-h-0">
        <Editor
          value={code}
          onChange={setCode}
          language="javascript"
          className="flex-1 min-h-[300px]"
        />

        {/* Terminal output */}
        {response && (
          <div className="border-t border-surface-2 bg-surface max-h-48 overflow-y-auto">
            <div className="px-4 py-2 border-b border-surface-2">
              <span className="text-xs font-hud tracking-widest text-text-muted uppercase">
                Test Results ·{" "}
              </span>
              <span
                className={`text-xs font-hud tracking-widest ${
                  response.passed ? "text-neon-green" : "text-neon-magenta"
                }`}
              >
                {response.passed
                  ? `${response.results.length}/${response.results.length} PASSED · ${response.runtimeMs}ms`
                  : response.error
                    ? `ERROR: ${response.error}`
                    : `${response.results.filter((r) => r.passed).length}/${response.results.length} PASSED`}
              </span>
            </div>
            <div className="flex flex-col gap-px p-2">
              {response.results.map((r, i) => (
                <TestRow key={i} result={r} idx={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Action bar ── */}
      <footer className="flex items-center justify-between border-t border-surface-2 bg-surface px-6 py-3">
        <span className="text-text-muted text-xs font-hud tracking-widest">
          {running
            ? "EXECUTING..."
            : attempts > 0
              ? `ATTEMPT ${attempts}`
              : "WRITE YOUR SOLUTION"}
        </span>
        <button
          type="button"
          disabled={running}
          onClick={handleSubmit}
          className="border border-neon-green px-8 py-2 text-neon-green text-sm tracking-widest uppercase hover:bg-neon-green hover:text-void disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {running ? "Running..." : "Submit Solution"}
        </button>
      </footer>
    </main>
  );
}
