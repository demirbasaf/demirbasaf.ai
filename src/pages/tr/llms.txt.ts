// /tr/llms.txt (Turkish). See src/lib/llms.ts for the generator.
import type { APIContext } from 'astro';
import { llmsText } from '../../lib/llms';
import { site } from '../../config/site';

export async function GET(context: APIContext) {
  const origin = (context.site ?? new URL(site.url)).origin;
  const body = await llmsText('tr', origin);
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
