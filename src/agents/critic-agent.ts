import type { Agent } from './base';
import type { AgentContext } from './context';
import type { Step } from '../core/types';

export interface CriticInput {
  step: Step;
  parent: Step | null;
}

export interface CriticOutput {
  /** One sentence naming the reason the parent was decomposed. */
  headline: string;
  /** Rule names in the order the checker fired them. */
  ruleTrace: readonly string[];
  /** Which decomposition strategy the algorithm selected. */
  strategyHint: string;
}

const STRATEGY_HINT: Record<string, string> = {
  MULTI_VERB: 'S1: split on conjunction',
  DECISION_LEFT: 'S3: resolve the decision by making it',
  ABSTRACT: 'S4: physicalise the abstract verb',
  UNBOUNDED: 'S5: bound with an explicit stop',
  VAGUE_QUANTITY: 'S5: bound the vague quantity',
  CONDITIONAL: 'S6: strip the branch',
  TOO_LONG: 'S7: halve the time and add a stop',
};

/**
 * The Critic Agent. Reads a step and its parent, produces a human-readable
 * audit rationale. This is what the audit panel renders. Pure; no LLM.
 */
export const CriticAgent: Agent<CriticInput, CriticOutput> = {
  name: 'critic',
  description: 'Synthesizes the audit rationale from a step and its parent.',
  run(input, ctx: AgentContext): CriticOutput {
    ctx.log({ agent: 'critic', kind: 'start', at: ctx.now() });
    if (!input.parent) {
      return { headline: 'This is the first step.', ruleTrace: [], strategyHint: 'root' };
    }
    const barriers = input.parent.check.barriers;
    const first = barriers[0];
    const headline = first
      ? input.parent.check.explanations[0] ?? 'This step was broken down.'
      : 'This step passed the checker.';
    const strategyHint = first ? (STRATEGY_HINT[first] ?? 'S7: fallback') : 'no strategy';
    ctx.log({ agent: 'critic', kind: 'end', at: ctx.now() });
    return { headline, ruleTrace: barriers, strategyHint };
  },
};
