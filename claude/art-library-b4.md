# Art Library and Music Library status (updated 2026-11-03 11:45, after `gwalk1`, CHANGES 123). READ with claude/next.md. Where this file and next.md disagree on art, THIS FILE WINS. Tom's opening prompt for the next session: "Read claude/next.md and claude/art-library-b4.md, then continue."

## NEXT SESSION TASK: WALKS FOR EVERY OTHER CHARACTER (Tom's build order, 2026-11-03 11:34; no battle or ability poses until every walk is done)
- Grace's walk is DONE and live (below). Next is hero pose then walk for each remaining character (Tom, TNB, Rose, Amy, Justin, Deedee, Boppy, Olivia, Michael, Jojo, Aunt Ellie, Nara, then the overworld kids and NPCs), using Grace's per-frame method: one short pose-first prompt per picture (under about 1,000 characters, no left/right words), ONE attached reference already facing the right way (head-only straighten edit first if its head is turned, like `grace-stand-front-straight`), 1:1 pictures from the Library, results saved with Save (not APPROVE) and attached by Tom. A 3 x 3 sheet prompt invites copied poses and camera-facing heads on sideways bodies; if the Library still has walk entries in that form for these characters, rewrite them first.
- Real height is required before any spec or prompt (Rose 3'4" is on record; Aunt Ellie 5'2" and Olivia 5'5" are assumed, ask Tom).
- Bake each walk from a copy of `tools/sprite-bake/bake_grace_walk_v3.py` and `defringe.py` (key each frame from its own corner colour, defringe, bring directions to one height, feet on a baseline, head on the centre column).
- NEVER RESIZE A HEAD (Tom, 2026-11-03 11:13 "dont resize grace's head", 11:33 never again; CLAUDE.md "No head resizing", CHANGES 123). Grace's bake runs with `k = 1`. Do not use `kidhead.grow_head` for new art. Show a head row only for Tom's eye.
- LATER (only after every walk is approved): battle sheets. Grace's, when it comes, keeps: cozy sweats, no leotard (leotard only for gymnastics ability sheets, ask then); frames 11, 12, 13 worded FLINCH, TIRED, NAP (map to `bt_hurt`, `bt_low`, `bt_ko`); frame 16 BOSSY POINT (`bt_sig`). Old prompt `tools/art-library/prompts/grace-battle.txt` (4 x 4, refs `grace-hero-cutai-v1.png`, `style_key_v1.png`, `height_chart_v1.png`) is the pose inventory; split into per-pose entries (a new entry needs a rule in tools/art-library/groups.js; rerun `node tools/art-library/make-prompts.js` and validate.js; art-library test.py has EXPECT counts and an id order list). Until then her battle art is the OLD `grace-battle-v2` sheet. The battle part of bake_grace.py still has OLD head growth (K_BT); a new battle bake sets it to none.

## GRACE WALK: DONE AND LIVE (2026-11-03 `gwalk1`, c8874e4, CHANGES (121))
- Nine accepted frames (all 1024 x 1024 on magenta, `tools/sprite-bake/src/`): down_stand `grace-walk-v3-stand-front-straight.png`, down_step1 `-step-front-a.png`, down_step2 `-step-front-b.png`; up_stand `-stand-back.png`, up_step1 `-step-back.png`, up_step2 = mirror of step back; left_stand `-stand-side.png`, left_step1 `-step-side-a.png`, left_step2 `-step-side-b.png`. Superseded, do not use: `-stand-front.png`, `-stand-front-level.png`, `-step-front.png`, `-step-front-try2.png`.
- Bake: `python3 -I tools/sprite-bake/bake_grace_walk_v3.py` writes `art/chars/grace-ow.webp` (756 x 120), `data/grace-hires.js`, and also re-writes the battle and KO atlases from the old v2 sheet (byte-identical). Each frame keyed from its own corner; `tools/sprite-bake/defringe.py` cleans pink hair fringe in a thin band along the outline; all directions brought to the front stand's figure height; steps scaled to their stand's head width within 3 percent; feet on one baseline, head on the centre column. Head NOT resized (k = 1; `HEAD_SHARE_TARGET` equals `HEAD_SHARE_NOW` in the script).
- Measured: front stand head about 190 px of 952 (share .20). Stands about 40 rows tall in game (old art 39). Walk atlas frame 28 x 40 rows.
- Known: faint pink rim on thin hair wisps at full size, not visible at game size. Defringe attempt 1 (wide) damaged the sweater; attempt 2 (edge band) kept the sweater and left some wisps. Stopped there (stop-loss logic). If Tom sees pink in game, change the input (re-key from a cleaner source), do not tune the defringe a third time.
- Not verified on Tom's phone yet.

## HOW GRACE'S WALK FRAMES WERE MADE (history, one paragraph)
Sheets of 9 poses from one prompt repeated drawings and gave sideways bodies camera-facing heads (prompt about 6,000 characters, poses at the end, puzzle wording, master reference faces the camera). Fix (method 4): one short pose-first prompt per picture, one reference that already faces the right way. Stands came from Tom's sheet 2 (`grace-walk-sheet2-v1.png` cells 1, 4, 7, upscaled, borders cleaned). Steps: `grace-step-front`, `grace-step-back`, `grace-step-side-a`, `grace-step-side-b`, plus `grace-stand-front-straight` ("Grace walk 0", head-only edit of a levelled stand, because edits copy the source's head pose: the front step failed twice the same way until the input changed) and `grace-step-front-b`. About $0.05 per picture.

## GRACE HERO (history)
- Master pose Tom approved 11-02 14:09: `tools/sprite-bake/src/grace-hero-cutai-v1.png` (made in his outside AI; head about .21). Tom said 11-02 18:06 he is done with the outside AI: use the Library. Three Library generations of the hero came out smooth (no brushwork). Two-step scene method entries (`grace-hero`, `grace-hero-scene`, `grace-hero-cut`) are no longer needed for Grace.
- The style key (`docs/reference/style_key_v1.png`) and CHARACTER_PIPELINE section 7 say Grace's head share is about .25. Tom overrode that for Grace's bake (11-03): her head stays as painted. The height chart `docs/reference/height_chart_v1.png` (built by `python3 -I tools/make_height_chart.py`, edit `CAST`) still draws her at .25; set it to her real .20 if Tom asks.
- NOT verified: that xAI accepts the 3.4 MB school yard picture.

## Phase C step 1 DONE (3e478ca, CHANGES (95))
- `docs/reference/height_chart_v1.png`: Justin 6'4", Tom 5'11", TNB 5'10", Boppy 5'7", Amy 5'5", Deedee 5'5", Grace 4'2", Rose 3'4", Mudling 16". Adult head .215. ASSUMPTIONS: Rose head share .27, Mudling 16 in. Olivia off (height not on record).

## Music Library: DONE (`music1`, 64be2f2, CHANGES (93), docs/MUSIC_LIBRARY.md section 6; Project copy claude/music-library.md)
- `music.html`: 38 tracks, New take via ElevenLabs Music (key `aot-el-key`), Export music takes. NOT run: the live ElevenLabs Music call, Safari Blob storage, sw_test.py. Tom's first live make (`levelup`, 4 s) has no reply on record; remake nothing else until that works.
- Merge: `python3 -I tools/music-library/merge-local.py <export> music`, `node tools/music-library/make-index.js`, bump `?v=` of `engine/music-clips.js` if MC_TRACKS changed, `python3 tools/music-library/seam.py <id>` per loop, tests, CHANGES, push.

## Art Library status
- Style key v1 approved. art.html: GENERATE works from Tom's phone with his xAI key (model grok-imagine-image-2.0; refs go to /v1/images/edits). UX rebuild (CHANGES (111)): collapsed rows in groups per tab. Background comes out crimson or magenta, not exact #FF00FF: bakes key from the corner colour. Results stay on Tom's phone (IndexedDB, last 5) until APPROVE; art.html loads data/art-prompts.json with no-store (no tag bump for json changes).
- B5 bake Action (f2a2bd8, CHANGES (90)): `.github/workflows/art-bake.yml`, `tools/art-library/art_bake.py`, `bump_tags.py`. Optional `bake` field in make-prompts.js entries. NOT verified on real GitHub Actions.
- Tom has NOT made the GitHub token, so APPROVE and REJECT do not work yet. Steps: github.com > Settings > Developer settings > Personal access tokens > Fine-grained > only adventures-of-tom, Contents Read and write.
- Test note: tools/art-library/test.py "blocked row opens with GENERATE disabled" fails on and off (also on unchanged main). Not fixed.

## NEXT (ordered)
1. Tom's phone report on Grace's new walk (walk her around the Square in all four directions).
2. Hero pose then walk for every other character (above), Rose first (needs her photos, 3'4"). Battle sheets only after all walks.
3. (reserved)
4. Tom's phone report on the Music Library first live make.

## Rules and tests
- `git pull --rebase` before editing data/art-prompts.json (Tom's phone commits to main). make-prompts.js keeps status, versions, rejects for existing ids. Latest CHANGES known: (123).
- Tests: `node tools/art-library/validate.js`, `python3 tools/art-library/test.py` (EXPECT counts per tab and an id order list; update when entries are added), `python3 tools/art-library/bake_test.py`, `python3 tools/music-library/test.py`. export CHROMIUM=$(ls /opt/pw-browsers/chromium*/chrome-linux*/chrome | head -1); export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers before any Playwright run.
