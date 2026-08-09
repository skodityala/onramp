import React, { useEffect, useRef, useState } from 'react';
import { COPY, EXAMPLES } from '../copy';
import { voiceAvailable, startVoice, type VoiceSession } from '../adapters/voice';

export const Start: React.FC<{ onBegin: (assignment: string) => void }> = ({ onBegin }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const sessionRef = useRef<VoiceSession | null>(null);
  const finalRef = useRef('');
  const canUseVoice = voiceAvailable();

  useEffect(() => () => {
    // Cleanup on unmount.
    try { sessionRef.current?.abort(); } catch { /* ignore */ }
    sessionRef.current = null;
  }, []);

  const submit = () => {
    if (!text.trim()) { setError(COPY.errorEmpty); return; }
    setError('');
    onBegin(text);
  };

  const startListening = () => {
    if (listening) return;
    finalRef.current = text;
    const s = startVoice({
      onInterim: (interim) => {
        const base = finalRef.current;
        setText(base ? `${base} ${interim}`.trim() : interim);
      },
      onFinal: (finalText) => {
        const base = finalRef.current;
        const merged = base ? `${base} ${finalText}`.trim() : finalText;
        finalRef.current = merged;
        setText(merged);
      },
      onError: () => {
        setListening(false);
        sessionRef.current = null;
      },
      onEnd: () => {
        setListening(false);
        sessionRef.current = null;
      },
    });
    if (s) {
      sessionRef.current = s;
      setListening(true);
    }
  };

  const stopListening = () => {
    try { sessionRef.current?.stop(); } catch { /* ignore */ }
    sessionRef.current = null;
    setListening(false);
  };

  return (
    <main className="wrap center-screen">
      <h1 style={{ fontSize: 32, margin: 0 }}>{COPY.appTitle}</h1>
      <p style={{ color: 'var(--ink-faint)', marginTop: 8 }}>{COPY.tagline}</p>
      <label htmlFor="task" style={{ marginTop: 40, display: 'block', fontSize: 22 }}>
        {COPY.startLabel}
      </label>
      <textarea
        id="task"
        value={text}
        placeholder={COPY.startPlaceholder}
        onChange={(e) => setText(e.target.value)}
        style={{ marginTop: 14 }}
      />
      {canUseVoice && (
        <div className="controls" style={{ marginTop: 10 }}>
          {!listening ? (
            <button type="button" onClick={startListening}>
              {COPY.voiceStart}
            </button>
          ) : (
            <>
              <button type="button" onClick={stopListening}>
                {COPY.voiceStop}
              </button>
              <span role="status" aria-live="polite" className="voice-listening">
                {COPY.voiceListening}
              </span>
            </>
          )}
        </div>
      )}
      {error && <p role="alert" className="error">{error}</p>}
      <button className="control-primary" style={{ marginTop: 18 }} onClick={submit}>
        {COPY.startCta}
      </button>
      <p style={{ marginTop: 40, color: 'var(--ink-faint)', fontSize: 16 }}>
        {COPY.startExamplesLabel}
      </p>
      <div className="controls" style={{ marginTop: 10 }}>
        {EXAMPLES.map((ex) => (
          <button key={ex} className="example-chip" onClick={() => setText(ex)}>{ex}</button>
        ))}
      </div>
    </main>
  );
};
