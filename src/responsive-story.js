import {initDesktopStory} from './story.js';
import {initMobileStory} from './mobile-story.js';

export function initStory(){
 const mobile=matchMedia('(max-width:600px)');let cleanup;
 function configure(){
  cleanup?.();
  const stage=document.querySelector('#story .stage'),cards=document.querySelector('.mobile-story');
  stage.inert=mobile.matches;cards.inert=!mobile.matches;
  cleanup=mobile.matches?initMobileStory():initDesktopStory();
 }
 mobile.addEventListener('change',configure);
 addEventListener('pagehide',()=>{cleanup?.();cleanup=undefined;});
 addEventListener('pageshow',event=>{if(event.persisted)configure();});
 configure();
}
