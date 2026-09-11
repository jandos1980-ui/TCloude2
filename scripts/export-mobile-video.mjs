import {stageSequence,publishSequence} from './sequence-staging.mjs';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,stat,copyFile} from 'node:fs/promises';
import ffmpeg from 'ffmpeg-static';
const source='public/media/tau-cloud-energy-portrait.mp4';
const root=await stageSequence('energy-sequence-mobile');
const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',source,
 '-vf','fps=18,crop=972:1728:54:0,scale=720:1280:flags=lanczos','-c:v','libwebp','-quality','82',
 '-compression_level','5','-start_number','0','-progress','pipe:1',`${root}/%04d.webp`],{encoding:'utf8'});
if(result.status!==0)throw Error(result.stderr);
const count=Number([...result.stdout.matchAll(/^frame=(\d+)/gm)].at(-1)?.[1]);
if(!count)throw Error('No portrait frames exported');
const manifest=await publishSequence(root,'energy-sequence-mobile',{width:720,height:1280,fps:18,poster:'/media/energy-poster-0-mobile.webp',beats:[[0,.25],[.25,.5],[.5,.7],[.7,1]],provenance:'Higgsfield Seedance 2.5 b3fba704-aa65-43e8-8004-e909e40ef89e; dedicated 1080x1920 source; crop 972x1728 at 54,0; 720x1280 WebP 82'});
for(const [i,fraction] of [0,.25,.5,1].entries())await copyFile(`public/media/energy-sequence-mobile/${String(Math.round((count-1)*fraction)).padStart(4,'0')}.webp`,`public/media/energy-poster-${i}-mobile.webp`);
console.log(JSON.stringify(manifest));
