import Lenis from '@studio-freight/lenis';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let lenis, frame, locked = false;

export function scrollPageTo(target, options = {}) {
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
  if (lenis) lenis.scrollTo(top, options);
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
    if (reduced.matches) return;
    // AUGEN's smoothScroll plugin: Lenis 1.0.39, identical duration and easing.
    lenis = new Lenis({duration: .8, easing: t => 1 - Math.pow(1 - t, 4)});
    if (locked) lenis.stop();
    const tick = time => {lenis.raf(time); frame = requestAnimationFrame(tick)};
    frame = requestAnimationFrame(tick);
  }
  configure();
  reduced.addEventListener('change', configure);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    const target = hash === '#' ? 0 : document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target === null) return;
    event.preventDefault();
    const offset = target === 0 ? 0 : -(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
    scrollPageTo(target, {offset});
    history.pushState(null, '', hash);
  });
}
