import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { ui } from '../i18n/ui';
import { publishedEntries, bareSlug } from '../lib/entries';
import { localizePath } from '../lib/i18n';

export async function GET(context: APIContext) {
  const entries = await publishedEntries('en');
  return rss({
    title: site.title,
    description: ui.en.meta.description,
    site: context.site ?? site.url,
    items: entries.map((e) => ({
      title: e.data.title,
      description: e.data.summary,
      pubDate: e.data.date,
      link: localizePath('en', `/${bareSlug(e)}/`),
    })),
  });
}
