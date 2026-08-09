import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { History } from '../History';
import { saveHistoryEntry, type HistoryEntry } from '../../adapters/history';
import { COPY } from '../../copy';

const mk = (id: string, extra: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id,
  assignmentExcerpt: `task ${id}`,
  createdAt: '2024-06-01T10:00:00Z',
  startedCount: 1,
  medianMs: null,
  finished: false,
  ...extra,
});

describe('History view', () => {
  beforeEach(() => {
    try { localStorage.clear(); } catch { /* ignore */ }
  });

  it('renders all entries when history has data', () => {
    saveHistoryEntry(mk('a'));
    saveHistoryEntry(mk('b'));
    saveHistoryEntry(mk('c'));
    render(<History onBack={() => {}} onResume={() => {}} />);
    expect(screen.getByText(/task a/)).toBeInTheDocument();
    expect(screen.getByText(/task b/)).toBeInTheDocument();
    expect(screen.getByText(/task c/)).toBeInTheDocument();
    // Resume buttons for each row.
    expect(screen.getAllByRole('button', { name: COPY.historyResume })).toHaveLength(3);
  });

  it('renders the empty message when history is empty', () => {
    render(<History onBack={() => {}} onResume={() => {}} />);
    expect(screen.getByText(COPY.historyEmpty)).toBeInTheDocument();
  });

  it('contains no praise, streak, score or leaderboard wording', () => {
    saveHistoryEntry(mk('a'));
    saveHistoryEntry(mk('b'));
    const { container } = render(<History onBack={() => {}} onResume={() => {}} />);
    expect(container.textContent).not.toMatch(
      /great|well done|congrat|streak|score|badge|reward|leaderboard|level up|points/i,
    );
  });
});
