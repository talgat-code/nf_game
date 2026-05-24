"use client";

import { useState } from "react";
import { Editor } from "@/components/game/Editor";
import { GlitchText } from "@/components/effects/GlitchText";

const STARTER_CODE = `// Fix the bug: this function should return
// the sum of all numbers in the array.
function sumArray(nums: number[]): number {
  let total = 0;
  for (let i = 0; i <= nums.length; i++) {
    total += nums[i];
  }
  return total;
}`;

export default function PlayPage() {
  const [code, setCode] = useState(STARTER_CODE);

  return (
    <main className="flex min-h-screen flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <GlitchText as="h1" text="NULL POINTER WRAITH" className="text-2xl text-neon-magenta text-glow-magenta" />
        <span className="text-text-muted text-xs font-hud tracking-widest">HP: ████████░░ 80%</span>
      </div>

      <p className="text-text text-sm border border-text-dim p-4 bg-surface">
        <span className="text-neon-amber font-bold">CHALLENGE: </span>
        The array traversal is broken. Fix the off-by-one error before the Wraith corrupts your memory.
      </p>

      <Editor
        value={code}
        onChange={setCode}
        language="typescript"
        className="flex-1 min-h-[400px]"
      />

      <button
        type="button"
        className="self-end border border-neon-green px-8 py-2 text-neon-green hover:bg-neon-green hover:text-void transition-colors duration-200 tracking-widest uppercase text-sm"
      >
        Submit Solution
      </button>
    </main>
  );
}
