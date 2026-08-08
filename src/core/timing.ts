import type { Session, StepTiming } from './types';

export const emptyTiming = (): StepTiming => ({ msToFirstInput: null, msToDone: null });

export function recordFirstInput(s: Session, stepId: string, ms: number): Session {
  const cur = s.timings[stepId] ?? emptyTiming();
  if (cur.msToFirstInput !== null) return s;
  return { ...s, timings: { ...s.timings, [stepId]: { ...cur, msToFirstInput: ms } } };
}

export function recordDone(s: Session, stepId: string, ms: number): Session {
  const cur = s.timings[stepId] ?? emptyTiming();
  return { ...s, timings: { ...s.timings, [stepId]: { ...cur, msToDone: ms } } };
}

/** Median ms from a step appearing to the first keystroke. Null if no data. */
export function medianTimeToStart(s: Session): number | null {
  const xs = Object.values(s.timings)
    .map((t) => t.msToFirstInput)
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);
  if (xs.length === 0) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2
    ? (xs[mid] as number)
    : (((xs[mid - 1] as number) + (xs[mid] as number)) / 2);
}

/** Update typed content for a step. Pure. */
export function setTyped(s: Session, stepId: string, text: string): Session {
  return { ...s, typed: { ...s.typed, [stepId]: text } };
}
