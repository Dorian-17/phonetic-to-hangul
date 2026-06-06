/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { initScrollReveals } from './reveal-observer';

// Minimal IntersectionObserver stub that lets a test drive intersections.
class MockIO {
  static instances: MockIO[] = [];
  elements: Element[] = [];
  private cb: IntersectionObserverCallback;

  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    MockIO.instances.push(this);
  }

  observe(el: Element): void {
    this.elements.push(el);
  }

  unobserve(el: Element): void {
    this.elements = this.elements.filter((e) => e !== el);
  }

  disconnect(): void {
    this.elements = [];
  }

  trigger(el: Element, isIntersecting: boolean): void {
    this.cb(
      [{ target: el, isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function setReducedMotion(reduce: boolean): void {
  (window as unknown as { matchMedia: (q: string) => MediaQueryList }).matchMedia = (
    query: string,
  ) =>
    ({
      matches: reduce && query.includes('reduce'),
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    }) as unknown as MediaQueryList;
}

beforeEach(() => {
  MockIO.instances = [];
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockIO;
  setReducedMotion(false);
  document.body.innerHTML = '';
});

describe('initScrollReveals', () => {
  it('reveals an element only once it intersects', () => {
    document.body.innerHTML = '<div data-reveal id="a"></div><div data-reveal id="b"></div>';
    initScrollReveals();

    const a = document.getElementById('a')!;
    const b = document.getElementById('b')!;
    expect(a.classList.contains('is-visible')).toBe(false);

    MockIO.instances[0]!.trigger(a, true);
    expect(a.classList.contains('is-visible')).toBe(true);
    expect(b.classList.contains('is-visible')).toBe(false);
  });

  it('reveals everything immediately under reduced motion (no observer created)', () => {
    setReducedMotion(true);
    document.body.innerHTML = '<div data-reveal id="a"></div>';
    initScrollReveals();

    expect(document.getElementById('a')!.classList.contains('is-visible')).toBe(true);
    expect(MockIO.instances.length).toBe(0);
  });

  it('reveals everything immediately when IntersectionObserver is unavailable', () => {
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = undefined;
    document.body.innerHTML = '<div data-reveal id="a"></div>';
    initScrollReveals();

    expect(document.getElementById('a')!.classList.contains('is-visible')).toBe(true);
  });

  it('is a no-op when there are no [data-reveal] elements', () => {
    document.body.innerHTML = '<div></div>';
    expect(() => initScrollReveals()).not.toThrow();
    expect(MockIO.instances.length).toBe(0);
  });
});
