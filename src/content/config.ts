import { defineCollection, z } from 'astro:content';

// A post = one .mdx file under src/content/posts/<lang>/<slug>.mdx.
// Strict bilingual: a slug only appears on the site when BOTH en and tr exist.
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    lang: z.enum(['en', 'tr']),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // optional: link to the training notebook (repo / Colab / nbviewer)
    notebook: z.string().url().optional(),
  }),
});

export const collections = { posts };
