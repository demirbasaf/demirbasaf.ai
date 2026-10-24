// Entry helpers. An entry's collection slug is its URL slug.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'entries'>;

/** All non-draft entries, newest first. */
export async function publishedEntries(): Promise<Entry[]> {
  const all = await getCollection('entries', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
