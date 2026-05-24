import type { TestCase } from "@/lib/types";

export interface ChallengeWithExplanation {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  starterCode: string;
  testCases: TestCase[];
  // Map from 1-based line number → human explanation
  explanations: Record<number, string>;
}

// ─── Null Pointer Wraith — 4 challenges, escalating ──────────────────────────
export const WRAITH_CHALLENGES: ChallengeWithExplanation[] = [
  {
    id: "off-by-one-sum",
    title: "ARRAY TRAVERSAL: NULL-PATCHED",
    prompt:
      "The Wraith poisoned your loop bounds. Return the sum of all numbers — but the loop reads past the end.",
    hint: "What's the last valid index of an array of length N?",
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
    explanations: {
      1: "Comment — describes the goal. No effect on execution.",
      2: "Function declaration. Takes one array param `nums`.",
      3: "Initialize accumulator to 0 — the sum will build up here.",
      4: "BUG: `<=` includes index `nums.length`, which is out of bounds. Should be `<`.",
      5: "Add the value at index `i` to the total. Adding `undefined` (when out of bounds) breaks the math.",
      6: "Close the loop block.",
      7: "Return the accumulated sum.",
      8: "Close the function.",
    },
  },
  {
    id: "null-safe-property",
    title: "NULL DEREFERENCE GUARD",
    prompt:
      "The Wraith nullified the input. Get the user's name safely — return 'anonymous' if the user object is null/undefined or has no name.",
    hint: "Optional chaining (?.) and the nullish coalescing operator (??) make this two characters.",
    starterCode: `// If user or user.name is missing, return 'anonymous'.
function solution(user) {
  return user.name;
}`,
    testCases: [
      { input: '{"name": "Neo"}', expected: "Neo" },
      { input: '{"name": "Trinity"}', expected: "Trinity" },
      { input: "null", expected: "anonymous" },
      { input: "{}", expected: "anonymous" },
      { input: '{"name": null}', expected: "anonymous" },
    ],
    explanations: {
      1: "Comment — null-safety requirement.",
      2: "Function takes one param `user` which may be null/undefined/empty.",
      3: "BUG: `user.name` crashes if `user` is null. Use `user?.name ?? 'anonymous'`.",
      4: "Close the function.",
    },
  },
  {
    id: "find-first-defined",
    title: "FIRST NON-NULL SCAN",
    prompt:
      "Return the first non-null, non-undefined value from an array. If everything is null, return 'EMPTY'.",
    hint: "Array.prototype.find() with a predicate that checks for non-null values.",
    starterCode: `// Return first value that isn't null or undefined.
function solution(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      return arr[i];
    }
  }
  return "EMPTY";
}`,
    testCases: [
      { input: '[null, null, "hello"]', expected: "hello" },
      { input: "[1, 2, 3]", expected: "1" },
      { input: "[null, null, null]", expected: "EMPTY" },
      { input: '[0, "first"]', expected: "first" },
      { input: '[false, "ok"]', expected: "ok" },
    ],
    explanations: {
      1: "Comment — scan for first defined value.",
      2: "Function takes an array of mixed values.",
      3: "Standard for-loop iterating each index.",
      4: "SUBTLE BUG: `if (arr[i])` is falsy for `0`, `false`, `''` — not just null. Use `arr[i] != null`.",
      5: "Return the first truthy value found (wrong predicate above).",
      6: "Close the if.",
      7: "Close the for loop.",
      8: "Fallback return when nothing matched.",
      9: "Close the function.",
    },
  },
  {
    id: "default-config",
    title: "CONFIG MERGE: ANTI-NULL",
    prompt:
      "Merge a partial config with defaults: { theme: 'dark', volume: 50 }. Missing/null fields use the defaults.",
    hint: "Object spread + nullish coalescing — preserve falsy zeros but discard nulls.",
    starterCode: `// Merge user config with defaults.
function solution(config) {
  const defaults = { theme: "dark", volume: 50 };
  return { ...defaults, ...config };
}`,
    testCases: [
      { input: '{"theme": "cyber"}', expected: '{"theme":"cyber","volume":50}' },
      { input: '{"volume": 0}', expected: '{"theme":"dark","volume":0}' },
      { input: '{"theme": null, "volume": 100}', expected: '{"theme":"dark","volume":100}' },
      { input: "{}", expected: '{"theme":"dark","volume":50}' },
      { input: '{"theme": null}', expected: '{"theme":"dark","volume":50}' },
    ],
    explanations: {
      1: "Comment — merge with defaults, respecting nulls.",
      2: "Function takes a partial config object.",
      3: "Define defaults for theme and volume.",
      4: "BUG: spread overrides defaults even when value is null. Manually pick each field with `?? defaults.x`.",
      5: "Close the function.",
    },
  },
];
