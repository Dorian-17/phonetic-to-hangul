import { describe, it, expect, beforeAll } from 'vitest';
import { generateNameIdentity } from './name-identity';
import { loadDictionary } from './g2p';

describe('generateNameIdentity', () => {
  beforeAll(async () => { await loadDictionary(); });

  it('Michael → 마이클', () => {
    const r = generateNameIdentity('Michael');
    expect(r.koreanName).toBe('마이클');
    expect(r.romanization).toBe('Maikeul');
    expect(r.originalName).toBe('Michael');
    expect(r.cardId).toMatch(/^KaZa-\d{8}-[0-9A-F]{4}$/);
    expect(r.source).toBe('cmu');
  });

  it('Emma → valid output', () => {
    const r = generateNameIdentity('Emma');
    expect(r.koreanName.length).toBeGreaterThan(0);
    expect(r.romanization.length).toBeGreaterThan(0);
  });

  it('Daniel → valid output', () => {
    const r = generateNameIdentity('Daniel');
    expect(r.koreanName).not.toBe('');
    expect(r.phonemes.length).toBeGreaterThan(0);
  });

  it('empty name → empty result', () => {
    const r = generateNameIdentity('');
    expect(r.koreanName).toBe('');
    expect(r.cardId).toBe('');
  });

  it('deterministic output', () => {
    const a = generateNameIdentity('Michael');
    const b = generateNameIdentity('Michael');
    expect(a).toEqual(b);
  });
});
