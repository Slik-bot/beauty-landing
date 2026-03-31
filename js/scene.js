const SP = {
  shelf:  { el: null, speed: 0.12 },
  plant:  { el: null, speed: 0.22 },
  master: { el: null, speed: 0.38 },
};

let currentY = 0;
let targetY = 0;
let rafId = null;

const lerp = (a, b, t) => a + (b - a) * t;

const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
const isReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const tick = () => {
  currentY = lerp(currentY, targetY, 0.06);

  Object.values(SP).forEach(({ el, speed }) => {
    if (!el) return;
    el.style.transform = `translateY(${currentY * speed}px)`;
  });

  rafId = requestAnimationFrame(tick);
};

const onScroll = () => {
  targetY = window.scrollY;
};

const initScene = () => {
  if (isMobile() || isReduced()) return;

  SP.shelf.el  = document.getElementById('sp-shelf');
  SP.plant.el  = document.getElementById('sp-plant');
  SP.master.el = document.getElementById('sp-master');

  const anyEl = Object.values(SP).some(({ el }) => el !== null);
  if (!anyEl) return;

  window.addEventListener('scroll', onScroll, { passive: true });
  rafId = requestAnimationFrame(tick);
};

const destroyScene = () => {
  window.removeEventListener('scroll', onScroll);
  if (rafId) cancelAnimationFrame(rafId);
};

document.addEventListener('DOMContentLoaded', initScene);
