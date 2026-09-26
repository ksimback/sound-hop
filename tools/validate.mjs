// Checks that every sentence and story is readable with what the child has learned by then.
// Uses the app's own lexicon so the checks match exactly what the app does.
// Run: node tools/validate.mjs [--report]
import { LEVELS } from '../js/curriculum.js';
import { parseEntry, IRREGULAR } from '../js/phonics.js';
import { WORDS } from '../js/content/words.js';
import { SENTENCES, QUESTIONS } from '../js/content/sentences.js';
import { STORIES } from '../js/content/stories.js';
import { readableAt, wordsIn, firstLevel, wordsAt } from '../js/lexicon.js';

let errors = 0;
const err = (m) => { errors++; console.log('ERROR', m); };

const seen = new Set();
for (const e of WORDS) {
  const p = parseEntry(e);
  if (seen.has(p.word)) err(`duplicate word ${p.word}`);
  seen.add(p.word);
  if (p.toks.some(t => t.s === '?')) err(`bad token in ${e}`);
  if (IRREGULAR.has(p.word) && !e.includes('=')) err(`irregular word in bank without explicit segmentation: ${p.word}`);
}

for (const s of [...SENTENCES, ...QUESTIONS]) {
  if (firstLevel(s.text) < 0) {
    const bad = wordsIn(s.text).filter(w => !readableAt(w, LEVELS.length - 1));
    err(`sentence never readable: "${s.text}" (problem words: ${bad.join(', ')})`);
  }
}

for (const lvl of LEVELS.filter(l => l.type === 'story')) {
  const st = STORIES[lvl.story];
  if (!st) { err(`missing story ${lvl.story}`); continue; }
  const idx = lvl.id - 1;
  for (const pg of st.pages) {
    const bad = wordsIn(pg.text).filter(w => !readableAt(w, idx));
    if (bad.length) err(`story ${lvl.story} (level ${lvl.id}) page "${pg.text}" not readable: ${bad.join(', ')}`);
  }
  if (!st.quiz?.length) err(`story ${lvl.story} has no quiz`);
  for (const q of st.quiz ?? []) if (!(q.answer >= 0 && q.answer < q.options.length)) err(`bad quiz answer in ${lvl.story}`);
}

// Coverage: newly readable words at each level (exactly what the lesson builder draws from).
const report = process.argv.includes('--report');
for (let i = 0; i < LEVELS.length; i++) {
  const lvl = LEVELS[i];
  const words = wordsAt(i);
  const fresh = wordsAt(i, { freshOnly: true });
  const pics = fresh.filter(p => p.pic);
  const sents = SENTENCES.filter(s => firstLevel(s.text) === i).length;
  const qs = QUESTIONS.filter(s => firstLevel(s.text) === i).length;
  if (report) console.log(`${String(lvl.id).padStart(2)} ${lvl.type.padEnd(6)} ${lvl.title.padEnd(34)} words=${String(words.length).padStart(4)} new=${String(fresh.length).padStart(3)} newPics=${String(pics.length).padStart(2)} +sent=${sents} +q=${qs}`);
  const min = lvl.stage === 1 ? 3 : 6;
  if (lvl.type === 'new' && words.length && !lvl.teach.includes('e:ee') && fresh.length < min) err(`level ${lvl.id} "${lvl.title}" has only ${fresh.length} newly readable words`);
}

console.log(errors ? `\n${errors} error(s)` : '\nAll content valid ✔');
process.exit(errors ? 1 : 0);
