import {mkdtemp, mkdir, readdir, readFile, writeFile, stat, rename} from 'node:fs/promises';
import {join, resolve} from 'node:path';

export async function stageSequence(directory){
 const parent=resolve('.media-staging');
 await mkdir(parent,{recursive:true});
 return mkdtemp(join(parent,directory+'-'));
}
export async function publishSequence(staging,directory,metadata){
 const names=(await readdir(staging)).filter(n=>/^\d{4}\.webp$/.test(n)).sort();
 if(!names.length)throw Error('Empty sequence');
 let bytes=0;
 for(const [i,name] of names.entries()){
  if(name!==String(i).padStart(4,'0')+'.webp')throw Error('Frame numbering gap');
  const info=await stat(join(staging,name));
  if(!info.size)throw Error('Empty frame');
  bytes+=info.size;
 }
 // Decode representative files, checking the dimensions before promotion.
 const {spawnSync}=await import('node:child_process');
 const {default:ffmpeg}=await import('ffmpeg-static');
 for(const index of [0,Math.floor(names.length/2),names.length-1]){
  const result=spawnSync(ffmpeg,['-hide_banner','-i',join(staging,names[index]),'-frames:v','1','-f','null','-'],{encoding:'utf8'});
  if(result.status!==0||!result.stderr.includes(`${metadata.width}x${metadata.height}`))throw Error('Frame decode/dimension check failed');
 }
 const root=resolve('public/media',directory);
 const manifest={...JSON.parse(await readFile(join(root,'manifest.json'),'utf8')),...metadata,count:names.length,bytes};
 await writeFile(join(staging,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 const backup=join(resolve('.media-staging'),directory+'-previous-'+Date.now());
 await rename(root,backup);
 try{await rename(staging,root)}catch(error){await rename(backup,root);throw error}
 return manifest;
}
