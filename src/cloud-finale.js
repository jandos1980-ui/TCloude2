export function createCloudFinale(stage, reducedMotion) {
  const scene = document.createElement('div');
  scene.className = 'cloud-scene';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = `<picture><source media="(max-width:600px)" srcset="/media/cloud-mobile.webp"><img class="cloud-art" src="/media/cloud-finale.webp" alt="" decoding="async"></picture><div class="cloud-orbits"><i></i><i></i><i></i></div><div class="cloud-streams">${Array.from({length:14},(_,i)=>`<i style="--x:${57+(i*19%34)}%;--delay:${-(i*.61)}s;--duration:${3+i%4}s"></i>`).join('')}</div><div class="cloud-vignette"></div>`;
  stage.querySelector('.shade').before(scene);
  const chapter = stage.querySelector('[data-chapter="3"]');
  const tags = document.createElement('div');
  tags.className='cloud-services';
  tags.innerHTML='<span>ВЫЧИСЛЕНИЯ</span><span>ХРАНЕНИЕ</span><span>СЕТИ</span>';
  chapter.querySelector('.hero-description').after(tags);
  const pause=document.createElement('button');
  pause.className='cloud-pause';pause.type='button';pause.textContent='Ⅱ Приостановить анимацию';pause.setAttribute('aria-pressed','false');chapter.append(pause);
  let paused=false,visible=true;
  const sync=()=>{scene.classList.toggle('motion-paused',paused||!visible||reducedMotion.matches||document.hidden);};
  pause.onclick=()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'▷ Продолжить анимацию':'Ⅱ Приостановить анимацию';sync()};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});observer.observe(stage);
  document.addEventListener('visibilitychange',sync);reducedMotion.addEventListener('change',sync);
  return progress=>{
    const opacity=Math.max(0,Math.min(1,(progress-.727)/.013));
    scene.style.opacity=String(opacity);
    stage.classList.toggle('cloud-finale',progress>=.74);
    scene.classList.toggle('is-active',opacity>0);
    pause.hidden=reducedMotion.matches;
    sync();
  };
}
