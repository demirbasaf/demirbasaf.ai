// Locale helpers. English is the default (served at the root); Turkish lives
// under /tr/. These functions are the single place that knows the URL scheme.
export const LOCALES = ['en', 'tr'] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = 'en';

/** Which locale a URL path belongs to. */
export function getLang(pathname: string): Lang {
  return pathname === '/tr' || pathname.startsWith('/tr/') ? 'tr' : 'en';
}

/** Turn a canonical (English) path into the given locale's path. */
export function localizePath(lang: Lang, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'en') return clean;
  return clean === '/' ? '/tr/' : `/tr${clean}`;
}

/** Drop any /tr prefix, returning the canonical path. */
export function stripLang(path: string): string {
  if (path === '/tr' || path === '/tr/') return '/';
  if (path.startsWith('/tr/')) return path.slice(3);
  return path;
}

/** The same page in the other language (used by the toggle and hreflang). */
export function counterpart(lang: Lang, pathname: string): string {
  const canonical = stripLang(pathname);
  return localizePath(lang === 'en' ? 'tr' : 'en', canonical);
}

export const OTHER: Record<Lang, Lang> = { en: 'tr', tr: 'en' };
