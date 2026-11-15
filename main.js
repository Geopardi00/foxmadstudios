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

/* ---------- Gameplay clips: no autoplay with reduced motion, pause off-screen ---------- */
const clips = document.querySelectorAll('video');
if (reduceMotion) {
  clips.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); v.controls = true; });
} else {
  const vio = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause();
  });
  clips.forEach((v) => vio.observe(v));
}

/* ---------- Scroll parallax: space backdrop and the ghost wordmark ---------- */
const gpSection = document.querySelector('.gp');
const ghost = document.querySelector('.about__ghost span');
const aboutSection = document.querySelector('.about');
if (!reduceMotion) {
  let ticking = false;
  const parallax = () => {
    const vh = innerHeight;
    const g = gpSection.getBoundingClientRect();
    if (g.bottom > 0 && g.top < vh) {
      const p = (vh - g.top) / (vh + g.height); // 0..1 while the section crosses the screen
      gpSection.style.setProperty('--gp-shift', `${(p - 0.5) * -50}px`);
    }
    const a = aboutSection.getBoundingClientRect();
    if (a.bottom > 0 && a.top < vh) {
      const p = (vh - a.top) / (vh + a.height);
      ghost.style.setProperty('--ghost-x', `${-4 - p * 22}%`);
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
  parallax();
}

/* ---------- Contact: light follows the pointer, drifts by itself on touch ---------- */
const contact = document.querySelector('.contact');
if (matchMedia('(pointer: fine)').matches && !reduceMotion) {
  contact.addEventListener('pointermove', (e) => {
    const r = contact.getBoundingClientRect();
    contact.style.setProperty('--cx', `${((e.clientX - r.left) / r.width) * 100}%`);
    contact.style.setProperty('--cy', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
} else if (!reduceMotion) {
  contact.classList.add('is-idle');
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
