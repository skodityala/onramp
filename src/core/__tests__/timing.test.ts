import { describe, expect, it } from 'vitest';
import { emptyTiming, medianTimeToStart, recordDone, recordFirstInput, setTyped } from '../timing';
import type { Session } from '../types';

const baseSession = (): Session => ({
  id: 's', assignment: 'x', createdAt: 'now', steps: [], cursor: '', done: [],
  timings: {}, typed: {},
});

describe('timing', () => {
  it('recordFirstInput sets once and ignores later calls', () => {
    let s = baseSession();
    s = recordFirstInput(s, 'a', 100);
    s = recordFirstInput(s, 'a', 200);
    expect(s.timings['a']?.msToFirstInput).toBe(100);
  });

  it('recordDone does not clobber msToFirstInput', () => {
    let s = baseSession();
    s = recordFirstInput(s, 'a', 100);
    s = recordDone(s, 'a', 500);
    expect(s.timings['a']).toEqual({ msToFirstInput: 100, msToDone: 500 });
  });

  it('does not mutate the input session', () => {
    const s = baseSession();
    const t = recordFirstInput(s, 'a', 42);
    expect(s.timings).toEqual({});
    expect(t.timings['a']?.msToFirstInput).toBe(42);
  });

  it('medianTimeToStart returns null with no data', () => {
    expect(medianTimeToStart(baseSession())).toBeNull();
  });

  it('medianTimeToStart returns the single value', () => {
    let s = baseSession();
    s = recordFirstInput(s, 'a', 1000);
    expect(medianTimeToStart(s)).toBe(1000);
  });

  it('medianTimeToStart averages middle two for even count', () => {
    let s = baseSession();
    s = recordFirstInput(s, 'a', 100);
    s = recordFirstInput(s, 'b', 200);
    s = recordFirstInput(s, 'c', 300);
    s = recordFirstInput(s, 'd', 400);
    expect(medianTimeToStart(s)).toBe(250);
  });

  it('medianTimeToStart picks the middle value for odd count', () => {
    let s = baseSession();
    s = recordFirstInput(s, 'a', 100);
    s = recordFirstInput(s, 'b', 500);
    s = recordFirstInput(s, 'c', 900);
    expect(medianTimeToStart(s)).toBe(500);
  });

  it('setTyped updates the typed field without touching timings', () => {
    let s = baseSession();
    s = setTyped(s, 'a', 'hello');
    expect(s.typed['a']).toBe('hello');
    expect(s.timings).toEqual({});
  });

  it('emptyTiming is null/null', () => {
    expect(emptyTiming()).toEqual({ msToFirstInput: null, msToDone: null });
  });
});
