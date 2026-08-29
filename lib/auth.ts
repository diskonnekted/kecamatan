import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db, hashPassword } from "@/lib/db";

const COOKIE_NAME = "admin_session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

export { hashPassword };

export function verifyPassword(plain: string, hash: string): boolean {
  return hashPassword(plain) === hash;
}

export function createSession(userId: number): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL * 1000).toISOString();
  db.prepare(
    "INSERT INTO admin_session (token, user_id, expires_at, created_at) VALUES (?, ?, ?, datetime('now'))",
  ).run(token, userId, expiresAt);
  return token;
}

export function destroySession(token: string): void {
  db.prepare("DELETE FROM admin_session WHERE token = ?").run(token);
}

export function getSessionUser(token: string): { id: number; username: string } | null {
  const row = db
    .prepare(
      `SELECT u.id, u.username, s.expires_at FROM admin_session s
       JOIN admin_user u ON u.id = s.user_id
       WHERE s.token = ?`,
    )
    .get(token) as { id: number; username: string; expires_at: string } | undefined;
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    destroySession(token);
    return null;
  }
  return { id: row.id, username: row.username };
}

export async function getCurrentUser() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return getSessionUser(token);
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) throw new Error("Unauthorized");
  return u;
}

export const SESSION_COOKIE = COOKIE_NAME;
export { SESSION_TTL };
