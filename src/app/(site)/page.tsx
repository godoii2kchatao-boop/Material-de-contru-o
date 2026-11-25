import Image from 'next/image';
import { photo } from '@/lib/photos';
import Link from 'next/link';
import { ArrowRight, Calculator, ClipboardList, FileUp, Truck } from 'lucide-react';
import { Hero } from '@/components/home/hero';
import { MaterialChapters } from '@/components/home/material-chapters';
import { ToolSpotlight } from '@/components/home/tool-spotlight';
import { RawToFinish } from '@/components/home/raw-to-finish';
import { CompareSlider } from '@/components/home/compare-slider';
import { ProductCard } from '@/components/catalog/product-card';
import { ProductVisual } from '@/components/catalog/product-visual';

// Site photos (already used by the project) for categories that have no product photo yet.
const CATEGORY_PHOTO: Record<string, string> = {
  'materiais-eletricos': photo('eletricista'),
  'materiais-hidraulicos': photo('hidraulica-tubos'),
  revestimentos: photo('revestimento-metro'),
  ferramentas: photo('furadeira-concreto'),
  'portas-janelas': '/categorias/portas-janelas.avif',
};
import { AddToList } from '@/components/catalog/add-to-list';
import { Price } from '@/components/catalog/price';
import { getCatalog, getOffers, getRegions, getSettings, toCard } from '@/lib/data';
import { formatBRL } from '@/lib/format';

export default async function Home() {
  const [{ categories, products, categoryNames, counts }, offers, regions, s] = await Promise.all([getCatalog(), getOffers(), getRegions(), getSettings()]);
  const popular = products.filter((p) => p.popular).slice(0, 8);
  const drill = products.find((p) => p.sku === 'FB-FER-001') ?? products[0];
  const cat = (slug: string) => ({ slug, name: categoryNames[slug] ?? slug });

  return (
    <>
      <Hero storeName={s.storeName} productCount={products.length} categoryCount={categories.length} />

      {/* Categories */}
      <section aria-labelledby="cat-title" className="wrap py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="cat-title" className="display max-w-[16ch] text-[clamp(30px,4vw,54px)]">
            Encontre por categoria.
          </h2>
          <Link href="/produtos" className="btn btn-secondary">
            Ver catálogo completo <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((c) => {
            // Photo: a product photo from the category, else a site photo of the same subject; otherwise the category icon tile.
            const image = products.find((p) => p.category === c.slug && p.image)?.image ?? CATEGORY_PHOTO[c.slug] ?? null;
            return (
              <li key={c.slug}>
                <Link href={`/categorias/${c.slug}`} className="card lift group flex h-full flex-col overflow-hidden">
                  <div aria-hidden>
                    <ProductVisual image={image} category={c.slug} name={c.name} sizes="(min-width:1024px) 15vw, (min-width:768px) 22vw, (min-width:640px) 30vw, 46vw" className="aspect-[4/3]" iconClass="h-10 w-10" />
                  </div>
                  <span className="flex flex-1 items-start justify-between gap-2 border-t-[3px] border-[var(--color-accent)] p-3 sm:p-4">
                    <span className="min-w-0">
                      <span className="block text-[14px] leading-snug font-semibold hyphens-auto sm:text-[15px]">{c.name}</span>
                      <span className="tabular text-[13px] text-text-dim">
                        {counts[c.slug]} {counts[c.slug] === 1 ? 'item' : 'itens'}
                      </span>
                    </span>
                    <ArrowRight aria-hidden className="mt-0.5 hidden h-4 w-4 shrink-0 text-[var(--color-accent)] sm:block transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <MaterialChapters
        chapters={[
          { title: 'Aço para armação', body: 'Vergalhões CA-50 e CA-60, telas soldadas e arame recozido, vendidos por barra, peça ou rolo, com entrega na obra.', photo: photo('obra-vergalhao-aereo'), href: '/categorias/ferragens-aco', cta: 'Ver ferragens e aço', items: ['Vergalhão CA-50', 'Tela soldada Q-92', 'Arame recozido'] },
          { title: 'Concreto e estrutura', body: 'Cimento, areia, brita e blocos para fundação, laje e alvenaria. Agregados a granel com frete cotado pelo volume.', photo: photo('estrutura-predio'), href: '/categorias/cimento-argamassa', cta: 'Ver cimento e argamassas', items: ['Cimento CP II-F-32', 'Brita 1', 'Bloco cerâmico 9×19×29'] },
          { title: 'Madeira para fôrma e telhado', body: 'Tábuas, caibros, sarrafos e compensado resinado para fôrmas e estruturas de cobertura.', photo: photo('madeira-estrutura'), href: '/categorias/madeiras', cta: 'Ver madeiras', items: ['Tábua de pinus', 'Caibro 5×6', 'Compensado resinado 18 mm'] },
        ]}
      />

      {/* Popular */}
      <section aria-labelledby="pop-title" className="wrap py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="pop-title" className="display text-[clamp(30px,4vw,54px)]">
            Mais procurados na obra.
          </h2>
          <Link href="/produtos" className="link-draw text-[15px] font-semibold">
            Ver todos os materiais
          </Link>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((p) => (
            <li key={p.id}>
              <ProductCard p={toCard(p)} categoryName={categoryNames[p.category]} />
            </li>
          ))}
        </ul>
      </section>

      <ToolSpotlight product={{ slug: drill.slug, name: drill.name }}>
        <div className="grid max-w-[420px] gap-4 rounded-[14px] bg-white p-5 text-ink">
          <p className="font-semibold">{drill.name}</p>
          <Price cents={drill.priceCents} unit={drill.unit} />
          <AddToList productId={drill.id} unit={drill.unit} minQty={drill.minQty} name={drill.name} />
        </div>
      </ToolSpotlight>

      <RawToFinish
        stages={[
          { title: 'Estrutura', body: 'Fundação, pilares e lajes: cimento, agregados, aço e fôrmas de madeira.', photo: photo('guindaste'), categories: [cat('cimento-argamassa'), cat('areia-brita-pedra'), cat('ferragens-aco'), cat('madeiras')] },
          { title: 'Instalações', body: 'Elétrica e hidráulica embutidas antes do reboco: cabos, eletrodutos, tubos e conexões.', photo: photo('hidraulica-tubos'), categories: [cat('materiais-eletricos'), cat('materiais-hidraulicos')] },
          { title: 'Revestimento', body: 'Impermeabilização, argamassa colante, pisos e revestimentos de parede.', photo: photo('revestimento-metro'), categories: [cat('impermeabilizantes'), cat('pisos-porcelanatos'), cat('revestimentos')] },
          { title: 'Acabamento', body: 'Pintura, portas, janelas, louças, metais e iluminação para entregar o ambiente pronto.', photo: photo('sala-acabada'), categories: [cat('tintas-acessorios'), cat('portas-janelas'), cat('loucas-metais'), cat('iluminacao')] },
        ]}
      />

      {/* Before / after */}
      <section aria-labelledby="compare-title" className="wrap grid gap-10 py-20 md:py-28 lg:grid-cols-[1fr_1.5fr] lg:items-center">
        <div className="grid gap-5">
          <h2 id="compare-title" className="display text-[clamp(30px,4vw,54px)]">
            Arraste e veja o ambiente pronto.
          </h2>
          <p className="max-w-[46ch] text-[16.5px] text-graphite-700">Da parede no reboco ao piso assentado: os materiais de cada etapa estão no catálogo, com quantidades estimadas pelas calculadoras.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/calculadoras" className="btn btn-primary">
              <Calculator className="h-4 w-4" aria-hidden /> Calcular materiais
            </Link>
            <Link href="/categorias/pisos-porcelanatos" className="btn btn-secondary">
              Ver pisos e porcelanatos
            </Link>
          </div>
        </div>
        <CompareSlider before={photo('reforma-sala')} after={photo('sala-acabada-2')} beforeLabel="Cômodo em obra, com paredes e piso por acabar" afterLabel="Sala acabada, com piso, pintura e iluminação" />
      </section>

      {/* Offers */}
      {offers.length ? (
        <section aria-labelledby="ofertas-title" className="bg-graphite-950 py-20 text-white md:py-28">
          <div className="wrap">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="ofertas-title" className="display text-[clamp(30px,4vw,54px)]">
                Ofertas da semana.
              </h2>
              <Link href="/ofertas" className="btn btn-secondary text-white">
                Ver todas as ofertas
              </Link>
            </div>
            <ul className="mt-10 grid gap-4 md:grid-cols-3">
              {offers.slice(0, 3).map((o) => (
                <li key={o.id} className="grid content-start gap-3 rounded-[14px] bg-graphite-850 p-6">
                  <h3 className="heading text-[22px]">{o.title}</h3>
                  <p className="text-[15px] text-white/75">{o.description}</p>
                  <p className="text-[15px]">
                    {o.priceCents != null ? (
                      <>
                        {o.referencePriceCents ? <s className="mr-2 text-white/50">{formatBRL(o.referencePriceCents)}</s> : null}
                        <strong className="tabular text-[20px]">{formatBRL(o.priceCents)}</strong>
                      </>
                    ) : (
                      <strong>Preço no orçamento</strong>
                    )}
                  </p>
                  <p className="text-[13px] text-white/55">
                    Válida até {new Date(o.endsAt + 'T12:00:00').toLocaleDateString('pt-BR')} · valores demonstrativos
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Send your list */}
      <section aria-labelledby="lista-title" className="wrap grid gap-10 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
        <div className="frame relative aspect-[4/3] overflow-hidden rounded-[14px]">
          <Image src={photo('projeto-planta')} alt="Lista de materiais anotada sobre um projeto" fill sizes="(min-width:1024px) 50vw, 100vw" quality={70} className="object-cover" />
        </div>
        <div className="grid gap-5">
          <h2 id="lista-title" className="display text-[clamp(30px,4vw,54px)]">
            Já tem sua lista de materiais? Envie para nós.
          </h2>
          <p className="max-w-[48ch] text-[16.5px] text-graphite-700">Digite a lista, anexe o PDF do projeto ou fotografe o papel escrito à mão. O atendimento monta o orçamento e responde pelo WhatsApp.</p>
          <ul className="grid gap-2 text-[15.5px]">
            <li className="flex gap-3">
              <FileUp className="h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden /> PDF, JPG, PNG ou HEIC, até 5 arquivos de 8 MB
            </li>
            <li className="flex gap-3">
              <ClipboardList className="h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden /> Uma pessoa da loja lê e confere cada item
            </li>
          </ul>
          <Link href="/enviar-lista" className="btn btn-primary w-fit">
            Enviar minha lista
          </Link>
        </div>
      </section>

      {/* Delivery */}
      <section aria-labelledby="entrega-title" className="bg-concrete-100 py-20 md:py-28">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid content-start gap-5">
            <h2 id="entrega-title" className="display text-[clamp(30px,4vw,54px)]">
              Entrega na obra em Campinas e região.
            </h2>
            <p className="max-w-[46ch] text-[16.5px] text-graphite-700">Consulte pelo CEP antes de pedir. Material pesado ou a granel recebe cotação de frete conforme volume e acesso.</p>
            <Link href="/entrega" className="btn btn-primary w-fit">
              <Truck className="h-4 w-4" aria-hidden /> Consultar entrega
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {regions
              .filter((r) => r.active)
              .map((r) => (
                <li key={r.id} className="card grid gap-1 p-5">
                  <span className="font-semibold">{r.name}</span>
                  <span className="tabular text-[14px] text-text-dim">A partir de {formatBRL(r.baseFeeCents)} · tabela demonstrativa</span>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {/* Professionals */}
      <section aria-labelledby="pro-title" className="relative isolate overflow-hidden bg-graphite-950 text-white">
        <Image src={photo('eletricista')} alt="" fill sizes="100vw" quality={65} className="-z-10 object-cover opacity-45" />
        <div className="wrap grid min-h-[70svh] content-center gap-5 py-24">
          <h2 id="pro-title" className="display max-w-[18ch] text-[clamp(30px,4.6vw,62px)]">
            Pedreiro, eletricista, engenheiro: atendimento de quem compra toda semana.
          </h2>
          <p className="max-w-[52ch] text-[17px] text-white/85">Listas recorrentes, orçamento por volume, recompra em um toque e histórico das cotações no seu celular.</p>
          <Link href="/profissionais" className="btn btn-primary w-fit">
            Conhecer a área para profissionais
          </Link>
        </div>
      </section>
    </>
  );
}
