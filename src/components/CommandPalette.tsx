"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchApps } from "@/domain/search";
import { categoryLabel } from "@/domain/categories";
import type { AppEntry } from "@/domain/types";
import { AppIcon } from "./AppIcon";

export type PaletteApp = Pick<AppEntry, "id" | "name" | "kana" | "description" | "keywords" | "category" | "icon">;

const EVENT = "mao:open-palette";
export function openPalette() {
  window.dispatchEvent(new Event(EVENT));
}

/** 全アプリ検索（⌘K / Ctrl+K / 「/」）。候補は閲覧権限のあるアプリだけがサーバーから渡される。 */
export function CommandPalette({ apps }: { apps: PaletteApp[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = useMemo(() => searchApps(apps, q).slice(0, 8), [apps, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setI(0);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [open]);

  if (!open) return null;
  const go = (id: string) => {
    setOpen(false);
    router.push(`/apps/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="アプリを検索"
        className="card fade-in w-full max-w-xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-gold" strokeWidth={1.6} aria-hidden />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setI(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "ArrowDown") (e.preventDefault(), setI((x) => Math.min(x + 1, results.length - 1)));
              if (e.key === "ArrowUp") (e.preventDefault(), setI((x) => Math.max(x - 1, 0)));
              if (e.key === "Enter" && results[i]) go(results[i].id);
            }}
            placeholder="アプリ名・用途・キーワードで検索"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[i] ? `pal-${results[i].id}` : undefined}
          />
          <kbd className="hidden rounded border border-line px-1.5 text-[11px] text-muted sm:block">Esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">見つかりませんでした</li>}
          {results.map((a, n) => (
            <li
              key={a.id}
              id={`pal-${a.id}`}
              role="option"
              aria-selected={n === i}
              onMouseEnter={() => setI(n)}
              onClick={() => go(a.id)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 ${n === i ? "bg-gold-wash" : ""}`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-gold">
                <AppIcon name={a.icon} className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{a.name}</span>
                <span className="block truncate text-xs text-muted">{categoryLabel(a.category)} · {a.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={openPalette}
      className="flex h-10 w-full max-w-md items-center gap-3 rounded-lg border border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-gold-soft"
    >
      <Search className="size-4" strokeWidth={1.8} aria-hidden />
      <span className="flex-1 text-left">アプリを検索…</span>
      <kbd className="hidden rounded border border-line px-1.5 text-[11px] sm:block">⌘K</kbd>
    </button>
  );
}
