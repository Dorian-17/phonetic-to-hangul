import { describe, it, expect, beforeAll } from 'vitest';
import { transliterate } from './index';
import { loadDictionary, isDictionaryLoaded } from './g2p';

describe('transliterate', () => {
  beforeAll(async () => {
    await loadDictionary();
  });

  it('loads CMU dictionary for integration tests', () => {
    expect(isDictionaryLoaded()).toBe(true);
  });

  // ── Known-name integration tests ───────────────────────────────────

  it('transliterates Michael → 마이클', () => {
    const result = transliterate('Michael');
    expect(result.hangul).toBe('마이클');
    expect(result.source).toBe('cmu');
  });

  it('transliterates Victoria → 빅토리아', () => {
    const result = transliterate('Victoria');
    expect(result.hangul).toBe('빅토리아');
    expect(result.source).toBe('cmu');
  });

  it('transliterates Luke → 루크 (plosive epenthesis after long vowel)', () => {
    const result = transliterate('Luke');
    expect(result.hangul).toBe('루크');
  });

  // ── Edge cases ─────────────────────────────────────────────────────

  it('returns empty result for empty string', () => {
    const result = transliterate('');
    expect(result.input).toBe('');
    expect(result.hangul).toBe('');
    expect(result.phonemes).toEqual([]);
    expect(result.jamoTokens).toEqual([]);
    expect(result.syllables).toEqual([]);
  });

  it('returns empty result for whitespace-only input', () => {
    const result = transliterate('   ');
    expect(result.hangul).toBe('');
  });

  // ── Output shape ───────────────────────────────────────────────────

  it('returns all expected fields in result', () => {
    const result = transliterate('test');
    expect(result).toHaveProperty('input');
    expect(result).toHaveProperty('phonemes');
    expect(result).toHaveProperty('ipa');
    expect(result).toHaveProperty('jamoTokens');
    expect(result).toHaveProperty('syllables');
    expect(result).toHaveProperty('hangul');
    expect(result).toHaveProperty('source');
    expect(result.ipa.length).toBe(result.phonemes.length);
  });

  it('result contains typed jamo tokens', () => {
    const result = transliterate('ma');
    for (const tok of result.jamoTokens) {
      expect(['C', 'V']).toContain(tok.type);
      expect(typeof tok.jamo).toBe('string');
      expect(typeof tok.arpabet).toBe('string');
    }
  });

  it('result syllables contain decomposable jamo', () => {
    const result = transliterate('ma');
    for (const syl of result.syllables) {
      expect(typeof syl.cho).toBe('string');
      expect(typeof syl.jung).toBe('string');
      expect(typeof syl.jong).toBe('string');
      expect(typeof syl.char).toBe('string');
    }
  });

  // ── Robustness ─────────────────────────────────────────────────────

  it('never throws for arbitrary input', () => {
    const inputs = [
      'abcdefghijklmnopqrstuvwxyz',
      'hello',
      'x',
      'aeiou',
      'smith',
      'a',
    ];
    for (const input of inputs) {
      expect(() => transliterate(input)).not.toThrow();
      const result = transliterate(input);
      expect(typeof result.hangul).toBe('string');
    }
  });
});
