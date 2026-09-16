import Lenis from '@studio-freight/lenis';

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = reducedMotion;
const mobileViewport = matchMedia('(max-width:600px)');
let lenis, frame, locked = false;

export function scrollPageTo(target, options = {}) {
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
  const distance = Math.abs(top + (options.offset || 0) - window.scrollY);
  if (lenis) lenis.scrollTo(top, {
    duration: Math.min(1.4, Math.max(.55, distance / 2400)),
    lerp: 0,
    easing: t => 1 - Math.pow(1 - t, 3),
    ...options,
  });
  else {
    window.scrollTo({top: top + (options.offset || 0), behavior: 'instant'});
  }
}

export function lockPageScroll(value) {
  locked = value;
  if (value) lenis?.stop(); else lenis?.start();
}

export function initSmoothScroll() {
  function configure() {
    cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = undefined;
    window.tauSmoothScroll = undefined;
    document.documentElement.dataset.tauSmoothScroll = 'native';
    if (reduced.matches || mobileViewport.matches) return;
    // Wheel interpolation follows changes of direction; touch keeps native inertia.
    lenis = new Lenis({lerp: .08, smoothWheel: true, syncTouch: false});
    window.tauSmoothScroll = lenis;
    document.documentElement.dataset.tauSmoothScroll = 'lenis';
    if (locked) lenis.stop();
    const tick = time => {lenis?.raf(time); frame = requestAnimationFrame(tick)};
    frame = requestAnimationFrame(tick);
  }
  configure();
  reduced.addEventListener('change', configure);
  mobileViewport.addEventListener('change', configure);
  document.querySelectorAll('textarea, select').forEach(element => element.setAttribute('data-lenis-prevent', ''));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    let target;
    try { target = hash === '#' ? 0 : document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return; }
    if (target === null) return;
    event.preventDefault();
    const offset = target === 0 ? 0 : -(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
    scrollPageTo(target, {offset});
    if (location.hash !== hash) history.pushState(null, '', hash);
  });
}
