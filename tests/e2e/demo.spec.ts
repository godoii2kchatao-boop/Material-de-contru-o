import { expect, test, type Page } from '@playwright/test';

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 640;

test.describe('abertura e atalhos', () => {
  test('“Já tenho minha lista” aparece na primeira tela e abre /enviar-lista', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /Já tenho minha lista/ });
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    const vh = page.viewportSize()!.height;
    expect(box, 'atalho visível').not.toBeNull();
    expect(box!.y + box!.height, 'atalho dentro da primeira tela').toBeLessThanOrEqual(vh);
    expect(box!.height, 'alvo de toque confortável').toBeGreaterThanOrEqual(44);
    await expect(page.getByText('Envie uma foto, um PDF ou digite sua lista.')).toBeVisible();
    // Main action stays first and primary.
    await expect(page.getByRole('link', { name: 'Explorar materiais' }).first()).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/enviar-lista$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Já tem sua lista de materiais');
  });

  test('“Solicitar orçamento” abre a lista montada no catálogo', async ({ page }) => {
    await page.goto('/');
    await page.locator('main').getByRole('link', { name: 'Solicitar orçamento' }).click();
    await expect(page).toHaveURL(/\/orcamento$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Minha lista de orçamento' })).toBeVisible();
  });

  test('sem rolagem horizontal na abertura', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('conexão móvel lenta', () => {
  test('busca e botões funcionam enquanto a mídia carrega; “Pular abertura” presente', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP throttling');
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    // Roughly "Slow 4G": 400 ms RTT, 1.6 Mbps down.
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'Pular abertura' })).toBeVisible();
    // Interact before images finish.
    const search = page.getByRole('combobox', { name: 'Buscar materiais' }).first();
    await search.fill('cimento');
    await search.press('Enter');
    await expect(page).toHaveURL(/\/produtos\?q=cimento/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 2, name: /produtos? para “cimento”/ })).toBeVisible({ timeout: 30_000 });
  });

  test('fotos dos mais procurados: espaço reservado, lazy e sem salto de layout', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP throttling');
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const section = page.locator('section[aria-labelledby="pop-title"]');
    const photos = section.locator('img[alt]');
    // Without licensed photos registered yet, the cards keep the category icon: skip the photo checks.
    test.skip((await photos.count()) === 0, 'nenhuma foto de produto cadastrada no catálogo');
    expect(await photos.count(), 'cards com foto').toBeGreaterThanOrEqual(6);
    for (const loading of await photos.evaluateAll((els) => els.map((e) => e.getAttribute('loading')))) expect(loading).toBe('lazy');
    await section.scrollIntoViewIfNeeded();
    // Boxes keep their 4:3 size before and after the photo arrives.
    const frame = section.locator('[data-photo]:not([data-photo="none"])').first();
    const before = await frame.boundingBox();
    await expect(frame).toHaveAttribute('data-photo', 'loaded', { timeout: 45_000 });
    const after = await frame.boundingBox();
    expect(Math.abs(before!.height - after!.height)).toBeLessThan(1);
    expect(before!.width / before!.height).toBeCloseTo(4 / 3, 1);
    const srcset = await photos.first().getAttribute('srcset');
    expect(srcset, 'imagem responsiva via otimizador').toContain('/_next/image');
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls, 'CLS').toBeLessThan(0.1);
  });
});

async function addCimento(page: Page) {
  await page.goto('/produtos/cimento-cp-ii-f-32-50-kg');
  await page.getByRole('button', { name: 'Adicionar à lista' }).first().click();
  await expect(page.getByRole('button', { name: /Adicionado/ }).first()).toBeVisible();
  await page.goto('/orcamento');
}

test.describe('lista de orçamento', () => {
  test('adiciona produto, altera quantidade e confere subtotal', async ({ page }) => {
    await addCimento(page);
    const qty = page.getByLabel(/Quantidade de Cimento CP II-F-32 50 kg/);
    await expect(qty).toHaveValue('1');
    await expect(page.getByText('Subtotal dos itens com preço').locator('..')).toContainText('R$ 38,90');
    await qty.fill('20');
    await expect(page.getByText('Subtotal dos itens com preço').locator('..')).toContainText('R$ 778,00');
    await qty.blur();
    await expect(qty).toHaveValue('20');
  });

  test('entrega: campos obrigatórios, frete e resumo', async ({ page }) => {
    await addCimento(page);
    // Only the essentials are open; extra info is collapsed.
    await expect(page.getByLabel('Nome', { exact: true })).toBeVisible();
    await expect(page.getByLabel('WhatsApp ou telefone com DDD')).toBeVisible();
    await expect(page.getByText('Informações adicionais')).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeHidden();
    await expect(page.getByLabel('CEP')).toBeVisible();
    await page.getByRole('button', { name: 'Solicitar orçamento' }).click();
    await expect(page.getByText('Informe seu nome.')).toBeVisible();
    await expect(page.getByText('Informe um telefone com DDD.')).toBeVisible();
    await expect(page.getByText('Informe o CEP ou o bairro da entrega.')).toBeVisible();
    await expect(page.getByText(/É preciso concordar/)).toBeVisible();

    await page.getByLabel('Nome', { exact: true }).fill('Cliente Teste Demo');
    await page.getByLabel('WhatsApp ou telefone com DDD').fill('19900001234');
    await page.getByLabel('CEP').fill('13056000');
    await page.getByRole('button', { name: 'Estimar frete' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Ouro Verde' })).toBeVisible();
    await page.getByRole('checkbox', { name: /Concordo/ }).check();
    await page.getByRole('button', { name: 'Solicitar orçamento' }).click();
    await expect(page.getByText('Solicitação registrada')).toBeVisible();
    const msg = page.locator('pre');
    await expect(msg).toContainText('Não é uma compra confirmada');
    await expect(msg).toContainText('*Entrega:* CEP 13056-000');
    await expect(msg).toContainText('Cimento CP II-F-32 50 kg — 1 saco (FB-CIM-001)');
    // Demo: WhatsApp link has no recipient.
    await expect(page.getByRole('link', { name: 'Enviar pelo WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=/);
    await expect(page.getByText(/Modo demonstração/)).toBeVisible();
  });

  test('retirada: sem endereço e resumo de retirada', async ({ page }) => {
    await addCimento(page);
    await page.getByLabel('CEP').fill('13056000');
    await page.getByText('Retirar na loja').click();
    await expect(page.getByLabel('CEP')).toHaveCount(0);
    await expect(page.getByLabel('Bairro')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Estimar frete' })).toHaveCount(0);
    await page.getByLabel('Nome', { exact: true }).fill('Cliente Retirada Demo');
    await page.getByLabel('WhatsApp ou telefone com DDD').fill('19900005678');
    await page.getByRole('checkbox', { name: /Concordo/ }).check();
    await page.getByRole('button', { name: 'Solicitar orçamento' }).click();
    await expect(page.getByText('Solicitação registrada')).toBeVisible();
    await expect(page.locator('pre')).toContainText('*Entrega:* retirada na loja');
    await expect(page.locator('pre')).not.toContainText('CEP');
  });

  test('erro em campo recolhido abre “Informações adicionais”', async ({ page }) => {
    await addCimento(page);
    await page.getByText('Informações adicionais').click();
    await page.getByLabel('E-mail').fill('email-invalido');
    await page.getByText('Informações adicionais').click();
    await expect(page.getByLabel('E-mail')).toBeHidden();
    await page.getByText('Retirar na loja').click();
    await page.getByLabel('Nome', { exact: true }).fill('Cliente Demo');
    await page.getByLabel('WhatsApp ou telefone com DDD').fill('19900001111');
    await page.getByRole('checkbox', { name: /Concordo/ }).check();
    await page.getByRole('button', { name: 'Solicitar orçamento' }).click();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByText('E-mail inválido.')).toBeVisible();
  });

  test('formulário em tela estreita sem rolagem lateral', async ({ page }) => {
    test.skip(!isMobile(page), 'mobile only');
    await addCimento(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const submit = page.getByRole('button', { name: 'Solicitar orçamento' });
    expect((await submit.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });
});
