// Second-opinion check for clips the transcriber flagged: an audio-capable model listens to
// each clip together with its intended text and says whether it matches exactly.
// Usage: node tools/judge-voice.mjs [--delete]   (--delete removes failing clips so gen-voice redoes them)
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const env = Object.fromEntries(readFileSync(root + '.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const KEY = env.OPENAI_API_KEY;
const list = JSON.parse(readFileSync(root + 'tools/.voice-mismatches.json', 'utf8')).filter(p => existsSync(root + `audio/n/${p.hash}.mp3`));

async function judge(p) {
  const audio = readFileSync(root + `audio/n/${p.hash}.mp3`).toString('base64');
  const expected = p.text === 'a' ? 'the word "a", pronounced "uh"' : `"${p.text}"`;
  const body = {
    model: 'gpt-audio-1.5',
    modalities: ['text'],
    messages: [{
      role: 'user', content: [
        { type: 'text', text: `This clip is for a children's reading app. It should say exactly ${expected}, nothing more and nothing less. Homophones are fine (e.g. "sea" vs "see"), "can not" vs "cannot" is fine, and punctuation doesn't matter. Is the audio a complete, correct reading of that text, with no extra words, no missing words, and no cut-off sounds? Reply with JSON only: {"ok": true|false, "heard": "<what you hear>"}` },
        { type: 'input_audio', input_audio: { data: audio, format: 'mp3' } },
      ],
    }],
  };
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      const txt = (await res.json()).choices[0].message.content;
      try { return JSON.parse(txt.replace(/^```(json)?|```$/g, '').trim()); } catch { return { ok: /"ok"\s*:\s*true/.test(txt), heard: txt.slice(0, 80) }; }
    }
    if (res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, 2000 * attempt)); continue; }
    throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error('gave up');
}

const fails = [], errors = [];
const queue = [...list];
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    try { const v = await judge(p); if (!v.ok) fails.push({ ...p, heard: v.heard }); }
    catch (e) { errors.push(p); console.log('  error', p.text, e.message.slice(0, 120)); }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
writeFileSync(root + 'tools/.voice-judged.json', JSON.stringify(fails, null, 1));
if (errors.length) { console.log(`${errors.length} clips could not be judged; not deleting anything.`); process.exit(1); }
console.log(`${fails.length} of ${list.length} flagged clips judged wrong:`);
for (const f of fails) console.log(`  ${f.kind.padEnd(4)} "${f.text}"  →  "${f.heard}"`);
if (process.argv.includes('--delete')) { fails.forEach(f => unlinkSync(root + `audio/n/${f.hash}.mp3`)); console.log('deleted; rerun gen-voice to regenerate'); }
