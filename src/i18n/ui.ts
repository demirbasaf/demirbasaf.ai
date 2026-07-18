// All UI and page copy, English and Turkish, in one place. Translations live
// here so the page components stay identical across locales. No em dashes.
// (Turkish gets a native copy pass; treat these as functional drafts.)
import type { Lang } from '../lib/i18n';

export const ui = {
  en: {
    langName: 'English',
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
  },

  tr: {
    langName: 'Türkçe',
    bio: 'Yıllarca makinelere anlaşmayı öğrettim. Şimdi düşünmeyi.',
    meta: {
      description:
        "Sistemlerle ML'in kesiştiği yerde çalışan bir sistem mühendisi. Yaptığı her şey ortada: canlı modeller, yazılar ve arkalarındaki notebook'lar.",
    },
    work: { label: 'deneyim' },
    education: { label: 'eğitim' },
    entries: { label: 'projeler' },
    entry: {
      wip: 'wip',
      repo: 'repo',
      notebook: 'notebook',
      overview: 'genel bakış',
      demo: 'demo',
      back: 'ana sayfa',
    },
    about: {
      label: 'hakkında',
      p1a: '',
      p1b: "'de yazılım mühendisi olarak çalışıyorum, Lizbon'da yaşıyorum. Yıllardır büyük ölçekli deterministik sistemler geliştiriyorum: ödeme sistemleri, yüksek trafikli dağıtık backend'ler.",
      p2: "Şu an sistemlerle ML'in kesiştiği yerde çalışıyorum: modelleri production'da güvenilir, hızlı ve ucuza çalışır hale getirmek. Bu sitede yaptıklarımı olduğu gibi paylaşıyorum: modelleri doğrudan tarayıcınızda çalıştırabilirsiniz.",
    },
  },
} as const;

export function useTranslations(lang: Lang) {
  return ui[lang];
}

/** BCP-47 tags for og:locale / html lang / hreflang. */
export const bcp47: Record<Lang, string> = { en: 'en', tr: 'tr' };
export const ogLocale: Record<Lang, string> = { en: 'en_US', tr: 'tr_TR' };
