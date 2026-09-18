import './mobile-variants.css';
export function initMobileVariants(){
 const root=document.querySelector('.mobile-story');
 document.documentElement.dataset.mobileVariant='dribbble';
  const nav=root.querySelector('.mobile-story-progress');
 const progress=document.createElement('div');progress.className='story-scroll-meter';
 progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','Прогресс прокрутки истории');progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax','100');
 const updateProgress=value=>{progress.setAttribute('aria-valuenow',String(Math.round(value*100)));};
 updateProgress(Number(root.dataset.scrollProgress||0));
 root.addEventListener('storyprogress',event=>updateProgress(event.detail.progress));
 progress.innerHTML='<span class="story-scroll-fill"></span><span class="story-scroll-position"></span>';
  nav.append(progress);
 // Dribbble 3761305: the leading end moves first, then the trailing end catches up.
 const svgNS='http://www.w3.org/2000/svg';
 const motion=document.createElementNS(svgNS,'svg');motion.classList.add('page-indicator-motion');
 motion.setAttribute('viewBox','0 0 44 264');motion.setAttribute('aria-hidden','true');
 const pill=document.createElementNS(svgNS,'path');motion.append(pill);nav.append(motion);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let motionFrame=0,startY=22,endY=22;
 function draw(){pill.setAttribute('d',`M22 ${startY} L22 ${endY+.01}`);}
 function moveIndicator(index,immediate=false){
  cancelAnimationFrame(motionFrame);
  const target=22+index*44,fromStart=startY,fromEnd=endY;
  if(immediate||reduced.matches){startY=endY=target;draw();return;}
  const down=target>=(fromStart+fromEnd)/2,began=performance.now();
  const ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
  function tick(now){
   const elapsed=now-began;
   const lead=ease(elapsed/180),trail=ease((elapsed-70)/180);
   startY=fromStart+(target-fromStart)*(down?trail:lead);
   endY=fromEnd+(target-fromEnd)*(down?lead:trail);
   draw();if(elapsed<250)motionFrame=requestAnimationFrame(tick);
  }
  motionFrame=requestAnimationFrame(tick);
 }
 moveIndicator(Number(root.dataset.scene||0),true);
 root.addEventListener('scenechange',event=>moveIndicator(event.detail.index));
 reduced.addEventListener('change',()=>moveIndicator(Number(root.dataset.scene||0),true));
 addEventListener('pagehide',()=>cancelAnimationFrame(motionFrame));
  const animated=document.createElement('button');animated.type='button';animated.className='dribbble-scroll';
 animated.setAttribute('aria-label','Следующая сцена');
 animated.innerHTML='<span class="scroll-bounce" aria-hidden="true"><span class="scroll-pulse"></span><span class="scroll-circle"></span><span class="scroll-arrow">&#8593;</span></span>';
 root.querySelector('.mobile-story-viewport').append(animated);
 animated.onclick=()=>{
  const index=Number(root.dataset.requested||0);
  if(index<5)root.dispatchEvent(new CustomEvent('navigate-scene',{detail:{index:index+1}}));
  else document.querySelector('#solutions').scrollIntoView({behavior:'instant'});
 };
  let hideTimer,lastScroll=window.scrollY;
 addEventListener('scroll',()=>{
  const current=window.scrollY;
  if(current===lastScroll)return;

  lastScroll=current;
  const rect=root.getBoundingClientRect();
  if(rect.bottom<=0||rect.top>=innerHeight)return;
  root.dataset.scrolling='true';
  clearTimeout(hideTimer);
  hideTimer=setTimeout(()=>delete root.dataset.scrolling,700);
 },{passive:true});
 addEventListener('pagehide',()=>{clearTimeout(hideTimer);delete root.dataset.scrolling;});
 function sync(){const index=Number(root.dataset.scene||0);animated.setAttribute('aria-label',index===5?'Перейти к решениям':'Следующая сцена');}
 root.addEventListener('scenechange',sync);sync();
}







