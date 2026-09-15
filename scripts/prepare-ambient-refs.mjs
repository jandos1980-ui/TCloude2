import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';

const output='docs/ambient-refs';
await mkdir(output,{recursive:true});
const scenes=[
 ['exterior','public/media/energy-sequence/0000.webp',0.68],
 ['ups','public/media/ups.webp',0.55],
 ['doors','public/media/capsule-front.webp',0.26],
 ['engineer','public/media/engineer.webp',0.51],
];
const refs=[];
for(const [scene,file,focus] of scenes){
 const {width,height}=await sharp(file).metadata();
 for(const format of ['desktop','mobile']){
  const aspect=format==='desktop'?16/9:9/16;
  const cropWidth=Math.min(width,Math.round(height*aspect));
  const cropHeight=Math.min(height,Math.round(width/aspect));
  const left=Math.max(0,Math.min(width-cropWidth,Math.round(width*focus-cropWidth/2)));
  const path=`${output}/${scene}-${format}.jpg`;
  await sharp(file).extract({left,top:Math.floor((height-cropHeight)/2),width:cropWidth,height:cropHeight}).resize(format==='desktop'?1920:720,format==='desktop'?1080:1280).jpeg({quality:94}).toFile(path);
  refs.push({scene,format,path});
 }
}
await writeFile(`${output}/manifest.json`,JSON.stringify(refs,null,2));
console.log(`Prepared ${refs.length} separate reference compositions.`);
