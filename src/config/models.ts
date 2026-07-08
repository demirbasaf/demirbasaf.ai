// The demo registry. Add a demo = drop a /public/models/<name>/ folder and add
// one entry here. `name` must match the folder name. That's the whole workflow.
export interface DemoEntry {
  /** folder under /public/models/<name>/ */
  name: string;
  title: string;
  blurb: string;
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
    blurb:
      'A character-level model that dreams up Turkish names one letter at a time. Inference runs entirely in your browser.',
    status: 'live',
    featured: true,
    notebook: 'https://github.com/demirbasaf',
  },
];

export const featuredDemo = demos.find((d) => d.featured && d.status === 'live');
