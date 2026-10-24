// Builds the /llms.txt markdown brief (see llmstxt.org). Generated from the
// same content as the site, so it never drifts.
import { site } from '../config/site';
import { publishedEntries } from './entries';

export async function llmsText(origin: string): Promise<string> {
  const entries = await publishedEntries();
  const url = (path: string) => `${origin}${path}`;
  const aka = site.person.alternateNames.filter((n) => n !== site.title).join(', ');

  const lines = [
    `# ${site.title}`,
    '',
    `> ${site.person.jobTitle} at ${site.person.worksFor.name}, based in ${site.person.location.city}, ${site.person.location.country}. ${site.description}`,
    '',
    `Also known as: ${aka}.`,
    '',
    '## Entries',
    ...(entries.length
      ? entries.map(
          (e) =>
            `- [${e.data.title}](${url(`/${e.slug}/`)}): ${e.data.summary} (${e.data.date
              .toISOString()
              .slice(0, 10)}). Markdown: ${url(`/${e.slug}.md`)}`,
        )
      : ['-']),
    '',
    '## Topics',
    `- ${site.person.knowsAbout.join(', ')}.`,
    '',
    '## Links',
    `- GitHub: ${site.links.github}`,
    site.links.x ? `- X: ${site.links.x}` : '',
    `- RSS: ${url('/rss.xml')}`,
    `- Full text of every entry: ${url('/llms-full.txt')}`,
    '',
  ].filter((l) => l !== '');

  return lines.join('\n');
}
