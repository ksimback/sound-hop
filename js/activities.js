// Each activity renders into `root` and resolves { scored, correct } when finished.
// Wrong answers get immediate correction (show + say the right answer) — the runner re-tests later.
import { h, wordEl, slider, soundOut, shuffle, pick, sleep, flash, confetti } from './ui.js';
import { PROMPTS, WRONG, PRAISE, LINES, TIPS, introScript, heartIntroScript, lessonOpening } from './narration.js';
import { speak, say, playSound, playBlend, stopAll, ctxGet, micLevel, releaseMic } from './audio.js';
import { keyLabel, keySound } from './phonics.js';
import { SOUND } from './sounds.js';
import { analyze, isHeartAt } from './lexicon.js';
import { LEVELS, NO_QUIZ, READY_LEVEL } from './curriculum.js';
import { introWords } from './engine.js';
import { S } from './store.js';

const DEBUG = location.search.includes('debug');

// ---------- sound effects ----------
function tone(freqs, dur = 0.12, type = 'sine', vol = 0.18) {
  try {
    const c = ctxGet();
    let t = c.currentTime;
    freqs.forEach(f => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur);
      t += dur * 0.8;
    });
  } catch (e) { }
}
export const sfx = {
  good: () => tone([660, 880, 1320], 0.11, 'triangle'),
  bad: () => tone([220, 180], 0.16, 'square', 0.06),
  pop: () => tone([520], 0.06, 'triangle'),
};

// Lowercase text in the early stages (Mentava: lowercase first), keeping "I".
export function displayText(text, idx) {
  if ((LEVELS[idx]?.stage ?? 9) > 2) return text;
  return text.split(' ').map(w => (w.replace(/[^A-Za-z]/g, '') === 'I' ? w : w.toLowerCase())).join(' ');
}

function promptRow(parts) {
  const btn = h('button', { class: 'say-btn', 'aria-label': 'Hear again', onclick: () => { stopAll(); speak(parts); } }, '🔊');
  return h('div', { class: 'prompt' }, btn);
}

// Speak an activity's prompt. The first time an activity type appears in a lesson the
// child hears the full explanation, and the answers wait until it is finished.
function ask(type, st, extra) {
  const full = PROMPTS[type](st, !!st.first, extra);
  const short = st.first ? PROMPTS[type](st, false, extra) : full;
  const done = speak(full);
  return { row: promptRow(short), ready: st.first ? done : null };
}

// Generic multiple choice. tiles: [{el, correct, value}]
function choose(grid, tiles, { onRight, onWrong, ready } = {}) {
  if (ready) { grid.classList.add('waiting'); ready.then(() => grid.classList.remove('waiting')); }
  return new Promise(res => {
    let first = true, locked = false;
    tiles.forEach(t => {
      if (DEBUG) t.el.dataset.ok = t.correct ? '1' : '0';
      t.el.addEventListener('click', async () => {
        if (locked) return;
        if (t.correct) {
          locked = true;
          stopAll(); sfx.good();
          t.el.classList.add('correct');
          tiles.forEach(o => o !== t && o.el.classList.add('dim'));
          await onRight?.(first);
          if (first && Math.random() < 0.6) await say(pick(PRAISE));
          await sleep(350);
          res({ scored: true, correct: first });
        } else {
          sfx.bad();
          t.el.classList.remove('wrong'); void t.el.offsetWidth; t.el.classList.add('wrong');
          if (first) {
            first = false;
            tiles.find(o => o.correct).el.classList.add('hint');
            stopAll();
            await onWrong?.();
          }
        }
      });
    });
    grid.append(...tiles.map(t => t.el));
  });
}

function screenBody(root, ...kids) {
  const c = h('div', { class: 'center fade-in' }, ...kids);
  root.replaceChildren(c);
  return c;
}

function nextBtn(label = 'Next ➜') {
  let r; const p = new Promise(x => (r = x));
  const b = h('button', { class: 'btn big', onclick: () => { sfx.pop(); stopAll(); r(); } }, label);
  b.done = p;
  return b;
}

// ---------- activities ----------
const A = {};

A.intro = async (root, st) => {
  const s = keySound(st.key), sound = SOUND[s];
  const label = keyLabel(st.key);
  const card = h('div', { class: 'glyph-card', onclick: () => { stopAll(); playSound(s); flash(card); } }, h('div', { class: 'glyph' }, label.replace('_', ' _ ')));
  const words = introWords(st.key);
  const wordRow = h('div', { class: 'choices one-row', style: { width: 'min(96vw, 680px)' } }, words.map(w =>
    h('button', { class: 'tile pic', style: { fontSize: '54px', minHeight: '110px' }, onclick: () => { stopAll(); say(w.word, { rate: 0.7 }); } },
      h('div', {}, w.pic, h('div', { style: { fontSize: '22px' } }, w.word)))));
  const next = nextBtn();
  next.disabled = true;
  const parts = introScript(st.key, words);
  screenBody(root, h('div', { class: 'mascot small' }, '🐸'), card, promptRow(parts), wordRow, next);
  flash(card, 1500);
  await speak(parts);
  next.disabled = false;
  await next.done;
  return { scored: false };
};

A.tip = async (root, st) => {
  const next = nextBtn('OK! ➜');
  screenBody(root, h('div', { class: 'mascot small' }, '🐸'), h('div', { class: 'bubble' }, h('div', { style: { fontSize: '28px' } }, st.title), h('p', { style: { fontWeight: 600 } }, st.text)), next);
  await speak([st.title, st.text, ...(st.sound ? [{ sound: st.sound }] : []), TIPS.ok]);
  await next.done;
  return { scored: false };
};

A.heartIntro = async (root, st) => {
  const a = analyze(st.word);
  const w = wordEl(a, { heart: true, tap: false });
  const card = h('div', { class: 'glyph-card', onclick: () => say(st.word) }, w);
  const next = nextBtn();
  const parts = heartIntroScript(st.word);
  next.disabled = true;
  screenBody(root, h('div', { style: { fontSize: '64px' } }, '❤️'), card, promptRow(parts), next);
  await speak(parts);
  next.disabled = false;
  await next.done;
  return { scored: false };
};

A.tapSound = async (root, st) => {
  const s = keySound(st.key);
  const grid = h('div', { class: 'choices' + (st.choices.length === 3 ? ' three' : '') });
  const { row, ready } = ask('tapSound', st);
  screenBody(root, h('div', { class: 'mascot small' }, '👂'), row, grid);
  return choose(grid, st.choices.map(k => ({ el: h('button', { class: 'tile' }, keyLabel(k).replace('_', ' _ ')), correct: keyLabel(k) === keyLabel(st.key) })), {
    ready,
    onRight: () => playSound(s),
    onWrong: () => speak(WRONG.tapSound(st)),
  });
};

A.firstSound = async (root, st) => {
  const s = keySound(st.key);
  const grid = h('div', { class: 'choices three' });
  const { row, ready } = ask('firstSound', st);
  screenBody(root, h('div', { class: 'story-pic', onclick: () => say(st.word) }, st.pic), row, grid);
  return choose(grid, st.choices.map(k => ({ el: h('button', { class: 'tile' }, keyLabel(k)), correct: keyLabel(k) === keyLabel(st.key) })), {
    ready,
    onRight: () => speak([st.word, LINES.startsWith, { sound: s }]),
    onWrong: () => speak(WRONG.firstSound(st)),
  });
};

A.oralBlend = async (root, st) => {
  const sounds = st.entry.toks.filter(t => t.s !== '_').map(t => t.s);
  const grid = h('div', { class: 'choices three' });
  const { row, ready } = ask('oralBlend', st);
  screenBody(root, h('div', { class: 'mascot small' }, '🐸'), row, grid);
  return choose(grid, st.choices.map(e => ({ el: h('button', { class: 'tile pic' }, e.pic), correct: e === st.entry })), {
    ready,
    onRight: () => speak([{ blend: sounds }, LINES.makes, st.entry.word]),
    onWrong: () => speak(WRONG.oralBlend(st)),
  });
};

A.dir = async (root, st) => {
  const flip = Math.random() < 0.5;
  const target = flip ? `${st.wb} ${st.wa}` : `${st.wa} ${st.wb}`;
  const grid = h('div', { class: 'choices' });
  const { row, ready } = ask('dir', st, target.replace(' ', ''));
  screenBody(root, h('div', { class: 'mascot small' }, '🐸➡️'), row, grid);
  const mk = (x, y) => h('button', { class: 'tile pic', style: { fontSize: '60px' } }, h('div', {}, x + y, h('div', { style: { fontSize: '26px', color: '#8fa0ae' } }, '➜')));
  return choose(grid, shuffle([
    { el: mk(st.a, st.b), correct: !flip },
    { el: mk(st.b, st.a), correct: flip },
  ]), { ready, onWrong: () => speak(WRONG.dir(target.replace(' ', ''))) });
};

function readingPanel(entry, idx, { knob = '🐸', silent = false, onDone } = {}) {
  const a = { word: entry.word, toks: entry.toks };
  const w = wordEl(a, { heart: isHeartAt(entry.word, idx) });
  const sl = slider(w, a, { knob, onDone, silent });
  return { w, sl, a };
}

A.readWord = async (root, st) => {
  const { w, sl, a } = readingPanel(st.entry, st.idx, { onDone: () => say(LINES.sayItFast) });
  const grid = h('div', { class: 'choices three' });
  const { row, ready } = ask('readWord', st);
  screenBody(root, w, sl, row, grid);
  return choose(grid, st.choices.map(e => ({ el: h('button', { class: 'tile pic' }, e.pic), correct: e === st.entry })), {
    ready,
    onRight: () => soundOut(a, w.spans),
    onWrong: async () => { await speak(WRONG.readWord); await soundOut(a, w.spans); await say(LINES.tapPicture); },
  });
};

A.pickWord = async (root, st) => {
  const grid = h('div', { class: 'choices one-row', style: { gridTemplateColumns: '1fr' } });
  const top = st.entry.pic ? h('div', { class: 'story-pic', onclick: () => say(st.entry.word) }, st.entry.pic) : h('div', { class: 'mascot small' }, '👂');
  const { row, ready } = ask('pickWord', st);
  screenBody(root, top, row, grid);
  return choose(grid, st.choices.map(e => {
    const we = wordEl({ word: e.word, toks: e.toks }, { size: 'sm', tap: false, heart: isHeartAt(e.word, st.idx) });
    return { el: h('button', { class: 'tile wordtile', style: { minHeight: '96px' } }, we), correct: e === st.entry };
  }), {
    ready,
    onRight: () => say(st.entry.word),
    onWrong: () => speak(WRONG.pickWord(st)),
  });
};

A.heartPick = async (root, st) => {
  const grid = h('div', { class: 'choices one-row', style: { gridTemplateColumns: '1fr' } });
  const { row, ready } = ask('heartPick', st);
  screenBody(root, h('div', { style: { fontSize: '56px' } }, '❤️'), row, grid);
  return choose(grid, st.choices.map(w => {
    const we = wordEl(analyze(w), { size: 'sm', tap: false, heart: isHeartAt(w, st.idx) });
    return { el: h('button', { class: 'tile wordtile', style: { minHeight: '96px' } }, we), correct: w === st.word };
  }), { ready, onRight: () => say(st.word), onWrong: () => speak(WRONG.heartPick(st)) });
};

function sentenceEl(text, idx) {
  const box = h('div', { class: 'sentence' });
  displayText(text, idx).split(/\s+/).forEach(raw => {
    const clean = raw.replace(/[^A-Za-z']/g, '');
    const a = analyze(clean);
    const heart = isHeartAt(clean, idx);
    const we = wordEl({ word: clean, toks: a.toks.map((t, i) => i === 0 && raw.match(/^[^A-Za-z]*[A-Z]/) ? { ...t, t: t.t[0].toUpperCase() + t.t.slice(1) } : t) }, { size: 'xs', tap: false, heart });
    we.style.fontSize = 'inherit';
    const punct = raw.replace(/[A-Za-z']/g, '');
    const span = h('span', { class: 'w', onclick: () => { flash(span); heart || a.irregular ? say(clean) : soundOut(a, we.spans); } }, we, punct);
    box.append(span);
  });
  return box;
}

A.sentence = async (root, st) => {
  const grid = h('div', { class: 'choices three' });
  const { row, ready } = ask('sentence', st);
  screenBody(root, sentenceEl(st.s.text, st.idx), h('div', { class: 'slide-hint' }, 'tap a word for help'), row, grid);
  return choose(grid, st.choices.map(p => ({ el: h('button', { class: 'tile pic', style: { fontSize: '52px' } }, p), correct: p === st.s.pic })), {
    ready,
    onRight: () => say(st.s.text),
    onWrong: () => speak(WRONG.sentence(st)),
  });
};

A.yesno = async (root, st) => {
  const grid = h('div', { class: 'yn' });
  const { row, ready } = ask('yesno', st);
  screenBody(root, h('div', { class: 'story-pic', style: { fontSize: '90px' } }, st.q.pic ?? '🤔'), sentenceEl(st.q.text, st.idx), row, grid);
  return choose(grid, [
    { el: h('button', { class: 'tile' }, '👍'), correct: st.q.yes },
    { el: h('button', { class: 'tile' }, '👎'), correct: !st.q.yes },
  ], {
    ready,
    onRight: () => speak([st.q.text, st.q.yes ? LINES.yes : LINES.no]),
    onWrong: () => speak(WRONG.yesno(st)),
  });
};

A.compare = async (root, st) => {
  const lab = (s) => (s === 'k' ? 'c' : SOUND[s]?.show ?? s);
  const grid = h('div', { class: 'choices' });
  const { row, ready } = ask('compare', st);
  screenBody(root, h('div', { class: 'mascot small' }, '👂'), row, grid);
  return choose(grid, [st.a, st.b].map(s => ({ el: h('button', { class: 'tile' }, lab(s)), correct: s === st.answer })), {
    ready,
    onRight: () => speak([st.word, LINES.has, { sound: st.answer }]),
    onWrong: () => speak(WRONG.compare(st)),
  });
};

// Mentava's flying-chick idea: keep your voice on while sliding through the sounds, or the bird drops.
A.voice = async (root, st) => {
  if (!S().settings.micGame || !navigator.mediaDevices?.getUserMedia) return { scored: false };
  const sky = h('div', { class: 'sky-box' });
  const bird = h('div', { class: 'bird', style: { bottom: '40px' } }, '🐤');
  const meter = h('div', { class: 'meter' }, h('i'));
  sky.append(bird, meter);
  let mic = null, started = false, quietSince = 0, failed = false, raf;
  const { w, sl } = readingPanel(st.entry, st.idx, {
    knob: '🐤', silent: true,
    onDone: () => finish(),
  });
  const status = h('div', { class: 'prompt' }, 'Slide and say each sound. Keep your voice on!');
  const skip = h('button', { class: 'btn ghost small' }, 'Skip');
  let resolve; const done = new Promise(r => (resolve = r));
  skip.onclick = () => { cleanup(); resolve({ scored: false }); };
  screenBody(root, w, sky, sl, status, skip);
  await speak(PROMPTS.voice(st, !!st.first));
  try { mic = await micLevel(); } catch (e) { status.textContent = 'Microphone not available'; await sleep(800); cleanup(); return { scored: false }; }
  sl.addEventListener('pointerdown', () => { started = true; failed = false; quietSince = 0; bird.classList.remove('fall'); });
  const loop = () => {
    const lv = mic.read();
    meter.firstChild.style.height = Math.round(lv * 100) + '%';
    const loud = lv > 0.12;
    if (started && !failed) {
      if (loud) quietSince = 0;
      else if (!quietSince) quietSince = performance.now();
      else if (performance.now() - quietSince > 450) {
        failed = true;
        bird.classList.add('fall'); bird.style.bottom = '10px';
        sfx.bad();
        status.textContent = 'Oops! Keep your voice going. Try again!';
        started = false; sl.reset?.();
      }
      if (!failed) bird.style.bottom = (40 + lv * 100) + 'px';
    }
    raf = requestAnimationFrame(loop);
  };
  loop();
  async function finish() {
    if (failed) return;
    cancelAnimationFrame(raf);
    bird.style.left = '80%'; sfx.good(); confetti(60);
    status.textContent = 'You kept it flying! Now say it fast!';
    await speak([LINES.keptFlying, LINES.sayItFast]);
    await sleep(1200);
    await say(st.entry.word);
    cleanup();
    resolve({ scored: false, bonus: true });
  }
  function cleanup() { cancelAnimationFrame(raf); mic?.close(); releaseMic(); }
  return done;
};

A.page = async (root, st) => {
  const next = nextBtn(st.i === st.n - 1 ? 'The end! ➜' : 'Next page ➜');
  const read = h('button', { class: 'btn ghost small', onclick: () => { stopAll(); say(st.page.text); } }, '🔊 Read it to me');
  const head = h('div', { class: 'page-count' }, `${st.title} · ${st.i + 1} / ${st.n}`);
  screenBody(root, head, h('div', { class: 'story-pic' }, st.page.pic), sentenceEl(st.page.text, st.idx), h('div', { class: 'slide-hint' }, 'read it out loud · tap a word for help'), h('div', { class: 'row' }, read), next);
  if (st.i > 0) say(pick(LINES.nextPage));
  await next.done;
  return { scored: false };
};

A.quiz = async (root, st) => {
  const grid = h('div', { class: 'choices three' });
  const { row, ready } = ask('quiz', st);
  screenBody(root, h('div', { class: 'mascot small' }, '🤔'), h('div', { class: 'bubble' }, st.q.q), row, grid);
  return choose(grid, st.q.options.map((o, i) => ({ el: h('button', { class: 'tile pic' }, o), correct: i === st.q.answer })), { ready, onWrong: () => speak(WRONG.quiz(st)) });
};

A.readAloud = async (root, st) => {
  const next = nextBtn('We did it! 🎉');
  screenBody(root, h('div', { class: 'mascot' }, '📖'), h('div', { class: 'bubble' }, `Now read "${st.title}" to a grown-up!`), next);
  await say(LINES.readToGrownup);
  await next.done;
  return { scored: false };
};

// Spoken lesson opening: what we're doing today, and the new sounds we'll meet.
// Each new letter card lights up as its sound plays.
A.lessonIntro = async (root, st) => {
  const newKeys = (st.level.teach ?? []).filter(k => !NO_QUIZ.has(k));
  const parts = lessonOpening(st.level, newKeys, S().log.length > 0, st.idx > READY_LEVEL);
  const cards = newKeys.map(k => h('div', { class: 'glyph-card', style: { minWidth: '100px', padding: '4px 20px 12px' } },
    h('div', { class: 'glyph', style: { fontSize: '84px' } }, keyLabel(k).replace('_', ' _ '))));
  const next = nextBtn("Let's go! ➜");
  next.disabled = !S().levels[st.level.id]?.passed;
  screenBody(root, h('div', { class: 'mascot' }, '🐸'),
    h('div', { class: 'bubble' }, st.level.type === 'warmup' ? 'Warm-up' : st.level.title),
    cards.length ? h('div', { class: 'row', style: { justifyContent: 'center', gap: '14px' } }, cards) : null,
    promptRow(parts), next);
  let c = 0;
  const cued = parts.map(p => (p && p.sound && cards[c] ? { ...p, onStart: ((el) => () => flash(el, 1600))(cards[c++]) } : p));
  await speak(cued);
  next.disabled = false;
  await next.done;
  return { scored: false };
};

export const ACTIVITIES = A;
