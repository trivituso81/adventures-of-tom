# Battle system

The live battle is "battle 2" (`engine/battle2*.js`, numbers in `data/battle2-data.js`). `engine/battle.js` and `engine/battle-draw.js` are the shared runtime (per-frame timers, drawing, props) underneath it. When this document and the code disagree, the code wins; fix this document.

## Rules in one table

| Topic | Rule |
|---|---|
| Turn order | CTB (speed-based, shown as a turn ribbon). Monsters can take turns faster on harder modes. |
| Resources | HP, VP (the per-move resource; the oldest docs call it MP), HEART (the kindness meter that pays for Tombos and Family Finishes). |
| Stats | Six stats; damage uses elements: kinetic, splash, cozy, sparkle, chatter (and hybrids). Monsters have weaknesses and shrugs (see each monster's `hint`). |
| Moves per character | One free basic move, one signature special, then a path of moves (A1 to A5 and B1 to B5 plus Ultimates A6/B6). Keys are in `B8_KITS` (`data/abilities.js`) and `B2_SKILLS`. Names and keys of current Primary moves are listed in `docs/MOVE_KEYS.md`. |
| Under 25% HP | A member kneels with a black eye. |
| Kindness | Kind moves add warmth to a monster (its `warm` value) and fill HEART. Kind moves and heals are weaker when the user is Chilled or Snubbed. |
| Tombos | Tom plus one partner. Tier 1, 2, 3 by chapter; tier 2 costs 50 HEART, tier 3 costs 75. Defined in `B2_TOMBOS` (`data/battle2-data.js`), animated in `B2_TOMBO_ANIM[id]` (`engine/battle2-kind.js`). Fired by `b2RunTombo`. |
| Family Finishes | ff1 to ff4: three or four members. Rows at the end of `B2_TOMBOS` with `tier:'ff'` and `who` instead of `partner`. Runner: `b2RunFinish`. |
| Director's Cuts | A second row directly under a Primary Tombo (`id + '_dc'`, `dc: <primary id>`), unlocked when every participant is level 30. Same cost and flag as the Primary. |
| Caps on party effects | Party heal 60%, revive 50% (in the data), because Tombos skip the normal caps. |
| Difficulty modes | `B7_DIFF` in `engine/feel.js`: ROSE MODE (assist), GRACE MODE (the standard game), DIRECTOR MODE (hard). Modes multiply finished numbers (damage taken, monster HP, monster turn speed), so the gap is the same in every chapter. If Grace mode feels easy, change the base monster `POW` in `data/battle2-data.js`, not the modes. |
| Boss shields | Bosses carry shields broken by hits; every Tombo breaks them automatically (Director mode changes this). |
| Level-ups | Celebrate one member at a time with a chime; new moves are announced. |

## Animation primitives (reuse these)

Every move is a timeline on a stage of real canvas coordinates (576 x 324). Helpers are in `engine/stage.js` (`RFX.ST`) and `engine/recruit-fx.js` (`RFX`, `RFX.SC` scenes).

- `ST.play(E2, [[ms, fn | 'message'], ..., ['hf', ms], [ms, 'end', 'closing message']])` runs a move as an absolute timeline. Strings are messages, numbers are delays or timestamps, functions run instantly. `'hf'` marks the High-Five window at the impact.
- `ST.keys(fx, K)` moves the actor's body through keyframes `{t,x,y,f,rot,hop,hn,sc,hide,ns}`. A segment's `dx/dy` is added on top of the straight line to the next key; for a custom path use `ease:'lin'` and subtract the lerp.
- `ST.foe(f)`, `ST.unit(u)`, `ST.group()` say where bodies stand. `ST.group()` returns `x,x0,x1,top,base,w,list`; there is no `mid`.
- `ST.fly(draw,x0,y0,x1,y1,dur,arc,delay)` flies any drawn object along an arc.
- `scene(name, fn, {back})` registers a drawing layer: back scenes draw after the background and before monsters and party; front scenes draw over everyone. Scene order = creation order within a layer.
- `landHit(100)` or `landHit(share)` applies damage, warmth and kindness for a hit. A last `landHit` applies the move's effects; call `E2.apply()` earlier if the scene needs the result at once.
- Painted props: `PROPART.draw(id,x,y,{h|w,rot,flip})` in `engine/prop-art.js` paints a prop from `art/props/` and returns false if it is not loaded, so a draw helper can paint first and fall back to its drawn version. See `docs/PROP_ART.md`.
- Per-body `battle.fx[i]` timers and `battle.props` thrown objects still exist from the older system.
- `pathOf(fx, ms, fn)` in Tombo code sets a body path; return `{cx,base,frame,rot,sc,hide,noShadow}`.
- Sprite frames available on every party member: `idle, act, celeb, expr, kneel, flip, celebFlip` (Tom and Grace and Rose); Amy, Deedee, Boppy, TNB, Nara add `idle2, run1, run2, wind, throw, aim, spread, clap, hip, sit`. All face left.

## Known gotchas (learned the hard way)

- A move IIFE captures `scene` at load (`const {scene}=RFX`), so wrapping `RFX.scene` later does nothing.
- Big words at the same spot within about 400 ms leave a ghost letter. Keep the first short.
- `bigWord` at scale 3 with a dark fill merges into its outline; use `label()` for dark text inside bubbles.
- A no-damage "kind" Tombo's first `landHit` lands everything at once; call it once at the last beat.
- While the aim warp is on (`B2.aim`), an actor's drawn position is `b2WarpPt(cx,base)`, not the path's cx/base.
- Party members moved by `jog()` are not at `ST.unit(p)`; add the jog offset to scenes drawn on them.
- Never cut holes on the main canvas: paint darkness on an offscreen canvas (`darkC`) and draw it over the stage.
- Greyscale/sepia composite fills tint everything drawn before them.
- Status pops cluster at apply time; keep big words in the top band (y 40 to 66) or well above the monster.
- With 4 party members Tom's home spot is high and overlaps others. Put set pieces at a stage spot right of the monsters (`mx = clamp(GR.x1+150, GR.x1+110, 470)`).
- Nara's black fur over Tom's dark shirt reads as translucent: land her beside him.
- Draw order is party index (Nara last), not depth; Rose riding Tom is the exception.
- The 3x5 font has no slash and no curly apostrophe.
- A voiced beat is anchored to the speech inside its clip, not to the clip's start or length. Measure it with `python3 tools/speech_windows.py amy:tombo2` (voiced segments in ms), place each beat on its words, and multiply every span that waits on a voice by `K=b7Speed()`: the timeline runs K times faster than the audio at 2x. Start the move with `warmLine(id,line)` so the first play is not late, and pass the exact line as `say(id,kind,0,line)`. Worked example: Ymamot Creation (`amy2`) in `engine/battle2-kind.js`. Check the offsets in real ms at 1x and 2x.
- Errors are contained, not fatal: `nextStep` (`data/battle-sprites.js`) catches a step that throws, `RFX.draw` drops the scene that threw, and `frame()` in `engine/main.js` guards each stage so the loop never stops. All report through `gameFault(where,err)`: a short "Hiccup in ..." note on screen and `window.__faults`. A fault no longer freezes the game but it is still a bug; `python3 tools/fault_test.py` proves the guards work.

## Testing a move

```
python3 tools/kit_test.py grace --only=cartwheel --speed2
```
Look at `tools/shots/kit-grace-cartwheel.png` (a contact sheet of frames). Check that the move's line was said, damage or heal happened, and the move ends. For a Tombo, fire it with `B2.tombos='all'` in a lab fight (`__LE.b2Start({party:[...],level:30,foes:[...],bag:[],heart:100,allSkills:true})`).
