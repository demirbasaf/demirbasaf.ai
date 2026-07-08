// The demo registry. Add a demo = drop a /public/models/<name>/ folder and add
// one entry here. `name` must match the folder name. Blurbs are per-locale.
import type { Lang } from '../lib/i18n';

export interface DemoEntry {
  /** folder under /public/models/<name>/ */
  name: string;
  title: string;
  blurb: Record<Lang, string>;
  status: 'live' | 'soon';
  /** surface this one in the home hero (first featured live demo wins) */
  featured?: boolean;
  /** link to the training notebook: repo / Colab / nbviewer */
  notebook?: string;
}

export const demos: DemoEntry[] = [
  {
    name: 'turkish-makemore',
    title: 'Turkish makemore',
    blurb: {
      en: 'A character-level model that dreams up Turkish names one letter at a time. Inference runs entirely in your browser.',
      tr: 'Türkçe isimleri harf harf uyduran, karakter düzeyinde bir model. Çıkarım tamamen tarayıcında çalışır.',
    },
    status: 'live',
    featured: true,
    notebook: 'https://github.com/demirbasaf',
  },
];

export const featuredDemo = demos.find((d) => d.featured && d.status === 'live');
