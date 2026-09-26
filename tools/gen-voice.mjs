// Generates natural-voice narration clips with OpenAI TTS into audio/n/<hash>.mp3
// and writes audio/n/manifest.json (the list of available clips).
// Reads OPENAI_API_KEY from .env. Skips clips that already exist.
// Usage: node tools/gen-voice.mjs [--limit N] [--only "phrase"] [--voice coral]
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { collectPhrases } from './phrases.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = root + 'audio/n/';
mkdirSync(outDir, { recursive: true });

const env = Object.fromEntries(readFileSync(root + '.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const KEY = env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY missing from .env'); process.exit(1); }

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const VOICE = arg('--voice', 'coral');
const LIMIT = +arg('--limit', 1e9);
const ONLY = arg('--only', null);

const BASE = 'You are Hopper, a warm, cheerful kindergarten teacher talking to a 5-year-old who is learning to read. American English. ';
const INSTRUCTIONS = {
  line: BASE + 'Speak slowly and clearly, with gentle enthusiasm and a friendly smile in your voice. Leave small natural pauses between sentences.',
  word: BASE + 'Say only this single word, clearly and naturally, the way a teacher names a picture card. Normal pronunciation, not stretched out, no extra words.',
  text: BASE + 'Read this sentence aloud slowly and clearly, like reading a picture book to a young child. Pronounce every word distinctly.',
};
// Inputs where the spoken form differs from the written one.
const SPOKEN = { a: 'uh', 'A': 'uh' };

async function tts(p) {
  // Sentences are shown lowercase in the app, but the voice reads better in sentence case.
  const input = SPOKEN[p.text] ?? (p.kind === 'text' ? p.text.replace(/(^|[.!?]\s+)([a-z])/g, (m, a, c) => a + c.toUpperCase()) : p.text);
  const body = { model: 'gpt-4o-mini-tts', voice: VOICE, input, instructions: INSTRUCTIONS[p.kind], response_format: 'mp3' };
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const msg = (await res.text()).slice(0, 200);
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 1500 * attempt)); continue; }
    throw new Error(`${res.status} ${msg}`);
  }
  throw new Error('gave up after retries');
}

function duration(f) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' });
  return parseFloat(r.stdout);
}

let phrases = collectPhrases();
if (ONLY) phrases = phrases.filter(p => p.text === ONLY);
const todo = phrases.filter(p => !existsSync(outDir + p.hash + '.mp3')).slice(0, LIMIT);
console.log(`${phrases.length} phrases, ${todo.length} to generate (voice: ${VOICE})`);

let done = 0, failed = 0;
const queue = [...todo];
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    try {
      const raw = outDir + p.hash + '.raw.mp3';
      writeFileSync(raw, await tts(p));
      // Trim long silence at both ends (the app adds its own pauses), gently: a low threshold
      // and 80 ms kept, so quiet first sounds like h, s, f are never cut. Shrink to 48 kbps mono.
      const out = outDir + p.hash + '.mp3';
      const trim = 'silenceremove=start_periods=1:start_threshold=-60dB:start_silence=0.08';
      const enc = (af) => spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, ...(af ? ['-af', af] : []), '-ac', '1', '-b:a', '48k', out]);
      const before = duration(raw);
      let r = enc(`${trim},areverse,${trim},areverse`);
      // safety net: if trimming removed most of the clip, keep it untrimmed
      if (r.status !== 0 || !(duration(out) > Math.min(0.25, before * 0.6))) r = enc(null);
      if (r.status !== 0) throw new Error('ffmpeg: ' + r.stderr);
      if (!(duration(out) > 0.1)) throw new Error('empty audio');
      unlinkSync(raw);
      if (++done % 50 === 0) console.log(`  ${done}/${todo.length}`);
    } catch (e) { failed++; console.log(`  FAILED "${p.text}": ${e.message}`); }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

// remove clips for phrases that no longer exist
const wanted = new Set(collectPhrases().map(p => p.hash));
for (const f of readdirSync(outDir)) if (f.endsWith('.mp3') && !wanted.has(f.slice(0, -4)) && !ONLY) { unlinkSync(outDir + f); console.log('removed stale clip', f); }
const have = readdirSync(outDir).filter(f => f.endsWith('.mp3') && !f.includes('.raw')).map(f => f.slice(0, -4)).sort();
writeFileSync(outDir + 'manifest.json', JSON.stringify(have));
console.log(`generated ${done}, failed ${failed}; manifest has ${have.length} clips`);
