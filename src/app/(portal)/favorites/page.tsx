import type { Metadata } from "next";
import { visibleApps } from "@/domain/catalog";
import { requireUser, repo } from "@/server/context";
import { AppCard } from "@/components/AppCard";

export const metadata: Metadata = { title: "お気に入り" };

export default async function Favorites() {
  const user = await requireUser();
  const byId = new Map(visibleApps(await repo().listApps(), user).map((a) => [a.id, a]));
  const favs = (await repo().getPrefs(user.sub)).favorites.map((id) => byId.get(id)).filter((a) => a !== undefined);
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-wide">お気に入り</h1>
      {favs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-12 text-center text-sm text-muted">まだありません。アプリカードの ☆ を押して追加できます。</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((a) => (
            <AppCard key={a.id} app={a} user={user} favorite />
          ))}
        </div>
      )}
    </div>
  );
}
