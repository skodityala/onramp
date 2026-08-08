import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Finish } from '../Finish';
import type { Session } from '../../core/types';

const baseSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'x', assignment: 'test', createdAt: 'now', steps: [], cursor: '',
  done: [], timings: {}, typed: {}, ...overrides,
});

describe('Finish', () => {
  it('renders "You started once." with one start', () => {
    const s = baseSession({ done: ['a'], timings: { a: { msToFirstInput: 3000, msToDone: 4000 } } });
    render(<Finish session={s} onRestart={() => {}} />);
    expect(screen.getByText(/you started once\./i)).toBeInTheDocument();
  });

  it('renders "You started 5 times." with 3 typed and 2 physical dones', () => {
    const s = baseSession({
      done: ['a', 'b', 'c', 'd', 'e'],
      timings: {
        a: { msToFirstInput: 3000, msToDone: 5000 },
        b: { msToFirstInput: 2000, msToDone: 4000 },
        c: { msToFirstInput: 1000, msToDone: 3000 },
      },
    });
    render(<Finish session={s} onRestart={() => {}} />);
    expect(screen.getByText(/you started 5 times\./i)).toBeInTheDocument();
  });

  it('renders the median line when timing data exists', () => {
    const s = baseSession({
      done: ['a'],
      timings: { a: { msToFirstInput: 11000, msToDone: 30000 } },
    });
    render(<Finish session={s} onRestart={() => {}} />);
    expect(screen.getByText(/about 11 seconds/i)).toBeInTheDocument();
  });

  it('has NO praise, streak, score or congratulations wording', () => {
    const s = baseSession({ done: ['a'], timings: { a: { msToFirstInput: 3000, msToDone: 4000 } } });
    const { container } = render(<Finish session={s} onRestart={() => {}} />);
    expect(container.textContent).not.toMatch(/great|well done|congrat|streak|score|badge|reward/i);
  });

  it('exposes both action buttons', () => {
    const s = baseSession();
    render(<Finish session={s} onRestart={() => {}} />);
    expect(screen.getByRole('button', { name: /start something else/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send this to someone/i })).toBeInTheDocument();
  });
});
