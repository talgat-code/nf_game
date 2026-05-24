"use client";

import { useState } from "react";
import { Editor } from "@/components/game/Editor";
import { GlitchText } from "@/components/effects/GlitchText";
import type { ExecuteResponse, TestResult } from "@/lib/types";

const STARTER_CODE = `// Fix the bug: this function should return
// the sum of all numbers in the array.
function solution(nums) {
  let total = 0;
  for (let i = 0; i <= nums.length; i++) {
    total += nums[i];
  }
  return total;
}`;

const TEST_CASES = [
  { input: "[1, 2, 3]", expected: "6" },
  { input: "[0]", expected: "0" },
  { input: "[-1, 1]", expected: "0" },
  { input: "[10, 20, 30]", expected: "60" },
];

// Wraps the input string into the eval call so solution() receives the value
function prepareCode(raw: string): string {
  return raw.replace(
    /\{\s*input\s*:\s*"(\[.*?\])"/g,
    (_, arr) => `{ input: ${arr}`,
  );
}

type SubmitState = "idle" | "running" | "pass" | "fail" | "error";

function ResultBadge({ result }: { result: TestResult }) {
  return (
    <div
      className={`flex items-start gap-3 border p-3 text-xs font-mono ${
        result.passed
          ? "border-neon-green text-neon-green"
          : "border-neon-magenta text-neon-magenta"
      }`}
    >
      <span className="shrink-0">{result.passed ? "PASS" : "FAIL"}</span>
      <span className="text-text-muted">in={result.input}</span>
      <span>got={result.actual}</span>
      {!result.passed && (
        <span className="text-text-muted">want={result.expected}</span>
      )}
    </div>
  );
}

export default function PlayPage() {
  const [code, setCode] = useState(STARTER_CODE);
  const [state, setState] = useState<SubmitState>("idle");
  const [response, setResponse] = useState<ExecuteResponse | null>(null);

  async function handleSubmit() {
    setState("running");
    setResponse(null);

    try {
      const res = await fetch("/api/execute-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: "javascript",
          testCases: TEST_CASES,
        }),
      });

      const data: ExecuteResponse = await res.json();
      setResponse(data);
      setState(data.error ? "error" : data.passed ? "pass" : "fail");
    } catch {
      setState("error");
      setResponse({ passed: false, results: [], error: "Network error" });
    }
  }

  const statusColor = {
    idle: "text-text-muted",
    running: "text-neon-amber",
    pass: "text-neon-green",
    fail: "text-neon-magenta",
    error: "text-neon-magenta",
  }[state];

  return (
    <main className="flex min-h-screen flex-col gap-4 p-6">
      {/* Boss header */}
      <div className="flex items-center justify-between border-b border-text-dim pb-3">
        <GlitchText
          as="h1"
          text="NULL POINTER WRAITH"
          className="text-2xl text-neon-magenta text-glow-magenta"
        />
        <div className="flex items-center gap-4">
          <span className="text-text-muted text-xs font-hud tracking-widest">
            BOSS HP: ████████░░
          </span>
          <span className="text-neon-cyan text-xs font-hud tracking-widest">
            PLAYER HP: ██████████
          </span>
        </div>
      </div>

      {/* Challenge prompt */}
      <div className="border border-text-dim bg-surface p-4">
        <span className="text-neon-amber text-xs font-bold tracking-widest uppercase">
          Challenge ·{" "}
        </span>
        <span className="text-text text-sm">
          The array traversal is broken. Fix the off-by-one error before the
          Wraith corrupts your memory.
        </span>
      </div>

      {/* Editor */}
      <Editor
        value={code}
        onChange={setCode}
        language="javascript"
        className="flex-1 min-h-[320px]"
      />

      {/* Terminal output */}
      {response && (
        <div className="border border-text-dim bg-void p-4 space-y-2">
          <p className={`text-xs font-hud tracking-widest uppercase ${statusColor}`}>
            {state === "pass"
              ? `ALL TESTS PASSED · ${response.runtimeMs}ms`
              : state === "fail"
                ? "TESTS FAILED"
                : response.error}
          </p>
          <div className="space-y-1 mt-2">
            {response.results.map((r, i) => (
              <ResultBadge key={i} result={r} />
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-hud tracking-widest ${statusColor}`}>
          {state === "running" ? "EXECUTING..." : ""}
        </span>
        <button
          type="button"
          disabled={state === "running"}
          onClick={handleSubmit}
          className="border border-neon-green px-8 py-2 text-neon-green hover:bg-neon-green hover:text-void disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 tracking-widest uppercase text-sm"
        >
          {state === "running" ? "Running..." : "Submit Solution"}
        </button>
      </div>
    </main>
  );
}
