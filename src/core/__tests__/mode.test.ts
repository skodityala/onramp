import { describe, expect, it } from 'vitest';
import { modeOf } from '../mode';

describe('modeOf', () => {
  const cases: Array<[string, 'type' | 'physical']> = [
    ['Type the title. Nothing else.', 'type'],
    ['Write one sentence saying what your answer is.', 'type'],
    // "Copy" is in TYPING_VERBS per §49.4 note. Hosting a textarea for it is harmless.
    ['Copy the first sentence onto paper.', 'type'],
    ['Open a new doc.', 'physical'],
    ['Read the first paragraph out loud.', 'physical'],
    ['Put your hand on the mouse.', 'physical'],
    ['Stand up.', 'physical'],
    ['List three things you already know.', 'type'],
    ['Click save.', 'physical'],
    ['Draw one box.', 'physical'],
    ['', 'physical'],
    ['!!!', 'physical'],
    ['Fill in only your name and the date.', 'type'], // contains "name" (typing verb)
    ['Say the first word out loud.', 'physical'],
  ];
  for (const [text, expected] of cases) {
    it(`${text || '(empty)'} → ${expected}`, () => {
      expect(modeOf(text)).toBe(expected);
    });
  }
});
