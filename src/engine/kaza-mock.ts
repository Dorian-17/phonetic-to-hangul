/**
 * KaZa Mock Generation — consolidated entry point
 *
 * All generation functions are pure (deterministic) and require no network.
 * Import from here, or from `./index.ts` for the full engine surface.
 *
 * ── Usage ──────────────────────────────────────────────────────────────
 *
 * import { kaza } from './engine/kaza-mock';
 *
 * const profile = kaza.generateKoreanNameProfile({ englishName, fanMood });
 * const expression = kaza.generateFanExpression({ userInput, ... });
 * const card = kaza.generateIdentityCard({ basicInfo, koreanNameProfile, fanExpression });
 */

import { generateKoreanNameProfile } from './name-profile';
import { generateFanExpression } from './fan-expression';
import { generateIdentityCard } from './identity-card';

export const kaza = {
  generateKoreanNameProfile,
  generateFanExpression,
  generateIdentityCard,
} as const;

export { generateKoreanNameProfile } from './name-profile';
export { generateFanExpression } from './fan-expression';
export { generateIdentityCard } from './identity-card';
