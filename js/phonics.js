// Splits written words into grapheme tokens: { t: 'sh', s: 'sh' } (s = sound id, '_' = silent).
// Each token has a key 't:s' (e.g. 'a:ae', 'ck:k', 'e:_') — the unit of phonics knowledge
// the curriculum teaches and the validator checks.

const SINGLE = { a: 'a', b: 'b', c: 'k', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', i: 'i', j: 'j', k: 'k', l: 'l', m: 'm', n: 'n', o: 'o', p: 'p', q: 'k', r: 'r', s: 's', t: 't', u: 'u', v: 'v', w: 'w', x: 'ks', y: 'y', z: 'z' };

// Multi-letter graphemes, longest first.
const MULTI = [
  ['tch', 'ch'], ['igh', 'ie'],
  ['qu', 'kw'], ['ck', 'k'], ['sh', 'sh'], ['ch', 'ch'], ['th', 'th'], ['wh', 'wh'], ['ng', 'ng'],
  ['ee', 'ee'], ['ea', 'ee'], ['ai', 'ae'], ['ay', 'ae'], ['oa', 'oe'], ['ow', 'ow'], ['ou', 'ow'],
  ['oi', 'oi'], ['oy', 'oi'], ['oo', 'oo'], ['ew', 'oo'], ['ue', 'oo'],
  ['ar', 'ar'], ['or', 'or'], ['er', 'er'], ['ir', 'er'], ['ur', 'er'], ['aw', 'o'], ['au', 'o'],
];

const VOICED_TH = new Set(['the', 'this', 'that', 'then', 'them', 'than', 'these', 'those', 'they', 'there', 'their', 'with', 'mother', 'father', 'brother', 'other', 'feather', 'thus', 'though', 'bathe', 'smooth']);
const OW_LONG = new Set(['snow', 'low', 'grow', 'show', 'slow', 'blow', 'row', 'tow', 'mow', 'crow', 'glow', 'own', 'bowl', 'yellow', 'window', 'pillow', 'elbow', 'flow', 'throw', 'grown', 'shown', 'blown', 'snowman', 'rainbow', 'bow']);
const OO_SHORT = new Set(['book', 'look', 'cook', 'took', 'hook', 'good', 'wood', 'hood', 'foot', 'wool', 'stood', 'shook', 'brook', 'books', 'looks', 'cooks', 'hooks', 'woods', 'nook']);
const VOWELS = 'aeiou';
const VOICED_END = new Set(['b', 'd', 'g', 'l', 'm', 'n', 'r', 'v', 'ng', 'z']);
const S_NOT_Z = new Set(['yes', 'bus', 'us', 'gas', 'plus', 'this', 'thus', 'pus', 'bonus']);

const SPLIT_LONG = { a: 'ae', e: 'ee', i: 'ie', o: 'oe' };
const U_OO_AFTER = new Set(['r', 'l', 'j', 'ch', 's', 'sh']);

export function tok(t, s) { return { t, s, k: `${t}:${s}` }; }

// Parse an explicit segmentation like "b.oo:uu.k" or "c.a:ae.k.e:_".
export function parseSeg(spec) {
  return spec.split('.').map(p => {
    const [t, s] = p.split(':');
    return tok(t, s ?? defaultSound(t));
  });
}

function defaultSound(t) {
  const m = MULTI.find(([g]) => g === t);
  if (m) return m[1];
  if (t === 'le') return 'l';
  if (t.length === 2 && t[0] === t[1] && SINGLE[t[0]]) return SINGLE[t[0]];
  return SINGLE[t] ?? '?';
}

export function segment(word) {
  const w = word.toLowerCase();
  const toks = [];
  let i = 0;
  while (i < w.length) {
    const rest = w.slice(i);
    // "all" family: ball, tall, small
    if (rest.startsWith('all') && i + 3 === w.length) { toks.push(tok('a', 'o'), tok('ll', 'l')); break; }
    // final "le" after a consonant: apple, little
    if (rest === 'le' && i > 0 && !VOWELS.includes(w[i - 1])) { toks.push(tok('le', 'l')); break; }
    const m = MULTI.find(([g]) => rest.startsWith(g));
    if (m) {
      let [g, s] = m;
      // "er/ar/or/ir/ur" only when not followed by a vowel+... keep simple: always r-controlled.
      // "ue" split-e case (glue) is fine as oo; "ee" etc fine.
      toks.push(tok(g, s));
      i += g.length;
      continue;
    }
    const c = w[i];
    // doubled consonant: ss, ll, ff, zz, tt...
    if (w[i + 1] === c && !VOWELS.includes(c)) { toks.push(tok(c + c, SINGLE[c])); i += 2; continue; }
    // n before k/c says ng: sink, bank
    if (c === 'n' && (w[i + 1] === 'k')) { toks.push(tok('n', 'ng')); i++; continue; }
    toks.push(tok(c, SINGLE[c]));
    i++;
  }
  applyRules(w, toks);
  return toks;
}

function applyRules(w, toks) {
  const vowelToks = toks.filter(t => ['a', 'e', 'i', 'o', 'u'].includes(t.t) || t.t.length > 1 && /[aeiou]/.test(t.t) && !['qu'].includes(t.t));
  const n = toks.length;
  // split-e: V C e at end (cake, bike, bone, cube)
  if (n >= 3 && toks[n - 1].t === 'e' && toks[n - 2].t.length <= 2 && !/[aeiouwy]/.test(toks[n - 2].t) && ['a', 'i', 'o', 'u', 'e'].includes(toks[n - 3].t)) {
    const v = toks[n - 3];
    if (v.t === 'u') {
      const prev = toks[n - 4]?.t;
      Object.assign(v, tok('u', prev && U_OO_AFTER.has(prev) ? 'oo' : 'yoo'));
    } else Object.assign(v, tok(v.t, SPLIT_LONG[v.t]));
    Object.assign(toks[n - 1], tok('e', '_'));
    // soft c / g before the silent e: face, cage
    const cons = toks[n - 2];
    if (cons.t === 'c') Object.assign(cons, tok('c', 's'));
    if (cons.t === 'g') Object.assign(cons, tok('g', 'j'));
  }
  // open syllable: he, me, we, she, go, no, so, hi
  if (vowelToks.length === 1) {
    const last = toks[n - 1];
    if (last.t === 'e' && n > 1) Object.assign(last, tok('e', 'ee'));
    if (last.t === 'o' && n > 1) Object.assign(last, tok('o', 'oe'));
    if (last.t === 'i' && n > 1) Object.assign(last, tok('i', 'ie'));
  }
  // y: start = consonant; end of one-vowel word = ie (my); end of longer word = ee (happy)
  const last = toks[n - 1];
  if (last.t === 'y' && n > 1) Object.assign(last, tok('y', vowelToks.length === 0 ? 'ie' : 'ee'));
  // soft c before i/e/y (mice, city) — only mid-word, not split-e handled above
  toks.forEach((t, j) => {
    const nx = toks[j + 1];
    if (t.t === 'c' && t.s === 'k' && nx && /^[eiy]/.test(nx.t) && nx.s !== '_') Object.assign(t, tok('c', 's'));
  });
  // voiced th
  if (VOICED_TH.has(w)) toks.forEach(t => { if (t.t === 'th') Object.assign(t, tok('th', 'dh')); });
  // ow as in snow
  if (OW_LONG.has(w)) toks.forEach(t => { if (t.t === 'ow') Object.assign(t, tok('ow', 'oe')); });
  // short oo as in book
  if (OO_SHORT.has(w)) toks.forEach(t => { if (t.t === 'oo') Object.assign(t, tok('oo', 'uu')); });
  // final s after a voiced consonant says z: dogs, beds
  if (n > 1 && last.t === 's' && !S_NOT_Z.has(w) && VOICED_END.has(toks[n - 2].s)) Object.assign(last, tok('s', 'z'));
}

// Words the segmenter would read wrongly. They are only usable as heart words.
export const IRREGULAR = new Set(('a the i is as has his was of to do you said are have give live love come some done one gone none ' +
  'were where there here what who whose put push pull full bull want water very many any again friend does their they your ' +
  'could would should eye only other mother brother from into onto two walk talk work word world door floor poor move lose ' +
  'once both most post old cold gold told hold bold fold find kind mind wild child be he she we me because son won front month ' +
  'watch wash want wasp swan what pretty busy people sure sugar laugh buy ocean head bread dead ready great break steak weather ' +
  'says goes does shoe shoes eyes ear bear pear wear heart early learn earth hour our flour sour four your pour touch young country ' +
  'blue true glue too zoo two boot moon').split(' ').filter(w => !['blue', 'true', 'glue', 'too', 'zoo', 'boot', 'moon', 'be', 'he', 'she', 'we', 'me'].includes(w)));

// Doubled letters count as the single letter for "has he learned this?".
export function knowKey(k) {
  const [t, s] = k.split(':');
  if (t.length === 2 && t[0] === t[1] && !VOWELS.includes(t[0])) return `${t[0]}:${s}`;
  return k;
}

// Word entry from the word bank: "cat|🐱" or "book=b.oo:uu.k|📖"
export function parseEntry(e) {
  const [left, pic] = e.split('|');
  const [word, seg] = left.split('=');
  return { word, pic: pic || null, toks: seg ? parseSeg(seg) : segment(word) };
}

export function decodable(toks, known) {
  return toks.every(t => known.has(knowKey(t.k)));
}

// Human label for a key in sound games: 'a:ae' -> 'a_e'.
const SPLIT_LABEL = { 'a:ae': 'a_e', 'i:ie': 'i_e', 'o:oe': 'o_e', 'u:yoo': 'u_e', 'u:oo': 'u_e', 'e:ee': 'e_e' };
export function keyLabel(k) { return SPLIT_LABEL[k] ?? k.split(':')[0]; }
export function keySound(k) { return k.split(':')[1]; }
