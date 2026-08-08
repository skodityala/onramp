import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StepView } from '../StepView';
import { makeIds } from '../../core/types';
import { startSession, currentStep } from '../../core/session';

const A = 'Read chapter 7 and take notes';
const NOW = '2026-08-08T00:00:00.000Z';

describe('keyboard shortcuts', () => {
  const setup = () => {
    const session = startSession(A, makeIds(), NOW);
    const onDone = vi.fn();
    const onSmaller = vi.fn();
    render(
      <StepView session={session} step={currentStep(session)}
        onDone={onDone} onSmaller={onSmaller} onBack={() => {}}
        onFirstInput={() => {}} onTypedChange={() => {}} />,
    );
    return { onDone, onSmaller };
  };

  it('D triggers done', () => {
    const { onDone } = setup();
    fireEvent.keyDown(window, { key: 'd' });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('S triggers smaller', () => {
    const { onSmaller } = setup();
    fireEvent.keyDown(window, { key: 's' });
    expect(onSmaller).toHaveBeenCalledTimes(1);
  });

  it('W toggles the audit panel', () => {
    setup();
    fireEvent.keyDown(window, { key: 'w' });
    expect(screen.getByText(/decides when a step is small enough/i)).toBeInTheDocument();
  });

  it('is case insensitive', () => {
    const { onDone } = setup();
    fireEvent.keyDown(window, { key: 'D' });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
