// /llms.txt - a plain-markdown summary of the site for language models and
// agents (see llmstxt.org). Generated from the same content as the site, so it
// never drifts. No em dashes, concise by design.
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../config/site';

export async function GET(_context: APIContext) {
  const base = site.url;
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const aka = site.person.alternateNames.filter((n) => n !== site.title).join(', ');

  const lines = [
    `# ${site.title}`,
    '',
    `> ${site.person.jobTitle} at ${site.person.worksFor.name}, based in ${site.person.location.city}, ${site.person.location.country}. ${site.description}`,
    '',
    `Also known as: ${aka}.`,
    '',
    '## Site',
    `- [Home](${base}/): thesis, a featured ML model running live in the browser, and latest writing.`,
    `- [Writing](${base}/writing/): notes on systems and ML, building in public.`,
    `- [Demos](${base}/demos/): interactive ML model demos, inference runs client side.`,
    `- [About](${base}/about/): short bio.`,
    '',
    '## Writing',
    ...(posts.length
      ? posts.map(
          (p) =>
            `- [${p.data.title}](${base}/writing/${p.slug}/): ${p.data.summary} (${p.data.date
              .toISOString()
              .slice(0, 10)})`,
        )
      : ['- (no posts yet)']),
    '',
    '## Topics',
    `- ${site.person.knowsAbout.join(', ')}.`,
    '',
    '## Links',
    `- GitHub: ${site.links.github}`,
    site.links.x ? `- X: ${site.links.x}` : '',
    `- RSS: ${base}/rss.xml`,
    '',
  ].filter((l) => l !== '');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
