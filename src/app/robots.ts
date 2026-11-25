import type { MetadataRoute } from 'next';
import { isDemo, siteUrl } from '@/lib/tenant';

export default function robots(): MetadataRoute.Robots {
  if (isDemo) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/orcamento'] }, sitemap: `${siteUrl}/sitemap.xml` };
}
