/// <reference types="vite/client" />
import type { Ids, Step } from '../core/types';
import { checkAtomicity } from '../core/atomicity';
import { decomposeStep } from '../core/decompose';
import { DECOMPOSE_PROMPT } from './prompt';

export const llmEnabled = (): boolean =>
  Boolean(import.meta.env.VITE_LLM_ENDPOINT && import.meta.env.VITE_LLM_KEY);

interface Proposal { text: string; seconds: number }

/**
 * THE GATING LOOP. The model proposes, the checker disposes.
 * Never let a proposal through without checkAtomicity approving it.
 */
export async function decomposeWithModel(
  step: Step, assignment: string, ids: Ids,
): Promise<Step[]> {
  let hint = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    let proposals: Proposal[] = [];
    try {
      proposals = await ask(step.text, assignment, hint);
    } catch {
      break;
    }
    const accepted: Step[] = [];
    let firstRejection: { text: string; barrier: Step['check']['barriers'][number] } | null = null;
    for (const p of proposals) {
      const check = checkAtomicity(p.text, p.seconds);
      if (check.atomic) {
        accepted.push({
          id: ids.next(), text: p.text, seconds: p.seconds,
          depth: step.depth + 1, parentId: step.id, check, source: 'model',
        });
      } else if (!firstRejection && check.barriers[0]) {
        firstRejection = { text: p.text, barrier: check.barriers[0] };
        hint = check.hints[0] ?? '';
      }
    }
    if (accepted.length >= 2) return accepted;
    void firstRejection; // captured for logging in a future iteration
  }

  // Two failures. Fall through to the rules, and record that we did.
  const fallback = decomposeStep(step, assignment, ids);
  return fallback.map((s) => ({ ...s, source: 'model-regated' as const }));
}

async function ask(stepText: string, assignment: string, hint: string): Promise<Proposal[]> {
  const res = await fetch(import.meta.env.VITE_LLM_ENDPOINT as string, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${import.meta.env.VITE_LLM_KEY}`,
    },
    body: JSON.stringify({
      system: DECOMPOSE_PROMPT,
      input: `Assignment: ${assignment}\nStep to break down: ${stepText}${hint ? `\nFix this: ${hint}` : ''}`,
    }),
  });
  if (!res.ok) throw new Error(String(res.status));
  const body = (await res.json()) as { steps?: Proposal[] };
  return Array.isArray(body.steps) ? body.steps.slice(0, 4) : [];
}
