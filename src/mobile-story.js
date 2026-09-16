import {chapters} from './story-content.js';
const base='/media/mobile-stills/';
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
 <div class="mobile-story-media"><img id="mobile-scene-image" ${mobile?`src="${base+first.file}.webp"`:''} width="941" height="1672" alt="${first.alt}" fetchpriority="high"><p class="mobile-image-error" hidden>Изображение недоступно. Продолжите к решениям ниже.</p></div>
 <div class="mobile-story-copy"><p class="mobile-scene-kicker"></p><h1 id="mobile-scene-title">${first.title}</h1><p id="mobile-scene-description" hidden></p><a class="button primary" id="mobile-story-cta" data-colocation-cta href="#contact">Обсудить размещение <span aria-hidden="true">↗</span></a></div>
 <div class="mobile-story-bottom"><span class="mobile-scroll-cue">Листайте, чтобы заглянуть внутрь ↓</span><span id="mobile-scene-count" aria-label="Сцена">1 / ${mobileScenes.length}</span></div>
 <nav class="mobile-story-progress" aria-label="Главы истории">${mobileScenes.map((scene,i)=>`<button type="button" data-scene="${i}" aria-label="${i+1}: ${scene.title}" ${i===0?'aria-current="step"':''}><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="progress-track" cx="12" cy="12" r="9"/><circle class="progress-fill" cx="12" cy="12" r="9" pathLength="1"/><circle class="progress-dot" cx="12" cy="12" r="3"/></svg></button>`).join('')}</nav>
 </div></div>`;
}
export function initMobileStory(){
 const root=document.querySelector('.mobile-story'),img=root.querySelector('img'),error=root.querySelector('.mobile-image-error');
 const lifecycle=new AbortController(),signal=lifecycle.signal,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let index=-1,frame=0,request,version=0,objectUrl,transition;
 const buttons=[...root.querySelectorAll('[data-scene]')];
 async function show(next){
  if(next===index)return;
  index=next;const scene=mobileScenes[index],chapter=chapters[sceneChapters[index]],token=++version;
  request?.abort();error.hidden=true;
  root.dataset.scene=String(index);
  root.querySelector('.mobile-scroll-cue').textContent=index===0?'Листайте, чтобы заглянуть внутрь ↓':index===mobileScenes.length-1?'Далее — решения для вашего бизнеса ↓':'Листайте дальше ↓';
  root.querySelector('#mobile-scene-title').innerHTML=index===0?'Ваши серверы.<br><em>Наша инфраструктура.</em>':index===2?'ИБП.<br><em>Бесперебойное питание.</em>':chapter.title;
  root.querySelector('.mobile-scene-kicker').textContent=chapter.kicker;
  const description=root.querySelector('#mobile-scene-description');
  description.textContent=scene.text;description.hidden=false;
  const cta=root.querySelector('#mobile-story-cta');
  cta.hidden=index>0&&index<mobileScenes.length-1;cta.href=index<3?'#contact':'#solutions';
  cta.innerHTML=(index<3?'Обсудить размещение':'Найти своё решение')+' <span aria-hidden="true">↗</span>';
  if(index<3)cta.setAttribute('data-colocation-cta','');else cta.removeAttribute('data-colocation-cta');
  root.querySelector('#mobile-scene-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(mobileScenes.length).padStart(2,'0')}`;
  buttons.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});
  if(index===0){if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=undefined;img.src=base+scene.file+'.webp';img.alt=scene.alt;return;}
  request=new AbortController();
  try{
   const response=await fetch(base+scene.file+'.webp',{signal:request.signal});if(!response.ok)throw new Error('Image unavailable');
   const blob=await response.blob();if(signal.aborted||token!==version)return;
   const url=URL.createObjectURL(blob),decoded=new Image();decoded.src=url;
   try{await decoded.decode();}catch(e){URL.revokeObjectURL(url);throw e;}
   if(signal.aborted||token!==version){URL.revokeObjectURL(url);return;}
   const previous=objectUrl;objectUrl=url;img.src=url;img.alt=scene.alt;
   transition?.cancel();
   if(!reduced.matches)transition=img.animate([{opacity:.65},{opacity:1}],{duration:200,easing:'ease-out'});
   if(previous)URL.revokeObjectURL(previous);
  }catch(e){if(e.name!=='AbortError'&&token===version)error.hidden=false;}
 }
 function update(){frame=0;if(reduced.matches){transition?.cancel();img.style.transform='none';show(0);return;}
  const rect=root.getBoundingClientRect(),travel=root.offsetHeight-root.querySelector('.mobile-story-viewport').offsetHeight;
  const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,travel)));
  buttons.forEach((button,i)=>button.style.setProperty('--chapter-progress',Math.max(0,Math.min(1,progress*mobileScenes.length-i))));
  const local=Math.max(0,Math.min(1,progress*mobileScenes.length-Math.max(0,index)));
  img.style.transform='scale('+(1+local*.035)+')';
  // A small dead band prevents flicker when a thumb pauses at a chapter boundary.
  const candidate=Math.min(mobileScenes.length-1,Math.floor(progress*mobileScenes.length));
  if(index<0||Math.abs(candidate-index)>1||candidate===index||
    (candidate>index&&progress>candidate/mobileScenes.length+.018)||
    (candidate<index&&progress<(index/mobileScenes.length)-.018))show(candidate);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{
  const travel=root.offsetHeight-root.querySelector('.mobile-story-viewport').offsetHeight;
  window.scrollTo({top:window.scrollY+root.getBoundingClientRect().top+travel*(i===0?0:(i+.15)/mobileScenes.length),behavior:'instant'});
 },{signal}));
 img.addEventListener('error',()=>{error.hidden=false;},{signal});
 img.addEventListener('load',()=>{error.hidden=true;},{signal});
 const copy=root.querySelector('.mobile-story-copy');
 const observer=new ResizeObserver(()=>root.style.setProperty('--story-min-height',`${document.querySelector('header').offsetHeight+copy.offsetHeight+180}px`));
 observer.observe(copy);
 addEventListener('scroll',schedule,{passive:true,signal});addEventListener('resize',schedule,{signal});reduced.addEventListener('change',schedule,{signal});
 update();
 return ()=>{lifecycle.abort();observer.disconnect();transition?.cancel();request?.abort();cancelAnimationFrame(frame);version++;img.removeAttribute('src');if(objectUrl)URL.revokeObjectURL(objectUrl);};
}
