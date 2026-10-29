import { describe, expect, it } from "vitest";
import { resolveIdentity } from "@/server/identity";

const cfg = { ADMIN_EMAILS: ["boss@ma.example"], MANAGER_EMAILS: ["mgr@ma.example"], ALLOWED_EMAIL_DOMAINS: ["ma.example"] };

describe("resolveIdentity (OIDC claims → portal user)", () => {
  it("requires a verified email in an allowed domain", () => {
    expect(resolveIdentity({ sub: "1", email: "x@other.example", email_verified: true }, cfg)).toEqual({ ok: false, reason: "domain" });
    expect(resolveIdentity({ sub: "1", email: "x@ma.example", email_verified: false }, cfg)).toEqual({ ok: false, reason: "unverified" });
    expect(resolveIdentity({ sub: "1" }, cfg)).toEqual({ ok: false, reason: "no-email" });
    expect(resolveIdentity({ email: "x@ma.example", email_verified: true }, cfg)).toEqual({ ok: false, reason: "no-sub" });
  });

  it("does not let a look-alike domain through", () => {
    expect(resolveIdentity({ sub: "1", email: "x@evilma.example", email_verified: true }, cfg)).toEqual({ ok: false, reason: "domain" });
  });

  it("maps admin / manager / member by configured email", () => {
    const r = (email: string) => resolveIdentity({ sub: "1", email, email_verified: true, name: "N" }, cfg);
    expect(r("Boss@MA.example")).toMatchObject({ ok: true, user: { role: "admin", email: "boss@ma.example" } });
    expect(r("mgr@ma.example")).toMatchObject({ ok: true, user: { role: "manager" } });
    expect(r("staff@ma.example")).toMatchObject({ ok: true, user: { role: "member", name: "N" } });
  });

  it("an empty domain list allows any verified email (single-tenant IdP)", () => {
    expect(resolveIdentity({ sub: "1", email: "x@any.example", email_verified: true }, { ...cfg, ALLOWED_EMAIL_DOMAINS: [] })).toMatchObject({ ok: true });
  });
});
