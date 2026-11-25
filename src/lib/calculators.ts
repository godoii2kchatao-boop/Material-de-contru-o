/**
 * Material estimators. They use geometry plus the figures the user reads on the
 * product packaging (coverage per box, yield per litre, consumption per m²).
 * No manufacturer consumption is assumed. Results are estimates, never a structural design.
 */

export interface Step {
  label: string;
  expression: string;
  result: string;
}

export interface Estimate {
  ok: true;
  value: number;
  unit: string;
  purchase: { qty: number; unit: string } | null;
  steps: Step[];
  notes: string[];
}

export interface Invalid {
  ok: false;
  errors: Record<string, string>;
}

const f = (n: number, d = 2) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: d }).format(n);
const pos = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0;
const nonneg = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0;

function check(fields: Record<string, [unknown, 'pos' | 'nonneg', string]>): Invalid | null {
  const errors: Record<string, string> = {};
  for (const [k, [v, kind, msg]] of Object.entries(fields)) {
    if (kind === 'pos' ? !pos(v) : !nonneg(v)) errors[k] = msg;
  }
  return Object.keys(errors).length ? { ok: false, errors } : null;
}

export interface Opening {
  width: number;
  height: number;
  count: number;
}

export function openingsArea(openings: Opening[]) {
  return openings.reduce((s, o) => s + Math.max(0, o.width) * Math.max(0, o.height) * Math.max(0, Math.round(o.count)), 0);
}

/** Floor tiles: area of the room(s) + waste, converted to boxes with the m² per box on the packaging. */
export function floorTiles(input: { areas: { length: number; width: number }[]; wastePct: number; m2PerBox: number }): Estimate | Invalid {
  const bad = check({
    wastePct: [input.wastePct, 'nonneg', 'Informe a margem de perda (0 ou mais).'],
    m2PerBox: [input.m2PerBox, 'pos', 'Informe quantos m² vêm em cada caixa (está na embalagem).'],
  });
  const areaErr = input.areas.length === 0 || input.areas.some((a) => !pos(a.length) || !pos(a.width));
  if (bad || areaErr) return { ok: false, errors: { ...(bad?.errors ?? {}), ...(areaErr ? { areas: 'Informe comprimento e largura de cada ambiente, em metros.' } : {}) } };
  const area = input.areas.reduce((s, a) => s + a.length * a.width, 0);
  const withWaste = area * (1 + input.wastePct / 100);
  const boxes = Math.ceil(withWaste / input.m2PerBox - 1e-9);
  return {
    ok: true,
    value: withWaste,
    unit: 'm²',
    purchase: { qty: boxes, unit: boxes === 1 ? 'caixa' : 'caixas' },
    steps: [
      { label: 'Área dos ambientes', expression: input.areas.map((a) => `${f(a.length)} × ${f(a.width)}`).join(' + '), result: `${f(area)} m²` },
      { label: 'Com margem de perda', expression: `${f(area)} × (1 + ${f(input.wastePct)}%)`, result: `${f(withWaste)} m²` },
      { label: 'Caixas', expression: `${f(withWaste)} ÷ ${f(input.m2PerBox)} m² por caixa, arredondado para cima`, result: `${boxes}` },
    ],
    notes: ['Compre peças do mesmo lote (tonalidade e calibre) para evitar diferenças de cor.'],
  };
}

/** Wall area: perimeter × height − openings. Shared by paint and wall tiles. */
export function wallArea(input: { perimeter: number; height: number; openings: Opening[] }) {
  const gross = input.perimeter * input.height;
  const open = openingsArea(input.openings);
  return { gross, open, net: Math.max(0, gross - open) };
}

/** Paint: litres = net area × coats ÷ yield per litre per coat (from the can). */
export function paint(input: { perimeter: number; height: number; openings: Opening[]; coats: number; yieldM2PerLitre: number; canLitres: number; extraAreaM2?: number }): Estimate | Invalid {
  const bad = check({
    perimeter: [input.perimeter, 'pos', 'Informe o perímetro das paredes, em metros.'],
    height: [input.height, 'pos', 'Informe o pé-direito, em metros.'],
    coats: [input.coats, 'pos', 'Informe o número de demãos.'],
    yieldM2PerLitre: [input.yieldM2PerLitre, 'pos', 'Informe o rendimento por litro por demão (está na lata).'],
    canLitres: [input.canLitres, 'pos', 'Escolha o tamanho da embalagem.'],
  });
  if (bad) return bad;
  const w = wallArea(input);
  const extra = nonneg(input.extraAreaM2) ? input.extraAreaM2 : 0;
  const area = w.net + extra;
  const litres = (area * input.coats) / input.yieldM2PerLitre;
  const cans = Math.ceil(litres / input.canLitres - 1e-9);
  const steps: Step[] = [
    { label: 'Área bruta das paredes', expression: `${f(input.perimeter)} m × ${f(input.height)} m`, result: `${f(w.gross)} m²` },
    { label: 'Descontando portas e janelas', expression: `${f(w.gross)} − ${f(w.open)}`, result: `${f(w.net)} m²` },
  ];
  if (extra > 0) steps.push({ label: 'Teto ou área extra', expression: `${f(w.net)} + ${f(extra)}`, result: `${f(area)} m²` });
  steps.push(
    { label: 'Litros', expression: `${f(area)} m² × ${input.coats} demão(s) ÷ ${f(input.yieldM2PerLitre)} m²/L`, result: `${f(litres)} L` },
    { label: 'Embalagens', expression: `${f(litres)} ÷ ${f(input.canLitres)} L, arredondado para cima`, result: `${cans}` },
  );
  return {
    ok: true,
    value: litres,
    unit: 'L',
    purchase: { qty: cans, unit: cans === 1 ? `embalagem de ${f(input.canLitres)} L` : `embalagens de ${f(input.canLitres)} L` },
    steps,
    notes: ['Superfícies novas, porosas ou com troca de cor forte podem pedir mais demãos. Siga a orientação do fabricante.'],
  };
}

/** Tile adhesive: kg = area × consumption (kg/m², from the bag) + waste, converted to bags. */
export function tileAdhesive(input: { area: number; consumptionKgM2: number; wastePct: number; bagKg: number }): Estimate | Invalid {
  const bad = check({
    area: [input.area, 'pos', 'Informe a área a assentar, em m².'],
    consumptionKgM2: [input.consumptionKgM2, 'pos', 'Informe o consumo em kg/m² indicado pelo fabricante para a sua peça e desempenadeira.'],
    wastePct: [input.wastePct, 'nonneg', 'Informe a margem de perda (0 ou mais).'],
    bagKg: [input.bagKg, 'pos', 'Informe o peso do saco.'],
  });
  if (bad) return bad;
  const kg = input.area * input.consumptionKgM2 * (1 + input.wastePct / 100);
  const bags = Math.ceil(kg / input.bagKg - 1e-9);
  return {
    ok: true,
    value: kg,
    unit: 'kg',
    purchase: { qty: bags, unit: bags === 1 ? `saco de ${f(input.bagKg)} kg` : `sacos de ${f(input.bagKg)} kg` },
    steps: [
      { label: 'Consumo', expression: `${f(input.area)} m² × ${f(input.consumptionKgM2)} kg/m²`, result: `${f(input.area * input.consumptionKgM2)} kg` },
      { label: 'Com margem de perda', expression: `× (1 + ${f(input.wastePct)}%)`, result: `${f(kg)} kg` },
      { label: 'Sacos', expression: `${f(kg)} ÷ ${f(input.bagKg)} kg, arredondado para cima`, result: `${bags}` },
    ],
    notes: ['O consumo varia com o tamanho da peça, o dente da desempenadeira e a dupla colagem. Use o valor da embalagem.'],
  };
}

/** Wall tiles: net wall area + waste, converted to boxes. */
export function wallTiles(input: { perimeter: number; height: number; openings: Opening[]; wastePct: number; m2PerBox: number }): Estimate | Invalid {
  const bad = check({
    perimeter: [input.perimeter, 'pos', 'Informe a largura total das paredes a revestir, em metros.'],
    height: [input.height, 'pos', 'Informe a altura do revestimento, em metros.'],
    wastePct: [input.wastePct, 'nonneg', 'Informe a margem de perda (0 ou mais).'],
    m2PerBox: [input.m2PerBox, 'pos', 'Informe quantos m² vêm em cada caixa (está na embalagem).'],
  });
  if (bad) return bad;
  const w = wallArea(input);
  const withWaste = w.net * (1 + input.wastePct / 100);
  const boxes = Math.ceil(withWaste / input.m2PerBox - 1e-9);
  return {
    ok: true,
    value: withWaste,
    unit: 'm²',
    purchase: { qty: boxes, unit: boxes === 1 ? 'caixa' : 'caixas' },
    steps: [
      { label: 'Área das paredes', expression: `${f(input.perimeter)} × ${f(input.height)} − ${f(w.open)} de aberturas`, result: `${f(w.net)} m²` },
      { label: 'Com margem de perda', expression: `${f(w.net)} × (1 + ${f(input.wastePct)}%)`, result: `${f(withWaste)} m²` },
      { label: 'Caixas', expression: `${f(withWaste)} ÷ ${f(input.m2PerBox)} m² por caixa, arredondado para cima`, result: `${boxes}` },
    ],
    notes: ['Paginações na diagonal ou com muitos recortes costumam gerar mais perda. Ajuste a margem com o profissional.'],
  };
}

/** Masonry blocks per wall: pure geometry, block face + mortar joint. */
export function masonryBlocks(input: { wallLength: number; wallHeight: number; openings: Opening[]; blockLengthCm: number; blockHeightCm: number; jointCm: number; wastePct: number }): Estimate | Invalid {
  const bad = check({
    wallLength: [input.wallLength, 'pos', 'Informe o comprimento da parede, em metros.'],
    wallHeight: [input.wallHeight, 'pos', 'Informe a altura da parede, em metros.'],
    blockLengthCm: [input.blockLengthCm, 'pos', 'Informe o comprimento do bloco, em cm.'],
    blockHeightCm: [input.blockHeightCm, 'pos', 'Informe a altura do bloco, em cm.'],
    jointCm: [input.jointCm, 'nonneg', 'Informe a espessura da junta, em cm.'],
    wastePct: [input.wastePct, 'nonneg', 'Informe a margem de perda (0 ou mais).'],
  });
  if (bad) return bad;
  const w = wallArea({ perimeter: input.wallLength, height: input.wallHeight, openings: input.openings });
  const perM2 = 1 / (((input.blockLengthCm + input.jointCm) / 100) * ((input.blockHeightCm + input.jointCm) / 100));
  const blocks = Math.ceil(w.net * perM2 * (1 + input.wastePct / 100) - 1e-9);
  return {
    ok: true,
    value: blocks,
    unit: 'blocos',
    purchase: { qty: blocks, unit: 'blocos' },
    steps: [
      { label: 'Área da parede', expression: `${f(input.wallLength)} × ${f(input.wallHeight)} − ${f(w.open)} de aberturas`, result: `${f(w.net)} m²` },
      { label: 'Blocos por m²', expression: `1 ÷ ((${f(input.blockLengthCm)} + ${f(input.jointCm)}) cm × (${f(input.blockHeightCm)} + ${f(input.jointCm)}) cm)`, result: `${f(perM2, 1)}` },
      { label: 'Total com perda', expression: `${f(w.net)} × ${f(perM2, 1)} × (1 + ${f(input.wastePct)}%)`, result: `${blocks}` },
    ],
    notes: ['Cálculo geométrico para vedação. Não substitui projeto nem dimensionamento estrutural.'],
  };
}

/** Screed / render volume: area × thickness. Mix proportions are not suggested here. */
export function mortarVolume(input: { area: number; thicknessCm: number; wastePct: number }): Estimate | Invalid {
  const bad = check({
    area: [input.area, 'pos', 'Informe a área, em m².'],
    thicknessCm: [input.thicknessCm, 'pos', 'Informe a espessura média, em cm.'],
    wastePct: [input.wastePct, 'nonneg', 'Informe a margem de perda (0 ou mais).'],
  });
  if (bad) return bad;
  const m3 = input.area * (input.thicknessCm / 100) * (1 + input.wastePct / 100);
  return {
    ok: true,
    value: m3,
    unit: 'm³',
    purchase: null,
    steps: [
      { label: 'Volume', expression: `${f(input.area)} m² × ${f(input.thicknessCm / 100, 3)} m`, result: `${f(input.area * (input.thicknessCm / 100), 3)} m³` },
      { label: 'Com margem de perda', expression: `× (1 + ${f(input.wastePct)}%)`, result: `${f(m3, 3)} m³ (${f(m3 * 1000, 0)} L)` },
    ],
    notes: ['O traço (proporção de cimento, areia e água) depende da aplicação. Confirme com o profissional responsável ou use argamassa pronta conforme a embalagem.'],
  };
}
