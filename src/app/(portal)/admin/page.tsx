import Link from "next/link";
import type { Metadata } from "next";
import { can, roleLabel } from "@/domain/rbac";
import { categoryLabel } from "@/domain/categories";
import { LIFECYCLE_LABEL, URL_STATUS_LABEL, AUTH_LABEL } from "@/domain/labels";
import { requireUser, repo } from "@/server/context";
import { RoleSelect, UrlStatusSelect } from "@/components/AdminControls";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "管理者" };

const TABS = [
  { id: "apps", label: "アプリ台帳" },
  { id: "users", label: "利用者とロール" },
  { id: "audit", label: "監査ログ" },
] as const;

const fmt = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("ja-JP", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(d) : "—";

export default async function Admin({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser("admin:view");
  const { tab = "apps" } = await searchParams;
  const editApps = can(user, "admin:apps:edit");
  const editUsers = can(user, "admin:users:edit");
  const apps = await repo().listApps();
  const counts = {
    verified: apps.filter((a) => a.urlStatus === "verified").length,
    documented: apps.filter((a) => a.urlStatus === "documented").length,
    unknown: apps.filter((a) => a.urlStatus === "unknown").length,
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-wide">管理者</h1>
        <p className="mt-1 text-sm text-muted">
          {roleLabel(user.role)} として表示中{editApps ? "" : "（閲覧のみ）"}
        </p>
      </header>
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
          <div key={k} className="card p-4">
            <p className="text-xs text-muted">{URL_STATUS_LABEL[k]}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{counts[k]}</p>
          </div>
        ))}
      </div>
      <nav aria-label="管理メニュー" className="flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={cn("-mb-px border-b-2 px-4 py-2 text-sm", tab === t.id ? "border-gold-soft text-gold" : "border-transparent text-muted hover:text-text")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "apps" && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">アプリ</th>
                <th className="px-4 py-3 font-medium">カテゴリー</th>
                <th className="px-4 py-3 font-medium">状態</th>
                <th className="px-4 py-3 font-medium">認証</th>
                <th className="px-4 py-3 font-medium">閲覧</th>
                <th className="px-4 py-3 font-medium">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {apps.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    <Link href={`/apps/${a.id}`} className="font-medium hover:text-gold">
                      {a.name}
                    </Link>
                    <span className="block text-xs text-muted">{a.repo}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{categoryLabel(a.category)}</td>
                  <td className="px-4 py-3 text-muted">{LIFECYCLE_LABEL[a.lifecycle]}</td>
                  <td className="px-4 py-3 text-muted">{AUTH_LABEL[a.auth]}</td>
                  <td className="px-4 py-3 text-muted">{roleLabel(a.visibility)}</td>
                  <td className="px-4 py-3">
                    {editApps ? (
                      <UrlStatusSelect appId={a.id} status={a.urlStatus} hasUrl={!!a.url} label={a.name} />
                    ) : (
                      <span className="text-muted">{URL_STATUS_LABEL[a.urlStatus]}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && <UsersTab editable={editUsers} me={user.sub} />}
      {tab === "audit" && <AuditTab />}
    </div>
  );
}

async function UsersTab({ editable, me }: { editable: boolean; me: string }) {
  const users = await repo().listUsers();
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">氏名</th>
            <th className="px-4 py-3 font-medium">メール</th>
            <th className="px-4 py-3 font-medium">最終ログイン</th>
            <th className="px-4 py-3 font-medium">ロール</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((u) => (
            <tr key={u.sub}>
              <td className="px-4 py-3 font-medium">{u.name}</td>
              <td className="px-4 py-3 text-muted">{u.email}</td>
              <td className="px-4 py-3 text-muted tabular-nums">{fmt(u.lastLoginAt)}</td>
              <td className="px-4 py-3">
                {editable ? <RoleSelect sub={u.sub} role={u.role} label={u.name} disabled={u.sub === me} /> : roleLabel(u.role)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line px-4 py-3 text-xs text-muted">
        ADMIN_EMAILS / MANAGER_EMAILS に書かれた人は、ログインのたびにそのロール以上になります。自分自身の管理者権限は外せません。
      </p>
    </div>
  );
}

async function AuditTab() {
  const log = await repo().listAudit(100);
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">日時</th>
            <th className="px-4 py-3 font-medium">利用者</th>
            <th className="px-4 py-3 font-medium">操作</th>
            <th className="px-4 py-3 font-medium">対象</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {log.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-muted">
                まだ記録はありません
              </td>
            </tr>
          )}
          {log.map((e) => (
            <tr key={e.id}>
              <td className="px-4 py-2.5 text-muted tabular-nums">{fmt(e.at)}</td>
              <td className="px-4 py-2.5">{e.actor}</td>
              <td className="px-4 py-2.5 font-mono text-xs">{e.action}</td>
              <td className="px-4 py-2.5 text-muted">
                {e.target ?? ""}
                {e.detail ? ` → ${e.detail}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
