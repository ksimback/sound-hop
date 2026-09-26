import { h, shuffle, pick, sleep, confetti } from './ui.js';
import { S, save, grade, finishLevel, markDay, addMinutes, reset, importJSON, box } from './store.js';
import { unlock, loadRecordedList, say, stopAll, speak } from './audio.js';
import { LEVELS, STAGES } from './curriculum.js';
import { buildLevel, buildWarmup } from './engine.js';
import { ACTIVITIES, sfx } from './activities.js';
import { parentZone, gate, onboarding } from './parent.js';

const app = document.getElementById('app');
const STICKERS = '🦁🐯🐻🐼🐨🐸🐵🦊🐰🐶🐱🦄🐲🦖🦕🐙🦋🐝🐞🐢🐬🐳🦈🦜🦉🐧🦩🦒🐘🦓🦔🐿️🦥🦦🦘🐊🦀🐠🌈⭐🌟🚀🛸🚂🚒🚜🏎️⛵🎈🎁🏆🎸🥁🍕🍩🍦🍓🍉🌻🌵🍄⚽🏀🪁🧸🎨'.match(/\p{Extended_Pictographic}️?/gu);

let sessionStart = 0;

// ---------- navigation ----------
export function go(screen, ...args) { stopAll(); window.scrollTo(0, 0); SCREENS[screen](...args); }

const SCREENS = {
  home() {
    const s = S();
    const L = LEVELS[Math.min(s.levelIdx, LEVELS.length - 1)];
    const stars = Object.values(s.levels).reduce((a, l) => a + (l.stars || 0), 0);
    const done = s.levelIdx >= LEVELS.length;
    const name = s.child.name || 'friend';
    app.replaceChildren(h('div', { class: 'screen fade-in' },
      h('div', { class: 'topbar' }, h('div', { class: 'spacer' }), h('button', { class: 'icon-btn', 'aria-label': 'Grown-ups', onclick: () => gate(() => go('parent')) }, '🔒')),
      h('div', { class: 'center' },
        h('h1', { class: 'home-title' }, 'Sound Hop'),
        h('div', { class: 'mascot' }, '🐸'),
        h('div', { class: 'bubble' }, done ? `You finished every level, ${name}! Let's read stories!` : `Hi ${name}! Next: ${L.title}`),
        h('button', { class: 'btn big', onclick: () => { unlock(); startSession(); } }, done ? '📚 Stories' : "▶ Let's Hop!"),
        h('div', { class: 'stat-row' },
          h('div', { class: 'chip' }, `⭐ ${stars}`),
          h('div', { class: 'chip' }, `🔥 ${s.streak.days} day${s.streak.days === 1 ? '' : 's'}`),
          h('div', { class: 'chip' }, `🏅 ${s.stickers.length}`)),
        h('div', { class: 'home-actions' },
          h('button', { class: 'btn ghost', onclick: () => { unlock(); go('map'); } }, '🗺️ Map'),
          h('button', { class: 'btn ghost', onclick: () => go('stickers') }, '🏅 Stickers')))));
    if (!s._greeted) { s._greeted = true; }
  },

  map() {
    const s = S();
    const body = h('div', { class: 'map' });
    let lastStage = 0;
    LEVELS.forEach((L, i) => {
      if (L.stage !== lastStage) {
        lastStage = L.stage;
        const st = STAGES[L.stage - 1];
        body.append(h('div', { class: 'stage-head' }, h('span', { style: { fontSize: '40px' } }, st.emoji), h('div', {}, st.name, h('small', {}, st.blurb))));
      }
      const rec = s.levels[L.id];
      const state = rec?.passed ? 'done' : i === s.levelIdx ? 'current' : i < s.levelIdx ? 'done' : 'locked';
      const icon = { story: '📖', check: '🏆', review: '🔁', heart: '❤️', ready: '➡️' }[L.type] ?? L.id;
      const offset = [0, 60, 110, 60][i % 4];
      const pad = h('button', { class: `pad ${state === 'done' ? '' : state}`, onclick: () => { if (state !== 'locked') { sessionStart ||= Date.now(); playLevel(i); } else sfx.bad(); } },
        state === 'locked' ? '🔒' : icon,
        state === 'current' ? h('span', { class: 'frog' }, '🐸') : null,
        rec?.passed ? h('span', { class: 'stars' }, '⭐'.repeat(rec.stars)) : null);
      body.append(h('div', { class: 'pad-row', style: { paddingLeft: `calc(${offset}px + 8%)` } }, h('div', { class: 'pad-cell' }, pad, h('div', { class: 'pad-label' }, L.title))));
    });
    app.replaceChildren(h('div', { class: 'screen fade-in' },
      h('div', { class: 'topbar' }, h('button', { class: 'icon-btn', onclick: () => go('home') }, '🏠'), h('div', { class: 'spacer' }), h('div', { class: 'chip' }, `Level ${Math.min(s.levelIdx + 1, LEVELS.length)} / ${LEVELS.length}`)),
      body));
    setTimeout(() => app.querySelector('.pad.current')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 150);
  },

  stickers() {
    const s = S();
    const grid = h('div', { class: 'sticker-grid' }, STICKERS.map(e => s.stickers.includes(e) ? h('div', { class: 'sticker' }, e) : h('div', { class: 'sticker empty' }, '?')));
    app.replaceChildren(h('div', { class: 'screen fade-in' },
      h('div', { class: 'topbar' }, h('button', { class: 'icon-btn', onclick: () => go('home') }, '🏠'), h('div', { class: 'spacer' }), h('div', { class: 'chip' }, `🏅 ${s.stickers.length} / ${STICKERS.length}`)),
      h('h2', { style: { fontSize: '30px', margin: '10px 0 16px' } }, 'My Sticker Book'),
      grid));
  },

  parent() { parentZone(app, () => go('home')); },
};

// ---------- session ----------
async function startSession() {
  markDay();
  sessionStart = Date.now();
  const s = S();
  const idx = Math.min(s.levelIdx, LEVELS.length - 1);
  if (s.levelIdx >= LEVELS.length) return go('map');
  const warm = buildWarmup(idx);
  if (warm.length >= 3) {
    const r = await run(warm, { idx, title: 'Warm-up', intro: 'Warm-up time! Remember these?' });
    if (!r) return go('home');
  }
  playLevel(idx);
}

async function playLevel(idx) {
  const plan = buildLevel(idx);
  const r = await run(plan.steps, { idx, title: plan.level.title, intro: plan.level.type === 'check' ? 'Big check! Show what you know!' : null });
  if (!r) return go('home');
  const acc = r.scored ? r.right / r.scored : 1;
  const passed = acc >= plan.pass;
  const stars = !passed ? 0 : acc >= 0.95 ? 3 : acc >= 0.85 ? 2 : 1;
  const wasPassed = S().levels[plan.level.id]?.passed;
  finishLevel(plan.level, acc, passed, stars);
  let sticker = null;
  if (passed && !wasPassed) {
    const left = STICKERS.filter(e => !S().stickers.includes(e));
    if (left.length) { sticker = pick(left); S().stickers.push(sticker); save(); }
  }
  results(plan.level, { passed, stars, acc, sticker, bonus: r.bonus });
}

function results(level, { passed, stars, sticker }) {
  const s = S();
  const minutes = (Date.now() - sessionStart) / 60000;
  const tired = minutes >= s.settings.sessionMin;
  const nextIdx = s.levelIdx;
  const finished = nextIdx >= LEVELS.length;
  const starRow = h('div', { class: 'stars-big' }, [0, 1, 2].map(i => h('span', { class: i < stars ? '' : 'off', style: { animationDelay: `${i * 0.25}s` } }, '⭐')));
  const msg = passed
    ? (level.final ? `You can read books now, ${s.child.name || 'superstar'}!` : tired ? 'Amazing work today! Time for a break?' : 'You did it!')
    : "Good try! Let's practice this one again.";
  const buttons = h('div', { class: 'home-actions' });
  if (!passed) buttons.append(h('button', { class: 'btn', onclick: () => playLevel(level.id - 1) }, '🔁 Try again'));
  else if (!finished) buttons.append(h('button', { class: tired ? 'btn ghost' : 'btn', onclick: () => playLevel(nextIdx) }, 'Next ➜'));
  buttons.append(h('button', { class: passed && tired ? 'btn' : 'btn ghost', onclick: () => { addMinutes(Math.round(minutes)); sessionStart = 0; go('home'); } }, '🏠 All done'));
  app.replaceChildren(h('div', { class: 'screen fade-in' }, h('div', { class: 'center' },
    h('div', { class: 'mascot' }, passed ? '🐸' : '🐸💪'),
    passed ? starRow : null,
    h('div', { class: 'bubble' }, msg),
    sticker ? h('div', {}, h('div', { class: 'sticker-new' }, sticker), h('div', { class: 'prompt' }, 'New sticker!')) : null,
    buttons)));
  if (passed) { sfx.good(); confetti(level.type === 'check' || level.type === 'story' ? 220 : 120); }
  speak([msg, ...(sticker ? ['You got a new sticker!'] : [])]);
}

// Runs a list of steps. Wrong first tries are retested a few steps later (not re-scored).
async function run(steps, { idx, title, intro }) {
  const queue = steps.map(s => ({ ...s, idx }));
  let scored = 0, right = 0, bonus = false, quit = false;
  const bar = h('i');
  const stage = h('div', { style: { flex: 1, display: 'flex', flexDirection: 'column' } });
  const quitBtn = h('button', { class: 'icon-btn', 'aria-label': 'Stop', onclick: () => { quit = true; stopAll(); go('home'); } }, '✖');
  app.replaceChildren(h('div', { class: 'screen' }, h('div', { class: 'topbar' }, quitBtn, h('div', { class: 'progress' }, bar)), stage));
  if (intro) { await say(intro); }
  const total = queue.length;
  let doneCount = 0;
  while (queue.length) {
    if (quit) return null;
    const st = queue.shift();
    const act = ACTIVITIES[st.type];
    if (!act) { console.warn('no activity', st.type); continue; }
    let res;
    try { res = await act(stage, st); } catch (e) { console.error(e); res = { scored: false }; }
    if (quit) return null;
    if (res.bonus) bonus = true;
    if (res.scored && !st.retry) {
      scored++;
      if (res.correct) right++;
      if (st.item) grade(st.item, res.correct);
      if (!res.correct) queue.splice(Math.min(3, queue.length), 0, { ...st, retry: true });
    }
    if (!st.retry) doneCount++;
    bar.style.width = Math.round((doneCount / total) * 100) + '%';
  }
  return { scored, right, bonus };
}

// ---------- boot ----------
async function boot() {
  try { await loadRecordedList(); } catch (e) { console.warn(e); }
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => { });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => { });
  if (!S().onboarded) onboarding(app, () => go('home'));
  else go('home');
}
boot();
