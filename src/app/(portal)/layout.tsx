import Link from "next/link";
import { cookies } from "next/headers";
import { LogOut } from "lucide-react";
import { can, roleLabel } from "@/domain/rbac";
import { visibleApps } from "@/domain/catalog";
import { requireUser, repo } from "@/server/context";
import { BottomNav, SidebarNav } from "@/components/Nav";
import { CommandPalette, SearchTrigger } from "@/components/CommandPalette";
import { ThemeToggle, type Theme } from "@/components/ThemeToggle";
import { Brand } from "@/components/Brand";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const apps = visibleApps(await repo().listApps(), user);
  const t = (await cookies()).get("mao_theme")?.value;
  const theme: Theme = t === "light" || t === "dark" ? t : "system";
  const palette = apps.map(({ id, name, kana, description, keywords, category, icon }) => ({ id, name, kana, description, keywords, category, icon }));

  return (
    <div className="md:grid md:min-h-dvh md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface px-4 py-6 md:flex">
        <Brand />
        <div className="hairline my-6" />
        <SidebarNav showAdmin={can(user, "admin:view")} />
        <div className="mt-auto space-y-4">
          <ThemeToggle initial={theme} />
          <div className="flex items-center gap-3 rounded-lg border border-line p-3">
            <span className="grid size-9 place-items-center rounded-full bg-navy text-sm font-semibold text-gold-soft">{user.name.slice(0, 1)}</span>
            <Link href="/profile" className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{user.name}</span>
              <span className="block text-xs text-muted">{roleLabel(user.role)}</span>
            </Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-text" aria-label="ログアウト" title="ログアウト">
                <LogOut className="size-4" strokeWidth={1.7} aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur md:px-8">
          <div className="md:hidden">
            <Brand compact />
          </div>
          <div className="hidden flex-1 md:block">
            <SearchTrigger />
          </div>
          <div className="ml-auto md:hidden">
            <ThemeToggle initial={theme} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-12">{children}</main>
      </div>

      <BottomNav />
      <CommandPalette apps={palette} />
    </div>
  );
}
