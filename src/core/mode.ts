import type { StepMode } from './types';

/** Verbs whose output is text the user could type right here. */
const TYPING_VERBS = ['type', 'write', 'copy', 'list', 'name', 'label', 'title'];

/** Verbs that unambiguously happen away from the keyboard. */
const PHYSICAL_ONLY = [
  'open', 'close', 'click', 'press', 'tap', 'put', 'place', 'pick', 'stand',
  'sit', 'walk', 'say', 'read', 'draw', 'print', 'plug', 'take', 'get', 'fold',
];

export function modeOf(text: string): StepMode {
  const t = text.toLowerCase();
  const first = t.replace(/[^a-z\s]/g, ' ').trim().split(/\s+/)[0] ?? '';
  if (PHYSICAL_ONLY.includes(first)) return 'physical';
  if (TYPING_VERBS.includes(first)) return 'type';
  return TYPING_VERBS.some((v) => new RegExp(`\\b${v}\\b`).test(t)) ? 'type' : 'physical';
}
