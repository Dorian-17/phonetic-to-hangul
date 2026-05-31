import type { BasicInfo, KoreanNameProfile } from '../types';
import { renderDecomposition } from './decomposition';
import { transliterate } from '../engine/index';

export function renderKoreanNameStep(
  container: HTMLElement,
  profile: KoreanNameProfile,
  basicInfo: BasicInfo,
  onBack: () => void,
  onNext: () => void,
): void {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'korean-name-wrapper';

  // ── Hero ──────────────────────────────────────────────────────────────
  const hero = document.createElement('div');
  hero.className = 'korean-name-hero';

  const hangulEl = document.createElement('div');
  hangulEl.className = 'korean-name-display';
  hangulEl.textContent = profile.koreanName;
  hero.appendChild(hangulEl);

  // Source badge
  const sourceBadge = document.createElement('span');
  sourceBadge.className = 'korean-source-badge';
  sourceBadge.textContent = profile.source === 'cmu' ? 'CMU Dictionary' : 'Rule-based';
  sourceBadge.title = profile.source === 'cmu'
    ? 'Generated using the CMU Pronouncing Dictionary'
    : 'Generated using rule-based fallback';
  hero.appendChild(sourceBadge);

  wrapper.appendChild(hero);

  // ── Card body ─────────────────────────────────────────────────────────
  const card = document.createElement('div');
  card.className = 'korean-name-card';

  // Loading state
  if (profile.isLoading) {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'korean-loading';
    loadingEl.textContent = 'Loading pronunciation dictionary…';
    card.appendChild(loadingEl);
    wrapper.appendChild(card);
    container.appendChild(wrapper);
    return;
  }

  // Error banner
  if (profile.errorMessage) {
    const errorEl = document.createElement('div');
    errorEl.className = 'korean-error-banner';
    errorEl.textContent = profile.errorMessage;
    card.appendChild(errorEl);
  }

  // Romanization
  const romanEl = document.createElement('div');
  romanEl.className = 'korean-roman';
  romanEl.textContent = profile.romanization;
  card.appendChild(romanEl);

  // Original name
  const originalEl = document.createElement('div');
  originalEl.className = 'korean-original';
  originalEl.textContent = `← ${profile.originalName}`;
  card.appendChild(originalEl);

  // Identity keyword
  const keywordEl = document.createElement('span');
  keywordEl.className = 'identity-badge';
  keywordEl.textContent = profile.identityKeyword;
  card.appendChild(keywordEl);

  // Mood description
  const moodEl = document.createElement('p');
  moodEl.className = 'mood-description';
  moodEl.textContent = profile.moodDescription;
  card.appendChild(moodEl);

  // Pronunciation breakdown (when data is available)
  if (profile.pronunciationData && profile.pronunciationData.phonemes.length > 0) {
    const pronSection = document.createElement('details');
    pronSection.className = 'pronunciation-details';

    const pronSummary = document.createElement('summary');
    pronSummary.className = 'pronunciation-summary';
    pronSummary.textContent = '🔊 Pronunciation';
    pronSection.appendChild(pronSummary);

    const pronBody = document.createElement('div');
    pronBody.className = 'pronunciation-body';

    // ARPAbet
    pronBody.appendChild(
      makePronunciationRow('ARPAbet', profile.pronunciationData.phonemes, 'arpabet'),
    );
    // IPA
    pronBody.appendChild(
      makePronunciationRow('IPA', profile.pronunciationData.ipa, 'ipa'),
    );

    pronSection.appendChild(pronBody);
    card.appendChild(pronSection);
  }

  // Summary tags
  const tagsRow = document.createElement('div');
  tagsRow.className = 'profile-tags';

  const tags: string[] = [
    `👤 ${basicInfo.englishName}`,
    `📍 ${basicInfo.country}`,
  ];
  if (basicInfo.favoriteArtist) {
    tags.push(`🎤 ${basicInfo.favoriteArtist}`);
  }
  tags.push(`❤️ ${basicInfo.fanMood}`);

  for (const text of tags) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = text;
    tagsRow.appendChild(tag);
  }
  card.appendChild(tagsRow);

  // Decomposition (collapsed)
  const details = document.createElement('details');
  details.className = 'decomp-details';

  const summary = document.createElement('summary');
  summary.className = 'decomp-summary';
  summary.textContent = '🔍 How your Korean name is made';
  details.appendChild(summary);

  const decompContainer = document.createElement('div');
  decompContainer.className = 'decomp-inner';
  details.appendChild(decompContainer);

  card.appendChild(details);

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'form-submit';
  nextBtn.textContent = '💬 Express Yourself →';
  nextBtn.addEventListener('click', onNext);
  card.appendChild(nextBtn);

  // Back button
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'back-btn';
  backBtn.textContent = '← Try another name';
  backBtn.addEventListener('click', onBack);
  card.appendChild(backBtn);

  wrapper.appendChild(card);
  container.appendChild(wrapper);

  // Async: render the full decomposition inside the collapsed section
  requestAnimationFrame(() => {
    renderDecomposition(transliterate(profile.originalName), decompContainer);
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────

function makePronunciationRow(
  label: string,
  items: string[],
  variant: 'arpabet' | 'ipa',
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'pronunciation-row';

  const labelEl = document.createElement('span');
  labelEl.className = 'pronunciation-label';
  labelEl.textContent = label;
  row.appendChild(labelEl);

  const chips = document.createElement('div');
  chips.className = 'pronunciation-chips';
  for (const item of items) {
    const chip = document.createElement('span');
    chip.className = `pronunciation-chip ${variant}`;
    chip.textContent = item;
    chips.appendChild(chip);
  }
  row.appendChild(chips);

  return row;
}
