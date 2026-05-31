import type { SpeechResult } from '../types';

// ── Browser constructor detection ──────────────────────────────────────────

let _Ctor: SpeechRecognitionConstructor | null = null;
let _init = false;

function getCtor(): SpeechRecognitionConstructor | null {
  if (_init) return _Ctor;
  _init = true;
  const w = window as any;
  _Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
  return _Ctor;
}

// ── Internal interfaces ────────────────────────────────────────────────────

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// ── Public API ─────────────────────────────────────────────────────────────

export interface SpeechCallbacks {
  onStart: () => void;
  onEnd: () => void;
  onResult: (result: SpeechResult) => void;
  onError: (message: string) => void;
}

export const speechService = {
  get isSupported(): boolean {
    return getCtor() !== null;
  },

  start(callbacks: SpeechCallbacks): void {
    const C = getCtor();
    if (!C) {
      callbacks.onError(
        'Voice input is not supported in this browser. Please use the text input below.',
      );
      return;
    }

    try {
      const instance = new C();
      instance.continuous = false;
      instance.interimResults = false;
      instance.lang = 'en-US';

      instance.onstart = () => callbacks.onStart();
      instance.onend = () => callbacks.onEnd();

      instance.onerror = (event) => {
        const message = errorMessage(event.error);
        callbacks.onError(message);
      };

      instance.onresult = (event) => {
        const result = event.results[event.resultIndex];
        if (result && result[0]) {
          callbacks.onResult({
            transcript: result[0].transcript.trim(),
            confidence: result[0].confidence,
          });
        }
        callbacks.onEnd();
      };

      instance.start();
    } catch {
      callbacks.onError(
        'Could not access the microphone. Please check your device settings and try again.',
      );
    }
  },
};

// ── Error messages ────────────────────────────────────────────────────────

function errorMessage(error: string): string {
  switch (error) {
    case 'not-allowed':
      return 'Microphone access was denied. Please allow microphone access in your browser settings, or type your name below.';
    case 'no-speech':
      return 'No speech was detected. Please try again, or type your name below.';
    case 'audio-capture':
      return 'No microphone found. Please connect a microphone, or type your name below.';
    case 'network':
      return 'A network error occurred. Please check your connection and try again.';
    default:
      return 'Something went wrong with voice input. Please type your name below.';
  }
}
