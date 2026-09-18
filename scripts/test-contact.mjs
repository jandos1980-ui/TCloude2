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
 for(const data of [{...valid,name:' '},{...valid,bin:''},{...valid,bin:'123'},{...valid,website:'spam'},{...valid,service:'unknown'},{...valid,message:'x'.repeat(3001)},{...valid,name:42}]) assert.equal((await handler(request(data))).status,400);
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

test('requires a usable callback number and rejects multiline identity',async()=>{
 const handler=createContactHandler({env,createTransport:()=>{throw new Error('must not connect');}});
 for(const phone of ['', '       ', '-------', '123456', '1'.repeat(16), '+7\n7172251344', 'abcdefg']) assert.equal((await handler(request({...valid,phone}))).status,400);
 assert.equal((await handler(request({...valid,name:'Client\nInjected label'}))).status,400);
});
test('accepts phone boundary lengths and TLS port 465',async()=>{
 for(const phone of ['1234567','+'+'1'.repeat(15)]) {
  let options;
  const handler=createContactHandler({env:{...env,SMTP_PORT:'465'},createTransport:config=>{
   options=config;return {sendMail:async()=>({accepted:['info@taucloud.kz']}),close(){}};
  }});
  const result=await handler(request({...valid,phone}));
  assert.equal(result.status,200);assert.equal(options.secure,true);
  assert.equal(result.headers.get('cache-control'),'no-store');
  assert.equal(result.headers.get('x-content-type-options'),'nosniff');
 }
});
test('malformed bodies, types and limits fail before opening SMTP',async()=>{
 const handler=createContactHandler({env,createTransport:()=>{throw new Error('must not connect');}});
 for(const data of [null,[],42,{...valid,message:'\u0000'},{...valid,phone:42},{...valid,name:'x'.repeat(101)}]) assert.equal((await handler(request(data))).status,400);
 assert.equal((await handler(new Request('https://taucloud.kz/api/contact',{method:'POST',body:'text'}))).status,415);
 assert.equal((await handler(new Request('https://taucloud.kz/api/contact',{method:'POST',headers:{'Content-Type':'application/json'}}))).status,400);
 for(const SMTP_PORT of ['25','abc']) assert.equal((await createContactHandler({env:{...env,SMTP_PORT}})(request())).status,503);
});
test('broken request stream returns safe JSON instead of throwing',async()=>{
 const events=[];
 const body=new ReadableStream({start(controller){controller.error(new Error('private request data'));}});
 const handler=createContactHandler({logger:{error:event=>events.push(event)}});
 const result=await handler(new Request('https://taucloud.kz/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body,duplex:'half'}));
 assert.equal(result.status,400);
 assert.deepEqual(events,[{event:'contact_body_read_failed'}]);
 assert.ok(!(await result.text()).includes('private'));
});
test('transport setup and cleanup errors cannot leak secrets or override delivery result',async()=>{
 const events=[];const logger={error:event=>events.push(event)};
 const handler=createContactHandler({env,logger,createTransport:()=>{throw new Error('SMTP_PASSWORD=secret');}});
 const response=await handler(request());
 assert.equal(response.status,502);assert.ok(!(await response.text()).includes('secret'));
 const cleanup=createContactHandler({env,logger,createTransport:()=>({sendMail:async()=>({accepted:['info@taucloud.kz']}),close(){throw new Error('secret');}})});
 assert.equal((await cleanup(request())).status,200);
 assert.deepEqual(events,[{event:'contact_delivery_failed'},{event:'contact_transport_close_failed'}]);
 const badLogger=createContactHandler({env,logger:{error(){throw new Error('logger down');}},createTransport:()=>{throw new Error('smtp down');}});
 assert.equal((await badLogger(request())).status,502);
});
