import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4", {
  variants: {
    tone: {
      gold: "border-gold-soft/50 bg-gold-wash text-gold",
      ok: "border-ok/40 text-ok",
      muted: "border-line text-muted",
      danger: "border-danger/40 text-danger",
    },
  },
  defaultVariants: { tone: "muted" },
});

export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
