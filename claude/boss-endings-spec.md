# Boss endings: Step 2 spec (bossend2, 2026-11-11)

Tom (11-11 12:54): after each boss battle the narrator describes what happens to the boss, but the boss is not on screen. He asked for a visually stunning ending for each boss and offered to paint extra frames.

- Step 1 (boss stays on the map through its after scene) is being built by ANOTHER conversation. This doc does not cover it. Read its CHANGES entry before building anything here, and reuse whatever scene step it added.
- Step 2 (this doc) is the painted endings. State on 11-11: the 22 Art Library entries exist as drafts; nothing is baked or wired.
- Assessment and cause: Project doc `claude/next-addendum-bossend1.md`.

## 1. What Tom does

Art Library, tab Enemies, group "Boss endings": 21 entries `ending-<monster id>`. Tab Characters, group "Boss endings": 1 entry `ending-sway-tom-deedee`. He presses Generate, then Approve or Reject. Source of the prompts: `tools/art-library/ending-prompts.js` (re-merge with `node tools/art-library/ending-prompts.js --merge`; it never touches an approved entry).

Pilot: `ending-bigone`. Build chapter 1's ending from it and show Tom before building the rest in chapter order.

## 2. Rules every sheet follows (fact, from looking at all 22 boss sheets)

| Rule | Why |
|---|---|
| Refs = `enemy-mudling-v2.png` (paint finish) + that boss's installed sheet | Same two refs every approved boss sheet uses |
| 3 by 2, six poses, 3:2 (Marlowe and Brain Freeze: 2 by 2, four poses, 1:1) | Same grid as the boss sheets, so the cutter in `bake_foe_sheets.py` works unchanged |
| Pose 1 is the boss's stance pose, same size, calm face | Size anchor for the bake, and the frame shown while the boss talks after the fight |
| All poses face RIGHT | Painted enemy sheets face right; the map mirrors with `dir:'left'` |
| No painted words or numbers | Frames get mirrored; the game draws HERE, ON TIME, DELIVERED itself |
| No painted effects unless a pose names them | Splashes, light, particles and trails are drawn by the game |
| Open empty hands where an item changes hands | The game draws Deedee's tin, the jar, coins, peel, compact, wings, boarding pass |
| Julian has no calm stance (he is seated) | His size anchor is pose 6 (standing), matched to his battle stance by face |

## 3. Build pieces needed once (not built)

| Piece | What to do |
|---|---|
| Baker | Add an ending mode to `tools/sprite-bake/bake_foe_sheets.py`: input the newest approved `ending-<id>` file, same magenta key and cell cut, frames named as in section 5. Scale the whole sheet by one factor so pose 1 (`calm`) matches the installed stance frame (compare body width and height, not effects). Write `art/foes/<id>-end.webp` and `data/foes/<id>-end-hires.js` as a separate atlas `foe_<id>_end` (lazy by the `foe_` prefix). Do not rebake the battle atlas. Contact sheet with the stance beside every ending frame. |
| Frames on the map | `{pose:'<Boss>',foe:'<frame>',dir}` already shows any painted enemy frame on a story monster (`foePoseRows` in engine/story.js, CHANGES bosspond1). Extend it to look in the `_end` atlas. |
| Finale step | One scene step per boss, for example `{finale:'bigone'}`, each a timed list of frame changes, moves and effects, written like a Tombo animation. If Step 1 already added such a step, extend it. Insert it at the line named in section 5; do not reword any spoken line (rule 5: a reworded line goes silent). |
| Calm portrait | While the boss talks in the after scene its dialogue portrait is still the furious stance crop. Add a second crop from `calm` in `bake_foe_portraits.py` and use it for after-scene lines only. |
| Staying state | Bosses marked "stays" keep their last frame on the map until the player leaves the area (and for good where the table says so), through the chapter's STORY_WORLD rule. |
| Test | Real win, not the auto-win harness: `startBattle(findMonster(id))`, set foes to 0 hp, `b2Win()`, press Enter until `battle.active` is false, then play the after scene. Frames looked at in portrait and landscape, kindness win and plain win. `tools/boss_stage_test.py` skips the fight, so it cannot prove an ending. |
| Sizes of people | Warden, Marlowe and Julian are people. Size their painted frames by FACE against the walk art on the same map (the mood pose rule), one nudge, then stop-loss. |

## 4. Kindness win and plain win

Same frames. `flag('kind:<id>')` picks the branch the script already has. The kind branch adds the warm beat (laugh, touched face, hearts in the bubbles, gold star instead of check mark). The plain branch skips it and uses the boss's existing `attack4` follow-through frame as the huff where one is needed.

## 5. Per boss

Frame names are the bake names, in sheet order. "Code" means drawn by the game, no art needed. Map and tile are where the boss stands (fact, read from the running game).

### Chapter 1, The Big One (`bigone`, map hollow 19,11; scene ch1AfterBoss)
- Frames: calm, laugh, offer, wave, dive, eyes.
- Beats: calm while he speaks. Kind: laugh on "Nobody ever made me laugh before". Offer: Deedee's shiny tin (code, the existing tin prop) arcs from his flippers to Deedee with a sparkle trail, `sfx.pickup`. Wave. Hop arc from the shore to open water (15,7 is the existing under-water spot), dive frame in the air. Code: tall splash column, three widening rings across the pond, lily pads bob. Then eyes at the pond spot.
- Ends: stays as eyes above the water until the player leaves Grump Hollow. Replaces the "stays on the shore with the frown frame" rule in STORY_WORLD (bosspond1).
- Note: the painted Big One wears his own rusty tin as a hat. It stays on. Only Deedee's tin moves.

### Chapter 2, The Big Shake (`bigshake`, griffith 4,4; ch2AfterBoss)
- Frames: calm, touched, yawn, half, nearly, mound.
- Beats: calm. Kind: touched on "Nobody has asked in a million years", then one pebble (code) slides two pixels on "Two inches a year". Yawn, small screen shake, sink through half, nearly, mound with dust puffs (code) and gold lines closing on the ground (code). One clean white puff from the pipes (code, find the pipe position on the plate). Sky: a quick search found no map sky tint for chapter 2 (the smog from the pipes is only in the battle text), so the blue-sky wipe is a new effect: a soft brown haze over the plate from the start of the boss scene that clears outward from the Observatory here. Confirm on the map before building.
- Ends: mound stays for good.

### Chapter 3, Old Iron-Gill (`irongill`, sundial 10,3; ch3AfterBoss)
- Frames: calm, give, rise, peak, dive, tail.
- Beats: calm. Give: the jar (existing `STORY_PROPS.jar`) slides from his mouth to Boppy. After Boppy's "Catch and release": rise, peak held about half a second at the top of the arc with a gold water trail (code), dive with a splash crown (code), tail. Narrator line "Iron-Gill sinks back into the Deep Pool" plays over the tail, then bubbles rise (code; heart shaped on a kind win).
- Ends: gone under (existing flag `ch3-release`).

### Chapter 4, The Director's Cut (`directorscut`, stageset 10,4; ch4AfterBoss)
- Frames: calm, moved, bow, wrap, hop, roll.
- Fact: the painted megaphone has no beret, so no beret gag.
- Beats: code dims the set to one spotlight on it. Kind: moved, then GREAT TAKE in marquee bulbs (code). Bow. Wrap with a clapper snap sound. At the narrator line: hop off the rack, roll toward the set edge while the picture closes to a circle around it (code), then reopens with the set lights warm.
- Ends: gone (existing flag `ch4-wrap`).

### Chapter 5, The Red Pen (`redpen`, cafetorium 9,2; ch5AfterBoss)
- Frames: calm, touched, flourish, shut, hop, look.
- Beats: calm. Kind: touched, then flourish while code draws one glowing gold five-point star in a single stroke that hangs and sparkles for two seconds. Plain: flourish with a red check mark. Shut with a click. At the narrator line: hop off the podium and out toward the hall door, each landing leaving a red dot that fades (code). Look back at the door.
- Ends: gone (`ch5-wrap`), before Principal Pruitt walks in.

### Chapter 6, Chairman Cheeks (`chairman`, crown 9,4; ch6AfterBoss)
- Frames: calm, gavel, tie, farewell, leap, throne.
- Beats: calm. Gavel, one bang (`sfx.thud`), then code slides the acorn hoard away in a gold avalanche and the painted jar (existing `crownJarState`) starts to glow. At the narrator line: the throne frame takes his place on the hoard, he stands beside it for tie, farewell, then leap in an arc up and off the far side with leaves spinning behind (code).
- Ends: he is gone (`ch6-wrap`); the empty throne stays for good. Tom's walk to the jar follows as now.

### Chapter 7, The Unread (`unread`, readroom 9,3; ch7AfterBoss)
- Frames: calm, delighted, fan, closing, closed, book.
- Beats: calm. Kind: delighted on "With VOICES". Fan, and the letters lift off as gold motes (code) that circle the room; on a kind win they form a small dragon shape for one second after "You were a wonderful dragon". Motes pour back in. At the narrator line: closing, closed, and the green lamps stop flickering one at a time (the existing chapter 7 map effect gated on `ch7-wrap`, the `loud` block in data/scenes.js, is what should fade out one lamp at a time; confirm what it draws first). Coin slides out, `sfx.pickup`.
- Ends: stays on the lectern as book for good.

### Chapter 8, Old Ironbelly (`ironbelly`, boiler 8,5; ch8AfterBoss)
- Frames: calm, astonished, lookup, settled, baking, give.
- Beats: calm. Kind: astonished on "Bread. There's bread in me". At the narrator line: lookup while eight small blue flames (code) lift off her grate one by one and spiral up the flue, then settled as a warm tint sweeps the room (the existing `barnWarm` switch, made a sweep). After "Two hours later": baking, then give with the peel.
- Ends: stays as calm for good.

### Chapter 9, The Mirrorball (`mirrorball`, dome 9,5; ch9AfterBoss)
- Frames: calm, touched, turn, letgo, moonlit, give.
- Extra sheet: `ending-sway-tom-deedee` (ask, hold, sway left, sway right). Tom 5'11, Deedee 5'5 (known heights). Bake like the greeting hug in `bake_story_poses.py`.
- Beats: calm. Kind: touched. At the first Dome line: turn, then letgo while a round light (code) rises out of her, through the top of the dome, and the room goes dark then silver. Moonlit from then on. At the second Dome line: Tom and Deedee stand under her, ask, hold, then the two sway frames alternating while small moon dots (code) circle the room. Give with the compact.
- Ends: stays as moonlit for good.
- Biggest effect of Part 1: budget the most time here.

### Chapter 10, The Last Call (`lastcall`, gatezero 9,4; ch10AfterBoss)
- Frames: calm, answered, ripple, blank, give, settled.
- Beats: calm. Kind: answered. Ripple, then blank with HERE (kind) or ON TIME (plain) drawn by code on the panel. Give with the coin. After Tom sets the coin: a ring of light (code) rolls out from the gate clock. Give again with the wings. Settled before the long coat appears.
- Ends: stays as settled for good.

### Chapter 11, FINAL CALL (`finalcall`, concourse 34,9; ch11After)
- Frames: calm, disbelief, ticket, walk, away, lookback.
- Beats: calm. Kind: disbelief. After Amy offers the pass: ticket. Its rows turn gold top to bottom (code tint). Walk, then away toward the gate edge, lookback once, then it fades into white light (code) before the Speaker line.
- Ends: gone, before the scene moves to gate00.

### Chapter 12, Gridlock Prime (`gridlockprime`, jpark 14,10; ch12After)
- Frames: calm, amazed, signal, drive, away, wink.
- Beats: stance cuts to calm with a green flash (the lamps turn green). Amazed on "Somebody turned me green". After Amy's "Go": signal, drive toward the street edge, away, wink at the edge. As it leaves, the green lamp (code, item icon) arcs back and lands by Tom for the existing pickup line, and colour returns to the grey street as a wipe spreading from where it stood (the existing `ch12-grey` switch, made a wipe).
- Ends: gone.

### Chapter 13, Drill Worm (`drillworm`, subchamber 12,6; ch13After)
- Frames: calm, relief, winddown, sorry, curl, asleep.
- Beats: calm. Kind: relief on "Nobody ever told me I could stop". Plain: sorry on "I'm sorry about the roof". Winddown with two last sparks (code), the grey chip (code) pops out in a small arc, curl, asleep with a slow breathing bob.
- Ends: stays asleep through the Nickel, Sal and Penny scene until the scene hides it as now.

### Chapter 14, The Warden (`warden`, row; Boppy is a scripted actor; ch14After)
- Frames: calm, run, half, helmet, pool, helm.
- Refs also carry Boppy's face and newest hero so his everyday clothes are right.
- Beats: at Tom's narration: calm, run, half, helmet with gold drips (code). Then a flash of gold light and he becomes his ordinary walk art (the scene already sets `armor=false`); pool sits at his feet and fades into the porch; helm tips and bounces down the steps to Rose (`sfx.thud`), then the existing `wardenhelm` pickup.
- Risk: painted Warden frames next to his walk art. Size by face.

### Chapter 15, HUSH-9 (`hush9final`, grands; scripted actor; ch15After)
- Frames: calm, crack, puzzled, laugh, seated, dinner.
- Beats: at Tom's narration: crack, a line of light, then sound returns as soft coloured rings (code, the reverse of the existing `hush` rings). Calm. Laugh on "It's the TRAIN". Kind: seated after "The train needs a chair", dinner on "It is warm". Plain: puzzled on "I do not understand". It leaves by the door as now.

### Chapter 16, Marlowe (`marlowe16`, town square; scripted actor; ch16After)
- Frames: calm, hand, down, kneel. Kept small on purpose: the script says nobody cheers.
- Beats: during the opening wait the amber (code particles) drains from his fist into the cobbles and blows away on the existing `ch16Wind`. Calm, hand, down on "I only ever wanted it quieter", kneel on "I didn't want it like this". No fanfare, no flash.

### Chapter 17, Twin Lenses (`twinlens`, towervault 10,4; ch17After)
- Frames: calm, crack, dark, down, up, asleep.
- Fact: the Archivist who speaks is the machine itself; there is no separate person.
- Beats: at Tom's narration: crack, then dark. Down on "I was only keeping them safe", up on "That sounds sufficient". Then hundreds of small glowing photograph cards (code) pour out between the lenses and drift up through the room. Asleep, then it fades as now before "The globe".

### Chapter 18, Vance
- No ending. The fight ends with Tom unwritten and the scene already has its light effect.

### Chapter 19, The Oblivion Censor (`censor`, deadletter 12,9; ch19After)
- Frames: calm, lower, half, shown, pretzel, stamp.
- Beats: at the first Censor narration: lower, half, shown, and the black covering breaks into loose letters (code) that scatter. Shown while he talks. At the second narration: pretzel, then stamp with DELIVERED drawn by code on the napkin. He fades as now, then the ledger line.

### Chapter 20, The Chronos-Leviathan (`leviathan`, foreverheart 11,5; ch20Shatter)
- Frames: calm, loose, apart, nearly, clock, gears (six loose gears, cut into six pieces by the bake).
- Beats: at the first Forever Engine line: calm, loose, apart, nearly, clock, with the six gear pieces (code moves them) drifting out to hang in a slow ring round the room, still turning, a tick sound each. Clock fades and Julian's first frame appears in its place.
- Check first: whether the glass living room is painted on the plate or needs drawing.

### Chapter 20, Julian (`julian`, foreverheart 11,6; ch20Shatter and ch20Calm)
- Frames: hat, hands, gifts, lookup, letgo, stand. Size anchor: stand.
- Beats: ch20Shatter: hat at "sitting in it with his hat in his hands", hands on "Look at his hands". ch20Calm: gifts at the first line, lookup on "Clara would be thirty-one", letgo at "Julian lets go" while every hanging gear reverses together and turns gold (code tint), stand on "I do not have anything to bring".

### Nine Scoops, Brain Freeze (`brainfreeze`, scripted actor; nsAfterBoss)
- Frames: calm, lid, hopeful, party.
- Beats: calm. Lid on "Take the scoops", with cold mist (code). Hopeful on "Is there cake?". Party for the existing walk off.

## 6. Reuse check (fact)

| Needed | Exists already | Decision |
|---|---|---|
| Tom and Deedee sway | No | New sheet `ending-sway-tom-deedee` |
| Deedee's tin, Boppy's jar, Bready Mercury jar | Yes, drawn by the game | Reuse |
| Coins, peel, compact, wings, green lamp, hard hat, hush chip, Warden helm item | Item icons or code | Reuse; the loose Warden helmet on the steps is painted (pose 6) |
| Loose gears | No | Leviathan pose 6 |
| Armchair for Julian | A Moon Club armchair prop exists but is a different chair | Painted with Julian |

## 7. Not checked (say so to Tom if it matters)

- Where each ending sits on its map in portrait and landscape. The tile is recorded above; the look is checked at build.
- Chapter 2 has no sky tint on the map today (new effect). Chapter 7's `loud` block and chapter 12's grey (`engine/ch12-render.js`) exist but were not looked at on screen.
- Whether the Library keeps pose 1 at the stance size. The bake scales by pose 1, so a miss costs sharpness, not correctness.
