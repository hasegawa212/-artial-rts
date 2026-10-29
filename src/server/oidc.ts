import * as client from "openid-client";
import { env } from "./env";

let configPromise: Promise<client.Configuration> | undefined;

/** IdP の discovery。issuer は https（本番は env で強制）。 */
export function oidcConfig(): Promise<client.Configuration> {
  const e = env();
  configPromise ??= client.discovery(new URL(e.OIDC_ISSUER!), e.OIDC_CLIENT_ID!, e.OIDC_CLIENT_SECRET!);
  return configPromise;
}

export function redirectUri(): string {
  return new URL("/api/auth/callback", env().APP_URL).toString();
}

export { client };
