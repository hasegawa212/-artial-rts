import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MARTIAL ARTS ONE", template: "%s | MARTIAL ARTS ONE" },
  description: "株式会社 Martial Arts の業務アプリを一つに。",
  robots: { index: false, follow: false },
  // iPhone の「ホーム画面に追加」での名前（アイコンは app/apple-icon.png）
  appleWebApp: { capable: true, title: "MA ONE", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#07080b" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("mao_theme")?.value;
  return (
    <html lang="ja" data-theme={theme === "light" || theme === "dark" ? theme : undefined} suppressHydrationWarning>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
