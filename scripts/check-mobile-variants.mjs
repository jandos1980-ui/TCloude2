import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:"msedge"});
const base='http://127.0.0.1:5173';
await mkdir('test-results/mobile-variants',{recursive:true});
async function ready(page,i){await page.waitForFunction(i=>document.querySelector('#mobile-scene-image').dataset.scene===String(i),i);assert.equal(await page.locator('.mobile-story').getAttribute('data-scene'),String(i));}
async function go(page,i){await page.locator('.mobile-story').evaluate((el,i)=>el.dispatchEvent(new CustomEvent('navigate-scene',{detail:{index:i}})),i);await ready(page,i);}
for(const [width,height] of [[360,640],[390,844],[430,932]])for(const variant of ['bottom','right','capsule']){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${base}/?mobileVariant=${variant}`);await ready(page,0);
 for(let i=0;i<6;i++){
  await go(page,i);
  assert.equal(await page.locator('.mobile-story-progress [aria-current]').getAttribute('data-scene'),String(i));
  assert(await page.locator('#mobile-scene-description').isVisible());
  const boxes=await page.locator('.mobile-story-copy').evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:innerHeight};});
  assert(boxes.top>=68,JSON.stringify({width,height,variant,i,boxes}));
  assert(boxes.bottom<=boxes.height,JSON.stringify({width,height,variant,i,boxes}));
 }
 await go(page,0);
 if(variant==='capsule'){await page.getByRole('button',{name:'Следующая сцена',exact:true}).click();await ready(page,1);}else{await page.locator('button[data-scene="1"]').click();await ready(page,1);}
 await page.screenshot({path:`test-results/mobile-variants/${width}-${variant}.png`});
 await page.emulateMedia({reducedMotion:'reduce'});for(let i=5;i>=0;i--)await go(page,i);
 assert.equal(await page.locator('.swipe-symbol svg').evaluate(el=>getComputedStyle(el).animationName),'none');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 await page.close();
}
const page=await browser.newPage({viewport:{width:390,height:844}});
let fail=true;
await page.route('**/optimized/operations-room.webp',async route=>{await new Promise(r=>setTimeout(r,700));if(fail)await route.fulfill({status:503,body:'unavailable'});else await route.continue();});
await page.goto(base+'/?mobileVariant=bottom');await ready(page,0);
await page.locator('.mobile-story').evaluate(el=>el.dispatchEvent(new CustomEvent('navigate-scene',{detail:{index:4}})));
await page.waitForTimeout(250);assert.equal(await page.locator('.mobile-story').getAttribute('data-scene'),'0');
await page.locator('.mobile-image-error').waitFor({state:'visible'});assert.equal(await page.locator('.mobile-story').getAttribute('data-scene'),'0');
fail=false;await page.getByRole('button',{name:'Повторить',exact:true}).click();await ready(page,4);
await page.close();
const rapid=await browser.newPage({viewport:{width:390,height:844}});
await rapid.route('**/optimized/server-capsule-angle.webp',async route=>{await new Promise(r=>setTimeout(r,700));await route.continue();});
await rapid.goto(base);await ready(rapid,0);
await rapid.locator('.mobile-story').evaluate(el=>el.dispatchEvent(new CustomEvent('navigate-scene',{detail:{index:3}})));
await go(rapid,1);await rapid.waitForTimeout(1000);await ready(rapid,1);
await rapid.close();
const chooser=await browser.newPage({viewport:{width:1100,height:1100}});
await chooser.goto(base+'/mobile-preview.html');
const phone=chooser.frameLocator('iframe');
await phone.locator('.mobile-story[data-scene="0"]').waitFor();
await chooser.getByRole('button',{name:'02 · Шкала справа'}).click();
await phone.locator('html[data-mobile-variant="right"]').waitFor();
await phone.locator('button[data-scene="4"]').click();
await phone.locator('.mobile-story[data-scene="4"]').waitFor();
await chooser.getByRole('button',{name:'03 · Капсула'}).click();
await phone.locator('html[data-mobile-variant="capsule"]').waitFor();
assert.equal(await phone.locator('.mobile-story').getAttribute('data-scene'),'4');
await phone.locator('.menu-button').click();
assert.equal(await phone.locator('#mobile-nav').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(245, 248, 249)');
await phone.locator('.menu-close').press('Escape');
assert.equal(await phone.locator('.menu-button').getAttribute('aria-expanded'),'false');
await phone.getByRole('button',{name:'Предыдущая сцена',exact:true}).focus();
await phone.getByRole('button',{name:'Предыдущая сцена',exact:true}).press('Enter');
await phone.locator('.mobile-story[data-scene="3"]').waitFor();
await chooser.screenshot({path:'test-results/mobile-variants/chooser.png'});
await chooser.close();
const desktop=await browser.newPage({viewport:{width:1440,height:900}});await desktop.goto(base);
assert.equal(await desktop.locator('html').getAttribute('data-mobile-variant'),null);
assert.equal(await desktop.locator('.mobile-story').isVisible(),false);
await desktop.setViewportSize({width:390,height:844});await ready(desktop,0);
assert.equal(await desktop.locator('.mobile-story-progress svg').first().isVisible(),true);
await desktop.close();await browser.close();console.log('PASS: 9 viewports/variants, all 6 scenes, reverse/reduced motion, delayed response, error/retry, stale response');


