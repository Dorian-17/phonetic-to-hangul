import type { BasicInfo, BasicInfoFormState, FanMood, KoreanLevel } from '../types';

const FAN_MOODS: { value: FanMood; label: string }[] = [
  { value: 'sweet', label: '🍬 Sweet' },
  { value: 'passionate', label: '🔥 Passionate' },
  { value: 'shy', label: '🫣 Shy' },
  { value: 'funny', label: '😆 Funny' },
  { value: 'cool', label: '😎 Cool' },
];

const KOREAN_LEVELS: { value: KoreanLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const REQUIRED_FIELDS: { key: keyof BasicInfo; label: string }[] = [
  { key: 'englishName', label: 'English Name' },
  { key: 'country', label: 'Country / Region' },
  { key: 'fanMood', label: 'Fan Mood' },
  { key: 'koreanLevel', label: 'Korean Level' },
];

export function renderBasicInfoForm(
  container: HTMLElement,
  initial: BasicInfo,
  onChange: (state: BasicInfoFormState) => void,
  onSubmit: (info: BasicInfo) => void,
): void {
  container.innerHTML = '';

  // Internal mutable copy — we emit immutable snapshots via onChange
  const state: BasicInfo = { ...initial };

  const form = document.createElement('form');
  form.className = 'basic-info-form';
  form.setAttribute('novalidate', '');

  // Track which fields have been touched (for showing errors after blur/submit)
  const touched: Set<keyof BasicInfo> = new Set();

  // ── English Name ──────────────────────────────────────────────────────
  const nameGroup = makeFieldGroup('English Name', true);
  const nameInput = makeTextInput('basic-name', 'e.g. Michael, Victoria…', state.englishName);
  nameInput.addEventListener('input', () => {
    state.englishName = nameInput.value.trim();
    touched.add('englishName');
    emit();
    renderErrors();
  });
  nameGroup.appendChild(nameInput);
  form.appendChild(nameGroup);

  // ── Country / Region ──────────────────────────────────────────────────
  const countryGroup = makeFieldGroup('Country / Region', true);
  const countryInput = makeTextInput('basic-country', 'e.g. United States, Japan…', state.country);
  countryInput.addEventListener('input', () => {
    state.country = countryInput.value.trim();
    touched.add('country');
    emit();
    renderErrors();
  });
  countryGroup.appendChild(countryInput);
  form.appendChild(countryGroup);

  // ── Favorite Artist / Idol ────────────────────────────────────────────
  const artistGroup = makeFieldGroup('Favorite Artist / Idol', false);
  const artistInput = makeTextInput('basic-artist', 'e.g. BTS, Taylor Swift…', state.favoriteArtist);
  artistInput.addEventListener('input', () => {
    state.favoriteArtist = artistInput.value.trim();
    emit();
  });
  artistGroup.appendChild(artistInput);
  form.appendChild(artistGroup);

  // ── Fan Mood ──────────────────────────────────────────────────────────
  const moodGroup = makeFieldGroup('Fan Mood', true);
  const moodSelect = makeSelect('basic-mood', FAN_MOODS, state.fanMood);
  moodSelect.addEventListener('change', () => {
    state.fanMood = moodSelect.value as FanMood | '';
    touched.add('fanMood');
    emit();
    renderErrors();
  });
  moodGroup.appendChild(moodSelect);
  form.appendChild(moodGroup);

  // ── Korean Level ──────────────────────────────────────────────────────
  const levelGroup = makeFieldGroup('Korean Level', true);
  const levelSelect = makeSelect('basic-level', KOREAN_LEVELS, state.koreanLevel);
  levelSelect.addEventListener('change', () => {
    state.koreanLevel = levelSelect.value as KoreanLevel | '';
    touched.add('koreanLevel');
    emit();
    renderErrors();
  });
  levelGroup.appendChild(levelSelect);
  form.appendChild(levelGroup);

  // ── Error list ────────────────────────────────────────────────────────
  const errorContainer = document.createElement('div');
  errorContainer.className = 'form-error-list';
  errorContainer.setAttribute('aria-live', 'polite');
  form.appendChild(errorContainer);

  // ── Next button ───────────────────────────────────────────────────────
  const nextBtn = document.createElement('button');
  nextBtn.type = 'submit';
  nextBtn.className = 'form-submit';
  nextBtn.textContent = 'Next →';
  form.appendChild(nextBtn);

  // ── Submit ────────────────────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Mark all required fields as touched on submit attempt
    REQUIRED_FIELDS.forEach((f) => touched.add(f.key));

    if (!isValid(state)) {
      renderErrors();
      return;
    }

    onSubmit({ ...state });
  });

  container.appendChild(form);

  // ── Emit initial state ────────────────────────────────────────────────
  emit();

  // Focus first input
  requestAnimationFrame(() => nameInput.focus());

  // ── Helpers (closed over form state) ──────────────────────────────────

  function emit(): void {
    onChange({ basicInfo: { ...state }, isValid: isValid(state) });
  }

  function renderErrors(): void {
    const errors = getErrors(state, touched);
    if (errors.length > 0) {
      errorContainer.textContent = errors.join('\n');
      errorContainer.classList.add('visible');
    } else {
      errorContainer.textContent = '';
      errorContainer.classList.remove('visible');
    }
  }
}

// ── Validation ────────────────────────────────────────────────────────────

export function isValid(info: BasicInfo): boolean {
  return getErrors(info, new Set(['englishName', 'country', 'fanMood', 'koreanLevel'])).length === 0;
}

function getErrors(info: BasicInfo, touched: Set<keyof BasicInfo>): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (touched.has(field.key) && !info[field.key]) {
      errors.push(`• ${field.label} is required`);
    }
  }

  return errors;
}

// ── DOM helpers ───────────────────────────────────────────────────────────

function makeFieldGroup(label: string, required: boolean): HTMLElement {
  const group = document.createElement('div');
  group.className = 'form-group';

  const labelEl = document.createElement('label');
  labelEl.className = 'form-label';
  labelEl.textContent = label;

  if (required) {
    const asterisk = document.createElement('span');
    asterisk.className = 'required-mark';
    asterisk.textContent = ' *';
    labelEl.appendChild(asterisk);
  }

  group.appendChild(labelEl);
  return group;
}

function makeTextInput(id: string, placeholder: string, value: string): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.className = 'form-input';
  input.placeholder = placeholder;
  input.value = value;
  input.autocomplete = 'off';
  input.spellcheck = false;
  return input;
}

function makeSelect(
  id: string,
  options: { value: string; label: string }[],
  selectedValue: string,
): HTMLSelectElement {
  const select = document.createElement('select');
  select.id = id;
  select.className = 'form-select';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '— Select —';
  placeholder.disabled = true;
  select.appendChild(placeholder);

  for (const opt of options) {
    const optionEl = document.createElement('option');
    optionEl.value = opt.value;
    optionEl.textContent = opt.label;
    if (opt.value === selectedValue) {
      optionEl.selected = true;
    }
    select.appendChild(optionEl);
  }

  return select;
}
