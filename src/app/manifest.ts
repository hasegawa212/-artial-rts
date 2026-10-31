import type { MetadataRoute } from "next";

// 「ホーム画面に追加」したときの名前・アイコン・起動のしかた（Android / PC の Chrome など）。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MARTIAL ARTS ONE",
    short_name: "MA ONE",
    description: "株式会社 Martial Arts の業務アプリを一つに。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b1a33",
    theme_color: "#0b1a33",
    lang: "ja",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
