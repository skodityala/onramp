import type { Agent } from './base';
import type { AgentContext } from './context';
import type { AtomicityResult } from '../core/types';
import { checkAtomicity } from '../core/atomicity';

export interface CheckerInput {
  text: string;
  seconds: number;
}

/**
 * The Checker Agent. Wraps checkAtomicity so it can be used as a stage in
 * a pipeline. This is the agent with final authority: no other agent can
 * emit a step without a passing check.
 */
export const CheckerAgent: Agent<CheckerInput, AtomicityResult> = {
  name: 'checker',
  description: 'Deterministic 7-rule atomicity checker with final authority over step acceptance.',
  run(input, ctx: AgentContext) {
    ctx.log({ agent: 'checker', kind: 'start', at: ctx.now(), payload: input });
    const result = checkAtomicity(input.text, input.seconds);
    ctx.log({
      agent: 'checker',
      kind: result.atomic ? 'accept' : 'reject',
      at: ctx.now(),
      payload: { barriers: result.barriers },
    });
    return result;
  },
};
