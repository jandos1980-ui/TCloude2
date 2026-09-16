import * as React from 'react';
import { createRoot } from 'react-dom/client';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Building2, Server, Network } from 'lucide-react';
import './services-card.css';

interface Site {
  city: string;
  address?: string;
  status?: string;
  active?: boolean;
  power: string;
  powerUnit?: string;
  racks: string;
  note?: string;
}

export function ServiceCarousel({ sites, onSelect }: { sites: Site[]; onSelect: (index: number) => void }) {
  const reduced = useReducedMotion();
  const [viewport, api] = useEmblaCarousel({ align: 'start', loop: true, duration: reduced ? 0 : 18 });
  const [selected, setSelected] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const pointerX = React.useRef<number | null>(null);
  const updateHover = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    pointerX.current = event.clientX;
    setHovered(true);
  };
  const [interacting, setInteracting] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [overLink, setOverLink] = React.useState(false);
  React.useEffect(() => {
    if (!api || !hovered || interacting || focused || overLink || reduced) return;
    const timer = window.setInterval(() => {
      if (document.hidden || pointerX.current === null) return;
      const bounds = api.rootNode().getBoundingClientRect();
      const center = bounds.left + bounds.width / 2;
      // Use current rendered positions, including Embla's loop transforms.
      const cards = Array.from(api.rootNode().querySelectorAll('.site-card'))
        .map(card => card.getBoundingClientRect())
        .filter(card => card.right > bounds.left && card.left < bounds.right);
      const middle = cards.sort((a, b) =>
        Math.abs((a.left + a.right) / 2 - center) - Math.abs((b.left + b.right) / 2 - center)
      )[0];
      if (!middle) return;
      const x = pointerX.current;
      if (x >= middle.left && x <= middle.right) return;
      // Match the cards' physical movement to the pointer's side.
      if (x < middle.left) api.scrollNext(); else api.scrollPrev();
    }, 850);
    return () => window.clearInterval(timer);
  }, [api, hovered, interacting, focused, overLink, reduced]);
  React.useEffect(() => {
    if (!api) return;
    const update = () => setSelected(api.selectedScrollSnap());
    const onFocus = () => api.scrollTo(api.selectedScrollSnap(), true);
    const onPointerDown = () => setInteracting(true);
    const onPointerUp = () => setInteracting(false);
    update();
    api.on('select', update).on('reInit', update).on('slideFocus', onFocus);
    api.on('pointerDown', onPointerDown).on('pointerUp', onPointerUp);
    return () => { api.off('select', update).off('reInit', update).off('slideFocus', onFocus); api.off('pointerDown', onPointerDown).off('pointerUp', onPointerUp); };
  }, [api]);

  return <div className="site-carousel" role="region" aria-roledescription="карусель" aria-label="Площадки TAU CLOUD"
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') api?.scrollPrev(true); else api?.scrollNext(true);
    }}>
    <div className="site-carousel-viewport" ref={viewport}
      onPointerEnter={updateHover}
      onPointerMove={updateHover}
      onPointerLeave={() => { pointerX.current = null; setHovered(false); setOverLink(false); }}>
      <div className="site-carousel-track">
        {sites.map((site, index) => {
          const Icon = index === 4 ? Network : index === 0 ? Server : Building2;
          return <div className="site-carousel-slide" key={index} role="group" aria-roledescription="слайд" aria-label={`${index + 1} из ${sites.length}`}>
            <motion.article className={`site-card site-card-${index}`} initial={reduced ? false : { opacity: 0, transform: 'translateY(24px)' }}
              whileInView={{ opacity: 1, transform: 'translateY(0px)' }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: (index % 3) * 0.06, ease: [0.23, 1, 0.32, 1] }}>
              <div className="site-card-top"><span>( TC {String(index + 1).padStart(2, '0')} )</span>{site.status && <span className={`site-card-status ${site.active ? 'is-live' : ''}`}><i />{site.status}</span>}</div>
              <Icon className="site-card-icon" size={44} strokeWidth={1.25} aria-hidden="true" />
              <div className="site-card-copy"><h3>{site.city}</h3><p className="site-card-address">{site.address || 'Каспийский регион'}</p>
                <div className="site-card-stats"><div><strong>{site.power}<small> {site.powerUnit || 'МВт'}</small></strong><span>{site.active ? 'Подводимая' : 'Проектная'} мощность</span></div><div><strong>{site.racks}</strong><span>{index === 1 ? 'Стоек в 1-й очереди' : 'Серверных стоек'}</span></div></div>
                <p className="site-card-note">{site.note || '\u00a0'}</p>
                <a href="#contact" onPointerEnter={() => setOverLink(true)} onPointerLeave={() => setOverLink(false)} onClick={() => onSelect(index)}>Обсудить размещение<ArrowUpRight size={18} aria-hidden="true" /></a>
              </div>
            </motion.article>
          </div>;
        })}
      </div>
    </div>
    <div className="site-carousel-footer"><span className="site-carousel-count" aria-live="polite" aria-atomic="true">{String(selected + 1).padStart(2, '0')} <span>/ {String(sites.length).padStart(2, '0')}</span></span>
      <div className="site-carousel-dots">{sites.map((_, index) => <button key={index} type="button" aria-label={`Показать площадку TC ${String(index + 1).padStart(2, '0')}`} aria-current={selected === index ? 'true' : undefined} onClick={() => api?.scrollTo(index, !!reduced)}><span /></button>)}</div>
    </div>
  </div>;
}

export function mountLocationCarousel(element: HTMLElement, sites: Site[], onSelect: (index: number) => void) {
  createRoot(element).render(<ServiceCarousel sites={sites} onSelect={onSelect} />);
}
