/**
 * useAnimate.js — Reusable React hook to attach anime.js animations
 * to DOM refs, with optional IntersectionObserver support for scroll-triggered animations.
 */
import { useEffect, useRef, useCallback } from 'react';

/**
 * useAnimateOnMount
 * Fires an animation function as soon as the referenced element mounts.
 *
 * @param {Function} animFn - (element) => anime animation
 * @param {Array}    deps   - Additional deps that re-trigger the animation
 * @returns {{ ref: React.RefObject }}
 *
 * Usage:
 *   const { ref } = useAnimateOnMount((el) => fadeUp(el, { delay: 100 }));
 *   <div ref={ref}>...</div>
 */
export function useAnimateOnMount(animFn, deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      animFn(ref.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref };
}

/**
 * useAnimateOnView
 * Uses IntersectionObserver to fire an animation only when the element
 * scrolls into view (once). Good for below-the-fold sections.
 *
 * @param {Function} animFn    - (element) => anime animation
 * @param {object}   ioOptions - IntersectionObserver options
 * @returns {{ ref: React.RefObject }}
 *
 * Usage:
 *   const { ref } = useAnimateOnView((el) => staggerFadeUp(el.querySelectorAll('.card')));
 *   <section ref={ref}>...</section>
 */
export function useAnimateOnView(animFn, ioOptions = {}) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animFn(el);
          observer.disconnect();
        }
      },
      { threshold: ioOptions.threshold ?? 0.15, ...ioOptions }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref };
}

/**
 * useAnimateWhen
 * Fires an animation whenever a condition becomes truthy (e.g., data loaded).
 *
 * @param {Function}  animFn    - (element) => anime animation
 * @param {boolean}   condition - When true, animation fires
 * @returns {{ ref: React.RefObject }}
 *
 * Usage:
 *   const { ref } = useAnimateWhen((el) => staggerScaleFade(el.querySelectorAll('.card')), !loading);
 *   <div ref={ref}>...</div>
 */
export function useAnimateWhen(animFn, condition) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (condition && ref.current && !hasAnimated.current) {
      hasAnimated.current = true;
      animFn(ref.current);
    }
  }, [condition]);

  return { ref };
}

/**
 * useStaggerChildren
 * Animates all direct children (or a selector within) a container element.
 *
 * @param {Function}  animFn    - (targets: NodeList) => anime animation
 * @param {boolean}   condition - When true, animation fires
 * @param {string}    selector  - CSS selector for children (default: '> *')
 * @returns {{ ref: React.RefObject }}
 */
export function useStaggerChildren(animFn, condition, selector = '> *') {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (condition && ref.current && !hasAnimated.current) {
      const children = ref.current.querySelectorAll(selector);
      if (children.length > 0) {
        hasAnimated.current = true;
        animFn(children);
      }
    }
  }, [condition]);

  return { ref };
}

/**
 * useShakeOnError
 * Shakes the referenced element whenever `error` becomes a non-empty string.
 *
 * @param {Function} shakeFn - (element) => anime animation
 * @param {string}   error
 * @returns {{ ref: React.RefObject }}
 */
export function useShakeOnError(shakeFn, error) {
  const ref = useRef(null);

  useEffect(() => {
    if (error && ref.current) {
      shakeFn(ref.current);
    }
  }, [error]);

  return { ref };
}
