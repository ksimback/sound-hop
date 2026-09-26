// Collects every phrase the app can speak, so natural-voice clips can be pre-generated.
// Sources: every string literal in js/narration.js, plus all words, sentences, questions
// and story text from the curriculum content.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { WORDS } from '../js/content/words.js';
import { SENTENCES, QUESTIONS } from '../js/content/sentences.js';
import { STORIES } from '../js/content/stories.js';
import { SOUNDS, COMPARISONS } from '../js/sounds.js';
import { LEVELS } from '../js/curriculum.js';
import { parseEntry } from '../js/phonics.js';
import { phraseKey, phraseHash } from '../js/phrasekey.js';

const words = (t) => t.split(/\s+/).map(w => w.replace(/[^A-Za-z']/g, '')).filter(Boolean);

// String literals in narration.js ('...' or "..."; the file has no templates by design).
function narrationLiterals() {
  const src = readFileSync(fileURLToPath(new URL('../js/narration.js', import.meta.url)), 'utf8')
    .split('\n').filter(l => !/^\s*(import|\/\/)/.test(l)).join('\n');
  const out = [];
  const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g;
  let m;
  while ((m = re.exec(src))) {
    const raw = m[1] ?? m[2];
    const text = raw.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\(.)/g, '$1');
    if (/case\s*$/.test(src.slice(Math.max(0, m.index - 8), m.index))) continue; // switch labels aren't spoken
    if (/[A-Za-z]{2,}/.test(text)) out.push(text);
  }
  return out;
}

export function collectPhrases() {
  const map = new Map(); // key -> { text, kind }
  const add = (text, kind) => {
    const k = phraseKey(text);
    if (k && !map.has(k)) map.set(k, { text: text.trim(), kind, hash: phraseHash(text) });
  };
  narrationLiterals().forEach(t => add(t, 'line'));
  // single words: bank, book examples, comparison pairs, heart words, and every word in any text
  WORDS.forEach(e => add(parseEntry(e).word, 'word'));
  SOUNDS.forEach(s => s.words.forEach(([w]) => add(w, 'word')));
  COMPARISONS.forEach(c => c.pairs.flat().forEach(w => add(w, 'word')));
  LEVELS.forEach(L => L.heart.forEach(w => add(w, 'word')));
  ['dogfish', 'fishdog', 'carplane', 'planecar', 'cathat', 'hatcat', 'sunflower', 'flowersun'].forEach(w => add(w, 'word'));
  const texts = [...SENTENCES.map(s => s.text), ...QUESTIONS.map(q => q.text), ...Object.values(STORIES).flatMap(s => s.pages.map(p => p.text))];
  texts.forEach(t => words(t).forEach(w => add(w, 'word')));
  // whole sentences, questions and story pages
  texts.forEach(t => add(t, 'text'));
  Object.values(STORIES).forEach(s => s.quiz.forEach(q => add(q.q, 'line')));
  return [...map.values()];
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const all = collectPhrases();
  const chars = all.reduce((a, p) => a + p.text.length, 0);
  const by = all.reduce((a, p) => ((a[p.kind] = (a[p.kind] ?? 0) + 1), a), {});
  console.log(`${all.length} phrases, ${chars} characters`, by);
  if (process.argv.includes('--lines')) all.filter(p => p.kind === 'line').forEach(p => console.log(' ', p.text));
}
