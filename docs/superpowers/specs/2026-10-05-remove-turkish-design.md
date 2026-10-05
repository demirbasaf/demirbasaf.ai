# Remove Turkish from the site: design

Date: 2026-10-05
Status: approved in conversation, pending written review

## Goal

Make demirbasaf.dev English only. Delete the Turkish locale, its routes, its
content and the bilingual machinery, so that new entries (starting with the
WoW keystone timer) need one file, not two.

## What goes

- `src/pages/tr/` in full: `index.astro`, `[...slug].astro`, `rss.xml.ts`,
  `llms.txt.ts`.
- `src/content/entries/tr/`.
- The `i18n` block in `astro.config.mjs`.
- `src/lib/i18n.ts` (`Lang`, `localizePath`) and every import of it.
- The `tr` half of `src/i18n/ui.ts`, plus `bcp47`, `ogLocale` and
  `useTranslations(lang)`. The English strings stay as a plain `ui` object.
- Hreflang `<link rel="alternate">` tags, `og:locale:alternate`, and any
  language switcher in `BaseHead.astro`, `Header.astro` and `Footer.astro`.
- Turkish URLs from `sitemap.xml.ts` and `llms.txt.ts`.
- The strict bilingual rule in `src/lib/entries.ts`. `publishedEntries()`
  becomes "all non-draft entries, newest first".
- The `lang` field from the content schema in `src/content/config.ts`.

## What changes shape

- Entries move from `src/content/entries/en/<slug>.mdx` to
  `src/content/entries/<slug>.mdx`. `bareSlug()` goes away; the collection
  slug is the URL slug.
- Every component or layout that took a `lang` prop (`Base.astro`,
  `Entry.astro`, `HomeBody.astro`, `TimelineSection.astro`,
  `EducationSection.astro`, `Header.astro`, `Footer.astro`) drops it and
  reads the English strings directly.
- `src/config/timeline.ts` and `src/config/education.ts`: if they carry
  per-language copy, keep only the English.

## What stays the same

- Every English URL. The home page, `/turkish-makemore/`, `/rss.xml`,
  `/sitemap.xml`, `/llms.txt` all resolve as before.
- The Turkish makemore entry itself, including its Turkish-language subject
  matter. Only the Turkish translation of the page is removed.
- `html lang="en"` and `og:locale` `en_US`.

## Old /tr/ links

They 404. Acceptable for a personal site; no redirects.

## Verification

- `npm run check` and `npm run build` pass.
- `grep -ri "tr/" src` and `grep -r "lang" src` show no leftover locale
  plumbing.
- The built `dist/` has no `tr/` directory and `sitemap.xml` lists only
  English URLs.
- `npm run verify` still passes for the makemore model.
