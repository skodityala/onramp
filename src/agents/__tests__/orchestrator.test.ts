import { describe, it, expect } from 'vitest';
import { Orchestrator } from '../orchestrator';
import { CheckerAgent } from '../checker-agent';
import { DecomposerAgent } from '../decomposer-agent';
import { CriticAgent } from '../critic-agent';
import { CoachAgent } from '../coach-agent';
import { makeTestContext } from '../context';
import type { AgentContext, AgentConfig } from '../context';
import { makeIds } from '../../core/types';
import type { Ids, Session, Step } from '../../core/types';
import { startSession } from '../../core/session';
import { checkAtomicity } from '../../core/atomicity';

const BANNED = [
  'just ', 'simply', 'easy', 'easily', 'obviously', "don't worry",
  'great job', 'awesome', 'well done', 'keep going', 'streak',
  'points', 'level up', 'badge', 'reward', 'congrats', 'congratulations',
];

const containsBanned = (s: string | null | undefined): boolean => {
  if (!s) return false;
  const low = s.toLowerCase();
  return BANNED.some((w) => low.includes(w));
};

const atomicStep = (ids: Ids): Step => {
  const text = 'Type your name.';
  const check = checkAtomicity(text, 60);
  return {
    id: ids.next(), text, seconds: 60, depth: 0, parentId: null, check, source: 'rules',
  };
};

const nonAtomicStep = (ids: Ids): Step => {
  const text = 'Research the essay topic and write the introduction.';
  const check = checkAtomicity(text, 3600);
  return {
    id: ids.next(), text, seconds: 3600, depth: 0, parentId: null, check, source: 'rules',
  };
};

const makeContextWith = (
  ids: Ids, session: Session | null, config: AgentConfig,
): AgentContext & { events: ReturnType<typeof makeTestContext>['events'] } => {
  const base = makeTestContext(ids, session);
  return { ...base, config, log: base.log, now: base.now, events: base.events };
};

describe('CheckerAgent', () => {
  it('accepts atomic steps and emits an accept event', async () => {
    const ids = makeIds();
    const ctx = makeTestContext(ids);
    const res = await CheckerAgent.run({ text: 'Type your name.', seconds: 60 }, ctx);
    expect(res.atomic).toBe(true);
    expect(res.barriers).toEqual([]);
    expect(ctx.events.some((e) => e.agent === 'checker' && e.kind === 'accept')).toBe(true);
  });

  it('rejects non-atomic steps and emits a reject event', async () => {
    const ids = makeIds();
    const ctx = makeTestContext(ids);
    const res = await CheckerAgent.run(
      { text: 'Research the essay topic and write the introduction.', seconds: 3600 },
      ctx,
    );
    expect(res.atomic).toBe(false);
    expect(res.barriers.length).toBeGreaterThan(0);
    expect(ctx.events.some((e) => e.agent === 'checker' && e.kind === 'reject')).toBe(true);
  });
});

describe('DecomposerAgent', () => {
  it('produces between 1 and 4 children for a non-atomic step', async () => {
    const ids = makeIds();
    const ctx = makeTestContext(ids);
    const parent = nonAtomicStep(ids);
    const kids = await DecomposerAgent.run(
      { step: parent, assignment: parent.text },
      ctx,
    );
    expect(kids.length).toBeGreaterThanOrEqual(1);
    expect(kids.length).toBeLessThanOrEqual(4);
    for (const k of kids) {
      expect(k.parentId).toBe(parent.id);
      expect(k.depth).toBe(parent.depth + 1);
    }
  });

  it('logs a start and end event with a child count payload', async () => {
    const ids = makeIds();
    const ctx = makeTestContext(ids);
    const parent = nonAtomicStep(ids);
    await DecomposerAgent.run({ step: parent, assignment: parent.text }, ctx);
    const decEvents = ctx.events.filter((e) => e.agent === 'decomposer');
    expect(decEvents.some((e) => e.kind === 'start')).toBe(true);
    expect(decEvents.some((e) => e.kind === 'end')).toBe(true);
  });
});

describe('CriticAgent', () => {
  it('returns a root-shaped result when parent is null', async () => {
    const ids = makeIds();
    const ctx = makeTestContext(ids);
    const step = atomicStep(ids);
    const out = await CriticAgent.run({ step, parent: null }, ctx);
    expect(out.ruleTrace).toEqual([]);
    expect(out.strategyHint).toBe('root');
    expect(out.headline).toBe('This is the first step.');
  });

  it('returns headline + ruleTrace + strategyHint for a decomposed step', async () => {
    const ids = makeIds();
    const ctx = makeTestContext(ids);
    const parent = nonAtomicStep(ids);
    // A synthetic child, so we can pass the failing parent to the Critic.
    const child: Step = {
      id: ids.next(), text: 'Type the title.', seconds: 30, depth: 1,
      parentId: parent.id, check: checkAtomicity('Type the title.', 30), source: 'rules',
    };
    const out = await CriticAgent.run({ step: child, parent }, ctx);
    expect(out.headline.length).toBeGreaterThan(0);
    expect(out.headline).not.toBe('This is the first step.');
    expect(out.ruleTrace.length).toBeGreaterThan(0);
    expect(out.strategyHint).not.toBe('root');
    expect(out.strategyHint).not.toBe('no strategy');
  });
});

describe('CoachAgent', () => {
  it('returns null when config.enableCoach is false (default)', async () => {
    const ids = makeIds();
    const session = startSession('Type your name.', ids, '2026-01-01');
    const ctx = makeTestContext(ids, session);
    const out = await CoachAgent.run({ session }, ctx);
    expect(out.message).toBeNull();
  });

  it('returns null in the default (no timings, no done) case when enabled', async () => {
    const ids = makeIds();
    const session = startSession('Type your name.', ids, '2026-01-01');
    const ctx = makeContextWith(ids, session, {
      maxReflections: 2, enableCoach: true, enableCritic: true, llmEnabled: false,
    });
    const out = await CoachAgent.run({ session }, ctx);
    expect(out.message).toBeNull();
  });

  it('never emits any banned word across enumerated coach output paths', async () => {
    const ids = makeIds();
    const baseSession = startSession('Type your name.', ids, '2026-01-01');
    const cfg: AgentConfig = {
      maxReflections: 2, enableCoach: true, enableCritic: true, llmEnabled: false,
    };

    // Path A: disabled -> null
    const ctxOff = makeTestContext(ids, baseSession);
    const outOff = await CoachAgent.run({ session: baseSession }, ctxOff);
    expect(containsBanned(outOff.message)).toBe(false);

    // Path B: enabled, no progress -> null
    const ctxIdle = makeContextWith(ids, baseSession, cfg);
    const outIdle = await CoachAgent.run({ session: baseSession }, ctxIdle);
    expect(containsBanned(outIdle.message)).toBe(false);

    // Path C: one step in progress
    const firstId = baseSession.steps[0]!.id;
    const inProgress: Session = {
      ...baseSession,
      timings: { [firstId]: { msToFirstInput: 400, msToDone: null } },
      done: [],
    };
    const ctxProg = makeContextWith(ids, inProgress, cfg);
    const outProg = await CoachAgent.run({ session: inProgress }, ctxProg);
    expect(containsBanned(outProg.message)).toBe(false);

    // Path D: one step finished
    const doneOne: Session = {
      ...baseSession,
      timings: { [firstId]: { msToFirstInput: 400, msToDone: 900 } },
      done: [firstId],
    };
    const ctxDone = makeContextWith(ids, doneOne, cfg);
    const outDone = await CoachAgent.run({ session: doneOne }, ctxDone);
    expect(containsBanned(outDone.message)).toBe(false);
  });
});

describe('Orchestrator', () => {
  it('produces children when the input step is not atomic', async () => {
    const ids = makeIds();
    const step = nonAtomicStep(ids);
    const orch = new Orchestrator(ids);
    const out = await orch.run({ step, assignment: step.text, session: null });
    expect(out.children.length).toBeGreaterThanOrEqual(1);
  });

  it('produces empty children when the input step is atomic', async () => {
    const ids = makeIds();
    const step = atomicStep(ids);
    const orch = new Orchestrator(ids);
    const out = await orch.run({ step, assignment: step.text, session: null });
    expect(out.children).toEqual([]);
  });

  it('emits an ordered event stream that starts and ends with the orchestrator', async () => {
    const ids = makeIds();
    const step = nonAtomicStep(ids);
    const orch = new Orchestrator(ids);
    const out = await orch.run({ step, assignment: step.text, session: null });
    expect(out.events.length).toBeGreaterThan(2);
    const first = out.events[0]!;
    const last = out.events[out.events.length - 1]!;
    expect(first.agent).toBe('orchestrator');
    expect(first.kind).toBe('start');
    expect(last.agent).toBe('orchestrator');
    expect(last.kind).toBe('end');
    // Timestamps must be monotonically non-decreasing.
    for (let i = 1; i < out.events.length; i++) {
      expect(out.events[i]!.at).toBeGreaterThanOrEqual(out.events[i - 1]!.at);
    }
  });

  it('describe() returns [checker, decomposer, critic] with default config', () => {
    const ids = makeIds();
    const orch = new Orchestrator(ids);
    const names = orch.describe().map((a) => a.name);
    expect(names).toEqual(['checker', 'decomposer', 'critic']);
  });

  it('describe() includes coach when enableCoach is true', () => {
    const ids = makeIds();
    const orch = new Orchestrator(ids, {
      maxReflections: 2, enableCoach: true, enableCritic: true, llmEnabled: false,
    });
    const names = orch.describe().map((a) => a.name);
    expect(names).toContain('coach');
    expect(names).toEqual(['checker', 'decomposer', 'critic', 'coach']);
  });

  it('describe() omits critic when enableCritic is false', () => {
    const ids = makeIds();
    const orch = new Orchestrator(ids, {
      maxReflections: 2, enableCoach: false, enableCritic: false, llmEnabled: false,
    });
    const names = orch.describe().map((a) => a.name);
    expect(names).not.toContain('critic');
  });

  it('runs the critic against the session-resolved parent', async () => {
    const ids = makeIds();
    const session = startSession(
      'Research the essay topic and write the introduction.', ids, '2026-01-01',
    );
    // Pick any non-root step so the critic has a parent to consult.
    const child = session.steps.find((s) => s.parentId !== null);
    expect(child).toBeDefined();
    const orch = new Orchestrator(ids);
    const out = await orch.run({ step: child!, assignment: session.assignment, session });
    expect(out.critic).not.toBeNull();
    expect(out.critic!.headline.length).toBeGreaterThan(0);
  });

  it('coach output (when enabled with a session) never contains banned words', async () => {
    const ids = makeIds();
    const session = startSession('Type your name.', ids, '2026-01-01');
    const orch = new Orchestrator(ids, {
      maxReflections: 2, enableCoach: true, enableCritic: true, llmEnabled: false,
    });
    const step = atomicStep(ids);
    const out = await orch.run({ step, assignment: step.text, session });
    expect(out.coach).not.toBeNull();
    expect(containsBanned(out.coach!.message)).toBe(false);
  });
});
