import { generateNameIdentity } from '../engine/name-identity';
import { loadDictionary } from '../engine/g2p';

const CHAR_REVEAL_STAGGER_MS = 90;
const LAUNCH_WAVE_MS = 980;
const TYPE_CLOUD_EDGE_PADDING = 32;
const TYPE_CLOUD_CONTENT_PADDING = 76;
const TYPE_CLOUD_CHAR_PADDING = 72;
const TYPE_CLOUD_MIN_DISTANCE = 150;
const TYPE_CLOUD_LIBRARY = [
  '하', '노', '수', '민', '서', '도', '윤', '지', '은', '우',
  '가', '나', '다', '라', '마', '바', '사', '아', '자', '차',
  '카', '타', '파', '혜', '빈', '준', '현', '유', '리', '솔',
  '별', '봄', '빛', '온', '설', '이', '안', '연', '재', '원',
  '희', '진', '주', '린', '율', '채', '고', '름', '시', '늘',
] as const;
const COMPOSITION_START_MS = 1320;
const COMPOSITION_STROKE_STAGGER_MS = 145;
const COMPOSITION_FINAL_MS = 900;
const PRONUNCIATION_AFTER_FINAL_MS = 240;
const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const JUNG_COUNT = 21;
const JONG_COUNT = 28;
const CHO_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'] as const;
const JUNG_LIST = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'] as const;
const JONG_LIST = ['', 'ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'] as const;
const VERTICAL_VOWELS = new Set(['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅘ','ㅙ','ㅚ','ㅝ','ㅞ','ㅟ','ㅢ','ㅣ']);
const SVG_NS = 'http://www.w3.org/2000/svg';

let repositionTypeCloud: (() => void) | null = null;

interface KeyDefinition {
  en: string;
  label?: string | readonly string[];
  ko?: string;
  units?: number;
  special?: boolean;
  space?: boolean;
  align?: 'start' | 'end' | 'center';
}

const KEYBOARD_ROWS: readonly (readonly KeyDefinition[])[] = [
  [
    { en: 'esc', label: 'esc', units: 1.55, special: true },
    { en: 'F1', label: ['☼', 'F1'], special: true },
    { en: 'F2', label: ['☀', 'F2'], special: true },
    { en: 'F3', label: ['icon:mission', 'F3'], special: true },
    { en: 'F4', label: ['icon:search', 'F4'], special: true },
    { en: 'F5', label: ['icon:mic', 'F5'], special: true },
    { en: 'F6', label: ['☾', 'F6'], special: true },
    { en: 'F7', label: ['◁◁', 'F7'], special: true },
    { en: 'F8', label: ['▷Ⅱ', 'F8'], special: true },
    { en: 'F9', label: ['▷▷', 'F9'], special: true },
    { en: 'F10', label: ['◁', 'F10'], special: true },
    { en: 'F11', label: ['◁)', 'F11'], special: true },
    { en: 'F12', label: ['◁))', 'F12'], special: true },
    { en: 'power', label: '', units: 1.25, special: true },
  ],
  [
    { en: '`', label: ['~', '₩'] },
    { en: '1', label: ['!', '1'] },
    { en: '2', label: ['@', '2'] },
    { en: '3', label: ['#', '3'] },
    { en: '4', label: ['$', '4'] },
    { en: '5', label: ['%', '5'] },
    { en: '6', label: ['^', '6'] },
    { en: '7', label: ['&', '7'] },
    { en: '8', label: ['*', '8'] },
    { en: '9', label: ['(', '9'] },
    { en: '0', label: [')', '0'] },
    { en: '-', label: ['_', '-'] },
    { en: '=', label: ['+', '='] },
    { en: 'delete', label: '⌫', units: 1.82, special: true, align: 'end' },
  ],
  [
    { en: 'tab', label: '⇥', units: 1.45, special: true, align: 'start' },
    { en: 'Q', ko: 'ㅂ' },
    { en: 'W', ko: 'ㅈ' },
    { en: 'E', ko: 'ㄷ' },
    { en: 'R', ko: 'ㄱ' },
    { en: 'T', ko: 'ㅅ' },
    { en: 'Y', ko: 'ㅛ' },
    { en: 'U', ko: 'ㅕ' },
    { en: 'I', ko: 'ㅑ' },
    { en: 'O', ko: 'ㅐ' },
    { en: 'P', ko: 'ㅔ' },
    { en: '[', label: ['{', '['] },
    { en: ']', label: ['}', ']'] },
    { en: '\\', label: ['|', '\\'], units: 1.25 },
  ],
  [
    { en: 'caps', label: ['•', '한/A'], units: 1.82, special: true, align: 'start' },
    { en: 'A', ko: 'ㅁ' },
    { en: 'S', ko: 'ㄴ' },
    { en: 'D', ko: 'ㅇ' },
    { en: 'F', ko: 'ㄹ' },
    { en: 'G', ko: 'ㅎ' },
    { en: 'H', ko: 'ㅗ' },
    { en: 'J', ko: 'ㅓ' },
    { en: 'K', ko: 'ㅏ' },
    { en: 'L', ko: 'ㅣ' },
    { en: ';', label: [':', ';'] },
    { en: '\'', label: ['"', '\''] },
    { en: 'return', label: '↩', units: 1.92, special: true, align: 'end' },
  ],
  [
    { en: 'shift', label: '⇧', units: 2.28, special: true, align: 'start' },
    { en: 'Z', ko: 'ㅋ' },
    { en: 'X', ko: 'ㅌ' },
    { en: 'C', ko: 'ㅊ' },
    { en: 'V', ko: 'ㅍ' },
    { en: 'B', ko: 'ㅠ' },
    { en: 'N', ko: 'ㅜ' },
    { en: 'M', ko: 'ㅡ' },
    { en: ',', label: ['<', ','] },
    { en: '.', label: ['>', '.'] },
    { en: '/', label: ['?', '/'] },
    { en: 'shift', label: '⇧', units: 2.5, special: true, align: 'end' },
  ],
  [
    { en: 'globe', label: '◎', units: 1.05, special: true, align: 'end' },
    { en: 'control', label: ['⌃', 'control'], units: 1.14, special: true, align: 'end' },
    { en: 'option', label: ['⌥', 'option'], units: 1.14, special: true, align: 'end' },
    { en: 'command', label: ['⌘', 'command'], units: 1.45, special: true, align: 'end' },
    { en: '', units: 6.0, special: true, space: true },
    { en: 'command', label: ['⌘', 'command'], units: 1.45, special: true, align: 'start' },
    { en: 'option', label: ['⌥', 'option'], units: 1.14, special: true, align: 'start' },
    { en: '◀', label: '◀', units: 1.14, special: true, align: 'center' },
    { en: 'vertical-arrows', label: ['▲', '▼'], units: 1.14, special: true, align: 'center' },
    { en: '▶', label: '▶', units: 1.14, special: true, align: 'center' },
  ],
];

type KeyboardMode = 'en' | 'ko';

interface LaunchExample {
  english: string;
  korean: string;
  koreanKeys: string[];
  koreanFrames: string[];
}

const LAUNCH_EXAMPLES: readonly LaunchExample[] = [
  { english: 'KaZa', korean: '가자', koreanKeys: ['ㄱ','ㅏ','ㅈ','ㅏ'], koreanFrames: ['ㄱ','가','가ㅈ','가자'] },
  { english: 'Michael', korean: '마이클', koreanKeys: ['ㅁ','ㅏ','ㅇ','ㅣ','ㅋ','ㅡ','ㄹ'], koreanFrames: ['ㅁ','마','마ㅇ','마이','마이ㅋ','마이크','마이클'] },
  { english: 'Emma', korean: '에마', koreanKeys: ['ㅇ','ㅔ','ㅁ','ㅏ'], koreanFrames: ['ㅇ','에','에ㅁ','에마'] },
  { english: 'Daniel', korean: '대녈', koreanKeys: ['ㄷ','ㅐ','ㄴ','ㅕ','ㄹ'], koreanFrames: ['ㄷ','대','대ㄴ','대녀','대녈'] },
];

export function initKazaExperience(): void {
  setupAutoTheme();
  setupHangulCursor();
  setupTypeCloud();

  const stageStart = document.getElementById('stage-start') as HTMLElement;
  const stageInput = document.getElementById('stage-input') as HTMLElement;
  const stageResult = document.getElementById('stage-result') as HTMLElement;
  const keyboardBg = document.getElementById('keyboard-bg') as HTMLElement;
  const launchCenter = document.getElementById('launch-center') as HTMLElement;
  const launchText = document.getElementById('launch-text') as HTMLElement;
  const editNameBtn = document.getElementById('edit-name-btn') as HTMLButtonElement;
  const input = document.getElementById('name-input') as HTMLInputElement;
  const btn = document.getElementById('generate-btn') as HTMLButtonElement;
  const hint = document.getElementById('generate-hint') as HTMLElement;

  const koreanEl = document.getElementById('korean-display') as HTMLElement;
  const compositionEl = document.getElementById('stroke-composition') as HTMLElement;
  const romanEl = document.getElementById('roman-display') as HTMLElement;
  const origEl = document.getElementById('original-display') as HTMLElement;
  const srcEl = document.getElementById('source-tag') as HTMLElement;

  const heroChips = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.example-chip[data-example-name]'),
  );

  let isGenerating = false;
  let currentKeyboardMode: KeyboardMode = 'en';
  let launchLoopToken = 0;
  let pronunciationTimer: number | null = null;

  function clearPronunciationTimer(): void {
    if (pronunciationTimer !== null) {
      window.clearTimeout(pronunciationTimer);
      pronunciationTimer = null;
    }
    window.speechSynthesis?.cancel();
  }

  function schedulePronunciation(koreanName: string, delay: number): void {
    clearPronunciationTimer();
    if (!('speechSynthesis' in window)) return;

    pronunciationTimer = window.setTimeout(() => {
      pronunciationTimer = null;
      speakKoreanName(koreanName);
    }, delay);
  }

  function showStage(stage: HTMLElement): void {
    for (const item of [stageStart, stageInput, stageResult]) {
      item.classList.toggle('is-active', item === stage);
    }
    if (stage !== stageResult) clearPronunciationTimer();
    if (stage !== stageStart) launchLoopToken++;
    if (stage === stageInput) requestAnimationFrame(() => repositionTypeCloud?.());
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function enterInputStage(): void {
    if (!stageStart.classList.contains('is-active')) return;
    showStage(stageInput);
    requestAnimationFrame(() => input.focus());
  }

  function updateButton(): void {
    btn.disabled = isGenerating || input.value.trim().length === 0;
  }

  function finishLoading(): void {
    isGenerating = false;
    input.disabled = false;
    btn.textContent = 'Generate';
    btn.classList.remove('is-loading');
    updateButton();
  }

  async function generate(): Promise<void> {
    const name = input.value.trim();
    if (!name) return;

    isGenerating = true;
    hint.textContent = 'Preparing your Korean name...';
    btn.textContent = 'Generating';
    btn.classList.add('is-loading');
    input.disabled = true;
    updateButton();

    try { await loadDictionary(); } catch { hint.textContent = 'Dictionary unavailable. Using rules instead.'; }

    const identity = generateNameIdentity(name);

    if (!identity.koreanName) {
      hint.textContent = 'Could not generate a Korean name. Try a different spelling.';
      finishLoading();
      return;
    }

    hint.textContent = '';
    finishLoading();

    renderCharacterReveal(koreanEl, identity.koreanName);
    const pronunciationDelay = renderNameComposition(compositionEl, identity.koreanName);
    romanEl.textContent = identity.romanization;
    origEl.textContent = `← ${identity.originalName}`;
    srcEl.textContent = identity.source === 'cmu' ? 'Pronunciation-based' : 'Rule-assisted';
    showStage(stageResult);
    schedulePronunciation(identity.koreanName, pronunciationDelay);
  }

  // ── Keyboard field ────────────────────────────────────────────────────
  createKeyboardField(keyboardBg);

  const runLaunch = (): void => {
    const token = ++launchLoopToken;
    void runLaunchLoop({
      center: launchCenter, text: launchText, keyboard: keyboardBg, token,
      getMode: () => currentKeyboardMode,
      setMode: (mode) => { currentKeyboardMode = mode; },
      isCurrent: () => token === launchLoopToken && stageStart.classList.contains('is-active'),
    });
  };
  runLaunch();
  window.addEventListener('resize', () => { createKeyboardField(keyboardBg, currentKeyboardMode); });

  stageStart.addEventListener('click', enterInputStage);
  stageStart.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); enterInputStage(); }
  });

  editNameBtn.addEventListener('click', () => {
    showStage(stageInput);
    requestAnimationFrame(() => input.focus());
  });

  input.addEventListener('input', () => { updateButton(); heroChips.forEach((c) => c.classList.remove('is-selected')); });
  btn.addEventListener('click', () => { void generate(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !btn.disabled) btn.click(); });

  for (const chip of heroChips) {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.exampleName ?? '';
      heroChips.forEach((c) => c.classList.toggle('is-selected', c === chip));
      input.focus();
      updateButton();
    });
  }

  const q = new URLSearchParams(location.search).get('q');
  if (q) { input.value = q; showStage(stageInput); updateButton(); void generate(); }

  updateButton();
}

function setupAutoTheme(): void {
  const win = window as Window & { __kazaApplyAutoTheme?: () => void };
  const applyTheme = win.__kazaApplyAutoTheme;
  if (!applyTheme) return;

  applyTheme();

  const darkPreference = window.matchMedia?.('(prefers-color-scheme: dark)');
  darkPreference?.addEventListener?.('change', applyTheme);

  // Re-check periodically so a page left open across morning/evening changes theme.
  window.setInterval(applyTheme, 60_000);
}

function setupHangulCursor(): void {
  const cursor = document.getElementById('hangul-cursor') as HTMLElement | null;
  if (!cursor || !window.matchMedia('(pointer: fine)').matches) return;

  document.body.classList.add('has-hangul-cursor');

  const moveCursor = (event: PointerEvent): void => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.style.opacity = '0.95';
    document.body.classList.add('is-cursor-active');
  };

  window.addEventListener('pointermove', moveCursor);
  window.addEventListener('pointerdown', () => document.body.classList.add('is-cursor-pressing'));
  window.addEventListener('pointerup', () => document.body.classList.remove('is-cursor-pressing'));
  window.addEventListener('pointerleave', () => {
    cursor.style.opacity = '0';
    document.body.classList.remove('is-cursor-active', 'is-cursor-pressing');
  });
}

function setupTypeCloud(): void {
  const chars = Array.from(document.querySelectorAll<HTMLElement>('.type-char'));
  const layer = document.querySelector<HTMLElement>('.type-cloud');
  if (chars.length === 0) return;

  const placeAll = (): void => {
    const placed: Rect[] = [];
    for (const char of chars) {
      assignTypeCharText(char, chars);
      placeChar(char, placed, layer);
    }
  };

  for (const char of chars) {
    char.addEventListener('animationiteration', () => {
      assignTypeCharText(char, chars);
      placeChar(char, getPlacedRects(chars, char, layer?.getBoundingClientRect()), layer);
    });
  }

  repositionTypeCloud = placeAll;
  window.addEventListener('resize', placeAll);
  requestAnimationFrame(placeAll);
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function assignTypeCharText(char: HTMLElement, chars: HTMLElement[]): void {
  const used = new Set(chars.filter((item) => item !== char).map((item) => item.textContent ?? ''));
  const available = TYPE_CLOUD_LIBRARY.filter((value) => !used.has(value));
  const pool = available.length > 0 ? available : TYPE_CLOUD_LIBRARY;
  char.textContent = pool[Math.floor(Math.random() * pool.length)] ?? TYPE_CLOUD_LIBRARY[0];
}

function placeChar(char: HTMLElement, placed: Rect[], layer: HTMLElement | null): void {
  const layerRect = layer?.getBoundingClientRect();
  if (!layerRect || layerRect.width <= 0 || layerRect.height <= 0) {
    char.style.left = `${randomBetween(5, 91)}%`;
    char.style.top = `${randomBetween(6, 84)}%`;
    return;
  }

  const charRect = char.getBoundingClientRect();
  const width = Math.max(48, charRect.width);
  const height = Math.max(48, charRect.height);
  const forbidden = getTypeCloudForbiddenRects(layerRect);
  const maxX = Math.max(TYPE_CLOUD_EDGE_PADDING, layerRect.width - width - TYPE_CLOUD_EDGE_PADDING);
  const maxY = Math.max(TYPE_CLOUD_EDGE_PADDING, layerRect.height - height - TYPE_CLOUD_EDGE_PADDING);

  for (let attempt = 0; attempt < 90; attempt++) {
    const candidate = {
      left: randomBetween(TYPE_CLOUD_EDGE_PADDING, maxX),
      top: randomBetween(TYPE_CLOUD_EDGE_PADDING, maxY),
      right: 0,
      bottom: 0,
    };
    candidate.right = candidate.left + width;
    candidate.bottom = candidate.top + height;

    if (forbidden.some((rect) => intersects(candidate, rect))) continue;
    if (placed.some((rect) => intersects(expandRect(candidate, TYPE_CLOUD_CHAR_PADDING), rect))) continue;
    if (placed.some((rect) => distanceBetweenCenters(candidate, rect) < getTypeCloudMinDistance(layerRect))) {
      continue;
    }

    char.style.left = `${candidate.left}px`;
    char.style.top = `${candidate.top}px`;
    placed.push(candidate);
    return;
  }

  const fallback = {
    left: randomBetween(TYPE_CLOUD_EDGE_PADDING, maxX),
    top: randomBetween(TYPE_CLOUD_EDGE_PADDING, maxY),
    right: 0,
    bottom: 0,
  };
  fallback.right = fallback.left + width;
  fallback.bottom = fallback.top + height;
  char.style.left = `${fallback.left}px`;
  char.style.top = `${fallback.top}px`;
  placed.push(fallback);
}

function getTypeCloudForbiddenRects(layerRect: DOMRect): Rect[] {
  return ['.input-title', '.input-panel']
    .map((selector) => document.querySelector<HTMLElement>(selector)?.getBoundingClientRect())
    .filter((rect): rect is DOMRect => rect !== undefined && rect.width > 0 && rect.height > 0)
    .map((rect) =>
      expandRect(
        {
          left: rect.left - layerRect.left,
          top: rect.top - layerRect.top,
          right: rect.right - layerRect.left,
          bottom: rect.bottom - layerRect.top,
        },
        TYPE_CLOUD_CONTENT_PADDING,
      ),
    );
}

function getPlacedRects(
  chars: HTMLElement[],
  activeChar: HTMLElement,
  layerRect?: DOMRect,
): Rect[] {
  return chars
    .filter((char) => char !== activeChar && char.style.left && char.style.top)
    .map((char) => {
      const rect = char.getBoundingClientRect();
      const offsetLeft = layerRect?.left ?? 0;
      const offsetTop = layerRect?.top ?? 0;
      return {
        left: rect.left - offsetLeft,
        top: rect.top - offsetTop,
        right: rect.right - offsetLeft,
        bottom: rect.bottom - offsetTop,
      };
    });
}

function expandRect(rect: Rect, amount: number): Rect {
  return {
    left: rect.left - amount,
    top: rect.top - amount,
    right: rect.right + amount,
    bottom: rect.bottom + amount,
  };
}

function intersects(a: Rect, b: Rect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function distanceBetweenCenters(a: Rect, b: Rect): number {
  const ax = a.left + (a.right - a.left) / 2;
  const ay = a.top + (a.bottom - a.top) / 2;
  const bx = b.left + (b.right - b.left) / 2;
  const by = b.top + (b.bottom - b.top) / 2;
  return Math.hypot(ax - bx, ay - by);
}

function getTypeCloudMinDistance(layerRect: DOMRect): number {
  return Math.max(96, Math.min(TYPE_CLOUD_MIN_DISTANCE, layerRect.width * 0.13));
}

function randomBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

// ── Keyboard helpers ───────────────────────────────────────────────────────

function createKeyboardField(container: HTMLElement, mode: KeyboardMode = 'en'): void {
  const fragment = document.createDocumentFragment();
  const cluster = document.createElement('div');
  cluster.className = 'keyboard-cluster';
  cluster.style.setProperty('--float', '9.5s');
  cluster.style.setProperty('--delay', '-1.2s');

  for (const [rowIndex, row] of KEYBOARD_ROWS.entries()) {
    const rowEl = document.createElement('div');
    rowEl.className = 'keyboard-row';
    rowEl.classList.add(`keyboard-row-${rowIndex}`);
    for (const [keyIndex, def] of row.entries()) {
      const key = document.createElement('span');
      key.className = 'keycap';
      if (def.special) key.classList.add('is-special');
      if (def.space) key.classList.add('is-space');
      if (def.align) key.classList.add(`is-align-${def.align}`);
      key.dataset.en = def.en;
      key.dataset.ko = def.ko ?? def.en;
      key.dataset.row = String(rowIndex);
      key.dataset.key = String(keyIndex);
      key.dataset.enLabel = serializeKeyLabel(def.label ?? def.en);
      key.dataset.koLabel = serializeKeyLabel(def.ko ?? def.label ?? def.en);
      key.style.setProperty('--units', String(def.units ?? 1));
      renderKeyLabel(key, mode === 'en' ? key.dataset.enLabel : key.dataset.koLabel);
      rowEl.appendChild(key);
    }
    cluster.appendChild(rowEl);
  }
  fragment.appendChild(cluster);
  container.replaceChildren(fragment);
}

interface LaunchLoopOptions {
  center: HTMLElement; text: HTMLElement; keyboard: HTMLElement; token: number;
  getMode: () => KeyboardMode; setMode: (mode: KeyboardMode) => void; isCurrent: () => boolean;
}

async function runLaunchLoop(opts: LaunchLoopOptions): Promise<void> {
  while (opts.isCurrent()) {
    for (const ex of LAUNCH_EXAMPLES) { if (!opts.isCurrent()) return; await runLaunchExample(ex, opts); }
  }
}

async function runLaunchExample(ex: LaunchExample, opts: LaunchLoopOptions): Promise<void> {
  const { center, text, keyboard, isCurrent } = opts;
  center.classList.remove('is-resetting');
  text.textContent = '';
  setKeyboardMode(keyboard, 'en'); opts.setMode('en');
  await wait(460);

  for (let i = 0; i < ex.english.length; i++) {
    if (!isCurrent()) return;
    pulseKey(keyboard, ex.english[i]!.toUpperCase(), 'en');
    text.textContent = ex.english.slice(0, i + 1);
    await wait(i === 0 ? 280 : 210);
  }
  await wait(1250);
  if (!isCurrent()) return;

  const wave = transformKeyboardWave(keyboard, 'ko', opts.setMode);
  for (let i = ex.english.length - 1; i >= 0; i--) { text.textContent = ex.english.slice(0, i); await wait(110); }
  await wave;
  await wait(560);

  for (const [i, key] of ex.koreanKeys.entries()) {
    if (!isCurrent()) return;
    pulseKey(keyboard, key, 'ko');
    text.textContent = ex.koreanFrames[i] ?? ex.korean;
    await wait(285);
  }
  await wait(1350);
  center.classList.add('is-resetting');
  await wait(500);
  setKeyboardMode(keyboard, 'en'); opts.setMode('en');
  text.textContent = '';
  await wait(220);
}

function setKeyboardMode(container: HTMLElement, mode: KeyboardMode): void {
  for (const key of getKeycaps(container)) {
    key.classList.remove('is-active', 'is-converting');
    renderKeyLabel(key, key.dataset[`${mode}Label`] ?? key.dataset[mode] ?? '');
  }
}

async function transformKeyboardWave(container: HTMLElement, mode: KeyboardMode, setMode: (m: KeyboardMode) => void): Promise<void> {
  const keys = getKeycaps(container).map((k) => ({ key: k, left: k.getBoundingClientRect().left }))
    .sort((a, b) => mode === 'ko' ? b.left - a.left : a.left - b.left);
  const span = Math.max(1, keys.length - 1);
  for (const [i, item] of keys.entries()) {
    window.setTimeout(() => {
      item.key.classList.add('is-converting');
      renderKeyLabel(item.key, item.key.dataset[`${mode}Label`] ?? item.key.dataset[mode] ?? '');
      window.setTimeout(() => item.key.classList.remove('is-converting'), 260);
    }, (i / span) * LAUNCH_WAVE_MS);
  }
  await wait(LAUNCH_WAVE_MS + 280);
  setMode(mode);
}

function pulseKey(container: HTMLElement, value: string, mode: KeyboardMode): void {
  for (const key of getKeycaps(container)) {
    if (key.dataset[mode === 'en' ? 'en' : 'ko'] !== value) continue;
    key.classList.remove('is-active'); void key.offsetWidth;
    key.classList.add('is-active');
    window.setTimeout(() => key.classList.remove('is-active'), 260);
  }
}

function getKeycaps(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('.keycap'));
}

function serializeKeyLabel(label: string | readonly string[]): string {
  return typeof label === 'string' ? label : label.join('\n');
}

function renderKeyLabel(key: HTMLElement, label = ''): void {
  key.replaceChildren();
  const lines = label.split('\n');
  if (lines.length <= 1) { key.textContent = label; return; }
  for (const line of lines) {
    const span = document.createElement('span');
    if (line.startsWith('icon:')) {
      span.className = `keycap-icon keycap-icon-${line.slice(5)}`;
      if (line === 'icon:mission') span.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
      else if (line === 'icon:mic') span.append(document.createElement('i'));
    } else { span.className = 'keycap-line'; span.textContent = line; }
    key.appendChild(span);
  }
}

function wait(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }

function renderCharacterReveal(container: HTMLElement, value: string): void {
  container.innerHTML = '';
  container.setAttribute('aria-label', value);
  container.classList.remove('is-composition-base');
  for (const [i, ch] of Array.from(value).entries()) {
    const span = document.createElement('span');
    span.className = 'reveal-char';
    span.textContent = ch;
    span.style.setProperty('--delay', `${i * CHAR_REVEAL_STAGGER_MS}ms`);
    container.appendChild(span);
  }
  void container.offsetWidth;
  container.classList.add('is-composition-base');
}

interface JamoBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface HangulParts {
  cho: string;
  jung: string;
  jong: string;
}

const CONSONANT_STROKES: Record<string, string[]> = {
  ㄱ: ['M22 22 H76', 'M76 22 V76'],
  ㄲ: ['M18 22 H46', 'M46 22 V76', 'M54 22 H82', 'M82 22 V76'],
  ㄴ: ['M24 22 V76', 'M24 76 H78'],
  ㄷ: ['M24 22 H76', 'M24 22 V76', 'M24 76 H76'],
  ㄸ: ['M16 22 H44', 'M16 22 V76', 'M16 76 H44', 'M56 22 H84', 'M56 22 V76', 'M56 76 H84'],
  ㄹ: ['M24 20 H76', 'M76 20 V42', 'M76 42 H36', 'M36 42 V76', 'M36 76 H78'],
  ㅁ: ['M22 22 H78', 'M78 22 V78', 'M78 78 H22', 'M22 78 V22'],
  ㅂ: ['M24 20 V78', 'M76 20 V78', 'M24 78 H76', 'M24 48 H76'],
  ㅃ: ['M17 20 V78', 'M43 20 V78', 'M17 78 H43', 'M17 48 H43', 'M57 20 V78', 'M83 20 V78', 'M57 78 H83', 'M57 48 H83'],
  ㅅ: ['M50 22 L22 78', 'M50 22 L80 78'],
  ㅆ: ['M37 22 L14 78', 'M37 22 L58 78', 'M64 22 L44 78', 'M64 22 L86 78'],
  ㅇ: ['M50 22 C68 22 80 34 80 50 C80 68 68 80 50 80 C32 80 20 68 20 50 C20 34 32 22 50 22'],
  ㅈ: ['M24 22 H76', 'M50 24 L22 78', 'M50 24 L80 78'],
  ㅉ: ['M16 22 H46', 'M31 24 L12 78', 'M31 24 L52 78', 'M54 22 H84', 'M69 24 L50 78', 'M69 24 L88 78'],
  ㅊ: ['M50 12 V24', 'M24 32 H76', 'M50 34 L22 82', 'M50 34 L80 82'],
  ㅋ: ['M22 22 H76', 'M76 22 V78', 'M38 50 H76'],
  ㅌ: ['M24 20 H76', 'M24 48 H68', 'M24 76 H76', 'M24 20 V76'],
  ㅍ: ['M24 20 V78', 'M76 20 V78', 'M24 78 H76', 'M24 48 H76', 'M50 20 V78'],
  ㅎ: ['M50 14 V26', 'M30 34 H70', 'M50 44 C66 44 76 54 76 66 C76 80 64 88 50 88 C36 88 24 80 24 66 C24 54 34 44 50 44'],
};

const VOWEL_STROKES: Record<string, string[]> = {
  ㅏ: ['M48 14 V86', 'M48 48 H78'],
  ㅐ: ['M38 14 V86', 'M38 48 H62', 'M72 14 V86'],
  ㅑ: ['M48 14 V86', 'M48 40 H78', 'M48 58 H78'],
  ㅒ: ['M36 14 V86', 'M36 40 H58', 'M36 58 H58', 'M72 14 V86'],
  ㅓ: ['M58 14 V86', 'M28 48 H58'],
  ㅔ: ['M28 14 V86', 'M52 48 H28', 'M72 14 V86'],
  ㅕ: ['M58 14 V86', 'M28 40 H58', 'M28 58 H58'],
  ㅖ: ['M28 14 V86', 'M28 40 H52', 'M28 58 H52', 'M72 14 V86'],
  ㅗ: ['M18 60 H82', 'M50 24 V60'],
  ㅛ: ['M18 66 H82', 'M40 26 V66', 'M60 26 V66'],
  ㅜ: ['M18 40 H82', 'M50 40 V78'],
  ㅠ: ['M18 36 H82', 'M40 36 V76', 'M60 36 V76'],
  ㅡ: ['M18 54 H82'],
  ㅣ: ['M52 14 V86'],
  ㅘ: ['M14 58 H58', 'M34 24 V58', 'M64 14 V86', 'M64 48 H86'],
  ㅙ: ['M12 58 H50', 'M30 24 V58', 'M56 14 V86', 'M56 48 H72', 'M82 14 V86'],
  ㅚ: ['M16 58 H58', 'M34 24 V58', 'M72 14 V86'],
  ㅝ: ['M14 42 H58', 'M34 42 V76', 'M66 14 V86', 'M36 48 H66'],
  ㅞ: ['M12 42 H50', 'M30 42 V76', 'M58 14 V86', 'M34 48 H58', 'M82 14 V86'],
  ㅟ: ['M16 42 H58', 'M34 42 V76', 'M72 14 V86'],
  ㅢ: ['M14 58 H58', 'M72 14 V86'],
};

function renderNameComposition(container: HTMLElement, value: string): number {
  container.innerHTML = '';
  let strokeIndex = 0;
  let lastFinalDelay = COMPOSITION_START_MS + COMPOSITION_FINAL_MS;
  const start = COMPOSITION_START_MS + (Array.from(value).length * CHAR_REVEAL_STAGGER_MS);

  for (const ch of Array.from(value)) {
    const glyph = document.createElement('span');
    glyph.className = 'stroke-glyph';
    const glyphPaths: SVGPathElement[] = [];

    const parts = decomposeHangul(ch);
    if (parts) {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('aria-hidden', 'true');

      for (const part of getCompositionParts(parts)) {
        const group = document.createElementNS(SVG_NS, 'g');
        group.classList.add('stroke-part');
        group.setAttribute('transform', `translate(${part.box.x} ${part.box.y}) scale(${part.box.w / 100} ${part.box.h / 100})`);
        group.style.setProperty('--delay', `${start + strokeIndex * COMPOSITION_STROKE_STAGGER_MS}ms`);

        for (const pathData of getStrokePaths(part.jamo)) {
          const path = document.createElementNS(SVG_NS, 'path');
          path.classList.add('stroke-line');
          path.setAttribute('d', pathData);
          path.setAttribute('pathLength', '1');
          path.style.setProperty('--delay', `${start + strokeIndex * COMPOSITION_STROKE_STAGGER_MS}ms`);
          group.appendChild(path);
          glyphPaths.push(path);
          strokeIndex++;
        }
        svg.appendChild(group);
      }
      glyph.appendChild(svg);
    }

    const finalDelay = start + Math.max(1, strokeIndex) * COMPOSITION_STROKE_STAGGER_MS + 360;
    lastFinalDelay = Math.max(lastFinalDelay, finalDelay);
    for (const path of glyphPaths) {
      path.style.setProperty('--fade-delay', `${finalDelay + 80}ms`);
    }

    const final = document.createElement('span');
    final.className = 'stroke-final';
    final.textContent = ch;
    final.style.setProperty('--delay', `${finalDelay}ms`);
    glyph.appendChild(final);
    container.appendChild(glyph);
  }

  return lastFinalDelay + COMPOSITION_FINAL_MS + PRONUNCIATION_AFTER_FINAL_MS;
}

function decomposeHangul(ch: string): HangulParts | null {
  const code = ch.charCodeAt(0);
  if (code < HANGUL_BASE || code > HANGUL_END) return null;
  const index = code - HANGUL_BASE;
  const choIndex = Math.floor(index / (JUNG_COUNT * JONG_COUNT));
  const jungIndex = Math.floor((index % (JUNG_COUNT * JONG_COUNT)) / JONG_COUNT);
  const jongIndex = index % JONG_COUNT;
  return {
    cho: CHO_LIST[choIndex] ?? '',
    jung: JUNG_LIST[jungIndex] ?? '',
    jong: JONG_LIST[jongIndex] ?? '',
  };
}

function getCompositionParts(parts: HangulParts): Array<{ jamo: string; box: JamoBox }> {
  const hasJong = parts.jong.length > 0;
  const isVertical = VERTICAL_VOWELS.has(parts.jung);
  const layout = getJamoLayout(isVertical, hasJong);
  const items = [
    { jamo: parts.cho, box: layout.cho },
    { jamo: parts.jung, box: layout.jung },
  ];
  if (hasJong) items.push({ jamo: parts.jong, box: layout.jong });
  return items;
}

function getJamoLayout(isVertical: boolean, hasJong: boolean): { cho: JamoBox; jung: JamoBox; jong: JamoBox } {
  if (isVertical) {
    return hasJong
      ? { cho: { x: 8, y: 12, w: 38, h: 48 }, jung: { x: 44, y: 8, w: 48, h: 58 }, jong: { x: 20, y: 66, w: 62, h: 27 } }
      : { cho: { x: 8, y: 16, w: 40, h: 68 }, jung: { x: 43, y: 12, w: 50, h: 76 }, jong: { x: 0, y: 0, w: 0, h: 0 } };
  }
  return hasJong
    ? { cho: { x: 22, y: 8, w: 56, h: 36 }, jung: { x: 15, y: 40, w: 70, h: 28 }, jong: { x: 20, y: 70, w: 62, h: 24 } }
    : { cho: { x: 20, y: 9, w: 60, h: 45 }, jung: { x: 15, y: 54, w: 70, h: 34 }, jong: { x: 0, y: 0, w: 0, h: 0 } };
}

function getStrokePaths(jamo: string): string[] {
  return CONSONANT_STROKES[jamo] ?? VOWEL_STROKES[jamo] ?? [];
}

function speakKoreanName(koreanName: string): void {
  if (!koreanName || !('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(koreanName);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.86;
  utterance.pitch = 1;
  utterance.volume = 0.9;

  const voices = window.speechSynthesis.getVoices();
  const koreanVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('ko'));
  if (koreanVoice) utterance.voice = koreanVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
