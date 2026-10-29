import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtDecrypt } from "jose";
import { env } from "@/server/env";
import { client, oidcConfig } from "@/server/oidc";
import { resolveIdentity } from "@/server/identity";
import { repo } from "@/server/context";
import { sealSession, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/server/session";
import { cookieBase } from "@/server/cookies";

const TX = "mao_oidc_tx";

export async function GET(req: Request) {
  const e = env();
  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(reason)}`, e.APP_URL ?? req.url));
    res.cookies.delete(TX);
    return res;
  };
  if (e.AUTH_MODE !== "oidc") return fail("mode");
  const raw = (await cookies()).get(TX)?.value;
  if (!raw) return fail("expired");
  let tx: { verifier: string; state: string; nonce: string };
  try {
    const key = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("tx:" + e.SESSION_SECRET)));
    tx = (await jwtDecrypt(raw, key)).payload as typeof tx;
  } catch {
    return fail("expired");
  }
  let claims: Record<string, unknown>;
  try {
    // 実際のリクエスト URL ではなく APP_URL 基準で組み立てる（プロキシ配下でも redirect_uri を一致させる）
    const current = new URL(new URL(req.url).search, new URL("/api/auth/callback", e.APP_URL));
    const tokens = await client.authorizationCodeGrant(await oidcConfig(), current, {
      pkceCodeVerifier: tx.verifier,
      expectedState: tx.state,
      expectedNonce: tx.nonce,
      idTokenExpected: true,
    });
    claims = { ...(tokens.claims() ?? {}) };
  } catch {
    return fail("oidc");
  }
  const id = resolveIdentity(claims, e);
  if (!id.ok) {
    await repo().audit({ actor: typeof claims.sub === "string" ? claims.sub : "anonymous", action: "auth.denied", detail: id.reason });
    return fail(id.reason);
  }
  const stored = await repo().upsertUser(id.user);
  await repo().audit({ actor: stored.sub, action: "auth.login" });
  const res = NextResponse.redirect(new URL("/", e.APP_URL));
  res.cookies.delete(TX);
  res.cookies.set(SESSION_COOKIE, await sealSession(stored, e.SESSION_SECRET), { ...cookieBase(), maxAge: SESSION_TTL_SECONDS });
  return res;
}
