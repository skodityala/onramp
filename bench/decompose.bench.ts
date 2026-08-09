import { bench, describe } from 'vitest';
import { buildTree } from '../src/core/decompose';
import { checkAtomicity } from '../src/core/atomicity';
import { makeIds } from '../src/core/types';
import type { Step } from '../src/core/types';

const rootOf = (a: string): Step => ({
  id: 'root', text: a, seconds: 3600, depth: 0, parentId: null,
  check: checkAtomicity(a, 3600), source: 'rules',
});

describe('buildTree performance', () => {
  bench('essay assignment', () => {
    buildTree(rootOf('Write a 5 page essay on WWI'), 'Write a 5 page essay on WWI', makeIds());
  });
  bench('unmatched assignment', () => {
    buildTree(rootOf('Sort the thing out'), 'Sort the thing out', makeIds());
  });
});
