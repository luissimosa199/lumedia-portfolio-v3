import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/adminSession";

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";

/**
 * Password storage.
 *
 * Preferred: `ADMIN_PASSWORD_HASH`, produced by `npm run admin:hash-password`
 * (scripts/hash-admin-password.mjs). New values use the env-safe format
 * `scrypt.v1.<salt base64url>.<hash base64url>`. Legacy
 * `scrypt$<salt hex>$<hash hex>` values are still accepted for migration.
 * Both formats use scrypt N=16384, r=8, p=1, 64-byte key - the same
 * parameters as hashPassword() below, so the script and this module never
 * drift apart.
 *
 * Fallback: `ADMIN_PASSWORD` in plain text, for local development. It is
 * still compared in constant time, but a hash is what you want in prod.
 */
const HASH_PREFIX = "scrypt.v1";
const LEGACY_HASH_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 };
const FAILED_LOGIN_DELAY_MS = 750;

export interface AdminCredentialDiagnostics {
  configured: boolean;
  source: "hash" | "plaintext" | "none";
  hashFormatValid: boolean;
  hashLength: number | null;
}

function parseStoredHash(stored: string): { salt: Buffer; expected: Buffer } | null {
  const versioned = stored.split(".");
  if (
    versioned.length === 4 &&
    `${versioned[0]}.${versioned[1]}` === HASH_PREFIX &&
    /^[A-Za-z0-9_-]+$/.test(versioned[2]) &&
    /^[A-Za-z0-9_-]+$/.test(versioned[3])
  ) {
    const salt = Buffer.from(versioned[2], "base64url");
    const expected = Buffer.from(versioned[3], "base64url");
    if (salt.length === 16 && expected.length === SCRYPT_KEY_LENGTH) {
      return { salt, expected };
    }
  }

  const legacy = stored.split("$");
  if (
    legacy.length === 3 &&
    legacy[0] === LEGACY_HASH_PREFIX &&
    /^[0-9a-f]{32}$/i.test(legacy[1]) &&
    /^[0-9a-f]{128}$/i.test(legacy[2])
  ) {
    return {
      salt: Buffer.from(legacy[1], "hex"),
      expected: Buffer.from(legacy[2], "hex"),
    };
  }

  return null;
}

export function getAdminCredentialDiagnostics(): AdminCredentialDiagnostics {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hash) {
    return {
      configured: true,
      source: "hash",
      hashFormatValid: parseStoredHash(hash) !== null,
      hashLength: hash.length,
    };
  }

  if (process.env.ADMIN_PASSWORD) {
    return {
      configured: true,
      source: "plaintext",
      hashFormatValid: false,
      hashLength: null,
    };
  }

  return {
    configured: false,
    source: "none",
    hashFormatValid: false,
    hashLength: null,
  };
}

function scrypt(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, SCRYPT_KEY_LENGTH, SCRYPT_OPTIONS, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export function isAdminConfigured(): boolean {
  return getAdminCredentialDiagnostics().configured;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt);
  return `${HASH_PREFIX}.${salt.toString("base64url")}.${derived.toString("base64url")}`;
}

async function verifyAgainstHash(password: string, stored: string): Promise<boolean> {
  const parsed = parseStoredHash(stored);
  if (!parsed) return false;

  const derived = await scrypt(password, parsed.salt);
  const expected = parsed.expected;
  return timingSafeEqual(derived, expected);
}

function verifyAgainstPlaintext(password: string, stored: string): boolean {
  const a = Buffer.from(password, "utf8");
  const b = Buffer.from(stored, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Checks a login attempt. Failed attempts are slowed down a little so an
 * online guess costs at least ~0.75s each; there is intentionally no
 * account lockout since there is exactly one account to lock.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const plain = process.env.ADMIN_PASSWORD;

  let ok = false;
  if (hash) {
    ok = await verifyAgainstHash(password, hash);
  } else if (plain) {
    ok = verifyAgainstPlaintext(password, plain);
  }

  if (!ok) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
  }
  return ok;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

/** For server components / actions / route handlers behind the admin. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect(ADMIN_LOGIN_PATH);
  }
}

export async function startAdminSession(): Promise<void> {
  const token = await createAdminSessionToken();
  if (!token) {
    throw new Error("Admin password is not configured");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
  });
}

export async function endAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
