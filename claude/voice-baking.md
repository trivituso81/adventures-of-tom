# Voice baking

Updated 2026-10-25 (v224: dialogue for chapters 2 and 3; see "Dialogue" at the end).

## Where things stand
- 2026-10-26 (v276): two small bakers sent to Tom, built from the live game files (nothing hand-listed).
  1. voice-baker-missing.html: 26 battle lines with no clip (Rose's 8 moves, 18 Director's Cut and Family Finish lines), all directions
     from voice-baker-scripts-tombo.json. Build: `MISSING=1 node build.js <vdir> voice-baker-scripts-tombo.json out.html`, vdir = live
     lines.js + voice-clips.js + voice/<7 ids>.js. Template v16 (title Missing Lines, Nara dc3 sound, reset). Tom returns voices.json:
     merge with voice-merge.js as below, publish only the voice files.
  2. voice-baker-scene-lines.html: the 14 Tom and TNB scene lines rewritten in the tone review (claude/dialogue-scripts-scene-lines.json,
     chapter field 2, ctx names the real chapter). Build: `node dialogue-baker-build.js data/dialog-cast.js data/voice-clips.js
     <all ten dialog-chN.js comma-separated> dialogue-scripts-scene-lines.json out.html`, then rename the header (title, h1, the
     Save button and file name dialogue-scene-lines.json). Tom returns dialogue-scene-lines.json: `node voice-merge-dialog.js
     dialogue-scene-lines.json <live data/voice/dialog-ch2.js> data/dialog-cast.js outdir` puts all 14 in dialog-ch2.js (12.8 MB; the
     game keys clips by voice and text, so the file does not matter). Publish only data/voice/dialog-ch2.js. Tested with ElevenLabs mocked.
  Not in either baker yet: Tom's two new lines (Button Mash, Sourdough Snob; the kit is not built). Add them to lines.js, then rebuild
  the Missing Lines baker (the same MISSING=1 command picks them up). Scene lines changed after v276 need a new scripts json.
  Extracting project docs: project_read returns big files inline; extract byte-exact from the transcript (see next.md).
- 2026-10-25: a fresh baker was built and sent to Tom (all current lines.js lines). It opens on "Not baked yet": 156 lines with no clip at all (silent in game, robot-voice fallback). "Needs v4" adds 197 more that have an old flat v2 clip. Tom re-bakes everything on Eleven v4 (decided 2026-10-23).
- Held back from the baker until Task T rewrites them: tom.tombofetch, tombopier, tomboamy; nara.tombo, boppy.tombo, amy.tombo (HOLD list in build.js). Deedee and TNB Tombo lines (v214) were added 2026-10-25 and the baker re-sent.
- Nara's lines are ElevenLabs sound effects (no voice model); only her unbaked ones need takes. The template has a written description for each new Nara kind (DOG and DOG_LEN).
- 2026-10-25 (v220): the Chapter 1 Voice Baker (dialogue, 247 lines, 21 new designed voices) was sent to Tom. Merge the dialogue-ch1.json he sends back (section "Dialogue").

## Files (project docs)
- claude/voice-baker-template.html: the baker page. Decided 2026-10-25: re-voice EVERY line on v4 for consistency; one take per line, auto-kept (a new take un-ticks older ones). "Generate all" runs every character, 3 requests at a time, retries 429s, then shows Has kept takes for review; "Redo" per line. Filters: Needs new voice (default), Not baked yet, All lines, Has kept takes.
- claude/voice-baker-build.js: `node build.js <dir with lines.js and voice-clips.js> <scripts.json> <out.html>`; template.html must sit next to build.js (copy it there as template.html). HOLD list inside drops lines about to be rewritten.
- claude/voice-baker-scripts.json: one written direction per voiced line, keyed "ch|kind|game text" (replaces the old index-based voice-baker-scripts.txt, which broke whenever lines.js changed). A line without an entry falls back to a generic tag by kind. When lines change, add entries for the new text; spell Ta-Ta as "Tah Tah", spell numbers as words.
- Build steps: Artifact read data/lines.js and data/voice-clips.js into a folder; project_read the three files; build; open it headless and check the counts; SendUserFile with display attach (about 7 MB).

## v4 facts (checked 2026-10-23)
- Model id eleven_v4 (released 2026-09-28). voice_settings: stability and similarity_boost only. No style or speed, no SSML. Direction comes from [bracket tags] in the text; tag following is imperfect, so 3 takes per line.

## Merging the voices.json Tom sends back (v215 onward: claude/voice-merge.js)
- `node voice-merge.js <live voice-clips.js> <voices.json> <outdir>` writes data/voice-clips.js (voices + Nara) and data/voice/<id>.js.
  It also reads the live data/voice/*.js from a voice/ folder next to voice-clips.js. Needs ffmpeg with
  rubberband: Boppy's v4 clips are pitched down 2 semitones (pitch=0.9) so he sounds deeper. HOLD_BOPPY_OLD=1 keeps his old accented
  clips (used on 2026-10-25 while his accent was missing).
- For each clip in voices.json: REPLACE every existing clip with the same character and text (in any kind) in VOICE_CLIPS.clips, then add the new one under its kind. Do not append beside old v2 clips: engine/speech.js picks randomly among all clips whose text matches, so old clips would keep playing half the time.
- Keep the `model` field on each clip.
- Replace VOICE_CLIPS.voices with voices.json's voices (merge Nara's prompts).
- Main build only. demo/data/voice-clips.js stays frozen. Publishing data/voice-clips.js is the one exception to "never publish voice-clips"; read it in full first. Then clear status.md "Lines to re-bake" for everything merged.
- Tom may send several voices.json files (one per character or session); merge each the same way. A dialogue-ch<N>.json is different: it goes through voice-merge-dialog.js (below).

## Dialogue (spoken dialogue boxes, v220 onward; requested by Rose 2026-10-25)
Separate from the battle-line baker above. Every page of a dialogue box (scenes, NPCs, monsters, Penny, Sal) plays a baked clip
for its speaker's voice and exact text. Unbaked pages stay silent (no robot fallback). Objects and signs are never voiced.
- Game: data/dialog-cast.js (DIALOG_CAST: speakers name -> voice id; voices with type, Voice Design prompt, sample text, stability,
  fx; files list) and engine/dialog-voice.js (plays on each page, stops on page turn, close, FAST, SKIP, sound off, shop close;
  quiets the typewriter while speaking; a scene's battle-line voice on the same page yields; an overworld greet bark said just
  before a box with its own clip is dropped; Penny's shop greeting is spoken). Clips: data/voice/dialog-ch<N>.js, loaded after
  startup one file at a time, Object.assign(DIALOG_CLIPS.clips, {'voice|text': mp3 base64}) plus DIALOG_CLIPS.voices (designed
  voice IDs, so the next baker reuses them). v220 shipped an empty data/voice/dialog-ch1.js placeholder.
- Cast (chapter 1, 27 voices): family use their battle voices (tom grace rose amy deedee boppy; tnb listed for later chapters).
  21 designed voices, one per character, chosen by type: Pip, Moss, Dot, Gus, Bean, Bun, Page, Fern, Kit, Oolong, Luna, Penny,
  Sal (Long Island cabbie), Justin (slight country twang), Aunt Ellie (grand mid-Atlantic), and one per monster kind: mudling
  (also Big Mudling), skeeter, grump, toad, log, bigone. Designing a voice uses an ElevenLabs voice slot.
- Lines: claude/dialogue-scripts-ch1.json (247 lines, story order, each with voice, speaker, game text, context, the line just
  before, and a written direction). Built by claude/dialogue-harvest.py (see its header). Not included: the 6 lines already in
  data/lines.js (they play through say()), the pier/school NPCs and later-chapter monsters (unreachable in chapter 1), recruit
  prompts (Deedee is forced in), gate and sign text. Round {n} lines are baked for n = 2 to 5 ("Round 2." text, "Round two" read).
- Baker: `node dialogue-baker-build.js <data/dialog-cast.js> <live data/voice-clips.js> <live data/voice/dialog-chN.js or -> \
  claude/dialogue-scripts-chN.json <out.html>`; dialogue-baker-template.html must sit next to the build script. About 110 KB (no
  audio inside). One button "Cast and generate everything": Voice Design (POST /v1/text-to-voice/design, eleven_ttv_v3, falls back to
  eleven_multilingual_ttv_v2) keeps option 1 and saves it (POST /v1/text-to-voice), then one eleven_v4 take per line, 3 at a time,
  retries 429/409. Per voice: Design 3 options, pick one; or paste a voice ID. Saves dialogue-ch<N>.json {chapter, voices, scripts,
  clips:[{voice,speaker,text,mp3,model}]}. Test: claude/bakertest.py (ElevenLabs mocked).
- Merge: `node voice-merge-dialog.js dialogue-ch1.json <live data/voice/dialog-ch1.js or -> <data/dialog-cast.js> <outdir>`: trims
  silence, Boppy pitch 0.9 (as in battle), monster fx (mudling vibrato + up, skeeter up + chorus, grump/toad/log down, bigone down +
  pond echo; a failing fx falls back to dry with a warning), re-encodes mono 32 kHz 48 kbps (247 lines should be about 7 MB; warns
  over 15 MB). Then publish only data/voice/dialog-ch1.js (Artifact read the live one first; it is the merge input). Test:
  claude/dvtest.py with the merged file in the build (clips load, NPC page plays, object silent, greet dropped, scene voice yields,
  FAST and mute stop it).
- v224 (2026-10-25): chapters 2 and 3 added. data/dialog-cast.js files = dialog-ch1/2/3.js (ch2 and ch3 published as 218-byte
  placeholders). 34 designed voices in all: chapter 1's 21, chapter 2's 12 new (washington, odette, carmen, boomie, olivia, michael,
  alvarez, kenji, la_woman, la_man, kid_boy, kid_girl), chapter 3's 1 new (reel). Walk-ons speak by type: they reuse a voice and are
  told apart at merge time by DIALOG_CAST.speakerFx (name -> fx: older, lower, higher, toddler, little, sol, plus one per chapter 2/3
  monster: smoglet, tickets, coyote, gridlock, tarblob, bigshake, soggysock, bobber, tangle, snag, irongill). Merge order: speakerFx,
  then Boppy pitch, then the voice's own fx. ffmpeg gotcha: put aformat=sample_fmts=s16 between vibrato and rubberband or LAME aborts.
- Scripts: claude/dialogue-scripts-ch2.json (291 lines), ch3 (178). Harvest helpers bundled in claude/dialogue-harvest-ch.py (split
  at the "# ===== FILE:" markers: harvest_ch.py, finalize_ch.py, make_doc_ch.py N, scripts_ch2.py, scripts_ch3.py). Not voiced: Nara
  narration and object narrators (kettle, reeds, sundial, spillway, Deep Pool); lines already in an earlier chapter or data/lines.js.
- Bakers share voices: one browser store 'aot-dlg-voices' (migrates the old per-chapter keys), so a voice is designed once; panels say
  "Speaks for:". Tom opens chapter 1, then 2, then 3 in the same browser. Template 2026-10-25b: casting uses castRetry (waits 8 to 60 s,
  up to about 4 minutes, on 429/409/5xx/network errors), reuses options already designed when only the save failed, pauses 1.5 s
  between voices, stops casting on a voice-limit error, and shows the first failure's reason. Pressing the button again resumes
  (casts only uncast voices, makes only lines without a kept take). Tom's first chapter 1 run (old template) cast 10 of 21: Page,
  Fern, Kit, Oolong, Luna, Penny, Sal, Justin, Aunt Ellie, Bog Toad, Log Lump failed (pattern looked like rate limiting, not a slot cap,
  since later voices succeeded).
- Merge each file separately: `node voice-merge-dialog.js dialogue-chN.json <live data/voice/dialog-chN.js or -> data/dialog-cast.js
  outdir`, publish only data/voice/dialog-chN.js.
- Later chapters: harvest that chapter, add any new speakers to data/dialog-cast.js (with type, desc, sample of 100+ characters),
  write directions, build a dialogue-scripts-chN.json, add 'data/voice/dialog-chN.js' to DIALOG_CAST.files.
