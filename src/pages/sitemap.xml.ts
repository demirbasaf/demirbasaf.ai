// A hand-rolled sitemap. Simpler and more predictable than the integration,
// and it lets us list exactly the URLs we want indexed.
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../config/site';

export async function GET(context: APIContext) {
  const base = (context.site ?? new URL(site.url)).origin;
  const posts = await getCollection('posts', ({ data }) => !data.draft);

  const staticPaths = ['/', '/writing/', '/demos/', '/about/'];
  const postPaths = posts.map((p) => ({
    loc: `/writing/${p.slug}/`,
    lastmod: p.data.date.toISOString(),
  }));

  const urls = [
    ...staticPaths.map((loc) => ({ loc, lastmod: undefined as string | undefined })),
    ...postPaths,
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${base}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
