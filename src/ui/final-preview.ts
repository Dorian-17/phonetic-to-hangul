import type { FinalPreviewInput, ExpressionVersion } from '../types';

export function renderFinalPreview(
  container: HTMLElement,
  data: FinalPreviewInput,
  onRestart: () => void,
  onEdit: () => void,
  onDemo: () => void,
): void {
  container.innerHTML = '';

  const { basicInfo, koreanNameProfile, fanExpression, identityCard } = data;

  // ── Compute saved expressions once ────────────────────────────────────
  const defaultVersion = fanExpression?.versions[1]; // natural
  const saved: ExpressionVersion[] = (() => {
    if (!fanExpression) return [];
    if (fanExpression.saved.length > 0) {
      return fanExpression.versions.filter((v) => fanExpression.saved.includes(v.tone));
    }
    return defaultVersion ? [defaultVersion] : [];
  })();
  const hasMultiple = saved.length > 1;

  // ── State ─────────────────────────────────────────────────────────────
  let quickMode = false;
  let quickIndex = 0;

  const wrapper = document.createElement('div');
  wrapper.className = 'fan-ready';

  // ── Badge ─────────────────────────────────────────────────────────────
  const badge = document.createElement('div');
  badge.className = 'fan-ready-badge';
  badge.textContent = '✨ Fan Sign Ready';
  wrapper.appendChild(badge);

  // ── Hero ──────────────────────────────────────────────────────────────
  const hero = document.createElement('div');
  hero.className = 'fan-ready-hero';
  hero.innerHTML = `
    <div class="fan-ready-name">${koreanNameProfile?.koreanName ?? '—'}</div>
    <div class="fan-ready-sub">${koreanNameProfile?.originalName ?? ''} · ${koreanNameProfile?.identityKeyword ?? ''}</div>
  `;
  wrapper.appendChild(hero);

  // ── Toggle: Summary / Quick Access ────────────────────────────────────
  const toggleRow = document.createElement('div');
  toggleRow.className = 'fan-ready-toggle';

  const summaryBtn = document.createElement('button');
  summaryBtn.type = 'button';
  summaryBtn.className = 'fan-ready-toggle-btn active';
  summaryBtn.textContent = 'Summary';
  summaryBtn.addEventListener('click', () => { setMode(false); });

  const quickBtn = document.createElement('button');
  quickBtn.type = 'button';
  quickBtn.className = 'fan-ready-toggle-btn';
  quickBtn.textContent = '📱 Quick Access';
  quickBtn.addEventListener('click', () => { setMode(true); });

  toggleRow.appendChild(summaryBtn);
  toggleRow.appendChild(quickBtn);
  wrapper.appendChild(toggleRow);

  // ── Summary view ──────────────────────────────────────────────────────
  const summaryView = document.createElement('div');
  summaryView.className = 'fan-ready-summary';

  // Identity card mini preview
  if (identityCard) {
    const cardChip = document.createElement('div');
    cardChip.className = 'fan-ready-card-preview';
    cardChip.innerHTML = `
      <div class="fan-ready-card-header">
        <span>✦ KAZA Fan Pass</span>
        <span>${identityCard.kazaId}</span>
      </div>
      <div class="fan-ready-card-body">
        <div class="fan-ready-card-type">${identityCard.identityType}</div>
        <div class="fan-ready-card-keywords">
          ${identityCard.identityKeywords.map((k) => `<span class="identity-keyword-tag">${k}</span>`).join('')}
        </div>
      </div>
    `;
    summaryView.appendChild(cardChip);
  }

  // Saved expressions list
  if (saved.length > 0) {
    const exprSection = document.createElement('div');
    exprSection.className = 'fan-ready-expressions';

    const exprTitle = document.createElement('h3');
    exprTitle.className = 'fan-ready-section-title';
    exprTitle.textContent = '💬 Your Fan Sign Messages';
    exprSection.appendChild(exprTitle);

    for (const v of saved) {
      const card = document.createElement('div');
      card.className = 'fan-ready-expr-card';

      card.innerHTML = `
        <span class="fan-ready-expr-tone">${v.tone}</span>
        <div class="fan-ready-expr-korean">${v.korean}</div>
        <div class="fan-ready-expr-english">${v.english}</div>
      `;

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'fan-ready-copy-btn';
      copyBtn.textContent = '📋 Copy';
      copyBtn.addEventListener('click', () => { copyText(v.korean, copyBtn); });
      card.appendChild(copyBtn);

      exprSection.appendChild(card);
    }
    summaryView.appendChild(exprSection);
  }

  // Quick info
  const quickInfo = document.createElement('div');
  quickInfo.className = 'fan-ready-quick';
  quickInfo.appendChild(makeQuickItem('👤', basicInfo?.englishName ?? '—'));
  quickInfo.appendChild(makeQuickItem('📍', basicInfo?.country ?? '—'));
  if (basicInfo?.favoriteArtist) {
    quickInfo.appendChild(makeQuickItem('🎤', basicInfo.favoriteArtist));
  }
  summaryView.appendChild(quickInfo);

  wrapper.appendChild(summaryView);

  // ── Quick Access view ─────────────────────────────────────────────────
  const quickView = document.createElement('div');
  quickView.className = 'fan-ready-quick-access';
  quickView.style.display = 'none';

  if (saved.length > 0) {
    const quickCard = document.createElement('div');
    quickCard.className = 'quick-access-card';

    const quickKorean = document.createElement('div');
    quickKorean.className = 'quick-access-korean';
    quickCard.appendChild(quickKorean);

    const quickEnglish = document.createElement('div');
    quickEnglish.className = 'quick-access-english';
    quickCard.appendChild(quickEnglish);

    const quickPron = document.createElement('div');
    quickPron.className = 'quick-access-pron';
    quickCard.appendChild(quickPron);

    const quickTone = document.createElement('span');
    quickTone.className = 'quick-access-tone';
    quickCard.appendChild(quickTone);

    const nav = document.createElement('div');
    nav.className = 'quick-access-nav';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'quick-access-nav-btn';
    prevBtn.textContent = '◀';
    prevBtn.addEventListener('click', () => {
      quickIndex = (quickIndex - 1 + saved.length) % saved.length;
      renderQuickCard();
    });

    const pageLabel = document.createElement('span');
    pageLabel.className = 'quick-access-page';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'quick-access-nav-btn';
    nextBtn.textContent = '▶';
    nextBtn.addEventListener('click', () => {
      quickIndex = (quickIndex + 1) % saved.length;
      renderQuickCard();
    });

    nav.appendChild(prevBtn);
    nav.appendChild(pageLabel);
    nav.appendChild(nextBtn);
    quickCard.appendChild(nav);

    function renderQuickCard(): void {
      const v = saved[quickIndex]!;
      quickKorean.textContent = v.korean;
      quickEnglish.textContent = v.english;
      quickPron.textContent = v.pronunciation;
      quickTone.textContent = v.tone;
      pageLabel.textContent = `${quickIndex + 1} / ${saved.length}`;
    }
    renderQuickCard();

    quickView.appendChild(quickCard);
  }

  wrapper.appendChild(quickView);

  // ── Actions ───────────────────────────────────────────────────────────
  const actions = document.createElement('div');
  actions.className = 'fan-ready-actions';

  const restartBtn = document.createElement('button');
  restartBtn.type = 'button';
  restartBtn.className = 'form-submit';
  restartBtn.textContent = '🔄 Start Over';
  restartBtn.addEventListener('click', onRestart);
  actions.appendChild(restartBtn);

  const demoBtn = document.createElement('button');
  demoBtn.type = 'button';
  demoBtn.className = 'back-btn';
  demoBtn.textContent = '🚀 Quick Demo';
  demoBtn.addEventListener('click', onDemo);
  actions.appendChild(demoBtn);

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'back-btn';
  editBtn.textContent = '✏️ Edit Info';
  editBtn.addEventListener('click', onEdit);
  actions.appendChild(editBtn);

  wrapper.appendChild(actions);
  container.appendChild(wrapper);

  // ── Mode switching ────────────────────────────────────────────────────
  function setMode(q: boolean): void {
    quickMode = q;
    summaryView.style.display = q ? 'none' : '';
    quickView.style.display = q ? '' : 'none';
    summaryBtn.classList.toggle('active', !q);
    quickBtn.classList.toggle('active', q);
    if (q) quickIndex = 0;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function makeQuickItem(emoji: string, text: string): HTMLElement {
  const el = document.createElement('span');
  el.className = 'fan-ready-quick-item';
  el.textContent = `${emoji} ${text}`;
  return el;
}

function copyText(text: string, btn: HTMLButtonElement): void {
  const original = btn.textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = original; }, 1500);
  }).catch(() => {
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = original; }, 1500);
  });
}
