import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// One streaming response removes a network round trip for every animation frame.
for (const directory of ['sequence', 'sequence-mobile']) {
  const root = new URL(`../public/media/${directory}/`, import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
  const frames = await Promise.all(Array.from({length: manifest.count}, (_, i) =>
    readFile(new URL(`${String(i).padStart(4, '0')}.webp`, root))));
  const header = Buffer.from(JSON.stringify(frames.map(frame => frame.length)));
  const length = Buffer.alloc(4);
  length.writeUInt32LE(header.length);
  const data = Buffer.concat([length, header, ...frames]);
  const name = `frames-${createHash('sha256').update(data).digest('hex').slice(0, 12)}.bin`;
  await writeFile(new URL(name, root), data);
  await writeFile(new URL('playback.json', root), JSON.stringify({...manifest, stream: `${manifest.base}/${name}`}));
  console.log(`${directory}: ${frames.length} frames, ${data.length} bytes`);
}
