import type { FreightClass, Region } from './types';

export interface FreightInput {
  cep?: string | null;
  district?: string | null;
  city?: string | null;
  pickup?: boolean;
  classes: FreightClass[];
}

export type FreightResult =
  | { kind: 'retirada'; feeCents: 0; message: string }
  | { kind: 'estimativa'; region: Region; feeCents: number; bulky: boolean; message: string }
  | { kind: 'cotacao'; region: Region | null; message: string }
  | { kind: 'fora_da_area'; message: string }
  | { kind: 'dados_insuficientes'; message: string };

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

export function cepPrefix(cep: string | null | undefined) {
  const d = (cep ?? '').replace(/\D/g, '');
  return d.length >= 5 ? d.slice(0, 5) : null;
}

/** Find the first active region that matches the CEP range, the neighbourhood or the city. */
export function matchRegion(regions: Region[], input: Pick<FreightInput, 'cep' | 'district' | 'city'>): Region | null {
  const active = regions.filter((r) => r.active);
  const prefix = cepPrefix(input.cep);
  if (prefix) {
    const byCep = active.find((r) => r.cepRanges.some(([a, b]) => prefix >= a && prefix <= b));
    if (byCep) return byCep;
  }
  if (input.district) {
    const d = fold(input.district);
    const byDistrict = active.find((r) => r.neighborhoods.some((n) => fold(n) === d));
    if (byDistrict) return byDistrict;
  }
  if (input.city) {
    const c = fold(input.city);
    const byCity = active.find((r) => r.neighborhoods.length === 0 && r.cities.some((x) => fold(x) === c)) ?? active.find((r) => r.cities.some((x) => fold(x) === c));
    if (byCity) return byCity;
  }
  return null;
}

/**
 * Estimate delivery using only the rules the store registered (base fee + bulky surcharge).
 * Bulk material (sand, gravel) always goes to a personalised quote.
 */
export function estimateFreight(regions: Region[], input: FreightInput): FreightResult {
  if (input.pickup) return { kind: 'retirada', feeCents: 0, message: 'Retirada na loja, sem custo de frete.' };
  if (!cepPrefix(input.cep) && !input.district && !input.city) {
    return { kind: 'dados_insuficientes', message: 'Informe o CEP ou o bairro da entrega.' };
  }
  const region = matchRegion(regions, input);
  if (!region) {
    return { kind: 'fora_da_area', message: 'Endereço fora das regiões cadastradas. Envie a solicitação que o atendimento verifica a entrega.' };
  }
  if (input.classes.includes('granel')) {
    return { kind: 'cotacao', region, message: 'Material a granel: o frete é cotado conforme volume e acesso à obra.' };
  }
  const bulky = input.classes.includes('volumoso');
  const feeCents = region.baseFeeCents + (bulky ? region.bulkyFeeCents : 0);
  return {
    kind: 'estimativa',
    region,
    feeCents,
    bulky,
    message: bulky ? 'Inclui adicional para material volumoso. Valor final confirmado no orçamento.' : 'Valor estimado pela tabela da loja. Confirmado no orçamento.',
  };
}
