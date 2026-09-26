// Maps any spoken phrase to the file name of its pre-generated narration clip.
// Case and punctuation are ignored, so "Yes!" and "yes" share a clip.
export function phraseKey(text) {
  return String(text).toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

// FNV-1a 32-bit, as 8 hex chars.
export function phraseHash(text) {
  const s = phraseKey(text);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0');
}
