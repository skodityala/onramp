import React, { useEffect, useMemo, useState } from 'react';
import { COPY } from '../copy';
import type { Session } from '../core/types';
import { medianTimeToStart } from '../core/timing';
import { startedCount } from '../core/session';
import { shareUrl } from '../adapters/link';
import { generateQRCode, available as qrAvailable } from '../adapters/qr';
import { ShareDialog } from './ShareDialog';

export const Finish: React.FC<{ session: Session; onRestart: () => void }> = ({ session, onRestart }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const count = startedCount(session);
  const median = medianTimeToStart(session);

  const link = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return shareUrl(window.location.origin, window.location.pathname, session.assignment);
  }, [session.assignment]);

  useEffect(() => {
    let cancelled = false;
    if (!qrAvailable() || !link) return;
    generateQRCode(link)
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { /* silently render nothing */ });
    return () => { cancelled = true; };
  }, [link]);

  const startedLine =
    count === 0 ? null
    : count === 1 ? COPY.finishStartedOnce
    : COPY.finishStartedMany.replace('{n}', String(count));

  const medianLine = median !== null
    ? COPY.finishMedian.replace('{n}', String(Math.round(median / 1000)))
    : null;

  const openShare = () => setShareOpen(true);

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
        <button onClick={openShare}>{COPY.finishSend}</button>
      </div>
      {qrDataUrl && (
        <figure style={{ marginTop: 24, textAlign: 'center' }}>
          <img src={qrDataUrl} alt={COPY.qrAlt} aria-label={COPY.qrAlt} width={180} height={180} />
          <figcaption style={{ marginTop: 8, color: 'var(--ink-faint)', fontSize: 14 }}>
            {COPY.qrHeading}
          </figcaption>
        </figure>
      )}
      {shareOpen && (
        <ShareDialog
          url={link}
          qrDataUrl={qrDataUrl}
          onClose={() => setShareOpen(false)}
        />
      )}
    </main>
  );
};
