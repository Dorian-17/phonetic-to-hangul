import {
  CONSONANT_TO_CHO,
  VOWEL_TO_JUNG,
  W_COMPOUND,
  Y_COMPOUND,
  CHO_INDEX,
  JUNG_INDEX,
  JONG_INDEX,
  VALID_JONG,
  PLOSIVES,
  LONG_VOWELS,
  PLOSIVE_TO_JONG,
} from './phoneme-map';

// ---------------------------------------------------------------------------
// Token types
// ---------------------------------------------------------------------------

export interface ConsonantToken {
  type: 'C';
  jamo: string;     // e.g. 'ㅁ'
  arpabet: string;  // e.g. 'M'
}

export interface VowelToken {
  type: 'V';
  jamo: string;     // e.g. 'ㅏ' or compound 'ㅘ'
  arpabet: string;  // e.g. 'AA' or 'W AA' for compound
}

export type JamoToken = ConsonantToken | VowelToken;

export interface HangulSyllable {
  cho: string;   // initial consonant jamo
  jung: string;  // medial vowel jamo (may be compound)
  jong: string;  // final consonant jamo or '' for none
  char: string;  // composed Unicode Hangul character
}

export interface SynthesisResult {
  syllables: HangulSyllable[];
  hangul: string;
}

// ---------------------------------------------------------------------------
// Step A: ARPAbet phoneme array → Jamo token stream
// ---------------------------------------------------------------------------

// Diphthong ARPAbet tokens that must be split into two separate vowel tokens
const DIPHTHONG_SPLIT: Record<string, [string, string]> = {
  'ㅏㅣ': ['ㅏ', 'ㅣ'], // AY
  'ㅏㅜ': ['ㅏ', 'ㅜ'], // AW
  'ㅔㅣ': ['ㅔ', 'ㅣ'], // EY
  'ㅗㅣ': ['ㅗ', 'ㅣ'], // OY
};

export function phonemesToJamoTokens(phonemes: string[]): JamoToken[] {
  const tokens: JamoToken[] = [];
  let i = 0;

  while (i < phonemes.length) {
    const p = phonemes[i] ?? '';

    // -- Semivowel W or Y: try to merge with following vowel --
    if (p === 'W' || p === 'Y') {
      const next = phonemes[i + 1];
      if (next !== undefined && VOWEL_TO_JUNG[next] !== undefined) {
        const key = `${p}|${next}`;
        const table = p === 'W' ? W_COMPOUND : Y_COMPOUND;
        const compound = table[key];
        if (compound !== undefined) {
          tokens.push({ type: 'V', jamo: compound, arpabet: `${p} ${next}` });
          i += 2;
          continue;
        }
        // No compound found — emit the vowel alone
        const jamo = VOWEL_TO_JUNG[next] ?? 'ㅓ';
        for (const tok of expandVowel(jamo, next)) tokens.push(tok);
        i += 2;
        continue;
      }
      // Standalone W/Y (not followed by a vowel)
      tokens.push({ type: 'V', jamo: p === 'W' ? 'ㅜ' : 'ㅣ', arpabet: p });
      i++;
      continue;
    }

    // -- Context-aware AH0 (unstressed schwa): word-final→ㅏ, after K/G→ㅡ, else→ㅓ --
    if (p === 'AH0') {
      const prevP = phonemes[i - 1];
      const nextP = phonemes[i + 1];
      let jamo: string;
      if (nextP === undefined) {
        jamo = 'ㅏ'; // word-final schwa: Victoria, Angela, etc.
      } else if (prevP === 'K' || prevP === 'G') {
        jamo = 'ㅡ'; // after velar: Michael (K AH0 L → 클)
      } else {
        jamo = 'ㅓ'; // medial schwa default: Angela (JH AH0 L → 절)
      }
      tokens.push({ type: 'V', jamo, arpabet: 'AH0' });
      i++;
      continue;
    }

    // -- Regular vowel --
    const jungJamo = VOWEL_TO_JUNG[p];
    if (jungJamo !== undefined) {
      for (const tok of expandVowel(jungJamo, p)) tokens.push(tok);
      i++;
      continue;
    }

    // -- Consonant --
    const choJamo = CONSONANT_TO_CHO[p];
    if (choJamo !== undefined) {
      tokens.push({ type: 'C', jamo: choJamo, arpabet: p });
      i++;
      continue;
    }

    i++; // skip unknown
  }

  // Deduplicate consecutive identical consonant jamo (e.g. R+L both → ㄹ → keep one)
  return dedupeConsecutiveConsonants(tokens);
}

function dedupeConsecutiveConsonants(tokens: JamoToken[]): JamoToken[] {
  return tokens.filter((tok, i) => {
    if (tok.type !== 'C') return true;
    const prev = tokens[i - 1];
    return prev === undefined || prev.type !== 'C' || prev.jamo !== tok.jamo;
  });
}

// Expand a vowel jamo string: diphthongs become two VowelTokens
function expandVowel(jamo: string, arpabet: string): VowelToken[] {
  const split = DIPHTHONG_SPLIT[jamo];
  if (split !== undefined) {
    return [
      { type: 'V', jamo: split[0], arpabet },
      { type: 'V', jamo: split[1], arpabet },
    ];
  }
  return [{ type: 'V', jamo, arpabet }];
}

// ---------------------------------------------------------------------------
// Step B: Jamo token stream → Hangul syllable list (batchim algorithm)
// ---------------------------------------------------------------------------

export function jamoTokensToSyllables(tokens: JamoToken[]): SynthesisResult {
  const syllables: HangulSyllable[] = [];
  const SILENT_CHO = 'ㅇ';

  let pendingCho: string = SILENT_CHO;
  let pendingVowel: string | null = null;
  let lastVowelArpabet: string = '';

  const commit = (cho: string, jung: string, jong: string) => {
    syllables.push({ cho, jung, jong, char: composeHangul(cho, jung, jong) });
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]!;
    const next = tokens[i + 1] ?? null;

    if (tok.type === 'V') {
      lastVowelArpabet = tok.arpabet;
      if (pendingVowel === null) {
        pendingVowel = tok.jamo;
      } else {
        // Two vowels in a row — flush the current syllable then start fresh
        commit(pendingCho, pendingVowel, '');
        pendingCho = SILENT_CHO;
        pendingVowel = tok.jamo;
      }
      continue;
    }

    // Consonant token
    if (pendingVowel === null) {
      // No vowel pending yet
      if (pendingCho !== SILENT_CHO) {
        // Two consonants with no vowel: ㅡ epenthesis for the first
        commit(pendingCho, 'ㅡ', '');
      }
      pendingCho = tok.jamo;
    } else {
      // We have a pending vowel — decide: batchim or initial of next syllable?
      if (next !== null && next.type === 'V') {
        // Consonant between two vowels
        if (tok.arpabet === 'L') {
          // Korean loanword rule: English /l/ between vowels → ㄹ batchim + ㄹ onset
          // (e.g. Angela 절라, Stella 스텔라, Kelly 켈리)
          commit(pendingCho, pendingVowel, 'ㄹ');
        } else {
          // All other consonants (including R) → onset of next syllable only
          commit(pendingCho, pendingVowel, '');
        }
        pendingCho = tok.jamo;
        pendingVowel = null;
      } else if (next === null && PLOSIVES.has(tok.arpabet) && LONG_VOWELS.has(lastVowelArpabet)) {
        // Word-final plosive after long vowel → ㅡ epenthesis (e.g. Luke → 루크)
        commit(pendingCho, pendingVowel, '');
        commit(tok.jamo, 'ㅡ', '');
        pendingCho = SILENT_CHO;
        pendingVowel = null;
      } else if (PLOSIVES.has(tok.arpabet) && !LONG_VOWELS.has(lastVowelArpabet)) {
        // Plosive in coda after short vowel → plain batchim
        // Applies both at word end (Nick → 닉) and before another consonant (Victoria → 빅토)
        const jong = PLOSIVE_TO_JONG[tok.arpabet] ?? tok.jamo;
        commit(pendingCho, pendingVowel, jong);
        pendingCho = SILENT_CHO;
        pendingVowel = null;
      } else if (VALID_JONG.has(tok.jamo)) {
        // Valid batchim consonant (nasal, lateral, fricative)
        commit(pendingCho, pendingVowel, tok.jamo);
        pendingCho = SILENT_CHO;
        pendingVowel = null;
      } else {
        // Invalid batchim — flush current syllable, consonant becomes next cho
        commit(pendingCho, pendingVowel, '');
        pendingCho = tok.jamo;
        pendingVowel = null;
      }
    }
  }

  // Flush any remaining state
  if (pendingVowel !== null) {
    commit(pendingCho, pendingVowel, '');
  } else if (pendingCho !== SILENT_CHO) {
    commit(pendingCho, 'ㅡ', '');
  }

  return {
    syllables,
    hangul: syllables.map(s => s.char).join(''),
  };
}

// ---------------------------------------------------------------------------
// Step C: Compose a Hangul syllable block from cho + jung + jong indices
// ---------------------------------------------------------------------------

function composeHangul(cho: string, jung: string, jong: string): string {
  const choIdx = CHO_INDEX[cho];
  const jungIdx = JUNG_INDEX[jung];
  const jongIdx = jong === '' ? 0 : (JONG_INDEX[jong] ?? 0);

  if (choIdx === undefined || jungIdx === undefined) {
    // Fallback: return raw jamo if composition fails
    return cho + jung + jong;
  }

  const codePoint = 0xac00 + (choIdx * 21 + jungIdx) * 28 + jongIdx;
  return String.fromCodePoint(codePoint);
}
