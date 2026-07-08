// A hand-rolled sitemap covering both locales and every strict-paired post.
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { publishedPosts, bareSlug } from '../lib/posts';
import { LOCALES, localizePath } from '../lib/i18n';

export async function GET(context: APIContext) {
  const base = (context.site ?? new URL(site.url)).origin;
  const staticPaths = ['/', '/writing/', '/demos/', '/about/'];

  const urls: { loc: string; lastmod?: string }[] = [];
  for (const lang of LOCALES) {
    for (const path of staticPaths) urls.push({ loc: localizePath(lang, path) });
    const posts = await publishedPosts(lang);
    for (const p of posts) {
      urls.push({
        loc: localizePath(lang, `/writing/${bareSlug(p)}/`),
        lastmod: p.data.date.toISOString(),
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
