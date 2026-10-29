import { canSeeApp } from "./rbac";
import type { AppEntry, Role } from "./types";

export type LaunchResult =
  | { ok: true; url: string; warning: "unverified" | null }
  | { ok: false; reason: "forbidden" | "frozen" | "no-url" | "url-unknown" | "insecure" };

const SECRET_PARAM = /^(token|access_token|id_token|key|api_key|apikey|secret|password|pw|code|sig|signature)$/i;

/** https のみ・認証情報を含まない URL だけを許可する。 */
export function isSafeUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  if (u.username || u.password) return false;
  for (const k of u.searchParams.keys()) if (SECRET_PARAM.test(k)) return false;
  return true;
}

/**
 * アプリを開けるかを判定する。ポータルは URL へ遷移させるだけで、
 * 起動先の認証は起動先アプリ自身が行う（迂回しない）。
 */
export function resolveLaunch(app: AppEntry, user: { role: Role } | null | undefined): LaunchResult {
  if (!canSeeApp(user, app)) return { ok: false, reason: "forbidden" };
  if (app.lifecycle === "frozen") return { ok: false, reason: "frozen" };
  if (!app.url) return { ok: false, reason: app.auth === "line" || app.auth === "chat" ? "no-url" : "url-unknown" };
  if (app.urlStatus === "unknown") return { ok: false, reason: "url-unknown" };
  if (!isSafeUrl(app.url)) return { ok: false, reason: "insecure" };
  return { ok: true, url: app.url, warning: app.urlStatus === "verified" ? null : "unverified" };
}

export const LAUNCH_REASON_LABEL: Record<Exclude<LaunchResult, { ok: true }>["reason"], string> = {
  forbidden: "このアプリを開く権限がありません",
  frozen: "凍結中のため開けません",
  "no-url": "LINE・チャットから使うアプリです",
  "url-unknown": "URL未確認のため接続しません",
  insecure: "安全でないURLのため開けません",
};
