import type { AuthKind, Lifecycle, UrlStatus } from "./types";

export const LIFECYCLE_LABEL: Record<Lifecycle, string> = {
  production: "稼働中",
  beta: "ベータ",
  development: "開発中",
  local: "ローカル利用",
  frozen: "凍結",
};

export const URL_STATUS_LABEL: Record<UrlStatus, string> = {
  verified: "稼働確認済み",
  documented: "稼働未確認",
  unknown: "URL未確認",
};

export const AUTH_LABEL: Record<AuthKind, string> = {
  oauth: "OAuth ログイン",
  "own-login": "アプリ独自ログイン",
  password: "パスワード",
  public: "ログインなし",
  line: "LINE",
  chat: "Telegram / Slack",
  unknown: "未確認",
};
