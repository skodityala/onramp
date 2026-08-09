import React, { useState } from 'react';
import { COPY } from '../copy';
import { loadHistory, clearHistory, type HistoryEntry } from '../adapters/history';

export interface HistoryProps {
  readonly onBack: () => void;
  readonly onResume: (entry: HistoryEntry) => void;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString();
  } catch { return iso; }
}

function startedLabel(n: number): string {
  if (n === 1) return COPY.historyStartedOnce;
  return COPY.historyStartedMany.replace('{n}', String(n));
}

export const History: React.FC<HistoryProps> = ({ onBack, onResume }) => {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory());

  const removeOne = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    // Persist by clearing and rewriting.
    try {
      clearHistory();
      // Reinsert in original order (newest first already).
      // Use saveHistoryEntry from oldest to newest so newest ends first.
      if (next.length > 0) {
        localStorage.setItem('onramp.history.v1', JSON.stringify(next));
      }
    } catch { /* ignore */ }
  };

  return (
    <main className="wrap center-screen">
      <h1 style={{ fontSize: 28, margin: 0 }}>{COPY.historyTitle}</h1>

      {entries.length === 0 ? (
        <p style={{ marginTop: 24, color: 'var(--ink-faint)' }}>{COPY.historyEmpty}</p>
      ) : (
        <ul
          aria-label={COPY.historyTitle}
          style={{
            listStyle: 'none', padding: 0, marginTop: 24, width: '100%', maxWidth: 640,
          }}
        >
          {entries.map((e) => {
            const excerpt = e.assignmentExcerpt.length > 60
              ? `${e.assignmentExcerpt.slice(0, 60)}...`
              : e.assignmentExcerpt;
            return (
              <li
                key={e.id}
                style={{
                  display: 'flex', gap: 12, alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid var(--ink-faint, #ccc)',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color: 'var(--ink-faint)', fontSize: 14, minWidth: 90 }}>
                  {formatDate(e.createdAt)}
                </span>
                <span style={{ flex: 1, minWidth: 180 }}>{excerpt}</span>
                <span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
                  {startedLabel(e.startedCount)}
                </span>
                <span style={{ color: 'var(--ink-faint)', fontSize: 14 }}>
                  {e.finished ? COPY.historyFinished : COPY.historyUnfinished}
                </span>
                <span className="controls" style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => onResume(e)}>
                    {COPY.historyResume}
                  </button>
                  <button type="button" onClick={() => removeOne(e.id)}>
                    {COPY.historyDelete}
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="controls" style={{ marginTop: 32 }}>
        <button type="button" onClick={onBack}>{COPY.historyBack}</button>
      </div>
    </main>
  );
};
