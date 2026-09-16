import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='test-results/mobile-scroll';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const [width,height] of [[320,568],[390,844],[430,932]]){
 const page=await browser.newPage({viewport:{width,height}}),requests=[],errors=[];
 page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/');await page.locator('#mobile-scene-image').evaluate(i=>i.decode());
 await page.screenshot({path:`${out}/${width}-hero.png`});
 assert.equal(requests.filter(u=>u.includes('/mobile-stills/')).length,1);
 for(let i=1;i<5;i++){
  await page.locator(`[data-scene="${i}"]`).click();
  await page.waitForFunction(i=>document.querySelector('.mobile-story').dataset.scene===String(i),i);
  await page.waitForFunction(()=>document.querySelector('#mobile-scene-image').src.startsWith('blob:'));
  await page.waitForTimeout(400);await page.locator('#mobile-scene-image').evaluate(i=>i.decode());
  await page.screenshot({path:`${out}/${width}-scene-${i+1}.png`});
 }
 await page.locator('.mobile-story-bottom a').click();
 assert.equal(await page.locator('header').evaluate(e=>Math.round(e.getBoundingClientRect().top)),0);
 await page.locator('.menu-button').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'false');
 for(const id of ['about','solutions','locations','contact']){
 await page.locator('#'+id).evaluate(e=>e.scrollIntoView());await page.screenshot({path:`${out}/${width}-${id}.png`});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert(!requests.some(u=>/\/sequence\/|\.mp4|\.bin/.test(u)));assert.equal(errors.length,0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
 assert.equal(await page.locator('.mobile-story').getAttribute('data-scene'),'0');
 assert(await page.locator('.mobile-story').evaluate(e=>e.offsetHeight<1000));
 await page.close();
}
const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto('http://127.0.0.1:5173/');await page.waitForTimeout(1200);await page.screenshot({path:`${out}/desktop.png`});
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);assert.equal(await page.locator('.mobile-story').isVisible(),true);await page.screenshot({path:`${out}/resized.png`});
await browser.close();console.log('PASS: scroll scenes, 3 phone sizes, menu, sections, reduced motion, responsive switch, mobile requests');
