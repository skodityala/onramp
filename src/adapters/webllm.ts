/**
 * WebLLM adapter. Loads a small quantized language model into the browser
 * via @mlc-ai/web-llm and serves inference via WebGPU. Runs entirely on the
 * user's device. No API key. Works offline once weights are cached.
 *
 * This module is optional. It is dynamically imported so it does not appear
 * in the main bundle. If the user's browser lacks WebGPU or the peer dep is
 * missing, the module reports unavailable and the app falls back to rules.
 *
 * The default model is a small instruction-tuned Llama variant sized to run
 * on consumer laptops. A future contributor can swap the model id via config.
 */

import type { InferenceEngine, InferenceRequest, EngineStatus } from './inference';
import { hasWebGPU } from './inference';

// Model choices, smallest first. The runtime picks the largest that fits.
const MODEL_CANDIDATES = [
  'Llama-3.2-1B-Instruct-q4f16_1-MLC',
  'Llama-3.2-3B-Instruct-q4f16_1-MLC',
  'Phi-3.5-mini-instruct-q4f16_1-MLC',
] as const;

interface WebLLMModule {
  CreateMLCEngine(model: string, opts?: {
    initProgressCallback?: (report: { progress: number; text: string }) => void;
  }): Promise<{
    chat: {
      completions: {
        create(args: {
          messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
          max_tokens?: number;
          temperature?: number;
          stream?: boolean;
        }): Promise<
          | { choices: Array<{ message: { content: string } }> }
          | AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>
        >;
      };
    };
  }>;
}

class WebLLMEngine implements InferenceEngine {
  readonly name = 'webllm';
  readonly runsOnDevice = true;
  private engine: Awaited<ReturnType<WebLLMModule['CreateMLCEngine']>> | null = null;
  private _status: EngineStatus = {
    ready: false, loading: false, progress: 0, message: 'not started',
  };
  private loadPromise: Promise<void> | null = null;

  constructor(private readonly modelId: string) {}

  async available(): Promise<boolean> {
    if (!hasWebGPU()) return false;
    // Peer-dep availability is checked by dynamic import at warmup time.
    return true;
  }

  status(): EngineStatus { return { ...this._status }; }

  async warmup(): Promise<void> {
    if (this.engine || this.loadPromise) return this.loadPromise ?? Promise.resolve();
    this._status = { ...this._status, loading: true, message: 'importing WebLLM' };
    this.loadPromise = (async () => {
      try {
        // Dynamic import; if the peer dep is not installed the app catches
        // the ModuleNotFound and falls back cleanly. The `as string` cast
        // sidesteps the TS module resolution check for this optional dep.
        const specifier = '@mlc-ai/web-llm' as string;
        const mod = (await import(/* @vite-ignore */ specifier)) as unknown as WebLLMModule;
        this._status = { ...this._status, message: 'loading model weights' };
        this.engine = await mod.CreateMLCEngine(this.modelId, {
          initProgressCallback: (r) => {
            this._status = {
              ready: false, loading: true,
              progress: r.progress,
              message: r.text,
            };
          },
        });
        this._status = { ready: true, loading: false, progress: 1, message: 'ready' };
      } catch (err) {
        this._status = {
          ready: false, loading: false, progress: 0,
          message: `unavailable: ${(err as Error).message}`,
        };
      }
    })();
    return this.loadPromise;
  }

  async generate(req: InferenceRequest): Promise<string> {
    if (!this.engine) await this.warmup();
    if (!this.engine) return '';
    const res = await this.engine.chat.completions.create({
      messages: [
        { role: 'system', content: req.system },
        { role: 'user', content: req.prompt },
      ],
      max_tokens: req.maxTokens ?? 400,
      temperature: req.temperature ?? 0.3,
      stream: false,
    }) as { choices: Array<{ message: { content: string } }> };
    return res.choices[0]?.message.content ?? '';
  }

  async *stream(req: InferenceRequest): AsyncIterable<string> {
    if (!this.engine) await this.warmup();
    if (!this.engine) return;
    const iter = await this.engine.chat.completions.create({
      messages: [
        { role: 'system', content: req.system },
        { role: 'user', content: req.prompt },
      ],
      max_tokens: req.maxTokens ?? 400,
      temperature: req.temperature ?? 0.3,
      stream: true,
    }) as AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>;
    for await (const chunk of iter) {
      const delta = chunk.choices[0]?.delta.content;
      if (delta) yield delta;
    }
  }
}

/** Factory. Returns a WebLLM engine bound to the given model id (or default). */
export const createWebLLMEngine = (
  modelId: string = MODEL_CANDIDATES[0],
): InferenceEngine => new WebLLMEngine(modelId);

export const WEBLLM_MODELS = MODEL_CANDIDATES;
