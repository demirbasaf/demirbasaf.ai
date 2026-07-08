// ---------------------------------------------------------------------------
// Sampling: turn a vector of logits into a chosen token index.
// Shared by every backend so the "how do we pick the next character" logic
// lives in exactly one readable place.
// ---------------------------------------------------------------------------

/**
 * mulberry32 — a tiny, fast, deterministic PRNG.
 * Seed it and you get the same stream of numbers every time, which is what
 * makes "reproducible with a fixed seed" work.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SampleOpts {
  temperature: number;
  topK?: number | null;
  rng: () => number;
}

/**
 * Draw one index from `logits`. Four steps, in order:
 *   1. temperature — divide logits by T. T<1 sharpens (greedier), T>1 flattens.
 *   2. top-k       — optionally keep only the k highest logits, drop the rest.
 *   3. softmax     — exponentiate (numerically stabilised) and normalise to probs.
 *   4. multinomial — walk the cumulative distribution past one uniform draw.
 */
export function sampleLogits(logits: ArrayLike<number>, opts: SampleOpts): number {
  const n = logits.length;
  const T = Math.max(1e-6, opts.temperature);

  // 1) temperature scaling
  const scaled = new Float64Array(n);
  for (let i = 0; i < n; i++) scaled[i] = logits[i] / T;

  // 2) top-k: the pool of indices we're allowed to sample from
  let pool: number[];
  if (opts.topK && opts.topK > 0 && opts.topK < n) {
    pool = Array.from({ length: n }, (_, i) => i)
      .sort((a, b) => scaled[b] - scaled[a])
      .slice(0, opts.topK);
  } else {
    pool = Array.from({ length: n }, (_, i) => i);
  }

  // 3) softmax over the pool (subtract max for numerical stability)
  let max = -Infinity;
  for (const i of pool) if (scaled[i] > max) max = scaled[i];
  const probs = new Float64Array(n);
  let sum = 0;
  for (const i of pool) {
    const e = Math.exp(scaled[i] - max);
    probs[i] = e;
    sum += e;
  }

  // 4) multinomial draw
  const r = opts.rng() * sum;
  let acc = 0;
  for (const i of pool) {
    acc += probs[i];
    if (r <= acc) return i;
  }
  return pool[pool.length - 1]; // floating-point fallback
}
