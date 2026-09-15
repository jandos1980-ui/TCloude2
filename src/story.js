import {createFrameSource} from './frame-source.js';
import {scrollPageTo,reducedMotion} from './smooth-scroll.js';
import {storyMedia} from './content.js';
import {desktopMoment, storyStops} from './story-timeline.js';
import {sceneStarts,sceneCopies,sceneForFrame} from './story-scenes.js';
import {drawObjectMotion} from './story-objects.js';

export function initStory(){
 const story=document.querySelector('#story'),stage=story.querySelector('.stage'),canvas=story.querySelector('#film'),poster=story.querySelector('#poster'),ctx=canvas.getContext('2d');
 const mobile=matchMedia('(max-width:600px)'),reduce=reducedMotion,stops=storyStops;
 let progress=0,active=-1,manifest=null,frameSource=null,wanted=0,scheduled=false,generation=0,controller=new AbortController(),busy=0,direction=1,scene=-1,drawn=-1,objectTick=0,lastTick=0,visible=true;
 const blend=document.createElement('canvas');blend.className='scene-media scene-blend';blend.setAttribute('aria-hidden','true');canvas.after(blend);
 const blendCtx=blend.getContext('2d');let fade;
 const cache=new Map(),pending=new Set(),failed=new Map(),posters=new Map();
 function preloadPosters(){
  const media=mobile.matches?storyMedia.mobile:storyMedia.desktop;
  const sources=sceneStarts[mobile.matches?'mobile':'desktop'].map(i=>`${media.base}/${String(i).padStart(4,'0')}.webp`);
  for(const src of sources){if(posters.has(src))continue;const image=new Image();image.decoding='async';image.src=src;posters.set(src,image);image.decode().catch(()=>{});}
 }
 function transitionScene(){
  if(reduce.matches||scene<0)return;
  const ratio=Math.min(devicePixelRatio,2),width=Math.round(stage.clientWidth*ratio),height=Math.round(stage.clientHeight*ratio);
  if(!width||!height)return;
  const snapshot=document.createElement('canvas');snapshot.width=width;snapshot.height=height;const context=snapshot.getContext('2d');
  const source=canvas.style.opacity==='1'?canvas:poster;
  if(source===canvas||poster.complete&&poster.naturalWidth){const w=source===canvas?canvas.width:poster.naturalWidth,h=source===canvas?canvas.height:poster.naturalHeight,s=Math.max(width/w,height/h);context.drawImage(source,(width-w*s)/2,(height-h*s)/2,w*s,h*s);}
  const opacity=Number(getComputedStyle(blend).opacity);
  if(opacity>0&&blend.width&&blend.height){context.globalAlpha=opacity;context.drawImage(blend,0,0,width,height);}
  fade?.cancel();blend.width=width;blend.height=height;blendCtx.drawImage(snapshot,0,0);
  fade=blend.animate([{opacity:1},{opacity:0}],{duration:250,easing:'cubic-bezier(.23,1,.32,1)'});
 }
 function animateObjects(time){
  objectTick=0;
  if(reduce.matches){fade?.cancel();schedule();return;}
  if(!visible||document.hidden||![1,2,3,4,5].includes(scene))return;
  if(time-lastTick>=1000/30){lastTick=time;draw(time);}
  objectTick=requestAnimationFrame(animateObjects);
 }
 function draw(time=performance.now()){
  if(!manifest||reduce.matches){canvas.style.opacity='0';return;}
  // A nearby frame is useful only within the current scene. Otherwise reveal its poster.
  const starts=sceneStarts[mobile.matches?'mobile':'desktop'],start=starts[scene],end=starts[scene+1]??manifest.count;
  const key=[...cache.keys()].filter(i=>i>=start&&i<end&&Math.abs(i-wanted)<=12).sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted))[0];
  if(key===undefined){if(drawn>=0)transitionScene();canvas.style.opacity='0';drawn=-1;return;}
  if(drawn<0&&canvas.style.opacity==='0')transitionScene();
  const b=cache.get(key),ratio=Math.min(devicePixelRatio,2,Math.max(b.width/stage.clientWidth,b.height/stage.clientHeight)),w=Math.round(stage.clientWidth*ratio),h=Math.round(stage.clientHeight*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high'}const scale=Math.max(w/b.width,h/b.height),x=(w-b.width*scale)/2,y=(h-b.height*scale)/2;ctx.drawImage(b,x,y,b.width*scale,b.height*scale);
  if(!reduce.matches){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);drawObjectMotion(ctx,b,key,mobile.matches,time);ctx.restore();}
  drawn=key;canvas.dataset.frame=String(key);canvas.style.opacity='1';
 }
 function queue(){if(!manifest||reduce.matches)return;if(mobile.matches){const r=story.getBoundingClientRect(),visible=!document.hidden&&r.bottom>0&&r.top<innerHeight;frameSource.setWindow(wanted,visible);if(!visible)return;}const token=generation;for(const [i,b]of cache)if(Math.abs(i-wanted)>12){b.close();cache.delete(i)}const near=[wanted,...Array.from({length:7},(_,i)=>wanted+(i+1)*direction),...Array.from({length:3},(_,i)=>wanted-(i+1)*direction)];for(const i of near){if(busy>=3)break;if(i<0||i>=manifest.count||cache.has(i)||pending.has(i)||(failed.get(i)?.attempts>=3||failed.get(i)?.retryAt>Date.now()))continue;busy++;pending.add(i);frameSource(i).then(createImageBitmap).then(b=>{if(token!==generation||Math.abs(i-wanted)>12){b.close();return}failed.delete(i);cache.set(i,b);schedule()}).catch(e=>{if(token===generation&&e.name!=='AbortError'){const attempts=(failed.get(i)?.attempts||0)+1;failed.set(i,{attempts,retryAt:Date.now()+attempts*400});if(attempts<3)setTimeout(()=>{if(token===generation)queue()},attempts*400+10)}}).finally(()=>{if(token!==generation)return;busy--;pending.delete(i);queue()})}}
 function update(){
  scheduled=false;
  const travel=story.offsetHeight-stage.offsetHeight,rect=story.getBoundingClientRect();
  visible=rect.bottom>0&&rect.top<innerHeight;
  progress=reduce.matches?0:Math.max(0,Math.min(1,-rect.top/Math.max(1,travel)));
  const chapter=progress>=stops[3]?3:progress>=stops[2]?2:progress>=stops[1]?1:0;
  const moment=desktopMoment(progress),count=manifest?.count??(mobile.matches?217:289);
  const beats=manifest?.beats??[[0,.1667],[.1667,.4167],[.4167,.6667],[.6667,1]];
  const local=(progress-stops[chapter])/(stops[chapter+1]-stops[chapter]),motion=Math.max(0,Math.min(1,(local-.03)/.94)),beat=beats[chapter],previous=wanted;
  wanted=Math.round((mobile.matches?beat[0]+(beat[1]-beat[0])*motion:moment.frame)*(count-1));
  if(wanted!==previous)direction=wanted>previous?1:-1;
  const nextScene=sceneForFrame(wanted,mobile.matches),copy=reduce.matches?0:sceneCopies[nextScene];
  if(scene!==nextScene){
   transitionScene();scene=nextScene;
   const media=mobile.matches?storyMedia.mobile:storyMedia.desktop,start=sceneStarts[mobile.matches?'mobile':'desktop'][scene];
   poster.src=`${media.base}/${String(start).padStart(4,'0')}.webp`;
   poster.alt=['Фасад дата-центра TAU CLOUD','Дизель-генераторная установка','Источники бесперебойного питания','Серверные стойки TAU CLOUD','Операторская TAU CLOUD','Общий план серверных стоек'][scene];
  }
  active=copy>=0?copy:3;
  story.querySelectorAll('.chapter').forEach((e,i)=>{e.classList.toggle('active',i===copy);e.inert=i!==copy;});
  stage.dataset.copy=String(copy);stage.dataset.chapter=String(active);stage.dataset.scene=String(scene);stage.dataset.reveal=String(scene>=4);
  story.querySelector('.chapter-counter').innerHTML=`0${active+1} <span>/ 04</span>`;
  story.querySelectorAll('[data-jump]').forEach((b,i)=>{b.classList.toggle('current',i===active);b.setAttribute('aria-pressed',String(i===active));b.querySelector('i').style.transform=`scaleX(${Math.max(0,Math.min(1,(progress-stops[i])/(stops[i+1]-stops[i])))})`;});
  if(manifest&&!reduce.matches){draw();queue();if(!objectTick&&visible&&!document.hidden)objectTick=requestAnimationFrame(animateObjects);}
  else canvas.style.opacity='0';
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
 async function select(){generation++;const token=generation;controller.abort();controller=new AbortController();cache.forEach(b=>b.close());cache.clear();pending.clear();failed.clear();busy=0;manifest=null;active=-1;scene=-1;drawn=-1;cancelAnimationFrame(objectTick);objectTick=0;fade?.cancel();canvas.style.opacity='0';update();if(reduce.matches)return;try{const base=(mobile.matches?storyMedia.mobile:storyMedia.desktop).base;let response=await fetch(`${base}/playback.json`,{signal:controller.signal});if(!response.ok||!response.headers.get('content-type')?.includes('json'))response=await fetch(`${base}/manifest.json`,{signal:controller.signal});if(!response.ok)return;const data=await response.json();if(token!==generation)return;if(mobile.matches){await poster.decode().catch(()=>{});if(token!==generation)return}manifest=data;frameSource=createFrameSource(data,controller.signal,{mobile:mobile.matches});schedule()}catch{}}
 mobile.addEventListener('change',preloadPosters);preloadPosters();
 mobile.addEventListener('change',select);reduce.addEventListener('change',select);addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);document.addEventListener('visibilitychange',schedule);addEventListener('pagehide',()=>{generation++;controller.abort();cancelAnimationFrame(objectTick);fade?.cancel();cache.forEach(b=>b.close());cache.clear()});
 story.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>scrollPageTo(story.offsetTop+[.025,.26,.55,.72][+b.dataset.jump]*(story.offsetHeight-stage.offsetHeight)));select();
}
