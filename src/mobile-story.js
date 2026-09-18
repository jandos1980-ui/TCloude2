import {chapters} from './story-content.js';
import {initPreviewSound} from './preview-sound.js';
const base='/media/mobile-stills/optimized/';
export const mobileScenes=[
 {file:'astana-exterior',title:'Ваши серверы. Наша забота.',text:'Разместите серверы в подготовленном дата-центре. Питание, охлаждение и физическая безопасность — на нашей стороне.',alt:'Фасад дата-центра TAU CLOUD в Астане'},
 {file:'diesel-generator',title:'ДГУ и ИБП',text:'Резервное питание поддерживает непрерывную работу оборудования.',alt:'Дизель-генераторная установка TAU CLOUD'},
 {file:'ups-room-blue',title:'Источники бесперебойного питания',text:'ИБП и батарейные ряды обеспечивают резервное питание серверного оборудования.',alt:'Источники бесперебойного питания TAU CLOUD'},
 {file:'server-capsule-angle',title:'Серверные зоны',text:'Изолированные серверные зоны, стойки и охлаждение для вашего оборудования.',alt:'Серверная капсула TAU CLOUD, вид под углом'},
 {file:'operations-room',title:'Операторская 24/7',text:'Мониторинг состояния площадки и контроль инфраструктуры.',alt:'Операторская TAU CLOUD с экранами мониторинга'},
 {file:'engineer',title:'Команда инженеров',text:'Помогаем с подключением, эксплуатацией и развитием сервисов.',alt:'Инженер TAU CLOUD у серверной стойки'}
];
const sceneChapters=[0,1,1,2,3,4];
export function renderMobileStory(){
 const first=mobileScenes[0],mobile=matchMedia('(max-width:600px)').matches;
 return `<div class="mobile-story" aria-label="Инфраструктура TAU CLOUD"><div class="mobile-story-viewport">
 <div class="mobile-story-media"><img id="mobile-scene-image" ${mobile?`src="${base+first.file}.webp"`:''} width="941" height="1672" alt="${first.alt}" fetchpriority="high"><div class="mobile-image-error" role="status" hidden>Не удалось загрузить фото. <button type="button" class="mobile-image-retry">Повторить</button></div></div>
 <div class="mobile-story-copy"><p class="mobile-scene-kicker"></p><h1 id="mobile-scene-title">${first.title}</h1><p id="mobile-scene-description" hidden></p><a class="button primary" id="mobile-story-cta" data-colocation-cta href="#contact">Обсудить размещение <span aria-hidden="true">↗</span></a></div>
 <div class="mobile-story-bottom"><span class="mobile-scroll-cue">Листайте, чтобы заглянуть внутрь ↓</span><span id="mobile-scene-count" aria-label="Сцена">1 / ${mobileScenes.length}</span></div>
 <nav class="mobile-story-progress" aria-label="Главы истории">${mobileScenes.map((scene,i)=>`<button type="button" data-scene="${i}" aria-label="${i+1}: ${scene.title}" ${i===0?'aria-current="step"':''}><span class="variant-segment" aria-hidden="true"></span></button>`).join('')}</nav>
 </div></div>`;
}
export function initMobileStory(){
 const root=document.querySelector('.mobile-story'),img=root.querySelector('img'),error=root.querySelector('.mobile-image-error');
 initPreviewSound(root);
 const lifecycle=new AbortController(),{signal}=lifecycle;
 const buttons=[...root.querySelectorAll('[data-scene]')],cache=new Map(),urls=new Set();
 let requested=-1,frame=0,version=0;
 function load(index){
  if(cache.has(index))return cache.get(index);
  const pending=(async()=>{
   const response=await fetch(base+mobileScenes[index].file+'.webp',{signal});
   if(!response.ok)throw new Error('Image unavailable');
   const blob=await response.blob();
   if(signal.aborted)throw new DOMException('Aborted','AbortError');
   const url=URL.createObjectURL(blob);urls.add(url);
   const decoded=new Image();decoded.src=url;
   try{await decoded.decode();}catch(e){urls.delete(url);URL.revokeObjectURL(url);throw e;}
   return url;
  })();
  cache.set(index,pending);
  pending.catch(()=>{if(cache.get(index)===pending)cache.delete(index);});
  return pending;
 }
 function commit(index,url){
  const scene=mobileScenes[index],chapter=chapters[sceneChapters[index]];
  img.src=url;img.alt=scene.alt;img.dataset.scene=String(index);root.dataset.scene=String(index);
  root.querySelector('.mobile-scroll-cue').textContent=index===5?'Далее — решения для вашего бизнеса':'Листайте дальше';
  root.querySelector('#mobile-scene-title').innerHTML=index===0?'Ваши серверы.<br><em>Наша инфраструктура.</em>':index===2?'ИБП.<br><em>Бесперебойное питание.</em>':chapter.title;
  root.querySelector('.mobile-scene-kicker').textContent=chapter.kicker;
  const description=root.querySelector('#mobile-scene-description');description.textContent=scene.text;description.hidden=false;
  const cta=root.querySelector('#mobile-story-cta');
  cta.hidden=index>0&&index<5;cta.href=index<3?'#contact':'#solutions';
  cta.innerHTML=(index<3?'Обсудить размещение':'Найти своё решение')+' <span aria-hidden="true">↗</span>';
  if(index<3)cta.setAttribute('data-colocation-cta','');else cta.removeAttribute('data-colocation-cta');
  root.querySelector('#mobile-scene-count').textContent=`${String(index+1).padStart(2,'0')} / 06`;
  buttons.forEach((button,i)=>{
   if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
   button.style.setProperty('--chapter-progress',i<=index?1:0);
  });
  root.dispatchEvent(new CustomEvent('scenechange',{detail:{index}}));
 }
 async function show(next,force=false){
  if(next===requested&&!force)return;
  requested=next;const token=++version;error.hidden=true;
  root.dataset.requested=String(next);root.setAttribute('aria-busy','true');
  try{
   const url=await load(next);
   if(signal.aborted||token!==version)return;
   commit(next,url);
   for(const neighbor of [next-1,next+1])if(neighbor>=0&&neighbor<6)load(neighbor).catch(()=>{});
  }catch(e){if(!signal.aborted&&token===version)error.hidden=false;}
  finally{if(token===version)root.setAttribute('aria-busy','false');}
 }
 function update(){
  frame=0;img.style.transform='none';
  const rect=root.getBoundingClientRect(),travel=root.offsetHeight-root.querySelector('.mobile-story-viewport').offsetHeight;
  const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,travel)));
  root.style.setProperty('--scroll-progress',progress);
  root.dataset.scrollProgress=String(progress);
  root.dispatchEvent(new CustomEvent('storyprogress',{detail:{progress}}));
  const candidate=Math.min(5,Math.floor(progress*6));
  if(requested<0||Math.abs(candidate-requested)>1||candidate===requested||
    (candidate>requested&&progress>candidate/6+.018)||
    (candidate<requested&&progress<requested/6-.018))show(candidate);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 function interact(){root.dataset.interacted='true';}
 function navigate(index){
  const travel=root.offsetHeight-root.querySelector('.mobile-story-viewport').offsetHeight;
  window.scrollTo({top:window.scrollY+root.getBoundingClientRect().top+travel*(index===0?0:(index+.25)/6),behavior:'instant'});
  interact();show(index);
 }
 buttons.forEach((button,i)=>button.addEventListener('click',()=>navigate(i),{signal}));
 root.addEventListener('navigate-scene',e=>navigate(Math.max(0,Math.min(5,e.detail.index))),{signal});
 root.querySelector('.mobile-image-retry').addEventListener('click',()=>show(requested,true),{signal});
 root.addEventListener('touchmove',interact,{passive:true,signal});root.addEventListener('wheel',interact,{passive:true,signal});root.addEventListener('keydown',interact,{signal});
 const copy=root.querySelector('.mobile-story-copy');
 const observer=new ResizeObserver(()=>root.style.setProperty('--story-min-height',`${document.querySelector('header').offsetHeight+copy.offsetHeight+210}px`));observer.observe(copy);
 addEventListener('scroll',()=>{interact();schedule();},{passive:true,signal});addEventListener('resize',schedule,{signal});
 update();
 return ()=>{lifecycle.abort();observer.disconnect();cancelAnimationFrame(frame);version++;img.removeAttribute('src');urls.forEach(url=>URL.revokeObjectURL(url));cache.clear();};
}



