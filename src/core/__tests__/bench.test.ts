/**
 * Performance sanity checks. Not micro-benchmarks; the goal is to confirm
 * the pure core stays fast enough for interactive use even on modest hardware.
 * 
 * Thresholds are loose (5x typical) so CI flakiness does not cause noise.
 */

import { describe, expect, it } from 'vitest';
import { checkAtomicity } from '../atomicity';
import { buildTree } from '../decompose';
import { makeIds } from '../types';
import { startSession } from '../session';
import type { Step } from '../types';

const rootOf = (text: string): Step => ({
  id: 'root', text, seconds: 3600, depth: 0, parentId: null,
  check: checkAtomicity(text, 3600), source: 'rules',
});

const measure = (fn: () => void, iters: number): number => {
  // Warmup
  for (let i = 0; i < 5; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iters; i++) fn();
  const end = performance.now();
  return (end - start) / iters;
};

describe('performance sanity', () => {
  it('checkAtomicity averages < 1ms per call on a short input', () => {
    const avg = measure(() => checkAtomicity('Write a 5 page essay on WWI', 3600), 1000);
    expect(avg, `avg ${avg.toFixed(3)}ms`).toBeLessThan(1);
  });

  it('checkAtomicity averages < 2ms per call on a long input', () => {
    const long = 'Write ' + 'a very detailed '.repeat(50) + 'essay on WWI';
    const avg = measure(() => checkAtomicity(long, 3600), 500);
    expect(avg, `avg ${avg.toFixed(3)}ms`).toBeLessThan(2);
  });

  it('buildTree averages < 5ms per call on an essay assignment', () => {
    const text = '5 page essay on the causes of World War One, due Friday';
    const avg = measure(() => buildTree(rootOf(text), text, makeIds()), 200);
    expect(avg, `avg ${avg.toFixed(3)}ms`).toBeLessThan(5);
  });

  it('startSession averages < 10ms per call', () => {
    const text = '5 page essay on the causes of World War One, due Friday';
    const avg = measure(() => startSession(text, makeIds(), 'now'), 200);
    expect(avg, `avg ${avg.toFixed(3)}ms`).toBeLessThan(10);
  });
});
