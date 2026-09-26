// Each activity renders into `root` and resolves { scored, correct } when finished.
// Wrong answers get immediate correction (show + say the right answer) — the runner re-tests later.
import { h, wordEl, slider, soundOut, shuffle, pick, sleep, flash, PRAISE, TRY, confetti } from './ui.js';
import { speak, say, playSound, playBlend, stopAll, ctxGet, micLevel, releaseMic } from './audio.js';
import { keyLabel, keySound } from './phonics.js';
import { SOUND } from './sounds.js';
import { analyze, isHeartAt } from './lexicon.js';
import { LEVELS } from './curriculum.js';
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

function promptRow(parts, token) {
  const btn = h('button', { class: 'say-btn', 'aria-label': 'Hear again', onclick: () => { stopAll(); speak(parts, token); } }, '🔊');
  return h('div', { class: 'prompt' }, btn);
}

// Generic multiple choice. tiles: [{el, correct, value}]
function choose(grid, tiles, { onRight, onWrong } = {}) {
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
          if (first && Math.random() < 0.5) await say(pick(PRAISE));
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
  const team = label.replace('_', '').length > 1;
  const card = h('div', { class: 'glyph-card', onclick: () => { stopAll(); playSound(s); flash(card); } }, h('div', { class: 'glyph' }, label.replace('_', ' _ ')));
  const words = introWords(st.key);
  const wordRow = h('div', { class: 'choices one-row', style: { width: 'min(96vw, 680px)' } }, words.map(w =>
    h('button', { class: 'tile pic', style: { fontSize: '54px', minHeight: '110px' }, onclick: () => { stopAll(); say(w.word, { rate: 0.7 }); } },
      h('div', {}, w.pic, h('div', { style: { fontSize: '22px' } }, w.word)))));
  const next = nextBtn();
  next.disabled = true;
  const parts = team
    ? [label.includes('_') ? 'Magic e makes this vowel say' : 'These letters are a team. Together they say', { sound: s }, { pause: 300 }, 'Say it with me!', { sound: s }]
    : ['This letter says', { sound: s }, { pause: 300 }, 'Say it with me!', { sound: s }];
  screenBody(root, h('div', { class: 'mascot small' }, '🐸'), card, promptRow(parts), wordRow, next);
  await speak(parts);
  for (const w of words.slice(0, 3)) { await sleep(150); await say(w.word, { rate: 0.75 }); }
  next.disabled = false;
  await next.done;
  return { scored: false };
};

A.tip = async (root, st) => {
  const next = nextBtn('OK! ➜');
  screenBody(root, h('div', { class: 'mascot small' }, '🐸'), h('div', { class: 'bubble' }, h('div', { style: { fontSize: '28px' } }, st.title), h('p', { style: { fontWeight: 600 } }, st.text)), next);
  await speak([st.title, st.text, ...(st.sound ? [{ sound: st.sound }] : [])]);
  await next.done;
  return { scored: false };
};

A.heartIntro = async (root, st) => {
  const a = analyze(st.word);
  const w = wordEl(a, { heart: true, tap: false });
  const card = h('div', { class: 'glyph-card', onclick: () => say(st.word) }, w);
  const next = nextBtn();
  const parts = ['This is a heart word. We learn it by heart.', { pause: 200 }, 'It says', st.word, { pause: 300 }, 'Say it with me:', st.word];
  screenBody(root, h('div', { style: { fontSize: '64px' } }, '❤️'), card, promptRow(parts), next);
  await speak(parts);
  await next.done;
  return { scored: false };
};

A.tapSound = async (root, st) => {
  const s = keySound(st.key);
  const parts = ['Tap', { sound: s }];
  const grid = h('div', { class: 'choices' + (st.choices.length === 3 ? ' three' : '') });
  screenBody(root, h('div', { class: 'mascot small' }, '👂'), promptRow(parts), grid);
  speak(parts);
  return choose(grid, st.choices.map(k => ({ el: h('button', { class: 'tile' }, keyLabel(k).replace('_', ' _ ')), correct: keyLabel(k) === keyLabel(st.key) })), {
    onRight: () => playSound(s),
    onWrong: () => speak([pick(TRY), 'This one says', { sound: s }]),
  });
};

A.firstSound = async (root, st) => {
  const s = keySound(st.key);
  const parts = [st.word, { pause: 150 }, 'What sound does', st.word, 'start with?'];
  const grid = h('div', { class: 'choices three' });
  screenBody(root, h('div', { class: 'story-pic', onclick: () => say(st.word) }, st.pic), promptRow(parts), grid);
  speak(parts);
  return choose(grid, st.choices.map(k => ({ el: h('button', { class: 'tile' }, keyLabel(k)), correct: keyLabel(k) === keyLabel(st.key) })), {
    onRight: () => speak([{ sound: s }, { pause: 100 }, st.word]),
    onWrong: () => speak([st.word, 'starts with', { sound: s }]),
  });
};

A.oralBlend = async (root, st) => {
  const sounds = st.entry.toks.filter(t => t.s !== '_').map(t => t.s);
  const parts = ['Listen, and put the sounds together!', { pause: 200 }, { blend: sounds }, { pause: 300 }, 'What is it?'];
  const grid = h('div', { class: 'choices three' });
  screenBody(root, h('div', { class: 'mascot small' }, '🐸'), promptRow(parts), grid);
  speak(parts);
  return choose(grid, st.choices.map(e => ({ el: h('button', { class: 'tile pic' }, e.pic), correct: e === st.entry })), {
    onRight: () => speak([{ blend: sounds }, st.entry.word]),
    onWrong: () => speak([{ blend: sounds }, { pause: 150 }, st.entry.word]),
  });
};

A.dir = async (root, st) => {
  const flip = Math.random() < 0.5;
  const target = flip ? `${st.wb} ${st.wa}` : `${st.wa} ${st.wb}`;
  const parts = ['We read left to right.', 'Which one says:', target.replace(' ', ''), '?'];
  const grid = h('div', { class: 'choices' });
  screenBody(root, h('div', { class: 'mascot small' }, '🐸➡️'), promptRow(parts), grid);
  speak(parts);
  const mk = (x, y) => h('button', { class: 'tile pic', style: { fontSize: '60px' } }, h('div', {}, x + y, h('div', { style: { fontSize: '26px', color: '#8fa0ae' } }, '➜')));
  return choose(grid, shuffle([
    { el: mk(st.a, st.b), correct: !flip },
    { el: mk(st.b, st.a), correct: flip },
  ]), { onWrong: () => speak(['Hop from left to right:', target]) });
};

function readingPanel(entry, idx, { knob = '🐸', silent = false, onDone } = {}) {
  const a = { word: entry.word, toks: entry.toks };
  const w = wordEl(a, { heart: isHeartAt(entry.word, idx) });
  const sl = slider(w, a, { knob, onDone, silent });
  return { w, sl, a };
}

A.readWord = async (root, st) => {
  const { w, sl, a } = readingPanel(st.entry, st.idx, { onDone: () => say('Now say it fast!') });
  const parts = ['Read the word. Find the picture!'];
  const grid = h('div', { class: 'choices three' });
  screenBody(root, w, sl, promptRow(parts), grid);
  speak(parts);
  return choose(grid, st.choices.map(e => ({ el: h('button', { class: 'tile pic' }, e.pic), correct: e === st.entry })), {
    onRight: () => soundOut(a, w.spans),
    onWrong: () => soundOut(a, w.spans),
  });
};

A.pickWord = async (root, st) => {
  const parts = ['Find the word:', st.entry.word];
  const grid = h('div', { class: 'choices one-row', style: { gridTemplateColumns: '1fr' } });
  const top = st.entry.pic ? h('div', { class: 'story-pic', onclick: () => say(st.entry.word) }, st.entry.pic) : h('div', { class: 'mascot small' }, '👂');
  screenBody(root, top, promptRow(parts), grid);
  speak(parts);
  return choose(grid, st.choices.map(e => {
    const we = wordEl({ word: e.word, toks: e.toks }, { size: 'sm', tap: false, heart: isHeartAt(e.word, st.idx) });
    return { el: h('button', { class: 'tile wordtile', style: { minHeight: '96px' } }, we), correct: e === st.entry };
  }), {
    onRight: () => say(st.entry.word),
    onWrong: () => speak(['This one says', st.entry.word]),
  });
};

A.heartPick = async (root, st) => {
  const parts = ['Find the word:', st.word];
  const grid = h('div', { class: 'choices one-row', style: { gridTemplateColumns: '1fr' } });
  screenBody(root, h('div', { style: { fontSize: '56px' } }, '❤️'), promptRow(parts), grid);
  speak(parts);
  return choose(grid, st.choices.map(w => {
    const we = wordEl(analyze(w), { size: 'sm', tap: false, heart: isHeartAt(w, st.idx) });
    return { el: h('button', { class: 'tile wordtile', style: { minHeight: '96px' } }, we), correct: w === st.word };
  }), { onRight: () => say(st.word), onWrong: () => speak(['This one says', st.word]) });
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
  const parts = ['Read the sentence. Which picture matches?'];
  const grid = h('div', { class: 'choices three' });
  screenBody(root, sentenceEl(st.s.text, st.idx), h('div', { class: 'slide-hint' }, 'tap a word for help'), promptRow(parts), grid);
  speak(parts);
  return choose(grid, st.choices.map(p => ({ el: h('button', { class: 'tile pic', style: { fontSize: '52px' } }, p), correct: p === st.s.pic })), {
    onRight: () => say(st.s.text),
    onWrong: () => say(st.s.text),
  });
};

A.yesno = async (root, st) => {
  const parts = ['Read it. Yes or no?'];
  const grid = h('div', { class: 'yn' });
  screenBody(root, h('div', { class: 'story-pic', style: { fontSize: '90px' } }, st.q.pic ?? '🤔'), sentenceEl(st.q.text, st.idx), promptRow(parts), grid);
  speak(parts);
  return choose(grid, [
    { el: h('button', { class: 'tile' }, '👍'), correct: st.q.yes },
    { el: h('button', { class: 'tile' }, '👎'), correct: !st.q.yes },
  ], {
    onRight: () => speak([st.q.text, st.q.yes ? 'Yes!' : 'No way!']),
    onWrong: () => speak([st.q.text, st.q.yes ? 'Yes, it can!' : 'No!']),
  });
};

A.compare = async (root, st) => {
  const lab = (s) => (s === 'k' ? 'c' : SOUND[s]?.show ?? s);
  const parts = ['Listen:', st.word, { pause: 250 }, 'Do you hear', { sound: st.a }, 'or', { sound: st.b }, '?'];
  const grid = h('div', { class: 'choices' });
  screenBody(root, h('div', { class: 'mascot small' }, '👂'), promptRow(parts), grid);
  speak(parts);
  return choose(grid, [st.a, st.b].map(s => ({ el: h('button', { class: 'tile' }, lab(s)), correct: s === st.answer })), {
    onRight: () => speak([st.word, 'has', { sound: st.answer }]),
    onWrong: () => speak([st.word, { pause: 150 }, 'has', { sound: st.answer }, { pause: 200 }, 'Listen:', st.pair[0], st.pair[1]]),
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
  await speak(['Slide and say each sound.', 'Keep your voice on, so the bird keeps flying!']);
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
    await speak(['You kept it flying!', 'Now say it fast!']);
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
  if (st.i === 0) say('Read the story out loud!');
  await next.done;
  return { scored: false };
};

A.quiz = async (root, st) => {
  const parts = [st.q.q];
  const grid = h('div', { class: 'choices three' });
  screenBody(root, h('div', { class: 'mascot small' }, '🤔'), h('div', { class: 'bubble' }, st.q.q), promptRow(parts), grid);
  speak(parts);
  return choose(grid, st.q.options.map((o, i) => ({ el: h('button', { class: 'tile pic' }, o), correct: i === st.q.answer })));
};

A.readAloud = async (root, st) => {
  const next = nextBtn('We did it! 🎉');
  screenBody(root, h('div', { class: 'mascot' }, '📖'), h('div', { class: 'bubble' }, `Now read "${st.title}" to a grown-up!`), next);
  await say(`Now go find a grown-up, and read ${st.title} to them!`);
  await next.done;
  return { scored: false };
};

export const ACTIVITIES = A;
