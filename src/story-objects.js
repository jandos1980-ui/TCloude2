import {sceneForFrame} from './story-scenes.js';
// Tracked details in the 1920x1080 source. The mobile export is a centered crop.
const mix=(a,b,t)=>a+(b-a)*t;
const lightMasks=new WeakMap();
function lightMask(bitmap){
 if(lightMasks.has(bitmap))return lightMasks.get(bitmap);
 const mask=document.createElement('canvas');mask.width=480;mask.height=Math.round(480*bitmap.height/bitmap.width);
 const context=mask.getContext('2d',{willReadFrequently:true});context.drawImage(bitmap,0,0,mask.width,mask.height);
 const pixels=context.getImageData(0,0,mask.width,mask.height),data=pixels.data;
 for(let i=0;i<data.length;i+=4){const strength=Math.max(0,Math.min(1,(data[i+2]-data[i]-45)/65))*Math.max(0,Math.min(1,(data[i+2]-110)/100));data[i]=58;data[i+1]=194;data[i+2]=255;data[i+3]=Math.round(strength*160);}
 context.putImageData(pixels,0,0);lightMasks.set(bitmap,mask);return mask;
}
function track(frame,samples){
 const next=samples.findIndex(sample=>sample[0]>=frame);
 if(next<=0)return samples[next===0?0:samples.length-1][1];
 const [a,av]=samples[next-1],[b,bv]=samples[next];
 return av.map((v,i)=>mix(v,bv[i],(frame-a)/(b-a)));
}
export function drawObjectMotion(ctx,bitmap,frame,mobile,time){
 const f=mobile?frame*4/3:frame,t=time/1000,scene=sceneForFrame(frame,mobile);
 if(scene===3||scene===5){
  ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.18+.38*(1+Math.sin(t*1.7))/2;ctx.drawImage(lightMask(bitmap),0,0,bitmap.width,bitmap.height);ctx.restore();return;
 }
 ctx.save();
 if(mobile){ctx.scale(bitmap.width/606,bitmap.height/1080);ctx.translate(-657,0);}
 else ctx.scale(bitmap.width/1920,bitmap.height/1080);
 if(scene===1){
  const [x,y]=track(f,[[54,[590,439]],[70,[585,439]],[89,[580,439]]]);
  ctx.beginPath();ctx.ellipse(x,y,53,88,0,0,Math.PI*2);ctx.clip();
  // Leave the foreground pipe and motor housing untouched.
  ctx.beginPath();ctx.rect(x-54,y-90,58,180);ctx.clip();
  ctx.translate(x,y);ctx.scale(.6,1);ctx.rotate(t*1.2);
  ctx.fillStyle='rgba(128,151,165,.24)';
  for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(8,0);ctx.quadraticCurveTo(40,-35,86,-8);ctx.quadraticCurveTo(62,18,15,13);ctx.closePath();ctx.fill();}
 }else if(scene===2){
  const [x,y]=track(f,[[90,[398,403]],[108,[394,401]],[126,[390,401]]]);
  ctx.fillStyle=`rgba(66,211,230,${.3+.25*(1+Math.sin(t*2))/2})`;ctx.fillRect(x+2,y+2,10,12);
  for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x-1+i*7,y+34-i,2.3,0,Math.PI*2);ctx.fillStyle=`rgba(63,238,174,${.25+.65*(1+Math.sin(t*3-i*1.4))/2})`;ctx.fill();}
 }else if(scene===4){
  const p=track(f,[[181,[1015,244,1309,222,1311,292,1017,309]],[210,[1015,236,1318,213,1320,283,1017,303]],[236,[1017,230,1329,206,1330,277,1019,296]]]);
  const point=(u,v)=>[mix(mix(p[0],p[2],u),mix(p[6],p[4],u),v),mix(mix(p[1],p[3],u),mix(p[7],p[5],u),v)];
  ctx.beginPath();ctx.moveTo(p[0],p[1]);for(let i=2;i<8;i+=2)ctx.lineTo(p[i],p[i+1]);ctx.closePath();ctx.clip();
  ctx.fillStyle='rgba(8,27,49,.86)';ctx.fill();
  for(const [j,color] of ['#4cbff1','#d35b99','#e8c771'].entries()){
   ctx.beginPath();
   for(let i=0;i<=80;i++){const u=i/80,v=.52+.16*Math.sin(u*15-t*1.5+j*2)+.09*Math.sin(u*31-t*2.1+j);const [x,y]=point(u,v);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
   ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
   const u=(t*.12+j/3)%1,v=.52+.16*Math.sin(u*15-t*1.5+j*2)+.09*Math.sin(u*31-t*2.1+j),[x,y]=point(u,v);
   ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  }
 }
 ctx.restore();
}
