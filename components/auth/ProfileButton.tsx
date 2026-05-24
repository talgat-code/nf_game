"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { AuthModal } from "./AuthModal";

export function ProfileButton() {
  const { username, loaded, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  if (!loaded) return <div className="h-8 w-20" />;

  if (!username) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border border-neon-cyan px-4 py-1.5 text-neon-cyan text-xs tracking-widest uppercase font-hud hover:bg-neon-cyan hover:text-void transition-colors"
        >
          ► Login
        </button>
        <AuthModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdown(!dropdown)}
        className="flex items-center gap-2 border border-surface-2 hover:border-neon-cyan transition-colors pr-3"
      >
        <span className="flex items-center justify-center w-8 h-8 bg-neon-cyan text-void font-bold font-hud text-sm">
          {initials}
        </span>
        <span className="text-neon-cyan text-xs font-hud tracking-widest uppercase">
          {username}
        </span>
        <span className="text-text-muted text-xs">▾</span>
      </button>

      {dropdown && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setDropdown(false)}
            aria-label="Close dropdown"
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-neon-cyan shadow-[0_0_20px_#00f0ff40] z-20">
            <Link
              href="/profile"
              onClick={() => setDropdown(false)}
              className="block px-4 py-2 text-text text-sm hover:bg-surface-2 hover:text-neon-cyan border-b border-surface-2"
            >
              ► Profile & stats
            </Link>
            <Link
              href="/map"
              onClick={() => setDropdown(false)}
              className="block px-4 py-2 text-text text-sm hover:bg-surface-2 hover:text-neon-amber border-b border-surface-2"
            >
              &gt; Run map
            </Link>
            <Link
              href="/class-select"
              onClick={() => setDropdown(false)}
              className="block px-4 py-2 text-text text-sm hover:bg-surface-2 hover:text-neon-green border-b border-surface-2"
            >
              ► New run
            </Link>
            <button
              type="button"
              onClick={() => {
                signOut();
                setDropdown(false);
              }}
              className="block w-full text-left px-4 py-2 text-text-muted text-sm hover:bg-surface-2 hover:text-neon-magenta"
            >
              ► Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
