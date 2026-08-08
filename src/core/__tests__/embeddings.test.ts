import { describe, it, expect } from 'vitest';
import {
  embed,
  cosine,
  rankTemplates,
  semanticMatch,
  templatePrototype,
} from '../embeddings';
import { TEMPLATES } from '../templates';

const magnitude = (v: Float32Array): number => {
  let sq = 0;
  for (let i = 0; i < v.length; i++) sq += v[i]! * v[i]!;
  return Math.sqrt(sq);
};

const findTemplateByKey = (key: string) =>
  TEMPLATES.find((t) => t.keys.includes(key))!;

describe('embed', () => {
  it('returns a zero-magnitude vector for an empty string', () => {
    const v = embed('');
    expect(magnitude(v)).toBe(0);
  });

  it('returns a whitespace-only string as a zero-magnitude vector', () => {
    const v = embed('   \t  ');
    expect(magnitude(v)).toBe(0);
  });

  it('returns a non-zero L2-normalised vector for a real word', () => {
    const v = embed('essay');
    expect(magnitude(v)).toBeGreaterThan(0);
    expect(magnitude(v)).toBeCloseTo(1, 6);
  });

  it('is deterministic for the same input', () => {
    const a = embed('write an essay on WWI');
    const b = embed('write an essay on WWI');
    expect(a.length).toBe(b.length);
    for (let i = 0; i < a.length; i++) {
      expect(a[i]).toBe(b[i]);
    }
  });

  it('produces the same vector regardless of case and punctuation', () => {
    const a = embed('Essay!');
    const b = embed('essay');
    for (let i = 0; i < a.length; i++) {
      expect(a[i]).toBeCloseTo(b[i]!, 6);
    }
  });
});

describe('cosine', () => {
  it('returns 1 for a vector with itself', () => {
    const v = embed('physics test tomorrow');
    expect(cosine(v, v)).toBeCloseTo(1, 6);
  });

  it('returns 0 for length-mismatched vectors', () => {
    const a = new Float32Array([1, 0, 0]);
    const b = new Float32Array([1, 0, 0, 0]);
    expect(cosine(a, b)).toBe(0);
  });

  it('returns a small value for surface-dissimilar strings', () => {
    // Note: with DIM=128 buckets, hash collisions raise the floor above 0.
    // We assert a loose upper bound that still separates unrelated inputs
    // from the near-1 self-similarity case.
    const a = embed('essay');
    const b = embed('qqqqq wwwww zzzzz');
    const score = cosine(a, b);
    expect(score).toBeLessThan(0.2);
  });

  it('ranks morphological neighbours closer than unrelated words', () => {
    const target = embed('essay');
    const near = embed('essays');
    const far = embed('exercise');
    expect(cosine(target, near)).toBeGreaterThan(cosine(target, far));
  });
});

describe('rankTemplates', () => {
  it('returns TEMPLATES.length entries', () => {
    const ranked = rankTemplates('anything');
    expect(ranked.length).toBe(TEMPLATES.length);
  });

  it('returns entries sorted by descending score with rank indices', () => {
    const ranked = rankTemplates('write an essay on WWI');
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1]!.score).toBeGreaterThanOrEqual(ranked[i]!.score);
      expect(ranked[i]!.rank).toBe(i);
    }
  });

  it('ranks the essay template first for an essay assignment', () => {
    const ranked = rankTemplates('write an essay on WWI');
    expect(ranked[0]!.template).toBe(findTemplateByKey('essay'));
  });

  it('ranks the read template in the top 3 for a reading assignment', () => {
    const ranked = rankTemplates('read chapter 5');
    const readTemplate = findTemplateByKey('read');
    const top3 = ranked.slice(0, 3).map((r) => r.template);
    expect(top3).toContain(readTemplate);
  });

  it('ranks study or a science template near the top for a physics test', () => {
    const ranked = rankTemplates('physics test tomorrow');
    const study = findTemplateByKey('study');
    const science = findTemplateByKey('physics');
    const top3 = ranked.slice(0, 3).map((r) => r.template);
    expect(top3.includes(study) || top3.includes(science)).toBe(true);
  });

  it('ranks the clean template in the top 3 for tidying a room', () => {
    const ranked = rankTemplates('clean my room');
    const cleanTemplate = findTemplateByKey('clean');
    const top3 = ranked.slice(0, 3).map((r) => r.template);
    expect(top3).toContain(cleanTemplate);
  });

  it('produces a modest top score for gibberish input', () => {
    // Hash-based bag-of-features has a nonzero collision floor, so we assert
    // a loose upper bound rather than "close to zero".
    const ranked = rankTemplates('qqqqq wwwww zzzzz');
    expect(ranked[0]!.score).toBeLessThan(0.6);
  });
});

describe('semanticMatch', () => {
  it('returns the correct template for a clear match', () => {
    const t = semanticMatch('write an essay on WWI');
    expect(t).toBe(findTemplateByKey('essay'));
  });

  it('returns null for gibberish under the default threshold', () => {
    const t = semanticMatch('xyzzy plugh mumble');
    expect(t).toBeNull();
  });

  it('always returns the top-ranked template when threshold is 0', () => {
    const t = semanticMatch('xyzzy plugh mumble', 0);
    expect(t).not.toBeNull();
    const ranked = rankTemplates('xyzzy plugh mumble');
    expect(t).toBe(ranked[0]!.template);
  });

  it('returns null when threshold is set impossibly high', () => {
    const t = semanticMatch('write an essay on WWI', 0.99);
    expect(t).toBeNull();
  });
});

describe('templatePrototype', () => {
  it('caches the prototype for a given Template instance', () => {
    const t = TEMPLATES[0]!;
    const a = templatePrototype(t);
    const b = templatePrototype(t);
    expect(a).toBe(b);
  });

  it('returns an L2-normalised vector', () => {
    const t = TEMPLATES[0]!;
    const v = templatePrototype(t);
    expect(magnitude(v)).toBeCloseTo(1, 6);
  });
});
