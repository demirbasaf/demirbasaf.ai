# demirbasaf.ai

A fast, static, content-first site for building in public: **ML models that run
live in the browser**, next to the writeups, notebooks, and repos behind them.

Bilingual (English + Turkish), minimal JS, no backend. Built with
[Astro](https://astro.build), TypeScript, and a little hand-written CSS. The
models and the writing are the point; the site is the shelf.

```
npm install        # once
npm run dev        # local dev at http://localhost:4321
npm run build      # static output -> dist/
npm run preview    # serve the built dist/ locally
npm run check      # astro + typescript diagnostics
npm run placeholder  # regenerate the dummy example-charlm model
npm run verify       # run the real inference code in Node and print sample output
```

## Structure

The site is one flexible content type: an **entry**. An entry becomes a project
when it carries a demo, repo, or notebook, or a plain note when it does not. The
home page lists every entry; each entry lives on its own page at `/<slug>/`.
There are no section tabs.

```
public/models/<name>/     a model artifact = meta.json (+ weights.json | model.onnx)
scripts/
  make_placeholder.mjs     builds the dummy example-charlm model (Node, no deps)
  export_model.py          PyTorch -> artifact bridge (JSON weights AND ONNX)
src/
  lib/inference/           the legible serving path, plain commented TS
    types.ts loader.ts sampling.ts js-backend.ts onnx-backend.ts index.ts
  lib/entries.ts           strict bilingual pairing (a slug ships only if en + tr exist)
  lib/i18n.ts              locale helpers (en at root, tr under /tr/)
  i18n/ui.ts               all UI + page copy, en and tr, in one place
  components/ModelDemo.tsx  thin Preact UI shell around an engine
  components/pages/         HomeBody, AboutBody (written once, take lang)
  content/entries/en|tr/    your entries, one .mdx per language per slug
  layouts/Entry.astro       the per-entry page (meta, demo, writeup)
  pages/                    index, about, [...slug] (+ /tr mirror), rss/sitemap/llms
  styles/global.css         design tokens + minimal CSS
```

## Add an entry

Create the **same slug in both languages** (strict rule: it only publishes when
both exist):

```
src/content/entries/en/my-thing.mdx
src/content/entries/tr/my-thing.mdx
```

```mdx
---
title: My thing
lang: en                # 'tr' in the Turkish file
date: 2026-07-20
summary: One sentence shown on the home list and in meta tags.
tags: [ml, systems]
status: wip              # 'wip' shows a small label; 'done' shows nothing (default)
repo: https://github.com/demirbasaf/my-thing   # optional, the project's own repo
demo: my-model           # optional, folder under /public/models/<demo>/
notebook: https://colab.research.google.com/... # optional, English notebook link
draft: false
---

Prose here. If `demo` is set above, the live model renders automatically at the
top of the page; you do not embed it by hand.
```

## Add a model demo

1. Create the artifact folder `public/models/<name>/`:
   - **Tiny model (js backend):** `meta.json` + `weights.json`
   - **Bigger model (onnx backend):** `meta.json` (with `"backend": "onnx"`) + `model.onnx`
2. Reference it from an entry via `demo: <name>` in the frontmatter.

`<ModelDemo>` renders entirely from `meta.json`, no per-model code.

### The artifact contract (`meta.json`)

```jsonc
{
  "name": "example-charlm",
  "title": "Example demo",
  "backend": "js",            // "js" | "onnx"
  "arch": "bigram",           // "bigram" | "mlp"  (js backend only)
  "vocab": [".", "a", "b"],   // index -> token; vocab[0] MUST be the '.' boundary
  "block_size": 1,
  "embedding_dim": 10,        // mlp only
  "hidden_size": 100,         // mlp only
  "sampling": { "temperature": 0.9, "max_new_tokens": 16, "top_k": null }
}
```

`weights.json` stores each parameter as `{ shape, data }` (flat, row-major) under
a top-level `params` key. Shapes the `js` backend expects:

| arch     | parameters |
| -------- | ---------- |
| `bigram` | `W [V, V]` |
| `mlp`    | `C [V, emb]`, `W1 [block·emb, hidden]`, `b1 [hidden]`, `W2 [hidden, V]`, `b2 [V]` |

## From training notebook to live demo

The dummy `example-charlm` was made with `npm run placeholder` (a Node bigram
counter, so the site works with zero Python). For real models, use the PyTorch
bridge:

```bash
python scripts/export_model.py --name my-model --arch mlp \
  --checkpoint runs/mlp.pt --vocab runs/vocab.txt \
  --block-size 3 --embedding-dim 10 --hidden 200 --format json
```

It writes into `public/models/<name>/`. Reload; the demo lights up. See the
docstring in `scripts/export_model.py` for the shape contract and the ONNX path.

## Languages

English lives at the root; Turkish under `/tr/`. UI copy is in `src/i18n/ui.ts`;
page markup is written once and rendered per locale. A header toggle switches
between them, with `hreflang` alternates and per-locale `rss.xml` / `llms.txt`.
Every entry must exist in both languages to publish. Notebooks are English only.

## SEO and AI agents

- JSON-LD `Person` (with name-spelling variants), `WebSite`, and `BlogPosting`.
- `robots.txt` welcomes AI crawlers and points to `sitemap.xml`.
- `/llms.txt` and `/tr/llms.txt` give language models a clean, current summary.

## Deploy

Static output in `dist/`. Hosted on **Vercel**: import the repo, framework preset
Astro, defaults work, add `demirbasaf.ai` under the project's domains.

> The ONNX runtime is not bundled; the `onnx` backend fetches onnxruntime-web from
> a CDN on demand, keeping every deploy tiny.
