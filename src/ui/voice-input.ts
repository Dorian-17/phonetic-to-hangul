import type { VoiceInputResult } from '../types';

// ── SpeechRecognition constructor (browser + webkit) ──────────────────────

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
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ── VoiceInput ────────────────────────────────────────────────────────────

export type ListeningState = 'idle' | 'listening' | 'error';

export interface VoiceInputCallbacks {
  onResult: (transcript: string) => void;
  onStateChange: (state: ListeningState) => void;
  onError: (message: string) => void;
}

export function createVoiceInput(): {
  isSupported: boolean;
  start: (callbacks: VoiceInputCallbacks) => void;
  stop: () => void;
} {
  const Ctor = getRecognitionCtor();
  let instance: SpeechRecognitionInstance | null = null;

  function start(callbacks: VoiceInputCallbacks): void {
    if (!Ctor) {
      callbacks.onError('Voice input is not supported in this browser.');
      return;
    }

    // Stop any existing session
    if (instance) {
      try { instance.abort(); } catch { /* ignore */ }
    }

    try {
      instance = new Ctor();
      instance.continuous = false;
      instance.interimResults = false;
      instance.lang = 'en-US';

      instance.onstart = () => {
        callbacks.onStateChange('listening');
      };

      instance.onend = () => {
        callbacks.onStateChange('idle');
      };

      instance.onerror = (event) => {
        const message = getErrorMessage(event.error);
        callbacks.onStateChange('error');
        callbacks.onError(message);
      };

      instance.onresult = (event) => {
        const result = event.results[event.resultIndex];
        if (result && result[0]) {
          callbacks.onResult(result[0].transcript);
        }
        callbacks.onStateChange('idle');
      };

      instance.start();
    } catch (err) {
      callbacks.onError('Could not start voice input. Please check your microphone permissions.');
    }
  }

  function stop(): void {
    if (instance) {
      try { instance.abort(); } catch { /* ignore */ }
      instance = null;
    }
  }

  return {
    isSupported: Ctor !== null,
    start,
    stop,
  };
}

// ── Error messages ────────────────────────────────────────────────────────

function getErrorMessage(error: string): string {
  switch (error) {
    case 'not-allowed':
      return 'Microphone access was denied. Please allow microphone access in your browser settings.';
    case 'no-speech':
      return 'No speech was detected. Please try again.';
    case 'audio-capture':
      return 'No microphone found. Please connect a microphone and try again.';
    case 'network':
      return 'A network error occurred. Please check your connection.';
    default:
      return 'Something went wrong with voice input. Please try again.';
  }
}
