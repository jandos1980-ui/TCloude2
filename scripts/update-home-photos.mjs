import {readFileSync,writeFileSync} from 'node:fs';
let c=readFileSync('src/content.js','utf8');
c=c.replace("posters:Array.from({length:4},(_,i)=>'/media/energy-poster-'+i+(type==='mobile'?'-mobile':'')+'.webp')", "posters:Array.from({length:4},(_,i)=>i===0?'/media/astana-new'+(type==='mobile'?'-small':'')+'.webp':'/media/energy-poster-'+i+(type==='mobile'?'-mobile':'')+'.webp')");
c=c.replace("export const serviceImages=[", "export const serviceImages=[");
c=c.slice(0,c.indexOf('export const serviceImages=['))+`export const serviceImages=[
 {src:'/media/capsule-angle.webp',small:'/media/capsule-angle-small.webp',width:1672,alt:'Серверные капсулы TAU CLOUD'},
 {src:'/media/capsule-front.webp',small:'/media/capsule-front-small.webp',width:1672,alt:'Серверный зал TAU CLOUD'},
 {src:'/media/operations.webp',small:'/media/operations-small.webp',width:1672,alt:'Операторская TAU CLOUD'},
 {src:'/media/almaty-new.webp',small:'/media/almaty-new-small.webp',width:1672,alt:'Визуализация дата-центра TAU CLOUD в Алматы'}
];
`;
c=c.replace('src="/media/hall-from-film.webp" srcset="/media/hall-from-film-small.webp 800w, /media/hall-from-film.webp 1920w"', 'src="/media/ups-blue.webp" srcset="/media/ups-blue-small.webp 800w, /media/ups-blue.webp 1672w"').replace('alt="Серверные капсулы TAU CLOUD"><div class="reliability-content"','alt="Система бесперебойного питания TAU CLOUD"><div class="reliability-content"');
writeFileSync('src/content.js',c);
let m=readFileSync('src/main.js','utf8');
m=m.replace("/media/${i===3?'exterior.jpeg':i===1?'hall-from-film.webp':'capsule.jpg'} 1584w",'${photo.src} ${photo.width}w').replace("${i===3?'Здание дата-центра':'Серверная капсула'} TAU CLOUD",'${photo.alt}');
writeFileSync('src/main.js',m);
let s=readFileSync('src/story.js','utf8');
s=s.replace("canvas.style.opacity='1'", "canvas.style.opacity=String(Math.max(0,Math.min(1,(progress-(mobile.matches?.035:.10))/.065)))");
writeFileSync('src/story.js',s);
