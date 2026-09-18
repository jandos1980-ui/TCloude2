import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Building2, Server, Network } from 'lucide-react';
import './services-card.css';
import { WheelPagination } from './wheel-pagination';

interface Site {
  city: string;
  address?: string;
  status?: string;
  active?: boolean;
  power?: string;
  powerUnit?: string;
  racks?: string;
  note?: string;
  project?: {
    title: string; cardTitle?: string; subtitle: string; summary: string; paragraphs: string[];
    sections?: { title: string; text: string }[];
    images: { src: string; alt: string; caption: string; width: number; height: number }[];
  };
}

function ProjectDetails({ site, onClose }: { site: Site; onClose: () => void }) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  React.useEffect(() => {
    const element = dialog.current!;
    const previousOverflow = document.documentElement.style.overflow;
    element.showModal();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      element.close();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, []);
  const project = site.project!;
  return createPortal(<dialog ref={dialog} className="site-project-dialog" aria-labelledby="site-project-title" data-lenis-prevent="" onClose={onClose}
    onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose(); } }}>
    <div className="site-project-header"><span>{site.city} · {site.address}</span><button type="button" autoFocus onClick={onClose} aria-label="Закрыть описание проекта">Закрыть <span aria-hidden="true">×</span></button></div>
    <div className="site-project-body">
      <p className="site-project-status">{site.status}</p>
      <h2 id="site-project-title">{project.title}<span>{project.subtitle}</span></h2>
      <div className="site-project-description">{project.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{project.sections?.map(section => <section className="site-project-section" key={section.title}><h3>{section.title}</h3><p>{section.text}</p></section>)}</div>
      <div className="site-project-gallery">{project.images.map(photo => { const { caption, ...image } = photo; return <figure key={photo.src}><img {...image} loading="lazy" decoding="async" /><figcaption>{caption}</figcaption></figure>; })}</div>
    </div>
  </dialog>, document.body);
}

export function ServiceCarousel({ sites, onSelect }: { sites: Site[]; onSelect: (index: number) => void }) {
  const [projectSite, setProjectSite] = React.useState<Site | null>(null);
  const projectTrigger = React.useRef<HTMLButtonElement | null>(null);
  const closeProject = () => { setProjectSite(null); projectTrigger.current?.focus({ preventScroll: true }); };
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
    if (!api || !hovered || interacting || focused || overLink || reduced || projectSite) return;
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
  }, [api, hovered, interacting, focused, overLink, reduced, projectSite]);
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
      if (projectSite) return;
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
            <motion.article className={`site-card site-card-${index}${site.project ? ' site-card-project' : ''}`} initial={reduced ? false : { opacity: 0, transform: 'translateY(24px)' }}
              whileInView={{ opacity: 1, transform: 'translateY(0px)' }} viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: (index % 3) * 0.06, ease: [0.23, 1, 0.32, 1] }}>
              <div className="site-card-top"><span>TC {String(index + 1).padStart(2, '0')}</span>{site.status && <span className={`site-card-status ${site.active ? 'is-live' : ''}`}><i />{site.status}</span>}</div>
              {site.project ? <>
                {(() => { const { caption: _caption, ...image } = site.project.images[0]; return <img className="site-card-project-image" {...image} loading="lazy" decoding="async" />; })()}
                <div className="site-card-project-copy">
                  <p className="site-card-project-location">{site.city} · {site.address}</p>
                  <h3>{site.project.cardTitle ?? site.project.title}<span>{site.project.subtitle}</span></h3>
                  <p className="site-card-project-summary">{site.project.summary}</p>
                </div>
                <button type="button" className="site-card-project-action" aria-haspopup="dialog" onPointerEnter={() => setOverLink(true)} onPointerLeave={() => setOverLink(false)} onClick={event => { projectTrigger.current = event.currentTarget; setProjectSite(site); }}>Подробнее о проекте<ArrowUpRight size={18} aria-hidden="true" /></button>
              </> : <><p className="site-card-tier">Спроектировано по Tier III</p>
              <Icon className="site-card-icon" size={44} strokeWidth={1.25} aria-hidden="true" />
              <div className="site-card-copy"><h3>{site.city}</h3><p className="site-card-address">{site.address || 'Каспийский регион'}</p>
                <div className="site-card-stats"><div><strong>{site.power}<small> {site.powerUnit || 'МВт'}</small></strong><span>{site.active ? 'Подводимая' : 'Проектная'} мощность</span></div><div><strong>{site.racks}</strong><span>{index === 1 ? 'Стоек в 1-й очереди' : 'Серверных стоек'}</span></div></div>
                <p className="site-card-note">{site.note || '\u00a0'}</p>
                <a href="#contact" onPointerEnter={() => setOverLink(true)} onPointerLeave={() => setOverLink(false)} onClick={() => onSelect(index)}>Обсудить размещение<ArrowUpRight size={18} aria-hidden="true" /></a>
              </div></>}
            </motion.article>
          </div>;
        })}
      </div>
    </div>
    <div className="site-carousel-footer"><span className="site-carousel-count" aria-live="polite" aria-atomic="true">{String(selected + 1).padStart(2, '0')} <span>/ {String(sites.length).padStart(2, '0')}</span></span>
      <WheelPagination count={sites.length} active={selected} onChange={(index, instant) => api?.scrollTo(index, instant || !!reduced)} />
    </div>
    {projectSite && <ProjectDetails site={projectSite} onClose={closeProject} />}
  </div>;
}

export function mountLocationCarousel(element: HTMLElement, sites: Site[], onSelect: (index: number) => void) {
  createRoot(element).render(<ServiceCarousel sites={sites} onSelect={onSelect} />);
}
