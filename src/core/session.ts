import type { Ids, Session, Step } from './types';
import { checkAtomicity } from './atomicity';
import { buildTree, decomposeStep } from './decompose';

/**
 * Optional agent-produced fields that ride alongside a Session without
 * requiring changes to the canonical Session type in types.ts. The values
 * are typed as `unknown` so this module has zero dependency on agents/*.
 */
export type SessionWithAgents = Session & {
  readonly critic?: Readonly<Record<string, unknown>>;
  readonly coach?: Readonly<Record<string, unknown>>;
};

export function startSession(
  assignment: string, ids: Ids, now: string,
): Session {
  const trimmed = assignment.trim();
  const rootCheck = checkAtomicity(trimmed, 3600);
  const root: Step = {
    id: ids.next(), text: trimmed, seconds: 3600, depth: 0,
    parentId: null, check: rootCheck, source: 'rules',
  };
  const steps = buildTree(root, trimmed, ids);
  const first = firstLeaf(steps, root.id) ?? root;
  return {
    id: ids.next(), assignment: trimmed, createdAt: now,
    steps, cursor: first.id, done: [], timings: {}, typed: {},
  };
}

const childrenOf = (steps: readonly Step[], id: string) =>
  steps.filter((s) => s.parentId === id);

/** Deepest-first leftmost leaf under `id`. */
export function firstLeaf(steps: readonly Step[], id: string): Step | null {
  const kids = childrenOf(steps, id);
  if (kids.length === 0) return steps.find((s) => s.id === id) ?? null;
  return firstLeaf(steps, (kids[0] as Step).id);
}

export function allLeaves(steps: readonly Step[]): Step[] {
  return steps.filter((s) => childrenOf(steps, s.id).length === 0);
}

/** Advance to the next unfinished leaf in document order. Null when finished. */
export function nextLeaf(session: Session): Step | null {
  const leaves = allLeaves(session.steps);
  const i = leaves.findIndex((l) => l.id === session.cursor);
  for (let j = i + 1; j < leaves.length; j++) {
    const cand = leaves[j] as Step;
    if (!session.done.includes(cand.id)) return cand;
  }
  return leaves.find((l) => !session.done.includes(l.id) && l.id !== session.cursor) ?? null;
}

export function markDone(session: Session): Session {
  const done = session.done.includes(session.cursor)
    ? session.done : [...session.done, session.cursor];
  const advanced = { ...session, done };
  const next = nextLeaf(advanced);
  return { ...advanced, cursor: next ? next.id : session.cursor };
}

export function isFinished(session: Session): boolean {
  return allLeaves(session.steps).every((l) => session.done.includes(l.id));
}

/** "Smaller". Always returns a session whose cursor is deeper than before. */
export function goSmaller(session: Session, ids: Ids): Session {
  const cur = session.steps.find((s) => s.id === session.cursor);
  if (!cur) return session;
  const existing = childrenOf(session.steps, cur.id);
  if (existing.length) {
    return { ...session, cursor: (existing[0] as Step).id };
  }
  const kids = decomposeStep(cur, session.assignment, ids);
  return {
    ...session,
    steps: [...session.steps, ...kids],
    cursor: (kids[0] as Step).id,
  };
}

export function goBack(session: Session): Session {
  const cur = session.steps.find((s) => s.id === session.cursor);
  if (!cur || !cur.parentId) return session;
  return { ...session, cursor: cur.parentId };
}

export function currentStep(session: Session): Step {
  return (session.steps.find((s) => s.id === session.cursor)
    ?? (session.steps[0] as Step));
}

/** How many steps she began. Typed-then-done OR done-without-typing. */
export function startedCount(s: Session): number {
  const typed = Object.values(s.timings).filter((t) => t.msToFirstInput !== null).length;
  const physicalDone = s.done.filter((id) => !(s.timings[id]?.msToFirstInput)).length;
  return typed + physicalDone;
}

/**
 * Return a new session with `critic` stored under `stepId`. Pure. Immutable.
 * The value is opaque (`unknown`) to keep core free of agent type deps.
 */
export function attachCritic(
  session: Session, stepId: string, critic: unknown,
): SessionWithAgents {
  const prev = (session as SessionWithAgents).critic ?? {};
  return { ...session, critic: { ...prev, [stepId]: critic } };
}

/**
 * Return a new session with `coach` stored under `stepId`. Pure. Immutable.
 */
export function attachCoach(
  session: Session, stepId: string, coach: unknown,
): SessionWithAgents {
  const prev = (session as SessionWithAgents).coach ?? {};
  return { ...session, coach: { ...prev, [stepId]: coach } };
}
