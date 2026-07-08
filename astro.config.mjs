import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';

// Static site. `site` is used for canonical URLs + RSS.
// Custom domain (demirbasaf.dev) means no `base` path is needed. This also
// keeps the build GitHub-Pages-compatible if you ever point Pages at it.
export default defineConfig({
  site: 'https://demirbasaf.dev',
  // English at the root, Turkish under /tr/. No prefix on the default locale.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [mdx(), preact()],
  build: { format: 'directory' },
});
