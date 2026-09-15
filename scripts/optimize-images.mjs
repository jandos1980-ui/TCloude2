import sharp from 'sharp';
import {mkdir, writeFile} from 'node:fs/promises';
const names=['logo.png','capsule-angle.webp','cloud-infrastructure-blue.webp','platform-services.webp','datacenter-construction.webp','ups-blue.webp'];
await mkdir('public/media/optimized',{recursive:true});
const manifest={};
for(const name of names){
 const input=`public/media/${name}`,meta=await sharp(input).metadata();
 const stem=name.replace(/\.[^.]+$/,'');
 const widths=name==='logo.png'?[Math.min(meta.width,354)]:[480,800,meta.width].filter((w,i,a)=>w<=meta.width&&a.indexOf(w)===i);
 const variants=[];
 for(const width of widths){
  const base=`/media/optimized/${stem}-${width}`;
  await sharp(input).resize({width}).avif({quality:80}).toFile(`public${base}.avif`);
  await sharp(input).resize({width}).webp({quality:85}).toFile(`public${base}.webp`);
  variants.push({width,base});
 }
 manifest[`/media/${name}`]={width:meta.width,height:meta.height,variants};
}
await writeFile('src/image-manifest.json',JSON.stringify(manifest,null,2)+'\n');
