"use client";

import { useTransition, useState } from "react";
import { setUrlStatusAction, setUserRoleAction } from "@/app/actions";

const sel = "h-8 rounded-md border border-line bg-surface px-2 text-xs outline-none focus:border-gold-soft disabled:opacity-50";

export function RoleSelect({ sub, role, label, disabled }: { sub: string; role: string; label: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  return (
    <span className="inline-flex items-center gap-2">
      <select
        aria-label={`${label} のロール`}
        className={sel}
        defaultValue={role}
        disabled={disabled || pending}
        onChange={(e) => {
          const v = e.target.value;
          start(async () => {
            try {
              setErr("");
              await setUserRoleAction(sub, v);
            } catch (x) {
              setErr(x instanceof Error ? x.message : "変更できませんでした");
            }
          });
        }}
      >
        <option value="member">メンバー</option>
        <option value="manager">マネージャー</option>
        <option value="admin">管理者</option>
      </select>
      {err && <span className="text-xs text-danger">{err}</span>}
    </span>
  );
}

export function UrlStatusSelect({ appId, status, hasUrl, label }: { appId: string; status: string; hasUrl: boolean; label: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label={`${label} のURL確認状況`}
      className={sel}
      defaultValue={status}
      disabled={pending || !hasUrl}
      onChange={(e) => {
        const v = e.target.value;
        start(() => setUrlStatusAction(appId, v));
      }}
    >
      <option value="verified">稼働確認済み</option>
      <option value="documented">稼働未確認</option>
      <option value="unknown">URL未確認</option>
    </select>
  );
}
