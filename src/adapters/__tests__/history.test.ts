import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadHistory, saveHistoryEntry, clearHistory, toEntry, type HistoryEntry,
} from '../history';
import type { Session } from '../../core/types';

const makeEntry = (id: string, extra: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id,
  assignmentExcerpt: `assignment ${id}`,
  createdAt: new Date().toISOString(),
  startedCount: 0,
  medianMs: null,
  finished: false,
  ...extra,
});

describe('history adapter', () => {
  beforeEach(() => {
    try { localStorage.clear(); } catch { /* ignore */ }
  });

  it('loadHistory with no data returns an empty array', () => {
    expect(loadHistory()).toEqual([]);
  });

  it('saveHistoryEntry then loadHistory round-trips', () => {
    const e = makeEntry('a');
    saveHistoryEntry(e);
    const loaded = loadHistory();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe('a');
    expect(loaded[0]?.assignmentExcerpt).toBe('assignment a');
  });

  it('caps at 20 entries and drops the oldest', () => {
    for (let i = 0; i < 25; i++) saveHistoryEntry(makeEntry(`e${i}`));
    const loaded = loadHistory();
    expect(loaded).toHaveLength(20);
    // Newest first: e24 must be first, and e0..e4 dropped.
    expect(loaded[0]?.id).toBe('e24');
    expect(loaded.find((x) => x.id === 'e0')).toBeUndefined();
    expect(loaded.find((x) => x.id === 'e4')).toBeUndefined();
    expect(loaded.find((x) => x.id === 'e5')).toBeDefined();
  });

  it('duplicate id replaces rather than appends', () => {
    saveHistoryEntry(makeEntry('same', { assignmentExcerpt: 'first' }));
    saveHistoryEntry(makeEntry('other'));
    saveHistoryEntry(makeEntry('same', { assignmentExcerpt: 'second' }));
    const loaded = loadHistory();
    const withSameId = loaded.filter((e) => e.id === 'same');
    expect(withSameId).toHaveLength(1);
    expect(withSameId[0]?.assignmentExcerpt).toBe('second');
    // Newly saved entry moves to front.
    expect(loaded[0]?.id).toBe('same');
  });

  it('clearHistory empties the store', () => {
    saveHistoryEntry(makeEntry('a'));
    saveHistoryEntry(makeEntry('b'));
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });

  it('toEntry excerpts assignment to at most 80 chars', () => {
    const long = 'x'.repeat(200);
    const session: Session = {
      id: 'sess1',
      assignment: long,
      createdAt: '2024-01-01T00:00:00Z',
      steps: [],
      cursor: '',
      done: [],
      timings: {},
      typed: {},
    };
    const entry = toEntry(session, false, null, 3);
    expect(entry.id).toBe('sess1');
    expect(entry.assignmentExcerpt.length).toBe(80);
    expect(entry.startedCount).toBe(3);
    expect(entry.finished).toBe(false);
  });
});
