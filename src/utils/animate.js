/**
 * animate.js — Central anime.js v4 animation presets for Sri Anjaneya Youth project.
 * Uses the named `animate` export from animejs v4.
 * All animations respect the `prefers-reduced-motion` accessibility setting.
 */
import { animate, createTimeline, utils } from 'animejs';

/** Check if the user prefers reduced motion */
const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a NodeList / HTMLCollection / Array to a real array.
 */
const toArray = (targets) => {
  if (!targets) return [];
  if (targets instanceof NodeList || targets instanceof HTMLCollection) return Array.from(targets);
  if (Array.isArray(targets)) return targets;
  return [targets];
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE / SECTION ENTRANCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fade + slide-up a single element on mount.
 */
export function fadeUp(target, opts = {}) {
  if (prefersReducedMotion()) {
    if (target) target.style.opacity = '1';
    return;
  }
  return animate(target, {
    opacity: [0, 1],
    translateY: [opts.distance ?? 30, 0],
    duration: opts.duration ?? 600,
    delay: opts.delay ?? 0,
    ease: opts.ease ?? 'outExpo',
  });
}

/**
 * Staggered fade + slide-up for a list of elements.
 */
export function staggerFadeUp(targets, opts = {}) {
  const els = toArray(targets);
  if (!els.length) return;
  if (prefersReducedMotion()) {
    els.forEach(el => { el.style.opacity = '1'; });
    return;
  }
  return animate(els, {
    opacity: [0, 1],
    translateY: [opts.distance ?? 24, 0],
    duration: opts.duration ?? 500,
    delay: (_, i) => (opts.startDelay ?? 0) + i * (opts.stagger ?? 80),
    ease: opts.ease ?? 'outExpo',
  });
}

/**
 * Staggered scale + fade for grid cards.
 */
export function staggerScaleFade(targets, opts = {}) {
  const els = toArray(targets);
  if (!els.length) return;
  if (prefersReducedMotion()) {
    els.forEach(el => { el.style.opacity = '1'; });
    return;
  }
  return animate(els, {
    opacity: [0, 1],
    scale: [opts.fromScale ?? 0.88, 1],
    translateY: [opts.distance ?? 16, 0],
    duration: opts.duration ?? 480,
    delay: (_, i) => (opts.startDelay ?? 0) + i * (opts.stagger ?? 70),
    ease: 'outBack(1.4)',
  });
}

/**
 * Slide in from the left side.
 */
export function staggerSlideLeft(targets, opts = {}) {
  const els = toArray(targets);
  if (!els.length) return;
  if (prefersReducedMotion()) {
    els.forEach(el => { el.style.opacity = '1'; });
    return;
  }
  return animate(els, {
    opacity: [0, 1],
    translateX: [-(opts.distance ?? 40), 0],
    duration: opts.duration ?? 500,
    delay: (_, i) => (opts.startDelay ?? 0) + i * (opts.stagger ?? 80),
    ease: opts.ease ?? 'outExpo',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO / BANNER
// ─────────────────────────────────────────────────────────────────────────────

export function heroEntrance(target, opts = {}) {
  if (prefersReducedMotion()) {
    if (target) target.style.opacity = '1';
    return;
  }
  return animate(target, {
    opacity: [0, 1],
    translateY: [50, 0],
    scale: [0.96, 1],
    duration: opts.duration ?? 750,
    delay: opts.delay ?? 0,
    ease: 'outBack(1.2)',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// NUMBER COUNT-UP
// ─────────────────────────────────────────────────────────────────────────────

export function countUp(el, endValue, opts = {}) {
  if (!el) return;
  if (prefersReducedMotion()) {
    el.textContent = opts.prefix
      ? `${opts.prefix}${endValue.toLocaleString('en-IN')}`
      : endValue.toLocaleString('en-IN');
    return;
  }
  const obj = { value: 0 };
  return animate(obj, {
    value: endValue,
    duration: opts.duration ?? 1200,
    delay: opts.delay ?? 0,
    ease: 'outExpo',
    onUpdate: () => {
      if (opts.prefix) {
        el.textContent = `${opts.prefix}${Math.floor(obj.value).toLocaleString('en-IN')}`;
      } else {
        el.textContent = Math.floor(obj.value).toLocaleString('en-IN');
      }
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MODALS & OVERLAYS
// ─────────────────────────────────────────────────────────────────────────────

export function modalOpen(panelEl, opts = {}) {
  if (prefersReducedMotion()) {
    if (panelEl) panelEl.style.opacity = '1';
    return;
  }
  return animate(panelEl, {
    opacity: [0, 1],
    translateY: [opts.distance ?? 40, 0],
    scale: [0.96, 1],
    duration: opts.duration ?? 380,
    ease: 'outBack(1.4)',
  });
}

export function backdropFadeIn(backdropEl, opts = {}) {
  if (prefersReducedMotion()) {
    if (backdropEl) backdropEl.style.opacity = '1';
    return;
  }
  return animate(backdropEl, {
    opacity: [0, 1],
    duration: opts.duration ?? 250,
    ease: 'outQuad',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MICRO-INTERACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function shake(target, opts = {}) {
  if (prefersReducedMotion()) return;
  return animate(target, {
    translateX: [0, -8, 8, -6, 6, -3, 3, 0],
    duration: opts.duration ?? 500,
    ease: 'inOutSine',
  });
}

export function bounce(target, opts = {}) {
  if (prefersReducedMotion()) return;
  return animate(target, {
    scale: [1, 1.15, 0.95, 1.05, 1],
    duration: opts.duration ?? 500,
    ease: 'inOutSine',
  });
}

export function heartbeat(target, opts = {}) {
  if (prefersReducedMotion()) return;
  return animate(target, {
    scale: [1, 1.25, 1, 1.15, 1],
    duration: opts.duration ?? 800,
    delay: opts.delay ?? 0,
    loop: opts.loop !== false,
    ease: 'inOutSine',
  });
}

export function rotateFadeIn(target, opts = {}) {
  if (prefersReducedMotion()) {
    if (target) target.style.opacity = '1';
    return;
  }
  return animate(target, {
    opacity: [0, 1],
    rotate: [opts.fromRotate ?? -8, 0],
    scale: [0.75, 1],
    duration: opts.duration ?? 600,
    delay: opts.delay ?? 0,
    ease: 'outBack(1.4)',
  });
}

export function slideDown(target, opts = {}) {
  if (prefersReducedMotion()) {
    if (target) target.style.opacity = '1';
    return;
  }
  return animate(target, {
    opacity: [0, 1],
    translateY: [-(opts.distance ?? 30), 0],
    duration: opts.duration ?? 400,
    delay: opts.delay ?? 0,
    ease: 'outExpo',
  });
}

export function tabFade(target, opts = {}) {
  if (prefersReducedMotion()) {
    if (target) target.style.opacity = '1';
    return;
  }
  return animate(target, {
    opacity: [0, 1],
    translateX: [opts.fromX ?? 12, 0],
    duration: opts.duration ?? 300,
    ease: 'outQuad',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────────────────────

export function navbarEntrance(target, opts = {}) {
  if (prefersReducedMotion()) {
    if (target) target.style.opacity = '1';
    return;
  }
  return animate(target, {
    translateY: [-80, 0],
    opacity: [0, 1],
    duration: opts.duration ?? 600,
    delay: opts.delay ?? 100,
    ease: 'outExpo',
  });
}

export function navLinksEntrance(targets, opts = {}) {
  const els = toArray(targets);
  if (!els.length) return;
  if (prefersReducedMotion()) {
    els.forEach(el => { el.style.opacity = '1'; });
    return;
  }
  return animate(els, {
    opacity: [0, 1],
    translateY: [-8, 0],
    duration: opts.duration ?? 400,
    delay: (_, i) => (opts.startDelay ?? 200) + i * (opts.stagger ?? 60),
    ease: 'outQuad',
  });
}

export function mobileMenuOpen(target, opts = {}) {
  if (prefersReducedMotion()) {
    if (target) target.style.opacity = '1';
    return;
  }
  return animate(target, {
    opacity: [0, 1],
    translateY: [-20, 0],
    duration: opts.duration ?? 300,
    ease: 'outExpo',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTBOX / IMAGE VIEWER
// ─────────────────────────────────────────────────────────────────────────────

export function lightboxEnter(target, opts = {}) {
  if (prefersReducedMotion()) {
    if (target) target.style.opacity = '1';
    return;
  }
  return animate(target, {
    opacity: [0, 1],
    scale: [0.92, 1],
    duration: opts.duration ?? 280,
    ease: 'outBack(1.2)',
  });
}
