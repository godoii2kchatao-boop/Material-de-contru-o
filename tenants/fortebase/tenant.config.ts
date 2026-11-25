import type { TenantConfig } from '@/lib/types';

/**
 * FORTEBASE — marca demonstrativa da KRB_DIGITAL.
 * Para um cliente real: copie esta pasta para tenants/<cliente>/, troque os valores
 * e publique com TENANT=<cliente>. Nada aqui é dado de empresa existente.
 */
const config: TenantConfig = {
  id: 'fortebase',
  demo: true,
  brand: {
    name: 'FORTEBASE',
    descriptor: 'Materiais & Construção',
    slogan: 'Da fundação ao acabamento. Tudo para construir.',
    shortDescription:
      'Materiais de construção em Campinas e região: catálogo, lista de orçamento pelo WhatsApp e entrega na obra.',
  },
  theme: {
    accent: '#b8501d',
    accentHover: '#9f4316',
    accentSoft: '#f3e3d8',
    safety: '#f2bd1d',
    ink: '#121315',
    graphite: '#1b1d20',
    concrete: '#d9d5ce',
    mineral: '#f4f2ee',
  },
  contact: {
    // Em modo demonstração nenhum WhatsApp real é usado: o link abre o WhatsApp sem destinatário.
    whatsapp: null,
    phoneDisplay: null,
    email: 'atendimento@fortebase.example',
    address: { street: null, district: 'Ouro Verde', city: 'Campinas', state: 'SP' },
    hours: [
      { days: 'Segunda a sexta', open: '07:00', close: '18:00' },
      { days: 'Sábado', open: '07:00', close: '13:00' },
      { days: 'Domingo e feriados', open: null, close: null },
    ],
  },
  seo: {
    city: 'Campinas',
    state: 'SP',
    neighborhoods: ['Ouro Verde', 'Campos Elíseos', 'Guanabara', 'Bonfim', 'Vila Industrial', 'Jardim Aurélia'],
  },
  // Faixas de CEP de referência para a demonstração. Confirme com os Correios antes de publicar.
  regions: [
    { id: 'campinas-sudoeste', name: 'Campinas — Ouro Verde, Campos Elíseos e região', cities: ['Campinas'], cepRanges: [['13050', '13069']], neighborhoods: ['Ouro Verde', 'Campos Elíseos', 'Vida Nova', 'Jardim Aurélia', 'Satélite Íris'], baseFeeCents: 2500, bulkyFeeCents: 6000, leadTime: 'A combinar no orçamento', active: true },
    { id: 'campinas-centro', name: 'Campinas — Centro, Bonfim e Guanabara', cities: ['Campinas'], cepRanges: [['13010', '13049']], neighborhoods: ['Centro', 'Bonfim', 'Guanabara', 'Vila Industrial', 'Botafogo'], baseFeeCents: 3500, bulkyFeeCents: 8000, leadTime: 'A combinar no orçamento', active: true },
    { id: 'campinas-demais', name: 'Campinas — demais regiões', cities: ['Campinas'], cepRanges: [['13070', '13139'], ['13000', '13009']], neighborhoods: [], baseFeeCents: 4500, bulkyFeeCents: 9500, leadTime: 'A combinar no orçamento', active: true },
    { id: 'sumare-hortolandia', name: 'Sumaré e Hortolândia', cities: ['Sumaré', 'Hortolândia'], cepRanges: [['13170', '13189']], neighborhoods: [], baseFeeCents: 5500, bulkyFeeCents: 11000, leadTime: 'A combinar no orçamento', active: true },
    { id: 'valinhos-vinhedo', name: 'Valinhos e Vinhedo', cities: ['Valinhos', 'Vinhedo'], cepRanges: [['13270', '13289']], neighborhoods: [], baseFeeCents: 6000, bulkyFeeCents: 12000, leadTime: 'A combinar no orçamento', active: true },
    { id: 'paulinia', name: 'Paulínia', cities: ['Paulínia'], cepRanges: [['13140', '13149']], neighborhoods: [], baseFeeCents: 6500, bulkyFeeCents: 12500, leadTime: 'A combinar no orçamento', active: false },
  ],
  policies: {
    quote: 'Esta é uma solicitação de orçamento, não uma compra. Preços, disponibilidade e frete são confirmados pelo atendimento antes de qualquer pagamento.',
    delivery: 'Valores de frete exibidos são estimativas da tabela cadastrada pela loja. Materiais a granel, pesados ou volumosos recebem cotação personalizada.',
    professionals: 'Profissionais e empresas recebem atendimento comercial dedicado. Condições especiais só valem quando cadastradas pela loja e confirmadas no orçamento.',
    privacy: 'Usamos seus dados apenas para responder à solicitação e organizar a entrega.',
  },
};

export default config;
