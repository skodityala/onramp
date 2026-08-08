/**
 * Client-side semantic template matching.
 *
 * Approach: a deterministic hashing-based bag-of-features embedding. For each
 * input string we produce a fixed-dimensional vector by hashing character
 * trigrams (and bigrams) into buckets. Cosine similarity ranks candidates.
 *
 * Why not real embeddings? Two reasons:
 * 1. Zero-dependency: this ships in the core bundle without pulling in
 *    a transformers library or requiring a WebGPU-capable device.
 * 2. Deterministic and inspectable: the vector for "essay" is the same on
 *    every device and every run. This matters for the audit panel.
 *
 * The trade-off is semantic depth. This method captures character-level
 * surface similarity, which is enough to match "physics test" to the "study"
 * template and "essay draft" to the "essay" template, but it will not match
 * "compose a treatise" to the "essay" template. That is by design: the
 * template library is a fast path; ambiguous inputs fall through to the
 * rule-based decomposer, which still produces atomic leaves.
 */

import type { Template } from './templates';
import { TEMPLATES } from './templates';

const DIM = 128;

/** Fowler-Noll-Vo hash, 32-bit variant. Deterministic and dependency-free. */
const fnv1a = (s: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h;
};

const normalise = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** Generate character n-grams from a normalised string. Word-boundary padded. */
const ngrams = (s: string, n: number): string[] => {
  const padded = ` ${s} `;
  const out: string[] = [];
  for (let i = 0; i <= padded.length - n; i++) {
    out.push(padded.slice(i, i + n));
  }
  return out;
};

/**
 * Embed a string into a fixed DIM-vector. Trigrams contribute weight 1;
 * bigrams contribute weight 0.5. Both are hashed to bucket indices.
 * Result is L2-normalised.
 */
export const embed = (text: string): Float32Array => {
  const norm = normalise(text);
  const v = new Float32Array(DIM);
  if (!norm) return v;

  for (const g of ngrams(norm, 3)) {
    const idx = fnv1a(g) % DIM;
    v[idx] = (v[idx] ?? 0) + 1;
  }
  for (const g of ngrams(norm, 2)) {
    const idx = fnv1a(g) % DIM;
    v[idx] = (v[idx] ?? 0) + 0.5;
  }

  // L2-normalise
  let sq = 0;
  for (let i = 0; i < DIM; i++) sq += v[i]! * v[i]!;
  const mag = Math.sqrt(sq);
  if (mag > 0) {
    for (let i = 0; i < DIM; i++) v[i] = v[i]! / mag;
  }
  return v;
};

/** Cosine similarity of two L2-normalised vectors. Range: -1..1 (typically 0..1). */
export const cosine = (a: Float32Array, b: Float32Array): number => {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i]! * b[i]!;
  return dot;
};

/**
 * Compute a "prototype" vector for a template: the average of its keys.
 * Cached for the run of the module. Deterministic across runs.
 */
const templatePrototypeCache = new WeakMap<Template, Float32Array>();

export const templatePrototype = (t: Template): Float32Array => {
  const cached = templatePrototypeCache.get(t);
  if (cached) return cached;
  const proto = new Float32Array(DIM);
  for (const key of t.keys) {
    const v = embed(key);
    for (let i = 0; i < DIM; i++) proto[i] = (proto[i] ?? 0) + (v[i] ?? 0);
  }
  // L2-normalise
  let sq = 0;
  for (let i = 0; i < DIM; i++) sq += proto[i]! * proto[i]!;
  const mag = Math.sqrt(sq);
  if (mag > 0) for (let i = 0; i < DIM; i++) proto[i] = proto[i]! / mag;
  templatePrototypeCache.set(t, proto);
  return proto;
};

export interface RankedTemplate {
  template: Template;
  score: number;
  rank: number;
}

/**
 * Rank all templates against the assignment. Returns them sorted by score
 * (descending). Callers may take the top result or check that the top
 * score exceeds a threshold before accepting it.
 */
export const rankTemplates = (assignment: string, templates: readonly Template[] = TEMPLATES): RankedTemplate[] => {
  const av = embed(assignment);
  const scored = templates.map((template, i) => ({
    template, score: cosine(av, templatePrototype(template)), rank: i,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map((r, i) => ({ ...r, rank: i }));
};

/**
 * Semantic template match. Falls back to substring match (matchTemplate)
 * if the top-ranked template's score is below `threshold`. Callers who
 * want strict semantic-only behaviour can pass threshold: 0 to always
 * accept the top result.
 */
export const semanticMatch = (
  assignment: string,
  threshold = 0.55,
): Template | null => {
  const ranked = rankTemplates(assignment);
  const top = ranked[0];
  if (!top || top.score < threshold) return null;
  return top.template;
};
