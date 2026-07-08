// ---------------------------------------------------------------------------
// The "js" backend: the forward pass, in plain TypeScript, for tiny models.
// No dependencies, no WASM — just a few array loops you can read top to bottom.
// Supports two architectures, selected by meta.arch:
//   - 'bigram': next token depends only on the previous one (a V×V table).
//   - 'mlp'   : Bengio-style — embed a context window, one tanh hidden layer,
//               then project to vocab logits. (Karpathy's makemore, part 2.)
// ---------------------------------------------------------------------------
import type { GenerateOptions, InferenceEngine, ModelMeta, Tensor } from './types';
import { mulberry32, sampleLogits } from './sampling';

/**
 * The single matrix op the MLP is built from: y = x · W + b.
 * W has shape [inDim, outDim] and is stored row-major, so the weight
 * connecting input i to output o lives at flat index (i * outDim + o).
 */
function linear(x: number[], W: Tensor, b?: Tensor): number[] {
  const [inDim, outDim] = W.shape;
  const y = new Array<number>(outDim);
  for (let o = 0; o < outDim; o++) {
    let s = b ? b.data[o] : 0;
    for (let i = 0; i < inDim; i++) s += x[i] * W.data[i * outDim + o];
    y[o] = s;
  }
  return y;
}

export class JsEngine implements InferenceEngine {
  readonly meta: ModelMeta;
  readonly paramCount: number;
  private params: Record<string, Tensor>;

  constructor(meta: ModelMeta, params: Record<string, Tensor>) {
    this.meta = meta;
    this.params = params;
    this.paramCount = Object.values(params).reduce((n, t) => n + t.data.length, 0);
  }

  /**
   * The forward pass. Given the current context (an array of token indices),
   * return the logits over the vocabulary for the *next* token.
   */
  private forward(context: number[]): number[] {
    const V = this.meta.vocab.length;

    if (this.meta.arch === 'bigram') {
      // Only the last token matters. W is [V, V]; row `prev` is the logits
      // over the next token. This is literally a lookup.
      const W = this.params.W;
      const prev = context[context.length - 1];
      const row = new Array<number>(V);
      for (let j = 0; j < V; j++) row[j] = W.data[prev * V + j];
      return row;
    }

    // --- MLP forward pass ---
    // C: [V, emb] embedding table. Look up each context token and concatenate.
    const C = this.params.C;
    const emb = this.meta.embedding_dim!;
    const x: number[] = [];
    for (const t of context) {
      for (let k = 0; k < emb; k++) x.push(C.data[t * emb + k]);
    }
    // Hidden layer: h = tanh(x · W1 + b1)
    const h = linear(x, this.params.W1, this.params.b1).map(Math.tanh);
    // Output layer: logits = h · W2 + b2
    return linear(h, this.params.W2, this.params.b2);
  }

  async *generate(prompt = '', opts: GenerateOptions = {}): AsyncGenerator<string, void, unknown> {
    const { vocab, block_size } = this.meta;
    const stoi = new Map(vocab.map((c, i) => [c, i] as const));
    const boundary = 0; // vocab[0] === '.' by convention: the start/end token

    const temperature = opts.temperature ?? this.meta.sampling.temperature;
    const maxNew = opts.maxNewTokens ?? this.meta.sampling.max_new_tokens;
    const topK = opts.topK ?? this.meta.sampling.top_k ?? null;
    const rng = mulberry32(opts.seed ?? (Math.random() * 2 ** 32) >>> 0);

    // Start with a full window of boundary tokens, then replay any user prompt.
    let context = new Array<number>(block_size).fill(boundary);
    for (const ch of prompt.toLowerCase()) {
      const id = stoi.get(ch);
      if (id === undefined) continue; // silently drop out-of-vocab characters
      context = [...context.slice(1), id];
      yield ch; // echo the prompt so it appears in the streamed output
    }

    // Autoregressive loop: predict, sample, append, repeat.
    for (let step = 0; step < maxNew; step++) {
      if (opts.signal?.aborted) return;
      const logits = this.forward(context);
      const next = sampleLogits(logits, { temperature, topK, rng });
      if (next === boundary) return; // model chose to end the sequence
      yield vocab[next];
      context = [...context.slice(1), next];
    }
  }
}
