import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const all=JSON.parse(readFileSync('docs/new-hero-all-refs.json','utf8').replace(/^\uFEFF/,''));
const keys=['astana-new','generator','ups','ups-blue','capsule-front','capsule-angle','capsule-wide'];
const refs=keys.map((key,i)=>({reference:`@Image${i+1}`,key,url:all[key]}));
refs.push({reference:'@Image8',key:'operations-empty',url:'https://app-uploads.krea.ai/public/1408fbe5-7b98-4ee5-92d1-f9ff10597912-image.jpeg'});
writeFileSync('docs/hero-12s-refs.json',JSON.stringify({duration:12,model:'bytedance/seedance-2-5',status:'awaiting-video-approval',references:refs,excluded:['almaty-new','energy-reference'],imageEditJob:'1408fbe5-7b98-4ee5-92d1-f9ff10597912'},null,2));
for(const width of [800,1672]){
 const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i','public/media/operations-empty.jpeg','-vf',`scale=${width}:-2:flags=lanczos`,'-frames:v','1','-quality','84',`public/media/operations-empty${width===800?'-small':''}.webp`],{stdio:'inherit'});if(result.status!==0)throw Error('Conversion failed');
}
const content=readFileSync('src/content.js','utf8').replace("src:'/media/operations.webp',small:'/media/operations-small.webp'", "src:'/media/operations-empty.webp',small:'/media/operations-empty-small.webp'");writeFileSync('src/content.js',content);
