import test from 'node:test';
import assert from 'node:assert/strict';
import {translate} from '../src/i18n-core.js';
import {services,sites} from '../src/content.js';
import {chapters} from '../src/story-content.js';

test('localization preserves source and unknown language fallback',()=>{
  const source='TC 02 · Проектная мощность · 3 МВт';
  assert.equal(translate(source,'ru'),source);
  assert.equal(translate(source,'invalid'),source);
  assert.equal(translate(source,'en'),'TC 02 · Planned capacity · 3 MW');
});

test('all service, site and story content has English translations',()=>{
  function visit(value){
    if(typeof value==='string'&&/[А-Яа-яЁё]/.test(value)){
      assert(!/[А-Яа-яЁё]/.test(translate(value,'en')),value);
      assert.notEqual(translate(value,'kk'),'',value);
    }else if(value&&typeof value==='object')Object.values(value).forEach(visit);
  }
  visit({services,sites,chapters});
});

test('long phrases take priority and placeholders preserve contact details',()=>{
  assert.equal(translate('Заявка отправлена','en'),'Enquiry sent');
  assert.equal(translate('Показать площадку TC 06','en'),'Show site TC 06');
  const source='Отправка временно недоступна. Напишите на info@taucloud.kz или позвоните +7 7172 251344.';
  for(const language of ['kk','en']){
    const result=translate(source,language);
    assert(result.includes('info@taucloud.kz'));
    assert(result.includes('+7 7172 251344'));
  }
});
