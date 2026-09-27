// Generates candidate recordings of the 44 isolated letter sounds with OpenAI TTS, ranks them
// with an audio model, and writes audio/s/<id>-<n>.mp3 plus audio/s/manifest.json
// ({ id: [best, second, third] }). Parents pick the final one (or their own) in the app.
// Usage: node tools/gen-sounds.mjs [--only m,s,t] [--rank-only]
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = root + 'audio/s/';
mkdirSync(outDir, { recursive: true });
const env = Object.fromEntries(readFileSync(root + '.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const KEY = env.OPENAI_API_KEY;
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const ONLY = arg('--only')?.split(',');

// id: [kind, IPA, example word, [three input variants]]
// kind: cont = hold ~1s; stop = short and crisp; vowel = hold ~1s.
const SPEC = {
  a: ['vowel', 'æ', 'apple', ['aaa', 'aa', 'a']],
  e: ['vowel', 'ɛ', 'egg', ['ehhh', 'eh', 'e']],
  i: ['vowel', 'ɪ', 'it (the short i, NOT ee)', ['ɪ', 'ih.', 'ihh.']],
  o: ['vowel', 'ɑ', 'octopus', ['ahhh', 'ah', 'o']],
  u: ['vowel', 'ʌ', 'up', ['uhhh', 'uh', 'u']],
  b: ['stop', 'b', 'bat', ['b', 'bh', 'b.']],
  k: ['stop', 'k', 'cat', ['k', 'kh', 'k.']],
  d: ['stop', 'd', 'dog', ['d', 'dh', 'd.']],
  f: ['cont', 'f', 'fish', ['fff', 'ffff', 'f']],
  g: ['stop', 'g', 'goat', ['g', 'gh', 'g.']],
  h: ['cont', 'h', 'hat', ['hhh', 'hh', 'h']],
  j: ['stop', 'dʒ', 'jam', ['dj', 'jh', 'dzh']],
  l: ['cont', 'l', 'lion', ['lll', 'llll', 'l']],
  m: ['cont', 'm', 'moon', ['mmmmmm', 'mmmmmmmm', 'mm']],
  n: ['cont', 'n', 'nose', ['nnn', 'nnnn', 'n']],
  p: ['stop', 'p', 'pig', ['p', 'ph', 'p.']],
  kw: ['stop', 'kw', 'queen', ['kw-', 'qw', 'kwh-']],
  r: ['cont', 'ɹ', 'rabbit', ['rrr', 'rrrr', 'r']],
  s: ['cont', 's', 'sun', ['sss', 'ssss', 's']],
  t: ['stop', 't', 'top', ['t', 'th', 't.']],
  v: ['cont', 'v', 'van', ['vvv', 'vvvv', 'v']],
  w: ['cont', 'w', 'water', ['wooo', 'w-', 'wu']],
  ks: ['stop', 'ks', 'box (the ending sound)', ['ks', 'x', 'kss']],
  y: ['cont', 'j', 'yellow (say it like "yee")', ['yee', 'yi', 'y-']],
  z: ['cont', 'z', 'zebra', ['zzz', 'zzzz', 'z']],
  sh: ['cont', 'ʃ', 'ship', ['shhh', 'sh', 'shh']],
  ch: ['stop', 'tʃ', 'chip', ['ch', 'tch', 'ch.']],
  th: ['cont', 'θ', 'thin (unvoiced)', ['thhh', 'th', 'thh']],
  dh: ['cont', 'ð', 'this (voiced, buzzing)', ['thhh', 'th', 'dh']],
  wh: ['cont', 'w', 'whale', ['www', 'wh', 'hw']],
  ng: ['cont', 'ŋ', 'the end of sing', ['ng', 'nng', 'nnng']],
  zh: ['cont', 'ʒ', 'the middle of treasure', ['zhh', 'zh', 'zhhh']],
  ae: ['vowel', 'eɪ', 'cake', ['ay', 'aaay', 'a']],
  ee: ['vowel', 'i', 'bee', ['ee', 'eee', 'e']],
  ie: ['vowel', 'aɪ', 'kite (like the word eye)', ['eye', 'i', 'aye']],
  oe: ['vowel', 'oʊ', 'go', ['oh', 'ohh', 'o']],
  oo: ['vowel', 'u', 'moon', ['oo', 'ooo', 'ooh']],
  uu: ['vowel', 'ʊ', 'book', ['uu', 'oo', 'u']],
  yoo: ['vowel', 'ju', 'cube (like the word you)', ['you', 'yoo', 'u']],
  ow: ['vowel', 'aʊ', 'cow', ['ow', 'oww', 'ou']],
  oi: ['vowel', 'ɔɪ', 'boy', ['oy', 'oi', 'oyy']],
  ar: ['vowel', 'ɑɹ', 'car', ['ar', 'arr', 'are']],
  or: ['vowel', 'ɔɹ', 'corn', ['or', 'orr', 'ore']],
  er: ['vowel', 'ɝ', 'her', ['er', 'err', 'ur']],
};

function instructions(id) {
  const [kind, ipa, ex] = SPEC[id];
  const base = `You are a phonics teacher demonstrating ONE isolated speech sound for a young child: the sound /${ipa}/ as in "${ex}". Produce only that single sound. Never say a word, never say the letter's name, and never add a vowel before or after it.`;
  if (kind === 'stop') return base + ` It is a short stop sound: make it quick and crisp, like a tiny puff, with absolutely no "uh" after it (say "${ex[0]}-", not "${ex[0]}uh").`;
  if (kind === 'cont') return base + ' It is a continuous sound: hold it steadily for about one second, then stop. No "uh" at the end.';
  return base + ' It is a vowel sound: say it clearly and hold it for about one second. Say it exactly as it sounds in the example word.';
}

async function post(url, body, json = true) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) return json ? res.json() : Buffer.from(await res.arrayBuffer());
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 1500 * attempt)); continue; }
    throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error('gave up');
}

const dur = (f) => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout);

async function generate(id, n) {
  const [kind, , , inputs] = SPEC[id];
  const raw = outDir + `${id}-${n}.raw.mp3`, out = outDir + `${id}-${n}.mp3`;
  writeFileSync(raw, await post('https://api.openai.com/v1/audio/speech', { model: 'gpt-4o-mini-tts', voice: 'coral', input: inputs[n], instructions: instructions(id), response_format: 'mp3' }, false));
  // Tight trim (keep 20 ms so quiet sounds like h, f, th keep their start), cap the length, fade out.
  const max = kind === 'stop' ? 0.45 : 1.3;
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02';
  const af = `${trim},areverse,${trim},areverse,atrim=0:${max},afade=t=out:st=${max - 0.08}:d=0.08`;
  let r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ac', '1', '-b:a', '64k', out]);
  if (r.status !== 0 || !(dur(out) > 0.04)) r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af', `atrim=0:${max}`, '-ac', '1', '-b:a', '64k', out]);
  unlinkSync(raw);
  if (r.status !== 0) throw new Error('ffmpeg failed');
}

// Audio model scores how clean an isolated phoneme each candidate is (1-5).
async function score(id, n) {
  const [kind, ipa, ex] = SPEC[id];
  const audio = readFileSync(outDir + `${id}-${n}.mp3`).toString('base64');
  const rules = kind === 'stop' ? 'It must be short and crisp with NO vowel after it (no "uh"), and must not be the letter name.' : 'It must be just that one sound, not a word and not the letter name.';
  const r = await post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-audio-1.5', modalities: ['text'],
    messages: [{ role: 'user', content: [
      { type: 'text', text: `A phonics app needs a recording of the isolated speech sound /${ipa}/ as in "${ex}". ${rules} Listen and rate how good this recording is for teaching that sound, from 1 (wrong sound, a word, a letter name, or an added vowel) to 5 (a clean, correct isolated sound). Reply with JSON only: {"score": 1-5, "heard": "<short description>"}` },
      { type: 'input_audio', input_audio: { data: audio, format: 'mp3' } },
    ] }],
  });
  const txt = r.choices[0].message.content;
  try { return JSON.parse(txt.replace(/^```(json)?|```$/g, '').trim()); } catch { return { score: +(txt.match(/"score"\s*:\s*(\d)/)?.[1] ?? 1), heard: txt.slice(0, 60) }; }
}

const ids = Object.keys(SPEC).filter(id => !ONLY || ONLY.includes(id));
const manifestPath = outDir + 'manifest.json';
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const report = [];
const queue = [...ids];
async function worker() {
  while (queue.length) {
    const id = queue.shift();
    try {
      if (!process.argv.includes('--rank-only')) for (let n = 0; n < 3; n++) await generate(id, n);
      const scored = [];
      for (let n = 0; n < 3; n++) scored.push({ n, ...(await score(id, n)) });
      scored.sort((a, b) => b.score - a.score);
      manifest[id] = scored.map(s => `${id}-${s.n}.mp3`);
      report.push(`${id.padEnd(4)} ${scored.map(s => `${s.n}:${s.score}`).join(' ')}   best: ${scored[0].heard}`);
    } catch (e) { report.push(`${id.padEnd(4)} FAILED ${e.message}`); }
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log(report.sort().join('\n'));
