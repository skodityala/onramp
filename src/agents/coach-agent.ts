import type { Agent } from './base';
import type { AgentContext } from './context';
import type { Session } from '../core/types';

export interface CoachInput {
  session: Session;
}

export interface CoachOutput {
  /** null if disabled or nothing useful to say. */
  message: string | null;
}

/**
 * The Coach Agent is OFF BY DEFAULT. It never praises. It never evaluates.
 * When enabled, it produces at most one neutral factual sentence about the
 * session state, and only when doing so is non-condescending.
 *
 * Rules for the Coach (enforced in this file):
 * - Never uses second person imperative ("you should..."), only factual
 * - Never compares to another session
 * - Never mentions time to completion
 * - Never expresses approval
 * - Returns null in the majority of cases; silence beats speaking
 */
export const CoachAgent: Agent<CoachInput, CoachOutput> = {
  name: 'coach',
  description: 'Optional neutral factual observer. Off by default. Never praises.',
  run(input, ctx: AgentContext): CoachOutput {
    if (!ctx.config.enableCoach) return { message: null };
    ctx.log({ agent: 'coach', kind: 'start', at: ctx.now() });

    const done = input.session.done.length;
    const started = Object.values(input.session.timings)
      .filter((t) => t.msToFirstInput !== null).length;

    // Silence is the default. Speak only on the specific factual moments below.
    let message: string | null = null;

    if (started === 1 && done === 0) {
      message = 'One step in progress.';
    } else if (done === 1) {
      message = 'One step finished.';
    }

    ctx.log({ agent: 'coach', kind: 'end', at: ctx.now(), payload: { spoke: message !== null } });
    return { message };
  },
};
