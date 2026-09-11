# Energy film integration

Source: `public/media/tau-cloud-energy-corrected.mp4`, Higgsfield job
`64277ab2-4f07-4983-a8cc-b66141fca1f9`, 1920 × 1080, 24 fps, 20.04 seconds.

The local story uses the new film throughout all four chapters. Chapter boundaries
map to approximately 0–5, 5–10, 10–14 and 14–20 seconds. The old CSS cloud scene
is no longer mounted over the last chapter. Lenis settings remain unchanged.

Rebuild assets with `node scripts/improve-video.mjs`, then
`node scripts/energy-posters.mjs`, then `npm run build`.
The old film and its frame sequence remain available for rollback.

Genjutsu correction replaced the facade scribble with a cloud sign and TAU CLOUD
lettering and removed the inherited Kling watermark. Sampled opening, interior,
transition and aerial frames were visually inspected. The original generation is
retained for comparison. The corrected version has not yet been deployed to Netlify.
