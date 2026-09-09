# Smooth scroll reference

Analyzed supplied augen_pro.html and its linked bundle https://augen.pro/_nuxt/entry.C4JQNA6F.js.
The smoothScroll plugin instantiates Lenis 1.0.39 with:

```js
new Lenis({ duration: 0.8, easing: t => 1 - Math.pow(1 - t, 4) })
```

It advances raf on each window animation frame. TAU CLOUD uses the same pinned version, options and frame loop. Default syncTouch:false preserves native touch scrolling. Reduced-motion users bypass Lenis. Mobile menu stops/resumes Lenis; anchor and story chapter navigation share scrollPageTo.

Validation: node scripts/check-scroll.mjs; node scripts/check-mobile.mjs; npm run build.
