// Builds the /llms.txt markdown brief for a given locale (see llmstxt.org).
// Generated from the same content as the site, so it never drifts.
import { site } from '../config/site';
import { publishedEntries, bareSlug } from './entries';
import { localizePath, type Lang } from './i18n';

const copy = {
  en: {
    intro: (jt: string, org: string, city: string, country: string, desc: string) =>
      `${jt} at ${org}, based in ${city}, ${country}. ${desc}`,
    aka: 'Also known as',
    languages: 'Available in English and Turkish. Turkish version under /tr/.',
    entries: 'Entries',
    about: 'About',
    aboutText: 'short bio.',
    topics: 'Topics',
    links: 'Links',
    jobTitle: 'Senior Software Engineer',
    desc: site.description,
  },
  tr: {
    intro: (jt: string, org: string, city: string, country: string, desc: string) =>
      `${org} bünyesinde ${jt}, ${city}, ${country} merkezli. ${desc}`,
    aka: 'Ayrıca şöyle yazılır',
    languages: 'İngilizce ve Türkçe olarak mevcut. Türkçe sürüm /tr/ altında.',
    entries: 'Kayıtlar',
    about: 'Hakkında',
    aboutText: 'kısa biyografi.',
    topics: 'Konular',
    links: 'Bağlantılar',
    jobTitle: 'Kıdemli Yazılım Mühendisi',
    desc: 'Sistemlerle makine öğreniminin kesiştiği yerde çalışan bir mühendis. Modeller tarayıcınızda canlı çalışıyor.',
  },
} as const;

export async function llmsText(lang: Lang, origin: string): Promise<string> {
  const c = copy[lang];
  const entries = await publishedEntries(lang);
  const url = (path: string) => `${origin}${localizePath(lang, path)}`;
  const aka = site.person.alternateNames.filter((n) => n !== site.title).join(', ');

  const lines = [
    `# ${site.title}`,
    '',
    `> ${c.intro(c.jobTitle, site.person.worksFor.name, site.person.location.city, site.person.location.country, c.desc)}`,
    '',
    `${c.aka}: ${aka}.`,
    c.languages,
    '',
    `## ${c.entries}`,
    ...(entries.length
      ? entries.map(
          (e) =>
            `- [${e.data.title}](${url(`/${bareSlug(e)}/`)}): ${e.data.summary} (${e.data.date
              .toISOString()
              .slice(0, 10)})`,
        )
      : ['-']),
    '',
    `## ${c.topics}`,
    `- ${site.person.knowsAbout.join(', ')}.`,
    '',
    `## ${c.links}`,
    `- GitHub: ${site.links.github}`,
    site.links.x ? `- X: ${site.links.x}` : '',
    `- RSS: ${url('/rss.xml')}`,
    '',
  ].filter((l) => l !== '');

  return lines.join('\n');
}
