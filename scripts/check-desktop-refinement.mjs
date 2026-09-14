import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {desktopMoment,desktopTimeline} from '../src/story-timeline.js';
for(const beat of desktopTimeline.slice(0,-1)){
 assert(Math.abs(desktopMoment(beat.end-1e-8).frame-desktopMoment(beat.end+1e-8).frame)<1e-6,'Timeline seam');
}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://127.0.0.1:5173/');
 for(const [p,copy] of [[.05,0],[.2,-1],[.35,1],[.55,-1],[.75,-1],[.95,3],[.55,-1],[.05,0]]){
  await page.evaluate(p=>{const s=document.querySelector('#story');window.tauSmoothScroll.scrollTo(p*(s.offsetHeight-s.querySelector('.stage').offsetHeight),{immediate:true})},p);
  await page.waitForTimeout(300);
  assert.equal(await page.locator('.stage').getAttribute('data-copy'),String(copy));
  assert.equal(await page.locator('.chapter:not([inert])').count(),copy<0?0:1);
 }
 // Real wheel input traverses a hold into the copy-free entrance.
 await page.mouse.wheel(0,900);await page.waitForTimeout(1100);
 assert.equal(await page.locator('.stage').getAttribute('data-copy'),'-1');
 await page.screenshot({path:'test-results/desktop-audit/entrance-corrected.png'});
 const retry=await browser.newPage({viewport:{width:1440,height:900}});
 let attempts=0;
 await retry.route('**/frames-*.bin',r=>r.abort());
 await retry.route('**/energy-sequence/0000.webp',r=>{attempts++;return attempts<3?r.fulfill({status:503,body:'Retry'}):r.continue()});
 await retry.goto('http://127.0.0.1:5173/');
 await retry.waitForFunction(()=>getComputedStyle(document.querySelector('#film')).opacity==='1');
 await retry.waitForTimeout(1800);assert.equal(attempts,3);
 console.log(JSON.stringify({continuousTimeline:true,copyWindows:true,reverse:true,wheel:true,retryAttempts:attempts}));
}finally{await browser.close()}
