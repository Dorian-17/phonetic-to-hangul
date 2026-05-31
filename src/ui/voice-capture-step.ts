import type { VoiceCaptureState, VoiceInputMode } from '../types';
import { speechService } from '../engine/speech-service';
import { nameService } from '../engine/name-service';

export function renderVoiceCaptureStep(
  container: HTMLElement,
  state: VoiceCaptureState,
  onSubmit: (state: VoiceCaptureState) => void,
): void {
  container.innerHTML = '';

  // ── Internal mutable state ────────────────────────────────────────────
  let inputMode: VoiceInputMode | null = state.inputMode;
  let transcript = state.transcript;
  let detectedName: string | null = state.detectedName;
  let confidence: number | null = state.confidence;
  let errorMessage: string | null = state.errorMessage;

  function buildState(): VoiceCaptureState {
    return {
      inputMode,
      transcript,
      detectedName,
      confidence,
      isListening: false,
      errorMessage,
    };
  }

  // ── Card ──────────────────────────────────────────────────────────────
  const card = document.createElement('div');
  card.className = 'voice-capture-card';

  // ── Prompt ────────────────────────────────────────────────────────────
  card.appendChild(elem('p', 'voice-prompt', 'Please say your name naturally.'));

  // ── Record button ─────────────────────────────────────────────────────
  const recordRow = document.createElement('div');
  recordRow.className = 'voice-record-row';

  const recordBtn = document.createElement('button');
  recordBtn.type = 'button';
  recordBtn.className = 'voice-record-btn';
  recordBtn.setAttribute('aria-label', 'Record your name');
  recordBtn.textContent = '🎤';
  recordBtn.disabled = !speechService.isSupported;
  if (!speechService.isSupported) {
    recordBtn.title = 'Voice input is not supported — use the text input below';
  }

  const recordLabel = document.createElement('span');
  recordLabel.className = 'voice-record-label';
  recordLabel.textContent = speechService.isSupported ? 'Tap to record' : 'Voice not supported';
  recordRow.appendChild(recordBtn);
  recordRow.appendChild(recordLabel);
  card.appendChild(recordRow);

  // ── Status (listening indicator) ──────────────────────────────────────
  const statusEl = elem('div', 'voice-status');
  statusEl.setAttribute('aria-live', 'polite');
  card.appendChild(statusEl);

  // ── Error ─────────────────────────────────────────────────────────────
  const errorEl = elem('div', 'voice-error');
  errorEl.setAttribute('aria-live', 'assertive');
  if (errorMessage) {
    errorEl.textContent = errorMessage;
    errorEl.classList.add('visible');
  }
  card.appendChild(errorEl);

  // ── Raw transcript ────────────────────────────────────────────────────
  const transcriptEl = elem('div', 'voice-transcript');
  if (transcript) transcriptEl.classList.add('has-content');

  const transcriptLabel = elem('span', 'voice-transcript-label', 'Heard:');
  const transcriptText = elem('span', 'voice-transcript-text', transcript || '—');
  transcriptEl.appendChild(transcriptLabel);
  transcriptEl.appendChild(transcriptText);
  card.appendChild(transcriptEl);

  // ── Detected name ─────────────────────────────────────────────────────
  const nameRow = document.createElement('div');
  nameRow.className = 'voice-name-row';

  const nameLabel = document.createElement('label');
  nameLabel.className = 'voice-name-label';
  nameLabel.textContent = 'Your name:';
  nameLabel.htmlFor = 'voice-name-input';
  nameRow.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'voice-name-input';
  nameInput.className = 'form-input voice-name-input';
  nameInput.placeholder = 'e.g. Michael, Victoria…';
  nameInput.value = detectedName ?? transcript;
  nameInput.autocomplete = 'off';
  nameInput.spellcheck = false;

  if (confidence !== null) {
    const pct = Math.round(confidence * 100);
    const badge = document.createElement('span');
    badge.className = 'voice-confidence';
    badge.textContent = `${pct}%`;
    badge.title = 'Speech recognition confidence';
    nameRow.appendChild(badge);
  }

  nameInput.addEventListener('input', () => {
    detectedName = nameInput.value.trim();
    inputMode = inputMode === 'voice' ? 'voice' : 'manual';
    continueBtn.disabled = !detectedName;
    clearStatus();
  });
  nameRow.appendChild(nameInput);
  card.appendChild(nameRow);

  // ── Manual fallback ───────────────────────────────────────────────────
  const manualSection = document.createElement('div');
  manualSection.className = 'voice-manual';

  const manualLabel = document.createElement('label');
  manualLabel.className = 'voice-manual-label';
  manualLabel.textContent = 'Or type your name:';
  manualLabel.htmlFor = 'voice-manual-input';
  manualSection.appendChild(manualLabel);

  const manualInput = document.createElement('input');
  manualInput.type = 'text';
  manualInput.id = 'voice-manual-input';
  manualInput.className = 'form-input';
  manualInput.placeholder = 'e.g. Michael, Victoria…';
  manualInput.value = transcript;
  manualInput.autocomplete = 'off';
  manualInput.spellcheck = false;

  manualInput.addEventListener('input', () => {
    transcript = manualInput.value.trim();
    inputMode = 'manual';
    detectedName = transcript;
    confidence = null;
    transcriptText.textContent = transcript || '—';
    if (transcript) {
      transcriptEl.classList.add('has-content');
    } else {
      transcriptEl.classList.remove('has-content');
    }
    nameInput.value = transcript;
    continueBtn.disabled = !detectedName;
    clearStatus();
  });
  manualSection.appendChild(manualInput);
  card.appendChild(manualSection);

  // ── Continue ──────────────────────────────────────────────────────────
  const continueBtn = document.createElement('button');
  continueBtn.type = 'button';
  continueBtn.className = 'form-submit';
  continueBtn.textContent = 'Continue →';
  continueBtn.disabled = !detectedName && !transcript;
  continueBtn.addEventListener('click', () => {
    onSubmit(buildState());
  });
  card.appendChild(continueBtn);

  // If we already have a detected name from a previous visit, enable the button
  if (detectedName) {
    continueBtn.disabled = false;
  }

  container.appendChild(card);

  // ── Voice callbacks ───────────────────────────────────────────────────
  recordBtn.addEventListener('click', () => {
    if (recordBtn.classList.contains('listening')) return; // already listening

    errorEl.textContent = '';
    errorEl.classList.remove('visible');
    statusEl.textContent = 'Listening… speak now';
    statusEl.classList.add('visible');

    speechService.start({
      onStart: () => {
        recordBtn.classList.add('listening');
        recordBtn.textContent = '🔴';
        statusEl.textContent = 'Listening… speak now';
        statusEl.classList.add('visible');
      },
      onEnd: () => {
        recordBtn.classList.remove('listening');
        recordBtn.textContent = '🎤';
        statusEl.textContent = '';
        statusEl.classList.remove('visible');
      },
      onResult: (result) => {
        transcript = result.transcript;
        confidence = result.confidence;
        inputMode = 'voice';
        errorMessage = null;

        transcriptText.textContent = transcript;
        transcriptEl.classList.add('has-content');

        // Extract the name from the natural-language transcript
        const extraction = nameService.extractName(transcript);
        detectedName = extraction.name ?? transcript;
        nameInput.value = detectedName;

        // Show confidence badge
        if (confidence !== null) {
          const pct = Math.round(confidence * 100);
          const existing = nameRow.querySelector('.voice-confidence');
          if (existing) {
            existing.textContent = `${pct}%`;
          } else {
            const badge = document.createElement('span');
            badge.className = 'voice-confidence';
            badge.textContent = `${pct}%`;
            badge.title = 'Speech recognition confidence';
            nameRow.appendChild(badge);
          }
        }

        continueBtn.disabled = false;
        manualInput.value = transcript;
      },
      onError: (msg) => {
        errorMessage = msg;
        errorEl.textContent = msg;
        errorEl.classList.add('visible');
        statusEl.textContent = '';
        statusEl.classList.remove('visible');
        recordBtn.classList.remove('listening');
        recordBtn.textContent = '🎤';
      },
    });
  });

  // Focus manual input if voice is unsupported
  if (!speechService.isSupported) {
    requestAnimationFrame(() => manualInput.focus());
  }

  function clearStatus(): void {
    statusEl.textContent = '';
    statusEl.classList.remove('visible');
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
}

// ── Tiny helper ────────────────────────────────────────────────────────────
function elem(tag: string, className: string, text?: string): HTMLElement {
  const el = document.createElement(tag);
  el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
