/**
 * Session history. Private, per-device, gamification-free.
 *
 * Stores past sessions' minimal metadata (id, assignment excerpt, createdAt,
 * startedCount, isFinished flag, medianMs) so the user can find and resume a
 * past session. Does NOT store: gamification metrics, scores, comparisons,
 * or rankings.
 *
 * Cleared any time the user asks. Never transmitted anywhere.
 */

import type { Session } from '../core/types';

export interface HistoryEntry {
  readonly id: string;
  readonly assignmentExcerpt: string;  // first 80 chars
  readonly createdAt: string;
  readonly startedCount: number;
  readonly medianMs: number | null;
  readonly finished: boolean;
}

const KEY = 'onramp.history.v1';
const MAX_ENTRIES = 20;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch { return []; }
}

export function saveHistoryEntry(entry: HistoryEntry): void {
  try {
    const current = loadHistory();
    const without = current.filter((e) => e.id !== entry.id);
    const next = [entry, ...without].slice(0, MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

export function clearHistory(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function toEntry(session: Session, isFinished: boolean, medianMs: number | null, startedCount: number): HistoryEntry {
  return {
    id: session.id,
    assignmentExcerpt: session.assignment.slice(0, 80),
    createdAt: session.createdAt,
    startedCount,
    medianMs,
    finished: isFinished,
  };
}
