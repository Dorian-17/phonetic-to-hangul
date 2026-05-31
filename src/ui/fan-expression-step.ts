import type { BasicInfo, ExpressionDraft, FanExpression, ExpressionVersion, ExpressionTone } from '../types';
import { generateFanExpression } from '../engine/fan-expression';
import { createVoiceInput } from './voice-input';
import type { ListeningState } from './voice-input';

/** Must be called before onViewFanPass — at least one version must be saved. */
function hasAnySaved(expression: FanExpression | null): boolean {
  return expression !== null && expression.saved.length > 0;
}

export function renderFanExpressionStep(
  container: HTMLElement,
  basicInfo: BasicInfo,
  existingExpression: FanExpression | null,
  draft: ExpressionDraft,
  onDraftChange: (draft: ExpressionDraft) => void,
  onBack: () => void,
  onGenerate: (expression: FanExpression) => void,
  onViewFanPass: () => void,
): void {
  container.innerHTML = '';

  const voice = createVoiceInput();

  // Internal mutable copy of the expression (initially null, restored from existing)
  let expression: FanExpression | null = existingExpression;

  // ── Card ──────────────────────────────────────────────────────────────
  const card = document.createElement('div');
  card.className = 'fan-expression-card';

  // Header
  const heading = document.createElement('h2');
  heading.className = 'expression-heading';
  heading.textContent = '💬 Express Yourself';
  card.appendChild(heading);

  const subtitle = document.createElement('p');
  subtitle.className = 'expression-subtitle';
  subtitle.textContent = 'What would you like to say at the fan sign event?';
  card.appendChild(subtitle);

  // ── Voice button + textarea row ───────────────────────────────────────
  const textareaRow = document.createElement('div');
  textareaRow.className = 'textarea-row';

  const textarea = document.createElement('textarea');
  textarea.className = 'expression-textarea';
  textarea.placeholder = 'e.g. I love your music so much, thank you for being my inspiration…';
  textarea.rows = 4;
  textarea.value = existingExpression ? existingExpression.userInput : draft.sourceInput;
  textarea.addEventListener('input', () => {
    draft.sourceInput = textarea.value.trim();
    draft.inputMode = 'manual';
    draft.errorMessage = null;
    onDraftChange({ ...draft });
  });
  textareaRow.appendChild(textarea);

  const voiceBtn = document.createElement('button');
  voiceBtn.type = 'button';
  voiceBtn.className = 'voice-btn';
  voiceBtn.setAttribute('aria-label', 'Voice input');
  voiceBtn.title = voice.isSupported ? 'Click to speak' : 'Voice input not supported in this browser';
  voiceBtn.textContent = '🎤';
  voiceBtn.disabled = !voice.isSupported;
  textareaRow.appendChild(voiceBtn);
  card.appendChild(textareaRow);

  // Voice status
  const voiceHint = document.createElement('div');
  voiceHint.className = 'voice-hint';
  voiceHint.setAttribute('aria-live', 'polite');
  card.appendChild(voiceHint);

  // Empty input hint
  const hintEl = document.createElement('div');
  hintEl.className = 'expression-hint';
  hintEl.setAttribute('aria-live', 'polite');
  card.appendChild(hintEl);

  // Generate button
  const generateBtn = document.createElement('button');
  generateBtn.type = 'button';
  generateBtn.className = 'expression-generate-btn';
  generateBtn.textContent = '✨ Generate Korean Expressions';
  card.appendChild(generateBtn);

  // ── Tone labels (must be before renderResult which uses them) ─────────
  const TONE_LABELS: Record<string, string> = { formal: 'Formal', natural: 'Natural', cute: 'Cute' };

  // ── Result area ───────────────────────────────────────────────────────
  const resultArea = document.createElement('div');
  resultArea.className = 'expression-result';
  resultArea.style.display = expression ? '' : 'none';
  card.appendChild(resultArea);

  // ── Save hint ─────────────────────────────────────────────────────────
  const saveHint = document.createElement('div');
  saveHint.className = 'expression-save-hint';
  saveHint.textContent = '💡 Save at least one expression to unlock the next step.';
  saveHint.style.display = expression ? '' : 'none';
  card.appendChild(saveHint);

  // ── Fan Pass button (locked until at least one expression saved) ──────
  const fanPassBtn = document.createElement('button');
  fanPassBtn.type = 'button';
  fanPassBtn.className = 'form-submit';
  fanPassBtn.textContent = '🎫 View Your Fan Pass';
  fanPassBtn.disabled = !hasAnySaved(expression);
  fanPassBtn.title = hasAnySaved(expression) ? '' : 'Save at least one expression to continue';
  fanPassBtn.addEventListener('click', () => {
    if (!hasAnySaved(expression)) return;
    onViewFanPass();
  });
  card.appendChild(fanPassBtn);

  // Back button
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'back-btn';
  backBtn.textContent = '← Back to your identity';
  backBtn.addEventListener('click', onBack);
  card.appendChild(backBtn);

  container.appendChild(card);

  // ── Render result cards + restore state ───────────────────────────────
  if (expression) {
    renderResult();
    if (hasAnySaved(expression)) {
      saveHint.style.display = 'none';
    }
  }

  // ── Voice handlers ────────────────────────────────────────────────────
  voiceBtn.addEventListener('click', () => {
    if (voiceBtn.classList.contains('listening')) {
      voice.stop();
      voiceBtn.classList.remove('listening');
      voiceBtn.textContent = '🎤';
      voiceHint.textContent = '';
      voiceHint.classList.remove('visible');
      return;
    }
    voiceHint.textContent = '';
    voiceHint.classList.remove('visible', 'error');
    voice.start({
      onResult: (transcript) => {
        const current = textarea.value.trim();
        textarea.value = current ? `${current} ${transcript}` : transcript;
        draft.sourceInput = textarea.value;
        draft.inputMode = 'voice';
        draft.errorMessage = null;
        onDraftChange({ ...draft });
        textarea.focus();
      },
      onStateChange: (state: ListeningState) => {
        if (state === 'listening') {
          voiceBtn.classList.add('listening');
          voiceBtn.textContent = '🔴';
          voiceHint.textContent = 'Listening… speak now';
          voiceHint.classList.add('visible');
        } else {
          voiceBtn.classList.remove('listening');
          voiceBtn.textContent = '🎤';
        }
      },
      onError: (message) => {
        draft.errorMessage = message;
        onDraftChange({ ...draft });
        voiceHint.textContent = message;
        voiceHint.classList.add('visible', 'error');
        voiceBtn.classList.remove('listening');
        voiceBtn.textContent = '🎤';
      },
    });
  });

  // ── Generate handler ──────────────────────────────────────────────────
  generateBtn.addEventListener('click', () => {
    const userInput = textarea.value.trim();
    if (!userInput) {
      hintEl.textContent = 'Please write something you\'d like to express first.';
      hintEl.classList.add('visible');
      return;
    }
    hintEl.textContent = '';
    hintEl.classList.remove('visible');

    expression = generateFanExpression({
      userInput,
      favoriteArtist: basicInfo.favoriteArtist,
      fanMood: basicInfo.fanMood,
      koreanLevel: basicInfo.koreanLevel,
    });
    onGenerate(expression);
    renderResult();
    fanPassBtn.disabled = true;
    fanPassBtn.title = 'Save at least one expression to continue';
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // ── Helpers ──────────────────────────────────────────────────────────

  function renderResult(): void {
    if (!expression) return;
    saveHint.style.display = ''; // Show until an expression is saved
    resultArea.innerHTML = '';
    resultArea.style.display = '';

    // Tone badge
    const toneEl = document.createElement('span');
    toneEl.className = 'tone-badge';
    toneEl.textContent = expression.toneLabel;
    resultArea.appendChild(toneEl);

    // Original text
    const originalBlock = document.createElement('div');
    originalBlock.className = 'expression-original';
    const originalLabel = document.createElement('span');
    originalLabel.className = 'expression-label';
    originalLabel.textContent = 'You said:';
    originalBlock.appendChild(originalLabel);
    const originalText = document.createElement('p');
    originalText.className = 'expression-original-text';
    originalText.textContent = `"${expression.userInput}"`;
    originalBlock.appendChild(originalText);
    resultArea.appendChild(originalBlock);

    // Three version cards
    const cards = document.createElement('div');
    cards.className = 'expression-version-cards';

    for (const v of expression.versions) {
      const vCard = buildVersionCard(v);
      cards.appendChild(vCard);
    }
    resultArea.appendChild(cards);
  }

  function buildVersionCard(v: ExpressionVersion): HTMLElement {
    const el = document.createElement('div');
    el.className = 'expression-version-card';

    // Header
    const header = document.createElement('div');
    header.className = 'expression-version-header';
    header.textContent = TONE_LABELS[v.tone] ?? v.tone;
    el.appendChild(header);

    // Korean
    const koreanEl = document.createElement('p');
    koreanEl.className = 'expression-version-korean';
    koreanEl.textContent = v.korean;
    el.appendChild(koreanEl);

    // English
    const englishEl = document.createElement('p');
    englishEl.className = 'expression-version-english';
    englishEl.textContent = v.english;
    el.appendChild(englishEl);

    // Pronunciation
    const pronLabel = document.createElement('span');
    pronLabel.className = 'expression-version-label';
    pronLabel.textContent = 'Pronunciation';
    el.appendChild(pronLabel);
    const pronEl = document.createElement('p');
    pronEl.className = 'expression-version-pron';
    pronEl.textContent = v.pronunciation;
    el.appendChild(pronEl);

    // Usage note
    const noteLabel = document.createElement('span');
    noteLabel.className = 'expression-version-label';
    noteLabel.textContent = 'When to use';
    el.appendChild(noteLabel);
    const noteEl = document.createElement('p');
    noteEl.className = 'expression-version-note';
    noteEl.textContent = v.usageNote;
    el.appendChild(noteEl);

    // Save button
    const isSaved = expression!.saved.includes(v.tone);
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = isSaved ? 'expression-save-btn saved' : 'expression-save-btn';
    saveBtn.textContent = isSaved ? '★ Saved' : '☆ Save';
    saveBtn.addEventListener('click', () => {
      if (expression!.saved.includes(v.tone)) {
        expression!.saved = expression!.saved.filter((t) => t !== v.tone);
      } else {
        expression!.saved = [...expression!.saved, v.tone];
      }
      // Re-render to update save button states and Fan Pass button
      renderResult();
      fanPassBtn.disabled = !hasAnySaved(expression);
      fanPassBtn.title = hasAnySaved(expression) ? '' : 'Save at least one expression to continue';
      saveHint.style.display = hasAnySaved(expression) ? 'none' : '';
    });
    el.appendChild(saveBtn);

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '📋 Copy';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(v.korean).catch(() => {});
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 1500);
    });
    el.appendChild(copyBtn);

    return el;
  }
}
