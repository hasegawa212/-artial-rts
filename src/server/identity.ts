import type { PortalUser, Role } from "@/domain/types";

export interface IdentityConfig {
  ADMIN_EMAILS: string[];
  MANAGER_EMAILS: string[];
  ALLOWED_EMAIL_DOMAINS: string[];
  /** ドメインごとではなく個別に許可するアドレス（Gmail など誰でも作れるドメイン用） */
  ALLOWED_EMAILS: string[];
}

export type IdentityResult = { ok: true; user: PortalUser } | { ok: false; reason: "no-sub" | "no-email" | "unverified" | "domain" };

/** OIDC の ID トークン claims から、ポータル利用者とロールを決める。 */
export function resolveIdentity(claims: Record<string, unknown>, cfg: IdentityConfig): IdentityResult {
  const sub = claims.sub;
  if (typeof sub !== "string" || !sub) return { ok: false, reason: "no-sub" };
  if (typeof claims.email !== "string" || !claims.email) return { ok: false, reason: "no-email" };
  if (claims.email_verified !== true) return { ok: false, reason: "unverified" };
  const email = claims.email.trim().toLowerCase();
  const domain = email.slice(email.lastIndexOf("@") + 1);
  const restricted = cfg.ALLOWED_EMAIL_DOMAINS.length > 0 || cfg.ALLOWED_EMAILS.length > 0;
  if (restricted && !cfg.ALLOWED_EMAIL_DOMAINS.includes(domain) && !cfg.ALLOWED_EMAILS.includes(email))
    return { ok: false, reason: "domain" };
  const role: Role = cfg.ADMIN_EMAILS.includes(email) ? "admin" : cfg.MANAGER_EMAILS.includes(email) ? "manager" : "member";
  const name = typeof claims.name === "string" && claims.name ? claims.name : email.split("@")[0]!;
  return { ok: true, user: { sub, email, name, role } };
}
