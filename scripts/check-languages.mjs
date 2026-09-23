import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true});
const baseURL=process.env.BASE_URL||'http://127.0.0.1:5173';
const output='test-results/i18n';
await mkdir(output,{recursive:true});
const errors=[];
async function chooseLanguage(page, language) {
  for(let i=0;i<3;i++){
    if(await page.locator('html').getAttribute('lang')===language)return;
    await page.evaluate(()=>{window.tauSmoothScroll?.scrollTo(0,{immediate:true});scrollTo(0,0);});
    await page.locator('.language-picker').click();
  }
  assert.equal(await page.locator('html').getAttribute('lang'),language);
}
async function noRussian(page) {
  const missing=await page.evaluate(()=>{
    const result=[];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(!node.parentElement.closest('script,style,noscript,textarea')&&/[А-Яа-яЁё]/.test(node.data)) result.push(node.data);
    }
    for(const element of document.querySelectorAll('[aria-label],[alt],[placeholder]')){
      if(element.matches('[data-language]'))continue;
      for(const name of ['aria-label','alt','placeholder']){
        const value=element.getAttribute(name);
        if(value&&/[А-Яа-яЁё]/.test(value))result.push(value);
      }
    }
    return result;
  });
  assert.deepEqual(missing,[]);
}
try {
  for(const width of [320,390,906,1440]) {
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(baseURL);
    await page.locator('.site-card').first().waitFor();
    await page.locator('[name=name]').fill('QA language check');
    await page.locator('[name=message]').fill('Keep this user text: русский / қазақша.');
    for(const lang of ['kk','en','ru']){
      await chooseLanguage(page,lang);
      assert.equal(await page.locator('html').getAttribute('lang'),lang);
      assert.equal(await page.locator('.language-picker').count(),1);
      assert.equal(await page.locator('.language-picker').innerText(),{ru:'RU',kk:'KZ',en:'EN'}[lang]);
      assert.equal(await page.locator('[name=name]').inputValue(),'QA language check');
      assert.equal(await page.locator('[name=message]').inputValue(),'Keep this user text: русский / қазақша.');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const header=await page.locator('header').evaluate(e=>[...e.querySelectorAll('.brand,.language-picker,.menu-button')].filter(n=>n.getBoundingClientRect().width>0).map(n=>n.getBoundingClientRect().toJSON()));
      for(let i=1;i<header.length;i++)assert(header[i-1].right<=header[i].left+1,'Header controls overlap');
      if(lang==='en')await noRussian(page);
      const clipped=await page.locator('.hero-title-line,.industry-tabs button,.site-card-status').evaluateAll(nodes=>nodes.filter(node=>node.getBoundingClientRect().width>0&&node.scrollWidth>node.clientWidth+2).map(node=>node.textContent));
      assert.deepEqual(clipped,[],'Translated text must not be clipped');
      await page.evaluate(()=>scrollTo(0,0));
      await page.screenshot({path:`${output}/${width}-${lang}.png`});
    }
    await chooseLanguage(page,'en');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    if(width<=600){
      await page.locator('.menu-button').click();
      await chooseLanguage(page,'kk');
      assert.equal(await page.locator('.menu-button').getAttribute('aria-label'),'Мәзірді жабу');
      await page.locator('#mobile-nav a').last().focus();
      await page.keyboard.press('Tab');
      assert(await page.locator('.language-picker').evaluate(e=>e===document.activeElement));
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.menu-button').getAttribute('aria-expanded'),'false');
      await chooseLanguage(page,'en');
      for(let scene=0;scene<6;scene++){
        await page.locator(`button[data-scene="${scene}"]`).filter({has:page.locator('.variant-segment')}).click();
        await page.waitForFunction(index=>document.querySelector('.mobile-story').dataset.scene===String(index),scene);
        await noRussian(page);
      }
    }
    for(let i=0;i<4;i++){
      await page.locator('[data-service]').nth(i).click();
      await page.locator('#choose-service').click();
      assert.equal(await page.locator('#brief select').evaluate(e=>e.selectedIndex),i);
      await noRussian(page);
    }
    for(let i=0;i<7;i++){
      await page.locator('.industry-tabs button').nth(i).click();
      await page.locator(`#industry-panel-${i}`).waitFor();
      await noRussian(page);
    }
    for(const n of [2,5,6]){
      await page.getByRole('button',{name:`Show site TC 0${n}`,exact:true}).click();
      await page.getByRole('group',{name:`${n} of 6`,exact:true}).getByRole('button',{name:'Project details'}).click();
      await page.getByRole('dialog').waitFor();
      await noRussian(page);
      await page.keyboard.press('Escape');
    }
    let payload, success=false;
    await page.route('**/api/contact',async route=>{
      payload=route.request().postDataJSON();
      await route.fulfill({status:success?200:503,contentType:'application/json',body:JSON.stringify(success?{ok:true}:{error:'Отправка временно недоступна. Напишите на info@taucloud.kz или позвоните +7 7172 251344.'})});
    });
    await page.locator('[name=bin]').fill('123456789012');
    await page.locator('[name=name]').fill('QA');
    await page.locator('[name=phone]').fill('+77000000000');
    await page.locator('[name=message]').fill('Test only, request intercepted.');
    await page.locator('#brief [type=submit]').click();
    await page.waitForFunction(()=>document.querySelector('#form-status').dataset.state==='error');
    assert.equal(payload.service,'Строительство ЦОД');
    assert.match(await page.locator('#form-status').innerText(),/temporarily unavailable/);
    assert.equal(await page.locator('[name=message]').inputValue(),'Test only, request intercepted.');
    await chooseLanguage(page,'kk');
    assert.match(await page.locator('#form-status').innerText(),/уақытша қолжетімсіз/);
    await chooseLanguage(page,'ru');
    assert.match(await page.locator('#form-status').innerText(),/временно недоступна/);
    success=true;
    await chooseLanguage(page,'kk');
    await page.locator('#brief [type=submit]').click();
    await page.waitForFunction(()=>document.querySelector('#form-status').dataset.state==='success');
    assert.match(await page.locator('#form-status').innerText(),/Өтінім/);
    assert(await page.locator('#brief [type=submit]').isDisabled());
    await chooseLanguage(page,'en');
    assert.match(await page.locator('#form-status').innerText(),/Your enquiry has been sent/);
    await page.locator('#brief select').selectOption({index:0});
    assert(await page.locator('#brief [type=submit]').isEnabled());
    assert.match(await page.locator('#brief [type=submit]').innerText(),/Send enquiry/);
    await page.close();
    console.log(`${width}px: languages, persistence, dynamic content, dialogs, form and layout passed`);
  }
  assert.deepEqual(errors,[]);
} finally {await browser.close();}
