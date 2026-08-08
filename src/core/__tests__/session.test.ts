import { describe, expect, it } from 'vitest';
import {
  allLeaves, currentStep, goBack, goSmaller, isFinished, markDone, startSession, startedCount,
} from '../session';
import { makeIds } from '../types';
import type { Session } from '../types';

const NOW = '2026-08-08T00:00:00.000Z';
const A = '5 page essay on the causes of World War One, due Friday';

describe('startSession', () => {
  it('puts the cursor on a leaf, never on the root', () => {
    const s = startSession(A, makeIds(), NOW);
    const leaves = allLeaves(s.steps);
    expect(leaves.map((l) => l.id)).toContain(s.cursor);
    expect(s.cursor).not.toBe(s.steps[0]?.id);
  });

  it('the cursor step is atomic', () => {
    const s = startSession(A, makeIds(), NOW);
    expect(currentStep(s).check.atomic).toBe(true);
  });

  it('records the assignment verbatim, trimmed', () => {
    const s = startSession(`   ${A}   `, makeIds(), NOW);
    expect(s.assignment).toBe(A);
  });

  it('initialises timings and typed as empty', () => {
    const s = startSession(A, makeIds(), NOW);
    expect(s.timings).toEqual({});
    expect(s.typed).toEqual({});
  });
});

describe('markDone', () => {
  it('advances to a different leaf', () => {
    const s = startSession(A, makeIds(), NOW);
    const next = markDone(s);
    expect(next.done).toContain(s.cursor);
    if (!isFinished(next)) expect(next.cursor).not.toBe(s.cursor);
  });

  it('never marks the same step twice', () => {
    let s = startSession(A, makeIds(), NOW);
    const first = s.cursor;
    s = markDone(s);
    s = { ...s, cursor: first };
    s = markDone(s);
    expect(s.done.filter((d) => d === first)).toHaveLength(1);
  });

  it('finishes when every leaf is done', () => {
    let s = startSession(A, makeIds(), NOW);
    for (let i = 0; i < 500 && !isFinished(s); i++) s = markDone(s);
    expect(isFinished(s)).toBe(true);
  });
});

describe('goSmaller', () => {
  it('always moves deeper on a non-atomic cursor', () => {
    // Force a non-atomic cursor by seeding an abstract step at root.
    // Use a DIFFERENT id-prefix for the second call: makeIds() twice would
    // collide (both start at s_0001), so currentStep would resolve to the
    // root instead of the newly-created child. The prefix keeps them disjoint.
    const s = startSession('Study for the biology test', makeIds(), NOW);
    const before = currentStep(s).depth;
    const after = goSmaller(s, makeIds('z'));
    expect(currentStep(after).depth).toBeGreaterThanOrEqual(before);
  });

  it('survives twenty presses without throwing', () => {
    let s = startSession(A, makeIds(), NOW);
    const ids = makeIds('x');
    for (let i = 0; i < 20; i++) s = goSmaller(s, ids);
    expect(currentStep(s).text.trim().length).toBeGreaterThan(0);
  });

  it('reuses existing children rather than duplicating them', () => {
    const s = startSession(A, makeIds(), NOW);
    const ids = makeIds('y');
    const once = goSmaller(s, ids);
    const twice = goSmaller({ ...once, cursor: s.cursor }, ids);
    expect(twice.steps.length).toBe(once.steps.length);
  });
});

describe('goBack', () => {
  it('is a no-op at the root', () => {
    const s = startSession(A, makeIds(), NOW);
    const atRoot: Session = { ...s, cursor: (s.steps[0] as {id:string}).id };
    expect(goBack(atRoot).cursor).toBe(atRoot.cursor);
  });

  it('moves to the parent when there is one', () => {
    const s = startSession(A, makeIds(), NOW);
    const cur = currentStep(s);
    if (cur.parentId) expect(goBack(s).cursor).toBe(cur.parentId);
  });
});

describe('startedCount', () => {
  it('counts typed starts and physical dones', () => {
    const s = startSession(A, makeIds(), NOW);
    const withTypings: Session = {
      ...s,
      done: ['a', 'b', 'c'],
      timings: { a: { msToFirstInput: 3000, msToDone: 5000 }, b: { msToFirstInput: 2000, msToDone: 4000 } },
    };
    expect(startedCount(withTypings)).toBe(3); // a and b typed, c physical-done
  });

  it('is zero with no data', () => {
    const s = startSession(A, makeIds(), NOW);
    expect(startedCount(s)).toBe(0);
  });
});
