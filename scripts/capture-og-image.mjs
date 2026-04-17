import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const output = join(__dirname, "..", "public", "og-image.jpg");

const url = process.argv[2] ?? "http://localhost:4321/en/";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  extraHTTPHeaders: { Cookie: "poseidon_locale=en" }
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.screenshot({ path: output, type: "jpeg", quality: 88, fullPage: false });
await browser.close();

console.log(`Saved ${output}`);
