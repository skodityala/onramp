import React, { useState } from 'react';
import { COPY, EXAMPLES } from '../copy';

export const Start: React.FC<{ onBegin: (assignment: string) => void }> = ({ onBegin }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!text.trim()) { setError(COPY.errorEmpty); return; }
    setError('');
    onBegin(text);
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
