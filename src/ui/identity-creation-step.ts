import type { IdentityTrait, IdentityProfile } from '../types';
import { ALL_TRAITS } from '../types';
import { identityService } from '../engine/identity-service';

export function renderIdentityCreationStep(
  container: HTMLElement,
  transcript: string | null,
  saved: IdentityProfile | null,
  onBack: () => void,
  onSubmit: (profile: IdentityProfile) => void,
): void {
  container.innerHTML = '';

  // Compute suggestions from voice transcript (deterministic)
  const suggestion = transcript
    ? identityService.suggestIdentity(transcript)
    : null;

  // Internal mutable selection
  let selected: IdentityTrait[] = saved?.selectedTraits ?? [];

  // ── Card ──────────────────────────────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.className = 'identity-creation-wrapper';

  const heading = document.createElement('h2');
  heading.className = 'expression-heading';
  heading.textContent = '✨ Your Fan Identity';
  wrapper.appendChild(heading);

  const subtitle = document.createElement('p');
  subtitle.className = 'expression-subtitle';
  subtitle.textContent = 'Choose traits that describe how you want to be seen.';
  wrapper.appendChild(subtitle);

  // ── Suggested traits (from voice) ─────────────────────────────────────
  if (suggestion) {
    const suggestCard = document.createElement('div');
    suggestCard.className = 'suggestion-card';

    const suggestTitle = document.createElement('div');
    suggestTitle.className = 'suggestion-title';
    suggestTitle.textContent = `🤖 AI Suggestion: ${suggestion.suggestedIdentityType}`;
    suggestCard.appendChild(suggestTitle);

    const scoresRow = document.createElement('div');
    scoresRow.className = 'suggestion-scores';
    for (const { trait, score } of suggestion.suggestedTraits) {
      const bar = document.createElement('div');
      bar.className = 'suggestion-bar';

      const label = document.createElement('span');
      label.className = 'suggestion-bar-label';
      label.textContent = trait;
      bar.appendChild(label);

      const fill = document.createElement('div');
      fill.className = 'suggestion-bar-fill';
      fill.style.width = `${score}%`;
      bar.appendChild(fill);

      const pct = document.createElement('span');
      pct.className = 'suggestion-bar-pct';
      pct.textContent = `${score}%`;
      bar.appendChild(pct);

      scoresRow.appendChild(bar);
    }
    suggestCard.appendChild(scoresRow);

    const acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.className = 'suggestion-accept-btn';
    acceptBtn.textContent = 'Accept Suggestion';
    acceptBtn.addEventListener('click', () => {
      selected = suggestion.suggestedTraits
        .filter((s) => s.score >= 30)
        .map((s) => s.trait);
      renderChips();
      updateContinue();
      updatePreview();
    });
    suggestCard.appendChild(acceptBtn);

    wrapper.appendChild(suggestCard);
  }

  // ── Trait selector ────────────────────────────────────────────────────
  const selectorSection = document.createElement('div');
  selectorSection.className = 'trait-selector';

  const selectorLabel = document.createElement('div');
  selectorLabel.className = 'trait-selector-label';
  selectorLabel.textContent = 'Select your traits:';
  selectorSection.appendChild(selectorLabel);

  const chipsRow = document.createElement('div');
  chipsRow.className = 'trait-chips';
  selectorSection.appendChild(chipsRow);

  function renderChips(): void {
    chipsRow.innerHTML = '';
    for (const trait of ALL_TRAITS) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'trait-chip';
      chip.textContent = trait;
      if (selected.includes(trait)) chip.classList.add('selected');

      chip.addEventListener('click', () => {
        if (selected.includes(trait)) {
          selected = selected.filter((t) => t !== trait);
        } else {
          selected = [...selected, trait];
        }
        renderChips();
        updateContinue();
        updatePreview();
      });

      chipsRow.appendChild(chip);
    }
  }

  renderChips();
  wrapper.appendChild(selectorSection);

  // ── Identity preview ──────────────────────────────────────────────────
  const preview = document.createElement('div');
  preview.className = 'identity-preview';
  preview.style.display = 'none';
  wrapper.appendChild(preview);

  function updatePreview(): void {
    if (selected.length === 0) {
      preview.style.display = 'none';
      return;
    }

    const profile = identityService.generateIdentityProfile(
      selected,
      suggestion?.suggestedTraits ?? [],
      suggestion?.suggestedIdentityType ?? null,
    );

    preview.style.display = '';
    preview.innerHTML = `
      <div class="identity-preview-type">${profile.identityType}</div>
      <div class="identity-preview-keywords">
        ${profile.identityKeywords.map((k) => `<span class="identity-keyword-tag">${k}</span>`).join('')}
      </div>
      <div class="identity-preview-mood">Mood: ${profile.mood}</div>
    `;
  }

  // Restore preview if returning with saved state
  if (saved?.selectedTraits && saved.selectedTraits.length > 0) {
    selected = [...saved.selectedTraits];
    renderChips();
    updatePreview();
  }

  // ── Error / hint ──────────────────────────────────────────────────────
  const errorEl = document.createElement('div');
  errorEl.className = 'expression-hint';
  errorEl.setAttribute('aria-live', 'polite');
  wrapper.appendChild(errorEl);

  // ── Continue ──────────────────────────────────────────────────────────
  const continueBtn = document.createElement('button');
  continueBtn.type = 'button';
  continueBtn.className = 'form-submit';
  continueBtn.textContent = 'Continue →';
  continueBtn.disabled = selected.length === 0;

  function updateContinue(): void {
    continueBtn.disabled = selected.length === 0;
    if (selected.length === 0) {
      errorEl.textContent = 'Please select at least one trait, or accept the AI suggestion.';
      errorEl.classList.add('visible');
    } else {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  continueBtn.addEventListener('click', () => {
    if (selected.length === 0) return;

    const profile = identityService.generateIdentityProfile(
      selected,
      suggestion?.suggestedTraits ?? [],
      suggestion?.suggestedIdentityType ?? null,
    );

    onSubmit(profile);
  });
  wrapper.appendChild(continueBtn);

  // ── Back ──────────────────────────────────────────────────────────────
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'back-btn';
  backBtn.textContent = '← Back to your Korean name';
  backBtn.addEventListener('click', onBack);
  wrapper.appendChild(backBtn);

  container.appendChild(wrapper);
}
