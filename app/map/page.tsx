"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GlitchText } from "@/components/effects/GlitchText";
import { BOSS_REGISTRY } from "@/lib/challenges/list";
import { getAccuracy, getStats, type ChallengeClear, type UserStats } from "@/lib/profile/stats";

const CLASS_LABELS: Record<string, string> = {
  "frontend-mage": "Frontend Mage",
  "backend-paladin": "Backend Paladin",
  "systems-berserker": "Systems Berserker",
  "data-sorcerer": "Data Sorcerer",
  "fullstack-bard": "Fullstack Bard",
};

function clearKey(bossId: string, challengeId: string): string {
  return `${bossId}:${challengeId}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatus(
  clear: ChallengeClear | undefined,
  previousClear: ChallengeClear | undefined,
  index: number,
) {
  if (clear) return "cleared";
  if (index === 0 || previousClear) return "available";
  return "locked";
}

function statusClasses(status: string) {
  if (status === "cleared") {
    return {
      node: "border-neon-green bg-neon-green text-void shadow-[0_0_18px_#00ff8880]",
      line: "bg-neon-green/70",
      label: "text-neon-green",
      panel: "border-neon-green/70 bg-neon-green/10",
    };
  }
  if (status === "available") {
    return {
      node: "border-neon-amber bg-void text-neon-amber shadow-[0_0_14px_#ffaa0040]",
      line: "bg-neon-amber/40",
      label: "text-neon-amber",
      panel: "border-neon-amber/60 bg-neon-amber/10",
    };
  }
  return {
    node: "border-surface-3 bg-surface-2 text-text-dim",
    line: "bg-surface-3",
    label: "text-text-dim",
    panel: "border-surface-2 bg-surface/70 opacity-70",
  };
}

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-text-muted font-hud tracking-widest">LOADING RUN MAP...</p>
    </main>
  );
}

function LoginState() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <GlitchText as="h1" text="RUN MAP LOCKED" className="text-4xl text-neon-amber text-glow-amber" />
      <p className="max-w-xl text-sm leading-relaxed text-text-muted">
        Log in with the profile button in the top-right corner to record and view your level path.
      </p>
      <Link
        href="/class-select"
        className="border border-neon-cyan px-8 py-3 text-sm font-bold uppercase tracking-widest text-neon-cyan transition-colors hover:bg-neon-cyan hover:text-void"
      >
        Start a run
      </Link>
    </main>
  );
}

export default function RunMapPage() {
  const { username, loaded } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const bosses = useMemo(() => Object.values(BOSS_REGISTRY), []);

  useEffect(() => {
    if (username) {
      setStats(getStats(username));
    } else {
      setStats(null);
    }
  }, [username]);

  if (!loaded) return <LoadingState />;
  if (!username) return <LoginState />;
  if (!stats) return <LoadingState />;

  const totalChallenges = bosses.reduce((sum, boss) => sum + boss.challenges.length, 0);
  const clearMap = new Map(
    stats.challengeClears.map((clear) => [clearKey(clear.bossId, clear.challengeId), clear]),
  );
  const timeline = [...stats.challengeClears].sort((a, b) => a.clearedAt - b.clearedAt);
  const clearOrder = new Map(
    timeline.map((clear, index) => [clearKey(clear.bossId, clear.challengeId), index + 1]),
  );
  const accuracy = getAccuracy(stats);

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-6">
          <Link
            href="/profile"
            className="w-fit text-xs tracking-widest text-text-dim transition-colors hover:text-text"
          >
            &lt;- Back to profile
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-hud uppercase tracking-[0.4em] text-neon-cyan">
                Operator: {username}
              </p>
              <GlitchText
                as="h1"
                text="RUN MAP"
                className="text-5xl text-neon-amber text-glow-amber"
              />
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted">
                A tactical map of your cleared boss challenges. Green nodes are defeated, amber nodes
                are ready, dim nodes are still locked behind previous bugs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 border border-surface-2 bg-surface p-3">
              <div className="border border-surface-2 bg-void p-3">
                <p className="text-[10px] font-hud uppercase tracking-widest text-text-muted">
                  Nodes cleared
                </p>
                <p className="text-3xl font-hud text-neon-green">
                  {clearMap.size}/{totalChallenges}
                </p>
              </div>
              <div className="border border-surface-2 bg-void p-3">
                <p className="text-[10px] font-hud uppercase tracking-widest text-text-muted">
                  Accuracy
                </p>
                <p className="text-3xl font-hud text-neon-amber">{accuracy.toFixed(0)}%</p>
              </div>
              <div className="border border-surface-2 bg-void p-3">
                <p className="text-[10px] font-hud uppercase tracking-widest text-text-muted">
                  Bosses
                </p>
                <p className="text-3xl font-hud text-neon-magenta">
                  {stats.bossesDefeated.length}/{bosses.length}
                </p>
              </div>
              <div className="border border-surface-2 bg-void p-3">
                <p className="text-[10px] font-hud uppercase tracking-widest text-text-muted">
                  Runs
                </p>
                <p className="text-3xl font-hud text-neon-cyan">{stats.runsStarted}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {bosses.map((boss) => {
            const defeated = stats.bossesDefeated.includes(boss.id);
            const clearedForBoss = boss.challenges.filter((challenge) =>
              clearMap.has(clearKey(boss.id, challenge.id)),
            ).length;

            return (
              <article
                key={boss.id}
                className="overflow-hidden border border-surface-2 bg-surface shadow-[0_0_30px_rgba(0,0,0,0.25)]"
              >
                <div className="relative h-44 overflow-hidden border-b border-surface-2 bg-void">
                  {/* biome-ignore lint/performance/noImgElement: decorative boss map header */}
                  <img
                    src={boss.imageSrc}
                    alt={boss.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                    style={{ objectPosition: "center 10%" }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(22,22,42,0.95), rgba(22,22,42,0.55) 55%, rgba(22,22,42,0.9))",
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <p className="text-[10px] font-hud uppercase tracking-[0.3em] text-text-muted">
                      {CLASS_LABELS[boss.classId]} / {boss.languageLabel}
                    </p>
                    <h2 className="mt-1 text-xl font-hud uppercase tracking-widest text-neon-cyan">
                      {boss.name}
                    </h2>
                    <p className="mt-1 text-xs text-text-muted">{boss.tagline}</p>
                  </div>
                </div>

                <div className="border-b border-surface-2 px-4 py-3">
                  <div className="flex items-center justify-between text-xs font-hud uppercase tracking-widest">
                    <span className={defeated ? "text-neon-green" : "text-text-muted"}>
                      {defeated ? "Boss defeated" : "Boss active"}
                    </span>
                    <span className="text-text-dim">
                      {clearedForBoss}/{boss.challenges.length} nodes
                    </span>
                  </div>
                </div>

                <div className="relative p-4">
                  <div className="absolute bottom-8 left-[31px] top-8 w-px bg-surface-3" />
                  <div className="flex flex-col gap-4">
                    {boss.challenges.map((challenge, index) => {
                      const key = clearKey(boss.id, challenge.id);
                      const clear = clearMap.get(key);
                      const previousChallenge = boss.challenges[index - 1];
                      const previousClear = previousChallenge
                        ? clearMap.get(clearKey(boss.id, previousChallenge.id))
                        : undefined;
                      const status = getStatus(clear, previousClear, index);
                      const classes = statusClasses(status);
                      const order = clearOrder.get(key);

                      return (
                        <div key={challenge.id} className="relative grid grid-cols-[34px_1fr] gap-3">
                          {index > 0 && (
                            <div
                              className={`absolute -top-4 left-[16px] h-4 w-px ${classes.line}`}
                            />
                          )}
                          <div
                            className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-hud ${classes.node}`}
                          >
                            {order ?? index + 1}
                          </div>
                          <div className={`border p-3 ${classes.panel}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={`text-[10px] font-hud uppercase tracking-widest ${classes.label}`}>
                                  {status}
                                </p>
                                <h3 className="mt-1 text-sm font-bold tracking-wide text-text">
                                  {challenge.title}
                                </h3>
                              </div>
                              <span className="shrink-0 text-[10px] font-hud uppercase tracking-widest text-text-dim">
                                Node {index + 1}
                              </span>
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-muted">
                              {challenge.prompt}
                            </p>
                            {clear && (
                              <p className="mt-3 text-[11px] font-hud tracking-widest text-neon-green">
                                Cleared {formatDate(clear.clearedAt)} / best {clear.attempts} attempt
                                {clear.attempts === 1 ? "" : "s"}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="border border-surface-2 bg-surface p-5">
            <h2 className="text-xs font-hud uppercase tracking-[0.35em] text-neon-amber">
              Clear timeline
            </h2>
            {timeline.length === 0 ? (
              <p className="mt-4 text-sm text-text-muted">
                No cleared nodes yet. Start a run, defeat your first bug, and this map will light up.
              </p>
            ) : (
              <div className="mt-4 grid gap-2">
                {timeline.map((clear, index) => {
                  const boss = BOSS_REGISTRY[clear.bossId];
                  const challenge = boss?.challenges.find((item) => item.id === clear.challengeId);

                  return (
                    <div
                      key={`${clear.bossId}:${clear.challengeId}`}
                      className="flex items-center gap-3 border border-surface-2 bg-void px-3 py-2"
                    >
                      <span className="flex h-7 w-7 items-center justify-center border border-neon-green bg-neon-green text-xs font-hud text-void">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-text">
                          {challenge?.title ?? clear.challengeId}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {boss?.name ?? clear.bossId} / {formatDate(clear.clearedAt)}
                        </p>
                      </div>
                      <span className="text-xs font-hud tracking-widest text-neon-cyan">
                        {clear.attempts}x
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="border border-surface-2 bg-surface p-5">
            <h2 className="text-xs font-hud uppercase tracking-[0.35em] text-neon-cyan">
              Next move
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Pick any amber node by starting the matching class. The map stores progress per browser
              profile, so it works without a backend and stays private on the device.
            </p>
            <Link
              href="/class-select"
              className="mt-5 block border border-neon-green px-5 py-2 text-center text-sm font-bold uppercase tracking-widest text-neon-green transition-colors hover:bg-neon-green hover:text-void"
            >
              Continue run
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
}
