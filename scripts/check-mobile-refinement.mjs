import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('test-results/mobile',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const url=process.env.TAU_TEST_URL || 'http://127.0.0.1:5173/';
const sequence=/\/energy-sequence(?:-mobile)?\//;
const results=[];
try {
 for(const [width,height] of [[320,568],[360,640],[390,844],[430,932],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height}}),assets=[],errors=[];
  page.on('request',r=>{if(sequence.test(r.url()))assets.push(r.url())});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#film')).opacity==='1');
  await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${width}`);
  await page.screenshot({path:`test-results/mobile/opening-${width}.png`});
  if(width<=600){
   const header=await page.locator('header').boundingBox();
   assert((await page.locator('.chapter.active h1').boundingBox()).y>=header.height,`Opening behind header ${width}`);
   await page.getByRole('button',{name:'Открыть меню',exact:true}).click();
   assert(await page.locator('.menu-close').evaluate(e=>e===document.activeElement),'Menu focus');
   await page.keyboard.press('Escape');
   assert(await page.locator('.menu-button').evaluate(e=>e===document.activeElement),'Escape focus');
   await page.getByRole('button',{name:'Открыть меню',exact:true}).click();
   await page.locator('#mobile-nav a').last().focus();await page.keyboard.press('Tab');
   assert(await page.locator('.menu-button').evaluate(e=>e===document.activeElement),'Focus trap');
   await page.locator('#mobile-nav').getByRole('link',{name:'Решения',exact:true}).click();await page.waitForTimeout(1100);
   assert(!await page.locator('#mobile-nav').isVisible(),'Menu close on link');
   assert.equal((await page.locator('header').boundingBox()).y,0,'Persistent header');
   assert((await page.locator('#solutions').boundingBox()).y>=header.height-1,'Anchor offset');
   await page.screenshot({path:`test-results/mobile/solutions-${width}.png`});
  }
  for(const [chapter,progress] of [[1,.36],[2,.61],[3,.98]]){
   await page.evaluate(p=>{const s=document.querySelector('#story'),stage=s.querySelector('.stage');window.tauSmoothScroll.scrollTo(s.offsetTop+p*(s.offsetHeight-stage.offsetHeight),{immediate:true})},progress);
   await page.waitForTimeout(750);await page.screenshot({path:`test-results/mobile/chapter-${chapter}-${width}.png`});
   if(width<=600&&chapter===3){const cta=await page.locator('.chapter.active .button').boundingBox();assert(cta.y+cta.height<height-65,`Final CTA overlaps controls ${width}`)}
  }
  const wrong=assets.filter(u=>width<=600?u.includes('/energy-sequence/'):u.includes('/energy-sequence-mobile/'));
  assert.equal(wrong.length,0,'Wrong sequence');assert.deepEqual(errors,[]);
  results.push({width,height,wrongAssets:wrong.length,errors});await page.close();
 }
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 let reducedFrames=0;reduced.on('request',r=>{if(sequence.test(r.url()))reducedFrames++});
 await reduced.goto(url);await reduced.waitForTimeout(300);assert.equal(reducedFrames,0);
 assert.equal(await reduced.locator('.stage').evaluate(e=>getComputedStyle(e).position),'relative');await reduced.close();
 const failed=await browser.newPage({viewport:{width:390,height:844}});
 await failed.route('**/energy-sequence-mobile/**',r=>r.abort());await failed.goto(url);
 await failed.waitForFunction(()=>{const p=document.querySelector('#poster');return p.complete&&p.naturalWidth>0});
 assert.equal(await failed.locator('#film').evaluate(e=>getComputedStyle(e).opacity),'0');await failed.close();
 const switchPage=await browser.newPage({viewport:{width:390,height:844}}),switched=[];
 switchPage.on('request',r=>{if(sequence.test(r.url()))switched.push(r.url())});
 await switchPage.goto(url);await switchPage.setViewportSize({width:1440,height:900});
 await switchPage.waitForFunction(()=>getComputedStyle(document.querySelector('#film')).opacity==='1');
 assert(switched.some(s=>s.includes('/energy-sequence/')));await switchPage.close();
 const report={results,reducedFrames,posterFallback:true,breakpointSwitch:true};
 await writeFile('test-results/mobile/results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
} finally {await browser.close()}
