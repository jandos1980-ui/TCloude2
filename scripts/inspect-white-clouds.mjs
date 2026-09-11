import {spawnSync} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import ffmpeg from 'ffmpeg-static';
await mkdir('test-results/white-clouds',{recursive:true});
const source='public/media/tau-cloud-white-clouds.mp4';
for(const [name,filter] of [
 ['contact','fps=1/2,scale=480:-2,tile=5x2'],
 ['final','select=gte(t\\,19),scale=1920:-2']
]){
 const r=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',source,'-vf',filter,'-frames:v','1',`test-results/white-clouds/${name}.jpg`],{encoding:'utf8'});
 if(r.status!==0)throw Error(r.stderr);
}
