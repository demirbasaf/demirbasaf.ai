// Single source of truth for identity, links, and the SEO / structured-data
// facts. Edit here, not in templates.
export const site = {
  title: 'Ali Furkan Demirbaş',
  // Appended to the home page title so search results say what I do, not just who.
  tagline: 'Software engineer, ML systems',
  handle: 'demirbasaf',
  url: 'https://demirbasaf.dev',
  description:
    'Software engineer working where systems meet machine learning. Models that run live in your browser, with the data analysis, writeups and notebooks behind them.',
  // The hero thesis. No em dashes, per preference.
  thesis:
    'I build deterministic systems at scale, and now the systems that deploy and contain the non-deterministic ones.',
  locale: 'en',
  links: {
    github: 'https://github.com/demirbasaf',
    linkedin: 'https://www.linkedin.com/in/demirbasaf/',
    email: 'me.demirbasaf@gmail.com',
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
      'Machine learning',
      'Machine learning systems',
      'Data science',
      'Data analysis',
      'Game analytics',
      'World of Warcraft',
      'Model deployment',
      'Inference optimization',
      'Go',
      'Kubernetes',
      'Kafka',
      'PostgreSQL',
      'gRPC',
    ],
    sameAs: ['https://github.com/demirbasaf', 'https://www.linkedin.com/in/demirbasaf/'],
  },
} as const;

export type Site = typeof site;
