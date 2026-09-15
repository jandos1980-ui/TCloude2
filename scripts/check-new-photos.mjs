import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
await page.screenshot({path:'test-results/new-home-desktop.png'});
if(!(await page.locator('#poster').getAttribute('src')).includes('astana-new'))throw Error('Opening photo missing');
for(const tab of await page.getByRole('tab').all()){await tab.click();await page.waitForTimeout(200);if(!await page.locator('.service-image img').evaluate(e=>e.complete&&e.naturalWidth>0))throw Error('Service photo missing');}
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(700);await page.screenshot({path:'test-results/new-home-mobile.png'});
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow');
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);if(await page.locator('#film').evaluate(e=>getComputedStyle(e).opacity)!=='0')throw Error('Reduced motion');
await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log('PASS: opening photo, all service photos, mobile overflow, reduced motion, no JS errors');
