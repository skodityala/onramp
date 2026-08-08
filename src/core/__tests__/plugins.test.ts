import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  _resetPlugins,
  pluginPhysicalisation,
  pluginTemplates,
  runPostCheckHooks,
  use,
  type Plugin,
} from '../plugins';
import type { Template } from '../templates';
import type { AtomicityResult } from '../types';

const ATOMIC: AtomicityResult = {
  atomic: true,
  barriers: [],
  score: 1,
  explanations: [],
  hints: [],
};

const tmpl = (keys: string[], stepText = 'do the thing'): Template => ({
  keys,
  steps: [{ text: stepText, seconds: 30 }],
});

describe('plugin registry', () => {
  beforeEach(() => {
    _resetPlugins();
  });

  it('_resetPlugins clears state', () => {
    expect(pluginTemplates()).toHaveLength(0);
    expect(pluginPhysicalisation('anything')).toBeUndefined();
  });

  it('registerTemplate adds a template visible via pluginTemplates', () => {
    const p: Plugin = {
      name: 'p1', version: '1.0.0',
      install(reg) { reg.registerTemplate(tmpl(['lab-report'])); },
    };
    use(p);
    const all = pluginTemplates();
    expect(all).toHaveLength(1);
    expect(all[0]!.keys).toEqual(['lab-report']);
  });

  it('registerTemplate throws on missing keys', () => {
    const p: Plugin = {
      name: 'bad', version: '1.0.0',
      install(reg) {
        reg.registerTemplate({ keys: [], steps: [{ text: 'x', seconds: 10 }] });
      },
    };
    expect(() => use(p)).toThrow(/keys/);
  });

  it('registerTemplate throws on missing steps', () => {
    const p: Plugin = {
      name: 'bad', version: '1.0.0',
      install(reg) {
        reg.registerTemplate({ keys: ['thing'], steps: [] });
      },
    };
    expect(() => use(p)).toThrow(/steps/);
  });

  it('registerPhysicalisation adds a mapping', () => {
    const p: Plugin = {
      name: 'phys', version: '1.0.0',
      install(reg) { reg.registerPhysicalisation('brainstorm', 'jot one word on a sticky note'); },
    };
    use(p);
    expect(pluginPhysicalisation('brainstorm')).toBe('jot one word on a sticky note');
  });

  it('registerPhysicalisation is case-insensitive on the verb', () => {
    use({
      name: 'p', version: '1.0.0',
      install(reg) { reg.registerPhysicalisation('Sketch', 'draw one line'); },
    });
    expect(pluginPhysicalisation('sketch')).toBe('draw one line');
    expect(pluginPhysicalisation('SKETCH')).toBe('draw one line');
  });

  it('registerPostCheckHook fires on runPostCheckHooks', () => {
    const hook = vi.fn();
    use({
      name: 'h', version: '1.0.0',
      install(reg) { reg.registerPostCheckHook(hook); },
    });
    runPostCheckHooks('some step', 30, ATOMIC);
    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith('some step', 30, ATOMIC);
  });

  it('a hook that throws does not break runPostCheckHooks', () => {
    const good = vi.fn();
    use({
      name: 'h', version: '1.0.0',
      install(reg) {
        reg.registerPostCheckHook(() => { throw new Error('boom'); });
        reg.registerPostCheckHook(good);
      },
    });
    expect(() => runPostCheckHooks('x', 10, ATOMIC)).not.toThrow();
    expect(good).toHaveBeenCalledTimes(1);
  });

  it('use() calls install on the plugin with the registry', () => {
    const install = vi.fn();
    use({ name: 'spy', version: '1.0.0', install });
    expect(install).toHaveBeenCalledTimes(1);
    const reg = install.mock.calls[0]![0];
    expect(typeof reg.registerTemplate).toBe('function');
    expect(typeof reg.registerPhysicalisation).toBe('function');
    expect(typeof reg.registerPostCheckHook).toBe('function');
  });

  it('multiple plugins compose', () => {
    use({
      name: 'a', version: '1.0.0',
      install(reg) { reg.registerTemplate(tmpl(['alpha'])); },
    });
    use({
      name: 'b', version: '1.0.0',
      install(reg) { reg.registerTemplate(tmpl(['beta'])); },
    });
    const keys = pluginTemplates().map(t => t.keys[0]);
    expect(keys).toEqual(['alpha', 'beta']);
  });
});
