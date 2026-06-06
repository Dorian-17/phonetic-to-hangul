import type { IdentityCardInput, IdentityCard } from '../types';

// ── Card ID generator ──────────────────────────────────────────────────────

function generateCardId(englishName: string, country: string, date?: string): string {
  const datePart = date ?? '20260601';
  const hash = simpleHash(`${englishName}:${country}`);
  const suffix = hash.toString(16).padStart(4, '0').slice(-4).toUpperCase();
  return `KaZa-${datePart}-${suffix}`;
}

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffff;
  }
  return hash;
}

function isoDate(): string {
  return new Date().toISOString().split('T')[0] ?? '2026-06-01';
}

// ── Generator ──────────────────────────────────────────────────────────────

export function generateIdentityCard(input: IdentityCardInput): IdentityCard {
  const { basicInfo, koreanNameProfile, fanExpression, identityProfile: id } = input;

  const fallbackMood = id?.mood ?? 'Warm';
  const fallbackType = id?.identityType ?? 'Warm Heart';
  const fallbackKeywords = id?.identityKeywords ?? ['Warm', 'Heart'];
  const fallbackKeyword = id?.identityKeywords?.[0] ?? koreanNameProfile.identityKeyword;

  return {
    kazaId: generateCardId(basicInfo.englishName, basicInfo.country),
    createdAt: isoDate(),
    englishName: basicInfo.englishName,
    koreanName: koreanNameProfile.koreanName,
    country: basicInfo.country,
    favoriteArtist: basicInfo.favoriteArtist || '—',
    fanMood: basicInfo.fanMood || fallbackMood,
    identityType: fallbackType,
    identityKeywords: fallbackKeywords,
    mood: fallbackMood,
    representativeSentence: fanExpression.versions[1]?.korean ?? fanExpression.versions[0]?.korean ?? '',
    identityKeyword: fallbackKeyword,
  };
}

export { generateCardId };
