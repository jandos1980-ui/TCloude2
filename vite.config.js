import {defineConfig, loadEnv} from 'vite';
import {createContactHandler} from './server/contact.mjs';
import {resolve} from 'node:path';
export default defineConfig(({mode}) => ({
  plugins: [{name:'contact-api', configureServer(server) {
    const handler=createContactHandler({env:{...loadEnv(mode,process.cwd(),''),...process.env}});
    server.middlewares.use('/api/contact',async (req,res) => {
      try {
        const response=await handler(new Request(`http://${req.headers.host}/api/contact`,{
          method:req.method,headers:req.headers,
          ...(['GET','HEAD'].includes(req.method)?{}:{body:req,duplex:'half'})
        }));
        res.writeHead(response.status,Object.fromEntries(response.headers));
        res.end(await response.text());
      } catch { res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Сервис временно недоступен.'})); }
    });
  }}],
  build:{cssCodeSplit:false,rollupOptions:{input:{main:resolve('index.html'),style:resolve('style-tile.html'),mobile:resolve('mobile-preview.html')}}}
}));
