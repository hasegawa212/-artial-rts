import { NextResponse } from "next/server";
import { currentUser, repo } from "@/server/context";
import { SESSION_COOKIE } from "@/server/session";
import { isSameOrigin } from "@/server/cookies";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return new NextResponse("Forbidden", { status: 403 });
  const u = await currentUser();
  if (u) await repo().audit({ actor: u.sub, action: "auth.logout" });
  const res = NextResponse.redirect(new URL("/login", req.url), 303);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
