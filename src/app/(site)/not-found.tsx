import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[60svh] content-center gap-5 py-20">
      <h1 className="display text-[clamp(32px,5vw,60px)]">Página não encontrada.</h1>
      <p className="max-w-[52ch] text-graphite-700">O endereço pode ter mudado ou o produto saiu do catálogo. Busque o material ou volte para o início.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/produtos" className="btn btn-primary">
          Buscar materiais
        </Link>
        <Link href="/" className="btn btn-secondary">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
