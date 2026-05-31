import { describe, it, expect, beforeAll } from 'vitest';
import { getPhonemes, loadDictionary, isDictionaryLoaded } from './g2p';

describe('getPhonemes', () => {
  // Load CMU dictionary before tests that need it
  beforeAll(async () => {
    await loadDictionary();
  });

  // ── CMU dictionary lookup ──────────────────────────────────────────

  it('loads CMU dictionary', () => {
    expect(isDictionaryLoaded()).toBe(true);
  });

  it('looks up common name in CMU dictionary', () => {
    const result = getPhonemes('michael');
    expect(result.source).toBe('cmu');
    expect(result.phonemes.length).toBeGreaterThan(0);
    expect(result.phonemes).toContain('M');
    expect(result.phonemes).toContain('AY');
    expect(result.phonemes).toContain('AH0');
  });

  it('falls back to rules for unknown name', () => {
    const result = getPhonemes('zzzxyzzy');
    expect(result.source).toBe('rule');
    expect(result.phonemes.length).toBeGreaterThan(0);
  });

  it('handles empty string gracefully', () => {
    const result = getPhonemes('');
    expect(result.source).toBe('rule');
    expect(result.phonemes).toEqual([]);
  });

  // ── Stress stripping ───────────────────────────────────────────────

  it('preserves AH0 but strips numeric stress from other vowels', () => {
    const result = getPhonemes('michael');
    expect(result.source).toBe('cmu');
    expect(result.phonemes).toContain('AH0');
    expect(result.phonemes).toContain('AY');
    for (const p of result.phonemes) {
      if (p !== 'AH0') {
        expect(p).not.toMatch(/[012]$/);
      }
    }
  });

  // ── IPA mapping ────────────────────────────────────────────────────

  it('returns parallel IPA for display', () => {
    const result = getPhonemes('michael');
    expect(result.ipa.length).toBe(result.phonemes.length);
    result.ipa.forEach(ipa => {
      expect(typeof ipa).toBe('string');
    });
  });

  // ── Rule-based fallback: basic consonants ──────────────────────────

  it('maps basic consonants correctly', () => {
    const result = getPhonemes('bdfg');
    expect(result.source).toBe('rule');
    expect(result.phonemes).toEqual(['B', 'D', 'F', 'G']);
  });

  // ── Rule-based fallback: digraph consonants ────────────────────────

  it('maps sh digraph to SH', () => {
    const r = getPhonemes('shmoo');
    expect(r.source).toBe('rule');
    expect(r.phonemes[0]).toBe('SH');
  });

  it('maps ch digraph to CH', () => {
    const r = getPhonemes('chmoo');
    expect(r.source).toBe('rule');
    expect(r.phonemes[0]).toBe('CH');
  });

  it('maps th digraph to TH', () => {
    const r = getPhonemes('thmoo');
    expect(r.source).toBe('rule');
    expect(r.phonemes[0]).toBe('TH');
  });

  it('maps ph digraph to F', () => {
    const r = getPhonemes('phmoo');
    expect(r.source).toBe('rule');
    expect(r.phonemes[0]).toBe('F');
  });

  // ── Rule-based fallback: soft c/g before i/e/y ─────────────────────

  it('applies soft c before i, e, y', () => {
    expect(getPhonemes('cimoo').phonemes[0]).toBe('S');
    expect(getPhonemes('cemoo').phonemes[0]).toBe('S');
    expect(getPhonemes('cymoo').phonemes[0]).toBe('S');
  });

  it('applies hard c before other vowels', () => {
    expect(getPhonemes('camoo').phonemes[0]).toBe('K');
    expect(getPhonemes('comoo').phonemes[0]).toBe('K');
    expect(getPhonemes('cumoo').phonemes[0]).toBe('K');
  });

  it('applies soft g before i, e, y', () => {
    expect(getPhonemes('gimoo').phonemes[0]).toBe('JH');
    expect(getPhonemes('gemoo').phonemes[0]).toBe('JH');
  });

  // ── Rule-based fallback: vowel digraphs ────────────────────────────

  it('maps ee and oo vowel digraphs', () => {
    expect(getPhonemes('eemoo').phonemes[0]).toBe('IY');
    expect(getPhonemes('oomoo').phonemes[0]).toBe('UW');
  });

  it('maps ai and oy vowel digraphs', () => {
    expect(getPhonemes('aimoo').phonemes[0]).toBe('EY');
    expect(getPhonemes('oymoo').phonemes[0]).toBe('OY');
  });

  // ── Rule-based: x → K S, qu → K W ─────────────────────────────────

  it('maps x to K S', () => {
    const result = getPhonemes('axmoo');
    expect(result.phonemes).toContain('K');
    expect(result.phonemes).toContain('S');
  });

  it('maps qu to K W', () => {
    const r = getPhonemes('quamoo');
    expect(r.source).toBe('rule');
    expect(r.phonemes[0]).toBe('K');
    expect(r.phonemes[1]).toBe('W');
  });

  // ── unknown characters ─────────────────────────────────────────────

  it('skips unknown characters without crashing', () => {
    const result = getPhonemes('a1b');
    expect(result.source).toBe('rule');
    expect(result.phonemes.length).toBeGreaterThanOrEqual(2);
  });
});
