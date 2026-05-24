"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUsername, login, logout, register } from "@/lib/auth/local-auth";

interface AuthCtx {
  username: string | null;
  loaded: boolean;
  signIn: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUsername(getCurrentUsername());
    setLoaded(true);
  }, []);

  const signIn = useCallback(async (u: string, p: string) => {
    const res = await login(u, p);
    if (res.ok) setUsername(getCurrentUsername());
    return res;
  }, []);

  const signUp = useCallback(async (u: string, p: string) => {
    const res = await register(u, p);
    if (res.ok) setUsername(getCurrentUsername());
    return res;
  }, []);

  const signOut = useCallback(() => {
    logout();
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ username, loaded, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
