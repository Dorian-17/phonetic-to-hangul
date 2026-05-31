import type { BasicInfo, KoreanNameProfile, FanExpression, IdentityCard, FinalPreviewInput, IdentityProfile, KaZaSession } from '../types';
import { createEmptySession } from '../types';
import { renderProgressNav } from './progress-nav';
import { renderBasicInfoForm } from './basic-info-form';
import { nameService } from '../engine/name-service';
import { generateKoreanNameProfile } from '../engine/name-profile';
import { renderKoreanNameStep } from './korean-name-step';
import { renderIdentityCreationStep } from './identity-creation-step';
import { renderFanExpressionStep } from './fan-expression-step';
import { generateIdentityCard } from '../engine/identity-card';
import { renderIdentityCardStep } from './identity-card-step';
import { renderFinalPreview } from './final-preview';
import { renderVoiceCaptureStep } from './voice-capture-step';

// ── State ──────────────────────────────────────────────────────────────────

const session: KaZaSession = createEmptySession();
let isStep1Valid = false;

// ── DOM containers ─────────────────────────────────────────────────────────

let progressContainer: HTMLElement;
let contentContainer: HTMLElement;
let navContainer: HTMLElement;

export function initApp(
  progressEl: HTMLElement,
  contentEl: HTMLElement,
  navEl: HTMLElement,
): void {
  progressContainer = progressEl;
  contentContainer = contentEl;
  navContainer = navEl;
}

// ── Render ─────────────────────────────────────────────────────────────────

export function render(): void {
  if (!session.voiceCapture || session.voiceCapture.inputMode === null) {
    progressContainer.innerHTML = '';
    renderVoiceCapture();
    navContainer.innerHTML = '';
    return;
  }

  renderProgressNav(progressContainer, session.currentStep, new Set(session.completedSteps));
  renderStepContent();
  navContainer.innerHTML = '';
}

function renderStepContent(): void {
  contentContainer.innerHTML = '';
  switch (session.currentStep) {
    case 1: renderStep1(); break;
    case 2: renderStep2(); break;
    case 3: renderStep3(); break;
    case 4: renderStep4(); break;
    case 5: renderStep5(); break;
    case 6: renderStep6(); break;
  }
}

// ── Voice capture ──────────────────────────────────────────────────────────

function renderVoiceCapture(): void {
  renderVoiceCaptureStep(contentContainer, session.voiceCapture!, (captured) => {
    session.voiceCapture = captured;
    if (captured.transcript && !session.userProfile) {
      session.userProfile = {
        englishName: captured.transcript,
        country: '',
        favoriteArtist: '',
        fanMood: '',
        koreanLevel: '',
      };
    }
    render();
  });
}

// ── Step 1: Basic Info ─────────────────────────────────────────────────────

function renderStep1(): void {
  renderBasicInfoForm(
    contentContainer,
    {
      englishName: session.userProfile?.englishName ?? '',
      country: session.userProfile?.country ?? '',
      favoriteArtist: session.userProfile?.favoriteArtist ?? '',
      fanMood: session.userProfile?.fanMood ?? '',
      koreanLevel: session.userProfile?.koreanLevel ?? '',
    },
    (formState) => {
      isStep1Valid = formState.isValid;
      session.userProfile = formState.basicInfo;
    },
    (info) => { void handleStep1Submit(info); },
  );
}

async function handleStep1Submit(info: BasicInfo): Promise<void> {
  session.userProfile = info;
  isStep1Valid = true;
  renderLoading('Loading pronunciation dictionary…');
  const profile = await nameService.generateKoreanName(info.englishName, info.fanMood);
  if (!profile) return;
  session.koreanName = profile;
  goNext();
}

// ── Step 2: Korean Name ────────────────────────────────────────────────────

function renderStep2(): void {
  if (!session.userProfile || !session.koreanName) return;
  renderKoreanNameStep(
    contentContainer, session.koreanName, session.userProfile,
    () => goBack(), () => goNext(),
  );
  markComplete(2);
}

// ── Step 3: Identity Creation ──────────────────────────────────────────────

function renderStep3(): void {
  renderIdentityCreationStep(
    contentContainer,
    session.voiceCapture?.transcript ?? null,
    session.identityProfile,
    () => goBack(),
    (profile) => {
      session.identityProfile = profile;
      markComplete(3);
      goNext();
    },
  );
}

// ── Step 4: Fan Expression ─────────────────────────────────────────────────

function renderStep4(): void {
  if (!session.userProfile) return;
  renderFanExpressionStep(
    contentContainer, session.userProfile,
    session.expressions.length > 0 ? lastExpression()! : null,
    session.expressionDraft,
    (draft) => { session.expressionDraft = draft; },
    () => goBack(),
    (expression) => {
      session.expressions.push(expression);
      markComplete(4);
    },
    () => goNext(),
  );
}

// ── Step 5: Identity Card ──────────────────────────────────────────────────

function renderStep5(): void {
  if (!session.userProfile || !session.koreanName || session.expressions.length === 0) return;
  const card: IdentityCard = generateIdentityCard({
    basicInfo: session.userProfile,
    koreanNameProfile: session.koreanName,
    fanExpression: lastExpression()!,
    identityProfile: session.identityProfile,
  });
  session.identityCard = card;
  renderIdentityCardStep(
    contentContainer, card,
    () => goBack(),
    () => goNext(),
    () => {
      // Navigate back to identity creation to edit traits
      session.currentStep = 3;
      render();
    },
  );
  markComplete(5);
}

// ── Step 6: Final Preview ──────────────────────────────────────────────────

function renderStep6(): void {
  if (!session.userProfile || !session.koreanName || session.expressions.length === 0) return;
  const card = session.identityCard ?? generateIdentityCard({
    basicInfo: session.userProfile,
    koreanNameProfile: session.koreanName,
    fanExpression: lastExpression()!,
    identityProfile: session.identityProfile,
  });
  renderFinalPreview(
    contentContainer,
    {
      basicInfo: session.userProfile,
      koreanNameProfile: session.koreanName,
      fanExpression: lastExpression()!,
      identityCard: card,
    },
    () => resetSession(),
    () => { session.currentStep = 1; render(); },
    () => loadDemoPreset(),
  );
  markComplete(6);
}

// ── Helpers ────────────────────────────────────────────────────────────────

function lastExpression(): FanExpression {
  return session.expressions[session.expressions.length - 1]!;
}

function canAdvance(): boolean {
  switch (session.currentStep) {
    case 1: return isStep1Valid;
    case 2: return session.completedSteps.includes(1);
    case 3: return session.identityProfile !== null;
    case 4: return session.expressions.length > 0;
    case 5: return session.completedSteps.includes(4);
    default: return true;
  }
}

function markComplete(step: number): void {
  if (!session.completedSteps.includes(step)) {
    session.completedSteps.push(step);
  }
}

function goNext(): void {
  if (!canAdvance()) return;
  if (session.currentStep < 6) {
    session.completedSteps.push(session.currentStep);
    session.currentStep++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
  }
}

function goBack(): void {
  if (session.currentStep > 1) {
    session.currentStep--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
  }
}

function resetSession(): void {
  const empty = createEmptySession();
  session.currentStep = empty.currentStep;
  session.completedSteps = empty.completedSteps;
  session.voiceCapture = { ...empty.voiceCapture! };
  session.userProfile = empty.userProfile;
  session.koreanName = empty.koreanName;
  session.expressions = empty.expressions;
  session.expressionDraft = { ...empty.expressionDraft };
  session.identityProfile = empty.identityProfile;
  session.identityCard = empty.identityCard;
  isStep1Valid = false;
  render();
}

/** Fills the session with a complete set of demo data and jumps to Step 2. */
function loadDemoPreset(): void {
  const demoProfile: BasicInfo = {
    englishName: 'Michael',
    country: 'USA',
    favoriteArtist: 'BTS',
    fanMood: 'cool',
    koreanLevel: 'beginner',
  };

  // Voice capture is skipped — mark as manual-input complete
  session.voiceCapture = {
    inputMode: 'manual',
    transcript: 'Michael',
    detectedName: 'Michael',
    confidence: null,
    isListening: false,
    errorMessage: null,
  };
  session.userProfile = demoProfile;
  isStep1Valid = true;

  // Generate Korean name synchronously via the rule-based engine.
  // The CMU dictionary may not be loaded yet — the rule-based engine
  // produces a usable result instantly for demo purposes.
  session.koreanName = generateKoreanNameProfile({ englishName: 'Michael', fanMood: 'cool' });

  // Skip to Step 2 where the user can see the generated name and continue
  session.currentStep = 2;
  session.completedSteps = [1];
  render();
}

function renderLoading(message: string): void {
  contentContainer.innerHTML = `
    <div style="text-align:center;padding:3rem 1rem;">
      <p style="color:var(--color-text-muted);font-size:1rem;">${message}</p>
    </div>
  `;
}
