# Smooth scroll reference

Analyzed supplied augen_pro.html and its linked bundle https://augen.pro/_nuxt/entry.C4JQNA6F.js.
The smoothScroll plugin instantiates Lenis 1.0.39 with:

```js
new Lenis({ duration: 0.8, easing: t => 1 - Math.pow(1 - t, 4) })
```

It advances raf on each window animation frame. TAU CLOUD uses the same pinned version, options and frame loop. Default syncTouch:false preserves native touch scrolling. Reduced-motion users bypass Lenis. Mobile menu stops/resumes Lenis; anchor and story chapter navigation share scrollPageTo.

Validation: node scripts/check-scroll.mjs; node scripts/check-mobile.mjs; npm run build.

## Netlify frame delivery

The deployed Lenis bundle matched local behavior. Individual WebP requests took
230–770 ms on Netlify versus 4–9 ms locally; the three-request queue could not
keep up with scrolling. The easing and duration remain unchanged.

`predev` and `prebuild` package each sequence into a content-hashed binary stream
and generate `playback.json`. Frames become available incrementally, without
waiting for the full download. Compressed frames are retained for reverse scroll;
the existing nearby bitmap cache still limits decoded memory. Stream failures
fall back to individual WebP requests. Reduced motion does not load either source.

Run `node scripts/check-frame-stream.mjs` to verify rendering with 300 ms request
latency, reverse scrolling without per-frame requests, and interrupted-stream fallback.
