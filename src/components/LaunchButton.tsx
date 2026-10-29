import { ExternalLink, Lock } from "lucide-react";
import { LAUNCH_REASON_LABEL, type LaunchResult } from "@/domain/launch";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/cn";

/** 開ける時は POST フォーム（新しいタブ）。開けない時は理由を表示する。 */
export function LaunchButton({ appId, result, size = "md" }: { appId: string; result: LaunchResult; size?: "sm" | "md" | "lg" }) {
  if (!result.ok) {
    return (
      <span className={cn(buttonVariants({ variant: "ghost", size }), "cursor-default text-muted hover:bg-transparent")} title={LAUNCH_REASON_LABEL[result.reason]}>
        <Lock className="size-4" strokeWidth={1.7} aria-hidden />
        {LAUNCH_REASON_LABEL[result.reason]}
      </span>
    );
  }
  return (
    <form action={`/api/apps/${encodeURIComponent(appId)}/launch`} method="post" target="_blank" rel="noopener noreferrer">
      <button type="submit" className={buttonVariants({ variant: "gold", size })}>
        開く
        <ExternalLink className="size-4" strokeWidth={1.8} aria-hidden />
      </button>
    </form>
  );
}
