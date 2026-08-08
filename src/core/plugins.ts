/**
 * Plugin registry for Onramp.
 *
 * Extension hooks:
 * 1. Templates - add new assignment shapes without modifying core files.
 * 2. Physicalisations - add abstract-verb-to-physical-opener mappings.
 * 3. Post-check hooks - inspect (never mutate) checker results.
 *
 * Plugins are additive. They cannot:
 * - Modify or remove existing templates or physicalisations.
 * - Change the atomicity rules.
 * - Override the checker's decision on a step.
 *
 * All plugins are client-side. They are registered at boot before any
 * decomposition runs, or on-the-fly via calls to registerTemplate etc.
 */

import type { Template } from './templates';
import type { AtomicityResult } from './types';

const _templates: Template[] = [];
const _physicalisations: Record<string, string> = {};
type PostCheckHook = (
  text: string, seconds: number, result: AtomicityResult,
) => void;
const _hooks: PostCheckHook[] = [];

export interface Plugin {
  readonly name: string;
  readonly version: string;
  install(reg: PluginRegistry): void;
}

export interface PluginRegistry {
  registerTemplate(t: Template): void;
  registerPhysicalisation(verb: string, opener: string): void;
  registerPostCheckHook(hook: PostCheckHook): void;
}

const registry: PluginRegistry = {
  registerTemplate(t) {
    if (!t.keys || t.keys.length === 0) {
      throw new Error(`plugin template missing keys`);
    }
    if (!t.steps || t.steps.length === 0) {
      throw new Error(`plugin template missing steps`);
    }
    _templates.push(t);
  },
  registerPhysicalisation(verb, opener) {
    if (!verb || !opener) throw new Error('physicalisation missing verb or opener');
    _physicalisations[verb.toLowerCase()] = opener;
  },
  registerPostCheckHook(hook) {
    _hooks.push(hook);
  },
};

/** Install a plugin. Idempotent by name is NOT guaranteed - the caller controls this. */
export const use = (plugin: Plugin): void => {
  plugin.install(registry);
};

/** Read-only accessors for the decomposer / checker to consult. */
export const pluginTemplates = (): readonly Template[] => _templates;
export const pluginPhysicalisation = (verb: string): string | undefined =>
  _physicalisations[verb.toLowerCase()];
export const runPostCheckHooks = (
  text: string, seconds: number, result: AtomicityResult,
): void => {
  for (const h of _hooks) {
    try { h(text, seconds, result); } catch { /* hooks must not throw into hot path */ }
  }
};

/** Reset all registered plugins. Used by tests; not intended for runtime. */
export const _resetPlugins = (): void => {
  _templates.length = 0;
  for (const k of Object.keys(_physicalisations)) delete _physicalisations[k];
  _hooks.length = 0;
};
