import { defineCollection, z } from 'astro:content';

// One flexible content type: an "entry" is a thing built or learned in public.
// It becomes a project when it carries a demo/repo/notebook, or a plain note
// when it does not. Files live at src/content/entries/<lang>/<slug>.mdx.
// Strict bilingual: a slug ships only when both en and tr exist.
const entries = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    lang: z.enum(['en', 'tr']),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // work-in-progress vs finished, shown as a small label
    status: z.enum(['wip', 'done']).default('done'),
    // this project's own public repo (omit for notes / the dummy)
    repo: z.string().url().optional(),
    // a model demo: the folder name under /public/models/<demo>/
    demo: z.string().optional(),
    // training notebook (English): Colab / nbviewer / repo link
    notebook: z.string().url().optional(),
  }),
});

export const collections = { entries };
