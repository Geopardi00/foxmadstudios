document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Nav: solid after scroll, hide on scroll down ---------- */
const nav = document.getElementById('nav');
const progress = document.querySelector('.progress');
let lastY = window.scrollY;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle('is-scrolled', y > 40);
  nav.classList.toggle('is-hidden', y > lastY && y > 300);
  lastY = y;
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* ---------- Card SVG animations: pause when off-screen or reduced motion ---------- */
const vizzes = document.querySelectorAll('.viz');
if (reduceMotion) {
  vizzes.forEach((svg) => svg.pauseAnimations?.());
} else {
  const vio = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? e.target.unpauseAnimations?.() : e.target.pauseAnimations?.();
  });
  vizzes.forEach((svg) => vio.observe(svg));
}

/* ---------- Hero: pointer glow + fox parallax ---------- */
const hero = document.querySelector('.hero');
const fox = document.querySelector('.hero__fox');
if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    hero.style.setProperty('--mx', `${x * 100}%`);
    hero.style.setProperty('--my', `${y * 100}%`);
    fox.style.setProperty('--px', `${(x - 0.5) * 14}px`);
    fox.style.setProperty('--py', `${(y - 0.5) * 10}px`);
  });
}

/* ---------- Hero: drifting copper embers ---------- */
const canvas = document.querySelector('.hero__embers');
const ctx = canvas.getContext('2d');
const pixelEmbers = canvas.dataset.embers === 'pixel';
let W, H, dpr, embers = [], running = !reduceMotion, rafId;

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.round(Math.min(60, W / 22));
  embers = Array.from({ length: count }, () => spawn(true));
}
function spawn(anywhere) {
  return {
    x: Math.random() * W,
    y: anywhere ? Math.random() * H : H + 10,
    r: Math.random() * 1.6 + 0.4,
    vy: Math.random() * 0.35 + 0.12,
    sway: Math.random() * Math.PI * 2,
    a: Math.random() * 0.5 + 0.15,
  };
}
function tick() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < embers.length; i++) {
    const p = embers[i];
    p.y -= p.vy; p.sway += 0.01; p.x += Math.sin(p.sway) * 0.25;
    if (p.y < -10) embers[i] = spawn(false);
    const fadeTop = Math.min(1, p.y / (H * 0.35));
    if (pixelEmbers) {
      // Square sparks snapped to a 2px grid (pixel-art style)
      const s = p.r > 1.3 ? 4 : 2;
      ctx.fillStyle = `rgba(255, 126, 20, ${p.a * fadeTop})`;
      ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, s, s);
      continue;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(233, 150, 106, ${p.a * fadeTop})`;
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(233,150,106,.8)';
    ctx.fill();
  }
  if (running) rafId = requestAnimationFrame(tick);
}
resize();
addEventListener('resize', resize);
if (running) {
  tick();
  // Stop drawing while the hero is scrolled out of view
  new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    cancelAnimationFrame(rafId);
    if (running) tick();
  }).observe(hero);
}
