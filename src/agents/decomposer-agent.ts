import type { Agent } from './base';
import type { AgentContext } from './context';
import type { Step } from '../core/types';
import { decomposeStep } from '../core/decompose';

export interface DecomposerInput {
  step: Step;
  assignment: string;
}

/**
 * The Decomposer Agent. Wraps decomposeStep. When an LLM adapter is wired,
 * a future variant of this agent may propose steps that then flow into the
 * Checker for gating. That is why the input includes the parent step and
 * the full assignment context.
 */
export const DecomposerAgent: Agent<DecomposerInput, Step[]> = {
  name: 'decomposer',
  description: 'Recursive rule-based decomposer. Produces 2-4 children from a non-atomic step.',
  run(input, ctx: AgentContext) {
    ctx.log({ agent: 'decomposer', kind: 'start', at: ctx.now() });
    const kids = decomposeStep(input.step, input.assignment, ctx.ids);
    ctx.log({
      agent: 'decomposer',
      kind: 'end',
      at: ctx.now(),
      payload: { count: kids.length, depths: kids.map((k) => k.depth) },
    });
    return kids;
  },
};
