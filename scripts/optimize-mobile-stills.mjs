import {mkdir,stat,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
const names=['astana-exterior','diesel-generator','ups-room-blue','server-capsule-angle','operations-room','engineer'];
const dir='public/media/mobile-stills';
await mkdir(`${dir}/optimized`,{recursive:true});
const report=[];
for(const name of names){
 const input=`${dir}/${name}.webp`, output=`${dir}/optimized/${name}.webp`;
 await sharp(input).webp({quality:92,effort:6,smartSubsample:true}).toFile(output);
 report.push({name,originalBytes:(await stat(input)).size,optimizedBytes:(await stat(output)).size,width:941,height:1672,quality:92});
}
await writeFile(`${dir}/optimized/report.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
