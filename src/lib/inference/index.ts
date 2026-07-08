// ---------------------------------------------------------------------------
// The one entry point the UI touches. Read meta.json, then build the right
// backend behind the shared InferenceEngine interface. Callers never branch
// on backend type - they just `for await` over engine.generate(...).
// ---------------------------------------------------------------------------
import type { InferenceEngine } from './types';
import { loadMeta, loadWeights } from './loader';
import { JsEngine } from './js-backend';
import { OnnxEngine } from './onnx-backend';

export async function createEngine(name: string): Promise<InferenceEngine> {
  const meta = await loadMeta(name);

  if (meta.backend === 'onnx') {
    return OnnxEngine.create(meta, name);
  }
  // default: js backend (bigram or mlp)
  const params = await loadWeights(name);
  return new JsEngine(meta, params);
}

export type { InferenceEngine, ModelMeta, GenerateOptions } from './types';
