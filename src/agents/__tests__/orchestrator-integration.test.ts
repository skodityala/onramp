import { describe, it, expect } from 'vitest';
import { Orchestrator } from '../orchestrator';
import { defaultConfig } from '../context';
import { makeIds } from '../../core/types';
import type { Step } from '../../core/types';
import { checkAtomicity } from '../../core/atomicity';
import { startSession } from '../../core/session';

const NOW = '2026-08-08T00:00:00.000Z';

const makeStep = (text: string, seconds: number, ids: ReturnType<typeof makeIds>): Step => {
  const check = checkAtomicity(text, seconds);
  return {
    id: ids.next(), text, seconds, depth: 0, parentId: null, check, source: 'rules',
  };
};

describe('Orchestrator integration', () => {
  it('produces a useful output for a non-atomic step (barriers, decomposition, critic)', async () => {
    const ids = makeIds();
    const nonAtomic = makeStep('Write your essay on World War One.', 3600, ids);
    const session = startSession('Write your essay on World War One.', makeIds(), NOW);
    const orch = new Orchestrator(ids, {
      ...defaultConfig, enableCritic: true, enableCoach: true,
    });
    const out = await orch.run({
      step: nonAtomic, assignment: session.assignment, session,
    });

    // At least one of: decomposition (children), critic, or barriers on the step.
    const hasChildren = out.children.length > 0;
    const hasCritic = out.critic !== null;
    const hasBarriers = nonAtomic.check.barriers.length > 0;
    expect(hasChildren || hasCritic || hasBarriers).toBe(true);

    // The orchestrator emits at least a start and an end event.
    expect(out.events.length).toBeGreaterThanOrEqual(2);
  });

  it('does not throw on an atomic step and still produces sensible output', async () => {
    const ids = makeIds();
    const atomic = makeStep('Open your laptop.', 60, ids);
    const session = startSession('Open your laptop.', makeIds(), NOW);
    const orch = new Orchestrator(ids, {
      ...defaultConfig, enableCritic: true, enableCoach: true,
    });

    const out = await orch.run({
      step: atomic, assignment: session.assignment, session,
    });

    expect(out).toBeDefined();
    // Atomic steps should not be decomposed.
    expect(out.children.length).toBe(0);
    // Critic is still produced when enabled.
    expect(out.critic).not.toBeNull();
  });
});
