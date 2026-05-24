// ─── Challenge types ──────────────────────────────────────────────────────────

export type Language = "javascript" | "typescript" | "python" | "go" | "rust";

export interface TestCase {
  input: string;
  expected: string;
}

export interface Challenge {
  id: string;
  prompt: string;
  starterCode: string;
  testCases: TestCase[];
  hint: string;
  language: Language;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedSeconds: number;
}

// ─── Execution types ──────────────────────────────────────────────────────────

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface ExecuteRequest {
  code: string;
  language: Language;
  testCases: TestCase[];
}

export interface ExecuteResponse {
  passed: boolean;
  results: TestResult[];
  error?: string;
  runtimeMs?: number;
}

// ─── Game types ───────────────────────────────────────────────────────────────

export type ClassId =
  | "frontend-mage"
  | "backend-paladin"
  | "systems-berserker"
  | "data-sorcerer"
  | "fullstack-bard";

export type BossId =
  | "null-pointer-wraith"
  | "callback-hell-hydra"
  | "memory-leak-demon"
  | "off-by-one-goblin"
  | "regex-behemoth"
  | "recursion-lich"
  | "race-condition-specter"
  | "legacy-codebase";

export type DebuffId =
  | "bug-spawn"
  | "terminal-corruption"
  | "deleted-lines"
  | "stack-overflow"
  | "null-pointer-curse";

export interface ActiveDebuff {
  id: DebuffId;
  appliedAt: number;
}
