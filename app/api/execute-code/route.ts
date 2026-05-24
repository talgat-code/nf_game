import { type NextRequest, NextResponse } from "next/server";
import { runCode } from "@/lib/piston";
import type { ExecuteRequest, ExecuteResponse, Language } from "@/lib/types";

// ─── Simple in-memory rate limiter (per IP, resets on cold start) ─────────────
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const ipMap = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    ipMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// ─── Validation ───────────────────────────────────────────────────────────────
const ALLOWED_LANGUAGES = new Set<Language>([
  "javascript",
  "typescript",
  "python",
  "go",
  "rust",
]);

function validate(body: unknown): body is ExecuteRequest {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.code === "string" &&
    b.code.length > 0 &&
    b.code.length < 10_000 &&
    ALLOWED_LANGUAGES.has(b.language as Language) &&
    Array.isArray(b.testCases) &&
    b.testCases.length > 0 &&
    b.testCases.length <= 10
  );
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse<ExecuteResponse>> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { passed: false, results: [], error: "Rate limit exceeded. Wait 60s." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { passed: false, results: [], error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!validate(body)) {
    return NextResponse.json(
      { passed: false, results: [], error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const result = await runCode(body.code, body.language, body.testCases);
    return NextResponse.json({
      passed: result.passed,
      results: result.results,
      error: result.error,
      runtimeMs: result.runtimeMs,
    });
  } catch (err) {
    console.error("[execute-code]", err);
    return NextResponse.json(
      { passed: false, results: [], error: "Execution failed" },
      { status: 500 },
    );
  }
}
