// /<slug>.md: the markdown twin of each entry. See src/lib/markdown.ts.
import type { APIContext } from 'astro';
import { publishedEntries } from '../lib/entries';
import { entryToMarkdown } from '../lib/markdown';
import { site } from '../config/site';

export async function getStaticPaths() {
  const entries = await publishedEntries();
  return entries.map((entry) => ({ params: { slug: entry.slug }, props: { entry } }));
}

export async function GET(context: APIContext) {
  const origin = (context.site ?? new URL(site.url)).origin;
  const body = entryToMarkdown(context.props.entry, origin);
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
