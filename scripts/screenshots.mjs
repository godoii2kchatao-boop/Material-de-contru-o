// Usage: node scripts/screenshots.mjs <outDir> [baseUrl]
import { chromium } from 'playwright';
const out = process.argv[2] ?? 'screenshots';
const base = process.argv[3] ?? 'http://localhost:3000';
const pages = [['home', '/'], ['produtos', '/produtos'], ['produto', '/produtos/cimento-cp-ii-f-32-50-kg'], ['orcamento', '/orcamento'], ['calculadoras', '/calculadoras'], ['entrega', '/entrega'], ['enviar-lista', '/enviar-lista'], ['profissionais', '/profissionais'], ['ofertas', '/ofertas']];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium' });
for (const [vw, vh, tag, dsf] of [[1440, 900, 'desktop', 1], [390, 844, 'mobile', 1]]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: dsf, isMobile: tag === 'mobile', hasTouch: tag === 'mobile' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', tag, e.message));
  page.on('console', (m) => m.type() === 'error' && console.error('[console]', tag, m.text()));
  for (const [name, path] of pages) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(name === 'home' ? 3200 : 600);
    await page.screenshot({ path: `${out}/${name}-${tag}.png` });
    await page.screenshot({ path: `${out}/${name}-${tag}-full.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
