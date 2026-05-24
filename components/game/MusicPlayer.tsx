"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Procedural cyberpunk synthwave loop using Tone.js.
// Loads Tone lazily so we don't bloat the initial bundle and only fire
// the AudioContext after a user gesture (browser policy).

interface MusicPlayerProps {
  className?: string;
}

type Status = "off" | "loading" | "playing";

export function MusicPlayer({ className }: MusicPlayerProps) {
  const [status, setStatus] = useState<Status>("off");
  const [volume, setVolume] = useState(0.4);
  // We keep refs to Tone objects so we can clean up cleanly.
  const toneRef = useRef<typeof import("tone") | null>(null);
  const looperRef = useRef<{ dispose: () => void } | null>(null);

  // Tear down on unmount
  useEffect(() => {
    return () => {
      looperRef.current?.dispose();
      looperRef.current = null;
    };
  }, []);

  async function togglePlay() {
    if (status === "playing") {
      looperRef.current?.dispose();
      looperRef.current = null;
      setStatus("off");
      return;
    }

    setStatus("loading");
    try {
      const Tone = toneRef.current ?? (await import("tone"));
      toneRef.current = Tone;
      await Tone.start();
      looperRef.current = await buildSynthwaveLoop(Tone, volume);
      setStatus("playing");
    } catch (err) {
      console.error("Music start failed:", err);
      setStatus("off");
    }
  }

  function handleVolume(v: number) {
    setVolume(v);
    if (toneRef.current) {
      toneRef.current.getDestination().volume.value = volumeToDb(v);
    }
  }

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <button
        type="button"
        onClick={togglePlay}
        disabled={status === "loading"}
        className={cn(
          "border px-3 py-1 font-hud tracking-widest uppercase transition-colors disabled:opacity-40",
          status === "playing"
            ? "border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-void"
            : "border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-void",
        )}
      >
        {status === "loading" ? "..." : status === "playing" ? "♪ MUTE" : "♪ PLAY"}
      </button>
      {status === "playing" && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => handleVolume(Number(e.target.value))}
          className="w-20 accent-neon-cyan cursor-pointer"
          aria-label="Volume"
        />
      )}
    </div>
  );
}

// ─── Procedural synthwave loop ────────────────────────────────────────────────
// Bass pluck + lead arpeggio + hi-hat over a 4-bar minor progression.
async function buildSynthwaveLoop(
  Tone: typeof import("tone"),
  volume: number,
): Promise<{ dispose: () => void }> {
  Tone.getTransport().bpm.value = 92;
  Tone.getDestination().volume.value = volumeToDb(volume);

  // ── Voices ──
  const bass = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.2, release: 0.4 },
    filter: { Q: 4, type: "lowpass", rolloff: -24 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.2, baseFrequency: 80, octaves: 3 },
    volume: -12,
  }).toDestination();

  const lead = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.6 },
    volume: -18,
  }).toDestination();

  const reverb = new Tone.Reverb({ decay: 4, wet: 0.4 }).toDestination();
  lead.connect(reverb);

  const hat = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.08, release: 0.05 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 8000,
    octaves: 1.5,
    volume: -28,
  }).toDestination();

  // ── Bass pattern — Am Fm G Em (cyberpunk minor flavor) ──
  const bassNotes = ["A1", "A1", "F1", "F1", "G1", "G1", "E1", "E1"];
  const bassLoop = new Tone.Loop((time) => {
    const idx = Math.floor((Tone.getTransport().ticks / Tone.getTransport().PPQ) / 2) % bassNotes.length;
    bass.triggerAttackRelease(bassNotes[idx], "8n", time);
  }, "4n").start(0);

  // ── Lead arp ──
  const arpPattern = ["A4", "C5", "E5", "A5", "G5", "E5", "C5", "A4"];
  let arpIdx = 0;
  const leadLoop = new Tone.Loop((time) => {
    if (Math.random() > 0.25) {
      lead.triggerAttackRelease(arpPattern[arpIdx % arpPattern.length], "16n", time);
    }
    arpIdx++;
  }, "8n").start("0:0:2");

  // ── Hi-hat ──
  const hatLoop = new Tone.Loop((time) => {
    hat.triggerAttackRelease("C2", "32n", time, 0.4);
  }, "8n").start(0);

  Tone.getTransport().start();

  return {
    dispose: () => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      bassLoop.dispose();
      leadLoop.dispose();
      hatLoop.dispose();
      bass.dispose();
      lead.dispose();
      hat.dispose();
      reverb.dispose();
    },
  };
}

function volumeToDb(v: number): number {
  if (v <= 0) return -Infinity;
  return 20 * Math.log10(v);
}
