import {spawnSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

function encode(input, filter, output, extra=[]){
 const result=spawnSync(ffmpeg,['-y',...extra,'-i',input,'-vf',filter,'-an','-c:v','libx264','-preset','fast','-crf','23','-g','12','-keyint_min','12','-sc_threshold','0','-pix_fmt','yuv420p','-movflags','+faststart',output],{encoding:'utf8'});
 if(result.status)throw new Error(result.stderr);
 console.log(output);
}
for(const format of ['desktop','mobile']){
 const size=format==='desktop'?'1920x1080':'720x1280';
 // Fixed optical axis; ease into a 12% approach and gently stop after six seconds.
 if(!process.argv.includes('--doors-only'))encode(`docs/ambient-refs/exterior-${format}.jpg`,
  `scale=3840:-2,zoompan=z='1+0.12*(0.5-0.5*cos(PI*min(on/143,1)))':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=144:s=${size}:fps=24`,
  `public/media/ambient/exterior-${format}.mp4`);
 // The original starts closing again after the first opening. Discard that section.
 const end=format==='desktop'?2.6:2.8;
 // Dim neutral room surfaces and ceiling fixtures while preserving saturated blue LEDs.
 // Light rises with the first door opening and stays fully on after 3.2 seconds.
 const fade="(1-clip((T-0.4)/2.8,0,1))";
 const neutral="(1-clip((cb(X,Y)-140)/30,0,1))";
 const ceiling="(1-clip((Y/H-0.22)/0.18,0,1))";
 const white="clip((lum(X,Y)-175)/55,0,1)";
 const lighting=`geq=lum='lum(X,Y)*(1-${fade}*${neutral}*(0.32+0.48*${ceiling}*${white}))':cb='cb(X,Y)':cr='cr(X,Y)'`;

 encode(`docs/ambient-results/doors-${format}-raw.mp4`,
  `trim=end=${end},setpts=1.6*(PTS-STARTPTS),scale=${format==='desktop'?1920:720}:-2,fps=24,format=yuv444p,${lighting},tpad=stop_mode=clone:stop_duration=1`,
  `public/media/ambient/doors-${format}-seek.mp4`);
 const poster=spawnSync(ffmpeg,['-y','-i',`public/media/ambient/doors-${format}.mp4`,'-frames:v','1',`public/media/ambient/doors-${format}-poster.jpg`],{encoding:'utf8'});
 if(poster.status)throw new Error(poster.stderr);
}

