// Grown-up zone: onboarding, sound recording, progress report, settings, guide, backup.
import { h, shuffle, sleep } from './ui.js';
import { S, save, reset, importJSON } from './store.js';
import { SOUNDS, SOUND } from './sounds.js';
import { LEVELS, NO_QUIZ, knownAt } from './curriculum.js';
import { keyLabel, keySound } from './phonics.js';
import { startRecording, stopRecording, setRec, getRec, delRec, hasRec, playSound, say, releaseMic, unlock, voices, resetVoice, loadRecordedList } from './audio.js';

// Sounds in the order the child meets them, so parents can record the first ones first.
function soundOrder() {
  const first = {};
  LEVELS.forEach((L, i) => L.teach.forEach(k => { const s = keySound(k); if (SOUND[s] && first[s] == null) first[s] = i; }));
  return [...SOUNDS].sort((a, b) => (first[a.id] ?? 999) - (first[b.id] ?? 999)).map(s => ({ ...s, level: first[s.id] }));
}

export function gate(ok) {
  const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7);
  const ans = a * b;
  const opts = shuffle([ans, ans + a, ans - b, ans + 7].filter((x, i, arr) => arr.indexOf(x) === i)).slice(0, 3);
  if (!opts.includes(ans)) opts[0] = ans;
  const ov = h('div', { class: 'screen fade-in parent', style: { position: 'fixed', inset: 0, background: 'var(--sky)', zIndex: 40, maxWidth: 'none' } },
    h('div', { class: 'topbar' }, h('button', { class: 'icon-btn', onclick: () => ov.remove() }, '✖')),
    h('div', { class: 'center' },
      h('div', { class: 'note' }, 'For grown-ups'),
      h('div', { class: 'gate-q' }, `What is ${a} × ${b}?`),
      h('div', { class: 'row', style: { justifyContent: 'center' } }, shuffle(opts).map(o => h('button', { class: 'btn ghost', onclick: () => { ov.remove(); if (o === ans) ok(); } }, String(o))))));
  document.body.append(ov);
}

export function onboarding(app, done) {
  const name = h('input', { type: 'text', placeholder: "Child's first name", autocomplete: 'off' });
  app.replaceChildren(h('div', { class: 'screen parent fade-in' },
    h('div', { class: 'center', style: { justifyContent: 'flex-start', paddingTop: '20px' } },
      h('div', { class: 'mascot' }, '🐸'),
      h('h2', {}, 'Welcome to Sound Hop'),
      h('div', { class: 'panel', style: { textAlign: 'left', maxWidth: '560px' } },
        h('p', {}, 'Sound Hop teaches reading the Mentava way: lowercase letters, letter ', h('b', {}, 'sounds'), ' (not names), smooth blending with no pauses, and moving on only after mastery.'),
        h('p', {}, h('b', {}, 'One setup step matters a lot: '), 'record yourself saying the 44 sounds (about 10 minutes). Phone voices can’t say "mmm" or a crisp "t" on their own, and the book is clear that saying sounds exactly right, every time, is what makes blending easy. You can start with the first few and record the rest over time.'),
        h('p', {}, 'Aim for 10–20 minutes a day. Sit with your child at first, especially for the "keep your voice on" blending game.'),
        name),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { class: 'btn', onclick: () => { finish(); gate(() => { unlock(); location.hash = ''; parentZone(app, done, 'sounds'); }); } }, '🎙 Record sounds'),
        h('button', { class: 'btn ghost', onclick: () => { finish(); done(); } }, 'Later')))));
  function finish() { S().child.name = name.value.trim(); S().onboarded = true; save(); }
}

export function parentZone(app, back, tab = 'progress') {
  const tabs = { progress: '📈 Progress', sounds: '🎙 Sounds', settings: '⚙️ Settings', guide: '📘 Guide', backup: '💾 Backup' };
  const body = h('div');
  const bar = h('div', { class: 'row', style: { margin: '10px 0 14px' } });
  function show(t) {
    releaseMic();
    bar.replaceChildren(...Object.entries(tabs).map(([k, v]) => h('button', { class: 'pbtn' + (k === t ? '' : ' alt'), onclick: () => show(k) }, v)));
    body.replaceChildren(TABS[t]());
  }
  app.replaceChildren(h('div', { class: 'screen parent fade-in' },
    h('div', { class: 'topbar' }, h('button', { class: 'icon-btn', onclick: () => { releaseMic(); back(); } }, '🏠'), h('h2', { style: { margin: 0 } }, 'Grown-ups')),
    bar, body));
  show(tab);
}

const TABS = {
  progress() {
    const s = S();
    const idx = Math.min(s.levelIdx, LEVELS.length - 1);
    const passed = Object.values(s.levels).filter(l => l.passed).length;
    const keys = [...knownAt(Math.max(0, s.levelIdx - 1)).keys].filter(k => !NO_QUIZ.has(k));
    const words = Object.entries(s.items).filter(([id]) => id.startsWith('w:'));
    const mastered = words.filter(([, it]) => it.box >= 2).length;
    const tricky = Object.entries(s.items).filter(([, it]) => it.wrong >= 2 && it.box < 2).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 12);
    const log = s.log.slice(-12).reverse();
    const stage = LEVELS[idx].stage;
    return h('div', {},
      h('div', { class: 'panel' },
        h('p', {}, h('b', {}, s.levelIdx >= LEVELS.length ? 'All levels complete 🎉' : `Level ${idx + 1} of ${LEVELS.length}: ${LEVELS[idx].title}`)),
        h('p', {}, `Stage ${stage}. ${passed} levels passed · ${s.sessions} days practiced · ${s.streak.days}-day streak · ~${s.minutes} min total`),
        h('p', {}, `${mastered} words read correctly on separate days (out of ${words.length} seen).`)),
      h('h3', {}, 'Letter sounds'),
      h('div', { class: 'panel' },
        h('p', { class: 'note' }, 'Grey = new, yellow = learning, green = solid (right across several days). Review is scheduled automatically.'),
        h('div', { class: 'mastery' }, keys.map(k => {
          const it = s.items['k:' + k];
          const b = it?.box ?? 0;
          return h('div', { class: 'm' + (b >= 4 ? 3 : b >= 2 ? 2 : it ? 1 : 0) }, keyLabel(k), h('small', {}, it ? `${it.right}/${it.seen}` : '—'));
        }))),
      tricky.length ? h('div', {}, h('h3', {}, 'Needs practice'), h('div', { class: 'panel' }, h('p', {}, tricky.map(([id]) => id.replace(/^k:(.+):.+$/, '$1').replace(/^[wh]:/, '')).join(' · ')),
        h('p', { class: 'note' }, 'These come back more often in warm-ups automatically. Off-screen, you can play "I spy something that starts with /sss/".'))) : null,
      h('h3', {}, 'Recent levels'),
      h('div', { class: 'panel' }, log.length ? log.map(l => h('p', {}, `${new Date(l.t).toLocaleDateString()} · ${LEVELS[l.level - 1]?.title} · ${l.acc}% ${l.passed ? '✅' : '🔁'}`)) : h('p', { class: 'note' }, 'No levels played yet.')));
  },

  sounds() {
    const list = soundOrder();
    const done = list.filter(s => hasRec(s.id)).length;
    const wrap = h('div');
    const head = h('div', { class: 'panel' },
      h('p', {}, h('b', {}, `${done} / ${list.length} sounds recorded.`), ' Sounds are listed in the order your child meets them.'),
      h('p', {}, 'How to record: tap 🎙, say the sound once, clearly, then tap ⏹. ',
        h('b', {}, 'Hold'), ' sounds like mmm, sss, fff and vowels for about a second. Keep sounds like b, d, t, p, k, g, j, ch ', h('b', {}, 'short and crisp, with no "uh"'), '. Silence is trimmed automatically.'),
      h('p', { class: 'note' }, 'Tip: a quiet room, phone about a foot from your mouth. The book recommends the YouTube video "The Key Sounds of English – 44 Phonemes" by Sally Cole if you want a reference.'));
    wrap.append(head);
    list.forEach(s => wrap.append(soundRow(s)));
    return wrap;
  },

  settings() {
    const s = S();
    const name = h('input', { type: 'text', value: s.child.name, onchange: (e) => { s.child.name = e.target.value.trim(); save(); } });
    const mins = h('select', { onchange: (e) => { s.settings.sessionMin = +e.target.value; save(); } }, [10, 15, 20, 30].map(m => h('option', { value: m, selected: s.settings.sessionMin === m }, `${m} minutes`)));
    const mic = h('input', { type: 'checkbox', checked: s.settings.micGame, onchange: (e) => { s.settings.micGame = e.target.checked; save(); } });
    const rate = h('input', { type: 'range', min: 0.5, max: 1.0, step: 0.05, value: s.settings.rate, onchange: (e) => { s.settings.rate = +e.target.value; save(); say('The cat sat on the mat.'); } });
    const vs = voices();
    const voice = h('select', { onchange: (e) => { s.settings.voice = e.target.value; save(); resetVoice(); say('Hello! Let’s read.'); } },
      h('option', { value: '' }, 'Automatic'), vs.map(v => h('option', { value: v.name, selected: s.settings.voice === v.name }, `${v.name} (${v.lang})`)));
    const jump = h('select', {}, LEVELS.map((L, i) => h('option', { value: i, selected: i === s.levelIdx }, `${L.id}. ${L.title}`)));
    return h('div', {},
      h('div', { class: 'panel' }, h('p', {}, h('b', {}, 'Child’s name')), name),
      h('div', { class: 'panel' }, h('p', {}, h('b', {}, 'Suggested session length')), mins, h('p', { class: 'note' }, 'After this long, Hopper suggests a break (your child can keep going).')),
      h('div', { class: 'panel' }, h('label', { class: 'row' }, mic, h('b', {}, 'Voice blending game (uses microphone)')), h('p', { class: 'note' }, 'Mentava-style "keep your voice on" game: the bird flies while your child says the sounds without pausing.')),
      h('div', { class: 'panel' }, h('p', {}, h('b', {}, 'Narrator voice')), voice, h('p', {}, 'Narrator speed (left = slower)'), rate, h('p', { class: 'note' }, 'Used for whole words and instructions. For a better voice on iPhone: Settings → Accessibility → Read & Speak (older iOS: Spoken Content) → Voices → English → pick a voice such as Ava or Zoe → download the Enhanced or Premium version. Then pick it here. If it does not appear here, iOS is not sharing it with web apps, and the app uses the best available voice.')),
      h('div', { class: 'panel' }, h('p', {}, h('b', {}, 'Move to a level')), jump,
        h('div', { class: 'row', style: { marginTop: '10px' } }, h('button', { class: 'pbtn', onclick: () => { s.levelIdx = +jump.value; save(); alert('Moved to level ' + (+jump.value + 1)); } }, 'Set current level')),
        h('p', { class: 'note' }, 'Use this if your child already knows early material. Earlier levels stay replayable from the map.')));
  },

  guide() {
    const P = (t) => h('p', {}, t);
    return h('div', {},
      h('div', { class: 'panel' }, h('h3', {}, 'How Sound Hop teaches (Mentava method)'),
        P('1. Sounds, not names. Call letters by their sounds ("mmm", "sss"), not "em", "ess". Cat isn’t "see-ay-tee".'),
        P('2. Lowercase first. 99% of letters in books are lowercase.'),
        P('3. Say sounds exactly right, every time. "mmm", not "muh". A crisp "t", not "tuh". f-u-n is "fffuuunnn", not "fuh-uh-nuh".'),
        P('4. Blend without pausing. Keep your voice on from one sound to the next: "mmmaaat", then say it fast: "mat". Never "m… a… t".'),
        P('5. Never change sounds mid-blend. That’s why words like "is" and "as" (where s says z) are taught as heart words at first.'),
        P('6. Mastery before moving on. Each level needs about 80% right on first tries (85% for checks). If not, your child simply repeats it, which is normal.'),
        P('7. Cumulative review. Each session starts with a warm-up of items due for review (spaced repetition), and every level mixes in older material.'),
        P('8. Letter teams are shown in pink and silent letters in grey. The colors fade as your child masters them, like training wheels.')),
      h('div', { class: 'panel' }, h('h3', {}, 'Your part'),
        P('Sit together, especially early on. It should feel like quality time.'),
        P('Emphasize sounds in everyday words: "this is an OOOctopus! Can you say octopus?"'),
        P('When a story says "read it to a grown-up", really listen and cheer. Reading to a person is the payoff.'),
        P('Blending often "clicks" months after letter sounds do. If blending is hard, keep playing sound levels and the listening games; nothing went wrong.')),
      h('div', { class: 'panel' }, h('h3', {}, 'The journey'),
        P('🌱 Sound Garden: every letter sound, left-to-right readiness, first CVC words (mat, sit, dog), first sentences and stories.'),
        P('🤝 Team Letters: ck, sh, ch, th, wh, ng/nk, then blends (frog, stop, hand, jump).'),
        P('🌊 Long Vowel Lagoon: magic e (cake, bike, bone), vowel teams (ee, ai, oa, igh, oo, ow, oi), bossy r (ar, or, er).'),
        P('🏔️ Book Mountain: soft c/g, two-syllable words, -ing/-ed, the common tricky words. Graduation means books like Hop on Pop and Green Eggs and Ham.')),
      h('div', { class: 'panel' }, h('h3', {}, 'Sound notes from the book'),
        P('Kids master saying sounds at different ages: by 2, vowels plus p, b, m, d, n, h, t; by 3, k, g, w, ng, f, y; by 4, l, j, ch, s, v, sh, z; last come r, both th sounds and zh. "Baby talk" pronunciation is fine; enjoy it.'),
        P('In American English, "a" before n or m (man, am, ant) sounds a bit more nasal ("raised a"). That’s expected and fine when blending.')));
  },

  backup() {
    const s = S();
    const file = h('input', { type: 'file', accept: 'application/json,.json', style: { display: 'none' }, onchange: async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (data.recordings) for (const [id, b64] of Object.entries(data.recordings)) await setRec(id, b64ToBlob(b64));
        delete data.recordings;
        importJSON(JSON.stringify(data));
        await loadRecordedList();
        alert('Backup restored!');
      } catch (err) { alert('Could not read that file: ' + err.message); }
    } });
    return h('div', {},
      h('div', { class: 'panel' }, h('p', {}, 'Progress is saved on this phone automatically. Make a backup now and then, especially before updating iOS or clearing Safari data. Backups include your sound recordings.'),
        h('div', { class: 'row' },
          h('button', { class: 'pbtn', onclick: exportBackup }, '⬇️ Save backup'),
          h('button', { class: 'pbtn alt', onclick: () => file.click() }, '⬆️ Restore backup'), file)),
      h('div', { class: 'panel' }, h('p', {}, h('b', {}, 'Start over')), h('p', { class: 'note' }, 'Erases progress and stickers (keeps recordings).'),
        h('button', { class: 'pbtn rec', onclick: () => { if (confirm('Erase all progress?') && confirm('Really erase? This cannot be undone.')) { const name = s.child.name; reset(); S().child.name = name; S().onboarded = true; save(); location.reload(); } } }, 'Erase progress')));
  },
};

function soundRow(s) {
  const st = h('span', { class: hasRec(s.id) ? 'ok' : 'note' }, hasRec(s.id) ? '✓ recorded' : 'not recorded');
  const play = h('button', { class: 'pbtn alt', disabled: !hasRec(s.id), onclick: () => { unlock(); playSound(s.id); } }, '▶');
  let recording = false, timer;
  const rec = h('button', { class: 'pbtn rec', onclick: async () => {
    unlock();
    if (!recording) {
      try { await startRecording(); } catch (e) { alert('Microphone permission is needed to record. ' + e.message); return; }
      recording = true; rec.classList.add('on'); rec.textContent = '⏹ Stop';
      timer = setTimeout(() => recording && rec.click(), 3500);
    } else {
      clearTimeout(timer);
      recording = false; rec.classList.remove('on'); rec.textContent = '🎙';
      const blob = await stopRecording();
      releaseMic(); // iOS plays through the quiet earpiece while the mic is open
      if (blob && blob.size > 500) {
        await setRec(s.id, blob);
        st.className = 'ok'; st.textContent = '✓ recorded'; play.disabled = false;
        await sleep(150); playSound(s.id);
      }
    }
  } }, '🎙');
  const ex = s.words[0];
  const label = s.id === 'dh' ? 'th (this)' : s.id === 'th' ? 'th (thin)' : s.id === 'oo' ? 'oo (moon)' : s.id === 'uu' ? 'oo (book)' : s.show.replace('_', ' _ ');
  return h('div', { class: 'snd-row' },
    h('div', { class: 'g', style: label.length > 4 ? { fontSize: '18px' } : null }, label),
    h('div', {}, h('div', { class: 'tip' }, s.tip), h('div', { class: 'row', style: { marginTop: '4px' } },
      h('button', { class: 'pbtn alt', onclick: () => say(ex[0], { rate: 0.7 }) }, `${ex[1]} ${ex[0]}`), st,
      s.level != null ? h('span', { class: 'note' }, `· level ${s.level + 1}`) : null)),
    h('div', { class: 'row' }, rec, play));
}

async function exportBackup() {
  const data = JSON.parse(JSON.stringify(S()));
  data.recordings = {};
  for (const s of SOUNDS) { const b = await getRec(s.id); if (b) data.recordings[s.id] = await blobToB64(b); }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const name = `soundhop-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const f = new File([blob], name, { type: 'application/json' });
  if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: 'Sound Hop backup' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click(); a.remove();
}
const blobToB64 = (b) => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });
function b64ToBlob(d) { const [meta, data] = d.split(','); const mime = meta.match(/:(.*?);/)[1]; const bin = atob(data); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: mime }); }
