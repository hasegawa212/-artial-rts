// tools/icon-master.svg からホーム画面用の PNG を作る（Playwright の Chromium で描画）。
//   node tools/gen-icons.mjs
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const svg = readFileSync(new URL("./icon-master.svg", import.meta.url), "utf8");
const OUT = [
  ["src/app/apple-icon.png", 180, 1],
  ["public/icons/icon-192.png", 192, 1],
  ["public/icons/icon-512.png", 512, 1],
  // maskable：背景は全面のまま、図形（#fg）だけ 80% に縮める（Android の丸・角丸の切り抜きで欠けないように）
  ["public/icons/icon-maskable-512.png", 512, 0.8],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [path, size, scale] of OUT) {
  await page.setViewportSize({ width: size, height: size });
  const art = svg
    .replace("<svg ", `<svg width="${size}" height="${size}" `)
    .replace('<g id="fg">', `<g id="fg" transform="translate(256 256) scale(${scale}) translate(-256 -256)">`);
  await page.setContent(`<html><body style="margin:0">${art}</body></html>`);
  await page.screenshot({ path, omitBackground: false });
  console.log("wrote", path);
}
await browser.close();
