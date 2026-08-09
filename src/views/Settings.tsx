import React, { useEffect, useRef } from 'react';
import { COPY } from '../copy';
import { clearHistory } from '../adapters/history';

export interface SettingsProps {
  readonly onClose: () => void;
  readonly onClearSession: () => void;
  readonly onHistoryChange?: () => void;
}

const VERSION: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

export const Settings: React.FC<SettingsProps> = ({ onClose, onClearSession, onHistoryChange }) => {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const doClearHistory = () => {
    clearHistory();
    onHistoryChange?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
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
        <h2 id="settings-title" style={{ marginTop: 0 }}>{COPY.settingsTitle}</h2>

        <section style={{ marginTop: 16 }}>
          <div className="controls" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={doClearHistory}>{COPY.settingsClearHistory}</button>
            <button type="button" onClick={onClearSession}>{COPY.settingsClearSession}</button>
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{COPY.settingsAbout}</h3>
          <p style={{ marginTop: 8, color: 'var(--ink-soft)' }}>{COPY.settingsAboutBody}</p>
          <p style={{ margin: 0 }}>
            <a href="./README.md" rel="noopener">{COPY.settingsAboutLink}</a>
          </p>
        </section>

        <section style={{ marginTop: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{COPY.settingsShortcuts}</h3>
          <p style={{ marginTop: 8, color: 'var(--ink-soft)' }}>{COPY.shortcuts}</p>
        </section>

        <p style={{ marginTop: 24, color: 'var(--ink-faint)', fontSize: 14 }}>
          {COPY.settingsVersion.replace('{v}', VERSION)}
        </p>

        <div className="controls" style={{ marginTop: 16 }}>
          <button ref={closeRef} type="button" onClick={onClose}>{COPY.settingsClose}</button>
        </div>
      </div>
    </div>
  );
};
