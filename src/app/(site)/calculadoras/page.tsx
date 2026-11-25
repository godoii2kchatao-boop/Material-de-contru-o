import type { Metadata } from 'next';
import { Calculators } from '@/components/forms/calculators';

export const metadata: Metadata = { title: 'Calculadoras de material', description: 'Estime pisos, tinta, argamassa, revestimento, blocos e volume de contrapiso com memória de cálculo.' };

export default function CalculadorasPage() {
  return (
    <div className="wrap py-10 md:py-14">
      <h1 className="display text-[clamp(32px,5vw,60px)]">Calculadoras de material</h1>
      <p className="mt-3 max-w-[64ch] text-[16.5px] text-graphite-700">Medidas do ambiente e os dados da embalagem do produto viram quantidade de compra, com a conta aberta passo a passo. Margem de perda ajustável em todas.</p>
      <div className="mt-8">
        <Calculators />
      </div>
    </div>
  );
}
