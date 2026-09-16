# Mobile refinement QA — 16 September 2026

final result: passed

## Target and scope
User-provided `02-mobile-refinement.md` and ten portrait images; existing TAU CLOUD brand and desktop narrative. The latest request supersedes the earlier manual-card layout: copy is overlaid on portrait imagery, scenes advance with native scroll, with a persistent header throughout the website. No new video generation or publishing.

Source visual: `C:/Users/JAKE/Desktop/Изображение Codex 16 сент. 2026 г., 10_42_35.png` (941×1672). Implementation: `test-results/mobile-scroll/390-hero.png` (390×844, CSS 390×844, DPR 1). Combined source/render comparison: `test-results/mobile-scroll/comparison.png`. Source is fit into a 390×844 comparison panel; the implementation deliberately fills the available hero area using the portrait image. Some outer edges crop on different phone ratios; there is no stretching or blur. This implements the attached document's edge-to-edge composition, superseding the earlier full-image card treatment.

## Review
- Typography: existing Manrope retained; concise opening heading, original hero typography restored (30–41px opening title, 25px scene titles, 13px descriptions, 12px CTA); supporting body text remains 16px. Supporting sections remain readable. Fixed an overly specific Colocation eyebrow rule which previously kept it at 10px.
- Layout: Following the latest user correction, hero copy is restored to the lower left over the original bottom gradient; descriptions are present in every scene. Header and skip link persist. Entire site uses safe-area-aware side padding; navigation, service tabs, contacts and brief remain accessible.
- Colors: existing cyan/navy brand, subtle directional overlay for white text, light content surfaces. No generated or substituted logo.
- Images: original lossless WebP assets unchanged, no resampling or recompression. Source comparison confirms correct image and undistorted building geometry. Full-view hero inspection is sufficient to see title, logo and CTA; separate screenshots inspect services/contact content.
- Copy: concise opening, contextual scene titles, primary contact CTA, visible skip. Direct phone/email and secondary local brief retained.

## Iterations
1. Replaced manual cards with a 340svh native-scroll narrative, five scenes, clickable chapter indicators, no scroll interception. Added an abortable current-scene request and object URL cleanup.
2. Visual inspection at 320/390/430: corrected the service eyebrow specificity; added measured space for enlarged hero text to avoid copy/footer overlap. Re-ran screenshot and behavior checks after fixes.

## Verification
`node scripts/check-mobile-scroll.mjs`: passed at 320×568, 390×844, 430×932. Five scenes, initial single portrait request, no old sequence/video requests, persistent header below story, menu/Escape, section overflow, reduced-motion still, desktop/mobile switch, no page errors. Fresh screenshots for hero, every scene, about, services, locations and contact in `test-results/mobile-scroll/`.
`node scripts/check-mobile-scroll-extra.mjs`: enlarged hero text at 200% without overlay collision or horizontal overflow; image failure fallback and skip remain usable. Saved combined comparison.
`npm run build`: passed. `git diff --check`: passed.

The previous compression audit still applies: 22,397,818 PNG bytes to 16,104,320 WebP bytes (28.1% reduction), exact decoded pixels for all ten images. These are file-size measurements, not a measured network speed claim. Only the required scene is fetched; no complete sequence is preloaded. Reduced motion shows the opening still and removes the extended scroll story.

## Limits
This is scroll-driven portrait still imagery, not newly generated connected video clips. Existing desktop animation retained. Physical phones, Safari and real slow-network timing were not tested. Preview is local, not published. Mobile and desktop are responsive versions of the same site.

Latest user corrections: restored every scene description, original mobile hero typography and lower-left composition. Fresh 320/390/430 screenshots and scroll checks passed; production build passed.


Final reference update: user supplied codex-clipboard-8e727d0a-5a0c-4145-99fb-af295c58f2cf.png. Applied white/cyan split headings, uppercase kicker, scene descriptions, rectangular cyan CTA on each scene, directional shade and 02 / 05 counter. Portrait composition intentionally differs from the landscape reference. Rechecked all three phone sizes and five scenes; screenshots refreshed in test-results/mobile-scroll.
