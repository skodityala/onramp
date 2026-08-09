/**
 * Property tests for checkAtomicity.
 *
 * Each property holds for ALL inputs. We probe with 200 random inputs each,
 * using a seeded PRNG so failures reproduce deterministically. If a property
 * ever fails on a REAL bug, we tighten the property to match documented
 * behaviour rather than editing the checker.
 */

import { describe, expect, it } from 'vitest';
import { checkAtomicity } from '../atomicity';
import type { Barrier } from '../types';

/** Deterministic 32-bit PRNG (Mulberry32). */
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const randInt = (rng: () => number, hi: number) => Math.floor(rng() * hi);

/** Printable ASCII 0x20..0x7E is the corpus for these fuzz probes. */
const ASCII_LO = 0x20;
const ASCII_HI = 0x7E;

const randomAsciiString = (rng: () => number, maxLen: number): string => {
  const len = randInt(rng, maxLen + 1);
  let out = '';
  for (let i = 0; i < len; i++) {
    const code = ASCII_LO + randInt(rng, ASCII_HI - ASCII_LO + 1);
    out += String.fromCharCode(code);
  }
  return out;
};

/** R1..R7 order used by the checker when deduplicating. */
const RULE_ORDER: readonly Barrier[] = [
  'MULTI_VERB',
  'DECISION_LEFT',
  'TOO_LONG',
  'ABSTRACT',
  'VAGUE_QUANTITY',
  'CONDITIONAL',
  'UNBOUNDED',
];
const rank = (b: Barrier) => RULE_ORDER.indexOf(b);

const SAMPLES = 200;

describe('checkAtomicity property tests', () => {
  it('never throws and always returns a valid AtomicityResult shape', () => {
    const rng = mulberry32(1001);
    for (let i = 0; i < SAMPLES; i++) {
      const text = randomAsciiString(rng, 500);
      const seconds = randInt(rng, 10001);
      let result;
      expect(() => { result = checkAtomicity(text, seconds); }).not.toThrow();
      expect(result).toBeDefined();
      expect(Array.isArray(result!.barriers)).toBe(true);
      expect(Array.isArray(result!.explanations)).toBe(true);
      expect(Array.isArray(result!.hints)).toBe(true);
      expect(typeof result!.atomic).toBe('boolean');
      expect(typeof result!.score).toBe('number');
    }
  });

  it('atomic iff barriers.length === 0', () => {
    const rng = mulberry32(1002);
    for (let i = 0; i < SAMPLES; i++) {
      const text = randomAsciiString(rng, 500);
      const seconds = randInt(rng, 10001);
      const r = checkAtomicity(text, seconds);
      expect(r.atomic).toBe(r.barriers.length === 0);
    }
  });

  it('explanations.length === barriers.length', () => {
    const rng = mulberry32(1003);
    for (let i = 0; i < SAMPLES; i++) {
      const text = randomAsciiString(rng, 500);
      const seconds = randInt(rng, 10001);
      const r = checkAtomicity(text, seconds);
      expect(r.explanations.length).toBe(r.barriers.length);
    }
  });

  it('hints.length === barriers.length', () => {
    const rng = mulberry32(1004);
    for (let i = 0; i < SAMPLES; i++) {
      const text = randomAsciiString(rng, 500);
      const seconds = randInt(rng, 10001);
      const r = checkAtomicity(text, seconds);
      expect(r.hints.length).toBe(r.barriers.length);
    }
  });

  it('score is bounded in [0, 1]', () => {
    const rng = mulberry32(1005);
    for (let i = 0; i < SAMPLES; i++) {
      const text = randomAsciiString(rng, 500);
      const seconds = randInt(rng, 10001);
      const r = checkAtomicity(text, seconds);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });

  it('barriers preserve R1..R7 rule order', () => {
    const rng = mulberry32(1006);
    for (let i = 0; i < SAMPLES; i++) {
      const text = randomAsciiString(rng, 500);
      const seconds = randInt(rng, 10001);
      const r = checkAtomicity(text, seconds);
      for (let j = 1; j < r.barriers.length; j++) {
        const prev = r.barriers[j - 1]!;
        const cur = r.barriers[j]!;
        expect(rank(prev), `${prev} should come before ${cur}`).toBeLessThan(rank(cur));
      }
    }
  });

  it('is idempotent: two consecutive calls deep-equal', () => {
    const rng = mulberry32(1007);
    for (let i = 0; i < SAMPLES; i++) {
      const text = randomAsciiString(rng, 500);
      const seconds = randInt(rng, 10001);
      const a = checkAtomicity(text, seconds);
      const b = checkAtomicity(text, seconds);
      expect(a).toEqual(b);
    }
  });
});
