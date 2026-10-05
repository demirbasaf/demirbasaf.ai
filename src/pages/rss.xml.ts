import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { ui } from '../i18n/ui';
import { publishedEntries } from '../lib/entries';

export async function GET(context: APIContext) {
  const entries = await publishedEntries();
  return rss({
    title: site.title,
    description: ui.meta.description,
    site: context.site ?? site.url,
    items: entries.map((e) => ({
      title: e.data.title,
      description: e.data.summary,
      pubDate: e.data.date,
      link: `/${e.slug}/`,
    })),
  });
}
