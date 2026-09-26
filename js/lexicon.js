// Word lookups shared by the app: what can be read at a given level.
import { LEVELS, knownAt, READY_LEVEL, shapeOk } from './curriculum.js';
import { parseEntry, segment, decodable, IRREGULAR, knowKey } from './phonics.js';
import { WORDS } from './content/words.js';
import { SENTENCES, QUESTIONS } from './content/sentences.js';

export const BANK = new Map(WORDS.map(e => { const p = parseEntry(e); return [p.word, p]; }));

const knownCache = new Map();
export function known(idx) {
  if (!knownCache.has(idx)) knownCache.set(idx, knownAt(idx));
  return knownCache.get(idx);
}

export function wordsIn(text) {
  return text.split(/\s+/).map(w => w.replace(/[^A-Za-z']/g, '')).filter(Boolean);
}

// Token breakdown for any word; heart words come back flagged.
export function analyze(raw) {
  const w = raw.toLowerCase();
  const e = BANK.get(w);
  const toks = e ? e.toks : segment(w);
  return { word: w, toks, irregular: !e && IRREGULAR.has(w), pic: e?.pic ?? null };
}

export function readableAt(raw, idx) {
  if (idx < 0) return false;
  const w = raw.toLowerCase();
  const { keys, hearts } = known(idx);
  if (hearts.has(w)) return true;
  if (idx <= READY_LEVEL) return false;
  const a = analyze(w);
  if (a.irregular || w.includes("'")) return false;
  return decodable(a.toks, keys) && shapeOk(a.toks, idx);
}

export function isHeartAt(raw, idx) {
  const w = raw.toLowerCase();
  if (!known(idx).hearts.has(w)) return false;
  const a = analyze(w);
  // a heart word stops being "heart" once it is fully decodable
  return a.irregular || !(decodable(a.toks, known(idx).keys) && shapeOk(a.toks, idx));
}

const firstCache = new Map();
export function firstLevel(text) {
  if (firstCache.has(text)) return firstCache.get(text);
  const ws = wordsIn(text);
  let r = -1;
  for (let i = 0; i < LEVELS.length; i++) if (ws.every(w => readableAt(w, i))) { r = i; break; }
  firstCache.set(text, r);
  return r;
}

// Bank words readable at idx (optionally: newly readable at idx).
export function wordsAt(idx, { freshOnly = false, withPic = false } = {}) {
  const out = [];
  for (const e of BANK.values()) {
    if (withPic && !e.pic) continue;
    if (!readableAt(e.word, idx)) continue;
    if (freshOnly && readableAt(e.word, idx - 1)) continue;
    out.push(e);
  }
  return out;
}

export const sentencesAt = (idx) => SENTENCES.filter(s => { const f = firstLevel(s.text); return f >= 0 && f <= idx; });
export const questionsAt = (idx) => QUESTIONS.filter(s => { const f = firstLevel(s.text); return f >= 0 && f <= idx; });

export { knowKey };
