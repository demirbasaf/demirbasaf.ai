import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../../config/site';
import { ui } from '../../i18n/ui';
import { publishedPosts, bareSlug } from '../../lib/posts';
import { localizePath } from '../../lib/i18n';

export async function GET(context: APIContext) {
  const posts = await publishedPosts('tr');
  return rss({
    title: site.title,
    description: ui.tr.meta.description,
    site: context.site ?? site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.summary,
      pubDate: p.data.date,
      link: localizePath('tr', `/writing/${bareSlug(p)}/`),
    })),
  });
}
