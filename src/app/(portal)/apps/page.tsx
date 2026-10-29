import Link from "next/link";
import type { Metadata } from "next";
import { appsByCategory, CATEGORIES, visibleApps } from "@/domain/catalog";
import { searchApps } from "@/domain/search";
import { requireUser, repo } from "@/server/context";
import { AppCard } from "@/components/AppCard";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "すべてのアプリ" };

export default async function AppsPage({ searchParams }: { searchParams: Promise<{ q?: string; c?: string }> }) {
  const user = await requireUser();
  const { q = "", c } = await searchParams;
  const all = visibleApps(await repo().listApps(), user);
  const favs = new Set((await repo().getPrefs(user.sub)).favorites);
  const filtered = searchApps(c ? all.filter((a) => a.category === c) : all, q);
  const groups = q ? null : appsByCategory(filtered);
  const chip = (href: string, label: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
        active ? "border-gold-soft bg-gold-wash text-gold" : "border-line text-muted hover:text-text",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-wide">すべてのアプリ</h1>
          <p className="mt-1 text-sm text-muted">{filtered.length} 件</p>
        </div>
        <form className="md:ml-auto md:w-80" role="search">
          {c && <input type="hidden" name="c" value={c} />}
          <label className="sr-only" htmlFor="q">
            アプリを絞り込む
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="名前・用途・キーワード"
            className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-gold-soft"
          />
        </form>
      </header>
      <nav aria-label="カテゴリー" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {chip(q ? `/apps?q=${encodeURIComponent(q)}` : "/apps", "すべて", !c)}
        {CATEGORIES.map((cat) => chip(`/apps?c=${cat.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`, cat.label, c === cat.id))}
      </nav>

      {filtered.length === 0 && <p className="py-16 text-center text-sm text-muted">該当するアプリはありません。</p>}

      {groups
        ? groups.map(({ category, apps }) => (
            <section key={category.id} aria-labelledby={`h-${category.id}`}>
              <h2 id={`h-${category.id}`} className="mb-3 flex items-center gap-3 text-sm font-semibold tracking-wide text-muted">
                {category.label}
                <span className="h-px flex-1 bg-line" aria-hidden />
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {apps.map((a) => (
                  <AppCard key={a.id} app={a} user={user} favorite={favs.has(a.id)} />
                ))}
              </div>
            </section>
          ))
        : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <AppCard key={a.id} app={a} user={user} favorite={favs.has(a.id)} />
              ))}
            </div>
          )}
    </div>
  );
}
