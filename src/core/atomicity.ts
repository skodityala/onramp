import type { AtomicityResult, Barrier } from './types';
import {
  ABSTRACT_VERBS, ACTION_VERBS, BOUNDED_VERBS, CONDITIONALS,
  DECISION_MARKERS, STOP_MARKERS, VAGUE_QUANTITIES,
} from './lexicon';

const EXPLANATION: Record<Barrier, string> = {
  MULTI_VERB:     'This asks for more than one thing. Steps work better one at a time.',
  DECISION_LEFT:  'There is still a decision inside this. Deciding is the part that stalls.',
  TOO_LONG:       'This is longer than two minutes. Starting gets harder past that.',
  ABSTRACT:       'This names a category of work, not a thing your hands do.',
  VAGUE_QUANTITY: 'The amount is not fixed, so there is no clear place to stop.',
  CONDITIONAL:    'This branches, and a branch is a decision wearing a different hat.',
  UNBOUNDED:      'There is no point where this is finished.',
};

const HINT: Record<Barrier, string> = {
  MULTI_VERB:     'Split it so each step has exactly one action.',
  DECISION_LEFT:  'Make the choice for them and state it plainly.',
  TOO_LONG:       'Cut it at the first natural pause.',
  ABSTRACT:       'Replace with a physical action: open, type, write, click, say, put.',
  VAGUE_QUANTITY: 'Give an exact number.',
  CONDITIONAL:    'Remove the branch and commit to one path.',
  UNBOUNDED:      'Add an explicit stop: a count, or the words "Nothing else."',
};

const MAX_SECONDS = 120;

const normalise = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s.,;:'-]/g, ' ').replace(/\s+/g, ' ').trim();

/** Word tokens with trailing punctuation stripped, so "write." matches "write". */
const tokens = (s: string) =>
  normalise(s)
    .split(/\s+/)
    .map((t) => t.replace(/^[.,;:'-]+|[.,;:'-]+$/g, ''))
    .filter(Boolean);

/** Escape a needle for use inside a RegExp. */
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Word-boundary containment. Multi-word phrases still match, but a needle
 * like "or" will not fire inside "for" and "page" will not fire inside "pages".
 * If the needle ends in a space (e.g. "or "), that space is significant and
 * requires the following character to be non-alphanumeric, which \b provides.
 */
const containsWord = (hay: string, needle: string): boolean => {
  const trimmed = needle.trim();
  if (!trimmed) return false;
  const re = new RegExp(`\\b${escapeRe(trimmed)}\\b`, 'i');
  return re.test(hay);
};

const containsAnyWord = (hay: string, needles: readonly string[]): boolean =>
  needles.some((n) => containsWord(hay, n));

export function checkAtomicity(text: string, estimateSeconds: number): AtomicityResult {
  const norm = normalise(text);
  const toks = tokens(text);
  const barriers: Barrier[] = [];

  // R1 MULTI_VERB. Two or more action-verb hits joined by an explicit
  // conjunction. Distinct verbs alone are not sufficient: "Do enough practice
  // questions" has do + practice but no conjunction, and asking the student
  // to split it would be worse than leaving it.
  const verbHits = toks.filter((t) => (ACTION_VERBS as readonly string[]).includes(t));
  const distinctVerbs = new Set(verbHits);
  const joined = /\b(and|then)\b|;/.test(norm);
  if (joined && verbHits.length >= 2 && distinctVerbs.size >= 2) {
    barriers.push('MULTI_VERB');
  }

  // R2 DECISION_LEFT. Preprocess: "pick up" is physical, not a decision.
  //    Also strip "and/or" so an "or " in "and/or the essay" is caught but a
  //    stray "or" inside "for" is not; we already use word-boundary matching.
  const decisionHay = norm.replace(/\bpick(s|ed)?\s+up\b/g, 'lift');
  if (containsAnyWord(decisionHay, DECISION_MARKERS)) barriers.push('DECISION_LEFT');

  // R3 TOO_LONG.
  if (estimateSeconds > MAX_SECONDS) barriers.push('TOO_LONG');

  // R4 ABSTRACT. The LEADING action verb decides.
  const lead = toks.find((t) => (ACTION_VERBS as readonly string[]).includes(t));
  if (lead && (ABSTRACT_VERBS as readonly string[]).includes(lead)) {
    barriers.push('ABSTRACT');
  }

  // R5 VAGUE_QUANTITY. Not vague if a numeral immediately follows.
  for (const v of VAGUE_QUANTITIES) {
    const re = new RegExp(`\\b${escapeRe(v)}\\b`, 'i');
    const m = re.exec(norm);
    if (!m) continue;
    const after = norm.slice(m.index + m[0].length).trim();
    if (!/^\d/.test(after)) {
      barriers.push('VAGUE_QUANTITY');
      break;
    }
  }

  // R6 CONDITIONAL.
  if (containsAnyWord(norm, CONDITIONALS)) barriers.push('CONDITIONAL');

  // R7 UNBOUNDED. No numeral, no stop marker, and no inherently-bounded lead verb.
  const hasNumeral = /\d/.test(norm);
  const hasStop = containsAnyWord(norm, STOP_MARKERS);
  const boundedVerb = lead ? (BOUNDED_VERBS as readonly string[]).includes(lead) : false;
  if (!hasNumeral && !hasStop && !boundedVerb) barriers.push('UNBOUNDED');

  // Deduplicate but preserve rule-order (R1..R7).
  const seen = new Set<Barrier>();
  const unique: Barrier[] = [];
  for (const b of barriers) {
    if (!seen.has(b)) { seen.add(b); unique.push(b); }
  }

  return {
    atomic: unique.length === 0,
    barriers: unique,
    score: unique.length === 0 ? 1 : Math.max(0, Math.min(1, 1 - unique.length / 7)),
    explanations: unique.map((b) => EXPLANATION[b]),
    hints: unique.map((b) => HINT[b]),
  };
}

export { EXPLANATION, HINT, MAX_SECONDS };
