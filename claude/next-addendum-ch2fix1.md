# ch2fix1 (2026-11-14, main c541a87, builds ch2fix1a and ch2fix1b): Tom's chapter 2 reports (plus ch1 leftovers)

Detail and Tom's quoted notes: docs/CHANGES.md "ch2fix1a" and "ch2fix1b". 33 reports closed, 7 open (all need Art Library pictures).

## Chapter 2 lines that changed (the game wins over claude/story-ch02.md, which still shows the old words)
| Scene | Speaker | Old | New |
|---|---|---|---|
| ch2Loft | Tom | The fish was the nicest part! | I flew six hours for that pun? |
| ch2Loft | Tom | I want to take you home to Jefferson Park. But first I have to feed Bready Mercury... | Let's go home to Jefferson Park. Bready Mercury has been alone all week. |
| ch2Starter | Tom | "Don't Stop Me Dough!" | "Bohemian Rye-psody!" |
| ch2Smog | TNB | Babe. Remember movie night? You threw the whole popcorn bowl. | Scarier than movie night. Remember? You threw the whole popcorn bowl. |
| ch2Lemon | Tom | I already lost to the small one. ...Maybe it's easier in California. | I couldn't pull the one at the pond out either. ...Maybe it's easier in California. |
| ch2Boss | The Big Shake | When everything is stuck, nothing moves and nothing changes, and nobody ever has to say goodbye. | If everybody is stuck, nobody can leave. No moving trucks. No airports. No goodbyes. |

## Voice direction (standing from now on)
- tools/voice-library/scripts/zzz-ch2fix1-directions.json loads last and wins. Script files load in name order and later wins: a new override file must sort after zz-v4-overrides.json.
- TNB: "mellow, laid-back, low-key" in every bracket (ACCENT in make-index.js), stability at least 0.6, no effusive tags, no capitals, no exclamation marks in his scripts. Write every new TNB script that way.
- Dazed smog lines: "dazed, dreamy, faraway sing-song monotone" in every bracket.
- 119 lines are marked Rewritten and New direction for Tom to re-take.

## New machinery
- Faces: bake_emotion_faces.frame_square / square_of frame every face hair top to just below the chin (x1.24), centred on the jaw; bake_talk_faces and bake_talkpose_faces use it. Rerun all three after any head or sheet change.
- talk_frames.py grows talking heads to the walk's head share (TALK_FIX for misreads: Ellie 1.5).
- poseFacingWant: boss scenes face the boss (intro.poseFocus); a speaker with no side turns to Tom.
- {towel:{from,to}} scene step and BOSS_EFFECT.sneeze (engine/boss-finale.js). Ending-frame boss faces: END_CROP in bake_foe_portraits.py (--ends), PORTRAITS foe_<id>_<frame>.
- tools/art-library/shrink_mound.py (lemon tree mound). bake_closeup_ch1.py takes the newest door frame version.

## Still open (Art Library group "Report fixes", 21 drafts; install when approved)
| Report | Entry | Install |
|---|---|---|
| mxvd mud blob | ch1-mudling-heist | tools/sprite-bake/bake_mudling_heist.py on the new sheet (same 4 x 4 order) |
| 7v5z Deedee glasses | ch1-deedee-glasses-head | story pose for ch1Theft "Where are my reading glasses?" line, plus a dialog face crop |
| 1a2w Boppy mustache | boppy-em-unimpressed | replace cell 8 of art/emotions/boppy.webp (emotion_frames), rebake moods and faces |
| nre4 grass/bulb/cube | ch1-spot-together | one prop replacing the three hollow spot props (HOLLOW spot in engine/plate.js) |
| jykk holding the bulb | ch1-deedee-bulb, ch3-rose-bulb | story poses for ch1Spot (Deedee) and ch3 sundial (Rose); Tom already uses c4t_bulb in ch2, ch4, ch5 |
| g4gl dazed faces | ch2-dazed-washington, -odette, -carmen, -marisol, -larry | pose while n.trance (CH2_TRANCE in data/scenes.js) |
| c5no thinking poses | <id>-think for the ten family members | a fifth talking type `think`: tag lines in docs/talk-lines.tsv, bake, wire |
