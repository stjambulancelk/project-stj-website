import crypto from "crypto";

// Simple JWT-less session using signed cookies (no next-auth needed)
// Uses HMAC-SHA256 signed tokens stored in httpOnly cookies

const SECRET = process.env.NEXTAUTH_SECRET ?? "change-me-in-production";

export interface AdminSession {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export function signToken(payload: Omit<AdminSession, "exp">): string {
  const exp = Math.floor(Date.now() / 1000) + 8 * 60 * 60; // 8h
  const data = JSON.stringify({ ...payload, exp });
  const encoded = Buffer.from(data).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string): AdminSession | null {
  try {
    const [encoded, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
    if (sig !== expectedSig) return null;
    const payload: AdminSession = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const attempt = crypto.scryptSync(plain, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
}

export const SESSION_COOKIE = "stj_admin_session";
export const SESSION_MAX_AGE = 8 * 60 * 60; // 8h in seconds
