import { describe, expect, it } from 'vitest';
import { decodeAssignment, encodeAssignment, readAssignmentFromHash, shareUrl } from '../link';

describe('link encoding', () => {
  it('round-trips ASCII', () => {
    const t = 'Write a 5 page essay';
    expect(decodeAssignment(encodeAssignment(t))).toBe(t);
  });

  it('round-trips accents', () => {
    const t = 'écrire un résumé';
    expect(decodeAssignment(encodeAssignment(t))).toBe(t);
  });

  it('round-trips emoji', () => {
    const t = 'do the thing 🌱📚';
    expect(decodeAssignment(encodeAssignment(t))).toBe(t);
  });

  it('round-trips a very long string', () => {
    const t = 'x'.repeat(5000);
    expect(decodeAssignment(encodeAssignment(t))).toBe(t);
  });

  it('round-trips the empty string', () => {
    expect(decodeAssignment(encodeAssignment(''))).toBe('');
  });

  it('produces URL-safe base64: no +, /, =', () => {
    const s = encodeAssignment('Some/tricky+bytes==');
    expect(s).not.toMatch(/[+/=]/);
  });

  it('readAssignmentFromHash returns null on empty hash', () => {
    expect(readAssignmentFromHash('')).toBeNull();
  });

  it('readAssignmentFromHash returns null on garbage', () => {
    expect(readAssignmentFromHash('#a=@@@notbase64@@@')).toBeNull();
  });

  it('readAssignmentFromHash extracts a=<encoded>', () => {
    const t = 'Read chapter 7';
    const hash = `#a=${encodeAssignment(t)}`;
    expect(readAssignmentFromHash(hash)).toBe(t);
  });

  it('shareUrl embeds #a=', () => {
    const u = shareUrl('https://x.dev', '/', 'test');
    expect(u).toContain('#a=');
    expect(u.startsWith('https://x.dev/')).toBe(true);
  });
});
