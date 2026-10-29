import { NextResponse } from "next/server";
import { env } from "@/server/env";
import { isRole } from "@/domain/rbac";
import { repo } from "@/server/context";
import { sealSession, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/server/session";
import { cookieBase, isSameOrigin } from "@/server/cookies";

/** 開発用ログイン。AUTH_MODE=dev かつ本番以外でのみ動く（env.ts が本番の dev を拒否）。 */
export async function POST(req: Request) {
  const e = env();
  if (e.AUTH_MODE !== "dev" || e.NODE_ENV === "production") return new NextResponse("Not Found", { status: 404 });
  if (!isSameOrigin(req)) return new NextResponse("Forbidden", { status: 403 });
  const role = (await req.formData()).get("role");
  if (!isRole(role)) return new NextResponse("Bad Request", { status: 400 });
  const user = await repo().upsertUser({
    sub: `dev-${role}`,
    email: `dev-${role}@example.invalid`,
    name: { member: "開発 メンバー", manager: "開発 マネージャー", admin: "開発 管理者" }[role],
    role,
  });
  await repo().audit({ actor: user.sub, action: "auth.login", detail: "dev" });
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.set(SESSION_COOKIE, await sealSession(user, e.SESSION_SECRET), { ...cookieBase(), maxAge: SESSION_TTL_SECONDS });
  return res;
}
