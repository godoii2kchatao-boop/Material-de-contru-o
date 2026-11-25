const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const num = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function formatBRL(cents: number) {
  return brl.format(cents / 100);
}

export function formatNumber(n: number, digits = 2) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(n);
}

export { num as numberFormat };

/** Keeps digits only and formats as 00000-000. */
export function formatCep(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/×/g, ' x ')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Accent- and case-insensitive text for searching. */
export function fold(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/×/g, 'x');
}

export const availabilityLabel: Record<string, string> = {
  em_estoque: 'Disponível',
  sob_encomenda: 'Sob encomenda',
  consulte: 'Consulte disponibilidade',
  indisponivel: 'Indisponível no momento',
};

export const profileLabel: Record<string, string> = {
  morador: 'Estou construindo',
  reforma: 'Pequena reforma',
  pedreiro: 'Pedreiro',
  eletricista: 'Eletricista',
  encanador: 'Encanador',
  pintor: 'Pintor',
  mestre_de_obras: 'Mestre de obras',
  engenheiro: 'Engenheiro(a)',
  arquiteto: 'Arquiteto(a)',
  construtora: 'Construtora',
  manutencao: 'Manutenção predial',
};

export const statusLabel: Record<string, string> = {
  novo: 'Novo',
  em_atendimento: 'Em atendimento',
  orcamento_enviado: 'Orçamento enviado',
  fechado: 'Fechado',
  perdido: 'Não convertido',
};
