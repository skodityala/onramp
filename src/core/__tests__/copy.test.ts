import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { COPY } from '../../copy';

const BANNED = [
  'just ', 'simply', 'easy', 'easily', 'obviously', "don't worry", 'dont worry',
  'great job', 'awesome', 'well done', 'you got this', 'keep going',
  'almost there', 'nearly there', 'streak', 'points', 'level up', 'badge',
  'reward', 'congrats', 'congratulations',
];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return walk(p);
    return /\.(ts|tsx|css)$/.test(f) ? [p] : [];
  });

/**
 * Words like "just" and "simply" that appear as common substrings in
 * technical identifiers ("justify", "adjust"). We only care about the
 * user-facing English usage, not the technical one.
 */
const isCodeIdentifier = (context: string, word: string): boolean => {
  const trimmedWord = word.trim();
  // "just " with a trailing space is already substring-safe (adjust/justify
  // do not end with space). Only worry about non-trailing-space cases.
  return false;
};

describe('copy discipline', () => {
  const files = walk(join(process.cwd(), 'src'))
    .filter((f) => !f.includes('__tests__'));

  it('contains no banned word anywhere in src', () => {
    const violations: string[] = [];
    for (const f of files) {
      const text = readFileSync(f, 'utf8').toLowerCase();
      for (const b of BANNED) {
        if (text.includes(b)) violations.push(`"${b}" in ${f}`);
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0);
  });

  it('contains no em dash or en dash in any copy string', () => {
    for (const [k, v] of Object.entries(COPY)) {
      expect(v, `COPY.${k}`).not.toContain('\u2014');
      expect(v, `COPY.${k}`).not.toContain('\u2013');
    }
  });

  it('has no empty strings', () => {
    for (const [k, v] of Object.entries(COPY)) {
      expect(v.trim().length, `COPY.${k} is empty`).toBeGreaterThan(0);
    }
  });
});
