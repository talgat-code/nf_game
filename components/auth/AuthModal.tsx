"use client";

import { useId, useState } from "react";
import { GlitchText } from "@/components/effects/GlitchText";
import { useAuth } from "./AuthProvider";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "signin" | "signup";
}

export function AuthModal({ open, onClose, mode: initialMode = "signin" }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const usernameId = useId();
  const passwordId = useId();

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res =
      mode === "signin" ? await signIn(username, password) : await signUp(username, password);
    setBusy(false);
    if (res.ok) {
      setUsername("");
      setPassword("");
      onClose();
    } else {
      setError(res.error);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-void/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop button — clicking outside closes modal */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative w-full max-w-md mx-4 bg-surface border border-neon-cyan p-6 space-y-5 shadow-[0_0_30px_#00f0ff40]">
        <div className="flex items-center justify-between">
          <GlitchText
            as="h2"
            text={mode === "signin" ? "LOGIN" : "REGISTER"}
            className="text-2xl text-neon-cyan text-glow-cyan"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-neon-magenta text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex border border-surface-2">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 text-xs font-hud tracking-widest uppercase transition-colors ${
              mode === "signin" ? "bg-neon-cyan text-void" : "text-text-muted hover:text-text"
            }`}
          >
            ► Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-xs font-hud tracking-widest uppercase transition-colors ${
              mode === "signup" ? "bg-neon-cyan text-void" : "text-text-muted hover:text-text"
            }`}
          >
            ► Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={usernameId}
              className="block text-text-muted text-xs font-hud tracking-widest uppercase mb-1"
            >
              Username
            </label>
            <input
              id={usernameId}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              minLength={3}
              maxLength={20}
              className="w-full bg-void border border-surface-2 px-3 py-2 text-text font-mono text-sm focus:border-neon-cyan focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={passwordId}
              className="block text-text-muted text-xs font-hud tracking-widest uppercase mb-1"
            >
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={4}
              className="w-full bg-void border border-surface-2 px-3 py-2 text-text font-mono text-sm focus:border-neon-cyan focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-neon-magenta text-xs font-hud tracking-widest border-l-2 border-neon-magenta pl-2">
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full border border-neon-green py-2.5 text-neon-green text-sm tracking-widest uppercase font-bold hover:bg-neon-green hover:text-void disabled:opacity-40 transition-colors"
          >
            {busy ? "..." : mode === "signin" ? "Login" : "Create account"}
          </button>
        </form>

        <p className="text-text-dim text-[10px] text-center">
          ⚠ Local profile only — stored in browser, not synced across devices.
        </p>
      </div>
    </div>
  );
}
