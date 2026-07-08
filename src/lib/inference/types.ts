// ---------------------------------------------------------------------------
// The contract every model artifact and every backend agrees on.
// A demo is just a folder under /public/models/<name>/ containing:
//   - meta.json     (this ModelMeta, minus the weights)
//   - weights.json  (js backend)  OR  model.onnx (onnx backend)
// <ModelDemo> reads meta.json and renders itself - no per-model code.
// ---------------------------------------------------------------------------

/** Which inference path runs in the browser. */
export type Backend = 'js' | 'onnx';

/** For the `js` backend, which forward pass to run. */
export type Arch = 'bigram' | 'mlp';

/** A single parameter tensor: a flat `data` array plus its logical `shape`. */
export interface Tensor {
  shape: number[];
  data: number[];
}

export interface SamplingDefaults {
  temperature: number;
  max_new_tokens: number;
  /** Keep only the k most likely tokens before sampling. null = disabled. */
  top_k?: number | null;
}

/** Everything <ModelDemo> needs to render + run a model, except the weights. */
export interface ModelMeta {
  name: string;
  title: string;
  description?: string;
  backend: Backend;
  /** Required when backend === 'js'. */
  arch?: Arch;
  /** index -> token. Convention: vocab[0] is the '.' start/end boundary token. */
  vocab: string[];
  /** How many previous tokens the model conditions on. */
  block_size: number;
  /** MLP hyperparameters (js backend, arch === 'mlp'). */
  embedding_dim?: number;
  hidden_size?: number;
  sampling: SamplingDefaults;
}

/** Per-call overrides. Anything omitted falls back to meta.sampling. */
export interface GenerateOptions {
  temperature?: number;
  maxNewTokens?: number;
  topK?: number | null;
  /** Fix the RNG seed for reproducible output. */
  seed?: number | null;
  /** Abort a run mid-stream. */
  signal?: AbortSignal;
}

/**
 * One interface, any backend. Callers `for await` over generate() and get the
 * output token-by-token as it is sampled - that is the "streaming" you see.
 */
export interface InferenceEngine {
  readonly meta: ModelMeta;
  /** Total scalar parameters, for display. 0 when unknown (e.g. ONNX graph). */
  readonly paramCount: number;
  generate(prompt?: string, opts?: GenerateOptions): AsyncGenerator<string, void, unknown>;
}
