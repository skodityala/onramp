import React, { useCallback, useEffect, useRef, useState } from 'react';
import { COPY } from './copy';
import { makeIds } from './core/types';
import type { Ids, Session } from './core/types';
import {
  currentStep, goBack, goSmaller, isFinished, markDone, startSession,
} from './core/session';
import { recordDone, recordFirstInput, setTyped } from './core/timing';
import { loadSession, saveSession, clearSession } from './adapters/storage';
import { readAssignmentFromHash } from './adapters/link';
import { Start } from './views/Start';
import { StepView } from './views/StepView';
import { Finish } from './views/Finish';

type View = 'start' | 'step' | 'finish';

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export const App: React.FC = () => {
  const ids = useRef<Ids>(makeIds());
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<View>('start');
  const appearedAt = useRef<{ id: string; at: number }>({ id: '', at: 0 });
  const [spacing, setSpacing] = useState<'normal' | 'wide'>('normal');
  const [font, setFont] = useState<'sans' | 'mono'>('sans');

  // Toggles applied to <html>.
  useEffect(() => {
    if (spacing === 'wide') document.documentElement.setAttribute('data-spacing', 'wide');
    else document.documentElement.removeAttribute('data-spacing');
  }, [spacing]);
  useEffect(() => {
    if (font === 'mono') document.documentElement.setAttribute('data-font', 'mono');
    else document.documentElement.removeAttribute('data-font');
  }, [font]);

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
  }, []);

  const toggleSpacing = useCallback(() => {
    setSpacing((v) => (v === 'wide' ? 'normal' : 'wide'));
  }, []);
  const toggleFont = useCallback(() => {
    setFont((v) => (v === 'mono' ? 'sans' : 'mono'));
  }, []);

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
    </div>
  );

  if (view === 'start' || !session) {
    return <>{toggles}<Start onBegin={begin} /></>;
  }
  if (view === 'finish') {
    return <>{toggles}<Finish session={session} onRestart={restart} /></>;
  }
  return (
    <>
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
    </>
  );
};
