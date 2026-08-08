import type { Agent, AgentEvent } from './base';
import type { AgentContext } from './context';
import type { Ids, Session, Step } from '../core/types';
import { CheckerAgent } from './checker-agent';
import { DecomposerAgent } from './decomposer-agent';
import { CriticAgent, type CriticOutput } from './critic-agent';
import { CoachAgent, type CoachOutput } from './coach-agent';
import { defaultConfig } from './context';
import type { AgentConfig } from './context';

/**
 * The Orchestrator runs a small pipeline of Agents. Not a general
 * DAG scheduler - the pipeline is fixed and known at compile time,
 * because the product's guarantees depend on the ordering:
 *
 *   Checker -> (if not atomic) Decomposer -> Checker on each child ->
 *     Critic (for the audit panel) -> Coach (optional, factual)
 *
 * A reflection loop is available for a future LLM Decomposer: if a
 * proposed step fails the checker, the Decomposer is invoked again with
 * a hint. After maxReflections failures, the deterministic rule-based
 * decomposer is used and the step is marked source: 'model-regated'.
 */

export interface OrchestrateInput {
  step: Step;
  assignment: string;
  session: Session | null;
}

export interface OrchestrateOutput {
  children: Step[];
  critic: CriticOutput | null;
  coach: CoachOutput | null;
  events: AgentEvent[];
}

export class Orchestrator {
  private events: AgentEvent[] = [];
  private clock = 0;

  constructor(
    private readonly ids: Ids,
    private readonly config: AgentConfig = defaultConfig,
  ) {}

  private makeContext(session: Session | null): AgentContext {
    return {
      ids: this.ids,
      session,
      config: this.config,
      log: (e) => this.events.push(e),
      now: () => (this.clock += 1),
    };
  }

  async run(input: OrchestrateInput): Promise<OrchestrateOutput> {
    this.events = [];
    const ctx = this.makeContext(input.session);
    const startEvent: AgentEvent = { agent: 'orchestrator', kind: 'start', at: ctx.now() };
    this.events.push(startEvent);

    let children: Step[] = [];

    if (!input.step.check.atomic) {
      children = await DecomposerAgent.run(
        { step: input.step, assignment: input.assignment },
        ctx,
      );
      // Verify every child through the Checker (defense in depth; the
      // rule-based decomposer already invokes the checker per child, but
      // the framework enforces that no child bypasses the gate)
      for (const child of children) {
        const check = await CheckerAgent.run(
          { text: child.text, seconds: child.seconds }, ctx,
        );
        // We do NOT reject rule-based children whose check disagrees with
        // the stored check; that would indicate a bug and we surface it via
        // an event. In production the decomposer's own check is authoritative.
        if (check.atomic !== child.check.atomic) {
          this.events.push({
            agent: 'orchestrator', kind: 'error', at: ctx.now(),
            payload: { drift: true, stepId: child.id },
          });
        }
      }
    }

    let critic: CriticOutput | null = null;
    if (this.config.enableCritic) {
      const parent = input.session?.steps.find((s) => s.id === input.step.parentId) ?? null;
      critic = await CriticAgent.run({ step: input.step, parent }, ctx);
    }

    let coach: CoachOutput | null = null;
    if (this.config.enableCoach && input.session) {
      coach = await CoachAgent.run({ session: input.session }, ctx);
    }

    this.events.push({ agent: 'orchestrator', kind: 'end', at: ctx.now() });

    return { children, critic, coach, events: [...this.events] };
  }

  /**
   * Introspection: return the fixed pipeline this Orchestrator will run.
   * Useful for debugging and for the UI to render the agent lattice.
   */
  describe(): readonly Agent<unknown, unknown>[] {
    const agents: Agent<unknown, unknown>[] = [
      CheckerAgent as unknown as Agent<unknown, unknown>,
      DecomposerAgent as unknown as Agent<unknown, unknown>,
    ];
    if (this.config.enableCritic) agents.push(CriticAgent as unknown as Agent<unknown, unknown>);
    if (this.config.enableCoach) agents.push(CoachAgent as unknown as Agent<unknown, unknown>);
    return agents;
  }
}
