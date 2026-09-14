import {stageSequence,publishSequence} from './sequence-staging.mjs';
import {spawnSync} from 'node:child_process';
import {copyFile} from 'node:fs/promises';
import ffmpeg from 'ffmpeg-static';
const source='public/media/tau-cloud-hero-12s-krea.mp4';
const probe=spawnSync(ffmpeg,['-hide_banner','-i',source],{encoding:'utf8'});
const dimensions=probe.stderr.match(/Video:.*? (\d{3,5})x(\d{3,5})/);
if(!dimensions)throw Error('Cannot read video dimensions');
const width=Number(dimensions[1]),height=Number(dimensions[2]);
const portraitWidth=Math.floor(height*9/16/2)*2;
// Native resolution; mobile crops the central passage without inventing extra detail.
for(const [directory,fps,filter,w,h,suffix] of [
 ['energy-sequence',24,'null',width,height,''],
 ['energy-sequence-mobile',18,`crop=${portraitWidth}:${height},scale=720:1280`,720,1280,'-mobile'],
]){
 const staging=await stageSequence(directory);
 const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',source,'-vf',`fps=${fps},${filter}`,'-c:v','libwebp','-quality','84','-compression_level','5','-start_number','0',`${staging}/%04d.webp`],{stdio:'inherit'});
 if(result.status!==0)throw Error('Frame export failed');
 const manifest=await publishSequence(staging,directory,{base:'/media/'+directory,width:w,height:h,fps,poster:`/media/energy-poster-0${suffix}.webp`,beats:[[0,.1667],[.1667,.4167],[.4167,.6667],[.6667,1]],provenance:'Krea Seedance 2.5 job a00d0659-1efe-4ad7-ab35-34f292e02ad7; 12s infrastructure scenario; Astana, generator, UPS, capsule and empty operations-room references; no Almaty, energy sphere, sky-beam sequence, or people'+(suffix?'; center portrait crop scaled to 720x1280':'')});
 for(const [i,fraction] of [0,.25,.5,1].entries())await copyFile(`public/media/${directory}/${String(Math.round((manifest.count-1)*fraction)).padStart(4,'0')}.webp`,`public/media/energy-poster-${i}${suffix}.webp`);
 console.log(directory,manifest.count,manifest.bytes);
}
