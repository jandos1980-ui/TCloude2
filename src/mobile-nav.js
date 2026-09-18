import {lockPageScroll} from './smooth-scroll.js';
export function initMobileNav(){
 const toggle=document.querySelector('.menu-button'),nav=document.querySelector('#mobile-nav'),header=document.querySelector('header');
 nav.setAttribute('data-lenis-prevent','');
 const media=matchMedia('(max-width:600px)');let restoreScroll='';
 const story=document.querySelector('.mobile-story');
 const brand=header.querySelector('.brand');
 const photo=story.querySelector('#mobile-scene-image');
 const sample=document.createElement('canvas');sample.width=sample.height=64;
 const sampleContext=sample.getContext('2d',{willReadFrequently:true});
 let sampledSource='',pixels;
 let headerFrame=0;
 function updateHeader(){
  headerFrame=0;
  if(!media.matches){header.removeAttribute('data-hide-brand');header.removeAttribute('data-surface');brand.inert=false;return;}
  const rect=story.getBoundingClientRect();
  const firstScene=Number(story.dataset.requested??story.dataset.scene??0)===0;
  const showBrand=firstScene&&rect.bottom>header.offsetHeight&&rect.top<=header.offsetHeight;
  header.toggleAttribute('data-hide-brand',!showBrand);brand.inert=!showBrand;
  const buttonRect=toggle.getBoundingClientRect();
  const x=buttonRect.left+buttonRect.width/2,y=buttonRect.top+buttonRect.height/2;
  const surface=document.elementsFromPoint(x,y).find(el=>!header.contains(el)&&el.closest('main,footer'));
  const section=surface?.closest('section,footer');
  let light=false;
  if(section?.id==='story'&&photo.complete&&photo.naturalWidth){
   try{
    if(sampledSource!==photo.currentSrc){
     sampleContext.drawImage(photo,0,0,64,64);
     pixels=sampleContext.getImageData(0,0,64,64).data;sampledSource=photo.currentSrc;
    }
    const bounds=photo.getBoundingClientRect();
    const scale=Math.max(bounds.width/photo.naturalWidth,bounds.height/photo.naturalHeight);
    const width=photo.naturalWidth*scale,height=photo.naturalHeight*scale;
    const sx=Math.max(0,Math.min(63,Math.floor((x-bounds.left+(width-bounds.width)/2)/width*64)));
    const sy=Math.max(0,Math.min(63,Math.floor((y-bounds.top+(height-bounds.height)/2)/height*64)));
    let brightness=0,count=0;
    for(let row=Math.max(0,sy-1);row<=Math.min(63,sy+1);row++)for(let col=Math.max(0,sx-1);col<=Math.min(63,sx+1);col++){
     const offset=(row*64+col)*4;
     brightness+=pixels[offset]*.2126+pixels[offset+1]*.7152+pixels[offset+2]*.0722;count++;
    }
    light=brightness/count>160;
   }catch{light=false;}
  }else if(section?.id!=='story'){
   for(let el=surface;el;el=el.parentElement){
    const rgba=getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.map(Number);
    if(rgba&&rgba.length>=3&&(rgba[3]??1)>.5){light=(rgba[0]*.2126+rgba[1]*.7152+rgba[2]*.0722)>145;break;}
   }
  }
  header.dataset.surface=light?'light':'dark';
 }
 function scheduleHeader(){if(!headerFrame)headerFrame=requestAnimationFrame(updateHeader);}
 addEventListener('scroll',scheduleHeader,{passive:true});
 addEventListener('resize',scheduleHeader,{passive:true});
 story.addEventListener('scenechange',scheduleHeader);
 story.addEventListener('storyprogress',scheduleHeader);
 photo.addEventListener('load',scheduleHeader);
 media.addEventListener('change',scheduleHeader);
 updateHeader();
 function close(returnFocus=false){lockPageScroll(false);nav.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');document.body.style.overflow=restoreScroll;document.querySelector('main').inert=false;document.querySelector('footer').inert=false;if(returnFocus)toggle.focus()}
 function open(){lockPageScroll(true);restoreScroll=document.body.style.overflow;nav.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Закрыть меню');document.body.style.overflow='hidden';document.querySelector('main').inert=true;document.querySelector('footer').inert=true;nav.querySelector('a').focus()}
 toggle.onclick=()=>nav.hidden?open():close(true);
 nav.onclick=e=>{const link=e.target.closest('a');if(link){close();const target=document.querySelector(link.hash);if(target){target.tabIndex=-1;target.focus({preventScroll:true})}}};
 header.addEventListener('keydown',e=>{if(nav.hidden)return;if(e.key==='Escape'){e.preventDefault();close(true)}if(e.key==='Tab'){const controls=[toggle,...nav.querySelectorAll('a')];const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 media.addEventListener('change',()=>{if(!media.matches)close()});
}
