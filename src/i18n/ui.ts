// All UI and page copy in one place, so page components stay free of prose.
// No em dashes.
export const ui = {
  bio: 'Years of making machines agree. Now making them think.',
  meta: {
    description:
      'Systems engineer working where systems meet ML. Building things and making them public: live models, writeups, and the notebooks behind them.',
  },
  work: { label: 'work' },
  education: { label: 'education' },
  entries: { label: 'posts' },
  email: { copy: 'copy', copied: 'copied' },
  entry: {
    wip: 'wip',
    repo: 'source on GitHub',
    notebook: 'training notebook',
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
} as const;
