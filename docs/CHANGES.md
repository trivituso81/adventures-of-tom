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

<<<<<<< HEAD
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

