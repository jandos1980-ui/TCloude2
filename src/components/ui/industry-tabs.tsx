import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';
import {Plus, ArrowUpRight} from 'lucide-react';

interface Industry {name: string; title: string; task: string; result: string; services: string[];}

// Layout and motion follow Vaibhav Kumar Singh's FAQ tabs on 21st.dev.
function IndustryQuestion({title, children, id}: {title: string; children: React.ReactNode; id: string}) {
  const [open, setOpen] = React.useState(false);
  const mouseInside = React.useRef(false);
  const reduced = useReducedMotion();
  return <div className={`industry-question${open ? ' is-open' : ''}`}
    onPointerEnter={event => {
      if (event.pointerType !== 'mouse') return;
      mouseInside.current = true;
      setOpen(true);
    }}
    onPointerLeave={event => {
      if (event.pointerType !== 'mouse') return;
      mouseInside.current = false;
      setOpen(false);
    }}>
    <h3><button type="button" id={`${id}-trigger`} aria-expanded={open} aria-controls={id}
      onClick={event => {
        // A mouse click keeps the hovered card open; touch and keyboard toggle it.
        if (event.detail > 0 && mouseInside.current) return;
        setOpen(value => !value);
      }}>
      <span>{title}</span>
      <motion.span className="industry-plus" animate={{rotate: open ? 45 : 0}} transition={{duration: reduced ? 0 : .2}}>
        <Plus size={20} aria-hidden="true" />
      </motion.span>
    </button></h3>
    <motion.div id={id} role="region" aria-labelledby={`${id}-trigger`} aria-hidden={!open} inert={!open}
      className="industry-answer" initial={false}
      animate={{height: open ? 'auto' : 0, marginBottom: open ? 16 : 0}}
      transition={{duration: reduced ? 0 : .3, ease: 'easeInOut'}}>{children}</motion.div>
  </div>;
}

function IndustryTabs({items, onSelect}: {items: Industry[]; onSelect: (index: number) => void}) {
  const [selected, setSelected] = React.useState(0);
  const reduced = useReducedMotion();
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const item = items[selected];
  const transition = {duration: reduced ? 0 : .5, ease: 'backIn' as const};
  function onKeyDown(event: React.KeyboardEvent, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (index + items.length - 1) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;
    event.preventDefault(); setSelected(next); tabs.current[next]?.focus();
  }
  return <>
    <div className="industries-heading">
      <p className="industry-subtitle">Решения по отраслям</p>
      <h2 id="industries-title">У каждой отрасли — свои задачи.</h2>
      <span className="industry-glow" aria-hidden="true" />
    </div>
    <div className="industry-tabs" role="tablist" aria-label="Отрасли">
      {items.map((category, index) => <button type="button" role="tab" key={category.name}
        id={`industry-tab-${index}`} aria-controls={`industry-panel-${index}`} aria-selected={selected === index}
        tabIndex={selected === index ? 0 : -1} ref={element => {tabs.current[index] = element;}}
        onPointerEnter={event => {
          if (event.pointerType === 'mouse') setSelected(index);
        }}
        onKeyDown={event => onKeyDown(event, index)} onClick={() => setSelected(index)}>
        <span className="industry-tab-label">{category.name}</span>
        <AnimatePresence initial={false}>{selected === index && <motion.span className="industry-tab-fill" aria-hidden="true"
          initial={{y: '100%'}} animate={{y: '0%'}} exit={{y: '100%'}} transition={transition} />}</AnimatePresence>
      </button>)}
    </div>
    <div className="industry-panels">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={selected} id={`industry-panel-${selected}`} role="tabpanel" aria-labelledby={`industry-tab-${selected}`}
          className="industry-panel" initial={{opacity: 0, y: reduced ? 0 : 20}} animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: reduced ? 0 : 20}} transition={transition}>
          <IndustryQuestion title={item.title} id={`industry-${selected}-task`}><p>{item.task}</p></IndustryQuestion>
          <IndustryQuestion title="Решение для вашей отрасли" id={`industry-${selected}-solution`}><p>{item.result}</p></IndustryQuestion>
          <IndustryQuestion title="Подходящие услуги" id={`industry-${selected}-services`}>
            <ul className="industry-services">{item.services.map(service => <li key={service}>{service}</li>)}</ul>
            <a className="industry-cta" href="#contact" onClick={() => onSelect(selected)}>Обсудить решение <ArrowUpRight size={18} aria-hidden="true" /></a>
          </IndustryQuestion>
        </motion.div>
      </AnimatePresence>
      <p className="industry-caption">Найдите свой сценарий. Подберём инфраструктуру под ваш проект.</p>
    </div>
  </>;
}

export function mountIndustryTabs(element: HTMLElement, items: Industry[], onSelect: (index: number) => void) {
  createRoot(element).render(<IndustryTabs items={items} onSelect={onSelect} />);
}
