import type { Availability, Banner, FreightClass, Offer, Product, QuoteRequest, StoreData, DailyEvents } from '../types';
import { photo } from '@/lib/photos';
import { catalogSeed, tenant } from '../tenant';

const BULKY_CATEGORIES = new Set(['tijolos-blocos', 'madeiras', 'telhas-coberturas']);
const BULKY_SKUS = new Set(['FB-VER-001', 'FB-VER-002', 'FB-TEL-001', 'FB-HID-001', 'FB-HID-002', 'FB-HID-004', 'FB-POR-001', 'FB-JAN-001', 'FB-FER-004']);

export function freightClassFor(p: { category: string; sku: string; unit: string }): FreightClass {
  if (p.category === 'areia-brita-pedra' && p.unit === 'm³') return 'granel';
  if (BULKY_CATEGORIES.has(p.category) || BULKY_SKUS.has(p.sku)) return 'volumoso';
  return 'leve';
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Monday of the current week, at 00:00 local. */
function weekStart(now: Date) {
  const d = new Date(now);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function buildSeed(now = new Date()): StoreData {
  const stamp = now.toISOString();
  const products: Product[] = catalogSeed.products.map((p) => ({
    ...p,
    availability: p.availability as Availability,
    freightClass: freightClassFor(p),
    active: true,
    updatedAt: stamp,
  }));
  const ws = weekStart(now);
  const we = new Date(ws);
  we.setDate(we.getDate() + 6);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const id = (sku: string) => sku.toLowerCase();

  const offers: Offer[] = [
    { id: 'of-semana-cimento', title: 'Cimento CP II-F-32 na semana', description: 'Preço da semana para retirada ou entrega junto com outros materiais.', kind: 'semanal', productIds: [id('FB-CIM-001')], priceCents: 3590, referencePriceCents: 3890, category: null, startsAt: isoDay(ws), endsAt: isoDay(we), active: true },
    { id: 'of-combo-banheiro', title: 'Combo reforma de banheiro', description: 'Argamassa AC-III, rejunte, impermeabilizante polimérico e revestimento metrô. Quantidades ajustadas no orçamento.', kind: 'combo', productIds: [id('FB-ARG-002'), id('FB-REJ-001'), id('FB-IMP-001'), id('FB-REV-001')], priceCents: null, referencePriceCents: null, category: null, startsAt: isoDay(ws), endsAt: isoDay(monthEnd), active: true },
    { id: 'of-kit-pintura', title: 'Kit pintura de quarto', description: 'Tinta acrílica 18 L, massa corrida, rolo de lã e trincha.', kind: 'kit', productIds: [id('FB-TIN-001'), id('FB-TIN-003'), id('FB-TIN-004'), id('FB-TIN-005')], priceCents: null, referencePriceCents: null, category: null, startsAt: isoDay(ws), endsAt: isoDay(monthEnd), active: true },
    { id: 'of-kit-ferramentas', title: 'Kit ferramentas do pedreiro', description: 'Colher de pedreiro, nível de alumínio, martelo e trena.', kind: 'kit', productIds: [id('FB-FER-002'), id('FB-FER-003'), id('FB-FER-005'), id('FB-FER-006')], priceCents: 11490, referencePriceCents: null, category: null, startsAt: isoDay(ws), endsAt: isoDay(monthEnd), active: true },
    { id: 'of-eletrica', title: 'Semana da elétrica', description: 'Condições para cabos, eletrodutos e disjuntores em compras para obra. Consulte no orçamento.', kind: 'categoria', productIds: [id('FB-ELE-001'), id('FB-ELE-003'), id('FB-ELE-004')], priceCents: null, referencePriceCents: null, category: 'materiais-eletricos', startsAt: isoDay(ws), endsAt: isoDay(we), active: true },
    { id: 'of-chuvas', title: 'Antes das chuvas: impermeabilização', description: 'Manta asfáltica, emulsão e argamassa polimérica para lajes, baldrames e caixas d’água.', kind: 'sazonal', productIds: [id('FB-IMP-001'), id('FB-IMP-002'), id('FB-IMP-003')], priceCents: null, referencePriceCents: null, category: 'impermeabilizantes', startsAt: isoDay(ws), endsAt: isoDay(monthEnd), active: true },
  ];

  const banners: Banner[] = [
    { id: 'bn-obra', title: 'Material na obra, sem fila no balcão', subtitle: 'Monte a lista, envie pelo WhatsApp e combine a entrega.', image: photo('obra-laje-equipe'), href: '/produtos', active: true, order: 0 },
    { id: 'bn-pro', title: 'Atendimento para profissionais', subtitle: 'Listas recorrentes e orçamentos por volume.', image: photo('eletricista'), href: '/profissionais', active: true, order: 1 },
  ];

  const day = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  };
  const quotes: QuoteRequest[] = [
    {
      id: 'q-seed-1', code: 'FB-DEMO-0001', createdAt: day(0), updatedAt: day(0), status: 'novo', source: 'carrinho',
      customer: { name: 'Cliente Exemplo A', phone: '(19) 90000-0001', email: null, profile: 'pedreiro', company: null },
      delivery: { mode: 'entrega', cep: '13050-000', district: 'Ouro Verde', address: null, regionId: 'campinas-sudoeste' },
      items: [
        { productId: 'fb-cim-001', sku: 'FB-CIM-001', name: 'Cimento CP II-F-32 50 kg', unit: 'saco', qty: 20 },
        { productId: 'fb-are-001', sku: 'FB-ARE-001', name: 'Areia média lavada', unit: 'm³', qty: 3 },
        { productId: 'fb-blc-001', sku: 'FB-BLC-001', name: 'Bloco cerâmico de vedação 9×19×29 cm', unit: 'milheiro', qty: 2 },
      ],
      listText: null, files: [], notes: 'Obra nos fundos, acesso por portão lateral.', project: { name: 'Ampliação — fundos', recurring: false, volume: null }, internalNotes: null, seed: true,
    },
    {
      id: 'q-seed-2', code: 'FB-DEMO-0002', createdAt: day(1), updatedAt: day(0), status: 'em_atendimento', source: 'lista',
      customer: { name: 'Cliente Exemplo B', phone: '(19) 90000-0002', email: 'cliente.b@exemplo.example', profile: 'reforma', company: null },
      delivery: { mode: 'retirada', cep: null, district: null, address: null, regionId: null },
      items: [], listText: '2 latas tinta branca 18L\n1 rolo\n1 massa corrida\nfita crepe', files: [], notes: null, project: null, internalNotes: 'Confirmar cor da tinta por telefone.', seed: true,
    },
    {
      id: 'q-seed-3', code: 'FB-DEMO-0003', createdAt: day(3), updatedAt: day(2), status: 'orcamento_enviado', source: 'profissional',
      customer: { name: 'Construtora Exemplo', phone: '(19) 90000-0003', email: 'compras@construtora.example', profile: 'construtora', company: 'Construtora Exemplo' },
      delivery: { mode: 'entrega', cep: '13185-000', district: null, address: null, regionId: 'sumare-hortolandia' },
      items: [
        { productId: 'fb-ver-001', sku: 'FB-VER-001', name: 'Vergalhão CA-50 10 mm (3/8") barra 12 m', unit: 'barra', qty: 80 },
        { productId: 'fb-ara-001', sku: 'FB-ARA-001', name: 'Arame recozido 18 BWG 1 kg', unit: 'rolo', qty: 10 },
      ],
      listText: null, files: [], notes: 'Entrega em duas etapas.', project: { name: 'Residencial — bloco B', recurring: true, volume: 'Mensal' }, internalNotes: null, seed: true,
    },
    {
      id: 'q-seed-4', code: 'FB-DEMO-0004', createdAt: day(6), updatedAt: day(4), status: 'fechado', source: 'carrinho',
      customer: { name: 'Cliente Exemplo D', phone: '(19) 90000-0004', email: null, profile: 'eletricista', company: null },
      delivery: { mode: 'retirada', cep: null, district: null, address: null, regionId: null },
      items: [
        { productId: 'fb-ele-001', sku: 'FB-ELE-001', name: 'Cabo flexível 2,5 mm² 750 V rolo 100 m', unit: 'rolo', qty: 2 },
        { productId: 'fb-ele-004', sku: 'FB-ELE-004', name: 'Disjuntor DIN monopolar 20 A', unit: 'unidade', qty: 6 },
      ],
      listText: null, files: [], notes: null, project: null, internalNotes: null, seed: true,
    },
  ];

  // Sample traffic so the reports page has something to show. Flagged as sample data.
  const events: DailyEvents[] = [];
  for (let i = 13; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const wave = 1 + 0.35 * Math.sin(i * 0.9);
    events.push({
      date: isoDay(d),
      counts: {
        view_product: Math.round(120 * wave),
        search: Math.round(48 * wave),
        add_to_list: Math.round(26 * wave),
        submit_quote: Math.round(5 * wave),
        submit_list: Math.round(2 * wave),
        whatsapp_click: Math.round(9 * wave),
        freight_check: Math.round(11 * wave),
      },
      sample: true,
    });
  }

  return {
    version: 4,
    categories: catalogSeed.categories.map((c) => ({ ...c, active: true })),
    products,
    offers,
    regions: tenant.regions,
    quotes,
    banners,
    settings: {
      storeName: tenant.brand.name,
      descriptor: tenant.brand.descriptor,
      slogan: tenant.brand.slogan,
      whatsapp: tenant.contact.whatsapp,
      phoneDisplay: tenant.contact.phoneDisplay,
      email: tenant.contact.email,
      address: tenant.contact.address,
      hours: tenant.contact.hours,
      theme: { accent: tenant.theme.accent, accentHover: tenant.theme.accentHover, safety: tenant.theme.safety },
      professionalTerms: tenant.policies.professionals,
      pickupEnabled: true,
    },
    events,
    sequence: 0,
  };
}
