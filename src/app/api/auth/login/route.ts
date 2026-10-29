import { NextResponse } from "next/server";
import { EncryptJWT } from "jose";
import { env } from "@/server/env";
import { client, oidcConfig, redirectUri } from "@/server/oidc";
import { cookieBase } from "@/server/cookies";

const OIDC_TX_COOKIE = "mao_oidc_tx";

export async function GET(req: Request) {
  const e = env();
  if (e.AUTH_MODE !== "oidc") return NextResponse.redirect(new URL("/login", req.url));
  const config = await oidcConfig();
  const verifier = client.randomPKCECodeVerifier();
  const state = client.randomState();
  const nonce = client.randomNonce();
  const url = client.buildAuthorizationUrl(config, {
    redirect_uri: redirectUri(),
    scope: e.OIDC_SCOPES,
    code_challenge: await client.calculatePKCECodeChallenge(verifier),
    code_challenge_method: "S256",
    state,
    nonce,
  });
  const key = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("tx:" + e.SESSION_SECRET)));
  const tx = await new EncryptJWT({ verifier, state, nonce })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setExpirationTime("10m")
    .encrypt(key);
  const res = NextResponse.redirect(url);
  res.cookies.set(OIDC_TX_COOKIE, tx, { ...cookieBase(), maxAge: 600 });
  return res;
}
