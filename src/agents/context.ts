import type { Ids, Session } from '../core/types';
import type { AgentEvent } from './base';

export interface AgentContext {
  readonly ids: Ids;
  readonly session: Session | null;
  readonly config: AgentConfig;
  log(event: AgentEvent): void;
  /** Current wall-clock time. Injectable for tests. */
  now(): number;
}

export interface AgentConfig {
  readonly maxReflections: number;   // default 2
  readonly enableCoach: boolean;     // default false
  readonly enableCritic: boolean;    // default true
  readonly llmEnabled: boolean;      // default false
}

export const defaultConfig: AgentConfig = {
  maxReflections: 2,
  enableCoach: false,
  enableCritic: true,
  llmEnabled: false,
};

/** Build a context suitable for tests: deterministic clock, buffered events. */
export const makeTestContext = (ids: Ids, session: Session | null = null): AgentContext & {
  events: AgentEvent[];
} => {
  const events: AgentEvent[] = [];
  let clock = 0;
  return {
    ids, session, config: defaultConfig, events,
    log: (e) => events.push(e),
    now: () => (clock += 1),
  };
};
