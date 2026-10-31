# Bake page (one-tap voice baking on the phone)

Built 2026-10-31 at Tom's request. Tom opens the game, taps ADMIN, then BAKE VOICES, taps one button, and the lines that need a clip are baked with ElevenLabs and saved on his phone. No file is sent anywhere or merged.

## How it works

| Piece | File | What it does |
|---|---|---|
| The page | `bake.html` | Loads `data/bake-list.json`, sends each line's script to ElevenLabs (same call, model, voice settings and retry rules as the other bakers), keeps the mp3 in IndexedDB `aot-local-clips`. Per line: Play, New take. Also Export clips and Remove clips. |
| The list | `data/bake-list.json` | Built by `node tools/bake-page/make-list.js` from `tools/bake-page/pending.json`. Holds every line to bake (id, kind, voice, text, script, where) and each voice's settings (read from the baked files, so they always match). |
| The game side | `engine/local-clips.js` | At startup reads the clips from IndexedDB. Dialogue clips are found by `dvClip` (a phone clip wins over a built-in one with the same words). Battle clips are added to `VOICE_CLIPS.clips[character][kind]` and play through `say()`. |
| The entry | `engine/splash.js` | ADMIN > BAKE VOICES opens `bake.html` inside the app. Keep it this way: an iPhone home-screen app has its own storage, separate from Safari, so the page must be opened from the app for the game to see the clips. |

## Changing the list (Claude)

1. Edit `tools/bake-page/pending.json`. Item: `{id, kind:'dialog'|'battle', voice, lineKind (battle only: the LINES key), text (exactly the line the game shows), where (label Tom reads), script}`. `voice` is the dialogue voice id (see `data/dialog-cast.js`) or the character id for battle lines.
2. Scripts: bracket direction first, a stretched CAPS word plus `[emphasized]`, "Tah Tah" for Ta-ta, numbers spelled as words, Boppy always with a thick New York accent. The words must match the line (a check script in the 2026-10-31 session compared them).
3. Run `node tools/bake-page/make-list.js`, bump `?v=` if you touch a script, add a CHANGES entry, push.
4. Lines that already have a baked clip in the repo do not need to be on the list. After clips are merged into the repo (see below), remove those items from `pending.json` and rebuild the list.

## Getting phone clips into the repo

The clips live only in Tom's phone until merged. The page's Export button shares a `local-clips-export.json` (`{clips:[{kind,voice,lineKind,text,mp3,script}]}`). Merge dialogue clips into the right `data/voice/dialog-ch<N>.js` and battle clips into `data/voice/<id>.js` the way `tools/battle-baker/merge.js` and `tools/clip-audit/merge.py` do (silence trim, speaker effects; Boppy is deepened with rubberband pitch 0.9, which the phone page does NOT do). Phone clips are raw ElevenLabs output: no silence trim, no Boppy deepening.

## Limits

- iPhone pauses background pages: keep the screen on while it bakes (the page asks for a screen wake lock where the phone allows it).
- Clearing the app's website data removes the clips. Re-baking costs a few cents.
- Part 2 (chapters 11 to 20, about 860 lines) is not on the list: those lines have no hand-written scripts yet and Tom bakes them after the ability updates.
