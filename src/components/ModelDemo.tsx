/** @jsxImportSource preact */
// A thin UI shell around the inference engine. All the ML — loading weights,
// the forward pass, sampling — lives in src/lib/inference/*. This component only
// wires an input, a temperature slider and a Generate button to engine.generate()
// and streams the result into the console output.
import { useEffect, useRef, useState } from 'preact/hooks';
import { createEngine } from '../lib/inference';
import type { InferenceEngine, ModelMeta } from '../lib/inference/types';

interface Props {
  /** folder under /public/models/<name>/ */
  name: string;
  /** optional heading; omit when embedding inline in prose */
  title?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ModelDemo({ name, title }: Props) {
  const [meta, setMeta] = useState<ModelMeta | null>(null);
  const [params, setParams] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [out, setOut] = useState('');
  const [running, setRunning] = useState(false);
  const [temp, setTemp] = useState(1.0);
  const [prompt, setPrompt] = useState('');
  const engineRef = useRef<InferenceEngine | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Build the engine once, on mount. createEngine() reads meta.json + weights.
  useEffect(() => {
    let alive = true;
    createEngine(name)
      .then((engine) => {
        if (!alive) return;
        engineRef.current = engine;
        setMeta(engine.meta);
        setParams(engine.paramCount);
        setTemp(engine.meta.sampling.temperature);
      })
      .catch((e) => alive && setError(e?.message ?? String(e)));
    return () => {
      alive = false;
      abortRef.current?.abort();
    };
  }, [name]);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  async function run() {
    const engine = engineRef.current;
    if (!engine || running) return;
    setOut('');
    setRunning(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      for await (const ch of engine.generate(prompt, { temperature: temp, signal: ac.signal })) {
        if (ac.signal.aborted) break;
        setOut((s) => s + ch);
        if (!reduced) await sleep(18); // typewriter pacing; skipped for reduced-motion
      }
    } catch (e) {
      setError((e as Error)?.message ?? String(e));
    } finally {
      setRunning(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setRunning(false);
  }

  const paramLabel = params > 0 ? `${params.toLocaleString()} params` : 'onnx graph';

  return (
    <div class="console" role="group" aria-label={title ?? `${name} demo`}>
      <div class="console-head">
        <span>
          <span class="dot">●</span>{' '}
          {meta ? `${meta.backend} · ${meta.arch ?? 'onnx'} · ${paramLabel}` : 'loading model…'}
        </span>
        <span>in-browser</span>
      </div>
      <div class="console-body">
        {title ? <strong>{title}</strong> : null}

        {error ? (
          <p class="console-err">couldn’t load model: {error}</p>
        ) : (
          <>
            <div class="console-out" aria-live="polite">
              {out ? (
                <span>{out}</span>
              ) : (
                <span class="placeholder">press generate to sample from the model…</span>
              )}
              {running ? <span class="caret" aria-hidden="true">▌</span> : null}
            </div>

            <div class="console-controls">
              <label>
                prefix
                <input
                  type="text"
                  value={prompt}
                  placeholder="(none)"
                  disabled={running}
                  onInput={(e) => setPrompt((e.target as HTMLInputElement).value)}
                />
              </label>
              <label>
                temp {temp.toFixed(2)}
                <input
                  type="range"
                  min="0.4"
                  max="1.6"
                  step="0.05"
                  value={temp}
                  disabled={running}
                  onInput={(e) => setTemp(parseFloat((e.target as HTMLInputElement).value))}
                />
              </label>
              {running ? (
                <button class="btn secondary" onClick={stop}>
                  stop
                </button>
              ) : (
                <button class="btn" onClick={run} disabled={!meta}>
                  generate
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
