import Link from "next/link";
import { categoryLabel } from "@/domain/categories";
import { LIFECYCLE_LABEL, URL_STATUS_LABEL } from "@/domain/labels";
import { resolveLaunch } from "@/domain/launch";
import type { AppEntry, PortalUser } from "@/domain/types";
import { AppIcon } from "./AppIcon";
import { Badge } from "./ui/badge";
import { FavoriteButton } from "./FavoriteButton";
import { LaunchButton } from "./LaunchButton";

export function AppCard({ app, user, favorite }: { app: AppEntry; user: PortalUser; favorite: boolean }) {
  const launch = resolveLaunch(app, user);
  return (
    <article className="card lift fade-in flex flex-col p-4" data-app={app.id}>
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-gradient-to-br from-surface-2 to-surface text-gold">
          <AppIcon name={app.icon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug">
            <Link href={`/apps/${app.id}`} className="hover:text-gold">
              {app.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-muted">{categoryLabel(app.category)}</p>
        </div>
        <FavoriteButton appId={app.id} name={app.name} initial={favorite} className="-mr-1 -mt-1" />
      </div>
      <p className="mt-3 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted">{app.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <Badge tone={app.lifecycle === "production" ? "ok" : app.lifecycle === "frozen" ? "danger" : "muted"}>{LIFECYCLE_LABEL[app.lifecycle]}</Badge>
        <Badge tone={app.urlStatus === "verified" ? "gold" : "muted"}>{URL_STATUS_LABEL[app.urlStatus]}</Badge>
        {app.confidential && <Badge tone="danger">社外秘</Badge>}
        <span className="ml-auto">
          {launch.ok ? (
            <LaunchButton appId={app.id} result={launch} size="sm" />
          ) : (
            <Link href={`/apps/${app.id}`} className="text-xs text-muted hover:text-gold">
              詳細
            </Link>
          )}
        </span>
      </div>
    </article>
  );
}
