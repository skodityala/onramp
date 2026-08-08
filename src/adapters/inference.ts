/**
 * Provider-agnostic inference interface. Adapters (WebLLM, remote OpenAI-shape,
 * mock) implement this. The rest of the app depends only on this interface.
 *
 * Design notes:
 * - `available()` is feature detection. It never throws.
 * - `warmup()` loads model weights. It may be slow. It never runs unless the
 *   user opts in via a UI control OR ships the app in an env where inference
 *   is expected.
 * - `generate()` returns a promise for the full text.
 * - `stream()` returns an async iterator of token deltas.
 * - Every method is safe to call before warmup: they gracefully return empty
 *   or reject.
 */

export interface InferenceRequest {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface InferenceEngine {
  readonly name: string;
  readonly runsOnDevice: boolean;
  available(): Promise<boolean>;
  warmup?(): Promise<void>;
  generate(req: InferenceRequest): Promise<string>;
  stream?(req: InferenceRequest): AsyncIterable<string>;
  status(): EngineStatus;
}

export interface EngineStatus {
  ready: boolean;
  loading: boolean;
  progress: number;   // 0..1
  message: string;
}

/**
 * Null engine. Used when nothing else is available. Always returns empty,
 * never throws. The rules-based decomposer is the true fallback for the
 * product; this engine's existence lets callers write code that treats
 * "no LLM" as a valid state without null checks everywhere.
 */
export const NullEngine: InferenceEngine = {
  name: 'null',
  runsOnDevice: true,
  async available() { return true; },
  async generate() { return ''; },
  async *stream() {},
  status() {
    return { ready: true, loading: false, progress: 1, message: 'no inference engine' };
  },
};

let current: InferenceEngine = NullEngine;

/**
 * Set the active inference engine at app boot. Consumers should call this
 * once. Idempotent. Returns the previously-installed engine, useful for tests.
 */
export const setEngine = (engine: InferenceEngine): InferenceEngine => {
  const prev = current;
  current = engine;
  return prev;
};

export const getEngine = (): InferenceEngine => current;

/**
 * Detect whether the browser has WebGPU. WebGPU is the fastest on-device
 * inference path; without it, on-device LLM is too slow to be useful.
 */
export const hasWebGPU = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return 'gpu' in navigator && Boolean((navigator as unknown as { gpu?: unknown }).gpu);
};
