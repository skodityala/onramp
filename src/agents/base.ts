/**
 * Onramp Agent Framework
 *
 * An Agent is a pure function with a name and a schema. It reads a context,
 * produces an output, and emits observable events. Agents compose into
 * pipelines via the Orchestrator.
 *
 * The framework is deliberately minimal. No dependency injection container.
 * No plugin registry with lifecycle hooks. No pubsub bus. The Orchestrator
 * is 40 lines and the base is a single interface.
 */

import type { AgentContext } from './context';

export interface Agent<In, Out> {
  readonly name: string;
  readonly description: string;
  run(input: In, ctx: AgentContext): Promise<Out> | Out;
}

export interface AgentEvent {
  readonly agent: string;
  readonly kind: 'start' | 'end' | 'error' | 'reject' | 'accept';
  readonly at: number;
  readonly payload?: unknown;
}

/** Type-narrowing helper: is a value an Agent? */
export const isAgent = <I, O>(x: unknown): x is Agent<I, O> =>
  typeof x === 'object' && x !== null &&
  typeof (x as Agent<I, O>).name === 'string' &&
  typeof (x as Agent<I, O>).run === 'function';
