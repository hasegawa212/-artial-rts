import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Check, Shield } from "lucide-react";
import { can, roleLabel, type Permission } from "@/domain/rbac";
import { requireUser, repo } from "@/server/context";
import { ThemeToggle, type Theme } from "@/components/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "プロフィール" };

const PERMS: [Permission, string][] = [
  ["app:view", "アプリ一覧を見る"],
  ["app:launch", "アプリを開く"],
  ["audit:view", "監査ログを見る"],
  ["admin:apps:edit", "アプリ台帳を編集する"],
  ["admin:users:edit", "利用者のロールを変える"],
];

export default async function Profile() {
  const user = await requireUser();
  const prefs = await repo().getPrefs(user.sub);
  const t = (await cookies()).get("mao_theme")?.value;
  const theme: Theme = t === "light" || t === "dark" ? t : "system";
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold tracking-wide">プロフィール</h1>
      <section className="card flex items-center gap-4 p-6">
        <span className="grid size-16 place-items-center rounded-full bg-navy text-2xl font-semibold text-gold-soft ring-1 ring-gold-soft/40">{user.name.slice(0, 1)}</span>
        <div className="min-w-0">
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-gold">
            <Shield className="size-3.5" aria-hidden />
            {roleLabel(user.role)}
          </p>
        </div>
      </section>
      <section className="card p-6">
        <h2 className="text-sm font-semibold">できること</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {PERMS.map(([p, label]) => (
            <li key={p} className={can(user, p) ? "" : "text-muted line-through decoration-line"}>
              <Check className={`mr-2 inline size-4 ${can(user, p) ? "text-ok" : "opacity-0"}`} aria-hidden />
              {label}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">ロールの変更は管理者に依頼してください。</p>
      </section>
      <section className="card space-y-4 p-6">
        <h2 className="text-sm font-semibold">表示</h2>
        <ThemeToggle initial={theme} withLabels />
        <p className="text-xs text-muted">
          お気に入り {prefs.favorites.length} 件 · 最近使用 {prefs.recent.length} 件
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        {can(user, "admin:view") && (
          <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
            管理者画面へ
          </Link>
        )}
        <form action="/api/auth/logout" method="post">
          <button type="submit" className={buttonVariants({ variant: "danger" })}>
            ログアウト
          </button>
        </form>
      </div>
    </div>
  );
}
