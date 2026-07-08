// Post helpers. Enforces the strict bilingual rule: a slug is only published
// when both the English and Turkish versions exist.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './i18n';

export type Post = CollectionEntry<'posts'>;

/** The slug without its leading language segment: 'en/foo' -> 'foo'. */
export function bareSlug(post: Post): string {
  return post.slug.replace(/^(en|tr)\//, '');
}

/** All non-draft posts in one language, newest first. */
export async function postsByLang(lang: Lang): Promise<Post[]> {
  const all = await getCollection('posts', ({ data }) => !data.draft && data.lang === lang);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Posts for `lang` whose slug also exists in the other language.
 * This is what pages render, so nothing half-translated ever ships.
 */
export async function publishedPosts(lang: Lang): Promise<Post[]> {
  const [mine, other] = await Promise.all([
    postsByLang(lang),
    postsByLang(lang === 'en' ? 'tr' : 'en'),
  ]);
  const otherSlugs = new Set(other.map(bareSlug));
  return mine.filter((p) => otherSlugs.has(bareSlug(p)));
}
