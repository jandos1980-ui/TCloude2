import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
for(const width of [360,390,430]){
 const page=await browser.newPage({viewport:{width,height:width===360?640:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.tickStarts=0;const native=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const oscillator=native.call(this),start=oscillator.start.bind(oscillator);oscillator.start=(...args)=>{window.tickStarts++;start(...args);};return oscillator;};});
 await page.goto('http://127.0.0.1:5173/?mobileVariant=dribbble');await page.locator('.mobile-story[data-scene="0"]').waitFor();
 assert.equal(await page.locator('.preview-sound').count(),0);
 assert.equal(await page.locator('.dribbble-scroll').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
 assert.equal(await page.locator('[role=progressbar]').getAttribute('aria-valuenow'),'0');
 await page.evaluate(()=>scrollBy(0,50));await page.waitForTimeout(220);
 await page.locator('.dribbble-scroll').click();await page.locator('.mobile-story[data-scene="1"]').waitFor();await page.waitForTimeout(150);
 for(let i=2;i<6;i++){await page.locator(`button[data-scene="${i}"]`).click();await page.locator(`.mobile-story[data-scene="${i}"]`).waitFor();await page.waitForTimeout(150);}
 console.log(width,await page.evaluate(()=>({ticks:tickStarts,hidden:document.hidden})));assert((await page.evaluate(()=>tickStarts))>=4);
 await page.locator('button[data-scene="2"]').click();await page.locator('.mobile-story[data-scene="2"]').waitFor();
 await page.evaluate(()=>{const el=document.querySelector('.mobile-story');scrollTo(0,scrollY+el.getBoundingClientRect().top+(el.offsetHeight-el.querySelector('.mobile-story-viewport').offsetHeight)*.5);});
 await page.waitForFunction(()=>document.querySelector('[role=progressbar]').getAttribute('aria-valuenow')==='50');
 await page.evaluate(()=>{const el=document.querySelector('.mobile-story');scrollTo(0,scrollY+el.getBoundingClientRect().top+el.offsetHeight-el.querySelector('.mobile-story-viewport').offsetHeight);});
 await page.waitForFunction(()=>document.querySelector('[role=progressbar]').getAttribute('aria-valuenow')==='100');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('button[data-scene="0"]').click();await page.locator('.mobile-story[data-scene="0"]').waitFor();
 assert.equal(await page.locator('.dribbble-stem').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.screenshot({path:`test-results/mobile-variants/${width}-scroll-navigator.png`});
 assert.deepEqual(errors,[]);await page.close();
}
await browser.close();console.log('PASS: real scroll progress 0/50/100, six scene links, reverse navigation, transparent arrow, automatic audio, reduced motion, three widths');


