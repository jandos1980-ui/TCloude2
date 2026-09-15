# Ambient video review

## Integration update

All eight desktop/mobile videos are now connected locally following the user's request to connect the remaining videos. Engineer desktop uses retake 03; mobile UPS uses retake 02; mobile engineer uses retake 03. Earlier rejection notes below describe generation defects, not current integration status. Known remaining defects: UPS desktop stays dim, desktop doors deform side panels, mobile doors reopen at the end, desktop engineer raises a hand more than requested. No new generations or deployment were performed for this integration.

## UPS mobile retake 02 — web subscription

- MiniMax H3 Max Turbo, 45 credits, source image ups-mobile.jpg, output 768x1344, 6.592 seconds.
- Original ceiling and four fixtures preserved in sampled frames; no added luminous grid.
- Light dims and returns; strict sequential fixture activation is weak.
- Saved as ambient-results/ups-mobile-retake-02.mp4 for review.

## UPS — 2026-09-15

- Desktop: rejected. Ceiling lights dim and remain dark instead of switching back on sequentially.
- Mobile: rejected. Model replaces the existing ceiling with additional illuminated panels.
- Both outputs saved for review, not registered in src/story-ambient.js.
- Retakes require user approval. Original static/code-driven scene stays active.

## Doors — 2026-09-15

- Desktop: rejected. Enclosure geometry and side panels move/deform with the doors.
- Mobile: glass doors visibly open and close, but reopen at the end instead of holding closed; slight framing drift.
- Outputs saved for review; neither is registered on the site pending correction/approval.

## Engineer — 2026-09-15

- Both formats: rejected against the requested still pose. The engineer turns his head to face the camera.
- No new videos integrated. All six results remain available for user review.

## Local motion revision — 2026-09-15

Approved three changes, desktop and mobile:
- Exterior: six-second centered 12% photo zoom with eased start/stop, no lateral generated camera motion or looping.
- DGU: approximately double scroll travel; half-speed fan overlay; 650 ms scene crossfade on entry/exit. Scroll navigation uses the inverse mapping.
- Doors: retain first opening only (desktop 0–2.6 s, mobile 0–2.8 s), slow 1.6x and hold final open frame. Replay on scene re-entry.

Rebuild edited media with `node scripts/refine-ambient-local.mjs`. No new generation used.
Validation: production build passed; desktop/mobile scroll mapping round-trip passed; extracted final door frames visually checked open; local browser confirmed desktop doors ended and remained open.

## Server ceiling lighting — 2026-09-15
White ceiling fixtures start dim and brighten with the first door opening (0.4–3.2 seconds). Neutral room surfaces start at reduced exposure; blue accent lighting is preserved with a chroma mask. Both exports retain their open final frame. Matching dark posters avoid a bright loading flash. Processing uses full-resolution chroma before the lighting mask, then exports standard H.264 yuv420p.
