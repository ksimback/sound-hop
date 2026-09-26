// Builds the activity sequence for a level. Mentava/DI principles applied here:
//  - small steps: 1–3 new things per level, then immediate practice
//  - interleaving: every level mixes in earlier sounds/words (cumulative review)
//  - mastery gating: pass threshold per level type
import { LEVELS, READY_LEVEL, NO_QUIZ } from './curriculum.js';
import { SOUND, SOUNDS, COMPARISONS } from './sounds.js';
import { segment, keyLabel, keySound, knowKey } from './phonics.js';
import { known, wordsAt, sentencesAt, questionsAt, analyze, BANK, firstLevel } from './lexicon.js';
import { box, dueItems, item } from './store.js';
import { shuffle, pick } from './ui.js';
import { STORIES } from './content/stories.js';

export const PASS = { new: 0.8, heart: 0.8, review: 0.8, check: 0.85, story: 0.66, ready: 0.7, warmup: 0 };

const quizKeys = (idx) => [...known(idx).keys].filter(k => !NO_QUIZ.has(k));

// Up to n distinct-label distractor keys for a target key.
function keyChoices(target, idx, n) {
  const label = keyLabel(target), snd = keySound(target);
  // never offer a second spelling of the same sound (c/k, ee/ea) — it would also be "right"
  const pool = shuffle(quizKeys(idx).filter(k => keyLabel(k) !== label && keySound(k) !== snd));
  // prefer the most recently taught / least mastered as distractors
  pool.sort((a, b) => box('k:' + a) - box('k:' + b));
  const seen = new Set([label]);
  const out = [target];
  for (const k of pool) { if (out.length >= n) break; const l = keyLabel(k); if (!seen.has(l)) { seen.add(l); out.push(k); } }
  return shuffle(out);
}

const tapSound = (key, idx) => ({ type: 'tapSound', key, choices: keyChoices(key, idx, idx < 3 ? 3 : 4), item: 'k:' + key });

// Pictures (from the book examples + word bank) that start with a sound.
function startsWith(soundId, key) {
  const out = [];
  const first = (toks) => toks[0] && toks[0].s === soundId && knowKey(toks[0].k) === key;
  for (const [w, pic] of SOUND[soundId]?.words ?? []) if (first(segment(w))) out.push({ word: w, pic });
  for (const e of BANK.values()) if (e.pic && first(e.toks) && !out.some(o => o.word === e.word)) out.push({ word: e.word, pic: e.pic });
  return out;
}
function firstSound(key, idx) {
  const s = keySound(key);
  if (SOUND[s]?.kind === 'vowel' && !'aeiou'.includes(s)) return null;
  const opts = startsWith(s, key);
  if (!opts.length || key.split(':')[0].length > 2) return null;
  const w = pick(opts.slice(0, 8));
  return { type: 'firstSound', key, word: w.word, pic: w.pic, choices: keyChoices(key, idx, 3), item: 'k:' + key };
}

// Distractors that look alike force reading every letter (cat / cap / cot).
function similar(target, pool, n, key = 'word') {
  const t = target.toks.map(x => x.t);
  const score = (e) => {
    const o = e.toks.map(x => x.t);
    let s = 0;
    for (let i = 0; i < Math.min(t.length, o.length); i++) if (t[i] === o[i]) s += 2;
    if (t.length === o.length) s += 1;
    return s + Math.random() * 1.5;
  };
  return shuffle(pool.filter(e => e[key] !== target[key] && e.word !== target.word))
    .map(e => [score(e), e]).sort((a, b) => b[0] - a[0]).slice(0, n).map(x => x[1]);
}

function readWord(e, idx) {
  const pool = wordsAt(idx, { withPic: true }).filter(x => x.pic !== e.pic);
  const ds = similar(e, pool, 2, 'pic');
  if (ds.length < 2) return null;
  return { type: 'readWord', entry: e, choices: shuffle([e, ...ds]), item: 'w:' + e.word };
}
function pickWord(e, idx) {
  const ds = similar(e, wordsAt(idx), 2);
  if (ds.length < 2) return null;
  return { type: 'pickWord', entry: e, choices: shuffle([e, ...ds]), item: 'w:' + e.word };
}
function oralBlend(idx) {
  const pool = [...BANK.values()].filter(e => e.pic && e.toks.length === 3 && e.toks.every(t => t.s !== '_' && !['a:ae', 'e:ee'].includes(t.k)) && segment(e.word).length === 3);
  const simple = pool.filter(e => e.toks.every(t => t.t.length === 1));
  const e = pick(simple.length ? simple : pool);
  if (!e) return null;
  const ds = similar(e, simple.filter(x => x.pic !== e.pic), 2, 'pic');
  return { type: 'oralBlend', entry: e, choices: shuffle([e, ...ds]) };
}
function sentenceStep(idx, preferNew) {
  const all = sentencesAt(idx);
  if (all.length < 3) return null;
  const fresh = all.filter(s => firstLevel(s.text) === idx);
  const s = pick(preferNew && fresh.length ? fresh : all);
  const ds = shuffle(all.filter(x => x.pic !== s.pic)).slice(0, 2);
  if (ds.length < 2) return null;
  return { type: 'sentence', s, choices: shuffle([s.pic, ...ds.map(d => d.pic)]) };
}
function yesNo(idx, preferNew) {
  const all = questionsAt(idx);
  if (!all.length) return null;
  const fresh = all.filter(s => firstLevel(s.text) === idx);
  return { type: 'yesno', q: pick(preferNew && fresh.length ? fresh : all) };
}
function compare(tag) {
  const [a, b] = tag.split('/');
  const c = COMPARISONS.find(x => x.a === a && x.b === b);
  if (!c) return null;
  const pair = pick(c.pairs);
  const which = Math.random() < 0.5 ? 0 : 1;
  return { type: 'compare', a, b, word: pair[which], answer: which ? b : a, pair };
}
function heartPick(word, idx) {
  const others = shuffle([...known(idx).hearts].filter(h => h !== word)).slice(0, 1);
  const w2 = shuffle(wordsAt(idx)).slice(0, 2 - others.length).map(e => e.word);
  const choices = shuffle([word, ...others, ...w2]);
  if (choices.length < 3) choices.push(...shuffle(['am', 'at', 'it']).filter(x => !choices.includes(x)).slice(0, 3 - choices.length));
  return { type: 'heartPick', word, choices, item: 'h:' + word };
}
const voice = (e) => ({ type: 'voice', entry: e });

// Least-mastered previously learned words (for review).
function reviewWords(idx, n, withPic) {
  const pool = wordsAt(idx - 1, { withPic }).filter(e => e.toks.length > 1);
  return pool.sort((a, b) => (box('w:' + a.word) - box('w:' + b.word)) || Math.random() - 0.5).slice(0, n);
}
function reviewKeys(idx, n) {
  return quizKeys(idx - 1).sort((a, b) => box('k:' + a) - box('k:' + b) || Math.random() - .5).slice(0, n);
}

const compact = (a) => a.filter(Boolean);

export function buildLevel(idx) {
  const L = LEVELS[idx];
  const canRead = idx > READY_LEVEL;
  const intro = [], practice = [];

  if (L.type === 'new') {
    const newKeys = L.teach.filter(k => !NO_QUIZ.has(k));
    L.teach.forEach(k => { if (!['e:_', 's:z', 'n:ng', 'ed:d', 'e:ee'].includes(k)) intro.push({ type: 'intro', key: k, idx }); });
    if (L.teach.includes('e:ee')) intro.push({ type: 'tip', title: 'Open vowels', text: 'When a vowel is at the end of a short word, it says its name: he, me, we, go, no, hi!' });
    if (L.teach.includes('n:ng')) intro.push({ type: 'tip', title: 'n before k', text: 'Before k, n says ng: sink, bank, pink.', sound: 'ng' });
    if (L.teach.includes('s:z')) intro.push({ type: 'tip', title: 's can say z', text: 'At the end of some words, s buzzes like z: dogs, beds, pins.', sound: 'z' });
    if (L.blends) intro.push({ type: 'tip', title: L.blends === 'start' ? 'Two letters in a row' : 'Two letters at the end', text: 'Say every sound, and keep your voice going: fff-rrr-ooo-g, frog!' });
    newKeys.forEach(k => practice.push(tapSound(k, idx), tapSound(k, idx)));
    if (newKeys.length === 1) practice.push(tapSound(newKeys[0], idx));
    reviewKeys(idx, canRead ? 2 : 3).forEach(k => practice.push(tapSound(k, idx)));
    newKeys.forEach(k => practice.push(firstSound(k, idx)));
    if (!canRead) {
      if (idx > 0) practice.push(oralBlend(idx), oralBlend(idx));
    } else {
      const fresh = shuffle(wordsAt(idx, { freshOnly: true }));
      const freshPics = fresh.filter(e => e.pic);
      freshPics.slice(0, 4).forEach(e => practice.push(readWord(e, idx)));
      shuffle(fresh).slice(0, 3).forEach(e => practice.push(pickWord(e, idx)));
      reviewWords(idx, 2, true).forEach(e => practice.push(readWord(e, idx)));
      const v = freshPics[0] ?? fresh[0];
      if (v) practice.push(voice(v));
      practice.push(sentenceStep(idx, true), yesNo(idx, true));
    }
    (L.compare ?? []).forEach(c => practice.push(compare(c), compare(c)));
  }

  if (L.type === 'ready') {
    [['🐶', '🐟', 'dog', 'fish'], ['🚗', '✈️', 'car', 'plane'], ['🐱', '🎩', 'cat', 'hat'], ['☀️', '🌸', 'sun', 'flower']].forEach(([a, b, wa, wb]) => practice.push({ type: 'dir', a, b, wa, wb }));
    for (let i = 0; i < 4; i++) practice.push(oralBlend(idx));
    reviewKeys(idx, 3).forEach(k => practice.push(tapSound(k, idx)));
  }

  if (L.type === 'heart') {
    L.heart.forEach(w => intro.push({ type: 'heartIntro', word: w, idx }));
    L.heart.forEach(w => practice.push(heartPick(w, idx), heartPick(w, idx)));
    practice.push(sentenceStep(idx, true), sentenceStep(idx, true), yesNo(idx, true));
  }

  if (L.type === 'review' || L.type === 'check') {
    const big = L.type === 'check';
    reviewKeys(idx + 1, big ? 5 : 4).forEach(k => practice.push(tapSound(k, idx)));
    if (canRead) {
      reviewWords(idx + 1, 4, true).forEach(e => practice.push(readWord(e, idx)));
      reviewWords(idx + 1, 3, false).forEach(e => practice.push(pickWord(e, idx)));
      [...known(idx).hearts].slice(-2).forEach(w => practice.push(heartPick(w, idx)));
      practice.push(sentenceStep(idx), yesNo(idx), big ? sentenceStep(idx) : null);
      const prevCompares = LEVELS.slice(0, idx).flatMap(l => l.compare ?? []);
      if (prevCompares.length) practice.push(compare(pick(prevCompares)));
    } else {
      practice.push(oralBlend(idx), oralBlend(idx));
    }
  }

  if (L.type === 'story') {
    const st = STORIES[L.story];
    st.pages.forEach((p, i) => intro.push({ type: 'page', page: p, i, n: st.pages.length, title: st.title, idx }));
    st.quiz.forEach(q => practice.push({ type: 'quiz', q }));
    practice.push({ type: 'readAloud', title: st.title });
    return { level: L, steps: compact([{ type: 'lessonIntro', level: L }, ...intro, ...practice]), pass: PASS.story };
  }

  // Keep early sound-only levels short; interleave practice.
  let steps = compact(practice);
  if (L.type !== 'ready') steps = interleave(steps);
  return { level: L, steps: [{ type: 'lessonIntro', level: L }, ...compact(intro), ...steps], pass: PASS[L.type] };
}

// Spread items so the same kind doesn't repeat back to back; end on reading.
function interleave(steps) {
  const groups = {};
  steps.forEach(s => (groups[s.type] ??= []).push(s));
  const order = ['tapSound', 'firstSound', 'heartPick', 'readWord', 'compare', 'pickWord', 'oralBlend', 'voice', 'sentence', 'yesno'];
  const out = [];
  let added = true;
  while (added) {
    added = false;
    for (const t of order) if (groups[t]?.length) { out.push(groups[t].shift()); added = true; }
  }
  return out;
}

// Session warm-up: spaced-repetition items that are due. "Remember these?"
export function buildWarmup(idx) {
  const steps = [];
  const keys = dueItems('k:', 3).map(id => id.slice(2)).filter(k => known(idx).keys.has(k) && !NO_QUIZ.has(k));
  keys.forEach(k => steps.push(tapSound(k, idx)));
  if (idx > READY_LEVEL) {
    dueItems('w:', 3).map(id => BANK.get(id.slice(2))).filter(Boolean).forEach(e => steps.push(e.pic ? readWord(e, idx) : pickWord(e, idx)));
    dueItems('h:', 2).map(id => id.slice(2)).filter(w => known(idx).hearts.has(w)).forEach(w => steps.push(heartPick(w, idx)));
  }
  const out = compact(steps).slice(0, 6);
  return out.length ? [{ type: 'lessonIntro', level: { type: 'warmup', title: 'Warm-up', teach: [] } }, ...out] : [];
}

export function introWords(key) {
  // example words for a newly introduced grapheme
  const s = keySound(key), t = key.split(':')[0];
  const book = (SOUND[s]?.words ?? []).filter(([w]) => segment(w).some(x => knowKey(x.k) === key || (t.length === 1 && x.s === s && x.t === t))).map(([w, pic]) => ({ word: w, pic }));
  const bank = [...BANK.values()].filter(e => e.pic && e.toks.some(x => knowKey(x.k) === key)).map(e => ({ word: e.word, pic: e.pic }));
  const out = [];
  for (const w of [...book, ...bank]) if (!out.some(o => o.pic === w.pic || o.word === w.word)) out.push(w);
  return out.slice(0, 4);
}

export { SOUNDS };
