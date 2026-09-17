/** Always enabled; browser audio is unlocked by the first user gesture. */
export function initPreviewSound(root){
 let context,lastTick=-Infinity,lastScene=root.dataset.scene,pendingTick=false;
 function unlock(){
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio||context?.state==='running')return;
  try{
   context??=new Audio();
   context.resume().then(()=>{if(pendingTick){pendingTick=false;tick();}}).catch(()=>{});
  }catch{}
 }
 for(const event of ['pointerdown','pointerup','touchstart','touchend','keydown','click','wheel'])document.addEventListener(event,unlock,{capture:true,passive:true});
 function tick(){
  if(context?.state!=='running'||document.hidden)return;
  const time=context.currentTime;if(time-lastTick<.08)return;lastTick=time;
  const oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.type='sine';oscillator.frequency.setValueAtTime(1750,time);oscillator.frequency.exponentialRampToValueAtTime(620,time+.022);
  gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(.055,time+.002);gain.gain.exponentialRampToValueAtTime(.0001,time+.028);
  oscillator.connect(gain);gain.connect(context.destination);oscillator.start(time);oscillator.stop(time+.03);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 }
 root.addEventListener('scenechange',event=>{
  const next=String(event.detail.index);
  if(lastScene!==undefined&&next!==lastScene){
   if(context?.state==='running')tick();
   else{pendingTick=true;unlock();}
  }
  lastScene=next;
 });
 addEventListener('pagehide',()=>{pendingTick=false;context?.suspend();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&context)unlock();});
}
