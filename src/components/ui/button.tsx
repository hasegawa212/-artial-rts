// shadcn/ui の Button と同じ構成（cva + cn）。トークンだけ本ポータル用。
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        gold: "bg-gold-soft text-[#14100a] hover:bg-gold shadow-sm hover:text-[#fffaf0]",
        outline: "border border-line bg-surface text-text hover:border-gold-soft hover:text-gold",
        ghost: "text-muted hover:text-text hover:bg-surface-2",
        danger: "border border-line text-danger hover:bg-surface-2",
      },
      size: { sm: "h-8 px-3", md: "h-10 px-4", lg: "h-12 px-6 text-base", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
