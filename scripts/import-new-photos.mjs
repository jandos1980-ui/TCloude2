import {spawnSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const photos = {'Здание Астана.png':'astana-new','Здание алматы.png':'almaty-new','Капсула1.png':'capsule-front','Капсула2.png':'capsule-angle','Капсула3.png':'capsule-wide','ИБП.png':'ups','ИБП2.png':'ups-blue','дизель-генераторная установка.png':'generator','операторская2.png':'operations'};
for (const [source,name] of Object.entries(photos)) {
 for (const width of [800,1672]) {
  const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',`C:/Users/JAKE/Desktop/taucloud/media/${source}`,'-vf',`scale=${width}:-2:flags=lanczos`,'-frames:v','1','-quality','84',`public/media/${name}${width===800?'-small':''}.webp`],{stdio:'inherit'});
  if(result.status!==0) throw Error(source);
 }
}
