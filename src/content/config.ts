import { defineCollection, z } from 'astro:content';

// A post = one .mdx file in src/content/posts/ with this frontmatter.
const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // optional: link to the training notebook (repo / Colab / nbviewer)
    notebook: z.string().url().optional(),
  }),
});

export const collections = { posts };
