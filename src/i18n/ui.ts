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
    home: {
      thesis:
        'I build deterministic systems at scale, and now the systems that deploy and contain the non-deterministic ones.',
    },
    work: { label: 'work' },
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
      p1b: ', based in Lisbon. For years I have built deterministic systems at scale: payments and high-load distributed backends, where being correct under load is the whole job.',
      p2: 'I am now working at the intersection of systems and ML, the engineering of deployed intelligence: making models reliable, fast, and cheap in production. This site is where I build in public. The models here run live, in your browser, next to the writeups and notebooks that produced them.',
    },
  },

  tr: {
    langName: 'Türkçe',
    bio: 'Yıllarca makinelere anlaşmayı öğrettim. Şimdi düşünmeyi.',
    meta: {
      description:
        "Sistemlerle ML'in kesiştiği yerde çalışan bir sistem mühendisi. Yaptığı her şey ortada: canlı modeller, yazılar ve arkalarındaki notebook'lar.",
    },
    home: {
      thesis:
        'Büyük ölçekte deterministik sistemler kuruyorum. Şimdi de deterministik olmayanları konuşlandırıp zapt eden sistemleri.',
    },
    work: { label: 'deneyim' },
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
      p1b: "'de kıdemli yazılım mühendisiyim, Lizbon'dayım. Yıllardır büyük ölçekte deterministik sistemler kuruyorum: ödemeler ve yüksek trafikli dağıtık backend'ler. İşin tamamı zaten bu: yük altında doğru kalmak.",
      p2: "Artık sistemlerle ML'in kesişiminde, konuşlandırılmış zekânın mühendisliğinde çalışıyorum: modelleri üretimde güvenilir, hızlı ve ucuz kılmak. Bu site, işi göz önünde yaptığım yer. Buradaki modeller tarayıcınızda canlı çalışıyor, hemen yanlarında da onları üreten yazılar ve notebook'lar var.",
    },
  },
} as const;

export function useTranslations(lang: Lang) {
  return ui[lang];
}

/** BCP-47 tags for og:locale / html lang / hreflang. */
export const bcp47: Record<Lang, string> = { en: 'en', tr: 'tr' };
export const ogLocale: Record<Lang, string> = { en: 'en_US', tr: 'tr_TR' };
