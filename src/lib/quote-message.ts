import { formatBRL } from './format';
import { profileLabel } from './format';

export interface MessageInput {
  storeName: string;
  code?: string | null;
  customer: { name: string; phone: string; profile: string; company?: string | null };
  delivery: { mode: 'entrega' | 'retirada'; cep?: string | null; district?: string | null; address?: string | null };
  items: { name: string; sku: string; qty: number; unit: string }[];
  listText?: string | null;
  fileCount?: number;
  notes?: string | null;
  freightEstimateCents?: number | null;
  project?: { name: string | null; recurring: boolean; volume: string | null } | null;
}

/** Plain-text WhatsApp message. Formatting uses WhatsApp's *bold* only. */
export function buildQuoteMessage(m: MessageInput) {
  const lines: string[] = [];
  lines.push(`*Solicitação de orçamento — ${m.storeName}*`);
  if (m.code) lines.push(`Pedido de orçamento nº ${m.code}`);
  lines.push('Não é uma compra confirmada: aguardo preços, disponibilidade e frete.');
  lines.push('');
  lines.push(`*Cliente:* ${m.customer.name}${m.customer.company ? ` · ${m.customer.company}` : ''}`);
  lines.push(`*Perfil:* ${profileLabel[m.customer.profile] ?? m.customer.profile}`);
  lines.push(`*Contato:* ${m.customer.phone}`);
  if (m.delivery.mode === 'retirada') lines.push('*Entrega:* retirada na loja');
  else {
    const where = [m.delivery.cep ? `CEP ${m.delivery.cep}` : null, m.delivery.district, m.delivery.address].filter(Boolean).join(' · ');
    lines.push(`*Entrega:* ${where || 'a combinar'}`);
    if (m.freightEstimateCents != null) lines.push(`*Frete estimado pela tabela:* ${formatBRL(m.freightEstimateCents)}`);
  }
  if (m.project?.name) lines.push(`*Obra:* ${m.project.name}${m.project.recurring ? ' (compra recorrente)' : ''}${m.project.volume ? ` · ${m.project.volume}` : ''}`);
  if (m.items.length) {
    lines.push('');
    lines.push(`*Itens (${m.items.length}):*`);
    m.items.forEach((it, i) => lines.push(`${i + 1}. ${it.name} — ${formatQty(it.qty)} ${it.unit} (${it.sku})`));
  }
  if (m.listText?.trim()) {
    lines.push('');
    lines.push('*Lista enviada:*');
    lines.push(m.listText.trim());
  }
  if (m.fileCount) lines.push(`*Anexos:* ${m.fileCount} arquivo(s) enviados pelo site`);
  if (m.notes?.trim()) {
    lines.push('');
    lines.push(`*Observações:* ${m.notes.trim()}`);
  }
  return lines.join('\n');
}

function formatQty(n: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(n);
}

/**
 * wa.me link. With no store number (demo mode) the link opens WhatsApp with the text
 * and lets the visitor choose the contact, so no real business receives demo requests.
 */
export function whatsappLink(phone: string | null | undefined, text: string) {
  const digits = (phone ?? '').replace(/\D/g, '');
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}
