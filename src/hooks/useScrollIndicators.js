import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * TR-Tech Frontend — useScrollIndicators Hook
 *
 * Attaches scroll-awareness to a horizontally scrollable container.
 * Returns a ref to attach to the container and a className string
 * that toggles CSS classes indicating whether left/right scroll affordances
 * should be visible.
 *
 * Usage:
 *   const { ref, className } = useScrollIndicators();
 *   <div ref={ref} className={className}>...</div>
 */

export function useScrollIndicators() {
  const ref = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /**
   * Recalculates scroll position state.
   *
   * Uses a 2px threshold to avoid flickering indicators when the scroll
   * position is extremely close to (but not exactly at) an edge.
   */
  const checkScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    checkScroll();

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  return {
    ref,
    className: `scroll-container${canScrollLeft ? ' can-scroll-left' : ''}${
      canScrollRight ? ' can-scroll-right' : ''
    }`,
  };
}
