import React, { useEffect, useRef, useState } from 'react';
import { COPY } from '../copy';

export interface ShareDialogProps {
  readonly url: string;
  readonly qrDataUrl: string | null;
  readonly onClose: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ url, qrDataUrl, onClose }) => {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
      className="modal-backdrop"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-panel"
        style={{
          background: 'var(--paper, #fff)', color: 'var(--ink, #000)',
          padding: 24, maxWidth: 520, width: '90%', borderRadius: 6,
        }}
      >
        <h2 id="share-title" style={{ marginTop: 0 }}>{COPY.shareDialogTitle}</h2>

        <label htmlFor="share-url" style={{ display: 'block', marginTop: 12, fontSize: 14, color: 'var(--ink-soft)' }}>
          {COPY.shareDialogUrlLabel}
        </label>
        <input
          id="share-url"
          type="text"
          value={url}
          readOnly
          onFocus={(e) => e.currentTarget.select()}
          style={{ width: '100%', marginTop: 6, padding: 8, fontFamily: 'inherit' }}
        />

        <div className="controls" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button type="button" onClick={doCopy}>
            {copied ? COPY.shareDialogCopied : COPY.shareDialogCopy}
          </button>
        </div>

        {qrDataUrl && (
          <figure style={{ marginTop: 20, textAlign: 'center' }}>
            <img
              src={qrDataUrl}
              alt={COPY.qrAlt}
              aria-label={COPY.qrAlt}
              width={180}
              height={180}
            />
            <figcaption style={{ marginTop: 8, color: 'var(--ink-faint)', fontSize: 14 }}>
              {COPY.qrHeading}
            </figcaption>
          </figure>
        )}

        <p style={{ marginTop: 20, color: 'var(--ink-soft)', fontSize: 14 }}>
          {COPY.shareDialogNote}
        </p>

        <div className="controls" style={{ marginTop: 16 }}>
          <button ref={closeRef} type="button" onClick={onClose}>
            {COPY.shareDialogClose}
          </button>
        </div>
      </div>
    </div>
  );
};
