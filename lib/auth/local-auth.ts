// localStorage-based "auth" — registration/login/logout for single-player game.
// Passwords hashed with SubtleCrypto (SHA-256). NOT secure for real auth,
// but acceptable for a local-only single-player game with no cloud sync.
// Migration to NextAuth + DB is planned; this is the MVP.

const USERS_KEY = "cc_users_v1";
const CURRENT_USER_KEY = "cc_current_user_v1";

export interface StoredUser {
  username: string;
  passwordHash: string;
  createdAt: number;
}

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function register(
  username: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { ok: false, error: "Username must be 3-20 characters" };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { ok: false, error: "Username can only contain letters, numbers, _ and -" };
  }
  if (password.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters" };
  }
  const users = readUsers();
  if (users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, error: "Username already exists" };
  }
  const passwordHash = await hashPassword(password);
  users.push({ username: trimmed, passwordHash, createdAt: Date.now() });
  writeUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, trimmed);
  return { ok: true };
}

export async function login(
  username: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const users = readUsers();
  const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user) return { ok: false, error: "User not found" };
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    return { ok: false, error: "Wrong password" };
  }
  localStorage.setItem(CURRENT_USER_KEY, user.username);
  return { ok: true };
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function listUsernames(): string[] {
  return readUsers().map((u) => u.username);
}
