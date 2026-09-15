import {initSmoothScroll} from './smooth-scroll.js';
import {services,sites,renderPage,serviceImages} from './content.js';
import {initStory} from './story.js';
import {initMobileNav} from './mobile-nav.js';
import {optimizeImages} from './images.js';
import '@fontsource-variable/manrope';
const arrow='<span aria-hidden="true">↗</span>';
document.querySelector('#app').innerHTML=optimizeImages(renderPage(arrow));
let currentService=0;
function selectService(i,focus=false){currentService=i;const s=services[i],photo=serviceImages[i];document.querySelectorAll('[data-service]').forEach((b,j)=>{b.setAttribute('aria-selected',j===i);b.tabIndex=j===i?0:-1;if(j===i&&focus)b.focus()});const panel=document.querySelector('#service-panel');panel.setAttribute('aria-labelledby',`tab-${s.id}`);panel.dataset.solution=s.id;panel.innerHTML=optimizeImages(`<div class="service-copy"><p class="eyebrow">${s.tag}</p><h3>${s.name}</h3><p>${s.text}</p><ul>${s.features.map(f=>`<li><span>↗</span>${f}</li>`).join('')}</ul><a href="#contact" class="button outline" id="choose-service">Обсудить решение ${arrow}</a></div><div class="service-image"><img src="${photo.src}" srcset="${photo.small} 800w, ${photo.src} ${photo.width}w" sizes="(max-width:600px) calc(100vw - 44px), 50vw" loading="lazy" alt="${photo.alt}"><div><span>TAU CLOUD / ${s.number}</span><span>ИНФРАСТРУКТУРА БЕЗ ЛИШНЕЙ СЛОЖНОСТИ</span></div></div>`);document.querySelector('#choose-service').onclick=()=>document.querySelector('select').selectedIndex=i;}
selectService(0);
document.querySelectorAll('[data-colocation-cta]').forEach(a=>a.addEventListener('click',()=>{document.querySelector('select').selectedIndex=0}));
document.querySelectorAll('[data-service]').forEach(b=>{b.onclick=()=>selectService(+b.dataset.service);b.onkeydown=e=>{let n=currentService;if(e.key==='ArrowRight')n=(n+1)%4;else if(e.key==='ArrowLeft')n=(n+3)%4;else if(e.key==='Home')n=0;else if(e.key==='End')n=3;else return;e.preventDefault();selectService(n,true)}});
document.querySelectorAll('[data-service-direction]').forEach(button=>button.onclick=()=>selectService((currentService+Number(button.dataset.serviceDirection)+services.length)%services.length));
initSmoothScroll();
initMobileNav();
document.querySelectorAll('[data-location]').forEach(a=>a.onclick=()=>{document.querySelector('select').selectedIndex=0;document.querySelector('textarea').value=`Интересует площадка: TC ${String(+a.dataset.location+1).padStart(2,'0')} — ${[sites[+a.dataset.location].city,sites[+a.dataset.location].address].filter(Boolean).join(', ')}. `});
document.querySelector('#brief').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);const body=`БРИФ ПРОЕКТА TAU CLOUD\n\nИмя: ${d.get('name')}\nEmail: ${d.get('email')}\nРешение: ${d.get('service')}\n\nО проекте:\n${d.get('message')||'Не указано'}\n\nБриф создан локально и не отправлен. Официальный сайт: https://taucloud.kz/`;const url=URL.createObjectURL(new Blob(['\ufeff',body],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='TAU-CLOUD-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#form-status').textContent='Бриф подготовлен к скачиванию. Передайте его команде TAU CLOUD.';};
initStory();

import './style.css';
import './mobile.css';
