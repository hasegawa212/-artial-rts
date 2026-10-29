import Link from "next/link";
import { ChevronRight, Clock, Star } from "lucide-react";
import { appsByCategory, visibleApps } from "@/domain/catalog";
import { requireUser, repo } from "@/server/context";
import { AppCard } from "@/components/AppCard";
import { AppIcon } from "@/components/AppIcon";
import { SearchTrigger } from "@/components/CommandPalette";

function greeting(d = new Date()) {
  const h = Number(new Intl.DateTimeFormat("ja-JP", { hour: "numeric", hour12: false, timeZone: "Asia/Tokyo" }).format(d).replace(/\D/g, ""));
  return h < 11 ? "おはようございます" : h < 18 ? "こんにちは" : "おつかれさまです";
}

export default async function Home({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const apps = visibleApps(await repo().listApps(), user);
  const prefs = await repo().getPrefs(user.sub);
  const byId = new Map(apps.map((a) => [a.id, a]));
  const favs = prefs.favorites.map((id) => byId.get(id)).filter((a) => a !== undefined);
  const recent = prefs.recent.map((id) => byId.get(id)).filter((a) => a !== undefined);
  const favSet = new Set(prefs.favorites);
  const groups = appsByCategory(apps);
  const { denied } = await searchParams;

  return (
    <div className="space-y-10">
      {denied && (
        <p role="alert" className="card border-danger/40 px-4 py-3 text-sm text-danger">
          そのページを開く権限がありません。
        </p>
      )}
      <section className="relative overflow-hidden rounded-2xl bg-navy px-6 py-8 text-[#ece8de] md:px-10 md:py-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border border-gold-soft/20" aria-hidden />
        <div className="pointer-events-none absolute -right-4 top-10 size-40 rounded-full border border-gold-soft/10" aria-hidden />
        <p className="wordmark text-[11px] text-gold-soft">MARTIAL ARTS ONE</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-wide md:text-3xl">
          {greeting()}、{user.name} さん
        </h1>
        <p className="mt-2 text-sm text-[#b9bfcc]">業務アプリ {apps.length} 件を、ここからひとつで。</p>
        <div className="mt-6 md:hidden [&_button]:bg-[#0d1424] [&_button]:border-[#1f2a42] [&_button]:text-[#98a0b3]">
          <SearchTrigger />
        </div>
      </section>

      <section aria-labelledby="fav-h">
        <SectionHead id="fav-h" icon={<Star className="size-4" />} title="お気に入り" href="/favorites" />
        {favs.length === 0 ? (
          <Empty>カードの ☆ を押すと、ここに並びます。</Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favs.slice(0, 6).map((a) => (
              <AppCard key={a.id} app={a} user={user} favorite />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="recent-h">
        <SectionHead id="recent-h" icon={<Clock className="size-4" />} title="最近使用したアプリ" />
        {recent.length === 0 ? (
          <Empty>「開く」から起動したアプリが、ここに残ります。</Empty>
        ) : (
          <ul className="flex gap-3 overflow-x-auto pb-1">
            {recent.map((a) => (
              <li key={a.id} className="shrink-0">
                <Link href={`/apps/${a.id}`} className="card lift flex w-44 items-center gap-3 p-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-surface-2 text-gold">
                    <AppIcon name={a.icon} className="size-[18px]" />
                  </span>
                  <span className="line-clamp-2 text-xs font-medium">{a.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="cat-h">
        <SectionHead id="cat-h" title="カテゴリー" href="/apps" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {groups.map(({ category, apps }) => (
            <Link key={category.id} href={`/apps?c=${category.id}`} className="card lift flex items-center gap-3 p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-gold-wash text-gold">
                <AppIcon name={category.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-medium">{category.label}</span>
                <span className="text-xs text-muted">{apps.length} 件</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="all-h">
        <SectionHead id="all-h" title="すぐに開けるアプリ" href="/apps" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps
            .filter((a) => a.url && a.urlStatus !== "unknown" && a.lifecycle !== "frozen")
            .map((a) => (
              <AppCard key={a.id} app={a} user={user} favorite={favSet.has(a.id)} />
            ))}
        </div>
      </section>
    </div>
  );
}

function SectionHead({ id, title, icon, href }: { id: string; title: string; icon?: React.ReactNode; href?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {icon && <span className="text-gold">{icon}</span>}
      <h2 id={id} className="text-base font-semibold tracking-wide">
        {title}
      </h2>
      {href && (
        <Link href={href} className="ml-auto flex items-center text-xs text-muted hover:text-gold">
          すべて見る
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{children}</p>;
}
