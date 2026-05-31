import { initApp, render } from './ui/app';

// ── Theme ──────────────────────────────────────────────────────────────────

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme ?? (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);

const themeBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
themeBtn.textContent = initialTheme === 'dark' ? '☀️' : '🌙';

themeBtn.addEventListener('click', () => {
  const next =
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
});

// ── App ────────────────────────────────────────────────────────────────────

const progressEl = document.getElementById('progress-container') as HTMLElement;
const contentEl = document.getElementById('step-content') as HTMLElement;
const navEl = document.getElementById('step-nav-container') as HTMLElement;

initApp(progressEl, contentEl, navEl);
render();
