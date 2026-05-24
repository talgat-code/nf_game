// Per-user stats stored in localStorage. Keyed by username.

const STATS_PREFIX = "cc_stats_v1__";

export interface UserStats {
  totalSubmits: number;
  totalCorrect: number;
  totalWrong: number;
  challengesCleared: number;
  bossesDefeated: string[]; // boss ids
  runsStarted: number;
  runsWon: number;
  runsLost: number;
  classesPlayed: string[];
  createdAt: number;
  lastPlayed: number;
}

function emptyStats(): UserStats {
  return {
    totalSubmits: 0,
    totalCorrect: 0,
    totalWrong: 0,
    challengesCleared: 0,
    bossesDefeated: [],
    runsStarted: 0,
    runsWon: 0,
    runsLost: 0,
    classesPlayed: [],
    createdAt: Date.now(),
    lastPlayed: Date.now(),
  };
}

export function getStats(username: string): UserStats {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = localStorage.getItem(STATS_PREFIX + username);
    return raw ? { ...emptyStats(), ...JSON.parse(raw) } : emptyStats();
  } catch {
    return emptyStats();
  }
}

function saveStats(username: string, stats: UserStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_PREFIX + username, JSON.stringify(stats));
}

function update(username: string, fn: (s: UserStats) => UserStats) {
  const current = getStats(username);
  const next = fn(current);
  next.lastPlayed = Date.now();
  saveStats(username, next);
}

export function recordSubmit(username: string, passed: boolean) {
  update(username, (s) => ({
    ...s,
    totalSubmits: s.totalSubmits + 1,
    totalCorrect: passed ? s.totalCorrect + 1 : s.totalCorrect,
    totalWrong: passed ? s.totalWrong : s.totalWrong + 1,
    challengesCleared: passed ? s.challengesCleared + 1 : s.challengesCleared,
  }));
}

export function recordRunStart(username: string, classId: string) {
  update(username, (s) => ({
    ...s,
    runsStarted: s.runsStarted + 1,
    classesPlayed: s.classesPlayed.includes(classId)
      ? s.classesPlayed
      : [...s.classesPlayed, classId],
  }));
}

export function recordBossDefeat(username: string, bossId: string) {
  update(username, (s) => ({
    ...s,
    runsWon: s.runsWon + 1,
    bossesDefeated: s.bossesDefeated.includes(bossId)
      ? s.bossesDefeated
      : [...s.bossesDefeated, bossId],
  }));
}

export function recordRunLost(username: string) {
  update(username, (s) => ({ ...s, runsLost: s.runsLost + 1 }));
}

export function getAccuracy(stats: UserStats): number {
  return stats.totalSubmits === 0 ? 0 : (stats.totalCorrect / stats.totalSubmits) * 100;
}
