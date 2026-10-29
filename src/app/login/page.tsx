import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "@/server/env";
import { currentUser } from "@/server/context";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "ログイン" };

const ERRORS: Record<string, string> = {
  domain: "社内アカウントでログインしてください。",
  unverified: "メールアドレスが確認されていないアカウントです。",
  "no-email": "アカウントのメールアドレスを取得できませんでした。",
  expired: "ログインの有効期限が切れました。もう一度お試しください。",
  oidc: "認証に失敗しました。もう一度お試しください。",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentUser()) redirect("/");
  const e = env();
  const { error } = await searchParams;
  const dev = e.AUTH_MODE === "dev" && e.NODE_ENV !== "production";
  return (
    <main className="grid min-h-dvh md:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-navy p-12 text-[#ece8de] md:flex md:flex-col">
        <div className="pointer-events-none absolute -bottom-40 -left-24 size-[520px] rounded-full border border-gold-soft/20" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 left-24 size-[320px] rounded-full border border-gold-soft/10" aria-hidden />
        <p className="wordmark text-xs text-gold-soft">株式会社 MARTIAL ARTS</p>
        <div className="mt-auto">
          <h1 className="wordmark text-5xl leading-tight text-[#f3eee2]">
            MARTIAL ARTS
            <br />
            <span className="text-gold-soft">ONE</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#b9bfcc]">すべての業務アプリを、ひとつの入口から。</p>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="wordmark text-center text-sm text-gold md:hidden">MARTIAL ARTS ONE</p>
          <h2 className="mt-6 text-center text-xl font-semibold md:mt-0 md:text-left">ログイン</h2>
          <p className="mt-2 text-center text-sm text-muted md:text-left">社内アカウントで続けてください。</p>
          {error && (
            <p role="alert" className="mt-6 rounded-lg border border-danger/40 px-4 py-3 text-sm text-danger">
              {ERRORS[error] ?? "ログインできませんでした。"}
            </p>
          )}
          {e.AUTH_MODE === "oidc" && (
            <a href="/api/auth/login" className={buttonVariants({ variant: "gold", size: "lg" }) + " mt-8 w-full"}>
              社内アカウントでログイン
            </a>
          )}
          {dev && (
            <div className="mt-8 space-y-3">
              <p className="rounded-lg border border-dashed border-gold-soft/60 px-3 py-2 text-xs text-gold">開発モード（AUTH_MODE=dev）— 本番では無効</p>
              {(["member", "manager", "admin"] as const).map((r) => (
                <form key={r} action="/api/auth/dev" method="post">
                  <input type="hidden" name="role" value={r} />
                  <button type="submit" className={buttonVariants({ variant: r === "admin" ? "gold" : "outline", size: "lg" }) + " w-full"}>
                    {{ member: "メンバー", manager: "マネージャー", admin: "管理者" }[r]}としてログイン
                  </button>
                </form>
              ))}
            </div>
          )}
          <p className="mt-10 text-center text-xs text-muted">各アプリのログイン・権限は、それぞれのアプリで確認されます。</p>
        </div>
      </section>
    </main>
  );
}
