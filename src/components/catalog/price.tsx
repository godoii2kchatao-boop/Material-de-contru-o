import { formatBRL, availabilityLabel } from '@/lib/format';

export function Price({ cents, unit, size = 'md' }: { cents: number | null; unit: string; size?: 'md' | 'lg' }) {
  if (cents == null)
    return (
      <p className={`font-semibold ${size === 'lg' ? 'text-[22px]' : 'text-[16px]'}`}>
        Sob consulta <span className="text-[13px] font-normal text-text-dim">· por {unit}</span>
      </p>
    );
  return (
    <p className="leading-tight">
      <span className={`tabular font-display font-bold ${size === 'lg' ? 'text-[30px]' : 'text-[19px]'}`} style={{ fontStretch: '105%' }}>
        {formatBRL(cents)}
      </span>
      <span className="text-[13px] text-text-dim"> / {unit}</span>
      <span className="block text-[12px] text-text-dim">Preço demonstrativo</span>
    </p>
  );
}

const tone: Record<string, string> = {
  em_estoque: 'text-ok',
  sob_encomenda: 'text-warn',
  consulte: 'text-graphite-700',
  indisponivel: 'text-danger',
};

export function AvailabilityBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${tone[value] ?? ''}`}>
      <span aria-hidden className="h-2 w-2 rounded-full bg-current" />
      {availabilityLabel[value] ?? value}
    </span>
  );
}
