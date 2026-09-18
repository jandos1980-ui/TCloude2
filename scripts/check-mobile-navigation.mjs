import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const base=process.env.TEST_URL||'http://127.0.0.1:5173';
try{
 await page.goto(base);
 const desktopLogo=await page.locator('header .brand img').evaluate(el=>({src:el.currentSrc,filter:getComputedStyle(el).filter}));
 // Reproduce opening desktop first, then switching to a mobile viewport.
 await page.setViewportSize({width:390,height:844});
 await page.waitForFunction(()=>document.querySelector('.mobile-story').dataset.scene==='0');
 assert.equal(await page.locator('html').getAttribute('data-mobile-variant'),'dribbble');
 assert.equal(await page.locator('.scene-capsule,.progress-track').count(),0);
 const mobileLogo=await page.locator('header .brand img').evaluate(el=>({src:el.currentSrc,filter:getComputedStyle(el).filter}));
 assert.deepEqual(mobileLogo,desktopLogo);
 assert.equal(await page.locator('header .brand').isVisible(),true);
 await page.evaluate(()=>scrollTo(0,120));
 await page.waitForTimeout(220);
 const nav=await page.locator('.mobile-story-progress').evaluate(el=>({direction:getComputedStyle(el).flexDirection,opacity:Number(getComputedStyle(el).opacity),right:el.getBoundingClientRect().right}));
 assert.equal(nav.direction,'column');assert(nav.opacity>.9);assert(nav.right>340);
 assert.equal(await page.locator('.scroll-arrow').evaluate(el=>getComputedStyle(el).animationName),'mobile-scroll-arrow');
 await mkdir('test-results',{recursive:true});
 await page.screenshot({path:'test-results/mobile-navigator-04.png'});
 await page.locator('.mobile-story-progress button').nth(1).click();
 await page.waitForFunction(()=>document.querySelector('.mobile-story').dataset.scene==='1');
 await page.waitForTimeout(60);
 assert.equal(await page.locator('header .brand').isVisible(),true);
 for(const [selector,theme] of [['#about','light'],['#solutions','light'],['.reliability','dark'],['#locations','light'],['#contact','light']]){
  await page.locator(selector).evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top));
  await page.waitForTimeout(120);
  assert.equal(await page.locator('header').getAttribute('data-surface'),theme,selector);
  assert.equal(await page.locator('header .brand').isVisible(),false,selector);
 }
 await page.locator('#about').evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top));
 await page.waitForTimeout(100);
 await page.screenshot({path:'test-results/mobile-header-light.png'});
 await page.locator('.menu-button').click();
 assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'true');
 assert.equal(await page.locator('.menu-button').evaluate(el=>getComputedStyle(el).color),'rgb(24, 51, 67)');
 await page.keyboard.press('Escape');
 await page.evaluate(()=>scrollTo(0,0));
 await page.waitForFunction(()=>document.querySelector('.mobile-story').dataset.scene==='0');
 await page.waitForTimeout(80);
 assert.equal(await page.locator('header .brand').isVisible(),true);
 for(const size of [{width:360,height:640},{width:430,height:932}]){
  await page.setViewportSize(size);
  await page.goto(base+'/?mobileVariant=bottom');
  await page.waitForFunction(()=>document.querySelector('.mobile-story').dataset.scene==='0');
  assert.equal(await page.locator('html').getAttribute('data-mobile-variant'),'dribbble');
  assert.equal(await page.locator('.mobile-story-progress').evaluate(el=>getComputedStyle(el).flexDirection),'column');
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.evaluate(()=>scrollTo(0,120));
 await page.waitForTimeout(100);
 assert.equal(await page.locator('.scroll-arrow').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.goto(base+'/mobile-preview.html');
 assert.equal(await page.locator('[data-variant]').count(),0);
 assert.equal(await page.locator('iframe').getAttribute('src'),'/');
 assert.deepEqual(errors,[]);
 console.log('PASS: navigator 04, desktop-to-mobile resize, logo, section contrast, menu, old URLs, reduced motion, preview.');
}finally{await browser.close();}
