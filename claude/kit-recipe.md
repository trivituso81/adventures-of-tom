# Recipe: build one character's Option 3 Primary kit (phases 3c, 3d, 4)
Done six times (Tom 3a, Grace 3b, Rose 3c, Deedee 3d, TNB and Nara 4a); all six now at the set-piece standard (Tom, Grace, Rose and
Deedee were redone in the animation quality pass, 2026-10-24). Follow this; do not re-read Tom's or Grace's code unless something breaks.

## Move review rules (Task M, Tom 2026-10-24; claude/move-review.md is the spec)
1. Real-person test: things this person actually does, says or loves. Kids' moves are things a 6- or 9-year-old does. No adult jargon.
2. Beloved moves that pass stay (name, line, animation). Never rename for novelty.
3. One big readable moment per move: props 2 to 3x larger, the joke shown on screen, not in the caption.
4. Scary moves (TNB horror) feel spooky-fun: darkness, a sudden lunge, a scream, a flash. Kid-safe.
5. "Same numbers" = keep the slot's VP, element, target and effects; only name, line and animation change. Rose applied this to every
   row, including "Swap to" rows, so balance holds; do the same unless a row states new numbers (Amy's Kettlebell Swing basic).
6. Every new or renamed move gets its own spoken line, added to the bake list. Update B8_LIKE_ALIAS and scenes.js tips.
- Worked example: the "Move review rebuilds" IIFE at the end of engine/rose-moves.js. Reusable bits there: rv_big (big outlined
  word; put it at F.top-74 so it clears the damage number), lift(f,oy,spin,ox) for moving a monster (jumps, hot-foot, preening),
  noseOf(f), rv_flash, rv_burst, rv_rings, rv_hearts. Copy them into the character's own IIFE with that character's prefix.
- New keys for renamed moves (abilities.js p.key and the o3 entry must match). If the new key equals a legacy key with a legacy
  animation (Rose boop), route the o3 cast with a first line in the legacy handler: if(E2.act&&E2.act.o3&&RM.<id>.<key>Show)....
- A line whose words match an already-baked line (any kind) plays the baked clip; reuse the exact words when the move keeps its name.

## Read (only these)
1. The character's table and cards in adventures-of-tom-ability-revamp.md: `grep -n "^### <Name>" ` then read the table
   (about 30 lines) and the 11 cards (Basic, Signature, A1-A5, B1-B5). Skip A6/B6 (Ultimates are phase 5).
2. Their block in data/abilities.js B8_KITS (`play:` stand-ins) and their legacy kit in data/battle2-data.js.
3. `grep -oh "<id>\.[a-z_0-9]*" data/*.js engine/*.js | sort | uniq -c` for liked moves and tips that name old moves.
4. engine/<id>-moves.js top (helpers, pose names: grep -oh "fx\.[a-zA-Z]*=" and "pose(fx,'..'").
5. Pose frames: recruit-rig characters (Amy, Deedee, Boppy, TNB) have idle, act, wind, throw, celeb, celeb2, aim, spread, clap, hip,
   kneel, sit, run, flip, expr, plus hand points (ST.hand is exact). Tom, Grace, Rose have only idle, act/expr, celeb, celebFlip,
   kneel, flip, run: make them perform with paths, hop, rot (cartwheels, somersaults, lying down laughing) and sc.

## Animation standard (from 4a on; overrides the card timings)
- Every move is a 3 to 6 s set piece where the character performs with their body (walk or run over, kneel, tug, throw, ride,
  sit, shake, then go home). The card's beats, props and joke are the script, not the budget.
- Build it with engine/stage.js: ST.keys(fx,[{t,x,y,f,...}]) for the body (real coordinates; 'home' = own spot; frames 'run',
  'runR', 'walk', 'walkR', sprite keys, or (u,t)=>key; dx, dy, rot and sc may be (u,t)=>number), ST.play(E2,[[ms,fn],...,
  ['hf',impactMs],[ms,'end',msg]]) for the timeline. Draw props as scenes with your own prefix registered by ST.nw('xx_')
  (never warped) at real unit positions (ST.unit, ST.foe, ST.group). Use ST.hand() for the hand/mouth while on a path.
  ST.jolt(f) shakes one monster on its hit; landHit(100) or landHit(34/33/33) per hit (each call hits every target of the wave).
- Support moves perform too: walk to the friend (or monster for kind), do the bit, then E2.apply() on the impact.
- Review: 5 frames per move (kit_test.py FRAMES); if the character is in the same place in every frame, redo it. Keep impact
  words beside the damage number (x+62) or well above it (F.top-74), and rows at their real feet line.
- Move-joke captions at 2x (label scale 2) so they read on a phone; small prop labels can stay 1x.
- Scene time: s.t is seconds since THAT scene started. A scene started mid-move that compares against absolute timeline ms must add
  its start time (pass t0 and use s.t*1000+s.t0).
- Worked examples: end of engine/tnb-moves.js, the Option 3 IIFE in engine/nara.js, the "Option 3 set pieces" IIFE at the end of
  engine/rose-moves.js, grace-moves.js, tom-moves.js, deedee-moves.js, and the Rose "Move review rebuilds" IIFE.

## Write
| Step | Where | Pattern |
|---|---|---|
| Kit data | data/battle2-data.js, `B2_SKILLS.<id>.o3:[...]` after `skills` | Copy Grace's block. Basic: no vp. Sig: `sig:true`, copy legacy `special` fields + `o3:true`. Kind support: `kindFoe:K`. Effects use doc names (`st 'pep_up'`, `'guard'`, `'hooked'`); 5th arg of st = amount |
| Lines | data/lines.js, after an existing key in `LINES.<id>` | One line per move, card line, 12 words max, no em dash. Signature keeps its old lines |
| Animations | end of engine/<id>-moves.js (Nara: engine/nara.js), new IIFE | Copy the header of Deedee's or TNB's set-piece IIFE (helpers, ST, prefix, head(), spotFor, front, rowSpot). Set pieces per the standard above |
| Signature show | engine/battle2-moves.js, or the move file if the legacy signature lives there (TNB) | First line of RM.<id>.<sig>: `if(E2.act&&E2.act.o3&&RM.<id>.<sig>Show) return RM.<id>.<sig>Show(E2);` (DEFEND uses b2DefendSteps). Doc key differs from legacy key: assign RECRUIT_MOVES[id][dockey] to the show |
| Likes | data/abilities.js B8_LIKE_ALIAS | Old kind move that left the early kit -> its closest new kind move |
| Tips | data/scenes.js | Rename old move names in tips; widen `s.key==='old'` conditions to include the new key |

## Gotchas (each cost a rerun once)
- Signature key: data/abilities.js names the Primary signature with the Option 1 key (Deedee: `moon_back`, legacy `hug`). b8Move
  matches by key, so the o3 entry must use the doc key; add RECRUIT_MOVES[id][dockey] and LINES[id][dockey] = the old lines
  (say() finds the same words baked under the old kind). Tom/Grace/Rose keys matched already.
- Load-time globals: never reference OUT (engine/tiles.js, loads later) or B2_NOWARP at the top level of a move file IIFE;
  only inside functions.
- Likes: a liked signature (SILLY K200) fills a test mudling's Warmth and calms it. kit-test sets warmGoal huge; the phase
  test clears f.likes in START.
- Party statuses tick at the START of that member's turn, so a 1-turn Guard is gone once they act; never bump every unit's ct
  in a test setup (the actor then loops), bump foes only.
- B2_NOWARP is defined in engine/battle2-ui.js, which loads AFTER the move files. Register no-warp scene names at play
  time (ST.nw prefixes do this inside ST.play), never at load.
- Any scene drawn at a real unit position (home(u), b2FoeCanvasPos, gpos/tomPos) must be no-warp. Scenes drawn at
  GX/GY/top() are the warped "the enemy" ones: fine for one target, they shear on rows. Rows: use ST.group, no-warp.
- Per-member effects: `who` can be a member id ('rose'); returns nothing if absent.
- Status timing: an o3 status that changes a monster's own action (miss, shushed, silenced) gets wait=true automatically.
- A quick Basic changes turn order: other phase tests may see that character act right after. Make checks turn-order safe.
- Tests: never run more than one suite per command (300 s limit); no background jobs (they get killed).
- No `%` in Python test strings that use `%` formatting; write `%%`.
- The 'end' step must come after the last key of the path: compute it as max(last key t + 100, impact + 800) when the path
  length depends on the party (visit loops), or the move ends while the character is still walking.
- Do not name a loop variable `t` inside a move that already has `t` = the target (const t=E2.targets[0]).
- Sprite height is rows x scale, and some rigs have blank rows above the head (Deedee): place head captions and chest props as a
  fraction you check on a frame (Deedee 0.72 head, 0.40 chest; Tom 0.86; Grace and Rose 0.84).
- Rose on Tom's shoulders: b2RidePos is ignored while she is the actor (she jumps down), so her set piece starts at her floor
  spot. To end a move on the shoulders, aim the last keys at the ride point (battle.drawnAt[tom]: cx+2, base-h+20) and hold the
  path about 1 s past the end message.
- A path is cleared when it ends (engine/battle.js), so a body that must stay somewhere after the move needs the path held there.
- Walking "behind" a monster: the back of the field is a smaller y (horizon about y 100). Route at F.base-60 to -75 so the body
  does not cross the monster's sprite.

## Test (in this order)
In this Project the scripts are claude/kit_test.py and claude/smoke.py (copy them next to the build; BUILD=<game folder>; the local
data/voice-clips.js can be a stub `const VOICE_CLIPS={};`).
1. `node --check` every edited file.
2. `FRAMES=0.5,1.3,2.0,2.6,3.4 python3 kit_test.py <id>` (then again with `--speed2`): every move live, line, damage or warm or
   heal, every kind branch, one sheet tools/shots/kit-<id>.png. About 2 to 4 min per kit at 1x. Look at the sheet, then full-size
   frames of anything doubtful. `PARTY=tom,grace,boppy,deedee` tests member-specific bits (Boppy portion, Deedee crust, Tom mount).
3. `IDS=<id>,<other> python3 smoke.py`: real UI turns (keyboard; the last id by the gamepad helper path), landscape, console errors.
4. If engine/stage.js changed: `python3 kit_test.py tnb nara --speed2` as a regression.

## Hand back
status.md section + lines to re-bake, CHANGES.md entry. Publish: diff the build against the live artifact's files (Artifact read
with paths) and publish only the changed game files with a `files` map (absolute local paths), index.html as file_path; never
data/voice-clips.js (a stub here) or demo/. Publish after each character so Tom can check.
