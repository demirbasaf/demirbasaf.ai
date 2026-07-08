# demirbasaf.ai

A fast, static, content-first site for writing in public and hosting **ML models
that run live in the browser** - no inference server, no per-request cost.

Built with [Astro](https://astro.build) (static output), TypeScript, and a few
dozen lines of hand-written CSS. The models and the writing are the point; the
site is the shelf.

```
npm install        # once
npm run dev        # local dev at http://localhost:4321
npm run build      # static output -> dist/
npm run preview    # serve the built dist/ locally
npm run check      # astro + typescript diagnostics
npm run verify     # run the real inference code in Node and print sample output
```

---

## How it's laid out

```
public/models/<name>/     a model artifact = meta.json (+ weights.json | model.onnx)
scripts/
  make_placeholder.mjs     builds the placeholder bigram from Turkish names (Node)
  export_model.py          PyTorch -> artifact bridge (JSON weights AND ONNX)
src/
  lib/inference/           ★ the legible serving path - plain, commented TS
    types.ts               the artifact + engine contract
    loader.ts              fetch meta.json / weights.json
    sampling.ts            temperature -> top-k -> softmax -> multinomial draw
    js-backend.ts          bigram + MLP forward pass (no deps)
    onnx-backend.ts        onnxruntime-web via CDN, lazy (for bigger models)
    index.ts               createEngine(name) - picks the backend
  components/ModelDemo.tsx  thin Preact UI shell around an engine
  config/
    site.ts                identity + links (edit here, not in templates)
    models.ts              the demo registry
  content/posts/*.mdx       your writing (can embed <ModelDemo/> inline)
  pages/                    home, /demos, /writing, /about, rss.xml
  styles/global.css         design tokens + minimal CSS
```

---

## Add a post

Drop a `.mdx` file in `src/content/posts/`:

```mdx
---
title: My post title
date: 2026-07-20
summary: One sentence shown in lists and meta tags.
tags: [ml, systems]
notebook: https://colab.research.google.com/...   # optional - repo / Colab / nbviewer
draft: false                                       # optional - hides it while true
---

import ModelDemo from '../../components/ModelDemo.tsx';

Prose here. Embed a live model anywhere in the writeup:

<ModelDemo name="turkish-makemore" client:visible />
```

It appears on `/writing` and the home page automatically, sorted by date.

## Add a model demo

1. Create the artifact folder `public/models/<name>/`:
   - **Tiny model (js backend):** `meta.json` + `weights.json`
   - **Bigger model (onnx backend):** `meta.json` (with `"backend": "onnx"`) + `model.onnx`
2. Register it in `src/config/models.ts`:
   ```ts
   { name: '<name>', title: '…', blurb: '…', status: 'live', notebook: '…' }
   ```

`<ModelDemo name="<name>" />` renders entirely from `meta.json` - no per-model code.

### The artifact contract (`meta.json`)

```jsonc
{
  "name": "turkish-makemore",
  "title": "Turkish makemore",
  "backend": "js",            // "js" | "onnx"
  "arch": "bigram",           // "bigram" | "mlp"  (js backend only)
  "vocab": [".", "a", "b"],   // index -> token; vocab[0] MUST be the '.' boundary
  "block_size": 1,            // how many previous tokens the model conditions on
  "embedding_dim": 10,        // mlp only
  "hidden_size": 100,         // mlp only
  "sampling": { "temperature": 0.9, "max_new_tokens": 16, "top_k": null }
}
```

`weights.json` stores each parameter as `{ shape, data }` with a flat, row-major
`data` array, under a top-level `params` key. Shapes the `js` backend expects:

| arch     | parameters |
| -------- | ---------- |
| `bigram` | `W [V, V]` |
| `mlp`    | `C [V, emb]`, `W1 [block·emb, hidden]`, `b1 [hidden]`, `W2 [hidden, V]`, `b2 [V]` |

## From training notebook to live demo

The placeholder was generated with `npm run placeholder` (a Node bigram counter,
so the site works with zero Python). For **your real models**, use the PyTorch
bridge:

```bash
# tiny MLP -> JSON weights (js backend, runs in hand-written TS)
python scripts/export_model.py --name turkish-makemore --arch mlp \
  --checkpoint runs/mlp.pt --vocab runs/vocab.txt \
  --block-size 3 --embedding-dim 10 --hidden 200 --format json

# bigger model -> ONNX (onnx backend, onnxruntime-web)
python scripts/export_model.py --name my-gpt --checkpoint runs/gpt.pt \
  --vocab runs/vocab.txt --block-size 16 --format onnx
```

It writes straight into `public/models/<name>/`. Reload - the demo lights up with
no code changes. See the module docstring in `scripts/export_model.py` for the
parameter-shape contract and the ONNX input/output names.

---

## Deploy

Static output in `dist/` - host it anywhere.

**Cloudflare Pages (recommended):** connect the repo; build command `npm run build`,
output directory `dist`. Add `demirbasaf.ai` under the project's Custom Domains.

**Vercel:** framework preset “Astro”, defaults work; add the domain in the project.

**GitHub Pages:** works too (`site` is set, no `base` needed for a custom domain).

> Note: the ONNX runtime is **not** bundled - the `onnx` backend fetches
> onnxruntime-web from a CDN on demand, keeping every deploy tiny and under
> Cloudflare's 25 MiB per-file limit. If you need fully offline/self-hosted ONNX,
> copy the `onnxruntime-web/dist` files into `public/` and point
> `ort.env.wasm.wasmPaths` at them in `src/lib/inference/onnx-backend.ts`.
