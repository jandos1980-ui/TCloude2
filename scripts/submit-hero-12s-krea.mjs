import { Krea } from '@krea-ai/sdk';
import fs from 'node:fs/promises';

const apiKey = process.env.KREA_API_KEY;
if (!apiKey) {
  throw new Error('KREA_API_KEY is not set');
}

const refsPath = new URL('../docs/hero-12s-refs.json', import.meta.url);
const briefPath = new URL('../docs/hero-12s-infrastructure.md', import.meta.url);
const refs = JSON.parse(await fs.readFile(refsPath, 'utf8'));
const brief = await fs.readFile(briefPath, 'utf8');
const prompt = brief.split('## Production prompt')[1]?.trim();

if (!prompt) {
  throw new Error('Production prompt not found');
}

const krea = new Krea({ apiKey });
const job = await krea.video('bytedance/seedance-2-5', {
  prompt: prompt
    .replace('A gentle forward push', 'A controlled forward push')
    .replace('Clean directional cut', 'HARD CUT')
    .replaceAll('Clean cut', 'HARD CUT')
    .replace('Camera gently tracks', 'Camera tracks')
    .replace('Camera slowly stops', 'Camera eases into a stable final hold'),
  reference_images: refs.references.map((ref) => ref.url),
  duration: 12,
  resolution: '1080p',
  aspect_ratio: '16:9',
  generate_audio: false,
  enhance_prompt: false,
});

const output = {
  submittedAt: new Date().toISOString(),
  model: 'bytedance/seedance-2-5',
  duration: 12,
  resolution: '1080p',
  jobId: job.job_id ?? job.id ?? job.data?.job_id ?? null,
  status: job.status ?? job.data?.status ?? null,
  raw: job,
};

await fs.writeFile(
  new URL('../docs/hero-12s-krea-job.json', import.meta.url),
  `${JSON.stringify(output, null, 2)}\n`,
);

console.log(JSON.stringify({ jobId: output.jobId, status: output.status }));
