"use client";

import { useOptimistic, useTransition } from "react";
import { Star } from "lucide-react";
import { toggleFavoriteAction } from "@/app/actions";
import { cn } from "@/lib/cn";

export function FavoriteButton({ appId, name, initial, className }: { appId: string; name: string; initial: boolean; className?: string }) {
  const [on, setOn] = useOptimistic(initial);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `${name} をお気に入りから外す` : `${name} をお気に入りに追加`}
      onClick={() =>
        start(async () => {
          setOn(!on);
          await toggleFavoriteAction(appId);
        })
      }
      className={cn("grid size-9 place-items-center rounded-lg transition-colors hover:bg-surface-2", on ? "text-gold" : "text-muted", className)}
    >
      <Star className="size-[18px]" strokeWidth={1.7} fill={on ? "currentColor" : "none"} aria-hidden />
    </button>
  );
}
