/**
 * Fuzz tests. Feed the checker and decomposer randomly-generated inputs
 * and assert invariants hold. Not exhaustive; the goal is to catch pathological
 * cases the specification tests miss.
 * 
 * The random generator is seeded so failures are reproducible.
 */

import { describe, expect, it } from 'vitest';
import { checkAtomicity } from '../atomicity';
import { buildTree, decomposeStep, MAX_DEPTH } from '../decompose';
import { checkAtomicity as chk } from '../atomicity';
import { makeIds } from '../types';
import type { Step } from '../types';

/** Deterministic 32-bit PRNG (Mulberry32). */
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const VERBS = ['open', 'read', 'write', 'type', 'study', 'research', 'click', 'copy', 'find', 'put'];
const NOUNS = ['essay', 'book', 'file', 'title', 'chapter', 'notes', 'topic', 'sentence', 'page', 'answer'];
const CONNECTORS = ['and', 'then', ',', ''];
const MODIFIERS = ['some', 'a few', 'the first', 'three', 'if possible', ''];

const randInt = (rng: () => number, hi: number) => Math.floor(rng() * hi);
const pick = <T>(rng: () => number, arr: readonly T[]) => arr[randInt(rng, arr.length)]!;

const randomAssignment = (rng: () => number): string => {
  const parts: string[] = [];
  const n = 1 + randInt(rng, 4);
  for (let i = 0; i < n; i++) {
    const mod = pick(rng, MODIFIERS);
    parts.push(`${pick(rng, VERBS)} ${mod} ${pick(rng, NOUNS)}`.trim().replace(/\s+/g, ' '));
    if (i < n - 1) parts.push(pick(rng, CONNECTORS));
  }
  return parts.join(' ').trim();
};

const rootOf = (text: string): Step => ({
  id: 'root', text, seconds: 3600, depth: 0, parentId: null,
  check: chk(text, 3600), source: 'rules',
});

describe('checker fuzz', () => {
  it('never throws on 500 random assignments', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 500; i++) {
      const text = randomAssignment(rng);
      const seconds = 10 + randInt(rng, 3600);
      expect(() => checkAtomicity(text, seconds)).not.toThrow();
    }
  });

  it('atomic iff barriers is empty (invariant)', () => {
    const rng = mulberry32(43);
    for (let i = 0; i < 200; i++) {
      const text = randomAssignment(rng);
      const seconds = 10 + randInt(rng, 3600);
      const r = checkAtomicity(text, seconds);
      expect(r.atomic).toBe(r.barriers.length === 0);
    }
  });

  it('explanations and hints length equals barriers length', () => {
    const rng = mulberry32(44);
    for (let i = 0; i < 200; i++) {
      const text = randomAssignment(rng);
      const seconds = 10 + randInt(rng, 3600);
      const r = checkAtomicity(text, seconds);
      expect(r.explanations.length).toBe(r.barriers.length);
      expect(r.hints.length).toBe(r.barriers.length);
    }
  });

  it('is deterministic across many identical inputs', () => {
    const rng = mulberry32(45);
    for (let i = 0; i < 50; i++) {
      const text = randomAssignment(rng);
      const seconds = 10 + randInt(rng, 3600);
      const a = checkAtomicity(text, seconds);
      const b = checkAtomicity(text, seconds);
      expect(a).toEqual(b);
    }
  });

  it('never throws on adversarial input', () => {
    const adversarial = [
      '',
      ' ',
      '\n\n\n',
      '!@#$%^&*()',
      'x'.repeat(10000),
      '\u0000\u0001\u0002',
      '🎉🎊🎈'.repeat(100),
      'and and and and',
      'if if if if',
      'AND THEN AND THEN',
      'a',
      '123',
      'a\nb\nc\nd',
    ];
    for (const t of adversarial) {
      expect(() => checkAtomicity(t, 60)).not.toThrow();
      expect(() => checkAtomicity(t, 0)).not.toThrow();
      expect(() => checkAtomicity(t, 999999)).not.toThrow();
    }
  });
});

describe('decomposer fuzz', () => {
  it('buildTree always produces atomic leaves (or MAX_DEPTH) on 100 random inputs', () => {
    const rng = mulberry32(46);
    for (let i = 0; i < 100; i++) {
      const text = randomAssignment(rng);
      const steps = buildTree(rootOf(text), text, makeIds());
      const parents = new Set(steps.map((s) => s.parentId).filter(Boolean));
      const leaves = steps.filter((s) => !parents.has(s.id));
      for (const leaf of leaves) {
        const ok = leaf.check.atomic || leaf.depth >= MAX_DEPTH;
        expect(ok, `bad leaf in "${text}": ${leaf.text}`).toBe(true);
      }
    }
  });

  it('tree size stays bounded on random inputs', () => {
    const rng = mulberry32(47);
    for (let i = 0; i < 100; i++) {
      const text = randomAssignment(rng);
      const steps = buildTree(rootOf(text), text, makeIds());
      expect(steps.length, `runaway tree for "${text}"`).toBeLessThan(500);
    }
  });

  it('decomposeStep never throws on any real step', () => {
    const rng = mulberry32(48);
    for (let i = 0; i < 100; i++) {
      const text = randomAssignment(rng);
      const step = rootOf(text);
      expect(() => decomposeStep(step, text, makeIds())).not.toThrow();
    }
  });
});
