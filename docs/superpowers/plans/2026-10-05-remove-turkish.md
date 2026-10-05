# Remove Turkish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make demirbasaf.dev English only by deleting the Turkish locale, its routes, content and the bilingual machinery, with every English URL unchanged.

**Architecture:** Delete `src/pages/tr/`, `src/content/entries/tr/` and `src/lib/i18n.ts`; flatten `src/i18n/ui.ts` to a single English object; drop the `lang` prop from every layout and component; move entries from `entries/en/<slug>.mdx` to `entries/<slug>.mdx` so the collection slug is the URL slug.

**Tech Stack:** Astro 4, MDX, Preact, TypeScript. Verification is `npm run check`, `npm run build`, `npm run verify` and greps.

## Global Constraints

- Every existing English URL keeps resolving: `/`, `/turkish-makemore/`, `/rss.xml`, `/sitemap.xml`, `/llms.txt`.
- `/tr/` URLs 404 after this. No redirects.
- `html lang="en"`, `og:locale` `en_US`.
- No em dashes in copy or comments (site-wide preference).
- Spec: `docs/superpowers/specs/2026-10-05-remove-turkish-design.md`.

---

### Task 1: Delete Turkish routes, content and the locale helper

**Files:**
- Delete: `src/pages/tr/index.astro`, `src/pages/tr/[...slug].astro`, `src/pages/tr/rss.xml.ts`, `src/pages/tr/llms.txt.ts`
- Delete: `src/content/entries/tr/turkish-makemore.mdx`
- Delete: `src/lib/i18n.ts`
- Move: `src/content/entries/en/turkish-makemore.mdx` to `src/content/entries/turkish-makemore.mdx`
- Modify: `astro.config.mjs` (drop the `i18n` block)
- Modify: `src/content/config.ts` (drop `lang`)

**Interfaces:**
- Produces: content collection `entries` whose `entry.slug` is the bare URL slug, no `lang` field.

- [x] **Step 1: Delete and move**

```bash
git rm -r -q src/pages/tr src/content/entries/tr src/lib/i18n.ts
git mv src/content/entries/en/turkish-makemore.mdx src/content/entries/turkish-makemore.mdx
```

- [x] **Step 2: Drop the i18n block from `astro.config.mjs`**

```js
export default defineConfig({
  site: 'https://demirbasaf.dev',
  integrations: [mdx(), preact()],
  build: { format: 'directory' },
});
```
Also drop the comment line about "English at the root, Turkish under /tr/".

- [x] **Step 3: Drop `lang` from the content schema and update the comment**

In `src/content/config.ts` remove the `lang: z.enum(['en', 'tr']),` line and the `lang: en` line from the moved MDX file's frontmatter. Replace the collection comment's last two sentences with: `Files live at src/content/entries/<slug>.mdx.`

- [x] **Step 4: Verify the build fails only on the remaining imports**

Run: `npx astro check 2>&1 | grep -c "lib/i18n"`
Expected: a positive count (the remaining importers), no other error class.

- [x] **Step 5: Commit**

```bash
git add -A && git commit -m "Remove Turkish routes, content and the locale helper"
```

### Task 2: Flatten the UI strings and entry helpers

**Files:**
- Modify: `src/i18n/ui.ts`
- Modify: `src/lib/entries.ts`
- Modify: `src/lib/llms.ts`

**Interfaces:**
- Produces: `ui` (plain English object, same keys as before under `ui.en`), `publishedEntries(): Promise<Entry[]>`, `llmsText(origin: string): Promise<string>`.
- Removes: `useTranslations`, `bcp47`, `ogLocale`, `bareSlug`, `entriesByLang`.

- [x] **Step 1: Rewrite `src/i18n/ui.ts`**

```ts
// All UI and page copy in one place, so page components stay free of prose.
// No em dashes.
export const ui = {
  bio: 'Years of making machines agree. Now making them think.',
  meta: {
    description:
      'Systems engineer working where systems meet ML. Building things and making them public: live models, writeups, and the notebooks behind them.',
  },
  work: { label: 'work' },
  education: { label: 'education' },
  entries: { label: 'projects' },
  entry: {
    wip: 'wip',
    repo: 'repo',
    notebook: 'notebook',
    overview: 'overview',
    demo: 'demo',
    back: 'home',
  },
  about: {
    label: 'bio',
    p1a: "I'm a senior software engineer at ",
    p1b: ', based in Lisbon. For years I have built deterministic systems at scale: payments and high-load distributed backends.',
    p2: 'I am now working at the intersection of systems and ML: making models reliable, fast, and cheap in production. This site is where I build in public: you can run the models live, right in your browser.',
  },
} as const;
```

- [x] **Step 2: Rewrite `src/lib/entries.ts`**

```ts
// Entry helpers. An entry's collection slug is its URL slug.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'entries'>;

/** All non-draft entries, newest first. */
export async function publishedEntries(): Promise<Entry[]> {
  const all = await getCollection('entries', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
```

- [x] **Step 3: Rewrite `src/lib/llms.ts`**

```ts
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
              .slice(0, 10)})`,
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
    '',
  ].filter((l) => l !== '');

  return lines.join('\n');
}
```

- [x] **Step 4: Commit**

```bash
git add -A && git commit -m "Flatten UI strings, entry and llms helpers to English only"
```

### Task 3: Drop the lang prop from layouts, head and header

**Files:**
- Modify: `src/layouts/Base.astro`
- Modify: `src/components/BaseHead.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/layouts/Entry.astro`

**Interfaces:**
- Consumes: `ui` from Task 2.
- Produces: `<Base title? description? article?>`, `<Entry entry>`.

- [x] **Step 1: `Base.astro`**

Remove the `i18n` and `bcp47` imports and the `lang` prop. Frontmatter becomes:
```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title?: string;
  description?: string;
  article?: { publishedTime: Date; tags?: string[] };
}
const { title, description, article } = Astro.props;
---
```
Template: `<html lang="en">`, `<BaseHead title={title} description={description} article={article} />`, `<Header />`, `<Footer />`.

- [x] **Step 2: `BaseHead.astro`**

Imports become `import { ui } from '../i18n/ui';` (drop `bcp47`, `ogLocale`, the `lib/i18n` import). Drop `lang` from Props and destructuring. `description` default is `ui.meta.description`. Delete the `canonicalPath`, `enHref`, `trHref` block. `inLanguage: 'en'` in both JSON-LD objects. In the template delete the three hreflang `<link rel="alternate" hreflang=...>` lines and their comment, make the RSS link `href="/rss.xml"`, set `<meta property="og:locale" content="en_US" />` and delete the `og:locale:alternate` line.

- [x] **Step 3: `Header.astro`**

Imports: `site` and `ui` only. Delete the Props interface, `path`, `lang`, `p`, `otherHref`, `otherName`. Use `t = ui`. Template: brand `href="/"`, RSS `href="/rss.xml"`, and delete the `<a class="lang-switch" ...>` line.

- [x] **Step 4: `Entry.astro`**

```astro
---
import Base from './Base.astro';
import ModelDemo from '../components/ModelDemo.tsx';
import { ui } from '../i18n/ui';
import type { CollectionEntry } from 'astro:content';

interface Props {
  entry: CollectionEntry<'entries'>;
}
const { entry } = Astro.props;
const t = ui;
const { title, date, summary, tags, status, repo, demo, notebook } = entry.data;
const dateStr = date.toISOString().slice(0, 10);
---
```
Template: `<Base title={title} description={summary} article={{ publishedTime: date, tags }}>` and the back link `href="/"`.

- [x] **Step 5: Commit**

```bash
git add -A && git commit -m "Drop the lang prop from layouts, head and header"
```

### Task 4: Drop lang from pages, sections and config

**Files:**
- Modify: `src/pages/index.astro`, `src/pages/[...slug].astro`, `src/pages/rss.xml.ts`, `src/pages/sitemap.xml.ts`, `src/pages/llms.txt.ts`
- Modify: `src/components/pages/HomeBody.astro`, `TimelineSection.astro`, `EducationSection.astro`
- Modify: `src/config/timeline.ts`, `src/config/education.ts`

- [x] **Step 1: Pages**

`index.astro`: `<Base><HomeBody /></Base>`.

`[...slug].astro`:
```astro
---
import Entry from '../layouts/Entry.astro';
import { publishedEntries } from '../lib/entries';

export async function getStaticPaths() {
  const entries = await publishedEntries();
  return entries.map((entry) => ({ params: { slug: entry.slug }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<Entry entry={entry}>
  <Content />
</Entry>
```

`rss.xml.ts`: drop the `lib/i18n` import, `publishedEntries()`, `description: ui.meta.description`, `link: \`/${e.slug}/\``.

`sitemap.xml.ts`:
```ts
// A hand-rolled sitemap: the home page plus every published entry.
import type { APIContext } from 'astro';
import { site } from '../config/site';
import { publishedEntries } from '../lib/entries';

export async function GET(context: APIContext) {
  const base = (context.site ?? new URL(site.url)).origin;
  const entries = await publishedEntries();
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: '/' },
    ...entries.map((e) => ({ loc: `/${e.slug}/`, lastmod: e.data.date.toISOString() })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${base}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
```

`llms.txt.ts`: `llmsText(origin)`, comment `// /llms.txt. See src/lib/llms.ts for the generator.`

- [x] **Step 2: Sections**

In `HomeBody.astro`, `TimelineSection.astro`, `EducationSection.astro`: remove the Props interface, the `lang` destructure, the `lib/i18n` import and `useTranslations`; import `{ ui }` and set `const t = ui;`. `HomeBody`: `publishedEntries()`, entry link `href={\`/${e.slug}/\`}`, and render `<TimelineSection />`, `<EducationSection />`. `TimelineSection`: `{item.desc}`. `EducationSection`: `{item.descPre}` and `{item.descPost}`.

- [x] **Step 3: Config**

`timeline.ts`: drop the `Lang` import, `desc: string`, and each `desc` becomes its `en` string. Comment: `// Work timeline. Concise, one or two sentences per role.`
`education.ts`: drop the `Lang` import, `descPre: string`, `descPost: string`, each becomes its `en` string. Comment: `// Education, shown below the work timeline.`

- [x] **Step 4: Verify**

Run: `npm run check && npm run build && npm run verify`
Expected: 0 errors, build succeeds, verify prints sampled names.

Run: `grep -rn "lib/i18n\|useTranslations\|bareSlug\|localizePath\|/tr/\|bcp47\|ogLocale" src scripts; ls dist/tr 2>&1; grep -c "<loc>" dist/sitemap.xml; grep -o '/tr' dist/sitemap.xml dist/llms.txt dist/index.html`
Expected: no grep hits in `src`, `dist/tr` missing, 2 locs in the sitemap, no `/tr` anywhere in the built files.

- [x] **Step 5: Commit**

```bash
git add -A && git commit -m "Drop lang from pages, sections and config; site is English only"
```
