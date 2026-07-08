// ---------------------------------------------------------------------------
// The "onnx" backend: for models too big to hand-roll (e.g. a small GPT).
//
// onnxruntime-web is a ~26 MB WASM runtime. Rather than bundle that into every
// deploy (Cloudflare Pages caps files at 25 MiB), we load it from a CDN *at
// runtime*, only when a demo actually declares `"backend": "onnx"`. The tiny
// char-LM demos never touch it, so they pay nothing. `import type` below is
// erased at build time - no runtime dependency ends up in the bundle.
//
// Contract assumed of the exported graph (see scripts/export_model.py):
//   input : int64 tensor named "input",  shape [1, block_size]
//   output: float tensor named "logits", shape [1, vocab]
// Generation (the autoregressive loop + sampling) stays here in TS so it is
// identical to the js backend; ONNX only replaces the forward pass.
// ---------------------------------------------------------------------------
import type * as Ort from 'onnxruntime-web';
import type { GenerateOptions, InferenceEngine, ModelMeta } from './types';
import { mulberry32, sampleLogits } from './sampling';
import { modelUrl } from './loader';

// Pin the runtime version so the JS glue and the WASM binaries always match.
const ORT_VERSION = '1.27.0';
const ORT_CDN = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;

export class OnnxEngine implements InferenceEngine {
  readonly meta: ModelMeta;
  readonly paramCount = 0; // not recoverable from the graph; shown as "-"
  private ort: typeof Ort;
  private session: Ort.InferenceSession;

  private constructor(meta: ModelMeta, ort: typeof Ort, session: Ort.InferenceSession) {
    this.meta = meta;
    this.ort = ort;
    this.session = session;
  }

  static async create(meta: ModelMeta, name: string): Promise<OnnxEngine> {
    // Load the ESM build straight from the CDN. @vite-ignore keeps the bundler
    // from trying to resolve/inline it - it stays a runtime fetch.
    const ort = (await import(/* @vite-ignore */ `${ORT_CDN}ort.min.mjs`)) as typeof Ort;
    // Tell the runtime to fetch its WASM binaries from the same CDN folder.
    ort.env.wasm.wasmPaths = ORT_CDN;
    const session = await ort.InferenceSession.create(modelUrl(name, 'model.onnx'));
    return new OnnxEngine(meta, ort, session);
  }

  async *generate(prompt = '', opts: GenerateOptions = {}): AsyncGenerator<string, void, unknown> {
    const { vocab, block_size } = this.meta;
    const stoi = new Map(vocab.map((c, i) => [c, i] as const));
    const boundary = 0;

    const temperature = opts.temperature ?? this.meta.sampling.temperature;
    const maxNew = opts.maxNewTokens ?? this.meta.sampling.max_new_tokens;
    const topK = opts.topK ?? this.meta.sampling.top_k ?? null;
    const rng = mulberry32(opts.seed ?? (Math.random() * 2 ** 32) >>> 0);

    let context = new Array<number>(block_size).fill(boundary);
    for (const ch of prompt.toLowerCase()) {
      const id = stoi.get(ch);
      if (id === undefined) continue;
      context = [...context.slice(1), id];
      yield ch;
    }

    for (let step = 0; step < maxNew; step++) {
      if (opts.signal?.aborted) return;
      // Forward pass via the ONNX graph.
      const input = new this.ort.Tensor('int64', BigInt64Array.from(context.map(BigInt)), [1, block_size]);
      const output = await this.session.run({ input });
      const logits = Array.from(output.logits.data as Float32Array);
      const next = sampleLogits(logits, { temperature, topK, rng });
      if (next === boundary) return;
      yield vocab[next];
      context = [...context.slice(1), next];
    }
  }
}
