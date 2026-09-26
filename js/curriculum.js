// The level path. Mentava-style: sounds first, blending once ready, then letter teams,
// long vowels, and finally tricky words and real-book fluency. Every level is mastery-gated.
//
// type:
//   new       teach new grapheme keys (see phonics.js), then practice + mastery check
//   ready     left-to-right check (dogfish vs fishdog) + listening blending
//   heart     teach a few "heart words" (irregular words needed for sentences)
//   review    mixed cumulative practice (no new material)
//   check     cumulative "boss" check, higher bar to pass
//   story     read a decodable story, then comprehension questions
// compare: sound-comparison pairs from the book to add as a listening game.

export const STAGES = [
  { id: 1, name: 'Sound Garden', emoji: '🌱', blurb: 'Letter sounds and first words' },
  { id: 2, name: 'Team Letters', emoji: '🤝', blurb: 'sh, ch, th and blends' },
  { id: 3, name: 'Long Vowel Lagoon', emoji: '🌊', blurb: 'Magic e and vowel teams' },
  { id: 4, name: 'Book Mountain', emoji: '🏔️', blurb: 'Tricky words and real books' },
];

const L = [];
let stage = 1;
const add = (type, title, o = {}) => L.push({ id: L.length + 1, stage, type, title, teach: [], heart: [], ...o });
// Heart words come in bite-size groups of at most 5.
const hearts = (words) => {
  for (let i = 0; i < words.length; i += 5) {
    const g = words.slice(i, i + 5);
    add('heart', 'Heart Words: ' + g.slice(0, 3).join(', ') + (g.length > 3 ? '…' : ''), { heart: g });
  }
};

// ---------- Stage 1: Sound Garden ----------
add('new', 'Meet a and m', { teach: ['a:a', 'm:m'] });
add('new', 'Meet s', { teach: ['s:s'] });
add('new', 'Meet t', { teach: ['t:t'] });
add('ready', 'Left to Right');
add('new', 'Meet f', { teach: ['f:f'], firstWords: true });
add('new', 'Meet d', { teach: ['d:d'] });
add('new', 'Meet i', { teach: ['i:i'] });
add('review', 'Sound Garden Review');
add('check', 'Garden Check 1');
add('new', 'Meet n', { teach: ['n:n'] });
add('new', 'Meet o', { teach: ['o:o'] });
add('new', 'Meet p', { teach: ['p:p'], compare: ['f/p'] });
add('new', 'Meet g', { teach: ['g:g'] });
hearts(['the', 'a']);
add('new', 'Meet c and k', { teach: ['c:k', 'k:k'], compare: ['g/k'] });
add('new', 'Meet h', { teach: ['h:h'] });
add('new', 'Meet u', { teach: ['u:u'], compare: ['o/u'] });
add('check', 'Garden Check 2');
add('story', 'Story: Sam and the Cat', { story: 's1' });
add('new', 'Meet b', { teach: ['b:b'] });
add('new', 'Meet l', { teach: ['l:l'] });
add('new', 'Meet r', { teach: ['r:r'], compare: ['l/r'] });
add('new', 'Meet e', { teach: ['e:e'], compare: ['e/i', 'a/e'] });
hearts(['I', 'is', 'to']);
add('check', 'Garden Check 3');
add('story', 'Story: The Red Bug', { story: 's2' });
add('new', 'Meet w', { teach: ['w:w'] });
add('new', 'Meet j', { teach: ['j:j'] });
add('new', 'Meet v', { teach: ['v:v'], compare: ['w/v', 'b/v'] });
add('new', 'Meet y and z', { teach: ['y:y', 'z:z'], compare: ['j/y'] });
add('new', 'Meet x and qu', { teach: ['x:ks', 'qu:kw'] });
add('review', 'All the Letters Review');
add('check', 'Garden Check 4');
add('story', 'Story: Max the Fox', { story: 's3' });

// ---------- Stage 2: Team Letters ----------
stage = 2;
add('new', 'Team ck', { teach: ['ck:k'] });
add('new', 'Team sh', { teach: ['sh:sh'], compare: ['s/sh'] });
add('new', 'Team ch', { teach: ['ch:ch'], compare: ['ch/sh'] });
add('new', 'Team th', { teach: ['th:th', 'th:dh'], compare: ['s/th'] });
add('new', 'Team wh', { teach: ['wh:wh'] });
hearts(['he', 'she', 'we', 'me', 'be', 'said', 'of']);
add('check', 'Team Check 1');
add('story', 'Story: The Ship', { story: 's4' });
add('new', 'Team ng and nk', { teach: ['ng:ng', 'n:ng'] });
add('new', 'Blends: frog, stop, flag', { blends: 'start' });
add('new', 'Blends: hand, jump, nest', { blends: 'end', teach: ['s:z'] });
hearts(['you', 'was', 'has', 'his', 'as', 'are']);
add('review', 'Team Review');
add('check', 'Team Check 2');
add('story', 'Story: The Big Swim', { story: 's5' });

// ---------- Stage 3: Long Vowel Lagoon ----------
stage = 3;
add('new', 'Magic e: cake', { teach: ['a:ae', 'e:_'] });
add('new', 'Magic e: bike', { teach: ['i:ie'] });
add('new', 'Magic e: bone and cube', { teach: ['o:oe', 'u:yoo', 'u:oo'] });
add('new', 'Open vowels: go, me, hi', { teach: ['e:ee'] });
add('check', 'Lagoon Check 1');
add('story', 'Story: Jake and the Kite', { story: 's6' });
add('new', 'Team ee and ea', { teach: ['ee:ee', 'ea:ee'] });
add('new', 'Team ai and ay', { teach: ['ai:ae', 'ay:ae'] });
add('new', 'Team oa and ow (snow)', { teach: ['oa:oe', 'ow:oe'] });
add('new', 'Team igh and y', { teach: ['igh:ie', 'y:ie', 'y:ee'] });
add('check', 'Lagoon Check 2');
add('story', 'Story: The Rain Train', { story: 's7' });
add('new', 'Team oo (moon)', { teach: ['oo:oo', 'ew:oo', 'ue:oo'] });
add('new', 'Team oo (book)', { teach: ['oo:uu'] });
add('new', 'Team ow and ou (cow)', { teach: ['ow:ow', 'ou:ow'] });
add('new', 'Team oi and oy', { teach: ['oi:oi', 'oy:oi'] });
add('check', 'Lagoon Check 3');
add('story', 'Story: The Owl and the Moon', { story: 's8' });
add('new', 'Bossy r: ar', { teach: ['ar:ar'] });
add('new', 'Bossy r: or', { teach: ['or:or'] });
add('new', 'Bossy r: er, ir, ur', { teach: ['er:er', 'ir:er', 'ur:er'] });
add('new', 'Team aw, au and all', { teach: ['aw:o', 'au:o', 'a:o'] });
add('check', 'Lagoon Check 4');
add('story', 'Story: The Farm Party', { story: 's9' });

// ---------- Stage 4: Book Mountain ----------
stage = 4;
hearts(['what', 'where', 'there', 'they', 'do']);
add('new', 'Soft c and g, tch', { teach: ['c:s', 'g:j', 'tch:ch'] });
hearts(['who', 'have', 'here', 'one', 'two']);
add('new', 'Big words: apple, rabbit', { teach: ['le:l'], bigWords: true });
hearts(['some', 'come', 'love', 'give', 'live']);
add('new', 'Endings: -ing and -ed', { teach: ['ed:t', 'ed:d'], endings: true });
hearts(['your', 'could', 'would', 'should', 'want']);
add('check', 'Mountain Check 1');
add('story', 'Story: The Lost Puppy', { story: 's10' });
hearts(['put', 'pull', 'full', 'many', 'any']);
hearts(['again', 'friend', 'does', 'their', 'very']);
add('review', 'Mountain Review');
hearts(['from', 'other', 'mother', 'brother', 'water']);
hearts(['once', 'kind', 'work', 'walk', 'talk']);
add('story', 'Story: Fox Can Not Stop', { story: 's11' });
hearts(['eye', 'only', 'because', 'old', 'find']);
add('check', 'Big Reader Check');
add('story', 'Story: The Best Day', { story: 's12', final: true });

export const LEVELS = L;

// Everything known once a level is finished (keys + heart words), cumulative.
export function knownAt(levelIdx /* 0-based, inclusive */) {
  const keys = new Set(), hearts = new Set();
  for (let i = 0; i <= levelIdx && i < L.length; i++) {
    L[i].teach.forEach(k => keys.add(k));
    L[i].heart.forEach(h => hearts.add(h.toLowerCase()));
  }
  return { keys, hearts };
}

// Blending (reading words) starts after the left-to-right readiness level.
export const READY_LEVEL = L.findIndex(l => l.type === 'ready');

// Word shapes grow gradually: cvc first, then starting blends (frog), then ending blends (hand),
// and multi-syllable words only at "Big words".
const VOWEL_SOUNDS = new Set(['a', 'e', 'i', 'o', 'u', 'ae', 'ee', 'ie', 'oe', 'oo', 'uu', 'yoo', 'ow', 'oi', 'ar', 'or', 'er']);
const lvlIdx = (pred) => L.findIndex(pred);
const BLEND_START = lvlIdx(l => l.blends === 'start');
const BLEND_END = lvlIdx(l => l.blends === 'end');
const BIG_WORDS = lvlIdx(l => l.bigWords);
export function shapeOk(toks, levelIdx) {
  const v = toks.map(t => VOWEL_SOUNDS.has(t.s));
  const nv = v.filter(Boolean).length;
  if (nv > 1 && levelIdx < BIG_WORDS) return false;
  if (levelIdx >= BLEND_END) return true;
  const first = v.indexOf(true), last = v.lastIndexOf(true);
  const onset = first < 0 ? toks.length : first;
  const coda = toks.slice(last + 1).filter(t => t.s !== '_' && t.k !== 'n:ng').length;
  if (coda > 1) return false;
  return onset <= (levelIdx >= BLEND_START ? 3 : 1);
}

// Keys we don't quiz in "hear the sound, tap the letters" games.
export const NO_QUIZ = new Set(['e:_', 'e:ee', 'n:ng', 's:z', 'a:o', 'ed:t', 'ed:d', 'le:l', 'u:oo', 'c:s', 'g:j', 'y:ee']);
