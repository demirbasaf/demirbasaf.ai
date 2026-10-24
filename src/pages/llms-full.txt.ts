// /llms-full.txt: the llms.txt brief followed by every entry in full, as
// markdown, in one file (see llmstxt.org).
import type { APIContext } from 'astro';
import { llmsText } from '../lib/llms';
import { entryToMarkdown } from '../lib/markdown';
import { publishedEntries } from '../lib/entries';
import { site } from '../config/site';

export async function GET(context: APIContext) {
  const origin = (context.site ?? new URL(site.url)).origin;
  const entries = await publishedEntries();
  const parts = [await llmsText(origin), ...entries.map((e) => entryToMarkdown(e, origin))];
  return new Response(parts.join('\n\n---\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
