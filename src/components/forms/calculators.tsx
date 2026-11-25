'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import * as calc from '@/lib/calculators';

type Kind = 'piso' | 'tinta' | 'argamassa' | 'revestimento' | 'blocos' | 'volume';
const TABS: { id: Kind; label: string }[] = [
  { id: 'piso', label: 'Pisos' },
  { id: 'tinta', label: 'Tinta' },
  { id: 'argamassa', label: 'Argamassa colante' },
  { id: 'revestimento', label: 'Revestimento de parede' },
  { id: 'blocos', label: 'Blocos de alvenaria' },
  { id: 'volume', label: 'Contrapiso e reboco' },
];

const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')));

export function Calculators() {
  const [tab, setTab] = useState<Kind>('piso');
  return (
    <div className="grid gap-6">
      <div role="tablist" aria-label="Calculadoras" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} aria-pressed={tab === t.id} className="chip" onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'piso' && <FloorCalc />}
        {tab === 'tinta' && <PaintCalc />}
        {tab === 'argamassa' && <AdhesiveCalc />}
        {tab === 'revestimento' && <WallTileCalc />}
        {tab === 'blocos' && <BlocksCalc />}
        {tab === 'volume' && <VolumeCalc />}
      </div>
    </div>
  );
}

function Num({ label, value, onChange, suffix, hint, error }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; hint?: string; error?: string }) {
  const id = label.replace(/\W+/g, '-').toLowerCase();
  return (
    <div className="field">
      <label htmlFor={id} className="text-[14px] font-semibold">
        {label}
      </label>
      <div className="relative">
        <input id={id} className="input tabular pr-14" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} />
        {suffix ? <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[14px] text-text-dim">{suffix}</span> : null}
      </div>
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

function Openings({ value, onChange }: { value: { width: string; height: string; count: string }[]; onChange: (v: { width: string; height: string; count: string }[]) => void }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-[14px] font-semibold">Portas e janelas a descontar</legend>
      {value.map((o, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_80px_44px] items-end gap-2">
          <Num label={`Largura ${i + 1}`} value={o.width} suffix="m" onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, width: v } : x)))} />
          <Num label={`Altura ${i + 1}`} value={o.height} suffix="m" onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, height: v } : x)))} />
          <Num label="Qtd." value={o.count} onChange={(v) => onChange(value.map((x, j) => (j === i ? { ...x, count: v } : x)))} />
          <button type="button" aria-label={`Remover abertura ${i + 1}`} className="mb-0.5 grid h-12 w-11 place-items-center rounded-[10px] text-danger" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-quiet btn-sm w-fit" onClick={() => onChange([...value, { width: '', height: '', count: '1' }])}>
        <Plus className="h-4 w-4" aria-hidden /> Adicionar abertura
      </button>
    </fieldset>
  );
}
const toOpenings = (v: { width: string; height: string; count: string }[]) => v.map((o) => ({ width: num(o.width) || 0, height: num(o.height) || 0, count: num(o.count) || 0 }));

function Result({ r, buy }: { r: calc.Estimate | calc.Invalid | null; buy?: { href: string; label: string } }) {
  if (!r) return null;
  if (!r.ok) return <p className="rounded-[10px] bg-[#fdecea] p-3 text-[14.5px]">Preencha os campos destacados para calcular.</p>;
  const f = (n: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(n);
  return (
    <div className="grid gap-4" role="status" aria-live="polite">
      <div className="rounded-[12px] bg-graphite-950 p-5 text-white">
        <p className="text-[14px] text-white/70">Estimativa</p>
        <p className="display tabular text-[clamp(30px,4vw,44px)]">
          {r.purchase ? `${r.purchase.qty} ${r.purchase.unit}` : `${f(r.value)} ${r.unit}`}
        </p>
        {r.purchase && r.unit !== 'blocos' ? (
          <p className="tabular text-[15px] text-white/75">
            {f(r.value)} {r.unit} no total
          </p>
        ) : null}
      </div>
      <details className="rounded-[12px] bg-mineral-50 p-4" open>
        <summary className="cursor-pointer text-[15px] font-semibold">Memória de cálculo</summary>
        <ol className="mt-3 grid gap-2 text-[14.5px]">
          {r.steps.map((s) => (
            <li key={s.label} className="grid gap-0.5">
              <span className="font-semibold">{s.label}</span>
              <span className="tabular font-mono text-[13px] text-graphite-700">
                {s.expression} = {s.result}
              </span>
            </li>
          ))}
        </ol>
      </details>
      {r.notes.map((n) => (
        <p key={n} className="text-[14px] text-graphite-700">
          {n}
        </p>
      ))}
      <p className="text-[13px] text-text-dim">Estimativa para planejamento de compra. Não substitui projeto, dimensionamento estrutural ou orientação técnica.</p>
      {buy ? (
        <Link href={buy.href} className="btn btn-primary w-fit">
          {buy.label}
        </Link>
      ) : null}
    </div>
  );
}

function Shell({ form, result }: { form: React.ReactNode; result: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
      <div className="card grid gap-4 p-5 md:p-6">{form}</div>
      <div className="lg:sticky lg:top-24">{result}</div>
    </div>
  );
}

function FloorCalc() {
  const [areas, setAreas] = useState([{ length: '4', width: '3' }]);
  const [waste, setWaste] = useState('10');
  const [box, setBox] = useState('');
  const r = calc.floorTiles({ areas: areas.map((a) => ({ length: num(a.length), width: num(a.width) })), wastePct: num(waste), m2PerBox: num(box) });
  const e = r.ok ? {} : r.errors;
  return (
    <Shell
      form={
        <>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-[14px] font-semibold">Ambientes</legend>
            {areas.map((a, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_44px] items-end gap-2">
                <Num label={`Comprimento ${i + 1}`} value={a.length} suffix="m" onChange={(v) => setAreas(areas.map((x, j) => (j === i ? { ...x, length: v } : x)))} />
                <Num label={`Largura ${i + 1}`} value={a.width} suffix="m" onChange={(v) => setAreas(areas.map((x, j) => (j === i ? { ...x, width: v } : x)))} />
                <button type="button" aria-label={`Remover ambiente ${i + 1}`} disabled={areas.length === 1} className="mb-0.5 grid h-12 w-11 place-items-center rounded-[10px] text-danger disabled:opacity-30" onClick={() => setAreas(areas.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {e.areas ? <p className="field-error">{e.areas}</p> : null}
            <button type="button" className="btn btn-quiet btn-sm w-fit" onClick={() => setAreas([...areas, { length: '', width: '' }])}>
              <Plus className="h-4 w-4" aria-hidden /> Adicionar ambiente
            </button>
          </fieldset>
          <Num label="m² por caixa" value={box} onChange={setBox} suffix="m²" hint="Está impresso na caixa do piso." error={box ? e.m2PerBox : undefined} />
          <Num label="Margem de perda" value={waste} onChange={setWaste} suffix="%" hint="Ajuste com o profissional: recortes e paginação mudam a perda." error={e.wastePct} />
        </>
      }
      result={box ? <Result r={r} buy={{ href: '/categorias/pisos-porcelanatos', label: 'Ver pisos e porcelanatos' }} /> : <p className="card p-5 text-graphite-700">Informe os m² por caixa para ver quantas caixas comprar.</p>}
    />
  );
}

function PaintCalc() {
  const [per, setPer] = useState('14');
  const [h, setH] = useState('2.7');
  const [open, setOpen] = useState([{ width: '0.8', height: '2.1', count: '1' }, { width: '1.2', height: '1', count: '1' }]);
  const [coats, setCoats] = useState('2');
  const [yieldV, setYield] = useState('');
  const [can, setCan] = useState('18');
  const [ceil, setCeil] = useState('');
  const r = calc.paint({ perimeter: num(per), height: num(h), openings: toOpenings(open), coats: num(coats), yieldM2PerLitre: num(yieldV), canLitres: num(can), extraAreaM2: num(ceil) || 0 });
  const e = r.ok ? {} : r.errors;
  return (
    <Shell
      form={
        <>
          <div className="grid grid-cols-2 gap-3">
            <Num label="Perímetro das paredes" value={per} onChange={setPer} suffix="m" hint="Soma das larguras das paredes." error={e.perimeter} />
            <Num label="Pé-direito" value={h} onChange={setH} suffix="m" error={e.height} />
          </div>
          <Openings value={open} onChange={setOpen} />
          <Num label="Área do teto (opcional)" value={ceil} onChange={setCeil} suffix="m²" />
          <div className="grid grid-cols-2 gap-3">
            <Num label="Demãos" value={coats} onChange={setCoats} error={e.coats} />
            <label className="field">
              <span className="text-[14px] font-semibold">Embalagem</span>
              <select className="input" value={can} onChange={(ev) => setCan(ev.target.value)}>
                <option value="18">Lata 18 L</option>
                <option value="3.6">Galão 3,6 L</option>
                <option value="0.9">Quarto 0,9 L</option>
              </select>
            </label>
          </div>
          <Num label="Rendimento por litro, por demão" value={yieldV} onChange={setYield} suffix="m²/L" hint="Use o valor impresso na lata da tinta escolhida." error={yieldV ? e.yieldM2PerLitre : undefined} />
        </>
      }
      result={yieldV ? <Result r={r} buy={{ href: '/categorias/tintas-acessorios', label: 'Ver tintas e acessórios' }} /> : <p className="card p-5 text-graphite-700">Informe o rendimento que está na lata. Cada tinta tem o seu.</p>}
    />
  );
}

function AdhesiveCalc() {
  const [area, setArea] = useState('12');
  const [cons, setCons] = useState('');
  const [waste, setWaste] = useState('5');
  const [bag, setBag] = useState('20');
  const r = calc.tileAdhesive({ area: num(area), consumptionKgM2: num(cons), wastePct: num(waste), bagKg: num(bag) });
  const e = r.ok ? {} : r.errors;
  return (
    <Shell
      form={
        <>
          <Num label="Área a assentar" value={area} onChange={setArea} suffix="m²" error={e.area} />
          <Num label="Consumo do fabricante" value={cons} onChange={setCons} suffix="kg/m²" hint="Está no saco, conforme a peça e a desempenadeira." error={cons ? e.consumptionKgM2 : undefined} />
          <div className="grid grid-cols-2 gap-3">
            <Num label="Margem de perda" value={waste} onChange={setWaste} suffix="%" error={e.wastePct} />
            <Num label="Peso do saco" value={bag} onChange={setBag} suffix="kg" error={e.bagKg} />
          </div>
        </>
      }
      result={cons ? <Result r={r} buy={{ href: '/categorias/cimento-argamassa', label: 'Ver argamassas' }} /> : <p className="card p-5 text-graphite-700">Informe o consumo em kg/m² que está na embalagem.</p>}
    />
  );
}

function WallTileCalc() {
  const [per, setPer] = useState('7');
  const [h, setH] = useState('2.4');
  const [open, setOpen] = useState([{ width: '0.7', height: '2.1', count: '1' }]);
  const [waste, setWaste] = useState('10');
  const [box, setBox] = useState('');
  const r = calc.wallTiles({ perimeter: num(per), height: num(h), openings: toOpenings(open), wastePct: num(waste), m2PerBox: num(box) });
  const e = r.ok ? {} : r.errors;
  return (
    <Shell
      form={
        <>
          <div className="grid grid-cols-2 gap-3">
            <Num label="Largura total das paredes" value={per} onChange={setPer} suffix="m" error={e.perimeter} />
            <Num label="Altura do revestimento" value={h} onChange={setH} suffix="m" error={e.height} />
          </div>
          <Openings value={open} onChange={setOpen} />
          <div className="grid grid-cols-2 gap-3">
            <Num label="m² por caixa" value={box} onChange={setBox} suffix="m²" error={box ? e.m2PerBox : undefined} />
            <Num label="Margem de perda" value={waste} onChange={setWaste} suffix="%" error={e.wastePct} />
          </div>
        </>
      }
      result={box ? <Result r={r} buy={{ href: '/categorias/revestimentos', label: 'Ver revestimentos' }} /> : <p className="card p-5 text-graphite-700">Informe os m² por caixa do revestimento escolhido.</p>}
    />
  );
}

function BlocksCalc() {
  const [len, setLen] = useState('5');
  const [h, setH] = useState('2.8');
  const [open, setOpen] = useState([{ width: '0.8', height: '2.1', count: '1' }]);
  const [bl, setBl] = useState('29');
  const [bh, setBh] = useState('19');
  const [j, setJ] = useState('1');
  const [waste, setWaste] = useState('5');
  const r = calc.masonryBlocks({ wallLength: num(len), wallHeight: num(h), openings: toOpenings(open), blockLengthCm: num(bl), blockHeightCm: num(bh), jointCm: num(j), wastePct: num(waste) });
  const e = r.ok ? {} : r.errors;
  return (
    <Shell
      form={
        <>
          <div className="grid grid-cols-2 gap-3">
            <Num label="Comprimento da parede" value={len} onChange={setLen} suffix="m" error={e.wallLength} />
            <Num label="Altura da parede" value={h} onChange={setH} suffix="m" error={e.wallHeight} />
          </div>
          <Openings value={open} onChange={setOpen} />
          <div className="grid grid-cols-3 gap-3">
            <Num label="Bloco: comprimento" value={bl} onChange={setBl} suffix="cm" error={e.blockLengthCm} />
            <Num label="Bloco: altura" value={bh} onChange={setBh} suffix="cm" error={e.blockHeightCm} />
            <Num label="Junta" value={j} onChange={setJ} suffix="cm" error={e.jointCm} />
          </div>
          <Num label="Margem de perda" value={waste} onChange={setWaste} suffix="%" error={e.wastePct} />
        </>
      }
      result={<Result r={r} buy={{ href: '/categorias/tijolos-blocos', label: 'Ver tijolos e blocos' }} />}
    />
  );
}

function VolumeCalc() {
  const [area, setArea] = useState('20');
  const [t, setT] = useState('4');
  const [waste, setWaste] = useState('5');
  const r = calc.mortarVolume({ area: num(area), thicknessCm: num(t), wastePct: num(waste) });
  const e = r.ok ? {} : r.errors;
  return (
    <Shell
      form={
        <>
          <Num label="Área" value={area} onChange={setArea} suffix="m²" error={e.area} />
          <Num label="Espessura média" value={t} onChange={setT} suffix="cm" error={e.thicknessCm} />
          <Num label="Margem de perda" value={waste} onChange={setWaste} suffix="%" error={e.wastePct} />
        </>
      }
      result={<Result r={r} buy={{ href: '/enviar-lista', label: 'Pedir orçamento dos materiais' }} />}
    />
  );
}
