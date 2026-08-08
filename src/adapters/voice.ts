/**
 * Voice input adapter using the Web Speech API.
 *
 * Feature-detected; on browsers without SpeechRecognition, `available()`
 * returns false and every other method is a safe no-op. Never throws.
 *
 * Design notes:
 * - Interim results are surfaced via the callback so the UI can show a
 *   live transcript.
 * - Errors are surfaced via `onError`, not thrown.
 * - Language defaults to the browser's `navigator.language`; a caller can
 *   override for other locales.
 */

// TS lib.dom does not include SpeechRecognition. Declare the minimal shape.
interface SpeechRecognitionAlternative { transcript: string; confidence: number }
interface SpeechRecognitionResult { readonly length: number; item(i: number): SpeechRecognitionAlternative; [i: number]: SpeechRecognitionAlternative; isFinal: boolean }
interface SpeechRecognitionResultList { readonly length: number; item(i: number): SpeechRecognitionResult; [i: number]: SpeechRecognitionResult }
interface SpeechRecognitionEvent extends Event { readonly resultIndex: number; readonly results: SpeechRecognitionResultList }
interface SpeechRecognitionErrorEvent extends Event { readonly error: string; readonly message: string }
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

const getCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const voiceAvailable = (): boolean => getCtor() !== null;

export interface VoiceOptions {
  language?: string;
  onInterim?: (transcript: string) => void;
  onFinal?: (transcript: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}

export interface VoiceSession {
  stop(): void;
  abort(): void;
}

/** Start a voice recognition session. Returns null if unavailable. */
export const startVoice = (opts: VoiceOptions = {}): VoiceSession | null => {
  const Ctor = getCtor();
  if (!Ctor) {
    opts.onError?.('voice input not available in this browser');
    return null;
  }
  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = opts.language ??
    (typeof navigator !== 'undefined' ? navigator.language : 'en-US');

  rec.onresult = (e) => {
    let interim = '';
    let final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]!;
      const alt = r.item(0);
      if (r.isFinal) final += alt.transcript;
      else interim += alt.transcript;
    }
    if (interim && opts.onInterim) opts.onInterim(interim);
    if (final && opts.onFinal) opts.onFinal(final);
  };
  rec.onerror = (e) => { opts.onError?.(e.error || 'unknown voice error'); };
  rec.onend = () => { opts.onEnd?.(); };

  try {
    rec.start();
  } catch (err) {
    opts.onError?.(`could not start: ${(err as Error).message}`);
    return null;
  }

  return {
    stop: () => rec.stop(),
    abort: () => rec.abort(),
  };
};
