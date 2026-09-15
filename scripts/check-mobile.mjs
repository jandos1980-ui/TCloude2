import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('test-results/mobile',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
for(const [width,height] of [[320,640],[390,844],[430,932],[1440,900]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});const assets=[],errors=[];page.on('request',r=>{if(/sequence(?:-mobile)?\//.test(r.url()))assets.push(r.url())});page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.TAU_TEST_URL || 'http://127.0.0.1:5173/'));await page.waitForFunction(()=>getComputedStyle(document.querySelector('#film')).opacity==='1');await page.evaluate(()=>document.fonts.ready);
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(`Overflow ${width}`);
 const wrong=assets.filter(url=>width<=600?url.includes('/sequence/'):url.includes('/sequence-mobile/'));if(wrong.length)throw Error('Wrong sequence '+wrong[0]);
 await page.screenshot({path:`test-results/mobile/opening-${width}.png`});
 if(width<=600){
 await page.getByRole('button',{name:'Открыть меню',exact:true}).click();if(await page.locator('.menu-close').evaluate(e=>e!==document.activeElement))throw Error('Menu initial focus');
 await page.keyboard.press('Escape');if(await page.locator('.menu-button').evaluate(e=>e!==document.activeElement))throw Error('Escape focus');
 await page.getByRole('button',{name:'Открыть меню',exact:true}).click();await page.locator('#mobile-nav a').last().focus();await page.keyboard.press('Tab');if(await page.locator('.menu-button').evaluate(e=>e!==document.activeElement))throw Error('Focus trap');
 await page.locator('#mobile-nav').getByRole('link',{name:'Решения',exact:true}).click();await page.waitForTimeout(1100);
 if(await page.locator('#mobile-nav').isVisible())throw Error('Menu stays open');
 const head=await page.locator('header').boundingBox();if(head.y!==0||head.height<44)throw Error('Header not persistent');
 await page.screenshot({path:`test-results/mobile/solutions-${width}.png`});
 await page.locator('header .brand').click();await page.waitForTimeout(500);
 }
 await page.locator('[data-jump="3"]').click();await page.waitForTimeout(1100);await page.screenshot({path:`test-results/mobile/finale-${width}.png`});
 if(width<=600){const title=await page.locator('.chapter.active h2').boundingBox(),image=await page.locator('.cloud-art').boundingBox(),cta=await page.locator('.chapter.active .button').boundingBox();if(image.y+image.height>title.y+6)throw Error(`Cloud overlaps text ${width}: ${JSON.stringify({title,image})}`);if(cta.y+cta.height>height-105)throw Error(`CTA overlaps navigation ${width}`)}
 if(errors.length)throw Error(errors.join('\n'));results.push({width,height,wrongAssets:wrong.length,requestedFrames:assets.length,errors});await page.close();
}
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});let reducedFrames=0;reduced.on('request',r=>{if(/sequence(?:-mobile)?\//.test(r.url()))reducedFrames++});await reduced.goto((process.env.TAU_TEST_URL || 'http://127.0.0.1:5173/'));await reduced.waitForTimeout(250);if(reducedFrames)throw Error('Reduced motion loads sequence');if(await reduced.locator('.stage').evaluate(e=>getComputedStyle(e).position)!=='relative')throw Error('Reduced motion pinned');await reduced.close();
const failed=await browser.newPage({viewport:{width:390,height:844}});await failed.route('**/sequence-mobile/**',r=>r.abort());await failed.goto((process.env.TAU_TEST_URL || 'http://127.0.0.1:5173/'));await failed.waitForTimeout(250);if(!await failed.locator('#poster').evaluate(e=>e.complete&&e.naturalWidth>0))throw Error('Poster fallback broken');await failed.close();
const switchPage=await browser.newPage({viewport:{width:390,height:844}});const switched=[];switchPage.on('request',r=>{if(/sequence(?:-mobile)?\//.test(r.url()))switched.push(r.url())});await switchPage.goto((process.env.TAU_TEST_URL || 'http://127.0.0.1:5173/'));await switchPage.waitForTimeout(100);await switchPage.setViewportSize({width:1440,height:900});await switchPage.waitForTimeout(300);if(!switched.some(s=>s.includes('/sequence/')))throw Error('Breakpoint not switched');await switchPage.close();
await browser.close();await writeFile('test-results/mobile/results.json',JSON.stringify({results,reducedFrames,posterFallback:true,breakpointSwitch:true},null,2));console.log(JSON.stringify({results,reducedFrames,posterFallback:true,breakpointSwitch:true}));

