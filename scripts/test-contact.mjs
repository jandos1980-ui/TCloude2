import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createContactHandler } from '../server/contact.mjs';
const valid={name:'Тестовый клиент',phone:'+7 7172 251344',bin:'123456789012',service:'Colocation',message:'2 стойки, 10 кВт',website:''};
const env={SMTP_HOST:'smtp.example.com',SMTP_USER:'user',SMTP_PASSWORD:'test',SMTP_FROM:'info@taucloud.kz'};
const request=(data=valid)=>new Request('https://taucloud.kz/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://taucloud.kz'},body:JSON.stringify(data)});
test('sends all fields to fixed recipient without requiring customer email',async()=>{
 let mail,options;
 const handler=createContactHandler({env,createTransport: config=>{options=config;return {sendMail:async value=>{mail=value;return {accepted:['info@taucloud.kz']};},close(){}};}});
 assert.equal((await handler(request({...valid,to:'attacker@example.com'}))).status,200);
 assert.equal(mail.to,'info@taucloud.kz');assert.equal(mail.replyTo,undefined);assert.equal(options.requireTLS,true);
 for(const key of ['name','phone','bin','service','message']) assert.ok(mail.text.includes(valid[key]));
});
test('rejects invalid fields and spam before SMTP',async()=>{
 const handler=createContactHandler({env,createTransport:()=>{throw new Error('must not connect');}});
 for(const data of [{...valid,name:' '},{...valid,bin:'123'},{...valid,website:'spam'},{...valid,service:'unknown'},{...valid,message:'x'.repeat(3001)},{...valid,name:42}]) assert.equal((await handler(request(data))).status,400);
 assert.equal((await handler(request({...valid,message:'x'.repeat(21000)}))).status,413);
});
test('no credentials never produces success',async()=>assert.equal((await createContactHandler({env:{}})(request())).status,503));
test('SMTP failure or rejected recipient never produces success',async()=>{
 for(const sendMail of [async()=>{throw new Error('secret');},async()=>({accepted:[]})]) {
 const result=await createContactHandler({env,createTransport:()=>({sendMail,close(){}})})(request());
 assert.equal(result.status,502);assert.ok(!(await result.text()).includes('secret'));
 }
});
test('rejects cross-origin, malformed and wrong-method requests',async()=>{
 const handler=createContactHandler({env:{}});
 assert.equal((await handler(new Request('https://taucloud.kz/api/contact'))).status,405);
 assert.equal((await handler(new Request('https://taucloud.kz/api/contact',{method:'POST',headers:{Origin:'https://evil.test'}}))).status,403);
 assert.equal((await handler(new Request('https://taucloud.kz/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:'broken'}))).status,400);
});
