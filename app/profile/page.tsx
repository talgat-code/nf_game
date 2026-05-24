"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GlitchText } from "@/components/effects/GlitchText";
import { BOSS_REGISTRY } from "@/lib/challenges/list";
import { getAccuracy, getStats, type UserStats } from "@/lib/profile/stats";

const CLASS_LABELS: Record<string, string> = {
  "frontend-mage": "Frontend Mage",
  "backend-paladin": "Backend Paladin",
  "systems-berserker": "Systems Berserker",
  "data-sorcerer": "Data Sorcerer",
  "fullstack-bard": "Fullstack Bard",
};

function StatTile({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-surface border border-surface-2 p-4">
      <p className="text-text-muted text-xs font-hud tracking-widest uppercase mb-1">{label}</p>
      <p className={`text-3xl font-hud tabular-nums ${accent ?? "text-neon-cyan"}`}>{value}</p>
    </div>
  );
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const { username, loaded, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (loaded && !username) {
      router.replace("/");
      return;
    }
    if (username) setStats(getStats(username));
  }, [username, loaded, router]);

  if (!loaded || !username || !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted font-hud tracking-widest">LOADING PROFILE...</p>
      </main>
    );
  }

  const accuracy = getAccuracy(stats);
  const allBosses = Object.values(BOSS_REGISTRY);
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <Link href="/" className="text-text-dim text-xs tracking-widest hover:text-text transition-colors w-fit">
          ← Back to home
        </Link>

        <div className="flex items-center gap-5">
          <div className="flex items-center justify-center w-20 h-20 bg-neon-cyan text-void font-bold font-hud text-3xl shadow-[0_0_20px_#00f0ff80]">
            {initials}
          </div>
          <div>
            <GlitchText as="h1" text={username.toUpperCase()} className="text-3xl text-neon-cyan text-glow-cyan" />
            <p className="text-text-muted text-xs font-hud tracking-widest uppercase mt-1">
              ► Registered {formatDate(stats.createdAt)} · Last played {formatDate(stats.lastPlayed)}
            </p>
          </div>
        </div>
      </div>

      {/* Core stats grid */}
      <section className="mb-8">
        <h2 className="text-neon-amber text-xs font-hud tracking-widest uppercase mb-3">
          ► Combat statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Submits" value={stats.totalSubmits} />
          <StatTile label="Challenges cleared" value={stats.challengesCleared} accent="text-neon-green" />
          <StatTile label="Accuracy" value={`${accuracy.toFixed(1)}%`} accent="text-neon-amber" />
          <StatTile label="Wrong answers" value={stats.totalWrong} accent="text-neon-magenta" />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-neon-amber text-xs font-hud tracking-widest uppercase mb-3">
          ► Run record
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatTile label="Runs started" value={stats.runsStarted} />
          <StatTile label="Wins" value={stats.runsWon} accent="text-neon-green" />
          <StatTile label="Losses" value={stats.runsLost} accent="text-neon-magenta" />
        </div>
      </section>

      {/* Bosses defeated */}
      <section className="mb-8">
        <h2 className="text-neon-amber text-xs font-hud tracking-widest uppercase mb-3">
          ► Bosses defeated ({stats.bossesDefeated.length} / {allBosses.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {allBosses.map((boss) => {
            const defeated = stats.bossesDefeated.includes(boss.id);
            return (
              <div
                key={boss.id}
                className={`relative bg-surface border p-4 flex items-center gap-3 ${
                  defeated ? "border-neon-green" : "border-surface-2 opacity-50"
                }`}
              >
                {/* biome-ignore lint/performance/noImgElement: small thumb */}
                <img
                  src={boss.imageSrc}
                  alt={boss.name}
                  className="w-16 h-16 object-cover border border-surface-3"
                  style={defeated ? {} : { filter: "grayscale(1) brightness(0.5)" }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-hud tracking-widest ${
                      defeated ? "text-neon-green" : "text-text-dim"
                    }`}
                  >
                    {defeated ? "✓ DEFEATED" : "× UNDEFEATED"}
                  </p>
                  <p className="text-text text-sm font-bold truncate">{boss.name}</p>
                  <p className="text-text-muted text-xs">{boss.languageLabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Classes played */}
      <section className="mb-8">
        <h2 className="text-neon-amber text-xs font-hud tracking-widest uppercase mb-3">
          ► Classes played
        </h2>
        <div className="flex flex-wrap gap-2">
          {stats.classesPlayed.length === 0 ? (
            <p className="text-text-muted text-sm">No runs yet — pick a class to start.</p>
          ) : (
            stats.classesPlayed.map((cls) => (
              <span
                key={cls}
                className="border border-neon-cyan px-3 py-1 text-neon-cyan text-xs font-hud tracking-widest uppercase"
              >
                {CLASS_LABELS[cls] ?? cls}
              </span>
            ))
          )}
        </div>
      </section>

      {/* Actions */}
      <section className="flex gap-3 mt-12">
        <Link
          href="/class-select"
          className="border border-neon-green px-6 py-2 text-neon-green text-sm tracking-widest uppercase font-bold hover:bg-neon-green hover:text-void transition-colors"
        >
          ► Start new run
        </Link>
        <button
          type="button"
          onClick={() => {
            signOut();
            router.replace("/");
          }}
          className="border border-neon-magenta px-6 py-2 text-neon-magenta text-sm tracking-widest uppercase hover:bg-neon-magenta hover:text-void transition-colors"
        >
          ► Logout
        </button>
      </section>
    </main>
  );
}
