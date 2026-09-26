# Sound Hop 🐸

A phonics PWA that takes a young child from letter sounds to reading early books (Hop on Pop / Green Eggs and Ham level). It follows the Mentava / Direct Instruction approach:

- lowercase letters and letter **sounds** (not names)
- sounds pronounced exactly (`mmm`, not `muh`), recorded by the parent
- blending without pauses: finger-slide under words, plus a mic "keep the bird flying" game
- mastery gating, immediate correction, spaced-repetition warm-ups and cumulative review
- letter-team color scaffolding that fades with mastery
- decodable words, sentences and stories that only use what's been taught (checked by `tools/validate.mjs`)

## Structure
- `js/sounds.js`: the 44 sounds, with pronunciation notes and example words
- `js/phonics.js`: word → grapheme/sound tokens
- `js/curriculum.js`: the 93-level path across 4 stages
- `js/content/`: word bank, sentences, yes/no questions, stories
- `js/engine.js`: builds each level's activity sequence
- `js/activities.js`, `js/app.js`, `js/parent.js`: the UI

## Dev
Static site with no build step. Serve the folder (e.g. `npx serve .`) and run `node tools/validate.mjs --report` after changing content.
