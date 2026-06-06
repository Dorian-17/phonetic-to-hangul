import { transliterate } from './index';

// ── Revised Romanization (simplified) ──────────────────────────────────────

const ROM_CHO: Record<string, string> = {
  ㄱ:'g',ㄲ:'kk',ㄴ:'n',ㄷ:'d',ㄸ:'tt',ㄹ:'r',ㅁ:'m',ㅂ:'b',ㅃ:'pp',
  ㅅ:'s',ㅆ:'ss',ㅇ:'',ㅈ:'j',ㅉ:'jj',ㅊ:'ch',ㅋ:'k',ㅌ:'t',ㅍ:'p',ㅎ:'h',
};
const ROM_JUNG: Record<string, string> = {
  ㅏ:'a',ㅐ:'ae',ㅑ:'ya',ㅒ:'yae',ㅓ:'eo',ㅔ:'e',ㅕ:'yeo',ㅖ:'ye',
  ㅗ:'o',ㅘ:'wa',ㅙ:'wae',ㅚ:'oe',ㅛ:'yo',ㅜ:'u',ㅝ:'wo',ㅞ:'we',
  ㅟ:'wi',ㅠ:'yu',ㅡ:'eu',ㅢ:'ui',ㅣ:'i',
};
const ROM_JONG: Record<string, string> = {
  ㄱ:'k',ㄲ:'k',ㄳ:'ks',ㄴ:'n',ㄵ:'nj',ㄶ:'nh',ㄷ:'t',ㄹ:'l',
  ㄺ:'lk',ㄻ:'lm',ㄼ:'lb',ㄽ:'ls',ㄾ:'lt',ㄿ:'lp',ㅀ:'lh',ㅁ:'m',
  ㅂ:'p',ㅄ:'ps',ㅅ:'t',ㅆ:'t',ㅇ:'ng',ㅈ:'t',ㅊ:'t',ㅋ:'k',ㅌ:'t',ㅍ:'p',ㅎ:'t',
};

function romanize(cho: string, jung: string, jong: string): string {
  return (ROM_CHO[cho] ?? cho) + (ROM_JUNG[jung] ?? jung) + (ROM_JONG[jong] ?? '');
}

// ── Card ID ────────────────────────────────────────────────────────────────

function generateCardId(name: string): string {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  let h = 5381;
  for (let i = 0; i < name.length; i++) h = ((h << 5) + h + name.charCodeAt(i)) & 0xffff;
  return `KaZa-${date}-${h.toString(16).padStart(4,'0').slice(-4).toUpperCase()}`;
}

// ── Public API ─────────────────────────────────────────────────────────────

export interface NameIdentityResult {
  originalName: string;
  koreanName: string;
  romanization: string;
  source: 'cmu' | 'rule';
  cardId: string;
  phonemes: string[];
  ipa: string[];
}

/** Generates a Korean name identity. Pure wrapper around transliterate(). */
export function generateNameIdentity(englishName: string): NameIdentityResult {
  const trimmed = englishName.trim();
  if (!trimmed) {
    return { originalName: '', koreanName: '', romanization: '', source: 'rule', cardId: '', phonemes: [], ipa: [] };
  }
  const r = transliterate(trimmed);
  const romanParts = r.syllables.map((s) => romanize(s.cho, s.jung, s.jong));
  const romanization = romanParts.join('').replace(/^./, (c) => c.toUpperCase());
  return {
    originalName: trimmed,
    koreanName: r.hangul,
    romanization,
    source: r.source,
    cardId: generateCardId(trimmed),
    phonemes: r.phonemes,
    ipa: r.ipa,
  };
}
