// Builds the /llms.txt markdown brief for a given locale (see llmstxt.org).
// Generated from the same content as the site, so it never drifts.
import { site } from '../config/site';
import { publishedPosts, bareSlug } from './posts';
import { localizePath, type Lang } from './i18n';

const copy = {
  en: {
    intro: (jt: string, org: string, city: string, country: string, desc: string) =>
      `${jt} at ${org}, based in ${city}, ${country}. ${desc}`,
    aka: 'Also known as',
    site: 'Site',
    home: 'thesis, a featured ML model running live in the browser, and latest writing.',
    writingS: 'notes on systems and ML, building in public.',
    demos: 'interactive ML model demos, inference runs client side.',
    about: 'short bio.',
    writing: 'Writing',
    topics: 'Topics',
    links: 'Links',
    languages: 'Available in English and Turkish. Turkish version under /tr/.',
  },
  tr: {
    intro: (jt: string, org: string, city: string, country: string, desc: string) =>
      `${org} bünyesinde ${jt}, ${city}, ${country} merkezli. ${desc}`,
    aka: 'Ayrıca şöyle yazılır',
    site: 'Site',
    home: 'tez, tarayıcıda canlı çalışan öne çıkan bir model ve son yazılar.',
    writingS: 'sistemler ve makine öğrenimi üzerine notlar, herkesin gözü önünde inşa.',
    demos: 'etkileşimli model demoları, çıkarım istemci tarafında çalışır.',
    about: 'kısa biyografi.',
    writing: 'Yazılar',
    topics: 'Konular',
    links: 'Bağlantılar',
    languages: 'İngilizce ve Türkçe olarak mevcut. Türkçe sürüm /tr/ altında.',
  },
} as const;

const meta = {
  en: {
    jobTitle: 'Senior Software Engineer',
    desc: site.description,
    homeLabel: 'Home',
    writingLabel: 'Writing',
    demosLabel: 'Demos',
    aboutLabel: 'About',
  },
  tr: {
    jobTitle: 'Kıdemli Yazılım Mühendisi',
    desc: 'Sistemler ile makine öğreniminin kesiştiği yerde çalışan bir mühendis. Modeller tarayıcında canlı çalışır.',
    homeLabel: 'Ana sayfa',
    writingLabel: 'Yazılar',
    demosLabel: 'Demolar',
    aboutLabel: 'Hakkında',
  },
} as const;

export async function llmsText(lang: Lang, origin: string): Promise<string> {
  const c = copy[lang];
  const m = meta[lang];
  const posts = await publishedPosts(lang);
  const url = (path: string) => `${origin}${localizePath(lang, path)}`;
  const aka = site.person.alternateNames.filter((n) => n !== site.title).join(', ');

  const lines = [
    `# ${site.title}`,
    '',
    `> ${c.intro(m.jobTitle, site.person.worksFor.name, site.person.location.city, site.person.location.country, m.desc)}`,
    '',
    `${c.aka}: ${aka}.`,
    c.languages,
    '',
    `## ${c.site}`,
    `- [${m.homeLabel}](${url('/')}): ${c.home}`,
    `- [${m.writingLabel}](${url('/writing/')}): ${c.writingS}`,
    `- [${m.demosLabel}](${url('/demos/')}): ${c.demos}`,
    `- [${m.aboutLabel}](${url('/about/')}): ${c.about}`,
    '',
    `## ${c.writing}`,
    ...(posts.length
      ? posts.map(
          (p) =>
            `- [${p.data.title}](${url(`/writing/${bareSlug(p)}/`)}): ${p.data.summary} (${p.data.date
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
