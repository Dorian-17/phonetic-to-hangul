import type { TransliterationResult } from '../engine/index';

export function renderDecomposition(
  result: TransliterationResult,
  container: HTMLElement,
): void {
  container.innerHTML = '';

  if (!result.input) {
    const hint = document.createElement('p');
    hint.className = 'empty-hint';
    hint.textContent = 'Start typing a name above';
    container.appendChild(hint);
    return;
  }

  // ── Step 1: ARPAbet phonemes ────────────────────────────────────────────
  const step1 = makeSection('1', 'Step 1 — ARPAbet Phonemes');
  const phonemeRow = makeRow();

  result.phonemes.forEach((p, idx) => {
    const isConsonant = !isVowelArpabet(p);
    const cell = makeCell(isConsonant ? 'token-consonant' : 'token-vowel');

    const label = document.createElement('span');
    label.className = 'arpabet';
    label.textContent = p;

    const ipa = document.createElement('span');
    ipa.className = 'ipa-label';
    ipa.textContent = result.ipa[idx] ?? '';

    cell.appendChild(label);
    cell.appendChild(ipa);
    phonemeRow.appendChild(cell);
  });

  step1.appendChild(phonemeRow);

  // ── Step 2: Jamo tokens ─────────────────────────────────────────────────
  const arrow1 = makeArrow();
  const step2 = makeSection('2', 'Step 2 — Jamo Tokens');
  const jamoRow = makeRow();

  result.jamoTokens.forEach(tok => {
    const cell = makeCell(tok.type === 'C' ? 'token-consonant' : 'token-vowel');
    const ch = document.createElement('span');
    ch.className = 'jamo-char';
    ch.textContent = tok.jamo;
    cell.appendChild(ch);
    jamoRow.appendChild(cell);
  });

  step2.appendChild(jamoRow);

  // ── Step 3: Syllable blocks ─────────────────────────────────────────────
  const arrow2 = makeArrow();
  const step3 = makeSection('3', 'Step 3 — Syllable Blocks');
  const sylRow = makeRow();

  result.syllables.forEach(syl => {
    const chip = document.createElement('div');
    chip.className = 'syllable-chip';

    const ch = document.createElement('span');
    ch.className = 'syllable-char';
    ch.textContent = syl.char;

    const breakdown = document.createElement('span');
    breakdown.className = 'syllable-jamo';
    breakdown.textContent = syl.cho + syl.jung + (syl.jong || '');

    chip.appendChild(ch);
    chip.appendChild(breakdown);
    sylRow.appendChild(chip);
  });

  step3.appendChild(sylRow);

  // ── Final output ────────────────────────────────────────────────────────
  const outputSection = document.createElement('div');
  outputSection.className = 'output-section';

  const outputEl = document.createElement('div');
  outputEl.id = 'hangul-output';
  outputEl.textContent = result.hangul;
  outputSection.appendChild(outputEl);

  if (result.source === 'rule') {
    const badge = document.createElement('div');
    badge.className = 'source-badge';
    badge.textContent = 'rule-based (not in CMU dictionary)';
    outputSection.appendChild(badge);
  }

  container.append(step1, arrow1, step2, arrow2, step3, outputSection);
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function makeSection(stepNum: string, label: string): HTMLElement {
  const section = document.createElement('div');
  section.className = 'decomp-section';

  const labelRow = document.createElement('div');
  labelRow.className = 'section-label';

  const badge = document.createElement('span');
  badge.className = 'step-badge';
  badge.textContent = stepNum;

  const heading = document.createElement('h3');
  heading.textContent = label;

  labelRow.appendChild(badge);
  labelRow.appendChild(heading);
  section.appendChild(labelRow);
  return section;
}

function makeRow(): HTMLElement {
  const row = document.createElement('div');
  row.className = 'token-row';
  return row;
}

function makeCell(extraClass?: string): HTMLElement {
  const cell = document.createElement('div');
  cell.className = 'token-cell' + (extraClass ? ' ' + extraClass : '');
  return cell;
}

function makeArrow(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'step-arrow';
  div.textContent = '↓';
  return div;
}

// ARPAbet vowel phoneme codes
const VOWEL_CODES = new Set([
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY',
  'EH', 'ER', 'EY',
  'IH', 'IY',
  'OW', 'OY',
  'UH', 'UW',
]);

function isVowelArpabet(p: string): boolean {
  return VOWEL_CODES.has(p);
}
