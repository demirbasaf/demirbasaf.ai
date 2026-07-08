// Single source of truth for identity + links. Edit here, not in templates.
export const site = {
  title: 'Ali Furkan Demirbaş',
  handle: 'demirbasaf',
  url: 'https://demirbasaf.ai',
  description:
    'Systems engineer working at the systems × ML intersection — models that run live, in your browser.',
  // The hero thesis, verbatim from the brief.
  thesis:
    'I build deterministic systems at scale — and now the systems that deploy and contain the non-deterministic ones.',
  links: {
    github: 'https://github.com/demirbasaf',
    // You told me you don't have X/Twitter — left empty so it isn't rendered.
    // Set it to e.g. 'https://x.com/demirbasaf' to switch the link on everywhere.
    x: '',
  },
} as const;

export type Site = typeof site;
