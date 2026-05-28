 
import { useEffect, useRef } from 'react';

/**
 * useRevealOnScroll
 * ─────────────────────────────────────────────────────────────────────────────
 * Attaches an IntersectionObserver to the given `ref`. When the element
 * enters the viewport (threshold: 12%) the class `is-visible` is added,
 * which triggers the CSS transition defined in section_transitions.css.
 *
 * The class is never removed — once revealed, sections stay visible.
 * This avoids the flicker of elements re-hiding on scroll-up.
 *
 * @param {React.RefObject} ref     — ref attached to the section root element
 * @param {object}          options
 * @param {boolean}         options.skip       — if true, observer is not created (use for hero/first section)
 * @param {number}          options.threshold  — visibility fraction to trigger (default 0.12)
 * @param {string}          options.rootMargin — IObs rootMargin (default '0px 0px -40px 0px')
 */
export function useRevealOnScroll(ref, { skip = false, threshold = 0.12, rootMargin = '0px 0px -40px 0px' } = {}) {
  const observerRef = useRef(null);

  useEffect(() => {
    // Skip for the hero (first section) or if explicitly disabled
    if (skip || !ref.current) return;

    // Already visible — nothing to do
    if (ref.current.classList.contains('is-visible')) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Disconnect after revealing — no need to keep watching
          observerRef.current?.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(ref.current);

    return () => {
      observerRef.current?.disconnect();
    };
  // Re-run only if skip changes (e.g. first-section index determined at runtime)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);
}
