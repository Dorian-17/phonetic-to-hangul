import type { BasicInfo, KoreanNameProfile, FanMood } from '../types';
import { transliterate } from './index';

// ── Revised Romanization: jamo → latin ────────────────────────────────────

const ROM_CHO: Record<string, string> = {
  ㄱ: 'g', ㄲ: 'kk', ㄴ: 'n', ㄷ: 'd', ㄸ: 'tt', ㄹ: 'r',
  ㅁ: 'm', ㅂ: 'b', ㅃ: 'pp', ㅅ: 's', ㅆ: 'ss', ㅇ: '',
  ㅈ: 'j', ㅉ: 'jj', ㅊ: 'ch', ㅋ: 'k', ㅌ: 't', ㅍ: 'p', ㅎ: 'h',
};

const ROM_JUNG: Record<string, string> = {
  ㅏ: 'a', ㅐ: 'ae', ㅑ: 'ya', ㅒ: 'yae', ㅓ: 'eo', ㅔ: 'e',
  ㅕ: 'yeo', ㅖ: 'ye', ㅗ: 'o', ㅘ: 'wa', ㅙ: 'wae', ㅚ: 'oe',
  ㅛ: 'yo', ㅜ: 'u', ㅝ: 'wo', ㅞ: 'we', ㅟ: 'wi', ㅠ: 'yu',
  ㅡ: 'eu', ㅢ: 'ui', ㅣ: 'i',
};

const ROM_JONG: Record<string, string> = {
  ㄱ: 'k', ㄲ: 'k', ㄳ: 'ks', ㄴ: 'n', ㄵ: 'nj', ㄶ: 'nh',
  ㄷ: 't', ㄹ: 'l', ㄺ: 'lk', ㄻ: 'lm', ㄼ: 'lb', ㄽ: 'ls',
  ㄾ: 'lt', ㄿ: 'lp', ㅀ: 'lh', ㅁ: 'm', ㅂ: 'p', ㅄ: 'ps',
  ㅅ: 't', ㅆ: 't', ㅇ: 'ng', ㅈ: 't', ㅊ: 't', ㅋ: 'k', ㅌ: 't', ㅍ: 'p', ㅎ: 't',
};

function romanizeSyllable(cho: string, jung: string, jong: string): string {
  const rCho = ROM_CHO[cho] ?? cho;
  const rJung = ROM_JUNG[jung] ?? jung;
  const rJong = ROM_JONG[jong] ?? '';
  return rCho + rJung + rJong;
}

// ── Mood templates ─────────────────────────────────────────────────────────

const MOOD_DESCRIPTIONS: Record<FanMood, string> = {
  sweet:
    'Your Korean name carries a sweet, gentle energy — the kind that makes fan letters feel like warm hugs and every greeting sound like a melody.',
  passionate:
    'Your Korean name burns with passionate energy — the kind that lights up concert halls, fuels late-night practice, and makes every chant unforgettable.',
  shy:
    'Your Korean name reflects a quiet, endearing charm — subtle but unforgettable, like a whispered promise in a crowded fan meeting.',
  funny:
    'Your Korean name has a playful, bright energy that brings smiles wherever it\'s spoken — the life of every group chat and the heart of every variety show moment.',
  cool:
    'Your Korean name exudes effortless cool — understated, confident, and impossible to ignore. It doesn\'t try hard; it doesn\'t need to.',
};

const IDENTITY_KEYWORDS: Record<FanMood, string> = {
  sweet: 'Sweetheart',
  passionate: 'Flame',
  shy: 'Whisper',
  funny: 'Sunshine',
  cool: 'Ace',
};

// ── Generator ──────────────────────────────────────────────────────────────

export function generateKoreanNameProfile(info: {
  englishName: string;
  fanMood: FanMood | '';
}): KoreanNameProfile {
  const result = transliterate(info.englishName);

  // Build romanization from the syllable breakdown
  const romanParts = result.syllables.map((syl) =>
    romanizeSyllable(syl.cho, syl.jung, syl.jong),
  );
  const romanization = romanParts
    .join('')
    .replace(/^./, (c) => c.toUpperCase());

  const mood: FanMood = info.fanMood || 'sweet';

  return {
    originalName: info.englishName,
    koreanName: result.hangul,
    romanization,
    moodDescription: MOOD_DESCRIPTIONS[mood],
    identityKeyword: IDENTITY_KEYWORDS[mood],
    pronunciationData: {
      phonemes: result.phonemes,
      ipa: result.ipa,
    },
    source: result.source,
    isLoading: false,
    errorMessage: null,
  };
}
