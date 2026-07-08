// All UI and page copy, English and Turkish, in one place. Translations live
// here so the page components stay identical across locales. No em dashes.
import type { Lang } from '../lib/i18n';

export const ui = {
  en: {
    langName: 'English',
    nav: { writing: 'writing', demos: 'demos', about: 'about' },
    meta: {
      description:
        'Systems engineer working where systems meet ML. Models that run live in your browser, next to the writeups and notebooks behind them.',
    },
    home: {
      eyebrow: 'engineer of deployed intelligence',
      thesis:
        'I build deterministic systems at scale, and now the systems that deploy and contain the non-deterministic ones.',
      lede: 'Six years of payments and distributed systems, now pointed at the model side, making inference reliable, fast, and cheap where it runs.',
      live: 'live',
      allDemos: 'all demos',
      latest: 'latest writing',
      allWriting: 'all writing',
    },
    demos: {
      eyebrow: 'demos',
      title: 'Models running in your browser',
      intro:
        'Each demo loads a small model artifact and runs inference client-side. No server, no per-request cost. Trained elsewhere, deployed here.',
      live: 'live',
      soon: 'soon',
      comingSoon: 'coming soon',
      notebook: 'training notebook',
    },
    writing: {
      eyebrow: 'writing',
      title: 'Writing',
      intro:
        'Building in public: training notes, systems writeups, and the demos they produced.',
      none: 'no posts yet.',
      notebook: 'notebook',
    },
    about: {
      eyebrow: 'about',
      p1a: "I'm a senior software engineer at ",
      p1b: ', based in Lisbon. For six years I have built deterministic systems at scale: payments and high-load distributed backends, where being correct under load is the whole job.',
      p2: 'I am now working at the intersection of systems and ML, the engineering of deployed intelligence: making models reliable, fast, and cheap in production. This site is where I build in public. The models here run live, in your browser, next to the writeups and notebooks that produced them.',
      variants: 'Also written Furkan Demirbaş, or without the diacritics, Ali Furkan Demirbas.',
    },
    footer: { tagline: 'deployed intelligence, statically served' },
  },

  tr: {
    langName: 'Türkçe',
    nav: { writing: 'yazılar', demos: 'demolar', about: 'hakkında' },
    meta: {
      description:
        'Sistemler ile makine öğreniminin kesiştiği yerde çalışan bir mühendis. Tarayıcında canlı çalışan modeller, onları üreten yazıların ve defterlerin yanında.',
    },
    home: {
      eyebrow: 'konuşlandırılmış zekânın mühendisi',
      thesis:
        'Ölçekte deterministik sistemler kuruyorum; artık deterministik olmayanları konuşlandıran ve dizginleyen sistemleri de.',
      lede: 'Altı yıldır ödemeler ve dağıtık sistemler; şimdi hedefim model tarafı: çıkarımı çalıştığı yerde güvenilir, hızlı ve ucuz kılmak.',
      live: 'canlı',
      allDemos: 'tüm demolar',
      latest: 'son yazılar',
      allWriting: 'tüm yazılar',
    },
    demos: {
      eyebrow: 'demolar',
      title: 'Tarayıcında çalışan modeller',
      intro:
        'Her demo küçük bir model dosyası yükler ve çıkarımı istemci tarafında çalıştırır. Sunucu yok, istek başına maliyet yok. Başka yerde eğitildi, burada konuşlandırıldı.',
      live: 'canlı',
      soon: 'yakında',
      comingSoon: 'yakında',
      notebook: 'eğitim defteri',
    },
    writing: {
      eyebrow: 'yazılar',
      title: 'Yazılar',
      intro:
        'Herkesin gözü önünde inşa: eğitim notları, sistem yazıları ve ürettikleri demolar.',
      none: 'henüz yazı yok.',
      notebook: 'defter',
    },
    about: {
      eyebrow: 'hakkında',
      p1a: 'Lisbon merkezli, ',
      p1b: "'de kıdemli bir yazılım mühendisiyim. Altı yıldır ölçekte deterministik sistemler kurdum: ödemeler ve yüksek yüklü dağıtık arka uçlar; yük altında doğru çalışmak işin ta kendisi.",
      p2: 'Şimdi sistemler ve makine öğreniminin kesişiminde çalışıyorum: konuşlandırılmış zekânın mühendisliği, yani modelleri üretimde güvenilir, hızlı ve ucuz kılmak. Bu site, herkesin gözü önünde inşa ettiğim yer. Buradaki modeller tarayıcında canlı çalışır, onları üreten yazıların ve defterlerin yanında.',
      variants: 'Furkan Demirbaş olarak da yazılır; aksan işaretleri olmadan Ali Furkan Demirbas.',
    },
    footer: { tagline: 'konuşlandırılmış zekâ, statik olarak sunulur' },
  },
} as const;

export function useTranslations(lang: Lang) {
  return ui[lang];
}

/** BCP-47 tags for og:locale / html lang / hreflang. */
export const bcp47: Record<Lang, string> = { en: 'en', tr: 'tr' };
export const ogLocale: Record<Lang, string> = { en: 'en_US', tr: 'tr_TR' };
