import type { IdentityCard } from '../types';

export function renderIdentityCardStep(
  container: HTMLElement,
  card: IdentityCard,
  onBack: () => void,
  onNext: () => void,
  onEditIdentity: () => void,
): void {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'identity-card-wrapper';

  // ── Card ──────────────────────────────────────────────────────────────
  const cardEl = document.createElement('div');
  cardEl.className = 'identity-fanpass';

  // Header
  const header = document.createElement('div');
  header.className = 'fanpass-header';
  header.innerHTML = `
    <span class="fanpass-logo">✦ KAZA</span>
    <span class="fanpass-badge">K-Identity Fan Pass</span>
  `;
  cardEl.appendChild(header);

  // Holo divider
  const divider = document.createElement('div');
  divider.className = 'fanpass-divider';
  cardEl.appendChild(divider);

  // Korean name (hero)
  const nameSection = document.createElement('div');
  nameSection.className = 'fanpass-name-section';

  const koreanNameEl = document.createElement('div');
  koreanNameEl.className = 'fanpass-korean';
  koreanNameEl.textContent = card.koreanName;
  nameSection.appendChild(koreanNameEl);

  const romanEl = document.createElement('div');
  romanEl.className = 'fanpass-roman';
  romanEl.textContent = card.englishName;
  nameSection.appendChild(romanEl);

  cardEl.appendChild(nameSection);

  // Identity type + keywords
  const identitySection = document.createElement('div');
  identitySection.className = 'fanpass-identity';

  const typeEl = document.createElement('div');
  typeEl.className = 'fanpass-type';
  typeEl.textContent = card.identityType;
  identitySection.appendChild(typeEl);

  const keywordsRow = document.createElement('div');
  keywordsRow.className = 'fanpass-keywords';
  for (const kw of card.identityKeywords) {
    const chip = document.createElement('span');
    chip.className = 'fanpass-keyword-chip';
    chip.textContent = kw;
    keywordsRow.appendChild(chip);
  }
  identitySection.appendChild(keywordsRow);

  cardEl.appendChild(identitySection);

  // Meta info
  const metaGrid = document.createElement('div');
  metaGrid.className = 'fanpass-meta';

  metaGrid.appendChild(makeMetaItem('Country', card.country));
  metaGrid.appendChild(makeMetaItem('Artist', card.favoriteArtist));
  metaGrid.appendChild(makeMetaItem('Mood', card.mood));
  metaGrid.appendChild(makeMetaItem('Card #', card.kazaId));

  cardEl.appendChild(metaGrid);

  // Representative sentence
  const sentenceSection = document.createElement('div');
  sentenceSection.className = 'fanpass-sentence';

  const sentenceLabel = document.createElement('div');
  sentenceLabel.className = 'fanpass-section-label';
  sentenceLabel.textContent = 'Fan Sign Message';
  sentenceSection.appendChild(sentenceLabel);

  const sentenceText = document.createElement('p');
  sentenceText.className = 'fanpass-sentence-text';
  sentenceText.textContent = `"${card.representativeSentence}"`;
  sentenceSection.appendChild(sentenceText);

  cardEl.appendChild(sentenceSection);

  // Footer
  const footer = document.createElement('div');
  footer.className = 'fanpass-footer';
  footer.textContent = `Issued ${card.createdAt}`;
  cardEl.appendChild(footer);

  wrapper.appendChild(cardEl);

  // ── Actions ───────────────────────────────────────────────────────────
  const actions = document.createElement('div');
  actions.className = 'identity-card-actions';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'form-submit';
  nextBtn.textContent = '✨ View Final Summary';
  nextBtn.addEventListener('click', onNext);
  actions.appendChild(nextBtn);

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'back-btn';
  editBtn.textContent = '✏️ Edit Identity';
  editBtn.addEventListener('click', onEditIdentity);
  actions.appendChild(editBtn);

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'back-btn';
  backBtn.textContent = '← Back';
  backBtn.addEventListener('click', onBack);
  actions.appendChild(backBtn);

  wrapper.appendChild(actions);
  container.appendChild(wrapper);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function makeMetaItem(label: string, value: string): HTMLElement {
  const item = document.createElement('div');
  item.className = 'fanpass-meta-item';

  const labelEl = document.createElement('span');
  labelEl.className = 'fanpass-meta-label';
  labelEl.textContent = label;
  item.appendChild(labelEl);

  const valueEl = document.createElement('span');
  valueEl.className = 'fanpass-meta-value';
  valueEl.textContent = value;
  item.appendChild(valueEl);

  return item;
}
