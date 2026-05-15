import { transliterate } from './engine/index';
import { renderDecomposition } from './ui/decomposition';

// Theme: restore saved preference, fall back to OS preference
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

const input = document.getElementById('name-input') as HTMLInputElement;
const container = document.getElementById('decomp-container') as HTMLElement;

let debounceTimer: ReturnType<typeof setTimeout>;

input.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderDecomposition(transliterate(input.value), container);
  }, 80);
});

// Pre-fill from URL ?q= param for shareable links
const q = new URLSearchParams(location.search).get('q');
if (q) {
  input.value = q;
  renderDecomposition(transliterate(q), container);
}
