// Single source of truth for identity, links, and the SEO / structured-data
// facts. Edit here, not in templates.
export const site = {
  title: 'Ali Furkan Demirbaş',
  handle: 'demirbasaf',
  url: 'https://demirbasaf.ai',
  description:
    'Systems engineer working where systems meet ML. Models that run live in your browser, next to the writeups and notebooks behind them.',
  // The hero thesis. No em dashes, per preference.
  thesis:
    'I build deterministic systems at scale, and now the systems that deploy and contain the non-deterministic ones.',
  locale: 'en',
  links: {
    github: 'https://github.com/demirbasaf',
    // You don't have X/Twitter, so it isn't rendered. Set it to switch it on.
    x: '',
  },
  // --- identity for search engines and AI agents (schema.org Person) ---
  person: {
    jobTitle: 'Senior Software Engineer',
    worksFor: { name: 'MoonPay', url: 'https://www.moonpay.com/' },
    location: { city: 'Lisbon', country: 'Portugal' },
    // Name variants so every spelling resolves to the same person. Diacritic
    // and ASCII forms, plus common orderings.
    alternateNames: [
      'Ali Furkan Demirbaş',
      'Ali Furkan Demirbas',
      'Furkan Demirbaş',
      'Furkan Demirbas',
      'Demirbaş Ali Furkan',
      'Demirbas Ali Furkan',
      'A. Furkan Demirbaş',
    ],
    knowsAbout: [
      'Distributed systems',
      'Payments infrastructure',
      'Machine learning systems',
      'Model deployment',
      'Inference optimization',
      'Go',
      'Kubernetes',
      'Kafka',
      'PostgreSQL',
      'gRPC',
    ],
    sameAs: ['https://github.com/demirbasaf'],
  },
} as const;

export type Site = typeof site;
