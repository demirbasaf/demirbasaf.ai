// A hand-rolled sitemap covering both locales and every strict-paired entry.
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { publishedEntries, bareSlug } from '../lib/entries';
import { LOCALES, localizePath } from '../lib/i18n';

export async function GET(context: APIContext) {
  const base = (context.site ?? new URL(site.url)).origin;
  const staticPaths = ['/', '/about/'];

  const urls: { loc: string; lastmod?: string }[] = [];
  for (const lang of LOCALES) {
    for (const path of staticPaths) urls.push({ loc: localizePath(lang, path) });
    const entries = await publishedEntries(lang);
    for (const e of entries) {
      urls.push({
        loc: localizePath(lang, `/${bareSlug(e)}/`),
        lastmod: e.data.date.toISOString(),
      });
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${base}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
