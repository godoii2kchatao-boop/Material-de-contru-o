'use client';
import Image from 'next/image';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bath, BrickWall, Cable, DoorOpen, Drill, Droplets, Grid2x2, Grid3x3, HardHat, House, Layers, LayoutGrid, Lightbulb, Mountain, Nut, Package, PaintRoller, Umbrella } from 'lucide-react';

export const CATEGORY_ICON: Record<string, LucideIcon> = {
  'cimento-argamassa': Package,
  'areia-brita-pedra': Mountain,
  'tijolos-blocos': BrickWall,
  'ferragens-aco': Grid3x3,
  madeiras: Layers,
  'telhas-coberturas': House,
  'materiais-eletricos': Cable,
  'materiais-hidraulicos': Droplets,
  'tintas-acessorios': PaintRoller,
  'pisos-porcelanatos': LayoutGrid,
  revestimentos: Grid2x2,
  'portas-janelas': DoorOpen,
  ferramentas: Drill,
  iluminacao: Lightbulb,
  impermeabilizantes: Umbrella,
  'loucas-metais': Bath,
  'parafusos-fixadores': Nut,
  epi: HardHat,
};

/**
 * Product picture inside a box whose size is fixed by its parent (aspect ratio), so nothing
 * moves while it loads. The category tile is always underneath: it shows while the photo
 * loads, and stays if the photo is missing or fails. Photos are lazy unless `priority`.
 */
export function ProductVisual({
  image,
  imageAlt,
  category,
  name,
  sizes = '(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw',
  className = '',
  iconClass = 'h-12 w-12',
  illustrative = false,
  priority = false,
}: {
  image: string | null;
  imageAlt?: string | null;
  category: string;
  name: string;
  sizes?: string;
  className?: string;
  iconClass?: string;
  illustrative?: boolean;
  priority?: boolean;
}) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const Icon = CATEGORY_ICON[category] ?? Package;
  const showPhoto = !!image && state !== 'error';
  return (
    <div className={`frame relative overflow-hidden bg-concrete-100 ${className}`} role={showPhoto ? undefined : 'img'} aria-label={showPhoto ? undefined : `${name} (sem foto cadastrada)`} data-photo={image ? state : 'none'}>
      <div className="absolute inset-0 grid place-items-center text-graphite-700" aria-hidden>
        <Icon strokeWidth={1.25} className={iconClass} />
      </div>
      {showPhoto ? (
        <Image
          src={image}
          alt={imageAlt || name}
          fill
          sizes={sizes}
          quality={72}
          loading={priority ? undefined : 'lazy'}
          preload={priority}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={`object-cover transition-[opacity,transform] duration-500 ease-[var(--ease-out)] ${state === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : null}
      {showPhoto && illustrative ? <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-graphite-950/75 px-2 py-0.5 text-[11px] font-medium text-white">Foto ilustrativa</span> : null}
    </div>
  );
}
