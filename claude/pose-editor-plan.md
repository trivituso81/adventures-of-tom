# POSE EDITOR: build instructions (written 2026-11-14; phase 1 pushed as `poseedit1`, main ce54089)

This file is the tracker and the instructions. Each phase below is one conversation. Tom's prompt for every one of them:

**"Read claude/pose-editor-plan.md and build the next phase."**

A session reads this file, the repo's CLAUDE.md (it has a "Pose Editor" section), and only the files its phase lists. It does not read claude/next.md unless its phase says so (the push procedure and test environment lines are there). When the phase is pushed, the session rewrites the STATUS table here (re-read this file right before writing and merge), adds one dated line to claude/canon-addendum.md if a rule changed, and tells Tom in two lines what the next phase is and the prompt above.

## 0. STATUS

| Phase | What | State |
|---|---|---|
| 1 | Page, pose manifest, marking (top of head, chin, feet), auto-size preview, save. Walk frames only. Nothing in the game changes. | DONE 2026-11-14, `poseedit1` (ce54089). As built: section 7, phase 1. Waiting on Tom to mark and SAVE. |
| 2 | Apply path for walk frames (bake reads Tom's marks and sizes), real height changes | NEXT |
| 3 | Mood (em_) and talking (tk_) poses: manifest, marks, apply | NOT STARTED |
| 4 | Battle sheets, KO, extra and story poses | NOT STARTED |
| 5 | Ability (ab_) frames and Tombo frames | NOT STARTED |
| 6 | Townsfolk, Michael, Nara, Ms. Cathy, young Boppy; retire HEAD SIZES into the Pose Editor | NOT STARTED |

## 1. What Tom asked for (2026-11-14 20:32, paraphrased closely)

- A new ADMIN function, a pose editor.
- An easy way to make sure characters are consistent in overall height compared with their real height.
- He can change a character's height through an input, and the head size too.
- Pose by pose. "I've tried to get you to do that automatically and I haven't been successful, so I need to be able to do it myself."
- AI help inside it: if he sets what he thinks the chin is and what he thinks the top of the head is for each character, the tool auto-sizes them all to match.
- Robust and friendly to use.

Why the automatic route failed (fact, from the repo): every bake guesses the chin and the head top from the picture (alpha top, narrowest row, skin-colour blob: `chin_lines.json`, `emotion_chin.json`, `WALK_MATCH`). Hair, caps, beards, bowed heads and raised arms fool those guesses, and each pose set (walk, mood, talk, battle, ability) has its own size factor (`EMO_HEAD`, `BATTLE_SIZE`, per-sheet factors in `bake_story_poses.py`). So one character is five separately guessed sizes. Measured in phase 1 with skull-top and chin lines read by eye: heads in the game now run from 10.1 rows (Ellie) to 12.7 (Boppy) against Tom's 10.9. The fix is not a better guess. It is: Tom's eye sets the marks, the maths does the rest, and every bake reads the same marks.

## 2. Decisions already made (do not reopen, do not ask Tom)

| # | Decision |
|---|---|
| 1 | Name: POSE EDITOR. Page `poses.html` at the repo root, opened from ADMIN (`openPoses` in engine/splash.js). Phone portrait first, landscape must work. Tom's computer cannot run extensions or automation, so everything happens in the page. |
| 2 | Three marks per pose frame, each a horizontal line Tom drags: TOP (top of the skull as Tom judges it, hair volume and caps do not count), CHIN (true bottom of the chin, bottom of a beard on a bearded chin), FEET (the ground line under the soles). Stored as px from the top of the cut frame. |
| 3 | Two numbers per pose frame: FIGURE and HEAD, both multipliers on the painting drawn at its real height (100 = as painted; `s0 = R / stand height` rows per px). FIGURE scales the body, HEAD scales everything above the chin line about that line. Slider, plus and minus 1, typed input. |
| 4 | Two numbers per character: REAL HEIGHT (feet and inches input) and HEAD TARGET (head height TOP to CHIN as a percent of Tom's). Adults default to 100. Grace and Rose default to their share in the game now (80 and 69 with the phase 1 proposals). This is NOT the HEAD SIZES factor: that factor multiplied a hair-top-to-anchor head, which is why it needed 1.27 for Amy. |
| 5 | The head is one size in every pose of a character: `T(c)` = Tom's front standing head rows (by his lines, at his own HEAD) x HEAD TARGET. Tom's front standing pose is the model and is as painted under auto size. |
| 6 | AUTO SIZE (section 5) is plain geometry from Tom's marks. It runs in the page, instantly. No guessing happens after Tom has marked a frame. |
| 7 | The AI part is the pre-marking: every frame opens with proposed lines so Tom confirms or nudges. Claude reads them by eye on ruler pictures (`RULER=dir python3 tools/pose-editor/manifest.py`) and stores them in `tools/pose-editor/proposals.json`, tied to the sheet file. A frame Tom has confirmed is never re-proposed. |
| 8 | The page never changes the game. SAVE commits `data/pose-requests.json` through the GitHub token already used by heads.html (`aot-gh-token`). Tom then says "apply my pose sizes" and Claude bakes. |
| 9 | Marks belong to one source sheet file. A newer sheet makes them stale: the page flags the frame as needing lines and sizes it as in the game now. |
| 10 | The head change uses the existing warp (`kidhead.grow_head`: rows above the chin are scaled about the chin, with a 12 px taper into the neck). Tom accepted this method for HEAD SIZES on 2026-11-10. It is not a composite: nothing is cut and pasted. The 2026-11-03 "no composites" rule stays in force. |
| 11 | Walk steps follow their standing pose (same top and chin px, same FIGURE and HEAD) so a walk cannot pulse. Tom can mark a step by itself (`own`). Later sets: frames of one animation share one size the same way. |
| 12 | If HEAD would go under 75 or over 145 the page says the pose should be painted again. Phase 2 `apply.py` refuses such a frame and lists it for Tom. |
| 13 | HEAD SIZES (heads.html) keeps working untouched through phase 5. Phase 6 folds it in and removes the ADMIN entry. |

## 3. What exists today (fact; read these, do not rebuild them)

| Thing | Where | Note |
|---|---|---|
| Real heights | `data/heights.json` (inches, Tom 71 is the baseline, his stand is 42 rows on screen) | The one place a height is typed. `tools/sprite-bake/heights.py write` regenerates `data/walk-scale.js`; test `tools/heights_test.py`. Townsfolk heights are in `tools/art-library/npc-prompts.js`. |
| Head factor per character | `tools/sprite-bake/head_tweak.json`, tool `head_adjust.py` (show, apply, manifest, apply-requests) | One multiplier across walk, mood and talk frames. |
| Head page | `heads.html`, `data/head-sizes.json`, `art/heads/`, `data/head-requests.json`, `tools/heads_test.py` | The Pose Editor copied its GitHub save code. |
| Chin for the walk stand | `tools/sprite-bake/chin_lines.json`, `chin_ruler.py` | Seeded the phase 1 proposals. |
| Chin for mood frames | `tools/sprite-bake/emotion_chin.json`, `emotion_chin.py` (with a `FIX` table) | One row per frame. Seeds the phase 3 proposals. |
| Walk bake | `walk_sheet_frames.py` (`WALK_MATCH`, `PLAIN`, `HEAD_TWEAK`, `BODY_ROWS_PER_PX`, `BODY_SCALE`), rebake only with `walk_splice.py <ids>` on a clean tree | A plain bake overwrites the battle atlases. `build(cid, fix=True)` applies ONE chin px (from the top of each frame) and one factor to all nine frames. |
| Mood and talk bakes | `emotion_frames.py`, `talk_frames.py`, then `bake_story_poses.py` (about 9 to 11 minutes, background; then `git checkout art/chars/pipemo-story.webp data/npc-poses.js`), then `bake_emotion_faces.py`, `bake_talk_faces.py`, `bake_talkpose_faces.py` | `EMO_HEAD` in bake_story_poses.py is the per-character mood size factor. NEVER `import bake_story_poses`. |
| Battle size | `data/battle-size.js` (`BATTLE_SIZE`), `battle_sheet_frames.py`, per-character `bake_<id>.py`, `*_ab.py`, `ability_frames*.py`, `tombo_frames.py` | Rule in docs/CHARACTER_PIPELINE.md section 7: whole figure = real height x 2.01 battle px per inch. |
| Frame count | About 836 painted pose frames in 61 sheets (claude/size-remediation-plan.md) plus the walks and the townsfolk | Proposals, follow rules and CONFIRM ALL make that workable. |
| Dialog faces | `frame_square` crops | Any head change means rerunning the three face bakes (claude/next.md "Faces"). |

## 4. Data files

| File | State | Holds |
|---|---|---|
| `data/pose-manifest.json` | BUILT (`tools/pose-editor/manifest.py`) | Per character: name, inches, `R` (rows), `standH`, sheet file, `headTweak`, `now` {f, h, anchor} = how the walk bake sizes it today, `locked` reason. Per frame: set, key, label, picture, w, h, `ax` (head column), upright, `link` (the standing pose a step follows), proposed `marks` {top, chin, feet} in px, `conf` (high, low). Top level: `tomRows` 42, `taper` 12, order, baseline, kids. |
| `art/poses/<id>/<set>-<key>.webp` | BUILT (117 files, 4.5 MB) | Each frame cut from the approved sheet at source size, no head or size change (quality 92). A mark in picture px is a mark in bake px. Purge when a sheet is replaced. |
| `tools/pose-editor/proposals.json` | BUILT | Lines read by eye: `{id: {sheet, down, up, left: [top share, chin share]}}` of the front standing frame height. Front read one by one; back copies front; side read for tom, tnb, justin, boppy, amy, the rest copy front (all back and side are `conf` low). |
| `data/pose-requests.json` | written by the page on SAVE (not in the repo until Tom saves) | `{version:1, saved, heights:{id:inches}, target:{id:percent}, frames:{id:{key:{sheet, top, chin, feet, ok, mode: now/auto/set, f, h, own, page:{f, h, headRows, wholeRows}}}}}`. `page` is what the page computed for auto and set frames: the bake checks its own numbers against it. |
| `tools/pose-editor/pose_marks.json`, `pose_size.json` | PHASE 2 | Sources of truth after `apply.py`: Tom's confirmed marks, and per frame mode and sizes plus per character head target. A frame with no entry bakes exactly as today. |
| `tools/pose-editor/pose_fit.py`, `apply.py` | PHASE 2 | `fit(img, cid, set, key)`: the one function every bake calls. With no entry it returns the image untouched and the bake's own scale. |

Rule: bakes never guess a chin for a frame that has Tom's mark. The old guesses stay as the fallback for unmarked frames only.

## 5. The auto-size maths (as built in poses.html; `pose_fit.py` must give the same numbers)

Terms: `R(c) = 42 x inch(c) / inch(tom)` rows (Nara keeps her 32 rows). `S = R / standH` rows per px. `T(c)` as decision 5. Marks `top`, `chin`, `feet` in px from the top of the cut frame (row 0 is the top of the hair or cap). `tp` = 12 px taper. A frame is drawn with head multiplier `h` above anchor row `a`, a linear blend from `h` to `f` over `tp` px below it, and body multiplier `f` below that; widths scale with their row, about the head column `ax`.

| Case | Formula |
|---|---|
| Head | `h = T / ((chin - top) x S)` |
| Figure (upright: whole figure from row 0 to the feet line = R) | `f = (R / S - h x (chin + tp/2)) / (feet - chin - tp/2)` |
| Anchor | `a = chin` (Tom's line). In "now" mode the anchor is the bake's own chin anchor. |
| Not upright (later phases) | Whole figure scaled so the head is T: `f = h = T / ((chin - top) x S)`, no warp. |
| In the game now, WALK_MATCH people | `hr = tom_head_rows x tweak`, `sb = (R - hr) / (H - anchor)`, `f = sb / S`, `h = hr / (anchor x S)` |
| In the game now, PLAIN people | `h = tweak`, `f = (H - anchor x tweak) / (H - anchor)` (1 when tweak is 1) |

The page shows per frame: head rows against target and against now, the height it reads as in feet and inches against the real height, FIGURE and HEAD, and the mode. Off target by 5 percent is amber, 10 percent red. Tom's hand values (mode `set`) win over auto.

## 6. The page as built (poses.html)

| Tab | What it does |
|---|---|
| POSE | Step 1 MARK THE LINES: the painting with the three lines; drag, or pick a line and use the arrows (1 px); ZOOM ON HEAD; SAME AS FRONT (copies the front standing lines to a back or side stand); MARK THIS STEP BY ITSELF; CONFIRM LINES moves to the next frame that needs lines; Reset lines. Step 2 SIZE THE POSE: in the game now (left) beside with your change (right), real height line, feet and inches ruler; AUTO SIZE THIS POSE; As in the game now; Figure and Head controls. Filmstrip with status dots (yellow proposed, green confirmed, grey follows, red needs lines). |
| LINE-UP | Every pose of one person, chins or feet on one line, head against target under each, yellow or red frame for outliers, tap to open. AUTO SIZE ALL POSES, CONFIRM ALL LINES. |
| CAST | Everyone standing at real height with a tick at the real height; head row with chins on one line and Tom's head top as the red line; Height (ft, in) and Head target for the picked person; AUTO SIZE EVERYONE. |

Also: Undo (20 steps), work kept on the phone (`aot-pose-draft` in localStorage; it wins over the saved file on load), SAVE N CHANGES bar, EXPORT (copies the JSON), a first-visit note with a Got it button. Chips show how many frames still need lines. Nara and Michael are shown, locked, with one line saying why. Test handle: `window.__PE`.

Differences from the first design (decided while building): a ZOOM ON HEAD button and arrow nudges instead of a magnifier bubble; now and after side by side instead of hold to compare; all pictures load at once (117 small files; make the filmstrip lazy in phase 3 when the count grows).

## 7. Phases

Every phase: clone per CLAUDE.md, read this file, build, test (section 8), look at the page in portrait and landscape, CHANGES entry, push per the procedure in claude/next.md, update STATUS here.

### Phase 1: DONE (`poseedit1`)
Files: `poses.html`, `tools/pose-editor/manifest.py`, `tools/pose-editor/proposals.json`, `data/pose-manifest.json`, `art/poses/`, `tools/pose_editor_test.py`, ADMIN entry in engine/splash.js, CLAUDE.md section, CHANGES entry. Tests passed: pose_editor_test (FAILS: []), smoke (FAILS: []), tag_check. Looked at: all three tabs, portrait and landscape, and the ADMIN list. Not done on a real phone: touch dragging (tested with pointer events in a touch context only).

### Phase 2: apply path for the walk, real heights (NEXT)
Read: `git show origin/main:data/pose-requests.json` (Tom's save; if it is missing, ask Tom one line: has he pressed SAVE in the Pose Editor), walk_sheet_frames.py, walk_splice.py, heights.py, head_adjust.py (apply-requests), poses.html functions `autoSize`, `size`, `span`, `drawFig`.
1. First handle anything Tom reports about the page itself (he will have used it on the phone by then).
2. `pose_fit.py` and `tools/pose-editor/apply.py` (`requests` lists them; `apply` moves them into pose_marks.json and pose_size.json, edits data/heights.json for height changes, rebakes only the touched characters, empties the request file, refuses frames made on an older sheet or with HEAD outside 75 to 145 and lists them).
3. `walk_sheet_frames.build` sizes each frame through `pose_fit.fit` when it has an entry: per-frame anchor, `h / f` as the `grow_head` factor, `f x S` as the body scale. Today one `BODY_ROWS_PER_PX[cid]` serves all nine frames; frames of one direction share a size (decision 11) but the three directions may differ, so the bakes that read `BODY_ROWS_PER_PX` need a per-direction value. Read how `fo` is used in bake_<id>.py before changing it.
4. A height change: edit heights.json, `walk_splice.py <id>`, `heights.py write`, `heights_test.py`. A change to Tom's height or Tom's head moves everyone: say so and confirm with him first (one short question; this is the expensive case).
5. Zero-change proof, then the parity test: bake numbers equal the request's `page` numbers for every frame, within 0.5 row.
6. Before and after pictures for Tom: the stand row and head row (the head-row rule in CHARACTER_PIPELINE section 7).
7. After the bake: `head_adjust.py manifest`, `python3 tools/pose-editor/manifest.py` (so "in the game now" is true again; its `now` must then come from pose_size.json for applied frames), the three face bakes, `pose-facing-apply.py --check`. Mood and talk poses still use the HEAD SIZES factor until phase 3: tell Tom they will not match the walk yet.

### Phase 3: mood and talking poses
Read: emotion_frames.py, emotion_chin.py and json, talk_frames.py, bake_story_poses.py (the EMO_HEAD comments, lines 54 to 120), docs/TALK_POSES.md, docs/EMOTIONS.md.
Manifest and proposals for em_ (8 per person, chin seeded from emotion_chin.json, TOP by eye on ruler pictures) and tk_ (4 per main character). Add the UPRIGHT tick to the page (walk frames are all upright, so phase 1 has no tick). Upright default: happy, loving, surprised, proud, unimpressed, tk_tell; the rest not upright. `pose_fit` replaces `EMO_HEAD` and the per-frame chin row for marked frames; unmarked frames bake as today. Filmstrip grouped by set and lazy. Run bake_story_poses.py in the background, restore the two files named in section 3, rerun the face bakes. Frames: a `reaction_test.py` case with a mood line and a talk line, portrait and landscape.

### Phase 4: battle, KO, extra, story poses
Read: battle_sheet_frames.py, data/battle-size.js, one bake_<id>.py end to end before touching the rest, docs/BATTLE_SYSTEM.md sizes section.
Battle scale: `R_battle(c) = inch(c) x 2.01` px for the idle A frame, and every other battle frame of that character takes the head it gives. `pose_fit` returns the frame scale; `BATTLE_SIZE` becomes the fallback. Hand points and effect anchors read `sp.scale`: check every fighter in the Battle Lab with `tools/kit_test.py <id> --speed2` and look at the contact sheets. Do one character first (Amy), push, then the rest.

### Phase 5: ability and Tombo frames
Read: ability_frames.py and the per-character variants, bake_<id>_ab.py, tombo_frames.py, docs/MOVE_KEYS.md. Same method as phase 4. Props in the frame are part of the picture: the head warp must not touch a prop held above the chin (force figure-only scaling there and show "prop above the chin: head cannot be changed alone"). Boppy's fishing rod already rises beside his head in the walk frames: look at his warped frames closely. Check moves in the Move Lab, not on static strips.

### Phase 6: everyone else, retire HEAD SIZES
Townsfolk (`bake_townsfolk.py`, `townsfolk_common.CHIN`), Michael (three heads: keep `michael_head.py` layers, one mark set per head), Nara (figure only), Ms. Cathy, young Boppy. Move the last uses of heads.html into the CAST tab, then remove heads.html, its ADMIN entry, `data/head-requests.json`, `art/heads/`, `data/head-sizes.json` and `tools/heads_test.py` completely (grep 0).

## 8. Tests and quality bar (every phase)
- In every shell call: `export CHROMIUM=$(ls /opt/pw-browsers/chromium*/chrome-linux*/chrome | head -1); export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.
- `python3 tools/pose_editor_test.py` FAILS: [] ; `python3 tools/smoke.py` FAILS: [] ; `tools/tag_check.py --base origin/main`; `tools/heights_test.py` after any height or walk change.
- Zero-change proof: with empty pose_marks.json and pose_size.json every bake output is byte-identical to main. Run this before wiring Tom's first request in each phase.
- Look at the page at 393x852 and 852x393 (screenshots in tools/shots/poses-*.png, not just a passing test). Look at before and after game frames for every character touched.
- No fuzz: a frame scaled up more than 15 percent from its source is listed for Tom as "paint again" and not baked.
- New build name, CHANGES heading first, `bump_tags.py <TAG> --base origin/main`, purge replaced files.

## 9. Traps
- Anchors: scaling a frame moves its feet and hand points unless it is scaled about the same anchor the engine draws it from. Record that anchor in the manifest and scale about it. Ground poses use the feet line; jumps and sits keep their painted place.
- Other sessions push often and rebake story poses. Take upstream for generated atlases after a rebase and rerun the generators; never push a half-baked atlas.
- Tom's `data/pose-requests.json` saves are commits on main: never overwrite them with an older copy.
- The phone keeps Tom's unsaved work in localStorage and that copy wins on load. If a later phase changes the request format, bump `version` and convert the stored draft in `tidy()` instead of dropping it.
- Tom carrying Rose (`bake_tomride.py`, `rose-ride-anchors.json`) is a special case: leave as today until phase 6.
- Stop-loss applies. If the page and the bake disagree twice, or a pre-marking method misses the same way twice, stop and write what failed here under a new "## Handoff" heading.

## 10. Open, not blocking
- Whether TOP should also drive the dialog face crop (`frame_square`) so faces in the dialog box match the marks. Recommend yes in phase 3; say so to Tom when it lands.
- Whether shoulder width joins the per-pose controls (`headwarp.body_width`). Not asked for. Do not build.
