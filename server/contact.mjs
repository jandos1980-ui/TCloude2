import nodemailer from 'nodemailer';
const recipient = 'info@taucloud.kz';
const services = ['Colocation','Облачная инфраструктура','Платформы и сервисы','Строительство ЦОД'];
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const reply = (status,body) => Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export function createContactHandler({env=process.env,createTransport=nodemailer.createTransport}={}) {
  return async function contact(request) {
    if (request.method!=='POST') return new Response(null,{status:405,headers:{Allow:'POST'}});
    const origin=request.headers.get('origin');
    if (origin && origin!==new URL(request.url).origin) return reply(403,{error:'Недопустимый источник запроса.'});
    if (!request.headers.get('content-type')?.startsWith('application/json')) return reply(415,{error:'Ожидается JSON.'});
    const reader=request.body?.getReader();
    if (!reader) return reply(400,{error:'Заполните форму.'});
    let size=0;
    const chunks=[];
    while (true) {
      const {done,value}=await reader.read();
      if (done) break;
      size+=value.byteLength;
      if (size>20000) { await reader.cancel(); return reply(413,{error:'Заявка слишком большая.'}); }
      chunks.push(value);
    }
    let data;
    try { data=JSON.parse(Buffer.concat(chunks).toString('utf8')); }
    catch { return reply(400,{error:'Не удалось прочитать заявку.'}); }
    if (!data || typeof data!=='object' || Array.isArray(data)) return reply(400,{error:'Неверный формат заявки.'});
    const fields={};
    for (const [key,limit] of Object.entries({name:100,phone:40,bin:12,service:100,message:3000,website:200})) {
      const value=data[key]??'';
      if (typeof value!=='string' || value.length>limit || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) return reply(400,{error:'Проверьте значения полей и их длину.'});
      fields[key]=value.trim();
    }
    if (fields.website) return reply(400,{error:'Не удалось отправить форму.'});
    if (!fields.name || (fields.bin && !/^\d{12}$/.test(fields.bin)) || !services.includes(fields.service) || (fields.phone && !/^[+\d\s().-]{7,40}$/.test(fields.phone))) return reply(400,{error:'Проверьте имя, телефон и БИН (12 цифр).'});
    const port=Number(env.SMTP_PORT||587);
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !emailPattern.test(env.SMTP_FROM||'') || ![465,587].includes(port)) return reply(503,{error:'Отправка временно недоступна. Напишите на info@taucloud.kz или позвоните +7 7172 251344.'});
    const transport=createTransport({host:env.SMTP_HOST,port,secure:port===465,requireTLS:port!==465,auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000,disableFileAccess:true,disableUrlAccess:true});
    try {
      const result=await transport.sendMail({
        from:{name:'TAU CLOUD — заявки с сайта',address:env.SMTP_FROM},to:recipient,
        subject:`Заявка TAU CLOUD — ${fields.service}`,
        text:'Новая заявка с сайта TAU CLOUD\n\n'+[['Контактное лицо',fields.name],['Телефон',fields.phone],['БИН',fields.bin],['Решение',fields.service],['О проекте',fields.message]].map(([label,value])=>`${label}: ${value||'Не указано'}`).join('\n')
      });
      if (!result.accepted?.some(address=>String(address).toLowerCase()===recipient)) throw new Error('Recipient rejected');
      return reply(200,{ok:true});
    } catch {
      return reply(502,{error:'Не удалось подтвердить отправку. Попробуйте позже или напишите на info@taucloud.kz.'});
    } finally { transport.close(); }
  };
}
export default createContactHandler();
