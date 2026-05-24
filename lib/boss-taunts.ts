export type TauntTrigger = "intro" | "miss" | "hit" | "lowHp" | "victory" | "defeat";

type TauntMap = Record<TauntTrigger, string[]>;

const NULL_POINTER_TAUNTS: TauntMap = {
  intro: [
    "Your variables tremble before me.",
    "I sense uninitialized memory. Delicious.",
    "Another stack to corrupt.",
  ],
  miss: [
    "Pathetic. Even null is more substantial than you.",
    "Is this all your weak references can muster?",
    "Your loop overruns. Your hope underruns.",
    "I've seen segfaults with more dignity.",
    "WRONG. Your variables shall be nullified.",
    "You call this code? I call it kindling.",
    "Hahaha. Read your test cases again.",
  ],
  hit: [
    "Lucky guess.",
    "...interesting.",
    "You patch one leak, ten more await.",
    "Don't get cocky, junior.",
  ],
  lowHp: [
    "NO! My pointers... they dangle!",
    "Impossible. You're just a script kiddie!",
    "I will not be deprecated by you!",
  ],
  victory: [
    "How... a clean compile...",
    "My references... all null... goodbye...",
    "You haven't seen the last of me. I'll return... in production.",
  ],
  defeat: [
    "Your memory is mine. Forever.",
    "Another stack trace for my collection.",
    "Git commit your soul. The repo is closed.",
  ],
};

const MEMORY_LEAK_TAUNTS: TauntMap = {
  intro: [
    "Your heap is leaking already.",
    "I smell uncleaned event listeners.",
    "Welcome. Stay forever. (You will.)",
  ],
  miss: [
    "Another wasted allocation. Yum.",
    "GC can't save you now.",
    "Your goroutines spawn unchecked.",
    "Channels closed without `defer`. Tragic.",
    "Did you forget to `unsubscribe()` again?",
    "Your RAM is mine. Your CPU is mine. Your HEAD too.",
    "Mistake. Logged. Repeated.",
  ],
  hit: [
    "Hmph. A clean close.",
    "One leak patched. A thousand remain.",
    "You learn... slowly.",
  ],
  lowHp: [
    "My pools drain... my memory fragments...",
    "You... you free everything?!",
    "Stop touching my allocations!",
  ],
  victory: [
    "All my references... released...",
    "I deallocate. Forever.",
    "Tell the others... about the GC...",
  ],
  defeat: [
    "Your process is mine.",
    "OOM. Killer. Activated.",
    "Memory exhausted. Including yours.",
  ],
};

const EXCEPTION_KING_TAUNTS: TauntMap = {
  intro: [
    "You call it a bug. I call it... a feature.",
    "Bow before the RUNTIME_ERROR.",
    "Your try block ends here. The catch will not save you.",
  ],
  miss: [
    "WRONG. Stack overflow imminent.",
    "Panic! at the Disco. I mean, your runtime.",
    "Your Option is None. Forever.",
    "Result<T, YOU_LOSE>",
    "Hahaha! Another unwrap() on None!",
    "Did your borrow checker even read this?",
    "SEGFAULT. Just the way I like it.",
  ],
  hit: [
    "Hmph. A typed result.",
    "You handle one exception. I throw a thousand more.",
    "Even broken clocks compile twice a day.",
  ],
  lowHp: [
    "MY RECURSION... IT TERMINATES?!",
    "You're using iteration?! UNFAIR!",
    "I will not be borrow-checked!",
  ],
  victory: [
    "...all my errors handled...",
    "I panic. For real this time.",
    "Tell the Wraith... I'm sorry I doubted...",
  ],
  defeat: [
    "Your stack belongs to me.",
    "Unrecoverable. Game over.",
    "Throw new Defeat(player);",
  ],
};

const BOSS_TAUNTS: Record<string, TauntMap> = {
  "null-pointer-wraith": NULL_POINTER_TAUNTS,
  "memory-leak-demon": MEMORY_LEAK_TAUNTS,
  "exception-king": EXCEPTION_KING_TAUNTS,
};

export function pickTaunt(bossId: string, trigger: TauntTrigger): string | null {
  const taunts = BOSS_TAUNTS[bossId]?.[trigger];
  if (!taunts || taunts.length === 0) return null;
  return taunts[Math.floor(Math.random() * taunts.length)];
}
