import {spawnSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const r=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i','C:/Users/JAKE/Desktop/taucloud/media/энергия.avif','-frames:v','1','public/media/energy-reference.png'],{stdio:'inherit'});if(r.status!==0)throw Error('Conversion failed');
