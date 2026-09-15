import manifest from './image-manifest.json';

// Preserve the original image as fallback and its layout classes.
export function optimizeImages(markup){
 return markup.replace(/<img\b[^>]*>/g,tag=>{
  const src=tag.match(/\bsrc="([^"]+)"/)?.[1], image=manifest[src];
  if(!image)return tag;
  const sizes=tag.match(/\bsizes="([^"]+)"/)?.[1] || (src.endsWith('logo.png')?'118px':'100vw');
  const fallback=tag.replace(/\s(?:srcset|sizes|width|height)="[^"]*"/g,'').replace('<img',`<img width="${image.width}" height="${image.height}"`);
  return `<picture class="optimized-picture">${['avif','webp'].map(format=>`<source type="image/${format}" srcset="${image.variants.map(v=>`${v.base}.${format} ${v.width}w`).join(', ')}" sizes="${sizes}">`).join('')}${fallback}</picture>`;
 });
}
