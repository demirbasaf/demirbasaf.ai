// All UI and page copy, English and Turkish, in one place. Translations live
// here so the page components stay identical across locales. No em dashes.
// (Turkish gets a native copy pass; treat these as functional drafts.)
import type { Lang } from '../lib/i18n';

export const ui = {
  en: {
    langName: 'English',
    bio: 'Six years making machines agree. Now making them think.',
    meta: {
      description:
        'Systems engineer working where systems meet ML. Building things and making them public: live models, writeups, and the notebooks behind them.',
    },
    home: {
      thesis:
        'I build deterministic systems at scale, and now the systems that deploy and contain the non-deterministic ones.',
    },
    entry: {
      wip: 'wip',
      repo: 'repo',
      notebook: 'notebook',
      overview: 'overview',
      demo: 'demo',
      back: 'home',
    },
    about: {
      label: 'about',
      p1a: "I'm a senior software engineer at ",
      p1b: ', based in Lisbon. For six years I have built deterministic systems at scale: payments and high-load distributed backends, where being correct under load is the whole job.',
      p2: 'I am now working at the intersection of systems and ML, the engineering of deployed intelligence: making models reliable, fast, and cheap in production. This site is where I build in public. The models here run live, in your browser, next to the writeups and notebooks that produced them.',
      variants: 'Also written Furkan Demirbaş, or without the diacritics, Ali Furkan Demirbas.',
    },
  },

  tr: {
    langName: 'Türkçe',
    bio: 'Altı yıl makineleri anlaştırdım. Şimdi onları düşündürüyorum.',
    meta: {
      description:
        "Sistemlerle makine öğreniminin kesiştiği yerde çalışan bir mühendis. Yaptıklarını herkese açıyor: canlı modeller, yazılar ve arkalarındaki notebook'lar.",
    },
    home: {
      thesis:
        'Büyük ölçekte deterministik sistemler kuruyorum. Şimdi de deterministik olmayanları konuşlandırıp dizginleyen sistemleri.',
    },
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
      p1b: "'de kıdemli yazılım mühendisiyim, Lizbon'da yaşıyorum. Altı yıldır büyük ölçekte deterministik sistemler kuruyorum: ödemeler, yüksek yüklü dağıtık backend'ler. İşin tamamı şu: yük altında da doğru çalışmak.",
      p2: "Artık sistemlerle makine öğreniminin kesişiminde çalışıyorum: konuşlandırılmış zekânın mühendisliği, yani modelleri üretimde güvenilir, hızlı ve ucuz tutmak. Bu site, işleri gözler önünde yaptığım yer. Buradaki modeller tarayıcınızda canlı çalışıyor, hemen yanlarında da onları üreten yazılar ve notebook'lar.",
      variants: 'Furkan Demirbaş diye de yazılır, Türkçe karakterler olmadan Ali Furkan Demirbas.',
    },
  },
} as const;

export function useTranslations(lang: Lang) {
  return ui[lang];
}

/** BCP-47 tags for og:locale / html lang / hreflang. */
export const bcp47: Record<Lang, string> = { en: 'en', tr: 'tr' };
export const ogLocale: Record<Lang, string> = { en: 'en_US', tr: 'tr_TR' };
