// ---------------------------------------------------------------------------
// Loads model artifacts from /public/models/<name>/ over plain fetch().
// These are static files - no server, no API. That's the whole point.
// ---------------------------------------------------------------------------
import type { ModelMeta, Tensor } from './types';

/** Build a URL under /public/models/<name>/, honouring any base path. */
export function modelUrl(name: string, file: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/models/${name}/${file}`;
}

export async function loadMeta(name: string): Promise<ModelMeta> {
  const res = await fetch(modelUrl(name, 'meta.json'));
  if (!res.ok) throw new Error(`meta.json not found for model "${name}" (HTTP ${res.status})`);
  return (await res.json()) as ModelMeta;
}

/**
 * weights.json stores each parameter as { shape, data } with `data` a flat
 * (row-major) array. Accepts either { params: {...} } or a bare { name: {...} }.
 */
export async function loadWeights(name: string): Promise<Record<string, Tensor>> {
  const res = await fetch(modelUrl(name, 'weights.json'));
  if (!res.ok) throw new Error(`weights.json not found for model "${name}" (HTTP ${res.status})`);
  const raw = await res.json();
  return (raw.params ?? raw) as Record<string, Tensor>;
}
