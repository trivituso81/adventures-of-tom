# Clip reset (clipreset, 2026-11-19). This file wins over claude/clip-gate-plan.md and claude/animation-chapter-plan.md for the family's battle clips

Tom (11-19 18:10): "i just looked at Grace's guard animation and i am done. its awful. she puts her hands into a praying motion. how did this pass your test? this process is painfully slow. we need a massive reflection - we have wasted half a day and my money on an approach that is not working"

STATUS: proof built and pushed as clipreset (Grace's guard only). Tom decides on board card t-clipreset. The build after his answer is card c-clipposes (section 5).

## 1. Reflection

| # | What was tried | Dollars | Tom's time | What went wrong (evidence) | Which of Claude's steps was the mistake |
|---|---|---|---|---|---|
| 1 | clipgen2: all 67 chapter 1 videos in one batch, marked and approved automatically | $5.34 | Watching 67 clips, writing 45 notes | He rejected 44. Family: 5 of 46 passed. Monsters: 18 of 21 passed | Made 67 before one guard, one hit and one idle had been approved by Tom on one person. Approved every video unseen and called his review "the real test": he was the test |
| 2 | clipgate1 and clipgate2: a measured gate and a vision gate | $0.36 | None | Flagged 34 of his 44 rejects. Its own pass bar was not met and the plan said stop-loss. Tuned on the same clips it was scored on | Kept going after the stop-loss. A yes or no question about "forearms in front of the chest" cannot tell a guard from praying hands |
| 3 | clipch1fix: 40 prompts reworded from his notes | $0 | None | Words cannot pin a pose. "Raises both forearms in front of her face and chest" came back as praying hands | Kept describing poses in words while the exact pose he wanted was already a painting in the repo. The battle sheets were never checked |
| 4 | clipch1remake: 43 videos made again | $3.66 | Opened the review, could not tell which 16 were new, then found the guard | The gate held 27 and passed 16. The first one he opened was wrong | Spent again on the same method after a two thirds reject rate. Passed clips on the gate plus a glance at a contact sheet. Handed him 16 with no marker |
| | Total | $9.36 | Half a day (his words) | 8 Claude sessions | |

Root causes: (a) every video is a new roll of the dice, so only Tom's eye can accept it and every clip costs him a review; (b) for people he knows exactly what right looks like, and a monster has no wrong; (c) the pipeline (batching, gates) was built before the product was proven on one clip.

## 2. What the repo says (checked 2026-11-19)

| Question | Answer | Evidence |
|---|---|---|
| Do painted frames exist for the generic states? | Yes, for Tom, Grace, Rose and Deedee: idle, idle2, defend, hurt, kneel, celeb, leap, run1, run2, windup and the knocked-out picture | data/<id>-hires.js `bt` and `ko` atlases; BATTLE_SPRITES keys idle, idle2, defend, hurtPose, kneel, celeb, leap, run[2], windup, koFrame(sp) all present in the running game |
| Do the poses match his notes? | Yes. defend is crossed forearms over body and face. hurt is a stumble back with a grimace. The knocked-out picture is fallen backwards | Looked at all 40 frames |
| Are they steady? | Feet are on the cell's ground line in every frame (0 to 2 sheet pixels). Crouch height is .88 to .90 of standing in all four guards | Measured from the sheets |
| The catch | A pose is its own drawing. Grace's guard is painted with a face about 1.25x her standing face. Each pose needs one size number so its head matches the standing head | Seen in the first proof frames; fixed with `s:.8` |
| Does the engine already play these? | Mostly. Battle 3's default (no clip) path shows idle with a breath, hurt, kneel at low HP, celeb with a hop, the knocked-out picture. It has no guard pose, no dodge, and runs on the leap picture | engine/b3-play.js `B3_BODY`, `b3DrawMember` |
| What truly needs video? | Monsters (21 clips, 18 approved first time) and, only if Tom wants more than the default run-up and strike, the family's 9 own moves he rejected: Lounge Pass, Blockade, Squeeze, Cube Pop, Tackle, Lava, Giddyup, Wet-Floor, Scrub | His review notes in data/art-prompts.json |

History that matters: on 2026-11-17 Tom started the move to video because separate painted frames were inconsistent in proportion and showed as "jarring cuts and strange timing" (claude/battle-revamp-next.md in the Project). That note named a fallback: painted key poses with code doing the motion between them. This plan is that fallback, for the generic states only, with a size number per pose for the proportion problem and eased motion for the cuts.

## 3. The plan (one plan)

| Item | Decision |
|---|---|
| Method | The seven generic states of the four chapter 1 fighters are painted poses moved by the game. No video is made for them again |
| Videos that stay | Every clip Tom approved himself: all Mudling and Big One clips, the Log idle, Grace, Rose and Deedee give, Rose's victory, Deedee's Windex, Rose's Boop and sleep |
| Videos that go | The family's idle, guard, hit, dodge, KO, victory and run videos (old rejected ones and gate-passed remakes), and the remakes of cast, give (Tom), Cube Pop, Squeeze, Lava and Scrub that only the gate approved. Those moves play the default animation |
| Grump and Toad idle remakes | Stay for his one review (the gate passed them, he has not seen them) |
| The 9 own moves | Default animation now. Video for them is a separate, later card, one move at a time, only if Tom asks |
| Dollar cost | $0 |
| Tom's minutes | About 2 now (the proof row), about 10 once after the build (one Lab row plays every state on every fighter) |
| The gates | tools/clip-gate stays for monster videos only. The vision gate is not used to approve anything a person does |

| Checked by measurement (tools/paint_state_test.py, in the real game) | Checked by Tom, once |
|---|---|
| The state uses a painted frame and loads no clip | Does each pose read right |
| Feet stay on the standing ground line through the move in, the hold and the move out | Does the head look the same size as the standing head |
| The held pose is the size the table says and does not pulse | Is the motion the right speed and distance |
| Hit and dodge move away from the monsters by the set distance and come back to the spot | |
| After the state the fighter is exactly the standing figure again | |
| Portrait and landscape | |

Why this cannot fail the way video did: the pictures are paintings he already has, and the motion is code, so what the test frames show is exactly what his phone shows. Nothing is rolled again.

What it is not: fluid animation. It is a pose that moves. That trade is Tom's to accept or refuse on card t-clipreset.

## 4. The proof (built, clipreset)

- data/b3-clips.js `B3_BODY_PAINT={grace:{guard:{f:'defend',h:.88,s:.8}}}`; no `guard` in `B3_BODY_CLIPS.grace`.
- engine/b3-play.js `B3_GUARD`, `b3PaintState`, `b3GuardShown`, `b3GuardDraw`, the braced hit, and the draw lines in `b3DrawMember`.
- engine/b3-lab.js `b3LabGuardProof`: NEW BATTLE > PROOF: GRACE'S GUARD.
- tools/paint_state_test.py: FAILS: []. Run once with the pose drawn 6 pixels high: it failed, as it should.
- Measured: standing 254 canvas px tall, guard 178 (table says 179), feet on row 539 in both, braced push 8 battle px and back.
- Her old guard video is still in the repo until Tom answers.

## 5. Build clipposes (after Tom answers card t-clipreset)

FIRST read his `answer` and `note` on card t-clipreset.

### If he chose "Stop making battle clips for chapter 1 and keep the old ones"
1. data/b3-clips.js: put `guard:'grace_guard'` back in Grace's row and delete `B3_BODY_PAINT`'s Grace row (leave the empty table and the engine code: they do nothing without a row).
2. engine/b3-lab.js: remove the PROOF row and `b3LabGuardProof`. tools/b3_test.py s8: point the guard check back at party[0] and drop the `paint` check. Delete tools/paint_state_test.py.
3. Smoke, push as clipposes, one history line on the cards. No Tom card (`after`: "nothing for Tom: end").

### If he chose "Go with this plan (Recommended)"
One change per state, one person first (Grace), look at the frames, then the other three.

1. Generalise the table: `B3_BODY_PAINT[owner][state]` for tom, grace, rose, deedee. Remove those states from `B3_BODY_CLIPS` for the four (keep `victory:'rose_victory'`, the three approved give rows and no others).

| State | Frames | Motion (battle seconds, battle pixels; away from the monsters is +x) |
|---|---|---|
| idle | idle; idle2 as a fidget | Existing breath. Every 5 to 7 s (offset by slot) show idle2 for .5 s with the same .07 s fade the guard uses |
| guard | defend | As proven (`B3_GUARD`), braced hit included |
| hit | hurt | No random shake. Slide +10 over .12 s, hold .2 s, slide home over .25 s, flash for .08 s |
| dodge | windup | Slide +14 with a 6 high hop over .14 s, hold .1 s, home over .2 s |
| ko | hurt, kneel, knocked-out picture | hurt .3 s with three stars circling the head (the star drawing used for Flustered monsters), kneel .3 s, then the knocked-out picture through the existing `drawKnockedOut`. Get up plays it backwards |
| victory | celeb, leap | Swap every .28 s with the existing 16 high hop |
| run | run1, run2 | Swap every .11 s while crossing the field in place of the leap picture; mirrored on the way home |

2. Size numbers: for each pose of each person set `s` so the head matches the standing head. Method: make a head row per person (the standing head, then each pose's head drawn at its `s`, all at game size) and look; start from 1, change by .05. Only `s` and `h` go in the table. Save the four head rows to tools/shots/.
3. Extend tools/paint_state_test.py to every row of the table (feet, size, no clip, away-and-back for hit and dodge, back to standing, both layouts). FAILS: [] before pushing.
4. Purge (repo rule): the family's idle, guard, hit, dodge, ko, victory and run clips except Rose's victory: data/clips/<id>.js, art/clips/<id>.webp, their script tags, their Library entries in data/art-prompts.json and tools/art-library/clip-prompts.js, art/raw/clips files, lists in tools tests (clip_lib_test `CH1`). For the gate-only remakes named in section 3: remove their clip rows from the game (`anim` back to `kind:'default'`, body rows removed) and their baked files, and mark the Library entries rejected with the note "clipreset: never reviewed by Tom". Grep each removed id: 0 hits.
5. Remove the PROOF row. Add a Lab row PAINTED STATES: CHAPTER 1 under NEW BATTLE: the four fighters against one Mudling; it plays idle, guard, a braced hit, hit, dodge, KO and get up, victory and a run across on each fighter in turn with the state's name on screen, then stops on the list. About 1 minute.
6. Update tools/b3_test.py s8 (body states are painted for the four; clips remain for monsters and the kept moves) and docs/BATTLE3.md "Clips".
7. Tom card (ask animations, lane Tom): "ADMIN > BATTLE LAB > NEW BATTLE > PAINTED STATES: CHAPTER 1. Watch once. Write on this card anything that looks wrong, by fighter and state." It blocks a Claude card c-clipposesfix (Sonnet 5.5, medium) that applies his notes by the smallest change. `after` on c-clipposes is that Tom card.

Stop-loss for this build: if a pose cannot be made to match the standing head with one size number (the drawing itself is off, not just its size), do not warp it and do not generate anything. List that frame on the Tom card as "this painting needs a redo in the Art Library" and ship the rest.

Tests and push steps: claude/next.md ("Tests", "Push procedure"). `python3 -I tools/paint_state_test.py`, `python3 tools/b3_test.py s8`, `node tools/b3-sim.js check`, `python3 tools/smoke.py`.
