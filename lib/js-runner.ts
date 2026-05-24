import type { TestCase, TestResult } from "./types";

// Browser-side JavaScript sandbox using a Web Worker.
// Workers have no DOM access; communication only via postMessage.
// Used for JS challenges since Piston public API is unreliable from Vercel.

const WORKER_TIMEOUT_MS = 5000;

const WORKER_SOURCE = `
self.addEventListener('message', (e) => {
  const { code, testCases } = e.data;
  const start = performance.now();

  let solution;
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(code + '\\n; return typeof solution !== "undefined" ? solution : null;');
    solution = fn();
    if (typeof solution !== 'function') {
      throw new Error('No function named "solution" found. Define: function solution(input) { ... }');
    }
  } catch (err) {
    self.postMessage({
      ok: false,
      error: 'Syntax / setup error: ' + (err && err.message ? err.message : String(err)),
      results: [],
    });
    return;
  }

  const results = testCases.map((tc) => {
    try {
      const input = JSON.parse(tc.input);
      const value = solution(input);
      const actual = value === undefined ? 'undefined'
        : value === null ? 'null'
        : typeof value === 'object' ? JSON.stringify(value)
        : String(value);
      return {
        input: tc.input,
        expected: tc.expected,
        actual,
        passed: actual.trim() === String(tc.expected).trim(),
      };
    } catch (err) {
      return {
        input: tc.input,
        expected: tc.expected,
        actual: 'ERROR: ' + (err && err.message ? err.message : String(err)),
        passed: false,
      };
    }
  });

  self.postMessage({
    ok: true,
    results,
    runtimeMs: Math.round(performance.now() - start),
  });
});
`;

interface SandboxResult {
  ok: boolean;
  results: TestResult[];
  runtimeMs?: number;
  error?: string;
}

export function runJsInSandbox(
  code: string,
  testCases: TestCase[],
): Promise<SandboxResult> {
  return new Promise((resolve) => {
    let worker: Worker | null = null;
    let blobUrl: string | null = null;

    try {
      const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
      blobUrl = URL.createObjectURL(blob);
      worker = new Worker(blobUrl);
    } catch (err) {
      resolve({
        ok: false,
        results: [],
        error: `Sandbox unavailable: ${err instanceof Error ? err.message : String(err)}`,
      });
      return;
    }

    const cleanup = () => {
      worker?.terminate();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve({
        ok: false,
        results: [],
        error: `Execution timed out (${WORKER_TIMEOUT_MS}ms) — infinite loop?`,
      });
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (ev: MessageEvent<SandboxResult>) => {
      clearTimeout(timer);
      cleanup();
      resolve(ev.data);
    };

    worker.onerror = (ev) => {
      clearTimeout(timer);
      cleanup();
      resolve({
        ok: false,
        results: [],
        error: `Worker error: ${ev.message}`,
      });
    };

    worker.postMessage({ code, testCases });
  });
}
