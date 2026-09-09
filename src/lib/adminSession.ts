/**
 * Admin session tokens.
 *
 * This module deliberately uses only Web Crypto (no `node:` imports) so it
 * can be shared between the proxy (src/proxy.ts), route handlers and server
 * actions. Password checking lives in src/lib/adminAuth.ts (Node only).
 *
 * A token is `v1.<expiresAtMs>.<base64url(HMAC-SHA256(secret, "v1.<expiresAtMs>"))>`.
 * There is nothing user-specific to store (there is exactly one admin), so
 * the token only needs to prove it was minted by this server and has not
 * expired.
 */

export const ADMIN_SESSION_COOKIE = "lumedia_admin_session";
export const ADMIN_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const TOKEN_VERSION = "v1";

/**
 * The HMAC key. `ADMIN_SESSION_SECRET` wins; otherwise the key is derived
 * from the configured password material, which means rotating the admin
 * password also invalidates every existing session.
 */
export function getAdminSessionSecret(): string | null {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) return explicit;

  const material =
    process.env.ADMIN_PASSWORD_HASH?.trim() || process.env.ADMIN_PASSWORD;
  return material ? `lumedia-admin-session:${material}` : null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createAdminSessionToken(
  now: number = Date.now()
): Promise<string | null> {
  const secret = getAdminSessionSecret();
  if (!secret) return null;

  const payload = `${TOKEN_VERSION}.${now + ADMIN_SESSION_TTL_MS}`;
  return `${payload}.${await hmacSha256(secret, payload)}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null,
  now: number = Date.now()
): Promise<boolean> {
  if (!token) return false;
  const secret = getAdminSessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== TOKEN_VERSION) return false;

  const expiresAt = Number(parts[1]);
  if (!Number.isInteger(expiresAt) || expiresAt <= now) return false;

  const expected = await hmacSha256(secret, `${TOKEN_VERSION}.${expiresAt}`);
  return constantTimeEqual(expected, parts[2]);
}
