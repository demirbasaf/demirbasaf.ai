// Entry helpers. Enforces the strict bilingual rule: a slug is only published
// when both the English and Turkish versions exist.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';

export type Entry = CollectionEntry<'entries'>;

/** The slug without its leading language segment: 'en/foo' -> 'foo'. */
export function bareSlug(entry: Entry): string {
  return entry.slug.replace(/^(en|tr)\//, '');
}

/** All non-draft entries in one language, newest first. */
export async function entriesByLang(lang: Lang): Promise<Entry[]> {
  const all = await getCollection('entries', ({ data }) => !data.draft && data.lang === lang);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Entries for `lang` whose slug also exists in the other language.
 * This is what pages render, so nothing half-translated ever ships.
 */
export async function publishedEntries(lang: Lang): Promise<Entry[]> {
  const [mine, other] = await Promise.all([
    entriesByLang(lang),
    entriesByLang(lang === 'en' ? 'tr' : 'en'),
  ]);
  const otherSlugs = new Set(other.map(bareSlug));
  return mine.filter((e) => otherSlugs.has(bareSlug(e)));
}
