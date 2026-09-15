import {spawnSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
for(const file of ['exterior.jpeg','hall-from-film.webp','capsule.jpg']){
 const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',`public/media/${file}`,
 '-vf','scale=800:-2:flags=lanczos','-frames:v','1','-quality','84',`public/media/${file.split('.')[0]}-small.webp`],{stdio:'inherit'});
 if(result.status!==0)throw Error(file);
}
