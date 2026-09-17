import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
for(const reducedMotion of ['no-preference','reduce']){
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion});
 await page.goto('http://127.0.0.1:5173/?mobileVariant=dribbble');await page.locator('.mobile-story[data-scene="0"]').waitFor();
 const arrow=page.locator('.dribbble-scroll');
 assert.equal(await arrow.evaluate(el=>getComputedStyle(el).opacity),'0');
 await page.evaluate(()=>scrollBy(0,100));await page.waitForTimeout(220);
 assert.equal(await arrow.evaluate(el=>getComputedStyle(el).opacity),'1');
 assert.equal(await arrow.locator('svg').evaluate(el=>getComputedStyle(el).animationName),reducedMotion==='reduce'?'none':'scroll-active-arrow');
 await page.locator('button[data-scene="3"]').click();await page.locator('.mobile-story[data-scene="3"]').waitFor();
 await page.waitForTimeout(1000);assert.equal(await arrow.evaluate(el=>getComputedStyle(el).opacity),'0');
 await page.evaluate(()=>scrollBy(0,-70));await page.waitForTimeout(220);assert.equal(await arrow.evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.waitForTimeout(1000);await page.keyboard.press('Tab');
 await page.locator('button[data-scene="2"]').focus();await page.waitForTimeout(220);
 assert.equal(await page.locator('.mobile-story-progress').evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.close();
}
await browser.close();console.log('PASS: hidden at rest, animated during scroll, scene navigation, auto-hide after click, reverse scroll, reduced motion, keyboard access');
