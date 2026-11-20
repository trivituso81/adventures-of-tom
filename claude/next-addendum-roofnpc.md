# roofnpc1, roofnpc2, roselets1, partybanner1 (2026-11-18, main f3f7870, 418cfe7, 37f066f, f54df57): Gemini's video audits of chapter 1 and Tom's follow-ups

## READ FIRST (added 2026-11-19 by the read-only cutpolish0 session)
Tom sent a third, combined audit of the same recordings. It was re-tested on main by playing the opening, the Row scene and the kitchen without SKIP. Every finding, the file map and a five-phase fix plan are in claude/cutscene-polish-plan.md: read that before fixing any chapter 1 scene finding. What it found that this note did not know:
- The party cannot follow scene walks: `routeTo` for Grace and Rose returns no route at the end of ch1Goal and at the start and end of ch1Theft, because followers obey the townsfolk no-go lists (the `noGoRoof` lists below are part of the cause). Tom walks alone and the girls jump to him. Phase 1 of the plan fixes it.
- Loading Deedee's and Boppy's poses on the Row (the roofnpc2 blur fix) does nothing: a sheet that is loaded but not drawn is dropped again within seconds.
- The pepper toast now replaces the goal popup 0.9 s after it appears.
- Rose is taken down in the Square, but the locked Row lines say Tom is carrying her.
Items 1, 2 and 3 under "Not fixed" below are covered by phases 3, 1 and 4 of that plan.

Repo entries: the `## roofnpc1`, `## roofnpc2`, `## roselets1` and `## partybanner1` headings in docs/CHANGES.md.

## Later the same day
- roselets1: Rose's "Come on, Tata! Let's go!" is cut from the opening (Tom: the scene goes straight into Grace's "Tata, don't walk yet"); the line and its clip are purged everywhere.
- partybanner1: every join and leave shows its own banner with an original jingle, queued one after another (engine/party-banner.js `partyBanner(id,kind,note)`). Wired into recruiting, forceJoin, the opening, travel rejoin, chapter 18 Tom leaving, chapter 19 Tom back. Art Library group "Party banners": 20 drafts (`banner-join-<id>`, `banner-leave-<id>` for tom, grace, rose, amy, deedee, boppy, tnb, justin, olivia, nara), builder tools/art-library/partybanner-prompts.js, no `bake` field. When Tom approves any: `python3 tools/art-library/bake_partybanners.py <TAG>` (art/banners/*.webp plus data/party-banners.js), bump_tags, smoke, push. Until then a cream ribbon with the talk face stands in.

## New engine pieces (reuse them)
- `noGoRoof` in a map spec (data/maps-le.js town and row): tiles townsfolk never step on because a standing person's feet land on a painted roof, rim or bench. Made by `python3 tools/npc_roof_tiles.py <map> [0.5]` from art/<map>-fg.webp. Read by both map builders in engine/world.js. Check with `python3 tools/reach_test.py <map>`.
- Townsfolk stand still during every cutscene (engine/battle-draw.js `updateNPCs`), except ones a scene is walking out of the picture.
- `cutWatchdog` (engine/skip.js): a scene step not waiting on the player that runs 40 s is dropped. FAST and SKIP show 0.9 s after a scene starts, at once for back-to-back scenes, never over a close-up.
- `{noHuddle:true}` scene marker (engine/story.js): no automatic huddle before lines; the scene stages everyone itself. Used by ch1Theft.
- `intro.endTrail` (engine/story.js endIntro): a scene sets the tiles behind Tom (oldest first, ending on Tom); followers keep that line at scene end instead of stacking on Tom. Used by ch1Theft.
- `showToast(text,sec,true)`: low toast (bottom). Area arrival toasts use it.
- First-visit souvenirs wait for no scene, talk or fight.
- html.cutscene hides the D-pad arrows.
- ch1 opening: Rose stays on Tom's shoulders into ch1Goal (`finishOpening` keeps her seated, `CH1_DISMOUNT` in data/scenes.js takes her down and walks the party to (16,22)).

## Not fixed (next session)
1. Rose parked behind the grands entry half-wall during a Boppy chat (row 11, x 1 to 6 and 10 to 14 are walkable behind the wall). Closing those tiles touches scenes in chapters 3, 7, 9, 10, 15 (they use [10,11], [11,11] and others): check each, or teach the walk-up to skip `huddleHidden` tiles for press-A chats.
2. Followers still regroup on Tom's tile after most scenes (placeFollowers in endIntro). Give other scenes an `intro.endTrail`, starting with ch1Amy and ch1Ellie on Rivituso Row.
3. The painted pie and muffin trays on the grands island stay after the theft: needs the approved Library picture.
4. P0 soft-lock by the Taxi Co. door was never reproduced (keyboard and touch both walked out). If Tom sees it again, ask for a REPORT tab capture while stuck: it records intro.sid and the step.
5. Girls leaving via setGirlsAway(true) show no leave banner (there was no toast before either); add one if Tom asks.

## Test recipe
- Opening plus ch1Goal from START NEW: call `__LE.chapterJump(1)` and press Enter on each line, or claude/ch01-cases.json "goal" (Rose not seated there; CH1_DISMOUNT skips the hop).
- ch1Theft: claude/ch01-cases.json "theft" with `FIN=1` and a `post` entry printing follower positions; expect Grace 9.5,10, Rose 11,10, Deedee 12,10, Tom 8,10.
- Banners: in the page, `partyBanner('grace','join'); partyBanner('rose','join'); partyBanner('amy','leave','x')`, then check `#party-banner` every second: one banner at a time.
- Natural play without SKIP (cutpolish0): claude/cutscene-polish/cut_natural_run.py, modes `open`, `row`, `theft`; recipe at the end of claude/cutscene-polish-plan.md.
