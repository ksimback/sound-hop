// Decodable stories, one per 'story' level in curriculum.js. Every page is readable with only
// what the child knows at that level (checked by tools/validate.mjs). Quiz questions are read
// aloud to the child, so they need not be decodable; options are emoji.
export const STORIES = {
  s1: {
    title: 'Sam and the Cat',
    pages: [
      { text: 'Sam got a hat.', pic: '🧒👒' },
      { text: 'Sam sat in the sun.', pic: '🧒☀️' },
      { text: 'a cat sat on the hat!', pic: '🐱👒' },
      { text: 'the cat hid in the hat.', pic: '👒🐾' },
      { text: 'Sam got the hat. a cat!', pic: '🧒😲🐱' },
      { text: 'the cat can hug Sam.', pic: '🐱🤗🧒' },
      { text: 'Sam can nap. the cat can nap.', pic: '🧒🐱😴' },
    ],
    quiz: [
      { q: 'What did Sam get?', options: ['👒', '🚗', '🍎'], answer: 0 },
      { q: 'Who hid in the hat?', options: ['🐶', '🐱', '🐷'], answer: 1 },
      { q: 'What did Sam and the cat do at the end?', options: ['🏊', '🎂', '😴'], answer: 2 },
    ],
  },

  s2: {
    title: 'The Red Bug',
    pages: [
      { text: 'a red bug sat on a log.', pic: '🐞🪵' },
      { text: 'the bug is sad.', pic: '🐞😢' },
      { text: 'the bug can not get up the hill.', pic: '🐞⛰️' },
      { text: 'a big hen ran to the bug.', pic: '🐔🐞' },
      { text: 'the bug hid in the mud!', pic: '🐞🟫' },
      { text: 'the hen is not bad. the hen is a pal.', pic: '🐔😊' },
      { text: 'the bug got on the hen. up the hill!', pic: '🐔🐞⛰️' },
      { text: 'the red bug is not sad.', pic: '🐞😊' },
    ],
    quiz: [
      { q: 'What color was the bug?', options: ['🟥', '🟦', '🟩'], answer: 0 },
      { q: 'Who helped the bug?', options: ['🐱', '🐔', '🐶'], answer: 1 },
      { q: 'Where did the bug want to go?', options: ['⛰️', '🌊', '🏠'], answer: 0 },
    ],
  },

  s3: {
    title: 'Max the Fox',
    pages: [
      { text: 'Max is a red fox.', pic: '🦊' },
      { text: 'Max got a big box.', pic: '🦊📦' },
      { text: 'Max sat in the box. yes!', pic: '🦊📦' },
      { text: 'a wet pup ran up. yip!', pic: '🐶💦' },
      { text: 'the pup is sad. it is wet.', pic: '🐶😢' },
      { text: 'Max got up. Max let the pup in.', pic: '🦊🐶📦' },
      { text: 'the pup is not wet. the pup is not sad.', pic: '🐶😊' },
      { text: 'Max can nap. the pup can nap.', pic: '🦊🐶😴' },
    ],
    quiz: [
      { q: 'What did Max find?', options: ['🚗', '📦', '🍎'], answer: 1 },
      { q: 'Who came and was all wet?', options: ['🐶', '🐱', '🐸'], answer: 0 },
      { q: 'How did the pup feel at the end?', options: ['😢', '😠', '😊'], answer: 2 },
    ],
  },

  s4: {
    title: 'The Ship',
    pages: [
      { text: 'Sam got a big red ship.', pic: '🧒🚢' },
      { text: 'Sam is on the ship with a duck.', pic: '🚢🦆' },
      { text: 'the duck said, quack quack!', pic: '🦆' },
      { text: 'a big fish is on the deck!', pic: '🐟🚢' },
      { text: 'the fish said, I wish I had a hat.', pic: '🐟💭👒' },
      { text: 'Sam got a hat. it is red.', pic: '🧒👒' },
      { text: 'Sam set the hat on the fish.', pic: '🐟👒' },
      { text: 'the fish in the red hat is a big hit!', pic: '🐟👒✨' },
      { text: 'the fish did a jig. quack! said the duck.', pic: '🐟🦆🎉' },
    ],
    quiz: [
      { q: 'What animal was on the ship with Sam?', options: ['🦆', '🐱', '🐷'], answer: 0 },
      { q: 'What did the fish wish for?', options: ['🍎', '👒', '🚗'], answer: 1 },
      { q: 'What color was the ship?', options: ['🟦', '🟨', '🟥'], answer: 2 },
    ],
  },

  s5: {
    title: 'The Big Swim',
    pages: [
      { text: 'Max the fox has a big swim ring.', pic: '🦊🛟' },
      { text: 'Max went to the pond with his pal Sam.', pic: '🦊🧒' },
      { text: 'the sun was hot. Sam got in. splash!', pic: '☀️🧒💦' },
      { text: 'a frog sat on a log. the frog said, jump in, Max!', pic: '🐸🪵' },
      { text: 'Max can not swim well. Max held his ring.', pic: '🦊🛟' },
      { text: 'Sam and the frog swam fast. Max swam in his ring.', pic: '🧒🐸🦊' },
      { text: 'the frog said, kick, kick, kick!', pic: '🐸🦵' },
      { text: 'Max did kick. Max swam and swam. Max can swim!', pic: '🦊🏊🎉' },
      { text: 'then Max, Sam and the frog had a snack on the sand.', pic: '🦊🧒🐸' },
    ],
    quiz: [
      { q: 'Where did they swim?', options: ['🏠', '🏞️', '🚗'], answer: 1 },
      { q: 'Who said "jump in"?', options: ['🐸', '🐶', '🐱'], answer: 0 },
      { q: 'What did Max hold on to?', options: ['🚲', '👒', '🛟'], answer: 2 },
    ],
  },

  s6: {
    title: 'Jake and the Kite',
    pages: [
      { text: 'Jake has a kite. it is red and white.', pic: '🧒🪁' },
      { text: 'Jake and his dog Rex go up the hill.', pic: '🧒🐶⛰️' },
      { text: 'the wind is strong. the kite can go up, up, up!', pic: '🌬️🪁' },
      { text: 'Jake runs and runs. the kite rides on the wind.', pic: '🧒🏃🪁' },
      { text: 'then the wind stops. the kite drops in a pine!', pic: '🪁🌲' },
      { text: 'Jake is sad. Rex is sad.', pic: '🧒🐶😢' },
      { text: 'Rex has a plan. he jumps up on a stone.', pic: '🐶🪨' },
      { text: 'Rex can not get the kite. it is in the pine.', pic: '🐶🌲' },
      { text: 'then the wind came back. up went the kite!', pic: '🌬️🪁' },
      { text: 'Jake gave Rex a bone. yum!', pic: '🧒🐶🦴' },
    ],
    quiz: [
      { q: 'What did Jake have?', options: ['🚲', '🪁', '⚽'], answer: 1 },
      { q: 'Where did the kite get stuck?', options: ['🌲', '🏠', '🚗'], answer: 0 },
      { q: 'What did Rex get at the end?', options: ['🍎', '🧸', '🦴'], answer: 2 },
    ],
  },

  s7: {
    title: 'The Rain Train',
    pages: [
      { text: 'chug, chug! it is the Rain Train.', pic: '🚆🌧️' },
      { text: 'the Rain Train rides on the tracks in the rain.', pic: '🚆🌧️' },
      { text: 'a wet goat is by the tracks. I need a ride! said the goat.', pic: '🐐💦' },
      { text: 'hop on! said the train. the goat got on.', pic: '🐐🚆' },
      { text: 'next, a sheep, a snail and a toad hop on.', pic: '🐑🐌' },
      { text: 'the train is so slow. the snail likes it slow.', pic: '🐌🚆' },
      { text: 'then the rain stops. the sun is bright.', pic: '☀️' },
      { text: 'the goat, the sheep, the snail and the toad play in the sun.', pic: '🐐🐑☀️' },
      { text: 'at night, the train rests. sleep tight, Rain Train!', pic: '🚆🌃😴' },
    ],
    quiz: [
      { q: 'Who got on the train first?', options: ['🐶', '🐐', '🐔'], answer: 1 },
      { q: 'What came out when the rain stopped?', options: ['☀️', '🌙', '❄️'], answer: 0 },
      { q: 'Which slow animal liked the slow train?', options: ['🐇', '🐆', '🐌'], answer: 2 },
    ],
  },

  s8: {
    title: 'The Owl and the Moon',
    pages: [
      { text: 'hoot! an owl sat in a tree at night.', pic: '🦉🌳🌃' },
      { text: 'the owl can see the moon. it is big and round.', pic: '🦉🌕' },
      { text: 'the owl said, I wish I had the moon. it can be my toy!', pic: '🦉🌕🧸' },
      { text: 'the owl flew up, up, up. but the moon was too high.', pic: '🦉🌕' },
      { text: 'the owl flew down to a cow. can you get me the moon?', pic: '🦉🐮' },
      { text: 'the cow said, moo! I can not. but look in the pool.', pic: '🐮💧' },
      { text: 'the owl took a look. the moon was in the pool!', pic: '🦉💧🌕' },
      { text: 'the owl sat by the pool with the moon, and the cow sat too.', pic: '🦉🌕🐮' },
      { text: 'good night, moon! said the owl. hoot hoot!', pic: '🦉🌕😴' },
    ],
    quiz: [
      { q: 'Where did the owl sit at the start?', options: ['🏠', '🌳', '🚗'], answer: 1 },
      { q: 'Who did the owl ask for help?', options: ['🐷', '🐶', '🐮'], answer: 2 },
      { q: 'Where did the owl find the moon?', options: ['💧', '🍎', '👒'], answer: 0 },
    ],
  },

  s9: {
    title: 'The Farm Party',
    pages: [
      { text: 'it is a big day on the farm.', pic: '🚜☀️' },
      { text: 'the cow, the pig and the horse are in the barn.', pic: '🐮🐷🐴' },
      { text: 'let us all play and eat! said the cow.', pic: '🐮🎉' },
      { text: 'the pig got corn. the horse got hay.', pic: '🐷🌽🐴' },
      { text: 'the hen made a big cake. it had a star on top.', pic: '🐔🎂⭐' },
      { text: 'the dog did a trick. he spun on his paws.', pic: '🐶🐾' },
      { text: 'the bird sang a song. the cat sang too.', pic: '🐦🐱🎵' },
      { text: 'then a storm came. it was dark. boom!', pic: '⛈️' },
      { text: 'all the farm pals ran in the barn. it was snug and dry.', pic: '🐮🐷🐔' },
      { text: 'the storm did not stop the fun. this is the best farm! said the cow.', pic: '🐮🎉' },
    ],
    quiz: [
      { q: 'Where was the party?', options: ['🏫', '🏖️', '🚜'], answer: 2 },
      { q: 'What was on top of the cake?', options: ['⭐', '🍒', '🕯️'], answer: 0 },
      { q: 'What came and made it dark?', options: ['☀️', '⛈️', '🌈'], answer: 1 },
    ],
  },

  s10: {
    title: 'The Lost Puppy',
    pages: [
      { text: 'Ben has a little puppy named Pip.', pic: '🧒🐶' },
      { text: 'Pip likes to run, jump and dig.', pic: '🐶' },
      { text: 'one day, Ben looked and looked. where was Pip?', pic: '🧒❓' },
      { text: 'Ben looked in the kitchen. no Pip!', pic: '🍳' },
      { text: 'Ben looked under the bed. no Pip!', pic: '🛏️' },
      { text: 'Ben asked the cat. have you seen Pip? the cat just yawned.', pic: '🐱🥱' },
      { text: 'Ben went out to the garden. he called, Pip! Pip!', pic: '🧒📢' },
      { text: 'then Ben saw a pile of socks by the shed. the socks wiggled!', pic: '🧦' },
      { text: 'there was Pip, with a sock on his nose!', pic: '🐶🧦' },
      { text: 'Ben hugged Pip. silly puppy! I love you.', pic: '🧒🐶❤️' },
    ],
    quiz: [
      { q: 'Where was Pip hiding?', options: ['🛏️', '🧦', '🍳'], answer: 1 },
      { q: 'Who yawned?', options: ['🐱', '🐶', '🐮'], answer: 0 },
      { q: 'How did Ben feel when he found Pip?', options: ['😠', '😴', '😊'], answer: 2 },
    ],
  },

  s11: {
    title: 'Fox Can Not Stop',
    pages: [
      { text: 'once there was a very kind fox named Fox.', pic: '🦊' },
      { text: 'one day, Fox ate his lunch very, very fast. then... hic!', pic: '🦊🍽️' },
      { text: 'Fox had the hiccups. hic! hic! hic! Fox can not stop!', pic: '🦊😮' },
      { text: 'Fox went to his friend Frog. drink some water, said Frog.', pic: '🦊🐸💧' },
      { text: 'Fox drank and drank. hic! it did not work.', pic: '🦊💧' },
      { text: 'Fox went to his friend Owl. stand on one leg and count to ten, said Owl.', pic: '🦊🦉' },
      { text: 'Fox stood on one leg. one, two, three... hic! Fox fell over.', pic: '🦊🤸' },
      { text: 'Fox was sad. I will hic forever! he said.', pic: '🦊😢' },
      { text: 'then a little mouse jumped out from under a rock. BOO!', pic: '🐭🪨' },
      { text: 'Fox jumped up very high. then he sat still. no hic!', pic: '🦊😲' },
      { text: 'you did it, Mouse! said Fox. and they all had a picnic.', pic: '🦊🐭🧺' },
      { text: 'and Fox ate his lunch very, very slowly.', pic: '🦊🥪' },
    ],
    quiz: [
      { q: 'Who told Fox to drink water?', options: ['🦉', '🐸', '🐭'], answer: 1 },
      { q: 'Who stopped the hiccups by saying BOO?', options: ['🐭', '🐸', '🦉'], answer: 0 },
      { q: 'What did they all have at the end?', options: ['🚗', '🎈', '🧺'], answer: 2 },
    ],
  },

  s12: {
    title: 'The Best Day',
    pages: [
      { text: 'Sam woke up. the sun was up. this will be the best day, said Sam.', pic: '🧒☀️' },
      { text: 'Sam ran to the park. there was Max the fox, and Pip the puppy, and Jake with his kite.', pic: '🦊🐶🪁' },
      { text: 'let us play! said Max. what can we play? said Pip.', pic: '🦊🐶' },
      { text: 'they played tag. they jumped in the puddles. splish, splash!', pic: '🧒💦' },
      { text: 'then they had a picnic on a big red blanket. sandwiches, apples and cake!', pic: '🧺🥪🍎' },
      { text: 'would you like some cake? said Jake. yes, I would! said Max.', pic: '🎂🦊' },
      { text: 'I would like it on a boat. I would like it with a goat!', pic: '🎂⛵🐐' },
      { text: 'a frog on a log. a dog on a frog. a pig in a wig!', pic: '🐸🐶🐷' },
      { text: 'then Sam found a book under a tree. Sam sat down and read it to them.', pic: '🧒📖🌳' },
      { text: 'Sam could read it all! Max clapped. Pip barked. Jake jumped up and down.', pic: '🧒📖👏' },
      { text: 'you are a reader, Sam! said Max.', pic: '⭐🧒' },
      { text: 'at night, Sam went to bed with a big smile. this was the best day.', pic: '🛏️😊' },
    ],
    quiz: [
      { q: 'Where did Sam meet his friends?', options: ['🏫', '🏞️', '🏥'], answer: 1 },
      { q: 'What did Sam find under the tree?', options: ['📖', '⚽', '🍎'], answer: 0 },
      { q: 'How did Sam feel at the end of the day?', options: ['😢', '😠', '😊'], answer: 2 },
    ],
  },
};
