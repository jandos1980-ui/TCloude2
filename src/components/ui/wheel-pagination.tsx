import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './wheel-pagination.css';

// Adapted from Ruixen UI Wheel Pagination: https://ruixen.com/r/wheel-pagination.json
export function WheelPagination({count, active, onChange}: {
  count: number; active: number; onChange: (index: number, instant?: boolean) => void;
}) {
  const reduced = useReducedMotion();
  const root = React.useRef<HTMLDivElement>(null);
  const current = React.useRef(active);
  const callback = React.useRef(onChange);
  const drag = React.useRef<{x: number; moved: boolean} | null>(null);
  const suppressClick = React.useRef(false);
  current.current = active;
  callback.current = onChange;
  const go = (next: number, instant = false) => {
    const index = Math.max(0, Math.min(count - 1, next));
    if (index !== current.current) {current.current = index; callback.current(index, instant || !!reduced);}
  };
  React.useEffect(() => {
    const element = root.current;
    if (!element) return;
    let accumulated = 0, last = 0, lastEvent = 0;
    const wheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (event.ctrlKey || !delta) return;
      const direction = Math.sign(delta);
      if ((current.current === 0 && direction < 0) || (current.current === count - 1 && direction > 0)) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastEvent > 180 || (accumulated !== 0 && Math.sign(accumulated) !== direction)) accumulated = 0;
      lastEvent = now;
      accumulated += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 180 : 1);
      if (now - last < 180 || Math.abs(accumulated) < 40) return;
      const next = Math.max(0, Math.min(count - 1, current.current + direction));
      current.current = next;
      callback.current(next, !!reduced);
      accumulated = 0; last = now;
    };
    element.addEventListener('wheel', wheel, {passive: false});
    return () => element.removeEventListener('wheel', wheel);
  }, [count, reduced]);
  return <nav className="site-wheel" aria-label="Выбор площадки" onKeyDown={event => {
    const keys: Record<string, number> = {ArrowUp: active - 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: count - 1};
    if (!(event.key in keys)) return;
    event.preventDefault(); event.stopPropagation(); go(keys[event.key], true);
  }}>
    <button className="site-wheel-arrow" type="button" aria-label="Предыдущая площадка" disabled={active === 0} onClick={() => go(active - 1)}><ChevronLeft size={18} aria-hidden="true" /></button>
    <div className="site-wheel-window" ref={root}
      onPointerDown={event => {if (event.button !== 0) return; suppressClick.current = false; drag.current = {x:event.clientX,moved:false};}}
      onPointerMove={event => {
        if (!drag.current) return;
        const delta = drag.current.x - event.clientX;
        if (Math.abs(delta) < 28) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current.moved = true; drag.current.x = event.clientX;
        go(current.current + Math.sign(delta));
      }}
      onPointerUp={() => {suppressClick.current = !!drag.current?.moved; drag.current = null;}}
      onPointerCancel={() => {drag.current = null;}}
      onLostPointerCapture={() => {drag.current = null;}}
      onClickCapture={event => {if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}}>
      {Array.from({length: count}, (_, index) => {
        const isActive = index === active;
        return <button type="button" key={index} className="site-wheel-number" aria-label={`Показать площадку TC ${String(index + 1).padStart(2,'0')}`} aria-current={index === active ? 'true' : undefined} onClick={() => go(index)}>
          <motion.span initial={false} animate={{opacity: isActive ? 1 : .7, transform: `scale(${isActive ? 1.12 : 1})`}} transition={reduced ? {duration:0} : {type:'spring',duration:.5,bounce:.2}}>{String(index + 1).padStart(2,'0')}</motion.span>
        </button>;
      })}
    </div>
    <button className="site-wheel-arrow" type="button" aria-label="Следующая площадка" disabled={active === count - 1} onClick={() => go(active + 1)}><ChevronRight size={18} aria-hidden="true" /></button>
  </nav>;
}
