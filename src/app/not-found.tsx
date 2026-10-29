import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="wordmark text-xs text-gold">404</p>
        <h1 className="mt-3 text-xl font-semibold">ページが見つかりません</h1>
        <p className="mt-2 text-sm text-muted">存在しないか、閲覧する権限がありません。</p>
        <Link href="/" className="mt-6 inline-block text-sm text-gold underline-offset-4 hover:underline">
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}
