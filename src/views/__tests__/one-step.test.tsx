import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StepView } from '../StepView';
import { makeIds } from '../../core/types';
import { startSession, currentStep } from '../../core/session';

const A = 'Write a 5 page essay on the causes of World War One, due Friday';
const NOW = '2026-08-08T00:00:00.000Z';

describe('the interface never shows more than one step', () => {
  it('renders exactly one step out of a full tree', () => {
    const ids = makeIds();
    const session = startSession(A, ids, NOW);
    expect(session.steps.length).toBeGreaterThan(5);
    const step = currentStep(session);
    render(
      <StepView
        session={session}
        step={step}
        onDone={() => {}}
        onSmaller={() => {}}
        onBack={() => {}}
        onFirstInput={() => {}}
        onTypedChange={() => {}}
      />,
    );
    expect(screen.getByText(step.text)).toBeInTheDocument();
    for (const other of session.steps) {
      if (other.id === step.id) continue;
      if (other.text.length < 15) continue;
      // Some trees contain steps whose text is identical to the current step
      // (e.g. a root/child pair with the same phrase). Skip those, they are
      // not "leaks" of a different step.
      if (other.text === step.text) continue;
      expect(screen.queryByText(other.text), `sibling leaked: ${other.text}`).not.toBeInTheDocument();
    }
  });

  it('renders no progress indicator', () => {
    const ids = makeIds();
    const session = startSession(A, ids, NOW);
    const { container } = render(
      <StepView session={session} step={currentStep(session)}
        onDone={() => {}} onSmaller={() => {}} onBack={() => {}}
        onFirstInput={() => {}} onTypedChange={() => {}} />,
    );
    expect(container.querySelector('progress')).toBeNull();
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
    expect(container.textContent).not.toMatch(/\d+\s*(of|\/)\s*\d+/);
  });

  it('announces the step politely, not assertively', () => {
    const ids = makeIds();
    const session = startSession(A, ids, NOW);
    render(<StepView session={session} step={currentStep(session)}
      onDone={() => {}} onSmaller={() => {}} onBack={() => {}}
      onFirstInput={() => {}} onTypedChange={() => {}} />);
    const live = document.querySelector('[aria-live]');
    expect(live?.getAttribute('aria-live')).toBe('polite');
    expect(live?.getAttribute('role')).toBe('status');
  });
});
