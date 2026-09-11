import {chromium} from 'playwright';
import {readFile,readdir,stat} from 'node:fs/promises';
const m=JSON.parse(await readFile('public/media/energy-sequence/manifest.json','utf8'));
for(let i=0;i<m.count;i++){const s=await stat(`public/media/energy-sequence/${String(i).padStart(4,'0')}.webp`);if(s.size===0)throw Error('Empty frame '+i)}
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await browser.newPage({viewport:{width:1440,height:900}});const bad=[];p.on('response',r=>{if(r.url().includes('/media/')&&r.status()>=400)bad.push(r.url())});
await p.goto('http://127.0.0.1:5173');await p.waitForFunction(()=>getComputedStyle(document.querySelector('#film')).opacity==='1');
for(const [name,progress] of [['opening',0],['interior',.44],['macro',.72],['finale',.96]]){
await p.evaluate(v=>{const s=document.querySelector('#story'),stage=document.querySelector('.stage');scrollTo({top:s.offsetTop+(s.offsetHeight-stage.offsetHeight)*v,behavior:'instant'})},progress);await p.waitForTimeout(450);await p.screenshot({path:`test-results/film-${name}.png`});}
await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{const s=document.querySelector('#story'),v=document.querySelector('.stage');scrollTo({top:(s.offsetHeight-v.offsetHeight)*.96,behavior:'instant'})});await p.waitForTimeout(350);await p.screenshot({path:'test-results/film-mobile-finale.png'});
await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));for(let i=0;i<30;i++){await p.mouse.wheel(0,150);await p.waitForTimeout(35)}await p.waitForTimeout(350);
if(bad.length)throw Error(JSON.stringify(bad));console.log(JSON.stringify({frames:m.count,bytes:m.bytes,missingMedia:bad,filmVisible:true}));await browser.close();
