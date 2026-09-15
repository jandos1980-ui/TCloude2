import {readFile,mkdir,writeFile,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const jobs=JSON.parse(await readFile('docs/ambient-generation-current.json','utf8')).jobs;
await mkdir('docs/ambient-results',{recursive:true});
await mkdir('public/media/ambient',{recursive:true});
for(const job of jobs){
 const url=job.status?.result?.urls?.[0];
 if(!url||job.status.status!=='completed')continue;
 const name=`${job.scene}-${job.format}`,raw=`docs/ambient-results/${name}-raw.mp4`,dest=`public/media/ambient/${name}.mp4`;
 try{await stat(dest);continue;}catch{}
 const response=await fetch(url);if(!response.ok)throw new Error(`Download ${name}: ${response.status}`);
 await writeFile(raw,Buffer.from(await response.arrayBuffer()));
 const scale=job.format==='mobile'?'scale=720:-2':'scale=1920:-2';
 const args=['-y','-i',raw];
 // Base exports are forward-only. Run refine-ambient-local.mjs for the approved camera and door cuts.
 args.push('-vf',`${scale},fps=24`);
 args.push('-an','-c:v','libx264','-preset','slow','-crf',job.format==='mobile'?'25':'23','-pix_fmt','yuv420p','-movflags','+faststart',dest);
 const encode=spawnSync(ffmpeg,args,{encoding:'utf8'});if(encode.status)throw new Error(encode.stderr);
 const sheet=spawnSync(ffmpeg,['-y','-i',raw,'-vf','fps=1,scale=320:-2,tile=3x2','-frames:v','1',`docs/ambient-results/${name}-sheet.jpg`],{encoding:'utf8'});
 if(sheet.status)throw new Error(sheet.stderr);
 console.log(`${name}: ${((await stat(dest)).size/1024/1024).toFixed(2)} MB`);
}
