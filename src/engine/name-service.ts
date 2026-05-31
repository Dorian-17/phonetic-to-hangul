import type { KoreanNameProfile, FanMood } from '../types';
import { generateKoreanNameProfile } from './name-profile';
import { loadDictionary, isDictionaryLoaded } from './g2p';

/**
 * Extracts a person's name from natural-language speech input, and
 * generates Korean transliterations using the existing phonetic engine.
 *
 * The `generateKoreanName` function waits for the CMU dictionary before
 * generating the name, so real browser usage produces the same quality
 * output as the test suite. If the dictionary fails to load (network
 * error, 404, etc.), the function falls back to the rule-based engine
 * and sets `errorMessage` so the UI can inform the user.
 *
 * Patterns recognised (case-insensitive):
 *   "my name is Dorian"       → "Dorian"
 *   "I'm Mina" / "I am Mina"  → "Mina"
 *   "this is John"            → "John"
 *   "call me Sarah"           → "Sarah"
 *   "it's Tom" / "it is Tom"  → "Tom"
 *   "Michael"                 → "Michael"
 *   "Hi, I'm Grace Kim"       → "Grace Kim"
 */

interface NameExtraction {
  /** The best-guess English name, or null if nothing recognisable was found. */
  name: string | null;
  /** Whether the extraction came from a known pattern (true) or is a fallback. */
  confident: boolean;
}

const PATTERNS: { regex: RegExp; group: number }[] = [
  { regex: /my\s+name\s+(?:is\s+)?(.+)/i, group: 1 },
  { regex: /i(?:'m|\s+am)\s+(.+)/i, group: 1 },
  { regex: /this\s+is\s+(.+)/i, group: 1 },
  { regex: /call\s+me\s+(.+)/i, group: 1 },
  { regex: /it(?:'s|\s+is)\s+(.+)/i, group: 1 },
];

/**
 * Extracts a name from the raw transcript.
 * Returns { name, confident } — name is null when nothing is found.
 */
export function extractName(transcript: string): NameExtraction {
  const cleaned = transcript.trim();
  if (!cleaned) return { name: null, confident: false };

  for (const { regex, group } of PATTERNS) {
    const match = cleaned.match(regex);
    if (match && match[group]) {
      const extracted = cleanName(match[group]);
      if (extracted) {
        return { name: extracted, confident: true };
      }
    }
  }

  // Fallback: use the whole transcript if it looks like a standalone name
  // (short, no obvious sentence structure, starts with capital letter)
  const words = cleaned.split(/\s+/);
  if (words.length <= 3 && /^[A-Z]/.test(cleaned)) {
    return { name: cleaned, confident: false };
  }

  return { name: null, confident: false };
}

/** Strips punctuation and trailing noise from the matched group. */
function cleanName(raw: string): string | null {
  const trimmed = raw
    .replace(/[,.!?;:]+$/, '')
    .replace(/^[,.!?;:]+/, '')
    .trim();

  if (!trimmed) return null;

  // Take only the first 1-2 words (handle "Grace Kim" but skip "and I love")
  const words = trimmed.split(/\s+/);
  const nameWords: string[] = [];
  for (const w of words) {
    if (/^(and|or|but|because|so|then|also)$/i.test(w)) break;
    nameWords.push(w);
    if (nameWords.length >= 2) break;
  }

  return nameWords.join(' ');
}

/**
 * Generates a Korean name profile from the English name and mood.
 * Waits for the CMU dictionary if it has not been loaded yet, then falls
 * back to the rule-based engine on any failure (no crash).
 *
 * Returns null if the English name is empty.
 *
 * Callers should set `isLoading = true` before calling and pass an
 * `onLoadStart` / `onLoadEnd` pair for UI feedback if desired.
 */
async function generateKoreanName(
  englishName: string,
  fanMood: FanMood | '',
): Promise<KoreanNameProfile | null> {
  const trimmed = englishName.trim();
  if (!trimmed) return null;

  // Ensure the CMU dictionary is loaded before generating.  If the
  // dictionary fails (network error, 404, CORS, etc.) we still produce a
  // result via the rule-based engine — the profile.source field lets the
  // UI show which engine was used.
  try {
    await loadDictionary();
  } catch {
    // Dictionary failed — rule-based fallback is handled transparently by
    // transliterate() / getPhonemes().  We just swallow the error here so
    // we never crash.
  }

  const profile = generateKoreanNameProfile({
    englishName: trimmed,
    fanMood,
  });

  // If the dictionary didn't load, surface that to the UI via errorMessage.
  if (!isDictionaryLoaded()) {
    profile.errorMessage =
      'Dictionary unavailable — using rule-based transliteration. Results may be approximate.';
  }

  return profile;
}

export const nameService = {
  extractName,
  generateKoreanName,
};
