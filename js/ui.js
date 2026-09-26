// Small DOM helpers, the word renderer (with Mentava-style color scaffolding) and the finger slider.
import { box } from './store.js';
import { knowKey } from './phonics.js';
import { playSound, playBlend, say, stopAll } from './audio.js';

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
}

export const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const sleep = (ms) => new Promise(r => setTimeout(r, ms * (window.__timeScale ?? 1)));

// Color scaffolding: new letter teams are pink and silent letters grey; both fade to
// normal ink as the child masters that grapheme (Mentava's "training wheels").
const TEAM = [224, 69, 123], SILENT = [184, 194, 204], INK = [29, 42, 58];
const mix = (a, b, f) => `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * f)).join(',')})`;
function tokColor(t) {
  const special = t.s === '_' || t.t.length > 1 && !(t.t[0] === t.t[1]) || ['a:ae', 'i:ie', 'o:oe', 'u:yoo', 'u:oo', 'e:ee', 'y:ie', 'y:ee', 'n:ng', 'a:o', 'c:s', 'g:j', 's:z'].includes(t.k);
  if (!special) return null;
  const f = Math.min(box('k:' + knowKey(t.k)) / 5, 1);
  return mix(t.s === '_' ? SILENT : TEAM, INK, f * f);
}

// Render a word as token spans. opts: { heart, size: ''|'sm'|'xs', tap: true }
export function wordEl(analysis, opts = {}) {
  const el = h('div', { class: `word ${opts.size ?? ''}` });
  const spans = analysis.toks.map(t => {
    const s = h('span', { class: 'tok' }, t.t);
    const c = opts.heart ? null : tokColor(t);
    if (c) s.style.color = c;
    if (opts.tap !== false) s.addEventListener('click', (e) => { e.stopPropagation(); if (t.s !== '_') { stopAll(); playSound(t.s); flash(s); } });
    el.append(s);
    return s;
  });
  if (opts.heart && spans.length) spans[spans.length - 1].classList.add('heart');
  el.spans = spans;
  return el;
}

export function flash(el, ms = 600) { el.classList.add('lit'); setTimeout(() => el.classList.remove('lit'), ms); }

export async function soundOut(analysis, spans) {
  stopAll();
  const toks = analysis.toks.filter(t => t.s !== '_');
  spans?.forEach((s, i) => analysis.toks[i].s !== '_' && setTimeout(() => flash(s, 500), i * 350));
  await playBlend(toks.map(t => t.s));
  await sleep(500);
  await say(analysis.word);
}

// Finger slider under a word: sliding over each letter plays its sound.
// Resolves when the knob reaches the end.
export function slider(wordEl, analysis, { knob = '🐸', onDone, onTok, silent = false } = {}) {
  const track = h('div', { class: 'slide-track' });
  const k = h('div', { class: 'slide-knob' }, knob);
  track.append(k);
  const wrap = h('div', { class: 'slide-wrap' }, track, h('div', { class: 'slide-hint' }, 'slide your finger ➜'));
  let dragging = false, lastTok = -1, done = false, max = 0;

  function place(clientX) {
    const r = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - r.left - 38, r.width - 76));
    max = Math.max(max, x);
    k.style.left = (x + 4) + 'px';
    const kx = r.left + x + 38;
    // which token is above the knob? map knob progress to word span across the word
    const spans = wordEl.spans;
    const wr = wordEl.getBoundingClientRect();
    const frac = x / (r.width - 76);
    const wx = wr.left + frac * wr.width;
    let idx = -1;
    spans.forEach((s, i) => { const sr = s.getBoundingClientRect(); if (wx >= sr.left - 2) idx = i; });
    if (frac < 0.02) idx = -1;
    if (idx > lastTok) {
      for (let i = lastTok + 1; i <= idx; i++) {
        const t = analysis.toks[i];
        spans.forEach(s => s.classList.remove('lit'));
        spans[i].classList.add('lit');
        if (i === idx && t.s !== '_' && !silent) { stopAll(); playSound(t.s); }
        onTok?.(i);
      }
      lastTok = idx;
    }
    if (!done && frac > 0.97 && lastTok >= spans.length - 1) {
      done = true;
      setTimeout(() => { spans.forEach(s => s.classList.remove('lit')); onDone?.(); }, 450);
    }
    void kx;
  }
  const down = (e) => { dragging = true; track.setPointerCapture?.(e.pointerId); place(e.clientX); };
  const move = (e) => { if (dragging) place(e.clientX); };
  const up = () => { dragging = false; if (!done) { k.style.left = '4px'; lastTok = -1; wordEl.spans.forEach(s => s.classList.remove('lit')); } };
  track.addEventListener('pointerdown', down);
  track.addEventListener('pointermove', move);
  track.addEventListener('pointerup', up);
  track.addEventListener('pointercancel', up);
  wrap.reset = () => { done = false; lastTok = -1; k.style.left = '4px'; };
  return wrap;
}

// ---- confetti ----
export function confetti(n = 120) {
  const cv = document.getElementById('confetti');
  const c = cv.getContext('2d');
  const W = cv.width = innerWidth * devicePixelRatio, H = cv.height = innerHeight * devicePixelRatio;
  const cols = ['#ff5d73', '#ffc93c', '#4cb04f', '#7a5cff', '#3ab4f2'];
  const ps = Array.from({ length: n }, () => ({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .45, vx: (Math.random() - .5) * 26, vy: -Math.random() * 30 - 8, r: Math.random() * 10 + 6, c: pick(cols), a: Math.random() * 6 }));
  let f = 0;
  (function step() {
    c.clearRect(0, 0, W, H);
    ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 1.1; p.a += .2; c.fillStyle = p.c; c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); c.restore(); });
    if (++f < 110) requestAnimationFrame(step); else c.clearRect(0, 0, W, H);
  })();
}

export const PRAISE = ['Great job!', 'You got it!', 'Awesome!', 'Super!', 'Yes!', 'Wow!', 'Nice reading!', 'Brilliant!', 'Hooray!', 'Way to go!'];
export const TRY = ['Almost! Look again.', 'Not quite. Try again!', 'Oops! Let’s look again.'];
