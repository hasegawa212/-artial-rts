// tools/icon-master.svg からホーム画面用の PNG を作る（Playwright の Chromium で描画）。
//   node tools/gen-icons.mjs
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const svg = readFileSync(new URL("./icon-master.svg", import.meta.url), "utf8");
const OUT = [
  ["src/app/apple-icon.png", 180, 1],
  ["public/icons/icon-192.png", 192, 1],
  ["public/icons/icon-512.png", 512, 1],
  // maskable：Android が丸や角丸に切り抜いても図形が欠けないよう 80% に縮める
  ["public/icons/icon-maskable-512.png", 512, 0.8],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [path, size, scale] of OUT) {
  await page.setViewportSize({ width: size, height: size });
  const inner = Math.round(size * scale);
  await page.setContent(
    `<html><body style="margin:0;background:#0b1a33;display:grid;place-items:center;width:${size}px;height:${size}px">` +
      `<div style="width:${inner}px;height:${inner}px">${svg.replace("<svg ", `<svg width="${inner}" height="${inner}" `)}</div></body></html>`,
  );
  await page.screenshot({ path, omitBackground: false });
  console.log("wrote", path);
}
await browser.close();
