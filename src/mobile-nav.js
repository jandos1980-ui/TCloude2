import {lockPageScroll} from './smooth-scroll.js';
export function initMobileNav(){
 const toggle=document.querySelector('.menu-button'),nav=document.querySelector('#mobile-nav'),header=document.querySelector('header');
 nav.setAttribute('data-lenis-prevent','');
 const media=matchMedia('(max-width:600px)');let restoreScroll='';
 function close(returnFocus=false){lockPageScroll(false);nav.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');document.body.style.overflow=restoreScroll;document.querySelector('main').inert=false;document.querySelector('footer').inert=false;if(returnFocus)toggle.focus()}
 function open(){lockPageScroll(true);restoreScroll=document.body.style.overflow;nav.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Закрыть меню');document.body.style.overflow='hidden';document.querySelector('main').inert=true;document.querySelector('footer').inert=true;nav.querySelector('a').focus()}
 toggle.onclick=()=>nav.hidden?open():close(true);
 nav.onclick=e=>{const link=e.target.closest('a');if(link){close();const target=document.querySelector(link.hash);if(target){target.tabIndex=-1;target.focus({preventScroll:true})}}};
 header.addEventListener('keydown',e=>{if(nav.hidden)return;if(e.key==='Escape'){e.preventDefault();close(true)}if(e.key==='Tab'){const controls=[toggle,...nav.querySelectorAll('a')];const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 media.addEventListener('change',()=>{if(!media.matches)close()});
}
