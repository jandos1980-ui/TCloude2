import './desktop-next-control.css';

// Sound remains available without adding visual controls to the story.
export function initDesktopStoryControls(stage) {
 const lifecycle=new AbortController();
 const buttons=[...stage.querySelectorAll('[data-jump]')];
 const dots=document.createElement('nav');
 dots.className='desktop-story-dots';dots.setAttribute('aria-label','Главы истории');
 dots.innerHTML=buttons.map((button,index)=>`<button type="button" data-dot="${index}" aria-label="${button.getAttribute('aria-label')}"></button>`).join('');
 const dotButtons=[...dots.querySelectorAll('button')];
 dotButtons.forEach((dot,index)=>dot.addEventListener('click',()=>buttons[index].click(),{signal:lifecycle.signal}));
 const svgNS='http://www.w3.org/2000/svg';
 const motion=document.createElementNS(svgNS,'svg');motion.classList.add('desktop-indicator-motion');
 motion.setAttribute('viewBox',`0 0 44 ${buttons.length*44}`);motion.setAttribute('aria-hidden','true');
 const pill=document.createElementNS(svgNS,'path');motion.append(pill);dots.append(motion);
 stage.append(dots);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let motionFrame=0,startY=22,endY=22;
 function moveIndicator(index,immediate=false){
  cancelAnimationFrame(motionFrame);
  const target=22+index*44,fromStart=startY,fromEnd=endY;
  const draw=()=>pill.setAttribute('d',`M22 ${startY} L22 ${endY+.01}`);
  if(immediate||reduced.matches){startY=endY=target;draw();return;}
  const down=target>=(fromStart+fromEnd)/2,began=performance.now();
  const ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
  function frame(now){const elapsed=now-began,lead=ease(elapsed/180),trail=ease((elapsed-70)/180);startY=fromStart+(target-fromStart)*(down?trail:lead);endY=fromEnd+(target-fromEnd)*(down?lead:trail);draw();if(elapsed<250)motionFrame=requestAnimationFrame(frame);}
  motionFrame=requestAnimationFrame(frame);
 }
 function sync(){
  const index=Number(stage.dataset.chapter||0);
  dotButtons.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));
  moveIndicator(index);
 }
 let context,lastChapter=stage.dataset.chapter,lastTick=-Infinity;
 function unlock(){
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return;
  try{context??=new Audio();context.resume().catch(()=>{});}catch{}
 }
 for(const event of ['pointerdown','keydown','wheel'])document.addEventListener(event,unlock,{passive:true,signal:lifecycle.signal});
 function tick(){
  const rect=stage.getBoundingClientRect();
  if(context?.state!=='running'||document.hidden||rect.bottom<=0||rect.top>=innerHeight)return;
  const time=context.currentTime;if(time-lastTick<.08)return;lastTick=time;
  const oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.type='sine';oscillator.frequency.setValueAtTime(1750,time);oscillator.frequency.exponentialRampToValueAtTime(620,time+.022);
  gain.gain.setValueAtTime(.0001,time);gain.gain.setValueAtTime(.055,time+.002);gain.gain.exponentialRampToValueAtTime(.0001,time+.028);
  oscillator.connect(gain);gain.connect(context.destination);oscillator.start(time);oscillator.stop(time+.03);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 }
 const observer=new MutationObserver(()=>{
  const next=stage.dataset.chapter;
  if(next!==lastChapter){if(lastChapter!==undefined)tick();lastChapter=next;sync();}
 });
 observer.observe(stage,{attributes:true,attributeFilter:['data-chapter']});
 reduced.addEventListener('change',()=>moveIndicator(Number(stage.dataset.chapter||0),true),{signal:lifecycle.signal});
 let lastScroll=scrollY,hideTimer;
 addEventListener('scroll',()=>{
  if(scrollY===lastScroll)return;lastScroll=scrollY;
  const rect=stage.getBoundingClientRect();if(rect.bottom<=0||rect.top>=innerHeight)return;
  stage.dataset.scrolling='true';clearTimeout(hideTimer);hideTimer=setTimeout(()=>delete stage.dataset.scrolling,700);
 },{passive:true,signal:lifecycle.signal});
 sync();
 moveIndicator(Number(stage.dataset.chapter||0),true);
 return ()=>{lifecycle.abort();observer.disconnect();clearTimeout(hideTimer);cancelAnimationFrame(motionFrame);dots.remove();context?.close().catch(()=>{});};
}
