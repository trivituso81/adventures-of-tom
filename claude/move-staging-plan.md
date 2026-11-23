# Family moves in three layers: body, stage, set piece (movestage1, 2026-11-22)

Card c-movestage. Tom (2026-11-22 09:53): "every single animation is just Tom pulling out something from behind his back and that's it" and "each subsequent ability as it gets unlocked to be fun, funny, and visually cool, especially with the final ability being visually stunning". Tom (10:09): "I'm also OK with them not all being the same amount of time, like the animation duration can be longer with each subsequent one, similar to any JRPG".

This file wins over the "Engine draws" column of claude/battle-animation-list-ch1-v11.md and over the move parts of claude/guidegen-plan.md for how a family move is made. Body states (idle, guard, hit, dodge, ko, victory, run, give, cast) are unchanged: they stay one video each by claude/video-battle-plan.md.

## 1. Why the moves are flat (finding of 2026-11-22, facts)

| # | Cause | Where |
|---|---|---|
| 1 | The body-state recipe (one person, feet planted, no effects, ends as it began, edge check) was reused for moves. A move made that way can only be a person doing a small thing on the spot | claude/video-battle-plan.md 4.3, `BOOP_APPROVED` |
| 2 | The engine layer the 11-18 list planned (props, set pieces, monster reactions) was never built in Battle 3. Every move without a clip draws one colored ball (`proj`) and one `burst` | `b3PlayMove` in engine/b3-play.js |
| 3 | guideprompts1 had a cheap text model write 70 family move prompts from the rules text, told "props out from behind the back and back again". 74 of the 120 family move prompts in data/guide-prompts.json and data/guide-anims.json say "behind his/her back", all 70 model drafts included, and four job prompts (Rose Tackle, Deedee Windex, Wet-Floor, Scrub) | data/guide-prompts.json, counted 2026-11-22 |

Not the fix: rewording those prompts. A better sentence still makes a person on the spot. The fix is the two missing layers.

## 2. The three layers

| Layer | What it is | Made by | Rules |
|---|---|---|---|
| **Body** | A Wan video of the person acting only: the gesture, the face, the timing of the joke | wan-gen (Wan 3.0, start picture as first and last frame), baked by bake_clip.py as today | A small thing that stays in the hand may be in the video (a cartridge, a pass). Anything that leaves the hand is NOT in the video: the hand throws empty and the stage draws the thing. No glow, no effect, nothing beyond the person. Ends where it began |
| **Stage** | What the engine draws across the battlefield, from one staging row of the move (`B3_STAGE[move id]`, data/b3-stage.js), timed to marks on the body clip | engine (new, card c-movestage-build) | Rigid props are separate pictures. Things that move by themselves are short object-only videos with no person in them. What the monster does is a reaction of the monster's own video picture (knocked back, squashed, covered, its hit clip). Screen shake, flash, dim, glow, words on screen |
| **Set piece** | Capstones only. A full-screen moment of 6 to 8 seconds: the battlefield dims, the body clip plays, the stage takes the whole screen | engine, from the same row's `setpiece` | Built only from the same stage actions and assets; never one generated video of the whole scene (a person in an effects video breaks every check of the body layer) |

Monster reactions never use a painted pose: the engine moves, squashes or tints the picture the monster's own video is showing at that moment (its idle or hit clip), the way the lunge and shake of b3-play.js already do (CLAUDE.md "No painted poses in battle").

Why the stage lives in its own file, not in the kit row: battle animation is out of scope for the battle system (CLAUDE.md, Tom 2026-11-19). The kit files keep the rules; data/b3-stage.js keeps what the player sees, like data/b3-clips.js does for body clips. Nothing in the rules reads it.

## 3. The ladder (the rule for every Vibe)

| Rank | Slot | What it adds | Time budget at 1x (Tom 10:09) |
|---|---|---|---|
| Rank 1 | Basic | A quick gag in the body. Accents only: words on screen, a sound, a tiny shake. No prop on the field | about 2 to 3 s |
| Rank 1 | Skill 1 | The body plus ONE stage element (one prop or one object video doing one thing) | about 3 to 4 s |
| Rank 2 | Skill 2 | A bigger stage element, or one that lasts on the field while its status lasts and answers when the status goes off | about 4 to 5 s |
| Rank 4 | Capstone | The set piece: the whole screen, the most stunning thing that Vibe does | 6 to 8 s |

Each step must be visibly bigger than the one before; the Lab review (card c-movestage-build) plays the four of a Vibe in a row so this is judged by eye. The battle speed button (2x) still halves every time for the player. `budget` in each row is the target; the engine does not cut a move that runs over, the Lab shows its real length beside the budget.

## 4. The staging row (data/b3-stage.js)

One row per move id. Times are seconds at 1x on the battle clock (B3_TEMPO is NOT applied to a staged move: its pace comes from the clip and the row).

```
B3_STAGE.<move id>={
  v:1, tier:'basic'|'s1'|'s2'|'cap', budget:<seconds>,
  body:{clip:'<clip id>', job:'<wan job>', keep:true|false,          // keep: an approved clip whose acting is right
        marks:{<name>:{pic:<n>}|{f:<0..1>}, ...}},                   // pic: picture of the baked clip; f: share of its length until measured
  hit:'<mark or step id>'|'late',                                    // when reveal() fires (each further hit .35 s later, as now); late: a move with no hit shows its effects then
  steps:[{id?, at:'<mark>'|{mark,plus}|{step,plus}|<seconds>, do:'<action>', ...}],   // timeline of this move
  lasting:[{while:'<status id>', on:'self'|'carrier', do:'place'|'hover'|'surround'|'glow', asset, enter:{...},
            then:{beat:'react'|'intercept', do:'<action>', also:[...]}, exit:{...}}],  // stays while the status is on, answers its beat
  setpiece:{dur:<6..8>, dim:<0..1>, steps:[...]},                    // Capstones only; `at` in seconds from its start, or a body mark
  assets:{'<id>':{kind:'prop'|'obj', bg:'magenta'|'black', size:[w,h], loop?:true, prompt:'<prompt file>'}}
};
```

Anchors a step can name: `hand` (the hand point of the body clip at that mark, measured in clip pixels like the clip's `reach`), `self`, `self_front`, `target` (the first target), `each_target`, `above_self`, `above_target`, `ally` / `each_ally`, `foes_front` (the floor line just in front of the monsters), `screen_center`, `screen_left`, `screen_right`, `top`, `floor`.

### 4.1 The stage actions (the only verbs; no move gets its own code, unlike engine/tom-moves.js)

| Action | Does | Main fields |
|---|---|---|
| `fly` | An asset goes from one anchor to another on an arc. With `back` it returns (fly out and back) and ends at the catch mark | `from, to, arc, spin, dur, back:{at, to}, hit` |
| `hover` | Bobs over a unit; usually lasting | `on, amp, rate` |
| `drop` | Falls from above the top edge onto an anchor, squashes on landing | `onto, dur, hit` |
| `cross` | Crosses the field from one edge to the other along a lane, or stops at an anchor and leaves later | `from, to, stop, lane, dur, skid` |
| `rain` | Many copies from above onto every target over a stretch, kinds mixed | `assets[], n, dur, hit:'first'` |
| `surround` | One copy per target ally (mirrored pair from both sides) closes around them; usually lasting | `pair, dur` |
| `place` | Rolls or pops an asset in front of a unit and leaves it there; usually lasting | `on, side, from, dur` |
| `pop` | An asset appears at an anchor with a pop, holds, fades | `on, hold, blend` |
| `words` | Words on screen, centered or over an anchor; `glyphs` shows a list one by one (arrows are drawn as shapes) | `text|glyphs, where, size, color, hold, each` |
| `foe` | The monster's reaction on its own video picture | `react:'knock'|'squash'|'cover'|'hitclip', px, asset` |
| `shake`, `flash`, `dim`, `glow`, `sfx` | Accents | `amp, dur`; `color, dur`; `amount, in, out`; `on, color|'rainbow', while`; `sfx` (names in engine audio) |

The beats a lasting entry can answer already exist in b3-play.js: `react` (a ward or mark answers: Zone One, Winged Shell), `intercept` (Suite Door), `statusEnd` (the element leaves).

## 5. Assets

| Kind | What | How it is made | How it is cut out |
|---|---|---|---|
| Rigid prop | One picture of a thing (a carry-on, a door panel, a car) moved by the engine | A picture job on fal (Nano Banana 2.1, the route that made the start pictures), one per prop, recorded as an Art Library entry in Props > Battle stage with the file `art/stage/<id>.webp` | Flat magenta background keyed out, as the clips are |
| Object video | A thing that moves by itself (wings flapping, a fireball, runway lights chasing), no person in it | First its picture (as a prop), then Wan 3.0 with that picture as first frame (and last frame for a loop), 480p, 3 s: about $0.15 + $0.15 | Solid things: flat magenta, keyed. Glow (fire, light, sparks): flat black, drawn with additive blend so black disappears. Black plus additive is a TEST before any glow asset is used (5.1) |

Both are battle-animation inputs made by the wan-gen Action within the wanauto1 limits ($3.20 per animation, $15 a UTC day), checked by the Action, and judged by Tom only in the Move Lab (card c-movestage-build). Tom asked for exactly this on 2026-11-22.

Prompts for assets follow the image and video prompt rule (clean, each thing once): what the thing is, its look in the game's painted style (warm light from the upper left, no thick outlines), side view facing left where it travels, centered with a margin, flat background color, no people, no hands, no text unless the row says what it reads (the generator paints lettering), no logos or badges.

### 5.1 What is not proven yet

| # | Unknown | First test (card c-movestage-build) |
|---|---|---|
| 1 | Does a mimed throw with an empty hand read right once the engine adds the prop? Does Wan keep the hand empty, or draw a controller anyway? | Controller Toss body video, by eye frame by frame |
| 2 | Can a hand point be measured at a mark of a non-strike clip (the bake finds `reach` only at a strike's impact)? | Measure on Controller Toss and Cartridge Blow; else the session writes the point by eye into the row |
| 3 | Does Wan make a lone object without inventing a person, a hand or a background? | Winged shell loop (magenta) |
| 4 | Does flat black plus additive blend look right over the painted backdrops on the phone (no gray box, no dull glow)? | Blue bang and glare, one each, in the Lab, portrait and landscape |
| 5 | Phone memory: object videos count as clip pictures (b3_test s8 limit: 16 held at once). A Capstone may hold several | Konami Code set piece: count in b3_test s8 |
| 6 | Dimming and restoring the backdrop, and drawing the stage over and under the right units | Tarmac Porsche Transfer in the Lab |
| 7 | Rigid props at small size keep clean edges after the magenta key | Carry-on, controller |
| 8 | A body clip is at most 5 s of source; a set piece is 6 to 8 s. The stage fills the rest | Both Capstones |

## 6. The Battle Guide (built in movestage1)

| Animation | What the Guide shows |
|---|---|
| A family move with a staging row | Its body prompt (from its Wan job), Generate as before |
| A family move with no staging row | "Waits for staging" with one line why. No Generate, no Update the prompt. Its video, if it has one, still plays. A model-written or rule-made draft is shown under OLD DRAFT, NOT FOR USE |
| Body states, monsters | Unchanged |

The old drafts stay in data/guide-prompts.json with `notForUse` and the reason. The wan-gen Action refuses a request for a move that waits (a page cached before this build could still send one).

## 7. Order of work

| Step | Card | What |
|---|---|---|
| 1 | c-movestage (this) | The plan, Tom's eight rows and body prompts, the Guide gate |
| 2 | c-movestage-build | The stage layer in Battle 3, Tom's assets and six new body videos within the auto limits, the Move Lab with Keep, Tweak, Replace |
| 3 | After Tom's Lab review | One card per person: their rows and body prompts, written the same way, then the same Lab |

## 8. Tom's eight signature moves

Rows: data/b3-stage.js. Body prompts: tools/art-library/prompts/wan-tom-<name>-v1.txt (jobs in wangen-jobs.json). Lounge Pass Flex and Zone One Blockade keep their approved clips (Tom: all good, 11-21 and 11-22).

| Vibe | Rank | Move | Body (the video) | Stage | Budget |
|---|---|---|---|---|---|
| Frequent Flier | Basic | Lounge Pass Flex | KEPT: flashes the pass, then the snooty limp-wrist swat | On the swat: "NOT ON THE LIST" over the monster | 2.8 s (the clip) |
| Frequent Flier | Skill 1 | Zone One Blockade | KEPT: arms out like a gate, weight to the side, hold | A silver carry-on with a ZONE 1 tag rolls out and parks in front of his shins for the 2 turns. When a monster hits him, it lurches into the monster: knocked back, "PLEASE WAIT TO BE CALLED" | 3.5 s |
| Frequent Flier | Skill 2 | Suite Door Slide | NEW: spreads both arms, sweeps both hands shut like sliding doors, polite service nod | Low charcoal privacy doors slide shut around the family next to him and stay. A hit aimed at them flashes the door and lands on Tom: "REDIRECTED TO TOM" | 4.5 s |
| Frequent Flier | Capstone | Tarmac Porsche Transfer | NEW: checks his wrist with a patient sigh, two-finger wave to his driver, smug | Set piece 7.5 s: night falls, runway lights chase along the floor, headlight glare, a black SUV with a little card reading TOM in the back window screeches across and stops in front of the monsters, high-beam glare blasts them back (the hit), a jet-wash gust shoves them again, "PLEASE ENJOY YOUR TRANSFER", the car pulls away. Tom keeps a warm spotlight while High Beams lasts | 7.5 s |
| Gamer Geek | Basic | Cartridge Blow | NEW: cartridge from his pocket, one hard puffed-cheek blow, squints into it one-eyed, deadpan nod | "PFFFFT" at his mouth on the blow (the hit); the existing NEXT: <name> marker | 2.5 s |
| Gamer Geek | Skill 1 | Controller Toss | NEW: sidearm throw with an empty hand, watches flatly, catches without looking | A controller with its wrist strap spins out like a boomerang, bonks the monster (knocked back), curves home into his hand on the catch | 3.2 s |
| Gamer Geek | Skill 2 | Winged Shell Lock-On | NEW: one slow circle in the air with a finger, then a calm knowing point | A blue winged shell drops in over his head, flies to the monster, bonks it (squashed), "LOCKED ON", then hovers over it, wings flapping, until his next turn. If the monster attacks: it slams down in a blue blast, shake, "NOTHING PERSONAL" | 4.5 s |
| Gamer Geek | Capstone | Konami Code | NEW: thumbs tapping an imaginary controller in total focus, then both arms up in quiet triumph | Set piece 7.5 s: the screen goes dark, up up down down left right left right B A appear one by one, "CHEAT ACCEPTED", Tom glows rainbow, fireballs, falling stars and meteors rain on every monster (the hit), "+30 LIVES" | 7.5 s |

Spoken lines stay as they are (`line:null`): no new voice line is added by this plan (No unused voice rule).

## 9. Built notes (c-movestage-build, 2026-11-23)

- Built: engine `engine/b3-stage.js` (prefix b3g), Move Lab `engine/b3-movelab.js`, test `tools/movestage_lab_test.py` (builds movestage2a to movestage2d). Six of the eight rows are fully baked and play through the stage layer. A row whose video or pictures are not all baked plays the version it played before.
- Marks: measured on the baked clips (contact sheet of every picture, then picture numbers): shell circle 8 point 19; suite door open 7 close 17 nod 21; porsche watch 9 wave 22; cartridge blow 15 squint 18 and hand (12, 62); konami tap 6 arms 24; controller release 9 catch 21 and hand (33, 45). Every row's marks are now picture numbers.
- Stop-loss on question 4 (flat black plus additive blend): NOT PROVEN. The three object videos that use it (`stage-tom-bluebang-vid`, `stage-tom-glare-vid`, `stage-tom-jetwash-vid`) each failed the edge check on all four tries (15, 36 and 36 of 90 pictures touch the edge, limit 5 percent); a start picture shrunk to 80 percent did not fix it. No baked video exists to run the additive test on. These effects fill most of the frame by design, so the edge check (made for a figure) may be the wrong gate for them. What to try, one change at a time: (1) relax the edge limit for these three jobs with a `limits` entry and a `why` in `wangen-jobs.json`, then judge the baked result in the Lab (an additive effect on black has no visible edge unless the picture border is lit); (2) if the glow shows a hard rectangle in the Lab, give the baked sheet a soft border fade in `bake_stage.py`. Tom's Give it 4 more tries cards (`t-wangaveup-stage-tom-glare-vid-r2`, `-jetwash-vid-r2`) start those tries.
- Memory: stage pictures count toward the 16 clip picture peak and are let go when the move ends (`b3gLetGo`).
