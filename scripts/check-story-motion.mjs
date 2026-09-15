import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.TAU_TEST_URL||'http://127.0.0.1:5174/');
  const jump=async progress=>page.evaluate(v=>{const s=document.querySelector('#story');window.tauSmoothScroll.scrollTo(s.offsetTop+v*(s.offsetHeight-document.querySelector('.stage').offsetHeight),{immediate:true});},progress);
  for(const [progress,scene,copy] of [[.55,3,2],[.7,4,3],[.9,5,4],[.7,4,3]]){
   await jump(progress);
   await page.waitForFunction(scene=>document.querySelector('.stage').dataset.scene===String(scene),scene);
   assert.equal(await page.locator('.stage').getAttribute('data-copy'),String(copy));
   await page.waitForFunction(()=>document.querySelector('#film').style.opacity==='1');
   await page.waitForTimeout(400);
   assert.equal(await page.locator('.scene-blend').evaluate(el=>getComputedStyle(el).opacity),'0','Transition must finish');
  }
  await page.waitForTimeout(800);
  const capture=()=>page.locator('#film').evaluate(el=>({frame:el.dataset.frame,image:el.toDataURL()}));
  const a=await capture();await page.waitForTimeout(600);const b=await capture();
  assert.equal(a.frame,b.frame,'Scroll frame should remain still');
  assert.notEqual(a.image,b.image,'Objects should continue animating without scrolling');
  const frame=Number(b.frame);assert(width===390?frame>=136&&frame<=177:frame>=181&&frame<=236,'Operations copy must accompany room footage');
  await page.screenshot({path:`test-results/story-motion-${width}.png`});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('#film').style.opacity==='0');
  assert.deepEqual(errors,[]);
  console.log(`${width}px: scene/copy alignment, completed blends, independent object motion, reduced motion passed`);
  await page.close();
 }
}finally{await browser.close();}
