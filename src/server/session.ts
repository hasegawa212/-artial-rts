import { EncryptJWT, jwtDecrypt } from "jose";
import { isRole } from "@/domain/rbac";
import type { PortalUser } from "@/domain/types";

export const SESSION_COOKIE = "mao_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 1 営業日

async function keyFrom(secret: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return new Uint8Array(digest);
}

/** セッションを暗号化（JWE, dir + A256GCM）。中身はクライアントから読めない・改ざんできない。 */
export async function sealSession(user: PortalUser, secret: string, issuedAt = Math.floor(Date.now() / 1000)): Promise<string> {
  return new EncryptJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setSubject(user.sub)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + SESSION_TTL_SECONDS)
    .encrypt(await keyFrom(secret));
}

export async function openSession(token: string | undefined, secret: string): Promise<PortalUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtDecrypt(token, await keyFrom(secret));
    const { sub, email, name, role } = payload;
    if (typeof sub !== "string" || typeof email !== "string" || typeof name !== "string" || !isRole(role)) return null;
    return { sub, email, name, role };
  } catch {
    return null;
  }
}
