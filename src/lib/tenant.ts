import fortebaseConfig from '@tenants/fortebase/tenant.config';
import fortebaseCatalog from '@tenants/fortebase/catalog.json';
import type { TenantConfig } from './types';

/**
 * Each tenant is one store. A deployment serves exactly one tenant (TENANT env var),
 * with its own data directory or database, so data never mixes between clients.
 * To add a client: create tenants/<id>/ (tenant.config.ts + catalog.json) and register it here.
 */
export interface CatalogSeed {
  categories: { slug: string; name: string; description: string; order: number }[];
  applications: Record<string, string>;
  products: {
    id: string;
    slug: string;
    sku: string;
    name: string;
    category: string;
    brand: string | null;
    unit: string;
    minQty: number;
    priceCents: number | null;
    availability: string;
    description: string;
    specs: Record<string, string>;
    applications: string[];
    image: string | null;
    imageAlt?: string | null;
    imageCredit?: { author: string; license: string; source: string } | null;
    popular: boolean;
  }[];
}

const TENANTS: Record<string, { config: TenantConfig; catalog: CatalogSeed }> = {
  fortebase: { config: fortebaseConfig, catalog: fortebaseCatalog as unknown as CatalogSeed },
};

export const TENANT_ID = process.env.TENANT ?? process.env.NEXT_PUBLIC_TENANT ?? 'fortebase';

function load() {
  const t = TENANTS[TENANT_ID];
  if (!t) throw new Error(`Tenant "${TENANT_ID}" não está registrado em src/lib/tenant.ts`);
  return t;
}

export const tenant = load().config;
export const catalogSeed = load().catalog;
export const applicationLabels = catalogSeed.applications;

/** Demo mode: no real WhatsApp, masked visitor data in the admin, files validated but not kept. */
export const isDemo = (process.env.DEMO_MODE ?? (tenant.demo ? 'true' : 'false')) === 'true';

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
