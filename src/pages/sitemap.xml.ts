// A hand-rolled sitemap: the home page plus every published entry.
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { publishedEntries } from '../lib/entries';

export async function GET(context: APIContext) {
  const base = (context.site ?? new URL(site.url)).origin;
  const entries = await publishedEntries();
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: '/' },
    ...entries.map((e) => ({ loc: `/${e.slug}/`, lastmod: e.data.date.toISOString() })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${base}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
