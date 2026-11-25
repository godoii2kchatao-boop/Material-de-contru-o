// Scrolls through a page and captures the viewport at each step (sticky sections and lazy images behave as for a visitor).
import { chromium } from 'playwright';
const [out, path = '/', w = '1440', h = '900', tag = 'd'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, isMobile: +w < 600, hasTouch: +w < 600 });
const page = await ctx.newPage();
await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < total; y += +h * 0.9) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/${tag}-${String(i++).padStart(2, '0')}.png` });
}
console.log('shots', i, 'height', total);
await browser.close();
