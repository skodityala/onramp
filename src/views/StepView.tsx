import React, { useEffect, useRef, useState } from 'react';
import { COPY } from '../copy';
import type { Session, Step } from '../core/types';
import { modeOf } from '../core/mode';
import { AuditPanel } from './AuditPanel';

interface Props {
  session: Session;
  step: Step;
  onDone: () => void;
  onSmaller: () => void;
  onBack: () => void;
  onFirstInput: () => void;
  onTypedChange: (text: string) => void;
}

const duration = (s: number): string => {
  const unit = s < 90 ? 'seconds' : 'minutes';
  const n = s < 90 ? s : Math.round(s / 60);
  return COPY.stepDuration.replace('{n}', String(n)).replace('{unit}', unit);
};

export const StepView: React.FC<Props> = ({
  session, step, onDone, onSmaller, onBack, onFirstInput, onTypedChange,
}) => {
  const [showAudit, setShowAudit] = useState(false);
  const mode = modeOf(step.text);
  const timing = session.timings[step.id];
  const started = Boolean(timing && timing.msToFirstInput !== null);
  const typedForStep = session.typed[step.id] ?? '';
  const firedFirstInput = useRef(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { setShowAudit(false); firedFirstInput.current = false; }, [step.id]);

  // Ensure focus lands in the typing surface under jsdom (autoFocus is unreliable there).
  useEffect(() => {
    if (mode === 'type' && taRef.current) {
      taRef.current.focus();
    }
  }, [step.id, mode]);

  // Keyboard: D done, S smaller, W why. Ignore when typing in an input.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA)$/.test(t.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'd') { e.preventDefault(); onDone(); }
      else if (k === 's') { e.preventDefault(); onSmaller(); }
      else if (k === 'w') { e.preventDefault(); setShowAudit((v) => !v); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone, onSmaller]);

  const onTypedInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!firedFirstInput.current && e.target.value.length > 0) {
      firedFirstInput.current = true;
      onFirstInput();
    }
    onTypedChange(e.target.value);
  };

  return (
    <main className="wrap center-screen">
      <section className="step-card" role="status" aria-live="polite" key={step.id}>
        <p className="step-text">{step.text}</p>
        <p className="step-duration" data-started={started ? 'true' : 'false'}>
          {started ? COPY.stepStarted : duration(step.seconds)}
        </p>
        {mode === 'type' && (
          <textarea
            ref={taRef}
            className="type-surface"
            aria-label={step.text}
            autoFocus
            value={typedForStep}
            onChange={onTypedInput}
          />
        )}
      </section>

      <div className="controls">
        <button className="control-primary" onClick={onDone}>
          {started ? COPY.stepDoneNext : COPY.stepDone}
        </button>
        <button onClick={onSmaller}>{COPY.stepSmaller}</button>
        <button aria-expanded={showAudit} onClick={() => setShowAudit((v) => !v)}>
          {showAudit ? COPY.stepWhyClose : COPY.stepWhy}
        </button>
      </div>

      {showAudit && <AuditPanel session={session} step={step} />}

      {step.parentId && (
        <button className="back-link" onClick={onBack}>{COPY.stepBack}</button>
      )}
      <p className="shortcuts">{COPY.shortcuts}</p>
    </main>
  );
};
