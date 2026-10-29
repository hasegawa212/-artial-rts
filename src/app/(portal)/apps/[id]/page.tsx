import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { canSeeApp, roleLabel } from "@/domain/rbac";
import { categoryLabel } from "@/domain/categories";
import { AUTH_LABEL, LIFECYCLE_LABEL, URL_STATUS_LABEL } from "@/domain/labels";
import { LAUNCH_REASON_LABEL, resolveLaunch } from "@/domain/launch";
import { requireUser, repo } from "@/server/context";
import { AppIcon } from "@/components/AppIcon";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LaunchButton } from "@/components/LaunchButton";

export default async function AppDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ blocked?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const app = await repo().getApp(id);
  // 権限のないアプリは存在自体を見せない
  if (!app || !canSeeApp(user, app)) notFound();
  const fav = (await repo().getPrefs(user.sub)).favorites.includes(app.id);
  const launch = resolveLaunch(app, user);
  const { blocked } = await searchParams;

  const rows: [string, React.ReactNode][] = [
    ["カテゴリー", categoryLabel(app.category)],
    ["状態", LIFECYCLE_LABEL[app.lifecycle]],
    ["URL", app.url ? <span className="break-all">{app.url}</span> : "—"],
    ["URLの確認状況", URL_STATUS_LABEL[app.urlStatus]],
    ["URLの出典", app.urlSource ?? "未確認"],
    ["認証方式", `${AUTH_LABEL[app.auth]}${app.authNote && app.authNote !== "未確認" ? ` — ${app.authNote}` : ""}`],
    ["管理者", app.owner],
    ["リポジトリ", `${app.repo}${app.path ? ` / ${app.path}` : ""}`],
    ["閲覧できるロール", `${roleLabel(app.visibility)} 以上`],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/apps" className="inline-flex items-center gap-1 text-sm text-muted hover:text-gold">
        <ChevronLeft className="size-4" aria-hidden />
        すべてのアプリ
      </Link>
      {blocked && blocked in LAUNCH_REASON_LABEL && (
        <p role="alert" className="card border-danger/40 px-4 py-3 text-sm text-danger">
          {LAUNCH_REASON_LABEL[blocked as keyof typeof LAUNCH_REASON_LABEL]}
        </p>
      )}
      <section className="card p-6 md:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-navy text-gold-soft ring-1 ring-gold-soft/30">
            <AppIcon name={app.icon} className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold leading-snug md:text-2xl">{app.name}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone={app.lifecycle === "production" ? "ok" : "muted"}>{LIFECYCLE_LABEL[app.lifecycle]}</Badge>
              <Badge tone={app.urlStatus === "verified" ? "gold" : "muted"}>{URL_STATUS_LABEL[app.urlStatus]}</Badge>
              {app.confidential && <Badge tone="danger">社外秘</Badge>}
            </div>
          </div>
          <FavoriteButton appId={app.id} name={app.name} initial={fav} />
        </div>
        <p className="mt-6 text-sm leading-relaxed">{app.description}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <LaunchButton appId={app.id} result={launch} size="lg" />
          {launch.ok && launch.warning === "unverified" && (
            <p className="text-xs text-muted">デプロイ設定に記載のURLです。稼働はまだ確認されていません。</p>
          )}
        </div>
        <p className="mt-4 text-xs text-muted">ログインや権限の確認は、開いた先のアプリ側で行われます。</p>
      </section>
      <section className="card overflow-hidden">
        <h2 className="border-b border-line px-6 py-3 text-sm font-semibold">アプリ情報</h2>
        <dl className="divide-y divide-line">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-6 py-3 text-sm sm:grid-cols-[10rem_1fr]">
              <dt className="text-muted">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
