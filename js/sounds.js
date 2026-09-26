// The 44 sounds of English, following "Mentava Alphabet Sounds".
// id: phoneme id used everywhere. show: how the sound is written on cards.
// kind: 'cont' (hold it: mmm), 'stop' (clip it: t-), 'vowel'.
// tip: the book's pronunciation note (shown to the parent while recording).
// words: example words from the book, with emoji pictures.
// tts: best-effort fallback used only until the parent records the sound.

export const SOUNDS = [
  // short vowels
  { id: 'a', show: 'a', kind: 'vowel', tip: 'The "a" in "apple". Hold it: "aaa".', words: [['apple', '🍎'], ['cat', '🐱'], ['hat', '👒'], ['crab', '🦀'], ['axe', '🪓']], tts: 'aa' },
  { id: 'e', show: 'e', kind: 'vowel', tip: 'The "e" in "egg". Say "ehhh", not "ihhh".', words: [['egg', '🥚'], ['tent', '⛺'], ['hen', '🐔'], ['red', '🟥'], ['nest', '🪺']], tts: 'eh' },
  { id: 'i', show: 'i', kind: 'vowel', tip: 'The "i" in "igloo". Hold it: "iii".', words: [['igloo', '🛖'], ['fish', '🐟'], ['ship', '🚢'], ['dig', '⛏️'], ['chips', '🍟']], tts: 'ih' },
  { id: 'o', show: 'o', kind: 'vowel', tip: 'The "o" in "ox" (also "yawn"). Hold it: "ooo" as in "hot".', words: [['octopus', '🐙'], ['ox', '🐂'], ['frog', '🐸'], ['dog', '🐶'], ['rock', '🪨']], tts: 'ah' },
  { id: 'u', show: 'u', kind: 'vowel', tip: 'The "u" in "up". Hold it: "uuu".', words: [['umbrella', '☂️'], ['up', '⬆️'], ['bug', '🐛'], ['sun', '☀️'], ['duck', '🦆']], tts: 'uh' },

  // single consonants
  { id: 'b', show: 'b', kind: 'stop', tip: 'Say "b-", not "buh". Short and crisp, no "uh" after.', words: [['bus', '🚌'], ['bear', '🐻'], ['banana', '🍌'], ['ball', '🏀'], ['balloon', '🎈']], tts: 'b' },
  { id: 'k', show: 'c', kind: 'stop', tip: 'Say "k-", not "kuh". Written c, k or ck.', words: [['cat', '🐱'], ['camel', '🐫'], ['camera', '📷'], ['king', '🤴'], ['koala', '🐨'], ['kangaroo', '🦘']], tts: 'k' },
  { id: 'd', show: 'd', kind: 'stop', tip: 'Say "d-", not "duh".', words: [['dog', '🐶'], ['duck', '🦆'], ['dragon', '🐉'], ['dolphin', '🐬'], ['door', '🚪']], tts: 'd' },
  { id: 'f', show: 'f', kind: 'cont', tip: 'Say "fff", not "fuh". Hold it for a second.', words: [['fish', '🐟'], ['frog', '🐸'], ['fox', '🦊'], ['flower', '🌸'], ['fork', '🍴']], tts: 'fff' },
  { id: 'g', show: 'g', kind: 'stop', tip: 'Say "g-", not "guh".', words: [['goat', '🐐'], ['gift', '🎁'], ['guitar', '🎸'], ['girl', '👧'], ['goose', '🪿']], tts: 'g' },
  { id: 'h', show: 'h', kind: 'cont', tip: 'Say "h-" (a breath), not "huh".', words: [['hat', '👒'], ['hand', '✋'], ['house', '🏠'], ['hippo', '🦛'], ['hammer', '🔨']], tts: 'h' },
  { id: 'j', show: 'j', kind: 'stop', tip: 'Say "j-", not "juh".', words: [['jam', '🍓'], ['jet', '✈️'], ['jeans', '👖'], ['juice', '🧃'], ['jar', '🫙']], tts: 'j' },
  { id: 'l', show: 'l', kind: 'cont', tip: 'Say "lll", not "ull" or "luh". Try saying "lion" but stop before "ion".', words: [['lion', '🦁'], ['lemon', '🍋'], ['leaf', '🍃'], ['lizard', '🦎'], ['lollipop', '🍭']], tts: 'lll' },
  { id: 'm', show: 'm', kind: 'cont', tip: 'Say "mmm", not "muh". Hold it for a second.', words: [['moon', '🌙'], ['monkey', '🐒'], ['mouse', '🐭'], ['map', '🗺️'], ['milk', '🥛']], tts: 'mmm' },
  { id: 'n', show: 'n', kind: 'cont', tip: 'Say "nnn", not "nuh".', words: [['nose', '👃'], ['nut', '🥜'], ['ninja', '🥷'], ['nurse', '🧑‍⚕️'], ['night', '🌃']], tts: 'nnn' },
  { id: 'p', show: 'p', kind: 'stop', tip: 'Say "p-", not "puh". Just a puff of air.', words: [['pig', '🐷'], ['panda', '🐼'], ['penguin', '🐧'], ['pumpkin', '🎃'], ['pineapple', '🍍']], tts: 'p' },
  { id: 'kw', show: 'qu', kind: 'stop', tip: 'Say "kw", not "kwuh". Try saying "queen" but stop before "ee".', words: [['queen', '👸'], ['quilt', '🛏️'], ['quack', '🦆']], tts: 'kw' },
  { id: 'r', show: 'r', kind: 'cont', tip: 'Say "rrr", not "ruh".', words: [['rabbit', '🐰'], ['rainbow', '🌈'], ['rocket', '🚀'], ['robot', '🤖'], ['rose', '🌹']], tts: 'rrr' },
  { id: 's', show: 's', kind: 'cont', tip: 'Say "sss", not "suh". Hold it like a snake.', words: [['sun', '☀️'], ['snake', '🐍'], ['sock', '🧦'], ['snail', '🐌'], ['swan', '🦢']], tts: 'sss' },
  { id: 't', show: 't', kind: 'stop', tip: 'Say "t-", not "tuh".', words: [['tiger', '🐯'], ['tent', '⛺'], ['tree', '🌳'], ['train', '🚆'], ['turtle', '🐢']], tts: 't' },
  { id: 'v', show: 'v', kind: 'cont', tip: 'Say "vvv", not "vuh".', words: [['van', '🚐'], ['volcano', '🌋'], ['violin', '🎻'], ['vest', '🦺'], ['vase', '🏺']], tts: 'vvv' },
  { id: 'w', show: 'w', kind: 'cont', tip: 'Say "www", not "wuh".', words: [['water', '💧'], ['window', '🪟'], ['watch', '⌚'], ['worm', '🪱'], ['waves', '🌊']], tts: 'www' },
  { id: 'ks', show: 'x', kind: 'stop', tip: 'Say "ks" (the end of "box").', words: [['box', '📦'], ['fox', '🦊'], ['ox', '🐂'], ['socks', '🧦'], ['taxi', '🚕']], tts: 'ks' },
  { id: 'y', show: 'y', kind: 'cont', tip: 'Say "yee", not "yuh". Try saying "yo" but stop before "oh".', words: [['yarn', '🧶'], ['yoyo', '🪀'], ['yellow', '💛'], ['yogurt', '🥣'], ['yolk', '🍳']], tts: 'y' },
  { id: 'z', show: 'z', kind: 'cont', tip: 'Say "zzz" like a bee, not "sss".', words: [['zebra', '🦓'], ['zoo', '🦁'], ['zipper', '🤐'], ['lizard', '🦎'], ['wizard', '🧙']], tts: 'zzz' },

  // consonant digraphs
  { id: 'sh', show: 'sh', kind: 'cont', tip: 'The "shhh" in "shell".', words: [['ship', '🚢'], ['shark', '🦈'], ['shoe', '👟'], ['sheep', '🐑'], ['shell', '🐚']], tts: 'shh' },
  { id: 'ch', show: 'ch', kind: 'stop', tip: 'The "ch" in "cheese". Short, no "uh".', words: [['cheese', '🧀'], ['chair', '🪑'], ['chicken', '🐔'], ['cherry', '🍒'], ['chick', '🐤']], tts: 'ch' },
  { id: 'th', show: 'th', kind: 'cont', tip: 'The quiet "th" in "thin". Fingers on throat: it stays still.', words: [['thumb', '👍'], ['thunder', '⛈️'], ['bath', '🛁'], ['toothpaste', '🪥']], tts: 'th' },
  { id: 'dh', show: 'th', kind: 'cont', tip: 'The buzzy "th" in "this". Fingers on throat: it vibrates.', words: [['this', '👉'], ['that', '👈'], ['feather', '🪶'], ['mother', '👩'], ['father', '👨']], tts: 'th' },
  { id: 'wh', show: 'wh', kind: 'cont', tip: 'Like "www" while blowing air. Saying it just like "w" is fine too.', words: [['whale', '🐋'], ['wheel', '🛞'], ['whisk', '🥄']], tts: 'www' },
  { id: 'ng', show: 'ng', kind: 'cont', tip: 'The hum at the end of "sing" ("nnng"). Keep it nasal, no "g" pop.', words: [['ring', '💍'], ['king', '🤴'], ['wing', '🪽'], ['swing', '🛝']], tts: 'ng' },
  { id: 'zh', show: 'zh', kind: 'cont', tip: 'The "zh" in "treasure": like "sh" but buzzy.', words: [['treasure', '💰'], ['explosion', '💥']], tts: 'zh' },

  // long vowels and vowel teams
  { id: 'ae', show: 'a_e', kind: 'vowel', tip: 'The "a" in "cake" (says its name).', words: [['cake', '🎂'], ['train', '🚆'], ['snake', '🐍'], ['plane', '✈️'], ['rain', '🌧️']], tts: 'ay' },
  { id: 'ee', show: 'ee', kind: 'vowel', tip: 'The "ee" in "bee".', words: [['bee', '🐝'], ['tree', '🌳'], ['eagle', '🦅'], ['key', '🔑'], ['sheep', '🐑']], tts: 'ee' },
  { id: 'ie', show: 'i_e', kind: 'vowel', tip: 'Say it like the word "eye".', words: [['kite', '🪁'], ['pie', '🥧'], ['bike', '🚲'], ['light', '💡'], ['fly', '🪰']], tts: 'eye' },
  { id: 'oe', show: 'o_e', kind: 'vowel', tip: 'The "o" in "go".', words: [['bone', '🦴'], ['boat', '⛵'], ['coat', '🧥'], ['toast', '🍞'], ['ghost', '👻']], tts: 'oh' },
  { id: 'oo', show: 'oo', kind: 'vowel', tip: 'The long "oo" in "moon".', words: [['moon', '🌙'], ['boot', '👢'], ['glue', '🧴'], ['broom', '🧹'], ['soup', '🍲']], tts: 'ooo' },
  { id: 'uu', show: 'oo', kind: 'vowel', tip: 'The short "oo" in "book".', words: [['book', '📖'], ['cook', '🧑‍🍳'], ['wolf', '🐺'], ['foot', '🦶'], ['bush', '🌳']], tts: 'uu' },
  { id: 'yoo', show: 'u_e', kind: 'vowel', tip: 'Say it like the word "you".', words: [['cube', '🧊'], ['unicorn', '🦄'], ['music', '🎵'], ['mule', '🫏'], ['computer', '💻']], tts: 'you' },
  { id: 'ow', show: 'ow', kind: 'vowel', tip: 'The "ow" in "cow".', words: [['cow', '🐮'], ['owl', '🦉'], ['house', '🏠'], ['cloud', '☁️'], ['crown', '👑']], tts: 'ow' },
  { id: 'oi', show: 'oi', kind: 'vowel', tip: 'The "oy" in "boy".', words: [['boy', '👦'], ['toy', '🧸'], ['coin', '🪙'], ['oil', '🛢️'], ['oyster', '🦪']], tts: 'oy' },
  { id: 'ar', show: 'ar', kind: 'vowel', tip: 'The "ar" in "car" (an r-controlled vowel).', words: [['car', '🚗'], ['star', '⭐'], ['farm', '🚜'], ['shark', '🦈'], ['arm', '💪']], tts: 'ar' },
  { id: 'or', show: 'or', kind: 'vowel', tip: 'The "or" in "corn".', words: [['corn', '🌽'], ['horse', '🐴'], ['fork', '🍴'], ['orange', '🍊'], ['door', '🚪']], tts: 'or' },
  { id: 'er', show: 'er', kind: 'vowel', tip: 'The "er" in "her". er, ir and ur all sound the same.', words: [['bird', '🐦'], ['turtle', '🐢'], ['girl', '👧'], ['shirt', '👕'], ['burger', '🍔']], tts: 'er' },
];

export const SOUND = Object.fromEntries(SOUNDS.map(s => [s.id, s]));

// "Sound comparisons" from the book: pairs kids confuse. Used for listening games.
export const COMPARISONS = [
  { a: 'l', b: 'r', pairs: [['lip', 'rip'], ['lamp', 'ramp'], ['light', 'right'], ['load', 'road']] },
  { a: 'w', b: 'v', pairs: [['wet', 'vet'], ['west', 'vest'], ['wine', 'vine']] },
  { a: 's', b: 'th', pairs: [['sink', 'think'], ['sick', 'thick'], ['sank', 'thank']] },
  { a: 'b', b: 'v', pairs: [['bat', 'vat'], ['ban', 'van'], ['bow', 'vow']] },
  { a: 's', b: 'sh', pairs: [['sip', 'ship'], ['sore', 'shore'], ['sue', 'shoe']] },
  { a: 'ch', b: 'sh', pairs: [['chip', 'ship'], ['chop', 'shop'], ['chew', 'shoe']] },
  { a: 'j', b: 'y', pairs: [['jam', 'yam'], ['jell', 'yell'], ['jet', 'yet']] },
  { a: 'f', b: 'p', pairs: [['fan', 'pan'], ['fin', 'pin'], ['fat', 'pat']] },
  { a: 'g', b: 'k', pairs: [['gold', 'cold'], ['goat', 'coat'], ['gate', 'kate']] },
  { a: 'e', b: 'i', pairs: [['bet', 'bit'], ['pen', 'pin'], ['set', 'sit'], ['red', 'rid'], ['fell', 'fill']] },
  { a: 'a', b: 'e', pairs: [['bat', 'bet'], ['pan', 'pen'], ['pat', 'pet']] },
  { a: 'o', b: 'u', pairs: [['cot', 'cut'], ['hot', 'hut'], ['cop', 'cup'], ['lock', 'luck']] },
];
