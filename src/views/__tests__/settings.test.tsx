import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Settings } from '../Settings';
import { saveHistoryEntry, loadHistory } from '../../adapters/history';
import { COPY } from '../../copy';

describe('Settings view', () => {
  beforeEach(() => {
    try { localStorage.clear(); } catch { /* ignore */ }
  });

  it('shows Clear history and Clear session buttons', () => {
    render(
      <Settings
        onClose={() => {}}
        onClearSession={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: COPY.settingsClearHistory })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: COPY.settingsClearSession })).toBeInTheDocument();
  });

  it('clicking Clear history empties stored history', () => {
    saveHistoryEntry({
      id: 'a', assignmentExcerpt: 'x', createdAt: 'now',
      startedCount: 0, medianMs: null, finished: false,
    });
    saveHistoryEntry({
      id: 'b', assignmentExcerpt: 'y', createdAt: 'now',
      startedCount: 0, medianMs: null, finished: false,
    });
    expect(loadHistory()).toHaveLength(2);

    const onHistoryChange = vi.fn();
    render(
      <Settings
        onClose={() => {}}
        onClearSession={() => {}}
        onHistoryChange={onHistoryChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: COPY.settingsClearHistory }));
    expect(loadHistory()).toEqual([]);
    expect(onHistoryChange).toHaveBeenCalled();
  });

  it('clicking Clear session invokes the callback', () => {
    const onClearSession = vi.fn();
    render(
      <Settings
        onClose={() => {}}
        onClearSession={onClearSession}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: COPY.settingsClearSession }));
    expect(onClearSession).toHaveBeenCalled();
  });

  it('renders the About section and version line', () => {
    render(
      <Settings
        onClose={() => {}}
        onClearSession={() => {}}
      />,
    );
    expect(screen.getByText(COPY.settingsAbout)).toBeInTheDocument();
    expect(screen.getByText(/Version /)).toBeInTheDocument();
  });
});
