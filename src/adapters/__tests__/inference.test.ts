import { describe, it, expect, beforeEach } from 'vitest';
import {
  NullEngine,
  setEngine,
  getEngine,
  hasWebGPU,
  type InferenceEngine,
  type EngineStatus,
} from '../inference';
import { createWebLLMEngine } from '../webllm';

// Restore the null engine between tests so state does not leak.
beforeEach(() => {
  setEngine(NullEngine);
});

describe('NullEngine', () => {
  it('reports available', async () => {
    expect(await NullEngine.available()).toBe(true);
  });

  it('returns an empty string from generate', async () => {
    const out = await NullEngine.generate({ system: 's', prompt: 'p' });
    expect(out).toBe('');
  });

  it('reports ready with a factual message', () => {
    const s = NullEngine.status();
    expect(s.ready).toBe(true);
    expect(s.loading).toBe(false);
    expect(s.progress).toBe(1);
    expect(s.message).toBe('no inference engine');
  });

  it('produces no chunks when streamed', async () => {
    const chunks: string[] = [];
    // stream is optional on the interface but present on NullEngine.
    for await (const c of NullEngine.stream!({ system: 's', prompt: 'p' })) {
      chunks.push(c);
    }
    expect(chunks).toEqual([]);
  });
});

describe('setEngine / getEngine', () => {
  it('round-trips a mock engine', () => {
    const mock: InferenceEngine = {
      name: 'mock',
      runsOnDevice: true,
      async available() { return true; },
      async generate() { return 'hello'; },
      status(): EngineStatus {
        return { ready: true, loading: false, progress: 1, message: 'mock' };
      },
    };
    setEngine(mock);
    expect(getEngine()).toBe(mock);
    expect(getEngine().name).toBe('mock');
  });

  it('returns the previously-installed engine', () => {
    const first: InferenceEngine = {
      name: 'first',
      runsOnDevice: true,
      async available() { return true; },
      async generate() { return 'a'; },
      status() { return { ready: true, loading: false, progress: 1, message: '' }; },
    };
    const second: InferenceEngine = {
      name: 'second',
      runsOnDevice: true,
      async available() { return true; },
      async generate() { return 'b'; },
      status() { return { ready: true, loading: false, progress: 1, message: '' }; },
    };
    setEngine(first);
    const prev = setEngine(second);
    expect(prev).toBe(first);
    expect(getEngine()).toBe(second);
  });

  it('routes generate through a mock with a fixed response', async () => {
    const mock: InferenceEngine = {
      name: 'fixed',
      runsOnDevice: true,
      async available() { return true; },
      async generate() { return 'fixed-response'; },
      status() { return { ready: true, loading: false, progress: 1, message: 'fixed' }; },
    };
    setEngine(mock);
    const out = await getEngine().generate({ system: '', prompt: '' });
    expect(out).toBe('fixed-response');
  });
});

describe('hasWebGPU', () => {
  it('returns false in jsdom (no navigator.gpu)', () => {
    expect(hasWebGPU()).toBe(false);
  });
});

describe('WebLLM engine', () => {
  it('reports unavailable when WebGPU is missing', async () => {
    const engine = createWebLLMEngine();
    expect(await engine.available()).toBe(false);
  });

  it('has a not-loading, not-ready status before warmup', () => {
    const engine = createWebLLMEngine();
    const s = engine.status();
    expect(s.ready).toBe(false);
    expect(s.loading).toBe(false);
    expect(s.progress).toBe(0);
    expect(s.message).toBe('not started');
  });

  it('advertises itself as an on-device engine named webllm', () => {
    const engine = createWebLLMEngine();
    expect(engine.name).toBe('webllm');
    expect(engine.runsOnDevice).toBe(true);
  });
});
