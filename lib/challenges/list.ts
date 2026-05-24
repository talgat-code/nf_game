import type { ClassId, TestCase } from "@/lib/types";

export interface ChallengeWithExplanation {
  id: string;
  title: string;
  prompt: string;
  hint: string;
  starterCode: string;
  testCases: TestCase[];
  /** Map from 1-based line number → human explanation. Mark bug lines with the word "BUG". */
  explanations: Record<number, string>;
}

export interface BossDef {
  id: string;
  name: string;
  tagline: string;
  imageSrc: string;
  /** Cosmetic language label shown in UI. All execution is JavaScript in Web Worker. */
  languageLabel: string;
  /** Which player class this boss is fought by. */
  classId: ClassId;
  challenges: ChallengeWithExplanation[];
}

// ─── 1. NULL POINTER WRAITH — Frontend Mage (JavaScript / null-safety) ───────
const WRAITH_CHALLENGES: ChallengeWithExplanation[] = [
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
      1: "Comment — describes the goal.",
      2: "Function takes one array param `nums`.",
      3: "Initialize accumulator to 0.",
      4: "BUG: `<=` includes index `nums.length`, which is out of bounds. Should be `<`.",
      5: "Add the value at index `i` to the total. Adding `undefined` breaks the math.",
      6: "Close the loop block.",
      7: "Return the accumulated sum.",
      8: "Close the function.",
    },
  },
  {
    id: "null-safe-property",
    title: "NULL DEREFERENCE GUARD",
    prompt:
      "The Wraith nullified the input. Get the user's name safely — return 'anonymous' if user is null/undefined or has no name.",
    hint: "Optional chaining (?.) and nullish coalescing (??) make this two characters.",
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
      2: "Function takes a `user` that may be null/undefined/empty.",
      3: "BUG: `user.name` crashes when `user` is null. Use `user?.name ?? 'anonymous'`.",
      4: "Close the function.",
    },
  },
  {
    id: "find-first-defined",
    title: "FIRST NON-NULL SCAN",
    prompt:
      "Return the first non-null, non-undefined value from an array. If everything is null, return 'EMPTY'.",
    hint: "Don't confuse falsy (0, '', false) with null/undefined.",
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
      { input: '[0, "first"]', expected: "0" },
      { input: '[false, "ok"]', expected: "false" },
    ],
    explanations: {
      1: "Comment — scan for first defined value.",
      2: "Function takes an array of mixed values.",
      3: "Standard for-loop iterating each index.",
      4: "BUG: `if (arr[i])` is falsy for 0, false, ''. Use `arr[i] != null` instead.",
      5: "Return the first matching value.",
      6: "Close the if.",
      7: "Close the for loop.",
      8: "Fallback return when nothing matched.",
      9: "Close the function.",
    },
  },
];

// ─── 2. MEMORY LEAK DEMON — Backend Paladin (Go-themed JS) ──────────────────
const DEMON_CHALLENGES: ChallengeWithExplanation[] = [
  {
    id: "cleanup-listeners",
    title: "RESOURCE LEAK: UNCLOSED CHANNEL",
    prompt:
      "Server processes events. Each event must increment a counter, but the handler accumulates state forever. Return the count after processing — and DO NOT leak between calls.",
    hint: "Don't store state in module scope. Initialize fresh inside the function.",
    starterCode: `// Process all events and return the count.
// HINT: solution is called multiple times — must not leak state.
let _count = 0;
function solution(events) {
  for (const e of events) {
    _count++;
  }
  return _count;
}`,
    testCases: [
      { input: '["a", "b", "c"]', expected: "3" },
      { input: "[]", expected: "0" },
      { input: '["x"]', expected: "1" },
      { input: '["1", "2"]', expected: "2" },
      { input: '["a", "b", "c", "d", "e"]', expected: "5" },
    ],
    explanations: {
      1: "Comment — describes the requirement.",
      2: "Comment — warns about the leak hazard.",
      3: "BUG: `_count` lives in module scope. Calls accumulate. Move it inside `solution`.",
      4: "Function takes events array.",
      5: "Iterate events.",
      6: "Increment the global counter (leaks).",
      7: "Close the loop.",
      8: "Return the (corrupted) counter.",
      9: "Close the function.",
    },
  },
  {
    id: "json-unmarshal",
    title: "JSON UNMARSHAL: ERROR PROPAGATION",
    prompt:
      "Parse incoming JSON. Return the value of the 'status' field. If JSON is malformed, return 'ERR'.",
    hint: "try/catch around JSON.parse — like Go's `err := json.Unmarshal(...)` pattern.",
    starterCode: `// Parse JSON, return status field or 'ERR' on parse failure.
function solution(raw) {
  const data = JSON.parse(raw);
  return data.status;
}`,
    testCases: [
      { input: '"{\\"status\\":\\"ok\\"}"', expected: "ok" },
      { input: '"{\\"status\\":\\"500\\"}"', expected: "500" },
      { input: '"not json"', expected: "ERR" },
      { input: '"{broken"', expected: "ERR" },
      { input: '"{}"', expected: "undefined" },
    ],
    explanations: {
      1: "Comment — JSON parse with error handling.",
      2: "Function takes raw JSON string.",
      3: "BUG: `JSON.parse` throws on invalid input. Wrap in try/catch and return 'ERR' on failure.",
      4: "Return the status field.",
      5: "Close the function.",
    },
  },
  {
    id: "groupby-aggregation",
    title: "GROUP BY: COUNT REQUESTS PER USER",
    prompt:
      "Count how many requests each user made. Input is array of {user, path}. Return JSON-stringified object {userId: count}.",
    hint: "Object literal as a map. JSON.stringify the result for matching.",
    starterCode: `// Count requests per user. Return JSON of {userId: count}.
function solution(requests) {
  const counts = {};
  for (const req of requests) {
    counts[req.user]++;
  }
  return JSON.stringify(counts);
}`,
    testCases: [
      {
        input: '[{"user":"a","path":"/"},{"user":"b","path":"/"},{"user":"a","path":"/x"}]',
        expected: '{"a":2,"b":1}',
      },
      { input: "[]", expected: "{}" },
      {
        input: '[{"user":"x","path":"/1"}]',
        expected: '{"x":1}',
      },
      {
        input: '[{"user":"a","path":"/"},{"user":"a","path":"/"}]',
        expected: '{"a":2}',
      },
      {
        input: '[{"user":"x"},{"user":"y"},{"user":"x"}]',
        expected: '{"x":2,"y":1}',
      },
    ],
    explanations: {
      1: "Comment — describes aggregation goal.",
      2: "Function takes requests array.",
      3: "Initialize empty counts map.",
      4: "Iterate each request.",
      5: "BUG: `counts[req.user]` is `undefined` on first hit. `undefined++` → NaN. Use `(counts[req.user] || 0) + 1`.",
      6: "Close the loop.",
      7: "Stringify for matching against expected.",
      8: "Close the function.",
    },
  },
];

// ─── 3. STACK OVERFLOW // EXCEPTION KING — Systems Berserker (Rust-themed) ──
const KING_CHALLENGES: ChallengeWithExplanation[] = [
  {
    id: "safe-divide",
    title: "RESULT<T,E>: SAFE DIVIDE",
    prompt:
      "Divide a by b. Return the quotient as a string. If b is zero, return 'DIV_BY_ZERO' instead of crashing or returning Infinity.",
    hint: "Rust would force you to handle Result<T, E>. JavaScript silently returns Infinity — guard explicitly.",
    starterCode: `// Safe divide. Return 'DIV_BY_ZERO' when b === 0.
function solution(input) {
  const [a, b] = input;
  return String(a / b);
}`,
    testCases: [
      { input: "[10, 2]", expected: "5" },
      { input: "[7, 0]", expected: "DIV_BY_ZERO" },
      { input: "[0, 5]", expected: "0" },
      { input: "[100, 4]", expected: "25" },
      { input: "[-12, 3]", expected: "-4" },
    ],
    explanations: {
      1: "Comment — safe division contract.",
      2: "Function takes [a, b] tuple.",
      3: "Destructure.",
      4: "BUG: `a / 0` is `Infinity`, not an error. Check `b === 0` before division.",
      5: "Close the function.",
    },
  },
  {
    id: "iterative-factorial",
    title: "STACK CRUSH: ITERATIVE FACTORIAL",
    prompt:
      "Compute factorial of N. The King's recursion blows your stack for N > 10000. Convert to an iterative loop.",
    hint: "A for-loop multiplying 1..N avoids the stack entirely.",
    starterCode: `// Compute N! without recursion (King induces stack overflow at depth > 10k).
function solution(n) {
  if (n <= 1) return "1";
  return String(n * Number(solution(n - 1)));
}`,
    testCases: [
      { input: "5", expected: "120" },
      { input: "1", expected: "1" },
      { input: "0", expected: "1" },
      { input: "6", expected: "720" },
      { input: "10", expected: "3628800" },
    ],
    explanations: {
      1: "Comment — stack-safety constraint.",
      2: "Function takes a non-negative integer.",
      3: "Base case for 0 and 1.",
      4: "BUG: Recursive call eats stack frames. Replace with `let r = 1; for (let i = 2; i <= n; i++) r *= i; return String(r);`",
      5: "Close the function.",
    },
  },
  {
    id: "bitwise-popcount",
    title: "BITWISE: POPULATION COUNT",
    prompt:
      "Return how many 1-bits are set in a 32-bit unsigned integer. The King wants raw bit math — no `.toString(2).match()` tricks.",
    hint: "Loop while n > 0: count += n & 1; n >>>= 1;",
    starterCode: `// Count number of 1-bits in n.
function solution(n) {
  return String(n.toString(2).split("0").join("").length);
}`,
    testCases: [
      { input: "0", expected: "0" },
      { input: "1", expected: "1" },
      { input: "7", expected: "3" },
      { input: "255", expected: "8" },
      { input: "1024", expected: "1" },
    ],
    explanations: {
      1: "Comment — pure bit count.",
      2: "Function takes an integer.",
      3: "BUG: String-based count works for the tests but defeats the lesson. Use a bit loop: `let c=0; while(n){c += n&1; n>>>=1;} return String(c);`",
      4: "Close the function.",
    },
  },
];

// ─── Boss registry ────────────────────────────────────────────────────────────
export const BOSS_REGISTRY: Record<string, BossDef> = {
  "null-pointer-wraith": {
    id: "null-pointer-wraith",
    name: "NULL POINTER WRAITH",
    tagline: "Nullifies your variables on miss.",
    imageSrc: "/sprites/null-pointer-wraith.png",
    languageLabel: "JAVASCRIPT",
    classId: "frontend-mage",
    challenges: WRAITH_CHALLENGES,
  },
  "memory-leak-demon": {
    id: "memory-leak-demon",
    name: "MEMORY LEAK DEMON",
    tagline: "Bloats your heap with every miss.",
    imageSrc: "/sprites/memory-leak-demon.png",
    languageLabel: "GO-FLAVORED JS",
    classId: "backend-paladin",
    challenges: DEMON_CHALLENGES,
  },
  "exception-king": {
    id: "exception-king",
    name: "STACK OVERFLOW // EXCEPTION KING",
    tagline: "Born from infinite recursion and unhandled errors.",
    imageSrc: "/sprites/exception-king.png",
    languageLabel: "RUST-FLAVORED JS",
    classId: "systems-berserker",
    challenges: KING_CHALLENGES,
  },
};

// Class → boss for the first encounter
export const CLASS_TO_FIRST_BOSS: Record<ClassId, string> = {
  "frontend-mage": "null-pointer-wraith",
  "backend-paladin": "memory-leak-demon",
  "systems-berserker": "exception-king",
  "data-sorcerer": "null-pointer-wraith",
  "fullstack-bard": "null-pointer-wraith",
};

export function getBossForClass(classId: string | null): BossDef {
  if (classId && classId in CLASS_TO_FIRST_BOSS) {
    const bossId = CLASS_TO_FIRST_BOSS[classId as ClassId];
    return BOSS_REGISTRY[bossId];
  }
  return BOSS_REGISTRY["null-pointer-wraith"];
}

// Back-compat export (referenced elsewhere)
export { WRAITH_CHALLENGES };
