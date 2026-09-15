// Only the current scene owns a decoder and a network request.
const scenes={0:'exterior',2:'ups',3:'doors',5:'engineer'};
export function createAmbientVideo(canvas){
 const video=document.createElement('video');
 video.className='scene-media';video.muted=true;video.playsInline=true;
 video.preload='none';video.setAttribute('aria-hidden','true');
 video.style.opacity='0';video.style.pointerEvents='none';canvas.after(video);
 let key='',enabled=false,failed=false,scrub=false,targetProgress=0;
 function seek(){
  if(!scrub||!enabled||failed||!Number.isFinite(video.duration)||video.seeking)return;
  const target=Math.min(video.duration-.04,video.duration*targetProgress);
  if(Math.abs(video.currentTime-target)>1/48)video.currentTime=Math.max(0,target);
 }
 video.addEventListener('loadeddata',()=>{if(scrub&&enabled){video.style.opacity='1';seek();}});
 video.addEventListener('seeked',()=>{if(scrub&&enabled){video.style.opacity='1';seek();}});
 video.addEventListener('playing',()=>{if(enabled)video.style.opacity='1';});
 video.addEventListener('error',()=>{failed=true;video.style.opacity='0';});
 function update(scene,mobile,visible,reduced,progress=0){
  const name=scenes[scene],next=name&&!reduced?`${name}-${mobile?'mobile':'desktop'}`:'';
  enabled=!!next&&visible&&!document.hidden;
  scrub=name==='doors';targetProgress=Math.max(0,Math.min(1,progress));
  if(next!==key){
   video.pause();video.style.opacity='0';failed=false;key=next;
   video.removeAttribute('src');
   if(key){video.src=`/media/ambient/${key}${scrub?'-seek':''}.mp4`;video.loop=name==='engineer';}
   video.load();
  }
  if(enabled&&!failed){if(scrub){video.pause();seek();}else if(video.paused&&!video.ended)video.play().catch(()=>{});}
  else video.pause();
 }
 return {update,video,get active(){return enabled&&!failed&&video.style.opacity==='1';},destroy(){enabled=false;video.pause();video.removeAttribute('src');video.load();}};
}
