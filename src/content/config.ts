import { defineCollection, z } from 'astro:content';

// One flexible content type: an "entry" is a thing built or learned in public.
// It becomes a project when it carries a demo/repo/notebook, or a plain note
// when it does not. Files live at src/content/entries/<slug>.mdx.
const entries = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
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
    // social preview image under /public, e.g. /og/wow-mythic-plus.png; falls back to /og.png
    image: z.string().optional(),
  }),
});

export const collections = { entries };
