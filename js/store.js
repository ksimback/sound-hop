// Progress lives in localStorage (small JSON). Recordings live in IndexedDB (see audio.js).
const KEY = 'soundhop.v1';
const DAY = 86400000;
// Spaced repetition: box -> days until next review.
const INTERVALS = [0, 1, 2, 4, 8, 16, 32];

function fresh() {
  return {
    v: 1,
    child: { name: '' },
    created: Date.now(),
    levelIdx: 0,          // first level not yet passed
    levels: {},           // id -> { stars, passed, tries, bestAcc }
    items: {},            // itemId -> { box, due, right, wrong, seen }
    stickers: [],
    streak: { days: 0, last: '' },
    sessions: 0,
    minutes: 0,
    log: [],              // { t, level, acc, passed }
    settings: { sessionMin: 15, micGame: true, rate: 0.85, voice: '' },
    onboarded: false,
  };
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw), settings: { ...fresh().settings, ...JSON.parse(raw).settings } };
  } catch (e) { /* fall through */ }
  return fresh();
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('save failed', e); }
}

export const S = () => state;

export function reset() { state = fresh(); save(); }

export function importJSON(text) {
  const data = JSON.parse(text);
  if (!data || data.v !== 1 || !data.items) throw new Error('Not a Sound Hop backup');
  state = { ...fresh(), ...data };
  save();
}

// ---- items / spaced repetition ----
export function item(id) { return state.items[id]; }

export function grade(id, correct) {
  const it = state.items[id] ?? (state.items[id] = { box: 0, due: 0, right: 0, wrong: 0, seen: 0 });
  it.seen++;
  if (correct) { it.right++; it.box = Math.min(it.box + 1, INTERVALS.length - 1); }
  else { it.wrong++; it.box = Math.max(0, it.box - 2); }
  it.due = Date.now() + INTERVALS[it.box] * DAY - DAY / 4;
  it.last = Date.now();
}

export function box(id) { return state.items[id]?.box ?? 0; }

export function dueItems(prefix, limit = 99) {
  const now = Date.now();
  return Object.entries(state.items)
    .filter(([id, it]) => id.startsWith(prefix) && it.due <= now)
    .sort((a, b) => a[1].box - b[1].box || a[1].due - b[1].due)
    .slice(0, limit).map(([id]) => id);
}

// ---- levels ----
export function finishLevel(level, acc, passed, stars) {
  const L = state.levels[level.id] ?? (state.levels[level.id] = { stars: 0, passed: false, tries: 0, bestAcc: 0 });
  L.tries++;
  L.bestAcc = Math.max(L.bestAcc, acc);
  if (passed) { L.passed = true; L.stars = Math.max(L.stars, stars); }
  state.log.push({ t: Date.now(), level: level.id, acc: Math.round(acc * 100), passed });
  if (state.log.length > 300) state.log.shift();
  if (passed && level.id - 1 === state.levelIdx) state.levelIdx++;
  save();
}

export function markDay() {
  const today = new Date().toDateString();
  if (state.streak.last === today) return;
  const yest = new Date(Date.now() - DAY).toDateString();
  state.streak.days = state.streak.last === yest ? state.streak.days + 1 : 1;
  state.streak.last = today;
  state.sessions++;
  save();
}

export function addMinutes(m) { state.minutes += m; save(); }
