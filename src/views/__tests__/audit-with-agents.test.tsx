import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuditPanel } from '../AuditPanel';
import { makeIds } from '../../core/types';
import type { Session } from '../../core/types';
import {
  attachCoach, attachCritic, currentStep, startSession,
} from '../../core/session';

const A = 'Write a 5 page essay on the causes of World War One, due Friday';
const NOW = '2026-08-08T00:00:00.000Z';

describe('AuditPanel with agent output', () => {
  it('renders both critic and coach when the session carries them', () => {
    const ids = makeIds();
    const base = startSession(A, ids, NOW);
    const step = currentStep(base);

    const withCritic = attachCritic(base, step.id, {
      headline: 'This step was broken down because the parent had multiple verbs.',
      ruleTrace: ['MULTI_VERB'],
      strategyHint: 'S1: split on conjunction',
    });
    const withBoth = attachCoach(withCritic, step.id, {
      message: 'One step in progress.',
    });

    render(<AuditPanel session={withBoth as Session} step={step} />);

    expect(
      screen.getByText(/broken down because the parent had multiple verbs/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/one step in progress/i)).toBeInTheDocument();

    // Both source tags render as inline <code> elements.
    const codes = Array.from(document.querySelectorAll('code'))
      .map((c) => c.textContent);
    expect(codes).toContain('critic');
    expect(codes).toContain('coach');
  });

  it('skips the coach section when its message contains a banned word', () => {
    const ids = makeIds();
    const base = startSession(A, ids, NOW);
    const step = currentStep(base);

    const withPraise = attachCoach(base, step.id, {
      message: 'Great job, keep going!',
    });

    render(<AuditPanel session={withPraise as Session} step={step} />);

    const codes = Array.from(document.querySelectorAll('code'))
      .map((c) => c.textContent);
    expect(codes).not.toContain('coach');
  });

  it('still renders when no agent output is attached', () => {
    const ids = makeIds();
    const base = startSession(A, ids, NOW);
    const step = currentStep(base);
    render(<AuditPanel session={base} step={step} />);

    const codes = Array.from(document.querySelectorAll('code'))
      .map((c) => c.textContent);
    expect(codes).not.toContain('critic');
    expect(codes).not.toContain('coach');
  });
});
