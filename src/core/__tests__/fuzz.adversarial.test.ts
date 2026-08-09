/**
 * Adversarial fuzz tests. Target inputs the specification never anticipated:
 * unicode, extreme length, whitespace-only, stop-word-only.
 *
 * A pre-existing fuzz.test.ts already exists in this directory; this file
 * adds adversarial cases without overwriting it.
 */

import { describe, expect, it } from 'vitest';
import { checkAtomicity } from '../atomicity';
import { startSession } from '../session';
import { makeIds } from '../types';

/** Deterministic 32-bit PRNG (Mulberry32). */
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const randInt = (rng: () => number, hi: number) => Math.floor(rng() * hi);

/** Random Unicode string over a wide codepoint range (BMP + supplementary). */
const randomUnicode = (rng: () => number, maxLen: number): string => {
  const len = randInt(rng, maxLen + 1);
  let out = '';
  for (let i = 0; i < len; i++) {
    // Mix of Latin, CJK, emoji, RTL, and control-ish characters (skip surrogates).
    const bucket = randInt(rng, 5);
    let code: number;
    if (bucket === 0) code = 0x20 + randInt(rng, 0x5E);                   // ASCII printable
    else if (bucket === 1) code = 0x4E00 + randInt(rng, 0x2000);           // CJK
    else if (bucket === 2) code = 0x0590 + randInt(rng, 0xFF);             // Hebrew (RTL)
    else if (bucket === 3) {                                                // emoji (astral)
      const astral = 0x1F300 + randInt(rng, 0x500);
      out += String.fromCodePoint(astral);
      continue;
    } else code = 0x00A0 + randInt(rng, 0xFF);                             // Latin-1 supplement
    out += String.fromCharCode(code);
  }
  return out;
};

describe('adversarial fuzz: checker', () => {
  it('does not crash on empty, whitespace, punctuation, huge, or unicode-heavy inputs', () => {
    const inputs: string[] = [
      '',
      '   ',
      '\n\t\r ',
      '!@#$%^&*()[]{}<>?/\\|`~',
      'x'.repeat(5000),
      '\u200E\u200F\u202E',                          // bidi control chars
      '你好世界'.repeat(200),                          // CJK
      '🎉🎊🎈🚀'.repeat(300),                          // emoji
      'שלום עולם',                                    // Hebrew (RTL)
      'مرحبا بالعالم',                                // Arabic (RTL)
    ];
    for (const text of inputs) {
      expect(() => checkAtomicity(text, 60)).not.toThrow();
    }
  });

  it('does not crash on 100 random unicode strings of length 0..200', () => {
    const rng = mulberry32(3001);
    for (let i = 0; i < 100; i++) {
      const text = randomUnicode(rng, 200);
      const seconds = randInt(rng, 5000);
      expect(() => checkAtomicity(text, seconds)).not.toThrow();
    }
  });

  it('handles a stop-word-only assignment without crashing', () => {
    const text = 'only nothing else first';
    expect(() => checkAtomicity(text, 60)).not.toThrow();
    expect(() => startSession(text, makeIds(), '2026-01-01T00:00:00Z')).not.toThrow();
  });
});

describe('adversarial fuzz: startSession', () => {
  it('handles adversarial inputs without crashing', () => {
    const inputs: string[] = [
      '',
      '   ',
      '\n\n\n',
      '!!!???',
      'x'.repeat(5000),
      '🎉'.repeat(500),
    ];
    for (const text of inputs) {
      expect(() => startSession(text, makeIds(), '2026-01-01T00:00:00Z')).not.toThrow();
    }
  });

  it('produces a valid session with a valid cursor and at least one leaf for a 10000-char input within 100ms', () => {
    const text = 'Write ' + 'x'.repeat(10000);
    const t0 = performance.now();
    const session = startSession(text, makeIds(), '2026-01-01T00:00:00Z');
    const elapsed = performance.now() - t0;
    expect(session.steps.length).toBeGreaterThan(0);
    expect(typeof session.cursor).toBe('string');
    const cursorExists = session.steps.some((s) => s.id === session.cursor);
    expect(cursorExists, 'cursor must reference an existing step').toBe(true);
    // Loose ceiling to avoid CI flakes.
    expect(elapsed, `startSession took ${elapsed.toFixed(2)}ms`).toBeLessThan(100);
  });
});
