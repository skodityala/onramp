import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { startVoice, voiceAvailable } from '../voice';

describe('voice adapter (no SpeechRecognition available)', () => {
  beforeEach(() => {
    // jsdom does not provide SpeechRecognition; ensure clean slate.
    const w = window as unknown as Record<string, unknown>;
    delete w.SpeechRecognition;
    delete w.webkitSpeechRecognition;
  });

  it('voiceAvailable returns false in jsdom', () => {
    expect(voiceAvailable()).toBe(false);
  });

  it('startVoice returns null when unavailable', () => {
    expect(startVoice()).toBeNull();
  });

  it('startVoice calls onError when unavailable', () => {
    const onError = vi.fn();
    const s = startVoice({ onError });
    expect(s).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toMatch(/not available/i);
  });
});

describe('voice adapter (mocked SpeechRecognition)', () => {
  class FakeRec {
    continuous = false;
    interimResults = false;
    lang = '';
    onresult: unknown = null;
    onerror: unknown = null;
    onend: unknown = null;
    started = false;
    stopped = false;
    aborted = false;
    start() { this.started = true; }
    stop() { this.stopped = true; }
    abort() { this.aborted = true; }
  }

  beforeEach(() => {
    (window as unknown as Record<string, unknown>).SpeechRecognition = FakeRec;
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;
  });

  it('voiceAvailable returns true when the constructor is present', () => {
    expect(voiceAvailable()).toBe(true);
  });

  it('startVoice returns a session with stop and abort methods', () => {
    const s = startVoice();
    expect(s).not.toBeNull();
    expect(typeof s!.stop).toBe('function');
    expect(typeof s!.abort).toBe('function');
    s!.stop();
    s!.abort();
  });

  it('startVoice honours a language override', () => {
    // Capture the created instance by patching start.
    let captured: FakeRec | null = null;
    class Cap extends FakeRec {
      override start() { captured = this; super.start(); }
    }
    (window as unknown as Record<string, unknown>).SpeechRecognition = Cap;
    startVoice({ language: 'fr-FR' });
    expect(captured).not.toBeNull();
    expect(captured!.lang).toBe('fr-FR');
    expect(captured!.continuous).toBe(true);
    expect(captured!.interimResults).toBe(true);
  });
});
