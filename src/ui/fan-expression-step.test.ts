/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { renderFanExpressionStep } from './fan-expression-step';
import type { BasicInfo, FanExpression, ExpressionDraft } from '../types';

function setupDOM(): HTMLElement {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
  const w = dom.window as any;
  (globalThis as any).window = w;
  (globalThis as any).document = w.document;
  (globalThis as any).HTMLElement = w.HTMLElement;
  (globalThis as any).HTMLButtonElement = w.HTMLButtonElement;
  (globalThis as any).HTMLTextAreaElement = w.HTMLTextAreaElement;
  (globalThis as any).requestAnimationFrame = (fn: () => void) => setTimeout(fn, 0);
  // jsdom does not implement scrollIntoView — stub it so showResult won't throw.
  w.HTMLElement.prototype.scrollIntoView = () => {};
  return w.document.getElementById('container') as HTMLElement;
}

const BASIC_INFO: BasicInfo = {
  englishName: 'Michael',
  country: 'USA',
  favoriteArtist: 'BTS',
  fanMood: 'cool',
  koreanLevel: 'beginner',
};

function buttonByText(container: HTMLElement, text: string): HTMLButtonElement {
  const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
  const btn = buttons.find((b) => (b.textContent ?? '').includes(text));
  if (!btn) throw new Error(`Button containing "${text}" not found`);
  return btn;
}

const draft: ExpressionDraft = { sourceInput: '', inputMode: null, errorMessage: null };
const noop = () => {};

const fanPassButton = (c: HTMLElement) => buttonByText(c, 'View Your Fan Pass');
const generateButton = (c: HTMLElement) => buttonByText(c, 'Generate Korean Expressions');
const textareaOf = (c: HTMLElement) => c.querySelector('.expression-textarea') as HTMLTextAreaElement;
const resultOf = (c: HTMLElement) => c.querySelector('.expression-result') as HTMLElement;

describe('renderFanExpressionStep — Fan Pass gating', () => {
  it('locks the Fan Pass button until an expression is generated', () => {
    const container = setupDOM();
    renderFanExpressionStep(container, BASIC_INFO, null, draft, noop, () => {}, () => {}, () => {});

    expect(fanPassButton(container).disabled).toBe(true);
    expect(resultOf(container).style.display).toBe('none');
  });

  it('does not generate and keeps the Fan Pass locked when input is empty', () => {
    const container = setupDOM();
    let generated: FanExpression | null = null;

    renderFanExpressionStep(container, BASIC_INFO, null, draft, noop, () => {}, (e) => { generated = e; }, () => {});
    generateButton(container).click();

    expect(generated).toBeNull();
    expect(fanPassButton(container).disabled).toBe(true);
    const hint = container.querySelector('.expression-hint');
    expect(hint?.textContent ?? '').toMatch(/write something/i);
  });

  it('generates an expression, unlocks the Fan Pass, and reports it via onGenerate', () => {
    const container = setupDOM();
    let generated: FanExpression | null = null;

    renderFanExpressionStep(container, BASIC_INFO, null, draft, noop, () => {}, (e) => { generated = e; }, () => {});
    textareaOf(container).value = 'I love your music so much';
    generateButton(container).click();
    // Must explicitly save an expression before Fan Pass unlocks
    const save = buttonByText(container, '☆ Save');
    if (save) save.click();

    expect(generated).not.toBeNull();
    expect(generated!.versions.length).toBe(3);
    expect(fanPassButton(container).disabled).toBe(false);
    expect(resultOf(container).style.display).toBe('');
  });

  it('blocks navigation while locked and only calls onViewFanPass once unlocked', () => {
    const container = setupDOM();
    let viewed = 0;

    renderFanExpressionStep(container, BASIC_INFO, null, draft, noop, () => {}, () => {}, () => { viewed += 1; });

    // Locked: clicking the Fan Pass button must not navigate.
    fanPassButton(container).click();
    expect(viewed).toBe(0);

    // Generate, save, then the same button should navigate exactly once.
    textareaOf(container).value = 'thank you so much';
    generateButton(container).click();
    const saveBtn = buttonByText(container, '☆ Save');
    if (saveBtn) saveBtn.click();
    fanPassButton(container).click();
    expect(viewed).toBe(1);
  });
});

describe('renderFanExpressionStep — no module-level state', () => {
  it('a fresh render is locked again after a previous render generated one', () => {
    // First render generates an expression.
    const containerA = setupDOM();
    let genA: FanExpression | null = null;
    renderFanExpressionStep(containerA, BASIC_INFO, null, draft, noop, () => {}, (e) => { genA = e; }, () => {});
    textareaOf(containerA).value = 'fighting!';
    generateButton(containerA).click();
    expect(genA).not.toBeNull();

    // Second, independent render with no existing expression must start locked
    // with its result hidden — proving there is no leftover module-level state.
    const containerB = setupDOM();
    renderFanExpressionStep(containerB, BASIC_INFO, null, draft, noop, () => {}, () => {}, () => {});
    expect(fanPassButton(containerB).disabled).toBe(true);
    expect(resultOf(containerB).style.display).toBe('none');
  });

  it('restores a previously generated expression when one is passed in (back-nav)', () => {
    const existing: FanExpression = {
      userInput: 'I love you',
      toneLabel: 'Warm & Heartfelt',
      versions: [
        { tone: 'formal', korean: '사랑합니다', english: 'I love you', pronunciation: 'Saranghamnida', usageNote: 'Formal.' },
        { tone: 'natural', korean: '사랑해요', english: 'I love you', pronunciation: 'Saranghaeyo', usageNote: 'Natural.' },
        { tone: 'cute', korean: '사랑해용~', english: 'Love youu~', pronunciation: 'Saranghaeyong~', usageNote: 'Cute.' },
      ],
      saved: ['natural'],
    };
    const container = setupDOM();
    renderFanExpressionStep(container, BASIC_INFO, existing, draft, noop, () => {}, () => {}, () => {});

    expect(fanPassButton(container).disabled).toBe(false);
    expect(resultOf(container).style.display).toBe('');
    expect(textareaOf(container).value).toBe('I love you');
    const allKorean = container.querySelectorAll('.expression-version-korean');
    expect(allKorean[1]!.textContent).toBe('사랑해요');
  });
});
