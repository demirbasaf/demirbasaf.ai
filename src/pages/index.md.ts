// /index.md: the markdown twin of the home page, served to agents that ask
// for `Accept: text/markdown` (see vercel.json). Same brief as /llms.txt.
import type { APIContext } from 'astro';
import { llmsText } from '../lib/llms';
import { site } from '../config/site';

export async function GET(context: APIContext) {
  const origin = (context.site ?? new URL(site.url)).origin;
  const body = await llmsText(origin);
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
