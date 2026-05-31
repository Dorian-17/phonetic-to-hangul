import type { IdentityTrait, EmotionScores, IdentityProfile } from '../types';
import { ALL_TRAITS } from '../types';

// ── Trait combos → identity type + keywords ────────────────────────────────

interface IdentityTypeDefinition {
  type: string;
  keywords: string[];
  mood: string;
}

const TRAIT_COMBOS: Record<string, IdentityTypeDefinition> = {
  'Warm,Energetic': { type: 'Sunshine Supporter', keywords: ['Sunshine', 'Supporter'], mood: 'Warm & Energetic' },
  'Warm,Cute': { type: 'Sweet Heart', keywords: ['Sweet', 'Heart'], mood: 'Warm & Sweet' },
  'Warm,Cool': { type: 'Gentle Flame', keywords: ['Gentle', 'Flame'], mood: 'Warm & Cool' },
  'Cool,Mysterious': { type: 'Midnight Ace', keywords: ['Midnight', 'Ace'], mood: 'Cool & Mysterious' },
  'Cool,Elegant': { type: 'Velvet Star', keywords: ['Velvet', 'Star'], mood: 'Cool & Elegant' },
  'Cool,Energetic': { type: 'Lightning Spark', keywords: ['Lightning', 'Spark'], mood: 'Cool & Energetic' },
  'Elegant,Mysterious': { type: 'Shadow Grace', keywords: ['Shadow', 'Grace'], mood: 'Elegant & Mysterious' },
  'Warm,Elegant': { type: 'Golden Glow', keywords: ['Golden', 'Glow'], mood: 'Warm & Elegant' },
  'Cute,Energetic': { type: 'Bubbly Beam', keywords: ['Bubbly', 'Beam'], mood: 'Cute & Energetic' },
  'Cute,Mysterious': { type: 'Whimsy Veil', keywords: ['Whimsy', 'Veil'], mood: 'Cute & Mysterious' },
  Warm: { type: 'Warm Heart', keywords: ['Warm', 'Heart'], mood: 'Warm' },
  Cute: { type: 'Sweet Charm', keywords: ['Sweet', 'Charm'], mood: 'Cute' },
  Cool: { type: 'Cool Spirit', keywords: ['Cool', 'Spirit'], mood: 'Cool' },
  Elegant: { type: 'Pure Grace', keywords: ['Pure', 'Grace'], mood: 'Elegant' },
  Mysterious: { type: 'Mystic Soul', keywords: ['Mystic', 'Soul'], mood: 'Mysterious' },
  Energetic: { type: 'Bright Energy', keywords: ['Bright', 'Energy'], mood: 'Energetic' },
};

function traitKey(traits: IdentityTrait[]): string {
  return [...traits].sort().join(',');
}

function lookupCombo(key: string): IdentityTypeDefinition | undefined {
  return (TRAIT_COMBOS as Record<string, IdentityTypeDefinition>)[key];
}

// ── Emotion keywords → scores (deterministic) ──────────────────────────────

interface KeywordScore {
  keywords: string[];
  trait: IdentityTrait;
}

const EMOTION_KEYWORDS: KeywordScore[] = [
  { keywords: ['warm', 'love', 'soft', 'gentle', 'kind', 'sweet', 'heart', 'hug'], trait: 'Warm' },
  { keywords: ['cute', 'adorable', 'lovely', 'sweet', 'bubbly', 'smile'], trait: 'Cute' },
  { keywords: ['cool', 'chill', 'smooth', 'confident', 'ace', 'swag'], trait: 'Cool' },
  { keywords: ['elegant', 'grace', 'classy', 'refined', 'beautiful', 'sophisticated'], trait: 'Elegant' },
  { keywords: ['mysterious', 'mystery', 'dark', 'deep', 'shadow', 'enigmatic', 'secret'], trait: 'Mysterious' },
  { keywords: ['energy', 'energetic', 'excited', 'fun', 'happy', 'hype', 'wild', 'passion'], trait: 'Energetic' },
];

// ── Public API ─────────────────────────────────────────────────────────────

/** Deterministic emotion analysis from voice transcript. */
export function suggestIdentity(transcript: string): {
  scores: EmotionScores;
  suggestedTraits: { trait: IdentityTrait; score: number }[];
  suggestedIdentityType: string;
} {
  const lower = transcript.toLowerCase();
  const scores: EmotionScores = { Warm: 0, Cute: 0, Cool: 0, Elegant: 0, Mysterious: 0, Energetic: 0 };

  for (const { keywords, trait } of EMOTION_KEYWORDS) {
    let hits = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) hits++;
    }
    scores[trait] = Math.min(100, hits * 20 + 10);
  }

  const entries = ALL_TRAITS.map((t) => ({ trait: t, score: scores[t] }));
  entries.sort((a, b) => b.score - a.score);

  const topTwo = entries.slice(0, 2).map((e) => e.trait) as IdentityTrait[];
  const suggestedIdentityType: string =
    lookupCombo(traitKey(topTwo))?.type ?? 'Warm Heart';

  return { scores, suggestedTraits: entries, suggestedIdentityType };
}

/** Converts selected traits into a concise fan identity. */
export function generateIdentityProfile(
  selectedTraits: IdentityTrait[],
  suggestedTraits: { trait: IdentityTrait; score: number }[],
  suggestedIdentityType: string | null,
): IdentityProfile {
  const effective = selectedTraits.length > 0
    ? selectedTraits
    : [suggestedTraits[0]?.trait ?? 'Warm'];

  const key = traitKey(effective);
  const fallback: IdentityTypeDefinition = { type: 'Warm Heart', keywords: ['Warm', 'Heart'], mood: 'Warm' };
  const def: IdentityTypeDefinition =
    lookupCombo(key) ??
    (effective[0] ? lookupCombo(effective[0]) : undefined) ??
    fallback;

  return {
    selectedTraits: effective,
    suggestedTraits,
    detectedEmotion: suggestedTraits[0]?.trait ?? null,
    suggestedIdentityType,
    identityType: def.type,
    identityKeywords: def.keywords,
    mood: def.mood,
  };
}

export const identityService = {
  suggestIdentity,
  generateIdentityProfile,
};
