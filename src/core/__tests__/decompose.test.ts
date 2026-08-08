import { describe, expect, it } from 'vitest';
import { buildTree, decomposeStep, MAX_DEPTH } from '../decompose';
import { checkAtomicity } from '../atomicity';
import { makeIds } from '../types';
import type { Step } from '../types';

const rootOf = (assignment: string, seconds = 3600): Step => ({
  id: 'root', text: assignment, seconds, depth: 0, parentId: null,
  check: checkAtomicity(assignment, seconds), source: 'rules',
});

const ASSIGNMENTS = [
  '5 page essay on the causes of World War One, due Friday',
  'Read chapter 7 and take notes',
  'Finish the maths worksheet, questions 1 to 20',
  'Study for the biology test on Monday',
  'Make a presentation about renewable energy',
  'Write up the titration lab report',
  'Build a small website for the club',
  'Email Mr Harris about the trip',
  'Clean and tidy your room before Sunday',
  'Fill in the university application form',
  'Summarise the article on urban planning',
  'Finish the coding homework exercise 3',
  'Sort the thing out before it gets worse',
  'Handle whatever is left over from yesterday',
  'Get the stuff ready for tomorrow',
  'Do the needful',
  'Look after the rest of it',
  'Have another go at it',
  'Wrap it up properly',
  'See what you can manage',
];

describe('buildTree', () => {
  it('THE INVARIANT: every leaf is atomic or at MAX_DEPTH', () => {
    for (const a of ASSIGNMENTS) {
      const ids = makeIds();
      const steps = buildTree(rootOf(a), a, ids);
      const parents = new Set(steps.map((s) => s.parentId).filter(Boolean));
      const leaves = steps.filter((s) => !parents.has(s.id));
      expect(leaves.length, `no leaves for: ${a}`).toBeGreaterThan(0);
      for (const leaf of leaves) {
        const ok = leaf.check.atomic || leaf.depth >= MAX_DEPTH;
        expect(ok, `leaf not atomic and not at max depth: "${leaf.text}" (${a})`).toBe(true);
      }
    }
  });

  it('children are always exactly one level deeper', () => {
    const a = ASSIGNMENTS[0] as string;
    const steps = buildTree(rootOf(a), a, makeIds());
    const byId = new Map(steps.map((s) => [s.id, s]));
    for (const s of steps) {
      if (!s.parentId) continue;
      const p = byId.get(s.parentId);
      expect(p, 'orphan step').toBeDefined();
      expect(s.depth).toBe((p as Step).depth + 1);
    }
  });

  it('children never take longer than their parent', () => {
    const a = ASSIGNMENTS[0] as string;
    const steps = buildTree(rootOf(a), a, makeIds());
    const byId = new Map(steps.map((s) => [s.id, s]));
    for (const s of steps) {
      if (!s.parentId) continue;
      expect(s.seconds).toBeLessThanOrEqual((byId.get(s.parentId) as Step).seconds);
    }
  });

  it('is deterministic for the same input and id seed', () => {
    const a = ASSIGNMENTS[3] as string;
    const one = buildTree(rootOf(a), a, makeIds()).map((s) => `${s.id}:${s.text}`);
    const two = buildTree(rootOf(a), a, makeIds()).map((s) => `${s.id}:${s.text}`);
    expect(one).toEqual(two);
  });

  it('never produces an empty text', () => {
    for (const a of ASSIGNMENTS) {
      for (const s of buildTree(rootOf(a), a, makeIds())) {
        expect(s.text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('does not explode into thousands of nodes', () => {
    for (const a of ASSIGNMENTS) {
      const steps = buildTree(rootOf(a), a, makeIds());
      expect(steps.length, `runaway tree for: ${a}`).toBeLessThan(500);
    }
  });
});

describe('decomposeStep', () => {
  it('always returns at least one child', () => {
    for (const a of ASSIGNMENTS) {
      const kids = decomposeStep(rootOf(a), a, makeIds());
      expect(kids.length).toBeGreaterThan(0);
    }
  });

  it('returns the floor at MAX_DEPTH and does not throw', () => {
    const deep: Step = { ...rootOf('anything'), depth: MAX_DEPTH, id: 'deep' };
    const kids = decomposeStep(deep, 'anything', makeIds());
    expect(kids).toHaveLength(1);
    expect((kids[0] as Step).check.atomic).toBe(true);
  });

  it('smaller on an already atomic step still returns something', () => {
    const atomic: Step = {
      id: 'a', text: 'Open your laptop.', seconds: 10, depth: 2, parentId: 'x',
      check: checkAtomicity('Open your laptop.', 10), source: 'rules',
    };
    const kids = decomposeStep(atomic, 'anything', makeIds());
    expect(kids.length).toBeGreaterThan(0);
    expect((kids[0] as Step).text.trim().length).toBeGreaterThan(0);
  });
});
