import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const baseURL=process.env.BASE_URL||'http://127.0.0.1:5173';
const output=process.env.QA_OUTPUT||'test-results/site-audit';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[],failedResponses=[],results=[];
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
page.setDefaultTimeout(10000);
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(response.status()>=400&&!response.url().includes('/api/contact'))failedResponses.push(`${response.status()} ${response.url()}`);});
const shot=async name=>page.screenshot({path:`${output}/${name}.png`});
const top=async selector=>{await page.evaluate(selector=>{const element=document.querySelector(selector);const y=element.getBoundingClientRect().top+scrollY;window.tauSmoothScroll?.scrollTo(y,{immediate:true});scrollTo(0,y);},selector);await page.waitForTimeout(250);};
try{
await page.goto(baseURL);await page.evaluate(()=>document.fonts.ready);
await shot('01-hero');
assert.equal(await page.locator('.chapter-counter').count(),0);
let noteY;
for(const progress of [0,.2,.4,.6,.8,1,.6,.2,0]){
 await page.evaluate(p=>{const s=document.querySelector('#story'),stage=s.querySelector('.stage'),y=s.offsetTop+(s.offsetHeight-stage.offsetHeight)*p;window.tauSmoothScroll?.scrollTo(y,{immediate:true});scrollTo(0,y);},progress);
 await page.waitForTimeout(350);
 const state=await page.evaluate(()=>{const n=document.querySelector('.desktop-story-dots .scroll-note'),r=n.getBoundingClientRect(),rail=n.parentElement.getBoundingClientRect(),icon=n.querySelector('.scroll-icon').getBoundingClientRect();return {scene:document.querySelector('.stage').dataset.scene,y:r.y,visible:n.checkVisibility({visibilityProperty:true}),gap:r.top-rail.bottom,aligned:Math.abs(icon.x+icon.width/2-rail.x-rail.width/2)<1};});
 noteY??=state.y;assert(state.visible&&state.gap>=15&&state.aligned&&Math.abs(state.y-noteY)<1,JSON.stringify(state));
 if(progress===.6)await shot('01-story-middle');
}
results.push('Desktop story: forward/reverse, all six scenes, persistent scroll hint aligned beneath dots');
await top('#about');await shot('02-about');
for(const [name,title] of [['Размещение серверов','Colocation'],['Облако / IaaS','Облачная инфраструктура'],['Платформы / PaaS','Платформы и сервисы'],['Строительство ЦОД','Строительство ЦОД']]){
 await page.getByRole('tab',{name,exact:true}).click();await page.mouse.move(0,0);
 assert.equal(await page.locator('#service-panel h3').innerText(),title);
 await page.locator('#choose-service').click();assert.equal(await page.locator('#brief select').inputValue(),title);
}
await page.getByRole('tab',{name:'Размещение серверов',exact:true}).click();await page.mouse.move(0,0);
await page.getByRole('tab',{name:'Размещение серверов',exact:true}).press('ArrowRight');assert.equal(await page.locator('#tab-iaas').getAttribute('aria-selected'),'true');
await top('#solutions');await shot('03-solutions');results.push('All four service tabs, keyboard navigation and service-to-form selection');
for(const tab of await page.locator('#industries [role=tab]').all()){
 await tab.click();assert.equal(await tab.getAttribute('aria-selected'),'true');
 const panelId=await tab.getAttribute('aria-controls');
 await page.waitForFunction(id=>{const p=document.getElementById(id);return p&&Number(getComputedStyle(p).opacity)>.99;},panelId);
 assert.equal(await page.locator('#industries [role=tabpanel]:visible').count(),1);
}
await top('#industries');await shot('04-industries');results.push('All seven industry tabs');
await top('.reliability');await shot('05-reliability');
for(let i=1;i<=6;i++){
 await page.getByRole('button',{name:`Показать площадку TC 0${i}`,exact:true}).click();await page.mouse.move(0,0);await page.waitForTimeout(250);
 const group=page.getByRole('group',{name:`${i} из 6`,exact:true});
 if([2,5,6].includes(i)){
  const trigger=group.getByRole('button',{name:'Подробнее о проекте'});await trigger.click();await page.getByRole('dialog').waitFor();
  assert.equal(await page.getByRole('dialog').getAttribute('open'),'');
  await page.getByRole('button',{name:'Закрыть описание проекта'}).press('Escape');assert.equal(await page.getByRole('dialog').count(),0);assert(await trigger.evaluate(e=>e===document.activeElement));
 }
}
await top('#locations');await shot('06-locations');results.push('All six sites, three project dialogs, Escape and focus return');
await page.route('**/api/contact',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Отправка временно недоступна. Напишите на info@taucloud.kz.'})}));
await top('#contact');await shot('07-contact');
await page.getByRole('button',{name:'Отправить заявку',exact:true}).click();assert.equal(await page.locator('#brief').evaluate(e=>e.checkValidity()),false);
await page.getByLabel('БИН *',{exact:true}).fill('123456789012');await page.getByLabel('Ваше имя *',{exact:true}).fill('Проверка сайта');await page.getByLabel('Телефон *',{exact:true}).fill('+7 700 000 0000');await page.getByLabel('Задача',{exact:true}).fill('Локальный тест без отправки письма');
await page.getByRole('button',{name:'Отправить заявку',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#form-status').dataset.state==='error');assert.equal(await page.getByLabel('Задача',{exact:true}).inputValue(),'Локальный тест без отправки письма');
await page.unroute('**/api/contact');await page.route('**/api/contact',route=>route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
await page.getByRole('button',{name:'Отправить заявку',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#form-status').dataset.state==='success');assert(await page.locator('#brief button[type=submit]').isDisabled());await page.getByRole('tab',{name:'Облако / IaaS',exact:true}).click();await page.locator('#choose-service').click();assert(await page.locator('#brief button[type=submit]').isEnabled(),'A new service request must unlock a previously sent form');
results.push('Form: required validation, error preservation, mocked success, duplicate prevention and editing; no real email sent');
await top('footer');await shot('08-footer');assert.equal(await page.locator('footer .footer-icon').count(),4);assert.equal(await page.locator('footer a[href="mailto:info@taucloud.kz"]').count(),1);
const semantics=await page.evaluate(()=>({badAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash&&a.hash!=='#'&&!document.getElementById(a.hash.slice(1))).map(a=>a.hash),missingAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).map(i=>i.src),duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,a)=>a.indexOf(id)!==i)}));assert.deepEqual(semantics,{badAnchors:[],missingAlt:[],duplicateIds:[]});
for(const [width,height] of [[1920,1080],[1366,768],[1280,600],[800,900],[601,700],[600,800],[390,844],[320,700]]){
 await page.setViewportSize({width,height});await page.goto(baseURL);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
 for(const selector of ['#story','#about','#solutions','#industries','.reliability','#locations','#contact','footer']){
  await top(selector);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: overflow at ${selector}`);
 }
 if(width===390){await shot('10-mobile-footer');await top('#story');await shot('09-mobile-hero');await page.getByRole('button',{name:'Открыть меню',exact:true}).click();await page.locator('#mobile-nav').getByRole('link',{name:'Решения',exact:true}).click();assert(!(await page.locator('#mobile-nav').isVisible()));}
 results.push(`${width}x${height}: all eight sections have no horizontal overflow`);
}
await page.setViewportSize({width:390,height:844});await page.goto(baseURL);await page.evaluate(()=>document.fonts.ready);
for(let i=0;i<6;i++){await page.locator('.mobile-story-progress button[data-scene]').nth(i).click();await page.waitForTimeout(300);assert.equal(await page.locator('.mobile-story').getAttribute('data-scene'),String(i));}
results.push('Mobile six-scene navigation');
await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:900});await page.goto(baseURL);assert.equal(await page.locator('#film').evaluate(e=>getComputedStyle(e).display),'none');results.push('Reduced-motion desktop fallback');
await page.goto(baseURL+'/style-tile.html');assert(await page.getByText('STYLE TILE / 01').isVisible());results.push('Design-system page');
assert.deepEqual(errors,[]);assert.deepEqual(failedResponses,[]);
await writeFile(`${output}/results.json`,JSON.stringify({passed:true,results,semantics,errors,failedResponses},null,2));console.log(JSON.stringify({passed:true,results},null,2));
}finally{await browser.close();}
