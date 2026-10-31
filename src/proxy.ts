import { NextResponse, type NextRequest } from "next/server";
import { openSession, SESSION_COOKIE } from "@/server/session";

/** 未ログインはログイン画面へ。ロール判定は各ページ・API でも必ず行う（多層防御）。 */
export async function proxy(req: NextRequest) {
  const secret = process.env.SESSION_SECRET ?? "";
  const session = secret.length >= 32 ? await openSession(req.cookies.get(SESSION_COOKIE)?.value, secret) : null;
  if (session) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) return new NextResponse("Unauthorized", { status: 401 });
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|icons/).*)"],
};
