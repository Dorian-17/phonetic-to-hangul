import { getPhonemes } from './g2p';
import { phonemesToJamoTokens, jamoTokensToSyllables } from './synthesizer';
import type { JamoToken, HangulSyllable } from './synthesizer';

export type { JamoToken, HangulSyllable };

// Re-export generation functions for convenient single-import usage
export { generateKoreanNameProfile } from './name-profile';
export { generateFanExpression } from './fan-expression';
export { generateIdentityCard } from './identity-card';

export interface TransliterationResult {
  input: string;
  phonemes: string[];          // stress-stripped ARPAbet, e.g. ['M','AY','K']
  ipa: string[];               // parallel IPA for display, e.g. ['m','aɪ','k']
  jamoTokens: JamoToken[];     // typed jamo token stream
  syllables: HangulSyllable[]; // per-syllable breakdown
  hangul: string;              // final composed Korean string, e.g. '마이크'
  source: 'cmu' | 'rule';      // whether CMU dict was used or fallback rules
}

export function transliterate(name: string): TransliterationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return {
      input: trimmed,
      phonemes: [],
      ipa: [],
      jamoTokens: [],
      syllables: [],
      hangul: '',
      source: 'cmu',
    };
  }

  const g2p = getPhonemes(trimmed);
  const jamoTokens = phonemesToJamoTokens(g2p.phonemes);
  const { syllables, hangul } = jamoTokensToSyllables(jamoTokens);

  return {
    input: trimmed,
    phonemes: g2p.phonemes,
    ipa: g2p.ipa,
    jamoTokens,
    syllables,
    hangul,
    source: g2p.source,
  };
}
