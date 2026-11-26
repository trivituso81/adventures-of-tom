## deedeeframes (2026-11-26): Deedee's new walking, feelings, talking, thinking and listening pictures are in the game

Card c-deedeeframes. Tom's words: "when you're done, do deedee next". Not seen on the phone yet. Same install as `roseframes`, `graceframes` and `tomframes4`.
- Sheets installed for Deedee only: `deedee-walking-sheet-v3`, `deedee-emotions-v4`, `deedee-talk-v5` and `deedee-listen-v3`. Not part of this card: her new hero painting (`deedee-hero-v2`, shown only in menus).
- Walking: `walk_splice.py deedee` and `heights.py write` (real height unchanged). Feelings and talking: `emotion_frames.py deedee`, `talk_frames.py deedee` (head x1.37 from the standing rule; looked at the strip, no torn hair), `bake_story_poses.py` (only Deedee's sets kept; the drift on Boppy, Ellie and Pip restored from main), and the dialogue faces.
- `deedee-listen-v3` is a 4 up strip like Rose's and Grace's: cell 1 (hands clasped) is `tk_listen`, cell 2 (chin on hand) is `tk_think`, because her only other thinking picture is the old one (`STRIP_CELL`).
- Her plain dialogue face is framed on the new walk frame (`WALK_FRAMED`); the hero ratios clipped her hair.
- Facing rows (`docs/pose-facing.tsv`): angry and proud now `f`, scared, answer and think `l`, listen `r`.
- `walk_sheet_frames.grid` now retries with a tighter merge distance when two neighbouring figures touch (Boppy's new walking sheet v5 read as 7 figures and stopped `pose-editor/manifest.py`). Boppy is the next card.
- Tests: `heights_test.py` and `pose_editor_test.py` pass; smoke has the two failures that already fail on main.

## vfxfight1 (2026-11-26): the Stage 2C library effects draw in a real Battle 3 fight, each at its own layer

Until now the 37 library effects drew only in the Battle Lab pass-1 review. A family move played in a real Battle 3 fight (NEW BATTLE, the story fights) now draws the effects its row names, from the moment its first hit lands, on the foe it hits and the member who plays it. New file `engine/b3-vfx.js` (loaded between `b3-stage.js` and `b3-play.js`); `b3PlayMove` arms one cue per move in every path (a staged move's body clip, a move's own clip, a two-person clip, the default strike, throw, cast and give, and a move with no hit), at the same second the move's own timeline reveals the hit, so the effect and the hit land together (a projectile such as the boomerang starts its flight before it, `P1_VFX_LEAD`). A move's row is its clip's measured row when it has one (`p1Meta`) and otherwise the Battle Guide manifest's row for that move id (`gtMetaMove`, new in `engine/guide-timing.js`). A foe's move never draws one.

The library's `layer` is honoured. `P1_VFX_LAYER` (end of `engine/vfx-library.js`, checked against the library file by the test) puts each effect at its point of `b3Draw`: `ground_decal` and `behind_units` after the floor's hazards and before the units, `unit_overlay` after the last unit, `foreground_sweep` after the stage's own front pieces, `screen_lighting` after the screen flash and under the numbers and the big words. `p1DrawVfx` takes an optional fifth argument (layer, one effect, target, foe, the move's row); with none it is the call the Battle Lab review has always made. Where an effect lands: the ones that draw on the foe land on the move's target (an ally when the move is aimed at one), the unit-sized ones (clobber, pops, composure, chevrons, badges) once on each target, the heal and the shield on each ally the move names, and a set-piece that draws on the member plays on the caster where it stands at that moment (`B3P.at`, written by `b3DrawMember`). When a move has a library projectile (`proj_*`), the plain ball a throw or a cast sends across is left out. Not done: hit stop (the fight's clock runs on), sound.

A fight never breaks because of an effect. `p1DrawVfx` gives each effect the canvas through a guard (`p1Guard`) that counts `save()` and `restore()`: when an effect throws half way, every `save()` it left open is undone, the fault goes to `gameFault` once, and that effect is skipped for the rest of the cue (the review's call is protected the same way). `b3vDraw` and `b3vArm` catch what is left (a unit that is gone, art that is broken) and drop the cue.

Checked: `python3 -I tools/guide_timing_test.py` (the layer table equals the library file for all 37, the by-move-id row, layer and target and throw cases of `p1DrawVfx`, the script order), `python3 tools/b3_vfx_test.py` in Chrome (one effect of each layer in one real `b3Draw` frame in the layers' order; all 119 moves that name a library effect swept through their whole life, every effect drawn, none throws, canvas left as it was; the moves of the family played by hand from the deck in portrait and in landscape, each arming its effects within 0.3 s of its hit; an effect that throws after `save()` and `clip()`, a cue whose foe is broken, a move the manifest does not name, an effect nobody built). I looked at the sheets `tools/shots/b3-vfx-layers.png`, `b3-vfx-portrait.png` and `b3-vfx-landscape.png`.

Not run to the end: `python3 tools/b3_test.py` has 98 Lab fights (about 7 minutes each); fights new1 to new15, new30 and new60 passed with no failure and the environment restarted before the rest. `new98` (the three-phase last boss) times out waiting for the command menu in `b3_test.py` with and without this change. Other checks that fail on main and not because of this build: `board_sync_test.py` (board4 case, ids of archived cards) and the night manifest row for `tools/hidebf_test.py`; `tools/battle_guide_test.py` stops on `MC.MANIFESTS`, a name `tools/guidegen/manifest_crosswalk.py` does not define.

## portraits7 (2026-11-26): Portraits baked from your saved crops: boppy (made by the portrait-bake Action)

- Tom saved crops in ADMIN > PORTRAIT CROPS (or approved a new hero painting); the Action baked `portraits/<id>.png` and moved `PORTRAIT_V` in `data/portrait-ver.js`, the one stamp every status screen, turn order, battle panel and the Battle Guide use for those pictures (tools/sprite-bake/portrait_autobake.py).

## tomframes4 (2026-11-26): Tom's newer feelings, listening, thinking and the intro hug are in the game

Card c-tomframes4. Tom's words: "now do Tom's newly approved frames, including hugging the girls in the intro". Not seen on the phone yet.
- Sheets installed: `tom-emotions-v9` (8 feelings), `tom-listen-v2` (4 up strip, cell 1 hands clasped is `tk_listen`), `tom-think-v2` (a 2 x 2 sheet of four poses, its top right cell, chin on hand, is `tk_think`; `GRID_CELL` in `emotion_frames.py`) and `tom-grace-rose-greeting-hug-v3` for the intro hug. Not part of this card: `tom-hero-v4` (menus only) and `tom-greeting-crouch-v2` (the game plays the crouch cell of the hug sheet, it does not load that standalone picture).
- Baked with `emotion_frames.py tom`, `talk_frames.py tom` (head x1.24), `bake_story_poses.py` (only Tom's sets `tomemo`, `tomtalk`, `hug` kept; other people's drift restored from main), `bake_emotion_faces.py`, `bake_talk_faces.py`, `bake_talkpose_faces.py`. Walk sheet and real height untouched.
- Intro hug: the set `hug` now reads v3. v3 paints Tom's first three frames (hear, delight, crouch) facing the camera, so the mirror that v2 needed (`flip`) is gone. Tom's feet anchors for run, crash and group were re-measured (249, 170, 162 source px), so he stays on one spot through the hug. Looked at the baked atlas: all six frames, one scale, feet on one spot. The title menu covered the live scene in my browser run, so the real intro was not screenshotted.
- Facing rows (`docs/pose-facing.tsv`): happy and loving now `f`, scared `l`, listen `l`; the rest unchanged.
- Tests: `heights_test.py` and `pose_editor_test.py` pass; smoke has the two failures that already fail on main (board_sync_test board4, night manifest hidebf).

## graceframes (2026-11-26): Grace's new walking, feelings, talking, thinking and listening pictures are in the game

Card c-graceframes. Tom's words: "now do grace". Not seen on the phone yet. Same install as `roseframes`.
- Sheets installed for Grace only (all uploaded 2026-11-26): `grace-walking-sheet-v3`, `grace-emotions-v4`, `grace-talk-v3` and `grace-listen-v2`. Not part of this card: her new hero painting (`grace-hero-v2`, shown only in menus). Nothing of anyone else changed (the story bake's rewrite of other people's sets with no art change was put back from main).
- Walking: rebaked with `walk_splice.py grace` and `heights.py write` (a rebake with the old sheet first matched the repo byte for byte). Real height unchanged (50 inches), draw scale 0.7526 to 0.7507.
- Feelings and talking: `emotion_frames.py grace`, `talk_frames.py grace` (the strip is cut 4 across, head x1.39 from the standing rule), `bake_story_poses.py` (only Grace's sets kept) and the dialogue faces. The chin reader was right for Grace (.256, painted chin about .27), so no hand-set share was needed.
- `grace-listen-v2` is a 4 up strip like Rose's: cell 1 (hands clasped) is `tk_listen`, cell 2 (chin on hand) is `tk_think`, because her only other thinking picture is the old outfit. `STRIP_CELL` in `emotion_frames.py` now covers Rose and Grace.
- Her plain dialogue face is framed on the new walk frame (`WALK_FRAMED`, and `NECK_SET` grace .38 because her hair hides the neck); the old hero ratios cut it at the forehead.
- Facing rows (`docs/pose-facing.tsv`): scared, surprised and tell now `f`; the rest unchanged.
- Her old Pose Editor lines are on the old sheets; the new sheets are baked as painted with the standing head rule.

## listengroup1 (2026-11-26): Listening poses sit in each character's section, and TNB, Amy and Justin have one

Tom: "move the listening poses into each character's section instead of a separate listening section. ensure all main characters have a listening item (eg TNB is missing)". The Art Library section Listening poses is gone: `tom-listen`, `grace-listen`, `rose-listen`, `deedee-listen`, `boppy-listen` and `ellie-listen` now sit in Tom, Grace, Rose, Deedee, Boppy and Aunt Ellie (groups come from `groups.js`; `listen-prompts.js` sets none). New entries `tnb-listen`, `amy-listen` and `justin-listen` (drafts) use the same listening prompt and their approved hero and talking pictures as references, so every main character now has one. The six approved ones keep their status and pictures. No game art changed. Test: `node tools/art-library/validate.js`, `python3 tools/hidebf_test.py`.

## portraits5 (2026-11-26): Portraits baked from your saved crops: grace (made by the portrait-bake Action)

- Tom saved crops in ADMIN > PORTRAIT CROPS (or approved a new hero painting); the Action baked `portraits/<id>.png` and moved `PORTRAIT_V` in `data/portrait-ver.js`, the one stamp every status screen, turn order, battle panel and the Battle Guide use for those pictures (tools/sprite-bake/portrait_autobake.py).

## roseframes (2026-11-26): Rose's new walking, feelings, talking, thinking and listening pictures are in the game

Card c-roseframes. Tom's words: "implement all the new approved rose frames". Not seen on the phone yet.
- Sheets installed for Rose only (all uploaded 2026-11-26): `rose-walking-sheet-v3`, `rose-emotions-v4`, `rose-talk-v3` and `rose-listen-v2`. Nothing of anyone else changed (the story bake's rewrite of Boppy's, Deedee's, Ellie's and Grace's talking sets and the `pipemo` atlas, with no art change, was put back from main).
- Her outfit is new in every one of them (pink hoodie, skirt, orange bow). Not part of this card and still the old yellow dress: her hero painting, menu portrait, battle videos and start picture, the Chapter 3 bulb picture and her dialogue ride pictures.
- Walking: rebaked with `walk_splice.py rose` and `heights.py write` (a rebake with the old sheet first matched the repo byte for byte). Real height unchanged (40 inches), draw scale 0.6718 to 0.6697.
- Feelings and talking: rebaked with `emotion_frames.py rose` and `talk_frames.py rose`, then `bake_story_poses.py` (only Rose's sets kept) and the dialogue faces (`bake_emotion_faces.py`, `bake_talk_faces.py`, `bake_talkpose_faces.py`).
- `rose-listen-v2` is a 4 up strip, not one figure (listening with hands clasped, chin on hand, arms crossed, finger on lip). Decision: cell 1 is the listening pose (`tk_listen`, hands clasped, the same pose as her first listening picture) and cell 2 (chin on hand) is the thinking pose (`tk_think`), because the only other thinking picture is the old yellow dress. `emotion_frames.py` `STRIP_CELL` cuts them; the other two cells are not used.
- Head size: the chin reader takes Rose's mouth for her chin on the new big-headed talking sheet (reads .21, the painted chin is at .31 to .32 of the height), which grew the heads x1.77 and tore the hair. `talk_frames.py` `TALK_SHARE` sets .315 for Rose, so her talking heads take her standing HEAD SIZES factor x1.30, as her feelings do. Her plain dialogue face is framed on the new walk frame (`WALK_FRAMED` in `bake_talk_faces.py`), because the old hero ratios cut it at the forehead.
- Facing rows (`docs/pose-facing.tsv`) looked at again on the new pictures: happy, scared, surprised, unimpressed and answer now `f`; the rest unchanged.
- Rose's old Pose Editor lines are on the old sheets; the new sheets are baked as painted with the standing head rule. Lining them in ADMIN > POSE EDITOR is optional.

## vfxlib3 (2026-11-26): the 22 library set-pieces are built, so all 37 Stage 2C library effects are drawn

`engine/vfx-library.js` now draws the 22 `setpiece_*` effects of `art-factory/aot-stage2c-vfx-library-v11.json` in code, in library order, each with the params its entry lists and defaults: `setpiece_black_porsche_suv` (speedPxSec, highBeamAlpha, dustTrail; right to left in under a second), `delta_one_pod_doors` (a pod round each adjacent ally, doors slide shut, amber light, tethers back), `giant_sky_controller` (a pad drops under the member, lights buttonSeq in order, then rainbow starbeams and meteors), `3tier_sparkler_cake`, `diamond_gold_dumpling`, `giant_easel_portrait`, `broadway_spotlights` (dims the screen and keeps the caster lit), `sofa_cushion_fort`, `blanket_kingdom_castle`, `mega_whoopee_cushion`, `8seat_sunday_table`, `rising_full_moon`, `50yr_dust_tsunami`, `rikers_iron_gates`, `cattail_pier_leviathan` (no boat, striper or leviathan), `sentient_ghost_pepper`, `leaning_grand_amphora`, `waymo_and_la_metro`, `eighth_dining_chair`, `stadium_jumbotron`, `michael_sprint_and_chopper` and `gym_bleachers_and_ruckus_crest` (gym, 50% link, 100% crest). They are in `P1_VFX`, `P1_VFX_MS` and `P1_VFX_SELF`; 13 draw on the member playing the clip (the party-side ones), 9 on the foe. All 22 are `buildStatus: built`, so the Guide's Effects built line is Done for every move that names a library effect (121 moves). No sound, and only the Battle Lab pass-1 review draws them; the library's layer (behind or over the units) is not honoured yet because the draw call comes after the member's body.

Two small engine changes make the set-pieces work. `p1DrawVfx` (pass1-vfx.js) now gives every effect `p._foe` {x, y, h}, so an effect drawn on the member can aim a beam, cone or wave at the foe. `engine/guide-timing.js` copies a move's `effectParams` from `data/guide-manifest.json` to its `fxp`, and `manifest_crosswalk.py` writes them (`EFFECT_PARAMS`) for the nine moves that use a set-piece with modes: Boppy's second skill and Capstone (striper, leviathan), TNB's (Waymo, Metro), Olivia's two news Capstones (sprint, chopper) and her Rope Champ (gym pyro), Double Team (50% link) and Full Family Ruckus (100% crest). Choices of effect and mode follow the library's own `usedBy` and summary text.

Checked: `python3 -I tools/guide_timing_test.py` draws all 37 effects at 21 moments with 172 params variants (no error, no NaN or Infinity in any canvas call), checks the Porsche, the Metro, the sprinting man and the news chopper cross right to left, that the Porsche's time follows its speed and the moon's follows moonRiseMs, that each mode draws differently, that the nine `effectParams` reach the effect and that a member-side set-piece is told the foe's position. I looked at a contact sheet of all 22 in Chrome (27 renders, three moments each, portrait scale 1.8, foe left, member right) and fixed what ran off the edge or overlapped: the pods, controller, cake, fort, castle, table, Metro and the crest's stars. `data/guide-manifest.json` is regenerated (all 37 built). Note: `python3 tools/battle_guide_test.py` stops with `AttributeError: module 'manifest_crosswalk' has no attribute 'MANIFESTS'` at its crosswalk step; it did the same before this build (checked with this change stashed), and is not touched here.

## openzoom1 (2026-11-26): Chapter 1 opens with a camera zoom into the taxi company and a medium fade

Tom: at the very beginning of chapter 1, before showing Tom inside the taxi company, the camera should zoom into the taxi company instead of cutting, then a medium fade. `SCENES.opening` (data/scenes.js) now starts on the Square with the camera on Long Island Taxi Co., zooms in to 2.4 over 1.6 seconds, fades out over 0.8, switches to the office and fades in over 0.8 on Tom and Sal. Tom is hidden outside, so he is only seen inside. Looked at in portrait: Square, tight on the taxi sign, dark, then the office with Tom stretching. Spoken lines and the rest of the scene are unchanged.

## vfxlib2 (2026-11-26): library effects 9 to 15 are built: shield, timeline chevrons, debuff badges and the four projectiles

`engine/vfx-library.js` now draws 15 of the 37 Stage 2C library effects in code, in library order: `vfx_core_shield_ward` (8 skins, draws on the member), `vfx_core_timeline_chevrons` (pull, push, swap, bonus turn, Pep stars; the turn bar's arrows: teal left for a pull, red right for a push), `vfx_core_status_debuff_badges` (8 modes), and the projectiles `proj_arc_single`, `proj_boomerang_return`, `proj_ally_handoff_party` and `proj_ground_hazard_mat`. Each takes the params its library entry lists, has defaults, and is in `P1_VFX`, `P1_VFX_MS` and (the shield) `P1_VFX_SELF`; their `buildStatus` is `built` in `art-factory/aot-stage2c-vfx-library-v11.json`, so the Guide's Effects built line now counts them. The old simple chevrons and badges in `engine/pass1-vfx.js` are removed (purged, not kept as fallbacks), and the badges now sit just over the foe's head instead of a fixed distance above its middle.

Three small engine changes in `p1DrawVfx` (pass1-vfx.js) make this work: a foe effect is now told the foe's height (`p._h`) and where the member playing the clip stands (`p._from`); a new table `P1_VFX_LEAD` says how many ms before the contact an effect starts, so a projectile lands on the contact moment (arc: 560 ms flight, boomerang: its apex is the contact, hand-off: 0); and projectiles fly from the member to the foe, right to left (the snack toss is the one that flies the other way, to the party). Not done: the set-pieces (`setpiece_*`), sound, and drawing in a real fight (only the Battle Lab pass-1 review draws effects). 22 of the 37 effects are still not built.

Checked: `python3 -I tools/guide_timing_test.py` draws every new effect at 21 moments with all 84 params variants of the 15 effects (no error, no NaN), checks the arc flies right to left, the boomerang goes out and comes back, the badges sit over a 90 px foe's head, and a projectile is drawn only from 560 ms before the contact to 140 ms after it. I looked at a contact sheet of all 7 in Chrome (portrait scale 1.35, foe left, member right). `data/guide-manifest.json` is regenerated (15 effects built).
## hidebf2 (2026-11-26): The battleframe box also hides objects and effects

Tom: the Hide painted battleframes box should also hide the objects and effects of each character. The 132 `-fx-` sheets (Characters tab, "objects and effects") now hide with the battle frames: 290 of 429 Characters entries while ticked. Test: `python3 tools/hidebf_test.py`.

## hidebf1 (2026-11-26): Art Library has a Hide painted battleframes box, ticked by default

Tom: a box on the left of the Art Library, ticked by default, that hides every battle frame for every character. It hides 158 Characters entries: every battle stance sheet 1 and 2 (all party members, Jojo, Nara, young Boppy battle sheets) and every ability frame sheet (ids with `-ab-`). Hidden entries are gone from the list, the search, the tab and filter counts and the group counts. Ability object and effect sheets (`-fx-`), emotion and talk sheets, enemies and battle backgrounds stay. The Review queue is unchanged, so a picture waiting for approval is never lost. The choice is saved on the device; a `?open=` link to a battle frame unticks the box so the link still lands. Test: `python3 tools/hidebf_test.py`.

## guidetime1 (2026-11-26): the engine reads each move's contact moment and hit stop from the manifest, and the first 8 library effects are built

`engine/guide-timing.js` reads `contactSec` and `hitStopFrames` from `data/guide-manifest.json` and gives `p1Meta` (engine/pass1-vfx.js) a row for every manifest move: `impact_ms` is `contactSec` x 1000, `hit_stop_frames` is `hitStopFrames`, and the effects are the move's library assets. A pass-1 clip that already has a row in `data/pass1-meta.js` keeps that row (it was measured on the baked video), so nothing already reviewed changes; Justin's stud finder is the one disagreement (row 1700 ms, manifest 1300 ms) and the row wins. `engine/vfx-library.js` draws the first 8 effects of `aot-stage2c-vfx-library-v11.json` in code, with the params each entry lists: clobber_impact, sizzle_wave, drench_splash, razzle_beam_arc, racket_rings, detonation_pops, composure_break, heal_cleanse (the heal draws on the member playing the clip, the rest on the foe). Those 8 are `buildStatus: built`; the other 29 stay `todo`. `manifest_crosswalk.py` now sets `contactApplied` when a baked clip's row holds the manifest's numbers (6 moves). Only the Battle Lab pass-1 review draws these; a real fight does not yet. No sound. Test: `python3 -I tools/guide_timing_test.py`.

## wanstop-rose-whoopee-r1 (2026-11-26): Rose's whoopee cushion trap video accepted by eye and put in the game

The wan-gen checks stopped rose-whoopee twice on the look check only (p1; every measured check passed: height, feet, flat background, edges, last picture against first). I made a contact sheet of the second video: Rose slides both palms forward, clamps her ears, pops into the hands-on-hips pose and returns to her stance. That is the move's main action (Tom 2026-11-21: complete the purpose and theme, not perfect). Baked it (`rose_whoopee`, `wanbake.bake`); the staging row in data/b3-stage.js already named the clip. One small difference: she smiles through it instead of a deadpan face. No new try started, nothing painted.

## wanstop-rose-raspberry-r1 (2026-11-26): Rose's raspberry video is accepted and put in the game

The wan-gen checks stopped rose-raspberry only on the literal look check (p1); height, feet, background, edges and ends all passed. By eye the second try shows hands on hips, puffed cheeks, a lean, arms crossed and a return to idle, which is the move (Tom 2026-11-21: the overall purpose counts). Baked as clip rose_raspberry (29 frames, tools/art-library/wanbake.py, job settings) and wired to the staged move supersonic_raspberry. No new try, no money spent. Watch card t-wanwatch-rose-raspberry-r1.

## wanbulk-trosestagelab-45822234075 (2026-11-26): 1 battle videos made from board card t-rosestage-lab passed their checks and were put in the game

The wan-gen Action made them (wanbulk, tools/art-library/wangen.py --bulk), measured them (height, feet, flat background, edges, last picture against first) and had a vision model check the motion and the person (tools/art-library/wanqa.py), then baked each with the settings stored on its job and wired it (tools/art-library/wanbake.py): rose-baitswitch. Nobody has watched them yet; the card asks Tom to.

## wanstop-rose-lavahop-r1 (2026-11-26): Rose's Floor Is Lava hop video is judged as a jump and its next try starts

Both tries (rev 1) showed what the prompt asks for (gasp, look down, crouch, three hops, land and hold; hair and hands inside the frame), but the feet check read the hop heights (15 to 18 percent of the frame height in the air) as sliding feet and stopped it twice. One change: the job is `airborne: true`, so feet are judged in the first and last picture (the landing) like the other jump jobs. Prompt, seed, pad 0.8, start picture, model, bake and wire are kept. Job rev 2. Nothing for Tom.

## wanstop-rose-kingdom-r1 (2026-11-26): Rose's Kingdom of Ten-Thousand Blankets video gets one prompt change and its next try starts

Both tries (rev 1) did the move (hug the Lamby plush, lift it high, lower it), but the plush flew in from and out through the left edge of the picture because the start picture has empty hands: an edge miss on the second try and a look-check miss on the first. One change: the prompt (`wan-rose-kingdom-v2.txt`) says the plush is already hugged to her chest from the first frame; pad, seed, start picture and model kept. Job rev 2. The next try is started by `wgen` on card t-rosestage-lab.

## wanstop-rose-pretzel-r1 (2026-11-26): Rose's Pocket Pretzel video gets one prompt change and its next try starts

Both tries (rev 1) showed the right move (Lamby bonk, pretzel from the pocket, held out, back to stance) but Rose took a real step forward, so her feet slid up to 1.7 percent of the frame and she touched the left edge in 31 to 34 pictures. One change: the prompt (`wan-rose-pretzel-v2.txt`) replaces "darts one quick step forward" with "leans forward from the waist with her feet planted"; the rest, pad, seed, start picture and model are kept. Job rev 2. The next try is started by `wgen` on card t-rosestage-lab.
## wanstop-rose-boop-r1 (2026-11-26): rose-boop gets a second prompt (leans on the spot instead of stepping) and its next video try is started

Both tries failed the feet check because Rose walked a full step forward and back (lowest row up to 44 px off, limit 1 percent). One sentence changed (`wan-rose-boop-v2.txt`), rev 1 to 2; pad, seed, start picture and the rest kept. No painted pose.

## wanstop-rose-tacklelunge-r1 (2026-11-26): Rose's tackle video is made again with one sentence changed

The wan-gen Action stopped rose-tacklelunge twice (feet, edge). On the contact sheets she does the tackle but steps forward off her spot and Lamby leaves her arm and reaches the left edge. Changed one sentence of the prompt (`wan-rose-tacklelunge-v2.txt`: two tackle crouches with both feet planted and Lamby held under her arm, where v1 said two lunges to the left on the spot), raised rev to 2. Kept the start picture, seed, pad, bake and wire. The next try is started on card t-rosestage-lab. Nothing for Tom.

## wanstop-rose-boomerang-r1 (2026-11-26): Rose's Lamby boomerang video is made again with her feet held planted in the lunges

The bulk run stopped rose-boomerang after two tries (feet, edge): the move reads right, but the two lunges slid her feet (2.2 percent) and her reach touched the left edge in 7 pictures. One sentence of the prompt changed (lunges bend the knees and lean the shoulders with both feet planted); start picture, seed and pad kept. Rev 2, next try started on card t-rosestage-lab.

## wanstop-rose-doublelamby-r1 (2026-11-26): Rose's Double Lamby video tried again with her feet kept on the ground
The first two tries did the move but lifted her feet off the spot. One sentence of the prompt changed (the bounce onto the balls of her feet became a knee dip with both feet flat); nothing else.

## wanstop-rose-citadel-r1 (2026-11-26): Rose's Sofa Cushion Citadel video gets one prompt change and its next try starts

Both tries (rev 1) showed Rose lifting both arms, sweeping them wide and returning, but the Lamby plush popped in and out (the start picture has empty hands), so the look check failed twice on the plush. One change: the prompt (`wan-rose-citadel-v2.txt`) drops the plush sentence and says both hands stay empty, the wording of the controller toss; pad, seed, start picture and model are kept. Job rev 2. The next try is started by `wgen` on card t-rosestage-lab.

## wanbulk-trosestagelab-45796453993 (2026-11-26): 6 battle videos made from board card t-rosestage-lab passed their checks and were put in the game

The wan-gen Action made them (wanbulk, tools/art-library/wangen.py --bulk), measured them (height, feet, flat background, edges, last picture against first) and had a vision model check the motion and the person (tools/art-library/wanqa.py), then baked each with the settings stored on its job and wired it (tools/art-library/wanbake.py): stage-rose-cushion, stage-rose-lamby, stage-rose-backuplamby, stage-rose-cushionwall, stage-rose-castle, stage-rose-whoopee. Nobody has watched them yet; the card asks Tom to.

## rosestage1a (2026-11-26): the Battle Guide shows what is done for each move, from the three manifests and the effect library

`tools/guidegen/manifest_crosswalk.py` writes `data/guide-manifest.json`: the 123 moves of the Stage 2A manifests tied to the game's moves (121 matched, the two team moves Double Team and Full Family Ruckus have no game skill) and to the 37 library effects. The Guide's move sheet has a What is done block (staging row, video wired, contact and hit stop, effects, sound effects, manifest motion text). Style prefix and negative prompt of the manifests are left out on purpose (pipeline lock). Contact, effects and sound read Not yet everywhere: nothing in the engine reads them and there are no sound files. Test: `python3 -I tools/guide_manifest_test.py`; `movestage_test.py` still passes.

## rosestage1 (2026-11-26): Rose's twelve moves have staging rows, so Generate works for them

Tom: "Waits for staging... Its staging row is not written yet" and "why dont i get the button to create the animation". Only Tom's eight moves had rows (`data/b3-stage.js`). Added the twelve rows for Rose's three Vibes (Sugar Rush, Cozy Rosie, Prankster), each on the ladder of `claude/move-staging-plan.md` section 3 (Basic accents only, Skill 1 one stage element, Skill 2 a bigger or lasting one, Capstone a 6 to 8 s set piece), with marks taken from the manifest beats (`art-factory/aot-stage2-pass*-manifest-24fps.json`). Giddyup keeps its approved paired clip. Eleven new body prompts (`wan-rose-*-v1.txt`, Rose's own idle prompt as the pattern, Lamby is her one held prop, nothing from behind her back; the tackle gets a new body because the old one brings Lamby out from behind her back), eight prop pictures (`stage-rose-*-v1.txt`) and their jobs in `wangen-jobs.json`. `tools/guidegen/build_map.js`: a move whose row makes a new body (keep false) now uses the row's own job and clip, even when an older clip of that move was made by another job (rose_lava). `tools/movestage_test.py` reads each person's own idle prompt as the pattern (it only knew Tom's); `tools/battle_guide_test.py` no longer pins Giddyup as a Making row. Not done: the Move Lab only loads Tom (card c-movelab-rose); the Backup Lamby ambush (the counter clip) and the Warmth Wave are not staged; the other 108 family moves still wait for rows. Tests: `movestage_test.py` (211 ok), `movestage_lab_test.py`, `wangen_test.py`, `wanbulk_test.py`, `purge_test.py` pass; `battle_guide_test.py` has the failures it already had on main (page vs data count, live queue wording, plan counts, the guide loading the engine).
## guideuse-45795371400 (2026-11-26): Dodge (tom), Victory (rose) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Dodge (`body:tom:dodge`, rev 3): Wan job tom-dodge is now rev 3 (prompt file tools/art-library/prompts/wan-tom-dodge-v3.txt); clip tom_dodge cut (55 pictures, 0 to 108 step 2); B3_BODY_CLIPS.tom.dodge = tom_dodge (was 'tom_dodge')
- Victory (`body:rose:victory`, rev 2): Wan job rose-victory is now rev 2 (prompt file tools/art-library/prompts/wan-rose-victory-v2.txt); clip rose_victory cut (67 pictures, 0 to 132 step 2); B3_BODY_CLIPS.rose.victory = rose_victory (was 'rose_victory')
- start picture of olivia is now in `art/clips/start/olivia-hero.png` (you uploaded it; used exactly as painted)

## guideuse-45793298334 (2026-11-26): Idle (standing and breathing) (tnb), Guard (tnb), Getting hit (tnb), Idle (standing and breathing) (amy) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Idle (standing and breathing) (`body:tnb:idle`, rev 3): Wan job tnb-idle is now rev 3 (prompt file tools/art-library/prompts/wan-tnb-idle-v3.txt); clip tnb_idle cut (50 pictures, 0 to 147 step 3, loop wrap); B3_BODY_CLIPS.tnb.idle = tnb_idle (was 'tnb_idle')
- Guard (`body:tnb:guard`, rev 2): Wan job tnb-guard is now rev 2 (prompt file tools/art-library/prompts/wan-tnb-guard-v2.txt); clip tnb_guard cut (67 pictures, 0 to 132 step 2, hold 40, lowering 108); script tag added to index.html; B3_BODY_CLIPS.tnb.guard = tnb_guard (was 'tnb_guard')
- Getting hit (`body:tnb:hit`, rev 1): Wan job tnb-hit is now rev 1 (prompt file tools/art-library/prompts/wan-tnb-hit-v1.txt); clip tnb_hit cut (48 pictures, 0 to 94 step 2, 1.5x); script tag added to index.html; B3_BODY_CLIPS.tnb.hit = tnb_hit
- Idle (standing and breathing) (`body:amy:idle`, rev 1): Wan job amy-idle is now rev 1 (prompt file tools/art-library/prompts/wan-amy-idle-v1.txt); clip amy_idle cut (50 pictures, 0 to 147 step 3, loop wrap); script tag added to index.html; B3_BODY_CLIPS.amy.idle = amy_idle (new owner row)

## tomframes3 (2026-11-26): Tom's plain dialogue face is the new walking face; the stretch fade is gone

Tom (11-26 09:49 and 09:50): "The old frames are still being used in the dialog portrait" and the stretch transition is "way too much". Fact: `portraits/talk/tom.webp` (the face on lines with no mood and no talking pose) still showed the old balding walking sheet (v3), because the first install baked it before the walk atlas was new. Rebaked from the new walk (v4) standing frame, framed from hair top to neck like Amy's and Olivia's (`WALK_FRAMED` in bake_talk_faces.py; the hero-ratio framing cut his chin). Stretch: the crossfade and its drawing code are removed (purged); poses change as cuts with no squash (the squash exemption for `st_` poses stays) and the 2.8 s length stays. Not changed: the feelings, tell, point, ask, answer and think faces (cut from sheets v8, v3 and the older singles).

## tomstretch5 (2026-11-26): the stretch's pose fade is about 4 times shorter

Tom (11-26 09:33): the fade between stretch poses "looks very strange and psychedelic"; no jolts, or make it about 10 times more subtle. Kept: no squash or hop on stretch poses, the 2.8 s length. Changed: the fade window is 0.015 of the stretch (about 40 ms, three frames) instead of 0.06 (170 ms), so two poses no longer show through each other for long.

## tomstretch4 (2026-11-26): Tom's stretch runs smoothly: no bounce, poses fade into each other, a little slower

Tom (11-26 09:16): "stretch frames are too jolty ... he bounces up and down ... should all merge seamlessly ... slowed overall just very slightly". Cause: the scene life effect (squash on every pose change, `actorLife` in engine/emotions.js) fired at each of the 8 stretch poses. Now `st_` poses never squash, each pose fades in over the previous one for 6 percent of the stretch (eased; `stretchStep` in engine/intro.js, drawn in engine/town-render.js), and the stretch lasts 2.8 s instead of 2.4 (17 percent slower). Tested by sampling the pose state in a chapter 1 run (fades 0 to 1 between every pair, no squash, no errors); not looked at on a phone.

## tomstretch3 (2026-11-26): Tom's new approved stretching pictures are in the game

Tom (11-26 08:59): "I just approved a new stretching frame set that needs to be implemented". The Art Library entry `tom-stretch-intro` got `tom-stretch-intro-v2.png` (4 x 2, same 8 frames and names). `bake_story_poses.py` set `tom` now cuts it; only `art/chars/tom-story.webp` and Tom's block of `data/story-poses.js` changed. Measured: all frames 38 to 42 rows (standing frame 42), no resizing of painted frames.

## tomframes2 (2026-11-26): Tom's feelings, thinking and listening pictures now draw at the same size as his other poses

Tom (11-26 08:20 and 08:22): "I see lots of old frames ... Especially the listening and they are a different sizes". Fact: the first install drew his 8 feelings poses about 33 rows tall (the old sheet's size factor was kept for the new, smaller painting) while talking poses were 40 to 42, and thinking and listening were about 11 percent taller than telling. Now `EMO_HEAD['tom']` is 1.13 and `TALK_FIT` (bake_story_poses.py) sets the thinking and listening figures to the height of the other talking poses. Measured in the atlases: feelings 39 to 41 rows, talking 40 to 42 rows, thinking and listening 40.7. Only Tom's two story atlases changed; other people's files are as they were. Tom's own Pose Editor lines (applied to tell, point, ask and answer) are untouched.

## tomframes (2026-11-26): Tom's new walking, feelings, talking and listening pictures are in the game

Card c-tomframes. Tom's words: "implement tom's new walking, emotions, and listening frames." Not seen on the phone yet.
- Sheets installed for Tom only: `tom-walking-sheet-v4`, `tom-emotions-v8`, `tom-talk-v3` (all uploaded 2026-11-26) and the approved `tom-listen-v1` (the listening pose is the sixth talking frame, `tk_listen`, cut from the same strip). Nothing of anyone else changed.
- Walking: rebaked with `walk_splice.py tom` and `heights.py write` (draw scale unchanged, Tom stays the 42 row baseline). The new sheet has a pale pink glow in the gaps between his arms and body that the keyer kept as figure, so `walk_sheet_frames.py` removes pale pink blocks of 30 pixels or more for that sheet only (`GLOW_SHEETS`).
- Talking: the new 2 x 2 sheet paints the ask and answer heads above the half-way line, and the old even split sliced the top of their hair. `talk_frames.py` now splits Tom's sheet in the empty band between the rows (`GAP_SPLIT`, Tom only; the others keep the even split their art was made with).
- Feelings, talking and listening poses rebaked with `emotion_frames.py`, `talk_frames.py`, `bake_story_poses.py`, then the dialogue faces (`bake_emotion_faces.py`, `bake_talk_faces.py`, `bake_talkpose_faces.py`). Other people's pose sets the full story bake rewrote with no art change were put back from main (Rebake drift, reports-2026-11-19c).
- Cache tags: `EMO_V`, `TALK_V`, `TALKPOSE_V` and Tom's emotion strip are `tomframes`.
- Facing rows of Tom's frames (`docs/pose-facing.tsv`) looked at again on the new pictures: every frame still turns the way its row says, no row changed.
- Tom's earlier Pose Editor lines were set on the old sheets, so the new sheets have none yet: they are baked as painted with the standing head rule. Lining them in ADMIN > POSE EDITOR is optional and would size each pose to his height.
- Not changed: the other nine people's talking strips may have the same sliced heads from the even split (Grace's ask and answer hair touches the top edge). Left alone because their art is approved as baked.
## guideuse-45791800597 (2026-11-26): Cast (rose), Victory (tom), Running in (tom), Cast (tom) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Cast (`body:rose:cast`, rev 4): Wan job rose-cast is now rev 4 (prompt file tools/art-library/prompts/wan-rose-cast-v4.txt); clip rose_cast cut (71 pictures, 0 to 140 step 2); B3_BODY_CLIPS.rose.cast = rose_cast (was 'rose_cast')
- Victory (`body:tom:victory`, rev 2): Wan job tom-victory is now rev 2 (prompt file tools/art-library/prompts/wan-tom-victory-v2.txt); clip tom_victory cut (75 pictures, 0 to 148 step 2); B3_BODY_CLIPS.tom.victory = tom_victory (was 'tom_victory')
- Running in (`body:tom:run`, rev 2): Wan job tom-run is now rev 2 (prompt file tools/art-library/prompts/wan-tom-run-v2.txt); clip tom_run cut (75 pictures, 0 to 148 step 2, loop wrap); B3_BODY_CLIPS.tom.run = tom_run (was 'tom_run')
- Cast (`body:tom:cast`, rev 4): Wan job tom-cast is now rev 4 (prompt file tools/art-library/prompts/wan-tom-cast-v4.txt); clip tom_cast cut (70 pictures, 0 to 138 step 2); B3_BODY_CLIPS.tom.cast = tom_cast (was 'tom_cast')

## guideuse-45790051267 (2026-11-26): Giving (support moves) (rose), Running in (rose), Knocked out (rose) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Giving (support moves) (`body:rose:give`, rev 2): Wan job rose-give is now rev 2 (prompt file tools/art-library/prompts/wan-rose-give-v2.txt); clip rose_give cut (52 pictures, 0 to 102 step 2); B3_BODY_CLIPS.rose.give = rose_give (was 'rose_give')
- Running in (`body:rose:run`, rev 2): Wan job rose-run is now rev 2 (prompt file tools/art-library/prompts/wan-rose-run-v2.txt); clip rose_run cut (75 pictures, 0 to 148 step 2, loop wrap); B3_BODY_CLIPS.rose.run = rose_run (was 'rose_run')
- Knocked out (`body:rose:ko`, rev 3): Wan job rose-ko is now rev 3 (prompt file tools/art-library/prompts/wan-rose-ko-v3.txt); clip rose_ko cut (75 pictures, 0 to 148 step 2, 1.5x); B3_BODY_CLIPS.rose.ko = rose_ko (was 'rose_ko')

## guideuse-45789372779 (2026-11-26): Getting hit (rose), Dodge (rose), Guard (rose) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Getting hit (`body:rose:hit`, rev 6): Wan job rose-hit is now rev 6 (prompt file tools/art-library/prompts/wan-rose-hit-v6.txt); clip rose_hit cut (55 pictures, 0 to 108 step 2, 1.5x); B3_BODY_CLIPS.rose.hit = rose_hit (was 'rose_hit')
- Dodge (`body:rose:dodge`, rev 4): Wan job rose-dodge is now rev 4 (prompt file tools/art-library/prompts/wan-rose-dodge-v4.txt); clip rose_dodge cut (58 pictures, 0 to 114 step 2); B3_BODY_CLIPS.rose.dodge = rose_dodge (was 'rose_dodge')
- Guard (`body:rose:guard`, rev 2): Wan job rose-guard is now rev 2 (prompt file tools/art-library/prompts/wan-rose-guard-v2.txt); clip rose_guard cut (65 pictures, 0 to 128 step 2, hold 36, lowering 120); B3_BODY_CLIPS.rose.guard = rose_guard (was 'rose_guard')

## guideuse-45787096926 (2026-11-26): Idle (standing and breathing) (rose), Guard (tom) now plays a video chosen in the Battle Guide

Card c-guidegen, batched by c-guideflow-7. USE THIS ONE in the Battle Guide (the `use` of a row in queue.json, Action guide-apply). Not seen on the phone yet.
- Idle (standing and breathing) (`body:rose:idle`, rev 2): Wan job rose-idle is now rev 2 (prompt file tools/art-library/prompts/wan-rose-idle-v2.txt); clip rose_idle cut (50 pictures, 0 to 147 step 3, loop wrap); B3_BODY_CLIPS.rose.idle = rose_idle (was 'rose_idle')
- Guard (`body:tom:guard`, rev 2): Wan job tom-guard is now rev 2 (prompt file tools/art-library/prompts/wan-tom-guard-v2.txt); clip tom_guard cut (65 pictures, 0 to 128 step 2, hold 32, lowering 106); B3_BODY_CLIPS.tom.guard = tom_guard (was 'tom_guard')
- start picture of tnb is now in `art/clips/start/tnb-hero.png` (you uploaded it; used exactly as painted)

## tomportrait1 (2026-11-26): Tom's face in the status screen, turn order, battle panels and Battle Guide is now cropped from his new painting

Card c-tomportrait1. Tom sent his new painting (the retro controller shirt, short beard) and asked for it to be his portrait. It is saved as `art/raw/characters/tom-hero-v3.png`; the face crop is square 465 px from (279, 28) in `data/portrait-crops.json`, the same zoom as everyone else, and `portraits/tom.png` is rebaked. Not seen on the phone yet. Dialogue faces still come from the emotion and walking sheets, not this crop.

## guideedit1 (2026-11-26): the Battle Guide lets you edit an animation's prompt by hand before you make the video

Card c-guide-editprompt. Tom (11-26): "in the battle guide i need the ability to edit the prompts for animations before i generate." Not seen on the phone yet.
- `battle-guide.html`: under Prompt, Edit this prompt opens a box with the prompt a new video would use; Save prompt keeps it (this browser), Cancel closes it, Reset to original brings the approved text back. Every Make this video, Retry and Make all missing poses already used the kept prompt, so the queue row carries the edit.
- Warns (second tap keeps) when an edit adds a word that pulls toward the wrong look (pixel art, 16-bit, sprite, gouache, green screen); refuses an empty prompt.
- Checked on a phone-width screen: open, edit, save, reload (still there), warning, empty, reset. The `guideedit1` checks are in `tools/battle_guide_test.py`; the full Guide suite already stops earlier on live queue data (a fal out-of-credit row), the same with and without this change.


## guidefix1 (2026-11-26): the Battle Guide Animations tab works again

Card c-guide-animtabs. Tom: "Nothing happens in the battle guide animation tabs." The Animations list threw an error (`MANI.summary.decide` undefined) because the c-rosestage build rewrote `data/guide-manifest.json` in a new format while the page still read the old one, so the tab never drew.
- `battle-guide.html`: the old crosswalk code (What Tom has to do, move manifest blocks) now loads only when the file is in the old format. The newer What is done block is unchanged.
- Checked at phone width (466) and Duo unfolded (951): the Animations tab lists everything, a person's page opens, the player plays, no page errors. `tools/guide_manifest_test.py` passes.
- Not fixed: the C1 to C13 checks in `tools/battle_guide_test.py` still expect the old manifest format and stop early (`MC.MANIFESTS` missing). They already failed before this build.
