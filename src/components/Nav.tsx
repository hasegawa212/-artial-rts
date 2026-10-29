"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, Shield, Star, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { openPalette } from "./CommandPalette";

const ITEMS = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/apps", label: "すべてのアプリ", short: "アプリ", icon: LayoutGrid },
  { href: "/favorites", label: "お気に入り", icon: Star },
  { href: "/profile", label: "プロフィール", short: "マイページ", icon: User },
];

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
}

export function SidebarNav({ showAdmin }: { showAdmin: boolean }) {
  const path = usePathname();
  const items = showAdmin ? [...ITEMS, { href: "/admin", label: "管理者", icon: Shield }] : ITEMS;
  return (
    <nav aria-label="メイン" className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(path, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active ? "bg-gold-wash text-gold" : "text-muted hover:bg-surface-2 hover:text-text",
            )}
          >
            {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold-soft" aria-hidden />}
            <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const path = usePathname();
  const [home, apps, fav, me] = ITEMS as [(typeof ITEMS)[0], (typeof ITEMS)[0], (typeof ITEMS)[0], (typeof ITEMS)[0]];
  const cell = "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] min-h-14";
  const link = (it: (typeof ITEMS)[0]) => {
    const active = isActive(path, it.href);
    const Icon = it.icon;
    return (
      <Link key={it.href} href={it.href} aria-current={active ? "page" : undefined} className={cn(cell, active ? "text-gold" : "text-muted")}>
        <Icon className="size-5" strokeWidth={1.6} aria-hidden />
        {it.short ?? it.label}
      </Link>
    );
  };
  return (
    <nav
      aria-label="メイン（スマホ）"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {link(home)}
      {link(apps)}
      <button type="button" onClick={openPalette} className={cn(cell, "text-muted")} aria-label="アプリを検索">
        <span className="grid size-9 place-items-center rounded-full bg-gold-soft text-[#14100a] -mt-4 shadow-md">
          <Search className="size-[18px]" strokeWidth={2} aria-hidden />
        </span>
        検索
      </button>
      {link(fav)}
      {link(me)}
    </nav>
  );
}
