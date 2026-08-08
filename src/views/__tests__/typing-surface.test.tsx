import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StepView } from '../StepView';
import type { Session, Step } from '../../core/types';
import { checkAtomicity } from '../../core/atomicity';

const makeStep = (text: string, seconds = 30, id = 'x'): Step => ({
  id, text, seconds, depth: 1, parentId: 'root',
  check: checkAtomicity(text, seconds), source: 'rules',
});

const makeSession = (step: Step): Session => ({
  id: 'sess', assignment: 'test', createdAt: 'now',
  steps: [{ ...step, id: 'root', parentId: null, depth: 0 }, step],
  cursor: step.id, done: [], timings: {}, typed: {},
});

describe('typing surface', () => {
  it('renders a textarea for a type-mode step', () => {
    const step = makeStep('Type the title. Nothing else.');
    render(<StepView session={makeSession(step)} step={step}
      onDone={() => {}} onSmaller={() => {}} onBack={() => {}}
      onFirstInput={() => {}} onTypedChange={() => {}} />);
    const areas = document.querySelectorAll('textarea');
    expect(areas.length).toBe(1);
  });

  it('does not render a textarea for a physical-mode step', () => {
    const step = makeStep('Open your laptop.');
    render(<StepView session={makeSession(step)} step={step}
      onDone={() => {}} onSmaller={() => {}} onBack={() => {}}
      onFirstInput={() => {}} onTypedChange={() => {}} />);
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('fires onFirstInput once on first character', () => {
    const step = makeStep('Type the title. Nothing else.');
    const onFirstInput = vi.fn();
    render(<StepView session={makeSession(step)} step={step}
      onDone={() => {}} onSmaller={() => {}} onBack={() => {}}
      onFirstInput={onFirstInput} onTypedChange={() => {}} />);
    const ta = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: 'H' } });
    fireEvent.change(ta, { target: { value: 'He' } });
    fireEvent.change(ta, { target: { value: 'Hel' } });
    expect(onFirstInput).toHaveBeenCalledTimes(1);
  });

  it('the textarea autofocuses', () => {
    const step = makeStep('Type the title. Nothing else.');
    render(<StepView session={makeSession(step)} step={step}
      onDone={() => {}} onSmaller={() => {}} onBack={() => {}}
      onFirstInput={() => {}} onTypedChange={() => {}} />);
    expect(document.activeElement?.tagName).toBe('TEXTAREA');
  });

  it('typing does not change the visible step', () => {
    const step = makeStep('Type the title. Nothing else.');
    render(<StepView session={makeSession(step)} step={step}
      onDone={() => {}} onSmaller={() => {}} onBack={() => {}}
      onFirstInput={() => {}} onTypedChange={() => {}} />);
    const ta = document.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: 'anything' } });
    expect(screen.getByText('Type the title. Nothing else.')).toBeInTheDocument();
  });
});
