import { describe, it, expect } from 'vitest';
import { generateFanExpression } from './fan-expression';
import type { FanExpressionInput } from '../types';

function makeInput(overrides: Partial<FanExpressionInput> = {}): FanExpressionInput {
  return { userInput: '', favoriteArtist: 'BTS', fanMood: 'sweet', koreanLevel: 'beginner', ...overrides };
}

describe('generateFanExpression', () => {
  it('generates three versions for every input', () => {
    const result = generateFanExpression(makeInput({ userInput: 'I love you so much' }));
    expect(result.versions).toHaveLength(3);
    expect(result.versions[0]!.tone).toBe('formal');
    expect(result.versions[1]!.tone).toBe('natural');
    expect(result.versions[2]!.tone).toBe('cute');
  });

  it('each version has korean, english, pronunciation, usageNote', () => {
    const result = generateFanExpression(makeInput({ userInput: 'Thank you' }));
    for (const v of result.versions) {
      expect(v.korean.length).toBeGreaterThan(0);
      expect(v.english.length).toBeGreaterThan(0);
      expect(v.pronunciation.length).toBeGreaterThan(0);
      expect(v.usageNote.length).toBeGreaterThan(0);
    }
  });

  it('matches "I love you" to Warm & Heartfelt', () => {
    const result = generateFanExpression(makeInput({ userInput: 'I love you so much' }));
    expect(result.toneLabel).toBe('Warm & Heartfelt');
  });

  it('falls back to mood default when no keyword matches', () => {
    const result = generateFanExpression(makeInput({ userInput: 'xyzzy nothing', fanMood: 'cool' }));
    expect(result.toneLabel).toBe('Confident & Smooth');
    expect(result.versions).toHaveLength(3);
  });

  it('returns same output for same input (deterministic)', () => {
    const a = generateFanExpression(makeInput({ userInput: 'You are my inspiration' }));
    const b = generateFanExpression(makeInput({ userInput: 'You are my inspiration' }));
    expect(a).toEqual(b);
  });

  it('handles Chinese input with keyword matching', () => {
    const result = generateFanExpression(makeInput({ userInput: '我真的很爱你' }));
    expect(result.versions[0]!.korean).toContain('사랑');
  });

  it('starts with empty saved array', () => {
    const result = generateFanExpression(makeInput({ userInput: 'Hello' }));
    expect(result.saved).toEqual([]);
  });
});
