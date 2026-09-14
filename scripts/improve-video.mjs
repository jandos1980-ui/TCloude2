import {stageSequence,publishSequence} from './sequence-staging.mjs';
import {spawnSync} from 'node:child_process';
import {readFile, writeFile, stat} from 'node:fs/promises';
import ffmpeg from 'ffmpeg-static';

const source = process.env.TAU_VIDEO_SOURCE || 'public/media/tau-cloud-energy-corrected.mp4';

// Derive playback frames from the original film, never from compressed WebP frames.
for (const [directory, fps, filter, width, height] of [
  ['energy-sequence', 24, 'scale=1920:1080:flags=lanczos,unsharp=5:5:0.35:5:5:0', 1920, 1080],
]) {
  const root = await stageSequence(directory);
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i',
    source, '-vf', `fps=${fps},${filter}`, '-c:v', 'libwebp',
    '-quality', '82', '-compression_level', '5', '-start_number', '0', `${root}/%04d.webp`], {stdio: 'inherit'});
  if (result.status !== 0) throw new Error(`Frame export failed: ${directory}`);
  const manifest=await publishSequence(root,directory,{base:'/media/'+directory,fps,width,height,poster:'/media/energy-poster-0.webp',beats:[[0,.25],[.25,.5],[.5,.7],[.7,1]],provenance:'Higgsfield corrected 1920x1080 source '+source+'; WebP 82; no upscale'});
  console.log(directory,manifest.count,manifest.bytes);
}
