import { NextResponse } from "next/server";
import { resolveLaunch } from "@/domain/launch";
import { currentUser, repo } from "@/server/context";
import { isSameOrigin } from "@/server/cookies";

/**
 * アプリを開く。権限・URL の安全性を確認し、利用履歴と監査ログを残してから
 * 起動先へ 303 で移動するだけ。起動先の認証には一切触れない。
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return new NextResponse("Forbidden", { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);
  const { id } = await ctx.params;
  const app = await repo().getApp(id);
  if (!app) return new NextResponse("Not Found", { status: 404 });
  const r = resolveLaunch(app, user);
  if (!r.ok) return NextResponse.redirect(new URL(`/apps/${encodeURIComponent(id)}?blocked=${r.reason}`, req.url), 303);
  await repo().recordUse(user.sub, app.id);
  await repo().audit({ actor: user.sub, action: "app.launch", target: app.id });
  return NextResponse.redirect(r.url, 303);
}
