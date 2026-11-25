import { describe, expect, it } from 'vitest';
import { estimateFreight, matchRegion } from '@/lib/freight';
import { floorTiles, paint, masonryBlocks, tileAdhesive, mortarVolume } from '@/lib/calculators';
import { queryCatalog } from '@/lib/catalog-query';
import { buildQuoteMessage, whatsappLink } from '@/lib/quote-message';
import { checkFile, sniff } from '@/lib/upload';
import { quoteSchema } from '@/lib/validation';
import { buildSeed } from '@/lib/store/seed';
import { tenant } from '@/lib/tenant';

const regions = tenant.regions;

describe('frete', () => {
  it('encontra a região pelo CEP', () => {
    expect(matchRegion(regions, { cep: '13056-123' })?.id).toBe('campinas-sudoeste');
    expect(matchRegion(regions, { cep: '13180-000' })?.id).toBe('sumare-hortolandia');
  });
  it('ignora regiões inativas', () => {
    expect(matchRegion(regions, { cep: '13145-000' })).toBeNull();
  });
  it('soma o adicional de volumoso', () => {
    const r = estimateFreight(regions, { cep: '13056-000', classes: ['leve', 'volumoso'] });
    expect(r.kind).toBe('estimativa');
    if (r.kind === 'estimativa') expect(r.feeCents).toBe(2500 + 6000);
  });
  it('granel sempre vai para cotação', () => {
    expect(estimateFreight(regions, { cep: '13056-000', classes: ['granel'] }).kind).toBe('cotacao');
  });
  it('retirada não cobra frete e falta de dados é sinalizada', () => {
    expect(estimateFreight(regions, { pickup: true, classes: [] }).kind).toBe('retirada');
    expect(estimateFreight(regions, { classes: ['leve'] }).kind).toBe('dados_insuficientes');
  });
});

describe('calculadoras', () => {
  it('pisos: área + perda, caixas arredondadas para cima', () => {
    const r = floorTiles({ areas: [{ length: 4, width: 3 }], wastePct: 10, m2PerBox: 2.5 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBeCloseTo(13.2);
      expect(r.purchase?.qty).toBe(6);
    }
  });
  it('tinta: desconta aberturas e usa o rendimento informado', () => {
    const r = paint({ perimeter: 10, height: 2.5, openings: [{ width: 1, height: 2, count: 1 }], coats: 2, yieldM2PerLitre: 10, canLitres: 3.6 });
    expect(r.ok && r.value).toBeCloseTo(4.6);
    expect(r.ok && r.purchase?.qty).toBe(2);
  });
  it('exige o rendimento da embalagem', () => {
    const r = paint({ perimeter: 10, height: 2.5, openings: [], coats: 2, yieldM2PerLitre: NaN, canLitres: 18 });
    expect(r.ok).toBe(false);
  });
  it('blocos: geometria com junta', () => {
    const r = masonryBlocks({ wallLength: 3, wallHeight: 2, openings: [], blockLengthCm: 29, blockHeightCm: 19, jointCm: 1, wastePct: 0 });
    expect(r.ok && r.value).toBe(Math.ceil(6 / (0.3 * 0.2) - 1e-9));
  });
  it('argamassa e volume', () => {
    expect(tileAdhesive({ area: 10, consumptionKgM2: 5, wastePct: 0, bagKg: 20 }).ok).toBe(true);
    const v = mortarVolume({ area: 20, thicknessCm: 4, wastePct: 0 });
    expect(v.ok && v.value).toBeCloseTo(0.8);
  });
});

describe('busca do catálogo', () => {
  const products = buildSeed().products;
  it('acha por nome sem acento e por sinônimo', () => {
    expect(queryCatalog(products, { q: 'cimento' }).length).toBeGreaterThan(0);
    expect(queryCatalog(products, { q: 'fio 2,5' })[0].sku).toBe('FB-ELE-001');
    expect(queryCatalog(products, { q: 'tijolo' }).some((p) => p.sku === 'FB-BLC-001')).toBe(true);
  });
  it('filtra por categoria e ordena por preço', () => {
    const list = queryCatalog(products, { category: 'ferramentas', sort: 'preco_asc' });
    expect(list.every((p) => p.category === 'ferramentas')).toBe(true);
    const priced = list.filter((p) => p.priceCents != null).map((p) => p.priceCents!);
    expect(priced).toEqual([...priced].sort((a, b) => a - b));
  });
  it('resultado vazio para termo inexistente', () => {
    expect(queryCatalog(products, { q: 'xyzabc' })).toHaveLength(0);
  });
});

describe('mensagem e WhatsApp', () => {
  it('monta a mensagem sem confirmar venda', () => {
    const m = buildQuoteMessage({ storeName: 'X', code: 'FB-1', customer: { name: 'Ana', phone: '(19) 9', profile: 'pedreiro' }, delivery: { mode: 'retirada' }, items: [{ name: 'Cimento', sku: 'C1', qty: 2, unit: 'saco' }] });
    expect(m).toContain('Não é uma compra confirmada');
    expect(m).toContain('1. Cimento — 2 saco (C1)');
  });
  it('sem número de loja, o link não tem destinatário', () => {
    expect(whatsappLink(null, 'oi')).toBe('https://wa.me/?text=oi');
    expect(whatsappLink('(19) 99999-0000', 'oi')).toBe('https://wa.me/19999990000?text=oi');
  });
});

describe('upload', () => {
  it('reconhece pelo conteúdo, não pela extensão', () => {
    expect(sniff(new TextEncoder().encode('%PDF-1.7'))).toBe('application/pdf');
    expect(sniff(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(checkFile('lista.pdf', 10, new TextEncoder().encode('MZ executable')).ok).toBe(false);
    expect(checkFile('grande.pdf', 9 * 1024 * 1024, new TextEncoder().encode('%PDF-')).ok).toBe(false);
  });
});

describe('validação do pedido', () => {
  it('rejeita sem consentimento e aceita pedido completo', () => {
    const base = { customer: { name: 'Ana', phone: '19 98888-7777', profile: 'reforma' }, delivery: { mode: 'retirada' }, items: [{ productId: 'fb-cim-001', qty: 1 }] };
    expect(quoteSchema.safeParse({ ...base, consent: false }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...base, consent: true }).success).toBe(true);
  });
});

describe('entrega × retirada', () => {
  const base = { customer: { name: 'Ana Demo', phone: '19 98888-7777', profile: 'morador' }, items: [{ productId: 'fb-cim-001', qty: 2 }], consent: true };
  it('retirada dispensa CEP e endereço', () => {
    expect(quoteSchema.safeParse({ ...base, delivery: { mode: 'retirada', cep: null, district: null, address: null } }).success).toBe(true);
  });
  it('entrega exige CEP ou bairro', () => {
    const r = quoteSchema.safeParse({ ...base, delivery: { mode: 'entrega', cep: '', district: '' } });
    expect(r.success).toBe(false);
    expect(quoteSchema.safeParse({ ...base, delivery: { mode: 'entrega', cep: '', district: 'Ouro Verde' } }).success).toBe(true);
    expect(quoteSchema.safeParse({ ...base, delivery: { mode: 'entrega', cep: '13056-000' } }).success).toBe(true);
  });
  it('perfil tem padrão e e-mail é opcional', () => {
    const r = quoteSchema.safeParse({ ...base, customer: { name: 'Ana', phone: '19988887777', profile: 'morador', email: '' }, delivery: { mode: 'retirada' } });
    expect(r.success && r.data.customer.email).toBe(null);
  });
});

describe('mensagem de retirada', () => {
  it('não leva endereço', () => {
    const m = buildQuoteMessage({ storeName: 'X', code: 'FB-2', customer: { name: 'Ana', phone: '(19) 9', profile: 'morador' }, delivery: { mode: 'retirada', cep: null }, items: [{ name: 'Cimento', sku: 'C1', qty: 1, unit: 'saco' }] });
    expect(m).toContain('*Entrega:* retirada na loja');
    expect(m).not.toContain('CEP');
  });
});
