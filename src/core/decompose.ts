import type { Ids, Step } from './types';
import { checkAtomicity } from './atomicity';
import type { Template } from './templates';
import { TEMPLATES } from './templates';
import { semanticMatch } from './embeddings';
import { pluginTemplates } from './plugins';
import {
  ABSTRACT_VERBS, ACTION_VERBS, FLOOR_SECONDS, FLOOR_STEP, PHYSICALISE,
} from './lexicon';

export const MAX_DEPTH = 6;

const mk = (
  ids: Ids, text: string, seconds: number, parent: Step | null, depth: number,
): Step => {
  const check = checkAtomicity(text, seconds);
  return {
    id: ids.next(), text, seconds, depth,
    parentId: parent ? parent.id : null,
    check, source: 'rules',
  };
};

/**
 * Break one non-atomic step into 2 to 4 children that are closer to atomic.
 * Pure. Strategy order matters: earlier strategies produce better children.
 */
export function decomposeStep(step: Step, assignment: string, ids: Ids): Step[] {
  const depth = step.depth + 1;

  // Floor. Nobody ever hits a dead end.
  if (depth >= MAX_DEPTH) {
    return [mk(ids, FLOOR_STEP, FLOOR_SECONDS, step, depth)];
  }

  const { barriers } = step.check;
  const half = Math.max(15, Math.floor(step.seconds / 2));

  // S1 Split on conjunctions.
  if (barriers.includes('MULTI_VERB')) {
    const parts = step.text
      .split(/,? (?:and then|and|then)\s+|;\s*/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 2);
    if (parts.length > 1) {
      return parts.slice(0, 4).map((p) =>
        mk(ids, sentence(p), Math.max(15, Math.floor(step.seconds / parts.length)), step, depth));
    }
  }

  // S2 Expand a known assignment shape. Only at the top.
  if (step.depth === 0) {
    // Try substring match first (existing behavior, matches on keyword).
    // Include plugin templates so extension code participates.
    const substringPool: readonly Template[] = [...TEMPLATES, ...pluginTemplates()];
    let matched: Template | null = null;
    const lower = assignment.toLowerCase();
    for (const t of substringPool) {
      if (t.keys.some((k) => lower.includes(k))) { matched = t; break; }
    }
    // Fall back to semantic match if no substring hit.
    if (!matched) matched = semanticMatch(assignment);
    if (matched) return matched.steps.map((s) => mk(ids, s.text, s.seconds, step, depth));
  }

  // S3 Resolve a decision by making it.
  if (barriers.includes('DECISION_LEFT')) {
    return [
      mk(ids, 'Use the first option you see. Do not look at the others.', 25, step, depth),
      mk(ids, sentence(stripDecision(step.text)), half, step, depth),
    ];
  }

  // S4 Physicalise an abstract verb.
  if (barriers.includes('ABSTRACT')) {
    const lead = leadingVerb(step.text);
    const opener = lead ? PHYSICALISE[lead] : undefined;
    if (opener) {
      return [
        mk(ids, opener, Math.min(half, 60), step, depth),
        mk(ids, 'Read what you wrote out loud once.', 30, step, depth),
      ];
    }
  }

  // S5 Bound the unbounded.
  if (barriers.includes('UNBOUNDED') || barriers.includes('VAGUE_QUANTITY')) {
    return [mk(ids, bound(step.text), Math.min(half, 90), step, depth)];
  }

  // S6 Remove a branch.
  if (barriers.includes('CONDITIONAL')) {
    return [mk(ids, sentence(stripConditional(step.text)), half, step, depth)];
  }

  // S7 Last resort: halve the time and add a stop.
  return [mk(ids, bound(step.text), half, step, depth)];
}

/** Recursively decompose until every leaf is atomic or MAX_DEPTH is reached. */
export function buildTree(root: Step, assignment: string, ids: Ids): Step[] {
  const out: Step[] = [root];
  const queue: Step[] = [root];
  while (queue.length) {
    const cur = queue.shift() as Step;
    if (cur.check.atomic || cur.depth >= MAX_DEPTH) continue;
    const kids = decomposeStep(cur, assignment, ids);
    out.push(...kids);
    queue.push(...kids);
  }
  return out;
}

const sentence = (s: string) => {
  const t = s.trim().replace(/^[a-z]/, (c) => c.toUpperCase());
  return /[.!?]$/.test(t) ? t : `${t}.`;
};

const leadingVerb = (s: string): string | undefined =>
  s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
    .find((t) => (ACTION_VERBS as readonly string[]).includes(t));

const stripDecision = (s: string) =>
  s.replace(/\b(choose|decide|pick|select|determine)\b/gi, 'use')
   .replace(/\b(the best|the most interesting|an appropriate|a suitable)\b/gi, 'the first');

const stripConditional = (s: string) =>
  s.replace(/\b(if|unless|when possible|optionally|maybe|perhaps|try to)\b[^,.]*,?\s*/gi, '').trim();

/** Bound a step. If it already ends with a stop phrase, halve time and return unchanged. */
const bound = (s: string) => {
  const trimmed = s.trim().replace(/[.]+$/, '');
  if (/\b(nothing else|then stop|and stop|only)$/i.test(trimmed)) {
    return `${trimmed.replace(/^[a-z]/, (c) => c.toUpperCase())}.`;
  }
  return `${trimmed.replace(/^[a-z]/, (c) => c.toUpperCase())}. Nothing else.`;
};

// Silence unused-import warnings for verbs not directly referenced here.
void ABSTRACT_VERBS;
