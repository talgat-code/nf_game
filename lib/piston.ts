import type { Language, TestCase, TestResult } from "./types";

const PISTON_URL =
  process.env.PISTON_API_URL ?? "https://emkc.org/api/v2/piston";

const PISTON_LANGUAGE_MAP: Record<Language, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.50.0" },
};

// Wraps user code with a minimal test harness per language.
function buildTestHarness(code: string, language: Language, testCases: TestCase[]): string {
  const cases = JSON.stringify(testCases);

  if (language === "python") {
    return `
${code}

import json, sys

_cases = ${cases}
_passed = 0
for _tc in _cases:
    try:
        _result = str(solution(_tc["input"]))
        _ok = _result.strip() == str(_tc["expected"]).strip()
        if _ok:
            _passed += 1
        print(f"{'PASS' if _ok else 'FAIL'}:{_tc['expected']}:{_result}")
    except Exception as e:
        print(f"FAIL:{_tc['expected']}:ERROR:{e}")
print(f"SCORE:{_passed}/{len(_cases)}")
`.trim();
  }

  if (language === "go") {
    return `
package main

import (
  "encoding/json"
  "fmt"
)

${code}

func main() {
  cases := ${cases}
  passed := 0
  for _, tc := range cases {
    result := fmt.Sprintf("%v", solution(tc["input"]))
    ok := result == tc["expected"]
    if ok { passed++ }
    status := "FAIL"
    if ok { status = "PASS" }
    fmt.Printf("%s:%s:%s\\n", status, tc["expected"], result)
  }
  fmt.Printf("SCORE:%d/%d\\n", passed, len(cases))
}
`.trim();
  }

  // JavaScript / TypeScript (Piston compiles TS → JS via ts-node)
  return `
${code}

const _cases = ${cases};
let _passed = 0;
for (const _tc of _cases) {
  try {
    const _result = String(solution(_tc.input));
    const _ok = _result.trim() === String(_tc.expected).trim();
    if (_ok) _passed++;
    console.log((_ok ? "PASS" : "FAIL") + ":" + _tc.expected + ":" + _result);
  } catch (e) {
    console.log("FAIL:" + _tc.expected + ":ERROR:" + e.message);
  }
}
console.log("SCORE:" + _passed + "/" + _cases.length);
`.trim();
}

function parseOutput(stdout: string, testCases: TestCase[]): TestResult[] {
  const lines = stdout.split("\n").filter(Boolean);
  return testCases.map((tc, i) => {
    const line = lines[i] ?? "";
    const [status, , actual] = line.split(":");
    return {
      input: tc.input,
      expected: tc.expected,
      actual: actual ?? "",
      passed: status === "PASS",
    };
  });
}

export interface PistonResult {
  results: TestResult[];
  passed: boolean;
  error?: string;
  runtimeMs?: number;
}

export async function runCode(
  code: string,
  language: Language,
  testCases: TestCase[],
): Promise<PistonResult> {
  const lang = PISTON_LANGUAGE_MAP[language];
  const harness = buildTestHarness(code, language, testCases);
  const ext = language === "python" ? "py" : language === "go" ? "go" : "js";

  const start = Date.now();

  const res = await fetch(`${PISTON_URL}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: lang.language,
      version: lang.version,
      files: [{ name: `solution.${ext}`, content: harness }],
      run_timeout: 5000,
      compile_timeout: 10000,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    return { results: [], passed: false, error: `Piston error: ${res.status}` };
  }

  const data = (await res.json()) as {
    run: { stdout: string; stderr: string; code: number };
    compile?: { stderr: string; code: number };
  };

  const runtimeMs = Date.now() - start;

  if (data.compile && data.compile.code !== 0) {
    return { results: [], passed: false, error: data.compile.stderr, runtimeMs };
  }

  if (data.run.code !== 0 && !data.run.stdout) {
    return { results: [], passed: false, error: data.run.stderr, runtimeMs };
  }

  const results = parseOutput(data.run.stdout, testCases);
  const passed = results.every((r) => r.passed);

  return { results, passed, runtimeMs };
}
