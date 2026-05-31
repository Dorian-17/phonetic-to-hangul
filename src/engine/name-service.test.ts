import { describe, it, expect } from 'vitest';
import { extractName } from './name-service';

describe('extractName', () => {
  it('extracts "Dorian" from "My name is Dorian"', () => {
    const result = extractName('My name is Dorian');
    expect(result.name).toBe('Dorian');
    expect(result.confident).toBe(true);
  });

  it('extracts "Mina" from "I\'m Mina"', () => {
    const result = extractName("I'm Mina");
    expect(result.name).toBe('Mina');
    expect(result.confident).toBe(true);
  });

  it('extracts "John" from "This is John"', () => {
    const result = extractName('This is John');
    expect(result.name).toBe('John');
  });

  it('extracts "Sarah" from "Call me Sarah"', () => {
    const result = extractName('Call me Sarah');
    expect(result.name).toBe('Sarah');
  });

  it('extracts "Tom" from "it\'s Tom"', () => {
    const result = extractName("it's Tom");
    expect(result.name).toBe('Tom');
  });

  it('extracts standalone name "Michael"', () => {
    const result = extractName('Michael');
    expect(result.name).toBe('Michael');
    expect(result.confident).toBe(false);
  });

  it('returns null for empty transcript', () => {
    const result = extractName('');
    expect(result.name).toBeNull();
    expect(result.confident).toBe(false);
  });

  it('returns null for unrecognisable long sentence', () => {
    const result = extractName('I really love listening to music every day');
    expect(result.name).toBeNull();
  });
});
