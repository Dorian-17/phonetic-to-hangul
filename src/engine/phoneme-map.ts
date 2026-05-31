// ARPAbet consonant → Korean initial (초성) jamo
export const CONSONANT_TO_CHO: Record<string, string> = {
  P: 'ㅍ', B: 'ㅂ',
  T: 'ㅌ', D: 'ㄷ',
  K: 'ㅋ', G: 'ㄱ',
  F: 'ㅍ', V: 'ㅂ',
  S: 'ㅅ', Z: 'ㅈ',
  SH: 'ㅅ', ZH: 'ㅈ',
  TH: 'ㅅ', DH: 'ㄷ',
  CH: 'ㅊ', JH: 'ㅈ',
  L: 'ㄹ', R: 'ㄹ',
  M: 'ㅁ', N: 'ㄴ',
  NG: 'ㅇ', HH: 'ㅎ',
  // W and Y are semivowels — handled in synthesizer, not here
};

// ARPAbet vowel → Korean medial (중성) jamo
// Two-character values = diphthong, expanded into two tokens in synthesizer
// AH0 = unstressed schwa → ㅡ; AH (stressed) → ㅓ
export const VOWEL_TO_JUNG: Record<string, string> = {
  AA: 'ㅏ',
  AE: 'ㅐ',
  AH: 'ㅓ',
  AH0: 'ㅡ',
  AO: 'ㅗ',
  AW: 'ㅏㅜ', // aʊ → ㅏ + ㅜ
  AY: 'ㅏㅣ', // aɪ → ㅏ + ㅣ
  EH: 'ㅔ',
  ER: 'ㅓ',
  EY: 'ㅔㅣ', // eɪ → ㅔ + ㅣ
  IH: 'ㅣ',
  IY: 'ㅣ',
  OW: 'ㅗ',
  OY: 'ㅗㅣ', // ɔɪ → ㅗ + ㅣ
  UH: 'ㅓ',
  UW: 'ㅜ',
};

// Semivowel W + following ARPAbet vowel → compound jungseong
export const W_COMPOUND: Record<string, string> = {
  'W|AA': 'ㅘ',
  'W|AE': 'ㅘ',
  'W|AH': 'ㅝ',
  'W|AO': 'ㅘ',
  'W|EH': 'ㅞ',
  'W|EY': 'ㅞ',
  'W|IH': 'ㅟ', // "wi" → ㅟ (e.g. William → 윌)
  'W|IY': 'ㅟ',
  'W|OW': 'ㅗ',
  'W|UH': 'ㅝ',
  'W|UW': 'ㅜ',
};

// Semivowel Y + following ARPAbet vowel → compound jungseong
export const Y_COMPOUND: Record<string, string> = {
  'Y|AA': 'ㅑ',
  'Y|AE': 'ㅒ',
  'Y|AH': 'ㅕ',
  'Y|AH0': 'ㅕ', // unstressed schwa after Y → ㅕ
  'Y|AO': 'ㅛ',
  'Y|EH': 'ㅖ',
  'Y|EY': 'ㅖ',
  'Y|IH': 'ㅣ',
  'Y|IY': 'ㅣ',
  'Y|OW': 'ㅛ',
  'Y|UH': 'ㅕ',
  'Y|UW': 'ㅠ',
};

// Hangul syllable composition constants (U+AC00 base)
// 초성 (chosung) — 19 initials in Unicode codepoint order
export const CHO_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
export const CHO_INDEX: Record<string, number> = Object.fromEntries(
  CHO_LIST.map((j, i) => [j, i]),
);

// 중성 (jungseong) — 21 vowels in Unicode codepoint order
export const JUNG_LIST = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ',
  'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
];
export const JUNG_INDEX: Record<string, number> = Object.fromEntries(
  JUNG_LIST.map((j, i) => [j, i]),
);

// 종성 (jongseong) — index 0 = no batchim, 1-27 = consonants
export const JONG_LIST = [
  '',
  'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ',
  'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ',
  'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
export const JONG_INDEX: Record<string, number> = Object.fromEntries(
  JONG_LIST.map((j, i) => [j, i]),
);

// Consonants valid as loanword batchim (받침) per Korean loanword orthography
export const VALID_JONG = new Set(['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ']);

// ARPAbet tokens that are plosives (require epenthesis at long-vowel word end)
export const PLOSIVES = new Set(['P', 'B', 'T', 'D', 'K', 'G']);

// At word-end after a SHORT vowel, plosives become plain (unreleased) batchim
// e.g. Nick → 닉 (ㄱ not ㅋ), tip → 팁 (ㅂ not ㅍ), kit → 킷 (ㅅ not ㅌ)
export const PLOSIVE_TO_JONG: Record<string, string> = {
  K: 'ㄱ', G: 'ㄱ',
  P: 'ㅂ', B: 'ㅂ',
  T: 'ㅅ', D: 'ㄷ',
};

// ARPAbet vowels classified as long (trigger ㅡ epenthesis before plosive at word end)
export const LONG_VOWELS = new Set(['IY', 'EY', 'AY', 'OW', 'OY', 'AW', 'UW', 'AO', 'ER']);

// Set of ARPAbet vowel codes (derived from VOWEL_TO_JUNG keys)
// Single source of truth — imported by the UI for token classification
export const VOWEL_CODES = new Set(Object.keys(VOWEL_TO_JUNG));

// ARPAbet → IPA for display in the decomposition view
export const ARPABET_TO_IPA: Record<string, string> = {
  AA: 'ɑ', AE: 'æ', AH: 'ʌ', AH0: 'ə', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ',
  EH: 'ɛ', ER: 'ɝ', EY: 'eɪ', IH: 'ɪ', IY: 'i', OW: 'oʊ',
  OY: 'ɔɪ', UH: 'ʊ', UW: 'u',
  P: 'p', B: 'b', T: 't', D: 'd', K: 'k', G: 'ɡ',
  F: 'f', V: 'v', S: 's', Z: 'z', SH: 'ʃ', ZH: 'ʒ',
  TH: 'θ', DH: 'ð', CH: 'tʃ', JH: 'dʒ',
  L: 'l', R: 'ɹ', M: 'm', N: 'n', NG: 'ŋ', HH: 'h',
  W: 'w', Y: 'j',
};
