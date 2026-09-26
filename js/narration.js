// Everything Hopper says, in one place. Written for a 5-year-old: slow, warm, one idea per
// sentence, and a full explanation the first time each kind of activity appears in a lesson.
// Parts: strings are spoken, {sound} plays a parent recording, {blend} chains recordings,
// {pause} waits. Letters are never called by name (Mentava: sounds, not names).
import { keyLabel, keySound } from './phonics.js';
import { pick } from './ui.js';

const S = (id) => ({ sound: id });
const P = (ms) => ({ pause: ms });
const count = (n) => ['', 'one', 'two', 'three', 'four', 'five'][n] ?? String(n);

// ---------- lesson openings ----------
export function lessonOpening(level, newKeys, name, returning, canRead) {
  const hi = pick(returning ? [`Hi ${name}!`, `Hello ${name}!`, `Welcome back, ${name}!`] : [`Hi ${name}!`, `Hello ${name}!`]);
  switch (level.type) {
    case 'new': {
      if (!newKeys.length) return [hi, "Today we're going to read longer words, with more sounds in a row.", 'Remember to say every sound, and keep your voice going.', "Let's begin!"];
      const n = newKeys.length;
      const parts = [hi, `Today we're going to learn ${n === 1 ? 'a new sound' : count(n) + ' new sounds'}!`];
      newKeys.forEach((k, i) => {
        const which = n === 1 ? 'Here it is.' : i === 0 ? 'Here is the first one.' : i === n - 1 ? (n === 2 ? 'And here is the second one.' : 'And here is the last one.') : 'Here is the next one.';
        const team = keyLabel(k).replace('_', '').length > 1;
        parts.push(which, team ? 'These letters say' : 'This letter says', S(keySound(k)));
      });
      parts.push(P(400), n === 1 ? "First we'll meet it, and then you'll practice it." : "First we'll meet each one, and then you'll practice them.");
      if (canRead) parts.push(`Then we'll read some words and sentences with ${n === 1 ? 'it' : 'them'}.`);
      parts.push("Let's begin!");
      return parts;
    }
    case 'ready': return [hi, "Today we're going to practice two big reading skills.", 'First, reading from left to right, like a frog hopping across the lily pads.', 'Then, listening to sounds and putting them together to make a word.', "Let's begin!"];
    case 'heart': return [hi, "Today we're going to learn some heart words.", "Heart words are special words that don't follow the usual rules.", 'So we learn them by heart!', "Let's meet them."];
    case 'review': return [hi, 'Today is a practice day!', "We'll practice the sounds and words you already know, so they stay strong in your brain.", "Let's begin!"];
    case 'check': return [hi, "Today is a big check! It's a chance to show everything you've learned.", "Take your time, and listen carefully. You can tap the speaker to hear things again.", "Let's begin!"];
    case 'story': return [hi, "It's story time!", 'Today, you are going to read a whole story, all by yourself.', 'Read each page out loud. If a word is tricky, tap it, and I will help you sound it out.', 'When you finish a page, tap next page.', "Let's read!"];
    case 'warmup': return [hi, "Let's warm up first!", "I'll ask you about some things you learned before, so you don't forget them.", 'Ready?'];
  }
  return [hi];
}

// ---------- meeting a new sound ----------
export function introScript(key, words) {
  const s = keySound(key), label = keyLabel(key);
  const parts = [];
  if (label.includes('_')) {
    parts.push('Look at this vowel, and the e at the end.', 'The e is a magic e. It is quiet, but it makes the vowel say its name.', 'Here, the vowel says', S(s));
  } else if (label.length > 1) {
    parts.push('Look at these letters. They are a team!', 'When they are together, they make one sound:', S(s));
  } else {
    parts.push('Look at this letter.', 'This letter says', S(s));
  }
  parts.push(P(300), 'Listen again:', S(s), P(300), 'Now you say it!', P(2200), 'Great job!');
  if (words.length) {
    parts.push('Listen for', S(s), 'in these words.');
    words.slice(0, 3).forEach(w => parts.push(w.word, P(300)));
  }
  parts.push('When you are ready, tap next.');
  return parts;
}

export function heartIntroScript(word) {
  return ['Here is a heart word.', 'This word says', word, P(300), 'Listen again:', word, P(300), 'Now you say it!', P(1800), 'Good! Look at it closely, so you remember it.', 'When you are ready, tap next.'];
}

// ---------- activity prompts: full the first time in a lesson, short after ----------
export const PROMPTS = {
  tapSound: (st, first) => {
    const s = S(keySound(st.key));
    return first
      ? ["Now it's your turn!", 'I am going to make a sound.', 'Then you tap the letter below that makes that sound.', 'Listen carefully.', P(300), s, P(300), 'Which letter says', s, 'Tap it!']
      : ['Listen:', s, P(300), 'Which letter says', s];
  },
  firstSound: (st, first) => first
    ? ['Look at the picture.', 'This is:', st.word, P(300), 'Listen to the very first sound in', st.word, P(300), 'Now tap the letter that makes that first sound.']
    : ['This is:', st.word, P(300), 'What sound does', st.word, 'start with?'],
  oralBlend: (st, first) => {
    const b = { blend: st.entry.toks.filter(t => t.s !== '_').map(t => t.s) };
    return first
      ? ["Let's be sound detectives!", 'I will say the sounds of a word, slowly and stretched out.', 'Put the sounds together in your head, to make the word.', 'Then tap the picture that matches.', 'Listen:', b, P(500), 'What word is that?']
      : ['Listen:', b, P(500), 'What word is that?'];
  },
  dir: (st, first, target) => first
    ? ['We always read from left to right, like the arrow shows.', 'I will say two words stuck together.', 'Tap the pictures that are in the same order, going from left to right.', 'Which one says:', target]
    : ['Which one says:', target],
  readWord: (st, first) => first
    ? ['Now you get to read a word!', 'Put your finger on the frog, and slide it slowly under the word.', 'You will hear each sound. Say the sounds with me, without stopping.', 'Then say them fast, to make the word.', 'Then tap the picture that matches the word.']
    : pick([['Read this word. Then tap its picture.'], ['What does this word say? Tap its picture.'], ['Slide the frog if you need help. Then tap the picture.']]),
  pickWord: (st, first) => first
    ? ['Listen to this word:', st.entry.word, P(300), 'Now find the word that says', st.entry.word, 'Look carefully at every letter!']
    : ['Find the word that says:', st.entry.word],
  heartPick: (st, first) => first
    ? ["Let's find heart words!", 'I will say a word. You tap the word that says it.', 'Find:', st.word]
    : ['Find the word:', st.word],
  sentence: (st, first) => first
    ? ['Now you are going to read a whole sentence!', 'Read each word out loud, from left to right.', 'If a word is tricky, tap it, and I will help.', 'Then tap the picture that matches the sentence.']
    : pick([['Read the sentence out loud. Then tap the picture that matches.'], ['Read it, then find the matching picture.']]),
  yesno: (st, first) => first
    ? ['Here is a silly question!', 'Read it out loud.', 'If the answer is yes, tap thumbs up.', 'If the answer is no, tap thumbs down.']
    : pick([['Read the question. Yes, or no?'], ['Here is another one. Yes, or no?']]),
  compare: (st, first) => first
    ? ["Let's listen really carefully.", 'Some sounds are almost the same!', 'I will say a word. Tap the sound you hear in it.', 'Listen:', st.word, P(400), 'Do you hear', S(st.a), 'or', S(st.b)]
    : ['Listen:', st.word, P(400), 'Do you hear', S(st.a), 'or', S(st.b)],
  voice: (st, first) => first
    ? ["This is the flying bird game!", 'Slide the bird under the word, and say each sound out loud as you go.', 'Keep your voice going, without stopping, and the bird keeps flying!', 'If you stop, the bird falls down. Then you can try again.', 'Ready? Slide and say!']
    : ['Slide and say the sounds. Keep your voice going!'],
  quiz: (st, first) => first
    ? ["Let's see what you remember about the story.", st.q.q]
    : [st.q.q],
};

// ---------- feedback ----------
export const WRONG = {
  tapSound: (st) => { const s = S(keySound(st.key)); return ['Not quite.', 'Listen again:', s, P(300), 'This letter says', s, 'Tap it!']; },
  firstSound: (st) => [st.word, 'starts with', S(keySound(st.key)), P(300), 'Tap that letter!'],
  oralBlend: (st) => { const b = { blend: st.entry.toks.filter(t => t.s !== '_').map(t => t.s) }; return ['Listen again:', b, P(300), 'That makes', st.entry.word, 'Tap the', st.entry.word, '!']; },
  pickWord: (st) => ['Not quite. Look at every letter.', 'This one says', st.entry.word, 'Tap it!'],
  heartPick: (st) => ['Not quite. This one says', st.word, 'Tap it!'],
  sentence: (st) => ['Let me read it to you.', st.s.text, P(300), 'Now find the picture that matches.'],
  yesno: (st) => ['Let me read it to you.', st.q.text, P(300), 'Think about it. Yes, or no?'],
  compare: (st) => ['Listen again:', st.word, P(300), 'It has', S(st.answer), P(300), 'Listen to both words:', st.pair[0], P(300), st.pair[1]],
  quiz: () => ['Hmm, not quite. Try again!'],
};

export const PRAISE = ['Great job!', 'You got it!', 'Awesome!', 'Super!', 'Yes! Well done!', 'Wow!', 'Brilliant!', 'Hooray!', 'Way to go!', 'You are working so hard!'];
