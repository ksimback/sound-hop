// Transcribes every narration clip with OpenAI speech-to-text and flags clips whose words
// don't match the intended phrase (extra words, cut-off sounds, wrong word).
// Usage: node tools/verify-voice.mjs [--delete]   (--delete removes mismatches so gen-voice redoes them)
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { collectPhrases } from './phrases.mjs';
import { phraseKey } from '../js/phrasekey.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const env = Object.fromEntries(readFileSync(root + '.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const KEY = env.OPENAI_API_KEY;

// Spellings the transcriber may legitimately use for the same sound.
const SAME = { uh: 'a', ok: 'okay', ax: 'axe', yoyo: 'yo yo', 'yo-yo': 'yo yo' };
const norm = (t) => phraseKey(t).split(' ').map(w => SAME[w] ?? w).join(' ').replace(/'/g, '');

async function transcribe(file, prompt) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const form = new FormData();
    form.append('file', new Blob([readFileSync(file)], { type: 'audio/mpeg' }), 'clip.mp3');
    form.append('model', 'gpt-4o-transcribe');
    form.append('language', 'en');
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${KEY}` }, body: form });
    if (res.ok) return (await res.json()).text;
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 1500 * attempt)); continue; }
    throw new Error(`${res.status} ${(await res.text()).slice(0, 150)}`);
  }
  throw new Error('gave up');
}

const from = process.argv.includes('--from') ? new Set(JSON.parse(readFileSync(root + process.argv[process.argv.indexOf('--from') + 1], 'utf8')).map(p => p.hash)) : null;
const phrases = collectPhrases().filter(p => existsSync(root + `audio/n/${p.hash}.mp3`) && (!from || from.has(p.hash)));
const bad = [];
let n = 0;
const queue = [...phrases];
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    try {
      // Only a neutral hint: a children's reading app. The clip must stand on its own.
      const heard = await transcribe(root + `audio/n/${p.hash}.mp3`, 'A teacher speaking to a young child learning to read.');
      if (norm(heard) !== norm(p.text)) bad.push({ ...p, heard });
    } catch (e) { bad.push({ ...p, heard: 'ERROR ' + e.message }); }
    if (++n % 200 === 0) console.log(`  ${n}/${phrases.length}`);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
writeFileSync(root + 'tools/.voice-mismatches.json', JSON.stringify(bad, null, 1));
console.log(`${bad.length} of ${phrases.length} clips don't match exactly:`);
for (const b of bad) console.log(`  ${b.kind.padEnd(4)} "${b.text}"  →  heard "${b.heard}"`);
if (process.argv.includes('--delete')) { bad.forEach(b => unlinkSync(root + `audio/n/${b.hash}.mp3`)); console.log('deleted mismatches'); }
