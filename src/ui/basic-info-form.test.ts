/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { renderBasicInfoForm, isValid } from './basic-info-form';
import type { BasicInfo, BasicInfoFormState } from '../types';

function setupDOM(): HTMLElement {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
  (globalThis as any).window = dom.window;
  (globalThis as any).document = dom.window.document;
  (globalThis as any).HTMLElement = dom.window.HTMLElement;
  (globalThis as any).HTMLInputElement = dom.window.HTMLInputElement;
  (globalThis as any).HTMLButtonElement = dom.window.HTMLButtonElement;
  (globalThis as any).HTMLSelectElement = dom.window.HTMLSelectElement;
  (globalThis as any).HTMLFormElement = dom.window.HTMLFormElement;
  (globalThis as any).HTMLOptionElement = dom.window.HTMLOptionElement;
  (globalThis as any).requestAnimationFrame = (fn: () => void) => setTimeout(fn, 0);
  return dom.window.document.getElementById('container') as HTMLElement;
}

function fillRequiredFields(container: HTMLElement): void {
  const nameInput = container.querySelector('#basic-name') as HTMLInputElement;
  const countryInput = container.querySelector('#basic-country') as HTMLInputElement;
  const moodSelect = container.querySelector('#basic-mood') as HTMLSelectElement;
  const levelSelect = container.querySelector('#basic-level') as HTMLSelectElement;

  nameInput.value = 'Dorian';
  nameInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

  countryInput.value = 'China';
  countryInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

  moodSelect.value = 'cool';
  moodSelect.dispatchEvent(new (window as any).Event('change', { bubbles: true }));

  levelSelect.value = 'beginner';
  levelSelect.dispatchEvent(new (window as any).Event('change', { bubbles: true }));
}

describe('renderBasicInfoForm', () => {
  it('renders all five input fields', () => {
    const container = setupDOM();
    let state: BasicInfoFormState | null = null;

    renderBasicInfoForm(container, {
      englishName: '',
      country: '',
      favoriteArtist: '',
      fanMood: '',
      koreanLevel: '',
    }, (s) => { state = s; }, () => {});

    expect(container.querySelector('#basic-name')).not.toBeNull();
    expect(container.querySelector('#basic-country')).not.toBeNull();
    expect(container.querySelector('#basic-artist')).not.toBeNull();
    expect(container.querySelector('#basic-mood')).not.toBeNull();
    expect(container.querySelector('#basic-level')).not.toBeNull();

    // Mood select: 1 placeholder + 5 values = 6 options
    const moodSelect = container.querySelector('#basic-mood') as HTMLSelectElement;
    expect(moodSelect.options.length).toBe(6);

    // Level select: 1 placeholder + 3 values = 4 options
    const levelSelect = container.querySelector('#basic-level') as HTMLSelectElement;
    expect(levelSelect.options.length).toBe(4);
  });

  it('starts with isValid=false', () => {
    const container = setupDOM();
    let state: BasicInfoFormState | null = null;

    renderBasicInfoForm(container, {
      englishName: '',
      country: '',
      favoriteArtist: '',
      fanMood: '',
      koreanLevel: '',
    }, (s) => { state = s; }, () => {});

    expect(state).not.toBeNull();
    expect(state!.isValid).toBe(false);
  });

  it('becomes valid after filling all required fields', () => {
    const container = setupDOM();
    let state: BasicInfoFormState | null = null;

    renderBasicInfoForm(container, {
      englishName: '',
      country: '',
      favoriteArtist: '',
      fanMood: '',
      koreanLevel: '',
    }, (s) => { state = s; }, () => {});

    fillRequiredFields(container);

    expect(state).not.toBeNull();
    expect(state!.isValid).toBe(true);
  });

  it('calls onSubmit when form is valid and submitted', () => {
    const container = setupDOM();
    let submitted: BasicInfo | null = null;

    renderBasicInfoForm(container, {
      englishName: '',
      country: '',
      favoriteArtist: '',
      fanMood: '',
      koreanLevel: '',
    }, () => {}, (info) => { submitted = info; });

    fillRequiredFields(container);

    const form = container.querySelector('.basic-info-form') as HTMLFormElement;
    form.dispatchEvent(new (window as any).Event('submit', { bubbles: true, cancelable: true }));

    expect(submitted).not.toBeNull();
    expect(submitted!.englishName).toBe('Dorian');
    expect(submitted!.country).toBe('China');
    expect(submitted!.fanMood).toBe('cool');
    expect(submitted!.koreanLevel).toBe('beginner');
  });

  it('preserves optional favoriteArtist field', () => {
    const container = setupDOM();
    let submitted: BasicInfo | null = null;

    renderBasicInfoForm(container, {
      englishName: '',
      country: '',
      favoriteArtist: '',
      fanMood: '',
      koreanLevel: '',
    }, () => {}, (info) => { submitted = info; });

    const artistInput = container.querySelector('#basic-artist') as HTMLInputElement;
    artistInput.value = 'BTS';
    artistInput.dispatchEvent(new (window as any).Event('input', { bubbles: true }));

    fillRequiredFields(container);

    const form = container.querySelector('.basic-info-form') as HTMLFormElement;
    form.dispatchEvent(new (window as any).Event('submit', { bubbles: true, cancelable: true }));

    expect(submitted!.favoriteArtist).toBe('BTS');
  });
});

describe('isValid', () => {
  it('returns false when all fields are empty', () => {
    expect(isValid({
      englishName: '',
      country: '',
      favoriteArtist: '',
      fanMood: '',
      koreanLevel: '',
    })).toBe(false);
  });

  it('returns true when all required fields are filled', () => {
    expect(isValid({
      englishName: 'Dorian',
      country: 'China',
      favoriteArtist: '',
      fanMood: 'cool',
      koreanLevel: 'beginner',
    })).toBe(true);
  });
});
