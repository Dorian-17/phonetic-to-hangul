// Scroll-reveal utility — dependency-free.
//
// Elements marked with `[data-reveal]` start hidden (via CSS) and get the
// `is-visible` class once they scroll into view, triggering a CSS transition.
// Per-element stagger is expressed in the markup as `style="--reveal-delay: 80ms"`.
//
// Accessibility: if the user prefers reduced motion (or IntersectionObserver is
// unavailable), every element is revealed immediately so nothing is ever hidden.

const REVEAL_SELECTOR = '[data-reveal]';
const VISIBLE_CLASS = 'is-visible';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Observe every `[data-reveal]` element under `root` and reveal it on scroll.
 * Falls back to revealing everything immediately when motion is reduced or
 * IntersectionObserver is unavailable.
 */
export function initScrollReveals(root: ParentNode = document): void {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
  if (elements.length === 0) return;

  if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
    for (const el of elements) el.classList.add(VISIBLE_CLASS);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add(VISIBLE_CLASS);
          obs.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  );

  for (const el of elements) observer.observe(el);
}
