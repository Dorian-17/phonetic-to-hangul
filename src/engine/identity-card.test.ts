import { describe, it, expect } from 'vitest';
import { generateIdentityCard, generateCardId } from './identity-card';
import type { IdentityCardInput } from '../types';

function makeInput(overrides: Partial<IdentityCardInput> = {}): IdentityCardInput {
  return {
    basicInfo: {
      englishName: 'Michael',
      country: 'USA',
      favoriteArtist: 'BTS',
      fanMood: 'cool',
      koreanLevel: 'beginner',
    },
    koreanNameProfile: {
      originalName: 'Michael',
      koreanName: '마이클',
      romanization: 'Maikeul',
      moodDescription: 'Effortless cool.',
      identityKeyword: 'Ace',
      pronunciationData: { phonemes: ['M', 'AY', 'K', 'AH', 'L'], ipa: ['m', 'aɪ', 'k', 'ə', 'l'] },
      source: 'cmu' as const,
      isLoading: false,
      errorMessage: null,
    },
    fanExpression: {
      userInput: 'You are amazing!',
      toneLabel: 'Energetic & Cheerful',
      versions: [
        { tone: 'formal', korean: '정말 멋지십니다!', english: 'You are amazing!', pronunciation: 'Jeongmal meotjisimnida!', usageNote: 'Formal praise.' },
        { tone: 'natural', korean: '정말 멋져요!', english: 'You are amazing!', pronunciation: 'Jeongmal meotjyeoyo!', usageNote: 'Natural praise.' },
        { tone: 'cute', korean: '완전 멋져부려용~', english: 'Totally aweeesome~', pronunciation: 'Wanjeon meotjyeoburyeoyong~', usageNote: 'Cute praise.' },
      ],
      saved: ['natural'],
    },
    identityProfile: null,
    ...overrides,
  };
}

describe('generateIdentityCard', () => {
  it('generates a card with all required fields', () => {
    const card = generateIdentityCard(makeInput());

    expect(card.kazaId).toMatch(/^KaZa-\d{8}-[0-9A-F]{4}$/);
    expect(card.englishName).toBe('Michael');
    expect(card.koreanName).toBe('마이클');
    expect(card.country).toBe('USA');
    expect(card.favoriteArtist).toBe('BTS');
    expect(card.fanMood).toBe('cool');
    expect(card.representativeSentence).toBe('정말 멋져요!');
    expect(card.identityKeyword).toBe('Ace');
    expect(card.identityType).toBe('Warm Heart');
    expect(card.identityKeywords).toEqual(['Warm', 'Heart']);
    expect(card.mood).toBe('Warm');
  });

  it('generates different card IDs for different names', () => {
    const a = generateIdentityCard(makeInput());
    const b = generateIdentityCard(makeInput({
      basicInfo: {
        englishName: 'Sarah',
        country: 'UK',
        favoriteArtist: '',
        fanMood: 'sweet',
        koreanLevel: 'advanced',
      },
      koreanNameProfile: {
        originalName: 'Sarah',
        koreanName: '사라',
        romanization: 'Sara',
        moodDescription: '',
        identityKeyword: 'Sweetheart',
        pronunciationData: null,
        source: 'cmu' as const,
        isLoading: false,
        errorMessage: null,
      },
      fanExpression: {
        userInput: '',
        toneLabel: 'Warm',
        versions: [{ tone: 'natural', korean: '안녕하세요', english: 'Hello', pronunciation: 'Annyeonghaseyo', usageNote: 'Natural greeting.' }],
        saved: [],
      },
    }));

    expect(a.kazaId).not.toBe(b.kazaId);
  });

  it('uses em-dash for empty favoriteArtist', () => {
    const card = generateIdentityCard(makeInput({
      basicInfo: {
        englishName: 'John',
        country: 'AU',
        favoriteArtist: '',
        fanMood: 'funny',
        koreanLevel: 'intermediate',
      },
      koreanNameProfile: {
        originalName: 'John',
        koreanName: '존',
        romanization: 'Jon',
        moodDescription: '',
        identityKeyword: 'Sunshine',
        pronunciationData: null,
        source: 'rule' as const,
        isLoading: false,
        errorMessage: null,
      },
      fanExpression: {
        userInput: '',
        toneLabel: '',
        versions: [{ tone: 'natural', korean: '감사합니다', english: 'Thank you', pronunciation: 'Gamsahamnida', usageNote: 'Natural thanks.' }],
        saved: [],
      },
    }));

    expect(card.favoriteArtist).toBe('—');
  });
});

describe('generateCardId', () => {
  it("uses a fixed demo date by default for deterministic output", () => {
    const id = generateCardId('Michael', 'USA');
    expect(id).toMatch(/^KaZa-\d{8}-[0-9A-F]{4}$/);
    // Default is the demo date, not today's date — ensures deterministic demo runs
    expect(id.startsWith('KaZa-20260601-')).toBe(true);
  });

  it('uses an injected fixed date for deterministic output', () => {
    const id = generateCardId('Michael', 'USA', '20250101');
    expect(id).toMatch(/^KaZa-20250101-[0-9A-F]{4}$/);
  });

  it('produces a stable suffix for the same name + country', () => {
    const a = generateCardId('Michael', 'USA', '20250101');
    const b = generateCardId('Michael', 'USA', '20250101');
    expect(a).toBe(b);
  });

  it('produces different suffixes for different names', () => {
    const a = generateCardId('Michael', 'USA', '20250101');
    const b = generateCardId('Sarah', 'USA', '20250101');
    expect(a).not.toBe(b);
  });
});
