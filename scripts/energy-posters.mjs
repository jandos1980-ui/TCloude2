import {copyFile} from 'node:fs/promises';
for (const [directory, frames, suffix] of [
  ['energy-sequence', [0, 120, 240, 480], ''],
  ['energy-sequence-mobile', [0, 90, 180, 360], '-mobile'],
]) {
  for (const [chapter, frame] of frames.entries()) {
    await copyFile(`public/media/${directory}/${String(frame).padStart(4, '0')}.webp`,
      `public/media/energy-poster-${chapter}${suffix}.webp`);
  }
}
