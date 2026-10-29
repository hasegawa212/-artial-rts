import { describe, expect, it } from "vitest";
import { sealSession, openSession, SESSION_TTL_SECONDS } from "@/server/session";

const secret = "s".repeat(32);
const user = { sub: "u1", email: "a@example.com", name: "A", role: "member" as const };

describe("session cookie", () => {
  it("round-trips", async () => {
    const token = await sealSession(user, secret);
    expect(token).not.toContain("a@example.com"); // encrypted, not just signed
    expect(await openSession(token, secret)).toMatchObject(user);
  });

  it("rejects a different secret, tampering and garbage", async () => {
    const token = await sealSession(user, secret);
    expect(await openSession(token, "t".repeat(32))).toBeNull();
    expect(await openSession(token.slice(0, -2) + "AA", secret)).toBeNull();
    expect(await openSession("nope", secret)).toBeNull();
    expect(await openSession(undefined, secret)).toBeNull();
  });

  it("expires", async () => {
    const past = Math.floor(Date.now() / 1000) - SESSION_TTL_SECONDS - 10;
    const token = await sealSession(user, secret, past);
    expect(await openSession(token, secret)).toBeNull();
  });

  it("rejects a payload whose role is not a known role", async () => {
    const token = await sealSession({ ...user, role: "root" as never }, secret);
    expect(await openSession(token, secret)).toBeNull();
  });
});
