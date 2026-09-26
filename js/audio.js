// Audio: parent-recorded phonemes (IndexedDB) played through Web Audio with silence trimmed,
// so sounds chain together with no gaps (Mentava: never pause between sounds).
// Whole words and instructions use the device's speech synthesis.
import { SOUND } from './sounds.js';
import { S } from './store.js';
import { phraseHash } from './phrasekey.js';

// ---------- IndexedDB ----------
const DB = 'soundhop', STORE = 'rec';
let dbp;
function db() {
  return dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => res(req?.result);
    t.onerror = () => rej(t.error);
  });
}
export const getRec = (id) => tx('readonly', s => s.get(id));
export async function setRec(id, blob) { await tx('readwrite', s => s.put(blob, id)); buffers.delete(id); recorded.add(id); }
export async function delRec(id) { await tx('readwrite', s => s.delete(id)); buffers.delete(id); recorded.delete(id); }
const recorded = new Set();
export async function loadRecordedList() {
  const keys = await tx('readonly', s => s.getAllKeys());
  keys.forEach(k => recorded.add(k));
  return recorded;
}
export const hasRec = (id) => recorded.has(id);

// ---------- Web Audio ----------
let ctx;
export function ctxGet() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state !== 'running') ctx.resume().catch(() => { });  // iOS: 'suspended' or 'interrupted'
  return ctx;
}
// iOS: audio must be unlocked inside a user gesture.
export function unlock() {
  const c = ctxGet();
  const b = c.createBuffer(1, 1, 22050);
  const src = c.createBufferSource(); src.buffer = b; src.connect(c.destination); src.start(0);
  if ('speechSynthesis' in window && !unlock.done) {
    const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); unlock.done = true;
  }
}

const buffers = new Map();
async function buffer(id) {
  if (buffers.has(id)) return buffers.get(id);
  const blob = await getRec(id);
  if (!blob) return null;
  const raw = await ctxGet().decodeAudioData(await blob.arrayBuffer());
  const buf = trim(raw);
  buffers.set(id, buf);
  return buf;
}

// Trim leading/trailing silence so chained sounds have no gaps.
function trim(buf) {
  const d = buf.getChannelData(0);
  let peak = 0;
  for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
  const th = Math.max(0.02, peak * 0.08);
  const win = Math.floor(buf.sampleRate * 0.01);
  let a = 0, b = d.length - 1;
  while (a < d.length - win && rms(d, a, win) < th) a += win;
  while (b > a + win && rms(d, b - win, win) < th) b -= win;
  a = Math.max(0, a - win); b = Math.min(d.length, b + win * 2);
  const out = ctxGet().createBuffer(1, b - a, buf.sampleRate);
  const o = out.getChannelData(0);
  o.set(d.subarray(a, b));
  // short fades to avoid clicks
  const f = Math.min(Math.floor(buf.sampleRate * 0.012), o.length >> 2);
  for (let i = 0; i < f; i++) { o[i] *= i / f; o[o.length - 1 - i] *= i / f; }
  // normalize loudness
  let p = 0; for (let i = 0; i < o.length; i++) p = Math.max(p, Math.abs(o[i]));
  if (p > 0) { const g = 0.9 / p; for (let i = 0; i < o.length; i++) o[i] *= g; }
  return out;
}
function rms(d, s, n) { let x = 0; for (let i = s; i < s + n; i++) x += d[i] * d[i]; return Math.sqrt(x / n); }

let current = [];
let gen = 0; // bumped by stopAll so an in-progress narration stops cleanly
export function stopAll() {
  gen++;
  current.forEach(s => { try { s.stop(); } catch (e) { } });
  current = [];
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function playBuf(buf, when = 0) {
  const c = ctxGet();
  const src = c.createBufferSource();
  src.buffer = buf; src.connect(c.destination);
  const t = when || c.currentTime + 0.01;
  src.start(t);
  current.push(src);
  return { src, end: t + buf.duration };
}

// Play one phoneme (by sound id). Falls back to speech synthesis if not recorded.
export async function playSound(id, { cut = false } = {}) {
  const buf = await buffer(id);
  if (!buf) return say(SOUND[id]?.tts ?? id, { rate: 0.7, device: true });
  const p = playBuf(buf);
  return new Promise(r => { p.src.onended = r; });
}

// Chain sounds with no gap between them: "mmmaaat".
export async function playBlend(ids) {
  const bufs = await Promise.all(ids.map(buffer));
  if (bufs.some(b => !b)) { for (const id of ids) await playSound(id); return; }
  const c = ctxGet();
  let t = c.currentTime + 0.05;
  let last;
  for (const b of bufs) { last = playBuf(b, t); t = last.end - 0.02; }
  return new Promise(r => { last.src.onended = r; });
}

// ---------- Speech synthesis ----------
let voice;
// iOS novelty voices that are no good for teaching.
const NOVELTY = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Fred|Good News|Jester|Junior|Kathy|Organ|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley/;
// Downloaded iPhone voices carry "premium" or "enhanced" in their identifier.
export function voiceQuality(v) {
  const id = `${v.voiceURI} ${v.name}`;
  return /premium/i.test(id) ? 2 : /enhanced|neural|natural/i.test(id) ? 1 : 0;
}
export function voiceLabel(v) {
  const q = ['', ' · Enhanced', ' · Premium'][voiceQuality(v)];
  return `${v.name.replace(/\s*\((Enhanced|Premium)\)/i, '')} (${v.lang})${q}`;
}
// English voices, best first: premium/enhanced, then US English.
export function voices() {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices()
    .filter(v => v.lang.replace('_', '-').startsWith('en') && !NOVELTY.test(v.name))
    .sort((a, b) => voiceQuality(b) - voiceQuality(a) || (b.lang.includes('US') - a.lang.includes('US')) || a.name.localeCompare(b.name));
}
// iOS fills the voice list a moment after the page asks for it, so wait for it.
export function loadVoices(timeout = 3000) {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return res([]);
    const start = Date.now();
    const check = () => {
      const vs = voices();
      if (vs.length || Date.now() - start > timeout) { speechSynthesis.removeEventListener?.('voiceschanged', check); clearInterval(t); res(vs); }
    };
    const t = setInterval(check, 200);
    speechSynthesis.addEventListener?.('voiceschanged', check);
    check();
  });
}
function pickVoice() {
  const want = S().settings.voice;
  const vs = voices();
  const us = vs.filter(v => /US/.test(v.lang));
  return vs.find(v => v.voiceURI === want || v.name === want)
    ?? us.find(v => voiceQuality(v) > 0)
    ?? vs.find(v => voiceQuality(v) > 0)
    ?? us.find(v => /Samantha|Ava|Allison|Susan|Zoe|Karen/.test(v.name))
    ?? us[0] ?? vs[0];
}
if ('speechSynthesis' in window) speechSynthesis.addEventListener?.('voiceschanged', () => { voice = pickVoice(); });

// ---------- Natural voice: pre-generated clips (see tools/gen-voice.mjs) ----------
let clips = new Set();
export async function loadClips() {
  try { clips = new Set(await (await fetch('audio/n/manifest.json')).json()); } catch (e) { clips = new Set(); }
  return clips.size;
}
export const clipCount = () => clips.size;
export const naturalVoiceOn = () => clips.size > 0 && !S().settings.voice;
export const clipUrl = (text) => { const h = phraseHash(text); return clips.has(h) ? `audio/n/${h}.mp3` : null; };
const clipBufs = new Map();
function clipBuffer(url) {
  if (!clipBufs.has(url)) {
    const p = fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(b => ctxGet().decodeAudioData(b))
      .catch(e => { clipBufs.delete(url); throw e; });
    clipBufs.set(url, p);
    if (clipBufs.size > 400) clipBufs.delete(clipBufs.keys().next().value);
  }
  return clipBufs.get(url);
}
// Start loading the clips a narration will need, so there are no gaps between them.
export function warm(parts) {
  if (!naturalVoiceOn()) return;
  for (const p of parts) if (typeof p === 'string') { const u = clipUrl(p); if (u) clipBuffer(u).catch(() => { }); }
}
export async function downloadAllClips(onProgress) {
  const cache = await caches.open('soundhop-voice');
  const list = [...clips];
  let n = 0;
  for (let i = 0; i < list.length; i += 8) {
    await Promise.all(list.slice(i, i + 8).map(async h => {
      const url = `audio/n/${h}.mp3`;
      if (!(await cache.match(url))) { try { const r = await fetch(url); if (r.ok) await cache.put(url, r); } catch (e) { } }
      onProgress?.(++n, list.length);
    }));
  }
}

export function say(text, { rate, device } = {}) {
  text = (text ?? '').replace(/^[\s?.!,:]+/, '');  // never speak a lone '?'
  if (!text) return Promise.resolve();
  const url = !device && naturalVoiceOn() ? clipUrl(text) : null;
  if (!url && !device && naturalVoiceOn()) (window.__missedClips ??= new Set()).add(text); // coverage check in tests
  if (url) {
    const my = gen;
    return clipBuffer(url).then(buf => {
      if (gen !== my) return;
      const p = playBuf(buf);
      return new Promise(r => { p.src.onended = r; });
    }).catch(() => deviceSay(text, rate));
  }
  return deviceSay(text, rate);
}

function deviceSay(text, rate) {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    voice = voice ?? pickVoice();
    try { if (voice) u.voice = voice; } catch (e) { voice = null; } // never let a bad voice block speech
    u.lang = 'en-US';
    u.rate = rate ?? S().settings.rate;
    let done = false;
    const fin = () => { if (!done) { done = true; res(); } };
    u.onend = fin; u.onerror = fin;
    // iOS sometimes never fires onend
    setTimeout(fin, 900 + text.length * 110);
    speechSynthesis.speak(u);
  });
}
export function resetVoice() { voice = null; }

// Narration mixing speech and recorded sounds: ['Listen:', {sound:'m'}, 'Tap it!'].
// Built-in pacing for young children: a short breath between phrases and a longer
// pause on both sides of every recorded sound so it stands out from the voice.
const GAP = 350, AROUND_SOUND = 600;
const wait = (ms) => new Promise(r => setTimeout(r, ms * (window.__timeScale ?? 1))); // __timeScale: automated tests only
export async function speak(parts) {
  const my = gen;
  warm(parts);
  let prev = null;
  for (const p of parts) {
    if (gen !== my) return;
    const isSound = typeof p === 'object' && (p.sound || p.blend);
    if (prev && !(typeof p === 'object' && p.pause) && !(typeof prev === 'object' && prev.pause)) {
      await wait(isSound || (typeof prev === 'object' && (prev.sound || prev.blend)) ? AROUND_SOUND : GAP);
      if (gen !== my) return;
    }
    if (typeof p === 'string') await say(p);
    else if (p.sound) { p.onStart?.(); await playSound(p.sound); }
    else if (p.blend) await playBlend(p.blend);
    else if (p.pause) await wait(p.pause);
    prev = p;
  }
}

// ---------- Recording ----------
let stream, rec, chunks;
export async function micStream() {
  if (stream && stream.active) return stream;
  stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: true } });
  return stream;
}
export async function startRecording() {
  const s = await micStream();
  const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
  rec = new MediaRecorder(s, type ? { mimeType: type } : undefined);
  chunks = [];
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec.start();
}
export function stopRecording() {
  return new Promise(res => {
    if (!rec || rec.state === 'inactive') return res(null);
    rec.onstop = () => res(new Blob(chunks, { type: rec.mimeType || 'audio/mp4' }));
    rec.stop();
  });
}
export function releaseMic() { if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } }

// Live input level 0..1 for the voice-blend game.
export async function micLevel() {
  const s = await micStream();
  const c = ctxGet();
  const src = c.createMediaStreamSource(s);
  const an = c.createAnalyser();
  an.fftSize = 1024;
  src.connect(an);
  const data = new Float32Array(an.fftSize);
  return {
    read() {
      an.getFloatTimeDomainData(data);
      let x = 0; for (let i = 0; i < data.length; i++) x += data[i] * data[i];
      return Math.min(1, Math.sqrt(x / data.length) * 6);
    },
    close() { try { src.disconnect(); } catch (e) { } },
  };
}
