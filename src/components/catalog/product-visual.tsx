import Image from 'next/image';
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
 * Product picture. Real photographs uploaded by the store are shown as photos;
 * a product without one gets a plain category tile (never a fake or stock image).
 */
export function ProductVisual({ image, category, name, sizes = '(min-width: 1024px) 25vw, 50vw', className = '', iconClass = 'h-12 w-12' }: { image: string | null; category: string; name: string; sizes?: string; className?: string; iconClass?: string }) {
  if (image) {
    return (
      <div className={`frame relative bg-concrete-100 ${className}`}>
        <Image src={image} alt={name} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }
  const Icon = CATEGORY_ICON[category] ?? Package;
  return (
    <div className={`relative grid place-items-center bg-concrete-100 text-graphite-700 ${className}`} role="img" aria-label={`${name} (sem foto cadastrada)`}>
      <Icon aria-hidden strokeWidth={1.25} className={iconClass} />
    </div>
  );
}
