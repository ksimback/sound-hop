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

## Narration voice
iPhone web apps can only use the basic system voices, so narration is pre-generated with OpenAI TTS (`gpt-4o-mini-tts`, voice "coral") into `audio/n/<hash>.mp3`. The phone voice is only a fallback.
- `node tools/phrases.mjs`: lists every phrase the app can speak (all literals in `js/narration.js` plus all content)
- `node tools/gen-voice.mjs`: generates missing clips (needs `OPENAI_API_KEY` in `.env`), trims silence gently, removes stale clips
- `node tools/verify-voice.mjs` then `node tools/judge-voice.mjs --delete`: transcribes every clip, has an audio model re-check mismatches, and deletes bad clips so `gen-voice` can redo them

After editing narration or content, rerun `gen-voice`, then the two checks.
