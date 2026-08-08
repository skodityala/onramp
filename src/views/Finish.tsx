import React, { useState } from 'react';
import { COPY } from '../copy';
import type { Session } from '../core/types';
import { medianTimeToStart } from '../core/timing';
import { startedCount } from '../core/session';
import { shareUrl } from '../adapters/link';

export const Finish: React.FC<{ session: Session; onRestart: () => void }> = ({ session, onRestart }) => {
  const [copied, setCopied] = useState(false);
  const count = startedCount(session);
  const median = medianTimeToStart(session);

  const startedLine =
    count === 0 ? null
    : count === 1 ? COPY.finishStartedOnce
    : COPY.finishStartedMany.replace('{n}', String(count));

  const medianLine = median !== null
    ? COPY.finishMedian.replace('{n}', String(Math.round(median / 1000)))
    : null;

  const send = async () => {
    try {
      const url = shareUrl(window.location.origin, window.location.pathname, session.assignment);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard may be unavailable; do nothing loud */ }
  };

  return (
    <main className="wrap center-screen">
      <p style={{
        fontSize: 34, lineHeight: 1.4, textAlign: 'center', maxWidth: '62ch', margin: 0,
      }}>{COPY.finishTitle}</p>
      {startedLine && (
        <p style={{ marginTop: 32, color: 'var(--ink-soft)', fontSize: 20 }}>
          {startedLine}
        </p>
      )}
      {medianLine && (
        <p style={{ marginTop: 8, color: 'var(--ink-faint)', fontSize: 16 }}>
          {medianLine}
        </p>
      )}
      <div className="controls" style={{ marginTop: 32 }}>
        <button className="control-primary" onClick={onRestart}>{COPY.finishCta}</button>
        <button onClick={send}>{copied ? COPY.finishSendCopied : COPY.finishSend}</button>
      </div>
    </main>
  );
};
