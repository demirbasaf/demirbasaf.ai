// Verifies the REAL js-backend.ts + sampling.ts against the built artifact.
// Bundled with esbuild and run in Node (see the npm/verify command below).
import { readFileSync } from 'node:fs';
import { JsEngine } from '../src/lib/inference/js-backend';
import type { ModelMeta, Tensor } from '../src/lib/inference/types';

const dir = 'public/models/example-charlm';
const meta = JSON.parse(readFileSync(`${dir}/meta.json`, 'utf8')) as ModelMeta;
const weights = JSON.parse(readFileSync(`${dir}/weights.json`, 'utf8')).params as Record<string, Tensor>;

const engine = new JsEngine(meta, weights);
console.log(`engine: backend=${meta.backend} arch=${meta.arch} params=${engine.paramCount}`);

const names: string[] = [];
for (let i = 0; i < 10; i++) {
  let s = '';
  for await (const ch of engine.generate('', { seed: 1000 + i })) s += ch;
  names.push(s);
}
console.log('generated:', names.join(', '));

// A prompt-prefixed run (the "prefix" input in the UI):
let withPrefix = '';
for await (const ch of engine.generate('me', { seed: 42, temperature: 0.8 })) withPrefix += ch;
console.log('prefixed "me":', withPrefix);

if (names.every((n) => n.length === 0)) throw new Error('FAIL: model produced only empty strings');
console.log('OK: model generates non-empty text via the real js-backend.');
