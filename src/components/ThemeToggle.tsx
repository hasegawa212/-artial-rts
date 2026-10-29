"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

export type Theme = "light" | "dark" | "system";
export const THEME_COOKIE = "mao_theme";

const OPTIONS: { v: Theme; label: string; icon: typeof Sun }[] = [
  { v: "light", label: "ライト", icon: Sun },
  { v: "dark", label: "ダーク", icon: Moon },
  { v: "system", label: "端末に合わせる", icon: Monitor },
];

export function ThemeToggle({ initial, withLabels = false }: { initial: Theme; withLabels?: boolean }) {
  const [theme, setTheme] = useState<Theme>(initial);
  // 画面内に複数あっても同じ値を表示する
  useEffect(() => {
    const on = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener("mao:theme", on);
    return () => window.removeEventListener("mao:theme", on);
  }, []);
  const choose = (v: Theme) => window.dispatchEvent(new CustomEvent("mao:theme", { detail: v }));
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);
  return (
    <div role="radiogroup" aria-label="テーマ" className="inline-flex rounded-lg border border-line bg-surface p-0.5">
      {OPTIONS.map(({ v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={theme === v}
          title={label}
          onClick={() => choose(v)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
            theme === v ? "bg-gold-wash text-gold" : "text-muted hover:text-text",
          )}
        >
          <Icon className="size-4" strokeWidth={1.7} aria-hidden />
          <span className={withLabels ? "" : "sr-only"}>{label}</span>
        </button>
      ))}
    </div>
  );
}
