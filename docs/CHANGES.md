## anim-deedee-scrub-1irj (2026-11-21): Deedee's "Hand Me My Glasses" Scrub brushes longer, arm out toward the monster

Card c-anim-deedee-scrub-1irj. Tom (Battle Guide, b3s17a): "Longer brushing, outward towards monster".
| | |
|---|---|
| Kept | The rev 1 Wan prompt word for word except one MOTION phrase, the start picture `art/clips/start/deedee-hero.png`, every setting (720p, 9:16, 5 s, first frame only so the glasses stay on), the bake shape (strike, every 3rd picture, 1.5x, figure 99.3 rows) |
| Changed | "scrubs it forward to the left once in one firm stroke at chest height. Without repeating the stroke," became "reaches it far out forward to the left at chest height, and scrubs back and forth three times in long firm strokes. Without scrubbing again," (`tools/art-library/prompts/wan-deedee-scrub-v2.txt`, job deedee-scrub rev 2) |
- Video: wan-gen run 44930655300, $0.50. Source `art/raw/clips/wan-deedee-scrub-v2.mp4`, baked pictures 9 to 132, hit at 81 (42 pictures, 2.8 s in the game; was 1 stroke, 2.0 s). Her arm stays out toward the monster for about 1.3 s while the brush goes out and back three times.
- Plan 4.4: glasses on her own eyes, a scrub brush, same woman and style; standing height the same first and last; feet within 0.8% of the frame height; background flat, cutout clean, never touches an edge. Measured clip gate: pass. Rev 1 files purged (`wan-deedee-scrub-v1.mp4`, `wan-deedee-scrub-v1.txt`).
- Tom's card: t-anim-deedee-scrub-1irj.

## anim-deedee-windex-z9p8 (2026-11-21): Deedee's Windex Spritz is a Wan 3.0 video now, made from the same prompt

Card c-anim-deedee-windex-z9p8. Tom (Battle Guide, b3s17a): "Remake with wan".
| | |
|---|---|
| Kept | The prompt of the approved Grok clip clip-deedee-windex, word for word (now `tools/art-library/prompts/wan-deedee-windex-v1.txt`), and the bake shape (strike with a hit picture, 1.5x, figure 99.3 rows) |
| Changed | Only what the note names: the video model (Wan 3.0 on fal instead of grok-imagine-video-1.5-lite) and with it the family route's start picture and settings (`art/clips/start/deedee-hero.png`, 720p, 9:16, 5 s, same first and last frame) |
- Video: wan-gen run 44930655300, $0.50. Source `art/raw/clips/wan-deedee-windex-v1.mp4`, baked pictures 21 to 117 every 3rd, hit at 69 where the mist leaves the nozzle (33 pictures, 2.2 s). First cut ended at 105 with her hand still on her hip; recut to 117 so it ends in her stance.
- Plan 4.4: a blue spray bottle from behind her back, one squeeze with a small mist, tucked away; same woman and style; height and feet unchanged throughout; last picture against first 0.96 of 255; cutout clean. Measured clip gate: pass.
- The Art Library entry clip-deedee-windex is set to rejected with Tom's note (as anim-grace-give-q4es did), so the art-bake job does not cut the old Grok video over the new one.
- Tom's card: t-anim-deedee-windex-z9p8.

## anim-deedee-give-yy1o (2026-11-21): Deedee's Giving (support moves) is a Wan 3.0 video now, made from the same prompt

Card c-anim-deedee-give-yy1o. Tom (Battle Guide, b3s17a): "Remake with wan".
| | |
|---|---|
| Kept | The prompt of the approved Grok clip clip-deedee-give, word for word (now `tools/art-library/prompts/wan-deedee-give-v1.txt`), and the bake shape (kind state, every 2nd picture, 1.5x, figure 99.3 rows) |
| Changed | Only what the note names: the video model (Wan 3.0 instead of Grok lite) and with it the family route's start picture and settings (`art/clips/start/deedee-hero.png`, 720p, 9:16, 5 s, same first and last frame) |
- Video: wan-gen run 44930655300, $0.50. Source `art/raw/clips/wan-deedee-give-v1.mp4`, baked pictures 18 to 84 (34 pictures, 1.5 s).
- Plan 4.4: one open palm held out to the left, pulled back, still; same woman and style; height and feet unchanged; last against first 0.96 of 255; cutout clean, hand never reaches the edge. Measured clip gate: pass.
- The Art Library entry clip-deedee-give is set to rejected with Tom's note, so the art-bake job does not cut the old Grok video over the new one.
- Tom's card: t-anim-deedee-give-yy1o.

## anim-deedee-ko-yes1 (2026-11-21): Deedee's knock-out is a video now: she wobbles and sits down on the ground

Card c-anim-deedee-ko-yes1. Tom (Battle Guide, b3s17a): "Make".
- No new video was paid for. Her second Wan knock-out video from wanch1 (job deedee-ko rev 2, prompt `wan-deedee-ko-v2.txt`, already paid) was measured again the way Rose's approved knock-out was: her lowest drawn point sits 32 px of 1,280 (2.5%) above her standing feet, Rose's 28 px (2.2%). wanch1 had counted it as floating; by the same measure it is level with the clip Tom approved, and it shows a drawn shadow under her, as Rose's does.
- Plan 4.4: dizzy, a wobble, sinks straight down to sit on the ground with eyes closed and head drooping, held; same woman and style; background flat (a slight tint shift, keyed out clean: 28 stray pixels in 1.26 million); never touches an edge. Measured clip gate (ko: no hop, does not fall forward): pass.
- Bake: `art/raw/clips/wan-deedee-ko-v2.mp4`, pictures 34 to 112 every 2nd (40 pictures, 1.8 s), `data/clips/deedee-ko.js`. `B3_BODY_CLIPS.deedee.ko` points at it; her painted ko row (hurt pose, kneel) is purged from `B3_BODY_PAINT`. Deedee's dodge is now her only painted state.
- Deedee, Dodge (card c-anim-deedee-dodge-y4m3): two Wan tries, $1.00, not handed to Tom (stop-loss). Retry 1 (prompt without "away to the right") kept her feet down but she ducked forward to the left and her arm left the frame; retry 2 (one change: "back to the right") went the right way, feet down, but her flung arms ran off both edges and Wan drew a small object flying past. Arms out of the frame twice is the stop-loss. Next: the same prompt with the figure shrunk to 80% inside the video (`pad`, the change that kept her spread hands in frame on her victory); written on the card.
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py`, smoke. Looked at in the Battle Guide player, portrait and landscape. Spend this session: $2.50 on fal (ledger $30.60).
- Tom's card: t-anim-deedee-ko-yes1.

## board-artfallback (2026-11-21): new card to build the picture fallback rule (xAI first, WAN after 2 misses, stop after 4)

Tom (09:49): "we should use XAI as the default for images, but then if there are more than two failed attempts with XAI, then we should switch the image service to WAN." Approved 09:54. Plan with the five refinements: claude/art-fallback-plan.md. Card c-artfallback (Sonnet 5.5, medium). Board only, no game change.

## anim-grace-squeeze-qxim (2026-11-21): Grace's Soup-Dumpling Squeeze is an attack now: she pushes the dumpling at the monster with both hands and squeezes it

Card c-anim-grace-squeeze-qxim. Tom (Battle Guide, b3s17a): "This is an attack move, so she needs to hold the squishy out and basically essentially hold it with both hands and kind of push the monster with it and squeeze it while she does so".
| | |
|---|---|
| Kept | Everything in `wan-grace-squeeze-v2.txt` outside the one MOTION sentence the note names (the three parts, the pocket, the round white dumpling squishy, the grin, puffing back up, tucking it away, the return), the start picture, every Wan setting, the bake shape (strike, every 3rd picture, 1.5x, figure 90 rows) |
| Changed | One MOTION clause. Was: "holds it out toward the left in both hands at chest height and squeezes it hard once between her palms until it squishes flat". Now: "holds it in both hands at chest height and pushes it forward toward the left once, straightening both arms as she squeezes it hard between her palms until it squishes flat" (`wan-grace-squeeze-v3.txt`, job `grace-squeeze` rev 3) |
- Video: wan-gen run 44929359366, $0.50. Source `art/raw/clips/wan-grace-squeeze-v3.mp4` (v2 removed), baked pictures 18 to 132, the hit at picture 81 where her arms are straight out (39 pictures, 2.6 s in the game, hit at 1.4 s).
- Plan 4.4 checks: both arms push straight out to the left with the dumpling pressed into a flat oval, then it comes back; same girl; standing height 1,037 px first and last; feet on row 1,153 in all 150 pictures; never touches an edge; last against first 1.00 of 255. Clip gate (measured part): no flags (squeeze is an invented move: Tom's watch is the look check).
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py` FAILS [], smoke (its board_sync_test fails the same two checks on main before this build: R5 replays the live board at a fixed time). Looked at in the Battle Guide player at the hit, portrait and landscape.
- Fixed on the way: main carried unresolved merge markers at the top of this file (the artbake1554 and guidegen1a entries); both entries kept, markers removed.
- Tom's card: t-anim-grace-squeeze-qxim.

## guidegen1b (2026-11-21): the Battle Guide folds your note into an animation's prompt and shows what changed

Card c-guidegen part 2. In the player sheet, a video has a box "What should change" and a no-video animation has "Anything to add"; Update the prompt commits `data/guide-reconcile.json` (message `guide: reconcile <animation id>`) and the `guide-reconcile` Action (`tools/guidegen/reconcile.py`, xAI text model, the existing repo secret XAI_API_KEY, no new key) returns the new prompt plus three plain lines (kept, changed, could not use and why), or one question when the note is contradictory, impossible or says nothing to change. The answer is checked in code first (parts in order, untouched parts identical, 70% of the words kept, length within 20%, one action once, no banned words); a broken answer is sent back once, a second failure is marked Check this one. He can edit the prompt by hand and Keep it (kept in this browser until a video is made). Nothing is generated yet. Tests: `python3 tools/guidegen/guidegen_test.py`, `python3 tools/battle_guide_test.py`. Plan: `claude/guidegen-plan.md`.

## anim-rose-give-w5ws (2026-11-21): Rose's Giving (support moves) is a Wan 3.0 video now, made from the same prompt

Card c-anim-rose-give-w5ws. Tom, from the Battle Guide: "Remake with wan".
- Kept: the prompt of the approved Grok clip, word for word (`clip-rose-give` in `data/art-prompts.json`, now `tools/art-library/prompts/wan-rose-give-v1.txt`): one open hand reached forward at chest height, palm up, once, then back to the stance and held.
- Changed: the video model (Wan 3.0 on fal, 720 x 1280, 5 s, job `rose-give` rev 1) and so the start picture (her large left-facing hero `art/clips/start/rose-hero.png`), sent as first and last frame as Grace's Wan give.
- Checks (plan 4.4): reads as a hand-over, palm up, then back; the same girl; standing height last 0.999 of first, feet on the same row in every picture; flat magenta, no halo, never touches an edge; ends where it began. Measured clip gate: no flags. The vision part needs the xAI key and was not run.
- Bake: video pictures 22 to 92, every 2nd, 36 pictures at 1.5x (1.6 s), `data/clips/rose-give.js`, `art/clips/rose-give.webp`, source `art/raw/clips/wan-rose-give-v1.mp4`. The Grok entry `clip-rose-give` is set to rejected with the reason, so the art-bake job does not cut the old video over this one.
- Spend: wan-gen run 44929736650, booked $0.50 (live price $0.23).
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py` FAILS [], smoke; portrait and landscape looked at.

## anim-rose-victory-vqjc (2026-11-21): Rose's Victory is a Wan 3.0 video now, made from the same prompt

Card c-anim-rose-victory-vqjc. Tom, from the Battle Guide: "Remake with wan".
- Kept: the prompt of the approved Grok clip, word for word (`clip-rose-victory` in `data/art-prompts.json`, now `tools/art-library/prompts/wan-rose-victory-v1.txt`): she giggles, jumps straight up once with both arms high, lands on the same spot and holds the arms-up grin. Kept the start-picture-only setting of the other Wan victories (the clip ends in the held pose).
- Changed: the video model (Wan 3.0 on fal, 720 x 1280, 5 s, job `rose-victory` rev 1) and so the start picture (her large left-facing hero `art/clips/start/rose-hero.png`, as every Wan clip of hers). Also `pad: 0.8` (the picture shrunk to 80% inside the frame), the fix that kept Deedee's raised hands and Rose's Giddyup hair inside the frame.
- Checks (plan 4.4, every 5th picture plus measurements): reads as a victory jump and a held arms-up grin; the same girl; standing height last 0.98 of first, feet back on the start row within 0.6% of her height in the hold; flat magenta, no halo, never touches an edge; no return needed (state clip). Measured clip gate: one flag, size 1.09x, only in the airborne pictures where the size fit has under 80 matched details (0.99 to 1.04 in the hold): read as a false reading. The vision part of the gate needs the xAI key and was not run.
- Bake: video pictures 18 to 110, every 2nd, 47 pictures at 1.5x (2.1 s), `data/clips/rose-victory.js`, `art/clips/rose-victory.webp`, source `art/raw/clips/wan-rose-victory-v1.mp4`. The Grok entry `clip-rose-victory` is set to rejected with the reason, so the art-bake job does not cut the old video over this one.
- Spend: wan-gen run 44929736650, booked $0.50 (fal's live price $0.045 a second, $0.23).
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py` FAILS [], smoke; portrait and landscape looked at.

## 2026-11-21 (3): Art Library bake, bg-29-grump-hollow (`artbake1554`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- bg-29-grump-hollow: `bake_battle_bg.py 29-grump-hollow` ran from art/raw/battle/bg-29-grump-hollow-v1.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## guidegen1a (2026-11-21): the Battle Guide now shows a prompt for every animation, and says what is missing before one can be made

Card c-guidegen part 1. `tools/guidegen/build_map.js` writes `data/guide-anims.json`: for each of the 346 guide animations its Wan job or Art Library entry, the prompt (the real one where a video exists, otherwise a starter draft that keeps the same person's approved prompt and changes only MOTION), start picture, price, and what is missing. The player sheet shows it under the video: version, route, price a try, where the prompt came from, and "Cannot be made yet" for someone with no start picture. Nothing is generated and no key is on the page yet. Tests: `python3 tools/guidegen/build_map_test.py`, `python3 tools/battle_guide_test.py` (the stand-in board now starts without Tom's real animation notes). Plan: `claude/guidegen-plan.md`.

## board-guidegen (2026-11-21): new card to make and remake battle videos from the Battle Guide

Card c-guidegen. Tom (09:25): generate a missing video, or give feedback on one, have it merged into the prompt and regenerate, all from the Battle Guide. The card holds the full prompt (Sonnet 5.5, high). Board change only; no page or game file changed.

## anim-grace-give-q4es (2026-11-21): Grace's Giving (support moves) is a Wan 3.0 video now, made from the same prompt

Card c-anim-grace-give-q4es. Tom (Battle Guide, b3s17a): "Redo with wan".
| | |
|---|---|
| Kept | The prompt of the approved Grok clip clip-grace-give, word for word (now `tools/art-library/prompts/wan-grace-give-v1.txt`), and the bake shape (kind state, every 2nd picture, 1.5x, figure 90 rows) |
| Changed | Only what the note names: the video model (Wan 3.0 on fal instead of grok-imagine-video-1.5-lite) and with it the family route's start picture and settings (`art/clips/start/grace-hero.png`, 720 x 1280, 5 s, first and last frame, seed 81), job `grace-give` in `tools/art-library/wangen-jobs.json` |
- Video: wan-gen run 44929359366, $0.50 (fal ledger $25.10). Source `art/raw/clips/wan-grace-give-v1.mp4`, baked pictures 27 to 89 (32 pictures, 1.4 s in the game).
- Plan 4.4 checks: reads as a give (one open palm offered to the left, pulled back, still); same girl, face, outfit and style; standing height 1,037 px first and last; feet on row 1,153 in all 150 pictures; background flat, never touches an edge; last picture against first 1.03 of 255. Clip gate (measured part): no flags. The vision part only advises on give (an invented move, CLAUDE.md "Clip quality gate"), so Tom's watch is the look check.
- The Art Library entry clip-grace-give is set to rejected with Tom's note, so the art-bake job does not cut the old Grok video over the new one (as wanch1f did for its replaced entries). Its approved source `art/raw/clips/clip-grace-give-v1.mp4` stays (Library history).
- Grace, Dodge (card c-anim-grace-dodge-p7wh): not made, $0. Wan missed it twice the same way in wanch1 (her feet leave the ground), so a third Wan try is past the stop-loss; the card is retired into c-wanch2 (dodge on Kling 4) with Tom's note.
- `tools/battle_guide_test.py`: its stand-in board drops real note cards on the two animations it sends notes on (Tom's real Lounge Pass card made 4 of its checks fail on main).
- Tests: `b3_test.py s8` FAILS [], `battle_guide_test.py` FAILS [], smoke. Looked at in the Battle Guide player, portrait and landscape.
- Tom's card: t-anim-grace-give-q4es.

## board-guideplanned (2026-11-21): the Battle Guide's next card now shows everything planned but not built, marked PLANNED

Card c-battleguide2. Tom (09:21): "Can you do the same thing with anything else that's planned but not built yet". The card's prompt gained Part 4 (unbuilt moves, the BAG, Tombo skins, which chapters are on the new battle, Part 2 monsters, missing rules, a What is coming topic), its effort went from medium to high, and its title changed. Board change only; no page or game file changed.

## board-guidevibe3 (2026-11-21): the Battle Guide's next card now also shows each person's third Vibe, marked as planned

Card c-battleguide2. Tom (09:19): "How come I'm not seeing the third vibe for each character". Fact: the guide shows what the game holds, and the game has 20 of the spec's 30 Vibes; the third of each person is battle stages 19 to 21. Board change only; no page or game file changed.

## b3s17c (2026-11-21): chapter 4's story fights now run on the new battle (BY CHAPTER), with Vibe Points and tips

Card c-b3s17, part c. Chapter 4 joins chapters 1 to 3: the Cue Card Crab, the Clapper Snapper, the Boom Mic Moth (with their Extra Extras) and The Director's Cut play on Battle 3 with the bestiary's Vibe Points (8 each, 26 for the boss) and tips for Battle 3 (`ch4crab`, `ch4clapper`, `ch4moth`, `directorscut`): Pet Peeves and Resists, Posterboard Shell, Card Toss and Bleed, Scene One Marker!, Skill Lock (only Pocket Vibe Skills), CUT! (a Break, an interrupt, Blind or Tom's Suite Door Slide stops it) and ACTION! (strip the speed buff). No Warmth bar, no HEART, no Tombo. A win over The Director's Cut sets `kind:directorscut`, so the kind ending plays.
- Scene change: TNB's coaching after a loss has a Battle 3 version (`B3_CH_ON(4)`); the first line is the same as before so its clip still plays, the second line is new and not recorded yet (speech synthesis until baked, listed under No clip yet in the Voice Library). OLD keeps the old line.
- Tests: `tools/ch4_b3_test.py` in portrait and landscape (11 steps from Chapter Select to the studio; every fight on Battle 3, no Warmth words, tips once each, Vibe Points paid), `tools/b3-check-s17.js` (chapters 1 to 4), `unused_voice.py` 0 on all checks. `tools/b3_story_test.py` failed once on its "a save made on Battle 3 loads with the switch on Old" step after a long run and passed on every re-run on its own; the chapter 1 scene fight in that step had not started after 30 seconds (an intro card was still up). Not changed.
- Not looked at: the chapter 5 fights (last part).

## costsduo1 (2026-11-21): AI Costs has a folded and an unfolded iPhone Duo layout

Card c-costsduo1, from Tom's answer "Build it as drawn" on t-costsduo-go. costs.html now picks one of three layouts by width and re-picks when the width changes (unfolding the phone), so no reload is needed. Both parts of the plan (a: pocket, b: open book) went out in this one build.

- Pocket (under 900 px: folded 382 and 466, open upright 669): tabs at the bottom, a filter pill that opens a sheet (Dates, Show; on Ledger also Service, Kind, Subtotal by, tick boxes, CSV), the first Overview screen shows the total, four tiles and the next renewal at 382 x 580, two-line charges, a charge opens in a sheet with its reference, services open as a screen with a back arrow, Totals has a By month / By service list. A finger replaces hover: tap a month bar, the share bar or the running total for the split.
- Open book (900 to 1,099: open sideways 951): a rail of the four screens, the list on the left half and what was tapped on the right half (a service on Overview and Services; subtotals as tap-to-filter bars plus the charge details on Ledger; the month grid, kind and billed-through on Totals).
- Desktop (1,100 and up) is unchanged: `tools/costs_test.py` passes. The viewport is now `width=device-width`.
- Call made: the two parts shipped as one build instead of costsduo1a then costsduo1, because the shared pieces (filter sheet, details, tap in place of hover) are the same code.
- Test: `tools/costs_duo_test.py` (382 x 580, 466 x 657, 669 x 869, 951 x 648; every screen; no sideways scroll, totals equal the file, no text under 12 px, no tap target under 36 px, tabs, rail, taps, resize 382 to 951 without a reload). Every picture looked at.
- Purged: `docs/costs-duo-mock.html` (the drawing) and its mentions in docs/COSTS.md and claude/costs-duo-plan.md.
- Not looked at: a real Duo (a desktop browser with touch emulation was used).

## 2026-11-21 (2): Art Library bake, prop-gate-row-amyhouse-open (`artbake1553`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- prop-gate-row-amyhouse-open: background keyed from the corner colour rgb(208, 10, 122)
- prop-gate-row-amyhouse-open: `bake_gate_art.py row-amyhouse open` ran from art/raw/props/prop-gate-row-amyhouse-open-v1.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## 2026-11-21 (1): Art Library bake, prop-gate-row-amyhouse, prop-gate-row-amyhouse-open (`artbake1552`, made by the art-bake Action)

- Tom approved these pictures in the Art Library; the Action baked them and moved the cache tags (tools/art-library/art_bake.py, bump_tags.py).
- prop-gate-row-amyhouse: background keyed from the corner colour rgb(226, 5, 106)
- prop-gate-row-amyhouse: `bake_gate_art.py row-amyhouse locked` ran from art/raw/props/prop-gate-row-amyhouse-v1.png
- prop-gate-row-amyhouse-open: background keyed from the corner colour rgb(208, 10, 122)
- prop-gate-row-amyhouse-open: `bake_gate_art.py row-amyhouse open` ran from art/raw/props/prop-gate-row-amyhouse-open-v1.png
- Not seen on the phone yet. If something is stale, press RELOAD on the title screen first.

## b3s17b (2026-11-21): chapter 3's story fights now run on the new battle (BY CHAPTER), with Vibe Points and tips

Card c-b3s17, part b. Chapter 3 joins chapters 1 and 2: the Soggy Socks, the Tangle and the Bobber, the Snag and Old Iron-Gill play on Battle 3 with the bestiary's Vibe Points (9 each, 27 for the boss) and tips for Battle 3 (`ch3sock`, `ch3tangle`, `ch3snag`, `irongill`): Pet Peeves, Resists, the wind-ups (Squelch, Big Knot, Undertow, Pepper Belch, Deep Dive), the Sock Iron-Gill hides behind, Toasty and Steam Cloud!. No Warmth bar, no HEART, no Tombo. A win over Iron-Gill sets `kind:irongill`, so the kind ending plays.
- Scene changes: the "New Tombo: You Hold the Net" toast is skipped on Battle 3 (the flag stays). Boppy's coaching after a loss has a Battle 3 version (`B3_CH_ON(3)`); its first line is the same as before so the recorded clip still plays, the second line is new and not recorded yet (it plays by speech synthesis and shows under No clip yet in the Voice Library). OLD keeps the old line.
- Tests: `tools/ch3_b3_test.py` in portrait and landscape (12 steps from Chapter Select to home; every fight on Battle 3, no Warmth words, tips shown once each, Vibe Points paid), `tools/b3-check-s17.js` (chapters 1 to 3), `unused_voice.py` 0 on all checks. `tools/b3_chapter_lib.py` now presses Enter through a close-up inside a scene.
- Not looked at: the chapter 4 and 5 fights (next parts).

## costsduoplan (2026-11-21): AI Costs on the iPhone Duo: assessment, design and a drawing to open on the phone

Card c-costsduoplan. Tom: "Assess the user experience and come up with an idea for supplemental design that supports layout for iPhone duo folded and unfolded views ... create the necessary Kanban cards to kick off this process via the board".

- Assessment (measured on the live page): the desktop layout is fixed at 1,280 wide, so the folded Duo shows it at 30% (table text 4.2 px, filter buttons 9 px tall), open upright at 52%, open sideways at 74%. The split of a month and the reason behind "Confirm amount" only show on hover.
- Design, in `claude/costs-duo-plan.md`: one page, three layouts by width. Pocket (under 900 px): one column, the total, four tiles and the next renewals on the first screen, four tabs at the bottom, two-line charges, details in a sheet. Open book (900 to 1,099 px, the Duo open sideways): two panes that meet at the fold, the list on the left and what was tapped on the right; on Ledger the charges sit beside their subtotals. Desktop unchanged.
- Drawing: `docs/costs-duo-mock.html`, four frames at the real sizes with typed numbers. On the Duo it fills the screen and follows fold and unfold; Overview and Ledger switch. It is deleted when the real page matches it.
- Nothing in costs.html changed. Cards: Tom's decide card t-costsduo-go starts the build card c-costsduo1 (Sonnet 5.5, medium) by itself.

## b3s17a (2026-11-21): chapter 2's story fights now run on the new battle (BY CHAPTER), with Vibe Points and new tips

Card c-b3s17, part a. Chapter 2 joins chapter 1 in `B3_STORY.chapters`: the two Smoglets (new row `smoglet2`, 10 VP), the Ticket Flurry, the Coyote and The Big Shake play on Battle 3 with the bestiary's Vibe Points (10 each, 30 for the boss) and tips written for Battle 3 (`ch2lawn`, `ch2flurry`, `ch2coyote`, `bigshake`; no Warmth, no HEART, no Tombo). OLD still plays chapter 2 on battle 2 on the same save.
- Two calls made: (1) `b3sEnd` sets the `kind:<boss>` flag on a boss win from chapter 2 on, because chapters 3 to 5's after-boss scenes branch on it and Battle 3 has no Warmth bar to set it (chapter 1 is unchanged, so Milestone B is not disturbed). (2) The two chapter 2 "New Tombo" toasts are skipped on Battle 3 (`B3_CH_ON(n)` replaces `B3_CH1_ON` in `data/scenes.js`); the Tombo flags stay, Tombos return in stage 16.
- Test: `tools/ch2_b3_test.py` (portrait and landscape, shared helpers in `tools/b3_chapter_lib.py`; checks per fight: Battle 3, no Warmth words, tips shown once each, Vibe Points paid). Simulator checks: `tools/b3-check-s17.js` (2323 checks, none fail). `tools/b3_story_test.py` moved to chapter 6 for "not switched".
- Not looked at: the chapter 3 to 5 fights (parts b, c and the last push).

## costs1icon (2026-11-21): the AI Costs page has its own browser tab icon

Card c-costs1icon. Tom: "Give it a unique favicon". The page used the Admin gear. It now has a gold receipt with a dollar sign on the admin icons' dark background: `icon-costs-32.png` (browser tab) and `icon-costs-180.png` (home screen), drawn by `tools/make_costs_icon.py`. `tools/costs_test.py` checks the page links both and that they differ from the Admin icon (FAILS: []).

## battleguide1 (2026-11-21): Battle Guide, a reference page for the new battle system that fits the Duo folded and unfolded, with a player for every battle video and a note to Claude on any animation

Card c-battleguide. Tom (11-21 07:15): "create an iPhone Duo folder and unfolded optimized page for the latest version of the battle system... a reference guide for me as i test... a way to preview each animation and provide feedback on the animation directly Claude which opens a new ticket to regenerate the animation based on the feedback." And 07:26: "It's favicon should be something related to the battle system library different from the battle lab favucon."

| Piece | What it is |
|---|---|
| Page | `battle-guide.html` (ADMIN > Battle system > Battle Guide). Five tabs: Rules, Family, Monsters, Statuses, Animations, plus Search. No game engine is loaded. |
| Always the latest | It reads `index.html`, loads the game's own `data/b3-*.js` in the game's order and renders from them: 10 family members, 20 Vibes, 81 moves, 63 monsters, 129 statuses and 3 hazards today. Rule numbers in the Rules tab come from `B3_RULES`. The header shows the game build. |
| Duo | One column with a bottom tab bar when folded (466 x 657, 678 x 445); list and detail side by side when unfolded (951 x 648, 669 x 869). The switch is both sides at least 560 px, the game's own number (docs/DUO.md). |
| Animations | 346 listed (body states, family moves, monster attacks and wind-ups); 68 are videos today. A video plays from the same packed picture the game uses (pause, frame slider, 1x, half and quarter speed, the HIT frame marked). A move with no video says so. |
| Note to Claude | The player has Send to Claude. It saves a Claude card on the board (`c-anim-...`, theme Battle Animations, Opus 5.5 medium, fields `anim` and `notes`) with the full prompt; a second note on the same animation joins the open card. The sent screen shows the five handoff items and Copy prompt. It uses the GitHub token the Board page saved. |
| Icon | `icon-battleguide-180.png`, `icon-battleguide-32.png`: an open book with a gold star on teal (the Battle Lab's is crossed swords on maroon). |
| Test | `python3 tools/battle_guide_test.py` (4 Duo sizes, about 1 minute, FAILS: []); pictures `tools/shots/battleguide-*.png`. Facts: `docs/BATTLE_GUIDE.md`. |

Calls made: the third Vibe of each person is not shown because its data is not built; the game's own tips are shown word for word; character one-liners are written in the page (`WHO`) from docs/CANON.md and the spec's headings. Not done: a move with no video cannot be played in the page (it has no animation of its own, only the standard motion); card c-battleguide2 adds a way to see it in a real fight. Nothing in the game changed.

## costs1 (2026-11-21): ADMIN > AI COSTS, a desktop page for what every AI service costs

Tom: "come up with an admin screen for all the AI services we are connected to, the subscription type i have, what it allows, what my balance is, how much ive spent so far ... a complete history of my spend with dates for each transaction so i can total and subtotal in any way that i want. as well as a final cost total screen ... including with claude".

- New page `costs.html` (its own address, button AI Costs on admin.html, no game code): Overview, Services, a screen per service, Ledger and Totals. Laid out for a desktop browser in landscape only.
- New data file `data/costs.json`: 8 services (Claude, Google AI, xAI API, X Premium, ElevenLabs, fal.ai, Sorceress, GitHub) and 29 charges read from the receipts in Tom's email, Jul 30 to Nov 20, $975.44 in all. Every row has its date, Pacific time, kind, where it was billed and the order or invoice number. Three amounts are marked to confirm.
- Ledger: search, service chips, kind, sort, subtotal by service, month, week, kind or paid through, tick rows to add them up, CSV of the rows shown. Totals: grand total, running total, service by month (a figure opens its charges).
- What each plan allows is written with where it was read (provider pages read Nov 20, receipts, repo docs). Holes are listed under Needs a look (Apple sends no renewal receipts, one ElevenLabs invoice has no email, xAI and ElevenLabs balances not read).
- Not done: balances are not read automatically and the jobs do not log their spend into the ledger yet (card c-costs2, steps in docs/COSTS.md). "Add a charge" and "Record the balance" save to the browser only.
- Docs: docs/COSTS.md. Test: `python3 tools/costs_test.py` (FAILS: []).

## qa-battle2 (2026-11-21): old battle screen problems checked on the new battle; none exist there, nothing changed

- Card c-qa-battle2 (chapter 1 QA report, build keysecrets2). Ran `tools/ch1_b3_test.py` in portrait and landscape and looked at the battle and victory card frames, and searched the Battle 3 files for the old texts.
- BUG-05 (BAG count): Battle 3 shows BAG as "Not yet", no count. BUG-06 (status pills): statuses stack 13 px apart over the head; the one shown fit. BUG-09 (victory card): no scrollbar, LEVEL UP! inside the card. BUG-10 (Raspberry arrow, Defend and Inspect copy, Tombo icon): none of that text or those buttons exists in Battle 3. COH-09 (Inspect names Flashcard Flurry and Red Pen): no such hint in Battle 3.
- Not looked at: several status tags at once on one enemy (the code stacks them; none came up in the test fights). No game file changed.

## voicepurge221 (2026-11-21): 221 old dialogue clips that nothing plays were purged

Card c-voicepurge221. Check 4 of `tools/clip-audit/unused_voice.py` listed 221 baked dialogue clips with no scene, harvest line or source (old chapter 1, 3 and 6 lines). Removed with `purge_unused.js` (spec `tools/clip-audit/purge-voicepurge221.json`), Voice Library list rebuilt (221 removed), all four checks 0. List in docs/PURGED_VOICE.md.

## ch2lessons (2026-11-21): chapter 2 cut by the chapter 1 lessons: 93 lines became 73 (20 cut, 4 rewritten, two orphans fixed), every voice script retagged in Tom's style

Card c-ch2lessons. Tom (2026-11-20): apply the lessons of his day of chapter 1 cuts to chapter 2, which he has not played yet. A fresh reviewer that read only claude/tom-line-edits.md, claude/story-line-rules.md and the 93 lines marked every line KEEP, CUT or REWRITE with a rule number. Claude applied all of it (no line replaced after a cut; each scene was read again and still makes sense).

| Count | |
|---|---|
| Lines before | 93 (9 scenes) |
| Cut | 20 (one in 4.7): Tom 11, TNB 7, the Big Shake 1, Doña Carmen 1 |
| Rewritten (rule 4, from what the character wants) | 4: Tom 3, Grace 1 |
| Lines now | 73 (70 distinct recordings; Mr. Washington's greeting repeats 4 times) |
| Kept as Tom wrote it | "Poke it. Yes. But maybe just gently." |

| Scene | Before | After | Rule |
|---|---|---|---|
| Scene 1 | Tom: Ha! It WOULD. Okay. Your turn. Toast. | CUT | 7, 9 |
| Scene 1 | Tom: That is a very purple sky. Okay. Hills first. Then bread. | CUT | 7 |
| Scene 2 | Tom: Ha! I am. Right after we gently poke a cloud. | CUT | 7, 8 |
| Scene 3 | TNB: Babe. He's stuck. You're just keeping him company. | CUT | 7 |
| Scene 3 | TNB: Huh. So that's a monster. Smaller than I pictured. | CUT | 7 |
| Scene 4 | Tom: It's coming out of the Observatory. But the Observatory's so nice. | Tom: Oh, Observatory. Not you. | 7 (rule 4 rewrite) |
| Scene 4 | TNB: It's always the nice ones. | CUT | 8 |
| Scene 5 | Tom: Denied? | CUT | 7 |
| Scene 5 | Tom: She's standing on my feet. Both of them. I'm going to hold very still. | CUT | 7 |
| Scene 6 | Tom: Excuse me. Sorry. I had to check. | CUT | 2, 7 |
| Scene 6 | Tom: Thank you, Nara. A burnt flashbulb. Grace has one just like it on her clue list. | CUT | 7 |
| Scene 6 | Tom (text, to Grace): Grace, I'm on the job. There's a lemon stuck in an orange block up here, and Nara just found a burnt flashbulb next to it. I wrote it all down. It's on page nine. | Tom (text, to Grace): Grace, reporting in. There's a lemon stuck in an orange block, and Nara found a burnt flashbulb right next to it. I wrote it down. | 10 (orphan "page nine") |
| Scene 6 | Grace (text): Tata, step away from the block. You left fingerprints on the last one. Send me a picture with the lemon AND the bulb in it. I'm writing them both down. In pencil. | Grace (text): Tata, don't touch it! Send me a picture of both. And don't let Nara lick it. | 10 (orphan "fingerprints", "In pencil") |
| Scene 6 | Tom: Picture taken. Not touching. I'm two feet back. Two and a half. | CUT | 8 |
| Scene 7 | Tom: GAH! I've picked up Nara. I don't remember deciding to. | Tom: GAH! I've got you, Nara. We're fine. We're both fine. | 7 (rule 4 rewrite) |
| Scene 7 | TNB: Well, well, well... look who's up. | CUT | 13 |
| Scene 7 | The Big Shake: RUMBLE. Stay back. I shake. | CUT | 2, 7 |
| Scene 8 | Tom: Ha! I'm keeping that too. | CUT | 8 |
| Scene 8 | TNB: Sky's blue again. Shame. The purple was growing on me. | CUT | 7, 8 |
| Scene 8 | Tom: Still grey. Sorry, tree. We'll come back. | CUT | 10, 8 |
| Scene 9 | Tom: A second sentence! Welcome back, Mr. Washington. | CUT | 7 |
| Scene 9 | TNB: You said it. I was there. | CUT | 7 |
| Scene 9 | Doña Carmen: Then I wasn't feeling well. | CUT | 8 |
| Scene 9 | TNB: Hills, then bread. | CUT | 8 |

The rewrites, checked by the three tests (no other character could say them unchanged; each cares about someone else: the Observatory, Grace's case, the evidence, Nara; no trait word) and the copy check (0 hits against bank.txt and old.txt; the only hits against the game are the old line each replaces). The two orphans are gone: Grace's text no longer mentions fingerprints or the pencil (both cut from chapter 1), and Tom's text no longer plants "page nine" for chapter 3.

**Retag.** All 70 voice scripts were written again from scratch by claude/voice-tag-style.md (WHY W1 to W8, the five-step method), after reading Tom's kept chapter 1 lines for Tom, TNB and Grace in tools/voice-library/scripts/ch01-story-directions.json: a tag directs the sound of the next words, pushed to the extreme, one idea per bracket, a new bracket where the sound turns, quick on jokes, [emphasized] before the stressed word. TNB carries "mellow, laid-back, low-key" in every bracket. The accent goes in every bracket for Mr. Washington (thick Louisiana drawl), Miss Odette (thick Louisiana Creole accent) and Doña Carmen (heavy Salvadoran accent); chapter 2 has none of the Long Island speakers. A second fresh reviewer read only the brackets and flagged 14 (mild words, two directions in one bracket, Tom too bright); all 14 were fixed. Five before and after:

| Line | Before (ch2build) | After (ch2lessons) |
|---|---|---|
| Tom, scene 1 | [agreeing at once, earnest] Poke it. Yes. [small, concerned for the cloud] But maybe just GENTLY. | [agreeing, quick] Poke it. Yes. [pause] [hesitant, softer] But maybe just [emphasized] gently. |
| Tom, scene 3 | [uneasy, careful] She's... [flat, certain] CONSISTENTLY well. | [hesitant, slow] She's... [pause] [very very deadpan] [emphasized] consistently well. |
| Smoglet, scene 3 | [wet cough, then flat and rude] Ahem. You're in my way. | [wet cough] Ahem. [rude, very flat] You're in my way. |
| TNB, scene 1 | [mellow, mild interest] huh. [punchline, level] that'd tip the scales. | [mellow, laid-back, low-key, pause] huh. [mellow, laid-back, low-key, deadpan] that'd tip the scales. |
| Doña Carmen, scene 9 | [flat, final] I never said that. | [heavy Salvadoran accent, very dismissive] I never said that. |

tools/voice-library/apply-scripts.py: three limits Tom's own tagging breaks were removed (at most 2 descriptors per bracket, at most 2 words per descriptor, and the bracket count by line length, which 21 of his 95 kept chapter 1 scripts break), and "sigh" left the sound-noun list because Tom writes it himself. The body, prop and sound word check stays. All 70 chapter 2 scripts pass it.

**Recordings needed (none of chapter 2 was recorded before either):** 70 lines: Tom 31, TNB 20, Doña Carmen 4, the Big Shake 4, Miss Odette 3, Mr. Washington 2, Smoglet 2, Ticket Flurry 2, Canyon Coyote 1, Grace 1. Card t-ch2voices makes them with one tap after t-ch2play.

In the game: data/scenes.js (chapter 2 talk steps cut or reworded; no stage directions changed), tools/voice-library/scripts/ch02-story-directions.json, claude/story-ch02-draft4.md (repo copy, header and voice scripts rewritten), docs/script-convos.tsv (ch2Boss row follows its new first line; purposes written for the three chapter 2 conversations that had none), data/script-index.json and the Voice Library list rebuilt. Lessons added to claude/story-line-rules.md (rules 14 to 16).

Tests: tools/ch2_lines_test.py ok (73 of 73). tools/ch2_test.py in portrait and landscape: all 19 story checks pass, frames looked at (every rewritten line on screen); its one fail is a 404 for bgs/29-grump-hollow.webp, the Grump Hollow battle background that waits on Tom's approval (qa-coh05), present on main before this build. unused_voice.py: checks 1, 2, 3 and 5 at 0; check 4 lists 221 old dialogue clips nothing plays (chapters 1, 3 and 6 rebuilds), the same 221 as on main before this build and none from chapter 2; left for card c-voicepurge221 so this build stays on its card.

## b3s15 (2026-11-21): chapter 1's story fights now play on the new battle system, with a switch in ADMIN to go back to the old one

- Build: stage 15 of the new battle system ("Battle 3"). Plain list of chapter 1's old-battle references by kind: `docs/BATTLE3.md` "What stage 15 holds". Only chapter 1's share was replaced.
- The switch: ADMIN > Battle system > Story battles has OLD, BY CHAPTER (default) and NEW. It is kept on the phone. OLD plays chapter 1 on the old battle with the same save. NEW beyond chapter 1 is not finished: only chapters 1 to 10 have Battle 3 formations, and their story hand-offs are not built.
- One door: `startBattle` is wrapped by `engine/b3-story.js`, so scene fights and map monsters both route there. `B2.result`, the `battle:<id>` flags, `monsterFall` (the Hollow trail) and the Tombo unlock flags work as before.
- Story fights pay XP, coins and a drop as before, plus Vibe Points (15 each for the 3 Mudlings, 10 for a formation, 30 for the Big One). The victory card shows a "+n VP" line per person and the Ruckus gauge in its footer (no HEART).
- HP carries between fights as a share of Max HP. A loss leaves everyone at 1 HP and Deedee's line plays as before.
- Saves gain `b3:{v:1,ruckus}`; nothing is removed. Existing saves get a level floor and a pool of 135 Vibe Points per chapter finished (idempotent, never lowers anything). TNB, Nara and Boppy get a loadout when the story recruits them.
- New battle tips replace the old ones for these fights (Battle 3 words only). No Warmth bar, WARMTH command or HEART line in any chapter 1 fight; the two Tombo toasts show under OLD only.
- Tests: `node tools/b3-sim.js check` CHECKS 2205, FAILS []; `tools/b3_story_test.py` (52 checks); `tools/ch1_b3_test.py` (chapter 1 from Chapter Select to the job scene, portrait and landscape, no page errors); `tools/b3_test.py s4` (one stale expectation updated: late joiners have no loadout until recruited). `tools/smoke.py` passes except `board_sync_test` R5, which fails the same way before this build.
- Fact for Milestone B: a new save is at Rank 1 in chapter 1 and the plain player needs 7.83 rounds for the Big One at Rank 1 (5.78 at Rank 2); target 5 to 7. Left as is. XP needed no change: clearing the Hollow pays 250 XP, 2.5 levels.
- Not done: Rose Mode's emergency muffin (`b7Pie`) has no Battle 3 form.

## fix-itembannerart-pics-4 (2026-11-21): the last 2 item pictures (racing flats, birthday sash) remade with one phrase changed each; all 3 are ready for your review

- Tom (card t-itembannerart-pics): "2 more images failed, which is major improvement. We're getting close. He's feedback to adjust the prompt". The Tiny Clay Taco passed (QA 15 of 15), so it was not touched.
- Smallest change, from the QA lines: the flats came back as slippers (no laces, open heel), so "so each shoe looks almost like a slipper" became "laced up like a running shoe with a closed heel"; the sash came back as a big crossed bow, so "a big gold bow" became "a small gold bow". Everything else in both notes, and the solo prompt, kept word for word (`SOLO_NOTE` in `tools/art-library/itemart-prompts.js`, promptRev 2).
- Made the 2 again through the board (commit `board: generate t-itembannerart-pics`, $0.12). Looked at (fact): the flats are low neon yellow laced running shoes on a thin sole (QA 13 of 15: paint style, sole "not paper-thin"); the sash is a wide gold band in a loop with a small bow near the bottom (QA 12 of 15: paint style, plus "laid flat" and "three-quarter view", which contradict each other). The paint-style line was also raised on the taco's earlier runs and on approved sheets, so it is not a reason to hold them.
- Card c-itemart-refs (reference photos) retired: no photos are needed now. No in-game report was filed since 08:38. Nothing in the game changes until Tom approves; the 3 items show their emoji until then.

## projclean1 (2026-11-21): Project docs move finished: working notes live in the repo's claude/ folder, the Project keeps four mirrors

- Card c-projclean: copied project-instructions.md, status.md and build-plan.md into claude/ word for word; 28 compare-group docs matched the repo copy and were deleted from the Project; story-build.md takes the Project text (one missing period).
- Stop the regrowth: claude/README.md rewritten (the repo copy is the original), CLAUDE.md rule projclean1, claude/handoff-rules.md 'Where notes go' (also written to the Project mirror, with next.md, which was stale there), claude/INDEX.md written by tools/claude_index.py, and publish.yml leaves claude/ off the game site (no game file loads from it).
- Project: 1,941,747 bytes on 2026-11-20, 577,628 now; Tom cards t-projinstr2 (two lines of the Project instructions) and t-projdelete (two docs the session was not allowed to delete). Docs only: no game file changed.

## board-itemart-refs (2026-11-20): board only: the 3 remade item pictures missed again; stop-loss, card c-itemart-refs waits on 3 reference photos from Tom

- Ran the fix-itembannerart-pics-3 prompts for the 3 items ($0.18). Results (looked at, fact): Pro Racing Flats came back as plain yellow slippers (the words "almost like a slipper" were taken literally), Tiny Clay Taco as a real taco again (QA 15 of 15 but it is food), Birthday Sash as a ribbon bow again. Fourth miss: stop-loss, no fifth text-only try.
- Next: Tom sends one photo of each object; c-itemart-refs adds them as shape references and remakes the 3. Tom's words that started this: "Based on the feedback adjust the prompts for the failed images and regenerate".

## fix-itembannerart-pics-3 (2026-11-20): the 3 item pictures that missed get new prompts and are made again

- Card c-fix-itembannerart-pics-3, on t-itembannerart-pics. Tom: "Based on the feedback adjust the prompts for the failed images and regenerate".
- Looked at the 3 solo pictures (fact): Pro Racing Flats had a "JC" logo, stripes and normal soles; Tiny Clay Taco was filling in a shell, food rather than pottery; Birthday Sash was a ribbon with a bow, no long band. QA called the taco and the sash a 3D render.
- Changed only the 3 solo prompts (`SOLO_NOTE` in tools/art-library/itemart-prompts.js): each note now describes the shape to paint (flats: one smooth color, sole as thin as paper, seen from the side; taco: one glazed clay ornament, filling is glazed bumps; sash: a long wide gold band in a loop, bow on it). One STYLE line added for solo pictures: broad color areas, few strokes, no airbrushed finish. Kept: the rest of the prompt, the reference picture, the redo sheets' notes (approved). promptRev 1 on all 3, so the pictures are made again.
- No report was filed since the card was made (reports.py list: 0 open).

## projclean1f (2026-11-21): Project docs moved into the repo: the last 10 large docs copied into claude/ (ability revamp plans, battle design, old changes and status notes)

- Card c-projclean: copied word for word to the same path in claude/: adventures-of-tom-ability-revamp.md, adventures_of_tom_ability_revamp_plan.md, battle-design.md, ability-revamp-brief.md, CHANGES.md (the old October change log, not docs/CHANGES.md), tombo-review.md, kit-recipe.md, voice-baker-scripts.txt, voice-baking.md, portrait-style.md. Docs only: no game file changed.
## fix-conflictmarks (2026-11-20): the game would not start: merge conflict markers on main removed from engine/main.js and index.html

- Fact: the board-sync commit 25f41e6 ("part shipped projclean1e") committed unresolved merge markers (`<<<<<<< HEAD` ... `>>>>>>> 7cbde07`) into `engine/main.js` (the build stamp line) and `index.html` (the build-history and main.js script tags). A browser stops reading `engine/main.js` at `<<<`, so a fresh load of the live game did not start; `data/build-history.js` also loaded twice.
- Fix: kept one copy of each line (both sides held the same text apart from the build name; the newer side is kept). Nothing else changed. Found by the c-b3s15 session when its test page would not load.
- Not looked at: how the markers reached main (a rebase conflict the board-sync job committed instead of stopping on). `git grep -n '^<<<<<<< '` is clean after this build.

## board-boppy-bigfish (2026-11-20): board only: Boppy cap card waits on Tom's picture approval

- Card c-boppy-bigfish moved to Waiting behind t-boppy-bigfish-pic (generate and approve Boppy's unimpressed pose). No game file changed.

## boppy-bigfisha (2026-11-20): Boppy's unimpressed pose prompt now uses his Paso Robles reference, back under To do in the Art Library

- Card c-boppy-bigfish. Checked on main (fact): art/chars/boppyemo-story.webp frame em_unimpressed and portraits/emo/boppy-unimpressed.webp still show the retired Big Fish cap. They come from Art Library entry boppy-em-unimpressed (v1), whose attachment 1 was boppy-hero-ref-v1, the old hero painting in the Big Fish cap; attachment 2 (boppy-emotions-v6) already wears Paso Robles.
- Changed one thing: attachment 1 is now art/raw/characters/boppy-hero-v2.png (Paso Robles cap, same mustache, vest, rod and basket as his mood sheet). Prompt text kept word for word. promptRev 1, status back to draft, so the entry is under To do.
- Tom card t-boppy-bigfish-pic: generate and approve. Then c-boppy-bigfish rebakes his mood frames and faces (ships as boppy-bigfish). No game picture changed in this build.
- Found, not fixed: `node tools/art-library/make-prompts.js` fails on main (npc-prompts.js line 15, a colour lookup gets undefined), so data/art-prompts.json was patched for this one entry only.

## projclean1e (2026-11-21): Project docs move: progress and next steps written on card c-projclean (second run paused, 444 docs moved)

- Card c-projclean: 444 Project docs are now in claude/ and gone from the Project (692,867 of 2,000,000 left in use). The card lists the 12 docs still to copy, the compare group, the docs held back on purpose, and steps 6 to 9. Docs only: no game file changed.

## board-b3s15 (2026-11-20): board only: stage 15 card and handoff notes added

- Tom's request: the stage 15 prompt and its board card. Added card c-b3s15 (Claude Sonnet 5.5, effort high, tag b3s15) in Up next and `claude/next-addendum-b3s14.md` (stage 14 results, what stage 15 must do, tests, git warning). No game file changed.

## projclean1d (2026-11-21): Project docs moved into the repo: 61 more docs copied into claude/ (fourth part of the second run)

- Card c-projclean: copied 61 more Project docs word for word to the same path in claude/ (area, tombo, ability, status and plan notes, the 46_tomhouse set, baker status notes). No game file changed.
- Not copied: monster-codex-build.md (a safety classifier stopped the write) and 46_tomhouse_geometry.json (it could only be rebuilt by script, not copied byte for byte); both stay in the Project.

## projclean1c (2026-11-21): Project docs moved into the repo: 118 more docs copied into claude/ (third part of the second run)

- Card c-projclean: copied 118 more Project docs word for word to the same path in claude/ (area QC notes, tom, olivia and justin character prompts, square and area kits, nara and boppy prompts, ability feedback notes, voice and battle notes). No game file changed.
- Not byte-checked against the Project text: claude/battle-background-prompts.txt (171 KB, assembled by a script from the shared blocks); it stays in the Project until compared.

## projclean2b (2026-11-21): Project docs move: build name 2a put on its card, no files copied

- Card c-projclean: the previous push named build projclean2a before it was on the card; this push records it. No game file changed.

## projclean2a (2026-11-21): Project docs move paused at a safe point: progress and next steps written on card c-projclean

- Card c-projclean: 267 Project docs are now in claude/ and gone from the Project; the card lists what is left and the rules for the next run. No game file changed.

## projclean1b (2026-11-21): Project docs moved into the repo: 116 more docs copied into claude/ (second part of the second run)

- Card c-projclean: copied 116 more Project docs word for word to the same path in claude/ (art prompts, area and room kits, storybook and move sheet prompts, addenda, canon addenda). No game file changed.
- Left in the Project on purpose, not copied: next-addendum-michael.md (the write was stopped by a safety classifier); the held docs listed under projclean1a.

## projclean1a (2026-11-21): Project docs moved into the repo: 151 docs copied into claude/ (first part of the second run)

- Card c-projclean: the repo is now the one home for Claude working docs; the Project keeps only four mirrors. This part copied 151 Project docs word for word to the same path in claude/ (story, dialogue, next-addendum, tone and voice notes, the story bible, CHANGES-archive). No game file changed.
- Left in the Project on purpose, not copied: comedy-bible.md, story-ch08.md, story-ch08-rejected.md, story-ch08-brief.md, story-ch06.md, bernadette-rewrite.md (they spell out a full street address), costs1-handoff.md (a personal spending ledger), dialogue-clarity-rewrite.json (the write was stopped by a safety classifier; its .md twin copied in full).

## b3s14b (2026-11-20): New battle: balance pass follow-up, bosses checked at Rank 2 and Rank 5, no numbers changed

- Tom's card c-b3s14b (the open items of c-b3s14). Plain player, 100 fights per boss: at Rank 2 (the Lab default) all 11 bosses stay at 5.07 to 6.32 rounds; at Rank 5 eight stay at 4.98 to 5.94 and three fall under 5 (Big Shake 3.72, Iron-Gill 4.04, Old Ironbelly 4.98). Call: not retuned, since raising HP would push Rank 2 past 7. Table in docs/BATTLE3.md.
- `python3 tools/b3_test.py s13` passes (portrait and landscape), `node tools/b3-sim.js check` 2154 checks, 0 fails. Docs only: no data, engine or art file changed.

## b3s14 (2026-11-21): New battle: balance pass on Part 1, eight short bosses lengthened to 5 to 7 rounds (stage 14 complete)

- Tom's card c-b3s14: every Part 1 boss takes 5 to 7 rounds for the plain player, normal fights stay short. Data only, no engine file changed.
- Measured all 66 Lab fights first (100 simulated each, all won). Eleven bosses: three were already 5 to 7 (The Red Pen 5.8, The Unread 5.1, Old Ironbelly 5.1), eight were short. Normal fights and elites were left alone (0.7 to 5.7 rounds).
- The one change per boss was its HP (both sizes, scaled together; rounds grow about in step with HP): The Big One 420/320 to 610/460, The Big Shake 380/510 to 460/620, Old Iron-Gill 650/490 to 900/680, The Director's Cut 470/630 to 610/820, Chairman Cheeks 660/880 to 1130/1500, The Mirrorball 1590/1190 to 2380/1780, The Last Call 1800/1350 to 2230/1670, Brain Freeze 680/910 to 930/1250. Attack, Defense, Speed, pips and act power kept as the bestiary prints them.
- Rounds before to after: new6 3.5 to 5.78, new16 4.71 to 5.61, new21 4.14 to 5.64, new27 4.39 to 5.71, new38 3.33 to 6.32, new56 3.79 to 5.92, new62 4.61 to 5.8, new66 4.16 to 5.95. The two Big One fights with bigger parties (new9, new10) went 3.71 to 6.06 and 3.14 to 4.1.
- Checks moved with the numbers (old values in this entry): `b3-check-s3.js`, `s11`, `s12`, `s13`. The Big One's support-every-4th-action guard was widened from 7 to 9.5 rounds because that player is slower than the plain one (9.31 was measured at 1.63 times HP; at the chosen 1.45 times it is lower).
- Not done: Vibes at Rank 2 and Rank 5 were not re-measured; bosses may run shorter with Rank 5 Quirks. Browser test s13 not run in this session (data-only change, simulator and rule checks pass).

## qa-bug03 (2026-11-21): Townsfolk in the Square and the Row no longer stand on roof edges

- Chapter 1 QA report BUG-03 (build keysecrets2): people walk onto the SNAIL MAIL sign and roofs in the Square and over building edges on Rivituso Row. Fact: the roof lists were complete at the 50% rule of `tools/npc_roof_tiles.py`, but a 25 second headless run showed townsfolk standing on tiles where 30% to 50% of the feet box is painted foreground. Change: 6 such tiles added to `noGoRoof` in `town` and 8 in `row` (only tiles an NPC actually reached). Not reproduced: Boppy's feet over the railing in `grands` (a stationary scene actor, not a wanderer), left open.

## b3s13 (2026-11-20): New battle: the Nine Scoops monsters and Brain Freeze join the Battle Lab (stage 13 complete)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts. This last part is the bonus chapter, built from `claude/bestiary-v11.md`: Sprinkle Gremlin, Slushie Slug (Elite), Cone Head and the boss Brain Freeze in `data/b3-foes-ch11bonus.js`, with four formations (10 VP each, 30 for the boss). The foe ids match the old `MONSTERS` ids in `data/bonus-nine-scoops.js` (gremlin, slushslug, conehead, brainfreeze), so a Lab fight never crashes the old tables.
- Lab: NEW 63 to NEW 66 (Tom, Grace and Rose at level 12, the chapter 5 baseline; the Square backdrop because the bonus chapter has no creamery picture, my call).
- Brain Freeze as data: Frosted Lid goes up once below 50% HP (Guard Stance, 25% less damage, plus +15% Defense, 2 turns), then Deep Freeze (wind-up, all three Drenched and Slow). Ice-Cube Pitch winds up and Stuns one target; Temple Throb winds up and Fatigues all three. A Break cancels each wind-up.
- Two small seams: the act condition `allyHurt` (the act is usable only while another monster is below full HP) and the target `lowestOtherAlly`, both for Cone Head's Scoop Pass, which heals the lowest other monster 20% and gives it +15% Defense.
- Three new statuses (blue_ice, scoop_pass, frosted_lid). The Slushie Slug starts in Blue-Ice Glaze (25% less damage); it resists Drench.
- No picture or clip work, no voice lines added. Balance is stage 14.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, bonus section; 2154 checks, FAILS: []); the four new Lab fights each 100 simulated, all won, 0 errors; `python3 tools/b3_test.py s13` (portrait and landscape). Stage 13 is done: chapters 8, 9, 10 and the bonus are in the Battle Lab (b3s13a, b3s13b, b3s13c, b3s13).

## wanch1 (2026-11-20): chapter 1 battles are videos: the whole family idles with breathing, guards, gets hit, falls, cheers and runs on Wan 3.0, plus Rose's knock-out and Deedee's victory; the stop-loss list goes to c-wanch2

Card c-wanch1 (last part; parts a to h above). This part: Rose's knock-out retry 2 (seated 2.8% above the feet line, was 5%) and Deedee's victory retry 2 (picture shrunk to 80% inside the video: her spread hands stay in the frame) are baked and wired; their painted rows are purged. Wan-gen run 44865404539 ($3).
| Fighter | Videos in every NEW BATTLE fight | Still painted or default (stop-loss, card c-wanch2) |
|---|---|---|
| Tom | idle, guard, hit, ko, victory, run; Lounge Pass Flex, Zone One Blockade | dodge, cast |
| Grace | idle, guard, hit, ko, victory, run; Soup-Dumpling Squeeze, Crunchy Sugar-Cube Pop | dodge, cast |
| Rose | idle, guard, hit, ko, run, victory (her approved clip); The Floor Is Lava! | dodge, cast; Lamb-Tuck Ankle Tackle (a second lamb appeared), "Giddyup, Tata!" Launch (a lasso ring appeared) |
| Deedee | idle, guard, hit, victory, run; "Hand Me My Glasses" Scrub | dodge, cast, ko (floats above the ground twice); Wet-Floor Hazard (the mop dips below her feet) |
| Monsters | Grump: grumble, splash, slap and wind-up; Toad: croak, tongue and wind-up; Log: roll, jab, Timber! and wind-up; Skeeter: idle, Buzz Cloud | Toad Body Slam, Skeeter Darting Bite and Mosquito Whine |
- Spend: fal $22.95 (cap $35), xAI $1.59 (cap $3).
- Tests this part: `wanproof_test.py rose,deedee` FAILS [], `b3_test.py s8` FAILS [] (peak 15 clip pictures in NEW 6, limit 16), smoke.
- Plan notes: `claude/video-battle-plan.md` 4.8 (repo copy and Project). docs/BATTLE3.md "Painted body states" says what is still painted.
- Tom's card: t-wanch1-watch (play NEW 1 to NEW 6 once). Next Claude card: c-wanch2 (the stop-loss list on a different video model, then the full purge of the painted states).

## b3s13c (2026-11-20): New battle: the chapter 10 airport monsters and The Last Call join the Battle Lab (stage 13, part c of four)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts. This part is chapter 10, built from `claude/bestiary-v11.md`: Carry-On, Jet Lag, The Long Line, The Unclaimed, The Armrest Hog (Elite) and the boss The Last Call in `data/b3-foes-ch10.js`, with six formations (8 VP each, 26 for the boss).
- Lab: NEW 57 to NEW 62, one fight for every formation and the boss (Tom, Grace, Rose and Amy at level 25; the terminal backdrop).
- The Last Call as data: Boarding Group Nine is the wind-up of GATE CLOSED, the same Mark pattern as The Big One's Big Glare and Swamp Chomp (`then` and `after`, `hits:'marked'`). It Marks a Back-row ally and gives the monster +20% Attack for 1 turn (the bestiary says only "It gains"; I read "it" as the monster, as with the Director's Spotlight Lock), then slams the Marked ally with Skill Lock for 2 turns on the next turn. A shield (Suite Door Slide) soaks the slam and the lock; an interrupt or a Break cancels it and drops the Mark. FINAL BOARDING only below 50% HP. 1,800 HP for 4, 1,350 for 3.
- No new engine seams. Four new statuses (bin_drop, middle_seat, both_armrests, boarding_group).
- No picture or clip work (every act uses `anim:{kind:'default'}`), no voice lines added.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, chapter 10 section; FAILS: []); the six new Lab fights each 100 simulated, all won, 0 errors (The Last Call 4.6 rounds, the Armrest Hog 2.9, normal fights 1.9 to 2.9); `python3 tools/b3_test.py s13c` (portrait and landscape). The bonus chapter follows as the final b3s13.

## b3s13b (2026-11-20): New battle: the chapter 9 ballroom monsters and The Mirrorball join the Battle Lab (stage 13, part b of four)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts. This part is chapter 9, built from `claude/bestiary-v11.md`: Velvet Rope, Stuffed Shirt, The Hanger-On, The Sore Loser, The Wallflower (Elite) and the boss The Mirrorball in `data/b3-foes-ch09.js`, with six formations (9 VP each, 27 for the boss).
- Lab: NEW 51 to NEW 56, one fight for every formation and the boss (Tom, Grace, Rose and Deedee at level 22; the dome backdrop).
- The Mirrorball as data: she starts in a Facet Spin (+25% Evasion buff); Facet Dazzle and Spotlight Solo leave her Dazzled, so a Clobber hit sets off Shatter Glitz! (strips Facet Spin) and a Racket hit sets off Sensory Overload!, both already built; LAST DANCE only below 50% HP. 1,590 HP for 4, 1,190 for 3.
- No new engine seams: Members Only uses `frontAllies` and Fifty-Two Pickup uses `firstTarget` (both added in b3s13a); "Cheater!" is a Mental status with the existing `foeTaunt` flag, the same one SEE ME uses. Six new statuses (members_only, hmph, gauche, cheater, wall_hug, facet_spin).
- No picture or clip work (every act uses `anim:{kind:'default'}`), no voice lines added.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, chapter 9 section; FAILS: []); the six new Lab fights each 100 simulated, all won, 0 errors (The Wallflower 5.7 rounds, The Mirrorball 3.8, normal fights 1.2 to 2.1); `python3 tools/b3_test.py s13b` (portrait and landscape). Chapter 10 and the bonus chapter follow as b3s13c and b3s13.

## wanch1h (2026-11-20): Rose and Deedee fight in Wan videos too (idle with breathing, guard, hit, run), The Floor Is Lava!, the Glasses Scrub and Zone One Blockade are videos, Grace's knock-out sits on the ground

Card c-wanch1 (part h). Videos: wan-gen runs 44859585429 and 44859840350 (18 clips, $9). Checked against plan 4.4 before baking.
| Fighter | Now a video | Not yet |
|---|---|---|
| Rose | idle, guard, hit, run, The Floor Is Lava! (points at the floor, hops, points a warning; Tom's note "shouldnt just be her jumping") | ko floats 5% above the ground: remade with the change that fixed Grace's; Lamb-Tuck Ankle Tackle (her hand left the frame) and "Giddyup, Tata!" Launch (her hair left the top of the frame): remade with the picture shrunk to 80% inside the video (`pad`); dodge and cast not made (stop-loss on Grace) |
| Deedee | idle, guard, hit, run, "Hand Me My Glasses" Scrub (small thin reading glasses, her own eyes, a scrub brush; Tom's notes "clown glasses", "rolling pin") | ko floats 6%: remade as Rose's; victory (her spread hands left the frame) and Wet-Floor Hazard (the mop head touched the frame edge): remade with `pad`; dodge and cast not made |
| Tom | Zone One Blockade (retry 2, elbows bent: his palms stay inside the frame except the fingertips for 13 pictures) | |
| Grace | ko retry 2 ("sinks straight down ... right where she stood"): seated 1.5% of the frame above the standing feet line (was 4%) | |
- Painted rows purged: Rose keeps only dodge and ko, Deedee dodge, ko and victory (until their videos pass).
- Accepted with a known small fault: Rose's hit rocks her onto her toes for 1.5 battle px (1.4% of the frame, the plan allows 1%); the test allows 2 px in a hit.
- `wangen.py`: a job may carry `pad` (the start picture shrunk inside the 720 x 1280 frame); test W10. W9 no longer depends on which jobs the cap let through first (it was flaky).
- Engine: a guard video that is still loading shows the idle video instead of the painted standing picture (`b3cMemberFrame`).
- Fixed: index.html carried Grace's guard script tag twice (a rebase in wanch1g).
- Tests: `wanproof_test.py` (all four, W1 to W5 and P6; the painted baseline is measured with the code breath off) FAILS []; `b3_test.py s8` (peak 14 clip pictures) and `paint_state_test.py` FAILS [], portrait and landscape.

## qa-bug12c (2026-11-21): Boppy's Paso Robles cap reads the right way round when a scene turns him to face left
Chapter 1 QA BUG-12 (c) (keysecrets2): on Boppy's shocked pose and the BOPPY'S GOLD TEETH close-up the cap lettering looked garbled or mirrored.
- Checked on main (facts): the paintings are right. The Art Library mood sheet (boppy-emotions, baked to art/chars/boppyemo-story.webp and portraits/emo/boppy-*.webp) and the grin close-up (ch1-boppy-grin-v1, art/closeup/ch1-grin.webp, drawn as painted by closeupReveal) all read "Paso Robles". The fault is facing1 (2026-11-14): `scenePoseDraw` mirrors a leaning mood or talking painting so the person faces who they look at, and Boppy's surprised, scared, proud and loving poses and his tell, point and answer poses lean right, so whenever he looks left his cap writing is drawn backwards (facing1 had listed it as known). A new prompt could not fix this, so no Art Library entry was changed.
- Fix: data/pose-unflip.js (new, after data/pose-facing.js) lists a box around the lettering in each of those 8 frames; `paintedUnflip` (engine/painted.js, called by `paintedCanvas` on a mirrored frame) paints each box from the unmirrored painting at its mirrored place, only over the figure (source-atop), with the box edge faded over 5 px so no seam shows. The outline, the face and everything else stay mirrored. Boxes measured by eye on zoomed frames; a rebake of boppyemo or boppytalk that moves the figure needs them measured again.
- Found, not fixed: his unimpressed mood pose still wears the old Big Fish cap (Library entry boppy-em-unimpressed-v1); card c-boppy-bigfish. Carmen's apron and Olivia's PRESS badge are still reversed when mirrored (facing1 known list); they can get boxes the same way.
- Tests: new tools/pose_unflip_test.py (renders the 8 frames in the game: inside each box the unmirrored lettering, the outline unchanged, nothing changed outside the boxes; sheet tools/shots/pose-unflip.png), chapter 1 kitchen with Boppy surprised, scared and pointing while facing left, portrait and landscape, before and after; smoke. NOT done: a real iPhone.

## itemdef-css (2026-11-20): the item definition banner's look and words are back (itemdef1 lost them on the way in)

Card c-itemdef1. While itemdef1 was rebased onto a busy main, the conflict step kept main's `index.html` and `tools/itembanner_test.py`, so the live build had the new banner code with no styles and without `data/item-defs.js`. This puts back the banner styles, the `data/item-defs.js` script tag (after `data/item-art.js`, whose newer tag is kept) and the test. No other change.

## fix-gatelayer-pics-2 (2026-11-21): gate pictures checked by Claude: three ready for Tom, three rewritten to a method that works

Card c-fix-gatelayer-pics-2 (parts a and b above). Tom on t-gatelayer-pics: "reject images that are wrong with details and adjust the prompt as necessary, then regerenate and recheck the images".
| Picture | Round 1 | Round 2 | Now |
|---|---|---|---|
| Amy's door locked | pass | | waits for Tom's approve |
| Amy's door open | pass | | waits for Tom's approve |
| Stage 7 open | narrow gap, lamp lit | pass | waits for Tom's approve |
| School gate open | still shut | still shut | leaf taken off (posts and top rail only) |
| Car Barn open | only ajar | plate floating across the gap | plate fixed to the left leaf |
| Studio gate open | arm missing | arm lowered (closed) | arm taken away (two posts only) |
- Spent $0.74 on xAI (two art-gen runs). Stopped after round 2 (stop-loss: the school gate missed twice the same way). Evidence for the new method: with the locked picture attached, every removal worked (chain, padlock, sign, the studio arm in round 1) and every swing or raise failed. The third paid try is Tom's Generate tap on the card.
- Checked in the game, portrait and landscape: Amy's locked door picture (previewed locally, not committed) sits exactly on the painted door in the new arch rectangle; the school gate stands under the SCHOOL sign between its posts. `python3 tools/gate_art_test.py` ok.
- `board_sync_test` R5 fails on main before this build too (it replays the live board, which has moved on); not changed here.

## itemdef1 (2026-11-20): every item banner reads like a JRPG item definition: picture, name and type, description, In battle, In story

Card c-itemdef1. Tom (11-20): "change every item banner in The Adventures of Tom so it reads like a JRPG item definition with four parts: item name and type, a short description of the item, its effect in battle, and its effect in story (key items, gifts, unlocks)."

- Banner (`itemBanner` in `engine/party-banner.js`, styles in `index.html`): ITEM GAINED on top, the item's picture in a square tile (painted picture, or its emoji until the painting is approved), the name with a type chip (KEY ITEM, RECOVERY ITEM, BATTLE ITEM, SIGNATURE TOOL, OUTFIT, KEEPSAKE CHARM, BIRTHDAY SASH, SOUVENIR, ODDS AND ENDS; "TNB ONLY" for gear one person can wear), the description in italics, then IN BATTLE and IN STORY rows, the source line (a monster's drop line or the auto-gear note) and "Tap or press A to continue" inside the card. Landscape puts the tile on the left.
- Several items from one source stay one banner, one page per item ("1 of 2"); tap or A turns the page ("Tap or press A for the next item"), the last page closes it. Duplicates show as "Juice Box x2" on one page.
- Data: `data/item-defs.js` (new, loads after `data/item-art.js`). `itemDef(id)` builds the four parts: name and description from the items table, type and IN BATTLE worked out from each item's own fields (the same `bonusText` and `effectText` the menus use, so they can't disagree), IN STORY from `ITEM_STORY` for the 62 key items and story gifts (coins, Bready Mercury, Boppy's jar, the Part 2 keepsakes, family gifts, chapter rewards, Aunt Ellie's prizes, everyone's own tool, Nine Scoops) and a line by kind for the rest (snack, gear, charm, souvenir, junk with its sell price). Every line was written in the game's voice (contractions, no em dashes) and checked against the scene that hands the item out.
- Built on top of qa-bug02, which shipped in parallel: its picture ring is replaced by the square tile (the item banner's prompt now sits inside the card), its dark-pill prompt stays for party banners, and its rule that hides the overworld "..." pips while a banner is up is kept (`drawLifePip` in `engine/emotions.js`).
- Tests: `tools/itemdef_test.py` (new: all 288 items have four non-empty parts; every key item and story gift has its own story line; no em dash; contractions; the banner fits on screen for all 288 items with the longest drop line, portrait and landscape; pages turn and close). `tools/itembanner_test.py` updated to the new layout (pages instead of a row of icons). Also checked by hand in the turned-phone landscape (portrait phone with the landscape toggle). `tools/board_sync_test.py` R5 fails on main before this change too (not touched here).


## qa-coh03 (2026-11-20): Boppy's fishing spot shows his folding chair, not a wooden bench

Chapter 1 QA COH-03 (build keysecrets2, `claude/ch1-qa-keysecrets2.md`), card c-qa-coh03. The Big One asks "The man in the folding chair. Will he be back?" (`data/scenes.js` ch1AfterBoss, kept: canon c-gem-canon03 and the locked chapter 1 script put the cube beside Boppy's folding chair), but the pond painting had a wooden bench with the thermos, bucket and rod on it.
- Checked on main first: line and bench both still there, no standing rule against it.
- Call made: no new Library picture. The painted folding chair already exists (`art/props/boppy/folding_chair.webp`, "already built" in `claude/story-build.md`), and a new generated chair would still have needed the bench painted out of the plate. The bench is removed and the chair set down by script, so nothing is generated and nothing costs credit.
- `tools/hollow_chair.py` (called from `tools/make_hollow_fg.py`; the raw painting and masks are never edited): the bench, its shadow and the fishing line are removed (water above the shoreline is the water just above it mirrored, the ground below is the clear dirt to the left mirrored and tiled, shore edge feathered; FSR and Telea inpainting smeared and were not used). The thermos, bucket and rod are cut from the ORIGINAL painting with GrabCut so they keep the plate's brushwork, then set down again: thermos on the seat (the same thermos-on-the-chair motif as the gym in chapter 19), bucket on the ground to its left, rod flipped to lean on the chair back. The chair is the approved prop, lightened and warmed to the plate's light, with a soft contact shadow. The props mask loses the bench and gains these, so `art/hollow-fg.webp` and the depth zones follow.
- Files: `art/hollow.webp`, `art/hollow-fg.webp`, `art/hollow-trail1..3.webp` (rebaked by `bake_hollow_trail.py` from the new plate, with the trail's three stages of fix-hollowtrail-play-2; wrappers unchanged) and `data/hollow-trail.js`, the zones line `PLATE_BEHIND.hollow` in `engine/plate.js` (one zone now covers chair, thermos, bucket and rod, base at the chair's feet), the spot's text in `data/maps-le.js` (now "A folding chair with a thermos on the seat, a bucket, one bass...", not voiced). Before the change, an unchanged `make_hollow_fg.py` run reproduced the repo files pixel for pixel.
- To redo: `python3 tools/make_hollow_fg.py`, paste `tools/shots/hollow-zones.js` over the `PLATE_BEHIND.hollow=` line in `engine/plate.js`, `python3 tools/sprite-bake/bake_hollow_trail.py`, bump tags.
- Tests: new `tools/hollow_chair_test.py` (reproduces from the script, changes only the spot, bench gone, chair, thermos and bucket there, foreground layer and one depth zone, trail paintings match, line and text name the chair), `hollow_trail_test.py`, `smoke.py`. Looked at in the game in portrait and landscape (base plate and the last trail stage), `tools/shots/chair-*.png`.
- Limit: the chair is a battle prop with a slightly darker outline than the soft plate; it sits right, but if it looks pasted on at phone size, the fix is a Library picture of the chair painted from the plate's look (a new card).

## fix-itembannerart-pics-2 (2026-11-20): 285 item pictures are in the game; 3 that missed twice are made alone; the cutter no longer drops cells or leaves crimson shadows

Card c-fix-itembannerart-pics-2. Tom on t-itembannerart-pics: "some failed. make sure you only regenerate those than failed and approve those where nothing failed".
- Only the failed cells were made again: the 2 redo sheets (18 items), board commit `board: generate t-itembannerart-pics`, run 44861903466, $0.12. The 18 first sheets were not made again.
- Approved on his word, cells that failed left out: the 18 first sheets and the 2 redo sheets (`data/art-prompts.json`, files `art/raw/props/prop-item-*-v1.png`). A cell named `-` in an entry's `bake` is skipped, so only pictures where nothing failed are installed: 270 from the first sheets and 15 from the redo sheets, so 285 of 288 items show their own picture; the other 3 keep their emoji until their single pictures are approved.
- Redo sheet check, cell by cell: redo 1 cell 7 (Pro Racing Flats) came back as football cleats with a swoosh again; redo 2 cell 2 (Tiny Clay Taco) a real taco again, cell 9 (Birthday Sash) a bow with no sash. Stop-loss (two misses the same way): the notes are not reworded a third time; the method changes. Each is one object alone in its own picture, `prop-item-solo-amy_chm1`, `-claytaco`, `-g_bsash` (same note, `--grid=1`; `SOLO` in `tools/art-library/itemart-prompts.js`), and the redo sheets skip those cells. The hard hat keeps its scribble (the item is the hat with initials).
- Bug found while approving: `tools/sprite-bake/bake_item_sheet.py` stopped on 12 of the 18 first sheets ("nothing drawn in cell ..."), so approving them in the Art Library would have installed nothing. Cause: two objects in neighbouring cells painted closer than the merge distance became one blob and were given to one cell. Fix: a merged blob whose drawn pieces sit in different cells is split back into those pieces. Second fix: the generator paints a soft drop shadow in a darker shade of the magenta that the key could not reach, so each picture had a crimson smear under it; a pixel that is a darker shade of the key colour and joins the background is now cleared (nothing inside an object is touched).
- Tests: `python3 tools/itemart_test.py` (two new checks, both fail on the old cutter), `itembanner_test.py`.
- Pencil reports: none filed since 03:14 about item pictures (the two open ones are chapter 1 scene notes, left open).


## b3s13a (2026-11-20): New battle: the chapter 8 car barn monsters and Old Ironbelly join the Battle Lab (stage 13, part a of four)

- Tom (11-20): "build stage 13 (bestiary chapters 8 to 10 and the bonus chapter with their bosses) of the new battle system", in parts so a stalled session loses at most one chapter. This part is chapter 8, built from `claude/bestiary-v11.md`: Lukewarm, Leftover, Wet Blanket, The Draft, The Picky Eater (Elite) and the boss Old Ironbelly in `data/b3-foes-ch08.js`, with six formations (9 VP each, 27 for the boss).
- Lab: NEW 45 to NEW 50, one fight for every formation and the boss (Tom, TNB and Nara at level 19; the car barn backdrop, the boiler room for the boss).
- Old Ironbelly as data: BROIL (announced one turn ahead, then Toasty on all three and on itself) and Full Furnace (below 50% HP, same, plus the buff status `full_furnace`, +20% Attack). Its Sizzle acts (Hot Coal, BROIL) fire TNB's stone clay shields into Fired Glaze, which was already built; a Drench hit on the Toasty boss sets off Steam Cloud!. 1,040 HP for 3, 1,390 for 4.
- Two small seams: the strip kind `shieldOrBuff` (Pilot-Light Gust takes the target's biggest shield, or one buff when there is no shield) and the targets `frontAllies` and `firstTarget` in `b3Who` (first used in chapter 9). Five new statuses (crosswind, tin_lid, why_bother, it_touched, full_furnace) in `data/b3-status.js`.
- No picture or clip work (every act uses `anim:{kind:'default'}`), no voice lines added.
- Tests: `node tools/b3-sim.js check` (`tools/b3-check-s13.js`, new; FAILS: []); the six new Lab fights each 100 simulated, all won, 0 errors (Old Ironbelly 5.1 rounds, The Picky Eater 5.3, normal fights 1.9 to 2.4); `python3 tools/b3_test.py s13a` (portrait and landscape; frames `tools/shots/b3-s13*.png`). Chapters 9, 10 and the bonus chapter follow as b3s13b, b3s13c and b3s13.
## fix-gatelayer-pics-2b (2026-11-21): gate pictures round 2: two doors pass, four open states rejected with details and reworded

Card c-fix-gatelayer-pics-2, part b. Tom: "reject images that are wrong with details and adjust the prompt as necessary, then regerenate and recheck the images". Claude ran the six (art-gen, $0.44) and looked at each against its reference.
- Pass, waiting for Tom: Amy's door locked (same arch and door, shoe doodle note, no words) and open (same door swung open on a lit hallway).
- Rejected with details: school gate open (still shut across the lane), Car Barn open (only ajar), studio arm raised (arm missing), Stage 7 open (narrow gap, lamp lit).
- One change each in `gate-prompts.js`: each open state now says how far it opens and where the moved part hangs. The Stage 7 lamp-off ask missed twice the same way, so it is dropped (stop-loss): the lamp stays as in the locked picture.

## qa-coh05 (2026-11-20): Grump Hollow gets its own woodland battle backdrop in the Art Library; fights there switch to it once Tom approves the picture

Card c-qa-coh05 (chapter 1 QA report on keysecrets2, COH-05: Skeeter Swarm and Log Lump fights in Grump Hollow showed the town pond with a church steeple). Checked on main first: `battleBgKey` in `engine/battle-draw.js` still fell back to `pond` for map `hollow`.
- New Art Library entry `bg-29-grump-hollow` (Battle tab, New backgrounds; `tools/art-library/battle-prompts.js`, spliced into `data/art-prompts.json`). Written from the approved `01-pond-town` prompt with only the scene and floor changed: the same pond band and framing oaks, now deep woods (mossy boulders, ferns, lily pads, a mossy log, twisted oaks, no buildings, church, houses or dock) and a damp brown earth floor. The shared rules block is unchanged.
- Its `bake` runs the new `tools/sprite-bake/bake_battle_bg.py 29-grump-hollow` (approved picture to `bgs/29-grump-hollow.webp`, 1152 x 648, cropped to 16:9 from the middle if needed); art_bake then moves BG_V. The other 29 backdrops keep no bake.
- `BG_FILES.hollow` and a rule in `battleBgKey`: map `hollow` uses `hollow` when that picture has loaded, otherwise the pond (so nothing changes until the approval). The missing file is a 404 the service worker never stores.
- Tested with a stand-in picture (a crop of the Grump Hollow map painting, deleted, not pushed): `bg_test.py` saw `hollow` loaded at 1152 x 648, and a Skeeter Swarm and Log Lump fight showed it in portrait and landscape; without it the key stays `pond`. An `art_bake.py --dry` run on an approved copy routes the picture to the new script.
- Not done: the builder `node tools/art-library/make-prompts.js` fails on main in `npc-prompts.js` (an undefined colour), which is why the entry was spliced; not fixed here. Other Long Island maps with no rule (the Square, the marsh, the pier) still use the pond picture; not in this card.
- Board: hands to Tom card t-qa-coh05-pic (generate and approve the picture).
- Tests: `tools/bg_test.py` (expects `hollow` once the picture exists, plus a check of the bake script on 16:9, square and tall pictures), `tools/smoke.py`.


## voiceboard1 (2026-11-21): Generate all N voices on the board: one tap makes the voices and puts them in the game

Tom: "make a kanban card that will autgenerate and save to github the voices". A Tom card with ask voice and `voices` or `voice_chapter` now has Generate all N voices (board.html: `voicesHtml`, `vgenTap`; about 0.44 credits per character, second tap confirms). The tap commits `board: vgen <card id>`; the `voice-gen` Action runs `tools/voice-learn/voiceboard.py`: it makes a checked take for each line of the card that has no clip (`voicegen.py` gained `--lines-file` and `--chapter`), keeps them on branch `generated`, merges them into `data/voice/dialog-ch*.js` with `merge-local.js`, rebuilds the Voice Library list, runs `unused_voice.py`, writes a CHANGES entry `voices-<card>-<run>`, bumps tags and pushes to main, then writes `vgen.run` on the card and rewrites its next step to "listen in the Voice Library". Needs-human lines are listed on the card and not merged. `voice-gen.yml` also gained manual inputs `card`, `chapter`, `max_chars` (dry_run still defaults to true). First card: `t-ch2voices` (chapter 2, 90 lines with no clip), waiting on `t-ch2play`. No ElevenLabs credits were spent; tested with the stand-in server (`python3 tools/voiceboard_test.py`: 59 checks). Not covered: the retry against a main that moved. Facts: `claude/next-addendum-voiceboard1.md`.


## fix-gatelayer-pics-2a (2026-11-21): gate pictures: detailed rejects, Amy's door matched to the painted arch, door crop fixed

Card c-fix-gatelayer-pics-2, part a. Tom on card t-gatelayer-pics: "reject images that are wrong with details and adjust the prompt as necessary, then regerenate and recheck the images".
- The six rejected pictures now carry what was wrong with each, not only "All failed" (`data/art-prompts.json` rejects).
- Amy's door: the reference crop (`art/raw/props/gate-row-amyhouse-door-ref.png`) and the game rectangle (`GATE_ART['row-amyhouse']`, now `[5.94,4.45,1.78,2.14]`) are exactly the stone arch; both had taken in the shoe shelf and window. Both door prompts ask for the arch and door only, 3:4, with a margin (the bake trims; "edge to edge" fought the margin rule).
- Stage 7 open: the lamp is "switched off: dark red glass, no glow" (it came back lit).
- Found on main: build qa-bug01 had pushed unresolved conflict markers into `engine/main.js` and `index.html` (the game stopped at load, `BUILD_HISTORY` declared twice); fix-hollowtrail-play-2 cleared them first, this build keeps its version.

## fix-hollowtrail-play-2 (2026-11-21): Grump Hollow wrapper trail is now three legs of four wrappers: Mudling to the top left Toad, Toad to the Log, Log to the fishing spot

Tom (t-hollowtrail-play): "youre not understanding - you created several images where the wrappers are scattered haphazardly across the area... after defeating the mudling, there should be 4 wrappers that lead to the top left corner... after defeating that monster, there should 4 more wrappers that lead to the center of the aera, where the party must defeat the log... after defeating the log, there should be 4 more wrappers that lead to the big one activiation spot / after each monster is defeated... Grace should say 3 wrappers, let's follow them! / only 3 monster should trigger this: the mudling, the toad looking thing in the top left and the log that sits in the middle".
- Facts: 12 wrappers (`WRAPPERS` in `tools/sprite-bake/bake_hollow_trail.py`), 3 paintings, each shows only its own leg of four in a line from one monster to the next. `art/hollow-trail4.webp` is gone (purged). Only the Toad and the Log set a `ch1-beat:` flag; the Skeeter Swarm and Pond Grump no longer do. `ch1-spot` shows the leg 3 painting.
- Grace's line "3 wrappers, let's follow them!" replaces the old "Nine wrappers. There were twelve..." and Deedee's reply in `ch1Mudling`, and plays after the Toad and the Log (`ch1FolToad`, `ch1FolLog`). These lines need a recording.
- Test: `python3 tools/hollow_trail_test.py` passed (bake, game, portrait and landscape shots in tools/shots).

## board-qa2 (2026-11-20): board only: 19 cards from the second chapter 1 QA report, 5 items not added

## qa-coh07 (2026-11-21): the twelve-cup muffin pan sits on Deedee's island from the moment Tom walks in
Chapter 1 QA COH-07 (keysecrets2): walking into Deedee and Boppy's House showed a bare island until the theft scene started. Cause: the pan was only a scene prop, created when the scene began, and the painting is always drawn bare (fix-cutpolish4b). `scenePropsDraw` (`engine/scene-props.js`) now draws the same pan at the same spot on map `grands` in chapter 1 until flag `ch1-theft` is set; from there the scene's own pan prop takes over and the Mudling still takes it.

## wanch1g (2026-11-20): three leftover script tags of the removed monster clips taken out of index.html

Card c-wanch1 (part g). wanch1f removed `data/clips/toad-slam.js`, `skeeter-bite.js` and `skeeter-whine.js`, but a rebase kept their script tags (the art-bake job had retagged them), so the page asked for three missing files. Tags removed; `grep` for the three ids is 0 outside the Art Library entries.

## fix-ch1flight (2026-11-21): chapter 1's cab scene goes straight from TNB's text to the flight, with the phone picture up while TNB's text is read

Card c-fix-ch1flight (Tom's Something is wrong note on t-ch1flight, and pencil report r-20261120-192121-ynen).
- Tom: "didn't work, after TNB's text there was dialog between Tom and the girl's and Deedee. it should go straight to the airplane animation from the cab animation with TNB's text." Cause: the cab scene chained into the full airport run (`tripSteps`), which plays Sal's line, the girls' goodbye with Tom, and Deedee's goodbye. Fix: `{trip:'west',quiet:true}` (`tripSteps(dir,quiet)` in `engine/travel.js`) sends the girls and recruits home silently and plays only the chapter start and the flight.
- Report ynen, Tom: "when TNB is speaking the phone image should still be displayed". `{ch1Reveal:'phone',keep:true}` keeps the picture up under TNB's dialog (`closeup.keep`, `engine/closeup.js`, `engine/overworld.js`, `engine/main.js`); `{ch1RevealEnd:true}` closes it after the text.
- Kept: Sal's "Los Angeles? You got it.", the fade, the chapter 1 card, the flight lines. Changed: only the goodbyes and the picture timing.
- Checked in the browser (portrait): Sal, phone with TNB's text, chapter card, flight lines, Los Angeles, no girls or Deedee dialogue. Python smoke could not run here (no playwright for python).

## wanch1f (2026-11-20): the Pond Grump, Bog Toad, Log Lump and Skeeter Swarm attack and wind up in videos in NEW 2 to NEW 6

Card c-wanch1 (part f). Monster clips on xAI Grok lite (clip-gen runs 44853328032 and 44854697368, $1.59 in all), each looked at picture by picture before wiring.
| Monster | Now a video (data/b3-foes-ch01.js) | Left out |
|---|---|---|
| Pond Grump | Puddle Grumble, Bog Splash, Soggy Slap with its wind-up held while it charges | |
| Bog Toad | Night Croak (retry 2: the throat swells like a balloon), Tongue Lash with its wind-up | Body Slam: leapt out of the frame and lost its lily pad twice (stop-loss) |
| Log Lump | Low Roll, Branch Jab, Timber! with its wind-up | |
| Skeeter Swarm | its first idle (B3_BODY_CLIPS.skeeter), Buzz Cloud | Darting Bite and Mosquito Whine: the small mosquitoes vanished halfway twice (stop-loss) |
- The three stop-loss entries are set back to rejected in the Art Library with the reason; their baked files and script tags are removed (`data/clips/toad-slam.js`, `skeeter-bite.js`, `skeeter-whine.js` and their pictures). Those three acts keep the default animation.
- Checked by playing NEW 2 to NEW 5 at 2x (a test script): every wired act and wind-up played from its clip, no page errors, at most 12 clip pictures held at once.

## qa-bug01 (2026-11-21): quest log no longer says "Go to it's Sunday" after the trip home

Card c-qa-bug01 (BUG-01 of the chapter 1 QA report). `questPhrase` (`engine/story.js`) now treats a plain statement case-insensitively, so "it's Sunday..." is left as written and capitalized. "picked" also counts as a statement, which fixes the same slip in the Grump Hollow wrapper goals. All Goal toasts in `data/scenes.js` were run through it. Browser tests were not run in this session (the Playwright browser did not match).

## qa-txt04 (2026-11-21): the Inspect prompt keeps a name's capital letters (Boppy's fishing spot)

- Chapter 1 QA report TXT-04 (claude/ch1-qa-keysecrets2.md): near the pond the prompt read "A · Inspect boppy's fishing spot" while the opened box said "Boppy's fishing spot". `engine/draw.js` lowercased the whole name. It now lowercases only a leading The, A or An, so proper names keep their capital. Nothing else changed.

## qa-coh02 (2026-11-21): The Big One's win line no longer has it splash away before its talk
Chapter 1 QA COH-02 (keysecrets2). `data/monsters.js` The Big One `die` line (the VICTORY card, old battle) now reads "It stops thrashing and blinks up at the shore." so it is still at the surface for the after-boss scene. Not a spoken line (no clip, voice audit unaffected).

## qa-bug02 (2026-11-21): item banners: the picture fills its circle, the prompt sits on a dark pill below the card, speech pips hide while a banner is up

- BUG-02 of the chapter 1 QA report (keysecrets2). Fact: the painted pictures arrived in itembannerart1; this build is the layout. `index.html` `.pb-pic` fills the ring (one item full size, several 46% each); `.pb-hint` has a dark pill so it reads on any map; `drawLifePip` (`engine/emotions.js`) draws nothing while `partyBannerHeld()`.

## qa-bug12 (2026-11-21): tapping the Menu or Save button cancels a pending tap-walk, so it can no longer inspect the Cookie counter instead

Card c-qa-bug12 (BUG-12 a, chapter 1 QA report on build keysecrets2).
- Cause (from the code): a tap-walk toward the counter ends with an automatic A press on arrival. A tap on the Menu button did not cancel that walk, so the press landed on the counter, opened its dialogue and the Menu was refused (`!dialog.active`).
- Fix: `hudTapStopsWorld` in `engine/draw.js` drops the pending tap-walk and any queued A press on every Menu and Save button tap.
- Not done: BUG-12 (b), Boppy going blocky as a talk starts, was not reproduced and has no cause yet; BUG-12 (c), the cap lettering, is card c-qa-bug12c.
## qa-bug08 (2026-11-21): no HOLD + SLIDE, ! Menu or Save over a cutscene or the CHAPTER COMPLETE card
Chapter 1 QA BUG-08 (keysecrets2). Cause: the cutscene class hid the arrows and the A button but not the HOLD + SLIDE caption or the top-left buttons, so the caption showed between lines and the buttons stayed tappable (opening ! let monsters roam). Fix: one CSS rule in `index.html` hides `#hud-btns`, `.pad-caption` and `.pad-center` while `html.cutscene` is set (the class already covers the chapter cards).

