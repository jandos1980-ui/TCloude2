import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  page.setDefaultTimeout(15000);
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*.bin',route=>route.abort());
  await page.route(/\/energy-sequence(?:-mobile)?\/\d{4}\.webp$/,async route=>{
   if(!route.request().url().endsWith('/0000.webp'))await new Promise(resolve=>setTimeout(resolve,1200));
   await route.continue().catch(error=>{
    // Mobile cancels frames outside its current scene during rapid jumps.
    if(!error.message.includes('Route is already handled'))throw error;
   });
  });
  await page.goto(process.env.TAU_TEST_URL||'http://127.0.0.1:5174/');
  await page.waitForFunction(()=>document.querySelector('#film').style.opacity==='1');
  // Jump across scenes in both directions while frames are still arriving.
  for(const [progress,chapter] of [[.55,2],[.25,1],[.71,3],[.95,-1],[0,0]]){
   console.log(`${width}px: checking chapter ${chapter}`);
   await page.evaluate(progress=>{
    const story=document.querySelector('#story'),stage=story.querySelector('.stage');
    const top=story.offsetTop+progress*(story.offsetHeight-stage.offsetHeight);
    window.tauSmoothScroll.scrollTo(top,{immediate:true});
   },progress);
   await page.waitForFunction(chapter=>document.querySelector('.stage').dataset.copy===String(chapter),chapter);
   if(chapter!==0){
    assert.equal(await page.locator('#film').evaluate(el=>el.style.opacity),'0','A stale frame must not cover the current scene');
    await page.waitForFunction(()=>{
     const poster=document.querySelector('#poster');
     return /energy-sequence(?:-mobile)?\/\d{4}\.webp/.test(poster.src)&&poster.complete&&poster.naturalWidth>0;
    });
   }
   await page.waitForFunction(()=>document.querySelector('#film').style.opacity==='1',{},{timeout:15000});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('#film').style.opacity==='0'&&document.querySelector('.stage').dataset.copy==='0').catch(async error=>{
   console.log(await page.evaluate(()=>({reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,copy:document.querySelector('.stage').dataset.copy,opacity:document.querySelector('#film').style.opacity})),errors);throw error;
  });
  assert.deepEqual(errors,[]);
  console.log(`${width}px: delayed frames, forward/reverse jumps, recovery, reduced motion passed`);
  await page.unrouteAll({behavior:'ignoreErrors'});
  await page.close();
 }
}finally{await browser.close();}
