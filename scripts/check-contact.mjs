import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
for(const width of [1440,390]) {
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5179/',{waitUntil:'domcontentloaded'});
 await page.locator('#brief').scrollIntoViewIfNeeded();
 await page.locator('#brief [name=name]').fill('Тестовый клиент');
 assert.equal(await page.locator('#brief [name=email], #download-brief, #copy-brief, #brief .form-note, #contact .contact-actions, #contact .contact-address').count(),0);
 await page.locator('#brief [name=message]').fill('Тест: две стойки');
 await page.locator('#brief [type=submit]').click();
 await page.waitForFunction(()=>document.querySelector('#form-status').dataset.state==='error');
 assert.match(await page.locator('#form-status').innerText(),/временно недоступна/);
 assert.equal(await page.locator('#brief [name=message]').inputValue(),'Тест: две стойки');
 await page.route('**/api/contact',async route=>{await new Promise(r=>setTimeout(r,300));await route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});});
 await page.locator('#brief [type=submit]').click();
 assert.equal(await page.locator('#brief [type=submit]').isDisabled(),true);
 await page.waitForFunction(()=>document.querySelector('#form-status').dataset.state==='success');
 assert.equal(await page.locator('#brief [type=submit]').isDisabled(),true);
 await page.locator('#brief [name=message]').fill('Новая задача');
 assert.equal(await page.locator('#brief [type=submit]').isDisabled(),false);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#brief').screenshot({path:`test-results/contact-${width}.png`});
 assert.deepEqual(errors,[]);
 console.log(`${width}px: validation, unavailable SMTP, success mock, duplicate prevention, editing and overflow passed`);
 await page.close();
}
} finally {await browser.close();}
