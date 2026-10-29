import { describe, expect, it } from "vitest";
import { resolveLaunch } from "@/domain/launch";
import type { AppEntry } from "@/domain/types";

const base: AppEntry = {
  id: "x",
  name: "X",
  kana: "",
  description: "",
  category: "sales",
  keywords: [],
  repo: "hasegawa212/-",
  url: "https://example.github.io/-/x/",
  urlStatus: "verified",
  urlSource: "test",
  auth: "public",
  authNote: "",
  owner: "未確認",
  lifecycle: "production",
  visibility: "member",
  confidential: false,
  icon: "app",
};
const member = { role: "member" as const };

describe("resolveLaunch", () => {
  it("opens a verified https URL", () => {
    expect(resolveLaunch(base, member)).toEqual({ ok: true, url: base.url, warning: null });
  });

  it("opens a documented (deploy-config) URL with a not-yet-verified warning", () => {
    const r = resolveLaunch({ ...base, urlStatus: "documented" }, member);
    expect(r).toEqual({ ok: true, url: base.url, warning: "unverified" });
  });

  it("never connects to an unknown URL, even if one is filled in", () => {
    expect(resolveLaunch({ ...base, urlStatus: "unknown" }, member)).toEqual({ ok: false, reason: "url-unknown" });
    expect(resolveLaunch({ ...base, url: null, urlStatus: "unknown" }, member)).toEqual({ ok: false, reason: "url-unknown" });
  });

  it("says there is no web URL for apps used inside LINE / Telegram / Slack", () => {
    expect(resolveLaunch({ ...base, url: null, urlStatus: "unknown", auth: "line" }, member)).toEqual({ ok: false, reason: "no-url" });
    expect(resolveLaunch({ ...base, url: null, urlStatus: "unknown", auth: "chat" }, member)).toEqual({ ok: false, reason: "no-url" });
  });

  it("refuses non-https and credential-bearing URLs", () => {
    expect(resolveLaunch({ ...base, url: "http://example.com/" }, member)).toEqual({ ok: false, reason: "insecure" });
    expect(resolveLaunch({ ...base, url: "javascript:alert(1)" }, member)).toEqual({ ok: false, reason: "insecure" });
    expect(resolveLaunch({ ...base, url: "https://user:pw@example.com/" }, member)).toEqual({ ok: false, reason: "insecure" });
    expect(resolveLaunch({ ...base, url: "https://example.com/?token=abc" }, member)).toEqual({ ok: false, reason: "insecure" });
    expect(resolveLaunch({ ...base, url: "not a url" }, member)).toEqual({ ok: false, reason: "insecure" });
  });

  it("refuses frozen apps and apps above the user's role", () => {
    expect(resolveLaunch({ ...base, lifecycle: "frozen" }, member)).toEqual({ ok: false, reason: "frozen" });
    expect(resolveLaunch({ ...base, visibility: "admin" }, member)).toEqual({ ok: false, reason: "forbidden" });
    expect(resolveLaunch(base, null)).toEqual({ ok: false, reason: "forbidden" });
  });
});
