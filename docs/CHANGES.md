## 2026-11-03 (139): Art Library: Grace FRESH big-head stand from photo plus school painting (library only, no game change)

- Tom (11-03 16:16, 16:19, 16:22): no composites ever (TEST 8 is dead; `docs/reference/grace_bighead_guide_v1.png` is history); none of Grace's existing pictures has the paint look he wants, only the school yard painting does; editing a painted picture to change proportions, likeness or style is the wrong tool and is not tried again. Canon: claude/canon-addendum.md 16:16 and 16:19.
- New entry `grace-hero-fresh` (Characters > Grace, "Grace FRESH big-head stand"): a fresh picture from two inputs only, his photo of Grace (face) and `docs/reference/school_style_ref.png` (style), no painted Grace picture in the call. Prompt `tools/art-library/prompts/grace-hero-fresh.txt` (1,244 chars): the school prompt's own style wording, face from the photo, head about three heads tall and as wide as the shoulders, outfit in words, flat magenta background so no cut step. 3:4. test.py counts and id order updated (Characters 74).

## 2026-11-03 (138): Art Library: Grace big-head TEST 8, repaint of a paste-up (library only, no game change)

- Tom (11-03 16:05) rejected the "pick (a) or (b)" conclusion and asked for a method that works. Analysis of TESTS 1 to 7: the generator preserves the rendering of whichever picture carries the person. Every big-head picture sent so far was smooth or a photo, so the output was smooth or a photo. No run ever gave it a picture that was brushed AND big-headed.
- New method (the standard rough-composite then image-to-image cleanup technique): `docs/reference/grace_bighead_guide_v1.png` is a paste-up made in Python from her APPROVED painted stand (`grace-walk-v3-stand-front-straight.png`, brushed, head about .205): head and hair cut out, enlarged 1.6 times about the chin, set back on the untouched body, whole figure fitted onto a 1024 magenta canvas (head measures about .30 of height). It is a generator input only; it never goes in the game and is not a bake (CLAUDE.md "No head resizing" is about live art).
- New entry `grace-stand-front-collage` (Characters > Grace, "Grace walk 0 TEST 8"): one reference (the paste-up), no photo, no style key; prompt 1,016 characters: keep pose, size, face, clothes and brushwork exactly, fix only the neck seam and the hair ends. test.py counts and id order updated (Characters 73). No game file changed, no tag moved.

## 2026-11-03 (137): Voice Library: narration boxes get a Narrator voice (`narr1`)
Tom: lines like "Little silver door" (Ch 9, ch9Luna) showed "no voice yet" and could not be recorded. Those boxes are the story narrating (a place, object or moment as the label), not characters.
- data/dialog-cast.js: 32 narration labels (The kettle, Old reeds, ... Little silver door, Sunday dinner, Floor 60, Stillness Core) now map to a new `narrator` voice; a new narration label goes in that block. Talking objects that are characters (Whispers, Long coat) are NOT narration and stay uncast.
- Narrator uses Mr. Washington's ElevenLabs voice id (override in tools/voice-library/make-index.js); no new voice slot (account at 30). The `narrator` entry carries a desc and sample for a real voice later.
- Fixed: follower and recruit barks pass the id (`justin`, `olivia`), so 26 of their lines showed as uncast and would never play in game even with a clip. Added lowercase keys. `Warden Boppy` maps to Boppy.
- make-index.js keeps a script written under the old uncast key (`?<speaker>` or empty voice), so the Little silver door direction survived.
- voices.html: narration rows read "Narrator (<label>)".
- Uncast lines: 444 to 326. Left: Part 2 villains and monsters (Vance, Julian Vance, Marlowe, HUSH-9, Archivist, Curator, Oblivion Censor, Forever Engine, chapter 11 to 20 monsters), plus Whispers and Long coat.
- Tests: voice-library test.py ALL PASS, unused_voice 0 on all five, tag_check ok, smoke.

## 2026-11-03 (136): Phone voice export `local-clips-export_1_.json` merged (Deedee, chapters 7, 9, 25, 26) (`dclips1`)

- Tom sent the export with no words (403 clips: 360 dialogue, 43 battle). Treated as "merge it" per docs/VOICE_LIBRARY.md. Filtered first: 3 repeats collapsed, 16 dropped because the game has no live line with those words (the `Round {n}.` monster lines, and Michael, TNB and Tom dialogue takes whose words differ from the line), 3 dropped because the spoken words differ from the line (Deedee `nurse`, Deedee `walk`, TNB "Look. The sky is blue again."). 381 kept.
- Merged with `tools/voice-library/merge-local.js` (silence trim, speaker effects, Boppy deepened). Bytes changed in: `data/voice/deedee.js` (36 battle clips replaced), `dialog-ch9.js`, `dialog-ch26.js`, `dialog-ch25.js`, `dialog-ch7.js`. The rest (Boppy, TNB battle; chapters 1, 2, 4, 6, 22) came out identical to what is already baked. Tag `dclips1` on `deedee.js`; chapter dialogue files carry no tag (the service worker revalidates them).
- Tests: `unused_voice.py` 0 on all five checks; `tag_check.py` ok; Voice Library index rebuilt (4,140 lines, unchanged count). Smoke not run (audio data only). NOT run: the phone.

## 2026-11-03 (135): Art Library: Grace big-head TEST 7, grey proportion outline as the body guide (library only, no game change)

- Tom ran TEST 6 (134): "its just not getting the brushed illustrated feel". Saved `tools/sprite-bake/src/grace-stand-front-scene-test6-v1.jpg`. Head grew (about .25) but she is painted smooth, like the big-head picture, and looks pasted onto the scene. Pattern over all runs (fact): every picture with a big head (Run 1, Run 2, TEST 2, TEST 6) is smooth; every brushed one (hero, TEST 5) has a head near .19. The painted big-head picture carried its smooth style along with its proportions.
- One lever: replace that picture with `docs/reference/proportion_3heads_child.png`, a plain grey outline drawn at head .31 of height (no painting style to copy). Outfit now in words (it came out right from words in her hero). New entries `grace-stand-front-scene-guide` (TEST 7 step 1) and `grace-stand-front-scene-guide-cut` (step 2, chained). Prompt 1,423 characters.
- tools/art-library/test.py: Characters 70 to 72, id order and tom slice updated. All checks pass.

## 2026-11-03 (134): Art Library: Grace big-head TEST 6, big-head picture as the body guide (library only, no game change)

- Tom ran TEST 5 step 1 (132, 133). Saved `tools/sprite-bake/src/grace-stand-front-scene-test5-v1.jpg`. Brushwork now matches the school yard and the style key (the scene method works). Head missed for the third time: measured about .19 (hair top 160, chin 290, soles 828 of 864 px), head about half her shoulder width. Not to be approved.
- Cause (inference): the third picture, her hero, has a head of about .19, and the generator copies the proportions of the attached person over any wording (percentages or comparisons).
- One lever: swap that third picture for `grace-stand-front-bighead-v1.jpg` (Run 1: same outfit, front facing, head about .29), with one sentence telling it to take only proportions and clothes from it. New entries `grace-stand-front-scene-big` (TEST 6 step 1) and `grace-stand-front-scene-big-cut` (step 2, the proven cut prompt, blocked until step 1 is approved). TEST 5 untouched. Prompt 1,311 characters.
- tools/art-library/test.py: Characters 68 to 70, id order and tom slice updated. All checks pass.

## 2026-11-03 (133): Art Library: TEST 5 step 1 head size in comparisons, not a percentage (library only, no game change)

- Tom (11-03 15:45): "dont you think the prompt around head size needs to be more specific". Fact: "about 30 percent of her full height" came back at about .19 and .20 (TEST 3, TEST 4); the generator does not measure percentages. `grace-stand-front-scene.txt` (step 1, not yet run) now says: full height is about three head heights (one head = top of hair to chin), head as wide as her shoulders, head as tall as chin to the bottom of the sweater. Three heads is about .33, a little over .30 on purpose because every run so far came back smaller than asked. Rest of the prompt shortened to keep it about 1,100 characters.

## 2026-11-03 (132): Art Library: Grace big-head TEST 5, the two-step school yard method (library only, no game change)

- Tom ran TEST 4 (131), no note. Claude's read: same soft texture as TEST 3, not the dense brushwork of the style key; head about .20 (top 41 px, soles 984 px); background crimson again. Saved `tools/sprite-bake/src/grace-stand-front-bighead-style-v1.jpg`. Two brushwork misses in a row (TEST 3, TEST 4): stop-loss.
- Cause (from CHANGES 99, same failure on Grace's hero): on a flat background the generator paints one figure in its clean default look; the style key and her hero got their brushwork because she was painted INSIDE the school yard painting. Style pictures alone do not carry it.
- Method changed, not wording: step 1 `grace-stand-front-scene` (4:3): school yard painting first (sets shape and texture), Tom's photo second (own slot, new `at` option), hero third (outfit). Front stand facing straight, head about 30 percent. Prompt 1,113 characters. Step 2 `grace-stand-front-scene-cut` (4:3): the proven `grace-hero-cut.txt` prompt on the approved step 1 picture (`art/raw/characters/grace-stand-front-scene-v1.png`), blocked until step 1 is approved.
- art.html: `own.at` puts the phone photo at any position in the sent list (default first). Tested with a fake image service: 3 pictures sent, photo second.
- tools/art-library/test.py: Characters 66 to 68, id order and tom slice updated. All checks pass.

## 2026-11-03 (131): Art Library: Grace big-head TEST 4, style key as painting guide (library only, no game change)

- Tom ran TEST 3 (129): "better!" (likeness back) "but needs more of a brushed illustrated feel". Saved as `tools/sprite-bake/src/grace-stand-front-bighead-fresh-v1.jpg`. Measured (fact): head about .19 of full height (hair top 56 px, chin about 237 px, soles 992 px), not the .30 asked; background came out crimson (192, 27, 96), not magenta.
- One lever: painting-style source. New entry `grace-stand-front-bighead-style` (Characters > Grace, "Grace walk 0 TEST 4"): same photo slot and hero as TEST 3, plus `docs/reference/style_key_v1.png` as a third picture for brushwork only; prompt is TEST 3's with the style sentence moved onto the third picture (1,041 characters). TEST 3 is untouched. Head size and background left alone for this test.
- tools/art-library/test.py: Characters 65 to 66, id order and tom slice updated. All checks pass.

## 2026-11-03 (130): Removed unused source pictures (hosting only, no game change)

- Tom (11-03 15:00): "remove anything the Art Library isn't using". Deleted 43 pictures (69 MB) from `tools/sprite-bake/src` and `docs/reference` that no code, bake script, Art Library entry or prompt names, directly or through a file-name pattern: superseded Tom and Grace sheets (tom-poses-v1/v2, tom-sheet-v1, tom-walk-v2, tom-stretch-v1, tomride-*, grace-walk-sheet2-v1, grace-walk-v3 early tries), kid-amy-ref, kid-tom-ref, foe-hush9final-v2-unused, the 12 flight source paintings (the game uses art/flight), and old area paintings and masks in docs/reference (town, row, blvd, hollow versions from Tom, style_key_square_crop).
- Kept every source picture a bake script reads through a pattern (for example `tom-{n}.png`), so every bake still runs. Git history keeps all 43 files.
- Checks: Art Library validate OK (354 entries), test.py passes except the known flaky "blocked row opens with GENERATE disabled".
- Published site is now about 810 MB (GitHub Pages limit 1 GB). The remaining 460 MB of source pictures are used by bake scripts.

## 2026-11-03 (129): Art Library: phone-only photo slot, Grace big-head TEST 3 (library only, no game change)

- Tom ran TEST 2 (127): head size good, but it looked less like Grace and lost the brushed illustration feel. Stop-loss: every run so far was an edit of an edit, so likeness and paint drifted each pass. One lever changed: the sources. TEST 3 is one fresh picture from originals only.
- New entry `grace-stand-front-bighead-fresh` (Characters > Grace, "Grace walk 0 TEST 3"): first picture = Tom's real photo of Grace (face), second = `grace-hero-scene-v1.png` (the painted hero Tom pointed to, for outfit and brushwork). Prompt 1,012 characters, written fresh (no edit words), front stand facing straight, head about 30 percent of her height.
- art.html: entries can now ask for a picture Tom adds from his phone (`own: {slot, label}`). The photo is kept in that browser only (IndexedDB, key `own|<slot>`), sent first, left out of EXPORT ZIP and never committed. Why: the repo and site are public, and this is a real photo of a child. GENERATE says "Add the picture first" until it is added. Slot `grace-photo` can be reused by later Grace entries.
- tools/art-library/test.py: Characters 64 to 65, id order list updated. All checks pass. Tested the photo slot with a fake image service: refused without the photo, kept after reload, sent first (2 pictures).

## 2026-11-03 (128): Pages deploy speed: .nojekyll (hosting only, no game change)

- Tom (11-03) noticed the site taking longer to update. Fact: the published site is about 880 MB in 1,900 files (531 MB of it is `tools/sprite-bake/src` source pictures, 127 MB baked voice), close to the GitHub Pages 1 GB site limit. Deploys went from about 2 to 3 minutes (11-02) to 4 to 10 minutes (11-03), and pushes that land during a deploy cancel it and restart the wait.
- Added an empty `.nojekyll` at the repo root so GitHub Pages copies the files as they are instead of running the Jekyll site builder over all 1,900 files. No file in the repo starts with `_` or uses front matter, so nothing served changes.
- Not done (needs Tom's go-ahead): moving source pictures out of the published site. About 118 files (195 MB) in `tools/sprite-bake/src` and 15 (33 MB) in `docs/reference` are not named by any code or prompt.

## 2026-11-03 (127): Art Library: repaint entry for the big-head stand, rule: images only in the Library (library and docs only, no game change)

- Tom (11-03 14:49): "I only want to use Art Library to create images. ALWAYS." Claude had recommended his outside AI after two style misses (125, 126); that was wrong. Written into CLAUDE.md ("Images only in the Art Library") and Claude's memory.
- New entry `grace-stand-front-bighead-paint` (Characters > Grace, "Grace walk 0 TEST 2"): a repaint of the picture Tom liked (`grace-stand-front-bighead-v1.jpg`, first reference) with her painted hero (`grace-hero-cutai-v1.png`, second reference) as the style guide. Prompt (756 characters) keeps the head size and changes only the rendering. Different method from 125 (which only added words), so this is not a third wording. `grace-stand-front-bighead` itself is unchanged.
- tools/art-library/test.py: Characters 63 to 64, id order list updated.

## 2026-11-03 (126): Art Library: big-head test prompt restored, first picture saved (library only, no game change)

- Tom ran the 125 prompt (added "KEEP IT HAND-PAINTED"): the head grew to about .34 of height (he approved about .30) and the picture looked even less like an illustration. He had liked the FIRST result. Restored `tools/art-library/prompts/grace-stand-front-bighead.txt` to the exact 124 text that made it, and saved that picture as `tools/sprite-bake/src/grace-stand-front-bighead-v1.jpg` (1024 x 1024, head about .30). STOP-LOSS: two pictures in a row lost the painted feel, so no third wording. Next step in claude/next.md.

## 2026-11-03 (125): Art Library: big-head test prompt, painted-look sentence (library only, no game change)

- Tom ran `grace-stand-front-bighead` (124): proportions good (head about .30 of height by eye, a little more than the .28 planned) but the picture lost the painted feel (smoother skin, mottled sweater instead of woven wool). One lever changed: a short "KEEP IT HAND-PAINTED" paragraph in `tools/art-library/prompts/grace-stand-front-bighead.txt` (now under 1,000 characters). Same single reference. First miss on this lever; a second miss is a stop-loss.
- Tom (11-03 14:26) is happy with the .30 head, so the entry title now says "about 30 percent of her height" instead of "50 percent bigger" (title only; the prompt is unchanged so the style test stays one lever).

## 2026-11-03 (124): Art Library: Grace pose 0 big-head test entry (library only, no game change)

- Tom (11-03 12:46): thinks the head rule should change so the head is 50 percent bigger, and wants to test it on pose 0 first. New entry `grace-stand-front-bighead` (Characters > Grace, "Grace walk 0 TEST"): an edit of her approved straight front stand (`grace-walk-v3-stand-front-straight.png`) that makes the head and hair about one and a half times larger and leaves the body alone (head share goes from about .205 to about .28). The figure may be drawn a little smaller so it fits the frame; the bake already brings every direction to one height.
- Nothing else changed: the head rules in the other prompts, the style key and the height chart are untouched until Tom has seen the result. A bigger head comes from a regenerated picture, never from a bake warp (see 123). If Tom approves the look, the head rule in party-prompts.js and the Grace walk and battle entries gets rewritten in one go.
- tools/art-library/test.py: Characters 62 to 63, id order list includes the new entry. The one failing check is the known flaky "a blocked row opens with GENERATE disabled" (landscape this time).

## 2026-11-03 (123): Standing rule: never resize a head (docs and tool warning only, no game change)

- Tom (11-03 11:33) asked that head resizing never happen again after (121). Added "No head resizing" to CLAUDE.md. Marked `docs/CHARACTER_PIPELINE.md` section 7 as overridden (its head shares .21 to .25, .373 and .43 are no longer bake targets) and changed pipeline step 4 of section 6. `tools/sprite-bake/kidhead.py` now says so in its header and prints a warning to stderr whenever `grow_head` runs with a factor other than 1. Old bake scripts (bake_grace.py battle part, bake_rose.py, bake_olivia*.py) are unchanged so old art can still be reproduced.
- Not changed: the Project instructions text in claude.ai (section 4 still says children's heads follow Grace and Rose); the old Project copy claude/character-pipeline.md (historical).

## 2026-11-03 (122): Build order: all walking poses first (docs only, no game change)

- Tom (11-03): "I'd like to do all the walking poses of all characters before doing any other poses."
- docs/CHARACTER_PIPELINE.md section 3 and 5 now say: every character gets an approved hero pose and walk before anyone gets a battle, ability or other pose sheet. The hero pose stays first because the walk copies it. Same rule written into the Project's claude/next.md.


## 2026-11-03 (121): Grace's new painted walk is in the game (`gwalk1`)

- Fact: Grace's overworld walk now uses the nine accepted frames from (120) instead of the old sheet. Front, back and side stands plus steps; back step B is the mirror of back step A. Her battle and knocked-out art are untouched (byte-identical).
- Head: NOT resized (Tom, 11-03: "dont resize grace's head"). The earlier plan to grow it to .25 came from older handoff notes, not from Tom; it is removed. Her head stays at the size in the accepted frames (about .20 of height).
- Bake: `tools/sprite-bake/bake_grace_walk_v3.py` (a copy of bake_grace.py; battle code unchanged, walk rebuilt). Each frame is keyed from its own corner colour, then `tools/sprite-bake/defringe.py` removes pink hair fringe in a thin band along the outline (sweater and shoes untouched). All directions are brought to the front stand's figure height; each step is scaled to its stand's head width, limited to 3 percent either way (head width is noisy on the side frames), feet on one baseline, head on the centre column.
- Size: stands about 40 rows tall (old art about 39). Atlas `art/chars/grace-ow.webp` 756 x 120, 75 KB.
- Known: a faint pink rim remains on thin hair wisps at full size; it is not visible at game size. Two defringe attempts (wide, then edge band) did not remove it fully at 1:1, so I stopped there instead of a third variant.
- Tests: smoke with IDS=grace FAILS [] (tag check ok), walked the party around the Square with real key presses in portrait and landscape (left, right, up, down all show the right Grace frame). Tags: ART_V and painted.js, grace-hires.js and main.js moved to `gwalk1`, build stamp `build gwalk1`.

## 2026-11-03 (120): Grace walk frames COMPLETE, ready to bake (source pictures only, no game change)

- Front step B accepted (other leg forward, face straight, keychain same hip): `tools/sprite-bake/src/grace-walk-v3-step-front-b.png`.
- FINAL frame map for the bake (all 1024 x 1024 on magenta, key each from its own corner): down_stand = `grace-walk-v3-stand-front-straight.png`, down_step1 = `-step-front-a.png`, down_step2 = `-step-front-b.png`; up_stand = `-stand-back.png`, up_step1 = `-step-back.png`, up_step2 = mirror of `-step-back.png`; left_stand = `-stand-side.png`, left_step1 = `-step-side-a.png`, left_step2 = `-step-side-b.png`. stand2 = stand. Superseded (do not use): `-stand-front.png`, `-stand-front-level.png`, `-step-front.png`, `-step-front-try2.png`.
- Known: back and side stands are 3x enlargements of 341 px sheet cells (softer, magenta fringe); figure heights differ a few percent; normalise each frame to its stand's head size before grow_head.

## 2026-11-03 (119): Grace front step A accepted, step B entry added (Art Library entry and source picture only, no game change)

- Front step from the straight stand: face straight on, one foot forward, back heel lifted. Saved as `tools/sprite-bake/src/grace-walk-v3-step-front-a.png` (supersedes `grace-walk-v3-step-front.png` and `-try2`). New entry `grace-step-front-b` ("Grace walk 1b") edits it to the other leg forward, keychain on the same hip, no mirror.

## 2026-11-03 (118): Memory fix for long sessions on older iPads (`mem1`: voice cache cap, painted sheets on demand)

- Tom (11-03): TNB's roughly five-year-old iPad (Chrome, so WebKit) got hot and slowed down a lot after 30 to 60 minutes, worst in battle. Tom approved both fixes.
- Diagnosis (measured in Chromium at iPad size, no real iPad): game code per frame is about 0.3 ms, so it is not the cause. Memory is. Every enemy sheet and battle sheet (223 atlases) loaded at boot, which is about 700 MB once decoded. Every voice line ever played also stayed decoded (about 0.5 MB each, never released).
- Fix 2 (`engine/speech.js`, `engine/dialog-voice.js`): `lruSet`/`lruGet` keep only the 40 most recent battle clips and the 20 most recent dialogue clips decoded. Older ones are decoded again from the baked clip when they play.
- Fix 1 (`engine/painted.js`): atlases are now "lazy" unless they are overworld sheets (ids ending in Ow, townsfolk, mudlingHeist), which still load at boot. `paintedTick` runs every 1.5 s. It loads the sheets for party members, the current map's monsters and their formations, and the current fight. It releases a lazy sheet, plus its cached frame canvases, when nobody wants it, no fight is on, and it has not been drawn for 20 s. Any draw of a sheet that is not loaded starts loading it, and the old rows show until it arrives. `engine/battle2.js` b2Start holds the opening (stage shows only the backdrop, `B2.artWait`, `engine/battle-draw.js`) until the fight's sheets are ready, 5 s at most.
- Measured, 4 fights each with every move of Tom, Grace, Rose and TNB: atlases loaded 223 to 90, picture memory if decoded 705 MB to 302 MB, frame canvases flat at 176 (before: growing each fight), 0 frames drawn as the old rows during fights, overworld monsters painted on map entry, foe sheets released 25 s after leaving their map.
- Tests: smoke FAILS [] (portrait and landscape looked at), kit_test all 10 characters FAILS [] (contact sheets looked at, all painted), ch5_school, ch11, ch12, ch13, ch15, ch16, ch18, ch19, ch20, rooms pass. ch14 (Deedee scene), ch17 (tower lobby door) and quest (2 checks) fail the same way on unchanged main, so they are not caused by this change.
- Tags: speech, battle-draw, battle2, painted, dialog-voice and main moved to `mem1`; build stamp `build mem1`.
## 2026-11-03 (117): Grace front stand straightened, front step now edits from it (Art Library entry and source picture only, no game change)

- "Grace walk 0" (head-only edit of the levelled stand) came back close to straight on: eyes level, no tilt, shoulders square. Saved as `tools/sprite-bake/src/grace-walk-v3-stand-front-straight.png`; it is the front stand of the walk (replaces cell 1 of sheet 2). `grace-step-front` now uses it as its one reference. Step B will be made from the accepted step A (other leg forward, no mirror).

## 2026-11-03 (116): Grace front walk, stop-loss on the head turn: straighten the source first (Art Library entry and source pictures only, no game change)

- Two front-step edits (09:40, 09:47) came back with the SAME head tilt and turn, the second despite a prompt that led with a dead-straight-on rule. Cause found: the attached front stand (cell 1 of sheet 2) has that tilt and turn; the edit copies the head pose from its source. Wording does not override it.
- Changed lever (the input): `tools/sprite-bake/src/grace-walk-v3-stand-front-level.png` is the front stand with the head rotated 10 degrees level (Claude, by script; fixes the tilt, not the turn). New entry `grace-stand-front-straight` ("Grace walk 0") edits ONLY the head to face straight on. When Tom accepts it, it replaces the front stand and becomes the ref of `grace-step-front`; step B is then made from step A (no mirror).
- Second try saved for the record: `grace-walk-v3-step-front-try2.png`.

## 2026-11-03 (115): Grace front step prompt: head and body straight to camera (prompt only, no game change)

- Tom (09:42): front step weird, sizes differ and the head faces different directions; both steps must face directly forward. Size is fixed in the bake (scale each frame to the stand's head size). Head: `grace-step-front.txt` now leads with a dead-straight-on head and square shoulders rule. Step B will be its own edit made FROM the accepted step A (other leg forward), not a mirror, so the head and the keychain stay put.

## 2026-11-03 (114): Grace walk step frames saved (source pictures only, no game change)

- Tom ran the four `grace-step-*` entries once each (about $0.20); all four passed on the first try (no duplicates, head follows body). Saved as `tools/sprite-bake/src/grace-walk-v3-step-front.png`, `-step-back.png`, `-step-side-a.png`, `-step-side-b.png` (1024 x 1024 on magenta). Side B came back as a shorter stride, not the passing pose; usable. Front and back step B will be mirrors (the keychain swaps hips on the mirrored front step). Waiting for Tom's acceptance before the bake.

## 2026-11-03 (113): Admin libraries work on a computer (Art, Music, Voice Library pages only, no game change)

- Tom (11-03): "support a wider viewport for Admin so I can use it on my computer (all the library features)".
- At 1000 px wide and up, art.html, music.html and voices.html switch to a two-column layout: keys, search and filters sit in a left column that stays in view while the list scrolls on the right (up to 1680 px wide). Filter chips wrap instead of scrolling sideways. Below 1000 px nothing changes (phone and phone-landscape shots differ only in the wording below).
- Art Library: open cards use the width (bigger result thumbnails 260 px, bigger reference pictures, taller prompt box, Shape menu no longer full width); Esc closes the full-size picture. Music Library: track cards sit two per row on wide screens. Voice Library: the list is one framed column; the long Who and Chapter chip lists scroll inside a capped box so Type and Show stay reachable.
- Wording: "this phone" is now "this device" on all three pages, because keys, spend and takes are saved per browser (a computer has its own; approvals and exports work the same from either).
- DOM: controls wrapped in `<aside class="side">`, export and notes in `.foot`; all ids unchanged.
- Tests: validate.js OK, music test FAILS: [], voice test ALL PASS, bake_test FAILS: [], art test.py: one check ("a blocked row opens with GENERATE disabled") failed in landscape this run; it also fails on the unchanged main (both orientations) when run here, so it is a timing flake in the blocked-probe test, not this change. Looked at 390, 1024, 1440 and 1920 px shots. No `?v=` tag or stamp moved (these pages carry none; the service worker always fetches .html from the network).
## 2026-11-03 (112): Grace walk, new method: four single-frame edits from her clean stand frames (Art Library entries and source pictures only, no game change)

- Why: two 3 x 3 walk sheets failed the same ways (repeated drawings, face turned to the camera on sideways bodies). Diagnosis: the old prompts were about 6,000 characters with the poses in the last 15 percent, worded as puzzles ("mirror of frame 2", viewer's left and right), and the attached master faces the camera, so its head direction leaked into every cell.
- New method: one frame per picture. Each prompt is under 1,050 characters, pose first, no left and right, and attaches ONE picture: the clean stand frame facing the same way (cropped from Tom's sheet 2, `tools/sprite-bake/src/grace-walk-sheet2-v1.png`, cells 1, 4 and 7, saved as `grace-walk-v3-stand-front/back/side.png`, upscaled to 1024, borders cleaned).
- Entries (Characters > Grace): `grace-step-front`, `grace-step-back`, `grace-step-side-a`, `grace-step-side-b` (titles "Grace walk 1 of 4" to "4 of 4"). Front and back step B will be horizontal mirrors of step A; side B is its own picture. Cost about $0.05 each.
- Tests: `tools/art-library/test.py` counts updated (Characters 60, order list). The "blocked row" check fails on and off in portrait or landscape before and after this change (it failed before on main too).

## 2026-11-03 (111): Art Library page rebuilt so the lists are short (collapsed rows, groups, filters, blocked state; `art.html` and library tooling only, no game change)

- Tom (11-03): the Art Library lists were far too long (Characters was about 53 phone screens of open cards). Spec and assessment: `claude/art-library-ux.md`; all eight items built.
- What Tom sees now: every picture is ONE collapsed row (state dot, short name, state chip); tap to open the card with prompt, references, GENERATE and results. Rows sit in groups that start closed (Characters by person with the steps in order, Areas by plate, Enemies by area, Rooms by place, Props by owner, Battle repaints vs new, NPCs by city). A strip under the tabs filters by state: To do (the default: Ready plus Waiting on me), All, Ready, Waiting on me, Rejected, Approved, Blocked, each with a count. Characters on first view is 13 rows, about one and a half screens.
- Blocked: a picture whose reference is another entry's approval (art/raw/...) is greyed with the reason in plain words ("Approve "Tom: hero pose step 1, painted in the school yard" first."), GENERATE is disabled, and the missing thumbnail says "not made yet". When the earlier step is approved but the site has not published the file yet (about 2 minutes) it says so; the page checks with a HEAD request on load and again every 15 seconds while it is waiting. Unticking a blocked reference unblocks the card.
- Also built: search box over every tab (tab chips show matches); the page remembers the last tab, filter, open rows and groups, and the scroll position per tab (never the search text); only the touched row is redrawn after GENERATE, APPROVE or REJECT, so the page no longer jumps to the top; the keys and spend cards fold into one Setup row once both keys are saved (starts open while one is missing); tab chips show approved/total.
- Code: new `tools/art-library/groups.js` derives a `group` field for every entry from its id and title (no prompt text touched, verified: the 342 existing entries are identical apart from the new field); `make-prompts.js` applies it, `validate.js` checks it (3 to 40 characters, no colon or dash). `test.py` now also checks groups per tab, collapsed first view, filter counts against the data, blocked rows, search, and after a reload the remembered tab, open row, scroll position and folded Setup.
- Calls made: a row stays on screen after APPROVE or REJECT even if the filter would now hide it, until the next tab or filter change (no jumping). The default view leaves out Rejected on purpose per the spec; its count is always visible on the chip. Existing statuses are untouched; "Waiting on me" means a generated picture with no APPROVE or REJECT yet (worked out from the saved results on this phone).
- Also fixed on the way: another session's three Grace walk strips use shape 2:1, which `validate.js` rejected and the Shape dropdown did not list (it would have shown 3:4 while sending 2:1). Both now know 2:1.
- Tests: `validate.js` OK (345 entries), `test.py` FAILS: [], `bake_test.py` FAILS: []. Looked at portrait and landscape shots (`tools/shots/art-ux-*.png`). No `?v=` tag or build stamp moved: `art.html` and the json carry no tag and no game file changed.

## 2026-11-03 (110): Grace's walk becomes three strips (`grace-walk-side`, `grace-walk-front`, `grace-walk-back`; prompts and json only, no game change)

- Tom (11-03 08:15 to 08:17) judged the first 3 x 3 walk sheet a miss. Facts (looked at the picture): frames 2, 3 and 6 are the same drawing (front three-quarter, walking right; frame 6 was meant to be from behind), frames 8 and 9 are the same drawing, and the head faces the camera on bodies walking sideways (2, 3, 6, 8, 9). The side row faced right, not left. About 6 distinct poses of 9, no mirrored step pairs. My first verdict ("usable") was wrong; Tom's was right.
- Call made (inference, not proven): the single mixed-view grid is the likely cause. Three 3-frame strips, one view each, in `tools/art-library/prompts/grace-walk-side.txt`, `-front.txt`, `-back.txt` (shape 2:1, same three refs as `grace-walk`). Each frame is described by which leg and arm is forward, says the three frames must be different drawings, and carries a HEAD DIRECTION RULE (head faces the way the body faces). Run the side strip first. STOP-LOSS: if the side strip also repeats frames or turns the head, stop; next method is the scene approach (paint her in the school yard, then cut) or single frames, not another reworded strip. The old `grace-walk` entry stays (draft, unused). The battle sheet is on hold until the strips work.
- tools/art-library/test.py: Characters 56, Grace slice widened, Tom slice shifted. Art Library test FAILS: []. No game change, no tag moved.

## 2026-11-03 (109): Art Library gets four more tabs: Battle 29, Title 4, Portraits 12, Flight 12 (342 entries in all; prompts and data only, no game change)

- Tom (11-03 09:30): load every tab of the Art Library now, test later. No `bake` fields, so approving only stores pictures under `art/raw/<tab>/`.
- Code: `battle-prompts.js` (29 backgrounds from the Project pack claude/battle-background-prompts.txt, shared rules written once, per-file title, scene and floor), `title-prompts.js` (welcome portrait, welcome landscape, logo on magenta, app icon), `portrait-prompts.js` (12 menu portraits, current portrait as likeness reference), `flight-prompts.js` (12 files of art/flight). `art.html`, `validate.js`, `make-prompts.js` and `test.py` know the four new tabs; test.py also checks every Battle prompt names the y 590 horizon.
- Calls made: the pack's "16-bit era storybook style" and "classic 16-bit RPG battle screen" lines are reworded to the approved painted wording ("NOT pixel art, NOT retro game art"; "a classic role-playing game battle screen"), because those words are banned. Nothing else in the pack changed. The 16 px Rose Mode battle icons stay code-drawn; "icon" means the app icon. The logo is its own picture on magenta; landscape gets its own welcome painting. Memory rooms stay in Rooms. Olivia, Aunt Ellie heights still assumed.
- Tests: test.py FAILS: [], bake_test FAILS: [], tag_check ok; all ten tabs screenshotted in portrait and landscape, tab switch about 0.8 s, no page errors.

## 2026-11-03 (108): Art Library loaded for EVERY tab (285 entries: Characters 53, NPCs 11, Areas 39, Rooms 61, Props 34, Enemies 87; prompts and data only, no game change)

- Tom (11-03 07:02): "BUILD THE FULL ART LIBRARY NOW, TEST LATER." Every entry has prompt, reference pictures and aspect ratio and NO `bake` field, so approving only stores a picture under `art/raw/<tab>/`; replacing live art stays a separate step. Nothing has been generated yet.
- Code (one module per tab group, all required by `tools/art-library/make-prompts.js`, rebuild with `node tools/art-library/make-prompts.js`): `party2-prompts.js` (Olivia, Michael, Jojo, Aunt Ellie, Nara; reuses `build(cast)` now exported by `party-prompts.js`, the first 34 entries are byte-identical), `npc-prompts.js` (new NPCs tab, 56 names in 11 lineup batches), `area-prompts.js` (7 Long Island paintings with 18 chained stencil prompts, 6 Los Angeles paintings; Long Island text is the Project prompt pack word for word in `prompts/areas/*.txt`), `room-prompts.js` (29 house rooms square, 32 interiors sized to their plate), `prop-prompts.js` (34 sheets of at most 15 props), `enemy-prompts.js` (86 enemies, painted rewrite of the old pixel codex prompt; data in `prompts/enemy-table.txt` and `prompts/enemy-moves.json`). `tools/art-library/validate.js` checks ids, tabs, ratios, refs, banned words, dashes and leftover fields; run it with no arguments for the whole json.
- Calls made: Olivia 5 ft 5 (assumed, flagged in her titles); Michael 6 ft 4 carrying Lachlan (4) on one arm and Isla (1) on the other in every frame; Jojo 5 ft 6 with adult head size, rectangular glasses, long straight light brown hair, long face; Aunt Ellie 5 ft 2 (assumed, flagged, ask Tom for the real one); Nara has her own dog prompts (40 lb Labradoodle, shoulder height about 1 ft 10, PUPPY DOG EYES as her signature frame). The enemies named "Pause Sprite" and "Standby Sprite" are called Imps inside their prompts because the word sprite pulls the generator toward pixel art.
- `art.html`: new NPCs tab; picture refs load lazily and cards use `content-visibility:auto` so 87 cards scroll without freezing (tab switch plus scroll about 0.8 s in portrait and landscape, no page errors; screenshots `tools/shots/art-<tab>-<portrait|landscape>.png`).
- Tests: `tools/art-library/test.py` now also checks the per-tab counts, unique ids, refs that exist or chain to an entry of the same tab, and no banned words or dashes. test.py FAILS: [], bake_test FAILS: [], tag_check ok.
- Open for Tom: Aunt Ellie's real height; the NPC ages, heights and genders were assumed from the game data (listed in the entry titles and the handoff).

## 2026-11-03 (107): Art Library loaded for the rest of the party (Tom, TNB, Rose, Amy, Justin, Deedee, Boppy; prompts, data and one error message; no game change)

- Tom (11-03 06:46): "continue building the full art library", test it all when done. Fact: Phase C step 1 (height chart, CHANGES (95)) and Grace's four entries were already in. Call made: give every other party member with a height on record the SAME four entries Grace has, because the scene method is the only one that has produced the painted look (CHANGES (99) to (102)). 28 new entries in the Characters tab (34 in the json): `<id>-hero-scene` (painted inside the school yard, 4:3), `<id>-hero-cut` (same picture, everything else flat magenta, 4:3), `<id>-walk` (3 x 3, 1:1) and `<id>-battle` (4 x 4, 1:1), for tom, tnb, rose, amy, justin, deedee, boppy.
- Code: `tools/art-library/party-prompts.js` (new; templates copied from Grace's four prompt files, one `CAST` row per person: real height, kind adult or child, mood, signature pose), required by `make-prompts.js`. Rebuild with `node tools/art-library/make-prompts.js`. Real heights from docs/CANON.md and the height chart: Tom 5'11", TNB 5'10", Rose 3'4", Amy 5'5", Justin 6'4", Deedee 5'5", Boppy 5'7".
- Order matters: scene first, then cut, then walk and battle. The cut entry's reference and the walk and battle entries' first reference point at `art/raw/characters/<id>-hero-scene-v1.png` and `-hero-cut-v1.png`, which is where APPROVE puts a picture (art.html). Until the earlier step is approved (and the site has redeployed, about 2 minutes) the thumbnail is broken; GENERATE then says "approve the earlier step first" (new text in art.html). If a later take is approved (v2), change the version in `party-prompts.js` and rebuild.
- Signature poses (frame 16, from each kit's special): Tom DEFEND (palm out, "No touching, please."), TNB WARDROBE (checks his shirt), Rose SILLY (raspberry), Amy PEP TALK, Justin DRYWALL (arms wide, "Everybody behind me."), Deedee TO THE MOON AND BACK, Boppy GRUMBLE. Frames 11 to 13 use the safe FLINCH, TIRED, NAP wording as for Grace; the cozy-sweats outfit rule is Grace only (everyone else keeps the outfit of the likeness picture). Head size: adults "about one fifth", Rose "a little over a quarter" (the chart's assumption, CHANGES (95)); every sheet also says the master picture's head wins over any number.
- Likeness pictures used (attachment 2 of each scene prompt): tom-hero-v3, tnb-hero, rose-hero-v2, amy-hero, deedee-hero, boppy-hero (all in tools/sprite-bake/src). Justin has no hero picture, so `justin-idle-v1.png` (battle stance, tool belt) is used and the prompt says he stands neutral. deedee-hero.png has a transparent background (RGBA) where the others are on magenta: if xAI rejects it, flatten it on magenta first.
- NOT in the Library on purpose: Olivia, Michael, Jojo, Aunt Ellie, Lachlan, Isla (no real height on record, Jojo is only "5'6" in notes and has no hero picture), Nara (a dog; needs her own prompt), NPCs, monsters, areas, rooms, props (those tabs are empty).
- Honest status: none of the 28 has been generated. Whether the Library's xAI route keeps the painted look on a scene prompt is still unknown (Grace's scene was run in Tom's other image AI, not in the Library). Stop-loss still applies per entry.
- Test changes: `tools/art-library/test.py` now expects 34 entries in order (Grace 5 after the test card, then Tom's four). Art Library test FAILS: [], bake_test FAILS: []. Looked at the Tom battle card in portrait (prompt, three thumbnails with the first one broken until step 2 is approved, 1:1, GENERATE). Checked all 34 prompts: no em dashes, no banned style words except the approved "NOT pixel art, NOT retro game art" line. smoke not run (no game file changed); no `?v=` tag moved (art.html and the json carry none).

## 2026-11-02 (106): iPad mode, `tab1` (the stage fills the whole iPad screen in landscape, no frame; controls, dialog and battle menu scaled up)

- Tom (11-02 22:04): "On iPad Pro landscape, the game does not go to the edges of the screen, it's in a frame. I want an iPad landscape optimized mode."
- Fact (cause): `#game` had `max-width:1100px`, and any screen at least 1140 x 650 got the desktop frame (5 px border, rounded corners, shadow, height capped at 900). Every iPad Pro in landscape (1194 x 834 and 1376 x 1032) matched, so it showed a 1100 px framed box on a dark background. The landscape HUD, D-pad, dialog and battle menu were also phone-sized (battle menu strip 224 px wide with 9 px text).
- Call made: a new `html.tablet` mode. `detectTablet()` in engine/audio.js: an iPad (user agent says iPad, or iPadOS Safari posing as a Mac with touch) or any coarse-pointer device, with the short side at least 700 px. `?tablet=1` or `?tablet=0` in the address, or `le-tablet` set to `on` or `off` in localStorage, forces it. Desktop browsers and phones are unchanged (checked: a 1376 x 1032 mouse browser keeps its frame, a phone in landscape is unchanged).
- What iPad mode does: (1) `#game` has no width cap, no frame, no height cap, so the stage fills the screen in both orientations. (2) The layout follows how the iPad is held; the rotate button (title, HUD, pause menu) is hidden and `toggleLayout` does nothing, because rotating a stage inside a landscape iPad would be wrong. (3) In landscape only, the HUD, quest card, minimap, toast, hint, D-pad, A and menu buttons, dialog box, title menu and the battle command strip use the phone landscape sizes times `--ts` (set on the root by `applyLayout`: screen height / 620, between 1.25 and 1.6; iPad Pro 11 gives 1.34, iPad Pro 13 gives 1.6). The battle strip is `clamp(280px, 224px x --ts, 360px)` wide. All rules are in the `html.tablet.landscape` block at the end of the last style block in index.html.
- NOT changed on purpose: the pause menu and shop (they already scale to the screen and looked right in screenshots), portrait iPad (it already filled the screen; only the 1100 px cap is gone), the battle scene itself (still 16:9, so on a 4:3 iPad there are dark bands above and below it; filling them would mean cropping the painting or moving the command strip below it, which is a bigger redesign).
- Tested (Chromium with touch and mobile emulation; no real iPad or Safari here): 1376 x 1032 and 1194 x 834 landscape, title, Square, Deedee and Boppy's house, a battle, pause menu and shop; iPad portrait 834 x 1194; desktop 1376 x 1032 (frame kept); phone landscape 852 x 393 and phone portrait 393 x 852 (unchanged); no page errors; smoke FAILS: [], tag check ok, camera_clamp FAILS: []. NOT run: unused_voice (no line, clip or move touched), the phone, a real iPad. CSS `calc()` nested inside `calc()` is used (valid CSS); iPadOS Safari should handle it, but it is unverified here.
- Stamp `build tab1`; `?v=tab1` on engine/audio.js and engine/main.js (index.html itself is never cached).
- Knobs: the `--ts` clamp in `applyLayout` (engine/audio.js) scales everything at once; the battle strip width is `--b2pw` in the same CSS block; `le-tablet` = `off` in localStorage turns the mode off on a device.

## 2026-11-02 (105): Grace's walk and battle sheets registered in the Art Library (`grace-walk`, `grace-battle`; data and tools only, no game change)

- Tom (11-02 18:06) did not want to keep using the outside image AI. Call made: run the same two prompts (CHANGES (104)) from ADMIN > ART LIBRARY, Characters tab, one GENERATE each. Entries added in tools/art-library/make-prompts.js, shape 1:1, refs in order: `grace-hero-cutai-v1.png`, `style_key_v1.png`, `height_chart_v1.png` (the page attaches them itself). data/art-prompts.json rebuilt (6 entries), tools/art-library/test.py expects the two new ids. Art Library test FAILS: [], tag check ok.
- Honest status: whether the Library's generator keeps the painted look is UNKNOWN. The earlier Grok misses were isolated-figure prompts; the scene method that worked elsewhere was never confirmed on Grok. One GENERATE per sheet; if the look is lost, stop (stop-loss), no reworded variants.

## 2026-11-02 (104): Grace's walk and battle sheet prompts written (`grace-walk.txt`, `grace-battle.txt`; prompt files only, no game change)

- Phase C, next step after Grace's hero picture (CHANGES (102)). Two prompt files in `tools/art-library/prompts/` for Tom's outside image AI (not registered in data/art-prompts.json on purpose: the Library's Grok route missed the painted look three times, CHANGES (99)). Attach in this order, both prompts: 1 `tools/sprite-bake/src/grace-hero-cutai-v1.png` (likeness, outfit, painted texture, magenta background), 2 `docs/reference/style_key_v1.png`, 3 `docs/reference/height_chart_v1.png`.
- Method: ONE step first (the approved painted picture on magenta is the style example and the background). If the brushwork is lost, fall back to two steps as for the hero pose (sheet painted in the school yard, then a cut on magenta).
- Walk sheet 3 x 3 (CHARACTER_PIPELINE 3B, 150 px figure) and battle sheet 4 x 4 (3C). Calls made: STYLE BLOCK v2 and its child sentence verbatim, plus one line that the head size of attachment 1 wins over any number (her master measures about .21, `grace3`; the bake grows her to .25 from the measured sheet, not the prompt). Battle outfit is the cozy sweats (no leotard; a gymnastics look can come with her ability sheets). Frames 11, 12, 13 are worded FLINCH, TIRED, NAP (the pipeline's hurt, black eye and knocked-out wording trips the generator); they bake to `bt_hurt`, `bt_low`, `bt_ko`. Signature (frame 16) is BOSSY POINT (`bt_sig`).
- Checked: no em dashes, none of the banned style words except the "NOT pixel art, NOT retro game art" line inside the approved STYLE BLOCK. No tag moved, smoke not run (no game file changed). Not run: the prompts themselves.

## 2026-11-02 (103): Art Library spend meter and cap (art.html only)

- Tom (11-02 14:15) worried the Library would cost hundreds of dollars. Fact: GENERATE makes exactly ONE image per press (`n:1`), about $0.04 plus $0.01 per attached reference picture (4 refs is about $0.08); the plan is sheets (hero, 3 x 3 walk, 4 x 4 battle, 4 to 7 pose ability sheets), not one image per pose. The page had no running total, so spend was invisible.
- Added a card at the top of art.html: estimated spend on this phone, picture count, a cap that starts at $10 (GENERATE refuses past it, +$10 raises it, RESET zeroes the count). Stored in localStorage `aot-art-spend`; an estimate from the price list, not xAI's invoice. Tested: meter renders, +$10 works, a full cap blocks GENERATE with a message; `tools/art-library/test.py` FAILS: [], tag check ok. art.html carries no `?v=` tag.

## 2026-11-02 (102): Grace's master hero picture is the image AI's magenta cut, Tom's choice (docs only)

- Tom (11-02 14:09), after seeing my stencil version (CHANGES (101)): "no keep the one I sent you". Decision: Grace's approved hero picture is `tools/sprite-bake/src/grace-hero-cutai-v1.png` (the AI's own cut on magenta, 1448 x 1086, repainted look Tom prefers). `grace-hero-cut-v1.png`, `grace-hero-cut-v2.png`, `tools/cut_grace_hero.py` and `tools/cut_grace_from_ai.py` are NOT the master; leave them, do not bake from them.
- Fact for later: it is on flat magenta (not transparent), so the bake keys from the corner colour (`key: 'corner'`, see the Art Library B5 notes). Not checked against the head-share rule, not baked, no tag moved, no game change.

## 2026-11-02 (101): Grace's hero cut redone with the image AI's outline as a stencil (`tools/cut_grace_from_ai.py`; sources only, no game change)

- Tom (11-02 14:02) said my GrabCut cut (CHANGES (100)) "looks like shit": paving specks, rough hair. Fact (cause): paving is nearly the same color as her pants and hair. Call made: Tom ran `grace-hero-cut.txt` in his image AI with the approved painting; the result (`tools/sprite-bake/src/grace-hero-cutai-v1.png`) has clean edges but its pixels are repainted (paler colors, pinker shoes, smoother texture), so it is NOT used for pixels.
- Method (as the Square and Row cutouts): the AI cut is only a stencil. `tools/cut_grace_from_ai.py` keys the magenta, aligns it to the painting (ECC affine, correlation 0.80, scale .991, shift 5.5 px) and takes every pixel from `grace-hero-scene-v1.png`. Output `tools/sprite-bake/src/grace-hero-cut-v2.png` (RGBA); previews `tools/shots/grace2-{magenta,gray,white}.png`, looked at. `grace-hero-cut-v1.png` and `cut_grace_hero.py` (GrabCut) are superseded.
- NOT done: Tom has not judged v2; no head-share check against the key; no bake. No tag moved, no game change, smoke not run.

## 2026-11-02 (100): Grace's hero pose came back painted; cut out locally (`tools/cut_grace_hero.py`; sources only, no game change)

- Fact: the Library's xAI generator missed the painted look three times (smooth, no brushwork) and ignored the school yard reference. Call made: Tom ran `grace-hero-scene.txt` in his other image AI with the four attachments; the result (Tom 11-02 13:57, "looks good") has the brushwork. Saved as `tools/sprite-bake/src/grace-hero-scene-v1.png` (1448 x 1086, Grace standing in the school yard).
- `tools/cut_grace_hero.py` cuts her out: GrabCut inside a hand-traced envelope, clothes clipped to a hand-traced outline, brick patches between the ankles removed by polygon. Output `tools/sprite-bake/src/grace-hero-cut-v1.png` (RGBA) and previews `tools/shots/grace-cut-{magenta,gray,white}.png`. The Library entry `grace-hero-cut` is no longer needed for this step.
- NOT done: small specks remain (a sliver left of the left leg, a dark bit right of the sweater, a dark bit at the left hair edge); hair wisps outside the envelope are lost; no bake script runs yet. No tag moved, no game change, smoke not run.

## 2026-11-02 (99): Grace's hero pose moves to a two-step scene method (`grace-hero-scene`, `grace-hero-cut`; prompts and json only)

- Stop-loss (Tom 11-02 13:33 and 13:38): two generations of `grace-hero` had the right likeness but no brushwork. Fact: the style key got its texture because the people were painted INSIDE the school yard painting. Inference: on a flat magenta background the generator paints one isolated figure in its clean default look. Call made: change the method, not the wording; `grace-hero` stays a draft, likeness reference only.
- Step 1 `grace-hero-scene` (shape 4:3, the school yard's shape): refs in order = school yard painting FIRST (output shape follows the first image), old Grace pose (likeness), style key, height chart. Grace alone, large and centered on the paving, cozy sweats.
- Step 2 `grace-hero-cut` (4:3): one ref, `tools/sprite-bake/src/grace-hero-scene-v1.png` (the step 1 picture Tom approves; Claude saves it there when he sends it back, so no GitHub token is needed). Prompt: keep her exactly as painted, replace everything else with flat pure magenta #FF00FF.
- `tools/art-library/test.py` expects the three Grace entries. Art Library test and bake_test FAILS: []. No game change, no tag moved. NOT run: real GENERATE; whether step 2 keeps the brushwork is the open question.

## 2026-11-02 (98): Grace hero prompt v2 after Tom's first generate (`grace-hero`; prompt and json only)

- Tom generated the first picture (11-02 13:33). Looked at it next to the style key. Fact: outfit, face, freckles, hair and keychain right; STYLE missed: smooth, soft, almost 3D-render look, head about a fifth of her height (key's Grace is about a quarter), not the dense brushwork of the key. Cause (mine): the prompt left out the style key prompt's "no airbrushed skin, no glossy plastic look" rule and did not attach the school yard painting.
- Change (one lever, first miss): STYLE RULE paragraph restored, `docs/reference/school_style_ref.png` attached as the texture target (refs now 4: key, school yard, height chart, old Grace pose), head wording "one quarter of full height, caricature, not a realistic child", fabric texture line. The first take is kept on Tom's phone only (his last 5 results). If this also misses for the same reason: stop-loss, ask Tom for a sample of the look he means or switch method (generate Grace inside a school yard scene like the key, then cut her out).
- Art Library test FAILS: [] (rerun), no game change, no tag moved. NOT verified: that xAI accepts the 3.4 MB school yard picture (max image size was never confirmed); if GENERATE shows a size error, shrink that reference.

## 2026-11-02 (97): Art Library gets its first real entry, Grace's hero pose (`grace-hero`; tools and data only, no game change)

- Tom (11-02 13:18): "lets finish art library". Fact: B1 to B5 were already built; what was missing was a real entry to generate. Call made: Grace's hero pose is the first, because every other Grace sheet copies it (Phase C step 2).
- Entry `grace-hero` (Characters tab, shape 2:3): refs = style key, height chart (`docs/reference/height_chart_v1.png`), `tools/sprite-bake/src/grace-hero-v2.png` (likeness only: face, hair, keychain). Prompt is the file `tools/art-library/prompts/grace-hero.txt` (read by make-prompts.js; edit the file, rerun `node tools/art-library/make-prompts.js`). Content: STYLE BLOCK v2 child wording, cozy sweats outfit (CHANGES (82)), pure magenta #FF00FF background, head about a quarter of height, 4'2", no em dashes. No `bake` field yet on purpose: an approval is stored under `art/raw/characters/` and replaces no live art.
- `tools/art-library/test.py`: now opens the Enemies tab before the test card and checks the other entries stay draft (it assumed a single entry). Art Library test FAILS: [], bake_test FAILS: [], tag_check ok. Looked at the Grace card in portrait (prompt, three thumbnails, 2:3, GENERATE). NOT run: a real GENERATE with Tom's key, smoke (no game file changed).
- Open: Tom has no GitHub token yet, so APPROVE and REJECT will refuse until he makes one.

## 2026-11-02 (96): Voice Library listed Spit Shine's lines under Dish-Towel Flick (Library index only)

- Tom asked why Dish-Towel Flick shows more than one voice line. Fact: Deedee's Basic move slot has two versions, Dish-Towel Flick (says "Dish-towel flick. You had a spot.") and the Remix Spit Shine (says the two old `basic` lines, "Hold still! You've got a smudge!" and "Spit shine! There. Much better."). The index builder gave the old `basic` lines the Primary's name. All three lines are played by the game, so nothing is purged.
- Fix: `tools/voice-library/make-index.js` now labels the two `basic` lines as Remix Basic move, Spit Shine. Dish-Towel Flick shows one line. Index rebuilt. No spoken text, clip or game file changed, so no re-bake.

## 2026-11-02 (95): Height chart reference image for the art restyle (Phase C step 1; docs and tools only, no game change)

- Fact: `docs/reference/height_chart_v1.png` (1536 x 1024) shows neutral grey figures at real height on one baseline with a 1 ft grid: Justin 6'4", Tom 5'11", TNB 5'10", Boppy 5'7", Amy 5'5", Deedee 5'5", Grace 4'2", Rose 3'4", Mudling 16". Adult head 21.5 percent of height, Grace 25 percent. Built by `python3 -I tools/make_height_chart.py` (edit `CAST` and rerun).
- Use: attach it to every character, NPC and monster sheet prompt next to `docs/reference/style_key_v1.png`, so the generator fixes the scale slips the key has (Amy too tall, shopkeeper too short, Mudling too high).
- ASSUMPTIONS, change in the script if Tom disagrees: Rose head share .27 (no approved Rose pose yet), Mudling 16 in tall (about Grace's knee). Olivia is left off (real height not on record). The grey shapes show size only; the chart says so in its caption.
- NOT done: the chart is not wired into any prompt entry yet (that is the next step, with Grace's first Library entry). No tag moved, no game file changed; smoke not run.

## 2026-11-02 (94): Deedee's takes doubled the phrase; her voice direction removed (Voice Library index only)

- Tom (11-02 13:07): new Deedee clips repeat the phrase two or three times. Fact (cause, from `finalText` in voices.html): a voice direction is put at the front of the first [tag] of every take, and `89` gave Deedee a 20-word direction ("grounded and natural; warm and loving when the line calls for it, firm and commanding when it calls for that"). That breaks the v4 tag rules (1 or 2 descriptors of 1 or 2 words per tag, voice only, no instructions; docs/VOICE_LIBRARY.md "v4 tag rules", the `vtag1` finding that too many qualifiers double the phrase). It was my change, not the new voice.
- Fix (one lever): Deedee's direction in `tools/voice-library/make-index.js` is now empty for battle and dialogue. Her own per-line hand-written tags still carry the acting ([firm, brisk], [delighted, warm]), so warm and stern both come from the line, not from a blanket direction. `data/voice-index.json` rebuilt. Her new voice id is unchanged.
- NOT verified against live ElevenLabs (no key here). If takes still double after this, the next suspect is the new voice itself (try the same line on a different Deedee option from recast-deedee.html) and then the 30 to 60 word lines (`looksDoubled` in voices.html catches most doubles and retries up to 3 times).

## 2026-11-02 (93): Music Library (ADMIN > MUSIC LIBRARY) built (`music1`)

- Tom (11-02 12:32) asked for a Music Library like the Voice Library, with filters, for all the music in the game. Spec: docs/MUSIC_LIBRARY.md (section 6 has the as-built notes and what was not verified).
- `music.html`: all 38 tracks as cards. Filter chips with counts (Group, Kind, Use, Show) plus search; Play (what the game plays now on this phone) and Loop test (the end crossfading into the start, the game's 2.5 s crossfade); an editable prompt per track with the fixed loop or jingle wording shown grey; New take through the ElevenLabs Music call (key `aot-el-key`, the same one the Voice Library uses; never in the page or the repo); Takes list with Use, Built into the game and Delete; tick boxes, Select all shown, Remake N two at a time with Stop; every make asks for two taps and shows the credit estimate; Export music takes (the take marked In the game for each track, `local-music-export.json`, shared or downloaded).
- Takes live in IndexedDB `aot-music-library`. `engine/local-music.js` (new) reads which take is picked; `mcFetch` in engine/music-clips.js plays that take on this phone, else `music/<id>.mp3` (any problem with the take falls back to the mp3). A phone take plays raw (no loudness match, no trim) until merged. Nothing in music/ changed.
- Track list `tools/music-library/tracks.json` (the 31 original prompts from claude/music-scripts.json plus 7 written for this build and marked `auto`: title, levelup, ns_party, ns_hunt, ns_frozen, ns_boss, ns_win). `music/manifest.json` is new (real length and size per mp3, from ffprobe; it matches MC_TRACKS for all 38). `node tools/music-library/make-index.js` writes `data/music-index.json` and keeps MC_TRACKS in step (it changed nothing this time). `python3 tools/music-library/merge-local.py <export> music` merges a phone export (loudnorm to -20 LUFS, silence trim, 96 kbps) and `python3 tools/music-library/seam.py <id>` writes the loop-seam wav to listen to.
- ADMIN now lists DEMO, VOICE LIBRARY, ART LIBRARY, MUSIC LIBRARY, BATTLE LAB, BACK (`openMusic`, engine/splash.js). CLAUDE.md "Where things live" has a music row.
- Tested: `python3 tools/music-library/test.py` FAILS: [] (38 tracks, chip counts add to 38, filters and search, key never in the page, 401 and no-key messages, two-tap make with the credit estimate, the request the stub saw: edited prompt plus loop wording, 60000 ms, instrumental, `music_v1`; take kept and in the game, second take, Use, Built into the game, Delete, Play and Loop test toggle, many at once, Show chips, Export file contents; the real game page picks the picked take through `mcFetch` and every other track still comes from music/; both orientations looked at). merge-local.py and seam.py run on scratch copies of real tracks (a bad id is refused, the other 36 manifest entries kept). NOT run: the phone, the live ElevenLabs call (no key here), Safari's handling of stored Blobs.
- Stamp `build music1`; `?v=music1` on splash.js, main.js, music-clips.js and local-music.js (music-clips.js had no tag before; music.html, data/music-index.json and music/*.mp3 need none).

## 2026-11-02 (93): Quest tracker redesigned so the step reads as an instruction, not a label for the area (`area2`)

- Tom (11-02 13:22): "Look around" read as if it belonged to the area label above it; make every clue contextual, refactor the frame if needed, reword clues for clarity. Supersedes the placement in (92).
- Frame, top to bottom: chapter label (small), then the step with a gold arrow, then progress pips, then a muted "pin + area name" line under a thin rule. The area is now clearly "you are here", separate from "do this". The step may use 3 lines (was 2). Both parts hide while the quest log is open.
- Every step now reads as an instruction. `questPhrase` (engine/story.js) turns a bare place ("the Reading Room.") into "Go to the Reading Room.", a direction ("up the stairs...") into "Go up the stairs...", people into "Find" / "Visit", and leaves verb-led goals alone. Applies to the tracker, the check-off flash and the quest log, and to goals already in saved games. Checked on all 100+ distinct goals in data/.
- Ten goals that were statements, not instructions, were rewritten (data/scenes.js x3, scenes-ch12, ch13, ch14, ch19, ch20, scenes-p2 x2): e.g. "Warden Boppy is at the Rivituso door." is now "Go to the Rivituso door. Warden Boppy is waiting there." and "Four doors lead to four rooms..." is now "Pick a door and go in...". No spoken line changed.
- The generic "Look around. The story will find you." is gone. With no goal yet the tracker says what to do where you are: "Explore Downtown LA and talk to people. Your next step shows up here." (follows the map; no pulse or flash for it).
- Tags: `?v=area2` on story.js, battle-draw.js, main.js, scenes.js, scenes-ch12/13/14/20.js (scenes-ch19.js and scenes-p2.js carry no tag); stamp `build area2`.
- Tested: smoke FAILS: [] with the tag check ok; unused_voice 0 on all five; portrait (no goal, place goal, three-part goal with pips) and landscape looked at, no page errors. NOT seen on the phone. Knob: wording of the fallback is in `currentObjective`; a goal that still reads badly: reword its `Goal:` toast or add a rule to `questPhrase`.

## 2026-11-02 (92): The quest tracker shows the current area under the chapter label (`area1`)

- Tom (11-02 12:55): in the overworld quest tip, below the chapter label, display the current area the player is in.
- Added a gold area line (`#qt-area`) between the "CH n" label and the step text in the top left tracker. `refreshAreaUI` (engine/battle-draw.js) fills it from `currentMap.name`, so it follows every map change (The Square, Rivituso Row, Deedee and Boppy's House). It hides while the quest log is open (the log has its own header) and shrinks in landscape; a long name is cut with an ellipsis rather than wrapping.
- Tags: `battle-draw.js?v=area1`, `main.js?v=area1`; stamp `build area1`. index.html markup and CSS only otherwise (served fresh).
- Tested: smoke FAILS: [] with the tag check ok; looked at portrait (Square, Deedee and Boppy's House, Rivituso Row) and landscape; no page errors. NOT seen on the phone.

## 2026-11-02 (91): Chapter 2 voice clips merged, ten lines reworded to Tom's takes, the "Round {n}" template out of the Library (`ch2clips`)

- Tom (11-02 12:36) sent `local-clips-export.json` (195 clips: 193 dialogue, 2 battle) as "updated voice clips for chapter 2" and asked that clips the GitHub app never uses be removed for good, and whether some are not from chapter 2.
- Merged 189 takes with `tools/voice-library/merge-local.js` (silence trim, speaker effects, Boppy deepened): dialogue 145 replaced in `dialog-ch2.js`, 27 in `dialog-ch25.js`, 2 in `dialog-ch6.js`, 1 each in `dialog-ch1.js`, `dialog-ch4.js`, `dialog-ch22.js`, 10 new keys added to `dialog-ch2.js`; battle: Boppy `tombo` "Hold the net STILL. Why's it moving?" and TNB `greet` "Well, well, well..." replaced (`data/voice/boppy.js`, `tnb.js`). `voice-clips.js` unchanged.
- Not from chapter 2 (fact, from the index): the five "..." beats of Mr. Washington's porch scene (Log, Skeeter, TNB, Tom, Mr. Washington) and TNB's greet "Well, well, well..." also play in chapters 4, 6 and 8 (one clip per voice and text serves every chapter); Boppy's Tombo line is a battle line with no chapter. All merged, they are the right clips.
- NEVER PLAYED, dropped (6 takes): the literal "Round {n}. ..." monster lines (Big One, Canyon Coyote x2, Smoglet x2, Ticket Flurry). `monsterLines` (data/monsters.js) fills {n} with the round number before speaking, so only "Round 2." to "Round 5." are ever heard (Tom recorded those too; they are in). The Voice Library offered the template because `tools/clip-audit/harvest.js` copied it raw: it now lists rounds 2 to 5 instead, so the template can no longer be recorded (index 4150 to 4140 lines). The six phone takes do nothing in the game; Tom can delete them from the Library or leave them.
- Ten takes carried Tom's own rewording in the script box (shorter lines, a new joke). Call made: the recording wins, the game text now says what the take says (data/scenes.js x9, data/maps-la.js x1): Michael "Nobody is coming for the job of a dad. Not even AI wants that!"; TNB "Also, your starter was bubbling out of the jar, so I baked a boule with it." / "He's been saying that for a while, babe." / "Main event. I'll take it." / "Spooky. I love it. Let's go check on Mr. Washington."; Tom "Fifty grams of flour, fifty grams of water. Stir. Look at those bubbles." / "I flew three thousand miles to see you... and maybe the starter." / "I'm proud. As long as you didn't spin it on your pottery wheel." / "Sit, paw, treat. She knows the whole routine. So polite!" / "TNB said he'd be home. Spring Street loft." The ten old-wording clips (dialog-ch2 and dialog-ch25, about 300 KB) were purged under the no-unused-voice rule (audio in git history, parent of this commit; docs/PURGED_VOICE.md). Tom's scripts for the ten went into `zz-v4-overrides.json` through apply-scripts.py, so the Library shows them. Two takes kept with an allowed variant: Boppy "STIILL" (stretched vowel) and TNB "Los Angeles" for "LA".
- Bug fixed on the way: `monsterLines` replaced only the first `{n}` ("Round 3. Day {n} in the fridge."); now every one.
- Audit tool fixed (`tools/clip-audit/unused_voice.py` check 4): it read `DIALOG_CLIPS` from the page 2.5 s after load, but engine/dialog-voice.js loads the chapter files one at a time after startup, so most keys were never seen; it now reads every `data/voice/dialog-ch*.js` from disk and matches the full text (backslashes dropped) instead of the first 40 characters, and `--write-spec` now writes `orphanDialog` for purge_unused.js. With the fix the whole tree still shows 0 orphans apart from the ten above.
- Tags: `?v=ch2clips` on monsters.js, maps-la.js, scenes.js, voice/boppy.js, voice/tnb.js, main.js; stamp `build ch2clips`. The chapter dialogue files carry no tag (304 check, as since `sw1`).
- Tested: unused_voice 0 on all five (after the purge); smoke FAILS: [] with the tag check ok; `SCENE=ch2Porch` frames looked at (new lines fit the box, no page errors); a page load with every chapter file in shows the ten new keys resolve to audio and the old "Mad? I'm proud." key is gone. NOT run: the phone; a speech-recognition check of the takes.

## 2026-11-02 (90): Art Library step B5, the art-bake Action (workflow and tools only, no game change)

- New `.github/workflows/art-bake.yml`: on a push to `main` that touches `art/raw/**` (what APPROVE in art.html commits), it runs `tools/art-library/art_bake.py`, then `tools/tag_check.py`, then commits the result back to `main` with `[skip ci]`. It can also be started by hand from the Actions tab.
- `tools/art-library/art_bake.py`: for each approved entry in `data/art-prompts.json` whose newest version file changed, optionally keys the background to transparent from the picture's own corner colour (the generator's magenta comes out crimson), copies it to the entry's `bake.src`, runs `tools/sprite-bake/<bake.script> <bake.args>`, then moves the cache tags and puts a CHANGES entry on top. An approved entry with no `bake` field is stored only. CALL MADE: `test-mudling` has no `bake` field, because a bake would overwrite the live Mudling art with a one-picture test; `bake` is added per entry in Phase C, when an approval should replace live art.
- `tools/art-library/bump_tags.py <TAG>`: runs the tag check against HEAD and fixes each failure (every literal `path?v=` tag, the `ART_V`, `BG_V`, prop `V` and flight `v` constants, the script that holds a constant, `main.js` and the title stamp), looping until it passes. This is what keeps phones from serving stale art since `sw1`.
- Tested: `python3 tools/art-library/bake_test.py` (scratch clone, fake approved push with a crimson background and a pink spot inside the figure): corners transparent, the pink spot survives, fake bake runs, `ART_V`, a portrait tag, `painted.js`, `main.js` and the stamp all move, CHANGES entry on top, tag check passes, entry without `bake` left alone, a run with no `art/raw` change does nothing, odd paths refused: FAILS: []. `python3 tools/art-library/test.py` FAILS: []. Smoke not run (no game file changed).
- NOT verified: the workflow on real GitHub Actions (the sandbox cannot run it); whether a push made by the Action's own token starts the GitHub Pages deploy (expected yes, not tested); whether the bake scripts' Python packages (pillow, numpy, scipy) are enough on the runner (the `bake_foe.py` imports suggest yes). First real approval will show it.

## 2026-11-02 (89): Deedee's new ElevenLabs voice installed in the Voice Library (no game change)

- Tom (11-02 12:45) picked a recast voice on recast-deedee.html and sent its id, `nh4f8rul91SCFqbXpyM0`. Call made: the id is set in `tools/voice-library/make-index.js` for both `battle|deedee` and `dialog|deedee` (the same way Boppy's accent and similarity are overridden), NOT in `data/voice-clips.js` or the twelve `data/voice/dialog-ch*.js` files, which still carry the old id `9UrcxKDUU0pvcnFhdfTU` as baked data. The game plays baked clips and never reads the id, so only new Voice Library takes use the new voice. `data/voice-index.json` rebuilt.
- Also changed (call made, tell Tom): Deedee's voice direction is now "grounded and natural; warm and loving when the line calls for it, firm and commanding when it calls for that" (was "smiling, affectionate, bright and youthful, never stern", which contradicts canon: she is warm when it calls for it and stern when it calls for it), and her base script tag for lines with no hand tag is "warm, steady" (was "warm, bustling"). Her hand-written per-line tags are unchanged. If new takes sound off, the direction is the one lever to look at first; the id change and the direction change landed together.
- The old Deedee voice `9UrcxKDUU0pvcnFhdfTU` is deleted in ElevenLabs if Tom left the delete-first box ticked (default); the baked clips already in the game keep playing either way.
- Tested: voice-library test ALL PASS; tag check ok. No game script, art or tag changed.

## 2026-11-02 (88): Art Library step B4, APPROVE and REJECT commit to GitHub (`art.html`, page and test tools only, no game change)

- Tom (11-02 12:35) generated the first test picture (the Mudling) in the Library, so the phone can reach the image service directly (no relay needed; not tested by me). Next step per the plan: B4.
- Each result tile now has APPROVE and REJECT (two taps, the first only arms the button). APPROVE commits the picture to `art/raw/<tab>/<id>-v<n>.png` on `main` (n = next free approved version) and then writes the prompt that made it, `status: approved` and a `versions` entry into `data/art-prompts.json`. REJECT needs a note (box under the pictures) and writes it into that entry's `rejects` list with `status: rejected`, plus Tom's edited prompt text. Uses the GitHub contents API with the token Tom pastes on the page (`aot-gh-token`, localStorage only, never in the repo, never shown; the page only says "token set"). A stale file hash retries up to 3 times; 401, 403 and 404 give plain messages. Without a token the buttons explain what to do. No token means GENERATE still works (it needs only the xAI key).
- Tested: `python3 tools/art-library/test.py` against `tools/art-library/stub.py` (now seeded with the real data/art-prompts.json and answering 409 for a PUT to an existing path with a wrong hash): no token, bad token, reject without a note, reject with a note, approve v1, approve v2, both pictures under art/raw/enemies/, json status, versions and rejects checked, tokens never in the page, no page errors portrait and landscape. smoke FAILS: [], tag check ok (pages are always fetched from the network, so no tag).
- NOT verified: anything against real GitHub (the sandbox cannot reach it) or from a phone, including CORS on api.github.com (it allows browser calls to my knowledge, not tested) and the fine-grained token permission (Contents: Read and write on adventures-of-tom).
- IMPORTANT for any session editing `data/art-prompts.json`: Tom's phone commits to `main` directly, so `git pull --rebase` before running `node tools/art-library/make-prompts.js`, and commit the result at once (make-prompts keeps status, versions and rejects for existing ids). Read the entries' `rejects` notes first: they are Tom's feedback.
- FINDING for the bake step: the generator's "plain flat magenta" background came out crimson-pink (about RGB 214, 2, 104), not #FF00FF. Prompts that will be cut out must say "pure magenta #FF00FF", and the bake must key from the corner color, not from #FF00FF.
- Not built yet: B5 (GitHub Action that bakes `art/raw/**`, bumps ART_V and tags). After B5, the Music Library (docs/MUSIC_LIBRARY.md), then Phase C.

## 2026-11-02 (87): Deedee recast brief rebalanced, warm and stern both (recast page only, no game change)

- Tom (11-02 12:37): the 12:30 brief went too far the other way: she is warm when the occasion calls and stern when it calls. `CFG.deedee` in `tools/voice-recast/build.js` now describes a grounded, natural, steady voice with range: calm, warm and matter-of-fact day to day, tender when someone needs comfort, firm and commanding when someone needs setting straight, then back to warm; never giggly or gushing and never stern all the time. The audition sample now moves warm, stern, warm so all three options are judged on both. Direction string matches. Page rebuilt; the saved-description key is now `-v3` so the new brief shows. No game script, art or tag changed.

## 2026-11-02 (87): Music Library spec written, queued after the Art Library (docs only, no game change)

- Tom (11-02 12:32): "make a file called music library, same as voice library with filters etc. it's for all the music in the game. add it to the build instructions once the art library is done." New `docs/MUSIC_LIBRARY.md` (Project copy `claude/music-library.md`): a `music.html` admin page, fifth ADMIN entry, every one of the 38 tracks in `music/` as a row with Group, Kind, Use and Show filters, Play and a loop test, an editable prompt with the fixed loop or jingle suffix added at send time, New take through ElevenLabs Music (`/v1/music`, the same call the old desktop music baker made), Use so the newest take plays in the game on the phone (a new `engine/local-music.js` in front of `mcFetch`), Remake N with a credit estimate, Export, and a merge tool (`claude/music-merge.py` moved into `tools/music-library/`) that normalizes and installs the takes and rewrites `MC_TRACKS`.
- Build order (call made): right after Art Library step B5, before Phase C; one session, stamp `build music1`. Recorded in claude/next.md.
- Nothing in the game changed; no tag moved; smoke not run.

## 2026-11-02 (86): Deedee recast brief rewritten, firm and commanding (recast page only, no game change)

- Tom (11-02 12:30): the first recast brief "is not Deedee at all": she is warm and loving when called for, but not always laughing and giggly; she can be stern and commanding and takes no nonsense. Rewrote `CFG.deedee` in `tools/voice-recast/build.js`: description (strong, clear, confident, authoritative, brisk and firm, dry when unimpressed, never giggly, breathy or sing-song, warm only when the moment calls for it, natural Long Island accent), direction ("firm, brisk, commanding, no-nonsense; warm only when the moment calls for it, never giggly") and the audition sample (a stern line, then one warm line). Rebuilt `recast-deedee.html`. The saved-description key on the phone is now `aot-recast-deedee-desc-v2`, so the new brief shows even if the old one was cached.
- NOT changed, and probably related to the giggle Tom reported on 11-01: `BASE` in `tools/voice-library/make-index.js` still gives Deedee "warm, bustling" and her Voice Library scripts and baked `direction` in `data/voice-clips.js` still say "smiling, affectionate, bright and youthful, never stern". Those are what her new takes are directed with until they are rewritten.
- Re-ran the stub test (portrait and landscape): FAILS: []. No game script, art or tag changed.

## 2026-11-02 (85): Art Library page, steps B2 (generate) and the ADMIN entry (`art1`)

- Tom (11-02 11:54) approved the style key and asked for the Art Library next. New `art.html` (standalone page like `voices.html`, opened from the title screen ADMIN > ART LIBRARY, which is the new third entry): tabs Characters, Areas, Rooms, Props, Enemies; each picture is a card with its editable prompt, its reference pictures as ticked thumbnails (at most 5), a shape choice and GENERATE. GENERATE sends the prompt and the ticked references to the xAI image service (`/v1/images/edits` with references, `/v1/images/generations` without), keeps the last 5 results per picture on the phone (IndexedDB `aot-art-library`), tap a result to enlarge, Save downloads it, EXPORT ZIP packs every kept result and the edited prompts. Keys: xAI key and GitHub token in localStorage (`aot-art-key`, `aot-gh-token`), the page shows only "key set" or "no key". An optional relay address (`aot-art-relay`) replaces api.x.ai if the browser cannot reach it directly (B3). Prompts come from `data/art-prompts.json`, written by `tools/art-library/make-prompts.js` (one test entry so far: the Mudling in the style key look).
- NOT in this push: APPROVE and REJECT (B4, commits to GitHub), the bake Action (B5). Edits to a prompt are kept in localStorage until B4 commits them.
- Tested with `python3 tools/art-library/test.py` (own web server plus `tools/art-library/stub.py`, no real keys): no key, bad key shows the 401 text, generate with one reference goes to /edits and without goes to /generations, only the last 5 results are kept, the export zip is valid, the key is never written into the page, no page errors in portrait or landscape (screens in tools/shots/art-*.png); ADMIN lists DEMO, VOICE LIBRARY, ART LIBRARY, BATTLE LAB, BACK; smoke FAILS: [] (tag check ok).
- NOT verified: anything against the real xAI service or from a phone (the sandbox cannot reach api.x.ai), including whether browsers are allowed to call it (CORS) and the edit response shape.
- Stamp `build art1`; `?v=art1` on splash.js and main.js.

## 2026-11-02 (84): Recast Deedee page, and the 30-voice ElevenLabs limit written down (new page, no game change)

- Tom (11-02 11:57): wants a quick way to recast Deedee's voice that can delete the existing voice to free a slot, and the account limit of 30 custom voices recorded in the build instructions. New standalone page `recast-deedee.html` (repo root, linked from nowhere; open it by address: https://trivituso81.github.io/adventures-of-tom/recast-deedee.html). Built by `node tools/voice-recast/build-deedee.js` from `tools/voice-recast/recast-deedee.src.html`; the voice brief and sample text are read from `CFG.deedee` in `tools/voice-recast/build.js` (edit them there, rebuild). The page also has an editable description box saved on the phone.
- Flow: paste the key (the same `aot-baker-key` the Voice Library uses), Design 3 options (previews never use a slot), play, Use this voice. By default it DELETES the old Deedee voice first, then saves the new one; with the box unticked it saves first and, if the account says full, deletes the old Deedee voice and retries once. "Delete old Deedee voice now" and a list of custom voices with Delete buttons (voices the game uses are marked IN USE, and delete asks to confirm) free more slots. The new voice id is shown with a Copy button; Tom sends it to Claude, who sets `voices.deedee.voice_id` in `data/voice-clips.js` (the one voice-clips edit allowed for a recast) and rebuilds the Voice Library index. Baked clips keep playing; only new takes use the new voice.
- Tested with a stub ElevenLabs (Playwright, portrait and landscape): custom voices list filters premade, IN USE flag, 3 options, delete-then-create order, full-account fallback order (create, delete, create), no page errors. NOT run against live ElevenLabs (no key here): endpoints are the ones `tools/voice-recast/template.html` already used.
- STANDING FACT: Tom's ElevenLabs account is at its limit of 30 custom voices (library voices count too). Any recast, new voice or voice design must free a slot first. Recorded in CLAUDE.md "ElevenLabs voice limit", docs/VOICE_LIBRARY.md "Limits", the Project instructions and claude/canon-addendum.md.
- No game script, art or tag changed, so no ART_V, `?v=` or stamp change.

## 2026-11-02 (83): style key v1 approved, Art Library step B1 (docs and tools only, no game change)

- Tom (11-02 11:54) approved the second school-based style key picture ("approved"). Saved as `docs/reference/style_key_v1.png` (1448 x 1086). Section 7 of docs/CHARACTER_PIPELINE.md now states the new head shares (adults about .21 to .22, Grace about .25) and lists the key's own scale slips so they are not copied.
- Art Library Phase B, step B1: `tools/art-library/gen.js` builds and sends the xAI image request (model `grok-imagine-image-2.0`; no references: POST /v1/images/generations; one to five references: POST /v1/images/edits with an `images` array of `{type:'image_url', url:<data URI>}`; `response_format` `b64_json`; key only from the `XAI_KEY` environment variable, never printed). `tools/art-library/stub.py` fakes the xAI and GitHub endpoints for tests (bad key gives 401, a wrong body gives 400).
- Checked: request fields against docs.x.ai (generation, editing and multi-image pages, 11-02). Tested against the stub only: bad key gives 401 (exit 3), no references gives an image, two references go to /edits as 2 images. NOT verified, because the sandbox network blocks api.x.ai: the live 401, the edit response shape (the docs show only SDK output; gen.js accepts `data[0].b64_json` or `data[0].url`), the maximum image size, and browser access (CORS). B3 must test CORS from Tom's phone with his key; the page will support a relay URL from the start.
- No script, art or tag changed, so no ART_V, `?v=` or stamp change.

## 2026-11-02 (82): Grace's look changes to cozy sweats (style key prompt only so far)

- Tom (11-02 11:47): Grace should wear loose, comfy, cozy sweats and cute glittery sneakers, and keep her squishy keychain. Call made for the style key prompt: oversized soft lavender sweatshirt, baggy heather-gray sweatpants, pink and silver glitter sneakers, keychain clipped at the hip (`docs/reference/style_key_prompt.txt`, GRACE'S OUTFIT section). Her hero pose `tools/sprite-bake/src/grace-hero-v2.png` (leotard) is now likeness-only for face, hair and keychain. NOT done: a full Grace redo (hero pose, walk, battle and ability sheets) and any in-game change; that belongs to Phase C after the style key is approved. Her gymnastics and violin moves stay canon; whether they keep a leotard in battle is not decided (ask Tom when Grace's sheets are regenerated). No game change.

## 2026-11-02 (81): style key prompt v2, likeness-only references (docs only)

- Tom saw the first school-based style key picture: likes the head size (about one fifth of body height for adults, a quarter for Grace; approved as the new proportion), but the characters did not match the school painting: smoother, glossier, photo-collage look, no lamp light or contact shadows. Cause (inference): the three hero poses attached for likeness are in the old smooth style and the generator copied their rendering. `docs/reference/style_key_prompt.txt` now has a STYLE RULE (references are likeness only; repaint in the school's dense texture, brushwork and crisp edges) and lights the characters with the scene's lamplight and dusk sky with soft contact shadows. One adjustment only; a second miss for the same reason triggers the stop-loss. No game change.

## 2026-11-02 (80): the school yard painting is the art style reference (docs only, no game change)

- Tom (11-02 11:40, with a painting of the school yard at dusk: brick school, paw-print crest, flag poles, playground, "THE SQUARE" and "SCHOOL ENTRANCE" boards): "i want the school to be our reference for art style. i know it might mean we need to redraw the square but im ok with that."
- Call made: the school painting replaces the Square crop as the style reference for characters, NPCs and monsters. Saved as `docs/reference/school_style_ref.png` (1448 x 1086; it is also a candidate for the school yard area painting, installed later by the area method, not now). STYLE BLOCK v2 in docs/CHARACTER_PIPELINE.md section 0 now asks for a rich, dense, jewel-toned painted look with fine brushwork, deep saturated colors, rich contrast and crisp fine edges (still warm golden light from the upper left, still no thick outlines). `docs/reference/style_key_prompt.txt` now attaches the school painting as attachment 1 and puts the five characters on its paved walkway.
- NOT decided or done: redrawing the Square (and the interiors). Recommendation: only after Tom approves the new style key and sees it beside the Square. Nothing regenerated, no art or script changed, so no tag, ART_V or stamp change.

## 2026-11-02 (79): Bake Voices and Recast Justin removed (`nobake1`)

- Tom (11-02 11:07): remove Bake Voices from the admin panel and all its code, same for Recast Justin. Fact (checked first): the bake list was empty (`pending.json` was `[]`) and the Voice Library already does everything Bake Voices did (same ElevenLabs call, key, `finalText`, `aot-local-clips` store and export file), so nothing was lost.
- ADMIN now lists DEMO, VOICE LIBRARY, BATTLE LAB, BACK (`engine/splash.js`: both entries and `openBake`, `openRecast` deleted).
- Deleted: `bake.html`, `recast-justin.html`, `data/bake-list.json`, `tools/bake-page/make-list.js`, `tools/bake-page/pending.json`, `tools/voice-recast/build-justin.js`, `docs/BAKE_PAGE.md`.
- Moved, not deleted: `tools/bake-page/merge-local.js` is now `tools/voice-library/merge-local.js` (the merge tool for Voice Library exports; same code, header updated). KEPT on purpose: `engine/local-clips.js` (the game reads Voice Library takes through it; only its comment changed) and the other recast bakers in `tools/voice-recast/` (Deedee and Ellie, Grace), which Tom did not ask about.
- `tools/voice-library/make-index.js` no longer reads `pending.json` (it was `[]`, so `data/voice-index.json` is byte-identical after a rebuild). Comments that pointed at `pending.json` fixed in `data/lines.js` and `engine/battle2-kind.js`; docs/VOICE.md, VOICE_LIBRARY.md (now holds the merge steps), CHARACTER_PIPELINE.md, JUSTIN_ABILITIES.md and the `sw.js` comment updated.
- Tested: smoke FAILS: [] (includes the tag check), voice-library test ALL PASS, unused_voice 0 on all five, ADMIN screenshots in portrait and landscape show four entries with no page errors. NOT run: the phone. Stamp `build nobake1`; `?v=nobake1` on splash.js, lines.js, battle2-kind.js, local-clips.js, main.js.

## 2026-11-02 (78): That Cloud Is Lamby no longer holds still for 2.5 seconds (`freeze2`)

- Source: claude/battle-animation-audit.md finding 4, part 2. Looked at frames first (`tools/tombo_test.py`, every 0.5 s). Fact: in the Director's Cut `rose1_dc` Tom, Rose, the cloud and the bread thought bubble were nearly identical from about 2.5 s to 5.0 s while Tom's line plays.
- Fix (engine/battle2-kind.js, `B2_TOMBO_ANIM.rose1_dc` only): while Tom explains the loaf, Rose shakes her head side to side (about 2 px, from 1.3 s after his line starts until just before hers), the bread bubble bobs 2 px, and the cloud drifts 7 px sideways until it morphs. No voice line, clip, damage or timing value changed; the spans still follow the two clips.
- Looked at and left alone: `boppy1_dc` (Quiet on Cattail Pier). The still stretch is about 1 s of Boppy hunched at "SHHH!" with Tom chewing the bait; it reads as a held joke, not a freeze.
- Tested: tombo_test rose1_dc FAILS: [] with frames looked at before and after. Smoke and tag check below. NOT seen on the phone. The other detector-flagged moves (tom.sourdough_snob, skincare_10, seat_1a, nara.puppy_eyes, doodle_fluff, tnb.throw_down, Tombos amy3, tnb3, ff4, deedee1, rose3, ff1) were NOT looked at yet.
- Stamp `build freeze2`; `battle2-kind.js` and `main.js` `?v=freeze2`.

## 2026-11-02 (77): Service worker, so the game downloads once (`sw1`)

- New `sw.js` (repo root), registered at the end of `index.html`. Tom decided on 11-02 10:20 that this is the next build (CLAUDE.md "Load time"). Fact (measured with a real load in Playwright): one session touches about 1,000 files and 230 MB. 120 scripts carry a `?v=` tag (50 MB), 184 scripts do not (3.9 MB), and the chapter voice files `data/voice/dialog-ch*.js` (94 MB, up to 13 MB each) are injected after the title with no tag. The plan said every file carries a tag; that was wrong, so untagged files are handled separately.
- How requests are answered: pages (`index.html`, `voices.html`) always from the network, with a saved copy only for starting with no signal; `?v=` files cache first; untagged files use the saved copy only after the server answers 304 to If-None-Match or If-Modified-Since (a changed file downloads); `cache:'reload'` (the welcome-page RELOAD button's script fetches) and `no-store` go to the network, and `reload` refreshes the saved copy. Old copies of a file are deleted when a newer `?v=` of it is saved. After a load the page lists what it used and the worker saves anything missing, so the second launch is already served from it. `?nosw` on the address turns the worker off. Last resort for a stale phone: change `SW_VER` in `sw.js`.
- New `tools/tag_check.py`, run by `tools/smoke.py`: compares with `origin/main` and fails for any modified file whose `?v=` tag (literal `path?v=TAG`) or folder constant (`ART_V`, `BG_V`, prop `V`, flight `v`) did not move. Checked by hand: a changed `data/monsters.js`, `art/amyhouse.webp`, `portraits/tom.png` and a `bgs` and an `art/foes` file each failed until bumped; a changed untagged script passed. It also catches the follow-on case: bumping a constant means the script that holds it must move its own tag.
- New `tools/sw_test.py` (about 90 s). Result: cold load saves all 1,003 files the page used; second load is 1,006 requests all answered by the worker, 0 tagged files reach the server, 202 untagged files get a 304, index.html comes from the server; a file changed on the server under the same tag is not downloaded again; a bumped tag downloads and the old copy is deleted; a changed untagged script downloads; `cache:'reload'` reaches the server; with the network off the game still starts. Run twice, same result.
- Also tested: smoke FAILS: [] (includes the tag check), camera_clamp FAILS: [], rooms_test FAILS: [], portrait and landscape title screenshots looked at. NOT run: the unused-voice audit (no line, clip or move changed) and the phone. NOT changed on purpose: engine/splash.js (RELOAD already fetches every script with `cache:'reload'`), and the three post-build items (mp3 voice files, loading bar, per-member sprite loading), which wait for Tom to ask by name.
- Stamp `build sw1`; `main.js?v=sw1`.

## 2026-11-02 (74): Rivituso Row v3 painting installed with cutouts (`row3`)

- Installed Tom's Row v3 painting (1310x1201, scaled to 1536x1408, 24x22 tiles) as art/row.webp, plus art/row-fg.webp, a transparent cutout layer so Tom walks behind trees, lamps, posts, roofs, eaves, awnings and tall props (26 zones in PLATE_BEHIND.row, built by tools/make_row_fg.py).
- Cutout method (fact): the four generator mask pictures are used only as masks. Each piece is aligned to the painting, snapped to the real edge, and the pixels come from Tom's painting. The masks and original are kept in docs/reference/.
- Not cut: the five grouped prop clusters (alignment failed) and the thin cafe chair back (only partly cut). Both are minor.
- Layout rebuilt: walk map from Tom's reviewed map; houses Rivituso (door 9,5), Gregori (two doors 14,8 and 15,8), Ellie (two doors 7,17 and 8,17); north exits to the Square, south exits to Cattail Pier; signs, bench, planters moved; Gus to 4,9. Painted lettering replaces the old drawn signs (PLATE_SIGNS.row is empty).
- New engine feature: `door2:true` on a house adds a second door tile beside the first (engine/world.js placeHouse).
- Scripted coordinates updated for ch13, ch14, the Nine Scoops Pier gate and the Pier to Row arrival.
- Tested: Row reach test 0 fails, camera clamp, rooms test for the three houses, smoke FAILS: [], all five doors enter the right house, Square to Row and Row to Pier to Row transitions, ch14 opening scene played, portrait and landscape looked at. Not seen on the phone. Bumped ?v= tags, ART_V and the stamp to row3.

## 2026-11-02 (76): Load-time plan recorded as a standing rule (`loadplan`, docs only)

- Tom asked why the title screen loads so slowly. Fact: 51.5 MB of blocking scripts in 306 tags, 37 MB of it base64 voice audio, ~10 MB baked sprite data, no service worker. He decided (10:20) to defer the restructure while the game is still being built.
- CLAUDE.md "Load time (standing rule, 2026-11-02)": the NEXT build adds a service worker (cache-first for `?v=`-tagged files, network for index.html) plus a smoke check that a changed file's tag was bumped. Voice as real mp3 files, a loading bar and per-member sprite loading are POST-BUILD ONLY, started only when Tom asks by name.
- No game code changed, no stamp or tag bump.

## 2026-11-02 (75): Four moves no longer freeze mid-animation (`freeze1`)

- Source: claude/battle-animation-audit.md finding 4 (quiet stretches of 1.0 to 3.8 s). Each fix adds one reaction inside the quiet window; no art, no voice line, no clip and no damage timing changed.
- Rose, Bedtime Story: the enemies doze off one by one (a "Z" rises over each, starting at 2.8 s, 0.65 s apart) while the story runs; before, nothing moved from 2.2 s to 6.0 s except the page. The enemy list comes from `B2.foes` because this move's targets are the party.
- Tom, Disconnected Controller (`button_mash`): after the BONK the struck enemy sees stars (three stars circle its head, new scene `tp_dizzy`) and wobbles again at 0.9 s.
- TNB, Mug Toss: while the mug sits on the ground the struck enemy flinches at 3.5 s and the glaze sparkles at 3.9 s with a second ding.
- Nara, Stranger Alert: during the FROZEN hold Nara does a proud little hop with a WOOF! (3.45 s) and the frozen enemies shiver once.
- Tested: kit_test on each of the four moves (FAILS: []), frames looked at before and after; smoke tom,rose,tnb,nara FAILS: []; unused_voice 0 on all five checks. Not seen on the phone.
- Still open from audit finding 4: Tombos rose1_dc, boppy1_dc (may be intentional), and the flagged but unviewed tom.sourdough_snob, skincare_10, seat_1a, nara.puppy_eyes, doodle_fluff, tnb.throw_down, Tombos amy3, tnb3, ff4, deedee1, rose3, ff1. Look at each before touching. Tags bumped: `tom-moves.js`, `rose-moves.js`, `tnb-moves.js`, `nara.js`, `main.js`; stamp `build freeze1`.

## 2026-11-02 (74): Deedee calls Tom "My favorite son!" and says "You must be starving!" (`deedee1`)

- Tom's request: everywhere in the game, Deedee's "There's my Tommy!" becomes "My favorite son!", and "you're skin and bones" becomes "You must be starving!". Reworded in all live spots: the chapter 1 Rivituso kitchen scene (`ch1Theft`, both lines), the chapter 3 fishing scene return (`ch3Fishing`), Deedee in the Rivituso house on the walking map (data/maps-le.js), the Nine Scoops thaw scene (data/bonus-nine-scoops.js, "My favorite son! And my girls! And my... oh. OH. Why is Rose in an ice cube."), and her battle and street greeting pool (`deedee.greet` in data/lines.js). The kitchen line is now "Tom, you must be starving! Sit. The crisp needs ten minutes on the counter." Other "Tommy" lines (for example "That's love, Tommy.") are untouched on purpose; he asked only for the greeting.
- The four new texts ("My favorite son!", "My favorite son! And my girls! Come here, come here.", the kitchen line and the Nine Scoops ice cube line; six places in all) are NEW TEXT, so they are silent (speech synthesis) until Tom records them. Five baked Deedee clips with the old words were deleted under the no-unused-voice rule (one battle `greet` clip, four dialogue clips in dialog-ch1, ch25, ch26; about 171 KB; audio is in git history, parent of this commit). `unused_voice.py` reports 0 on all five checks. docs/PURGED_VOICE.md note below.
- Voice Library: scripts written for the five new lines (voice-only tags, 1 tag on 3 words, 2 or 3 on longer ones) through apply-scripts.py; list rebuilt with battle-scripts.py, harvest.py, make-index.js. They show in the bake list as lines with no clip.
- Tooling: tools/clip-audit/purge_unused.js now also removes dialogue clips (spec key `orphanDialog`, list of `voice|exact text`), with the same byte-for-byte round-trip check, and stops at the first `});` of each dialogue file (a second `Object.assign(DIALOG_CLIPS.voices,...)` follows it). FINDING: audit check 4 did not flag three of the four dead dialogue clips because it skips any clip whose first 40 characters still appear in an old reference file under tools/ (tools/voice-recast, tools/clip-audit/dd-*.json). Read the old text by hand next time a dialogue line changes.
- Not changed: demo/ (frozen). Tags bumped: `scenes.js`, `maps-le.js`, `bonus-nine-scoops.js`, `lines.js`, `voice-clips.js`, `data/voice/deedee.js`, `main.js`; stamp `build deedee1`.

## 2026-11-02 (73): Enemies wind up before they attack (`windup1`)

- Tom's standing request from the animation audit (fix 2a, claude/battle-animation-audit.md): every enemy attack was one instant lunge. Now the enemy holds its first attack frame and leans back 8 px and down 3 px for 250 ms (`B2_WINDUP` in engine/battle2.js), then lunges and plays the attack sound. Applies to every normal enemy action and every boss action that goes through `b2FoeAct`; it follows the 1x and 2x speed switch because the pause is a queue delay.
- Cause of the old flatness (fact): `b2FoeAct` set `e.lunge=.55` and the attack sound in the same step, so there was no anticipation. The hit steps are timed from the lunge step, so damage still lands on the same beat of the lunge as before; the whole enemy turn is about 250 ms longer.
- Enemies with painted attack frames show attack frame 1 during the hold (`b2FoeFrame` in engine/battle2-ui.js); enemies without frames just lean. `e.hold` stays on until the lunge step clears it (1 s cap), found by test: a first version used its own countdown and the plain stance blinked for about 120 ms in between when the timer ran late.
- Not changed on purpose: the boss one-off lunges (CUT!, TAKE TWO!, GATE CLOSED!, the idle taps), which are not `b2FoeAct`. Audit fixes 2b, 2c, 3 and 4 are still open (see claude/next.md).
- Tested: smoke FAILS: [] (twice, before and after the blink fix); timing recorder on a live fight: hold 23 to 271 ms, lunge starts 284 ms, no errors; looked at the enemy mid-hold in portrait and mid-lunge in landscape. No voice, art or data file changed, so no ART_V bump and the unused-voice audit was not needed. Not seen on the phone.
- Also bumped `data/maps-le.js?v=` to `windup1`: `square5` edited maps-le.js but its index.html change was only the main.js tag, so a phone with the old file cached would have kept the old Square walk map.

## 2026-11-02 (morning, 71): Square walk map edited by Tom's tile list (`square5`)

- Tom gave edits by spreadsheet id (A1 = top-left tile; column letters across, row numbers down; image from tools/town_grid_image.py). Walkable: A10:A12, B10:B14, H15:H21, V15:V21, W12:AA12, W13:AC15, I15:N15, C15:G15, P15:U15, A22, A23:E23, A24:L24, M25, S24:AD24, V23:AD23. Not walkable: I12. These are the `PAINT_GREEN` and `PAINT_RED` lists in tools/make_town_mask.py (applied last, so reruns keep them).
- Area exits (his "yellow"): N26 and Q26 join O26 and P26 to Rivituso Row (arrivals 12,1 and 13,1); H2 and I2 join H1 and I1 to Grump Hollow. The chapter 1 fallen-branch gate now covers all four north tiles. Hollow's arrivals into the Square moved from row 2 (7,1 and 8,1, now exits) to row 3 (7,2 and 8,2).
- Doors (his "blue"): Snail Mail door now G21 (was F21), Moon Club Q21 (was R21), Taxi Co. Z21 (was Y21); Kettle Cottage M21 and the north row unchanged. Done by moving the house x in LE_HOUSES.
- Tested: reach_test town 0 fails (all doors and exits reachable), smoke, camera_clamp, rooms_test FAILS: []. New tool tools/town_grid_image.py draws the labelled map. Not seen on the phone.
- Tags: `maps-le.js` and `main.js` `?v=square5`, stamp `build square5`.

## 2026-11-02 (72): Art restyle, Phase A: STYLE BLOCK v2 and the style key prompt (docs only, no game change)

- Tom (11-02, 06:57 and 07:07): the party reads too realistic and the NPCs too chibi; he wants illustrated whimsical realism for characters, NPCs and monsters, matching the painted Square and house interiors, with consistent sizes. This is Phase A of the plan in claude/next.md.
- docs/CHARACTER_PIPELINE.md section 0: STYLE BLOCK v2 replaces the old block (old one kept under "Old STYLE BLOCK, retired 2026-11-02"). Wording: whimsical storybook illustration, gently simplified shapes, soft painted edges with a touch of visible brushwork, slightly stylized features that keep a likeness, warm golden light from the upper left, no thick outlines; NOT photorealistic and NOT a 3D render added; "semi-realistic" and "glossy highlights" dropped. One block for party, NPCs and monsters. Section 3 now says to attach the approved style key image.
- New docs/reference/style_key_prompt.txt and docs/reference/style_key_square_crop.png (1536 x 1024 crop of art/town.webp, lower plaza with paving for feet). The prompt draws Grace, Amy, Tom, an invented shopkeeper and a Mudling in one row at true relative heights on the Square crop. The picture is a reference only and is never installed.
- No game code, art or voice file changed, so no ART_V or `?v=` bump. Tom runs the prompt in his current generator with the four attached pictures and sends the result back; no character is regenerated until he approves it.

## 2026-11-02 (71): Aunt Ellie's bets and prizes, one per chapter (`ellie1`)

- Tom: more optional Aunt Ellie content. After a chapter's first story beat she jokes about it and bets Tom a prize if he finishes the chapter. Each chapter gives a unique item, equipped or used in battle.
- New data/ellie-quests.js (10 bets, flags `ellie-offer-N` and `ellie-paid-N`), hooked into the kin branch of engine/overworld.js through `quest:()=>ellieQuest()` on both Ellie NPCs in data/maps-le.js. Full story mode only; the demo is untouched.
- Call made: chapters 1, 3, 5, 7, 9 are a true bet then prize. Chapters 2, 4, 6, 8, 10 happen in LA or in the air, where Ellie cannot be reached, so she pays on his return and says she bet Deedee he would manage it. Two prizes max per visit; she says to ask again if more are owed.
- Prizes (data/party.js, ids `e_*`): brooch (Charm, grit), silk scarf (Charm, immune to drowsy), gossip tea x3 (heal all), cue cards x3 (enemy POW down), hall pass (revive), pearl earrings (Charm, more coins), rhinestone glasses (Charm, kindness), good china x3 (150 damage), silver fan (Tool, POW and warmth), luggage tag (Charm, starts with VP). Four battle items have new Rose Mode icons in data/battle-icons.js.
- New spoken lines are silent until baked. unused_voice.py 0 on all 5 checks. Tested: real Ellie conversation (offer, reminder, pay), battle bag, smoke 0, rooms_test 0.
- Tags: `party.js`, `battle-icons.js`, `maps-le.js`, `overworld.js`, `ellie-quests.js` `?v=ellie1`; build stamp `ellie1`.

## 2026-11-02 (morning, 70): Tom's replacement Square painting installed (`square4`)

- Tom sent a new Square painting with "Use this instead". Same layout as `square3` (the walk map and doors are unchanged, checked row by row), new fine detail, and a new SCHOOL arrow sign on one post at the east gate. Original kept at docs/reference/town_v4_from_tom.png; art/town.webp is it scaled to 1920 x 1664.
- Cutouts: the three generator mask pictures from `square3` still fit, but they were drawn from the old painting, so tools/make_town_fg.py now uses each as a rough area and snaps every piece's edge to the new painting with GrabCut (+-6 px band). The old east gate posts are dropped; the new SCHOOL sign, its post and finial are hand polygons (`native_polys` in tools/town_fg_hand.json). 26 walk-behind zones in `PLATE_BEHIND.town`.
- Walk map: the second east gate post is gone from tools/make_town_mask.py (no change in the rows).
- Tested: reach_test town 0 fails, smoke and camera_clamp FAILS: [], portrait and landscape walk-behind shots (tools/town_behind_shots.py). Not seen on the phone.
- Tags: ART_V, `plate.js`, `maps-le.js`, `main.js` `?v=square4`, stamp `build square4`, town plate and fg `?v=square4`.

## 2026-11-01 (night, 69): the approved v3 Square is in, with doors, walk map and cutouts (`square3`)

- Tom sent the approved Long Island Square painting and four generator mask pictures. Installed per claude/square-v3-install.md.
- Painting: art/town.webp is the v3 art scaled to 1920 x 1664. Original kept at docs/reference/town_v3_from_tom.png. The big fountain is in the painting.
- Walk map: rebuilt from the painting (tools/make_town_mask.py). Doors moved onto the painted doors (library, shop, post office, tea, observatory, taxi); fountain, benches, planters, Cab 7 and signposts moved to their painted places. East gate to the school is now two tiles at the right edge; arrivals from the school and the terminal updated. The lane tile (14,13) is a no-wander tile so a villager cannot plug the lane.
- Cutouts: art/town-fg.webp (tools/make_town_fg.py). Trees, lamps, signs and posts, roofs and awnings come from three of the mask pictures, used only as masks over the original painting. The fourth (tall props) came back redrawn and moved, so the two plaza benches with their barrels are cut with GrabCut and the fountain's upper tiers by polygon (tools/town_fg_hand.json). 24 walk-behind zones in engine/plate.js (PLATE_BEHIND.town); old zones deleted. Mask copies are in docs/reference/town_v3_masks/.
- Tested: reach_test town 0 fails, camera_clamp 0, rooms_test 0, smoke 0; portrait and landscape walk-behind shots (tools/town_behind_shots.py). Not yet played on the phone.
- Tags: `plate.js`, `maps-le.js` `?v=square3`; ART_V `square3`; town plate and fg `?v=square3`.

## 2026-11-01 (night, 68): chapter list scrolls by touch (`scroll1`)

- Tom: the chapter select screen has no scroll, so he cannot go back or see all chapters. Fact (cause): the title screen's 22-button list was already built to scroll, but engine/draw.js cancelled every touch drag inside the game (`game.addEventListener('touchmove', e=>e.preventDefault())`), and `button` and `body` are `touch-action:none` in index.html, so a finger drag on the list did nothing (mouse wheel and keyboard still worked). Measured in a touch-enabled browser: the drag moved the list 0 px before, 385 px after (portrait).
- Fix: draw.js lets drags through inside `#splash .sp-choices` only (every other screen still blocks them). The list and its buttons are `touch-action:pan-x pan-y` (both, because landscape rotates the stage, so the list scrolls sideways on the physical screen). `splashMark` (engine/splash.js) scrolls the highlighted choice into view, so the D-pad, arrow keys and gamepad reach CH 20, BONUS and BACK.
- Tested: touch drag scrolls in portrait (0 to 385 px) and in landscape (0 to 135 px, list is 504 px tall in a 295 px box); keyboard down moves the highlight and keeps it on screen; no page errors; smoke FAILS: []. `tap_test.py` did not finish in 4 minutes here (not run to completion, not caused by this change). NOT seen on the phone. The same fix covers every long list on the welcome page (Battle Lab, Solo).
- Stamp `build scroll1`; tags `draw.js`, `splash.js`, `main.js` `?v=scroll1`.

## 2026-11-01 (night, 67): TNB's Tombo clip (`nclips10`)

- Tom sent `local-clips-export_10.json` and asked for one TNB battle clip. It is the Tombo line, the only TNB take new in that export. His take says only "Here comes the good part." (no "Well, well, well."), so the line in `data/lines.js` (`tombo`) now reads "Here comes the good part." and the clip is installed under that text; the old 3.5 s take is removed. Voice Library script and index updated to match. No other voice touched. Left alone in export 10 (Tom asked for one clip): TNB's takes for basic, mug_toss, hurt, throw_down (words differ from their lines, as in `nclips9`), the `round_with_jojo` "Jojo, you're up" take (no live line), and every other voice (Tom 79, Justin 49 battle and 27 dialogue, Amy 47, Grace 44, Boppy 41, Deedee 41, Olivia 31, Rose 27, Michael 5). Audit 0 on all five checks; smoke not run (Tom said no tests). claude/next.md was not rewritten this session.

## 2026-11-01 (night, 66): all battle backgrounds repainted, 11 new for story places (`bgs2`)

- Tom (21:16): sent the 29 repainted battle backgrounds made from `claude/battle-background-spec.md` (flat matte empty floor so characters stand on the ground, a touch muted so they stand out).
- Installed: the 18 old pixel-art pictures are replaced by painted 576 x 324 WebP in `bgs/` (1.1 MB in all, against 7.6 MB had they stayed PNG). Cache tag `BG_V` = `bgs2` is on every picture URL, so phones do not keep showing the old ones.
- New pictures for places that were code-drawn only: Glass Tower (lobby and stairs, shelves, vault, pinnacle), Forever Engine (normal, and calm once flag `ch20-julian` is set), Dead-Letter sorting hall (also the four memory rooms), subway (depot and tunnel, chamber), Terminal Infinity (Gate 00 and the concourse), Flight Zero cabin. `battleBgKey` picks them by map ground and id; the early return that forced the code-drawn Glass Tower backdrop is gone. The code-drawn backdrops remain as the loading fallback.
- Checked (fact): all 29 are 16:9 and scale to 576 x 324; floors measure flat (left to right within 0.03 brightness, about 0 edges); every real map id maps to the intended picture (45 maps checked); the Hush9 dinner table still wins for that boss; no page errors.
- Looked at: every picture in a 4-member party fight with 3 enemies and with a boss (Old Iron-Gill), and portrait plus landscape full-page shots for the subway, calm Forever Engine and dinner table. Every character stands on floor with the game's contact shadow visible.
- Finding: the generator put the floor edge about 65% down, not the 55% the spec asked for. That suits the game, because the highest enemy feet are at 66%, so every foot lands on floor. The spec's 55% is out of date; the rule that matters is that the floor starts at or above y 66%.
- Not done: Long Island outdoor maps and house interiors still share the pond picture, LA outdoor maps share Griffith Park.

## 2026-11-01 (evening, 65): Boppy back to a deep voice, accent in every tag (`persona2`)

- Tom (21:25): Boppy's voice sounds too high now, and Justin has no accent.
- Cause (fact for the settings, inference for the sound): in `persona1` I lowered Boppy's similarity from 1.0 to 0.75, dropped "deep gravelly voice" from his direction and removed the 0.9 pitch deepening from the merge tools; those three together raise the pitch. For Justin, his baked takes that had the accent wrote "thick New York accent" at the start of EVERY bracket (checked in `justin-dialogue.json` and the baked battle record), while `persona1` put it only in the first bracket and Justin's voice (AoT Justin, a custom voice) has no accent of its own.
- Fix: the accent is now at the start of every bracket of all 278 Boppy and Justin scripts; Boppy's voice direction is "thick New York accent, deep voice" (no gravelly, no gruff in scripts), similarity back to 1.0 (Library index and bake list), merge deepening (pitch 0.9) restored in `merge-local.js` and `merge.py`. Justin settings unchanged (similarity 0.8). docs/VOICE_LIBRARY.md updated.
- Tested: every bracket of every Boppy and Justin take sent by the Library starts with the accent, "deep voice" appears once for Boppy, no gruff or gravel; voice-library test ALL PASS; smoke FAILS: [].
- Not heard. If Justin still has no accent, the voice entry itself is the cause (AoT Justin, id Pp9gl3BrnVq62dIWU2sx): try raising his similarity to 1.0 or a different base voice. If Boppy is still high, the fix is "very deep voice" in his direction.

## 2026-11-01 (21:25) `size6`: NPCs drawn at the party's height on the map and in houses (Tom)
- Tom: "in the overworld, scale up NPCs so they are the same height as the party", then "in houses, scale NPCs down so they are the same height as the party".
- Call made: every character on a map now uses the party's scale (`owBoost` in `engine/town-render.js`): 1.265 on the streets (NPCs were 1.0, so 26% bigger), 0.8625 in painted houses (NPCs were 1.15, so 25% smaller), 1.15 in rooms with no house painting (unchanged). `OW_NPC_INDOOR` is retired. This replaces the 17:41 `size4` request (NPCs 15% larger in houses). Speech bubbles and head anchors follow the new size.
- Tested: `smoke.py`, `camera_clamp_test.py`, `reach_test.py`, `rooms_test.py` pass; looked at Deedee and Boppy's house and the Square in portrait and landscape (Deedee and Boppy now stand at Tom's scale). Not played on the phone. Knobs: `OW_PLAYABLE_BOOST`, `OW_PLAYABLE_BOOST_INDOOR`. NPC colliders and tiles are unchanged, so a bigger street NPC can overlap a prop visually. Characters keep their real relative heights because each sheet is baked to its own height; only the shared map scale changed.

## 2026-11-01 (evening, 65): Airport runs, arrivals and goodbyes no longer repeat (`travel1`)

- Tom (21:13): does Tom say the same thing every time he arrives in LA? It should vary, same for departures and for TNB and the others leaving the party. Repeated clips are boring.
- Fact (cause): only the story flights for chapters 4 to 9 had their own lines (DEPARTURES and ARRIVALS in engine/travel.js). Every other run, and every part a chapter left out (chapters 2 and 3, any trip after the story), used one fixed line: Tom's LA arrival and Long Island arrival, his two flight pages, Sal and Sol, the girls' goodbye, the hug-and-hello, TNB's goodbye, and each recruit's goodbye (Amy, Justin, Deedee, Boppy, Nara).
- Fix: `TRAVEL_POOLS` in engine/travel.js. Each slot is now a pool of 5 to 8 entries: Tom's LA arrival 7, Long Island arrival 7, flight west 7, flight east 7, the girls' westbound goodbye 8 (a whole exchange, Sal then Grace then Rose then Tom, so they answer each other), the Long Island hello after landing 7 (also whole exchanges), Sal 5, Sol 6, TNB's goodbye and toast 7, and 5 each for Amy, Justin, Deedee, Boppy and Nara. `travelPick` deals each pool as a shuffled bag: nothing repeats until the whole pool has played, and a new round never opens with the line that just played (the last pick is also kept across reloads). The original line is entry 0 of every pool, so it keeps its baked voice. Chapter flights 4 to 9 keep their own lines.
- New lines (about 100) are silent (speech synthesis) until Tom bakes them. Added `TRAVEL_POOLS` to tools/clip-audit/harvest.js, so they are listed in the Voice Library (Nara's pages are skipped there, as for all Nara dialogue). Rebuilt harvest.json and data/voice-index.json.
- Tested: pool test (every pool, four full cycles: 0 repeats, every entry used once per round); flight_test both directions; smoke tom,tnb,grace,rose FAILS: []; unused_voice 0 on all five checks; voice-library test ALL PASS. Not played on the phone.

## 2026-11-01 (evening, 64): Boppy and Justin voice personas, accent visible in the script (`persona1`)

- Tom (21:08): Boppy is not deep or gravelly and definitely not gruff: he is sweet, fun-loving, a joker and a complainer. Justin is not warm: he is direct and serious, and laughs out loud when the time is right. And the accent tag was not visible in the Voice Library.
- Cause (fact): "gruff" was in 168 of 219 Boppy scripts, "deep gravelly voice" was his voice-wide direction, his Library similarity was 1.0 (pins the cloned voice's gravel), merges deepened his clips with pitch 0.9, and "warm" or "easy" was in 11 and 15 of Justin's 51 scripts. The accent was added only at send time (`accent1`), so the script box never showed it.
- Fix: 207 scripts rewritten by rule through `apply-scripts.py` (0 rejected): Boppy drops gruff, gravelly, low and the cold or stiff words and gets complaining, hearty, playful, wry and the like (picked from the line: ache and complaint words, exclamation, question); Justin warm to direct, easy to level, casual to matter-of-fact, fond to sincere; funny and happy tags (amused, gleeful, goofy) kept. `make-index.js` writes "thick New York accent" into the first bracket of every Boppy and Justin script, the voice direction is the accent alone, Boppy similarity 0.75, and the base direction for a brand-new line is "playful, joking" (Boppy) and "direct, serious" (Justin). `make-list.js` the same. Pitch 0.9 removed from `merge-local.js` and `merge.py`. CANON.md and docs/VOICE_LIBRARY.md updated.
- Tested: all 270 Boppy and Justin lines send exactly one "new york" and no gruff or gravel; voice-library test ALL PASS; smoke FAILS: [].
- Heuristic, not hand-written line by line: the replacement tag for a line that was only "gruff" is chosen by its words, so some will read flat. Not heard: baked clips are unchanged, and a line sounds new only after Tom regenerates it. If Boppy still sounds gravelly the cause is the voice itself (ElevenLabs "Jerry B. - New York Italian Mobster"): a new voice would be needed.

## 2026-11-01 (evening, 63): TNB's walking head enlarged to Tom's (`tnbhead1`)

- Tom (20:48): on the overworld Tom's head is still much bigger than TNB's; enlarge TNB's and list everyone's head size so it can be fixed once and for all.
- Cause: TNB's walk head was shrunk x .89 on 11-01 (Tom approved it at 11:59) while Tom's head was later enlarged 8% (`tomhead1`, 14:57). Measured by hand on the baked walk frames (one row = 3 art px; hair to chin; reading error about half a row): Tom 16.0 front and 14.6 side, TNB 15.0 and 13.8. His face is also narrower (cheek to cheek 7.5 rows against Tom's 9.7), so the gap read bigger than 6%.
- Fix: `bake_tnb.py` `G_WALK` 1.20 grows only TNB's walking head (front, back and side); his body from chin to feet keeps its size, so the figure gets 3 rows taller at the top (`--ow-h` 42 to 45; frame 44 to 46 rows). Welcome screen `h` 309 to 331 (`SPLASH_SPOTS`) so his body stays the same size there. Battle art unchanged (`tnb-battle`, `tnb-poses` identical). After: TNB 16.3 front and 15.5 side, face width about 9.3 rows. Files: `art/chars/tnb-ow.webp`, `data/tnb-hires.js`, `engine/splash.js`. ART_V `tnbhead1`.
- Knob: `G_WALK` in `bake_tnb.py` (1.0 = old size); rebake with `python3 -I tools/sprite-bake/bake_tnb.py`, bump ART_V.

## 2026-11-01 (evening, 62): Boppy and Justin takes carry "thick New York accent" again (`accent1`)

- Tom (20:09 and 20:34): regenerating Boppy in the Voice Library loses his New York accent; "put that tag in for Boppy and also Justin (thick New York accent)".
- Fact (cause): the baked Boppy clips were made from scripts with the tag (46 of 47 baked battle scripts in `battle-scripts.json` have it; BAKE_PAGE.md says "Boppy always with a thick New York accent"). The Library scripts written in `vdir1`, `vtag2` and `vtag3` have none (0 of 44 Boppy battle overrides, 0 of 214 Boppy dialogue lines) because of the "no accent words" rule, so new takes were sent without it. Model, Stability and Similarity were never involved: the Library takes them from the voice entry in the game data, and they did not change. Not confirmed against live ElevenLabs (no key in the sandbox); that the missing tag is what drops the accent is the likeliest cause, not a measured one.
- Call made: the accent rides on the VOICE direction, not in each script. `tools/voice-library/make-index.js` (Library) and `tools/bake-page/make-list.js` (bake list) add "thick New York accent" to the voice direction of Boppy and Justin (battle and dialogue); `finalText` in `voices.html` and `bake.html` now puts the voice direction first in the first bracket and adds only the parts a script lacks (it used to skip or add the direction as one string). Boppy reads `[deep gravelly voice, thick New York accent, gruff, pleased] ...`, the same shape as the baked takes; Justin `[thick New York accent, warm, tired] ...`. Scripts and the `apply-scripts.py` rules are unchanged, so the v4 rewrite stays intact for everyone else. The accent is not shown in the script box (neither is "deep gravelly voice"). `docs/VOICE_LIBRARY.md` records the exception.
- Changed: `tools/voice-library/make-index.js`, `tools/bake-page/make-list.js`, `voices.html`, `bake.html`, `data/voice-index.json` (3 voice directions only: boppy battle and dialogue, justin dialogue; Justin battle already had it; 0 items changed), `docs/VOICE_LIBRARY.md`. No audio, no scripts, no game code changed, so no `?v=` or ART_V bump.
- Tested: in the Library page, the text sent for all 219 Boppy lines and all 51 Justin lines contains the tag exactly once; for the other 3,664 lines the text is identical to the old logic except one line where the old logic repeated a word the script already had ("affectionate"); `tools/voice-library/test.py` ALL PASS; `smoke.py` FAILS: []. Not heard on the phone. Baked clips are unchanged: a line sounds new only after Tom regenerates it.
- If the accent still drops: regenerate one Boppy line twice and compare; next steps are the accent as its own first tag (`[thick New York accent] [deep gravelly voice, ...]`) or a higher Similarity on the Boppy voice (it is already 1.0). If takes come out doubled, too many descriptors in one bracket is the first suspect (Tom, `vtag1`): move the accent to its own tag.

## 2026-11-01 (evening, 61): TNB's battle clips from export 9 (`nclips9`)

- Tom sent `local-clips-export_9.json` (420 clips, all voices) and asked for TNB's. Merged only TNB's 23 (18 kept): 16 existing clips replaced, 1 added (`data/voice/tnb.js`, tag `nclips9`). The other voices in the export were not touched.
- Left out, audio words differ from the line: basic and mug_toss "Heads up! Handmade!" (take stops after "Heads up!"), hurt "Hey! That was glazed!" (says "I just glazed that"), throw_down (stops at "Literally"). Left out, no live line: "Jojo, you're up. ...Jojo. JOJO. ...Nice." Those lines keep their old clips.
- Tests: `unused_voice.py` 0 on all five checks; smoke tnb,tom,grace,amy FAILS: []; kit_test tnb every move says its line. Voice Library index rebuilt.

## 2026-11-01 (evening, 60): Last old Grace, Rose and Deedee move code deleted (`dead2`)

- Tom asked twice for dead code to go. Removed the 25 old moves that stayed in `dead1` only because a wrapping loop named them: Grace (heel_click, glitter_checkin, ringlight_rescue, comment_moderation, thumbnail_face, eight_count, beam_borders, warmup_lap, mat_patrol, spotlight_shuffle), Rose (tiny_tap, where_did_i_go, royal_inspection, giggle_echo, lamby_appointment, floor_is_jelly, ribbon_rescue, lamby_ending, pocket_princess, princess_parasol) and Deedee (pepper_free_plate, rolling_pin_rounds, windows_open, spotless_record, take_a_breather). 50 function definitions (each key had an older and a newer version) and 46 KB, from engine/grace-moves.js, rose-moves.js and deedee-moves.js, plus their names in the three wrapping loops. Method: acorn syntax tree, delete by byte range.
- No voice lines or clips changed (their lines were already purged). No art changed, no game behaviour changed: none of these keys is in any kit, ability list or scene.
- Tests: `unused_voice.py` 0 on all five checks; kit_test grace, rose, deedee FAILS: []; smoke tom, grace, rose, deedee FAILS: []. Not played on the phone.
- Not removed: leftover scene helpers and icon entries for these keys (data/battle-icons.js, battle-emoji.js), and the older `skills` kit tier.

## 2026-11-01 (evening, 59): Tom's and Rose's battle clips from exports 7 and 8 (`tclips8`)

- Tom sent `local-clips-export_7.json` and `local-clips-export_8.json` (exports 7 and 8 overlap; export 8 is the newer and adds Rose's set) and asked for Tom's and Rose's clips. Merged only those two voices, newest take per line: Tom 63 clips replaced and 2 added (one is Disconnected Controller, "Ugh it's not connecting!!", now baked and removed from `tools/bake-page/pending.json`), Rose 20 replaced. Files: `data/voice/tom.js`, `data/voice/rose.js` (tag `tclips8`).
- Left out, audio words differ from the line text: Rose foot_tap_tap (says "Boop!"), lookout_lamby (stops before "both of you"), tombo (skips "Put your wings out"), win "Yay!" (says "woo hoo") and win "Yay, Ta-Ta!" (adds "we did it"); Tom delta (adds "Lye flat"), delta_ult, overpriced_gadget (says "premium edition"), tomboamy2 (adds "Amy"), tombonara2, tombotnb3 ("nothin"). Those lines keep their old clips.
- Left out, no live line: Tom controller_tap, crumb_shot, window_seat and Rose's old Yama-Mott take.
- Kept on purpose: Rose's SILLY "Bleh!" take is a raspberry sound (script is only `[raspberry].`), her signature move.
- Tests: `unused_voice.py` 0 on all five checks; smoke tom,rose,grace,justin FAILS: []; kit_test tom and rose every move says its line. Voice Library index rebuilt.

## 2026-11-01 (night, 59): Welcome page, Rose's hair shows again (`rosehair1`)

- Tom: on the welcome screen, refresh Rose's head so her hair shows, but keep the new face dimensions. Fact (cause): the patch that swaps in her enlarged head in `engine/splash.js` was one small oval, and Rose's curls spread wider and hang lower than it, so the hair outside the oval fell back to the small original and looked sliced off. Call made: her patch is now three soft ovals (the head plus a curl area on each side, `m` list in `RIDE_HEADS`). Her growth (1.3) and neck anchor are unchanged, so her face is exactly the same size. Tom's head is unchanged.
- Tested: looked at the enlarged frame and the welcome page in portrait (393x852) before and after, no page errors, smoke run. Not seen on the phone. Knob: the `m` ovals in `RIDE_HEADS` (4 numbers each: centre x, centre y, half width, half height, in the 78 x 171 frame). Art files unchanged, no ART_V bump.

## 2026-11-01 (night, 58): Welcome page, Tom carrying Rose bigger (`bighead1`)

- Tom: on the welcome page, both heads need to be bigger and the combined Tom and Rose figure bigger overall. Fact (cause): the ride art has small heads relative to the body, and the figure was drawn at 335 picture px. Call made: `engine/splash.js` now builds a padded copy of the standing ride frame with Rose's head grown 30% and Tom's grown 25% about their necks (`RIDE_HEADS`, soft oval mask, no seams), and the figure is 405 px tall (was 335) at x 292 (was 287). Art files are unchanged, so no ART_V bump; only the welcome page is affected (overworld, battle and the ride sheets are not).
- Tested: looked at the welcome page in portrait before and after (393x852), no page errors, smoke run. Not seen on the phone. Knobs: `RIDE_HEADS` (s per head) and the Tom spot `h` and `x` in `SPLASH_SPOTS`. The source frame is small, so the enlarged faces are slightly soft; a bigger painted ride frame would fix that.

## 2026-11-01 (evening, 57): Rest of voice export 6 merged (`gclips7`)

- Tom: yes, merge the other voices from `local-clips-export_6.json` (after Grace in `gclips6`). The 173 non-Grace clips were filtered first: 168 kept for checking, then 26 battle takes dropped because the game has no live line for them (24 Justin beats removed in `purge1` and `purge2`, Rose's old "Yama-Mott" line, a TNB Jojo take with different words) and 5 Amy takes whose audio words differ from the line (hills, marathon, marathon_ult, tombo2, hurt "Deep breath."). Rose's whispered "Tap." was filed under `foot_tap_tap` (it had no line key).
- Merged: Amy 31, Olivia 31, Justin 24, TNB 8, Tom 4, Rose 1 battle clips replaced; 38 dialogue clips (Boppy, Deedee, Michael, Justin, Olivia, Amy) were already in `dialog-ch28.js` unchanged. Files changed: `data/voice/` amy, justin, olivia, rose, tom (tag `gclips7`).
- Tests: `unused_voice.py` 0 on all five checks; smoke FAILS: []; kit_test amy, justin, olivia every move says its line. Voice Library index rebuilt.

## 2026-11-01 (night, 50): Deleted the dead move animations (`dead1`)

- Tom: "Why would we leave the old animation code." No good reason; it was dead weight and it is what fooled the first audit. Fact: removed 69 old animation functions (48 replaced moves, 84 KB) from engine/tom-moves.js, tnb-moves.js, amy-moves.js, boppy-moves.js, grace-moves.js and nara.js. A function was removed only if its key is in no kit, Stampcard version or combo table and nothing else in the game names it (found with a real JavaScript parser, not a text search).
- Removed with them (their code was the only thing that played them): Tom's `starter_inspection` and Grace's `beam_dismount` lines, plus their 2 clips (about 111 KB). Record in docs/PURGED_VOICE.md. Voice Library battle lines 451 to 450. Audit reports 0 on all five checks.
- Tested: smoke (tom, grace, boppy, tnb and amy, nara, tom, grace) FAILS: [], kit_test for tom, grace, boppy, tnb, amy and nara every move FAILS: []. Not seen on the phone.
- Still there on purpose: about 30 old moves for Grace, Rose and Deedee that a loop at the end of their move files still wraps by name (tiny_tap, heel_click, windows_open and the like). They need the loop edited with them; next cleanup. Also the older `skills` kit tier and icon entries in data/battle-icons.js.

## 2026-11-01 (evening, 55): Grace's battle voice clips updated (`gclips6`)

- Tom sent `local-clips-export_6.json` (217 clips) and asked for Grace's battle clips to be updated. Merged only her 44 with `tools/bake-page/merge-local.js`: 37 existing clips replaced by the new takes, 0 added (`data/voice/grace.js`). Other voices in the export were not touched.
- Left out on purpose: 3 stale takes whose lines no longer exist (Hi-yah!, Chalk up!, the old "one sock" Ymamot line), and a "Tap." take whose audio script says "Oops!" (words do not match the line; the line is "Tap."). Grace's Foot Tap "Tap." now uses her earlier whispered "Tap." take, which had been saved with no line key and so never played; it is filed under `foot_tap_tap`.
- Where two moves share words (beam, dance battle), the clip stays under the key the repo already used (`beam_dismount`, `dance_battle`).
- Tests: `unused_voice.py` 0 on all five checks; smoke FAILS: []; kit_test grace every move says its line. Voice Library index rebuilt. Tag `gclips6` on `data/voice/grace.js`.

## 2026-11-01 (evening, 49): Purged lines for replaced moves (`purge2`)

- Tom: "Why is the chalk up voice clip still there." Fact (cause): Grace's chalk_up was replaced by bedazzle_blast, but its spoken line and clip stayed. The first audit (`purge1`) treated any kind whose name appears in the code as used, and the old animation function and an icon still mention it.
- Removed 23 lines and 23 clips (about 1.3 MB) for replaced moves: Tom 13 (controller_tap, crumb_shot, mint_unboxing, window_seat, proofing_drawer, toast_negotiations, warranty_void, crumb_barrier, five_minute_review, dpad_detour, save_sandwich, radical_solutions, patch_notes), Grace 2 (split_leap, chalk_up), Boppy 4 (cap_check, closing_time, sensible_pepper, jar_lid_negotiations), TNB 4 (clay_offcut, lost_found_warmth, practical_effects, clay_pigeon). Battle clips 525 to 502; Voice Library battle lines 473 to 451; 22 hand directions dropped; 13 bake-script notes removed.
- `tools/clip-audit/unused_voice.py` has a new check 5 (a kind with an old animation function that is no longer a key in any kit, Stampcard version or combo table). Audit now reports 0 on all five checks.
- Left on purpose: the dead animation functions in engine/*-moves.js (harmless, not called) and the old per-character `skills` tier.
- Tests: smoke tom,grace,boppy,tnb FAILS: []; kit_test grace, tom, boppy, tnb every move says its line. Tags `purge2` on lines.js, voice-clips.js, tom, grace, boppy, tnb voice files.

## 2026-11-01 (evening, 54): Chapter title card waits until Tom lands (`cardfix1`)

- Tom (17:54): the new chapter banner should only appear after Tom reaches the area with the new chapter, not before the flight.
- Fact (cause): `storyTripSteps` (engine/story.js) queued the chapter card right before takeoff, so CHAPTER 2 to 9 showed over the departure map.
- Call made: the chapter number still advances at takeoff, but the card now plays after landing, once Tom has stepped out and is standing in the new area (cab stand in LA, taxi depot on Long Island), just before his arrival line. New `storyTripChapter` and `storyArrivalCard` in engine/story.js; `flightSteps`, `arriveLA` and `arriveHome` in engine/travel.js take the card steps. Chapter select (`arriveLA()` with no card) is unchanged.
- Tested: new flight test (chapter 1 west and chapter 2 east): old code showed the card 160 frames before and during takeoff; new code shows none until the last flight frame has passed, then on the arrival map with the new chapter set. `smoke.py` FAILS: []. Looked at the card over the LA cab stand in portrait. Not played on the phone. Chapters 4 to 9 use the same path.
- Changed: `engine/story.js`, `engine/travel.js`, tags `story.js`, `travel.js` and `main.js` at `?v=cardfix1`, stamp `build cardfix1`. No art or voice changed.

## 2026-11-01 (evening, 52): Boppy catches fish all the time, he just exaggerates the size (`fish1`)

- Tom (17:54): change the dialogue about Boppy never catching a fish. He catches them all the time; the joke is that he exaggerates how big they are.
- Changed (canon, one line in claude/canon-addendum.md): Rose, chapter 3 arrival: "He catches one every time. It's always THIS big." Tom's reply: "Then we'd better hurry, before it gets any bigger." Reel at the bait shack: "He catches something every day. The size, I round down." (and the matching sample in data/dialog-cast.js). Boppy's spare cap: "I caught a twelve pounder in it. Nine. It was a big six." Boppy's fishing spot on the pier: "A thermos, a bucket, one bass. Boppy will tell you it was two feet long. It was not." Bucket Hat description: "Every one of them caught something enormous, according to Boppy." The battle lines ("It was THIIIS big!") already had the joke and are unchanged. The frozen demo keeps its old text.
- Four baked clips went silent and were removed (docs/PURGED_VOICE.md): the four reworded lines play through speech synthesis until Tom records them in the Voice Library, where they now carry v4 scripts (`scripts/zz-v4-overrides.json`).
- Tested: `unused_voice.py` 0 on all four; Voice Library test ALL PASS; `smoke.py` FAILS: []. Not seen on the phone.

## 2026-11-01 (evening, 51): NPCs inside houses 15% larger (`size4`)

- Tom (17:41): NPCs inside of houses should be 15% larger.
- Call made: every non-main character (Deedee, Boppy, shopkeepers, residents) drawn in a painted house interior is 15% bigger (`OW_NPC_INDOOR` 1.15 in `engine/town-render.js`); main characters keep the `size2` sizes; streets and rooms without a house painting are unchanged. Speech bubbles over them follow the new size.
- Tested: `smoke.py` FAILS: []; `rooms_test`, `grands_walk_test` pass; looked at Deedee and Boppy's house in portrait (Boppy clearly larger beside Tom). Not played on the phone. Knob: `OW_NPC_INDOOR`.

## 2026-11-01 (evening, 53): Equipped items no longer change how a character looks (`nolook1`)

- Tom (17:48): do not change characters' clothes or colors based on what is equipped.
- Fact (cause): `engine/gear.js` recolored a character's top (battle sprite, map sprite, painted frames, Rose's ride seat, menu portrait) whenever the worn Outfit item had a `color`. Every one of those paths asks `memberTopColor(m)`.
- Call made: `memberTopColor` now always returns no color, so no recolor happens anywhere. Gear stats are untouched. The recolor code stays in the file but is never triggered; shop and item text are unchanged.
- Changed: `engine/gear.js`, tags `gear.js?v=nolook1` and `main.js?v=nolook1`, stamp `build nolook1`. No art changed.

## 2026-11-01 (evening, 52): TNB's lobby elevator button is easy to press (`elev1`)

- Tom (17:35): the press area for the elevator in TNB's loft building is too small, and he had to stand far to the right of the button to use it.
- Fact (cause): the invisible trigger sat on one tile (x11, row 3), but the brass button is painted on tile x10, beside the elevator doors. Standing under the painted button did nothing.
- Call made: the trigger now covers the whole elevator, doors and button together (x8 to x11 on row 3, four tiles wide). Pressing A facing up from any of the four floor tiles under it asks "Go up to TNB's loft?".
- Changed: `data/maps-la.js` (map `loftlobby`, object 'Elevator button'). No art changed.
- Tested: pressed A at each of the four tiles (all ask to ride; the wall tiles either side do not); `rooms_test` loftlobby and lofts, `reach_test`, `tap_test`, `smoke` all pass; portrait and landscape screenshots looked at. NOT seen on the phone.

## 2026-11-01 (evening, 51): The last 263 scripts rewritten; every Voice Library line is now v4 style (`vtag3`)

- Done: the 236 battle lines whose only script was the baked record (`battle-scripts.json`) and the 27 Justin dialogue lines (`justin-dialogue.json`) got new scripts in the layer the Library reads first (`battle-overrides.json`; new `scripts/zz-v4-overrides.json`, which sorts last and so wins). The record files are untouched. Also the pending Disconnected Controller line (`tools/bake-page/pending.json`). Checker: 0 of 263 rejected; the index now has 0 old-style scripts (no stacked qualifiers, no [beat], no accent words).
- Checker fix: stretched words that already had a double letter (CHEEEERS, LOOOOK) now count as the same word.
- Tested: `unused_voice.py` 0 on all four; Voice Library test ALL PASS; `smoke.py` FAILS: []. Not heard on the phone.

## 2026-11-01 (evening, 49): Every Voice Library script rewritten to the v4 tag rules (`vtag2`)

- Tom (17:25): approved the 10 samples, "now do every single line".
- Done: all 4,060 current-layer scripts rewritten (3,835 dialogue directions in `scripts/directions-20261101.json`, 225 battle overrides) with the scene (previous and next lines, the speaker, the move) in hand, every one passed through `apply-scripts.py` (0 rejected): voice-only tags, 1 or 2 descriptors each, tag count by line length, no body, prop, sound or accent words, spoken words equal the line text. 27 lines purged in `purge1` were skipped. Sound-like descriptors (chuckling, sobbing, gasping, groaning, panting) swapped for tone words so v4 does not add the sound.
- Still old style: 263 lines whose script is the baked record itself (236 battle hand scripts in `battle-scripts.json`, 27 Justin dialogue in `justin-dialogue.json`). Those files are never edited; their new scripts go into a layer that wins in the Library (`battle-overrides.json`, new `scripts/zz-v4-overrides.json`) in the next push.
- Docs: `docs/VOICE_LIBRARY.md` has the rules, the layer table and the apply-scripts procedure.
- Tested: `tools/clip-audit/unused_voice.py` 0 on all four; `tools/voice-library/test.py` ALL PASS; `smoke.py` FAILS: []. Baked audio unchanged; a line sounds new only after Tom records a new take. Not heard on the phone.
## 2026-11-01 (evening, 50): Main characters 25% smaller inside houses, 10% bigger on the streets (`size2`)

- Tom (17:19): the size of main characters inside houses must be reduced by 25%; in the overworld increase by 10%.
- Call made: "main characters" means the same group as the last size change (`big1`): whoever Tom is playing, the party followers (the kids) and Michael. Townspeople keep their size. "Houses" means the painted interiors that use the interior scale (bakery, library, greenhouse, shop, observatory, post, tea, taxi, Deedee and Boppy's, Ellie's, Amy's, juice bar, observatory). Rooms with no house painting (school rooms, dome, Moon Club) stay as they were.
- Numbers: street boost 1.15 became 1.265 (1.15 x 1.10); house boost 1.15 became 0.8625 (1.15 x 0.75). Feet stay on the same tile; the figure grows or shrinks upward.
- Also changed to match: the speech-bubble height over a main character follows the new size, and the chapter 1 stretch scene uses the same street size as his walk.
- Changed: `engine/town-render.js` (`OW_PLAYABLE_BOOST`, `OW_PLAYABLE_BOOST_INDOOR`, `owBoost`), `engine/intro.js`. No art changed, no ART_V bump needed.
- Tested: `smoke.py` FAILS: []; looked at Deedee and Boppy's house, the bakery, the Square and Grump Hollow, portrait and landscape, before and after. Not played on the phone. If a house still reads too big or small: `OW_PLAYABLE_BOOST_INDOOR`.

## 2026-11-01 (evening, 48): Rooms are ready before you walk in (`rooms1`)

- Tom (17:17): loading the inside of a house takes way too long.
- Fact (cause): after `plate1` the game only got ahead on 7 neighbours, and outdoor edge maps (big paintings) took the first slots. In the Square, 4 of the 8 shops (post office, observatory, taxi, shop) were never loaded ahead, so walking in waited for a fresh download. Measured on a 6 Mbps test connection: about 0.9 to 1.0 s each; the 4 that were loaded ahead took 1 to 2 ms.
- Call made: get ahead on every door and edge of the map you are on, nearest first (rooms are small, 1254 px square, about 6 MB each once open, so all of them are cheap). To stay inside memory, only the 5 most recent maps are kept (was 8); the way back out is always in the get-ahead list anyway. The cutout layer of a room (the sofa and counter you walk behind) now loads with its room instead of popping in at the first draw.
- Measured after: all 8 Square shops ready before Tom reaches them (0 to 2 ms on entry, same 6 Mbps test).
- Changed: `engine/plate.js` (`PLATE_KEEP` 5, `PLATE_AHEAD` 12, nearest-first order, cutout preload). No art changed.
- Tested: `smoke.py` FAILS: []; `camera_clamp_test`, `reach_test`, `rooms_test`, `grands_walk_test`, `jpark_test` all pass. NOT seen on the phone.
- Still open: the 42.5 MB of voice scripts that block a cold start (see `plate1`).

## 2026-11-01 (evening, 48): Overworld sizes, The Big One 3x and the pie-thief Big Mudling 33% smaller (`size1`)

- Tom (17:25): "The big one in the overworld maps should be 3x its current size. And the mudslinger that steals the one should be 33% smaller."
- Call made: The Big One on the Grump Hollow map now draws at 3x (`owScale:3` on `bigone` in data/monsters.js; was 1x). Call made: "the mudslinger that steals the one" is the Big Mudling in the pond scene (the pie-tin thief); its scene size went from 2x to 1.34x (a third smaller) in both spawns in data/scenes.js (`ch1Theft` and `ch1Pond`). Plain Mudlings on the map and the battle sprites are unchanged.
- Looked at the pond scene frames: Big One, thief and Tom read in proportion. Tested: smoke FAILS: []. Not seen on the phone. Knobs: `owScale` (Big One), `mscale` in the two Big Mudling spawns.
## 2026-11-01 (evening, 50): Rose's face no longer stretches in Boop and her other extra poses (`rosefix1`)

- Tom: "Rose's face became distorted with Boop."
- Cause (fact): this afternoon's head-growth step (`kidhead.grow_head`) was also run on Rose's extra, jab, tickle and boomerang sheets. Those four sheets were painted with the big head already (head about .40 of her height; the main battle sheet is .31). The step enlarges a fixed band of rows from the top of her figure, so it cut through her mouth and stretched the pointing arm into a long streak. Boop, Boo!!, Floor Is Lava (balance), Bedtime Story, Tickle Storm and Lamby Boomerang all had some of this.
- Fix: `tools/sprite-bake/bake_rose.py` no longer grows the head on those four sheets. They are scaled by `G_BT` (1.158, the height the grown idle gains), so their head and body match the idle. Idle, walk, KO and ride art are unchanged. Re-baked `rose-battle-x.webp`, `rose-battle-tk.webp`, `rose-battle-bm.webp`, `data/rose-hires.js`.
- Boop: the new jab frames put the fingertip 38 px left of her centre and 54 px above her feet (old art 33 and 47, inflated by the stretch), so `jy` in `Rm.boopShow` (engine/rose-moves.js) uses 54. Looked at the contact frames: the finger lands on the nose.
- Tested: `kit_test.py rose` (all 18 moves) FAILS: []; `smoke.py` FAILS: []; `unused_voice.py` 0 for all four checks. Not seen on the phone. ART_V and `?v=` tags on `rose-hires.js` and `rose-moves.js` bumped to `rosefix1`.

## 2026-11-01 (evening, 48): ElevenLabs v4 tag rules and 10 sample scripts for Tom to approve (`vtag1`)

- Tom (17:11): new takes said their phrase twice, [yelp] produced an actual yelp, and tags described what the body does (pointing, shrugging, hands on hips) instead of how the voice sounds.
- Rule set (from ElevenLabs "Prompting Eleven v4"): a tag describes the voice only (emotion, delivery, voice quality, in the style of [low, gravelly voice]); no gestures, props, places, roles or sound nouns ([yelp], [beat], [pause]); 1 tag up to 4 words, 2 up to about 14, 3 beyond; at most 2 descriptors of 1 or 2 words per tag; ellipses and CAPS for pacing; never contradict the words; no accent words.
- Call made: 10 sample scripts (11 lines: Tom, Deedee, Grace, Rose, Boppy, TNB dialogue; Amy, Justin, Rose battle; Pond Grump first meeting and rematch) rewritten to the rules and installed in the Voice Library so Tom can regenerate them and listen for doubled phrases before the other 3,700 lines are rewritten. Baked clips are untouched.
- Call made: Justin's scripts no longer get the automatic "thick New York accent" prefix (the cast voice carries the accent; `tools/voice-library/make-index.js`). His baked scripts in `justin-dialogue.json` and `battle-scripts.json` keep it, since baked clips keep the script they were made with.
- New tool: `tools/voice-library/apply-scripts.py <list.json>` (add `--check` to validate only) checks every script against the rules (words equal the line text, tag count, descriptor count, body, prop and sound words, em dashes) and writes it into `directions-20261101.json` or `battle-overrides.json`; it never touches a hand-written chapter script.
- Tested: `tools/voice-library/test.py` ALL PASS; `smoke.py` FAILS: []. Not heard on the phone.

## 2026-11-01 (late afternoon, 48): Purged voice lines and clips the full game never plays

- Tom: "I've asked so many times to purge voice clips that are not used in the full game... it wastes space, adds complexity, and wastes ElevenLabs credits."
- Fact (method): every line kind in `LINES` was checked against every place the game can call it (moves, scenes, dialogue, fallback). Every baked battle clip was checked against the live line table read from the running game. Every dialogue clip was checked against the harvested dialogue list. New tool: `python3 tools/clip-audit/unused_voice.py` repeats this audit in one command; `node tools/clip-audit/purge_unused.js <spec> --apply` removes what it finds (checks each file round-trips byte for byte first).
- Removed 31 unused lines from `data/lines.js`: 24 Justin extra beats (Yellow! / Red! / And BLUE!, Four screws., Solid., Let it dry., Excuse me., Rosie. No., and so on), plus the generic attack shout pools for Tom (3), Grace (3: Hi-yah!, Take that, Kevin!, Watch me, Ta-Ta!) and Rose (1: Boop!). Every live move has its own line, so nothing played them. Grace's Move Lab volume sample now uses her `dance` line.
- Removed 39 baked clips (about 1.8 MB): 30 for the lines above, 9 old takes for lines since reworded (Amy hurt, Hill repeats, Marathon, Marathon ult, Ymamot x3, Tnb Round with Jojo, Tom button mash), plus one stray no-kind Justin clip. Also 29 matching bake-script notes. Battle clips 564 to 525. Dialogue clips: 0 unused (the monster "Round N." lines are templated and live).
- Rebuilt `data/voice-index.json` (Voice Library and Bake page lists) and dropped 27 hand directions for the removed lines, so none of them can be selected for a paid re-record.
- Record of every removed line and clip: `docs/PURGED_VOICE.md`. The audio is still in git history (commit `6624b03`).
- Not touched on purpose: the older per-character `skills` kit tier (still the fallback for any Stampcard slot whose new move is not built), and `demo/`. Lines that are live but have no clip yet are not dead; they are the real bake list.
- Tests: `IDS=tom,grace,rose,justin python3 tools/smoke.py` FAILS: []; `python3 tools/kit_test.py justin --speed2` all 9 moves play, each says its kept lines; full game page load with all real audio: no page errors, no 4xx, 525 battle clips; `say()` on removed kinds does not throw; audit re-run reports 0 unused. Tags: `purge1` on lines.js, voice-clips.js, tom/grace/rose/amy/tnb/justin voice files, feel.js.

## 2026-11-01 (late afternoon, 47): Painted maps load on demand instead of all at boot (`plate1`)

- Tom (16:27): the overworld maps do not load instantly, or at all.
- Fact (cause): at startup the game began downloading and decoding all 77 painted maps at once, 41 MB of files that become about 520 MB of pictures in the phone's memory. An iPhone cannot hold that, so the map you were standing on came up late, or never.
- Call made: load the map you are on first; then, one at a time, the maps you can walk into (outdoor neighbours first, then the 7 nearest doors in total); keep only the 8 most recent paintings in memory and drop the rest (they reload from the browser cache if you go back). A painting that fails to download now retries (4 tries) instead of giving up for the session, and shows the plain backdrop meanwhile, never the old tile art.
- Measured (desktop test): boot now fetches 9 paintings, 5.7 MB (was 77, 41 MB); walking Square, Row, Hollow, School yard, Pier: each map was ready in 60 to 190 ms, never more than 8 paintings held.
- Changed: `engine/plate.js` (`plateFocus`, `plateNeighbours`, `platePump`, `plateDrop`, new `plateLoad` with retry; knobs `PLATE_KEEP` 8, `PLATE_AHEAD` 7, `PLATE_TRIES` 4). No art changed.
- Tested: `smoke.py` FAILS: []; `camera_clamp_test`, `reach_test`, `rooms_test`, `grands_walk_test`, `jpark_test` all pass; looked at the Square (portrait and landscape) and Deedee and Boppy's house (portrait). Not played on the phone.
- Not fixed, found while measuring: on a cold download (first install, RELOAD, or after the browser cache expires) the game pulls 59 MB of scripts before anything can draw, and 42.5 MB of that is the baked voice files, which load as blocking scripts. At 5 Mbps both the old and new build take about 200 s to reach the first map. Next step is loading the voice files without blocking (after checking nothing reads them at startup).

## 2026-11-01 (day, 47): New Tom-carrying-Rose art, and Tom tosses Rose off before his moves (`ride7`)

- Tom: installed the seven new ride sheets (no words). Wanted: Tom keeps Rose on his shoulders only for Press Start, DEFEND and the combos that need her up; for every other Tom move he tosses her off and she lands on her feet.
- Calls made: the new art draws the pair larger than the old (Tom's head is about half his body height), so I scaled the pair to 140 rows (old 128) rather than shrink Tom; the ride sheets have no windup/strike/cast frames, so those use the standing ride frame; the black eye is painted into the new kneel frame, so the old paint-on bruise is gone; old KO ride art removed (unused).
- Changed: `tools/sprite-bake/bake_tomride.py` (new sheets, no mirroring), `data/tomride-use.js`, `engine/rose-ride.js` (Press Start poses, proud), new `b2TossSteps` in `engine/battle2-kind.js` hooked in `b2Do` (`engine/battle2.js`), title uses the ride Tom (`TITLE_TOM_RIDE=true`). Art: `art/chars/tomride-battle.webp`, `tomride-rose.webp`, `tomride-ow.webp` (generated; `data/tomride-hires.js`). Hero painting baked to `art/chars/tomride-hero.webp` (not used yet).
- Tested: `smoke.py` FAILS: []; `tombo_test.py rose1` and `rose3` pass; looked at toss frames (grab, lift, toss, Rose lands) and Press Start with Rose riding; title screen. Not played on the phone.
## 2026-11-01 (evening, 47): Baked clips no longer say the phrase twice (`vdir2`)
Tom: every new clip repeated its phrase twice. Cause: the retry check in the Voice Library and the bake page only compared clip length with word count, and a doubled short line fits inside that allowance, so the doubled take was kept. Fix (voices.html and bake.html): after each take the sound is decoded and checked for a repeat (it splits at a pause into two halves of similar length whose loudness shape matches); a doubled take is rejected and the page makes another, up to three, keeping the best one. Tested on 120 real baked clips as they are (0 flagged) and each doubled (119 caught). Not tested against the live ElevenLabs service (no key here), so the first new takes on Tom's phone are the real test.

## 2026-11-01 (day, 46): Voice Library directions that fit the scene and the move (`vdir1`)

- Tom (16:02): the emotion directions in the Voice Library were awful and did not fit the situation or the ability.
- Fact (cause): 3,398 of 3,524 dialogue lines had only an automatic fallback direction ("natural, conversational", "animated" or "curious"), because the hand-written chapter scripts were never copied into the repo (the Project copies can only be read inline, not copied to disk). Battle lines had hand-written directions, but about 225 reused one stock tag per character (Grace "bossy, bright, animated" on 38 lines, Justin "natural, conversational") whatever the move or the moment.
- Call made: wrote new directions for every one of those lines, in story order with the neighbouring lines and the scene id as context, so each says what the speaker feels in that beat (rematch rounds escalate, after-defeat lines are worn and rueful, reading-aloud lines read aloud, hurt and low-health lines flinch and shrink). 3,497 dialogue lines and 225 battle lines now have a written direction; 238 hand-written battle directions that already fit were left alone. Spoken words are unchanged (checked line by line: only Tah Tah, spelled-out numbers and stretched vowels may differ), no em dashes, no accent words in tags.
- Files: `tools/voice-library/scripts/directions-20261101.json` (dialogue, read by make-index), `tools/voice-library/battle-overrides.json` (battle), `tools/voice-library/merge-directions.py` (how they are merged), `tools/voice-library/make-index.js` (reads the overrides, accepts scripts for lines with no cast voice, and a better fallback for any new line: speaker base plus what the punctuation and caps say, never "natural, conversational"). `data/voice-index.json` rebuilt: 0 dialogue lines on the fallback (was 3,398).
- Not changed: baked audio (the clips already in the game were made from the old directions; the new directions apply to the Library and to new takes). One line keeps the literal words "(a very small voice)" because they are in the game text; reword the line if that should not be spoken.
- Tested: `tools/voice-library/test.py` ALL PASS; `smoke.py` FAILS: []; looked at the Library cards on a phone-size screen (Round 4 rematch lines, one distinct direction per monster). Not seen on the phone. Stamp `build vdir1`.

## 2026-11-01 (day, 45): Painted gold dumpling squishy (`squishy1`)

- Tom (15:33): the sparkling diamond gold dumpling squishy in the chapter 1 intro still used an old pixel graphic. He generated a new painted one from the prompt I wrote (claude/squishy-intro-prompt.txt) and sent it.
- New `art/props/grace/gold_dumpling_hero.webp` (360 x 322, transparent, cut from his 1254 px image). `engine/intro.js`: the squishy over Grace's head and the full-screen close-up now draw it (`SQUISHY_HERO`, about 40% larger than the old 18 x 14 sprite in the close-up, label moved down to match). Scenes that pass their own sprite (Nine Scoops cow and dice) are unchanged; the pixel SQUISHY stays as the fallback until the image loads.
- Same art now used by Squishy Squeeze (`engine/grace-moves.js`) and the chapter 19 dumpling (`engine/battle2-kind.js` `dumpling`), replacing the older painted prop `gold_dumpling_squishy`. Not changed: the pale ghost and shadow versions of the dumpling in chapter 19 still use the pixel shape.
- Tested: played the real opening and looked at the over-the-head frame and the close-up; `IDS=grace,rose smoke.py` FAILS: []; `kit_test.py grace` FAILS: [] with `grace/gold_dumpling_hero` hits in Squishy Squeeze and Dumpling Drop; looked at the Squishy Squeeze frame. Not seen on the phone. Tags `prop-art.js`, `grace-moves.js`, `battle2-kind.js`, `intro.js` `?v=squishy1`; stamp `build squishy1`.

## 2026-11-01 (day, 43): Deedee and Boppy's house, clear paths and the 3D treatment (`grands3d`)

- Tom (14:58): make Deedee and Boppy's house more navigable (no clear paths in, out and around the furniture, nooks and crannies) and use cutouts for a 3D effect.
- Fact: the old walk map was one 6 x 4 pocket of floor plus the gate lane. Five oversized furniture blocks (recliner 4 x 5, TV 3 x 4, pepper plant 2 x 4, cookie counter 5 x 4, dining table 4 x 4) walled off everything else, so the kitchen, the sofa, the armchair corner, the hall arch and the dining side could not be reached.
- Walk map rebuilt from the painting (a tile walks when Tom's feet land on bare floor, or on something a cutout hides). 68 walkable tiles, was 28. Lanes: the open floor still joins the gate lane; west along row 10 in front of the stools (x2 to x5); east along row 10 in front of the dining table (x12 to x14); the cook's aisle behind the cookie counter (row 7, x2 to x5); the kitchen nook (x3 to x5, rows 5 and 6); the aisle behind the sofa (row 5, x6 to x10); up to the hall arch (x12 and x13, row 3) and down the east side to (12,5). It is a loop: floor, counter aisle, nook, sofa aisle, arch. The east side dead-ends at (12,5) because the end table and a dining chair close it.
- Furniture footprints now match the painting, so only the floor the painting covers blocks: recliner and ottoman `[3,3,4,2]`, TV `[7,3,4,1]`, sofa `[6,6,5,1]`, cookie counter `[1,8,5,2]` plus `[1,7,1,1]`, dining set `[12,6,4,4]`. New touchable pieces with short new texts (no existing text changed): Coffee table, Plaid sofa, End table, Big fern, Hall table, Hall chair, Sideboard. Every piece can be touched from a lane (tested).
- 3D: `art/grands-fg.webp` (new, `tools/make_grands_fg.py`) cuts out the counter top with its pie, cake dome and muffins, the plaid sofa with pillows and arms, and the two ivy plants on the half-wall. `PLATE_BEHIND.grands` (`engine/plate.js`) draws them over anyone behind, so the counter hides Tom's legs in the cook's aisle, the sofa hides them in the aisle behind it, and the ivy covers his feet on row 10.
- Wanderers: `makeRoom` now honours `spec.noGo` (areas already did). Deedee, Boppy and Aunt Ellie never stand on the one-tile links, so nobody can shut a lane.
- Chapter 15 fix: `ch15RemoveTable` (`data/scenes-ch15.js`) used to turn every tile of the dinner table into open floor, which would have made the sofa walk-through after the chapter. It now gives each tile back to the object under it, else to the painted mask. Tested: add then remove leaves the floor identical.
- Not done: the front foyer (bench, hydrangea and lamp table either side of the door) stays decoration. The three door tiles on row 15 are exits and the gate posts close row 14, so there is no way to stand there without leaving.
- Tested: `tools/grands_walk_test.py` (new: every tile reachable, real key presses along each lane, 16 furniture touches, chapter 15 table, portrait and landscape screenshots `tools/shots/grands-3d-*.png` looked at), `reach_test grands` (0 cut off), `ch15_test`, `ch14_test`, `tap_test`, `jpark_test`, `smoke` all pass. Not played on the phone. No spoken lines changed. Stamp `build grands3d`.
## 2026-11-01 (day, 45): Bosses stand at the far left of the battle screen (`bossleft1`)

- Tom (15:17): "In boss battles, the boss should be the further left of the screen as possible without cutting off graphics."
- `engine/battle2-ui.js` `b2LayoutFoes`: a boss's left edge now sits `B2_BOSS_EDGE` (6 canvas pixels, room for its shake and wobble) from the screen edge, so its centre is half its drawn width plus 6, never right of the old spot (168). Applies to every boss alone or with helpers; the old 100 floor on the helpers case is gone. Helpers keep x 272 and 294. Move animations follow through the existing aim warp.
- Measured all 20 bosses alone and with two helpers: left edge 5.8 to 6.4 px, none clipped, tallest (Ironbelly, Red Pen, Censor) still fit. Looked at frames; party moves against Big One land on it. `smoke.py` FAILS: []. Stamp `build bossleft1`.

## 2026-11-01 (day, 45): Party members flinch when an enemy hits them (`hurt1`)

- Animation audit fix 1 (claude/battle-animation-audit.md): a party member hit by an enemy stayed in the idle pose (only a shake and a white flash). Now `b2HitParty` (engine/battle2.js) puts the target into their own `hurtPose` frame for 0.35 s. It does not fire when the hit knocks them out (the KO drop takes over) and never cuts into a pose a move has already set. Under 25% HP the kneel still shows after the flinch.
- All ten party members have a `hurtPose` frame already (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Justin, Olivia, Nara); none needed art. Boppy, TNB and Nara read subtler than the rest; if Tom wants a stronger flinch for them, that is a new pose sheet (audit fix A-battle-states).
- Tested: a hit on each of the ten checked for the pose and its 0.35 s timer, frames looked at after the flash faded; `smoke.py` and `IDS=grace,rose,amy smoke.py` FAILS: []; `kit_test.py justin --only=basic` FAILS: []. Not seen on the phone. Tags `battle2.js` and `main.js` `?v=hurt1`; stamp `build hurt1`.

## 2026-11-01 (day, 45): Big Mudling holds the tin when he walks up to the party in the pond scene (`pond1`)

- Tom (15:15): in chapter 1 the Big Mudling approached the party facing the wrong way. `SCENES.ch1Pond` (data/scenes.js) now uses the painted heist frames from the pie theft: `mh_scurry_a/b` while he walks in (they face left, toward the party), then `mh_hug` (clutching the tin) while Grace shouts and the Big One surfaces. The frames already hold the tin, so the separate `carry:'tin'` prop is removed (it would have drawn twice). After the handoff the pose clears and he faces right toward the Big One as he leaves.
- Tested: `scene_frames.py` on `ch1Pond` in `hollow` (frames looked at), smoke 0 fails.

## 2026-11-01 (day, 43): Rose's head 10% smaller, Press Start is now Disconnected Controller (`tomrose1`)

- Tom (15:07): "Make Rose's head 10% smaller." `tools/sprite-bake/bake_rose.py`: new `HEAD_DOWN = 0.90` multiplies both head factors (battle 1.679 to 1.511, walk 1.140 to 1.026); body and height unchanged; Grace untouched. Re-baked all Rose atlases and `data/rose-hires.js`.
- Tom (15:08): Tom's Press Start move is renamed **Disconnected Controller** (key `button_mash` unchanged, so saves, icons and animation still work; also the basic `mash` slot in `data/party.js`, `B2_SKILLS.basic`, and `rx_mash`; tutorial text in `data/scenes.js`, which is not voiced). Spoken line is now "Ugh it's not connecting!!" (was "Ugh, it's not charged!"). **This line needs a voice bake**: queued in `tools/bake-page/pending.json` and `tools/voice-library/battle-scripts.json`; until then it uses speech synthesis.
- Tom's head 8% larger is in the same push (entry below, `tomhead1`).
- Tested: `smoke.py`, `IDS=rose,grace smoke.py`, `kit_test.py tom --only=button_mash` FAILS: []; frames looked at. Stamp `build tomrose1`.

## 2026-11-01 (day, 43): Tom's head 8% larger (`tomhead1`)

- Tom (14:57): "Tom's head needs to be 8% larger."
- `tools/sprite-bake/bake_tom.py`: new `HEAD_UP = 1.08` multiplies both head-growth targets (`FACE_GROW` for battle and custom poses, `FACE_GROW_W` for walk and stretch), so his head share of the figure is 8% higher everywhere. Battle head factor 1.434 to 1.549 (share .341 to .368); walk 1.641 to 1.772. Body, height and width unchanged (the figure is refit to the same height).
- Re-baked `art/chars/tom-*.webp` and `data/tom-hires.js`. ART_V `tomhead1`; `?v=` bumps on painted.js, tom-hires.js, main.js. The Tom-carrying-Rose ride set (`bake_tomride.py`) has no head-growth step and is NOT changed.
- Tested: `smoke.py` FAILS: [], full `kit_test.py tom` FAILS: []; contact sheet and welcome screen looked at. Stamp `build tomhead1`.

## 2026-11-01 (day, 44): Voice Library opens again on a phone full of takes (`vlmem1`)

- Tom (14:50): ADMIN > VOICE LIBRARY fades the title out to the Long Island Square, then freezes. Cause found by measurement: `voices.html` loaded every saved clip and take, audio included, into memory before it drew anything (and kept each new take's audio in memory too, so a bulk Regenerate grew it further). With 1,500 saved lines the page held 242 MB (6 MB with none); on a phone with thousands of regenerated lines it ran out of memory, so the new page never appeared and the old one stayed frozen behind the faded title. Not reproducible from a clean browser, so this is the cause the numbers support, not one seen on the phone.
- `voices.html`: the page draws first, then reads the phone's clips and takes in small batches keeping only the small fields (the audio stays in IndexedDB and is read for one line when it is played or put in use). New takes are saved and then dropped from memory. One shared audio element, unlocked by the first tap, so playing a clip still works on an iPhone after the short storage read. Export streams the clips into a Blob in batches.
- Safe mode: if a visit never finishes reading the phone data (the browser killed the page), the next visit skips it, says so in a notice at the top, and offers "Load the saved clips now". Leaving on purpose never triggers it. Nothing saved is removed.
- Note for a future fix: a long IndexedDB cursor over big clips crashed headless Chromium here, so reads use batches of `getAll` instead. The game's own `engine/local-clips.js` still loads every phone clip at startup (the game needs them in memory to play them); it was not changed.
- `tools/voice-library/test.py` grew a heavy-data run (300 lines of 100 KB audio in both stores): rows hold no audio, memory 26 MB, play, export, safe mode and recovery. All checks pass; `smoke.py` FAILS: []. Game code untouched; no `?v=` or stamp change.

## 2026-11-01 (day, 43): Welcome-screen RELOAD also refreshes the home-screen icon (`icon1`)

- Tom (15:05): reloading on the welcome screen should also refresh the save-to-home-screen app icon.
- engine/splash.js `splashReload`: the icon files named by the page's icon and apple-touch-icon links are now re-downloaded with the page and scripts (cache bypassed). index.html: a tiny head script gives the icon links the same `?r=` address the reload uses, so Add to Home Screen cannot reuse a stale cached icon.
- Fact: iOS fixes a home-screen icon at the moment it is added; no web page can swap an already-installed icon. To get a new icon, press RELOAD, then remove the old shortcut and Add to Home Screen again.
- Tags `?v=icon1` on splash.js and main.js; stamp `build icon1`.

## 2026-11-01 (day, 43): Chapter 1 intro, Tom's stretch cut to under half (`stretch1`)

- Tom (15:05): the stretch in the chapter 1 intro is way too long. The painted stretch ran 5.2 seconds; it now runs 2.4 (`STRETCH_DUR` in `engine/intro.js`). Same eight poses, same order, each pose proportionally shorter; the second exhale sound now fires at 75% of the stretch instead of at a fixed 3.9 s.
- Tag `?v=stretch1` on intro.js and main.js; stamp `build stretch1`. Tested: `smoke.py` FAILS: []; real chapter 1 intro timed at 2.42 s wall clock, no page errors, mid-stretch and the line "Oof, I'm finally here!" both looked at.
## 2026-11-01 (day, 43): Playable characters and Michael 15% bigger on the map (`big1`)

- Tom (15:02): all characters 15% larger in the overworld; then narrowed to playable characters and Michael only, not NPCs.
- engine/town-render.js: new `owBoost(a)` (1.15 for the player, party followers and Michael, else 1) multiplies the draw scale in `drawSheetActor` and `actorHeadAnchor`. Shadow, kiss lean and carried-Rose scale with it. NPCs unchanged.
- Tested: `smoke.py`, `jpark_test.py`; town and 2nd Ave looked at in portrait. Tag `big1`, stamp `build big1`.

## 2026-11-01 (day, 43): Tom's phone clips merged, Olivia has her voice (`clips5`)

- Tom (14:46) sent `local-clips-export_5.json` (178 clips; 5 repeats of the same line, newest kept = 173). New tool `tools/bake-page/merge-local.js` does the merge (battle into `data/voice/<id>.js`, dialogue into the chapter file that holds the key, silence trim and speaker fx on dialogue, mono 32 kHz 48 kbps).
- Battle: Olivia 31 new (new `data/voice/olivia.js`, loaded after justin.js), Amy 31 replaced and 5 added, Justin 47 replaced and 1 added, TNB 9 replaced (includes "Hey, Jojo! Catch!"), Grace 4 and 2, Tom 3, Rose 1 and 1. Dialogue: 38 clips into `dialog-ch28.js` (Justin, Michael, Olivia, Amy, Boppy, Deedee).
- Bake list and `pending.json` now empty (all 39 items were in the export). `make-list.js` and `battle-baker/merge.js` know Olivia as a battle voice. Voice Library index rebuilt.
- Tags `?v=clips5` on the changed voice files, dialog-ch28 (dialog-cast.js) and main.js; stamp `build clips5`. Tested: `smoke.py` FAILS: [], `battle_sound_test.py` FAILS: [], page load shows Olivia 31, Justin 48, Amy 51 battle clips and 34 Michael/Olivia dialogue clips, no page errors.
## 2026-11-01 (day, 43): Michael's painted walk sheet, carrying Lachlan and Isla (`michael1`)

- Tom (14:25): the sheet came back from prompt v4 (both kids in every frame; v2 and v3 had lost them). Installed as his overworld set.
- `tools/sprite-bake/bake_michael.py` (new): slices the 3 x 3 sheet, grows the three heads as separate layers (hand-set boxes per view; hand-drawn outlines in profile where the heads overlap; a head in front owns the overlap), solves the growth so Michael's head matches Justin's walk head and Lachlan's and Isla's match Grace's and Rose's after the figure scales to 54 rows (docs/CHARACTER_PIPELINE.md section 7, Carried children). Profile growth capped at x1.5 because the generator drew the side heads small. Result 28 x 55 rows, 46 colours, `art/chars/michael-ow.webp` (140 KB), `data/michael-hires.js`.
- `data/michael-hires-use.js` (new, after jojo-hires-use.js in index.html) sets OW.michael from the atlas; side = mirrored left row. `MICHAEL_OW` (npc-sprites.js) stays as the fallback. Source saved as `tools/sprite-bake/src/michael-walk-v1.png`.
- ART_V `michael1`; `?v=` bumps on painted.js and main.js. docs/CHARACTER_PIPELINE.md: Carried children paragraph and the reference table row updated.
- Tested: `smoke.py` FAILS: [], `jpark_test.py` FAILS: [], `recruit_olivia_test.py`; Michael looked at on 2nd Ave in all four facings (portrait) and in landscape; head row with Justin, Amy, Grace, Rose looked at. Stamp `build michael1`.
## 2026-11-01 (day, 43): Frisbee Golf, Jojo deeper into the monster plus a crash cloud (`fgolf2`)

- Tom (14:34): "looks good", but Jojo should end up further back, overlapping the monster (she in front of it, never the monster over her), and add a cartoon crash cloud at the moment of contact.
- engine/tnb-moves.js: her stop point is now 30% of her height INSIDE the nearest monster's box (was 20% outside), stumble back trimmed 22 to 16 px. New `crashCloud` (drawn inside `SC.t6_jojo` so it sits over the monster but behind her): a small lumpy dust ball with gold stars that pops out fast and thins away in 0.65 s. Spoken line, numbers and timing unchanged.
- Tested: `kit_test tnb --only=round_with_jojo` (frames at 2.55, 2.7, 2.85, 3.05 s looked at), `IDS=tnb smoke.py` FAILS: []. Tag `fgolf2`, stamp `build fgolf2`.

## 2026-11-01 (day, 43): Olivia rebalanced and re-gauged (`olivkit2`)

- Tom (14:24): the `olivkit1` pass used no real gauge for splendor or funniness and only fixed duration; and Olivia's kit was almost all attacks while every other kit is balanced.
- Balance (fact): the eight 14-move kits each have 6 or 7 damage moves and 7 or 8 support moves. Olivia had 10 damage and 1 support. Now 7 damage and 4 support: LivNews Live is a party buff (everyone +2 VP, pings fly to the family, no damage); Story Time is pure sleep (kindFoe, warms the enemy, no damage); Marine Layer is a pure all-enemy COOL and PEP debuff (no damage); Snack Bag unchanged. Costs and names unchanged. B4 to B6 (unbuilt) should be support when painted, which brings her to 7 and 7.
- Gauges, both strictly rising by unlock rung (data/battle2-data.js and engine/olivia-moves.js header): splendor points (each local effect 1, each screen-wide effect 2, each set piece drawn for that move 3) = 3, 7, 11, 13, 17, 18, 19, 21, 22, 25, 44; gag count (every spoken or shown joke) = 2, 3, 5, 7, 8, 9, 10, 11, 12, 15, 16; duration 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 9.0, 10.6 s. Order: Fact Check, Snack Bag, LivNews, Is This Real, Pyramid, Marine Layer, Double Under, Story Time, LACHLAN, MICHAEL, Better Than Bobby (auto order in data/abilities.js now puts B3 LACHLAN before A5 MICHAEL; MICHAEL is the funnier of the two).
- New effects: Pyramid chalk dust; Marine Layer wind gust; Story Time moonbeam, floating notes, fireflies; LACHLAN gets a MOM SPEED banner; MICHAEL the sky splits on the second yell, dust where the bag lands; Is This Real loses its flash and shake (rung 4 sits under Pyramid). New gags (messages only, spoken lines unchanged): "One of the viewers is Michael.", "Her students are not here. She lectures anyway.", "She is from New York. She knows what cold is. This is worse.", "Shoes stay on. This is serious.", "She does the voices.", "She wrote it. She will tell you she wrote it.", "The enemy is in the way. The enemy is no longer in the way.", "Michael did not notice. Michael is on a call.", "A bird. Somewhere, a bird.", "He did not look up.", Bobby's off-screen "I LET YOU WIN" and "He did not."
- Tested: full `kit_test.py olivia` (all pass; LivNews, Story Time and Marine Layer now deal 0), `smoke.py`; frames looked at. Stamp `build olivkit2`.

## 2026-11-01 (day, 43): Welcome screen, Rose off the fence post (`back3`)

- Tom (14:27): Rose's feet overlap a post on the welcome screen; move her a little further back.
- Call made: Rose's own `feet` 1244 to 1204 in SPLASH_SPOTS (engine/splash.js), 40 picture px higher; nobody else moved.
- Tested: welcome screen at 390x844 looked at; `smoke.py`. Stamp `build back3`.

## 2026-11-01 (day, 43): Frisbee Golf, TNB's Jojo move rebuilt (`fgolf1`)

- Tom (14:14): rename the move Frisbee Golf (was Round with Jojo, disc golf). New animation from existing frames: TNB stays in the line and calls "Hey, Jojo! Catch!"; Jojo runs out at the enemies backwards; he throws the frisbee to her; she catches it as her back collides with the enemies.
- engine/tnb-moves.js `T.round_with_jojo` (key unchanged, so saves and MOVE_KEYS hold): TNB never leaves his spot (poses point, wind, throw). Jojo uses only her existing painted frames: right-facing walk row moving left for the backward run, `b_release` for the catch, `b_follow` for the stumble, `b_celeb2`, `b_high`, then the walk row back. Frisbee arcs from TNB's hand to her reaching hand and lands exactly at the hit. Basket scene removed. Same numbers (row hit, delay).
- Renamed to Frisbee Golf in `data/abilities.js`, `data/battle2-data.js` (name and desc), Jojo's loft lines and comment (`data/maps-la.js`, unvoiced), docs/CANON.md. Icon (`data/battle-icons.js`) is now a frisbee instead of a basket.
- SPOKEN LINE CHANGED: `round_with_jojo` is now "Hey, Jojo! Catch!" (`data/lines.js`; also `tools/clip-audit/extra-battle.json` and `tools/voice-library/battle-scripts.json`). The old baked clip no longer matches, so TNB is silent on this move until the line is re-baked.
- Tested: `kit_test tnb --only=round_with_jojo` (frames looked at), `IDS=tnb smoke.py` FAILS: [], `jojo_test.py` FAILS: []. Tags `fgolf1`, stamp `build fgolf1`.

## 2026-11-01 (day, 43): Welcome screen, a little bit further back (`back2`)

- Tom (14:15): "just a little bit further".
- Call made: one more notch of the same move as `back1`. `SPLASH_ALL` 1.0 to 0.93 (about 7% smaller) and `SPLASH_BACK` 35 to 60 picture px. Relative heights unchanged.
- Tested: welcome screen at 390x844 looked at; `smoke.py`. Stamp `build back2`.

## 2026-11-01 (day, 43): Michael and the kids under the size rules (`docs2`)

- Tom (13:49): apply the head and body rules to Michael (6'4") and the kids he holds: Lachlan's head Grace's size, Isla's head Rose's size.
- Michael is still the old traced pixel-art sprite (MICHAEL_OW, data/npc-sprites.js, thick outlines), the only character not yet painted; his painted walk sheet was prompted but has not come back. Resizing heads on the pixel sprite would not make him match, so the rules go into his prompt and the pipeline instead.
- claude/michael-walk-sheet-prompt.txt v2 (Project): 6'4" (was 6'5"), a HEAD SIZES block (Lachlan's head about 80% of Michael's, Isla's about 75%, the Grace and Rose ratios on the walk frames), same sizes in every frame.
- docs/CHARACTER_PIPELINE.md section 7: "Carried children" rules and Michael's row. No game files changed.

## 2026-11-01 (day, 43): Olivia kit audit, every move escalates (`olivkit1`)

- Tom (13:30): audit Olivia's abilities for visual splendor, duration and funniness; all three should rise with each move.
- Audit found: durations were out of order (Double Under 9.1 s beat MICHAEL 6.4 s and the ultimate 8.3 s; the basic ran 5.7 s), the hit effects were the same small sparks plus a white poof on every move, and the ultimate unlocked before LACHLAN.
- Fix (engine/olivia-moves.js): every timeline rebuilt on a ladder by unlock order. Real durations now 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 9.0, 10.6 s (Fact Check, Snack Bag, LivNews, Is This Real, Pyramid, Marine Layer, Double Under, Story Time, MICHAEL, LACHLAN, Better Than Bobby). Effects grow with the rung: LivNews gains a view counter climbing to 48,000; Is This Real a glitch on the enemy and an ANALYZING, 7 FINGERS readout; Pyramid a bigger pyramid, ground ring and chalk poof; Marine Layer denser fog plus drizzle, BRRR and 62 DEGREES; Double Under rope rings on each jump, an OOF on the trip and a whip crack; Story Time night sky with moon and stars; MICHAEL a longer wait with crickets, a faint WHAT? from off screen, a bigger WHAM; LACHLAN speed lines, dust, a THROUGH shockwave; Better Than Bobby a dark stage with a spotlight, hits that grow per finger, a white shockwave on the mic drop, confetti and a BETTER THAN BOBBY banner.
- Funnier tails (messages only, no spoken line changed): "Found one. Under the wipes.", "Chat is not kind.", "It is trying to count its own fingers.", "Who, what, when, where, WHAM.", "Everyone is cold now. Spiritually.", "Page two is never needed.", "He was in the car the whole time.", "He was holding a stick. Just a stick.", "Bobby was not asked for comment."
- data/abilities.js: Olivia's auto unlock order now ends with the ultimate (B3 LACHLAN before A6 Better Than Bobby).
- Tested: full `kit_test.py olivia` (all pass), `smoke.py`; hit frames of every move looked at. Stamp `build olivkit1`.

## 2026-11-01 (day, 43): Character build instructions match the painted style; heads, heights and widths rules written down (`docs1`)

- Tom (13:41): write the character size specs into the build instructions as rules for future adults and children (adult faces always the same size, children like Grace and Rose, height required to proceed), and fix the build instructions, which still described the old 16-bit style instead of the new painted realistic style.
- docs/CHARACTER_PIPELINE.md: 16-bit wording removed; STYLE BLOCK and PHOTO FIDELITY BLOCK (from the Project's newer copy) now in section 0, with a child variant; real height in feet and inches is required input; new section 7 (adult faces match by head row and Tom's eye, battle height 2.01 px per inch, welcome body scale, walk rows, shoulders; children's head share .43 battle and .373 walk; current reference table; where every knob lives); install steps updated (Olivia bakes as the template, ART_V cache rule, bakes never overwrite portraits).
- CLAUDE.md and README.md no longer call the game 16-bit; CLAUDE.md's character rule now says height first and the head rules. Jojo's row filled in from `jojoart1`. No game code changed.

## 2026-11-01 (day, 44): Sound settings in battle, with their own voice volume (`sound1`)

- Tom: a special settings icon in battles where music and voice volume can be changed, also in the battle test (Battle Lab).
- New gear button in the top-right tool bar of every fight (left of 1x and AUTO, right of EXIT in the Battle Lab). It opens a SOUND panel over the fight with MUSIC and VOICE rows (minus, 10 pips, plus; tap a pip to jump). The fight keeps running underneath. DONE, tapping outside, Escape or controller B close it. Keyboard: O opens, Up/Down pick a row, Left/Right change it. Controller: Select opens, D-pad changes, A or B closes. Voice changes play a short Grace shout so the level can be judged.
- Voice now has its own bus and level (`sound.vol.voice`, `sound.voiceBus`, engine/audio.js): battle shouts (engine/speech.js, incl. the speech-synthesis fallback) and story dialogue (engine/dialog-voice.js). Before, voices shared the effects level. A voice level never saved starts at the saved effects level, so nothing sounds different until it is changed. Effects stay on their own level.
- Pause menu OPTIONS: the old "EFFECTS AND VOICES VOLUME" row is now VOICE VOLUME and EFFECTS VOLUME. Levels are saved in browser storage and ride along in every save (`volVoice`).
- Test: new `tools/battle_sound_test.py` (taps, keys, controller, bus gains, saves, portrait and landscape, leaving the lab). Tested: it, `smoke.py`, `lab_exit_test.py`; panel looked at in portrait and landscape. Stamp `build sound1`.

## 2026-11-01 (day, 43): Jojo redone from the new sheet at adult proportions (`jojoart1`)

- Tom (12:08): new painted Jojo sheet (new face, wave shirt print); update her standing, walking and battle frames, with the adult head size and body proportions, she is 5'6".
- Source `tools/sprite-bake/src/jojo-sheet-v2.png` (same 20 frames as v1). `bake_jojo.py` now measures head boxes by hand (the auto chin landed on the collar) and sizes heads to the adult canon: walk top-of-hair to chin share .365 front and back, .34 side (adult average .363); battle .42 (Tom .43, TNB .45), about a 49 px face like Justin. Enlargement factors solved per view: front 1.71, back 1.74, side 1.53, battle 2.18.
- Height: 66 in at 2.013 px per inch = 133 px standing in battle (Justin 153, TNB 141, Amy 131); overworld figure 42 rows (Amy 41.7, Tom 43). `SC.t6_jojo` now sizes her from TNB's height x 66/70; `JOJO_HIRES.meta.bt.stand` is the standing height the draw code scales from.
- New: the battle atlas also holds her walk row with the battle head (`w_right_*`), so she no longer swaps head size between walking on and the throw. Raised-arm poses keep their arms in front of the bigger head. Neck blend shortened (it stretched the shoulders into wings at the bigger head).
- ART_V `jojoart1`. Tested: `jojo_test.py`, `kit_test.py tnb --only=round_with_jojo --speed2`, `smoke.py`; every baked Jojo frame and the loft looked at. Stamp `build jojoart1`.

## 2026-11-01 (day, 43): Olivia follows the head rule (`olivia8`)

- Tom (12:12): everyone looks good now; apply the same rule to Olivia (Jojo later, her art is being redone).
- Measured next to Amy (same height assumed, 5'5"; Olivia's height is not on record): face about 17% smaller in battle and 16% smaller walking; body below the chin already matched Amy's.
- Head grown about the chin, body unchanged, using tools/sprite-bake/kidhead.py `grow_head`: battle x 1.25 (bake_olivia_battle.py `HEAD_K`, `CHIN_SHARE` .385; every ability sheet too; KO unchanged), walk x 1.18 (bake_olivia.py `WALK_HEAD_K`, `WALK_CHIN` .344). Battle height now 130 px (Amy 131).
- Both bakes dropped their fixed atlas tags (`?v=olivia5`, `?v=olivia3`) so ART_V reaches them; bake_olivia.py no longer overwrites portraits/olivia.png (the `face8` painting) unless run with PORTRAIT=1. ART_V `olivia8`.
- Tested: `smoke.py`; full `kit_test.py olivia`; `recruit_olivia_test.py`; head rows (walk at welcome scale, battle) and every Olivia battle frame looked at. Stamp `build olivia8`.

## 2026-11-01 (day, 43): New painted portrait for Olivia (`face8`)

- Tom sent a new painted portrait of Olivia (blonde, center part, big smile, cream top). Tight face crop 128x128 into portraits/olivia.png, framed like Amy, Grace and the others; replaces the old cutout.
- `PORTRAITS.olivia` `?v=1` to `?v=2`, menu.js tag and build stamp bumped (`face8`).

## 2026-11-01 (day, 43): Adult faces evened out again on the welcome screen (`faces7`)

- Tom (11:59): approved shrinking TNB, Boppy and Deedee to match Justin; said Amy's head looks bigger than the rest and he doubts the measuring.
- Walk and welcome only (battle unchanged): TNB head x .89 (bake_tnb.py `TARGET_OW`/`TARGET_OWL`), Boppy x .92 (`WALK_HEAD_RATIO` .362), Deedee x .92 (.372), Amy x .92 (.383, also bake_amy_extra.py). Welcome heights lowered so bodies stay the same size: TNB 330 to 309, Boppy 299 to 284, Amy 298 to 282, Deedee 293 to 278 (SPLASH_SPOTS, engine/splash.js).
- Measuring note: face-only numbers (hairline to chin x width; pupil spacing x eye to chin) disagree with each other because each painting has different proportions (Deedee wide-set eyes and short chin, Boppy wide face, Amy tall face with a big smile). Tom's eye is the judge; tools to give him: a side-by-side of heads cut from the welcome screen at their real size on one chin line.
- ART_V `faces7`. Tested: `smoke.py`, `amyhouse_walk_test.py`; welcome screen and the head row looked at. Stamp `build faces7`.

## 2026-11-01 (day, 44): New home-screen icon (`icon1`)

- Tom (11:53): the iPhone home-screen icon should show the game logo at the top with just the word TOM on the banner, and Tom's new head centered below it.
- New `icon-v7.png` (180x180): the painted logo's TOM row (compass and vines) on a wooden plaque, Tom's painted portrait in a gold ring below it, the welcome-screen harbor as backdrop. Built from `art/welcome.webp` and `portraits/tom.png`. `index.html` points at it (new filename so iOS does not serve the cached icon); `launch/apple-touch-icon.png` and `CURSOR-DEPLOY.md` updated to match.
- iOS reads the icon only when the shortcut is added: Tom must delete the old home-screen shortcut and add it again from Safari (Share, Add to Home Screen).
- Tested: `smoke.py`; icon looked at at 720 px and at the real 180 px. Stamp `build icon1`.

## 2026-11-01 (day, 43): Welcome screen, everyone stands further back (`back1`)

- Tom (11:53): on the welcome screen make everyone stand back a bit further.
- Call made: everyone about 9% smaller (`SPLASH_ALL` 1.1 to 1.0, undoing the 2026-10-29 bump) and feet lifted 35 picture px (`SPLASH_BACK`, engine/splash.js). Relative heights unchanged, so the real-height canon still holds.
- Tested: welcome screen at 390x844 before and after looked at; `smoke.py`. Stamp `build back1`.

## 2026-11-01 (day, 43): Grace's and Rose's heads grown to the adults' head-to-body ratio (`kids1`)

- Tom (11:44): check the head-to-body ratio for Tom and TNB and apply it to Grace and Rose, bigger heads, same bodies.
- Head share (top of head to chin over total height): Tom battle .43 / walk .35, TNB .45 / .40 (average .43 / .373). Grace was .34 / .36, Rose .31 / .343.
- New tools/sprite-bake/kidhead.py (`grow_head`, factor so the body keeps its size and the figure grows by the head). Grace x 1.46 battle, 1.06 walk (bake_grace.py, bake_grace_extra.py); Rose x 1.68 battle, 1.14 walk (bake_rose.py: battle, extras, jab, tickle, boomerang sheets, walk and overworld extras). KO and Grace's gymnastics wheel poses (head not on top) unchanged; Rose's ride-on-shoulders frames unchanged. Outfit-recolour and eye-search bands remapped (`body_frac`, `head_frac`). Welcome heights Grace 225 to 230, Rose 196 to 205 so their bodies stay the same size there.
- ART_V `kids1`. Tested: `smoke.py`; full `kit_test.py grace` and `rose`; every Grace and Rose battle frame, the welcome screen and the battle lineup looked at. Stamp `build kids1`.

## 2026-11-01 (day, 43): Tom's and TNB's shoulders as wide as Justin's (`width3`)

- Tom (11:25): make both Tom's and TNB's shoulder width like Justin's.
- Measured at shoulder level on the welcome screen (welcome px): Justin 104, Tom 152 (after `width2`), TNB 155.
- Tom: whole body was wide, so `BODY_W` 1.83 to 1.25 (bake_tom.py); his waist now also matches Justin's. `hand()` x offset 50 to 38 px.
- TNB: only his shoulders and sleeves were wide (waist already 102), so his upper body is narrowed x .67, easing back to full width between 25% and 45% of the body (`BODY_W`, `BODY_FADE` in bake_tnb.py; `body_width` in headwarp.py got a `fade` option). It runs after his head warp and bulk step (run before them it punched holes in the sleeves). Env `TNB_W` overrides for testing.
- Result (welcome px, shoulder to chest): Justin 98 to 110, Tom 100 to 115, TNB 102 to 120.
- Known, already live before this change (TNB_W=1 rebake equals the old files byte for byte): small see-through gaps on TNB's sleeves next to his hair in some battle poses (act, throw, wind, kneel, push, ollie). They come from his head-warp step; not fixed yet.
- ART_V `width3`. Tested: `smoke.py`; `kit_test.py tom` (starter_splash, overpriced_gadget) and the full `tnb` kit; `tomhouse_walk_test.py`; welcome screen and every Tom and TNB battle frame looked at. Stamp `build width3`.

## 2026-11-01 (day, 43): Tom's body as wide as TNB's (`width2`)

- Tom (11:12, on `build width1`): Tom's body looks half the width of TNB's. Measured at chest level on the welcome screen: Tom 97, TNB 158 (TNB's loose sleeves and apron make his chest the widest part; `width1` had matched the waist).
- Fix: Tom's `BODY_W` 1.18 to 1.83 (bake_tom.py), so his chest now matches TNB's; head unchanged. `hand()` x offset 35 to 50 px (engine/tom-moves.js) for the wider arm. ART_V `width2`.
- Tested: `smoke.py`; `kit_test.py tom` (starter_splash, sourdough_snob, overpriced_gadget); `tomhouse_walk_test.py`; welcome screen and every Tom battle frame looked at. Stamp `build width2`.

## 2026-11-01 (day, 43): Tom wider, Boppy slimmer (`width1`)

- Tom (10:42): Tom should be wider to match TNB, Boppy should be skinnier.
- Measured on the welcome screen at waist and hip level (arms included, welcome px): Boppy 142, Deedee 111, Justin 108, TNB 101, Tom 87, Amy 85.
- New step `body_width` (tools/sprite-bake/headwarp.py): the body below the chin is scaled sideways about its centre, easing in over 14 rows at the neck; the head is untouched. Runs inside each pose's head warp, so walk, welcome, battle and every extra sheet follow. Tom x 1.18 (`BODY_W` in bake_tom.py; lying, face-down, cartwheel, KO and cower poses skipped); Boppy x .80 (`BODY_W` in bake_boppy.py, so extras, fishing, stock and pepper sheets follow; lying KO and the young runner skipped). Result: Tom 103, Boppy 115 at the waist. Tom's `hand()` x offset 30 to 35 px (engine/tom-moves.js) to follow his wider arm; Boppy's hand, eye and mouth points are found on the new frames.
- ART_V `width1`. Tested: `smoke.py`; `kit_test.py tom` (starter_splash, sourdough_snob, overpriced_gadget), `boppy` (patient_angler, pepper_breath, five_alarm_jar); `tomhouse_walk_test.py`; every Tom and Boppy battle frame and the welcome screen looked at. Not played on the phone. Stamp `build width1`.

## 2026-11-01 (day, 43): Welcome screen bodies follow real height (`body1`)

- Tom (09:56 to 09:59): compared adult body lengths and widths, approved counting real height to the top of the head, not the top of the hair or cap.
- Measured on the welcome screen (chin to feet, welcome px): Justin 208, Tom 196 matched their heights; TNB 164 (should be 192), Amy 160 (178), Deedee 165 (178), Boppy 172 (183), because hair and caps ate into their height.
- Fix (welcome screen and walking art): heights TNB 304 to 330, Boppy 291 to 299, Amy 282 to 298, Deedee 282 to 293 (SPLASH_SPOTS, engine/splash.js); walk head shares lowered by old/new height so heads stay the same size (bake_tnb `TARGET_OW`/`TARGET_OWL` x .921, bake_boppy .393, bake_amy and bake_amy_extra .416, bake_deedee .404). Result: bodies TNB 194, Boppy 182, Amy 176, Deedee 176. The top of TNB's hair now reaches Justin's height on the welcome screen.
- Not changed: battle heights (in battle TNB's head with hair is much bigger than Justin's, so a full-length body would make him look as tall as Justin), widths (as painted), Tom and Justin. On the overworld these four keep their row height, so their heads are about 4 to 8 percent smaller there than before. ART_V `body1`.
- Tested: `smoke.py`, `amyhouse_walk_test.py`; welcome screen before and after, bodies side by side re-measured. Not played on the phone. Stamp `build body1`.

## 2026-11-01 (day, 43): Tom's head nudged down to match Justin's (`heads6`)

- Tom (09:51): Justin's head still looked smaller than Tom's. Measured on the welcome screen: both head outlines are the same (crown to chin 128 vs 130, cheek to cheek 70 vs 75), but Tom is bald, so his scalp reads as face: his visible skin is 115 tall against Justin's 102 (Justin's top fifth is hair).
- Fix: Tom's head x .94 in walk, welcome screen and battle (`FACE_GROW_W`, `FACE_GROW` in bake_tom.py), splitting the difference so his visible face sits close to Justin's without his whole head becoming smaller. ART_V `heads6`.
- Tested: `smoke.py`; `kit_test.py tom` (starter_splash, noise_canceling); welcome screen before and after looked at. Stamp `build heads6`.

## 2026-11-01 (day, 43): Adult faces equalized by how big they look, welcome screen as the guide (`heads5`)

- Tom (09:38): on the welcome screen Tom's and Boppy's heads looked bigger than the rest and Justin's smallest; fix them all using the welcome screen as the guide.
- Cause: earlier passes matched face HEIGHT only (hairline to chin). How big a face looks depends on width too: Tom's and Boppy's faces are wide, Justin's, Amy's and Deedee's narrow. New measure: face height x cheek-to-cheek width at eye level (square root), read by hand on each front walking frame at welcome-screen size (Boppy's height from eye line to chin x 1.9, the cap hides his forehead). Before: Tom 97, Boppy 91, TNB 84, Justin 78, Deedee 76, Amy 71. After: all 77 to 85 (reading error about 5%).
- Walk and welcome screen: Justin x 1.06 (bake_justin.py `--ratio` .35, `--ratio-side` .334), Tom x .85 (`FACE_GROW_W`), Boppy x .91 (`WALK_HEAD_RATIO` .404), Deedee x 1.09 (.42), Amy x 1.17 (.44, also bake_amy_extra.py overworld sheet), TNB unchanged.
- Battle, same measure on the idles: Tom 35 px vs the group's 39, so x 1.12 (`FACE_GROW`); Boppy 46 px, so x .85 (`BATTLE_HEAD_RATIO` .417, `PEP_GROW`, hand band `HR` .417); Justin, TNB, Amy, Deedee within 3%, unchanged. Heights unchanged everywhere.
- Justin's walk atlas lost its fixed `?v=head2` (bake_justin.py), so ART_V reaches it. ART_V `heads5`.
- Tested: `smoke.py`; `kit_test.py tom` (starter_splash, sourdough_snob, overpriced_gadget, noise_canceling) and `boppy` (cap_swat, patient_angler, pepper_breath, five_alarm_jar); `tomhouse_walk_test.py`; welcome screen before and after, both battle lineups looked at. Not played on the phone. Stamp `build heads5`.

## 2026-11-01 (day, 43): Boppy's head brought in line (`heads4`)

- Tom (09:28): Boppy's head looked much bigger than everyone else's, and different from Deedee's.
- Cause: his cap hides his forehead, so `heads1`/`heads2` measured his "face" from the cap brim. That undercounted his face, so his head was enlarged too much. Checked with eye line to chin (not affected by hair or hats): with the hidden forehead allowed for, he was about 13% too big.
- Fix: Boppy's head x .87 in battle, walk and the pepper sheet (`BATTLE_HEAD_RATIO` .564 to .491, `WALK_HEAD_RATIO` .51 to .444 in bake_boppy.py; `PEP_GROW` x .87 in bake_boppy_extra.py; hand band `HR` .491). Heights unchanged (135 battle px, 291 welcome px). ART_V `heads4`.
- Tested: `smoke.py`; `kit_test.py boppy` (cap_swat, patient_angler, pepper_breath, five_alarm_jar); welcome screen before and after, battle lineup looked at. Stamp `build heads4`.

## 2026-11-01 (day, 45): Boppy falls behind gradually; the party stops for him (`wind1`)

- Tom (08:58): Boppy slowing down on the overworld is funny but jumpy. He should gradually fall behind, and when he is far enough back the whole party is forced to stop until he catches up.
- Before: every 14 to 23 steps he snapped one whole tile back. Now he drifts back a little on every step (0.12 to 0.18 of a tile, picked per stretch) as a smooth glide, so the gap opens slowly. At 3 tiles behind, the party stops (SLOW DOWN! bubble and puffs), walking input is ignored with no bump sound and tap-to-walk does not give up, and Boppy walks back up at his own pace (about 0.7 s). The party moves again once he is within 0.7 of a tile. If Tom simply stops walking, Boppy still catches up fully.
- Code: `BOPPY_WIND` in data/scenes.js (knobs `rate`, `max`, `resume`, `catchStep`, `catchTime`); followers take a fractional `f.lag` in engine/followers.js (`followerToSpot`, `partyHalted`; trail kept 4 tiles longer); engine/overworld.js and engine/tapwalk.js ignore the wait. Same conditions as before: chapter 3 on, outdoors on Long Island, Boppy last follower, Grace along.
- Tested: `tools/boppy_wind_test.py` (22 s walk: largest per-frame move 0.08 tile, 5 to 6 forced stops, lag capped at 3, Tom cannot move while stopped, release after about 0.7 s); screenshot of the stop with the bubble; `smoke.py` passes. Not played on the phone. Stamp `build wind1`.

## 2026-11-01 (day, 43): Phones now load the new Tom and Amy art (`heads3`)

- Tom (09:10): on `build heads2` the welcome screen still showed Tom's old small walking head. Cause: data/tom-hires-use.js added a fixed `?v=tom6` to all five of Tom's atlas images, and engine/painted.js skips its `?v=ART_V` tag when an address already has one, so the phone kept its saved copies. Amy's stance sheet had the same problem (`?v=bj1` in bake_amy_extra.py).
- Both fixed tags removed, so every painted atlas of the five re-baked adults now loads with `?v=heads3` (checked in the browser: none left on an old tag). No art changed. ART_V `heads3`.
- engine/splash.js tag is `?v=heads3` (it carries both the `heads2` heights and the `solo1` changes).
- Tested: `smoke.py`; atlas addresses listed in the page. Stamp `build heads3`.


## 2026-11-01 (day, 43): Stampcard is one screen: grid, detail drawer, pin to compare (`stampgrid1`)

- Tom (08:55) approved the revamp in `claude/stampcard-revamp.md`. The STAMPS tab used to be 14 full rows (about six phone screens). It is now one screen in portrait: a strip, a Core row (Basic, Signature), Path A (gold) and Path B (blue) side by side with six chips each, and a drawer under the grid. No data or save changes.
- Strip: name, small LV badge (star from Mastery), `SP`, `PP`, `TK` counts, a `?` that toasts the point rules, small AUTO and RESPEC, and `L1 / L2` from level 27. The footer help text is gone.
- Chip: move name plus one fact line. Stamped = filled in the path colour with a check and `VP · element · +` (`++` when fully polished). Next = gold outline, pulsing, `N SP to stamp · VP`. Not enough SP = plain `N SP · VP`. Gated = dim with a lock and `Lv N`. No move built = dim, `Soon`. A6 and B6 carry a star.
- Drawer shows the selected move only: name, `PRIMARY / REMIX` toggle (Remix side is dim and reads `TICKET` until unlocked), `Lv · VP · element · Polish tag`, description, then ONE big button chosen by state (STAMP, POLISH, UNDO, REMIX with the existing `USE TICKET?` confirm, SWAP). Call made: the other available actions (for example UNDO on a move that can also be polished) sit as small buttons beside `PIN TO COMPARE`, so nothing the old rows could do became unreachable.
- Pin to compare: PIN holds the move in the left half; the next chip tapped fills the right half in the same format. UNPIN or B clears it.
- Keyboard and gamepad: the chips are a cursor grid through the existing spatial `menuMove` (left/right switch column, up/down move rows, up from A1/B1 reaches the Core row). The drawer follows the cursor. A on the move under the cursor runs its main action (touch taps only select). B clears the pin, then closes the drawer, then leaves the tab (`scBack`, hooked in `menuBack`). L and R still cycle characters; the Primary/Remix toggle is a drawer button (call made: L/R stay on character cycling like every other per-character tab).
- Landscape: strip across the top, grid left, drawer right and pinned at the top while the grid scrolls (six rows do not fit the sideways screen at readable size, about 4 show at once). Rose Mode is read-only (no action, AUTO, RESPEC or loadout buttons; the grid, toggle and pin still work). Characters without a kit yet show their missing moves as `Soon` and the drawer says `Arrives in a later update.`.
- Files: `engine/progress.js` (`renderStampsTab`, `b8Row` replaced by `scChip`, `scActions`, `scDrawer`, `scPane`, `scBack`; every `b6*` and `b8*` rule function untouched), `index.html` (old `.sc-*` block replaced), `engine/menu.js` (Back hook). New test `tools/stampgrid_test.py` (levels 1, 30, 50 in portrait and landscape, stamp, polish, pin, compare, Remix, keyboard cursor, Rose Mode, every member renders). `smoke.py` passes. Not played on the phone.
- Fix: the `solo1` push left merge-conflict lines in `index.html` around the `splash.js` tag (two tags, one stale). Resolved to `splash.js?v=solo1`.

## 2026-11-01 (day, 42): Battle Lab SOLO: pick any fighter, nobody can be hurt (`solo1`)

- Tom (08:45): in the battle test, JUSTIN SOLO is now just SOLO. Picking it opens a fighter list (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Nara, Justin, Olivia); the pick fights Old Iron-Gill alone at level 12 with every move unlocked. The separate OLIVIA SOLO entry is gone (SOLO covers her). The two TRYOUT entries are unchanged.
- In SOLO both sides have infinite HP (`b2Invincible` in engine/battle2.js: HP always reads full and ignores every hit, drain or instant KO), plus the existing infinite VP and HEART. The fight never ends on its own. RUN does nothing and the bag has no EXIT LAB row; the only way out is EXIT at the top of the battle, which returns to the fighter list so the next character can be tried. Other Battle Lab fights are unchanged.
- Tested: new `tools/solo_test.py` runs all ten fighters (starts alone, HP locked after forced hits and three played turns, RUN keeps the fight, EXIT returns to the picker, no console errors); picker and fight frames looked at in portrait and landscape. `smoke.py` run. Not played on the phone. Stamp `build solo1`.
- Fix: the first `solo1` push left merge-conflict lines in index.html (a doubled `splash.js` tag, page failed to load); removed within minutes, one tag `?v=solo1`.

## 2026-11-01 (day, 41): Walking sprites and the welcome screen follow the head rule (`heads2`)

- Tom (08:51, 08:53): on the welcome screen the adult heads and bodies were all different sizes, and inside houses Tom was not updated like the other adults. Both use the walking sprites, which `heads1` had left alone.
- Walking art re-baked so each adult's front face matches Justin's when drawn at real height: `WALK_HEAD_RATIO` in bake_deedee .385, bake_amy .376 (and bake_amy_extra's overworld sheet), bake_boppy .51; bake_tnb `TARGET_OW`/`TARGET_OWL` x .97; bake_tom gets a walk head warp (factor 2.308; his walk head was by far the smallest) for walk and arrival-stretch frames, with hand-set boxes on the four stretch frames that have arms by the head. Battle art byte for byte unchanged.
- Welcome screen (engine/splash.js): adults at real height with Justin 6'4" = 330 picture px: Tom 308, TNB 304, Boppy 291, Amy and Deedee 282. Grace, Rose and Nara unchanged.
- bake_tom.py no longer overwrites portraits/tom.png (the painted portrait) unless run with PORTRAIT=1. ART_V `heads2`.
- Tested: `smoke.py`, `tomhouse_walk_test.py`; welcome screen at 390x844 and Grands and Amy's house screenshots looked at. Not played on the phone. Stamp `build heads2`.

## 2026-11-01 (day, 41): Party no longer hidden by Penny's and Nickel's counters (`counter1`)

- Tom (08:54): after Penny was fixed to stand behind her counter, the playable characters standing in front of it were being covered by the counter too (heads and bodies cut off at its front edge).
- Cause: the painted counter foreground (`art/shop-fg.webp`, `art/nickels-fg.webp`) is drawn over a rectangle whenever the shopkeeper is behind it, and that rectangle also covers the tall sprites of anyone standing in front whose body reaches up into it.
- Fix (`plateWalkBehind`, engine/plate.js): zones flagged `front:true` (shop, nickels) draw everyone whose feet are south of the counter's front edge again on top of the foreground, in depth order. Penny and Nickel still hide behind the counter. Other rooms (Tom's island, Amy's house, the stacks) are unchanged.
- Tested: Penny's Pockets with the party on rows 7 and 8 at iPhone size, 2x density, looked at before and after; `smoke.py`. Not played on the phone. Stamp `build counter1`.

## 2026-11-01 (day, 40): Adult battle heads: every face as tall as Justin's, heights from real heights (`heads1`)

- Tom (01:24, 01:30): every adult's face (hairline to chin, hair not counted) should be Justin's height, head scaled to match per person, and figure heights from real heights (Justin 6'4", Tom 5'11", TNB 5'10", Boppy 5'7", Amy and Deedee 5'5"), whole figure = real height ("option A"). Grace and Rose left exactly as they were. Justin is the reference and is unchanged.
- Result in battle px (idle): face 49 for everyone (measured 47 to 49), heights Justin 153, Tom 143, TNB 141, Boppy 135, Amy 131, Deedee 131. `BATTLE_SIZE` (data/battle-size.js): tom 1.43, amy 1.322, deedee 1.322, boppy 1.007, tnb 1.409.
- Bakes: `bake_deedee.py`, `bake_amy.py`, `bake_boppy.py` got a separate `BATTLE_HEAD_RATIO` (.494 / .438 / .564; walk keeps .40), `bake_amy_extra.py` the same for its battle sheets (burpee jump override kept in proportion), `bake_tnb.py` `TARGET_BT` .445 to .428. `bake_tom.py` now has a head warp (factor 1.265, solved on the idle); lying, face-down, cartwheel, all-fours KO and cower poses use hand-set head regions (`REGION`), win, leap and kneel hand-set boxes so the fists stay out. Boppy's pepper sheet got the same head growth (factor 1.771) and its mouth points were carried through the warp with marker dots. Young Boppy (flashback runner) unchanged. Walk sprites unchanged for everyone.
- Hand and eye points: Amy, Deedee and Boppy find them in bands of the frame; the bands now follow the head share (`HR` in each *-hires-battle.js; young Boppy keeps the old .40). Tom's `hand()` in tom-moves.js .56 to .51 so the hand stays at the same body height. Generic 55% fallbacks for Tom sit about 7 px higher than before.
- Cache: painted atlas images now load with `?v=ART_V` (engine/painted.js, `heads1`); bump it whenever a baked .webp changes.
- Tested: `smoke.py`; `kit_test.py` full kits for boppy, deedee, amy, tom, tnb; battle lineups, low health and KO frames looked at; every battle frame of all five checked with hand, eye and mouth points drawn. Not played on the phone. Stamp `build heads1`.

## 2026-11-01 (day, 39): Load screen, save details inside each button (`loadsubs1`)

- Tom (01:38) asked to move the save information from above the buttons into each button and drop the extra text. Each AUTOSAVE / SLOT button now carries its own line (place, level, party size, coins, date). The text block above the buttons ("Autosave: ...", "Slot 1: ...") and the footer hint are gone. The "No saved games yet." message still shows when there are no saves.
- `titleAsk` (engine/splash.js) takes an optional `sub` per option and an optional footer `cue` ('' hides it); `loadMenu` (engine/intro.js) uses both. Other prompts are unchanged.
- Tested: Load screen with three saves in portrait and rotated landscape (screenshots looked at), `smoke.py`. Not played on the phone. Stamp `build loadsubs1` (it also includes the `newlist1` chapter list).

## 2026-11-01 (day, 38): Olivia can be recruited in Jefferson Park from chapter 6 (`olivia7`)

- Tom (01:32): Olivia is recruitable only from chapter 6 onward, in Jefferson Park. Talk to her at 2nd Ave (she is `cousin:true`) and she offers to join, with the yes/no prompt and the swap-out prompt when the party is full. Before chapter 6 (including the demo) she talks as before and never asks. She goes home when the party leaves Los Angeles, except from chapter 11 on, when she can travel (like Justin).
- `RECRUIT_TALK.olivia` (ask, yes, no, swap, bye, four follower lines) in `engine/followers.js`; rule in `canBeHere` (`engine/story.js`); `n.cousin` in `engine/overworld.js`; her NPC in `data/maps-la.js`. The new ask and follower lines are spoken by speech synthesis until baked.
- Tested with new `tools/recruit_olivia_test.py`: not offered in chapters 0 and 5, offered in 6, 7, 12, 13; joins, and a save then load keeps her; dialogue box shown with her portrait. Not played on the phone. Stamp `build olivia7`.

## 2026-11-01 (day, 38): NEW GAME opens one chapter list (`newlist1`)

- Tom (01:37) asked to drop the Start New step (PART 1 / PART 2 / BONUS). NEW GAME now goes straight to "Pick a chapter": CH 1 to CH 20, then BONUS (Nine Scoops), then BACK, in the same two-column scrolling list. BACK returns to the welcome panel with NEW GAME selected. The difficulty picker, chapter 11 clear-data rule and bonus start are unchanged; the difficulty screen's BACK returns to this list.
- Removed the `part1`, `part2` and `bonus` modes from `SPLASH_MODES` in `engine/splash.js` (nothing else used them). The Part labels are gone from the screen only; `PARTS` data is untouched.
- Tested: clicked NEW GAME in portrait and rotated landscape, 22 entries, looked at top and bottom of the list, BACK path, `smoke.py`. Not played on the phone. Tom's earlier "no change on live site" report for `welcome1` is still open: check the stamp after RELOAD. Stamp `build newlist1`.

## 2026-11-01 (day, 37): Shorter "Choose how to play" panel (`welcome1`)

- Tom (01:27) asked to shrink the welcome panel. Removed the footer line ("Tap one, or use the arrows and A / Enter") and the two subtitle lines under NEW GAME and LOAD, so each button is one line. Launch buttons use less padding (9 px instead of 12). The panel is now 112 px tall in portrait. The footer still appears for the RELOAD message and on the other screens.
- Call made: the saved-game count under LOAD went too (the LOAD screen itself lists the saves).
- Files: `engine/splash.js` (launch mode, `splashSetMode`, `splashReload`), `index.html` (launch CSS, splash.js tag `welcome1`). Tested: portrait and rotated landscape screenshots, `smoke.py`. Not played on the phone. Stamp `build welcome1`.

## 2026-11-01 (day, 36): Amy's portrait cropped tighter (`amyportrait1`)

## 2026-11-01 (day, 36): Olivia is a party member with all 11 moves (`olivia6`)

- Olivia (HP 12, MP 12, Quick Talker trait) is wired as a full member on Justin's pattern: `data/party.js` (member, `o_phone`, RECRUITS), `data/progress.js`, `engine/story.js`, `engine/followers.js`, `engine/overworld.js`, `engine/menu.js`, `engine/battle2-ui.js`, `data/battle2-data.js` (stats, 11 moves, two test fights), `data/abilities.js` (kit; slots B4, B5, B6 are empty placeholders).
- New `engine/olivia-moves.js`: all 11 moves as animated set pieces (Fact Check, SNACK BAG, LivNews Live, Inverted Pyramid, Double Under, Story Time, MICHAEL!, Better Than Bobby, Is This Real?, Marine Layer, LACHLAN, NO!), 1.6x slow like Justin's. Michael and Lachlan are never drawn.
- Her 31 new lines are in `data/lines.js` and `tools/bake-page/pending.json`; they use speech synthesis until Tom's next voice bake.
- Not yet reachable in the story: no recruiting spot yet. Tested: `kit_test.py olivia --speed2` (11 of 11 play, contact sheet checked), `smoke.py` for olivia and the default cast. Not played on the phone. Stamp `build olivia6`.

## 2026-11-01 (day, 37): Amy's portrait cropped tighter (`amyportrait1`)

- Tom (01:19) asked for Amy cropped in so she reads like the girls. `portraits/amy.png` is re-cut from the existing painting (about 108 of 128 px, face and hair filling the frame like Grace and Rose). The original large painting is not in the repo, so this is an upscale of the 128 px file and a little softer; a re-send of the original would give a sharper one.
- Amy's `?v=` in the `PORTRAITS` table (engine/menu.js) went to 12 and the menu.js tag to `amyportrait1`.
- Tested: side by side with Grace, Rose and Justin, `smoke.py`, character menu screenshot. Not played on the phone. Stamp `build amyportrait1`.

## 2026-11-01 (day, 34): Olivia's 11 ability sheets baked (`olivia5`)

- All 11 painted ability sheets are cut and loaded as sprite keys on `BATTLE_SPRITES.olivia` (59 frames, each with a mirrored `R` copy): `fc_` Fact Check, `sb_` SNACK BAG, `ln_` LivNews Live, `ip_` Inverted Pyramid, `du_` Double Under, `st_` Story Time, `mi_` MICHAEL!, `bb_` Better Than Bobby, `ir_` Is This Real?, `ml_` Marine Layer, `lk_` LACHLAN, NO!. Frame names follow `claude/olivia-ability-prompts.md` (for example `fc_jab`, `du_jump_a`, `mi_yell_2`).
- `tools/sprite-bake/bake_olivia_battle.py` now cuts every sheet by blob position (rows assigned by vertical centre), scales each sheet by face height so her head never changes size between moves, and keeps jump and sprint heights (`du_jump_b`, `lk_sprint` sit above the ground line). New art: `art/chars/olivia-<sheet>.webp` (lossy), `data/olivia-battle-hires.js` (OLIVIA_BT.sets), and `data/olivia-battle-use.js` builds the keys. `AV` and the `?v=` tags are `olivia5`.
- She is still not a party member, so nothing changes in play. Not played on the phone. The build stamp now reads `build olivia5` (it includes the `tomportrait1` portrait).

## 2026-11-01 (day, 35): Tom's painted portrait (`tomportrait1`)

- Tom (01:14) sent a new oil-painting portrait of himself. `portraits/tom.png` is now that painting, cropped square to match Justin, Amy and Boppy: hair near the top edge, chin about 90% down, shoulders showing (replaces the old cut-out with a transparent background).
- Every portrait spot (dialogue box, battle UI, character menu) reads the one `PORTRAITS` table in `engine/menu.js`; Tom's `?v=` went to 15 and the menu.js tag to `tomportrait1`.
- Tested: side by side against the others, `smoke.py`, headless dialogue and menu screenshots. Not played on the phone. Stamp `build tomportrait1`.

## 2026-11-01 (day, 34): Olivia's painted battle stances (`olivia4`)

- Tom's 4 x 4 battle sheet (fruit dress) is baked and loaded: `tools/sprite-bake/bake_olivia_battle.py` writes `art/chars/olivia-battle.webp`, `olivia-ko.webp` and `data/olivia-battle-hires.js` (OLIVIA_BT). `data/olivia-battle-use.js` (modelled on Justin's) builds `BATTLE_SPRITES.olivia` and `KO_SPRITES.olivia`; script tags sit after the Justin lines in `index.html` (`?v=olivia4`, AV in the bake script matches).
- Slots: idleA idle, idleB idle2, swing act, wind windup, cheerA celeb, cheerB leap, hurt hurtPose, guard defend, spread castPose, low kneel (black eye is painted in), walkA/B run, plus hip and sig, ko as the knocked-out pose. Drawn about 120 px tall (`BATTLE_SIZE.olivia` .62): a touch under Tom, level with Amy.
- She is NOT a party member yet, so nothing changes in play. Still to do: party data, her 11 moves (all ability sheets are already in the repo), recruiting, lines.
- Tested: `smoke.py`; new `tools/olivia_battle_test.py` borrows her art into Grace's slot and shoots idle, low health, KO and landscape; frames looked at. Not played on the phone. Stamp `build olivia4`.

## 2026-11-01 (day, 34): Tom's extra poses and arrival stretch in the new painted style (`tomposes1`)

- Tom (00:58): sent nine 5-frame pose sheets (45 poses) after the standard sheets; installed all at once so the standard Tom and his extras match.
- Sources `tools/sprite-bake/src/tom-xposes-1-v1.png` to `tom-xposes-9-v1.png`; `tools/sprite-bake/bake_tom.py` now cuts them (old `tom-poses-v1/v2` and `tom-stretch-v1` are no longer used). Extras are scaled at 0.476 of the battle sheet scale (upright 632 px figure matches the battle sheet's 292 px upright frame).
- The 24 existing custom poses and the 8 arrival stretch frames are replaced in place, so Press Start, Starter Splash, Popcorn Jump and the cab-line stretch use the new art with no code change.
- 13 new poses are baked and loaded but not wired to a move yet: finger, headphones, mask, shade, floorsit, lying, cartwheel, facedown, rope, stirrup, strain, toast, plates (`f:'<name>'` in a move's keys). Painted but still unwired from before: lift, fling, unbox, flick, brush, limit, startled, direct, bowlthrow, frozen.
- Known: the sneaker swoosh shows (carried from the reference); the shade pose has an airplane window painted beside him; the arrival stretch frames are three-quarter, not fully front. Rose-on-shoulders art is still the old Tom.
- Tested: `smoke.py`, `kit_test.py tom` (button_mash, starter_splash), `tombo_test.py tnb1`; frames looked at. Not played on the phone. Stamp `build tomposes1`.

## 2026-11-01 (day, 34): Olivia's battle sheet saved for install (`olivia4src`)

- Tom (00:35): sent Olivia's 4 x 4 standard battle sheet in the fruit-print dress. Saved as `tools/sprite-bake/src/olivia-battle-v1.png` (source art only). No game code or sprites changed yet, so no `?v=` bump or new stamp. The ability prompts (outline plus 11 prompts) went to Tom as a zip and are in the Project doc claude/olivia-ability-prompts.md.

## 2026-11-01 (day, 34): Chapter title cards show the chapter's own starting area (`cardbg1`)

- Tom (00:31): the chapter title card always showed Long Island Square behind it; it should show the area where that chapter starts.
- Cause: the opening card played before the party was moved, so it drew whatever map was loaded. Now `cardBackdrop(n)` (`engine/story.js`) switches to the chapter's start first: LA chapters 2, 4, 6, 8 show Angel City Boulevard at the cab stand; home chapters 3, 5, 7, 9 show the Square at the taxi depot; chapters 11 and up use their `start` map; chapter 13 shows the cab stand. Chapters 1 and 10, and any card already on its start map, are left alone. "Chapter complete" cards are unchanged.
- Tested: chapter jumps 2 to 9 (map and screenshot), portrait and landscape; `smoke.py`. Not played on the phone. Stamp `build cardbg1`.

## 2026-11-01 (day, 33): Olivia's dress is the fruit-print dress (`olivia3`)

- Tom (00:25): use the fruit-print dress instead of the Halloween one. New hero pose and new 3 x 3 walk sheet (cream dress printed with cherries, apples, grapes, strawberries and lemons, bell sleeves, tiered skirt, brown flats with a gold medallion), saved as `tools/sprite-bake/src/olivia-hero-v1.png` and `olivia-walk-v1.png`.
- Re-baked with `bake_olivia.py`: walk sprite (`art/chars/olivia-ow.webp`, `data/olivia-hires.js`) and menu portrait (`portraits/olivia.png`, cut from the new hero). `AV` and the `?v=` tags are now `olivia3`; frame size and 42-row height unchanged. Replaces the Halloween dress from `olivia2`.
- Tested: `smoke.py`, plus a 2nd Ave screenshot. Not played on the phone. Stamp `build olivia3`.

## 2026-11-01 (day, 32): New painted Tom in a graphic tee, jeans and sneakers (`tompaint1`)

- Tom: new character art for Tom (from his photos: navy controller-and-heart tee, charcoal jeans, white sneakers) overrides the existing art for the matching poses, including the welcome screen, the overworld and battle.
- Sources: `tools/sprite-bake/src/tom-battle-v3.png` (4 x 4), `tom-walk-v3.png` (3 x 3), `tom-hero-v3.png`. `tools/sprite-bake/bake_tom.py` maps the new battle poses onto the old slots: idle A to idle, wind-up to windup, swing to strike, walk A and B to run, cheer B to leap, hurt, low health to kneel, KO, cheer A to celebrate, DEFEND signature to defend, ACT to cast. Walk sheet gives down, up and side frames. Menu portrait is cut from the hero pose (`portraits/tom.png`).
- Welcome screen: the old Tom-carrying-Rose art has no new equivalent, so Tom stands in his new outfit and Rose stands beside him (`TITLE_TOM_RIDE=false` in `engine/splash.js`; set true for the old ride art).
- Outfit recolour (`NAVY` tint in `data/tom-hires-use.js`) now finds the navy tee, so equipped outfit colours still tint his shirt and nothing else.
- Not replaced (no matching new pose, still the old black-tee art): the 24 custom move poses (`tom-poses.webp`), the arrival stretch, and every sprite where Rose rides on Tom's shoulders (`OW.tomRide`, data/tomride-use.js). Head is the sheet's own size (about 0.3 of height, the old Tom was 0.445).
- Tested: `smoke.py` (default and IDS=tom), `kit_test.py tom --speed2` (all 14 moves, no fails); title, overworld and battle screenshots viewed. The sandbox cannot reach github.io, so the live URL was not checked. Stamp `build tompaint1`.

## 2026-11-01 (day, 32): Amy's house gets the 3D treatment (`amyhouse3d`)

- Tom: do the 3D effect to all of Amy's house too. Same method as Tom's house (feet must land on bare floor), plus depth cutouts.
- Walk map: the aisle behind the kitchen island (row 3, x9 to x14) is now open and reached up the east side (x14, rows 3 to 5). The island footprint is now 4 wide `[10,4,4,1]`. Fact: a complete ring around Amy's island is not possible, because a wall block closes its west end. It walks as a U (north aisle, east side, south side).
- 3D: `art/amyhouse-fg.webp` (new, `tools/make_amyhouse_fg.py`) cuts out the island top, the three north dining chair backs and the living room sofa. `PLATE_BEHIND.amyhouse` in `engine/plate.js` draws them over anyone standing behind, so legs are hidden.
- Tested: `tools/amyhouse_walk_test.py` (new), `amy_scenes_test`, `justin_test`, `reach_test amyhouse` (0 cut off), `smoke` all pass; portrait and landscape screenshots viewed. `recruit_justin_test` fails with a null menu error, the same on the untouched tree (existing, not from this change). Not played on the phone. Stamp `build amyhouse3d`.
## 2026-11-01 (day, 32): Hearts redrawn in the painted style (`hearts1`)

- Tom (23:48): the hearts for kisses, hugs and so on must match the new painted look. There is now one shared painted heart (`paintHeart` in `engine/town-render.js`): soft warm glow, lit gradient (lighter top left, deeper bottom right), dark-rose edge instead of black, rim light, glossy highlight. It is built from whatever colour the caller passes, so the old pink, rose and gold variants all keep their tint.
- Overworld: the TNB kiss, the girls' hug, story-scene hearts and the title hearts use it (`drawHeart`). Hearts pulse smoothly instead of snapping between two sizes, and the hug hearts now start above Tom's head instead of on his face.
- Battle: every move file's own heart helper (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Nara, the Pottery Lesson set piece) now calls the painter, as do the Heart effect over calmed foes, the smitten and hug text hearts (`<3`) and Deedee's heart outline and heartbeat (dark rose edge, light inner line). The old pixel heart bitmap in `battle2-ui.js` is gone.
- Not changed: the pixel heart in the old canvas title logo (not shown with the painted welcome art).
- Tested: kiss, hug and a size ladder in screenshots; battle heart moves played for every character with no errors; `smoke.py`. Not played on the phone. Stamp `build hearts1`.

## 2026-10-31 (day, 31): Olivia walks in the Halloween dress (`olivia2`)

- Tom (23:49): the old Olivia was showing; she should wear the Halloween dress. Her walk sprite was the blouse and olive trousers from the first sheet, only her menu portrait had the dress.
- New 3 x 3 painted walk sheet in the dress (cream print of pumpkins, ghosts, bats and webs, bell sleeves, tiered skirt, brown flats) saved as `tools/sprite-bake/src/olivia-walk-v1.png` and re-baked with `bake_olivia.py` (`AV` and the `?v=` tags are now `olivia2`). Frame size and standing height (42 rows) unchanged. The portrait is unchanged (it was already the dress).
- Tested: `smoke.py`, plus a 2nd Ave screenshot of her in the dress. Not played on the phone. Stamp `build olivia2`.

## 2026-10-31 (day, 30): Menu button beside Save, A button in the D-pad center (`ctl1`)

- Tom (23:46): make the Menu button the same size as the Save button and put it to the left of Save; move the A button to the center of the D-pad.
- Menu is now in the top bar, left of Save, same size and look (38 px portrait, 34 px landscape, 8 px gap). The two sit together in a new `#hud-btns` group in index.html. The `menu-button` id is unchanged, so touch, click, the `M` key and the stamp badge dot still work. The bottom-left MENU button and its label are gone.
- A now sits on the center cell of the D-pad (46 px portrait, 38 px landscape, the size of one D-pad cell). The INTERACT / CONTINUE caption under it is hidden to avoid covering the down arrow (the text still updates, it is just not shown). Tune the placement in the CSS block headed "Menu button sits in the top bar" near the end of index.html.
- Tested: `smoke.py` pass; portrait (390 x 844) and landscape (844 x 390) screenshots, button boxes measured (Menu = Save size, A centered on the D-pad to the pixel). Not played on the phone. Stamp `build ctl1`.

## 2026-10-31 (day, 29): Tom's house is walkable all the way round, with depth behind the kitchen island (`tomhouse3d`)

- Tom (23:34): apply a 3D effect through his home so he can walk the narrow spaces between the furniture, starting with a complete path around the kitchen island. The old walk map only had one corridor down the middle, so the island, the dining table and the wet bar front were all unreachable.
- Walk map rebuilt from the painting: a tile is walkable when Tom's feet (tile centre, tile bottom) land on bare floor. New: the aisle between the counters and the island (row 3, which also runs along the front of the wet bar), the whole island ring `(8,3) (9..11,3) (12,3) (12,4) (12,5) (9..11,5) (8,5) (8,4)`, both ends of the dining table `(3,4) (5,4)`, and the south side of the table (row 8, x3 to x7). Footprints fixed to match the painted furniture: island `[9,4,3,1]`, dining table `[3,5,3,3]` plus the head chair `[4,4]`, wet bar `[3,1,4,2]`. The sofa, coffee table, armchairs, lamp, TV wall and the plant by the sofa still block, because the painting leaves no floor there.
- The 3D part: `art/tomhouse-fg.webp` (new, `tools/make_tomhouse_fg.py`) is a cutout of only the island countertop, sink, faucet, limes and flowers. `PLATE_BEHIND.tomhouse` in `engine/plate.js` draws it over anyone standing on row 3, so the countertop hides their legs and they read as standing behind the island, not on top of it. Followers get the same treatment. Bready Mercury's jar is redrawn on top (`drawHomeJar`) so it never vanishes behind Tom.
- Scenes unchanged: ch2Starter and ch6Kitchen still put Tom at (8,5) and TNB at (7,5), both walkable.
- Tested: new `tools/tomhouse_walk_test.py` (ring is a closed loop, every walkable tile reachable, real key presses clockwise and counter-clockwise, A works on the island from all four sides, screenshots `tools/shots/tomhouse-3d-*.png` portrait and landscape looked at), `tomhouse_test.py`, `smoke.py` pass. Not played on the phone. Stamp `build tomhouse3d`.

## 2026-10-31 (day, 28): Faster walking inside houses (`indoor1`)

- Tom (22:16): increase walking speed inside houses. Indoor steps are now 1.3x the base step time (was 1.6x): 0.182 s per step instead of 0.224 s, about 23% faster. Outdoors is unchanged (1.15x). Followers use the same value, so the party stays in lockstep. Tune `INDOOR_STEP_X` beside `indoorSlow()` in engine/battle-draw.js.
- Tested: `smoke.py` pass. Not played on the phone. Stamp `build indoor1`.

## 2026-10-31 (day, 27): Olivia walks the town in painted art (`olivia1`)

- Tom (18:29): sent Olivia's hero pose (the caricature in the Halloween dress, `tools/sprite-bake/src/olivia-hero-v1.png`, already on file) and asked to get her walking around the town. Her 3 x 3 painted walk sheet (`src/olivia-walk-v1.png`, white blouse and olive trousers) was on file but never baked; it is baked now.
- New `tools/sprite-bake/bake_olivia.py` (townsfolk recipe, 42-row standing height like Amy, no head enlargement) writes `art/chars/olivia-ow.webp`, `data/olivia-hires.js` and `portraits/olivia.png` (128 x 128 head of the hero pose). New `data/olivia-hires-use.js` replaces `OW.olivia` (the 2nd Ave Olivia uses `sheet:'olivia'`, so no map edit). Both scripts load after `data/justin-hires-use.js`.
- Her walk sheet shows the blouse outfit, the hero shows the dress: when Tom re-runs the walk prompt with this hero attached, drop the new sheet over `src/olivia-walk-v1.png` and re-run the bake. Spec and the three standard prompts: Project docs `claude/olivia-character-spec.md`, `claude/olivia-*-prompt.txt`. No battle art, moves, lines or party entry yet.
- Tested: 2nd Ave screenshot in portrait and landscape (chapter 7), `smoke.py` pass. Stamp `build olivia1`.

## 2026-10-31 (day, 26): Justin's trimmed moves slowed down, Bad Call watches first (`jtrim2`)

- Tom (18:16): after the trim the moves played too fast, key frames most of all. The Justin speed wrapper at the bottom of `engine/justin-moves.js` now stretches the timeline by 1.6 (was 0.66; Giant Sneeze and Foot Tap, which were unscaled, now stretch 1.4). Moves run about 5 to 7 s including the turn wrap-up (kit_test timings), with the same poses.
- Scene lengths that span the move were stretched to match: Demo Day wall, DRYWALL sheet, Breaker Flip dark screen, Bad Call couch and TV, flying wire nuts. Short bursts (sparks, rings, text) keep their length.
- Tom (18:18): Bad Call now has him seated on the couch watching the game for about 2.5 s, then leaning in (bc_lean added, 6 poses), before he rises and gets frustrated. The yellow flag on the TV shows when he starts to rise.
- Tested: `kit_test.py justin` all nine moves, contact sheets looked at for Bad Call, Demo Day, DRYWALL, Breaker Flip (props last the whole move), `IDS=justin smoke.py` and `smoke.py`. Not played on the phone. Stamp `build jtrim2`.

## 2026-10-31 (day, 25): Voice Library labels every ability and combo clip with its move (`vlmove1`)

- Tom (18:00): clips for an ability or a combo now say which one they belong to, on the row itself. A green chip reads the move type and name (BASIC MOVE, ABILITY, SIGNATURE, ULTIMATE, REMIX ABILITY: Press Start, Sourdough Snob, DEFEND, Boarding Group Zero). A pink chip does the same for combos with who is in it (TOMBO 2: Uncle Spotter Toss (Tom + Grace), DIRECTOR'S CUT, TOMBO 1: Smash That Like Button, FAMILY FINISH: The Extra Place). Hurt, low, KO and win lines keep their plain tag.
- 346 battle lines carry a label. Names come from `data/abilities.js` and `data/battle2-data.js`, so a rename shows up on the next index rebuild. Older spoken keys (controller_tap, crumb_shot, closing_time and so on) take the name of the slot they were written for. Search also finds a clip by its move name.
- Files: `tools/voice-library/make-index.js` (new `mv` field), `voices.html` (chips, search), `data/voice-index.json` rebuilt. Game code untouched; no `?v=` or stamp change.

## 2026-10-31 (day, 24): standing recipe for new characters and ability pose sheets (docs only)

- Tom (17:56): he was rewriting the image prompt every time. `docs/CHARACTER_PIPELINE.md` now holds it: spec from a photo, the three standard sheets (one large hero pose, 3 x 3 walk, 4 x 4 battle), the ability poses rule (4 to 7 poses, keep critical frames, about 2 lines), prompt templates and the install steps. Standing rule added to CLAUDE.md. No game code changed, no stamp change.

## 2026-10-31 (day, 23): Justin's nine abilities trimmed to 4 to 7 poses each (`jtrim1`)

- Tom (17:25, approved): Justin's abilities had far more frames than the other characters, with long prep and aftermath. Cut each move to its critical poses and held them longer.
- Kept poses: Loose Wire 3 (pull, jab, zap), Wire Nuts 5, Bad Call 5, Fresh Fit 6 (swap and reveal kept), Demo Day 6, Breaker Flip 5, Giant Sneeze 5 (long sneeze hold kept), Foot Tap 5 (long scream hold kept), DRYWALL 4 plus the carry walk.
- Effects, hit markers, scenes and the tapper (Rose or Grace) were retimed to the new poses. Moves now run about 2 to 3 s at normal speed after the scale wrapper (was 5 to 6 s).
- Spoken lines: each move now says 2 lines (one fewer in Loose Wire, Wire Nuts, Demo Day and others). Line text unchanged, so no re-bake; the dropped lines are simply not triggered.
- Tested: `kit_test.py justin` all nine moves (lines, damage, statuses, no errors), contact sheet looked at, `IDS=justin smoke.py` and `smoke.py` no fails. Not played on the phone. Stamp `build jtrim1`.

## 2026-10-31 (day, 22): Fresh Fit is now an outfit change into a green suit (`ffsuit1`)

- Tom (16:58): the redo sheet for Fresh Fit came back (`tools/sprite-bake/src/justin-freshfit-v1.png`, replaced in place; the old sheet is in git history). Frames 1 to 5 are everyday clothes, 6 is the blurred swap spin, 7 to 16 are the emerald green suit with red and green trouser stripes, cream bow shirt, gold buckle loafers and round gold sunglasses.
- Baked with `bake_justin_battle.py` (frame keys renamed to match the new content: ff_snap, ff_swap, ff_reveal, ff_shadesOn, ff_hip, ff_bow, ff_shrug replace ff_sleeve, ff_shades, ff_poseA to D, ff_wink).
- `J.fresh_fit` (engine/justin-moves.js) rewired: runway walk, stop, collar flick, snap, then the swap with a gold flash, poof and sparks (game fx), reveal with green sparks, shades and poses, shades off for the dazzle hit, wink strut home. Total 6.5 s (was 5.8 s). Message lines: "Quick change." and "Fresh fit." added.
- Spoken lines are unchanged on purpose so the baked clips still play. "This shirt cost more than your pond." now plays while he wears the suit (he still has a silk shirt under it); changing it to "suit" would need a re-bake.
- Tested: `kit_test.py justin` all nine moves, frames recorded in the page across the whole move and looked at (casual frames, swap flash, suit poses, dazzle, strut), `IDS=justin smoke.py` and `smoke.py` no fails. Not played on the phone. Stamp `build ffsuit1`.

## 2026-10-31 (day, 21): Loose Wire keeps its distance and zaps for real (`lwire1`)

- Tom (16:43): Justin gets too close to the enemy when applying the loose wire, and the electric effect should be much bigger.
- Distance: he now stops 84 px from the foe's edge (was 36), so there is a clear gap between him and the foe at the jab.
- Electric effect: a forked lightning arc (`jv_arc`, wide blue glow, white core, two yellow forks, redrawn jagged every frame) now travels from the copper in his hand to the foe, a second arc follows 130 ms later, plus a short white-blue screen flash (`jv_flash`), a blue spark burst and a bigger impact ring on the foe, and shock crackle arcs around Justin when it bites him back (`jv_crackle`, with the existing ZZT).
- Naming note: `jv_bolt` already belongs to the vertical sky bolt later in `engine/justin-moves.js`, so the new arc is `jv_arc`.
- Tested: frame burst captured inside the page across the strike and looked at (arc, flash, ring and crackle all visible), `kit_test.py justin` for all nine moves, `IDS=justin smoke.py` no fails. Not played on the phone. Stamp `build lwire1`.

## 2026-10-31 (day, 20): Justin's redo props: wall, standing drywall sheet, debris (`jprops2`)

- Tom (16:35): the redo sheet came back (`tools/sprite-bake/src/props/justin-sheet2.png`), all 5 cells matched: basement wall, standing drywall sheet with four screws, drywall chunk, splintered stud, dust puff. Baked to `art/props/justin/`.
- Wired in `engine/justin-moves.js`: Demo Day now shows the painted wall (the cracks are still drawn over it), mixed painted debris (drywall chunk, plaster chunk, splintered stud) and a painted dust puff on each hit (`jv_dust`). DRYWALL stands the painted sheet with its screws in front of the party (the drawn sheet and drawn screws are only the fallback). Drawn versions stay as fallbacks.
- Not used yet: basketball TV, TV off, cord, drill, bucket, ladder, leaning drywall, drywall square (all baked).
- Tested: `kit_test.py justin` for demo_day and drywall (`PAINTED_PROPS` shows the wall, dust, three debris pieces and the sheet drawn), frames looked at (no doubled sheet), `IDS=justin smoke.py` and `smoke.py` no fails. Not played on the phone. Stamp `build jprops2`.

## 2026-10-31 (day, 19): Justin's first painted props: couch, wide TV, wire nuts (`jprops1`)

- Tom (16:09): Bad Call needs a wide TV with sports on it, and a prompt for all of Justin's props. The sheet came back (`tools/sprite-bake/src/props/justin-sheet1.png`). Cells 1 to 6 (couch, five wire nuts) and 15 (football TV) matched the list. Cells 7 to 14 and 16 did not: the generator drew an extension cord, a drill, a leaning drywall sheet, a joint compound bucket, a stepladder, a drywall square, a TV that is off, a basketball TV and a plaster chunk. All 16 are baked to `art/props/justin/` (`props.json` names what is really drawn). The redo prompt is the Project doc `claude/justin-props-redo-prompt.txt` (5 cells: basement wall, standing drywall sheet, drywall chunk, splintered stud, dust puff).
- Wired: Bad Call now has the painted couch behind him and the wide football TV beside the party (back-layer scenes `jv_couch`, `jv_tv`); the TV swaps to a yellow flag on the field the moment he reacts (the flag is drawn in code over the painted screen). Wire Nuts throws painted cone wire nuts in five colors (were hexagons). Demo Day debris is the painted plaster chunk. Drawn versions stay as fallbacks.
- DRYWALL: the drawn sheet no longer swings in. His painted frames already carry and stand a sheet, so two sheets were on screen for about half a second.
- Baked but not used yet: basketball TV, TV off, cord, drill, bucket, ladder, leaning drywall, drywall square. Still drawn in code: the Demo Day wall (cracks stay code, it needs the redo sheet's wall) and the standing DRYWALL sheet.
- Tested: `kit_test.py justin` for bad_call, wire_nuts, demo_day, drywall (`PAINTED_PROPS` shows the couch, TV, nuts and chunk drawn), `IDS=justin smoke.py`, frames looked at (football state, flag state, couch fully on screen). Not played on the phone. Stamp `build jprops1`.

## 2026-10-31 (day, 18): Battle Lab has infinite VP and HEART (`infinite1`)

- Tom (16:06): in battle test there should be infinite hearts and MP. Every Battle Lab fight (`cfg.infinite`, set in `b2Lab`) now keeps every party member's VP at 10 and the HEART meter at 100: refilled at the start of each turn and right after a move is paid for (`b2Infinite` in engine/battle2.js). Tombos and every skill can be fired every turn. Real story fights are unchanged. HP is not infinite (not asked).
- Tested: lab fight with Tom, Grace, Rose, Justin starts full, a drained meter refills, `python3 tools/smoke.py` no fails.

## 2026-10-31 (day, 17): Battle Lab JUSTIN SOLO, Justin alone (`jsolo1`)

- Tom (15:44): make a battle test with only Justin in it, no other characters. Battle Lab now has JUSTIN SOLO as the first entry (party: Justin only, level 12, every move unlocked, vs Old Iron-Gill). The old JUSTIN'S TRYOUT with Tom, Grace, Rose and Justin is the second entry.
- Foot Tap with no partner in the party no longer says Rose taps his toe; it says nobody is near and something taps it. With a partner, nothing changes.
- Tested: new lab fight in portrait and landscape (screenshots in `tools/shots/justin-solo-*.png`), Foot Tap and DRYWALL fired solo, `PARTY=justin kit_test.py justin --speed2` (all nine moves, no fails), `IDS=justin smoke.py`. Not played on the phone. Stamp `build jsolo1`.

## 2026-10-31 (day, 16): RECAST JUSTIN lives in ADMIN (`recast1`)

- Tom (15:32): the recast page should be in the admin section. `recast-justin.html` is now in the repo (built by `node tools/voice-recast/build-justin.js`, no argument) and title screen > ADMIN > RECAST JUSTIN opens it inside the app. It shares the ElevenLabs key with the bake page and the Voice Library (`aot-el-key`), the export goes out through the phone share sheet as `recast.json`, and a Game button goes back. Works on a phone-width screen (one column).
- Rebuild the page after any change to Justin's lines or scripts: `node tools/voice-recast/build-justin.js`, commit it.

## 2026-10-31 (day, 15): Justin recast page (deeper, thick New York accent, a direction per line)

- Tom (14:56): no accent in the justinv1 takes, dialogue directions all "natural", voice should be deeper. Fact: the accent and pitch come from the ElevenLabs voice itself; the AoT Justin voice was designed with a "slight country twang", so a bracket tag cannot add a Long Island accent to it. Decision: recast.
- `tools/voice-recast/build-justin.js` builds `justin-recast.html` from the live repo (same page as the Deedee and Ellie recast): voice description asks for a deep chest voice and a thick Nassau County accent (dropped Rs, aw vowels, no twang), every one of his 75 lines (48 battle, 23 dialogue, 4 recruit) has its own hand-written direction, and the page puts the accent into every bracket. The old voice is not deleted (Kenji shares it). Merge the export with `node tools/voice-recast/merge-voice.js recast.json data out1 justin` (FAM now includes justin).
- The 27 dialogue directions also went into the Voice Library (`tools/voice-library/scripts/justin-dialogue.json`, index rebuilt), so his dialogue rows no longer read "natural, conversational".

## 2026-10-31 (day, 14): Justin's voice is in the game (`justinv1`)

- Tom (14:25) sent `local-clips-export_4.json` (139 clips). 68 were already in the repo (the clips1 and amyv1 takes, re-encoded, so skipped). The 71 new ones are all Justin, made in the Voice Library at 14:24 with the thick New York accent scripts: 48 battle lines into the new `data/voice/justin.js` (every kit beat, join, greet, hurt, low, ko, win; `basic` and `loose_wire` each keep their clip) and his 23 dialogue lines into `data/voice/dialog-ch28.js` (silence trimmed, mono 32 kHz 48 kbps; loaded last, so these accented takes win over the old chapter 1 ones). Voice settings for `battle|justin` (AoT Justin, direction thick New York accent, scripts) are in `data/voice-clips.js`.
- `index.html` loads `data/voice/justin.js` after tnb.js; `tools/battle-baker/merge.js` and `tools/bake-page/make-list.js` know him as a battle voice. Bake list down to 8 (the recruit talk, OUCH, the two taps, kid Amy). Voice Library rebuilt: 70 of his 71 lines show a built-in clip.
- Tags `?v=justinv1` on voice-clips.js, voice/justin.js, dialog-ch28.js (dialog-cast files), main.js; stamp `build justinv1`.
## 2026-10-31 (day, 14): Justin's starting stance is Tom's new painting (`jstance1`)

- Tom (14:18) sent one painting of Justin in his fighting stance (fists up, tool belt, big grin) and asked for it to be his battle starting stance with the head enlarged to match the other frames. It is now his idle in battle. His second idle frame is the same painting 2% shorter, so he still breathes.
- How: `tools/sprite-bake/src/justin-idle-v1.png` (the painting, magenta background) is read by `bake_justin_battle.py`, which scales the body to the other frames and grows the head from the chin until the face width matches theirs (head enlarge 1.16 on this painting, because its caricature head was already bigger than the old sources). The scale of every other frame stays tied to the old idle, so nothing else changed size. When the full Battle Stances sheet (`justin-battle-v1.png`) arrives it takes over idle again.
- Still borrowed from move sheets: hurt, kneel, KO, win and run poses (Tom has not sent those). The painted atlas paths now carry `?v=jstance1`.
- Tested: `kit_test.py justin --speed2` (all nine moves, no fails, contact sheet looked at), `IDS=justin smoke.py`, side-by-side of old and new idle. Not played on the phone. Stamp `build jstance1`.

## 2026-10-31 (day, 13): Foot Tap: the spread-arms scream frame is the long one, with OUCH (`justin4`)

- Tom (14:21): frame 7 of the Foot Tap sheet (ft_screamA, arms spread, red face) is now held 1.1 s, the longest frame in the move, and the hit lands on it with a new line foot_tap_ouch "OUCH!!!!!!" (script tagged thick New York accent). "MY FOOT! WHO TOUCHED MY FOOT?!" follows on the next scream frames. Move ends at 6.15 s. Bake list 55, Voice Library rebuilt.

## 2026-10-31 (day, 12): Justin speaks on the beat, Voice Library and Bake page carry his lines (`justin3`)

- Every Justin move now has a setup line, the main line on the key frame, and a payoff line (`<move>_<beat>` keys in `data/lines.js`; timings in `engine/justin-moves.js`, placed on the faster justin2 timeline). Rose or Grace says "Tap." in Foot Tap. 50 Justin battle lines plus the two taps have emotive scripts in `tools/bake-page/pending.json`; every Justin script (battle and dialogue) is tagged thick New York accent (Tom, 14:04).
- Voice Library and Bake page: Justin had no battle voice in `VOICE_CLIPS.voices`, so `make-index.js` and `make-list.js` skipped or crashed on his battle lines. Both now fall back to his dialogue voice (AoT Justin) with the accent direction; `make-index.js` also reads scripts from pending.json for unbaked lines. `data/voice-index.json` (70 Justin lines) and `data/bake-list.json` (54) rebuilt.
- Text changes to unbaked lines: breaker_flip split into "Breaker's off." and breaker_flip_on "Breaker's... on."; giant_sneeze split into giant_sneeze_build "Ah... ah... ah..." and "AH CHOOOOO!"; drywall split into "Drywall's up." and drywall_dry "Let it dry."

## 2026-10-31 (day, 13): Justin's head is a bit bigger in battle (`jhead1`)

- Tom (14:01): in battle Justin's head a bit bigger, body unchanged. The head enlargement in `tools/sprite-bake/bake_justin_battle.py` went from 45% to 60% (`HEAD_K` 1.45 to 1.60), grown from the chin so the neck, shoulders and body stay the same size. All frames re-baked (stances and the nine move sheets). His idle figure is now 95 rows instead of 90, all of it head.
- The painted atlas paths now carry `?v=jhead1`, so a phone cannot show the old picture with the new frame sizes.
- Tested: `kit_test.py justin --speed2` (all nine moves, no fails, contact sheet and a battle frame looked at), `IDS=justin smoke.py`. Not played on the phone. Stamp `build jhead1`.

## 2026-10-31 (day, 12): Justin has his painted portrait (`jportrait1`)

- Tom (13:59) sent Justin's oil-painting portrait. `portraits/justin.png` is now that painting, cropped square around the head so the face fills the frame like Tom, Amy and Boppy (replaces the cartoon placeholder).
- Every place that shows a portrait reads the one `PORTRAITS` table in `engine/menu.js` (dialogue box, battle UI, character menu), so all of them pick it up; its `?v=` went to 2.
- Tested: side-by-side against Tom, Amy and Boppy, and a headless menu and dialogue check. Not played on the phone. Stamp `build jportrait1`.

## 2026-10-31 (day, 11): Rose's Boo!! faces the monster when she pops out (`roseboo1`)

- Tom (13:49): when Rose reappears behind the monster in Boo!!, she faced left (away from it). She now faces right, toward it, through the kneel, the BOO pose and the little celebration hop.
- How: her painted frames all face left, so `data/rose-hires-use.js` now also makes right-facing `kneelFlip` and `booFlip` (mirrors, same way `flip` and `celebFlip` already work), and the Boo!! keyframes in `engine/rose-moves.js` use them (with `celebFlip`) only while she is behind the monster. Her start and return to her own spot still face left, as before.
- Tested: `kit_test.py rose --only=boo --speed2` (contact sheet looked at, she faces the monster), `IDS=grace,rose smoke.py`. Not played on the phone. Stamp `build roseboo1`.

## 2026-10-31 (day, 10): Amy's 36 re-recorded battle clips are merged (`amyv1`)

- Tom (13:39) sent `local-clips-export_3.json` (68 clips). 28 were already in the repo (the `clips1` dialogue and battle takes and the 4 Ymamot clips) and were skipped. The 40 Amy battle entries are 36 new takes made in the Voice Library between 13:18 and 13:39 (burpee, redpen and pep aliases share one take each), all with "heavy Long Island accent" directions. Merged with `tools/battle-baker/merge.js` into `data/voice/amy.js`; her bake scripts went into the voice settings (`data/voice-clips.js`). Her greet, join, quiz and praise clips are unchanged (not in the export).
- Five of the new takes say different words from the old on-screen line, so `data/lines.js` now shows what Amy says: hills "Up the hill, down the hill!" (was slime), marathon "Straight through the finish line!" (was slime), marathon_ult "Twenty-six point two miles complete! Sprint to the finish!" (was Right on Hereford, left on Boylston), hurt "Ow! Okay. I'm okay." (Deep breath dropped), tombo2 "Ketchup, pickles, chocolate. It's a Ymamot Creation!" (was cereal, one sock). The five old clips were removed. Every Amy line has a clip.
- Voice Library index rebuilt (`battle-scripts.json`, `harvest.json`, `data/voice-index.json`). `pending.json` unchanged (grace.ymamot still waiting).
- Tags `?v=amyv1` on lines.js, voice-clips.js, voice/amy.js, main.js; stamp `build amyv1`.

## 2026-10-31 (day, 9): Voice Library loads the directions the baked clips were made with (`vlib5`)

- Tom (13:24): most dialogue boxes lacked the emotive [annotations] the baked clips used; he wants to bulk-remake with them. New gold button on the key card, "Load the directions used for the baked clips": reads his ElevenLabs history (text only), matches each request to a line by voice and words (contraction and number tolerant), and puts that script in the line's box, rebuilt on the line's current words (tags and CAPS kept, old wording never). His own edits still win. Then Select all shown and Regenerate remakes them with those directions.
- Why this way: the hand-written dialogue scripts live in 17 large Project docs; copying them through Claude would take several sessions. History holds the exact script of every clip, including the 2026-10-27/28 re-bakes.
- Tested: `tools/voice-library/test.py` with a mocked history (an uncontracted old script lands on the contracted line with its tags; words match the screen). Not run against the real account (the key lives on Tom's phone). Stamp `build vlib5`.

## 2026-10-31 (day, 11): Justin is 10% taller than Tom, head the size of Tom's (`justin3`)

- Tom (13:45): Justin must be 10% taller than Tom and his head the same size as Tom's. His idle figure is now 142 px against Tom's 129 (+10%). His painted head was about 70% of Tom's, so the bake (`bigger_head` in `tools/sprite-bake/bake_justin_battle.py`) enlarges the head 45% in every frame (found by skin colour, grown from the chin), then the whole figure is sized so the total is +10% (`BATTLE_SIZE.justin` .823 in `data/justin-battle-use.js`). All nine move sheets re-baked. His knocked-out pose is the old rotated frame and was not enlarged.
- Measured in battle pixels from the sprite, and looked at side by side in a test fight. Not played on the phone.
- Tom (13:51): his moves were too slow. Seven moves now play at about 1.5x (a 0.66 time factor at the end of `engine/justin-moves.js`). GIANT SNEEZE and FOOT TAP are timed by hand: the sneeze frames are held about 1.6 s (the big sneeze frame alone 0.8 s) and the pained-face frames of Foot Tap about 1.4 s, with everything around them fast. Totals at 1x: sneeze about 5.0 s, foot tap about 5.6 s, the others 3 to 4.5 s.

## 2026-10-31 (day, 10): Justin's kit: painted battle sprite, nine moves, test boss fight (`justin2`)

- Tom (13:3x) sent `justin_9_animation_sheets.zip` (nine ability sheets; no stance sheet 00). Justin now fights in slot 4 with his full kit: Loose Wire (basic), DRYWALL (special, 2 VP, halves damage to the whole party until each friend's next turn), Wire Nuts, Bad Call, Fresh Fit, Demo Day, Breaker Flip, Giant Sneeze (enemy loses its next turn and slides back), Foot Tap (Rose taps his toe, Grace if Rose is down; biggest hit).
- Stamp slots: A1 Wire Nuts, A2 Bad Call, A3 Fresh Fit, A4 Demo Day, A5 Breaker Flip, B1 Giant Sneeze, B2 Foot Tap. A6 and B3 to B6 are empty placeholders until more moves exist (`tools/smoke.py` allows those five to be unbuilt for Justin only).
- No stance sheet (00) arrived, so his idle, hurt, kneel and so on borrow frames from the ability sheets and his KO is a rotated frame. Send sheet 00 to replace them.
- New: `engine/justin-moves.js`, `data/justin-battle-use.js`, `data/justin-battle-hires.js` (generated), `art/chars/justin-*.webp`, `tools/sprite-bake/bake_justin_battle.py`, `portraits/justin.png`; sfx `zap`, `drill`, `sneeze`. Shop tab, menu portrait, travel line, story lists.
- Test fight: Battle Lab first entry, JUSTIN'S TRYOUT (Tom, Grace, Rose, Justin vs Old Iron-Gill, every move unlocked).
- Voice: all his battle lines are new and listed in `tools/bake-page/pending.json`; speech synthesis plays until baked.
- Tested: `kit_test.py justin --speed2` (all moves), `smoke.py`, `IDS=justin smoke.py`, `recruit_justin_test.py` (updated: he now fights). Not played on the phone.

## 2026-10-31 (day, 8): Voice Library search forgives spelling (`vlib4`)

- Tom (13:20) could not find "yamamot". The line is there (Grace, kind `ymamot`, "Ketchup, pickles, cereal, sock. Ymamot Creation!", no clip yet; little Tom's line was removed in `ymamot4`), but search only matched exact letters. Search now matches every typed word inside the line, speaker, place, move name or direction, or within one typo (two for words of 7+ letters), so "yamamot" finds Ymamot. Results are memoized per query.
- Tested: `tools/voice-library/test.py` (search yamamot finds it), smoke. Stamp `build vlib4`.

## 2026-10-31 (day, 10): Ymamot Creation: little Tom's spoken line removed (`ymamot4`)
- Little Tom no longer says "Yama-Mott. It's Tom backwards." The move now holds 600 ms there instead of waiting on a voice. The matching line is gone from `data/lines.js`, `tools/bake-page/pending.json` and `tools/clip-audit/extra-battle.json`; bake list and Voice Library index rebuilt. Nothing to bake for little Tom. Little Amy's line (Grace's voice) still needs baking.
- Measured: 7.2 s at 1x (fire to command menu, including walk-out and walk-back), 5.1 s at 2x.

## 2026-10-31 (day, 7): Justin joins the party from the Gregori house (`justin1`)

- Tom (12:36): Justin can now be recruited into the fourth slot by talking to him in the Gregori house (Amy's house) on Long Island, no storyline changes. Same prompt as Amy, Deedee and Boppy: YES, COME ALONG or NOT RIGHT NOW; a full party offers SWAP OUT (Amy, Deedee, Boppy, or whoever is in the fourth slot and not locked by the chapter); with only Tom, Grace and Rose he just joins. He can leave and rejoin any time, and he goes home when the party leaves Long Island.
- Chapter rules (`justinStays`, `canBeHere`, engine/story.js): Justin ignores the chapters' `allow` lists, so he can join in every chapter where Tom is on Long Island. Exceptions that keep existing scenes intact: chapter 5 until `ch5-done` (he is at work, texts Amy), chapter 10 until `ch10-done` (he walks into the midnight dinner in a scene), and the Nine Scoops bonus (scripted Justin). In chapters 13, 14 and 16 the party is locked full, so there is no seat even though the rules allow him.
- No battle kit yet (`noBattle:true` on `justin`, data/party.js): he follows Tom and sits fights out (`startBattle` leaves him out of the fighters), gets no XP, and his Status and Stamps pages say "coming soon". He is not in `ALL_MEMBERS`, so there is no shared XP, saved level or Stampcard for him yet. Saves keep him in the party and load puts him back (`allMembers` in loadGame). His menu portrait is the placeholder "J" until art arrives (`portraits/justin.png`, `PORTRAITS` in engine/menu.js).
- Justin's join lines (`RECRUIT_TALK.justin`, engine/followers.js): four new spoken lines are in `tools/bake-page/pending.json` (`justin-recruit-ask`, `-yes`, `-no`, `-swap`) until Tom bakes them (ADMIN > BAKE VOICES); until then they are silent. His follower chatter reuses lines that already have clips.
- Tested: new `tools/recruit_justin_test.py` (talk, join, swap with Amy, leave and rejoin, every menu tab, a fight and an instant win with him along, save and load, Los Angeles sends him home, chapter 10 offers nothing, per-chapter rules), smoke default and grace,rose. Tags `?v=justin1`, stamp `build justin1`. Not tried on the phone yet.

## 2026-10-31 (day, 7): Voice Library rows are text boxes (`vlib3`)

- Tom (13:08): every line's text must be editable on the spot; show the text box, not static text. Each row now is the text box with what ElevenLabs reads (words and [directions]; Nara: the sound description), grown to fit, saved as he types (localStorage `aot-vl-scripts`), with "edited" and Undo edits. Takes and record opens New take, Record my voice and the takes. Regenerate (bulk) and New take use the edited text. Typing keeps its cursor even if a take finishes on that row.
- Changing words only changes what is spoken: the clip still plays for that line; the on-screen subtitle stays until Claude edits the game text (said in the page's help line).
- Tested: `tools/voice-library/test.py` (every row has a box, edit saves, the take request carries the edited text), smoke default and grace,rose. Stamp `build vlib3`. Not tried on the phone.

## 2026-10-31 (day, 9): Ymamot Creation: kids sized to Grace and Rose, about 6 seconds (`ymamot3`)

- Tom (12:54): the kids were too small and the move too long. Little Tom is now as tall as Grace and little Amy as tall as Rose (`kid()` takes `sc`; scale is each party sprite's height over the painted kid's). Knock It Off! kids are unchanged.
- Runtime: the animation proper is about 5.5 s (was about 13 s): the shout 0.8 s, ingredients in 1.3 s, name, sling, splat, back. About 6.8 s at 1x counting the walk-out and walk-back, 5.3 s at 2x.
- The two kid lines are shorter so they fit: "Ketchup, pickles, cereal, sock. Ymamot Creation!" (Grace's voice) and "Yama-Mott. It's Tom backwards." (Rose's voice). Both were never baked, so nothing is lost; they are in `tools/bake-page/pending.json` (bake with ADMIN > BAKE VOICES). The old grown-up clips are no longer used as a stand-in (they ran 7.5 s and 4.2 s), so the kids are silent until baked.
- Words and the ingredient labels were shortened so they no longer overlap. Tested at 1x and 2x, smoke and `IDS=grace,rose` smoke pass. Not played on the phone.
- Note: Tom's just-baked kid clips (little Amy 6.6 s, little Tom 7.3 s, about 12 s in a row) cannot fit a 6 s move, so the two kid lines were shortened and need one more bake (they are the only two items in `pending.json`). The Flashback! shout clips from `ymamot2` are kept and play.

## 2026-10-31 (day, 6): the four Ymamot clips are baked and merged; the move is timed to them (`ymamot2`)

- Tom (12:52) sent `local-clips-export.json` (30 clips). 26 were the takes already merged in `clips1`; the 4 new ones are exactly the Ymamot list: `amy.flashback`, `tom.flashback` (the Flashback! shout), `grace.ymamot` (little Amy), `rose.ymamot` (little Tom). Merged with `tools/battle-baker/merge.js` into `data/voice/amy|tom|grace|rose.js` (and voice-clips.js voice settings, scripts kept). `tools/bake-page/pending.json` is empty again, list rebuilt; Voice Library index rebuilt (those 4 no longer show under No clip yet).
- `B2_TOMBO_ANIM.amy2` (engine/battle2-kind.js) now uses the measured word times of the kid clips (`tools/speech_windows.py`): ingredients land on ketchup, pickles, cereal, one sock; the YMAMOT CREATION sign on "Ymamot"; little Tom starts after little Amy finishes; the sling lands on "We were six." A re-recorded take (Voice Library) still rescales by its length.
- Voice Library (Tom 12:57, could not find bulk regenerate): every row now has a checkbox all the time (no Select mode), a gold "Select all N shown" button sits under the filters, and the bottom bar reads N selected, Clear, Regenerate N. `tools/voice-library/test.py` covers it.
- Tested: the move fired in a lab fight at 1x: shouts 3 ms apart, little Amy, then little Tom with no overlap; frames checked (flashback banner, bowl, carry). Smoke default and grace,rose pass. Stamp `build ymamot2`. Not played on the phone.

## 2026-10-31 (day, 7): Downtown LA: the lane between the taco truck and the bus shelter (behind14)

- Tom (12:40): still cannot walk between the taco truck and the shelter. Cause: the truck object was 4 x 2 tiles (rows 11 and 12), and objects block their tiles whatever the walk map says, so row 12 under it stayed solid. Now 4 x 1 (row 11 only; `data/maps-la.js?v=dtla11`). The truck is still touchable from row 10 above and now from row 12 below (checked in the lane: Tom walks (10,12) to (15,12), A at (12,12) facing up opens the taco text). Shot `tools/shots/blvd-lane-walk.png`. reach 0 fails; blvd_test and smoke pass.

## 2026-10-31 (day, 5): Voice Library lists lines with no clip, plus a No clip yet filter (`vlib2`)

- Tom (12:29): the library showed only lines that already had a clip. It now lists every line the game can show: 3,956 lines, of which 1,247 have no clip yet (4 battle lines, 1,243 dialogue lines, mostly chapters 11 to 20). New Show chip "No clip yet" with its count; those rows are tagged "no clip" and the button reads Make a clip. Play on them says there is nothing yet.
- 323 of those lines belong to characters with no voice cast yet (Vance, Marlowe, Part 2 monsters): listed and tagged "no voice yet"; recording is off with a note to ask Claude to cast one. Nara's dialogue is left out (her bark sound plays).
- How: new `tools/voice-library/harvest.py` runs `tools/clip-audit/harvest.js` in the game (headless) and writes `harvest.json`; `make-index.js` adds the lines that have neither a dialogue clip nor a battle clip with the same words; chapter from the scene that speaks it or the monster's chapter file. Fixed: the Select bar now hides after Done (CSS `display:flex` beat `hidden`).
- Tested: `tools/voice-library/test.py` (now 22 checks), smoke default and grace,rose. Stamp `build vlib2`, `?v=vlib2` on main.js. Not tried on the phone yet.

## 2026-10-31 (day, 5): Shopkeepers stand behind their counters (`counter1`)

- Tom (11:49): people behind store counters need to sit properly behind the counter. Penny (Long Island shop) and Nickel (Nickel's, Downtown LA) were drawn standing on top of the counter. Each counter is now a cutout (`art/shop-fg.webp`, `art/nickels-fg.webp`, made by `tools/make_counter_fg.py`) drawn over the shopkeeper through `PLATE_BEHIND.shop` and `.nickels` in `engine/plate.js`, so the counter top and front hide her legs.
- Penny moved one tile left (8 to 7) to clear the pencil cup and register; both shopkeepers got `lift:-4` (a few pixels lower). Other clerks (bakery, tea, coffee, ramen, juice bar, post, taxi) already stand on the customer side of their counters, so they were not changed.
- Tested: `rooms_test.py shop nickels`, smoke (default and grace,rose). Tags `?v=counter1` on `maps-le.js`, `maps-la.js`, `plate.js`; stamp `build counter1`. Not tried on the phone yet.
## 2026-10-31 (day, 7): Ymamot Creation: pinned time banner, Flashback! shout, kid voices (`ymamot1`)

- Tom (11:41): in Ymamot Creation the time banner stays fixed at the top for the whole flashback, with much larger art in the game's style, little Amy speaks in Grace's voice, little Tom in an existing voice, and Tom and Amy shout "Flashback!" together before the move starts.
- Banner (`flashbackBanner` in `engine/battle2-kind.js`, used by `SC.tu_flashback`): one full-width plaque under the top bar, 82 tall (the old card was a small box that vanished after 1.6 s). The game's dark panel with gold rules, 7x BACK IN 1989 and 4x line under it (MOM WAS OUT), a clock whose hands run backwards at the left, a film reel spinning backwards at the right. It drops in with the projector and lifts out as the flashback ends. Knock It Off! uses the same scene, so it gets the same banner (THE COUCH); words in both moves (A YMAMOT CREATION!, SPLAT!, KNOCK IT OFF!, WHAP! and friends) now sit below y=112 so they do not cover it.
- Opener: Tom and Amy hop with their arms up and both say Flashback! at the same moment (FLASHBACK! in gold over them), then the sepia starts. The opener's length follows the clips (1.3 s until they exist).
- Voices: little Amy's line is `LINES.grace.ymamot`, little Tom's is `LINES.rose.ymamot` (Rose is the only other existing child voice, and she is six, like Tom in the flashback). New `amy.flashback` and `tom.flashback`. Until the four new lines are baked the move plays the old grown-up clips for the kids and the shout is silent, so nothing breaks. The beats are scaled by each kid clip's length over the grown-up clip's (`ymSecs` reads the mp3 length; checked against real decoding to 40 ms), so a faster or slower reading still lands ketchup, pickles, cereal, sock, name, sling in order. After baking, Claude should measure the new clips with `tools/speech_windows.py grace:ymamot rose:ymamot` and replace the scaling with the real word times.
- Bake: the four lines are in `tools/bake-page/pending.json` (list rebuilt, `data/bake-list.json`) and their directions in `tools/clip-audit/extra-battle.json`; the Voice Library index and scripts were rebuilt (`data/voice-index.json`, `tools/voice-library/battle-scripts.json`). Tom: ADMIN > BAKE VOICES, one tap.
- Tested: the move at 1x and 2x, in portrait and landscape, with stand-in clips for the four lines (both shouts fire within 1 ms of each other, Grace and Rose play, timeline retimes) and without clips (old clips play, shout silent); Knock It Off! at 1x; no errors. `tools/smoke.py` and `IDS=grace,rose` smoke pass. Not played on the phone.

## 2026-10-31 (day, 6): Downtown LA: walk behind the south row (behind13)

- Tom asked to walk behind the bottom-row buildings, between the taco truck and the bus shelter, and past the shelter below it. Row 14 (art y 896 to 960, the roofs' back edge) is now walkable end to end (`data/maps-la.js?v=dtla10`), joining the three alleys, so Tom walks along the back of Backlot Wardrobe, TNB's Loft, the Grand Tower and Nickel's with only his head above the roof line.
- `PLATE_BEHIND.blvd` (`engine/plate.js?v=behind13`): four building-face zones (roof line to door row, base 1000) redraw the painting over anyone on row 14; alley walkers and doorways are untouched. The lane between truck and shelter (row 12) and the sidewalk past the shelter were already open since pass 2; row 14 adds the way round below the shelter (the bench object still blocks its own two tiles, row 13, so it can be touched).
- Shots: `tools/blvd_behind_shots.py` spots roofW, roofGT, shelterS, lane. reach_test 0 fails; blvd_test and smoke (default, grace,rose) pass. Not played on phone.

## 2026-10-31 (day, 4): Voice Library on the phone (`vlib1`)

- Tom (11:37): a way to browse and filter every existing sound and re-record any of them. New `voices.html` (title screen > ADMIN > VOICE LIBRARY): all 2,709 spoken lines (450 battle, 2,259 dialogue) with search and chip filters (Who, Battle/Dialogue, Chapter, re-recorded or not). Play hears what the game plays now; tap a line to edit its direction and make a New take (ElevenLabs) or Record my voice (speech to speech); Select for many at once. The chosen take goes into `aot-local-clips`, so the game plays it on that phone at once (`engine/local-clips.js`, unchanged); every take is kept to switch back; Export phone clips gives the usual `local-clips-export.json`.
- New: `voices.html`, `data/voice-index.json`, `tools/voice-library/` (`make-index.js`, `battle-scripts.py`, `battle-scripts.json`, `test.py`), `docs/VOICE_LIBRARY.md`. Edited: `engine/splash.js` (ADMIN entry, `openVoices`), `docs/VOICE.md`, `index.html` (tags), `engine/main.js` (stamp).
- Dialogue lines start from a plain direction until the hand-written chapter scripts from the Project are added to the index (open item in the doc). Battle lines use the hand-written ones.
- Tested: `tools/voice-library/test.py` (ElevenLabs mocked, phone viewport, 19 checks incl. the game picking up the phone take); smoke (default and grace,rose) pass. Tags `?v=vlib1`, stamp `build vlib1`. Not tried on the phone yet.
## 2026-10-31 (day, 4): Downtown LA cutouts made here, no generator (behind12)

- Tom asked whether the cutout layers could be made without sending prompts to an image generator. They can: `tools/make_blvd_fg.py` pass 3 cuts the hard-edged objects out of `art/blvd.webp` itself, by colour (lamp poles) and OpenCV GrabCut (lantern heads and feet, taco truck, Starlite marquee with its sunburst, Griffith Park gate, Jefferson Park arch) plus hand polygons for the six awnings. `claude/dtla-cutout-layers-prompt.txt` is no longer needed.
- `PLATE_BEHIND.blvd` (`engine/plate.js?v=behind12`): the arch, gate, awnings, marquee, truck and all 12 lamp posts are now `fg:true` zones drawn from the rebuilt `art/blvd-fg.webp` (`?v=20261031e`), so only the object's own pixels cover Tom; the old painting-slice rects (which redrew paving and wall beside poles and posts) are gone. The three south awnings cover anyone in a south doorway (base 1410).
- `tools/blvd_behind_shots.py` has six more spots (north lamp, Starlite door, plaza lamp, arch, gate, truck). Shots in `tools/shots/blvd-behind-*.png`. blvd_test, smoke (default and grace,rose) pass; blvd_test exit checks flaked once on timing and passed on rerun. Not played on phone.

## 2026-10-31 (day, 3): Downtown LA v4 painting installed (Cab Co. north, Nickel's south)

- Tom sent a new Downtown LA painting (`docs/reference/blvd_v4_from_tom.png`, art `?v=20261031d`): the same street, with Angel City Cab Co. now on the north row (door 22,9) and Nickel's on the south row (door 25,21). Walk map, exits, walkways and cutouts are unchanged; only the two buildings swapped places in `data/maps-la.js` (`nickels` x23,y17; `lacab` x20,y5).
- Nickel's shop sign object moved to the south front (24,21), touched from (24,22). The north gold awning cutout in `PLATE_BEHIND.blvd` now matches the Cab Co. awning. Cutout layer rebuilt (`tools/make_blvd_fg.py`).
- Cab arrivals (flights, `arriveAt` the cab) now land at the north door (22,9). `tools/blvd_test.py` updated; reach 0 fails; blvd_test and smoke pass. Not played on phone.

## 2026-10-31 (morning, 40): Battle Lab EXIT button at the top of the battle (`labx1`)

- Tom (10:34): in Battle Lab fights only, an exit button at the top of the screen returns to boss select. EXIT now sits left of 1x and AUTO on the battle picture (portrait and landscape). One tap ends the fight right away, even mid-animation (clears the step queue, stops speech) and opens the lab list, same path as Exit Lab in the bag. Story fights never show it.
- Files: `engine/feel.js` (button in the `b7-tools` row, shown when `B2.cfg.lab`), `engine/battle2-ui.js` (`b2LabExit`), `index.html` (button style). Tested: lab fights 0 and 5 in portrait, fight 0 in landscape, tap returns to the lab list with lab flags cleared, a story fight after it hides EXIT; smoke (default and grace,rose) pass. Tags `?v=labx1`, stamp `build labx1`.

## 2026-10-31 (day, 7): Puppy Dog Eyes spelling fixed (`eyes2`)

- Tom (10:07): the earlier rename was meant to be "Puppy Dog Eyes"; "Puopy" was a typo. Corrected in the same places (`data/abilities.js`, `data/battle2-data.js`, `data/ch20-battle.js`, `data/scenes.js`, `engine/nara.js`, `docs/CANON.md`, `docs/MOVE_KEYS.md`). Key `puppy_eyes` unchanged, no spoken lines affected.
- Layout: since the new ATTACK/HEAL pad, the special's name under HEAL was cut off with "..." ("PUPPY DOG..."). Names over 11 characters now wrap to two lines at 9px (`small.long`, `engine/battle2-ui.js` and `index.html`); shorter names are unchanged.
- Tests: `kit_test.py nara --only=puppy_eyes`, smoke (default and grace,rose), pad checked in portrait and landscape. Tags `?v=eyes2` on the five scripts, `battle2-ui.js` and `main.js`, title stamp `build eyes2`.

## 2026-10-31 (morning, 39): battle UI ability names in Title Case and larger (`cross2`)

- Tom (10:07): put the labels in the battle UI in title case and make the font bigger; his follow-up (10:08) was cut off after "For the ability names, I mean", so I took it as the ability names. Call made: ability names only; the cross buttons (ATTACK, TOMBO, HEAL, BAG, INSPECT) and the small HEART, TURN and HP labels are unchanged. Say the word to convert those too.
- Ability names (Attack and Heal lists, Tombo list, Bag items, the Heal button's special name, the hint line) are Title Case and 15 px (was 12 px, caps); landscape 11 px (was 9.5). Names that were stored in all caps in the data (DEFEND, DANCE, MOON & BACK) are converted by `b2Title` in `engine/battle2-ui.js`; mixed-case names are shown as written. Small caps were switched off for these names so real capitals show. BACK, Run, Exit Lab, Warm Crust and Hot Dish are Title Case too. Rose Mode picture captions (`bpWord`) are Title Case and 11 px.
- No spoken line changed. Tested: `smoke.py` and `IDS=grace,rose smoke.py` pass; portrait and landscape screenshots of the Attack and Heal lists checked. A nine-move Attack list is taller now and scrolls; Back is below the fold on the longest list. Not confirmed on phone.
- Tags `battle2-ui.js`, `battle-pictures.js`, `main.js` `?v=cross2`, title stamp `build cross2`.

## 2026-10-31 (day, 2): Downtown LA pass 2: open road lane, walk under the Metro canopy, more cutouts

- The south lane of the boulevard is open past the taco truck and bus shelter (cols 11 to 14, row 12); the truck body itself still blocks its own lane. Small curb props (trash cans, mailbox, hydrant, scooter, bike racks, bollards) no longer block: you walk behind them (small cutout zones in `PLATE_BEHIND.blvd`). The bus bench object is now just the shelter bench (12,13).
- Metro: Tom can walk under the canopy to the stairs (row 24, tiles 24 to 26); the stairs object is at (25,25), press A facing down from (25,24). The canopy and sign are a cutout.
- More cutouts in `art/blvd-fg.webp` (`tools/make_blvd_fg.py`): bus shelter roof and posts, Metro canopy, palms and bushes on the left and right screen edges. Edge tiles (0,13), (1,13), (29,10), (29,13) are open.
- Files: `engine/plate.js?v=behind9`, `data/maps-la.js?v=dtla7`, fg layer `?v=20261031c`. blvd_test (Metro and bench positions updated) and smoke pass; reach test 0 fails. Not played on phone.

## 2026-10-31 (day, 5): the Stacks walk map is opened up (`stacks1`)

- Tom: fix the walkable pathways in the Stacks (too many blocked areas and narrow paths) and make sure all 3 quest items can be reached on foot. Reading of the request: the three quest items are the three chapter 7 catalog cards, held by the wing bosses The Cliffhanger (Fiction), The Know-It-All (Nonfiction) and Pop-Up Panic (Picture Books).
- Walkable tiles 199 to 232. Fiction and Nonfiction aisles are 2 wide, the hall has lanes behind (rows 7 to 8) and in front (row 10) of the globe and cart, Picture Books gained a ring around the rocker, the floor in front of the low shelves, and a channel to the puppet corner.
- Dog-Ear moved from (26,5) to (24,5): it sealed the Know-It-All nook. Object footprints trimmed to their real bases (globe 12,9 2x1; cart 16,9 2x1; low shelf 8,18).
- Walk-behind: `art/stacks-fg.webp` (cutout of globe, stacks, pedestals, plants, cart; built by `tools/make_stacks_fg.py`) and `PLATE_BEHIND.stacks` zones in `engine/plate.js`, so Tom reads as behind the props on row 8.
- New test `tools/stacks_walk_test.py` (flood fill with other monsters blocking, every object touchable, no long one-tile corridors, real keyboard walks, screenshots `tools/shots/swalk-*.png`).
- No spoken line changed. Tested: walk test, `stacks_test.py`, `smoke.py` and `IDS=grace,rose smoke.py` pass. Tags `maps-le.js`, `library-monsters.js`, `plate.js`, `main.js` `?v=stacks1`, stamp `build stacks1`.

## 2026-10-31 (day, 4): skill lists use icons instead of text tags (`icons1`)

- Tom (09:49): in the battle skill list, replace the labels with an icon system. Type icons right after the skill name, element icons in one row beneath, icons only, no text.
- Type icons (colored tile, dark glyph, in this order after the name): attack = sword (red), heal = plus (green), buff = up arrow (blue), debuff = down arrow (purple). A long name wraps them together so none sits alone on a line.
- Element icons (dark tile, colored glyph and outline, one row under the name): kinetic = speed ball, cozy = steaming mug, splash = water drop, sparkle = four-point star, chatter = speech bubble, amber = golden gem. A move with no element shows no row.
- Built in `engine/battle2-ui.js` (`B2_ICON_GRID` pixel grids, `b2IconSvg`, `b2RoleIcons`, `b2ElemIcons`); CSS `.b2-ic`, `.b2-ics`, `.b2-els` in `index.html`, smaller in landscape. Roles and elements still come from the move data, so new moves get icons for free. Each icon has an aria-label; the words still appear in the message line when a move is highlighted.
- Same icons on the Tombo list. Left as text on purpose: the Bag and the weakness tags on the Inspect and target screens.
- No spoken line changed, so no clip needs a re-bake.
- Tested: `smoke.py` and `IDS=grace,rose smoke.py` pass; portrait and landscape screenshots of the Attack and Heal lists checked.
- Tags `battle2-ui.js` and `main.js` `?v=icons1`, title stamp `build icons1`.

## 2026-10-31 (day, 3): the 26 phone-baked voice clips are merged into the game (`clips1`)

- Tom (09:50) sent `local-clips-export.json` from the bake page ("Missing voice clips"): 15 battle lines and 11 dialogue lines, exactly the 26 on the bake list.
- Battle (15): Amy 1 (Almond milk), Grace 3 (Bedazzle Blast, Open Strings, Portrait Mode), TNB 9 (Around the Bend, Coffee Run, Don't Split Up, Foraged at Dawn, praise, Round with Jojo, Scope Creep, Tasting Ult, Throw Down), Tom 2 (Ladder, praise). Merged with `tools/battle-baker/merge.js` into `data/voice/amy|grace|tnb|tom.js`; each clip text matches its `data/lines.js` entry and key. Their bake scripts are kept in the voice settings.
- Dialogue (11): Amy 1, Boppy 1, Deedee 1, Michael 5, Olivia 3 (chapter 6 Olivia and Michael lines). Silence trimmed, Boppy deepened (rubberband pitch 0.9), mono 32 kHz 48 kbps, added to `data/voice/dialog-ch28.js`.
- The bake list is empty now (`tools/bake-page/pending.json` is `[]`, `data/bake-list.json` rebuilt). Phone clips stay in the phone until cleared and still win over these, which are the same takes.
- Tags: `?v=clips1` on the four battle voice files, `dialog-ch28.js` and `main.js`; title stamp `build clips1`.
- Test: clip lookup check in headless Chromium (battle clips present with audio, dialogue keys loaded, no page errors); `tools/smoke.py` passes.

## 2026-10-31 (day, 2): Jojo stays away until chapter 3 (`jojo2`)

- Tom (09:38): Jojo should not be in TNB's loft until after chapter 2, and in chapter 2 she should not be anywhere in the overworld.
- Fix: Jojo now has `away:[{until:2}]` in the loft spec (`data/maps-la.js`), the same setting Olivia, Michael and Justin use. She is removed from every map through chapter 2 (she only ever stood in the loft, so nowhere else needed a change) and appears in the loft from chapter 3 on. The sync runs every frame outside cutscenes (`syncAwayNpcs` in `data/scenes.js`), so a chapter jump or a load puts her in the right place.
- Test: `tools/jojo_test.py` now checks chapters 0, 1 and 2 (no Jojo in any map), chapter 3 (in the loft only), then her talk lines and walk views as before. Also checked by real `chapterJump` to 1, 2, 3, 5 and back to 2, and by loft screenshots in chapters 2 and 3.
- Not changed: her lines, art, and the Round with Jojo battle cameo (a battle move, not the overworld).
- Tags `maps-la.js?v=jojo2`, `main.js?v=jojo2`, title stamp `build jojo2`.

## 2026-10-31 (morning, 38): battle cross: ATTACK and HEAL, same-style arrows, bigger names (`cross1`)

- Tom (09:14): the arrows on the battle cross should all look the same, the name and level should be bigger, the top button should say Attack instead of Skills, the right button should say Heal instead of the special's name, and the moves should be sorted to match (specials go in Heal).
- Arrows: the four buttons used the text characters ▲ ◀ ▶ ▼, and iPhone draws ◀ and ▶ as emoji while ▲ and ▼ stay plain. They are now drawn shapes (one gold triangle, rotated), so all four match. The hint line under the battle no longer uses arrow characters; tutorial tips and toasts keep ◀ ▶ with the text-style marker so they stay plain too.
- Sizes: cross button labels 11 to 14 px (small line 9 to 11 px); party card name and level 11 to 14 px in portrait; landscape also larger (names 9.5 px so "Deedee Lv30" still fits).
- Lists (`engine/battle2-ui.js`): `b2TabRows(u,'attack'|'heal')`, `B2.tab` says which is open. ▲ ATTACK = the free basic move, then every skill that aims at enemies. ▶ HEAL = the character's special first, then every skill that aims at friends (heals, buffs, party boosts). A skill with a heal or buff that still hits an enemy (Dutch Oven) stays in Attack. The Heal button shows the special's name underneath and greys out when nothing in Heal is affordable. The special is now picked from the Heal list (one extra tap) and counts as "last used" so the cursor starts on it next time.
- Rose Mode picture cross: MOVES now reads ATTACK, the right button reads HEAL, same lists. The recommended-move glow (`b7RecMap` in `engine/feel.js`) now points at whichever button holds the move.
- Tutorial tips (`data/scenes.js`, `engine/story.js`): "▲ Skills" became "▲ Attack"; DEFEND and the other specials say "▶ HEAL"; Grace's Squishy Squeeze tips now point at ▶ and glow the right row inside the Heal list. Silence text updated in `data/scenes.js` and `data/backlot-monsters.js`.
- No spoken line changed, so no clip needs a re-bake.
- Tested: `smoke.py` and `IDS=grace,rose smoke.py` pass; portrait and landscape screenshots of the cross, Attack list and Heal list checked with four-person parties (Deedee, Boppy). `smoke.py` drives every special through right + Enter + Enter (now Heal list row 0), so that path is covered. `tools/ch20_test.py` (same right + A habit) stalls in the sandbox right after "Leviathan boss in the fight", and it stalls the same way on the commit before this change, so it is not caused by it. Not confirmed on phone.
- Tags `battle2-ui.js`, `feel.js`, `story.js`, `scenes.js`, `battle-pictures.js`, `backlot-monsters.js`, `main.js` all `?v=cross1`, title stamp `build cross1`.

## 2026-10-31 (day, 1): Downtown LA is layered: walk behind palms, bushes, planters, rooftops, the tower crown

- Tom asked for a 3D feel with the party walking behind buildings, trees and bushes, and no blocked-off ground. New foreground layer `art/blvd-fg.webp` (cutouts of the painting with transparency, built by `tools/make_blvd_fg.py`): 6 palms, 4 bushes, 5 planters and pots in the plaza, plus the water tanks, roof gardens and Grand Tower crown that stand over the south sidewalk. `PLATE_BEHIND.blvd` zones with `fg:true` draw it over anyone standing behind them; `engine/plate.js` loads the layer lazily.
- Walk map: the whole plaza is open now (only the base of each object is blocked, 1 or 2 tiles); the Grand Tower crown tiles and the road beside it are open. Reachability test 0 fails with no NPC-pluggable chokepoints left.
- Not made walkable (painted as walls, slopes, fences or building faces): the west and east edges beside the south row, the north row facades, the Angels Flight hillside, rooftops. Files: `engine/plate.js?v=behind7`, `data/maps-la.js?v=dtla5`. blvd_test and smoke pass. Not played on phone.


## 2026-10-31 (morning, 2): Bedazzle Blast: a small step forward, not a walk across

- Tom (09:28): same as Open Strings. Grace steps about 64 px left of her own spot, fires the rhinestone gun from there, and steps back; timeline 6.7 s (was 7.35 s). Gems still fly to the row. Tag `?v=gx4` on grace-moves.js. Tests: kit_test grace bedazzle_blast (frames looked at), smoke IDS=grace.
## 2026-10-31 (morning, 37): the top-left frame is now a quest tracker (`qt1`)

- Tom (09:05): remove the location frame; make it a persistent display of the next quest step, tap for details with sub-steps and check marks, using best-in-class RPG quest display.
- Collapsed: gold quest diamond, chapter line (CH 6 and its title), the next step (first sentence of the current goal, two lines max), and progress pips with a count (for example 1/3) when the step has parts. The old area name and place line are gone from the HUD (the elements stay hidden because battle and flight code still write to them; the pause menu still shows the location).
- Tap: quest log with the chapter title, the current step in full, a checklist of its parts, and a Completed list (newest first, last 8) with green checks. Tap again to close (also closes itself after 15 s).
- Quest updates: when a step finishes the tracker shows it in green with a check and a chime for 1.5 s, then swaps to the new step with the diamond bobbing and the frame pulsing until tapped. When a part finishes, the pips pop.
- Data: each `Goal:` toast now moves the goal it replaces into `STORY.flags.goalLog` (`{c: chapter, t: text}`, saves with the game). Saves from before this show only the current step until the next goal arrives. Multi-part steps come from `QUEST_SUBS` in `engine/story.js` (ch 4 sets, ch 5 rooms, ch 6 park, ch 7 wings, ch 8 shops, ch 9 mirrors, ch 10 terminal) and read the existing room flags. Not covered: the ch 4 light rig boxes and the ch 9 mirror stands (no per-part flag), and the Nine Scoops bonus invitations (they set `goal` directly, so no log).
- Files: `engine/story.js`, `index.html` (markup, CSS, `story.js?v=qt1`), `engine/main.js` (stamp `build qt1`), new `tools/quest_test.py` (all pass; shots in `tools/shots/quest-*.png`, portrait and landscape). `smoke.py` passes for the default party and grace,rose.

## 2026-10-31 (morning): Open Strings: a small step forward, not a walk across

- Tom (09:10): she only needs to step forward a little. Grace now steps about 64 px left of her own spot (never past the row), plays there, and steps back; the walk-in and walk-home are short (timeline 6.25 s, was 6.8 s). Words over her head (gx_text, gx_big) are clamped inside the stage so they are not cut at the right edge. Tag `?v=gx3` on grace-moves.js. Tests: kit_test grace open_strings (frames looked at).
## 2026-10-31 (night, 36): the Old Oak repainted, with a walk map that follows it

- Tom judged the old Old Oak too hard to navigate (paths off the painting, the "corkboard" on the table, two baskets and no bucket, nothing marking the key spots) and repainted it (his own prompt, third try). New painting installed as `art/oak.webp` (1374 x 1145 scaled to 1536 x 1280, still 24 x 20 tiles).
- Route: entry steps to a big hub deck (tea table, stove, bed nook); a staircase up the left wall to the war room (corkboard on its wall); a two-flight staircase up the right wall to the pantry (the bucket hangs on its rope out in the daylight past the front rail); two rope bridges meet on the middle landing; the shaft above is empty until Nara rides the bucket, then the ladder (columns 11 and 12, rows 3 to 5) joins the landing to the crown landing and the sky opening. A loop, so there is more than one way round.
- `data/maps-la.js` (oak spec): new `plateMask` stepped along the painted stairs and bridges, ladder cells, objects moved onto what is painted (corkboard covers the wall board and the war table under it, bucket covers the rail tiles beside the hanging bucket so it can be reached from the pantry floor, plus stove, tea table, bed, shelves, the pantry counter). New "The drop" object above the landing, removed when the ladder comes down. The doormat object is gone (it sat on the only path). Monster spots moved onto the new floor (`data/oak-monsters.js`).
- `data/scenes.js`: one soft golden pulse now always marks the next thing to do in chapter 6 (corkboard, then bucket, then the hooks above the shaft, until the boss). The live ladder is redrawn wider to match the painted hooks.
- Test: `tools/oak_test.py` updated for the new layout (all pass), `oakpark_test.py`, `crown_test.py`, `smoke.py`, portrait and landscape screenshots checked. Files: `art/oak.webp?v=20261031`, `engine/plate.js?v=oak2`, `data/maps-la.js?v=oak2`, `data/scenes.js?v=oak2`, `data/oak-monsters.js?v=oak2`, `engine/main.js?v=oak2`, stamp `build oak2`.

## 2026-10-31 (night, 35): Reading Room doors can no longer be walked through without the password (`gate1`)

- Tom (01:55): the Reading Room could be entered without clearing the prerequisite. Cause: the two door tiles at the top of the Stacks hall (14,1 and 15,1) are exits and were walkable, so walking up from the hall went straight into the room and skipped the catalog lock (the lock only worked when pressing A on it).
- Fix: `STORY_WORLD` in `data/scenes.js` keeps those two tiles solid until `ch7-door` is set (or after chapter 7), when `ch7OpenDoors` opens them as before. The lock still talks when you face it.
- Tested: walking up with no password stops at (14,2); after `ch7-door` it enters the Reading Room; `tools/readroom_test.py` passes.
- Tags `scenes.js?v=gate1`, `main.js?v=gate1`, title stamp `build gate1`.

## 2026-10-31 (night, 34): Director mode, monsters keep up with Tom's level

- Tom (01:50): still easy in chapter 6 at level 16; one ability takes out an enemy. Diagnosis: the pace table (`B2_LAB`) puts the chapter 6 boss at level 9, so level 16 is about 7 levels ahead. Map monsters stay at their base level (chapter 6: 6 and 7, plus 1 per win), so they never catch up. At level 16 an Acorn Agent had 72 HP in Grace mode while Tom's free basic move does about 89, and `b7Overlevel` (5+ levels over) turns such fights into instant wins.
- Call made: new `catchUp:2` in `B7_DIFF.director` (engine/feel.js). `b7MonLevel(n)` now returns max(base level, Tom's level minus 2) for regular monsters in Director mode; `startBattle` (engine/battle2.js) uses it, and the instant win can no longer trigger. Bosses and story fights keep their set levels. Stats grow by each monster's `step` per level, as before.
- Director HP bonus trimmed 1.6 to 1.3 because level scaling now adds HP. Hits x2 and monster speed x1.4 stay.
- Measured at level 16 (Director): Acorn Agent level 14, 218 HP, about 3 basic hits, hits Grace for about 83 of 309. Cheek Stuffer level 14, 411 HP, 127 per hit (a tank by design: grit grows with level). Grace and Rose modes unchanged.
- Tests: smoke default and IDS=grace,rose 0 fails. Tags `feel.js?v=dir3`, `battle2.js?v=dir3`, `main.js?v=dir3`, stamp `build dir3`.

## 2026-10-31 (night, 33): Character level is now a big gold badge (`lv1`)

- Tom (01:41): on the Party screen the level should be much more prominent, and also visible from the Stamps screen. The small "Lv." line in each Party row is gone; each row now has a gold LEVEL badge (28px number) at the right of the name. The Stamps screen has a new header row with the character's name and the same badge, above the Stamp, Polish and Tickets counters.
- Code: `levelBadge(p)` in engine/menu.js (shared), `.lv-badge` styles in index.html, header row in `renderStampsTab` (engine/progress.js). Status and Gear views unchanged (not asked).
- Tags `menu.js?v=lv1`, `progress.js?v=lv1`, `main.js?v=lv1`, title stamp `build lv1`.

## 2026-10-31 (night, 32): Chapter 6, Bready Mercury is on the Crown chest and Tom picks him up

- Tom: in chapter 6 the starter was not visible in the Oak at all, and Tom never retrieved it. Cause: the Crown became a painted plate (Area 35) and the old code-drawn jar on the hoard (`hoard` in `engine/oak-render.js`) is no longer drawn, so nothing showed. The after-boss scene also just handed over the item without Tom touching it.
- Jar: `engine/plate.js` now draws the painted jar (`art/props/tom/sourdough_starter_jar.webp`, the same DAY 3 jar as Tom's kitchen and Starter Splash) on the chest at the heart of the hoard, with a soft shadow on the lid. `drawBreadyJar` gained `lift` and `alpha`. `crownJarState()` decides when it shows: chapter 6, full story, until Tom takes it.
- Pickup: `SCENES.ch6AfterBoss` (`data/scenes.js`) now sets `ch6-take` to `pending` (the jar stays through the Chairman's goodbye), then Tom walks to (10,5), faces the chest, the jar lifts and fades over 0.8 s with a pickup sound and hearts, and only then is `bready` given. New flag `ch6-take`. Saves that already cleared chapter 6 have no `ch6-take` and never show the jar.
- Not changed: no spoken or dialogue line, the hoard object text, the kitchen jar rules (still hidden until `ch6-clear`).
- Tests: new `tools/crown_jar_test.py` 0 fails (jar before the boss, scene runs, Tom stands at the chest, jar gone after, one `bready` in the bag, no jar in chapter 7 or in old cleared saves); `crown_test.py` and `smoke.py` 0 fails. Portrait and landscape shots looked at (`tools/shots/crownjar-*.png`). Tags `plate.js?v=jar1`, `scenes.js?v=jar1`, `main.js?v=jar1`, title stamp `build jar1`. Not played on phone; the live site was not checked from here.
## 2026-10-31 (night, 31): Downtown LA walk-behind cutouts

- Tom asked for a 3D feel with cutouts Tom can go under. `PLATE_BEHIND.blvd` (`engine/plate.js?v=behind6`) now redraws pieces of the painting over anyone standing behind them: Jefferson arch (done before), Griffith gate board and posts (Tom disappears under the board on the steps), the four shop awnings and the Starlite marquee (doorways and sidewalk), the taco truck (the sidewalk behind it), and 12 lamp posts (6 on the north curb, 6 in the plaza) built with the new `BLVD_LAMP` helper.
- No walk map change. New shot tool `tools/blvd_behind_shots.py` (shots `tools/shots/blvd-behind-*.png`). blvd_test and smoke pass. Not played on phone yet.

## 2026-10-31 (night, 30): Nara's special renamed to PUOPY DOG EYES

- Tom (01:24) asked to rename Nara's human eyes to "Puopy Dog Eyes". Spelling used exactly as typed (PUOPY). The move key `puppy_eyes` is unchanged, so saves and tests are unaffected.
- Renamed everywhere the move is named: the command pad and skill data (`data/abilities.js`, `data/battle2-data.js`), the close-up title card (`engine/nara.js`), tutorial and hint text (`data/scenes.js`), the Julian Vance fight menu and messages (`data/ch20-battle.js`), and `docs/CANON.md`, `docs/MOVE_KEYS.md`. Prose that says her eyes look human (not the move name) is left alone.
- No spoken line mentions the move, so no re-bake is needed.
- Tests: `kit_test.py nara --only=puppy_eyes` 0 fails, title card checked; command pad checked in portrait and landscape (name wraps to two lines, fits). Tags `?v=eyes1` on the five changed scripts plus ch20-battle.js (it had no tag), title stamp `build eyes1`.

## 2026-10-31 (night, 29): TNB's Throw Down wheel shrunk to fit him (`tnbw1`)

- Tom: the wheel in Throw Down did not fit TNB, make it smaller and check the proportions. The painted pottery wheel was drawn at 1.5x and stood as tall as TNB. It is now 0.9x (`TW_S` in engine/tnb-moves.js), so the wheel head sits about at his chest while he kneels. The clay, the bowl and the water spray scale with it.
- Moved to match: TNB kneels closer to the wheel, the bowl launches from the new wheel head, the JUST A TAP / TOO FAST / WHOOPS words sit lower, FASTER moved to the left of the wheel so it no longer collides with WHOOPS, and the flying bowl is smaller (still bigger than a bowl on the wheel head so it reads). The bowl that lands on the enemy's head is unchanged. Numbers and spoken lines unchanged.
- Tests: `kit_test.py tnb --only=throw_down --speed2` frames checked, smoke runs 0 fails (default, grace+rose, tnb). Tags `tnb-moves.js?v=tnbw1`, `main.js?v=tnbw1`, title stamp `build tnbw1`. Not played on phone; the live site was not checked from here.

## 2026-10-31 (night, 28): Konami Code voice now lands on the button presses

- Tom reported the Konami Code voice lags. Two causes: the line "Up, up, down, down, left, right, left, right, B, A!" started at the very beginning of the move, about 1.1 s before the first button press and finished before the last one; and the clip was decoded the first time it played, which can be late on a phone.
- Fix (`engine/tom-moves.js`, `Tm.konami_code`): the clip is pre-decoded (`warmLine`) at the start of the move, the voice starts 1.1 s later, and each of the ten presses lands on its own word (`WORD`, measured onsets inside the baked clip, scaled by battle speed). No spoken line reworded, so the baked clip still plays.
- Measured in a headless run: press minus word onset is 2 to 37 ms at 1x and 24 to 143 ms at 2x. The move runs about 150 ms longer at 1x. Contact sheet checked.
- Tests: `kit_test.py tom --only=konami_code --speed2` 0 fails, `smoke.py` and `IDS=tom smoke.py` 0 fails. Tags `tom-moves.js?v=kv1`, `main.js?v=kv1`, title stamp `build kv1`. Not played on phone; the live site was not checked from here.

## 2026-10-31 (night, 27): Downtown LA repainted (v3), walk map rebuilt

- Installed Tom's new Downtown LA painting (`art/blvd.webp`, 1920x1664; original saved at `docs/reference/blvd_v3_signs_from_tom.png`). Fixed camera, skyline with City Hall, Griffith Observatory and Angels Flight, each shop with its own sign style.
- New walk map (`plateMask` in `data/maps-la.js`). Doors: Coffee (5,9), Ramen (10,9), Starlite (17,9), Nickel's (22,9); Wardrobe (4,21), TNB's Loft (11,21), Grand Tower (18,21), Cab Co (25,21). Three one-tile walkways (columns 8, 14, 21, rows 14 to 21) join the south sidewalk to the plaza.
- Exits: Griffith steps (1,4) and (2,4); Jefferson Park arch (13 to 16, 25); studio road east (29,11) and (29,12). Arrivals from Jefferson Park, Griffith, the studio, the Sub-Rail stairs and the chapter 17 tower lobby all re-pointed. Chapter 4 TNB arrival and the chapter 17 tower front moved to match.
- The arch posts and board are a walk-behind layer (`PLATE_BEHIND.blvd`, `engine/plate.js`): Tom walks behind the posts and under the board. First pass-under object on this map.
- Taco truck, bus shelter, Metro canopy and the taxi are interactive objects on the painted spots. The taxi tiles in front of the cab door walk like open floor.
- Tests: `tools/reach_test.py blvd` 0 fails; `tools/blvd_test.py` updated to the new tiles, all pass except the old `BG_FILES` page error that also fails before this change; smoke and camera clamp pass. Screenshots in `tools/shots/blvd-*.png`. Not played on phone yet.

## 2026-10-31 (night, 26): Nickel is back behind her counter

- Tom reported Nickel missing from her shop. Cause: the 2026-10-30 room painting of Nickel's has no people in it, but her sprite was still flagged hidden (left over from the earlier painting that had her in it), parked at (12,6), and hidden characters cannot be talked to.
- Fix (`data/maps-la.js`): Nickel is visible and stands at (7,4) behind the counter, left of the register. A on the counter still opens the shop. No spoken lines changed.
- `tools/rooms_test.py`: a shopkeeper behind a counter no longer counts as standing on unreachable floor (Penny's shop is placed the same way).
- Test: `tools/rooms_test.py nickels` 0 fails, portrait and landscape shots checked; smoke runs 0 fails. Build stamp `build nick1`. Not played on phone; the live site was not checked from here.
## 2026-10-31 (night, 26): Indoor walking a touch faster, overworld a touch slower

- Tom (01:13): half speed indoors went too far. Indoor steps are now 1.6x the outdoor step time (0.224 s instead of 0.28 s; outdoors stays 0.14 s). Tune `INDOOR_STEP_X` beside `indoorSlow()` in engine/battle-draw.js. Followers use the same value. Tom (01:13, second message): the overworld a touch slower too: outdoor steps are now 1.15x (0.161 s instead of 0.14 s), `OUTDOOR_STEP_X` beside `INDOOR_STEP_X`. The player's base step time stays .14 in engine/world.js; cutscene walks with their own step time are untouched.
- Tests: step probe, smoke. Tags `battle-draw.js?v=slow2`, `followers.js?v=slow2`, `main.js?v=slow2`, title stamp `build slow2`.

## 2026-10-31 (night, 25): one-tap voice baker on the phone (`bake1`)

- Tom asked for a way to bake clips from his iPhone in one click. New `bake.html`: title screen > ADMIN > BAKE VOICES opens it inside the app, he pastes his ElevenLabs key once, taps Bake, and the lines in `data/bake-list.json` are baked with the same call, model and voice settings as the other bakers (direction added, three tries if a take loops). Clips are kept in the phone's IndexedDB (`aot-local-clips`); `engine/local-clips.js` loads them at startup so they play like baked lines (dialogue through `dvClip`, battle through `VOICE_CLIPS` and `say()`). No file to send and no merge.
- The list is 26 lines: 11 dialogue (Olivia ch6 hand-over, curb line and ch8 lasagna line; Michael keys, lasagna, "Hey, Tom", "I heard Olivia say Michael", "Yes, Olivia" lines; Amy, Deedee and Boppy ch21 decline lines) and 15 battle (tom praise and dcamy2; grace open_strings, portrait_mode, bedazzle_blast; amy oat_milk_please; tnb praise, foraged_at_dawn, dont_split_up, scope_creep, throw_down, around_the_bend, round_with_jojo, coffee_run, tasting_ult), each with a hand-written script. About 3,100 characters of ElevenLabs credit. The three ch8 Tom pilot-light lines need no clip: the same words are already baked in `dialog-ch25.js`.
- Not on the list: Part 2 (chapters 11 to 20, about 860 lines): no scripts yet; Tom bakes those after the ability updates.
- Files: `bake.html`, `data/bake-list.json`, `engine/local-clips.js`, `tools/bake-page/` (`pending.json`, `make-list.js`), `docs/BAKE_PAGE.md`, `engine/splash.js` (admin entry, `openBake`), `index.html` (tags), `engine/main.js` (stamp `build bake1`).
- Limits: clips live on that phone until merged into the repo (Export button shares a `local-clips-export.json`); raw ElevenLabs output (no silence trim, no Boppy pitch deepening). Keep the screen on while baking.
- Test: Playwright with ElevenLabs mocked: 26 requests sent with the right voice, model, direction and key; 26 clips saved; game reload finds 11 dialogue and 15 battle clips; `dvClip` returns the phone clip; `say('tnb','coffee_run')` and `say('amy','oat_milk_please')` play the local clips; admin menu shows BAKE VOICES; no page errors; `python3 tools/smoke.py` FAILS: []. The real ElevenLabs call was not run (no key here).

## 2026-10-31 (night, 24): Old Oak little door can no longer be walked around; anyone already inside gets unstuck

- Tom was stuck inside the Old Oak with the goal card still saying "Knock the way the scraps say". Cause: the little door's two tiles are exits into the tree, and the painted-plate walk mask clears solid on every exit tile, so Tom could walk straight in without the knock. The "inside the Old Oak" scene only fired when the door flag was set, so it never ran, no "find a way up" goal appeared, and the goal card stayed on the knock.
- Fix 1 (`data/scenes.js`): `ch6SealDoor` makes the door tiles solid and removes their exits in chapter 6 until the knock works; `ch6OpenDoor` gives the exits back.
- Fix 2: the `ch6-oak` trigger no longer needs the door flag. Entering the tree sets the door flag itself, so saves already inside get the scene and the goal "find a way up. The war room is on the left, the pantry on the right" (corkboard, then the bucket in the pantry with Nara, then the rope ladder up the middle).
- Tested: door solid and walking into it stays in the park; arriving in the oak without the door flag plays the scene and sets the flags; `tools/oak_test.py` and `tools/oakpark_test.py` 0 fails. Files: `data/scenes.js?v=door1`, `engine/main.js?v=door1`, stamp `build door1`.

## 2026-10-31 (night, 25): tap-kills pay half XP; fixed broken script tags in index.html

- Tom asked that XP from defeating a monster by walking into it (the overlevel instant win, Tom 5+ levels above) be reduced. It now pays 50% of what a real fight pays (`popXp:.5` in `B7_MON`, `engine/feel.js`; used in `b7InstantWin`). Coins and drops are unchanged. The pop text and toast show the reduced number.
- Fix: the previous push left unresolved merge-conflict lines (`<<<<<<<`, `=======`, `>>>>>>>`) in `index.html`, so `battle-draw.js` and `main.js` were each listed twice. Resolved to one tag each. If the live game acted strangely after `gone1`, that was why.
- Test: `tools/monster_gone_test.py` now checks the pop XP is half of the full-fight XP (24 full, 12 pop). Smoke 0 fails. Build stamp `build pop1`. Not played on phone; the live site was not checked from here.
- Files: `engine/feel.js?v=pop1`, `engine/battle-draw.js?v=pop1`, `engine/main.js?v=pop1`.

## 2026-10-31 (night, 23): beaten monsters stay gone until you leave the area

- Tom asked that a defeated map monster never reappears while he stays in the area; it should come back only after he leaves and returns. Before, a beaten monster only napped for 25 seconds (Z's overhead), then woke and chased again.
- Now a monster beaten in a real fight, or popped by the overlevel rule, is removed from the map at once (`monsterFall`, `engine/world.js`) and waits in that map's `fallen` list. Walking into the map again through a door or exit puts it back at its home spot (`monstersReturn`, called from `switchMap` in `engine/battle-draw.js`). Its tier and HP step still go up, so it returns tougher, as before.
- Story actors (scripted) are untouched. Saves still see fallen monsters (`findMonster`, `allMonsters`). A save reloaded from the title screen rebuilds the world, so every monster is back.
- The monster update loop now iterates a copy of the list so a monster leaving mid-frame cannot skip another.
- Test: new `tools/monster_gone_test.py` (real battle win, wait in the area, leave, re-enter, instant-win path), plus both smoke runs, 0 fails. Build stamp `build gone1`. Not played on phone yet; the live site was not checked from here.


## 2026-10-31 (night, 24): victory celebration a little slower

- Tom asked for the end-of-battle celebration to be just a little slower. The cheer pose cycle, hop and "LEVEL UP" bounce now run at 6 beats a second instead of 8 (about 25% slower), and the rising sparkles drift a bit slower to match. Applies to win cheers, level-up cheers and Nara's puddle wiggle, which share the cheer. Numbers only; the cheer lasts the same time.
- Files: `engine/battle-draw.js?v=cel1`, `engine/main.js?v=cel1`, stamp `build cel1`.

## 2026-10-31 (night, 24): four stale Boomie clips removed

- Removed the four `boomie|...` dialogue clips in `data/voice/dialog-ch2.js` ("TOM! Get over here. Hug...", "La la LAAA! Oops. A car alarm...", "You text me when you land...", "I sang in the shower this morning..."). The Boomie NPC speaks with voice `boomie2` and the same four texts are baked there; the old `boomie` takes could never play. Dialogue clips 2252 to 2248.
- Test: page load, 2248 dialogue clips (`boomie` 0, `boomie2` 14 kept), no page errors, no 4xx.

## 2026-10-31 (night, 22): painted child Tom and child Amy in the two flashback Tombos

- Tom's painted sheets replace the pixel kid sprites in Ymamot Creation (`amy2`) and Knock It Off! (`amy3`). 32 frames baked by `tools/sprite-bake/bake_kids.py` into `art/chars/kids.webp` and `data/kid-sprites.js` (generated, do not hand-edit). Sources in `tools/sprite-bake/src/kid-*.png`. Rebake: `python3 tools/sprite-bake/bake_kids.py`. The flashback sepia is still applied by the game.
- Ymamot: Tom does ketchup, cereal, mustard and stirs; Amy counts and does pickles, lemon, sock; Tom explains the name while Amy tastes; both fling the spoon. The kids stand 14 units apart wider so the bowl no longer hides them. The "carry the bowl together" beat is gone (no carry frames were painted).
- Knock It Off!: sulk and glare, tattle, swing and get shoved in turn, both tumble on the BOTH! swing, freeze, then Tom flops and Amy goes smug. Amy has no separate cushion-swing frame, so she uses cushion-up.
- No spoken line changed, no re-bake needed. Numbers, costs and effects unchanged. Kids are 66 stage units tall.
- Test: `python3 tools/tombo_test.py amy2 amy3 --speed2` and `python3 tools/smoke.py`, no failures; frames checked.
## 2026-10-31 (night, 23): tap a stampcard tag to see what it means

- Tom asked that tags like Sparkle and Cozy on the Stampcard explain themselves when tapped. Each tag on a move row (LV, VP, element such as Kinetic, Cozy, Splash, Sparkle, Chatter, Amber, and POLISHED) now has a small dotted underline. Tapping one opens a one-line tip under the row; tapping it again, or another tag, changes or closes it. Only the tag is the tap target, so the row's buttons are untouched.
- Element tips reuse `B2_ELEM_WHAT` (`engine/battle2-ui.js`). Stampcard only for now: in battle the element chips sit inside move buttons where a tap picks the move.
- Files: `engine/progress.js?v=tip1`, `index.html` (tip styles), `engine/main.js?v=tip1`, stamp `build tip1`.

## 2026-10-31 (night, 23): five stale ch27 clips removed; stricter clip audit

- Removed 5 ch27 dialogue clips whose lines were reworded (Olivia "My lasagna is a brick... Michael is holding it...", Michael "I have Isla, the diaper bag...", "Hey, Tom. I'd wave...", "I heard Olivia say Michael...", "Yes, Olivia. Got him..."). Dialogue clips 2257 to 2252. New wordings need a re-bake.
- Stricter audit (new, `__LE`-free): ran `tools/clip-audit/harvest.js` in the page (3,613 spoken lines with speaker) and matched every dialogue clip key (voice|text) against what the game says for that speaker. 2,212 of 2,252 match; of the other 40, 36 are live lines built in engine/travel.js and similar (Sal, cab stand, flights, the girls' greetings; harvest cannot see them, source search finds all 36) and 4 are stale: `boomie|...` clips for the Boomie NPC lines in `data/maps-la.js`, which now use voice `boomie2` (same four texts exist under `boomie2`). Flagged, not removed.
- Also checked: no duplicate clip keys across dialog files, no voices without clips, no battle clips with the same text under two kinds. Nine bake-script notes in `data/voice-clips.js` voices.*.scripts point at lines that no longer exist (tom tomboamy3, dcdeedee2, bday_cow; boppy hurt, dc2; amy dc1, dc2; tnb bigbowl; rose bday_six is still live in data/bonus-nine-scoops.js). Notes only, no audio; left in place.
- Test: page load, 2252 dialogue clips, no page errors, no 4xx.

## 2026-10-31 (night, 22): dialogue clip audit, chapters 11 to 28, four stale clips removed

- Tom asked to remove the four stale clips found in chapters 6 and 8 and to check chapters 11 to 28. Removed: ch6 `michael|I have both kids and zero car keys. Wait. Keys. Gutter. Right.` (line is now "Zero car keys and one very sticky toddler...") and the three ch8 Tom pilot-light clips that say "That is the ..." while the scene text is "That's the ..." (`data/scenes.js` ~2640). Dialogue clips 2261 to 2257.
- Chapters 11 to 20 have no baked dialogue files (not baked yet per the C11 to C20 docs), so there is nothing to audit; chapters 21, 22, 24 and 28 have 0 unused clips, 23 has none baked.
- Chapters 25 and 26 matches that look unused are live: the ch6 scrap-of-paper and "Those are Marisol's" lines and the ch8 pilot-light lines are built from templates in `data/scenes.js`.
- Flagged, not removed: five ch27 clips whose lines were reworded in `data/maps-la.js` (Olivia "My lasagna is a brick... Michael is holding it. He's holding everything."; Michael "I have Isla, the diaper bag, and a cold lasagna...", "Hey, Tom. I'd wave, but I'm out of arms.", "I heard Olivia say Michael...", "Yes, Olivia. Got him. Got her. Got both..."). The new wordings have no clips (need a re-bake).
- Needs re-bake: ch6 Michael keys line, ch8 Tom pilot-light lines ("That's the gumbo / lasagna / forty loaves"), ch2 Olivia curb line, ch8 Olivia and Michael lines, amy.oat_milk_please, tnb.throw_down.
- Done with a script that round-trips each file byte for byte. Test: page load, 2257 dialogue clips, no page errors, no 4xx.

## 2026-10-31 (night, 21): dialogue clip audit, chapters 1 to 10, one stale clip removed

- Tom asked which dialogue clips in chapters 1 to 10 are unused. Method: each clip's exact text in `data/voice/dialog-ch1..10.js` checked against every string the game source can produce (comments and the baker sample text in `data/dialog-cast.js` ignored; `{n}` and string-built lines checked against their templates).
- Removed 1: `olivia|Michael! Isla is near the curb. Okay. He has her. He always has her.` (ch2, 40 KB). Olivia's line in `data/maps-la.js` now reads "...Okay. Never mind. Thank you, babe." so the clip could never match. The new wording has no clip yet (needs a re-bake).
- Flagged, not removed (Tom said flag only): ch6 `michael|I have both kids and zero car keys. Wait. Keys. Gutter. Right.` (line is now "Zero car keys and one very sticky toddler. Wait. Keys. Gutter. Right."); ch8 three Tom pilot-light clips say "That is the ..." but the scene text is "That's the ..." (`data/scenes.js` ~2640), so they never play.
- Everything else is live: chapters 1 to 10 have the monster "Round N." template lines (rounds 2 to 5), the ch7 catalog-card lines, ch9 mirror lines and ch10 clock-hand lines, all built from templates.
- Done with a script that checks the file round-trips byte for byte. Test: page load, 2261 dialogue clips, no page errors, no 4xx.

## 2026-10-31 (night, 20): two dead battle clips removed

- Tom asked whether any battle voice clips are unused. Audit: every clip in `data/voice/*.js` was checked against `LINES` (same kind) and the rest of the game source (comments and the baker sample text in `data/dialog-cast.js` ignored). 458 of 460 are live; 2 were dead and are removed.
- Removed `amy.oat_milk_please` (old line for the Almond Milk kick; the line was reworded, so the clip could never match) and `tnb.dadjoke_pottery` (the move became Throw Down, `throw_down`, so the key is gone). About 120 KB.
- Still needs a re-bake (not new): `amy.oat_milk_please` new line, `tnb.throw_down` "I was throwing a bowl. Literally. ...Wait, come back, I have more!". Both use speech synthesis until then.
- Done with a script that checks each file round-trips byte for byte; every other clip is unchanged. Tests: re-audit 458 of 458 live; `IDS=amy,tnb python3 tools/smoke.py` FAILS: [].

## 2026-10-31 (night, 20): Acorn Agent drawn smaller

- Tom (00:27): the Acorn Agent should be smaller in the overworld and in battle. New per-monster fields in `data/oak-monsters.js`: `owScale:.7` (map; `placeMonsters` in engine/world.js sets `mscale`) and `shrink:.7` (battle; multiplies the size in `b2LayoutFoes`, engine/battle2-ui.js). Both are 70 percent; change those two numbers to tune. Only the Acorn Agent uses them, so Chairman Cheeks' summoned agents shrink too.
- Tests: screenshots of Old Oak Park (agents smaller than Tom) and a three-agent battle looked at; smoke 0 fails; oakpark_test clean. Tags `ag1` on oak-monsters.js, world.js, battle2-ui.js, main.js (stamp `build ag1`).

## 2026-10-31 (night, 20): Director mode much harder

- Tom (00:30): Director mode needs to be decently harder. `B7_DIFF.director` in `engine/feel.js`: monster hits x1.6 to x2, monster HP x1.3 to x1.6, monster turn speed x1.25 to x1.4. Shield, Tombo and snack rules unchanged. Rose and Grace modes untouched. Call made: numbers only, no new rules; if still too easy, add rules next.
- Checked: a Mudling at level 5 has 60 HP in Grace mode and 96 in Director; monster turn delay 30 to 21 against 26 for Tom. Party HP is 146 to 195 at level 5, so a doubled hit does not one-shot anyone. smoke default and `IDS=grace,rose` 0 fails.
- Tags: `feel.js?v=dir2`, `battle2.js?v=dir2` (comment only), `main.js?v=dir2`, title stamp `build dir2`.

## 2026-10-31 (night, 19): Mug Toss thrown from the party line

- Tom (00:25): TNB does not need to step forward for Mug Toss. `T.mug_toss` (last definition, engine/tnb-moves.js) keeps him at `home` for the whole move; the mug still flies to the enemy and lands upright.
- Tests: kit_test mug_toss frames looked at (throw from the line, clunk, mug rests); smoke tnb 0 fails. Tag `tnb-moves.js?v=mug1`.

## 2026-10-31 (night, 19): demo audio purge

- Tom asked for voice clips used only by the demo to be found, then the dead ones removed. `demo/data/voice-clips.js` is the demo's own frozen copy: 225 clips. 168 have the same text in the main game; 57 exist only in the demo. 28 of those 57 are still played by the demo (its `lines.js`, `engine/world.js`, `engine/la.js`) and were kept.
- Removed the other 29: no line in the demo plays them and the main game has no clip for them. Rose (7: pogo, tickle, flop, raspberry, cannonball, noodle, gigglestorm), Boppy (11: 2 greets, 2 basic, cast, 2 grumble, 2 hurt, low, win), TNB (11: 2 greets, wheel, wrench, glaze, duct, bigbowl, masterpiece, 2 fix, win "Fixed. What is next?"). They were old takes for lines since reworded.
- Result: demo clips 225 to 196, `demo/data/voice-clips.js` 7.09 MB to 6.54 MB. Done with a script that checks the file round-trips byte for byte before removing; the 196 survivors are unchanged.
- Tests: demo page load: no page errors, no 4xx, 196 clips; `say()` on the removed keys (rose pogo, tickle; boppy greet, win; tnb wheel, fix) and kept keys does not throw. Main game untouched. No tag bump (the demo script tags carry no `?v=`).

## 2026-10-31 (night, 18): TNB custom props and hill backdrop installed

- Tom dropped the TNB 15-prop sheet and the golden-hour LA hill painting. Props baked to `art/props/tnb/` (tools/sprite-bake: `key_checker.py` keys the fake checkerboard, `tnb-sheet2-custom.png` is the keyed source, `bake_prop_sheets.py` and `props.json` register it). Backdrop at `art/props/tnb/hill_backdrop.webp` (1152x648).
- Around the Bend: painted hill replaces the drawn sky, ridge, skyline and hill. TNB now walks the painted switchbacks; painted `0.2 MI` signs, drawn TOP sign at the summit.
- Baxter Street Bomb: painted sky, skyline and hillside behind the drawn street, houses and signs.
- Scope Creep (laptop), Round with Jojo (basket, disc), Tasting Menu (cloches, three course plates, THE CHECK folder), Throw Down (clay lump, cylinder, bowl) now draw painted props. Every hook falls back to the drawn version until the image loads.
- Not painted yet: the Gantt board in Scope Creep (it resizes with each step), the receipt (drawn receipt text stays over the old shape), the tasting table. Images exist for gantt, receipt, table if wanted later.
- Tests: kit_test for around_the_bend, hillbomb_ult, scope_creep, round_with_jojo, tasting_ult, throw_down (frames looked at, PAINTED_PROPS confirmed); `IDS=tnb python3 tools/smoke.py` 0 fails. Tags: prop-art, tnb-moves, main.js `tpa2`.

## 2026-10-31 (night, 17): Chapter 6 story no longer stalls when Nara is recruited first

- Tom (23:53): if you recruit Nara in chapter 6 before talking to Olivia and Michael, the next story event never starts. Cause: the `ch6-nara` trigger (data/scenes.js `TRIGGERS`) only ran when Nara was NOT in the party (`test:()=>!inParty(nara)`). Nara waits on Tom's porch and joins when asked, so recruiting her first meant the scene never ran, `ch6-nara` was never set, and the Old Oak Park briefing (`ch6-park`) never unlocked.
- Fix: the trigger now runs either way. `SCENES.ch6Nara` branches with `{if:()=>inParty(nara)}`: if Nara is already with Tom, Olivia says "You already have her" and Nara leans on him; otherwise the original hand-over with the three laps. Everything after (Michael, TNB, the squirrel clues, Tug of War unlock, goal toast) is shared. Her walk uses the lowercase actor id so it finds her whether she is an NPC or a follower.
- Two new spoken lines (Olivia "You already have her", Nara's lean) have no baked clips yet and fall back to speech synthesis until re-baked.
- Tests: headless A/B with Nara recruited first. Original code: `ch6-nara` and `ch6-park` stay unset. Fixed: `ch6-nara` and `tombo:nara2` set, `ch6-park` set after walking into Old Oak Park. Normal order (Olivia first) still works. Smoke 0 fails, no page errors. Tags `scenes.js?v=nf1`, `main.js?v=nf1`, title stamp `build nf1`. Live URL not checked.

## 2026-10-31 (night, 16): House interiors zoomed out a little in portrait

- Tom (23:48): the house interiors feel a bit too zoomed in; can it be fixed without adding dead space. Cause: a square room painting was scaled so its full height filled the whole phone screen, which crops it to the middle 46% of its width. Now in portrait the painting ends where the control strip begins (`ROOM_STRIP` = 116 px, engine/overworld.js `resize()`), which shows about 53% of the width (393 x 852: scale 1.66 to 1.44). The strip under it gets the existing soft backdrop, so it reads as a shadow behind the controls. The camera has no vertical scroll in portrait now (`updateCamera`, top flush).
- Landscape is unchanged: the painting already spans the full width there, so zooming out further would leave bars at the sides.
- Tests: rooms_test (bakery, tomhouse, amyhouse, observatory, creole) screenshots looked at in portrait and landscape; `tomsuite: door leads out` fails the same way before this change; smoke 0 fails. Tag `overworld.js?v=rz1`.

## 2026-10-30 (night, 15): Tom walks at half speed inside houses and shops

- Tom (23:50): when walking inside a house interior, halve the walking speed. Each step indoors now takes 0.28 s instead of 0.14 s (`indoorSlow()` next to `startMove`, engine/battle-draw.js); the party follows at the same slower pace (engine/followers.js). Outdoor maps are unchanged. It applies to every map where `outside` is false (houses, shops, school, cafetorium). Cutscene walks that set their own step time are untouched.
- Tests: step duration probe (town and row 0.14, amyhouse, grands, bakery 0.28), smoke 0 fails. Tags `battle-draw.js?v=slow1`, `followers.js?v=slow1`, `main.js?v=slow1`, title stamp `build slow1`.

## 2026-10-30 (night, 14): Chapter 1 pie theft: the Mudling acts it out with 16 painted frames

- Tom (23:47) dropped the Mudling heist sheet. Baked by `tools/sprite-bake/bake_mudling_heist.py` into `art/foes/mudling-heist.webp` and `data/mudling-heist.js` (`MUDLING_HEIST`, frames `mh_*`, same size as the old Big Mudling; lift only on the charge and the first scurry frame).
- `engine/story.js` `mudlingHeistDraw` draws them on a story monster (`{pose:'Big Mudling',f:'mh_spot'}` or an array with `fps` to cycle, `dir:'right'` mirrors); hook in `drawActor` (town-render.js). `SCENES.ch1Theft` now plays: ooze in, spot, windup, charge, shove, barrel, wobble, reach, grab (tin is in the frame, game tin prop unused), hug, side-eye, scurry out mirrored, giggle, sneak. Family knock and getup timings pushed later so nobody stands up into the blob. Spoken lines unchanged (no re-bake).
- Tests: scene played in portrait and landscape (frames looked at), smoke 0 fails. Tags `?v=mh1` on story.js, town-render.js, scenes.js, mudling-heist.js; stamp `build mh1`.

## 2026-10-30 (night, 12): TNB moves use painted props (flashlight, slasher, kiln, wheel)

- Tom (23:36): TNB's abilities mainly use old graphics. Audit with kit_test (PAINTED_PROPS) showed 9 of 14 TNB moves drew no painted props. Wired the four that already had painted art: Don't Split Up and Slasher Jump Scare use `tnb/flashlight`; Slasher Jump Scare's figure is the painted `tnb/slasher_standee` (`slasher()`); Kiln Door Policy uses `tnb/brick_kiln` (`paintedKiln()`: painted body, soft heat glow, glowing open door, chimney steam; the animated drawn kiln stays as fallback); Throw Down uses `tombo/pottery_wheel` (the spin smear ring stays; the drawn electric wheel is the fallback). All preloaded in engine/prop-art.js.
- Still code-drawn, need custom images (list in the project doc claude/tnb-custom-art-needed.md): Scope Creep (laptop, Gantt chart), Round with Jojo (disc golf basket, flying disc), Tasting Menu (cloche, long table, plates, the check folder), Just Around the Bend (trail sign, hill backdrop, snack), Throw Down (clay lump stages, finished bowl), Baxter Street Bomb hill backdrop.
- Tests: kit_test for the four moves (frames looked at, PAINTED_PROPS confirmed), IDS=tnb smoke clean. Tags `?v=tpa1` on prop-art.js, tnb-moves.js, main.js; title stamp `build tpa1`.

## 2026-10-30 (night, 13): Nara's painted props

- Tom (23:26) sent Nara's prop sheet, the Chairman Cheeks sheet and the HUMAN EYES face. 17 props cut to `art/props/nara/` (gold coins, muddy paw print, tennis ball, sandwich whole and bitten, happy puddle, fancy and homemade covered dishes, HOMEMADE stamp, oak tree, park bench, squirrel x4, face eyes open and closed). Sheet 1 cells 12 to 15 came back wrong (dog house, red bow, gift box, bouquet): acorns, oak leaves, tennis ball pile and golden crumb still need a redo sheet (prompt: claude/nara-props-redo.txt).
- Wired in `engine/nara.js` (painted first, drawn version is the fallback): every tennis ball helper, coins and muddy paws in Jump Up, sandwich in Just One Bite, puddle in Happy Puddle, both dishes and the stamp in Family Food Inspector, the full-screen face (blinks to the closed one) in HUMAN EYES, and in CHAIRMAN CHEEKS! the squirrel (peek, run, tip hat, on branch), oak tree and flying bench. The puddle is now blue water, not yellow.
- `tools/sprite-bake/bake_prop_sheets.py`: new sheets, a 2 x 1 grid for the face sheet, `MAXSIDE_BY` (faces are cut at 560 px), `TOTAL` for sheet 1.
- Tests: kit_test nara (tennis_ball_fetch, just_one_bite, happy_puddle, food_inspector, puppy_eyes, jump_up, squirrel_ult) 0 fails, frames looked at; smoke (default and IDS=nara) 0 fails. Tags `nara.js?v=np1`, `prop-art.js?v=pea2`, `main.js?v=np1`, title stamp `build np1`. Live URL not checked.

## 2026-10-30 (night, 12): Chapter 6 kitchen, TNB is already there

- Tom (23:16): in chapter 6 TNB was not in the house when Tom arrived, then appeared out of nowhere. Cause: `SCENES.ch6Kitchen` in data/scenes.js hid TNB and only placed him at the island after Tom had walked in. Now TNB is placed at the island (back to the door, looking at the flour) before Tom walks in, turns to face Tom when he arrives, then says his line.
- Tests: ch6Kitchen played in a headless run (frames looked at), smoke IDS=tnb clean. Tags `?v=kit1` on scenes.js and main.js; title stamp `build kit1`.

## 2026-10-30 (night, 9): Garden Shower is a hard jet, not a lob

- Tom: the spray looped up and drifted down; it should blast the enemies directly. `SC.df_hose` (engine/deedee-moves.js, last definition) is rebuilt as a pressure jet: three layered streams plus four thin side jets shot nearly straight from the nozzle to a target that sweeps across the row (only a 6 px droop), a nozzle blast, 26 fast droplets racing down the jet, and an impact burst at the target (white blob, ring, droplets thrown back off the monsters, mist). The old arching fan, rainbow and glints are gone. Each monster now flinches (`ST.jolt`) as the jet passes over it, then the existing SPLOOSH hit and damage land as before (numbers, hit time, line unchanged, no re-bake).
- Tests: `kit_test.py deedee --only=garden_shower --speed2` 0 fails, frames looked at; `IDS=deedee smoke.py` 0 fails. Live URL not checked. `deedee-moves.js?v=gs2`.

## 2026-10-30 (night, 10): Chapter 1 pie theft: the mud blob now shoves everyone aside

- Tom (22:59): the blob walked onto Rose's tile and overlapped the party. Now (scene `ch1Theft`, data/scenes.js): the blob charges up the middle and bowls over Tom, Grace and Rose, who fly back in their battle hurt frames and land lying down in the KO frames (bounce, thud). Deedee hops out of its way. The blob squelches diagonally to the counter, grabs the tin, and Rose, still on the floor, says her line. As the blob leaves down the middle, Tom, Rose and Grace kneel (painted kneel frames) and stand back in their original line, and Deedee hops back to her spot. Nobody is overlapped at any point.
- New scene steps (engine/story.js): `{pose:id,f,dir}` (hold a battle frame), `{knock:id,to,delay,dir}` (thrown and lands lying), `{getup:id,to,delay,dir}` (kneel, slide to a tile, stand), `{cam:[x,y]|null}` (hold the camera still so a fling does not drag the screen). `scenePoseDraw` scales battle frames to match the overworld figure; `drawSheetActor` (engine/town-render.js) draws them. `updateCamera` honours `sceneCam`.
- No spoken line changed (no re-bake). New tool: `tools/scene_frames.py` plays a scene and saves frames (`FROM=doorIn SCENE=ch1Theft python3 tools/scene_frames.py`, `LAND=1 VIEW=860x430` for landscape).
- Title stamp `build shove1`; tags `?v=shove1` on overworld.js, town-render.js, story.js, scenes.js, main.js.
- Not changed: the painted pie on the baking island stays in the painting after the theft.
## 2026-10-30 (night, 11): Foraged at Dawn uses a painted plate

- Tom (23:08): TNB's forage move still used old graphics. The plate and pea were drawn with code shapes while everything else in the battle is painted. New painted prop `art/props/tnb/pea_plate.webp` (the painted dinner plate with a gold rim, herb-oil swoosh, microgreens, a flower and one glossy pea), built by `python3 tools/sprite-bake/build_pea_plate.py`. `peaPlate()` in engine/tnb-moves.js draws it for both the carried plate and the one set down at the friend; the drawn plate stays as the fallback and for the other dishes. Preloaded in engine/prop-art.js.
- Not changed: the speech bubble and its pixel-font words (UI, not a prop). Tell Tom if he wants those painted too.
- Tests: kit_test tnb foraged_at_dawn (frames looked at), smoke IDS=tnb clean. Tags `?v=pea1` on prop-art.js, tnb-moves.js and main.js; title stamp `build pea1`.

## 2026-10-30 (night, 8): Garden Shower uses painted Deedee

- Tom: Garden Shower was showing a frame of her old graphic. Cause: while she aimed the hose (walk-up and the whole spray hold) the move used the base `aim` frame, which the painted set never replaced, so she shrank to the old pixel sprite. The last `D.garden_shower` in engine/deedee-moves.js now uses the painted `x_flick` pose (arm thrust toward the row, wide stance) via `DD_XF('flick','aim')`; the old frame is only a fallback if the painted set is missing. Hose prop, spray, timings, damage and lines unchanged (no re-bake).
- Tests: `kit_test.py deedee --only=garden_shower --speed2` 0 fails, frames looked at; `IDS=deedee smoke.py` 0 fails. Live URL not checked (sandbox cannot reach github.io). Stamp unchanged; `deedee-moves.js?v=gs1`.

## 2026-10-30: Floor Is Lava: cushion twice as big

- Tom: the cushion Rose stands on was too small. The painted `rose/couch_cushion` in `seatCush` (engine/rose-moves.js) is now drawn 136 x 76 (was 68 x 38), re-centred so her feet stay on its top face; its shadow on the lava is doubled and the lava pool grows 26 px right and 16 px down to cover it. Cache tag `rose-moves.js?v=lv3`.
## 2026-10-30 (night, 7): Tom's NO TOUCHING sign faces the monsters

- Tom: the sign faced the party, it should face the monster. The painted sign was drawn in three-quarter view turned to the right (its board edge shows on the left). New art `art/props/tom/no_touching_sign_l.webp` is the same sign turned to the left (board edge on the right) with the lettering and hand still reading the right way round; it was built from the original by re-fitting the unwrapped face into the mirrored frame. Defend (`tm_placard` in `engine/tom-moves.js`) and the preload list (`engine/prop-art.js`) now use it. The old `no_touching_sign.webp` stays in the repo, unused.
- Tests: kit_test tom defend (frames looked at, zoomed), smoke IDS=tom clean. Tags `?v=ns1` on tom-moves.js and prop-art.js.

## 2026-10-30 (night, 10): Penny stands behind her shop counter

- Tom (22:55): in Penny's Pockets, Penny should be behind the counter. She stood on the customer side (tile 8,7); she is now one row behind the counter's back edge (tile 8,4) in `data/maps-le.js` (room `shop`), so she faces you across the register. The counter object (tiles 4,4 to 11,6, `shop:true`) still takes the A button from the row in front of it, checked: facing it from (8,7) opens her shop. No walk-mask change (she is not on a walkable tile, and `roam:0`).
- Portrait looks right with Tom at the counter. Landscape: the camera crops the back of the room, so only her feet show at the edge. Tell Tom if he wants the landscape camera nudged for this room.
- Build stamp `build penny1`, `maps-le.js?v=penny1`, `main.js?v=penny1`. No spoken lines changed.

## 2026-10-30 (night): Beanie Master: "Oh my!" half a second later

- Deedee's "Oh my!" (and her covered-mouth pose, `engine/deedee-moves.js`) now comes at 4.2 s instead of 3.7 s, so it lands as the golden glow reaches her face (4.25 s). Her walk back and the end of the move moved back 0.5 s with it. Hit and fart timing unchanged.

## 2026-10-30 (night, 9): Rose: "YOU NEXT" marker no longer a long pink string

- Tom (22:36): at the end of Piggyback Pounce a weird string seemed to pull Rose back. It was the "YOU NEXT" arrow (scene `ro_tip`, engine/rose-moves.js), a line drawn from Rose's hand to the most hurt friend, so it stretched across the screen and followed her home. Now it is a short "YOU NEXT" tag with a small down arrow and hearts that bounces in over that friend. Same timing, same game effect. Also used by Ribbon Rescue, which shares the scene. Tag `?v=rt1` on rose-moves.js. Tests: kit_test rose piggyback_pounce (frames looked at), smoke IDS=rose clean.

## 2026-10-30 (night, 5): Square walk-behind, roof tips

- `PLATE_BEHIND` now covers the roof peaks and chimneys of Snail Mail, Kettle Cottage, Moon Club (roof and gold sphere) and Taxi Co., so anyone standing on the walkway just north of them (row 13) is behind the roof, not drawn on top of it. Base 940 keeps the alley (col 22, row 14) and the south street unaffected. `plate.js?v=behind4`.
- Title stamp is unchanged (`build grace3` from the Grace session); roof tips ship as `plate.js?v=behind4`.
- Checks: smoke clean, reach_test town 0 fails, phone screenshots with Tom at each shop's peak.

## 2026-10-30: Beanie Master: fart one second longer, soft golden good-mood glow

- The fart now runs about 2.3 s (was about 1.3 s): `sfx.toot` has twice the flutter and a longer rumble and sputters, the mist (`SC.dv_cloud`, 3.4 s) streams out continuously instead of in one burst, and the beats after it moved back 1 s (Oh my 3.7 s, chime 4.25 s, end 5.8 s). The hit (GAG) is unchanged at 2.25 s. Peak level 0.78, no clipping.
- The hard gold orb with spokes that flew to her face (`SC.dv_buff`) is now a soft golden glow with fine twinkles that settles on her face, matching the mist.

## 2026-10-30 (night, 8): Open Strings: quicker tail after the screech

- Tom (22:35): after the notes, the rest of the animation should be faster. The tail (string snap, push through, big finish, listen, shrug, six lessons, bow, proud, walk home) now runs from 3.75 s to 6.8 s instead of 3.9 s to 8.0 s (`T` table in `G.open_strings`, engine/grace-moves.js). Tag `?v=gx2` on grace-moves.js. Tests: kit_test grace open_strings (tail frames looked at).
## 2026-10-30 (night, 7): Grace: three gymnastics primaries replaced (Open Strings, Portrait Mode, Bedazzle Blast)

- Tom (21:35): too many gymnastics moves. Three Primary slots re-themed to her real interests; every number, target, element, VP cost, status effect and crit bonus is unchanged (only key, name, description, spoken line and animation changed). Director's Cut versions untouched.
- B2 `beam_dismount` -> `open_strings` (first-year violin screech; row hit, Hooked 2 turns). B4 `split_leap` -> `portrait_mode` (she draws the monster; one hit, wind-up cancelled, most hurt friend Guarded). B5 `chalk_up` -> `bedazzle_blast` (rhinestone gun; row hit, +25% crit; foes that crit get the sharp gem).
- New painted sheets `tools/sprite-bake/src/grace-violin-v1.png`, `grace-portrait-v1.png`, `grace-bedazzle-v1.png` (16 frames each: os_*, pm_*, bz_*), baked by the new `tools/sprite-bake/bake_grace_extra.py` into `art/chars/grace-extra.webp` and `data/grace-extra.js` (GRACE_EXTRA), registered as sprite frames in `data/grace-hires-use.js` (plus mirrored `os_arriveR`, `pm_leaveR`, `bz_arriveR` for the walk home). Props: 20 new Grace props (ids 16 to 35 in props.json; sheets `src/props/grace-violin-sheet.png`, `grace-portrait-sheet.png`, `grace-bedazzle-sheet.png`), preloaded in `engine/prop-art.js`.
- Moves: new block at the end of `engine/grace-moves.js` (scenes `gx_`). Keys changed in `data/battle2-data.js`, `data/abilities.js`, `data/lines.js` (new lines added; old lines kept), `data/battle-emoji.js` (BE_MAP, existing pictures 1f3b5, 1f3a8, 2728), `tools/build_bp_emoji.py`, `docs/MOVE_KEYS.md`.
- NEEDS RE-BAKE (Grace, Ivy voice): "I've only had six lessons, okay?", "Hold that pose. Perfect, don't move.", "Hold still, you need more sparkle!" Until then the browser voice reads them. Old clips for Beam Dismount, Split Leap and Chalk Up are no longer used by a Primary.
- Tests: kit_test grace open_strings, portrait_mode, bedazzle_blast (frames 0.5 to 8.8 s looked at; props drawn; Hooked and Guard applied), smoke IDS=grace clean. Tags `?v=gx1` on grace-moves.js, grace-extra.js, grace-hires-use.js, prop-art.js; title stamp `build grace3`, `main.js?v=grace3`.
## 2026-10-30 (night, 6): Almond Milk, Please: Amy kicks a carton of cow's milk at the foes

- Tom (21:47): a carton of cow's milk appears and Amy kicks it onto the enemies to splash them; the dairy-free treats half stays. New painted sheet `tools/sprite-bake/src/amy-milk-v1.png` (16 frames mk_spot ... mk_wink, baked at Tom's exact size by `bake_amy_extra.py` into `art/chars/amy-mk.webp` and `AMY_HIRES_X.mk`, registered in `data/amy-hires-extra-use.js`) and six props `amy/milk_carton`, `milk_carton_dented`, `milk_burst`, `milk_splat`, `milk_crown`, `milk_puddle` (`src/props/amy-milk-sheet.png`, ids 40 to 45 in props.json).
- `A.oat_milk_please` (last definition, `engine/amy-moves.js`) rewritten: carton pops in and trembles, Amy glares, says no, lines up, winds up and kicks, the carton tumbles to the front foe and bursts (fired by the carton scene itself so it stays in step), milk crowns at every foe's feet, splats on each body, puddles behind them; then she runs to the friend (or stays put when self-targeted) for the latte and cookie as before. Pizza and grumpy pair are no longer used. Numbers, heal, spoken line unchanged. The kick is visual only. Kindness on a monster skips the kick.
- Fallback latte label now ALM (was OAT). Tags `?v=milk1` on amy-moves.js, amy-hires-extra.js, amy-hires-extra-use.js, prop-art.js. Tests: kit_test amy (ally, self, kindness), smoke IDS=amy clean.
## 2026-10-30 (night, 6): Tom's Defend uses his painted poses

- Tom: Defend still used old graphics. Cause: `Tm.defendShow` in `engine/tom-moves.js` held the punch frame (`act`) while he guarded, and drew a hand-made pixel stop hand on top of him. He now uses the painted `proud` pose while he tidies his sleeve and the painted `defend` bodyguard pose (open stop hands) for the stance, with the painted run and walk to reach the ally and return. The pixel hand (`tm_stophand`) is replaced by a soft blue guard shimmer in front of his hands. The painted NO TOUCHING sign was already in place.
- Known: the drawn sign only shows if a fight starts in the first few seconds after the page loads, before the sign image has preloaded.
- Tests: kit_test tom defend (frames looked at, zoomed), smoke IDS=tom clean. No spoken lines changed. Cache tag `?v=df1` on tom-moves.js.

## 2026-10-30 (night, 5): Battle Lab: a way out of every fight

- Tom: no way to leave a Battle Lab fight and get back to the lab list. Cause: boss fights are flagged no-run, so the bag's RUN only said the boss "blocks the way out". Lab fights (`b2Lab`, `lab:true` in the `b2Start` config) now show EXIT LAB in the bag where RUN was, and it always works, boss or not: "Leaving the Battle Lab." then `b2End('run')` returns to the lab list on the same page (`splashToLab`). The command cross BAG button reads "N items . EXIT" in lab fights so it can be found. Story fights are unchanged (RUN still blocked by bosses).
- Files: `engine/battle2.js` (`b2Lab`, `b2RunSteps`), `engine/battle2-ui.js` (`b2BagList`, `b2RenderCmd`). Cache tags `labx1` on both.
- Title stamp now reads `build lab1` (`main.js?v=lab1`) so Tom can confirm his phone has this build.

## 2026-10-30 (night, 5): every Amy jump uses the new painted frame

- Tom: replace any other jump animations with the new Burpee Blitz jump. In `data/amy-hires-extra-use.js` the stock frame `jump` is now the painted arms-up pose (`s13_bjump`, was `s12_jump`), and `bjump` is the same frame, so Burpee Blitz, Gold-Star Recess, Pop Quiz, Negative Split and anything else that asks Amy for `jump` get it. The old `s12_jump` art is still baked in `AMY_HIRES_X.bs` but unused. Her `leap` (sprint) pose is a different frame and was left alone.
- Cache tag `amy-hires-extra-use.js?v=bj2`. Tests: kit_test amy burpee_blitz, kettlebell_swing, goldstar_recess, false_start, negative_split, pop_quiz (frames looked at), smoke IDS=amy clean, in-page check that `BATTLE_SPRITES.amy.jump` is the new frame.



## 2026-10-30 (night, 4): build stamp shows the build name

- The title-screen stamp (bottom left, `engine/main.js`) now reads `build walk3` (was a fixed `build ride 6`) so Tom can say which copy his phone runs. Change the word on any push that Tom needs to confirm. `?v=walk3` on main.js.
- Square walk-behind re-verified with real key presses: Tom walks across row 9 behind the fountain top and is hidden by the bowl and jets; he walks to (26,10), (24,10), (23,10) under the east tree canopy and is hidden. Tom's 10:00 phone screenshot still showed the old build (GitHub Pages serves files with a 10 minute cache and the home-screen app keeps old pages); RELOAD on the title screen clears it.


## 2026-10-30 (night, 4): Burpee Blitz: new painted final jump

- Tom's painted jump (arms up, hands clapped overhead, hair and whistle flying) replaces Amy's stretched rig jump in Burpee Blitz only. Source `tools/sprite-bake/src/amy-burpee-jump.png`, baked by `bake_amy_extra.py` as pose `s_s13_bjump` (pre-scaled so chin to soles matches her standing frame, head factor 1.6, no distortion) into `art/chars/amy-bs.webp` and `AMY_HIRES_X.bs` (`data/amy-hires-extra.js`). Registered as frame `bjump` in `data/amy-hires-extra-use.js`; the last `A.burpee_blitz` in `engine/amy-moves.js` uses `bjump` for the jump after each rep and for the final uppercut leap. Her other moves still use `jump`.
- Her head is a little smaller than in her other frames: the art was drawn with realistic proportions, and a bigger head factor stretched the arms. A redraw in the attack-sheet proportions would match better.
- Cache tags `?v=bj1` on `amy-moves.js`, `amy-hires-extra.js`, `amy-hires-extra-use.js`, and on the `amy-bs.webp` atlas path.
- Tests: kit_test amy burpee_blitz (6 frames looked at), smoke IDS=amy clean.
## 2026-10-30 (night, 4): Grace faces the way she walks in Squishy Squeeze

- Tom: Grace walked backwards at the end of Squishy Squeeze. Her walk out and back was fixed as left-out, right-back, but the ally's spot (for Tom, Rose and Amy) sits right of her own home, so both legs faced the wrong way. `G.squishy_squeeze` in `engine/grace-moves.js` now picks the facing from where she is going. Self-squeeze is unchanged.
- Checked with kit_test frames (out and back, zoomed) and smoke for Grace. Cache tag `sq1` on grace-moves.js.

## 2026-10-30 (night, 3): Amy drinks almond milk, not oat milk

- Tom: Amy's "Oat Milk, Please" is now "Almond Milk, Please". Changed: the move name (`data/battle2-data.js`, `data/abilities.js`), its description, the battle messages in `engine/amy-moves.js`, her Gel Pack description, the Gregori kitchen island line (`data/maps-le.js`) and the spoken line in `data/lines.js` ("No dairy, thank you. Almond milk, please!").
- Move key `oat_milk_please` and `rx_oatgel` are unchanged (saves, icons and emoji map use them). Left alone on purpose: TNB's coffee order, the Oat Milk Latte shop item in LA, Juniper's café joke.
- NEEDS RE-BAKE: the baked Amy clip for the old line no longer matches, so the line plays with the speech-synthesis fallback until re-baked. New script is in `tools/battle-baker/handscripts.txt` (amy, oat_milk_please).
- Cache tags `almond1` on lines.js, amy-moves.js, battle2-data.js, abilities.js, maps-le.js.

## 2026-10-30 (night, 3): Square walk-behind, third pass (fountain top, east tree)

- Characters can now stand behind the top of the wish fountain (row 9) and under the east plaza tree's canopy (rows 10 and 11, cols 25 to 29 only where painted ground is open). Mask rows 9 to 11 edited in `data/maps-le.js`; the `Wish fountain` touch object now covers rows 10 to 12 (was 9 to 12) so the ground behind it is walkable. `?v=square5` on maps-le.js.
- New `PLATE_BEHIND` zones in `engine/plate.js` (`?v=behind3`): the fountain's upper bowl and jets, and a slightly wider east tree ellipse.
- Lamp posts: confirmed working in the current build (head, pole and foot redrawn over an actor standing north of the lamp). Tom's phone screenshot at 9:50 showed the pre-lamp version, so the phone had a cached build.
- Checks: smoke clean, reach_test town 0 fails, camera clamp clean, screenshots at the fountain, the east tree and the lamp with Tom walking.

## 2026-10-30: Floor Is Lava: bigger lava pool under everyone

- Tom: the lava was small and hidden behind the enemies. The painted pool in `engine/rose-moves.js` (`Rm.floor_is_lava` wrapper) now spans from 52 px left of the row to 84 px right of Rose's cushion, 30 px above the rear enemy's feet to 30 px below the front one, and is drawn 15 percent larger (2.4x instead of 2.08x). Lava now shows around every enemy's feet and under Rose. Cache tag `rose-moves.js?v=lv2`.

## 2026-10-30 (night, 2): Square walk-behind, second pass

- `PLATE_BEHIND` now also covers the two plaza lamp posts (head, pole and foot as separate shapes), the Taxi Co. roof edge and side wall over the alley beside Moon Club (new polygon shape, `pts`), and the plaza east tree (tighter ellipse than the first attempt). `?v=behind2` on `engine/plate.js`.
- SCHOOL board and shop awnings need nothing: nobody can stand north of the SCHOOL board's posts, and no walkable tile lies under a shop awning. The lamp by Taxi Co. sits on the door-step row, so it is left alone.
- Checks: smoke clean, reach_test town 0 fails, phone screenshots at both lamps, the Taxi alley and the east tree.

## 2026-10-30: Konami Code controller draws under Tom

- The giant floor controller (`SC.tv_konmat`) was a front scene, so it painted over Tom while he hopped from button to button. It is now a `back:true` scene (drawn before the party and foes, like the lie-flat pod), so Tom stands on it. The code readout at the top (`tv_code`) stays in front. Nothing else about the move changed.
- Cache tag `tom-moves.js?v=kc1`. Tests: kit_test tom konami_code, smoke IDS=tom.

## 2026-10-30: Pepper Breath rebuilt from a painted 16-frame sheet

- Tom's sheet `tools/sprite-bake/src/boppy-pepper-v1.png` (4 x 4, magenta) baked by `bake_boppy_extra.py` into `art/chars/boppy-pepper.webp` and `BOPPY_PEPPER` in `data/boppy-extra.js` (frames `pb_walkA, pb_walkB, pb_present, pb_admire, pb_raise, pb_crunch, pb_chew, pb_burn, pb_fan, pb_inhale, pb_breathA..C, pb_gasp, pb_grumble, pb_smug`, plus mirrored walks), registered in `data/boppy-hires-battle.js`. Smug frame is 75 rows tall so his head matches his idle.
- `tools/sprite-bake/boppy_pepper_mouth.json` holds each frame's mouth point (`sp.mouthAt`); the fire cone, CRUNCH and steam follow it. `B.pepper_breath` in `engine/boppy-moves.js`: walks over, presents, admires, raises, crunch, chew, burn, fan, inhale, three breath frames with the cone (hit still at 2600 ms), gasp, grumble (MY STOMACH), smug, walks back. The code-drawn pepper and red-face overlay are no longer used here. Line, damage and sounds unchanged; move is about 1 s longer.
- Cache tags `boppy-moves.js?v=pb1`, `boppy-extra.js?v=pb1`, `boppy-hires-battle.js?v=pb1`. Tests: kit_test boppy pepper_breath (14 frames looked at), smoke IDS=boppy clean.

## 2026-10-30: Lamby Boomerang rebuilt from a painted 16-frame sheet

- Tom's sheet `tools/sprite-bake/src/rose-boomerang-v1.png` (4 x 4, magenta): cells 1 to 8 are Rose, 9 to 16 are Lamby and Backup Lamby in flight. `bake_rose.py` bakes Rose into her own atlas `art/chars/rose-battle-bm.webp` and `ROSE_HIRES.bm` (frames `bm_windA, bm_windB, bm_throw, bm_follow, bm_watch, bm_reach, bm_catch, bm_cheer`, registered in `data/rose-hires-use.js`), and the lambs into a prop atlas `art/props/rose/lamby_fly.webp` (4 x 2 cells of 160 px: front, side, flip, squash for each lamb; preloaded in `engine/prop-art.js`).
- `Rm.lookout_lamby` and `SC.rg_boom` (the live version, near the end of `engine/rose-moves.js`): Rose stays in her spot with a lamb in each hand (painted in the wind-up frames), winds up, throws, the lambs spin through the monster on their loops (front, side and tumble frames, a flat squash on each hit), she watches, reaches, catches both (painted in her arms), cheers, then hops onto Tom's shoulders as before. Hit times, damage, effect, line and the shoulder ride are unchanged (hits are 60 ms apart instead of 140).
- Known flaw in the art: in cell 2 (`bm_windB`) the second lamb looks cream instead of lavender-grey. Cache tags `rose-moves.js?v=bm3`, `rose-hires.js?v=bm1`, `rose-hires-use.js?v=bm1`, `prop-art.js?v=pa6`. Tests: kit_test rose lookout_lamby (12 frames looked at), smoke IDS=rose clean.

## 2026-10-30: Retail Therapy: old drawn graphics replaced

- Tom: Retail Therapy still showed old pixel art. In `Tm.overpriced_gadget` (`engine/tom-moves.js`) the painted box, gadget and roll were fine, but three effects were still hard-edged drawn shapes: the light rays (flat triangles), the sparkles around the gadget (pixel stars), and the receipt (a flat white rectangle with black outline and dashes, covering Tom's face, with a pile of little white rectangles).
- Now: rays fade out with a gradient, sparkles are soft glints, the receipt is shaded paper with faint printed lines and a torn end hanging beside Tom, and the floor pile uses the painted receipt roll. Text callouts (RETAIL THERAPY, WORTH IT., $1499.99) are the shared pixel text and were left. Script tag bumped to `?v=rt1`.
## 2026-10-30: Tickle Storm rebuilt from a painted 16-frame sheet

- Tom's new sheet `tools/sprite-bake/src/rose-tickle-v2.png` (4 x 4, magenta, Rose facing left) is baked by `bake_rose.py` into its own atlas `art/chars/rose-battle-tk.webp` and `ROSE_HIRES.tk` (rows use the existing battle palette, so no other Rose frame changed). `data/rose-hires-use.js` registers the frames as `tk_ready, tk_creepA, tk_creepB, tk_launch, tk_air, tk_land, tk_tickleA to D, tk_feather_draw, tk_feather_swish, tk_feather_twirl, tk_finale, tk_doubled, tk_proud`.
- `Rm.giggle_storm` (end of `engine/rose-moves.js`) now plays: flex fingers, tiptoe sneak, crouch, pounce in an arc, four-pose tickle blur, pull out the rainbow feather, swish, twirl in the feather storm, ta-da, doubled-over laugh, then runs home. Hits (34, 33, 33 at 1.9, 2.3, 2.7 s), the spoken line and the damage are unchanged. The move now lasts about 5.6 s (was 4.4).
- Cache tags: `rose-moves.js?v=tk1`, `rose-hires.js?v=tk1`, `rose-hires-use.js?v=tk1`. Tests: kit_test rose giggle_storm (12 frames looked at), smoke IDS=rose clean.

## 2026-10-30: Boppy's Recliner Reservation: the target sits in the chair

- Tom: when Boppy uses the recliner on someone, that person now walks into the chair the moment it lands (THUMP), sits while the heal and shield play, then gets up and walks back to their spot. Self-target is unchanged except Boppy is now drawn on top of the chair while he sits (the chair scene is drawn over the party, so he was hidden behind it).
- Change in `engine/boppy-moves.js` only: the later `B.recliner_reservation` wrapper poses the target through `ST.keys(battle.fx[t.idx], ...)` (same idea as Grace's dance) and `SC.bp_chair` redraws seated units over the chair (`RECL`). Seated pose is each character's `sit` frame if they have one, else their `kneel` frame (Tom, Grace, Rose, Amy, Deedee use kneel). Not done when the target is KO'd or an enemy (Kindness). Cache tag `boppy-moves.js?v=rc1`.

## 2026-10-30: Rose's Bedtime Story outlasts her voice line

- Tom: the animation finished when the voice clip did. The baked clip is about 7.2 s; the move ended at 4.6 s (3.9 s when Rose reads to herself), so the line was cut off by the result. `Rm.bedtime_story` in `engine/rose-moves.js` is retimed: page turns at 3.2 s and 5.0 s, heal at 6.0 s, THE END at 6.5 s, celebration at 7.0 s, finish at 8.8 s (8.2 s solo). Night overlay, Zzz and Backup Lamby's Z follow the new times. Spoken line unchanged. Cache tag `rose-moves.js?v=bs2`.
## 2026-10-30: Floor Is Lava: old drawn lava removed

- Rose's Floor Is Lava still played the old flat orange ovals (`SC.rv_lava` in `engine/rose-moves.js`) on top of the new painted lava pool. `SC.rv_lava` is now a no-op, so only the painted pool and painted couch cushion show. The "THE FLOOR IS LAVA!" and "HOT HOT!" text callouts and the HOT labels are unchanged. Cache tag `rose-moves.js?v=lv1`.
## 2026-10-30: Deedee's victory cheer uses the painted Deedee

- Tom: in the win animation, some frames showed her old pixel character. Cause: `data/deedee-hires-battle.js` swapped in the painted `celeb` and `celebFlip` frames but left `sp.cheer` (the pair `engine/battle-draw.js` plays for victory and level-up cheers) pointing at the old pixel pair from `data/deedee-poses.js`. Amy, Boppy and TNB already reset it.
- Fix: `sp.cheer=[sp.celeb,sp.celebFlip]` and `sp.idle2=sp.idle` (same leftover, used by Nara's sniff scene). Script tag bumped to `?v=dcheer1`.

## 2026-10-30: Rose is painted again in the overworld (was pixelated)

- `data/recruit-sprites.js` scaled Rose's overworld set by a fixed 0.82. That scaling rebuilds each frame as plain pixel rows and drops the painted-frame tag, so her painted art fell back to chunky blocks. It now follows the same rule as everyone else: `ROSE_OW.hires?1:.82`, so the painted Rose is drawn untouched at full size (36 rows next to Grace's 39). The 0.82 stays only as the fallback for the old pixel Rose. `engine/gear.js` already expected scale 1 for painted Rose.
- Cache param bumped: `data/recruit-sprites.js?v=rose1`.

## 2026-10-30: Seat 1A: Tom now lies on the lie-flat pod

- At the end of Seat 1A Tom tipped over in mid-air with nothing under him (and the sleep mask landed on the wrong spot). The painted lie-flat pod now slides in beside the party and Tom rests on its mattress, with the sleep mask and Zs, same placement as Boarding Group Zero. When Tom tucks himself in, the pod's own bedding replaces the separate duvet. `tom-moves.js?v=tom9`.
## 2026-10-30 (night): Square walk-behind (first map with a foreground effect)

- New `PLATE_BEHIND` zones and `plateWalkBehind()` in `engine/plate.js`, called from `engine/draw.js` right after the actors are drawn. When an actor's feet are north of a zone's base line and the body overlaps the zone, that slice of the painting is drawn over the actor again, so Tom, the family and townspeople walk behind it.
- Square zones: GRUMP HOLLOW board and its two posts, RIVITUSO ROW board and its two posts, the tree between Snail Mail and Kettle Cottage, the tree between Moon Club and Taxi Co., and the two big trees at the bottom edge. The east plaza tree was left out (no walkable ground behind it).
- Not covered yet: shop awnings and roof eaves along the alleys, lamp posts, every other map. Zones are defined per map id in `PLATE_BEHIND`; add them as each area is installed.
- Checks: smoke clean, reach_test town 0 fails, phone screenshots at the south board, both mid trees and the bottom tree looked at.

## 2026-10-30: Beanie Master cloud is a fine mist, toot louder again

- `SC.dv_cloud` in `engine/deedee-moves.js` is now a fine green mist (many faint soft blobs, a spray of tiny specks, thin curling wisps, no outlines) that drifts to the monster and settles on it. The blast at her back (`SC.dv_toot`) is a soft mist pop with a thin ring and fine lines instead of outlined puffs.
- `sfx.toot` is about 1.45x louder than the first fix: measured peak 0.76, about 8x the original toot, no clipping.

## 2026-10-30: Beanie Master: louder fart, painted puffs, no repeated line

- Deedee's Beanie Master (`engine/deedee-moves.js`): `sfx.toot` is now a real fart (air "pfft", fast fluttering buzz that sags in pitch, rumbling body, three sputters). Measured peak is about 5x the old toot and above the laser, with no clipping.
- The green cloud (`SC.dv_cloud`) now uses outlined, shaded, highlighted puffs and outlined stink lines, plus a new blast at her back (`SC.dv_toot`: shock rings, jagged lines, a pop) and an outlined "PFFFT!". Same timing, hit and numbers.
- The repeat: the baked "I am the Beanie Master!" clip is 3.97 s and holds a stray third burst (3.06 s on) that sounded like she started again, overlapping "Oh my!". The move now plays only the first 2.85 s of that clip (the slice applies only while the clip length is 85320; a re-bake plays whole). The clip itself is untouched; a re-bake would remove the stray burst for good.

## 2026-10-30: Battle Lab is bosses only, with a difficulty step and pages
- ADMIN > BATTLE LAB now asks for a difficulty first (Easy, Medium, Hard), then lists one fight per chapter boss, chapters 1 to 20 (chapter 20 has two: Leviathan and Julian), six to a page with PREV PAGE and NEXT PAGE. Chapter 18's boss is a survival fight that cannot be won, and its row says so. The old crew fights and Family Finish test are gone from the list.
- Fixed the cut-off top: the title panel is now capped to the screen height and its list scrolls if it is ever taller.
- Files: data/battle2-data.js (B2_LAB), engine/splash.js, index.html (CSS, ?v=lab2).
## 2026-10-30 (evening): The Square, lettered painting installed

- `art/town.webp` is Tom's lettered painting (`docs/reference/town_v4_from_tom.png`, 1347 x 1167, scaled to 1920 x 1664) with the LARGE fountain composited back from the previous plate (feathered ellipse, x 640 to 1100, y 540 to 880). The small notice board went with it.
- Game-drawn lettering off for the Square (`PLATE_SIGNS.town = []`); the generator paints all eleven boards, spelled correctly.
- Walk map: the north-east street (cols 27 to 28, rows 1 to 8) is now blocked, because the painting closes it with a fence and trees. West edge was already blocked. `Town notice` object removed.
- Known, Tom accepted: a few shop boards still sit close to their awnings (Crumb, Penny's, Kettle, Taxi); the A-frame chalkboard by Kettle Cottage is still painted. Redo prompt is in claude/next.md history if wanted.
- Tests: reach_test town 0 fails, smoke clean, camera clamp unchanged.

## 2026-10-30: Sourdough Snob uses the painted loaf

- The whole boule Tom carries and lifts for "ADMIRE THE CRUST" (`loaf()` in the Sourdough Snob section of `engine/tom-moves.js`) was still the code-drawn loaf. It now draws `art/props/tom/sourdough_boule.webp` (same art as Crumb Shot); the drawn loaf stays as the fallback. The slice and the easel chart were already painted. Script version `?v=tom10`. Tests: kit_test tom sourdough_snob (painted boule hits 327), smoke, frames looked at.

## 2026-10-30: Glitter Nails now shows the painted nail

- A later override of `gv_bignail` in `engine/grace-moves.js` still drew a pixel hand on each friend, so the first wiring never reached the live move. It now draws `grace/giant_glitter_nail` (the drawn hand stays as fallback). The painted bottle was already in. `grace-moves.js?v=pa3g`.
- Lesson: several moves are defined twice and the last definition wins; PAINTED_PROPS listing a slug for a move does not prove every drawn part of that move is painted.

## 2026-10-30: Starter Splash wave matches the painted look

- The wave of starter, the flying drops and the floor puddles in Tom's Starter Splash (`SC.tv_wave`, `SC.tv_goo` in `engine/tom-moves.js`) were flat cream shapes with a hard black outline. They now use the painted jar's dough: smooth gradient, glossy bubble holes, warm brown outline, rounded blob edges, foam balls on the crest. Timing, damage and sounds unchanged.
- Script version bumped to `?v=tom9`. Tests: kit_test tom starter_splash and smoke, frames looked at.

## 2026-10-30: Painted props wired into the rest of the cast (Grace, Amy, Deedee, Boppy, TNB, Tom)

- Grace 10 of 12, Amy 36 of 36, Deedee 25 of 26, Boppy 26 of 26, TNB 6 of 24, Tom 17 of 17 (with Rose's 24 and the Tombos, every painted prop is now referenced except the ones below). Drawn versions stay as fallbacks. Visuals only.
- Not wired: Grace `phone_on_mini_tripod` (no matching drawn prop); Deedee `dining_table` (the Sunday Roast table is a different shape, needs a new scene); 18 TNB props (celadon_glaze, clay_pigeon, clay_wedge, director_s_chair, feather_boa, kiln_cone, needle_and_thread, painted_curb, painted_flat, red_sleeve, rocking_platform, safety_pins, shirts_on_hangers, slip_bucket, spirit_level, stage_light, velvet_jacket, walkie_talkie) that belonged to TNB moves replaced in the 2026-10-27 revamp.
- Wired in code but never seen in play: Deedee rn_badge, stethoscope, hand_weights (her painted frames already carry them); Boppy baseball_cap (his pose already holds one); Grace spring_floor_mat and giant_glitter_nail (moves not in any skill list).
- Fixed on the way: Tom's Flashcard Flurry "?" tile never rendered (an option named `kind` overwrote the scene's own `kind`); renamed to `kf`.
- Tags: `prop-art.js?v=pa5`, `tom-moves.js?v=tom8`, `tnb-moves.js?v=jojo3`, `boppy-moves.js?v=pa3`, grace `pa2xg`, deedee `pa2xd`, amy `pa2xa`.

## 2026-10-30: Rose's remaining 20 painted props wired into her moves

- Unicorn cut-out, safety scissors and crayon (Dress-Up Tiara); rainbow feather (Tickle Storm); couch cushion and lava pool (Floor Is Lava); cushions, quilt and password sign (Pillow Fort); stack of cushions (Piggyback Pounce, shows when Tom is down); picture book (Bedtime Story); snack tray and treat set (Ms. Cathy's Snack Attack); two teapots, teacups, tiny chairs and lacy table (Tea Party ult); chest armor, visor, tube levers and rocket fist (Mecha ult). Drawn versions stay as fallbacks. Visuals only.
- `PROPART.draw` takes an optional `src:[sx,sy,sw,sh]` crop (used to cut single cups and treats out of a set). Tags `?v=pa4r`, `rose-moves.js?v=pa2r`.
- Tested with kit_test per move (every slug in PAINTED_PROPS), smoke green.

## 2026-10-30: Chapter 2 smog trance: pixel squares replaced with drawn stars above the head

- Tom: in chapter 2 the stars over people's heads were still pixels and not over the head. These are not the knocked-out stars (those were fixed on 10-29); they are the smog trance on the neighbors (Mr. Washington, Marisol, Larry, Miss Odette, Dona Carmen). The old effect was eight 3 by 3 pixel squares at a fixed 10 px above the feet, which landed on the face of the taller painted figures.
- Now: three smooth lavender stars with the game's dark outline, a white glint, a slow spin, a soft purple glow under the ring and an occasional twinkle (`drawTranceStars` in `data/scenes.js`), in the same style as the knocked-out stars but tinted to the purple smog. The ring sits on the real top of each figure via the new `actorHeadAnchor(a)` in `engine/town-render.js` (same sprite set and scale as `drawActor`), so it clears the head at any size, including the hat on Marisol.
- Tags: `town-render.js?v=trance1`, `scenes.js?v=trance1`. Checked: Jefferson Park with the smog on, portrait and landscape, close-ups; smoke and camera_clamp 0 fails. Not yet seen on Tom's phone. Other maps' trance NPCs use the same code path (Odette and Carmen not shot individually).

## 2026-10-30: Painted props wired into all Tombos, Director's Cuts and Family Finishes

- 46 of the 48 Tombo animations in `B2_TOMBO_ANIM` now draw the painted props from `art/props/tombo/` (plus reused character props such as Lamby, the sourdough boule, the cayenne pepper and the longboard). Each hook falls back to the drawn version until the image loads. Visuals only: no damage, timing or story changes. `amy1`, `nara2_dc` and `nara3` have no props mapped, so they are unchanged.
- Some painted props replace animated drawn parts: the ff3 hourglass sand level, the ff1 fort's disco lights, the tnb1_dc fan box flap. Kintsugi cup is painted only once mended.
- New test tool `tools/tombo_test.py` fires any Tombo (or `--char=grace`) in a lab fight, saves frames and a contact sheet, and prints `PAINTED_PROPS`. `tools/tombo_props_map.json` lists the props each Tombo uses. `__LE.B2_TOMBOS` is now exposed.
- Tested: every Tombo run, every mapped prop draws, smoke green. Tags `?v=pa4` (prop-art.js), `?v=tom7` (battle2-kind.js).
## 2026-10-30: Bready Mercury on Tom's counter now uses the painted jar prop

- The jar on the kitchen island in Tom's house (`drawBreadyJar` in `engine/plate.js`) was a code-drawn pixel jar. It now draws `art/props/tom/sourdough_starter_jar.webp` (the DAY 3 jar, same art the Starter Splash move uses), same spot and size, with a soft shadow. Still hidden in chapter 6 until `ch6-clear`.
- Prop cache version bumped to `pa4` (`engine/prop-art.js`, its tag in `index.html`) so phones fetch the newest image; `?v=bready2` on `engine/plate.js`. `tools/bready_test.py` passes.

## 2026-10-30: Flight makeover: painted cabin, takeoff, map and landing

- 12 images from Tom baked by `tools/sprite-bake/bake_flight.py` (sources in `tools/sprite-bake/src/flight/`) into `art/flight/*.webp` and the generated `data/flight-art.js`. `engine/flight-art.js` (new) draws them; `engine/travel.js` calls it and keeps the old pixel drawing as the fallback if the art has not loaded.
- New 2.6 second cabin-window beat before takeoff (portrait pans from the seat to the window). Takeoff and landing are painted skyline, runway and foreground plants with parallax, a painted plane in 9 poses, tire smoke and a shadow. The map is the painted USA with pins, clouds, a dot trail and a plane that banks near the ends.
- Both directions work (Long Island to Los Angeles, and back). Portrait and landscape both checked with `python3 tools/flight_test.py` (shots in `tools/shots/flight-*`).
- Art loads 2.5 seconds after boot and when the cab driver is talked to. `?v=fl2` on `data/flight-art.js`, `engine/flight-art.js`, `engine/travel.js`.

## 2026-10-30: Tombo redo sheet 2: the last seven Tombo props cut (all 138 painted)

- `tombo-redo-sheet2-of-2.png` saved in `tools/sprite-bake/src/props/` and added to `bake_prop_sheets.py` (cells 1 to 7 = Tombo items 97, 98, 110, 111, 112, 124, 125). New images in `art/props/tombo/`: `palm_tree`, `new_york_skyline`, `drinking_glass`, `hanging_pendant_lamp`, `sourdough_bite`, `nurse_cap`, `red_striped_family_table`.
- All seven match the list. The cutter reports 138 of 138 Tombo props painted, none missing. Not wired into any Tombo animation yet (wiring is the later step in `docs/PROP_ART.md`).

## 2026-10-30: Grump Hollow repainted: signs lettered, south exit labeled, north-west trail closed

- New painting installed as `art/hollow.webp` (1536 x 1408, from Tom's image, kept in `docs/reference/hollow_v2_from_tom.png`). `tools/hollow_signs.py <source.png>` scales it to the plate size. The generator drew the three wooden signs and the green exit board large enough, so nothing is repainted.
- The game letters all four boards live (`PLATE_SIGNS.hollow` in `engine/plate.js`): GRUMP / HOLLOW, NO / SWIMMING, NOT A / FROG, and the south exit THE SQUARE / SHOPS. The painting carries blank boards.
- The trail in the north-west corner now ends in a dead end (the painting shows a fallen log and dense forest). It was already blocked in the walk map, so no mask change.
- 'Crooked sign' object moved from (6,12) to (6,11), at the foot of its new board. Pond sign (9,4) and Warning stake (15,11) already sit at their boards.
- `?v=hollow1` on `engine/plate.js` and `data/maps-le.js`, `?v=20261030d` on the plate.
- Known limitation as on the Square and Row: in portrait the D-pad covers part of the south exit board when Tom stands at the exit.
- Tests: reach_test hollow 0 fails, smoke and camera_clamp clean, phone-size shots portrait and landscape (`tools/shots/hollow-*.png`, not committed).

## 2026-10-30: Tombo redo sheet 1 of 2 (source and cut)
- Saved `tombo-redo-sheet1-of-2.png`; all 7 match and are cut (judge's desk, 1A suitcase, pink blanket, sneakers, tiara, sunglasses with earpiece, Italy wall map). 131 of 138 Tombo props painted; redo sheet 2 (palm tree, skyline, glass, pendant lamp, sourdough bite, nurse cap, family table) is the last. Not wired yet.

## 2026-10-30: Tombo prop sheet 6 of 10 (source and cut)
- Saved `tombo-sheet06-of-10.png` (items 71 to 84); all 14 match (deputy cap, under-sink cabinet, garden bed, stake, seedling, watering can, vine, tomato, card table, peppers, Scoville meter, paper fan, milk, newspaper) and are cut. 124 of 138 Tombo props painted; the other 14 wait on the redo sheets. Not wired yet.

## 2026-10-30: Tombo prop sheet 10 of 10 (source and cut)
- Saved `tombo-sheet10-of-10.png` (items 126 to 138); all 13 match (dining chair, GUEST card, kids cup, pottery wheel, clay pot, bed, pillow, window, tray, pancakes, syrup, street lamp, eight-seat table) and are cut. 110 of 138 Tombo props painted. Still outstanding: sheet 6 (items 71 to 84) and 14 redo props. Not wired yet.

## 2026-10-30: Tombo prop sheet 9 of 10 (source and cut)
- Saved `tombo-sheet09-of-10.png` (items 113 to 125). Cells 1 to 11 match (blanket fort castle, NO GROWN-UPS sign, popcorn bag, wall of clocks, chains, yellow tape, hourglass, film reel, picture frame, red rose, wedding ring) and are cut. Nurse Cap and Red Striped Family Table came back as a handkerchief and an envelope: redo. 97 of 138 painted. Not wired yet.

## 2026-10-30: Tombo prop sheet 8 of 10 (source and cut)
- Saved `tombo-sheet08-of-10.png` (items 99 to 112). Cells 1 to 11 match (kintsugi cup, pottery shelf, kintsugi brush, dog treat, giant paw, puzzle toy, tug rope, dining table, checked tablecloth, dinner plate, candle) and are cut. Cells 12 to 14 came back as a fork, a red napkin and a wooden chair: Drinking Glass, Hanging Pendant Lamp and Sourdough Bite go on the redo sheet. 86 of 138 painted. Not wired yet.

## 2026-10-30: Tombo prop sheet 7 of 10 (source and cut)
- Saved `tombo-sheet07-of-10.png` (items 85 to 98; sheet 6 still outstanding). Cells 1 to 12 match (velvet couch, mustard pillow, MIDNIGHT HOUSE screen, popcorn bowl and piece, turbo fan and box, garden hose, Red Line train, METRO sign, TAP card, Last Train car) and are cut. Cells 13 and 14 came back as a bench and a street lamp: Palm Tree and New York Skyline go on the redo sheet. 75 of 138 painted. Not wired yet.

## 2026-10-30: Tombo prop sheet 5 of 10 (source and cut)
- Saved `tombo-sheet05-of-10.png`; all 14 match (espresso cup, gelato, red Vespa, Italy brochure, white counter, blue cloth, broom, party table, string lights, gumbo pot, pupusa plate, landing net, cattail reeds, crust bait) and are cut. `bake_prop_sheets.py` gained `COLCUTS` (hand-set column gaps for one row). 63 of 138 painted. Not wired yet.

## 2026-10-30: Tombo prop sheet 4 of 10 (source and cut)
- Saved `tombo-sheet04-of-10.png`; cells 1 to 13 match (slipper, TV remote, elevator car, call button, rooftop ledge, slab chunk, bistro table, kitchen sink, rhubarb stalk and root, lattice crust tin, serving tray, Italy binder) and are cut. Cell 14 came back as a pencil, so Italy Wall Map goes on the redo sheet. `bake_prop_sheets.py` gained `ROWCUTS` (hand-set row gaps) for this sheet. 49 of 138 painted. Not wired yet.

## 2026-10-30: Tombo prop sheet 3 of 10 (source and cut)
- Saved `tombo-sheet03-of-10.png`; all 14 match (lemon, sock, Ymamot sign, stepladder, birthday banner, banner pole, pink balloon, cake, balloon trio, purple couch, floor lamp, MOM placard, two cushions). Cut to `art/props/tombo/`; 36 of 138 painted. Not wired yet.

## 2026-10-30: Tombo prop sheet 2 of 10 (source and cut)
- Saved `tombo-sheet02-of-10.png`; all 14 match (scepter, reading lamp, 8-bit music note, director's chair, megaphone, top hat, cane, stage curtains, kitchen counter, mixing bowl, ketchup, pickles, cereal box, mustard). Cut to `art/props/tombo/`; 22 of 138 Tombo props painted. Not wired yet.
## 2026-10-30: Painted enemies from 14 pasted sheets (the last missing ones)
- Tom pasted 14 sheet images with no words. Matched by looking at each against its description in the monster files: gremlin (Sprinkle Gremlin), censor (The Oblivion Censor, ch19 boss), rubberstamp, signalfault, longline, wallflower, leftover, lukewarm, knowitall (the real one this time), dogear, acorncache, cheekstuffer, acornagent, extra. The Long Line is the one judged by look alone (a yellow robot with a stanchion and blue belt; Velvet Rope was already installed from a different sheet).
- All 14 show painted in a test fight; old sprites stay as fallback until Tom approves on his phone. Tests: `tools/foes_test.py` on all 14, 0 fails; `tools/smoke.py` FAILS: [].
- Still without a painted sheet: `deadletter` (Dead Letter, chapter 19). Not among the 14.
- Censor needed `--cuts` (the ink swishes overlap the next frame); Wallflower needed `--cuts` (its petal spray joins attack1 to attack2). No flaws worth logging on the other 12.

## 2026-10-30: Rivituso Row repainted: every house and both exits labeled

- New painting installed as `art/row.webp` (1536 x 1408, from Tom's image, kept in `docs/reference/row_v2_from_tom.png`). Built by `tools/row_signs.py <source.png>`: scales to the plate size and repaints the three house boards larger (240 x 96) and the two exit boards taller, because the generator drew them too small for a phone.
- The game letters every board live (`PLATE_SIGNS.row` in `engine/plate.js`): GREGORI / HOUSE, RIVITUSO / HOUSE, AUNT ELLIE / HOUSE; north exit THE SQUARE / SHOPS; south exit CATTAIL / PIER. The painting carries blank boards, so spelling never depends on the art.
- The old painted direction signposts are gone from the art. 'Row signpost' stays at (14,1), under the north board; 'Pier signpost' moved from (15,17) to (14,19), at the south board. The south path still closes with the fallen branch until chapter 3.
- Walk map unchanged (the new posts sit on tiles that were already solid). `?v=row1` on `engine/plate.js` and `data/maps-le.js`, `?v=20261030c` on the plate.
- Known limitation: in portrait, when Tom stands right at an exit the title bar or D-pad covers part of that exit board (the camera stops flush at the map edge). Tom's sprite also draws over the board while he walks under it (no foreground layer).
- Tests: reach_test row 0 fails, smoke clean, camera_clamp clean, phone-size shots portrait and landscape (`tools/shots/row-*.png`, not committed).

## 2026-10-30: Room paintings, batch 6 (Odette's Creole Kitchen, Pupuseria La Ceiba, Jordan and Sam's, Dakota and Ryan's)
- rooms6.zip: `creole`, `pupuseria`, `jordansam`, `dakota` installed as square plates (`art/<id>.webp`, 16 x 16 tiles, `px:78`, actorScale 1.98). All four images were square and clean, no redo needed.
- Walk masks, objects and NPC positions rewritten in `data/maps-la.js`; all NPC names and object texts kept, except two Jordan and Sam objects: the slat divider kept, but `Mug shelf` was dropped (its shelf sits behind the espresso bar, unreachable) and `Window planter` now sits on the big foreground planter as `Big planter`. No scene uses these rooms' coordinates.
- Removed old hard-coded tests creole_test, dakota_test, jordansam_test, pupuseria_test; `rooms_test.py` and `tap_test.py` cover the rooms.
- Tests: rooms_test 4 rooms FAILS []; smoke, camera_clamp, ch12_test FAILS []; tap_test on the 4 rooms PASS.

## 2026-10-30: Tombo prop sheet 1 of 10 (source and cut)
- Saved `tools/sprite-bake/src/props/tombo-sheet01-of-10.png`. Cells 1 to 8 match their prompt and are cut to `art/props/tombo/` (item numbers 1 to 138 over the ten sheets are in props.json group `tombo`; `bake_prop_sheets.py` skips sheets that have not arrived). Cells 9 to 14 came back as unrelated props (gavel, lamp, hourglass, barrel, wheel, chest) and go on a redo sheet. Not wired into any Tombo yet.

## 2026-10-30: Room paintings, batch 5 (Casa Alvarez, Lofts Lobby, TNB's Loft, Grand Tower apartment)
- rooms5.zip: `casa`, `loftlobby`, `lofts`, `tower` installed as square plates (`art/<id>.webp`, 16 x 16 tiles, `px:78`, actorScale 1.98). Image 21 (Primary Suite) was already live as `tomsuite`.
- Walk masks, objects and NPC positions rewritten in `data/maps-la.js`; every old object text and NPC name kept (Casa Alvarez still has all nine residents, so `ch12Alvarez` and STORY_WORLD are untouched).
- Lobby elevator button now sits at (11,3) and rides to the loft at (8,14); the loft's way down returns to the lobby at (9,5). `ch2Loft` now places TNB at (8,9) and walks Tom to (8,10).
- Removed the old hard-coded tests casa_test, loft_test, loftlobby_test, tower_test (other tower map tests stay). `rooms_test.py` and `tap_test.py` cover the new rooms.
- Tests: rooms_test 4 rooms FAILS []; smoke FAILS []; camera_clamp FAILS []; ch12_test FAILS []; tap_test on the 4 rooms PASS. Screenshots in `tools/shots/room-*`.

## 2026-10-30: Delta One moves use the painted props
- Tom's Seat 1A (Boarding Group 5 sign, suite door that slides in, duvet, sleep mask), Boarding Group Zero (phone with boarding passes, gate scanner, Gate 0 door, lie-flat pod, sleep mask, airliner, hot towels) and the plain Delta One move (pod, airliner) now paint first and fall back to the drawn version. The red carpet is still drawn (it stretches to any length). `tools/kit_test.py tom --only=seat_1a` prints which painted props fired.
- Script tags: tom-moves `tom6`, prop-art `pa3`.

## 2026-10-30: The Square repainted: every shop and exit labeled, a much larger fountain
- Tom sent a new painting of The Square (`docs/reference/town_v2_from_tom.png`, 1347 x 1168, scaled to 1920 x 1664 = 30 x 26 tiles at 64 px) generated from the prompt in the Project doc `claude/square-redo.md`. Built into `art/town.webp` by `tools/town_signs.py`.
- Labels: the generator drew the eight shop boards too small to read on a phone (about 124 x 33 px), so the script repaints them as 240 x 96 px boards (cream face, frame in each building's colour). The three green exit boards are Tom's. All eleven boards are lettered live by `drawPlateSigns` in `engine/plate.js` (`PLATE_SIGNS.town`, face rects in art px): CRUMB BAKERY, HUSH LIBRARY, SPROUT HOUSE, PENNY'S POCKETS, SNAIL MAIL, KETTLE COTTAGE, MOON CLUB, TAXI CO.; exits GRUMP HOLLOW (north steps), RIVITUSO ROW (south street), SCHOOL (east opening). The exits are painted open; the fallen branch and school gate are still drawn over them by the story gates, so the labels show even while closed. Change a name by editing `PLATE_SIGNS`, no re-paint.
- Fountain: now about 6 x 5 tiles (was under one tile). Object `fountain` is (11,9) 5 x 4; mask also blocks (10,11) (10,12) (16,11). Row 13 stays walkable, so the south street still joins the plaza and Tom stands in front of the basin. `Town notice` moved to (9,12). `South signpost` moved to (13,22) (left post of the new board); `North signpost` (6,1) and `East signpost` (28,8) already sit under their boards. Mask (28,7) now solid (east board). Town spawn (9,10).
- Moved off the fountain: chapter 16 start `engine/story.js` (11,12) to (11,13); chapter 20 arrival `data/scenes-ch20.js` ch17Place('town',11,12) to (11,13). `data/bonus-nine-scoops.js` nsFountain uses row 13 and still works. A scan of every scene for coordinates inside the new solid tiles found only other maps.
- Differences from the prompt (accepted): fountain sits about 125 px right of the spec (x 671 to 1051, y 552 to 877); exit boards are smaller than specified (north 204 x 60, south 192 x 62, east 123 x 55 faces); south board is about 85 px higher.
- Known: no foreground layer, so Tom walking through the south or north exit draws over the board while he passes under it.
- Tests: `tools/reach_test.py town` 0 fails; `tools/smoke.py` FAILS: []; `tools/camera_clamp_test.py` FAILS: []; `tools/tap_test.py` town OK in every mode (full run longer than my time limit, no failures before it stopped). Portrait (390 x 844 at 3x) and landscape shots: `tools/shots/sq-*.png` (not committed). Script tags bumped to `?v=square1` (plate.js, maps-le.js, story.js, scenes-ch20.js).

## 2026-10-30: Painted Chronos-Leviathan (chapter 20 boss)
- Tom pasted one image with the word "leviathan". It was a flat picture with a checkerboard baked into the pixels (no transparency), so the background was keyed out (edge-connected and enclosed light grey pockets, then light remnants near the cut edge) and saved as `tools/sprite-bake/src/foe-leviathan-v1.png`. If a clean transparent sheet arrives later, drop it over that file and rebake with the same flags.
- Painted, shows in a test fight; old sprite stays as fallback until Tom approves on his phone.
- Known small flaws: faint light specks remain in the golden swirl effects (attack2 and attack3), and a few in the hurt frame's sparks, left over from the checkerboard.
- Tests: `tools/foes_test.py leviathan` 0 fails; `tools/smoke.py` FAILS: [].

## 2026-10-30: Painted battle props are cut and the first seven are in the game
- All 202 painted props (every Primary move prop for Tom, Grace, Rose, Amy, Deedee, Boppy, TNB) are cut into single transparent images in `art/props/<character>/` by `tools/sprite-bake/bake_prop_sheets.py` (corner numbers and halos removed; check contact sheets in tools/shots/props-*.png). See `docs/PROP_ART.md`.
- New `engine/prop-art.js` (`PROPART.draw`) lets any draw helper paint a prop first and fall back to the drawn one. Trial, one move each: Tom's headphones (Noise-Canceling), Grace's gold dumpling (Squishy Squeeze), Rose's Lamby and Backup Lamby (every move that shows them), Amy's kettlebell (Kettlebell Swing), Deedee's crisp pan (Corner Piece), Boppy's cayenne (Pepper Breath), TNB's stoneware mug (Mug Toss). Look for these in a fight.
- Deedee's Corner Piece pan no longer regrows its corner (the painted pan has the cut corner painted in). Tom's hair on Lamby (Tombo moves) still uses the drawn Lamby.
- `tools/kit_test.py` prints `PAINTED_PROPS={...}` per move. Script version tags bumped on every changed script.

## 2026-10-30: Battle prop sheets, redo sheet (source only)
- Saved `tools/sprite-bake/src/props/redo-sheet1.png`. All 14 redo props match the list. Every character's props now exist as painted source images (starter pistol for Boppy reuses Amy's). Not wired into the game.
## 2026-10-30: Painted Julian Vance and Nine Scoops enemies
- Tom sent ch18_19monster.zip: Julian Vance, Slushie Slug, Cone Head, Brain Freeze. Matched to ids `vance`, `slushslug`, `conehead`, `brainfreeze` (the last is the Nine Scoops two-phase boss). All show painted in a test fight; old sprites stay as fallback until Tom approves on his phone.
- Julian Vance is one man in two fights (`vance` in chapter 18, `julian` in chapter 20, both on the same old sprite). One painted sheet serves both: `data/foes/use.js` aliases `FOE_HIRES.julian` to `FOE_HIRES.vance`. Tested both ids.
- Fix: the Nine Scoops monsters are defined in `data/bonus-nine-scoops.js`, which loads after `data/foes/use.js`, so the first pass skipped them. `index.html` now loads `use.js` a second time after that file; `use.js` skips enemies already painted.
- Not in the zip: the Sprinkle Gremlin (`sprinklegremlin`). Its note says the original file was not available. It still uses its old sprite. Needs a sheet from Tom.
- Known small flaws in the source art: Brain Freeze attack1 has its right arm slightly clipped and attack4 a thin sliver at its left edge (neighbouring frames overlap).
- Tests: `tools/foes_test.py vance,julian,slushslug,conehead,brainfreeze` 0 fails; `tools/smoke.py` FAILS: [].

## 2026-10-30: A button moved next to Menu
- The A (Interact) button is now the same size as the Menu button and sits directly to its right, bottom left (portrait 54px phones, 62px wider, landscape 46px). The D-pad stays bottom right. CSS only in index.html (`#action-wrap`, `#action`, `#action-label`, `#menu-label`). Smoke 0 fails; portrait and landscape checked. Not yet seen on Tom's phone.

## 2026-10-30: Battle prop sheets, TNB 31-item sheet (source only)
- Saved `tools/sprite-bake/src/props/tnb-sheet1-items1-31.png`. Items 1 to 23 match the prompt list. Items 24 to 31 drifted into invented props and need a redo (longboard, painted curb, rocking platform, spirit level, clay wedge, brick kiln, stoneware mugs, street signs). Not wired into the game.

## 2026-10-30: Difficulty picker on New Game
- After picking a new game (Part 1 chapter, Part 2 test jump, or the Bonus), a "Choose your difficulty" screen shows Easy (Rose portrait, Rose Mode), Medium (Grace portrait, Grace Mode) and Hard (Tom portrait, Director Mode). It defaults to the saved mode, BACK returns to the chapter list, and the choice can still be changed in Options. Part 2 from Part 1 clear data does not ask (the mode comes with the data). engine/splash.js (`SPLASH_DIFF`, `splashDifficulty`, `diff` mode), script tag `?v=diff1`. Smoke 0 fails; portrait and landscape checked.
## 2026-10-30: Outdoor maps stop flush at the edge (no soft strip at the bottom)
- Tom (Downtown LA screenshot): the dark strip under the painting at the bottom looked like dead space; the screen should stop panning when the area's edge reaches the screen edge and Tom should keep walking.
- Outdoor maps no longer scroll past the top or bottom edge (the safe-band scroll added earlier today is now for square painted rooms only; that rule came from the rooms session and is untouched). The camera is flush on all four sides. Cost: on the last rows next to the top or bottom edge Tom can walk behind the title bar or the controls; an exit on the bottom row (Downtown LA to Jefferson Park) is used from behind the A button. The real fix is painting margin (docs/MAP_SIZES.md).
- The soft backdrop now only shows on the 7 maps at the zoom cap and in square rooms. In portrait the town and Downtown LA are exactly one screen tall at 1.15x, so they do not pan vertically at all.
- Test: `tools/camera_clamp_test.py` now asserts the screen is fully covered at every corner and edge of every uncapped outdoor map (8 phone sizes, 0 fails). Cache tag `cover3` on `engine/overworld.js`. Not yet seen on Tom's phone.

## 2026-10-30: Battle prop sheets, Boppy 31-item sheet (source only)
- Saved `tools/sprite-bake/src/props/boppy-sheet1-items1-31.png`. Items 1 to 25 match the prompt list. Item 26 (ghost pepper) has the wrong color, items 27 to 31 drifted into invented props (fire alarm, cardigan, starter pistol, finish arch, race bib are missing). Redo list noted. Not wired into the game.

## 2026-10-30: Battle prop sheets, Deedee sheet 2 of 2 (source only)
- Saved `tools/sprite-bake/src/props/deedee-sheet2-of-2.png`. All 15 props match the prompt list. Deedee is complete (30 of 30). Not wired into the game.

## 2026-10-30: Battle prop sheets, Deedee sheet 1 of 2 (source only)
- Saved `tools/sprite-bake/src/props/deedee-sheet1-of-2.png`. All 15 props match the prompt list. Not wired into the game.

## 2026-10-30: Battle prop sheets, Amy sheet 3 of 3 (source only)
- Saved `tools/sprite-bake/src/props/amy-sheet3-of-3.png`. All 13 props match the prompt list. Amy is complete (39 of 39). Not wired into the game.

## 2026-10-30: Battle prop sheets, Amy sheet 2 of 3 (source only)
- Saved `tools/sprite-bake/src/props/amy-sheet2-of-3.png`. All 13 props match the prompt list. Not wired into the game.
## 2026-10-30: Painted Chapter 17 enemies
- Tom sent ch17monsters.zip twice (identical by md5; installed once): The Archivist's Twin Lenses (boss, id `twinlens`), Pause Sprite, Paperweight, Curator. All four show painted in a test fight; old sprites stay as fallback until Tom approves on his phone.
- Twin Lenses frames 5 and 6 touch (the beam crosses into the next frame), so it uses `--cuts`. Paperweight and Curator have no clean gap above their second-row stance, so `--cut-y` was set by eye (389 and 383).
- Known small flaw: Paperweight attack1 has a faint dark sliver of shadow at its bottom left edge.
- Tests: `tools/foes_test.py twinlens,pausesprite,paperweight,curator` 0 fails; `tools/smoke.py` FAILS: [].
## 2026-10-30: Square painted rooms, batch 4 (Backlot Wardrobe, The Starlite, Board Room, Angel City Cab Co.)
- Tom sent rooms4.zip (16_Backlot_Wardrobe, 17_The_Starlite, 18_Board_Room, 19_Angel_City_Cab_Co; the guide says Tom's House is excluded). Matched to ids `wardrobe`, `cinema` (art file `art/starlite.webp`), `boards`, `lacab`. All 1254 px squares, full bleed, no people or text, standard gate gap (x6 to x9). Installed 16 x 16, `square:true`, actors 1.98 (x1.2 boost).
- Residents stand on open floor: Marguerite (8,6), Dolores (9,9), Dash (8,6), Sol (6,6). Story spots still valid: lacab (7,6) for chapters 16 and 17, the girls at the cab stand at (3,5) and (4,6).
- Starlite: the aisle (x7 to x8) runs from the stage to the lobby; the seat blocks are painted only. Dropped (unreachable): Starlite's ticket desk, Board Room's cactus and shelf unit. Their lines are gone.
- Tests: `rooms_test.py` on all four 0 fails; old per-room tests (wardrobe, starlite, boards, lacab) deleted; tap_test covers them; smoke, camera_clamp, ch13 0 fails.

## 2026-10-30: Battle prop sheets, Amy sheet 1 of 3 (source only)
- Saved `tools/sprite-bake/src/props/amy-sheet1-of-3.png`. All 13 props match the prompt list. Not wired into the game.

## 2026-10-30: Painted Chapter 16 enemies, and a second HUSH-9 sheet
- Tom sent ch15_16monsters.zip: Marlowe Transformed (chapter 16 boss, id `marlowe16`), Grey Note (`greynote`) and a second HUSH-9 Final Form sheet. Marlowe and Grey Note show painted in a test fight; old sprites stay as fallback until Tom approves on his phone.
- The new HUSH-9 sheet is a different design from the one installed on the ch14 zip (round capsule, two warning lights, thumbs-up glove at its side; the installed one has a speaker grille with a white glove held to its lips, which matches `data/ch15-monsters.js`). Kept the installed one live and saved the new sheet as `tools/sprite-bake/src/foe-hush9final-v2-unused.png`. To swap: copy it over `foe-hush9final-v1.png` and rebake with `--cut-y` and `--cuts` set for its frame positions.
- Known small flaw in the source art: Marlowe attack3 has its beam tip cut flat at the right (the next frame's halo overlaps it).
- Tests: `tools/foes_test.py marlowe16,greynote` 0 fails; `tools/smoke.py` FAILS: [].

## 2026-10-30: Battle prop sheets, Rose sheet 2 of 2 (source only)
- Saved `tools/sprite-bake/src/props/rose-sheet2-of-2.png`. All 12 props match the prompt list. Rose is now complete (25 of 25). Not wired into the game.

## 2026-10-30: Battle prop sheets, Rose sheet 1 of 2 (source only)
- Saved `tools/sprite-bake/src/props/rose-sheet1-of-2.png`. All 13 props match the prompt list. Not wired into the game.
## 2026-10-30: Painted Chapter 14 and 15 bosses
- Tom sent ch14monsters.zip: Warden Boppy (chapter 14 boss, id `warden`) and HUSH-9 Final Form (chapter 15 boss, id `hush9final`). Both show painted in a test fight; old sprites stay as fallback until Tom approves on his phone.
- New bake flag `--cuts x1,x2,...` forces the column between each pair of frames, for sheets whose frames overlap in x with no clean gap (the Warden's swoosh and the HUSH-9 sound waves reach into the next frame).
- Known small flaws in the source art: Warden attack2 has a stray halberd tip at its left edge and a speck under the stance; Warden attack4 has a thin sliver of attack3's flash at its left edge; HUSH-9 attack3 has its left foot slightly clipped. A corrected sheet would fix them.
- Tests: `tools/foes_test.py warden,hush9final` 0 fails; `tools/smoke.py` FAILS: [].
## 2026-10-30: Square painted rooms, batch 3 (Aunt Ellie's House, Golden Hour Coffee, Ramen Ramen, Very Green Juice, Nickel's)
- Tom sent rooms3.zip (01_Aunt_Ellies_House, 02_Golden_Hour_Coffee, 03_Ramen_Ramen, 04_Very_Green_Juice, 05_Nickels). Matched to ids `elliehouse`, `coffee`, `ramen`, `juicebar`, `nickels`. All five are 1254 px squares, full bleed, no people or text, standard gate-gap layout. Installed as 16 x 16, `square:true`, actors at 1.98 (x1.2 boost).
- Exits: Ellie, Ramen use the 3-tile gap (x7 to x9: door (8,15), door2 (7,15), doors (9,15)); Coffee, Juice, Nickel's the usual x6 to x9. Spawn (8,14).
- Residents stand on the floor in front of their counters (Juniper (8,6), Kenji (7,6), Sage (8,7), Ellie (7,8)); Nickel stays hidden at (12,6) and the shop still opens from the counter. Objects re-placed to the paintings; Dropped as unreachable: Ellie's lamp table and dining table, Coffee's none, Ramen's lucky bamboo, Juice's wheatgrass and supplement shelf. Their lines are gone.
- Tests: `rooms_test.py` on all five 0 fails; old per-room tests (coffee, ellie, juicebar, nickels, ramen) deleted (hard-coded to the old layouts); `tap_test` covers the five; smoke, camera_clamp, ch12, ch15 0 fails. Shopkeeper and resident dialogue opened by hand in each room.

## 2026-10-30: Battle prop sheets, Grace's sheet (source only)
- Saved Grace's returned sheet as `tools/sprite-bake/src/props/grace-sheet1-of-1.png`. All 15 props match the prompt list. Not wired into the game.

## 2026-10-30: Battle prop sheets, Tom's first two (source only)
- Tom ran the image AI on the first prop prompts. Saved the two returned sheets under `tools/sprite-bake/src/props/` with a README saying which cells are right. 30 of Tom's 31 props are usable; the retro console is still to redo.
- Not wired into the game. No code change.
## 2026-10-30: Tom's House (square paintings: main floor and primary suite)
- Tom sent tomshouse.zip: "Cozy Dusk Home and Garden Cutaway" (whole ground floor with the garden path) and "Cozy Isometric Bedroom Suite Retreat". Installed as `tomhouse` and `tomsuite`, both 16 x 16, `square:true`, 1254 px, actors at 1.08 scale (x1.2 interior boost), same call as Amy's House.
- Main floor: exit is the garden path (7 to 8, 15), spawn (8,14); the doorway at the top middle (7,1) leads to the suite. Walkable: the front hall, the open floor between the dining rug and the sofa (x6 to x8), the hall to the suite. Kitchen, living room corner and the TV wall are dressing only (the island and sofa block every way in). Objects kept: wet bar, island (Bready Mercury text and the ch6 variant), dining table, rubber plant, The couch (still the chapter 12 bench menu). Dropped (unreachable): fridge, range, counter, photo wall, console table, coffee table, big TV, PS5, TV console, pouf, corner plant. Their lines are gone.
- Suite: the white door on the left wall (3,7) is the way back (spawn (3,8)); the bathroom is entered through the open wooden door (x5). Shower and bed keep the full restore behavior. Closet is dressing only (a plant blocks it), so the two closet objects and the closet shelves are gone.
- Scenes: ch2Starter and ch6Kitchen now stand Tom at (8,5) beside the island (TNB at (7,5)); triggers ch2-starter and ch12-house use zone [7,9,8,12]. Bready jar redrawn in `engine/plate.js` at the new island spot.
- Tests: `rooms_test.py tomhouse tomsuite` 0 fails; `tools/tomhouse_test.py` rewritten (doorway both ways, garden path to 2nd Ave, ch2Starter and ch6Kitchen); bready_test, smoke, camera_clamp, tap_test, ch12, ch15 0 fails.

## 2026-10-30: Slimmer dialogue box, part 2 (portrait height)
- Part 1 only removed the divider and hint; the box stayed tall. Portrait now shrinks the box itself: face 89 to 56 px, text 18 to 16 px, AUTO and the page count sit in the text column beside the face instead of in a row below it, less top and bottom padding (half the home-bar inset). Box is about 87 px plus the home-bar inset, down from about 197 px on Tom's phone.
- CSS only (`index.html`, "Slim dialogue box" block). Landscape and the splash panel unchanged.

## 2026-10-30: Slimmer dialogue box
- Removed the divider line and the "Tap here or A / Enter to continue" hint from the dialogue box. AUTO and the page count now sit right under the text. Portrait top and bottom padding trimmed, and the portrait face moved up with it. Portrait box is about 52 px shorter (197 to 145 px with a portrait face); landscape box is tighter too.
- CSS only, in `index.html` after the landscape dialogue rules. The hint element still exists but is hidden, so `engine/overworld.js` is untouched. The camera and area changes are untouched (`engine/intro.js` reads the box height, so it just gets more room). The splash panel keeps its own footer.
## 2026-10-30: Painted Chapter 13 enemies
- Tom sent ch13monsters.zip with three sheets: Dual-Coast Drill Worm (boss, id `drillworm`), Hushling, Turnstile Grump (id `turnstile`). All three show painted in a test fight; old sprites stay as fallback until Tom approves on his phone.
- Signal Fault (`signalfault`) was NOT in the zip (its note says the PNG was not available), so it still uses its old sprite. Needs a sheet from Tom.
- Hushling's sheet had a white streak and specks between its last two frames; blanked in the saved source.
- Known flaw in the source art: Drill Worm attack1 has its drill tip clipped at the right edge (the next frame's dirt cloud overlaps it). A corrected sheet would fix it.
- Tests: `tools/foes_test.py hushling,turnstile,drillworm` 0 fails; `tools/smoke.py` FAILS: [].

## 2026-10-30: Painted Chapter 11 and 12 enemies
- Tom sent ch11_12monsters.zip. Installed lostluggage, redeye, standbysprite, finalcall (chapter 11 boss) and gridlockprime (chapter 12 boss). All five show painted in a test fight; old sprites kept as fallback until Tom approves on his phone.
- New bake flag `--cut-y N` forces where the first row of frames ends, for sheets whose lone second-row stance is not auto-detected (redeye, gridlockprime, both 385).
- Known small flaws in the source art: finalcall attack4 has its left foot slightly clipped, gridlockprime attack4 has its left edge slightly clipped (the neighbouring frame's effects overlap). A corrected sheet would fix both.
- Tests: `tools/foes_test.py` on all five, 0 fails; `tools/smoke.py` FAILS: [].
## 2026-10-30: Amy's House (square painting, whole ground floor)
- Tom sent amyshouse.zip: a ground-floor cutaway (garden border, blue front door at the bottom) and a second-floor image. Call made: the ground floor is the `amyhouse` plate; the second floor is NOT wired (the house is one level, see docs/ROOM_PAINTINGS.md), so the girls' rooms and the primary bedroom upstairs are not reachable. The image is a floor plan, not the usual front-half-wall room, so the exit is the garden path: door (9,15), door2 (8,15), spawn (9,14), the front door painted at (9,12).
- 16 x 16, `square:true`, 1254 px. Actors drawn at 1.08 scale (x1.2 interior boost = about 1.3 on screen; plate.js), not the 1.98 of the other rooms, because a whole house in one painting is drawn smaller. Walkable: hall (x9) to the cross hall (row 8), the stair hall (x3) to the study and bath, the corridor (x7) to the bedroom, and x10 up to the kitchen. Living room and reading nook are dressing only (furniture blocks every way in).
- Justin stands in the bedroom pocket (8,4), Amy under the dining table (13,9). Objects: family photos, Amy's desk, the bed, kitchen island. Dropped Grace's bed, Rose's bed and the toy box (upstairs or unreachable); their lines are gone. Girls at home (travel.js) now stand at (11,8) and (6,8). Nine Scoops `nsBanner` and `nsEnd` re-placed along the cross hall and kitchen row.
- Tests: `rooms_test.py amyhouse` 0 fails (47 reachable tiles); new `tools/amy_scenes_test.py` plays both scenes with nobody on a blocked tile; smoke, camera_clamp, tap_test, justin_test 0 fails.

## 2026-10-30: Square painted rooms, batch 2 (Moon Club, Penny's Pockets, Taxi Co., Deedee and Boppy's House)
- Tom sent rooms2.zip (01_Moon_Club, 02_Pennys_Pockets, 03_Long_Island_Taxi_Co, 04_Deedee_and_Boppys_House). Matched to ids `observatory` (Luna's Moon Club room in the Square, not the `moonclub` dance hall), `shop`, `taxi`, `grands`. The README says a fifth image was not available; nothing else arrived. All four are square, full bleed, 1254 px (under the 1500 px target, installed anyway).
- All four are 16 x 16 with the usual gate gap and `square:true`. New plateMask, objects and NPC spots in `data/maps-le.js`. Observatory: gap x7 to x8, little silver door at (12,5) (reached from (12,6)); the Moon Club stairs now return to (12,6). Shop: Penny stands in front of the counter at (8,7) because the painting has no floor behind it.
- Deedee and Boppy's house: the sofa stands in the middle of the room, so the TV, recliner and pepper plant are touched from the floor in front of the sofa (their objects reach down to it). Dropped the Photo wall prop (nothing in the painting can be reached): its line is gone ("Tom at six. Amy at four. Boppy in his college track singlet..."). Added a Dining table prop. All story scenes that place people in the house moved by (+2,+3): ch1 Theft and End, ch3 Fishing and End, Nine Scoops thaw, ch15 open, and the chapter 11 and 15 start spots (now 8,10).
- Tests: `tools/rooms_test.py observatory shop taxi grands` 0 fails; old observatory, shop and taxi tests deleted (hard-coded to old layouts); `tap_test` covers the new rooms; ch11, ch15 tests, smoke, camera_clamp 0 fails; ch1Theft, ch1End, ch3End, ch9Letter played in the house with nobody left on a solid tile. Not yet seen on Tom's phone.

## 2026-10-30: Square painted rooms, batch 1 (Crumb Bakery, Hush Library, Sprout House, Snail Mail, Kettle Cottage)
- Tom sent rooms1.zip (01_Crumb_Bakery, 02_The_Hush_Library, 03_Sprout_House, 04_Snail_Mail, 05_Kettle_Cottage; matched by name and by looking: bakery, library, greenhouse, post, tea). All five are square, full bleed, no people or text. They are 1254 px, under the 1500 px target; installed anyway (quality 88 webp, `?v=20261030`).
- Engine: first square rooms, so `resize()` in `engine/overworld.js` got a square-plate branch (`PLATES[id].square`): scale = max(width/mapW, height/mapH). Portrait shows the painting's full height and the middle ~46% of its width, landscape its full width and middle ~46% of its height; the camera follows Tom. The painting is drawn stretched to the map, so any N x N grid works.
- Grid: all five are 16 x 16 tiles (the notes said 23 x 23 for the library; 16 keeps the characters the same size against the furniture in every room, since the painter drew every room at the same scale). Door gap is x6 to x9 at the bottom; exit tiles are the bottom row x6 to x9, spawn (8,14).
- Rewrote the five room specs in `data/maps-le.js` (plateMask, objects, NPC spots). Library staff door is now (12,4) and the Stacks stairs return to (12,5). Nine Scoops scenes in the bakery moved Mr. Pistachio to (7,5) and the gremlins to (5,8) and (11,8) in `data/bonus-nine-scoops.js`.
- Tests: new `tools/rooms_test.py` (plate drawn, every object and NPC reachable, door leads out, library staff door and Stacks stairs round trip, portrait and landscape shots in `tools/shots/room-*`). It replaces the old per-room tests (bakery, greenhouse, library, post, tea), which were hard-coded to the old layouts. `tools/tap_test.py` now also covers the four new rooms; `tools/smoke.py` FAILS: []. `tools/reach_test.py` 218 fails, same as before this change.
- Camera: square rooms use the same safe-band scroll as the outdoor maps (Tom's tile never sits under the title bar or controls; a soft backdrop of the painting shows in those bands next to an edge). `tools/camera_clamp_test.py` treats square rooms like outdoor maps. Look for on the phone: the five rooms, portrait and landscape, walking to the door and to each prop. Not yet seen on Tom's phone.

## 2026-10-30: Outdoor maps fill the screen in portrait and landscape
- Tom: outdoor areas should be big enough that no dead space shows on an iPhone in portrait or landscape, one area for both layouts, with the area's edges anchored to the matching screen sides. Houses are fitted separately and are untouched.
- Finding: every outdoor map is a single painting with an invisible tile grid, so it cannot be grown with trees or water tiles; growing one means a bigger painting. All 45 outdoor maps were smaller than the largest phone canvas (440 x 956 and 956 x 440 CSS px) on at least one axis, which is where the flat green came from.
- What changed (code only, no art): outdoor painted maps now zoom just enough to cover the screen in the current layout (`outdoorCover` in `engine/overworld.js`, 1.0x to 2.25x; the painting is sharp up to 2.0x). Sideways the camera stops at the map edge, so the painting meets the screen edge. Near the top or bottom edge the camera scrolls a little past the map, only into the title bar and controls bands, so Tom is never walking under the controls; that strip shows a soft darkened version of the painting (`plateBackdrop` in `engine/draw.js`) instead of flat green.
- Result: 38 of 45 maps are fully covered at every phone size tested (iPhone SE, 15 and Pro Max sizes, both layouts). 7 hit the zoom cap and still show a soft backdrop on some phones: flightzero, subdepot, subtunnel and the four memory rooms (memamy, memgrace, memrose, memtnb). They need bigger paintings. Sizes and painting rules: `docs/MAP_SIZES.md`.
- Visible change on the phone: in portrait the maps are zoomed in (town 1.15x, ballroom and gates up to 2.1x), so characters look bigger and you see a narrower slice of the map. Landscape changes least (town, school, concourse, jpark stay at 1.0x).
- Tests: `tools/camera_clamp_test.py` now checks coverage and the safe band at eight phone sizes (it fails on the old code; checked). `tools/tap_test.py` now picks tap targets inside the safe band; the blvd (27,23) target it used to pick sits under the on-screen D-pad, which is why it failed in landscape before. Tap test 28 OK, smoke FAILS: [], per-map tests for jpark, blvd, griffith, backlot, concourse, dome, carbarn, deadletter, dakota pass (jpark failed once on a cold first run, then 5 of 5 clean).
- Cache tags `cover1` on `engine/overworld.js` and `engine/draw.js`. No spoken lines changed. Not yet seen on Tom's phone.
## 2026-10-30: Painted Chapter 10 enemies
- Tom sent chapter10_monster_sprites_1.zip. Installed painted frames for Carry-On, Jet Lag, The Unclaimed, The Armrest Hog and the boss The Last Call (four attack frames). All face right.
- Carry-On's source had a stray white vertical streak; removed from the saved source before baking. Not installed: The Long Line (no image in the zip; id `longline`).
- Test: `tools/foes_test.py` on all five, contact sheets and a boss battle screenshot looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 9 enemies
- Tom sent ch9_monster.zip. Installed painted frames for Velvet Rope, Stuffed Shirt, The Hanger-On (id `coathanger`), The Sore Loser and the boss The Mirrorball (four attack frames). All face right.
- Not installed: The Wallflower (no image in the zip; id `wallflower`).
- Stuffed Shirt is tall (78 rows), like the Soggy Sock. Test: `tools/foes_test.py` on all five, contact sheets looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 8 enemies
- Tom sent chapter8_monster_sprites.zip. Installed painted frames for The Draft, The Picky Eater, Wet Blanket and the boss Old Ironbelly (four attack frames). All face right.
- Not installed: Lukewarm and Leftover (images missing from the zip; ids `lukewarm`, `leftover`). A second variant of The Draft was mentioned but not included.
- Test: `tools/foes_test.py` on all four, contact sheets and a boss battle screenshot looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 7 enemies
- Tom sent chapter7_monster_sprites_and_prompts.zip. Installed painted frames for The Cliffhanger, Pop-Up Panic and the boss The Unread (four attack frames).
- Not installed: the file named Know-It-All_sprite_sheet.png actually shows a red tasseled bookmark ghost (the Shusher design), not the navy encyclopedia in the Know-It-All prompt, so `knowitall` keeps its old art. Shusher_idle.png is a lone stance (Shusher is already installed from chapter 6). Dog-Ear's image is missing from the zip.
- Test: `tools/foes_test.py` on all three, contact sheets looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 6 enemies
- Tom sent ch6_monsters.zip. Installed painted frames for Peanut Gallery, Shusher, Sticky Sap, Twig Spy and the boss Chairman Cheeks (id `chairman`, four attack frames). Second-row lone stances ignored; all face right.
- `bake_foe.py`: `--trim-edges` now takes an optional pixel width (default 2; above 2 it also uses undilated pieces). `--by-pieces N` also exists but is unused (it did not help here).
- Known flaw: in the source sheet the Chairman's acorn volley overlaps the next frame, so attack3 has one clipped acorn at its right edge and attack4 has one stray acorn at its left. Small; a corrected sheet would fix it.
- Not installed: Acorn Agent (image missing from the zip again; id `acornagent`).
- Test: `tools/foes_test.py` on all five, contact sheets looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 5 school enemies
- Tom sent chapter5_monster_sprites.zip. Installed painted frames for Pop Quiz, Tardy Bell, Glitter Glue, Dodgeball Dread and the boss The Red Pen (four attack frames). All five sheets face right, so nothing is mirrored (the F on Pop Quiz reads correctly).
- Baked with `tools/sprite-bake/bake_foe.py` (Red Pen with `--trim-edges`); script tags added before `data/foes/use.js`. Old pixel rows stay as the fallback.
- Test: `tools/foes_test.py` on all five, contact sheets and a boss battle screenshot looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 4 backlot enemies
- Tom sent ch4_monsters.zip. Installed painted frames for Boom Mic Moth, Clapper Snapper, Cue Card Crab, Fog Wisp and the boss The Director's Cut (four attack frames). Fog Wisp now faces right like the others.
- `bake_foe.py` gained `--trim-edges` (drops slivers of a neighbour frame's burst effects; used for the Director's Cut). Script tags added before `data/foes/use.js`. Old pixel rows stay as the fallback.
- Not installed: Extra Extra (image missing from the zip) and a pizza monster concept image (three poses on a gradient background, no matching enemy in the game, not a sheet).
- Test: `tools/foes_test.py` on all five, contact sheets looked at, smoke FAILS: []. Not yet seen on Tom's phone.

## 2026-10-30: Rose Mode Boop icon is a pointing finger
- Tom: in Rose Mode the Boop icon should be a pointer finger (a boop is a poke).
- Was the nose emoji. `tools/build_bp_emoji.py` MAP `rose.boop` is now the pointing-up finger (U+1F446), `data/battle-emoji.js` regenerated (regen of the old map reproduced the old file byte for byte first, so only Boop changed). The Nose Boop move (`rx_boop`) has no picture of its own and is untouched.
- Cache tag `?v=boop1` on `data/battle-emoji.js` in `index.html`. Checked headless in Rose Mode: Boop tile shows the finger, no console errors; smoke FAILS: []. No spoken lines changed. Not yet seen on Tom's phone.

## 2026-10-30: Painted Chapter 3 marsh enemies
- Tom sent five sheets (ch3_monsters.zip): Soggy Sock, Bobber, Tangle, Snag and the boss Old Iron-Gill. All five now use the painted frames in battle (stance, hurt, attack frames; Iron-Gill has four attack frames).
- Baked with `tools/sprite-bake/bake_foe.py` (new `--extra-ok` flag, and a frame named `extra` is cut and dropped; the Sock sheet has a spare 5th stance and its two attack frames touch). Script tags added before `data/foes/use.js`. Old pixel rows stay as the fallback.
- Test: `tools/foes_test.py` on all five (painted, atlas ready, frames drawn, no page errors), contact sheets looked at, smoke FAILS: []. Not yet seen on Tom's phone.
- Note: the Sock is tall and narrow (77 rows high), so it stands taller than the other regulars.

## 2026-10-30: RELOAD button on the welcome page
- Tom: the iPhone home-screen app has no refresh button and sometimes holds on to old files, and he cannot clear the cache from inside the app.
- New small RELOAD button (refresh icon) on the welcome page, left of ADMIN, same outline style, portrait and landscape (`engine/splash.js` `splashReload`, CSS in `index.html`; the launch row is now a wrapping flex row, landscape stays on one row).
- Tap: it re-downloads the page and every script (the big baked voice files are skipped, they rarely change) with `cache:'reload'`, then reloads on a fresh `?r=` address. Saves live in the site's localStorage, so they are kept (checked headless). An 8 second timer reloads anyway if a download hangs.
- Test: headless portrait and landscape screenshots, click RELOAD lands on `?r=`, localStorage survives, no console errors; smoke FAILS: []. Cache tag `welcome7` on splash.js. Not yet seen on Tom's phone.
- Not done: a build number on the title screen (offered earlier, not asked for yet).

## 2026-10-30: Home-screen icon shows Tom much bigger
- Tom: make Tom more prominent in the iPhone icon.
- New `icon-v6.png` (180x180): the painted icon cropped in tight around Tom's face, scenery kept as backdrop. `index.html` now points at it (new filename so iOS does not serve the cached icon). No code or spoken lines changed.
- Limit: the only source is the 180px painted icon, so the crop is slightly soft. A larger painting of Tom would be sharper.
## 2026-10-30: Walking paths follow the painted paths
- Tom: many places show a clear painted path that the character cannot walk.
- Town: had no walk mask and invisible legacy tree and fence objects blocking painted paths. Rebuilt a `plateMask` for the town (data/maps-le.js), removed the legacy tree and fence lists, re-seated benches, planters and the shop sign on the painting, and added `noGo` so villagers never plug the doors and the east neck.
- Other maps: about 200 tiles opened across 8 map files (maps-le, la, p2, ch13, ch17, ch18, ch19, ch20), reviewed one by one against the paintings (oak plank bridge, moon club floor and carpet, stacks aisles, sundial and pier paths, tower and gate floors). Low-confidence tiles (props, void edges) were left closed.
- `tools/reach_test.py all` checks every plate map for unreachable exits and NPC plugs. Interactive objects (taxi, counters, shelves and similar) that overreach their art were left alone. Known: the tap test on blvd (27,23) already failed before this change.
- smoke FAILS: []. No spoken lines changed. Not yet seen on Tom's phone (close and reopen the app).

## 2026-10-30: Old Oak door no longer gets stuck when the last scrap scene is cut short
- Tom: no way to knock at the old oak tree, stuck in the game.
- Cause: `ch6-scraps` is only set at the end of the third dig scene (`ch6DigScene`). If that scene was cut short (app closed, old save), all three `ch6-dig-*` flags exist but `ch6-scraps` does not, so the door said "We have 3 of 3 scraps" forever and never offered a knock.
- Fix: `ch6Knock` (data/scenes.js) sets `ch6-scraps` itself when all three digs are recorded, and opens with a recap (TAP TAP, SCRATCH, CHITTER). Repro and fix checked headless; smoke FAILS: []. No spoken lines changed. Not yet seen on Tom's phone.

## 2026-10-30: Rose Mode spends stamps and polish, and wears the best gear, by itself
- Tom: Rose cannot pick stamps and polish, so level ups must apply Auto-Stamp automatically; best gear must go on whenever a new item arrives (gift, win, purchase) or a character joins.
- Rose Mode only (Grace and Director Mode unchanged). `engine/progress.js`: `roseAuto()` is true when `B7.diff==='rose'`; `b6GainXp` and `b6Sync` run `b6AutoStamp(m,true)` after every level up (stamps, Polish ranks, Remix unlocks; `force` ignores the OPTIONS "spend" switch). Members who catch up while away are covered by `b6Sync`.
- `engine/menu.js`: `autoGear(list)` equips `bestFor` in every slot and returns toast sentences ("Grace wears the Hoodie."). Called from `grantItem` (data/party.js, covers story gifts and souvenirs), `buyItem` (shop), both battle drop paths (engine/battle2.js, engine/feel.js), `recruitJoin` (engine/followers.js, also silent story joins) and `chapterJump`.
- Catch-up: switching to Rose Mode (`b7SetDiff`) and loading a save in Rose Mode spend whatever is waiting and dress everyone.
- Test: Grace Mode level up leaves points unspent and gifts in the pocket; Rose Mode spends all Polish Points and stamps the route, wears gifted and bought gear, and Amy joins wearing her best set. Smoke FAILS: []. Cache tag `rose1` on the 8 changed scripts. Not yet seen on Tom's phone.

## 2026-10-30: Jojo (TNB's sister) painted, in the overworld, and in Round with Jojo
- Tom sent a painted sheet made from his photo of her: 12 walk frames (down, up, left, right) and 8 disc golf poses (run, x-step, reach-back, release, follow-through, two cheers, high-five).
- `tools/sprite-bake/bake_jojo.py` (source `tools/sprite-bake/src/jojo-sheet-v1.png`) slices and bakes it: `art/chars/jojo-ow.webp`, `art/chars/jojo-bt.webp`, `data/jojo-hires.js` (generated). The head is enlarged by hand (1.5 front and back, 1.4 side) to the family proportion; the auto-sizer reads her chin too high.
- `data/jojo-hires-use.js` (new, after Justin's): `OW.jojo` (the sheet's right-facing row is 'side', left is its mirror) and `JOJO_BT.draw` / `JOJO_BT.drawOw`, which draw the painted battle and walk frames and mirror them to face the wanted way.
- Overworld: Jojo is an NPC in TNB's Loft (`data/maps-la.js`, map `lofts`, 8,6; wanders like the other NPCs), four first-visit lines that say she is TNB's sister and one that mentions Sunday disc golf, four revisit lines. Her lines have no baked voice (silent until baked).
- Battle: Round with Jojo (TNB B3, unchanged numbers and name) now draws her painted frames in `SC.t6_jojo` (`engine/tnb-moves.js`): walks in, reach-back while she lines it up, x-step, release at the throw, follow-through, a hop at CHAINS, a high-five, walks out. The drawn stand-in stays as the fallback while the art loads. The disc now leaves her hand; the on-screen line at the end says "slow high-five" instead of "thumbs up"; NICE sits above her head.
- Test: `tools/jojo_test.py` (new, 0 fails), `tools/loft_test.py` 0 fails, `kit_test tnb --only=round_with_jojo` at 1x and 2x 0 fails, smoke FAILS: []. Cache tags `jojo1` on maps-la.js, tnb-moves.js and the two new scripts. Not yet seen on Tom's phone.
- Not done: Jojo has no portrait for the dialogue box and no recorded voice; the 'run' and 'celebrate 1' battle frames are baked but unused (room for a "Fore!" call-in).

## 2026-10-30: Stamps screen rows slimmed down and enlarged
- Tom: remove extra info (Primary, the Remix description line, A1), make the remaining text bigger, and fold Polish and Remix into the check on the left instead of separate buttons.
- Rows now show: name, LV, VP, element, description. Gone: the PRIMARY/REMIX tag, the "Remix: ..." line, the A1 slot code, the BASIC/SIGNATURE tag. Text sizes up (title 14 to 17, description 11 to 13, tags 9 to 11).
- The circle on the left is the main button: tap to STAMP (shows the SP cost), and once stamped a cyan "+" badge means tap to POLISH. UNDO, REMIX and SWAP are small buttons beside the move name. Remix is not folded into the circle: it is rare (Lv 28+) and spends a ticket, so it keeps a small confirm button.
- `b8Row` in `engine/progress.js`, `.sc-*` styles in `index.html`; cache tag `progress.js?v=stamps2`. Smoke FAILS: []. Not yet seen on Tom's phone.


## 2026-10-29: Dizzy stars over knocked-out characters line up with the new sprites and get the painted star style
- Tom: "in chapter 2 when people have stars over their head it's not aligning correctly because we changed the character sprites, and the star style should match the updated style of the game." The stars are the dizzy ring over a character at 0 HP (`koDizzy` in `engine/battle-draw.js`, used in every fight). It found the head as "the top six rows of the sprite", which was right for the old kneeling pose and wrong for the new painted KO poses (lying on the back, head to one side), so the ring floated off to the side or above the feet.
- Fix: new `KO_HEAD` table in `engine/battle-draw.js` with the measured head position of each painted KO pose (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB, Nara), as [column, top row] on the sprite as authored; the family are mirrored in the fight and Nara is not, and the code accounts for that. A pose with no entry still falls back to the old top-rows guess. A NEW KO POSE NEEDS ITS HEAD ADDED TO `KO_HEAD`.
- Style: the blocky 5x5 pixel stars are now smooth five-point gold stars with the game's dark round outline (`OUT`), a light-to-amber gradient, a white glint, a slow spin, a soft glow under the ring, and an occasional twinkle. Same orbit and timing as before, back stars smaller and dimmer.
- Cache tag bumped (`battle-draw.js?v=kostar1`).
- Checked: each of the eight characters knocked out alone, close-up before and after (stars now ring the head for all eight); smoke FAILS: []. Not yet seen on Tom's phone. If a ring sits too high or low on one character, change that character's row in `KO_HEAD`.
## 2026-10-29: Casa Alvarez opened up (23 to 42 walkable tiles)
- Tom: the Casa Alvarez grid should be about 3x as navigable. Result is 1.8x: the painted plate is mostly furniture and closed rooms, and the walk mask can only use floor that is drawn.
- `plateMask` in `data/maps-la.js` (map `casa`): added the bunk room (row 2, x 9 to 12, through the gap past the kitchen desk), the foyer's second column (8,7), and the front yard strip (row 10) on both sides of the steps, reached through (5,9) and (8,9). Exits stay at (6,10) and (7,10).
- Kevin moved from the dining room to the bunk room (11,2) so the crowd spreads out. New inspect object: Bunk bed (10,1, 3 wide).
- Still closed because the painting has no doorway: laundry, bath, back hall, bedroom. Reaching 3x needs a new plate with wider floor or painted doorways there.
- Test: `tools/casa_test.py` 0 fails (new checks for bunk, yard, foyer column); smoke FAILS: []; townsfolk and ch12 tests 0 fails. Cache tag `maps-la.js?v=casa2`. Not yet seen on Tom's phone.

## 2026-10-29: Bready Mercury on Tom's kitchen island
- Tom: Bready Mercury should be visible in the game world, e.g. sitting on the counter, using the starter move art as the reference. The painted house plate had an empty island.
- Done (draw only): `drawBreadyJar` in `engine/plate.js`, called from `plateLive` for map `tomhouse`. Same jar as the starter moves (glass, cream starter that bubbles, gold lid, MERCURY label with a tiny face and mustache), plus a small crown. Sits left of the sink, drawn over the painting and under the actors.
- Story gating: hidden only in chapter 6 until `ch6-clear` (the squirrels have him), back from the Oak boss on and in every other chapter. The island's inspect text follows it (`when` variant in `data/maps-la.js`): empty round spot in the flour and tiny footprints while he is gone, Bready by the sink otherwise.
- Cache tags bumped (`plate.js?v=bready1`, `maps-la.js?v=bready1`). Test: new `tools/bready_test.py` 0 fails; smoke FAILS: []. Zoom in `tools/shots/bready-zoom.png`. Not yet seen on Tom's phone. To move or resize, change the two numbers in the `plateLive` call (position 606, 499 and scale 1.2).
- Not done: other places Bready could appear (the ch8 bakery rack, Tom's Long Island side). The Oak crown already shows the jar on the hoard.

## 2026-10-29: Enemy hurt frame holds longer
- Tom: the enemy's damage frame flashed too quickly. The hurt frame only showed while the hit's shake or flash timer ran (about 0.35 s for most hits), and the white flash lasted 0.16 s.
- Fix in `engine/battle2-ui.js` (`b2FoeFrame`, `B2_HURT_HOLD` = 700 ms): once a hit starts, the hurt frame is held for at least 0.7 s, for every move, since it is decided in one place. White flash on a plain hit raised from 0.16 s to 0.3 s (`engine/battle2.js`, `engine/battle2-traits.js`). Party member flash unchanged.
- Checked: hurt frame measured on a painted Grump, last hurt frame at 710 ms, idle at 727 ms (was about 350 ms); smoke FAILS: []. Not yet seen on Tom's phone. To tune, change `B2_HURT_HOLD`.

## 2026-10-29: More distance when Tom talks to someone
- Tom: "when approaching a character and talking to them, there should be a bit more distance between them. Currently they are almost touching." Tom and a neighbor stand on adjacent tiles and the painted figures are drawn wider than a tile (1.2x outdoors, 1.98x in rooms), so they touched.
- Fix (draw only): `talkGapFrame` and `drawActorSpaced` in `engine/town-render.js`, called from the actor loop in `engine/draw.js`. While Tom faces a neighbor, or is in a dialogue with one, Tom and the neighbor are eased 9 px apart sideways or 11 px apart up and down (more, because tall figures overlap that way). Tom's followers move with him so nobody is crowded from behind. It eases in and out in about a quarter second. Tiles, collision and interaction are untouched. Monsters and the TNB kiss get no gap (the kiss lean stays as it was).
- Cache tags bumped (`town-render.js?v=gap1`, `draw.js?v=gap1`) so the phone reloads them.
- Tests: new `tools/talkgap_test.py` (all four approach directions, held during dialogue, eases back to zero, tiles unchanged, no page errors) 0 fails; smoke FAILS: []. Zoomed before/after in `tools/shots/talkgap-compare.png`. Not yet seen on Tom's phone. If it is still too close, raise `TALK_GAP_X` and `TALK_GAP_Y`.
## 2026-10-29: Chapter 1 intro, Tom no longer shrinks when he stretches
- Cause: the painted stretch frames (`TOM_STRETCH`, art/chars/tom-stretch.webp) are the same body size as his walk frames (k 3, about 42 rows), but `drawStretchPainted` and the old pixel fallback in `engine/intro.js` drew them at scale 1 while the walk sprite is drawn at `actorK()` (1.2 on outdoor maps such as the opening Square). So Tom dropped to 83% height as soon as the stretch began and grew back after.
- Fix: both stretch drawers now use `actorK()*(OW.tom.k||1)` for the sprite, shadow, bob and the `~` puffs.
- Checked: before/after frames of all poses against the walk sprite after the stretch (same height); smoke FAILS: [].

## 2026-10-30: Justin on the welcome screen
- `SPLASH_SPOTS` in `engine/splash.js` gets Justin (x 630, feet 1150, h 330): he stands just behind Amy and Deedee, listed second (after Nara) so everyone else draws over him, which leaves his head and shoulders showing above the row. He is the tallest figure on the page. Portrait only (landscape shows the title only). No spoken lines changed.
## 2026-10-29: Painted Justin (overworld)
- Tom sent Justin's walk sheet (3 rows of 4, magenta) with the word "Justin" and then: head to body ratio like TNB and Boppy, a bit taller than everyone (6'5" in real life). Installed as the painted overworld set `OW.justin` (replaces the old traced set; the ch5 map NPC and the ch10 ending spawn both use `sheet:'justin'`).
- `tools/sprite-bake/bake_justin.py` (copy of bake_ellie.py) writes `art/chars/justin-ow.webp` and `data/justin-hires.js`; `data/justin-hires-use.js` wires it (tags added in `index.html` after ellie-hires-use). The sheet's head was 26 percent of his height, so the baker solves a head factor per view (front 2.07, back 2.27, side 1.80) to put hair-to-chin at 0.42 of the figure front and back and 0.40 in profile (TNB 0.433, Boppy 0.40), tapered below the chin. Pink hair-tip halo pulled out (`despill_pink`).
- Height: 53 rows (Tom, TNB, Boppy, Amy 42; Michael 50), so he is the tallest in town. Body not widened. Canon updated (docs/CANON.md).
- Tests: new `tools/justin_test.py` (taller than Michael and Tom, shows in the Gregori house in all four facings, shots `tools/shots/justin-*.png`) 0 fails; smoke FAILS: []. Not yet played on Tom's phone. No battle sheet yet (Justin is not a party member).
## 2026-10-29: Painted plate for the Finish Line (chapter 19, Amy's memory room)
- The Finish Line (map id `memamy`, 16 x 11 tiles at 64 px, `art/memamy.webp` from `68_memamy_final.png` and `68_memamy_grid.png`, sent with no text, so treated as "install this plate"). Entry in `PLATES` (`engine/plate.js`); the room is a planMerge area so the cast draws at 1.2x. `plateMask` in `data/maps-ch19.js` is the walk map: the red track rows 4 to 6 (cols 1 to 13), row 7 cols 6 to 13, a strip behind the pedestal on rows 2 and 3 (cols 9 to 12), the stone apron and rug (cols 7 and 8, rows 8 and 9). Blocked: the back wall, bleachers (cols 1 to 6, rows 2 to 3), the pedestal (7 to 8, row 3), the top tape pole (13, rows 2 to 3), the finish tape and its pole (cols 14 to 15, rows 3 to 7), the plants and bricks along the bottom wall, the left railing and crates.
- Objects re-laid, text unchanged: bleachers (1,2) 6x2, race clock (10,0) 4x2 (hangs on the wall, touched from row 2), cones (4,5) and (10,5), hurdle (6,5) 2x2, finish tape (14,3) 1x5. Pages moved onto the painted pages: amy1 (3,4), amy2 (8,6), amy3 (11,3). Keepsake pedestal (8,3). Pages and the pedestal stay live (`liveKinds`) so they dim and fill. The door is now two tiles, (7,10) and (8,10), both to the hub (20,4); the hub's Amy door still lands you at (8,9).
- Tests: new `tools/memamy_test.py` (objects touchable, stand and arrival tiles walkable, A opens every prop, page and the pedestal, both door tiles walk out by key, a room walk, shots `tools/shots/memamy-*.png`) 0 fails; `tools/ch19_test.py` and `tools/smoke.py` 0 fails. Known roughness: minimap still draws the old tile look; the painted pages keep their painted glow after they are read; Tom has not checked it on his phone. With this, all four memory rooms are painted.
## 2026-10-29: Painted plate for the Forever Engine (chapter 20 finale)
- The Forever Engine (map id `foreverheart`, 22 x 15 tiles at 64 px, `art/foreverheart.webp` from `foreverheart_final.png` and `foreverheart_grid.png`, sent with no text, so treated as "install this plate"). Entry in `PLATES` with `actorScale` 1.98 (area maps count as outside, so it is ignored there). Spawn (10,12) and both lift exits (10,14) and (11,14) unchanged.
- `plateMask` in `data/maps-ch20.js`: only the round floor walks (rows 8 to 10 across, row 7 along the front of the Engine base so you can stand under the Leviathan at (11,5) and Julian at (11,6)), plants and gate posts block, the gate lane (cols 10 to 11, rows 12 to 14) walks to the lift doors.
- Objects re-laid, text unchanged: Engine (7,0) 8x7, gears (4,5) and (15,5) 3x3, clocks (2,0) and (18,0) 2x8 (tall boxes so they are touchable from row 8), plants (3,10) and (17,10) 2x2. No live props; the painting is static (the old "runs warm once Julian is calm" glow on the tile Engine is not drawn on the plate).
- Tests: new `tools/foreverheart_test.py` (objects touchable, spawn and both lift doors walkable, A opens all eight props, both lift doors by keys, held-key edge walks, shots `tools/shots/foreverheart-*.png`). smoke FAILS: []; ch20_test FAILS [].
## 2026-10-29: Painted plate for the Dead-Letter Office (chapter 19 hub)
- The Dead-Letter Office (map id `deadletter`, 26 x 17 tiles at 64 px, `art/deadletter.webp`, entry in `PLATES`) now uses Tom's painting (files `deadletter_final.png` and `deadletter_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch19.js` is the walk map: the strip under the doors (row 4), lanes round both belt ends (column 2 and column 23), the open floor (rows 7 to 12) and the gate opening and stairs (columns 12 and 13, rows 13 to 16). Blocked: the back wall, the gear boxes, the parcel table, the bucket and parcel stacks by the benches, the crates along both side walls, the railings and planters.
- The four memory doors moved from the corners to the painted north wall, left to right Rose (amber, clock), Grace (blue, hand), Amy (green, runner), TNB (pink, vase). Each door is two portal tiles on row 3: Rose (2,3)(3,3), Grace (5,3)(6,3), Amy (19,3)(20,3), TNB (22,3)(23,3); you arrive from a room on row 4 under its door, facing down. `CH19_ROOMS` door and back fields updated; the four memory rooms' exits land on the new arrival tiles. Spawn stays (12,14); the Censor still rises at (12,9).
- Objects re-laid, text unchanged: Claim Desk (10,5) 6x2, belts (4,5) 6x1 and (16,5) 7x1, sacks (6,7) and (18,7) 2x2, ledger stand (15,9) 1x2, benches (6,9) 4x1 and (16,9) 5x1, big stamp (24,5) 2x4, lamps (8,3) and (17,3) touched from row 4. Two hub monster spots moved off the railings: (5,14) to (4,11), (20,14) to (21,11).
- Tests: new `tools/deadletter_test.py` (objects touchable, spawn, Censor spot, bell tile and all four arrivals walkable, A opens every prop, all four doors and the stairs by keys, both lanes by keys, shots `tools/shots/deadletter-*.png`) 0 fails; `tools/ch19_test.py` and `tools/smoke.py` 0 fails. Known roughness: minimap still draws the old tile look; on row 4 the party stands close over the back edge of each belt; Tom has not checked it on his phone.
## 2026-10-29: Painted plate for the Stillness Core (chapter 20)
- The Stillness Core (map id `stillcore`, 26 x 17 tiles at 64 px, `art/stillcore.webp`, entry in `PLATES` with `actorScale` 1.98) now uses Tom's painting (files `stillcore_final_1.png` and `stillcore_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch20.js` is the walk map. The gate at the bottom opens onto a fenced causeway (cols 13 and 14) up to the Engine lift on the central dais; row 13 is the wide floor in front of the dais, and its two rail tiles (cols 12 and 15) are left open so the causeway joins the floor (the painting fences it off with no way round).
- Exit and arrival tiles moved to the painted gate: exits (13,16) and (14,16) (were 12,16 and 13,16), spawn and the Vault lift arrival (13,14) (was 12,14), the Forever Engine's return exits land at (13,15) and (14,15). `data/scenes-ch20.js` places Tom at (13,14) in both places.
- Doors re-laid to the painting (3 x 2 touch boxes, same names and puzzles): upper row Tom (3,3), Grace (7,3), Rose (17,3), Amy (21,3); lower row Deedee (3,7), Boppy (7,7), TNB (17,7), Nara (21,7). The lower doors are touched from row 9. The upper doors sit on shelves with no stairs painted, so the shelf (row 5) is reached by the stone pillars at cols 6 and 20 (rows 5 to 8), which walk like a ladder. Lift (12,10) 4 x 2, touched from (13,12) or (14,12). Coffee urn (2,10), plant (4,11), bench (1,12).
- Doors and the lift are live over the painting (`liveKinds: ['cedoor','celift']`): `engine/ch20-render.js` draws only what changes, a glow in the member's colour over an open door, and on the lift dais eight lamps (one per open door) plus a gold glow once all eight are open. The old code-drawn brass doors are gone on this map.
- Removed (painted, out of reach): the two wall gears and the Core clock objects, so their prop text is gone. Added one prop for the painted little white box at (21,12): "Little white box" (SPARE MINUTES, an empty slot). Prop text, not spoken; no clips affected.
- Tests: new `tools/stillcore_test.py` (every object touchable, arrival and exit tiles walkable, A opens all eight doors, the lift, coffee, plant, bench and box, both pillar climbs and the causeway walk by real keys, the gate returns to the Vault, doors and lift light up, portrait and landscape shots `tools/shots/stillcore-*.png`) 0 fails; `tools/ch20_test.py` and `tools/smoke.py` see the log below. Known roughness: the open-door glow is a round disc over an arched door; the pillar "ladder" has no ladder drawn on it; the minimap still draws the old tile look.
## 2026-10-29: Painted plate for the Shoulder Hall (chapter 19, Rose's memory room)
- The Shoulder Hall (map id `memrose`, 16 x 11 tiles at 64 px, `art/memrose.webp` from `memrose_final.png` and `memrose_grid.png`, sent with no text, so treated as "install this plate"). Entry in `PLATES` (`engine/plate.js`); the room is a planMerge area so the cast draws at 1.2x. A `plateMask` in `data/maps-ch19.js` is the walk map: the carpet rows 3 to 9, cols 1 to 14. Blocked: the back wall (rows 0 to 2, the two tall lamps and a new candle stand talked to from row 3), the step stool (5,5), the ribbon coil (2,5) 3x2, the pillow fort (9,4) 5x3 with its roof at (11..13,3), the coat rack (14,2) 1x5, col 0 and col 15. The doorway is both posts' gap: exits at (7,10) and (8,10) to the Dead-Letter Office.
- Objects re-laid to the painting: lamps (4,1) and (10,1), coat rack (14,2), ribbon (2,5), stool (5,5), fort (9,4), new prop `candle` (7,1) ("Candle stand", one new line, not spoken). The three pages sit on the painted pages: rose1 (5,3), rose2 (10,7), rose3 (5,8) (were 2,4 / 12,7 / 6,8). The keepsake pedestal moved from (8,3) to (7,5), the open middle of the carpet, so row 3 stays a through lane to the east lamp. Pages and pedestal stay live over the painting (`liveKinds:['dlmem','dlkeep']`) because they change when read and when the keepsake goes down.
- Tests: new `tools/memrose_test.py` (every object touchable, ch19 stand tiles walkable, A opens every prop, both door tiles walk out with real keys, row 3 walk, portrait and landscape shots `tools/shots/memrose-*.png`) 0 fails; `tools/ch19_test.py` and `tools/smoke.py` 0 fails. Known roughness: minimap still draws the old tile look; a player standing at (10,3) overlaps the fort roof; the painted pages stay faintly visible under a read (dimmed) page.
## 2026-10-29: Painted plate for the Kiln Room (chapter 19, TNB's memory room)
- The Kiln Room (map id `memtnb`, 16 x 11 tiles at 64 px, `art/memtnb.webp`, entry in `PLATES` with `actorScale` 1.98) now uses Tom's painting (files `memtnb_final.png` and `memtnb_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch19.js` is the walk map: the open floor between the kiln and the wheel, the strip in front of the cup shelf (row 2), the lane down to the door rug. Blocked: the two wall rows, the kiln and its control panel, the barrels, the clay bags, the workbench and bucket, the flower table on the left, the big jar on the right, the railings.
- The door is now the rug at the bottom of the stairs: exit (6,10), spawn (6,9) (was 8,10 and 8,9). The hub's east door lands at (6,9).
- Objects re-laid onto the painting: kiln (2,2) 3x3; shelf of cups (6,1) 4x1 (touched from row 2); clay bags (10,2) 2x2 (touched from 9,2); wheel (10,4) 2x2; stool (9,5); tool rack moved from the floor to the right wall and bench (12,3) 3x3 (touched from 12,6 facing up); keepsake pedestal (7,3) on the painted glowing stand; pages at (1,5) on the left crate, (6,2) by the shelf, (14,6) on the right stand. The pages and the pedestal are `liveKinds` so they dim when read and show the cup once placed.
- Two page descriptions and the tool rack's opening words changed to match the painting (prop text, not spoken; no clips affected): tnb2 "A page on the little stand by the jars...", tnb3 "A page propped against the shelf...", tools "Over the bench, ribs, loops and wire...".
- Tests: new `tools/memtnb_test.py` (objects touchable, stand and arrival tiles walkable, A opens every prop and page and the pedestal, walking down the rug returns to the hub, the hub door lands on the rug, shots `tools/shots/memtnb-*.png`) 0 fails; `tools/ch19_test.py` and `tools/smoke.py` 0 fails. Known roughness: the painted pages keep their painted glow after they are read (only the live page sprite dims); minimap still draws the old tile look.
## 2026-10-29: Painted plate for the Loom Chamber (chapter 18)
- The Loom Chamber (map id `towerpinnacle`, 22 x 15 tiles at 64 px, `art/towerpinnacle.webp`, entry in `PLATES`) now uses Tom's painting (files `towerpinnacle_final.png` and `towerpinnacle_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch18.js` is the walk map: the floor in front of the Loom (rows 6 to 10, between the two display cases), the full-width band on row 9, and a narrow way between the balustrades through the gate to the lift stairs (rows 11 to 14, x 8 to 13 then 9 to 12). Blocked: the Loom and its gears, both clocks and the side platforms, both display cases, both plants, the balustrades, the glass walls.
- Objects re-laid as touch boxes: Loom [6,1,10,5] (touch from row 6), clocks [3,1,3,5] and [16,1,3,5] (touch from (5,6) and (16,6) facing up), cases [2,6,3,3] and [17,6,3,3], plants [1,10,3,3] and [18,10,3,3]. Spawn (10,12) and the lift exits (10,14), (11,14) unchanged. Vance's spot moved from (10,5) to (10,6) so he stands on the floor at the Loom's rail.
- Tests: new `tools/towerpinnacle_test.py` (objects touchable, spawn, exits and Vance's spot walkable, plate live, A opens every prop, row 9 walks end to end by keys, the Loom blocks, walking down through the gate reaches the vault, portrait and landscape shots `tools/shots/towerpinnacle-*.png`) 0 fails; `tools/ch18_test.py` 0 fails; `tools/smoke.py` 0 fails. No spoken line changed. Known roughness: minimap still draws the old tile look.

## 2026-10-29: Four story characters painted (Marlowe, HUSH-9, Mr. Pistachio, Julian Vance)
- Sheets `tools/sprite-bake/src/{marlowe,hush9,pistachio,vance}-walk-v1.png` added to `CAST` (heights 43, 40, 40, 42). Names from Tom's file-names screenshot (HUSH-9 Subway Car, mrpistacchio, monochromemarlow, julianvance).
- Marlowe, HUSH-9 and Mr. Pistachio are spawned by scenes (`storySpawn`), not placed on maps, so `TOWN_PAINTED` matches them by name AND the look they are spawned with (`marlowe`, `hush9`, `bun`). Mr. Pistachio is spawned with the stand-in look `bun` (ice cream bonus), so Bun keeps her own art. `tools/townsfolk_test.py` now also spawns these three in Casa Alvarez and checks they draw painted.
- Julian Vance is registered as `OW.vance` only. He has no walking appearance in any scene yet (battle monster and a voice in the camera), so nothing in the game shows him until a scene spawns him with that set.
- Checks: `tools/townsfolk_test.py` 0 fails, smoke 0 fails.
## 2026-10-29: Painted plate for the Gym Floor (chapter 19, Grace's memory room)
- The Gym Floor (map id `memgrace`, 16 x 11 tiles at 64 px, `art/memgrace.webp`, entry in `PLATES` with `actorScale` 1.98) now uses Tom's painting (`memgrace_final.png` and `memgrace_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch19.js` is the walk map: the floor is rows 2 to 8 between the left bench and the bleachers; the beam blocks row 4 from col 3 to col 11, walked round at col 2 or col 12; the entrance mat is row 9 cols 6 to 9 down to the door at (8,10).
- Objects re-laid to the painting: beam (3,4) 9x1; scoreboard (6,1) 4x1, touched from row 2; chalk cart (1,3) beside the bench, touched from (2,3) facing left; folding chair (14,5) 2x2, touched from (13,6); trophy shelf (11,1) 3x1; pages at (5,2), (12,6), (2,7); keepsake pedestal (10,2) on the painted brass stand, touched from (10,3). Pages and pedestal are `liveKinds`, drawn over the painting so they dim and glow with the story.
- One object description reworded because the page moved: grace2 was "tucked against the foot of the beam", now "tucked in by the bleachers". Not a spoken line, no clip affected.
- Tests: new `tools/memgrace_test.py` (objects touchable, stand tiles below each page and the pedestal walkable, A opens every prop, the door exit by key, the walk round the beam by keys, portrait and landscape shots `tools/shots/memgrace-*.png`) 0 fails; `tools/ch19_test.py` and `tools/smoke.py` 0 fails. Known roughness: minimap still draws the old tile look; Tom has not checked it on his phone; the other three memory rooms (memrose, memamy, memtnb) are still tiled.

## 2026-10-29: Painted plate for the Shelf Hall (chapter 17)
- The Shelf Hall (map id `towershelves`, 28 x 14 tiles at 64 px, `art/towershelves.webp`, entry in `PLATES`) now uses Tom's painting (files `towershelves_final.png` and `towershelves_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch17.js` is the walk map: one long aisle along row 5 in front of the three north cases, and a wider strip (rows 6 to 8) with three benches. Blocked: the wall, all six cases, both small cases, the lift, the coffee cabinet, the vault door, the benches, lamps and plants, and everything south of row 8.
- Shelves re-laid to the painted cases: `CH17_SHELVES` is now `[x,y,w,h]` (was `[x,y]`, always 4 x 2): shelf 1 (3,2) 5x3, shelf 2 (9,2) 6x3, shelf 3 (16,2) 5x3, shelf 4 (2,9) 7x4, shelf 5 (10,9) 7x4, shelf 6 (18,9) 7x4. North shelves are touched from row 5 facing up, south shelves from row 8 facing down. The gold light column in `engine/ch17-render.js` now rises from the middle of each case.
- Other objects moved to the painting: the way back to the stairs is the round vault door on the west wall (0,4) 1x2, reached from (1,5), and the party now arrives at (1,5) from the stairwell hatch (was (1,6)); the express lift (25,2) 3x3; the coffee machine (23,3) 2x2; the two small cases (1,6) 3x3 and (25,6) 2x3. Spawn moved from (2,6) to (2,5).
- Two lines of flavor text had no reachable home on the painting (the wall clock and the hall sign are above the cases), so they now live on two of three new velvet benches (6,7), (11,7) and (17,7): the clock line "THIS IS FINE", and the hall sign's PLEASE DO NOT TOUCH text. The third bench has a new line. No spoken lines changed, no clips affected.
- Tests: new `tools/towershelves_test.py` (objects touchable, spawn, arrival and monster spots walkable, A opens every prop, the whole aisle walks end to end by keys, portrait and landscape shots `tools/shots/towershelves-*.png`) 0 fails; `tools/subdepot_test.py` and `tools/smoke.py` 0 fails. In `tools/ch17_test.py` the six-shelf smash loop uses the new footprints and all six smash. The later steps of ch17_test (back at the stairs onward) were already failing before this change, on an unmodified checkout, so they are not caused by it. Known roughness: minimap still draws the old tile look; the monsters (Curators, Paperweights, a Pause Sprite) roam in the aisle and can stand in row 5.

## 2026-10-29: Under the Amber is painted (chapter 13 cavern)
- Tom's painting of the chamber at the end of the Sub-Rail (`art/subchamber.webp`, 1664 x 896, 26 x 14 tiles at 64 px, entry in `PLATES` with `actorScale` 1.98). He sent the final plus grid pair (`subchamber_final.png`, `subchamber_grid.png`).
- `data/maps-ch13.js`: new `plateMask` for `subchamber` (rock walls, the amber wall, the two rubble piles on the north wall, the left pile, the barrel pile, the lower-right pile and both tripod lamps block; the rails, the open floor and the tunnel mouth walk). Objects re-laid onto the painted piles and lamps, text unchanged. The way back to the tunnel is now the painted tunnel mouth (exits at 1,3 and 2,3, top left); the painted tunnel's east doors (34,2 and 35,2) land at (3,4) and (3,5), and the tunnel mouth returns to (33,3). Spawn (3,4). The Drill Worm stays at (12,6).
- The painted amber wall is further right than the old tile wall, so the coin melt moved: the glass doorway is tiles (21,5) and (22,5) (was 20,6 and 20,7). `data/scenes-ch13.js` (positions only, no spoken lines changed): Nickel arrives from the tunnel mouth along the rails; Sal and Penny stand behind the glass at (22,4) and (21,4) and walk out through the doorway to (18,7) and (18,6) (the two swapped sides). `storyWorld` reopens the new doorway tiles.
- `engine/ch13-render.js` `ch13PlatePainted` (replaces the old tint rectangle on the painted map): until the melt, a veil of the painting is laid back over the glass so Sal and Penny read as behind it; gold runs down the glass during the melt, then the doorway glows softly and stays lit.
- The exit-tile wall bug (pools laid over exits made the Sub-Rail exits solid) was fixed in `engine/world.js` `buildArea` by a parallel session in the same hour; that version is kept. The chamber's exits also walk through its `plateMask`.
- Tests: new `tools/subchamber_test.py` (objects touchable, tunnel mouth and worm spot connected, tunnel round trip, doorway blocked until melt, the melt scene with Sal and Penny walking out, shots `tools/shots/subchamber-*.png`) 0 fails; `ch13_test.py`, `gate00_test.py`, `blvd_test.py`, `bg_test.py`, `ch11_test.py`, `smoke.py` 0 fails.
- Known roughness: the minimap still draws the old tile look; the pocket behind the glass is only painted, not walkable.
## 2026-10-29: Painted plate for the Tower Stairwell (chapter 17)
- The Stairwell (map id `towerstairs`, 18 x 42 tiles at 64 px, `art/towerstairs.webp`, entry in `PLATES`) now uses Tom's painting (files `towerstairs_final.png` and `towerstairs_grid.png`, sent with no text, so treated as "install this plate"). `plateMask` in `data/maps-ch17.js` is the walk map: eight one-row-deep landings (floors 2, 12, 15, 18, 21, 24, 27, 30) joined by the painted flights. Floors 2, 12 and 15 have no visible flights in the art, so the far right column (x 16) walks as the connection between them.
- Floor numbers follow the painting: 2, 12, 15, 18, 21, 24, 27, 30 (were 2, 6, 10, 14, 18, 22, 26, 30). Sign texts were carried over to the new numbers; coffee machines are now on floors 2, 12, 18 and 24 (were 10, 18, 26), so there are four restore points. New prop: the open wall safe on floor 12 (`glsafe`, new text). The brass plate text on floor 30 is merged into the floor 30 sign.
- Moved: lobby door arrival (4,39) and (5,39); exits (2,39) and (3,39) (the painted door); spawn (4,39); the hatch is now (14,2), the sealed door (10,2) 3x1; the landing scene area is [2,3,14,3]; the girls wait at (4,3) and (6,3); returning from the Shelf Hall arrives at (13,3). Stair monsters re-spotted: (10,39), (9,34), (9,29), (10,23), (7,19), (6,13), (6,8). `tools/ch17_test.py` coordinates updated. No spoken line changed.
- Tests: new `tools/towerstairs_test.py` (objects touchable, all landings and monster spots connected from the door, A opens every prop, lobby door and east door by real keys, right column walk, portrait and landscape shots `tools/shots/towerstairs-*.png`) 0 fails; `tools/smoke.py` 0 fails. `tools/ch17_test.py` fails from "back at the stairs" onward, same as before this change (pre-existing, not yet investigated).
## 2026-10-29: The Glass Tower lobby is painted (chapter 17, map `towerlobby`)
- Tom's painting of the lobby (`art/towerlobby.webp`, 1408 x 896, 22 x 14 tiles at 64 px, entry in `PLATES` with `actorScale` 1.98). Used the final plus grid pair (`towerlobby_final.png`, `towerlobby_grid.png`); the baked art is the grid-free final.
- `data/maps-ch17.js`: new `plateMask` for `towerlobby`. Rows 0 to 4 (window wall, back wall, desk, coffee cabinet, back planters), the lift wall on the left diagonal, both lounge benches, the corner planters and lanterns, and the glass fence block. The floor, both rugs, the gate doors (x 8 to 12, rows 11 to 13) and the east door mat walk.
- Exits: the east stair door is now tiles 21,7 and 21,8 (was 21,8 and 21,9); both stairwell doors land at 20,8 (was 20,8 and 20,9, which is now planter). South gate exits and spawn (10,11) unchanged.
- Objects re-laid to the painting (wall pieces are touched from the floor row below them): coffee machine (6,4) restore point, floor directory (7,4), desk (8,4), clock (10,4), desk (12,4), frames (15,4) 3x1, plants (5,4) (14,4) (4,11) (17,11), benches (1,7) 3x3 and (17,8) 3x2 plus (18,7), three lift doors (1,6) (2,5) (3,4), stairs sign (20,6). Object text is unchanged except two: the clock and the second desk (new line: pen cup, guest book, empty chair, signatures timed 4:59). Hint now says "through the east door". No spoken lines changed.
- Test: new `tools/towerlobby_test.py` (every object touchable, stand tiles connected, text opens, desk blocks, walk up from the gate, east door to the stairwell, both stairwell doors return to walkable floor, south doors to the boulevard, portrait and landscape shots). smoke, blvd, gate00, loftlobby tests 0 fails.
- Known, pre-existing (same 11 failures on the code before this change): `tools/ch17_test.py` fails from "back at the stairs" onward (Shelf Hall to Vault part of the script). Not touched.

## 2026-10-29: Eight more painted townsfolk, Los Angeles (Ryan, Dakota, Sam, Jordan, Dona Carmen, Miss Odette, Priya, Sofi)
- Sheets `tools/sprite-bake/src/{ryan,dakota,sam,jordan,carmen,odette,priya,sofi}-walk-v1.png` added to `CAST` (heights 42, 37, 38, 43, 38, 36, 39, 36). Files arrived as "image.png" with a names screenshot; matched by palette in `data/maps-la.js`. All matched BY NAME (`TOWN_PAINTED`); the look keys for Dona Carmen and Miss Odette are `carmen` and `odette`.
- Checks: `tools/townsfolk_test.py` (55 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Painted plate for the Vault (chapter 17)
- The Vault (map id `towervault`, floor 59, 22 x 14 tiles at 64 px, `art/towervault.webp`, entry in `PLATES`) now uses Tom's painting (files `towervault_final.png` and `towervault_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch17.js` is the walk map: a ring round the snow globe (row 3 in front of the lift, side lanes at columns 7 and 14, the row 9 apron, the wide row 10 in front of the cases), the stairs carpet down to the lobby, and a lane down the east wall (column 20) that leads to the coffee table behind the north-east case.
- Objects re-laid to the painting: snow globe (8,5) 6x4, Pinnacle lift (10,1) 2x2, cases (3,3) 4x3, (2,6) 4x4, (15,3) 3x3, (16,6) 4x4, Archive bench (3,11) 4x1, coffee machine (17,2) 2x1, freight lift sign (18,11) 2x2. Object text unchanged. The Twin Lenses still hover at (10,4) over the globe and are talked to from (10,3); the lift arrival tiles (10,3) and (11,3) are unchanged. No scenes or spoken lines changed.
- Tests: new `tools/towervault_test.py` (every object touchable, stand and arrival tiles walkable, A opens every prop, the stairs exit works, the east lane reaches the coffee machine, portrait and landscape shots `tools/shots/towervault-*.png`) 0 fails; smoke, `ch17_test`, `ch18_test` 0 fails. Known roughness: the minimap still draws the old glass tile look; characters draw at the outdoor scale (1.2x); the coffee lane brushes the east lamp pillar.

## 2026-10-29: Painted plate for the Sub-Rail Depot (chapter 13)
- Sub-Rail Depot (map id `subdepot`, 24 x 12 tiles at 64 px, `art/subdepot.webp`, entry in `PLATES`) now uses Tom's painting (files `subdepot_final.png` and `subdepot_grid.png`, sent with no text, so treated as "install this plate"). A `plateMask` in `data/maps-ch13.js` is the walk map: the upper platform (rows 3 and 4), the lower platform (rows 8 to 10) and the track bed between them (rows 5 to 8, which walks like the old rails did). Blocked: the wall and stairs, Sol's desk and cabinets, both benches, the handcar, both piles of mail crates, the fence and lamp post at the far right, and the pit under the lower platform.
- Exits moved to the painting: the stairs up to the boulevard are now (1,4) and (2,4) (were the west edge), the tunnel mouth is (23,3) and (23,4) (were (23,7) and (23,8)). The tunnel's west exits now arrive at (22,3) and (22,4) on the platform. Spawn moved from (4,5) to (4,4).
- Objects re-laid to the painting: console (5,3) 4x1, route map (9,2), station sign (13,2), coffee machine (17,2) 2x1, work lamp (20,2), upper bench (14,3), handcar (12,5) 3x2, lower bench (14,8) 4x2, mail crates (1,9) 5x2 and (7,9) 4x2. Object text is unchanged.
- Story tiles moved off the track bed onto the platform: the chapter 13 opening now puts the party at (8,4) (was (8,5)), "GO DOWN" from the boulevard arrives at (3,4) (was (3,5)), and Nickel's walk in and out of the depot turns up to row 4 for his last three steps (`data/scenes-ch13.js`). No spoken lines changed.
- Tests: new `tools/subdepot_test.py` (objects touchable, stand and arrival tiles walkable, A opens every prop, both exits work by walking, the track bed crosses, portrait and landscape shots `tools/shots/subdepot-*.png`) 0 fails; `tools/ch13_test.py` and `tools/smoke.py` 0 fails. Known roughness: the minimap still draws the old tile look; characters draw at the outdoor scale (1.2x) like Flight Zero, because area maps count as outside.

## 2026-10-29: Rose hops off Tom's shoulders before a Tombo
- When Rose is riding Tom (Shoulder Ride) and any Tombo or Tom Family Finish starts, `b2Dismount()` in `engine/battle2-kind.js` ends the ride, plays a short hop from his shoulders back to her place in the line (about 0.6 s), shows a message, refreshes the RIDE badge, and only then does the normal step-out and animation begin. No effect when she is not riding. No spoken lines changed.
- Checked in headless Chromium: Tom + Rose (Double-Decker Airplane) and Tom + Grace (Squishy Delivery), portrait and landscape, ride ends, no page errors; frames looked at. Smoke 0 fails.

## 2026-10-29: Loading screen replaces the "The game did not load" card
- Cause: a 12 second watchdog in `index.html` showed the error card whenever the game had not started yet. The game loads 196 scripts (about 122 MB of baked voice), so a slow first load passed 12 s and the card stayed on screen even after the game booted.
- New `#boot` loading screen (navy, gold flower, moving bar, "Loading the town...") covers the stage immediately and fades out on the first frame (`js-running`). After 15 s it adds a "still going" line. The retry screen shows only if a game file fails to download (8 s grace) or 90 s pass with no start. It no longer links to the claude.ai artifact.
- Checked in headless Chromium: normal boot, 20 s delayed script (no error at 12 s, clears on boot), blocked `main.js` (retry shows). Smoke 0 fails.

## 2026-10-29: Six more painted townsfolk, Los Angeles (Mateo, Daisy, Kevin, Claudia, Yesenia, Tony)
- Sheets `tools/sprite-bake/src/{mateo,daisy,kevin,claudia,yesenia,tony}-walk-v1.png` added to `CAST` (heights 36, 38, 40, 38, 38, 38). Files arrived as "image.png" with a names screenshot; matched by palette in `data/maps-la.js`. All matched BY NAME (`TOWN_PAINTED`). Tom's screenshot also listed "Magenta Teen Character Turnaround", not selected and not sent, so skipped.
- Checks: `tools/townsfolk_test.py` (47 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Fix: a beaten monster on a one-tile path no longer walls off the route (Whispering Marsh softlock)
- Bug (Tom): in the Whispering Marsh the monsters on the boardwalk blocked the only path, so the game was stuck for good. Cause: map monsters are solid NPCs and the marsh route is one tile wide in places (Bobber at 16,12 on the long boardwalk, Tangle in the neck at 10,8). Winning only puts the monster to sleep ("resting", 25 s, `defeatedUntil`) on the same tile, still solid, and it wakes and fights again, so Tom could never pass. From the entry platform only 15 of 50 walkable tiles were reachable.
- Fix: `engine/battle-draw.js` `canOccupy` now lets Tom and the party walk through a monster that is resting (`restingPassable`). An awake monster is still solid and still fights on touch. The tile map, spots and story scenes are unchanged.
- Same bug existed in 20 maps with monsters on narrow paths (worst: carbarn 24 of 111 tiles reachable, concourse 242/405, backlot 47/86, reeds 15/50); all are covered by the same rule.
- Test: new `tools/marsh_test.py` (awake monster blocks; dozing one is walked through, party follows; whole marsh route reachable; lists the maps a solid monster cuts). Marsh, pier, jpark, boards, oak, carbarn tests and smoke: 0 fails.

## 2026-10-29: Six more painted townsfolk, Los Angeles (Don Beto, Sol, Dash, Dolores, Marguerite, Nickel)
- Sheets `tools/sprite-bake/src/{beto,sol,dash,dolores,marguerite,nickel}-walk-v1.png` added to `CAST` (heights 42, 40, 40, 38, 38, 38). Files arrived as "image.png" with a names screenshot; matched by palette in `data/maps-la.js`.
- All six matched BY NAME (`TOWN_PAINTED`) because `VILLAGERS` has entries for these looks. Nickel is a hidden shopkeeper, so the painted set is not visible in his shop.
- Checks: `tools/townsfolk_test.py` (41 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Painted plate for Flight Zero's cabin (chapter 11)
- Flight Zero (map id `flightzero`, 19 x 7 tiles at 64 px, `art/flightzero.webp`, entry in `PLATES`) now uses Tom's painting. A `plateMask` in `data/maps-p2.js` is the walk map: only the blue aisle (rows 3 and 4, x 1 to 17) walks. The window wall, the five back pods, the five front pods with their nightstands, both galleys, the cabin door and the drinks cart (x 11 and 12, row 3) block.
- Objects re-laid to the painting: back pods (2,1) 3x2, (5,1) 3x2, (8,1) 2x2, (10,1) 3x2, (13,1) 3x2; front pods (2,5), (8,5), (11,5), (15,5) 3x2, Rose's pod as seat (5,5), blanket (6,5), seat (7,5); cart (11,3) 2x1; door (17,3). Object text is unchanged.
- Spawn moved from (3,2) to (3,3), the aisle in front of Tom's back-left pod (the old tile is inside the painted pod). Changed in the map spec and the opening step in `data/scenes-p2.js`. The cabin scene stand tiles (Tom 6,4; girls 6,5 and 7,5; Amy 17,4) are unchanged and the scene plays through.
- Tests: new `tools/flightzero_test.py` (objects touchable, stand tiles walkable, A opens every pod, the cart and the door, the aisle walks end to end, portrait and landscape shots); `tools/ch11_test.py`, `tools/ch11b_test.py` and `tools/smoke.py` pass. Known roughness: the "sky tears pink" effect in the windows (`ch11-tear`) was drawn by the old tile look and is not shown on the painting; the minimap still draws the old tile look. No spoken lines changed.

## 2026-10-29: The Endless Concourse is painted (Terminal Infinity, chapter 11)
- Tom's painting of the Concourse (`art/concourse.webp`, 2560 x 896, 40 x 14 tiles at 64 px, entry in `PLATES` with `actorScale` 1.98). Sent as `concourse_final.png` plus `concourse_grid.png` with no text; treated as "install this plate".
- `data/maps-p2.js`: new `plateMask` for `concourse`. Blocked: the window wall and everything on the back wall (benches, boards, plants), both moving walkways (they are painted glass and no longer walk), the checkpoint wall (steep upper piece, arch, long lower diagonal), bins, the lower benches, the Lost and Found door, the lower-right benches and plants. Walks: the back carpet strip (row 5), the marble hall, the lower carpet, and the far-right strip (x 39, rows 5 to 9), which is the only way round the end of the right walkway.
- The checkpoint is now a one-tile lane at x 23, rows 5 to 9, under the painted arch. The Standby Sprite (23,6) fills it. The velvet rope object moved to (22,8) beside the lane.
- Objects re-laid onto the painting: five gate signs on the departure boards (Boston 3, Denver 8, Seattle 13, Chicago 22, Miami 27; row 4, touched from the carpet), Standby desk (17,4), three Boarding Gate swap benches (4,11), (19,11), (34,10), Lost and Found door (16,10) 2x2, jet bridge window (32,3) 3x2 (was a door), Gate Infinity (37,3) 2x2, four plants, luggage cart (8,11), three seat objects (two new lines: boarding pass for yesterday's flight to tomorrow; a folded newspaper with a blank date).
- West exits moved to (0,7) and (0,8), spawn to (1,8), and Gate 00's east exits now land at (1,7) and (1,8), because a painted bin sits on (1,6). Lost Luggage at (9,4) moved to (9,5) and the one at (27,5) to (27,9), because row 5 is a one-tile strip between the back wall and the right walkway. TNB and Nara arrive at (35,5) and (36,5) (the jet bridge is a painting now), and Julian Vance steps out of the Gate Infinity door at (37,4) and walks to (36,5) (`data/scenes-p2.js`).
- Tests: new `tools/concourse_test.py` (objects touchable, lane and all stands connected, sign text opens, west door and Gate 00 east doorway land on floor, real key-press walk up the lane and east, portrait and landscape shots) 0 fails. Updated stand tiles in `tools/ch11_test.py`, `tools/ch11b_test.py` and `tools/gate00_test.py` for the moved doors; `ch11_test`, `ch11b_test`, `gate00_test`, `reach_test.py concourse gate00` and `smoke.py` pass. No spoken lines changed (object text only).
- Known roughness: the moving walkways no longer carry anyone; the departure boards and wall plants are painted on the wall and are touched from the carpet below; minimap still draws the old tile look.
## 2026-10-29: Gate 00 is painted (Terminal Infinity, chapter 11)
- Tom's painting of Gate 00 (`art/gate00.webp`, 1280 x 896, 20 x 14 tiles at 64 px, entry in `PLATES` with `actorScale` 1.98). He sent two pairs; the final plus grid pair (`gate00_final.png`, `gate00_grid.png`) was used because it is the one with the tile grid. Two grid-less alternate paintings were not used (one of them has a departures board listing Long Island, Los Angeles, Somewhere Else, A Little Later, Much Farther; it could be a later variant).
- `data/maps-p2.js`: new `plateMask` for `gate00` (window wall, podium and its posts, four benches and lamp tables, luggage cart, two plants, right console and the rails block; the marble aisle, carpet and the east doorway walk). Objects re-laid onto the painting: podium (text now starts "AREA 55, GATE 00", matching the painted sign), departure board, four bench rows, two plants, plus two new ones (yoga mat with thermos, luggage cart with WHEREVER and NOT MY BAG tags). Spawn (9,11) and the east exits (19,6) and (19,7) to the Endless Concourse are unchanged. The Concourse's west doors now both return to (18,7), because (18,6) is a painted pillar base.
- `engine/plate.js` `plateLive` (called from `engine/draw.js` after the plate): after `ch11-closed` the Long Island dome (left window) is tinted amber over the painting, as it was on the tile version.
- Tests: new `tools/gate00_test.py` (objects touchable, spawn to doorway connected, podium text opens, east doorway to the Concourse and back lands on floor, amber dome, portrait and landscape shots in `tools/shots/gate00-*.png`) 0 fails; `tools/reach_test.py gate00 concourse` 0 fails; `ch11_test.py`, `ch11b_test.py` and `smoke.py` 0 fails. No spoken lines changed (object text only).
- Known roughness: the departure board and the wall plants are painted on the wall and cannot be walked up to; the board is touched from the floor below it.

## 2026-10-29: Six more painted townsfolk, Los Angeles (Sage, Kenji, Juniper, Bernadette, Dana, Kiki)
- Sheets `tools/sprite-bake/src/{sage,kenji,juniper,bernadette,dana,kiki}-walk-v1.png` added to `CAST` in `bake_townsfolk.py` (heights 38, 44, 38, 42, 41, 40). Files arrived as "image.png"; Tom's names screenshot gave the names and the sheets were matched to the NPCs by hair, clothes and job (palettes in `data/maps-la.js`).
- Sage, Kenji and Juniper are matched BY NAME (`TOWN_PAINTED`) because `VILLAGERS` has entries for those looks and wins over a plain `OW` set (first try showed the old pixel art in the shops). Bernadette, Dana and Kiki replace `OW.bernadette`, `OW.dana`, `OW.kiki` directly.
- Checks: `tools/townsfolk_test.py` (35 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Four more painted townsfolk (Toni, Ray, Larry, Marisol)
- Sheets `tools/sprite-bake/src/{toni,ray,larry,marisol}-walk-v1.png` added to `CAST` in `bake_townsfolk.py` (heights 39, 44, 44, 38). Tom sent six files; "Muscular Security Guard Turnaround Sheet" is identical to Ray's and "Gardener Character Walk-Cycle Sheet" to Larry's (checked by hash), so only four were baked.
- Toni and Ray replace `OW.toni` and `OW.ray` directly (Sunset Gold Studios crew). Larry and Marisol are matched by name (`TOWN_PAINTED`) because the looks larry and marisol are the base bodies of Michael and Olivia in the LA houses.
- Checks: `tools/townsfolk_test.py` (29 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Six more painted townsfolk, Los Angeles (Mr. Washington, Bev, Boomie, Wes, Chet, Skye)
- Sheets `tools/sprite-bake/src/{washington,bev,boomie,wes,chet,skye}-walk-v1.png` added to `CAST` in `bake_townsfolk.py` (heights 44, 38, 42, 42, 44, 38). Names given by Tom in attachment order (the files arrived as "image.png", pasted rather than attached).
- Mr. Washington, Bev, Wes, Chet and Skye are matched BY NAME (`TOWN_PAINTED`). Boomie is a sheet actor (look `skye`, `sheet:'boomie'`), so `OW.boomie` is replaced directly in `data/townsfolk-hires-use.js`; her old `BOOMIE_OW` set stays in `data/npc-sprites.js` as the fallback.
- Checks: `tools/townsfolk_test.py` (25 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Six more painted townsfolk (Sal, Kit, Luna, Penny, Oolong, Fern)
- Sheets `tools/sprite-bake/src/{sal,kit,luna,penny,oolong,fern}-walk-v1.png` added to `CAST` in `bake_townsfolk.py` (heights 44, 45, 38, 38, 37, 41) and matched BY NAME in `data/townsfolk-hires-use.js` (`TOWN_PAINTED`): the looks kit (TNB's stand-in body in LA) and oolong (Aunt Ellie's) are shared.
- These six arrived as "image.png", so the characters were matched by the town's own data, not file names: Kit is the mail carrier at the Post, Sal the taxi driver, and Penny, Luna, Oolong and Fern match the villagers' hair and clothing colours in `data/villagers.js`. Confirm with Tom; a wrong match is a one-line swap in `CAST`.
- Checks: `tools/townsfolk_test.py` (19 characters) 0 fails, smoke 0 fails.

## 2026-10-29: Six more painted townsfolk (Page, Bun, Mr. Halverson, Grandpa Ike, Mr. Delgado, Mrs. Kowalski)
- Sheets `tools/sprite-bake/src/{page,bun,halverson,ike,delgado,kowalski}-walk-v1.png` added to `CAST` in `tools/sprite-bake/bake_townsfolk.py` (standing heights: Page 43, Bun 41, Halverson 43, Ike 42, Delgado 44, Kowalski 41). The file "Teacher's Apron Walk Cycle Sprite Sheet" is Mrs. Kowalski (the PTA president, the only school character left).
- Halverson, Ike, Delgado and Kowalski replace their `OW` sets in `data/townsfolk-hires-use.js`. Page and Bun are matched by name (`TOWN_PAINTED`), because the look `bun` is the stand-in body for Mr. Pistachio in the Nine Scoops scenes.
- Kowalski's sheet has rows 2 and 3 touching, so the baker now splits such a sheet at its emptiest line and cuts each part separately.
- Checks: `tools/townsfolk_test.py` (13 characters) 0 fails, smoke, ch5_school_test, bg_test, bakery_test 0 fails.

## 2026-10-29: Painted townsfolk (Pip, Moss, Dot, Gus, Bean, Reel, Principal Pruitt)
- Seven painted walk sheets (3 rows of 4: down, up, left; magenta) saved as `tools/sprite-bake/src/<id>-walk-v1.png` and baked by new `python3 tools/sprite-bake/bake_townsfolk.py` into `art/chars/<id>-ow.webp` (3x) and `data/townsfolk-hires.js` (generated, never hand-edit). Same recipe as Ellie, no head enlargement (the heads are already caricature size). Standing heights in rows: Pip 38, Dot 41, Reel 40, Gus 43, Pruitt 43, Bean 46, Moss 48 (the old villagers were 40 to 43).
- `data/townsfolk-hires-use.js` (loads after `data/ellie-hires-use.js`): Reel and Pruitt replace `OW.reel` and `OW.pruitt`. Pip, Moss, Dot, Gus and Bean are matched BY NAME (`TOWN_PAINTED`, read in `drawActor`, `engine/town-render.js`) because the look keys pip, gus, dot and bean are also stand-in bodies for Deedee, Boppy, Amy and Justin in story scenes; those stand-ins keep the old villager art. `TOWNSFOLK_HIRES_OFF=true` restores the old sprites.
- Checks: new `tools/townsfolk_test.py` 0 fails (sets registered and painted, each character found and drawn on its map, no page errors), smoke, bg_test, pier_test 0 fails.
- Known: Deedee, Boppy, Amy and Justin still use the old villager bodies in the story scenes that borrow the looks pip, gus, dot and bean. Battle and portraits for these seven are unchanged (overworld only).

## 2026-10-29: Dakota and Ryan's Place (inside) is painted (Area 53, map id `dakota`)
- New `art/dakota.webp` (Tom's painting, 768 x 640 = 12 x 10 tiles at 64 px) registered as `PLATES.dakota` (`?v=20261029`, interior actor scale 1.98). Map size, door (6,9) and spawn (6,8) unchanged; the second entry tile (5,9) is also a door (`doors:[[5,9]]`).
- Walk map (`plateMask` in `data/maps-la.js`): the open floor in rows 3 to 6 (wide at the top, narrowing past the front rooms) and the entry lane (x 5 and 6, rows 7 to 9) between the two posts. Row 2 is all furniture (dining table, bookshelf, crib, monstera), the armchair and pouf fill the left, the dresser and the roof edge close the right; the stool, shoe bench and both front alcoves are painted and blocked.
- Objects re-laid to the painting: Hudson's crib (7,1,3,2), Dining table (2,1,3,2), Book shelf (5,1,2,2), Monstera (10,2,1,3), new Green armchair (1,3,2,2), new Leather pouf (3,4), new Shoe bench (7,8,2,1). Dakota moved from (4,6), now blocked, to (4,4); Ryan from (8,5) to (8,4). Their lines are NOT changed (clips still match).
- New object text (not voiced, no re-bake): Green armchair, Leather pouf, Shoe bench. The three original object texts are unchanged.
- Checks: new `tools/dakota_test.py` 0 fails (objects touchable, no cut-off floor, both neighbors answer, walls hold, both entry tiles exit to Jefferson Park), smoke, bg_test, nickels_test, boards_test, jpark_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the front plants and the posts. The dresser at the right wall is painted but has no object (no walkable tile touches it). jpark_test "door enters boards" failed once in a full run and passed on rerun (a wandering monster, not this change).

## 2026-10-29: Angel City Cab Co. (inside) is painted (Area 45, map id `lacab`)
- New `art/lacab.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.lacab` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged; the whole doormat (x 4 to 6, rows 7 and 8) walks and all three bottom tiles exit to the boulevard (`doors:[[4,8],[6,8]]`).
- Walk map (`plateMask` in `data/maps-la.js`): the lane in front of the dispatch desk (row 4, x 2 to 8) and the open floor below it (rows 5 and 6, x 3 to 8). Desk, both sofas, magazine table, water cooler, lost and found, the plants and the front ledge are painted and blocked.
- Objects re-laid: Dispatch desk (3,3,5,1), Water cooler (8,2,1,2) (new), Lost and found (9,3,2,2), Green sofa (9,5,2,2) (new), Red leather sofa (0,3,2,2) (new), Magazine table (1,5,2,2) (new). The wall-only objects (Key board, Driver of the month photo, Waiting room palm) are gone because nothing can reach them; their lines moved into the desk (map and key board), lost and found (photo) and magazine table (palm). Unvoiced text only.
- Sol stays at (5,5), lines unchanged. The chapter 13 to 16 scenes park Grace and Rose in this room: their tiles moved from (2,5) and (3,7), now blocked, to (3,5) and (4,6) in `data/scenes-ch13.js`; their lines are unchanged. Tom's arrival tile (7,6) in chapter select is still open floor.
- Checks: new `tools/lacab_test.py` 0 fails (objects touchable, Sol talks, girls' tiles walk, walls hold, all three mat tiles exit to the boulevard), smoke 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the front plants and the ledge.

## 2026-10-29: Pupuseria La Ceiba (inside) is painted (Area 51, map id `pupuseria`)
- New `art/pupuseria.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.pupuseria` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged, so the Jefferson Park door still works.
- Walk map (`plateMask` in `data/maps-la.js`): the centre aisle (x 4 to 6, rows 4 to 6) and a one-tile lane at x 5 (rows 7 and 8) over the mat. The comal counter, family table, both right tables, the planters, the rails and the walls are painted and blocked.
- Doña Carmen stays visible at (5,4) with `roam:0` (the painting has no cook); her lines are NOT changed, so clips still match.
- Objects re-laid: The comal (3,2,5,2), Family table (1,4,3,2), new Window table (7,4,2,1) and Corner table (7,5,3,2) with new unvoiced text, Loroco plant (3,6). The Volcano photo object is gone (the painted volcano hangs on a wall nobody can reach); its line "A volcano outside San Salvador at sunrise. Carmen points at it every time someone looks." is no longer in the game.
- Checks: new `tools/pupuseria_test.py` 0 fails (objects touchable, Carmen answers, counter answers, door walked to Jefferson Park), smoke, bg_test, jpark_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the front plants and rail.

## 2026-10-29: Odette's Creole Kitchen (inside) is painted (Area 50, map id `creole`)
- New `art/creole.webp` (Tom's painting, 768 x 576 = 12 x 9 tiles at 64 px) registered as `PLATES.creole` (`?v=20261029`, interior actor scale 1.98). Map size, door (6,8) and spawn (6,7) unchanged, so the Jefferson Park door still works.
- Walk map (`plateMask` in `data/maps-la.js`): a ring of floor around the family table (row 3 x 4 to 6, column x 6, rows 5 and 6 on the left and right of the table), the west nook (2,5) and (2,6), and the doormat lane (x 5 and 6, rows 7 and 8). The pastry case and kitchen, all three tables, the dark booths, the right wall alcove, the front bench and plants stay blocked. The back right corner (rug and wooden door) is cut off by the yellow table, so it is blocked too.
- Miss Odette moved from (6,4) to (4,3) with `roam:0`, in front of the pastry case, so she never blocks the one-tile column at x 6. Her lines and the smog and clear variants are NOT changed (clips still play).
- Objects re-laid: Pastry case (3,2,5,1), Gingham table (1,3), Family table (3,4), Yellow table (7,3), Green sideboard (1,5), Pepper plant (1,6), Dark booth (8,5,1,3), two Door plants (4,7) and (7,7). The old "Corner table" (church fan from 1987) and "Boulevard photo" (1958) are gone as objects: both are painted in the unreachable right wall area. Their lines are no longer in the game; reuse them if a later object fits.
- Object text reworded or added (not voiced, no re-bake): Gingham table, Family table, Yellow table, Green sideboard, Dark booth, both Door plants; Pepper plant text unchanged.
- Checks: new `tools/creole_test.py` 0 fails (objects touchable, no cut-off floor, Odette answers, tables, booth and walls hold, door walked to Jefferson Park), smoke, jpark_test, bg_test, boards_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the chair backs and the door plants.

## 2026-10-29: Casa Alvarez (inside) is painted (Area 47, map id `casa`)
- art/casa.webp (896 x 704, 14 x 11 tiles at 64 px), PLATES.casa (actorScale 1.98), plateMask and door/spawn in data/maps-la.js. Door (7,10) and (6,10), spawn (7,9).
- The painting shows no doorway into the west rooms (laundry, bath, bedroom) or the bunk room, so they are scenery. Walkable: front lane at x 7, the kitchen and dining room, and the living room along row 6 (x 9 to 12).
- Objects re-laid, all touchable: Kitchen island, Stove, Fridge (new), Dining table (new), Family wall, Big TV, Green sofa (new), Toy pile, Coat hooks (new), Shoe shelf (new). The old Bunk bed and Baby Lupita's crib objects are gone with their rooms (no room in the painting to touch them from).
- NPCs moved off blocked tiles, spoken lines unchanged: Don Beto (12,6) in the wicker chair, Tony (5,5), Yesenia (8,2), Kevin (5,4), Daisy (4,4), Mateo (6,6), Sofi (8,5). Mrs. Alvarez (7,5) and Claudia (10,6) stay.
- tools/casa_test.py (0 fails), smoke, jpark_test, ch12_test 0 fails.
- Known: no foreground layer, so characters draw over the furniture. Kevin's bunk bed lines are now spoken away from the bunk bed; the sofa and TV rooms carry the scene.

## 2026-10-29: Jordan and Sam's Place (inside) is painted (Area 52, map id `jordansam`)
- New `art/jordansam.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.jordansam` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged, so the Jefferson Park door still works.
- Walk map (`plateMask` in `data/maps-la.js`): the floor in front of the espresso bar and the aisle beside the sofa (row 3, x 5 to 8; x 5 down rows 2 to 6), the front floor (row 5, x 2 to 5), the sunny tiles by the entry (4,6) (5,6), and a one-tile lane at x 5 (rows 7 and 8) over the doormat. The sofa, coffee table, pouf, dining table and chairs, kitchen, olive tree, slat divider, both side tables, planter ledge and the right wall are painted and blocked.
- Objects re-laid on painted things: Boucle couch (2,2) 3 x 2, Coffee table (2,4), Leather pouf (4,4) (new), Slat divider (5,0) (new), Olive tree (6,1) 1 x 2 (moved), Espresso bar (7,2), Mug shelf (9,2) (new), Dining table (6,4) 3 x 3 (new), Side table (1,5) (new), Window planter (2,6) (new). The old "Before and after" photo object is gone (the frames hang over the sofa where nothing can touch them); its line now lives in the couch text.
- Residents: Jordan moved from (4,5) to (4,6) and no longer wanders (the old spot blocked the aisle to the sofa side). Sam moved from (7,5), now the dining table, to (7,3) in front of the espresso bar and still wanders. Neither one's lines changed, so no clip is affected.
- Reworded or new object text (not voiced, no re-bake): couch (adds the before and after frames), coffee table, pouf, slat divider, mug shelf (TNB line), dining table, side table, planter. Espresso bar and olive tree keep the old jokes (olive tree: "In a big planter").
- Checks: new `tools/jordansam_test.py` 0 fails (objects touchable, no cut-off floor, both residents talk, walls hold, lane walked to Jefferson Park), smoke, bg_test, jpark_test, nickels_test, boards_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the front plants and the ledge. The hallway door behind the slat divider is scenery only.

## 2026-10-29: carbarn_test fixed (test only, no game change)
- `tools/carbarn_test.py` failed "west arch leads to Jefferson Park" and "east rails lead to the Boiler Room" because a wandering monster (Lukewarm waits at the west arch) started a fight on arrival, which froze the walk. The exits and walk map were fine. The test now ends any fight and clears monsters near the player before each exit walk. 0 fails.

## 2026-10-29: The Starlite (inside) is painted (Area 43, map id `cinema`)
- New `art/starlite.webp` (Tom's painting, 832 x 704 = 13 x 11 tiles at 64 px) registered as `PLATES.cinema` (`?v=20261029`, interior actor scale 1.98). Map size, door (6,10) and spawn (6,9) unchanged.
- Walk map (`plateMask` in `data/maps-la.js`): the center aisle (x6, rows 4 to 10), the front strip across the seat rows (row 7, x1 to 9), the velvet-rope nook (8,8), and the red-carpet stairs (x5 and x6, rows 8 to 10) as the way out. Stage, both seat blocks, the concession bar, ticket desk, fern and brass posts are painted and blocked.
- Objects re-laid: The big screen (4,2,5,2), Row F (1,5,5,2), Row G (7,4,4,3), Concessions (10,5,3,4), new Ticket desk (0,8) and Lobby fern (2,8) and Velvet rope (8,9). Dolores moved from (6,3), now stage, to (3,7); her lines are NOT changed (clips still match).
- Object text reworded or added (not voiced, no re-bake): Row F ("three" coats), Row G (plaid blanket), Concessions (prices), Ticket desk, Lobby fern, Velvet rope.
- Checks: new `tools/starlite_test.py` 0 fails (objects touchable, Dolores answers, concessions answer, stairs lead to the boulevard), smoke, blvd_test, bg_test, ramen_test 0 fails. Portrait and landscape shots looked at.

## 2026-10-29: The Board Room (inside) is painted (Area 44, map id `boards`)
- New `art/boards.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.boards` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged; the whole doormat (x 4 to 6, rows 7 and 8) walks and all three bottom tiles exit to Jefferson Park (`doors:[[4,8],[6,8]]`).
- Walk map (`plateMask` in `data/maps-la.js`): the front floor (rows 5 and 6, x 2 to 6), the lane in front of the counter (row 4, x 2 to 8) and the sunlit tile past the counter's right end (8,3). The deck and longboard walls, the grip tape counter, wheel wall, bench, the board and wheel rack and the cactus are painted and blocked.
- Objects re-laid: Grip tape counter (2,3,6,1), Wheel wall (0,2,2,3) (new), Bench (0,5,2,2) (new), Longboard rack (7,5,4,2) (new), Cactus (9,2,2,2). The two wall objects (deck wall, longboard wall) are gone because the counter blocks the way to them; the cat deck line moved into the counter text. Dash moved to (3,6) on the left rug and no longer wanders (the old spot blocked the door lane); his three lines are unchanged, so clips still match.
- Reworded or new object text (not voiced, no re-bake): counter (adds the cat deck), Wheel wall, Bench, Longboard rack (the green wheels bin labeled TNB, a nod to Dash's line).
- Checks: new `tools/boards_test.py` 0 fails (objects touchable, Dash talks, bench/counter/rack block, all three mat tiles exit), smoke, bg_test, jpark_test, juicebar_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the front plants and rail.

## 2026-10-29: The Grand Tower (inside) is painted (Area 49, map id `tower`)
- New `art/tower.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.tower` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged, so the boulevard door at (18,20) still works.
- Walk map (`plateMask` in `data/maps-la.js`): rows 0 and 1 are the window wall; open floor through the middle (rows 2 to 6), a one-tile lane at x 5 (rows 6 to 8) between the planters. Blocked: sofa (cols 1 to 3), standing desk (7 and 8), two stone pillars, TV unit (col 1), kitchen island and stools (cols 2 to 4, rows 5 and 6), dining set (6 and 7), armchair and corner nook (right side).
- Objects re-laid to the painting: Gray couch, Standing desk, The TV (now the whole unit down the left wall), Fiddle-leaf fig, plus new Kitchen island, Dining table, Armchair and Corner nook. Unvoiced text only: four new prop lines. Priya moved to (6,2) by her desk; her lines are unchanged.
- Checks: new `tools/tower_test.py` 0 fails (objects touchable, no cut-off floor, Priya talks, walls hold, door walked to the boulevard), smoke, bg_test, blvd_test, shop_test, nickels_test 0 fails. Portrait and landscape shots looked at. ch17_test did not finish inside the 280 s timeout here; the chapter 17 Glass Tower does not use this map.
- Known: no foreground layer, so characters draw over the front planters and pillars. The (8,5) tile sits just in front of the nook plant.

## 2026-10-29: Nickel's (inside) is painted (Area 41, map id `nickels`)
- New `art/nickels.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.nickels` (`?v=20261029`, interior actor scale 1.98). Map size, door (5,8) and spawn (5,7) unchanged, so the boulevard door still works.
- Walk map (`plateMask` in `data/maps-la.js`): the open floor in front of the counter (rows 5 and 6), one tile beside the snack shelf (8,4), and a one-tile lane at x 5 (rows 6 to 8) between the door posts over the mat. The counter, sweater wall, window, helmet shelf, crates, ball display, cactus and the right wall stay blocked.
- Nickel is painted into the plate, so her sprite is `hidden:true` at (5,2) behind the counter. A on the counter (any tile x 4 to 7, row 5) still opens the shop through the shop flag on the counter object.
- Objects re-laid to the painting: Shop counter (4,3) 4 x 2, Snack shelf (8,1) 2 x 3, Battle bin (1,4) 2 x 2, new Ball display (3,4), new Shop fern (1,6), Shop cactus (9,4) 1 x 3. Unvoiced text only: two new lines (Ball display, Shop fern). The old Gear shelf is gone as an object (the sweater wall is not reachable on the painted floor); its line "Sweaters nobody in LA needs, and sunglasses everybody does." is no longer in the game.
- Checks: new `tools/nickels_test.py` 0 fails (objects touchable, no cut-off floor, shop opens from every counter tile, walls hold, door walked to the boulevard), smoke, bg_test, blvd_test, shop_test, ramen_test, juicebar_test 0 fails. Portrait and landscape shots looked at.
- Known: no foreground layer, so characters draw over the cactus and the front ledge. The painted keeper looks different from the old Nickel sprite (teal hair); the painting is canon.

## 2026-10-29: Backlot Wardrobe (inside) is painted (Area 42, map id `wardrobe`)
- New `art/wardrobe.webp` (Tom's painting, 768 x 640 = 12 x 10 tiles at 64 px) registered as `PLATES.wardrobe` (`?v=20261029`, interior actor scale 1.98). Map size unchanged. Door (6,9) and spawn (6,8) unchanged; both purple carpet tiles (x 5 and 6, row 9) now exit to the Boulevard (`doors:[[5,9]]`).
- Walk map (`plateMask` in `data/maps-la.js`): the open floor in the middle (rows 4 to 7), the small floor tongue at (5,3), the sunny floor under the desk's right end (x 2 to 4, rows 7 and 8), the alcove by the prop plant (x 8 and 9, rows 7 and 8), and the carpet. The western rack, call sheet wall, space rack, desk, shoe shelf and mannequin, prop plant, hat case and trunks, and both gate posts are blocked.
- Objects re-laid to the painting: Rack A Westerns (1,1,4,3), Rack B Space (8,1,3,3), Continuity desk (0,4,4,3), Call sheet (6,2,2,2), Prop plant (9,5,2,2), new Hat case (10,7,2,2). Marguerite stays at (6,5). Her lines are NOT changed (clips still match).
- Reworded (object text, not voiced, no re-bake): Rack A "Forty cowboy hats" is now a shelf of hats, fringe and a lasso (the painting has about ten hats); the Call sheet now reads the painted schedule (8 AM crew call, horse stand-in at 3) instead of "5 AM, forty extras". Prop plant ("four movies") and the desk scarf joke kept, since the painting shows both. New line: Hat case.
- Checks: new `tools/wardrobe_test.py` 0 fails (objects touchable, no walkable islands, Marguerite and the desk answer, carpet walked to the boulevard), smoke, bg_test, blvd_test, reach_test, shop_test 0 fails. Portrait and landscape shots looked at.
- Known roughness: no foreground layer, so characters draw over the front ledge and gate posts.

## 2026-10-29: Very Green Juice (inside) is painted
- New `art/juicebar.webp` (Tom's painting, area 40, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.juicebar` with the interior actor scale. Map `juicebar` keeps its size. Door (5,8) and spawn (5,7) unchanged; the whole doormat between the gate posts (x 4 to 6, rows 7 and 8) now walks and all three bottom tiles are exits to Jefferson Park (`doors:[[4,8],[6,8]]`).
- Walk map (`plateMask` in `data/maps-la.js`): the floor in front of the counter, the open floor right of the counter (8,3), the sunny left side down to the herb table. Counter and blender wall, wheatgrass beds, herb table, big fern and the supplement shelf are painted and blocked.
- Objects re-laid: Juice bar counter (3,3,5,1), Wheatgrass beds (1,2,2,4), new Herb table (1,6) with one new unvoiced line, Fern (8,2), Supplement shelf (9,3,2,4). Sage moved behind the counter to (5,2), where the painting's keeper stands; her lines are NOT changed (clips still match).
- Engine: a counter object with `across:true` lets A talk to whoever stands directly behind it (`facingTarget` in `engine/battle-draw.js`), so Sage can be talked to across the counter. Only the juice bar counter uses it.
- Checks: new `tools/juicebar_test.py` 0 fails (objects touchable, Sage across the counter, all three mat tiles exit, walls hold), smoke, bg_test, jpark_test, taxi_test, shop_test 0 fails. Portrait and landscape shots looked at.



## 2026-10-29: Ramen Ramen is painted (Area 39, map id `ramen`)
- New `art/ramen.webp` (Tom's painting, 768 x 576 = 12 x 9 tiles at 64 px) registered as `PLATES.ramen` (`?v=20261029`, interior actor scale 1.98). Map size unchanged; the old tile-drawn shop is gone.
- Walk map (`plateMask` in `data/maps-la.js`): the floor in front of the counter (rows 4 and 5), the rug alcove at (2,3), and the two tiles under the noren curtain (x 5 and 6, rows 6 to 8) as the way out. The counter and stools, kitchen, sake shelf, bamboo pot, lantern step, corner booth and both front fences are blocked.
- Objects re-laid to the painting: counter (3,2) 5 wide, sake shelf (8,2), corner table (9,4), bamboo (1,3), new Lantern step (0,5). Kenji stays at (5,4) and wanders the front floor.
- Reworded (object text, not voiced, no re-bake): counter "Twelve stools" is now "Five stools" (the painting has five); bamboo text now mentions the egg painted on the pot and "the rest for luck" (the painting shows more than three stalks). New line: Lantern step.
- Checks: new `tools/ramen_test.py` 0 fails (objects touchable, Kenji and counter talk, door walked to the boulevard), smoke, bg_test, jpark_test, blvd_test 0 fails. Portrait and landscape shots looked at.
- Known: `tools/carbarn_test.py` fails its two walk-out checks (west arch to Jefferson Park, east rails to the Boiler Room) on a clean checkout too, so it predates this change. No foreground layer, so characters draw over the front fence.

## 2026-10-29: Golden Hour Coffee is painted (Area 38, map id `coffee`)
- New `art/coffee.webp` (Tom's painting, 704 x 576 = 11 x 9 tiles at 64 px) registered as `PLATES.coffee` (`?v=20261029`). Same size as the old room, so the Boulevard door and the exit are unchanged: door (5,8), arrival (5,7).
- Walk map (`plateMask`): the floor in front of the counter (row 3, x 4 to 6), the middle floor (rows 4 and 5), and the entry lane over the mosaic mat (x 4 to 6, rows 6 to 8). The back counter, pastry case, left laptop table, right window table and book table, and the plants and low walls at the front are painted and blocked.
- Objects re-laid on painted things: Espresso bar (4,2), Pastry case (7,2) (new), Monstera (3,2), Laptop table (0,3) (its text now also reads the wall sign SAME SCRIPT, DIFFERENT YEAR), Window table (8,3), Book table (8,5) (new, replaces the old second table). Juniper stands in front of the counter (5,3). None of the new text is spoken, so no clip is affected. Juniper's three lines are unchanged.
- Checks: new `tools/coffee_test.py` 0 fails (objects touchable, Juniper on a walkable tile and talks, door walked with a real key), smoke, bg_test, blvd_test and reach_test 0 fails. Portrait and landscape shots looked at.
- Known roughness: no foreground layer, so characters draw over the plants and low walls at the front; the left rug, the right armchair and the bookshelf are scenery only.

## 2026-10-29: Inside the Old Oak is painted
- New `art/oak.webp` (Tom's painting, 1536 x 1280 = 24 x 20 tiles at 64 px) registered as `PLATES.oak` (`?v=20261029`). Map `oak` keeps its size; the tile-drawn bark, branches and pits are gone (the spec no longer uses `oakPlan`).
- Walk map (`plateMask` in `data/maps-la.js`): the entry stairs (x 11 and 12, rows 17 to 19), the lower floor (tea table, stove and rug on the left, the table and rug on the right), the long walkway and stairs up the right side to the pantry, the pantry walkway and pulley deck, the middle rope bridge (row 6) across to the war room ramp, and the war room lane (row 5) in front of the war table. The top bridge (row 1) and the middle bridge (row 3) are cut off until the ladder is down.
- The way up is now a rope ladder in column 12 (rows 2, 4 and 5 are the gap; `ladder` cells in the oak spec). `ch6LowerLadder` opens them, and the ladder is drawn live over the painting in `STORY_MAPFX` (fades where the party is climbing). Exits unchanged: stairs (11,19) and (12,19) to Old Oak Park, top (11,0) and (12,0) to the crown; crown drops land on (11,1) and (12,1).
- The dark vignette is softer (it was a near blackout on the old tile look). The "light down the hollow" strip is gone (the painting has its own).
- Objects re-laid to the painting: filing cabinets (1,3), corkboard (3,3) (still starts the board scene), war room desk (6,3), firefly jar (2,10), stump table (6,11), bucket (17,4) (the pulley deck; still the ladder trigger), pantry shelves (19,4) and (21,5), doormat sign (13,17). Dropped (not reachable, now scenery): the two floor mushrooms, the second firefly jar, the acorn pile, the tally-mark bark walls. Monsters re-spotted: (4,13), (19,14), (5,5), (19,8).
- Spoken lines NOT changed: the ladder scene still says the rope ladder unrolls "all the way to the floor" (it now ends at the war room bridge), and `ch6Oak` still says "war room on the left, pantry on the right" (still true). Only the hint text was reworded (not voiced).
- Checks: new `tools/oak_test.py` 0 fails (objects touchable, ladder gap holds then opens, corkboard and bucket and ladder scene run, stairs and climb walked with real keys), smoke 0 fails, bg_test 0 fails, reach_test 0 fails. Portrait and landscape shots looked at.
- Known roughness: no foreground layer, so characters draw over the bridge rails and the pantry barrels. The war room is one lane deep (the table, desks and filing cabinets are blocked).

## 2026-10-29: The Crown of the Oak is painted (Area 35, map id `crown`)
- New `art/crown.webp` (Tom's painting, 1280 x 1024 = 20 x 16 tiles at 64 px) registered as `PLATES.crown` (`?v=20261029`). Same size as the old map, so nothing was resized. The old pit corners (`pools`) are gone.
- Walk map (`plateMask`): the plank floor (rows 5 to 10), the rope bridge down (x 9 and 10, rows 10 to 15), the two lookout decks with their stairs (left x 2 to 5, rows 4 to 5; right x 15 to 17), and a small floor tongue on the right (x 14 and 15, row 10). The hoard, crates, trunk and leaves are painted and blocked.
- Exits unchanged: bridge bottom (9,15) and (10,15) to the Old Oak (11,1) and (12,1). Spawn (9,14). Boss scene tiles unchanged and walkable: Tom (9,7), TNB (8,7), Nara (10,7). Chairman Cheeks still sits at (9,4), on the painted chest at the front of the hoard.
- Objects re-laid on painted things: hoard (11,4), JANUARY crate (6,5), FEBRUARY crate (13,5), MARCH pile (5,7), and the two lookout posts are now the painted telescopes (2,3) and (17,3), reached from the decks. Same jokes; the lookout text now names a telescope. None of this is spoken, so no clip is affected.
- Not changed: the battle backdrop for the crown (`bgs/17-oak-crown-canopy.png`) is still the old pixel one.
- Checks: new `tools/crown_test.py` 0 fails (objects touchable, decks and exits reachable, bridge walked with a real key, boss scene runs to the Chairman battle), smoke, bg_test and reach_test 0 fails, portrait and landscape shots looked at.

## 2026-10-29: Old Oak Park is painted
- New `art/oakpark.webp` (Tom's painting, 1664 x 1408 = 26 x 22 tiles at 64 px, same size as the old map) registered as `PLATES.oakpark` (`?v=20261029`). No map resize, so every exit and arrival tile is unchanged: south gate (12,21) (13,21) to 2nd Ave, little door (12,4) (13,4) to the Old Oak, arrivals (12,20) (13,20) and (12,5) (13,5).
- Walk map (`plateMask`): the Old Oak steps and door, the dirt paths round the central planter (blocked) into two lanes, the playground sand, the picnic lawn, the dog park (in through the bone gate), the garden's front dirt, and the south corridor. Garden beds and stepping stones are painted and blocked.
- Objects re-laid on painted things: Old Oak roots (14,4), Little door (12,4), slide, play fort, swings, climbing dome, two trash cans, Watch board (16,5), Tomato bed, Herb bed, three picnic tables, grill, drinking fountain (10,16), dog fence, dog bench, water bowl, agility hoop, park sign (13,11). Dropped: scarecrow and squash bed (not in the painting, or unreachable). The three dig mounds moved to (7,9) sandbox, (21,5) garden, (8,17) picnic lawn and are drawn live (`liveKinds`).
- Monster spots moved off painted props: acorn agents (11,9) (17,16) (20,12), Peanut Gallery (5,7), Twig Spy (20,6), Cheek Stuffer (4,18).
- Checks: new `tools/oakpark_test.py` 0 fails (objects touchable, no walkable islands, exits reachable, south gate and little door walked with real keys), smoke, bg_test, stage7_test, backlot_test 0 fails, portrait and landscape frames looked at.
- Known roughness: no foreground layer (characters draw over tree leaves); the bollards at the south gate and the lamp posts are walk-through.

## 2026-10-29: The Boiler Room is painted
- New `art/boilerroom.webp` (Tom's painting, 1280 x 896 = 20 x 14 tiles at 64 px) registered as `PLATES.boiler` (`?v=20261029`). Map size unchanged. The room is now a plain spec with a `plateMask` (no more `barnPlan`, so the old hearth tiles are gone; `barnPlan` is no longer used by any room).
- Walk map: the west arch (exits (0,7) and (0,8) to the Car Barn, arriving at (28,14) and (28,15) there), the lit walkway down past the coal cart, and the open stone floor out to the coal bin, the bread rack and the baker's bench. The boiler and its control platform, the pipes, and the south wall of crates are blocked.
- Objects re-laid on painted props: Old boiler, Coal bin, Coal cart (was Coal scuttle), Bread rack, Peel rack (the tool rack by the oven), Baker's bench (new, bowl, mug and dough tub), Ash pan (the floor barrel), Stacked crates (new). The ch8-clear texts are unchanged.
- Old Ironbelly now stands at (8,5) on the floor in front of the boiler (was (9,3) on the old hearth). The chapter 8 boss scene positions (Tom (9,7), TNB (8,7), Nara (10,7)) are all painted floor and unchanged. The firelight glow moved to the boiler (6.5, 4). Hint text no longer says "up on the hearth".
- Checks: new `tools/boilerroom_test.py` 0 fails (objects touchable, Ironbelly and scene tiles walkable, west arch walked, boss scene reaches the fight with real keys), smoke, bg_test, carbarn_test 0 fails; portrait and landscape frames looked at. Known roughness: no foreground layer (characters draw over the platform rail and pipes), the oven door on the east wall is scenery only (the bread-in-the-oven moment is still the Bread rack).

## 2026-10-29: Division Nine Car Barn is painted
- New `art/carbarn.webp` (Tom's painting, 1920 x 1344 = 30 x 21 tiles at 64 px) registered as `PLATES.carbarn` (`?v=20261029`). Map size unchanged. The map is now a plain spec with a `plateMask` (no more `barnPlan` for this room; the Boiler Room still uses it).
- Walk map: west arch (exit to Jefferson Park at (0,9) and (0,10)), the Paint Shop floor, the hall above the pit, the rails strip up to the Machine Shop, the east floor to Track 4 (exits (29,14) and (29,15) to the Boiler Room, which now arrives at (28,14) and (28,15)), the turntable control platform and the steel stairs down to the Lunchroom. The Lunchroom is only reached by the platform and stairs (the painting walls it off from the hall).
- The painted bridge is one fixed diagonal catwalk. Its 13 cells (`BARN_TT.h`) stay blocked until the lever turns the turntable east, as before; the painting does not visibly swing. The spoken "bridge swings round" lines are unchanged.
- Objects re-laid on painted props: Car 9, drying rack (with the ice-skinned paint cans text), paint cart, sawhorses, workbench, wheel truck, lathe, dispatch board, crew bench, time clock, three lunch tables (clean spot with the Nara plate is the table by the stairs), turntable motor (control boxes), lever (green post by the east pit rim), coal cart, Track 4 sign, lunch pail (by the sign). Dropped as unreachable scenery: lockers, menu board, snack machine, Track 1 sign, oil cans, second lunch-table end.
- Monster spots and the drifting pilot lights moved onto painted floor. `tools/carbarn_test.py` added (objects touchable, exits and stairs reachable, bridge gate, west and east exits walked).
- Checks: carbarn_test, smoke, bg_test, jpark_test 0 fails; portrait and landscape shots looked at. Known roughness: no foreground layer (characters draw over pillars), (8,10) sits on a pillar base, the Lunchroom aisles are tight because the tables fill the room.

## 2026-10-29: Soundstage 7 is painted
- New `art/stage7.webp` (Tom's painting, 1536 x 1152 = 24 x 18 tiles at 64 px) registered as `PLATES.stage7` (`?v=20261029`). Map `stage7` resized from 26 x 22 to 24 x 18 to match. The catwalk and pit layout is gone; the painting is an open stage floor.
- Walk map (`plateMask`): the open floor between the wardrobe department (left) and the video village and camera gear (right), the stairs up to the set (x 14 to 16, rows 3 to 5), the desk walkway (row 6), and the south loading gate (x 9 and 10, rows 13 to 16). The wardrobe department is sealed behind its racks and tables, so Rack 1, Rack 4, the sewing table and the fitting mirror are dropped (not reachable, now scenery). Rack 3 is the big painted rack (5,8).
- Exits: south gate (9,16) and (10,16) to the Backlot (14,1) and (15,1); the stairs (15,3) and (16,3) to the Stage Set (10,12) and (11,12). Backlot arrivals are (9,15) and (10,15); Stage Set arrivals are (15,4) and (16,4).
- The raised catwalk is now a gate on the stairs (`gates`, cond chapter 4 and not `ch4-rig`, look barrier). It opens when the rig is fixed; `ch4LowerCatwalk` only sets `catwalkDown`. Spoken scene lines are unchanged (they still say catwalk). Goal toasts reworded (not voiced): "middle of the floor", "up the stairs".
- Light rig puzzle kept: light rig (11,8) and spike tape RACK 2 (8,9) and the three junction boxes (red 6,11, blue 21,15, amber 13,12) are drawn live over the painting (`liveKinds`). Fog drifts over the right side (x 16 to 23). Monsters: fogwisp (19,6) and (13,13), extra (10,10).
- Objects re-laid on painted things: road cases (9,6) and (17,10), video village (19,4), camera dolly (15,8), two fog machines (21,6) and (16,7), stage sign (12,12). `tools/stage7_test.py` added.
- Checks: `tools/stage7_test.py` 0 fails (objects touchable, exits reachable, gate holds then opens, south gate walked), stageset_test, studio_test, bg_test and smoke 0 fails, portrait and landscape shots looked at (dark and lit).

## 2026-10-29: The Backlot is painted
- New `art/backlot.webp` (Tom's painting, 1536 x 1152 = 24 x 18 tiles at 64 px) registered in `engine/plate.js` as `PLATES.backlot` (`?v=20261029`). The map shrank from 30 x 24 (old tile look) to 24 x 18 to match the painting.
- Walk map (`plateMask` in `data/maps-la.js`): the studio gate lot and plaza at the bottom, the road north to the Stage 7 door (x 12 and 13), the Western dirt strip (row 6, with a corridor on row 5 that joins the road), and the New York sidewalk (rows 5 and 6, right). The gate arm is treated as raised. The jungle set, tent, flats, scaffolds, truck and the lower right are scenery. The studio `border` is open along row 17 so the bottom lot walks.
- Exits: Stage 7 door at (12,2) and (13,2) to `stage7` (12,20) (13,20); studio gate at (9,17) and (10,17) to `studio` (10,1) (11,1). Studio north passage now arrives at (9,16) and (10,16); `stage7` exits arrive at (12,3) and (13,3). Spawn (10,16). The Stage 7 door gate (closed until `ch4-sets`) moved to row 2.
- Objects re-laid to the painting: Saloon (2,2), General store (6,2), fire hydrant (15,6) (the hydrant in Nara's fetch scene), Subway entrance (16,4), camera dolly (11,9), equipment cases (4,10), guard booth (5,12), golf cart (14,12), studio sign (0,13). Dropped: bank, diner, hat shop, brownstone, deli, laundromat, trough, hitching post, cacti, picture car, green screen, dumpster, newsstand, C-stands (none are in the painting).
- Story: the painting has no Main Street, so the three sets are now the Western street (Clapper Snapper, top left), New York (Boom Mic Moth, top right) and the jungle set (Cue Card Crab, in the plaza). Triggers: `ch4-main` at [9,9,13,13], `ch4-west` at [0,5,9,7], `ch4-ny` at [12,3,15,6]. `ch4Fetch` sends Nara to the hydrant at (14,6). Monster spots: crab (12,10), clapper (3,6), moth (14,5), two extras. Only the goal toast was reworded (not spoken).
- NOT changed (spoken, baked): three lines still say "Main Street" (`ch4Fetch` TNB line, Tom's "Then we clear the sets" line, and "Main Street is clear" in `ch4Crab`) and the `ch4Fetch` direction line says "Western street on the right, New York down on the left". They no longer match the painting. Rewording them needs a re-bake of `data/voice/dialog-ch4.js` lines.
- Checks: new `tools/backlot_test.py` 0 fails (objects touchable, exits reachable, scene tiles walkable, south gate and Stage 7 door walked with real keys), `tools/studio_test.py` 0 fails, smoke 0 fails, reach_test 0 fails, bg_test 0 fails; fetch scene and all three set zones start their scene and battle. Portrait and landscape shots looked at.
- Known roughness: no foreground layer, so characters draw over tree leaves, the tent and the camera dolly. The Western corridor on row 5 passes through a bush.

## 2026-10-29: The Stage Set is painted
- New `art/stageset.webp` (Tom's painting, 1280 x 896 = 20 x 14 tiles at 64 px) registered as `PLATES.stageset` (`?v=20261029`). Map `stageset` resized from 20 x 16 to 20 x 14 to match the painting.
- Walk map (`plateMask`): the compass floor, the stairs to the director's platform (x 10 and 11, rows 4 and 5) and the entry ramp (x 9 to 11, rows 12 and 13). Castle ruins, scaffolds, camera crane, crates and lights are painted and blocked.
- Exits: ramp row 13 (x 9 to 11) to Soundstage 7 (12,1) and (13,1). Soundstage 7's catwalk exits now arrive at the set's (10,12) and (11,12). Spawn (10,12). Boss scene tiles unchanged and walkable: Tom (10,9), TNB (9,9), Nara (11,9), Director's Cut (10,4).
- Objects re-laid: painted backdrop (10,3), Rack 2 (9,4, beside the stairs; the painting has no costume rack, so it is an unpainted touch point), camera crane (16,7), director's chair (16,8), lantern post (8,11), prop crates (7,9), light stand (15,9). Couch and set lamp dropped (not in the painting).
- Checks: `tools/stageset_test.py` 0 fails, smoke 0 fails, bg_test 0 fails, portrait and landscape shots looked at.

## 2026-10-29: Deedee rebaked, all 164 lines (loops fixed)
- Tom reported repeated words and phrases in Deedee's clips. Speech recognition over her old clips found 78 of 141 checked looping the line 3 to 10 times. New Deedee Rebake Baker (Project claude/deedee-rebake-*) transcribes every take and retries until clean. Tom sent deedee-rebake.json (164 clips, baker flagged none, voice AoT Deedee (picked 2026-10-28), id 9UrcxKDUU0pvcnFhdfTU, stability 0.5, similarity 0.85).
- Independent audit (sherpa-onnx Whisper base.en): 0 loops, 159 match the screen text, 5 flagged only by digits or recognizer quirks. Two worth a listen: "Keep up, honey! Arms at ninety!" (heard an extra "Can you") and "...So they are. Don't say anything." (heard "So they're so they are").
- Merged with tools/voice-recast/merge-voice.js: 44 battle clips replaced in data/voice/deedee.js, 120 dialogue clips replaced across dialog-ch1, 2, 3, 5, 9, 10, 22, 24, 25, 26, 27, 28; battle voice entry now the picked voice (battle and dialogue use one voice). Smoke 0 fails.

## 2026-10-29: Studio Gate is painted
- New `art/studio.webp` (Tom's painting, 1536 x 1152 = 24 x 18 tiles at 64 px) registered in `engine/plate.js` as `PLATES.studio` (`?v=20261029`). The procedural lot look is gone for this map.
- Walk map (`plateMask` in `data/maps-la.js`): the road north (x 10 and 11), the lot in front of the gate, the walkway in front of the three trailers (row 7), the street and sidewalk at the west entrance, and the lower street. Gate wall, booth, trailers, craft tent, lights, carts and cases block.
- Exits follow Tom's grid: Western Entrance is the west edge, rows 9 to 12 (to the boulevard at 28,12 and 28,13); North Passage is the top, x 10 and 11 (to the Backlot, unchanged). Tom marked x 9 to 12 for the north passage, but the painted road is only two tiles wide there, so the exit is x 10 and 11. Boulevard arrivals into the studio are now (1,10) and (1,11); spawn is (1,10).
- Objects re-laid to the painting: guard booth (5,7), three trailers (14,4) (18,4) (22,4), craft services (15,9), lamp banner as the studio sign (2,13), studio lights (10,14), apple box (12,14), two cones. Dropped (not reachable, now scenery): golf cart, director's chair, lot sign, C-stands, the second apple box. NPCs: Ray (4,9), Toni (14,8), Kiki (8,11), Dana (6,12). Story scenes use `routeBeside`, so no scene tiles changed.
- Checks: `tools/studio_test.py` 0 fails (objects touchable, exits reachable, west and north exits walked with real keys), smoke 0 fails, bg_test 0 fails, portrait and landscape shots looked at. `tools/blvd_test.py` studio step now stands at (1,10); its "door lofts opens its building" failure was already there.
- Known roughness: the west entrance cells (x 0, rows 9 to 12) sit under painted tree leaves, as drawn in Tom's grid. No foreground layer yet, so characters draw over trees and the tent peak.

## 2026-10-29: Downtown LA has a new painted plate
- `art/blvd.webp` (1920 x 1664, 30 x 26 tiles) replaced with Tom's new golden-hour painting. Same eight buildings, new positions: the Griffith Park arch and steps are top left, the Jefferson Park arch and steps are bottom centre, the Metro is bottom right.
- Doors now at coffee (7,7), ramen (12,7), Starlite (18,8), Nickel's (24,8), wardrobe (4,18), loft (11,19), tower (18,19), cab (24,20). `plateMask` retraced from the painting. The west road exit is gone; Griffith Park is up the steps at (3,3) and (4,3), and the chapter 2 trail barrier moved there. Jefferson Park exits are the four tiles under the arch (12..15,25); jpark and griffith arrivals updated. The chapter 13 subfloor now comes up at the Metro (21,24).
- Props: hot dog cart removed (not in the new painting); taco truck, bus bench, Metro and cab object boxes re-placed. `tools/blvd_test.py` updated for the new tiles. smoke.py FAILS: [], blvd, griffith, jpark, loftlobby, reach and ch17 tests pass. No spoken lines changed.

## 2026-10-29: Cattail Pier is painted
- New `art/pier.webp` (Tom's painting, 1536 x 1408 = 24 x 22 tiles at 64 px) registered in `engine/plate.js` as `PLATES.pier` (`?v=20261029` busts phone caches). Before this the pier drew with the generic pond tile look.
- Walk map (`plateMask` in `data/maps-le.js`): dirt road from the north gate (x 11 to 13) and the west edge (rows 5 and 6), the bait shack front, the boardwalk (x 12 and 13), the platform (rows 10 to 12). Water, reeds, trees and rocks block.
- Objects re-laid to the painting: bait shack (17,1) 5x4, pier sign (14,3), Boppy's bench (7,3), tackle box (10,11). Reel stands at (19,5) in front of the shack. The rowboat object is gone (it floats in unreachable water). The old cattail objects and tree list are gone.
- Story: in `ch3Pier` Rose now stands at (13,12) on the platform (was (12,13), now water). Trigger zone and the other positions are unchanged.
- Checks: `tools/pier_test.py` 0 fails (objects touchable, scene tiles walkable, walk down the boardwalk, west exit enters the marsh), `tools/smoke.py` 0 fails, portrait and landscape shots looked at.

## 2026-10-29: Jefferson Park repaint (themed shops, one label per house)
- `art/jpark.webp` is replaced with Tom's revised painting (same 1920 x 1536 at 64 px, upscaled from the 1402 x 1122 source). Same street, paths, camera and building positions, so the `plateMask`, doors, exits and objects are unchanged.
- Shops are exaggerated to read as what they sell: Odette's Creole Kitchen (Mardi Gras awning, giant crawfish, brass horn, CREOLE KITCHEN sign), Pupuseria La Ceiba (giant pupusa on the roof, PUPUSERIA sign), Board Room (skateboard on the roof, boards in the window, BOARD ROOM sign), Very Green Juice (giant green smoothie, VERY GREEN JUICE sign).
- Houses: exactly one label each (TOM'S HOUSE, JORDAN & SAM'S, CASA ALVAREZ, DAKOTA & RYAN'S); the duplicate labels are gone. Tom's house shows 3468.
- `PLATES.jpark.src` gets `?v=20261029` so phones that cached the old painting load the new one.
- Checks: `tools/jpark_test.py` 0 fails (all eight doors enter, every object touchable), `tools/smoke.py` 0 fails, portrait and landscape shots looked at.
- Known roughness: the sign text is painted, so the in-game names (Odette's Creole Kitchen, Pupuseria La Ceiba) show only in the HUD and dialogue. Door tiles sit on the landing in front of each painted door, as before.

## 2026-10-29: Chapter, load and new-game prompts use the welcome page
- Picking a chapter, LOAD, PART 2 or the bonus on the welcome page used to cut to the town with the old pixel logo and a dialogue box. The prompt now stays on the welcome page: same painted logo, same gold-framed panel and serif menu buttons (START CHAPTER 2 / BACK, the load list, the new-game warning).
- New `titleAsk(name,text,options)` in `engine/splash.js` (same arguments as `openChoice`; falls back to it if there is no welcome page). `splashGo` no longer fades to the town first; it fades out only when the pick starts a game without a prompt (`splashFade`). New `ask` mode in `SPLASH_MODES`, a `.sp-text` line in the panel, Esc/B runs the prompt's BACK. Callers switched: `engine/intro.js` (confirmNew, loadMenu), `engine/story.js` (confirmPart2), `engine/chapter-select.js` (confirmChapter), `data/bonus-nine-scoops.js` (confirmBonus). smoke.py FAILS: []. No spoken lines changed.

## 2026-10-29: Tom's House is now two painted rooms (replaces the tall top-down plate)
- Tom did not like the top-down plate, so the house is rebuilt from two 3/4 oblique paintings in the same style as the other houses. The hall wing (laundry, office, jetted bath, guest bath, storage, guest bedroom), the decks and the yard are gone for now.
- Main floor, map `tomhouse` (16 x 24 tiles, `art/tomhouse.webp` 1024 x 1536): wet bar, dining, kitchen with island, living room. The front door is three tiles wide at (3,18) (4,18) (5,18); spawn (4,17). The open doorway at the top middle (7,3) is an edge portal to the suite.
- Primary suite, new map `tomsuite` (16 x 15, `art/tomsuite.webp` 1024 x 960, the source painting scaled down): bedroom with the bed (restores the party), glass shower (restores), bath, two walk-in closets, window bench. Door at (7,12) and (8,12) leads back to the main floor (7,4). `houseById.tomsuite` in `engine/la.js` borrows the house record so the minimap and name lookups work; it is not a street door.
- `makeRoom` (engine/world.js) gained `doors` (extra front-door tiles) and `edges` (a doorway to another room of the same house). Both rooms use `PLATES` actor scale 1.98 like the other interiors.
- Scenes: `ch2-starter` and `ch12-house` trigger anywhere on the main floor (`at:[2,5,13,17]`); `ch2Starter` and `ch6Kitchen` walk Tom to (8,8) beside the island, TNB at (7,8) (Tom now faces the island to the right). `tools/tomhouse_test.py` rewritten for the two rooms; smoke and the Chapter 12 test pass. No spoken lines changed.
- Not done: walk-behind layer; the old hall rooms (a new painting would bring them back as another room via `edges`).

## 2026-10-29: Lobby elevator is a call button
- The brass elevator doors in `loftlobby` are scenery now. The call button beside them (object at 7,2, stand at 7,3 facing up) asks "Go up to TNB's loft?" with Enter TNB's / Not now. Yes rides to `lofts` at (6,8). New object field `ride:[map,x,y,facing]` (with optional `ridePrompt`) handled in `engine/overworld.js` (`pressAction`), reusable for any lift or door that should ask first.
- Test: `tools/loftlobby_test.py` covers the prompt, Not now, and Enter TNB's. smoke.py FAILS: []. No spoken lines changed.

## 2026-10-29: TNB's loft is painted (map `lofts`)
- `art/lofts.webp` (768 x 640, 12 x 10 tiles) is the loft plate, registered in `engine/plate.js` with the interior actor scale. `plateMask` in `data/maps-la.js` is traced from the painting; the loft is entered from the lobby elevator (arrive 6,8) and its door (6,9) is the elevator back down.
- Objects re-placed on the painted furniture, same names and jokes: kiln (2,1), garment rack (4,1), pottery shelf (8,1), wheel (1,3), longboard wall (8,4), horror couch (1,6). New: coffee table (5,4) and side tables (4,6). TNB stays at (6,5).
- `ch2Loft` scene: TNB now stands at (6,5) and Tom walks to (6,6), because the coffee table sits on the old spot.
- Test: `tools/loft_test.py` (every object touchable, TNB on floor, door to the lobby, ch2 greeting). smoke.py FAILS: []. No spoken lines changed.

## 2026-10-29: Lobby of TNB's building (map `loftlobby`)
- New painted room `art/loftlobby.webp` (768 x 640, 12 x 10 tiles, registered in `engine/plate.js` with the interior actor scale). Spring Street's LOFTS door now opens on the lobby (spawn inside the gate at 6,8); the street gate is the exit (6,9 and 5,9). The brass elevator doors (5,1 and 6,1) go up to TNB's loft (`lofts`, arrive at 6,8). The loft's door is now the elevator back down (arrive at the lobby doors, 5,3), not the street.
- Engine hooks: `house.enterMap` (battle-draw.js `switchMap`), `houseById.loftlobby` alias to the LOFTS house (engine/la.js, so minimap, music and exit work; the door count is unchanged), room specs `exitTo` and `portals` plus `name` (engine/world.js).
- Lobby objects: mailboxes, package desk, leather sofa, monstera; all touchable. Chapter scenes that start in `lofts` (ch2Loft, ch12Loft) now start when the party steps out of the elevator.
- Test: `tools/loftlobby_test.py` (street door, lobby, elevator, loft, back, street). No spoken lines changed.

## 2026-10-29: Indoor party spacing 25% tighter
- `movePlayer` in `engine/followers.js`: inside houses and shops the gap between party members is now 1.5 tiles (was 2). Outdoors stays 1 tile. Fractional gaps are interpolated along Tom's trail, so followers can stand between tiles. Checked by walking Tom in a house (gaps 1.5, 1.5) and outside (1, 1). No spoken lines changed.

## 2026-10-29: Tom's House is painted (Area 46, map id `tomhouse`)
- `art/tomhouse.webp` (1216 x 2752, 64 art px per tile) is the painted plate; `PLATES.tomhouse` in `engine/plate.js` (characters drawn at 1.5x). The painting came from Tom's image AI using the corrections list in `docs/area46/`; it matched the 19 x 43 shape, so the map size did not change.
- The old tile plan is gone. `plateMask` in `data/maps-la.js` is now traced from the painting (the old walkmap no longer matches the art: the hall lobby, doors, bath and closet positions all differ). All 210 walkable tiles and all 38 objects are reachable from the front door (checked by flood fill, then walked with real key presses through every door).
- Objects were re-placed on the painted furniture, same names and same flavor text. Dropped (their tiles are scenery now): lemon tree, back hedge tree, shrubs, yard tree, deck planter, flax and the welcome mat. The deck chairs, photo wall, nightstands, plants and the rest stay.
- Art patch: the painted office closet has no exit, so the office was sealed. One doorway was cut into the office east wall (art x 600-634, y 1350-1404 at full size, a floor strip pasted over the wall) so the office opens onto the hall at tile (9,21). The real plan has the office entered through its closet.
- Scenery only (not walkable): north deck, west lawn, back yard and the front porch. The deck furniture closes the deck in the middle, so the yard cannot be reached from the south deck.
- Scenes moved to the new kitchen: `ch2-starter` and `ch12-house` trigger anywhere on the main floor (`at:[4,28,15,37]`); `ch2Starter` and `ch6Kitchen` walk Tom to (14,31) beside the island, TNB at (15,31). Both checked in a headless run.
- Not done: walk-behind (a character passing behind a tall prop is still drawn on top); there is no foreground layer yet. No spoken lines changed.

## 2026-10-29: Nara on the welcome screen sits behind Grace
- `SPLASH_SPOTS` in `engine/splash.js`: Nara moved from the bottom left to behind Grace at the foot of the stairs (x 240, feet 1020, h 104) and listed first so every family member draws over her. Everyone on the welcome art is also 10% bigger (`SPLASH_ALL=1.1`, feet stay planted). No spoken lines changed.

## 2026-10-29: Aunt Ellie's house is painted
- Her interior (map `elliehouse`) now uses Tom's painting (`art/elliehouse.webp`, 768x640 like the other room plates). Registered in `engine/plate.js` with the interior actor scale. Walk map (`plateMask`) follows the furniture; exit at the bottom stairs back to Rivituso Row.
- Examine objects re-laid to the painting: writing cabinet (orchid joke kept), kettle, green sofa, lamp table (1968 ship photo), tea table (good china note kept), dining table, side table, umbrella stand, vanity (wardrobe joke kept). The old hat shelf and desk jokes: hat shelf dropped (no hat boxes in the painting).
- Ellie's spoken lines are unchanged, so every baked clip still plays. The hutch, photo wall, armchair, basket, shoe rack and right sideboard are painted but not reachable.
- Tests: `tools/ellie_test.py` (new) passes; `tools/smoke.py` FAILS: []. `tools/tea_test.py` 'walked up from the door' is flaky (passes and fails on identical code).

## 2026-10-29: TNB sized exactly like Tom, plus 24 extra painted poses
- TNB's head-to-body ratio and height now match Tom's (per-frame head solve in `bake_tnb.py`: 44.5 percent of battle height, 43.3 front, 41.7 side; 100 battle rows, 42 overworld rows).
- 24 new poses from two extra sheets (battle actions, story scenes), same baker. Mug Toss now plays painted pull, wind-up and release frames (the drawn mug is skipped while a painted pose holds its own). Slasher Scare uses the dodge pose. point, aim, spread, hip, clap, carry, shrug are painted; story poses sit, toast, sitR, hug, whisper plus new wave, talk, laugh are painted. Saved but not yet used in a move: heave, crouch.
- Known roughness: small sleeve slivers beside the head on a few frames (windup, strike, leap, win, kneel, crouchlook).
- No spoken lines changed.

## 2026-10-29: Grace's cartwheel and gymnastics poses are painted
- New pose sheets `tools/sprite-bake/src/grace-poses-a1.png` (lunge, star, handstand, land, knee lift, front kick, floor split, bridge, dance, balance, bow) and `grace-poses-a2.png` (tuck, leap, salute, dance, balance, bow), baked by `python3 tools/sprite-bake/bake_grace_poses.py` into `art/chars/grace-wheel.webp` (16 frames, 260 px, hip at the centre of each frame; the hip is the leggings centre nearest the leotard) and `data/grace-wheel-hires.js` (generated).
- `data/grace-wheel-use.js` swaps the picture only: `GRACE_WHEEL.frame` and `.mirror` now return a painted 130 x 130 frame (drawn at scale 1, the same 130 px box as the old 65-row frames at scale 2); the hip path, planted hand or foot and rotation maths in `data/grace-wheel.js` are unchanged. Tweens between two model poses show the nearer painted pose. Used by Cartwheel's showpiece, Judge Grace (Tom and Grace), and the round-off combos. Set `GRACE_WHEEL_HIRES_OFF=true` to get the pixel frames back.
- This also fixes the pixel cartwheel frames drawing at half size since the painted Grace went in (her sprite scale is now 1, the frames were built for 2).
- Not wired yet: `GRACE_WHEEL.painted(name)` also holds handstand, leap, salute, dance, balance, bow, split and bridge for other moves (Handstand Contest, Split Leap, Olympic salute, DANCE). They are hip-centred, not feet-aligned like the battle frames.
- `sheet.py` gained `split_erode` (figures that nearly touch are separated by eroding, then each pixel goes to its nearest figure).

## 2026-10-28: Painted Grace (battle, knocked out, overworld)
- Grace now comes from her painted sheets (`tools/sprite-bake/src/grace-battle-v2.png`, `grace-walk-v2.png`, hero `grace-hero-v2.png`), baked by `python3 tools/sprite-bake/bake_grace.py` into `art/chars/grace-battle.webp`, `grace-ko.webp`, `grace-ow.webp` and `data/grace-hires.js` (generated). `data/grace-hires-use.js` swaps her in (set `GRACE_HIRES_OFF=true` to get the old pixel Grace back). Battle idle is 80 rows at scale 1 (old: 40 rows at 2, same height); overworld stands 38 rows (old 43 x .88).
- Her violet leotard is close to the magenta background, so `sheet.py` has a `robust=True` cut (distance to the real background colour; interior pixels untouched; only the rim and pink hair strands are cleaned). Tom's bake still uses the old cut.
- The bake paints in what the sheet avoids: a black eye on the kneel pose (low HP) and a dizzy spiral on the knocked-out pose. The startled pose is the hurt pose as drawn. A `beg` frame (kneel without the bruise) feeds the Squishy Delivery begging pose.
- Outfit colours: `engine/painted.js` atlases take an optional tint function; Grace's picks the violet pixels only (Tom's default is unchanged). `drawSprite` now honours a per-frame palette (`rows._pal`).
- Known roughness: her bespoke cartwheel poses (`data/grace-wheel.js`, used by Cartwheel's showpiece, Grace's Tombo move and her round-off combos) are still built from the old pixel body and keep the old palette, so they look pixel-style mid-move; the Olympic leotard colour swap does not show on the painted body; windup, leap, hurt and cast poses are baked but not wired yet (Track B, same as Tom).

## 2026-10-28: Painted Rose (battle, kneel, KO, overworld)
- Baked from Tom's Rose sheets with `tools/sprite-bake/bake_rose.py`; `data/rose-hires.js` is generated, `data/rose-hires-use.js` swaps her in (`ROSE_HIRES_OFF=true` falls back to the old pixel Rose). Battle is 72 rows at scale 1 (Tom is 100); overworld 35 rows. Raspberry mouth point is `{col:34,row:20}`.
- Black eye is painted onto the kneel frame by the baker (the sheets avoid injury wording). KO is the napping pose as drawn. Startled is used as hurt.
- Outfit recolour: `painted.js` has a `coral` tint mode (picks the coral tunic by hue, keeps shading); Rose's atlases use it. `gear.js` takes her garment keys from the baked meta.
- Shoulder ride (`data/rose-ride.js`) is still the old pixel Rose, kept on her old palette (`ROSE_RIDE_PAL`). Painted ride art is still to do.
- No spoken lines changed.

## 2026-10-28: Tom's House rebuilt from the real floor plan (Area 46, map id `tomhouse`)
- New 19 x 43 map (was 16 x 35), 2.5 ft per tile, one tile walls, laid out from the architectural plan. Specs and reasoning in `docs/area46/` (geometry review, walkmap, JSON, art corrections list for the future painting). Drawn with the game's own tiles for now; a painted plate (1216 x 2752) can replace it later.
- Rooms: back yard, rear deck and west lawn; primary bath, wardrobe and bedroom; laundry, pantry, central hall; office (entered through its closet); jetted-tub bath; guest bedroom with its own bath and east storage; open kitchen, dining and living room; entry.
- Front door is a double door (two exit tiles at 5,38 and 6,38); spawn is 5,37. Exterior house door on Jefferson Park is unchanged.
- Assumed doors (plan shows none): guest bedroom, jetted bath, pantry; backyard linked to the deck by three tiles. See the review doc.
- All 40 original objects kept with their text, re-placed; 8 new props (shrubs, sideboard, cabinets, primary toilet) with short new text. Bed and shower still restore. Guest bath fixtures re-laid so each is touchable.
- New `tools/tomhouse_test.py` (all floor reachable, every object touchable, both door tiles exit to Jefferson Park, 14 shots).
- Not reworded: no spoken lines changed. No walk-behind layer yet (engine has none for tile rooms).

## 2026-10-29: Downtown LA south exit is wider
- The crosswalk exit from Downtown LA (`blvd`) to Jefferson Park (`jpark`) is now 4 tiles wide (x 14 to 17 on the bottom row) instead of 2. Walk map only, the painting is untouched.
- `blvd`: exits and border openings added at (16,25) and (17,25); tile (14,23) opened so Tom can step onto the crosswalk from the street. `jpark`: the top of the map (rows 0 to 5) is 4 wide at x 14 to 17, with matching exits at (16,0) and (17,0), so the passage lines up both ways.
- Tested: tools/reach_test.py, blvd_test.py, jpark_test.py, smoke.py, and a key-press walk through every tile both directions.

## 2026-10-28: Painted plate for Downtown LA (the boulevard, map id `blvd`)
- Downtown LA now uses Tom's painting (`art/blvd.webp`, 1920 x 1664, 30 x 26 tiles at 64 px, entry in `PLATES`). The clean version was used; the grid image was only a guide. A `plateMask` in `data/maps-la.js` is the walk map. Spawn is now (26,22), on the pad in front of the Cab Co. door.
- The painting is drawn in perspective, so the street slopes down to the right and the lower buildings sit lower than the grid markers. Doors were moved onto the painted doors by shifting the building rows: Coffee (4,7), Ramen (11,7), Starlite (18,7) unchanged; Nickel's (24,8), Wardrobe (4,18), TNB's Loft (10,19), Grand Tower (18,20), Cab Co. (26,21). Every door is entered from the sidewalk pad in front of it.
- The painting has no street at the top edge and the right-hand wall blocks rows 9 and 10, so two exits moved onto roads that are painted: the Griffith Park trail now leaves west along the main road (0,9) and (0,10) (the smog barrier moved with it), and the studio road leaves east at (29,12) and (29,13) past the crosswalk (the closed-set barrier moved too). Jefferson Park is still the south crosswalk (14,25) and (15,25). Arrival tiles in Griffith, the studio and Jefferson Park were updated to match. The area hint now names all three.
- Walkable: both sidewalks, the main road, the crosswalks, the west street down the left edge (the only way round to the south sidewalk, one tile wide), the sidewalks in front of the lower shops and the south plaza. Blocked: every building, the rooftops, palms, lamp bases, the taco truck, the bus shelter, the taxi, the Metro stairs, the hot dog cart, the bench. Thin lamp poles and the signpost by the corridor stay walkable.
- Objects re-laid onto the painting: taco truck (21,11 3x3), hot dog cart (5,8 2x1), bus bench (24,12 2x2), Metro stairs (19,23 3x2), Cab 8 on the painted taxi (23,22 3x1), shop sign by Nickel's door (23,8), Bird of paradise on the painted pots (22,8), DTLA banner notice (28,14), south signpost (15,23), trail signpost (2,9). The old palm and lamp objects are gone (the mask blocks the painted ones). Chet moved to (9,11) and Wes to (9,21). NPCs never stand on the one-tile corridors (`noGo`), so nobody can plug a door.
- Other chapters that land on the boulevard were re-pointed: chapter 4 TNB waits at (21,22) by the Metro; the chapter 13 sub-rail return lands at (20,22) in front of the stairs; chapter 17 lobby exits land at (12,9) and (14,9), the opening starts at (14,9), and the Glass Tower front is drawn on the sidewalk (13,8 4x1) between Ramen Ramen and the Starlite.
- New `tools/blvd_test.py` (objects touchable, NPCs on floor, arrival tiles walkable, all eight doors open the right building from the pad and bring Tom back, south, west and east exits both ways, A on the props, portrait and landscape shots in `tools/shots/blvd-*.png`). `tools/ch17_test.py` now stands at (14,9) for the tower front. `tools/reach_test.py blvd` 0 fails, `tools/smoke.py`, `tools/ch13_test.py`, `tools/ch17_test.py` no fails.
- Known roughness: the minimap still draws the old tile look; the chapter 17 Glass Tower front is drawn live over the painted sidewalk and rooftops until that chapter gets its own painting; the west street uses a planter bed as a walkway at (1,12); the small cypress and trash cans are walk-through.
- Not reworded: no spoken lines changed. Object names changed only for the signpost ('Trail signpost'); object text is unchanged.

## 2026-10-28: Painted plate for Long Island Taxi Co.
- The taxi office (map id `taxi`, 11 x 9 tiles) now uses Tom's painting (`art/taxi.webp`, 704 x 576 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (5,8) and spawn (5,7) are unchanged; the one-tile aisle between the two gate posts (x 5, rows 7 and 8) is the way out.
- Walkable: the rug and floor in front of the desk (x 2 to 7, row 5), the wide strip below it (row 6), and the front row either side of the posts. Blocked: the whole back wall and dispatch desk (rows 0 to 4), left plant and chair, lost and found table, umbrella stand, gate posts.
- Objects re-laid to the painting (the grid markers were the old positions): Key board (2,0) 1x5, Dispatch desk (3,0) 3x5 (radio, map, mug), Driver of the month (6,0) 4x5 (photo, clock, phone, file cabinet), Lost and found (8,5) 2x1 on the painted table, Waiting room plant (0,5) 2x2, new Umbrella stand (10,5) 1x2. The wall items are not reachable on their own, so each object is a tall strip that runs from the wall down to the desk front and is touched from row 5.
- Sal is now `roam:0` (stays on the rug at (5,5)). He used to wander, and the aisle between the posts is one tile wide, so he could have trapped Tom inside.
- New object text (not voiced): Umbrella stand. No spoken lines changed.
- New `tools/taxi_test.py` (copied from tea_test.py; Sal's dialogue can fly the party to LA, so the test reloads the room after it). `tools/reach_test.py taxi` 0 fails, `tools/smoke.py` no fails, `tools/tea_test.py` still passes.
- Known roughness: the minimap still draws the old tile look; the file cabinet and coat rack have no line of their own.

## 2026-10-28: Painted plate for Griffith Park
- Griffith Park (map id `griffith`, 24 x 22 tiles) now uses Tom's painting (`art/griffith.webp`, 1536 x 1408 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-la.js` is the walk map. Tom sent only the grid and final images; the grid markers were the OLD positions and the painting did not follow them, so everything was re-laid onto the painted features.
- Walkable: the main trail up the middle (bottom exit to the steps, trailhead sign, lookout bench, fault rock, up past the tar pit), the ridge trail at the top (x 12 to 16, row 3), the east trail (rows 11 to 12), the west slope toward the Observatory hill (x 2 to 7, rows 6 to 10) and the shore path under the south tar pit (rows 17 to 18). Both tar pits are blocked.
- Exits moved to (10,21) and (11,21) (the painted trail is there, the old 7 and 8 were cactus); the Boulevard exits now land at (10,20) and (11,20). Spawn (11,19).
- Objects: Trailhead sign (13,13) 2x1, Tar warning (14,6), Lookout bench (16,15) 2x1, Fault marker (13,10) 3x1 on the painted rock, and the Observatory text now lives on the Lookout rock (17,3) 2x1 because the dome cannot be reached on foot. The Hiking bench is gone (no bench is painted there). Object text for the Lookout rock changed; not voiced.
- Monster spots re-laid: Smoglet (9,17), Ticket Flurry (20,12), Canyon Coyote (13,8), Gridlock (15,3), Tar Pit Blob (5,8), The Big Shake (3,6) on the west slope. Story triggers are unchanged (the boss fires when the party enters x 1 to 8, rows 1 to 7, which the west slope reaches at row 7). Chapter 2 smog pipes redrawn at the painted Observatory base (5.4, 2.1) and (6.9, 2.1).
- New `tools/griffith_test.py` (objects touchable, every monster on a reachable tile, walking up the trail and out the south exit to the Boulevard, shots in `tools/shots/griffith-*.png`). `tools/smoke.py` 0 fails.
- Known roughness: the minimap still draws the old tile look; the Observatory itself is scenery only; the chapter 2 boss walk (west slope) and the pipe positions have not been looked at on the phone.
- Jefferson Park (map id `jpark`, 30 x 24 tiles) now uses Tom's painting (`art/jpark.webp`, 1920 x 1536 at 64 px, entry in `PLATES`). Used the clean version (`27_jpark_final.png`). A `plateMask` in `data/maps-la.js` is the walk map: street, N-S path (x14,15), sidewalks, house walkways. Street trees, hedges and yards are blocked by the mask, so the old tree, fence and wall objects were removed. Spawn, edge exits and scripted drop-in tiles (4,19), (7,19), (28,10), (14,22) are unchanged. Doors re-laid onto the painting: the four shops now enter from the landing (y6, was y7; Odette's door x5, La Ceiba x10), Tom's house door moved to x3 (the painted stairs). Larry moved from the old tree yard to (8,6). Objects re-laid onto painted things: Front garden (2,15), Front yard (17,15), Drought garden (24,15), Street sign (16,6), plaque (13,18), Jefferson Boulevard sign (17,7), Bus bench (21,5), 2nd Ave signs (2,19) and (28,19). Parked cars block tiles; the juice bar exit tile overlaps the car roof edge. New `tools/jpark_test.py`.

## 2026-10-28: Painted plate for the Post (Snail Mail)
- The Post interior (map id `post`, 10 x 12 tiles) now uses Tom's painting (`art/post.webp`, 640 x 768 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (5,11) and spawn (5,10) are unchanged; the steps (x 4 and 5, rows 10 and 11) are the way out.
- Walkable: the floor in front of the counter and down the blue runner (x 3 to 6, rows 5 to 8), the aisle past the counter's right end (6,3), (6,4), (7,4), row 9 along the bottom, and the steps. Blocked: sorting counter and back wall, pigeonhole shelf and parcel scale, the big stamp desk with its chair and stool, the left plant and window sill, the stair railings.
- Objects re-laid to the painting: Post boxes now on the pigeonhole shelf (5,0) 2x3, touched from (6,3) (the wall cabinet behind the counter is not reachable); Sorting counter (1,3) 5x2; Stamp desk (7,5) 3x3 on the painted desk; Office plant (0,5) 3x4 on the big plant; new Parcel basket (8,9) 2x1. Kit now stands at (7,4) beside the counter's right end. Walls entries removed (the mask replaces them).
- New object text (not voiced): Parcel basket. No spoken lines changed.
- New `tools/post_test.py` (objects touchable, Kit on floor, A opens dialogue at every prop and at Kit, walking up from the steps and back out to the Square, portrait and landscape shots in `tools/shots/post-*.png`). `tools/reach_test.py post` 0 fails, `tools/smoke.py` no fails, `tools/greenhouse_test.py` still passes.
- Known roughness: the minimap still draws the old tile look; the wall cabinet behind the counter has no line of its own.

## 2026-10-28: Painted plate for Luna's observatory (Moon Club entrance)
- Luna's observatory (room id `observatory`, 13 x 12 tiles, shown in the HUD as "Moon Club") now uses Tom's painting (`art/observatory.webp`, 832 x 768 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (6,11) and spawn (6,10) are unchanged. The old `walls` list is gone.
- Walkable: the moon rug and floor in the middle, the strip under the bookshelf (x 5 to 10, row 4), the door rug (10,3), the left aisle (x 3 to 4, row 5 and 8), and the stairs (x 6, rows 9 to 11, one tile wide). Blocked: telescope platform and ladder, left cabinets and the desk with its chair, bookshelf and scroll barrel, star chart and globe cabinet, crates, front railing and planters.
- Objects re-laid to the painting: telescope (3,2) 3x2, research desk (1,6) 3x2, space books (6,2) 4x2 (shelf plus scroll barrel), star chart (10,5) 3x3 on the Lost Sock board, new Supply crates (8,8) 3x2 (kind `toybox`), silver club door (10,2) 1x1. Luna stays at (5,6) on the rug.
- The Moon Club stairs (`moonclub` exit) now arrive on the door rug (10,3) instead of (11,2). The door is touched from (10,3) facing up. The painted door does not show open or closed; the story text still does.
- New `tools/observatory_test.py` (objects touchable, Luna on floor, A opens dialogue at every prop including the club door, door rug walkable, walk up the stairs and back out to the Square, portrait and landscape shots). `tools/reach_test.py observatory` 0 fails, `tools/moonclub_test.py` 0 fails, `tools/smoke.py` no fails.
- New object text (not voiced): Supply crates. No spoken lines changed.
- Known roughness: the minimap still draws the old tile look; the painted door is always drawn closed.

## 2026-10-28: Painted plate for Penny's Pockets (the shop)
- Penny's Pockets (map id `shop`, 11 x 9 tiles) now uses Tom's painting (`art/shop.webp`, 704 x 576 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (5,8) and spawn (5,7) are unchanged; the rail across the front has one gap, so the doorway is one tile wide.
- Objects re-laid onto the painted furniture: counter unchanged (3,3,5,1, Penny stays at (5,2) behind it); gear shelf and snack shelf now 2 x 2 (each touchable from the floor row below); battle bin now (0,5,2,2) with its barrel; shop plant now (9,5,1,2).
- New `tools/shop_test.py`: every object touchable, A opens a dialogue at each prop, the counter opens the shop from x3, x5 and x7, Penny behind the counter, bin and counter block walking, doorway returns to the Square, portrait and landscape shots in `tools/shots/shop-*.png`. `tools/reach_test.py shop` 0 fails, `tools/smoke.py` no fails.

## 2026-10-28: Painted plate for the Hush Library
- The Hush Library (map id `library`) now uses Tom's painting (`art/library.webp`, 1280 x 1088, 20 x 17 tiles at 64 px, entry in `PLATES`). The room grew from 13 x 11 to 20 x 17.
- Reading the grid image: blue (10,16) street door, green (10,14) arrival spot, purple (10,11) Page, orange (17,2) staff door. The teal dot (16,13) sits on the low wall, so it was not used.
- Street door is now two tiles (9,16) and (10,16); `makeRoom` gained `door2` and `spawn` options. The staff door is at (16,4) 2 wide and the Stacks stairs now arrive at (17,5).
- Objects re-laid onto the painting: serious books (2,3), less serious books (11,3), reading desk (3,11), cactus table (17,11), plus a new Reading table on the rug (8,7) with one new unvoiced line. Page roams 2 tiles.
- New `tools/library_test.py`: every object touchable, no walkable island, Page answers, staff door to the Stacks, street door to town, portrait and landscape shots.
- Known roughness: minimap still draws the old tile look. Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for Kettle Cottage (the tea room)
- Kettle Cottage (map id `tea`, 12 x 9 tiles) now uses Tom's painting (`art/tea.webp`, 768 x 576, 64 px per tile, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (6,8) and spawn (6,7) are unchanged.
- The grid image's markers were the old object positions, and the painting did not follow them (the biscuit table is two tiles further right, the counter is longer). Objects were re-laid onto the painted furniture: Tea for two (2,3 2x2), Biscuit table (9,3 2x2), Mint plant (1,5, the big left planter), the kettle counter (5,1 5x2). Oolong still starts at (5,3).
- New `tools/tea_test.py`: objects touchable, Oolong on floor, A opens dialogue at every prop, walking down the door gap returns to the Square, portrait and landscape shots in `tools/shots/tea-*.png`. `tools/reach_test.py tea` 0 fails, `tools/smoke.py` no fails.

## 2026-10-28: Painted plate for Sprout House (the greenhouse)
- Sprout House (map id `greenhouse`, the Square's greenhouse interior) now uses Tom's painting (`art/greenhouse.webp`, 768 x 640, 12 x 10 tiles at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (6,9) and spawn (6,8) are unchanged.
- Walkable: the strip in front of the beds, the aisle either side of the barrel plant, the green rug, the arch (x 5 and 6, rows 8 and 9). Blocked: the glass wall, back bench, both potting beds, the barrel plant, the plant stool and hose on the left, the gardening shelf and plants on the right, the hedges and gate posts at the bottom.
- Objects re-laid to the painting: The Steves (1,2) 4x2, the other Steves (7,2) 4x2, Assistant Steve on the plant stool (2,5) 1x2, gardening shelf (8,6) 3x2. All touched from the floor in front. Fern stays at (7,5). Object text unchanged.
- New `tools/greenhouse_test.py`: objects touchable, Fern on floor, A opens dialogue at every prop, walking down the arch returns to the Square, portrait and landscape shots in `tools/shots/greenhouse-*.png`. `tools/reach_test.py greenhouse` 0 fails, `tools/smoke.py` no fails.
- Known roughness: the minimap still draws the old tile look; the barrel plant in the middle has no line of its own yet.
- Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for Crumb Bakery
- The Crumb Bakery interior (room id `bakery`, 11 x 10 tiles) now uses Tom's painting (`art/bakery.webp`, 704 x 640 at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Door (5,9) and spawn (5,8) are unchanged.
- Walkable: the rug and checker floor (x 2 to 9, rows 4 to 7), the nook beside the work table (3,3), and the doorway and mat (5 and 6, row 8). Blocked: oven and work table, bread counter, window benches, fern, dresser, roll basket, half wall.
- Objects re-laid: oven (1,2) 2x2 on the work table, bread display (4,2) 5x2, new Window benches (1,4) 1x2, recipe shelf (10,3) 1x4 on the dresser, flour fern (0,6) 2x2, new Roll basket (10,7). All touched from the floor in front. Bun stays at (4,5) on the rug.
- New `tools/bakery_test.py` (objects touchable, Bun on floor, walk up from the door and back out, A opens the counter text, portrait and landscape shots). `tools/reach_test.py bakery` 0 fails, `tools/smoke.py` no fails.
- New object text (not voiced): Window benches, Roll basket. No spoken lines changed.

## 2026-10-28: Painted plate for Terminal Zero (chapter 10)
- Terminal Zero (map id `terminal`) now uses Tom's painting (`art/terminal.webp`, 1920 x 1408, 30 x 22 tiles at 64 px, entry in `PLATES`). Used the clean version (`Terminal_Zero_Area_14_1920x1408_v2.png`, signs left blank); the lettered version was not used. The ASCII plan stays underneath as the invisible tile layer; a `plateMask` in `data/maps-le.js` is the walk map.
- The painting is centred, so the doors moved: curb doors are now (14,21) and (15,21) (spawn (15,20); Sal's cab and the ch10 intro arrive at (15,19)), Gate Zero doors (14,1) and (15,1); Gate Zero sends the party back to (14,2) and (15,2).
- Gate clock stays drawn on top of the painting (`liveKinds:['gateclock']`) because its hands, coin slots and glow change with the story; it sits on the top edge of the painted gate doors. The dim lamp-light effect before the clocks start still runs over the painting.
- Objects re-laid onto the painting: scanner (3,3), X-ray (4,4, 3x2), bins (8,4, 2x2), belt posts (1,6) and (5,6), departure board (13,7, 4x2), benches (4,8) and (18,8), direction signs (left (1,7), right (26,7), new text), carousel (19,3, 8x4), lost and found (27,3), luggage cart on the red cabinet (29,5), lounge couch (1,15), armchairs (4,15) and (7,16), snack bar (1,13), amenity cabinet (10,12), check-in counter (17,14, 8x1), photo booth (28,12), plants (11,7), (18,7), (12,12), Kevin (28,16). The painting has no moving walkway or "you are here" directory, so the directory became the two direction signs.
- Monsters moved onto floor: Long Line (10,4), Jet Lags (9,6) and (6,17), Carry-Ons (6,10), (24,9) and (27,6), Unclaimed (27,5), Armrest Hog (6,15). Wing triggers: Security [1,1,11,6], Baggage Claim [18,1,28,6], Lounge [1,14,13,17].
- The plants beside the departure board are walkable so the corridor has a way round the board; the lounge opens from the corridor along rows 15 and 16.
- New `tools/terminal_test.py`: every object touchable, every monster and trigger on reachable floor, both pairs of doors reachable, Gate Zero return lands on floor, portrait and landscape shots in `tools/shots/terminal-*.png`. `tools/reach_test.py terminal gatezero` 0 fails, `tools/smoke.py` no fails.
- Known roughness: the minimap still draws the old tile look; the Baggage Claim wing is a small nook at the right because the painted carousel fills the room; the two armchairs by the lounge entrance and the plants by the board are walk-through.
- Not reworded: no spoken lines changed (object text for the two direction signs and the couch is new or edited, none of it voiced).

## 2026-10-28: Painted plate for the Dome (top of the Moon Club, chapter 9)
- The Dome (map id `dome`) now uses Tom's painting (`art/dome.webp`, 1280 x 896, 20 x 14 tiles at 64 px, entry in `PLATES`). The ASCII plan stays underneath as the invisible tile layer; a `plateMask` in `data/maps-le.js` is the walk map.
- Walk map: the dance floor (rows 5 to 9, narrowing to rows 10 and 11) and the carpet up from the stairs (x 9 and 10, rows 12 and 13). The stage, both rails, the corner tables and the two big palms block. Exits (9,13) and (10,13) and spawn (9,12) are unchanged, so the Moon Club doors still land correctly.
- Objects re-laid to the painting: left band chairs and music stands (4,3, 3x2), drum kit (10,3, 2x2), telescope (17,3, 2x2; was (17,7)), left palm (6,11, 2x2), right palm (12,11, 2x2). All are touched from the dance floor in front of them.
- The Mirrorball now hovers at (9,5) over the dance floor (was (9,3), which is now behind the painted piano). The chapter 9 boss scene positions (Tom 9,7, Deedee 8,7, Boppy 10,7) are on open floor and unchanged. The fight glow in `data/scenes.js` follows the new height, and the old dark wash over the Dome is skipped on the painting.
- New `tools/dome_test.py`: objects touchable, Mirrorball and boss stand tiles on reachable floor, A opens dialogue at every prop from a real key press, walking down the carpet with the arrow key returns to the Moon Club, portrait and landscape shots in `tools/shots/dome-*.png`. `tools/reach_test.py dome moonclub` 0 fails, `tools/moonclub_test.py` 0 fails, `tools/smoke.py` no fails.
- Known roughness: the painting always shows the full moon in the glass (top right), but the story has the moon missing until the Mirrorball is beaten, and the telescope line says "no moon at all". Hiding it needs a second painting without the moon; erasing it in code also erased the glass bar across it. The minimap still draws the old tile look.
- Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for Gate Zero (chapter 10)
- Gate Zero (map id `gatezero`, the last room of Terminal Zero) now uses Tom's painting (`art/gatezero.webp`, 1280 x 896, 20 x 14 tiles at 64 px, entry in `PLATES`). A `plateMask` in `data/maps-le.js` is the walk map. Spawn (9,12) and the exit down to Terminal Zero ((9,13), (10,13)) are unchanged.
- Walkable: the red carpet aisle, the stone floor, the strip in front of the window (row 4, x 7 to 15) and the walkway at the bottom. Blocked: the window wall, the podium, the jet bridge door, the four bench rows, the two potted plants and the gate posts.
- Objects re-laid to the painting: podium (4,3) 3x2, jet door (14,1) 2x3 (touch it from the strip in front, row 4), benches (3,5) 5x2, (12,5) 5x2, (1,8) 6x2, (13,8) 6x2, plants now on the painted pots (1,10) and (17,10), 2x2. Object text is unchanged.
- The Last Call now stands at (9,4) (was (9,3), which is window wall now); challenge it from (9,5). Boss scene stand tiles (9,7), (8,7), (10,7), (11,7) are open floor; played the intro scene on the painting.
- The old drawn plane in the window is skipped on the plate (`data/scenes.js`). The plane is part of the painting, so after the chapter 10 boss the plane no longer flies away.
- Tests: new `tools/gatezero_test.py` (objects touchable, stand tiles walkable, key presses up the aisle and out to Terminal Zero, portrait and landscape shots); `tools/reach_test.py gatezero terminal` 0 fails; smoke no fails. Known roughness: the minimap still draws the old tile look. No spoken lines changed.

## 2026-10-28: New painted Tom (overworld and battle)
- Tom now comes from his painted character sheet (`tools/sprite-bake/src/tom-sheet.png`), baked by `python3 tools/sprite-bake/bake_tom.py` into `data/tom-hires.js` (generated, never hand-edit). `data/tom-hires-use.js` swaps it in for the old pixel Tom: `BATTLE_SPRITES.tom` (about 100 rows at scale 1, was 40 rows at 2.6), `TOM_OW` (44 rows, same size as before) and `KO_SPRITES.tom`. Same palette-key and row-string format as everyone else, so outfits, combo moves, Rose's shoulder ride and flashes all keep working. Set `TOM_HIRES_OFF=true` before `data/tom-hires-use.js` to get the old Tom back.
- `drawSprite` (data/battle-sprites.js) draws any sprite of 60 or more rows through an offscreen canvas cache (`bigSpriteCanvas`, keyed by frame, palette, scale, flash, outfit tint, kneel cut), so more detail costs one `drawImage`. The old small sprites are untouched.
- Outfit recolour for Tom (`GARMENT` in engine/gear.js) now reads the keys and rows the baker found (`TOM_HIRES.meta`). Known roughness: a few dark shirt highlights on the far shoulder keep their colour, and the chin can pick up a trace of tint.
- Low health now shows the painted kneel with the black eye (the old bruise overlay is skipped for `sp.hires`). Defend guard uses the painted bodyguard pose (`sp.defend`). KO uses the painted lying pose at 0.8 scale.
- Painted poses baked but not wired yet: `windup`, `leap`, `hurtPose`, `castPose` (on `BATTLE_SPRITES.tom`), plus six face expressions in the sheet.
- Tests: `tools/smoke.py` (tnb,nara and grace,rose) FAILS [], `tools/kit_test.py tom --speed2` all moves ran with their lines, frames looked at. Outfit tint, low HP, KO, Rose ride and the town overworld looked at in screenshots.
- Not reworded: no spoken lines changed.

## 2026-10-28: Tom is now truly painted (bitmap sprites)
- Tom is drawn from his two new painted pose sheets (caricature, no outlines): `tools/sprite-bake/src/tom-battle-v2.png` and `tom-walk-v2.png`, baked by `bake_tom.py` into `art/chars/tom-battle.webp` (2x), `tom-ko.webp` (2x), `tom-ow.webp` (3x) and `data/tom-hires.js`.
- New `engine/painted.js`: rows tagged `_paint` draw their painted frame (flip, flash and outfit recolour supported); rows are the fallback while the image loads. `drawSprite` has the fast path; `mirrorRows` (engine/tiles.js) keeps the tag and toggles `flip`. `garmentTint` now also returns `color`, used to recolour the painted shirt.
- Same row geometry as before, so Rose's ride, hand points, hurt, KO, defend and outfits all still work. `TOM_HIRES_OFF=true` restores the old Tom.
- New `tools/sprite-bake/sheet.py` slices magenta sheets with soft alpha and despill. Still not wired: windup, leap, hurt flinch and cast poses; overworld Rose ride on the new Tom is unchecked.
- Tests: smoke and kit_test tom, frames looked at. No spoken lines changed.

## 2026-10-29: Starter Splash and Popcorn Jump use painted poses
- `tools/sprite-bake/src/tom-poses-v2.png` (12 poses) baked into `art/chars/tom-poses.webp` with the first set: `carry, raise, lidpop, splash, goo, proud` (Starter Splash) and `bowlsit, spook, scream, bowlthrow, cower, frozen` (movie night, terrified). The jar and popcorn bowl are painted into the poses.
- Starter Splash (engine/tom-moves.js): carry, raise, lid pop, splash, goo, proud; the drawn jar (`tv_jar`) is skipped while painted poses are on.
- Popcorn Jump (`B2_TOMBO_ANIM.tnb1`, engine/battle2-kind.js): Tom sits with his painted bowl, is spooked, screams mid-jump while the game's bowl flies, cowers, then stands proud for the kiss. The drawn lap bowl is skipped. `bowlthrow` and `frozen` are baked but not used yet.
- `tools/sprite-bake/sheet.py` now merges loose debris (flying popcorn) into the nearest figure. Script versions bumped to `?v=tom4`.

## 2026-10-29: Painted controller for Press Start
- `tools/sprite-bake/src/prop-controller.png` baked by new `tools/sprite-bake/bake_props.py` to `art/chars/prop-controller.webp` (levelled, 200 px wide). `ctl()` in engine/tom-moves.js draws it (wind-up, throw, falling); the old drawn controller is the fallback until it loads.

## 2026-10-29: Tom's arrival stretch (painted)
- `tools/sprite-bake/src/tom-stretch-v1.png` (8 front-facing poses) baked to `art/chars/tom-stretch.webp`; `TOM_STRETCH` (data/tom-hires-use.js) holds them: tired, start, full, side, crack, neck, exhale, fresh.
- `engine/intro.js`: the cab-line stretch now plays all of them over 5.2 s (`drawStretchPainted`), with a second exhale sound; the old drawn-arms version remains as the fallback when `TOM_HIRES_OFF` is set.

## 2026-10-29: Tom's custom battle poses and a front-facing walk
- New walk sheet: Tom's head faces straight at the camera when he walks toward you (`tom-walk-v2.png` replaced).
- New pose sheet `tools/sprite-bake/src/tom-poses-v1.png` (12 poses) baked to `art/chars/tom-poses.webp` (own canvas, so Tom's idle box and Rose's shoulder ride are unchanged). On `BATTLE_SPRITES.tom` as `hold, annoyed, tw_windup, tw_follow, lift, fling, unbox, flick, brush, limit, startled, direct`; use them as `f:'hold'` in a move's `ST.keys`.
- Wired so far: Press Start (`button_mash`: hold, annoyed, wind-up, throw). The `hold` pose has a painted controller, so the game's own controller is skipped until the "UGH" beat. Not wired yet: lift (Dutch Oven), fling (Starter Splash), unbox, flick (Flashcard Flurry), brush (Kanji Strike), limit (Final Boss), startled, direct.
- Outfit recolour on these poses uses fixed torso fractions (rough).

## 2026-10-28: Painted plate for the Moon Club
- The Moon Club hall (map id `moonclub`, chapter 9) now uses Tom's painting (`art/moonclub.webp`, 1920 x 1408, 30 x 22 tiles at 64 px, entry in `PLATES`). The ASCII plan stays underneath as the invisible tile layer; a `plateMask` is the walk map. The Dome (upstairs) is not painted yet.
- The painting has no walls between the hall and the Coat Check and Card Room tops, so the rooms are tighter than the old plan: Coat Check floor is the rug strip (row 5, x 3 to 9) reached through the painted carved door (5 and 6, rows 6 to 8, opened in the wall); the Card Room is the strip x 17 to 18 plus row 5 (x 18 to 21) beside the tables. The Ballroom is the painted dance floor, entered through the gap in the rail at the top (x 12 to 18).
- Dome doors: now on row 2 (the foot of the painted doors). Exits are (14,2) and (15,2); the Dome sends Tom back to (14,3) and (15,3). `ch9OpenDoors` (data/scenes.js) opens whatever row the doors object is on. The moonbeam path (row 11 from the east, column 21, row 9, column 15) is unchanged and kept walkable in the mask so painted props never cut it off; tested: it still reaches the doors with all three mirrors back and turned.
- Mirror stands stay drawn on top of the painting (new spec field `liveKinds`, `buildArea` in engine/world.js) because the puzzle shows which are back and which way they lean. Every other prop is baked into the painting.
- Objects re-laid onto the painting: coat rail (5,3) and counter (7,3) on the desk, rope posts (3,4) and (9,4), velvet chair (10,4), plaque (21,8, reached from (22,9)), palms (10,8), (8,11), (8,19), (22,14), card tables (19,3) and (22,5), bar (18,2, the sideboard; the long painted bar is out of reach), monocle chair on the sofa (24,9), piano (10,13), jukebox (19,13), gold frame (23,15).
- Monsters moved onto floor: Hanger-On (8,5), Sore Loser (20,5), Stuffed Shirt (18,5) and (19,16), Wallflower (11,17); the two Velvet Ropes stay in the hall.
- New `tools/moonclub_test.py`: every object touchable from the spawn, every monster on reachable floor, beam hits the doors, doors open, portrait and landscape shots in `tools/shots/moonclub-*.png`. `tools/reach_test.py moonclub dome` and `tools/smoke.py` pass.
- Known roughness: the minimap still draws the old tile look; the east round window glows at the far right edge; where the beam and painted props overlap (palm at (19,9), mirror stands) the player walks in front of them; the right-hand strip (x 28) is a dead-end nook.
- Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for the Stacks (under the Hush Library)
- The Stacks (map id `stacks`, chapter 7) now use Tom's painting (`art/stacks.webp`, 1920 x 1408, 30 x 22 tiles at 64 px, entry in `PLATES`). The ASCII plan stays underneath as the invisible tile layer; a `plateMask` is the walk map. The generated wall-of-bookcase objects are gone (`planStacks(plan,true)` skips them); four bookcase objects now sit on painted shelf fronts beside the aisles.
- Walk map: the green runner from the Reading Room doors (14,1) and (15,1) down to the hall; the hall is rows 8 to 10 with a front lane on row 7 that joins the Fiction aisle (x 5 and 6, left) and the Nonfiction aisle (x 26, right); a gap (x 14 to 16) leads down to Picture Books; the story rug area, the rocking chair pocket and the star rug pocket are all reachable. Exit to the library stays (0,10), spawn (1,10); the Reading Room exits still land on (14,2) and (15,2).
- Objects re-laid to the painting: globe (12,8, 2x2), returns cart (16,8, 2x3), reading table (27,6, 2x2), Stacks sign on the signpost (20,8), rolling ladder (27,3), low shelves (8,19) and (19,19), story time chair = the rocking chair (7,15, 3x2), puppet theater (23,13, 3x3), beanbag (23,16, 2x2); Fiction bookcases (4,6) and (7,6), Nonfiction bookcases (25,3) and (25,5).
- Monsters moved onto open floor: Shushers (8,10) and (21,9) unchanged; Dog-Ears (6,6) and (26,5); Cliffhanger (6,4); Know-It-All (26,3); Pop-Up Panic (16,17). The three wing triggers (Fiction [1,1,12,7], Nonfiction [17,1,28,7], Picture Books [8,13,21,19]) are unchanged and all contain open floor. Because the front lane (row 7) is now walkable, walking along it at x 12 or less (or x 17 or more) is what starts the Fiction or Nonfiction scene.
- Known roughness: the aisles are single file (the Fiction and Nonfiction aisles are 1 to 2 tiles wide, and the monsters stand in them); the painted left entrance is a post and lamp, so (0,10) and (1,10) walk through it; the minimap still draws the old tile look.
- Tests: new `tools/stacks_test.py` (objects touchable, monsters and triggers on reachable floor, left exit to the library, Reading Room doors shut then open and lead up); `tools/reach_test.py stacks library readroom` 0 fails; `tools/smoke.py` no fails; looked at portrait and landscape shots (`tools/shots/stacks-*.png`).
- Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for the Reading Room (chapter 7)
- The Reading Room (map id `readroom`, under the Hush Library) now uses Tom's painting (`art/readroom.webp`, 1280 x 896, 20 x 14 tiles at 64 px, entry in `PLATES`). The ASCII plan stays underneath as the invisible tile layer; a `plateMask` in `data/maps-le.js` is the walk map.
- Walkable: the dais carpet (row 2, x 8 to 11), the painted steps (row 3, x 7 to 12), the floor, and the gate (9,12) to (10,13), which still leads down to the Stacks. Spawn (9,12) is unchanged. The balustrades, the four reading tables, the globe, the lectern and the gate posts and lamps block.
- Objects re-laid to cover each painted table so they can be touched from any open side: top left (2,6) 5x3, top right (13,6) 6x3, bottom left (1,9) 5x3, bottom right (14,9) 6x3 (Tom's pink markers sit inside these). Globe stays at (17,5) (reach it from (16,5) or (17,6)); lectern stays at (9,5). Object text is unchanged.
- Chapter 7 boss scene needed no edits: Tom (9,7), Grace (8,7), Rose (10,7) are on open floor and the Unread stands on the dais steps at (9,3); fight it from (9,4). Watched the scene play on the painting.
- Tests: new `tools/readroom_test.py` (objects touchable, boss stand tiles walkable, real key presses up the aisle and out the gate to the Stacks, portrait and landscape shots in `tools/shots/readroom-*.png`); `tools/reach_test.py readroom stacks` 0 fails; smoke no fails; `tools/ch5_school_test.py` still clean.
- Known roughness: the minimap still draws the old tile look. Not reworded: no spoken lines changed.

## 2026-10-28: Painted plate for the Cafetorium
- The Cafetorium (map id `cafetorium`, chapter 5) now uses Tom's painting (`art/cafetorium.webp`, 1280 x 896, 20 x 14 tiles at 64 px, entry in `PLATES`). The ASCII plan stays underneath as the invisible tile layer; a `plateMask` is the walk map.
- Door: the school exit moved onto the painted double doors at (1,5), step up from the spawn (1,6); it leads to the hallway at (27,9). The trash can at (0,6) and (0,7) now blocks. The school sends Tom to (1,6) and (1,7).
- Stage: one walkable row (y 2) reached by the two painted side stairs ((3,2) to (3,4) on the left, (16,2) to (16,4) on the right). The podium (10,2) splits the stage; the Red Pen now stands at (9,2) beside it (was (9,3)); stand at (8,2) to challenge it.
- Objects re-laid to the painting: the four lunch tables are now on the painted tabletops (3,7), (12,7), (2,10), (12,10), reached from the open aisle at y 9 or from y 12. Milk cooler (18,6) reached from (18,7) or (17,6). Cafetorium sign on the painted easel at (18,11), reached from (18,12).
- Chapter 5 stand positions (Tom 9,6, Grace 8,6, Amy 10,6, Rose 9,7, Pruitt 12,6) are all on open floor. No scene edits.
- Tests: smoke no fails; `tools/reach_test.py cafetorium school` 0 fails; every object and the Red Pen reachable from the spawn; walked the left stairs onto the stage and out the door with real key presses; looked at portrait and landscape.
- Known roughness: the minimap still draws the old tile look. Not reworded: no spoken lines changed.

# Change log (newest first)

## 2026-10-28: Painted plate for Long Island Elementary (map id `school`, the hallway and its rooms)
- The school hallway now uses Tom's painting (`art/school.webp`, 30 x 18 tiles at 64 px, entry in `PLATES`). The ASCII plan is replaced by a `plateMask` in `data/maps-le.js`. Tom's marker overlay (stars, bars, circles, arrows, triangles) set where each object goes; the 30 x 18 grid is 54 px per tile on his 1619 x 971 image.
- Objects re-laid to the painting: easels (1,1) and (7,1), art table (2,4), drying rack (8,4), piano (11,1), drums (14,1), xylophone (11,4), music stand (15,3), bleachers (19,1), hoop (23,1), gym mats (19,4), ball cart (27,4), rope (28,2), water fountain (1,8), bulletin board (9,8), trophy case (17,8), sign-up table (25,8), lost and found (27,11), fridge (1,12), coffee counter (3,13), copier (9,12), staff table (4,14), staff couch (6,15).
- Hallway clocks are hot spots on the wall base under each painted clock: Art (5,8), Music (15,8), Gym (23,8). Stand below one and press A. Chapter 5 clock logic is unchanged.
- Doors: front doors are now (14,17) and (15,17) (spawn (14,15); the schoolyard exits land on (14,16) and (15,16)). The Cafetorium exits are the painted double doors at the east end (tiles 27 and 28, row 8), not the map edge. `ch5OpenCafe` (data/scenes.js) now removes the locked-door object and adds those two exits once the clocks are set; before that they are solid. The Cafetorium exits back land on (27,9) and (28,9).
- Rooms: Art room pocket is row 5 plus (5,4) (6,4) and the easel nook; Music is rows 3 to 5 around the piano and drums; the Gym is rows 2 to 5. Room triggers moved to Art [1,3,8,5], Music [10,3,17,5], Gym [19,2,28,5]. Monsters: Tardy Bell (5,4), Glitter Glue (14,4), Dodgeball Dread (24,4); Pop Quiz (8,10) and (19,9) unchanged. NPCs: Mrs. Kowalski (20,11), Grandpa Ike (22,11), Mr. Halverson (10,14).
- Known roughness: the painted staff room has no door. Two gaps were opened in its north wall (x 2 and x 7) so the fridge, counter, copier and couch can be reached; the player walks through painted wall there. If Tom wants a painted door, re-aim those two columns. Painted furniture (table, couch, bookcase) blocks movement; the gym and staff room are tighter than the old open plan. The minimap still draws the old tile look.
- Tests: `python3 tools/ch5_school_test.py` (new: objects touchable, triggers and NPCs on reachable floor, doors shut then open, exits), `tools/reach_test.py school` and `schoolyard` (0 fails), `tools/smoke.py` passing. Shots in `tools/shots/school-*.png`.
- Not reworded: no spoken lines changed.

## 2026-10-28: Old area art no longer flashes before the painted version
- Bug: walking into a Long Island area showed the old tile drawing for about a second, then the painted art. Cause: `engine/plate.js` only started loading a painted plate the first time you entered its map, and `engine/draw.js` drew tiles until it finished.
- Fix: every plate now starts loading and decoding at boot. If one is still loading, `draw.js` shows a plain backdrop (`plateHold`) instead of tiles, houses, objects or actors. A plate that fails to load falls back to tiles.
- Tested with the art slowed 8 s: plain backdrop, then painting, never tiles. smoke and reach_test pass.

## 2026-10-28: Rivituso Row, path to Aunt Ellie's house and the south side
- Bug: the only way to Ellie's door (11,15), the south path and the Pier exit was a one-tile corridor along row 16 (x6 to x14), and Gus stood in it at (7,16), so the south could not be reached. The east garden loop also dead-ended at (20,16).
- Fix: the plateMask row 16 now runs x6 to x21, joining the west path and the east loop to Ellie's plaza (two ways in). New spec field `noGo` (`buildArea` in `engine/world.js`): tiles NPCs never wander onto; Row uses it for the whole plaza strip. Gus now starts by the bench at (4,11). The Pier signpost moved from (15,16) to (15,17) so it no longer sits on the opened path.
- New `tools/reach_test.py [mapId ...]`: flood fill over the real collision grid; fails if any door or exit is cut off, blocked by an NPC's starting tile, or can be cut off by any single wandering NPC. Row, Square and Hollow pass. The Marsh exit to the Sundial reports unreachable on purpose (old reeds until chapter 3).
- The Pier path (Row south exit) is still gated until chapter 3 (Boppy takes everyone fishing); that is design, not a bug.

## 2026-10-28: Grace has a new voice (Gretchen)
- Tom picked "AoT Grace (Gretchen)" (id JVVJ6VsnUPJAdfGmEBGP, ElevenLabs library) in the Grace baker and sent recast.json. Merged with `merge-voice.js ... grace`: all 50 battle lines (60 clips counting alternates in data/voice/grace.js) and all 160 story lines replaced, none added. Every LINES.grace text has a clip. No shrink step (new voice is already a kid); do not run shrink-voice.js on Grace again.
- The six chapter files with no Grace clips (dialog-ch2, 4, 6, 8, 23, 28) still named Ivy in their voice metadata; that entry was updated to Gretchen so the last-loaded file cannot undo it. Ivy is no longer used anywhere.
- Median pitch of her clips about 320 Hz (Amy about 280, Rose about 430). `IDS=grace,rose python3 tools/smoke.py`: FAILS []. No spoken text changed. Largest voice file 14.4 MB.
- Any new Grace clip from now on goes straight in with merge-voice.js, in this voice.

## 2026-10-28: Grace voice baker (new child voice)
- Tom heard Grace as a grown woman. Pitch and voice-size shifts of her current Ivy clips (3 rounds, up to +5 semitones) all sounded mechanical or cartoonish, and calm or long lines stayed adult. Decision: replace the voice, not process it.
- New `tools/voice-recast/build-grace.js` builds `grace-voice-baker.html` (searches the ElevenLabs Voice Library or takes a pasted voice ID, then re-records her 50 battle and 160 story lines with the existing scripts). `tools/voice-recast/test_grace_baker.py` tests it with ElevenLabs mocked (includes the delete-Ivy path when the account is full). Export merges with `node tools/voice-recast/merge-voice.js recast.json data <outdir> grace`. Do NOT run shrink-voice.js on the new clips.
- `tools/voice-recast/template.html`: an empty accent no longer adds a blank entry to the bracket direction. No game files or spoken lines changed.
- ElevenLabs returned 403 (safety block) when Voice Design was asked for a nine-year-old girl. Do not reword around it: Grace is picked from the Voice Library instead (`tools/voice-recast/grace-library.js`, built into the baker; adding the voice deletes Ivy if the account is full). The library calls are tested with mocks only, not against the live API.

## 2026-10-28: More monsters now face right
- Tom saw many monsters still looking left. `data/enemy-facing.js` now also mirrors Gridlock, Tardy Bell, Lukewarm, Smoglet, Shusher, Stuffed Shirt and Unclaimed (they were drawn turned left). Eyes and mouth are mirrored with the art, so every move still aims correctly.
- Monsters with writing on them (Standby Sprite, Pop Quiz, Grey Note, Know-It-All) are left alone on purpose so the letters do not read backwards.
- Tests: `tools/smoke.py` no fails; looked at the mirrored sprites on a contact sheet. No spoken lines changed.

## 2026-10-28: Painted plate for Sundial Hollow
- Sundial Hollow (map id `sundial`, chapter 3) now uses Tom's painting (`art/sundial.webp`, 22 x 20 tiles at 64 px, entry in `PLATES`). The ASCII plan is replaced by a `plateMask` in `data/maps-le.js`.
- Objects re-laid to the painting: sundial (11,12, 2x2; stand at 11 or 12,14), mossy sign (8,15), Pool marker (14,6), stone bench (3,13, 4x2). Monster spots moved onto dry land: Bobber (17,12), Tangle (5,16), Soggy Sock (14,16); Iron-Gill stays at (10,3) in the pond. The coin scene now walks Tom to (11,14).
- Spillway: the painting's water band is rows 8 and 9 with one stepping-stone crossing at x 13. It stays blocked until the coin is out of the sundial, then `ch3DrainSpillway` opens only `drainOpen` ([13,8],[13,9]). The painted water does not change. Boss trigger at the north bank still works (tested).
- Known roughness: the minimap still draws the old tile look.

## 2026-10-28: Painted plates for Amy's house and Deedee and Boppy's house
- The Gregori house (map id `amyhouse`) and the Rivituso house (`grands`) now use Tom's painted interiors (`art/amyhouse.webp`, `art/grands.webp`, 768 x 640, 64 px per tile). Interiors can now carry a `plateMask` like the outdoor areas (`makeRoom` in `engine/world.js` applies it); the room's old `walls` list is gone.
- Both rooms are re-laid to the painting: objects moved to what is painted (recliner, TV and sofa, baking island, photo wall, beds, toy chest, kitchen island), each reachable from the door. Notes: Boppy's pepper plant interaction sits on the painted lamp-table plant (the big painted pepper plant is behind the sofa and cannot be reached); the TV object covers the TV and sofa; the Grace and Rose bed interactions are reached from the rug strip in front of the beds.
- Cutscene stand positions moved off painted furniture: Deedee (5,6) in chapter 3 and Nine Scoops, the Nine Scoops party guests along Amy's back strip.
- Chapter 15: the long dinner table is now at x 4 to 8, y 5 to 6 (dragged into the middle of the painted living room). New seats: Deedee (3,5), Nara (3,4), TNB (5,4), Amy (6,4), Rose (7,4), Grace (5,7), Tom (7,7), Boppy (8,7); (6,7) stays free for HUSH-9. `tools/ch15_test.py` updated and passing.
- Tests: smoke, `tools/ch15_test.py` all ok; reach check (every object and NPC reachable from the door) in both rooms.
- Not reworded: no spoken lines changed. Known roughness: the rocking chair, side table and round dining table block movement but have no interaction.

## 2026-10-28: Tap to walk, Squishy Delivery, enemy facing (synced from the artifact scratch copy)
- Tap to walk (`engine/tapwalk.js`): tap the floor, an NPC, an object or a door and Tom walks there, followers trailing. Any key, stick, dialogue, menu, battle or cutscene cancels it. Toast text updated.
- Enemies now all face right (`data/enemy-facing.js` mirrors the left-facing sprites once at load). Bosses with helpers draw 1.5x, boss on the left, helpers in front.
- Squishy Delivery (Grace and Tom Tombo) uses the version with Grace kneeling to beg (`BATTLE_SPRITES.grace.beg`).
- Cheer fix: Amy, Boppy, Deedee, TNB victory and level-up cheer now draws. Small Rose pixel fix.
- Reworded spoken lines (need re-bake only if the baked clip text differs; both full clips are already baked): `grace.tombo` is 'Ta-Ta, I need a new squishy! Pleeease!' and `tom.tombograce` is 'Fine. One squishy. Just one.' `CLIP_PARTS` emptied.

## 2026-10-28: Painted plates for four Long Island areas
- The Square, Rivituso Row, Grump Hollow and the Whispering Marsh (map id `reeds`) now use Tom's painted art (`art/*.webp`, drawn by `engine/plate.js`). The tile grid stays underneath as the invisible walk map. Row, Hollow and Marsh have a `plateMask` in `data/maps-le.js` ('#' blocks, '.' walks); doors, exits and spec objects stay as they were, spec objects are no longer drawn (flag `baked`), runtime props still are.
- Rivituso Row is re-laid to the painting: Gregori (7,3), Rivituso (18,7 door), Aunt Ellie's house (id `elliehouse`, now at 9,11). Exits to the Square, Pier, Hollow and Marsh moved; chapter 1, 3, 9, 13, 14 and Nine Scoops coordinates remapped. Tests: `tools/ch14_test.py` stand positions updated.
- Marsh: one long route (east platform, long boardwalk, zigzag, dirt path to the old reeds). The old reeds now block (3..4, 1..2). The south-west dirt path in the painting is not walkable.
- Known roughness: minimaps still draw the old tile look; the painted Square fountain and notice board differ slightly from the sprites.
- Not reworded: no spoken lines changed.

## 2026-10-28: Part 2, Chapter 17 "Ascent of the Glass Tower"
- Talk to Sol at the Angel City cab stand after chapter 16 to start chapter 17. Grace and Rose rejoin. Julian Vance's 60-story Glass Tower stands on the Downtown boulevard (doors in the alley between Ramen Ramen and The Starlite).
- New dungeon, four maps: the Lobby, the Stairwell (floors 2 to 30, Stillness guards, coffee restore points), the Shelf Hall, the Vault. Glass, gold and a golden-hour skyline; new battle backdrop.
- Two strike teams of three: Tom, Grace, Rose climb the stairs; Tom, Amy, TNB, Nara work the Shelf Hall. The service hatch on landing 30 swaps the teams (the waiting team holds the landing or sits on the bench).
- Six shelves, each a tiny town paused on its happiest afternoon. Smashing one lets the moment finish (the pierogi bite, the firework, the last ferry). Six of six drops the locks.
- Amy and Tom race floors 31 to 59 (screen overlay, photo finish). Unlocks the Tombo Sixty-Story Sibling Pace (amy3).
- The Archivist's Twin Lenses (level 25, `twinlens`): Shake-style boss. Long Exposure on everyone every third turn (telegraphed), Curators and an amber lens below half HP (2 Kinetic or Sparkle hits or a Tombo break it, otherwise Total Archive). No kind route. Fight party: Tom, Grace, Rose, Amy; TNB and Nara on the bench.
- New monsters: Pausesprite, Paperweight, Curator. Chapter select has chapter 17 (level 22 start, chselSeventeen).
- Files: see docs/C17-DONE.md. Tests: tools/ch17_test.py all ok; smoke, bg_test, ch11 to ch16 re-run.
- Lines to bake: docs/dialogue-scripts-ch17.json (90 lines; the Archivist and Vance need cast entries). No existing spoken line was reworded. Chapter 16's end toast changed (it told Tom chapter 17 was still being built).

## 2026-10-28: Contraction Fix Baker dialogue merged (255 clips) and Deedee's new dialogue voice
- Tom sent dialogue-pending.json: 255 clips (Deedee 120 in her new picked voice "AoT Deedee (picked 2026-10-28)", id 9UrcxKDUU0pvcnFhdfTU; plus the 135 contraction re-bakes). Merged with tools/clip-audit/merge.py: each clip to the file that holds its key (or the file its removed clip came from); 3 new lines to the new data/voice/dialog-ch28.js (listed last in DIALOG_CAST.files, also carries the updated voice settings). Silence trim, cast and speaker effects (Boppy 0.9, monsters), Grace shrink once. Largest file 14.6 MB.
- Audit of the 135 re-bakes (speech recognition): 130 say exactly the screen text. 5 still read the long form, so their screen text now matches the audio (no re-bake): "Why is everybody walking...", "Why did I ever flip them?", "Somebody up there is playing music", "Why is my jar in the middle...", "Something down here is collecting them."
- Result: chapters 1 to 10 and Nine Scoops have no dialogue line without a clip (re-harvest: only Part 2 lines remain, 612). Dialogue clips 2118 to 2256.
- Still to come from Tom: voices.json from the baker's Battle tab (57 lines: Deedee's 44 in the new voice, TNB's 8 new moves, 5 contraction fixes). Until then Deedee's battle lines play her previous voice.
- Tests: tools/smoke.py FAILS: []; harvest page load with all 18 dialogue files, no page errors.


## 2026-10-28: Part 2, Chapter 16 "The Amber Eclipse"
- Walking into the Square after chapter 15 starts chapter 16: the family photograph. Marlowe at a box camera, Vance's voice, the lens charging, the amber beam at Grace and Rose, Deedee and Boppy stepping in front (arms locked, "Fifty-one years." / "...And counting.") and turning to stone. Vance "helps with Marlowe's notes". Grace takes Rose and runs for Cab 7.
- Marlowe Transformed (level 23, `marlowe16`): Shake-style boss for Tom, Amy, TNB and Nara. Overexposure on everyone every third turn (telegraphed), Grey Notes and an eclipse shield below half HP (2 Chatter, Splash or Kinetic hits or a Tombo break it, otherwise Total Eclipse). No kind route.
- No victory fanfare: no jingle, no cheers, no level-up chime (sound is off from the win to the end of the aftermath); only a short wind sound. Then the glass comes down and Long Island is sealed in a snow globe that Vance reels up. The chapter ends at the Angel City cab stand.
- New screen effects (beam, grey wash, flash, snow globe), new map objects: stone statue of Deedee and Boppy, Vance's camera on a tripod. Deedee and Boppy are absent from their house once they are stone.
- Chapter select has chapter 16 (level 21 start, chselSixteen). Chapter 16 party rules: Tom, Amy, TNB, Nara.
- Files: see docs/C16-DONE.md. Tests: tools/ch16_test.py all ok; smoke, bg_test, ch11 to ch15 re-run.
- Lines to bake (all new dialogue is unvoiced until Tom bakes it): docs/dialogue-scripts-ch16.json (84 lines; Vance needs a new voice cast entry). No existing spoken line was reworded.

## 2026-10-28: Amy less bossy in Part 2
- Tom: "why is Amy so bossy". Cause: Part 2 scenes (ch11 to 14, written after the Amy rewrite) used her as the drill voice for every fight tip ("Up, everybody. Walk it off.", "Positions.") and slipped back to "thirty-one third graders" (canon: Special Ed, her room of twelve).
- Rewrote 10 unrecorded Amy lines (no clips lost): fight tips are now "Everybody okay? Good. ..." and "Here's the plan. ..."; "please" on the colors; "I teach kids for a living". Files: data/scenes-p2.js, scenes-ch12.js, scenes-ch13.js, scenes-ch14.js.
- Left as is (recorded, approved in the rewrite): "Up! Everybody up! Walk it off. Hydrate. We go again." Known slip, recorded: travel stay "thirty second-graders at eight".
- (Baker) Contraction Fix Baker v5 adds a Deedee voice picker (Tom wants to choose her voice): plays 3 clips of her current voice, designs 3 options from the recast brief (editable), Use this voice saves it to ElevenLabs (if the account is full it offers to delete the old Deedee voice; recorded lines keep playing), or paste a library voice ID. All 164 Deedee lines and the saved voices.json / dialogue-pending.json use the picked voice; takes made with another voice stop counting. Merge: her new voice_id rides in both files.
- (Baker v6) Tom: every designed Deedee option sounded like a muffled phone line. Cause: Voice Design at guidance 5 with a niche prompt (age plus regional accent) trades audio quality for prompt accuracy (ElevenLabs docs). Fix: prompt now opens with "Perfect audio quality, studio-quality recording", guidance 3 (slider), quality 0.9, 192 kbps with fallback, "seventies" dropped from the brief, optional "start from her current voice" (reference audio). Added Voice Library search (real recorded voices, default New York, female, old) with Use this voice (adds it to the account; same slot-free flow).
- Rule for new Amy lines: calm, specific, warm with the girls; competitive only at Tom, the clock, herself (claude/amy-dialogue-review.md).
- Tests: smoke, ch12, ch13, ch14 FAILS: []; ch11 test ran clean.

## 2026-10-28: Part 2, Chapter 15 "The Eight-Seat Dinner Table"
- Walking into the Rivituso house after chapter 14 starts chapter 15: all eight sit at a long dinner table (a table object that exists only while the chapter is live). Deedee and Nara's crust, TNB and Boppy's pepper contest, a toast, and then HUSH-9 Final Form crashes dinner.
- HUSH-9 Final Form (level 21, `hush9final`): Shake-style boss. Dead Air on everyone every third turn (telegraphed), Hushlings and a hush chip below half HP (2 Chatter or Kinetic hits or a Tombo break it, otherwise Total Silence). Kind route: PULL UP A CHAIR x3. BENCH CALL swaps the fourth slot with any of Deedee, Boppy, TNB or Nara (the fight gets all four as reserves).
- New dining room battle picture bgs/18-dinner-table.png, used while HUSH-9 Final Form is in the fight.
- Rewards: HUSH-9's Chip keepsake, and Family Finish ff3 Fifty-One Years & Counting (Deedee, Boppy, Tom) unlocks. Chapter select has chapter 15 (level 20 start, chselFifteen).
- Files: see docs/C15-DONE.md. Tests: tools/ch15_test.py all ok; smoke, bg_test, ch11, ch11b, ch12, ch13, ch14 re-run.
- Lines to bake (all new dialogue is unvoiced until Tom bakes it): docs/dialogue-scripts-ch15.json (79 dialogue lines and 14 PULL UP A CHAIR battle lines). No existing spoken line was reworded.

## 2026-10-28: Part 2, Chapter 14 "The Rikers Wall of Rivituso Row"
- Chapter 13's ending now flows into chapter 14 on Rivituso Row. TNB and Nara stay to hold the breach; Grace and Rose rejoin (party: Tom, Amy, Grace, Rose). Deedee stands on the porch in amber, looping a rhubarb crisp; Rose eating it breaks the loop (amber is warmth that got stuck). The neighbors on the Row (Gus, Bean) are in amber until the chapter ends.
- Warden Boppy (level 20, `warden`): cannot be beaten. Every hit makes the gold armor hum brighter (heals him, costs Warmth, "ARMOR UP"). DEFEND (Tom) warms him, favorites are PEP TALK, DANCE, SILLY and ff2, and ▼ Bag, MAKE HIM LAUGH (3 jokes) is the Un-Grump route. His calm waits for Deedee's call from the porch ("ROBERT."), whose MOON & BACK heals the party 60%; she calls at the latest on his fourth turn. Gate Slam on everyone every third turn (telegraphed), otherwise gentle numbers.
- After: the plate melts, "I just didn't want to get too old to keep you all safe." / "You big nut. We keep each other safe." Unlocks the Tombo **Nobody Gets Past Us** (`boppy2`) and the Warden's Bucket keepsake. Boppy and Deedee go back inside; the Row thaws.
- Chapter select has chapter 14 (`chselFourteen`). Chapter 13's armored Boppy now stays on the Row through chapter 14 (`data/scenes-ch13.js`); the chapter 13 "chapter 14 is coming" toasts were removed.
- Files: see docs/C14-DONE.md. Tests: tools/ch14_test.py all ok; smoke, ch11, ch11b, ch12, ch13 re-run.
- Lines to bake (all new dialogue is unvoiced until Tom bakes it): docs/dialogue-scripts-ch14.json (101 dialogue lines and the 8 MAKE HIM LAUGH battle lines; Boppy and Deedee use their existing voices). No existing spoken line was reworded.

## 2026-10-28: New battle backgrounds (17 pictures)
- Tom's new pixel-art backdrops replace the code-drawn ones in battle: 17 PNGs (576x324, opaque) in `bgs/`, named `01-pond-town` to `17-oak-crown-canopy`. `engine/battle-draw.js` now has `BG_FILES`, `battleBgKey()` (picks the picture from the map's ground, or the Battle Lab `B2.lab*` flags) and `drawBattleBackdrop(t)`.
- Map to picture: pond = every Long Island map without its own look (town, row, hollow, marsh, pier, sundial); griffith = Griffith Park plus Downtown and Jefferson Park; classroom = school and schoolyard; cafe; stacks; readroom; club; dome; barn; boiler; term; gate; lot = Studio Gate and Backlot; stage = Soundstage 7 and Stage Set; park; oak; canopy.
- The old code-drawn backdrops stay in `engine/*-render.js` and the pond code as a fallback only while a picture is still loading.
- Lost on purpose: the small animations (clock hand, lamp flicker, fireflies, drifting SHH) and the story-state variants (Moon in the Dome, warm Car Barn, Flight 0 leaving Gate Zero). Pictures are static.
- New test: `python3 tools/bg_test.py` jumps to every battle map, starts a real battle and saves `tools/shots/bg-<map>.png`.

## 2026-10-28: Popcorn Jump couch no longer overlaps Tom and TNB
- The couch's rolled arms were drawn in front of Tom and TNB and covered parts of their bodies (Tom's left fist). All couch pieces now draw behind them (`engine/battle2-kind.js`, `couchBack` plus `couchFront` in the back scene).

## 2026-10-28: TNB existing-move feedback (Existing Moves Lab)
- Mug Toss: smaller mug (scale 3.2 to 2.0) with a detailed redraw (speckled clay, glaze drips, rim and inside, handle, sticker, foot ring).
- WARDROBE: detailed rack (steel tubes, slat shelf with shoes and a hat, casters, marquee sign with bulbs) and five costume pieces on wood hangers (blazer, dress, hoodie, striped shirt, trench coat). The costume that drops on the friend is the detailed blazer.
- Dad-Joke Pottery replaced by **Throw Down** (key `dadjoke_pottery` to `throw_down`, same numbers: 2 VP, hybrid, 1.4x, +15% crit): a detailed electric pottery wheel, he throws a bowl, the wheel runs away, the bowl flies off and lands on the enemy's head, then the pun.
- Kept: Metro Tap Card, Slasher Jump Scare, Kiln Door Policy, Baxter Street Bomb. Tombos untouched.
- Lines to bake: `tnb.throw_down: "I was throwing a bowl. Literally. ...Wait, come back, I have more!"` (replaces the dadjoke_pottery clay pigeon line; its old clip is dead).

## 2026-10-28: Part 2, Chapter 12 "Welcome to Jefferson Park, Girls"
- Gate Infinity now starts the chapter (LA opens). Jefferson Park: Tom's house (Bready Mercury, photo wall), TNB's Loft (Rose's bowl, Amy and TNB bond), Monochrome Marlowe greys the block and sets neighbors in amber, Doña Carmen thawed by a warm pupusa, Casa Alvarez thawed by Amy's laps (unlocks Tombo ff2 Run With Us, Mommy!), boss Gridlock Prime, colour returns, Marlowe hints at Long Island, Green Light keepsake.
- New couches and benches (Tom's couch, Parkway bench) swap the front party. Chapter select now has chapter 12.
- Files: see docs/C12-DONE.md. Tests: tools/ch12_test.py all ok; smoke, ch11, ch11b re-run.
- All new dialogue is unvoiced until baked (docs/dialogue-scripts-ch12.json).

## 2026-10-28: Part 2, Chapter 11 second half (C11b): Lost and Found, Julian Vance, FINAL CALL, the ending
- Lost and Found (concourse door, optional): the Lost Luggage lore, the ledger (UNCLAIMED 4,017,311, CLAIMED 0), a gold-ink card "FOUND: ONE TOM. HELD FOR PICKUP. NO RUSH." Rewards: the Gold Clock Tag keepsake and Airplane Pretzels.
- Gate Infinity: Julian Vance (the man in the long coat) explains the pause, offers everyone "the good part, forever", Tom says no, Vance makes the last announcement and FINAL CALL unfolds beside the door.
- FINAL CALL boss (level 15, `finalcall`): a departures board on robot legs. Reuses the Last Call rules (`b2BossOpen`, `b2CallTurn`, `b2CheckPhase`): it calls one person per turn, GATE CLOSED if they do not act, Tom can DEFEND. Below half HP two Lost Luggage roll in and it braces for CANCELLED (2 Kinetic or Sparkle hits, or any Tombo). Kind route: ▼ Bag, LET IT FLY x3.
- New move BENCH CALL (`engine/benchcall.js`): ▼ Bag in the FINAL CALL fight. Costs the caller's turn; the fourth member (not Tom, Grace or Rose) steps out and someone from the bench steps in and acts almost at once. Anyone who steps out can be called back.
- Ending: coin number nine, the board flaps, Gate 00 shows LONG ISLAND: CLOSED (the dome goes amber), Amy calls Deedee and it rings and rings, CHAPTER 11 COMPLETE, autosave, a toast that chapter 12 is still being built. Gate Infinity afterwards: LOS ANGELES: NOW BOARDING.
- Files: `data/scenes-p2.js`, `data/p2-monsters.js`, `data/p2-battle.js`, `engine/battle2.js` (finalcall branches, `B2_FINAL`, `B2_FLY_LINES`), `engine/benchcall.js` (new), `index.html`, `tools/ch11b_test.py` (new).
- All new C11b dialogue and the FINAL CALL kindness lines are unvoiced until Tom bakes them (`docs/dialogue-scripts-ch11.json` lists them).
- Tests: `tools/ch11b_test.py` (Lost and Found, Vance, boss with a BENCH CALL swap, win, ending, amber dome; no faults), `tools/ch11_test.py`, `tools/smoke.py` FAILS: [].

## 2026-10-28: voice clips that said the long form of an on-screen contraction
- Tom: clips still say "she is" where the screen says "she's" (Olivia's leaf line). Cause: the 2026-10-27 contraction re-record keyed clips under the contracted text, but ElevenLabs read the old, uncontracted scripts.
- Audit: all 991 clips whose text has a contraction were transcribed with speech recognition (Whisper base.en, offline) and compared word by word. 132 clips said the long form (131 dialogue, 1 battle). Tools and method: `tools/clip-audit/README.md`.
- Wording bugs from the contraction pass fixed in game text (24 lines): "X'll not" became "X won't", "X'd not" became "X wouldn't", "I've seven gold coins" became "I have seven", "Whoever it's has" became "Whoever it is has", "She won't let's open it" / "She let's hold it" became "let us".
- 138 clips removed (the 132 plus 6 whose wording changed), so those lines are silent until re-baked, per the exact-match rule. Dialogue clips 2253 to 2118; battle clips tom 2, tnb 1.
- Re-bake: `Contraction-Fix-Baker.html` (135 dialogue, 3 battle lines). Every script is the original hand-written one (all 138 recovered, every tag kept); only the words that differ by a contraction were changed. Merge: dialogue with `voice-merge-dialog.js` (each clip goes back to the chapter file it came from; Grace shrink and Boppy deepen as usual), battle with `voice-merge.js`.
- Tests: `tools/smoke.py` FAILS: []; page load with all voice files, no page errors; Olivia's leaf line has no clip, untouched lines still play.
- Same baker now also re-recasts Deedee (Tom: keep every emphasis): all 164 Deedee lines (44 battle, 120 dialogue). 130 use the original hand-written scripts (mostly the 2026-10-26 Deedee re-voice files), 34 that never had one got new hand-written directions; every on-screen CAPS word is in the script; banned frail words stripped from tags; "warm Long Island accent" goes inside every bracket and her direction leads the first. Voice: the current Deedee voice (AoT Deedee, Long Island, 2026-10-28).
- Chapter 8 check (Tom heard missing clips): of 120 chapter 8 scene pages, 86 have clips, 17 are Nara or objects (silent by design), and the other 16 plus 9 Jefferson Park NPC lines are the contraction-fix removals, all already in the baker. Added 10 battle lines that never had a clip (TNB's 8 revamp moves incl. coffee_run, tom.tombograce "Fine.", grace.tombo short line) with hand-written directions (`tools/clip-audit/extra-battle.json`). Harvest tool: `tools/clip-audit/harvest.py` + `miss.py` (every unrecorded line, tagged by chapter). Part 2 chapters 11 to 14 have about 480 unrecorded lines; not in this baker.

## 2026-10-28: Part 2, Chapter 11 "The Layover Between Worlds", first half (C11a)
- Part 2 now opens for real: the Rivituso house morning (Deedee's crisp, Boppy's gold card, the boarding pass buzzing), then Flight Zero's cabin (Rose and Grace stowaway, Amy sprints in, the sky tears), then Terminal Infinity.
- New places: Flight Zero (`flightzero`), Gate 00 (`gate00`, two glass domes for Long Island and Los Angeles), the Endless Concourse (`concourse`, Gates 1 Boston to 9 Miami, all paused).
- New monsters: Lost Luggage, Red-Eye, Standby Sprite (a story fight at the checkpoint; WAIT LIST pushes someone down the turn ribbon).
- TNB and Nara arrive by the jet bridge. Unlocks the Sleepover at Tom's Tombo (`tombo:ff1`; Tom, TNB, Grace, Rose in front).
- New system, the bench (`engine/bench.js`): the fighting party stays 4. Anyone else along waits on the bench and walks with the party. Gold Boarding Gate benches swap who is out front. The bench rides along in saves.
- Gate Infinity and the Lost and Found stop at "Chapter 11 continues in the next update" (C11b: Lost and Found, Julian Vance, FINAL CALL boss, ending).
- Files: `data/p2-monsters.js`, `data/p2-battle.js`, `data/maps-p2.js`, `data/scenes-p2.js`, `engine/infinity-render.js`, `engine/bench.js`, `engine/story.js`, `engine/chapter-select.js`, `index.html`, `tools/ch11_test.py`. Load order: p2-monsters after terminal-monsters, maps-p2 after maps-le, p2-battle after battle2-data, infinity-render after terminal-render, bench after story, scenes-p2 after scenes.
- Tests: `tools/ch11_test.py` plays the chapter jump, cabin, arrival, concourse, Standby Sprite fight, TNB and Nara scene, bench swap, save and load.

## 2026-10-28: Aunt Ellie gets her own house on Rivituso Row; TNB revamp closed
- Tom approved the four reworked TNB moves (Foraged at Dawn, Tasting Menu, Just Around the Bend, Coffee Run). The TNB revamp is closed.
- Aunt Ellie moved out of the Rivituso house into a new house of her own on Rivituso Row (map id `elliehouse`, top left, purple roof, label ELLIE). Her room has a hat shelf, writing desk, wardrobe, tea tray, orchid and umbrella stand, all with Ellie jokes. Her spoken lines are unchanged, so every baked clip still plays.
- Chapters 9 and 10 still happen at the Rivituso house: while `ELLIE_VISIT` matches (chapter 9 from the invitation until the chapter ends; chapter 10 from the boss win until Sunday dinner), her house copy is `away` and a visiting copy stands in the Rivituso house. Outside the story the visiting copy is hidden (`syncAwayNpcs()` now also runs once at load in `data/scenes.js`).
- Row map: tag now says three houses; the community garden and corner sign moved to just below the road (two trees removed to make room); the family notice sign gained "Opinions at Ellie's".
- Known mismatch: Dot's lines still count "ten doors" (spoken, baked). Adding a house makes it eleven; fixing it needs a re-bake, so it is left until Tom asks.
- Files: `data/maps-le.js`, `data/scenes.js`, `docs/CANON.md`. Tests: `tools/smoke.py` FAILS: []; Ellie placement checked in demo, chapter 1, 9 (before, during, after) and 10 (before, during, after); screenshots of the Row (portrait and landscape) and her room.

## 2026-10-28: TNB move tweaks from Tom's Move Lab feedback
- Foraged at Dawn: gold-rimmed fine-china plate, glossy pea, herb-oil swoosh, microgreens, flower, glint.
- Tasting Menu: banquet tables (linen drape, gold trim, candle, rose vase); the pea courses are now plated food (seared scallop, beet rose, chocolate dome with gold leaf).
- Just Around the Bend: the trail now climbs a clear LA hill (Observatory on top, Hollywood sign, downtown skyline, palms, chaparral).
- Status: Green replaced by Coffee Run (key `coffee_run`, same numbers: 3 VP, ally, heals 20% + 2 VP, kind on a monster). Files: `engine/tnb-moves.js`, `data/battle2-data.js`, `data/abilities.js`, `data/lines.js`, `data/battle-icons.js`, `docs/MOVE_KEYS.md`, `docs/CANON.md`.
- Lines to bake: `tnb.coffee_run: "Coffee run. I got you the usual."`.

## 2026-10-27: purged dialogue audio for lines that were since replaced
- Tom asked for unused, replaced dialogue to be purged. Audit method: every baked clip's exact text was checked against every string the game source can still produce (plain strings, templates, `{n}`-style placeholders, concatenations). Scenes and `LINES` categories were also checked: every scene is still started somewhere and every `LINES` category is still used, so the dead material was audio only.
- Removed 139 clips whose text no longer exists anywhere: 87 battle clips (amy 12, boppy 15, deedee 3, grace 4, rose 17, tnb 19, tom 16, nara 1) and 52 dialogue clips (dialog-ch1 to ch8, ch10, ch21 to ch23). They were old audio for lines since reworded or contracted (for example "Good job, babies." became "Good job, girls.", old rose pogo and tickle shouts, Amy's "Thirty second-graders" lines). The 7 tnb clips are the old lines of the seven moves the TNB revamp just replaced (quick_change, continuity_pins, rush_hour_racks, wrap_ult, cone_six, curb_appeal, fix_wobble). Also removed 9 matching bake-script notes in `voices.*.scripts` of `data/voice-clips.js`.
- Result: battle clips 550 to 463, dialogue clips 2305 to 2253 (about 8 MB of audio). 0 live clips lost (every surviving clip is byte-identical to before); 0 orphans remain on re-audit.
- Kept on purpose: monster "Round {n}." lines and other templated dialogue (looks unmatched in a plain text search but is live), and `demo/` (reachable from the title screen).
- Not removed: lines that are live but now have no clip (reworded, waiting on Tom's re-bake). Those are silent, not dead.
- Tests: `tools/smoke.py` (tnb,nara) and `IDS=grace,rose` FAILS: []; page load with all voice files: no page errors, no 4xx, clip counts 463 and 2253.

## 2026-10-27: TNB ability revamp (seven moves, same numbers)
- Tom's direction: rebalance TNB's kit away from wardrobe toward horror, longboarding, pottery plus three new themes (PM in training, Michelin-star service, hiking) and one move for his sister Jojo (disc golf). Effects unchanged; only names and animations.
- Replaced (old key -> new key, `data/abilities.js` p cards, `data/battle2-data.js` o3 rows, `data/lines.js`, `data/battle-icons.js`): quick_change -> foraged_at_dawn (Foraged at Dawn), continuity_pins -> dont_split_up (Don't Split Up), rush_hour_racks -> scope_creep (Scope Creep), wrap_ult -> tasting_ult (Tasting Menu), cone_six -> around_the_bend (Just Around the Bend), curb_appeal -> round_with_jojo (Round with Jojo), fix_wobble -> status_green (Status: Green). Kept: Mug Toss, WARDROBE, Metro Tap Card, Slasher Jump Scare, Dad-Joke Pottery, Kiln Door Policy, Baxter Street Bomb.
- Animations: new IIFE `t6_` at the end of `engine/tnb-moves.js`; every move ends under 5 s. The seven new spoken lines have no baked clips yet (synth voice until a bake).
- Lesson: a scene's `s.t` starts at `-delay`, so any absolute move-ms timings inside a scene must be shifted by its creation time plus delay (the Gantt chart and the bubble words were late or invisible until this was fixed). `ST.group` has no `mid`; use `(top+base)/2`.

## 2026-10-27: Ymamot Creation timing, and the game can no longer freeze on one error
- Tom reported a freeze after Ymamot Creation (Tom + Amy) and off animation and voice timing. The freeze could not be reproduced in Chromium (all 58 monster types, the real fight with victory card, 8 turns after, 4x slower CPU), so it is treated as an iPhone-only fault and the engine was made fault-proof instead (below).
- Timing bug found: Amy's clip is 5.1 s and Tom's is 4.2 s, but the scene gave them about 1 s each, so they overlapped each other and ran past the end of the move. The scene is now timed to the speech inside the clips: ingredients fly on Amy's words (ketchup, pickles, cereal, sock), the title card lands on "Ymamot Creation!", Tom's line starts 160 ms after Amy finishes, the sling and SPLAT land on "We were six". Spans that wait on a voice scale with battle speed, so it also holds at 2x (measured within 10 ms at 1x and 2x). Both clips are preloaded at the first step. Messages moved to match. No lines were reworded, so no re-bake.
- Fail-safe: `nextStep` no longer stalls the whole move when a step throws; `RFX.draw` drops a scene that throws; `frame()` and the AUTO dialogue loop guard every stage so an error cannot stop the loop. New `gameFault()` shows "Hiccup in <where>: <message>" for 4 s and records `window.__faults`.
- New tools: `tools/speech_windows.py` (speech start and end inside a baked clip), `tools/fault_test.py` (fault injection).

## 2026-10-27: repo brought up to v335; GitHub is now the live app
- Decision (Tom): the GitHub Pages site is the real app; the claude.ai artifact means nothing to him. CLAUDE.md rule 8 and docs/WORKFLOW.md rewritten: finished work goes to `main`, the artifact is a scratch copy.
- Every changed file copied from artifact version `1793146014-5ae2` (v335): 59 files changed, 22 added. `index.html` had its wrapper stripped; `demo/` untouched (already identical).
- Brings the live site the new title screen (START NEW / LOAD / small ADMIN, Part / chapter lists under START NEW, BONUS under it), Rose Mode picture menus (`engine/battle-pictures.js`, `data/battle-icons.js`), the Amy, Deedee, Boppy and TNB pose files, `data/kid-sprites.js`, the Nine Scoops and level-up music (`music/ns_*.mp3`, `music/levelup.mp3`), and the contraction re-record (dialogue voice files `data/voice/dialog-ch1..8, 21..27`; 2305 dialogue clips).
- Voice files in the artifact are the source of truth for this push: dialogue clips now live in `dialog-ch25.js` to `dialog-ch27.js` (old copies were removed from `dialog-ch1..8, 21..24`), and `data/voice/<character>.js` hold the re-recorded battle clips.
- Tests: `tools/smoke.py` (tnb,nara) FAILS: []; title screen checked in portrait and landscape (START NEW / LOAD / ADMIN, then PART 1 / PART 2 / BONUS / BACK); all 24 voice files load with no 4xx and no page errors.

## 2026-10-27: repo brought up to live v1793076136-c38f, plus the title theme
- Every changed file copied from the live artifact (43 files). `index.html` had its artifact wrapper stripped. `demo/` and the unchanged voice files untouched.
- New since the last push: baked music (31 tracks in `music/<id>.mp3`, played by `engine/music-clips.js`; the synth song is the fallback), tap an enemy to target it (`engine/battle2-ui.js`), dialogue AUTO (`engine/dialog-auto.js`, T key), `data/contraction-alias.js`, and edits to abilities, battle2-data, lines, maps, scenes, story, travel, tom-moves and the monster files.
- `data/voice/grace.js` lost one stale clip (`cartwheel`, "Cartwheel! Watch my toes, Ta-Ta!"); the line was reworded in `data/lines.js`, so that clip no longer matched anything.
- Title Theme added: `music/title.mp3` (30 s loop, 96 kbps, -20 LUFS, from Tom's music.json). `MC_TRACKS` has `title`; `clipWanted()` returns it while `splash.active` (title, chapter select, Battle Lab menu) and no fight is on. Tested: loads, plays on the title screen, hands over to the battle track in a fight.
- Picked up from a later artifact version (`1793076136-c38f`): Rose Mode opens dialogue with AUTO on (`engine/dialog-auto.js`) and Pockets-screen null guards for unknown item ids (`engine/menu.js`).
- Not in the track list yet: flight, level-up jingle, Nine Scoops bonus chapter.

## 2026-10-26: repo brought up to live v280
- Every changed file copied from the live artifact, version `1793064753-9a63` (v280). 23 files changed; `demo/` untouched (frozen). index.html had its artifact wrapper stripped as before. Smoke test passes (grace,rose); title screen checked.
- New since v266: Nine Scoops bonus chapter 21 (data/bonus-nine-scoops.js, data/voice/dialog-ch21.js, BONUS button on the title screen), voice merges (tom, grace, rose, boppy, tnb), and edits to abilities, battle2, story, travel, intro, menu, splash, grace and rose moves.

## 2026-10-26: repo brought up to live v266
- Every file copied from the live artifact, version `1792993371-6dc3` (v266), voices and `demo/` included. Smoke tests pass (tnb,nara and grace,rose).
- Since v252: account saves (cloud-save.js), Grace's Cartwheel rebuild (data/grace-wheel.js, new), menu and dialog box layout, skill button labels, volume slider, Tom/TNB line edits, and the voice recast so far (Grace = Ivy, Amy Long Island accent, Boppy pitched up one semitone). Rose keeps her voice.
- Workflow change: the artifact is now the working copy; push to `main` only when Tom asks (CLAUDE.md rule 8, WORKFLOW.md steps 4 and 5).

## 2026-10-25: repo brought up to live v252 with full voices
- Real voice files added to the repo (identical to the artifact), so GitHub Pages plays the full game. Pages URL: https://trivituso81.github.io/adventures-of-tom/
- Source exported from the live artifact, version `1792983007-0e46` (v252). Voice audio and `demo/` left out (see `docs/VOICE.md`).
- v252 (last live change): difficulty retune. `B7_DIFF` in `engine/feel.js` and `b2FoeUnit`/`b2Delay` in `engine/battle2.js`. Rose mode: monsters hit x0.5, monster HP x0.75. Grace mode unchanged. Director mode: hits x1.6, monster HP x1.3, monster turns x1.25 faster, plus shield, Tombo and snack rules. If Tom says Grace mode is too easy, change the base monster POW in `data/battle2-data.js`, not the modes.
- v251: all 25 Director's Cut voice lines baked and live.
- v250: `rose.dc1` is now "No! It's Lamby!".
- Director's Cuts built so far: all tier 1 and tier 2, plus `grace3_dc` (Shadow Squishy) and `rose3_dc` (Lamby Night-Light). Still to build: `amy3_dc`, `deedee3_dc`, `boppy3_dc`, `tnb3_dc`, `nara3_dc`, then the four Family Finish Director's Cuts.
- All 21 Tombos and all four Family Finishes are animated.

## Lines to bake

- `tnb.throw_down: "I was throwing a bowl. Literally. ...Wait, come back, I have more!"` (new; replaces `tnb.dadjoke_pottery`).
- `tnb.coffee_run: "Coffee run. I got you the usual."` (new).

Add any new or reworded spoken line here as `character.kind: "text"` (and the old text if reworded).

## Known gaps

- Barrier events not built: Distance (`tnb3`), Fear (`nara3`), Exhaustion (`ff2`), Aging (`ff3`).
- Remix versions of abilities, and "Polish rank 2" flourishes, are not built.
- Tier 3 Tombos and Family Finishes have no story unlock flag yet (chapters 11 to 20 do not exist); they play in the Battle Lab only (`B2.tombos='all'`).
- Cosmetic: some status pops crowd Ultimate words at the heal moment. Stale comments in `engine/battle2-traits.js` line 13 and `engine/battle2.js` line 609.
- `data/lines.js` `nara.low` second line "Whimper. Tom?" contains a word (Nara only barks). Left alone because changing it needs a re-bake.
- First launch on a phone may be slow with all voices loaded; in the live artifact the answer is to fetch clips on demand. Not relevant to the silent build in this repo.

- C11b follow-up: Rose Mode picture UI now has a BENCH CALL icon (BI_ART x_bench, bpBag branch), so the bag row shows a bench picture instead of crashing.

## Chapter 13 (Sub-Rail)
Lines to bake: all dialogue in data/scenes-ch13.js (listed in docs/dialogue-scripts-ch13.json), plus B2_BREAK_LINES in data/ch13-battle.js and the Drill Worm and Hushling battle lines. Speakers HUSH-9 and Drill Worm need a voice mapping in data/dialog-cast.js first.

## Chapter 18 (2026-10-28)
Reworded spoken lines (need re-bake; update dialogue-scripts-ch2/ch6/ch8.json first):
- Olivia (revisit): "Michael! Isla is near the curb. Okay. Never mind. Thank you, babe."
- Michael (first visit): "Hey, Tom. Good to see you. Please ignore the cracker crumbs. They live here now."
- Michael (revisit): "I heard Olivia say Michael. Whatever it is, I'm on it. Isla, that is not a snack."
- Michael (revisit 2): "Yes, Olivia. Heard you. Handled. Lachlan, we do not lick the fence."
- Nara chapter 6 scene line: "Zero car keys and one very sticky toddler. Wait. Keys. Gutter. Right."
- Olivia chapter 8: "...Michael is guarding it with his life."
- Michael chapter 8: "Cold lasagna, one diaper bag, and Isla eating the tablecloth. We're thriving."
Engine: battle backdrop for glass-tower maps now uses the code-drawn tower (also fixes ch17); intro.whiteout added for a white flash fade.
Not ported from the artifact on purpose: its contraction edits to Mr. Washington, ttlever and other ch8 lines.

## Chapter 19 (2026-10-28)
No existing spoken lines were reworded. New dialogue is unbaked: docs/dialogue-scripts-ch19.json. New speakers needing cast entries in data/dialog-cast.js: Oblivion Censor, Dead-Letter Office (narration), Mrs. Alvarez, Floor 59 (narration); Vance, the Archivist and Floor 60 are still owed from ch16 to ch18.
Engine: engine/benchcall.js now gives BENCH CALL reserves in the Twin Lenses fight (ch17 promised it but had none) and the Censor fight. tomBack() benches Amy/TNB/Nara if Tom's return makes five. SOLO_SKIN lets a map draw the player as one member (memory rooms). Nara's Frantic state also applies with no Tom in the party.
Known: Censor balance checked by script only (tune B2_FOES.censor in data/ch19-battle.js).

## Chapter 20 (2026-10-28)
No existing spoken lines were reworded. New dialogue is unbaked. New speakers needing cast entries in data/dialog-cast.js: Stillness Core and Forever Engine (narrator), Vance (reused), Oblivion Censor, Sal, Sol, Nara. Spoken battle lines for the relays and the seven care acts reuse existing keys. Older owed: 7 Michael/Olivia re-bakes, Vance, Archivist, Floor 60/59, Mrs. Alvarez, Dead-Letter Office.
Engine: BENCH CALL now works in the Leviathan and Julian fights (B2_BENCH_FIGHTS), near free in Julian's.
Known: Dot says "ten doors" (should be eleven); ch15 QUIET glyphs; ch17_test pre-existing failure; ch18 flaky roster check.

## Rose extra poses and painted shoulder ride
- 12 new painted battle poses (boop, boopBack, raspberry, boo, tiara, hug, balance, lookout, throwWind, throwRel, sitStory, sitTea) baked from Sheet A into `art/chars/rose-battle-x.webp`; wired into Boop, Silly, Boo!!, Lamby Hug, Bedtime Story, Floor Is Lava, Lookout Lamby.
- Painted shoulder ride (battle and overworld) replaces the old pixel ride; seat anchors in `tools/sprite-bake/rose-ride-anchors.json`.
- Overworld extras (crouch, jump, wave, hold) baked into `ROSE_OW.extra`; no scene uses them yet. Tiara, tiara-free Macaroni Crown, sitTea and throw poses for Ms. Cathy are unused so far.

## Rose Boop: painted jab
- Boop now uses three painted frames (jab0 wind-up, jab1 extended index finger, jab2 recoil) from `tools/sprite-bake/src/rose-jab-v2.png`, lunging so the fingertip lands on the enemy's nose at the hit. The old drawn-on arm (`rf_poke`) is no longer used by Boop.

## Grace sheet B poses (2026-10-29)
Painted frames for her level-5 moves (src tools/sprite-bake/src/grace-poses-b.png, baked by bake_grace_poses.py into art/chars/grace-wheel.webp): hs_flip, hs_land, aerial, db_tuck, db_stick, p10. Handspring, Beam Dismount and Perfect 10 now draw them (engine/battle-draw.js, gw()); `aerial` is baked but not wired yet. Perfect 10 ends on the p10 pose (fx.p10).

## Squishy Delivery painted begging sequence (2026-10-29)
Sheet C (tools/sprite-bake/src/grace-poses-c.png) baked into the wheel atlas: sq_kneel, sq_hop, sq_pout, sq_gasp, sq_squeal, sq_joy. B2_TOMBO_ANIM.grace1 (engine/battle2-kind.js, GQ helper) plays kneel, hop, pout, kneel, gasp at the gift box, squeal on the landing, then a happy bounce. Falls back to the old kneel and celebrate frames if the painted set is missing.

## Sub-Rail tunnel painted plate (2026-10-29)
- Map `subtunnel` (The Transcontinental Sub-Rail, ch13) is now a painted plate: art/subtunnel.webp (36 x 12 tiles at 64 px, cropped from subtunnel_final.png, which came padded with 6 blank tiles each side), PLATES entry, plateMask and objects in data/maps-ch13.js. Tom sent two pairs; used the one with the grid.
- The map shrank from 48 to 36 wide to fit the art. West door (tiles 0,2 / 1,2) to the Depot, east door (34,2 / 35,2) to Under the Amber; Depot now lands at (2,3), the chamber lands at (33,3). Spawn (3,3). Monster spots moved onto the new floor (data/ch13-monsters.js).
- Walk: top platform, track bed, ledge, lower walkway, both stairs. The four cars block (upper two one row, lower two two rows), the wall face blocks. Objects re-laid: 5 mile signs on the lit wall panels, 4 cars, 2 coffee machines (red at 15, green at 23, the green one keeps the "last coffee" text), 2 cable bundles, 5 rubble piles (new: green flag pile, "CLAIMED FOR SOMEWHERE ELSE"), 2 lamps. The old "pointing east" lamp text now reads as a post lamp at the platform edge.
- Fix (engine/world.js buildArea): on ground 'sub' maps the wall pool covered the exit tiles, so the Depot east exit and Chamber west exit could not be walked into. Exits are re-opened after the pools.
- Test: tools/subtunnel_test.py (0 fails). ch13_test positions moved to row 10. Smoke, ch13, gate00, bg tests 0 fails.

## Painted enemies: Mudling, Skeeter Swarm, Pond Grump, Bog Toad, Log Lump, The Big One (2026-10-29)
- Six painted enemy sheets (tools/sprite-bake/src/foe-<id>-v1.png) baked by the new tools/sprite-bake/bake_foe.py into art/foes/<id>.webp and data/foes/<id>-hires.js, installed by data/foes/use.js (script tags added after nara-hires-use.js). Old rows kept as MONSTERS.<id>.sprite0.
- Battle: engine/battle2-ui.js b2FoeFrame shows the hurt frame when hit or dying and the attack frames in order during a lunge (2 for regulars, 4 for the Big One). New painted enemies reuse the same path.
- Test: tools/foes_test.py (0 fails); smoke 0 fails.

## Painted enemies, batch 2: Big Shake, Tar Pit Blob, Gridlock, Canyon Coyote, Ticket Flurry, Smoglet (2026-10-29)
- Same pipeline as batch 1 (bake_foe.py, data/foes/use.js). Big Shake is a boss (6 frames). New in bake_foe.py: thin gap second-row detection, DROP_GREY for stray specks (Tar Pit Blob). tools/foes_test.py now covers all 12 (0 fails); smoke 0 fails.


## Schoolyard painted plate (2026-10-29)
- Map `schoolyard` (Long Island Elementary, ch5) is now a painted plate: art/schoolyard.webp (24 x 18 tiles at 64 px, from 07_schoolyard_final.png), PLATES entry, plateMask in data/maps-le.js. The old paths and tiles lists are gone.
- Doors: the front doors are the exits at (11,3) and (12,3); the school's doors now land on the porch at (11,4) and (12,4). West edge (0,8) and (0,9) to the Square is unchanged. The playground gate is (17,9).
- Objects re-laid on the art: pillars (10,4) and (13,4) carry the two school wing lines, flagpole (9,5), school sign (15,5), bike rack (4,5), pickup bench (7,7), slide (20,7), swings (21,9), Minivan (2,10), Hatchback (5,10), Sedan (2,13), Snail stone (14,8, was Front walk sign), new Fence bench (19,12). Pruitt now stands at (12,9), Mr. Delgado at (8,14).
- Reworded game text (no clips depend on these): Swings now reads "Two swings. The left one squeaks..." and absorbs the tetherball line (the tetherball object is gone, the art has no reachable pole); the sign is now "Snail stone"; new Fence bench line.
- Chapter 5 ending moved to the aisle behind the minivan: Tom (6,12), Amy (5,12), Grace (7,12), Rose (6,13); the long coat appears at (7,16). Night glow moved to the doors.
- Route into the parking aisle is one tile wide at (9,10), (9,11), (8,11), (8,12), or around the island.
- Test: tools/schoolyard_test.py (0 fails). Smoke, ch5_school_test, bg_test 0 fails.

## 2026-10-29: Battle Voice Baker
- New tools/battle-baker/ (build.py, tpl_head.html, tpl_body.js, handscripts.txt, dump.js, merge.js, test.py, README.md). One page, tab per character, preview current clip, make new take, save only ticked lines. No game files changed.

## Justin smaller head (2026-10-30)
- Tom: Justin's head was proportionally as big as everyone else's, which on a 53 row body made it too big (20.7 rows vs Tom 16). bake_justin.py defaults are now --ratio 0.33 and --ratio-side 0.315 (head about 17 rows, only slightly bigger than Tom's). Rebaked art/chars/justin-ow.webp and data/justin-hires.js; atlas src carries ?v=head2 and the two Justin script tags in index.html carry ?v=head2 so cached copies are not mixed.
- Body height unchanged (53 rows, still taller than Michael 50 and Tom 42). tools/justin_test.py 0 fails, smoke 0 fails. The welcome screen cast and the Gregori house both use this same sheet.

## 2026-10-30: Everyone inside painted rooms 20% bigger
- Tom: now that the interiors are enlarged, the characters looked too small. One multiplier, `INTERIOR_ACTOR_BOOST` 1.2 in `engine/plate.js` `actorK()`, so inside any painted room the effective scale is 1.98 x 1.2 = 2.376. Every painted figure draws through `actorK()` (Tom, Grace, Rose, the recruits, family, and all townspeople), so NPCs are covered by the same change. Streets (1.2) unchanged.
- The talk gap (`talkGapFrame`, engine/town-render.js) widens indoors by the same ratio so bigger figures still do not touch. The heart over a kiss and the talk arrow already followed `actorK()`.
- Not scaled: the blocky fallback figures (`drawNpc`), which only appear outdoors, and monsters (they use `mscale`).
- Tests: `tools/rooms_test.py bakery grands` 0 fails and looked at portrait frames; `tools/smoke.py` FAILS: []. `amyhouse` and `tomhouse` "square plate" check fails before and after (pre-existing: not square plates).
