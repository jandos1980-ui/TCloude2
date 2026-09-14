import {spawnSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const r=spawnSync(ffmpeg,['-hide_banner','-y','-i','public/media/tau-cloud-krea-new.mp4','-vf','fps=1/2,scale=384:-1,tile=4x2','-frames:v','1','test-results/krea-contact.jpg'],{encoding:'utf8'});console.log(r.stderr);
