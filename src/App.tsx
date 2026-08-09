import React, { useCallback, useEffect, useRef, useState } from 'react';
import { COPY } from './copy';
import { makeIds } from './core/types';
import type { Ids, Session } from './core/types';
import {
  currentStep, goBack, goSmaller, isFinished, markDone, startedCount, startSession,
} from './core/session';
import { medianTimeToStart, recordDone, recordFirstInput, setTyped } from './core/timing';
import { loadSession, saveSession, clearSession } from './adapters/storage';
import { readAssignmentFromHash } from './adapters/link';
import { loadHistory, saveHistoryEntry, toEntry, type HistoryEntry } from './adapters/history';
import {
  registerServiceWorker, canInstall, promptInstall, subscribeInstallAvailable,
} from './adapters/pwa';
import { Start } from './views/Start';
import { StepView } from './views/StepView';
import { Finish } from './views/Finish';
import { Settings } from './views/Settings';
import { History } from './views/History';

type View = 'start' | 'step' | 'finish' | 'history';

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export const App: React.FC = () => {
  const ids = useRef<Ids>(makeIds());
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<View>('start');
  const appearedAt = useRef<{ id: string; at: number }>({ id: '', at: 0 });
  const [spacing, setSpacing] = useState<'normal' | 'wide'>('normal');
  const [font, setFont] = useState<'sans' | 'mono'>('sans');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState<number>(() => {
    try { return loadHistory().length; } catch { return 0; }
  });
  const finishRecorded = useRef<string | null>(null);
  const [installVisible, setInstallVisible] = useState<boolean>(() => {
    try { return canInstall(); } catch { return false; }
  });
  const [installDismissed, setInstallDismissed] = useState(false);

  // Toggles applied to <html>.
  useEffect(() => {
    if (spacing === 'wide') document.documentElement.setAttribute('data-spacing', 'wide');
    else document.documentElement.removeAttribute('data-spacing');
  }, [spacing]);
  useEffect(() => {
    if (font === 'mono') document.documentElement.setAttribute('data-font', 'mono');
    else document.documentElement.removeAttribute('data-font');
  }, [font]);

  // Register service worker + subscribe to install prompt.
  useEffect(() => {
    try { registerServiceWorker(); } catch { /* silent */ }
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = subscribeInstallAvailable(() => {
        setInstallVisible(true);
      });
    } catch { /* silent */ }
    return () => { try { unsubscribe?.(); } catch { /* ignore */ } };
  }, []);

  // Init: shared link wins over saved session.
  useEffect(() => {
    const shared = typeof window !== 'undefined'
      ? readAssignmentFromHash(window.location.hash)
      : null;
    if (shared) {
      const s = startSession(shared, ids.current, new Date().toISOString());
      setSession(s);
      setView(isFinished(s) ? 'finish' : 'step');
      appearedAt.current = { id: s.cursor, at: now() };
      // Clear the hash so a refresh doesn't restart forever.
      try { history.replaceState(null, '', window.location.pathname); } catch { /* ignore */ }
      return;
    }
    const saved = loadSession();
    if (saved) {
      setSession(saved);
      setView(isFinished(saved) ? 'finish' : 'step');
      appearedAt.current = { id: saved.cursor, at: now() };
    }
  }, []);

  useEffect(() => { if (session) saveSession(session); }, [session]);

  // Track cursor changes to reset the "step appeared at" clock.
  useEffect(() => {
    if (session && session.cursor !== appearedAt.current.id) {
      appearedAt.current = { id: session.cursor, at: now() };
    }
  }, [session?.cursor]);

  // Record history entry when a session finishes (once per session id).
  useEffect(() => {
    if (!session) return;
    if (!isFinished(session)) return;
    if (finishRecorded.current === session.id) return;
    finishRecorded.current = session.id;
    try {
      saveHistoryEntry(toEntry(session, true, medianTimeToStart(session), startedCount(session)));
      setHistoryCount(loadHistory().length);
    } catch { /* ignore */ }
  }, [session]);

  const begin = useCallback((assignment: string) => {
    const s = startSession(assignment, ids.current, new Date().toISOString());
    setSession(s);
    setView('step');
    appearedAt.current = { id: s.cursor, at: now() };
  }, []);

  const onDone = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const delta = Math.max(0, now() - appearedAt.current.at);
      const timed = recordDone(prev, prev.cursor, delta);
      const next = markDone(timed);
      if (isFinished(next)) setView('finish');
      return next;
    });
  }, []);

  const onSmaller = useCallback(() => {
    setSession((prev) => (prev ? goSmaller(prev, ids.current) : prev));
  }, []);

  const onBack = useCallback(() => {
    setSession((prev) => (prev ? goBack(prev) : prev));
  }, []);

  const onFirstInput = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const delta = Math.max(0, now() - appearedAt.current.at);
      return recordFirstInput(prev, prev.cursor, delta);
    });
  }, []);

  const onTypedChange = useCallback((text: string) => {
    setSession((prev) => (prev ? setTyped(prev, prev.cursor, text) : prev));
  }, []);

  const restart = useCallback(() => {
    clearSession();
    setSession(null);
    setView('start');
    finishRecorded.current = null;
  }, []);

  const toggleSpacing = useCallback(() => {
    setSpacing((v) => (v === 'wide' ? 'normal' : 'wide'));
  }, []);
  const toggleFont = useCallback(() => {
    setFont((v) => (v === 'mono' ? 'sans' : 'mono'));
  }, []);

  const doInstall = useCallback(async () => {
    try {
      await promptInstall();
    } catch { /* silent */ }
    setInstallVisible(false);
    setInstallDismissed(true);
  }, []);

  const dismissInstall = useCallback(() => {
    setInstallVisible(false);
    setInstallDismissed(true);
  }, []);

  const openHistory = useCallback(() => setView('history'), []);
  const closeHistory = useCallback(() => {
    setView(session ? (isFinished(session) ? 'finish' : 'step') : 'start');
  }, [session]);

  const resumeFromHistory = useCallback((entry: HistoryEntry) => {
    const s = startSession(entry.assignmentExcerpt, ids.current, new Date().toISOString());
    setSession(s);
    setView(isFinished(s) ? 'finish' : 'step');
    appearedAt.current = { id: s.cursor, at: now() };
    finishRecorded.current = null;
  }, []);

  const showInstallBanner = installVisible && !installDismissed;

  const installBanner = showInstallBanner ? (
    <div role="dialog" aria-labelledby="install-title" className="install-banner">
      <h2 id="install-title" style={{ margin: 0, fontSize: 16 }}>{COPY.installTitle}</h2>
      <div className="controls" style={{ marginTop: 8 }}>
        <button type="button" onClick={doInstall}>{COPY.installCta}</button>
        <button type="button" onClick={dismissInstall}>{COPY.installDismiss}</button>
      </div>
    </div>
  ) : null;

  const toggles = (
    <div className="toggles" role="group" aria-label="display options">
      <button
        type="button"
        onClick={toggleSpacing}
        aria-pressed={spacing === 'wide'}
      >{COPY.toggleSpacing}</button>
      <button
        type="button"
        onClick={toggleFont}
        aria-pressed={font === 'mono'}
      >{COPY.toggleFont}</button>
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label={COPY.settingsOpen}
        title={COPY.settingsOpen}
      >{'\u2699'}</button>
    </div>
  );

  const settingsModal = settingsOpen ? (
    <Settings
      onClose={() => setSettingsOpen(false)}
      onClearSession={() => {
        clearSession();
        setSession(null);
        setView('start');
        finishRecorded.current = null;
        setSettingsOpen(false);
      }}
      onHistoryChange={() => {
        try { setHistoryCount(loadHistory().length); } catch { setHistoryCount(0); }
      }}
    />
  ) : null;

  if (view === 'history') {
    return (
      <>
        {installBanner}
        {toggles}
        <History onBack={closeHistory} onResume={resumeFromHistory} />
        {settingsModal}
      </>
    );
  }

  if (view === 'start' || !session) {
    return (
      <>
        {installBanner}
        {toggles}
        <Start onBegin={begin} />
        {historyCount > 0 && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              type="button"
              onClick={openHistory}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--ink-faint)', textDecoration: 'underline',
                cursor: 'pointer', fontSize: 14, padding: 4,
              }}
            >{COPY.historyLink}</button>
          </div>
        )}
        {settingsModal}
      </>
    );
  }
  if (view === 'finish') {
    return (
      <>
        {installBanner}
        {toggles}
        <Finish session={session} onRestart={restart} />
        {settingsModal}
      </>
    );
  }
  return (
    <>
      {installBanner}
      {toggles}
      <StepView
        session={session}
        step={currentStep(session)}
        onDone={onDone}
        onSmaller={onSmaller}
        onBack={onBack}
        onFirstInput={onFirstInput}
        onTypedChange={onTypedChange}
      />
      {settingsModal}
    </>
  );
};
