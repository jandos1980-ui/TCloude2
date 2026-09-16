// Letter-glitch background based on the visual parameters at aura.build/404.

export function initReliabilityBackground() {
  const canvas = document.querySelector('.reliability-background canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const host = canvas.parentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>,0123456789';
  const colors = [34, 85, 17];
  const pick = values => values[Math.floor(Math.random() * values.length)];
  let cells = [], columns = 0, width = 0, height = 0;
  let frame = 0, lastUpdate = 0, lastDraw = 0, visible = false;

  function draw() {
    context.clearRect(0, 0, width, height);
    context.font = '16px monospace';
    context.textBaseline = 'top';
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const shade = Math.round(cell.color);
      context.fillStyle = `rgb(${shade},${shade},${shade})`;
      context.fillText(cell.char, (i % columns) * 10, Math.floor(i / columns) * 20);
    }
  }

  function resize() {
    ({width, height} = host.getBoundingClientRect());
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    columns = Math.ceil(width / 10);
    cells = Array.from({length: columns * Math.ceil(height / 20)}, () => {
      const color = pick(colors);
      return {char: pick(characters), color, from: color, target: color, progress: 1};
    });
    draw();
  }

  function tick(time) {
    if (time - lastUpdate >= 50) {
      for (let i = 0; i < Math.max(1, Math.floor(cells.length * .05)); i++) {
        const cell = pick(cells);
        if (!cell) break;
        cell.char = pick(characters);
        cell.from = cell.color;
        cell.target = pick(colors);
        cell.progress = 0;
      }
      lastUpdate = time;
    }
    if (time - lastDraw >= 1000 / 30) {
      const step = Math.min((time - lastDraw) / 333, 1);
      for (const cell of cells) {
        cell.progress = Math.min(1, cell.progress + step);
        cell.color = cell.from + (cell.target - cell.from) * cell.progress;
      }
      draw();
      lastDraw = time;
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (visible && !document.hidden && !motion.matches) {
      lastDraw = lastUpdate = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  const observer = new ResizeObserver(resize);
  resize();
  observer.observe(host);
  intersection.observe(host);
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);

  if (import.meta.hot) import.meta.hot.dispose(() => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    intersection.disconnect();
    motion.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
  });
}
