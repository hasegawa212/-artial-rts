import { describe, expect, it } from "vitest";
import { parseEnv } from "@/server/env";

const SECRET = "x".repeat(32);
const oidc = {
  AUTH_MODE: "oidc",
  SESSION_SECRET: SECRET,
  APP_URL: "https://one.example.com",
  OIDC_ISSUER: "https://idp.example.com",
  OIDC_CLIENT_ID: "client",
  OIDC_CLIENT_SECRET: "secret",
  DATABASE_URL: "postgresql://u:p@localhost:5432/one",
  ALLOWED_EMAIL_DOMAINS: "example.com",
};

describe("parseEnv (fail-closed configuration)", () => {
  it("accepts a complete production OIDC config", () => {
    const env = parseEnv({ ...oidc, NODE_ENV: "production" });
    expect(env.AUTH_MODE).toBe("oidc");
    expect(env.ADMIN_EMAILS).toEqual([]);
  });

  it("refuses dev login in production", () => {
    expect(() => parseEnv({ ...oidc, NODE_ENV: "production", AUTH_MODE: "dev" })).toThrow(/dev/);
  });

  it("refuses a short session secret", () => {
    expect(() => parseEnv({ ...oidc, NODE_ENV: "production", SESSION_SECRET: "short" })).toThrow(/SESSION_SECRET/);
  });

  it("requires the OIDC settings when AUTH_MODE=oidc", () => {
    const { OIDC_ISSUER: _drop, ...rest } = oidc;
    expect(() => parseEnv({ ...rest, NODE_ENV: "production" })).toThrow(/OIDC_ISSUER/);
  });

  it("requires a database in production", () => {
    const { DATABASE_URL: _drop, ...rest } = oidc;
    expect(() => parseEnv({ ...rest, NODE_ENV: "production" })).toThrow(/DATABASE_URL/);
  });

  it("requires https APP_URL and OIDC issuer in production", () => {
    expect(() => parseEnv({ ...oidc, NODE_ENV: "production", APP_URL: "http://one.example.com" })).toThrow(/https/);
    expect(() => parseEnv({ ...oidc, NODE_ENV: "production", OIDC_ISSUER: "http://idp" })).toThrow(/https/);
  });

  it("parses comma lists and lower-cases emails/domains", () => {
    const env = parseEnv({
      ...oidc,
      NODE_ENV: "production",
      ADMIN_EMAILS: " Boss@Example.com , ops@example.com",
      ALLOWED_EMAIL_DOMAINS: "Example.com",
    });
    expect(env.ADMIN_EMAILS).toEqual(["boss@example.com", "ops@example.com"]);
    expect(env.ALLOWED_EMAIL_DOMAINS).toEqual(["example.com"]);
  });

  it("allows dev login without OIDC/DB outside production", () => {
    const env = parseEnv({ NODE_ENV: "development", AUTH_MODE: "dev", SESSION_SECRET: SECRET });
    expect(env.AUTH_MODE).toBe("dev");
    expect(env.DATABASE_URL).toBeUndefined();
  });

  it("treats blank values (as copied from .env.example) as unset", () => {
    const env = parseEnv({ NODE_ENV: "development", AUTH_MODE: "dev", SESSION_SECRET: SECRET, DATABASE_URL: "", OIDC_ISSUER: "" });
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.OIDC_ISSUER).toBeUndefined();
  });

  it("defaults to oidc, never dev", () => {
    expect(() => parseEnv({ NODE_ENV: "development", SESSION_SECRET: SECRET })).toThrow(/OIDC_ISSUER/);
  });
});

describe("parseEnv on Netlify", () => {
  const base = { ...oidc, NODE_ENV: "production", ALLOWED_EMAIL_DOMAINS: "example.com" };

  it("uses NETLIFY_DB_URL when DATABASE_URL is not set", () => {
    const { DATABASE_URL: _drop, ...rest } = base;
    const env = parseEnv({ ...rest, NETLIFY_DB_URL: "postgresql://netlify/db" });
    expect(env.DATABASE_URL).toBe("postgresql://netlify/db");
  });

  it("prefers an explicit DATABASE_URL", () => {
    expect(parseEnv({ ...base, NETLIFY_DB_URL: "postgresql://netlify/db" }).DATABASE_URL).toBe(oidc.DATABASE_URL);
  });

  it("requires ALLOWED_EMAIL_DOMAINS for OIDC in production (Google accepts any account)", () => {
    expect(() => parseEnv({ ...oidc, NODE_ENV: "production", ALLOWED_EMAIL_DOMAINS: "" })).toThrow(/ALLOWED_EMAIL_DOMAINS/);
  });

  it("accepts individual ALLOWED_EMAILS instead of a domain, lower-cased", () => {
    const env = parseEnv({ ...oidc, NODE_ENV: "production", ALLOWED_EMAIL_DOMAINS: "", ALLOWED_EMAILS: " Owner@Gmail.com " });
    expect(env.ALLOWED_EMAILS).toEqual(["owner@gmail.com"]);
    expect(env.ALLOWED_EMAIL_DOMAINS).toEqual([]);
  });
});
