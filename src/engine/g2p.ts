import { ARPABET_TO_IPA } from './phoneme-map';

// CMU dictionary is lazily loaded via dynamic import() to avoid bloating
// the initial bundle (the dictionary is ~4.8 MB). It is loaded once at
// startup and cached. Until it arrives, rule-based G2P is used.
let CMU: Record<string, string> | null = null;
let cmuLoadPromise: Promise<void> | null = null;

export async function loadDictionary(): Promise<void> {
  if (CMU) return;
  if (cmuLoadPromise) return cmuLoadPromise;
  cmuLoadPromise = import('cmu-pronouncing-dictionary').then(mod => {
    const raw = (mod.default ?? mod) as unknown;
    if (isValidDictionary(raw)) {
      CMU = raw;
    } else {
      console.warn('CMU dictionary failed runtime validation — using rule-based fallback');
    }
  });
  return cmuLoadPromise;
}

function isValidDictionary(value: unknown): value is Record<string, string> {
  if (value === null || typeof value !== 'object') return false;
  const keys = Object.keys(value as object);
  // CMU dict has 130k+ entries; require at least 1000 as a sanity check
  if (keys.length < 1000) return false;
  // Spot-check: first key should be a lowercase word, value should be a string
  const firstKey = keys[0]!;
  const firstValue = (value as Record<string, unknown>)[firstKey];
  return typeof firstKey === 'string' && typeof firstValue === 'string';
}

export function isDictionaryLoaded(): boolean {
  return CMU !== null;
}

export interface G2PResult {
  phonemes: string[]; // stress-stripped ARPAbet tokens, e.g. ['M','AY','K']
  ipa: string[];      // parallel IPA representations for display
  source: 'cmu' | 'rule';
}

function stripStress(token: string): string {
  // Preserve AH0 (unstressed schwa → ㅡ) vs AH1/AH2 (stressed → ㅓ)
  if (token === 'AH0') return 'AH0';
  return token.replace(/[012]$/u, '');
}

export function getPhonemes(word: string): G2PResult {
  const key = word.toLowerCase();

  // Try CMU dictionary if already loaded
  if (CMU) {
    const raw = CMU[key] ?? CMU[`${key}(1)`];
    if (raw) {
      const phonemes = raw.split(' ').map(stripStress);
      return { phonemes, ipa: phonemes.map(p => ARPABET_TO_IPA[p] ?? p), source: 'cmu' };
    }
  }

  return fallbackG2P(word);
}

// ---------------------------------------------------------------------------
// Fallback rule-based G2P for names not found in CMU dict
// Rules applied left-to-right, longest match first
// ---------------------------------------------------------------------------

type Rule = [RegExp, string[]];

const RULES: Rule[] = [
  // ---- Trigraph / special sequences ----
  [/^ght/i, ['T']],
  [/^tch/i, ['CH']],
  [/^dge/i, ['JH']],
  [/^sch/i, ['S', 'K']],

  // ---- Digraph consonants ----
  [/^ph/i, ['F']],
  [/^ck/i, ['K']],
  [/^ch/i, ['CH']],
  [/^sh/i, ['SH']],
  [/^th/i, ['TH']],
  [/^wh/i, ['W']],
  [/^ng/i, ['NG']],
  [/^qu/i, ['K', 'W']],
  [/^kn/i, ['N']],
  [/^wr/i, ['R']],
  [/^gn/i, ['N']],

  // ---- Vowel digraphs (before single vowels) ----
  [/^ee/i, ['IY']],
  [/^ea/i, ['IY']],
  [/^oo/i, ['UW']],
  [/^ou/i, ['AW']],
  [/^ow(?=[^aeiou]|$)/i, ['OW']], // "low", "show"
  [/^ow/i, ['AW']], // "cow", "now"
  [/^oi/i, ['OY']],
  [/^oy/i, ['OY']],
  [/^au/i, ['AO']],
  [/^aw/i, ['AO']],
  [/^ai/i, ['EY']],
  [/^ay/i, ['EY']],
  [/^ey/i, ['EY']],
  [/^ie/i, ['IY']],

  // ---- Magic-e long vowels (vowel + consonant(s) + e at end) ----
  [/^a(?=[^aeiou]+e(?:[^a-z]|$))/i, ['EY']],
  [/^e(?=[^aeiou]+e(?:[^a-z]|$))/i, ['IY']],
  [/^i(?=[^aeiou]+e(?:[^a-z]|$))/i, ['AY']],
  [/^o(?=[^aeiou]+e(?:[^a-z]|$))/i, ['OW']],
  [/^u(?=[^aeiou]+e(?:[^a-z]|$))/i, ['UW']],

  // ---- Single consonants ----
  [/^b/i, ['B']],
  [/^c(?=[iey])/i, ['S']],
  [/^c/i, ['K']],
  [/^d/i, ['D']],
  [/^f/i, ['F']],
  [/^g(?=[iey])/i, ['JH']],
  [/^g/i, ['G']],
  [/^h/i, ['HH']],
  [/^j/i, ['JH']],
  [/^k/i, ['K']],
  [/^l/i, ['L']],
  [/^m/i, ['M']],
  [/^n/i, ['N']],
  [/^p/i, ['P']],
  [/^r/i, ['R']],
  [/^s/i, ['S']],
  [/^t/i, ['T']],
  [/^v/i, ['V']],
  [/^w/i, ['W']],
  [/^x/i, ['K', 'S']],
  [/^y(?=[aeiou])/i, ['Y']],
  [/^y/i, ['IY']],
  [/^z/i, ['Z']],

  // ---- Single vowels (after digraphs, after magic-e) ----
  [/^a/i, ['AE']],
  [/^e/i, ['EH']],
  [/^i/i, ['IH']],
  [/^o/i, ['AO']],
  [/^u/i, ['AH']],
];

// Index rules by first character for O(1) lookup instead of O(n) scan.
// Each regex starts with ^ followed by the first literal matching character.
const rulesByFirstChar = new Map<string, Rule[]>();
for (const rule of RULES) {
  const firstChar = rule[0].source[1]?.toLowerCase();
  if (firstChar) {
    const bucket = rulesByFirstChar.get(firstChar);
    if (bucket) {
      bucket.push(rule);
    } else {
      rulesByFirstChar.set(firstChar, [rule]);
    }
  }
}

function fallbackG2P(word: string): G2PResult {
  const phonemes: string[] = [];
  let remaining = word;
  while (remaining.length > 0) {
    let matched = false;
    // Only check rules whose first character matches the current input
    const bucket = rulesByFirstChar.get(remaining[0]!.toLowerCase());
    if (bucket) {
      for (const [pattern, phones] of bucket) {
        const m = remaining.match(pattern);
        if (m) {
          phonemes.push(...phones);
          remaining = remaining.slice(m[0].length);
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      remaining = remaining.slice(1);
    }
  }
  return {
    phonemes,
    ipa: phonemes.map(p => ARPABET_TO_IPA[p] ?? p),
    source: 'rule',
  };
}
