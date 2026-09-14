# Mobile refinement — 2026-09-11

Implemented against the user's `02-mobile-refinement.md` in the existing responsive site.

- Dedicated portrait generation: Seedance 2.5 job `b3fba704-aa65-43e8-8004-e909e40ef89e`, 1080×1920, 24 fps, 20.04 seconds. References: corrected desktop film, actual exterior photograph, exact supplied logo. One continuous generated clip, so there are no separately assembled clip boundaries.
- Local source: `public/media/tau-cloud-energy-portrait.mp4`. The source contains a generated white lower border. Export removes that border using a 972×1728 portrait crop at (54, 0), then scales to 720×1280 without stretching. This is a dedicated portrait generation, not a crop of the desktop film.
- Playback: 361 WebP frames, 18 fps, 10,586,172 bytes; packaged stream 10,588,340 bytes. These are file sizes, not measured mobile network download speeds.
- Header remains outside the story with safe-area spacing, 44px controls, menu focus management and anchor offsets. Opening uses a short headline and one CTA. Middle chapters leave the imagery clear. Final copy appears after the wide reveal, with a gradual upward framing adjustment and dark gradient to keep the building clear of text.
- Only the active viewport's sequence is requested; requests are aborted and bitmaps released on a breakpoint change. A delayed stream now allows priority frame requests instead of blocking jumps to the finale.
- Supporting photos have 800px WebP alternatives. Reduced motion uses a still without sequence requests. Loading failure retains a usable poster.

Rebuild mobile assets with `node scripts/export-mobile-video.mjs`, then `npm run build`. Desktop export no longer overwrites portrait frames.

Validation: `node scripts/check-mobile-refinement.mjs` covers 320×568, 360×640, 390×844, 430×932 and desktop 1440×900, overflow, menu keyboard behavior, persistent header, anchor offsets, asset selection, reduced motion, failed loading and breakpoint switching. Screenshots are in `test-results/mobile`. Stream/reverse-scroll regression: `node scripts/check-frame-stream.mjs`.

Preview: `/mobile-preview.html`. Not deployed to Netlify in this refinement pass.
