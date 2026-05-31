import { describe, it, expect, beforeAll } from 'vitest';
import { generateKoreanNameProfile } from './name-profile';
import { loadDictionary } from './g2p';
import type { KoreanNameProfile } from '../types';

describe('generateKoreanNameProfile', () => {
  // Load the real CMU dictionary so these tests exercise the same path the
  // browser app uses after Step 1 (handleStep1Submit awaits loadDictionary
  // before generating the Korean name profile).
  beforeAll(async () => {
    await loadDictionary();
  });

  it('generates 마이클 for Michael through the real CMU-backed path', () => {
    const profile = generateKoreanNameProfile({ englishName: 'Michael', fanMood: 'cool' });
    expect(profile.koreanName).toBe('마이클');
  });

  it('generates a profile for Michael', () => {
    const profile = generateKoreanNameProfile({
      englishName: 'Michael',
      fanMood: 'cool',
    });

    expect(profile.originalName).toBe('Michael');
    expect(profile.koreanName.length).toBeGreaterThan(0);
    expect(profile.romanization.length).toBeGreaterThan(0);
    expect(profile.moodDescription).toContain('cool');
    expect(profile.identityKeyword).toBe('Ace');
  });

  it('produces different mood descriptions for different moods', () => {
    const sweet = generateKoreanNameProfile({ englishName: 'Anna', fanMood: 'sweet' });
    const passionate = generateKoreanNameProfile({ englishName: 'Anna', fanMood: 'passionate' });

    expect(sweet.koreanName).toBe(passionate.koreanName);
    expect(sweet.moodDescription).not.toBe(passionate.moodDescription);
    expect(sweet.identityKeyword).not.toBe(passionate.identityKeyword);
  });

  it('defaults to sweet mood when empty', () => {
    const profile = generateKoreanNameProfile({ englishName: 'John', fanMood: '' });
    expect(profile.moodDescription).toContain('sweet');
    expect(profile.identityKeyword).toBe('Sweetheart');
  });

  it('returns a non-empty korean name for common names', () => {
    const names = ['David', 'Sarah', 'Chris', 'Emma', 'James'];

    for (const name of names) {
      const profile = generateKoreanNameProfile({ englishName: name, fanMood: 'funny' });
      expect(profile.koreanName).not.toBe('');
      expect(profile.romanization).not.toBe('');
    }
  });
});
