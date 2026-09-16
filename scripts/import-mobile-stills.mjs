import sharp from 'sharp';
import {mkdir,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
const source=process.argv[2] || 'C:/Users/JAKE/Desktop';
const out='public/media/mobile-stills';
const entries=[['10_42_35','astana-exterior'],['10_43_52','datacenter-aerial'],['10_44_03','diesel-generator'],['10_44_08','ups-batteries'],['10_44_13','ups-room'],['10_44_49','ups-room-blue'],['10_44_24','server-capsule-angle'],['10_44_32','server-capsules-front'],['10_44_57','operations-room'],['10_45_04','engineer']];
await mkdir(out,{recursive:true});
const report=[];
for(const [time,name] of entries){
 const input=path.join(source,`Изображение Codex 16 сент. 2026 г., ${time}.png`),output=`${out}/${name}.webp`;
 const metadata=await sharp(input).metadata();
 await sharp(input).webp({lossless:true,effort:6}).toFile(output);
 const original=await sharp(input).ensureAlpha().raw().toBuffer(),decoded=await sharp(output).ensureAlpha().raw().toBuffer();
 if(!original.equals(decoded))throw Error(`Pixel mismatch: ${name}`);
 report.push({source:path.basename(input),output,width:metadata.width,height:metadata.height,pngBytes:(await stat(input)).size,webpBytes:(await stat(output)).size,pixelIdentical:true});
}
await writeFile(`${out}/compression-report.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
