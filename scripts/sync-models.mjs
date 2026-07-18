// ---------------------------------------------------------------------------
// sync-models.mjs, pull each project's model/ artifact into public/models/.
//
// This is the seam that keeps "repo = source of truth, site = presentation".
// Every project repo owns its trained model under model/. At build time we copy
// that artifact into this site's public/models/<name>/, and the existing
// inference layer (which fetches same-origin /models/<name>/) serves it with
// zero code changes.
//
// Two sources, tried in order per project:
//   1. LOCAL, a sibling checkout (../<repo>/model). Instant, offline, and the
//               reason the demo works before anything is pushed to GitHub.
//   2. REMOTE, jsDelivr CDN, pinned to a tag/branch:
//               https://cdn.jsdelivr.net/gh/<owner>/<repo>@<ref>/<path>/<file>
//
// Registry lives in models.config.json. Run via `npm run sync` (also wired as
// a prebuild step, so `npm run build` always ships fresh artifacts).
//
// Flags:  --remote  force the CDN even when a local checkout exists.
// ---------------------------------------------------------------------------
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_ROOT = join(ROOT, 'public', 'models');
const forceRemote = process.argv.includes('--remote');

const registry = JSON.parse(readFileSync(join(ROOT, 'models.config.json'), 'utf8'));

// A model folder may hold weights.json (js backend) or model.onnx (onnx). meta.json
// is always required; we discover which weights file to pull from meta.backend.
async function fileExistsRemote(url) {
  const res = await fetch(url, { method: 'HEAD' });
  return res.ok;
}

async function readJsonMaybeRemote(localPath, remoteUrl, useLocal) {
  if (useLocal) return JSON.parse(readFileSync(localPath, 'utf8'));
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${remoteUrl}`);
  return res.json();
}

async function pull(file, { useLocal, localDir, remoteBase, outDir }) {
  const outPath = join(outDir, file);
  if (useLocal) {
    copyFileSync(join(localDir, file), outPath);
  } else {
    const res = await fetch(`${remoteBase}/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${remoteBase}/${file}`);
    writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
  }
}

async function syncOne(entry) {
  const { name, repo, ref = 'main', path = 'model' } = entry;
  const localDir = resolve(ROOT, entry.local ?? `../${repo.split('/').pop()}`, path);
  const remoteBase = `https://cdn.jsdelivr.net/gh/${repo}@${ref}/${path}`;
  const useLocal = !forceRemote && existsSync(join(localDir, 'meta.json'));
  const source = useLocal ? `local (${localDir})` : `cdn (${repo}@${ref})`;

  const outDir = join(OUT_ROOT, name);
  mkdirSync(outDir, { recursive: true });

  // meta.json first, it tells us whether weights.json or model.onnx follows.
  const meta = await readJsonMaybeRemote(
    join(localDir, 'meta.json'), `${remoteBase}/meta.json`, useLocal,
  );
  const weightsFile = meta.backend === 'onnx' ? 'model.onnx' : 'weights.json';

  await pull('meta.json', { useLocal, localDir, remoteBase, outDir });
  await pull(weightsFile, { useLocal, localDir, remoteBase, outDir });

  console.log(`  ✓ ${name}  ←  ${source}  [${meta.backend}/${meta.arch ?? 'onnx'}]`);
}

console.log(`syncing ${registry.length} model(s) → public/models/`);
let failed = 0;
for (const entry of registry) {
  try {
    await syncOne(entry);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${entry.name}: ${err.message}`);
  }
}
if (failed) {
  console.error(`sync finished with ${failed} failure(s)`);
  process.exit(1);
}
console.log('sync complete.');
