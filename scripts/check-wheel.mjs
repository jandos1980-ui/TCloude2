import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5179/',{waitUntil:'domcontentloaded'});
 const wheel=page.locator('.site-wheel');await wheel.scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'Показать площадку TC 03',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.site-carousel-count').textContent.trim().startsWith('03'));
 await page.getByRole('button',{name:'Следующая площадка',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.site-carousel-count').textContent.trim().startsWith('04'));
 await page.getByRole('button',{name:'Следующая площадка',exact:true}).press('Home');
 await page.waitForFunction(()=>document.querySelector('.site-carousel-count').textContent.trim().startsWith('01'));
 await page.locator('.site-wheel-window').hover();await page.mouse.wheel(0,80);
 await page.waitForFunction(()=>document.querySelector('.site-carousel-count').textContent.trim().startsWith('02'));
 assert.equal(await page.locator('.site-carousel-dots').count(),0);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);
 await page.locator('.site-carousel-footer').screenshot({path:`test-results/wheel-${width}.png`});
 console.log(`${width}: click, arrows, keyboard, wheel, counter sync, overflow passed`);await page.close();
}}finally{await browser.close();}
