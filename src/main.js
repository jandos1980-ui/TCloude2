import {mountLocationCarousel} from './components/ui/services-card.tsx';
import {initSmoothScroll} from './smooth-scroll.js';
import {services,sites,renderPage,serviceImages} from './content.js';
import {initStory} from './responsive-story.js';
import {initMobileNav} from './mobile-nav.js';
import {initReliabilityBackground} from './reliability-background.js';
import {optimizeImages} from './images.js';
import '@fontsource-variable/manrope';
const arrow='<span aria-hidden="true">↗</span>';
document.querySelector('#app').innerHTML=optimizeImages(renderPage(arrow));
initReliabilityBackground();
let currentService=0;
function selectService(i,focus=false){currentService=i;const s=services[i],photo=serviceImages[i];document.querySelectorAll('[data-service]').forEach((b,j)=>{b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1;if(j===i&&focus)b.focus()});const panel=document.querySelector('#service-panel');panel.setAttribute('aria-labelledby',`tab-${s.id}`);panel.dataset.solution=s.id;panel.innerHTML=optimizeImages(`<div class="service-copy"><p class="eyebrow">${s.tag}</p><h3>${s.name}</h3><p>${s.text}</p><ul>${s.features.map(f=>`<li><span>↗</span>${f}</li>`).join('')}</ul><a href="#contact" class="button outline" id="choose-service">Обсудить решение ${arrow}</a></div><div class="service-image"><img src="${photo.src}" srcset="${photo.small} 800w, ${photo.src} ${photo.width}w" sizes="(max-width:600px) calc(100vw - 44px), 50vw" loading="lazy" alt="${photo.alt}"><div><span>TAU CLOUD / ${s.number}</span><span>ИНФРАСТРУКТУРА БЕЗ ЛИШНЕЙ СЛОЖНОСТИ</span></div></div>`);document.querySelector('#choose-service').onclick=()=>setContactService(i);}
selectService(0);
const contactHints=[
 'Укажите количество серверов или стоек, нужную мощность и сроки.',
 'Расскажите о вычислительных ресурсах, объёме хранения и сроках запуска.',
 'Укажите необходимые платформы, приложения и задачи миграции.',
 'Расскажите о площадке, требуемой мощности и сроках создания дата-центра.'
];
function setContactService(index){document.querySelector('select').selectedIndex=index;updateContactHint();}
function updateContactHint(){document.querySelector('.contact-intro').textContent=contactHints[document.querySelector('select').selectedIndex];}
document.querySelector('select').addEventListener('change',updateContactHint);
updateContactHint();
document.querySelectorAll('[data-colocation-cta]').forEach(a=>a.addEventListener('click',()=>{setContactService(0)}));
document.querySelectorAll('[data-service]').forEach(b=>{b.onclick=()=>selectService(+b.dataset.service);b.onkeydown=e=>{let n=currentService;if(e.key==='ArrowRight')n=(n+1)%4;else if(e.key==='ArrowLeft')n=(n+3)%4;else if(e.key==='Home')n=0;else if(e.key==='End')n=3;else return;e.preventDefault();selectService(n,true)}});
// Hover selects the pointed-to service; touch and keyboard keep their existing controls.
const serviceHover = matchMedia('(hover: hover) and (pointer: fine)');
let serviceHoverTimer;
document.querySelectorAll('[data-service]').forEach(button=>{
 button.addEventListener('pointerenter',()=>{
  clearTimeout(serviceHoverTimer);
  if(serviceHover.matches) serviceHoverTimer=setTimeout(()=>{
   const index=Number(button.dataset.service);
   if(index!==currentService) selectService(index);
  },140);
 });
 button.addEventListener('pointerleave',()=>clearTimeout(serviceHoverTimer));
});
initSmoothScroll();
initMobileNav();
mountLocationCarousel(document.querySelector('#location-carousel'), sites, index=>{setContactService(0);const field=document.querySelector('textarea');const siteText=`Интересует площадка: TC ${String(index+1).padStart(2,'0')} — ${[sites[index].city,sites[index].address].filter(Boolean).join(', ')}. `;if(!field.value.includes(siteText))field.value=siteText+field.value;});
document.querySelector('#brief').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);const body=`БРИФ ПРОЕКТА TAU CLOUD\n\nИмя: ${d.get('name')}\nEmail: ${d.get('email')}\nРешение: ${d.get('service')}\n\nО проекте:\n${d.get('message')||'Не указано'}\n\nБриф создан локально и не отправлен. Официальный сайт: https://taucloud.kz/`;const url=URL.createObjectURL(new Blob(['\ufeff',body],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='TAU-CLOUD-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#form-status').textContent='Бриф подготовлен к скачиванию. Передайте его команде TAU CLOUD.';};
initStory();

import './style.css';
import './mobile.css';

import './mobile-refinement.css';
import './about.css';
import './solutions.css';
import './reliability-background.css';
