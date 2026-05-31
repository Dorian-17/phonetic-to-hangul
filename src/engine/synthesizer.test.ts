import { describe, it, expect } from 'vitest';
import { phonemesToJamoTokens, jamoTokensToSyllables } from './synthesizer';
import type { ConsonantToken, VowelToken } from './synthesizer';

describe('phonemesToJamoTokens', () => {
  // ── Basic consonant & vowel mapping ────────────────────────────────

  it('maps a simple CV sequence', () => {
    const tokens = phonemesToJamoTokens(['M', 'AY']);
    const c = tokens[0] as ConsonantToken;
    expect(c.type).toBe('C');
    expect(c.jamo).toBe('ㅁ');
  });

  it('maps consonant phonemes to jamo', () => {
    const tokens = phonemesToJamoTokens(['P', 'AA']);
    expect((tokens[0] as ConsonantToken).jamo).toBe('ㅍ');
  });

  // ── AH0 context resolution ─────────────────────────────────────────

  it('maps AH0 to ㅏ at word end (final position)', () => {
    const tokens = phonemesToJamoTokens(['AH0']);
    expect(tokens.length).toBe(1);
    expect((tokens[0] as VowelToken).jamo).toBe('ㅏ');
  });

  it('maps AH0 to ㅡ after velar K', () => {
    const tokens = phonemesToJamoTokens(['K', 'AH0', 'L']);
    const vowels = tokens.filter(t => t.type === 'V');
    expect(vowels.length).toBe(1);
    expect((vowels[0] as VowelToken).jamo).toBe('ㅡ');
  });

  it('maps AH0 to ㅡ after velar G', () => {
    const tokens = phonemesToJamoTokens(['G', 'AH0', 'L']);
    const vowels = tokens.filter(t => t.type === 'V');
    expect(vowels.length).toBe(1);
    expect((vowels[0] as VowelToken).jamo).toBe('ㅡ');
  });

  it('maps AH0 to ㅓ in medial position (default)', () => {
    const tokens = phonemesToJamoTokens(['JH', 'AH0', 'L']);
    const vowels = tokens.filter(t => t.type === 'V');
    expect(vowels.length).toBe(1);
    expect((vowels[0] as VowelToken).jamo).toBe('ㅓ');
  });

  // ── Semivowel compounds ────────────────────────────────────────────

  it('merges W + vowel into compound', () => {
    const tokens = phonemesToJamoTokens(['W', 'AA']);
    expect(tokens.length).toBe(1);
    expect((tokens[0] as VowelToken).jamo).toBe('ㅘ');
  });

  it('merges Y + vowel into compound', () => {
    const tokens = phonemesToJamoTokens(['Y', 'AA']);
    expect(tokens.length).toBe(1);
    expect((tokens[0] as VowelToken).jamo).toBe('ㅑ');
  });

  it('maps standalone W to ㅜ', () => {
    const tokens = phonemesToJamoTokens(['W']);
    expect(tokens.length).toBe(1);
    expect((tokens[0] as VowelToken).jamo).toBe('ㅜ');
  });

  it('maps standalone Y to ㅣ', () => {
    const tokens = phonemesToJamoTokens(['Y']);
    expect(tokens.length).toBe(1);
    expect((tokens[0] as VowelToken).jamo).toBe('ㅣ');
  });

  // ── Diphthong splitting ────────────────────────────────────────────

  it('splits AY diphthong into two vowel tokens', () => {
    const tokens = phonemesToJamoTokens(['AY']);
    const vowels = tokens.filter(t => t.type === 'V');
    expect(vowels.length).toBe(2);
    expect((vowels[0] as VowelToken).jamo).toBe('ㅏ');
    expect((vowels[1] as VowelToken).jamo).toBe('ㅣ');
  });

  // ── Consonant deduplication ────────────────────────────────────────

  it('deduplicates consecutive identical consonant jamo', () => {
    const tokens = phonemesToJamoTokens(['R', 'L', 'AA']);
    const consonants = tokens.filter(t => t.type === 'C');
    expect(consonants.length).toBe(1);
    expect((consonants[0] as ConsonantToken).jamo).toBe('ㄹ');
  });

  // ── Unknown phonemes ───────────────────────────────────────────────

  it('skips unknown phonemes without crashing', () => {
    const tokens = phonemesToJamoTokens(['XX', 'M', 'AA']);
    expect(tokens.length).toBeGreaterThan(0);
  });
});

describe('jamoTokensToSyllables', () => {
  // ── Basic syllable assembly ────────────────────────────────────────

  it('composes a simple CV syllable', () => {
    const tokens = [
      { type: 'C', jamo: 'ㅁ', arpabet: 'M' },
      { type: 'V', jamo: 'ㅏ', arpabet: 'AA' },
    ] as const;
    const result = jamoTokensToSyllables([...tokens] as any);
    expect(result.syllables.length).toBe(1);
    expect(result.syllables[0]!.char).toBe('마');
  });

  it('composes a CVC syllable with valid batchim', () => {
    const tokens = [
      { type: 'C', jamo: 'ㅁ', arpabet: 'M' },
      { type: 'V', jamo: 'ㅏ', arpabet: 'AA' },
      { type: 'C', jamo: 'ㄴ', arpabet: 'N' },
    ] as const;
    const result = jamoTokensToSyllables([...tokens] as any);
    expect(result.syllables.length).toBe(1);
    expect(result.syllables[0]!.char).toBe('만');
    expect(result.syllables[0]!.jong).toBe('ㄴ');
  });

  // ── L special case ─────────────────────────────────────────────────

  it('places L between vowels as batchim + next onset', () => {
    const tokens = phonemesToJamoTokens(['AH0', 'L', 'AA']);
    const result = jamoTokensToSyllables(tokens);
    expect(result.syllables.length).toBeGreaterThanOrEqual(2);
    const hasLbatchim = result.syllables.some(s => s.jong === 'ㄹ');
    const hasLonset = result.syllables.some(s => s.cho === 'ㄹ');
    expect(hasLbatchim || hasLonset).toBe(true);
  });

  // ── Plosive → plain batchim after short vowel ─────────────────────

  it('maps word-final plosive after short vowel to plain batchim', () => {
    const tokens = phonemesToJamoTokens(['N', 'IH', 'K']);
    const result = jamoTokensToSyllables(tokens);
    expect(result.syllables.length).toBe(1);
    expect(result.syllables[0]!.jong).toBe('ㄱ');
    expect(result.syllables[0]!.char).toBe('닉');
  });

  // ── Hangul composition ─────────────────────────────────────────────

  it('composes 마이클 for M AY K AH0 L', () => {
    const tokens = phonemesToJamoTokens(['M', 'AY', 'K', 'AH0', 'L']);
    const result = jamoTokensToSyllables(tokens);
    expect(result.hangul).toBe('마이클');
  });

  it('produces valid Unicode Hangul syllables', () => {
    const tokens = phonemesToJamoTokens(['M', 'AA', 'N']);
    const result = jamoTokensToSyllables(tokens);
    for (const ch of result.hangul) {
      const cp = ch.codePointAt(0)!;
      expect(cp).toBeGreaterThanOrEqual(0xac00);
      expect(cp).toBeLessThanOrEqual(0xd7af);
    }
  });

  // ── Edge cases ─────────────────────────────────────────────────────

  it('handles empty token array', () => {
    const result = jamoTokensToSyllables([]);
    expect(result.syllables).toEqual([]);
    expect(result.hangul).toBe('');
  });

  it('handles vowel-only tokens with silent ㅇ onset', () => {
    const tokens = [
      { type: 'V', jamo: 'ㅏ', arpabet: 'AA' },
    ] as const;
    const result = jamoTokensToSyllables([...tokens] as any);
    expect(result.syllables.length).toBe(1);
    expect(result.syllables[0]!.cho).toBe('ㅇ');
    expect(result.syllables[0]!.char).toBe('아');
  });
});
