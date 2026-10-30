# Enemy animation sheets: what Tom sends and what to do with it (2026-10-29)

Tom generates enemy art with an image AI from the prompts in the Monster Codex (a claude.ai artifact built 2026-10-29 from this repo's MONSTERS data; rebuild notes in the Project doc claude/monster-codex-build.md). Expect him to drop one or more PNG sheets into a conversation, often with no words or only the enemy's name. Treat a sheet with no text as "install this enemy".

## What arrives

| Thing | Regular enemy | Boss |
|---|---|---|
| Sheet layout | 1 row x 4 cells, 160 x 160 each (640 x 160) | 1 row x 6 cells, 320 x 320 each (1920 x 320) |
| Frame order | stance, hurt, attack1, attack2 | stance, hurt, attack1, attack2, attack3, attack4 |
| Figure height | 96 to 120 px | 200 to 240 px |
| Facing | RIGHT (toward the family) | RIGHT |
| Background | transparent (alpha); some AIs give flat magenta instead | same |
| Baseline | feet 12 px above the cell bottom | same |
| Extras | often a lone stance PNG as well | same |

The AI will not follow this exactly. Measure the sheet before cutting: find the cells from the alpha (or magenta) gaps, not from the numbers above. If the cell count is wrong, say so in one line and use what is there (a 3-frame sheet still gives stance, hurt and one attack).

## Which enemy it is

Match by file name first (`<id>_sheet.png`, `<id>-final.png`, or the enemy name), then by looking at it against `tools/shots/`. Ids are the keys of MONSTERS (data/monsters.js and data/*-monsters.js). If it is ambiguous, ask one short question; do not guess between two similar enemies (gridlock vs gridlockprime, vance vs julian, lastcall vs finalcall).

## Install steps (same pattern as the painted characters, tools/sprite-bake/README.md)

1. Save the sheet as `tools/sprite-bake/src/foe-<id>-v1.png` (plus `foe-<id>-stance.png` if a lone frame came too). Commit the source.
2. Cut and bake with `tools/sprite-bake/bake_foe.py <id> [--frames stance,hurt,attack1,attack2]` (first sheet: write this script by copying `bake_nara.py`; it uses `sheet.py` `slice_sheet` to cut cells by gaps, removes magenta or soft fringe, and crops each frame to its alpha, keeping one shared baseline). It writes:
   - `art/foes/<id>.webp`: the painted atlas, frames side by side, PIL quality 90.
   - `data/foes/<id>-hires.js`: `FOE_HIRES.<id>` = `{k, rects:{stance,hurt,attack1,...}, rows:{...}, pal, eyes, mouth, top}` where `rows` is a downscaled, quantized copy of each frame (18 to 26 colours) at the game's row scale, because the engine reads rows for size, eyes, mouth and mirroring (`engine/painted.js` draws the painted frame when the atlas has loaded, rows otherwise).
   - A contact sheet `tools/shots/foe-<id>-bake.png`. Look at it.
3. Size: the row copy's height sets how big it draws. `b2LayoutFoes` (engine/battle2-ui.js) scales from `def.sprite` width and `def.scale`. Keep the stance frame's rows about the same height as the enemy's old rows (regular 36 to 56 rows, bosses 60 to 88) so formations, shields, pie tins and the turn ribbon thumbnails (`b2Thumb`) keep working; pick `k` (painted pixels per row pixel) so the painted frame is the sheet's native size. Bosses stay 1.5 to 2x the regular rows.
4. Wire it in `data/foes/<id>-use.js` (loaded right after `data/enemy-facing.js` in index.html; one file per enemy, or `data/foes/use.js` once there are several): replace `MONSTERS.<id>.sprite` with the stance rows tagged by `paintRows`, keep `pal`, re-measure `eyes` and `mouth` on the new rows (moves aim at those: Boop, Flashcard Flurry, the pie tin and the lock reticle use them), and set `MONSTERS.<id>.frames={hurt, attack:[...]}` (each tagged rows). Facing: the sheet faces right already, so add the id to the "drawn looking right" list in data/enemy-facing.js (or remove it from the left list) so nothing mirrors it. Never mirror a frame with writing on it.
5. Frame selection in `b2DrawEnemies` (engine/battle2-ui.js), added once with the first sheet and reused after: draw `frames.hurt` while `f.flash>0`, `battle.shakeEnemy>0`, `battle.enemyKnock>0` or `f.dying`; during `f.lunge>0` spread `frames.attack` evenly across the lunge (2 frames for regulars, 4 for bosses); `stance` otherwise. The overworld (placeMonsters, drawActorExtra) and `b2Thumb` keep using the stance rows. The Un-Grumped hop and the dissolve use stance.
6. Test: `python3 tools/smoke.py`, then a lab or map fight against that enemy (`__LE.b2Start` with its id in `foes`, or `startBattle(findMonster('<id>'))`), screenshots at stance, at a party hit (hurt) and during its own attack (lunge). Zoom the screenshots; check the baseline, the facing, that the shield bubble and lock reticle still sit on it, and portrait and landscape. For a boss also check its phase set pieces (pie tin, shield, adds) still line up.
7. Commit (`feat(foe): painted <Name> sheet`) and push to main; tell Tom which enemy, how many frames landed, and anything the AI got wrong (missing frame, wrong facing, size off) in one line each.

## Rules

- Do not hand-edit `data/foes/*-hires.js`; rebake.
- Keep the old rows in the file as the fallback until Tom approves the painted version on his phone.
- If the sheet faces LEFT, do not mirror it silently. Mirror only when the enemy has no writing on it, and say that you did.
- One enemy per bake; several sheets in one message are several bakes, in the order sent.
- Add each installed enemy to the table below (id, sheet file, frames, date, approved yes/no), and mirror the row in the Project doc claude/enemy-sheets.md.

## Installed so far

| id | sheet | frames | date | Tom approved |
|---|---|---|---|---|
| mudling | foe-mudling-v1.png (Mudling_Battle_Sprite_Sheet) | stance, hurt, attack1, attack2 | 2026-10-29 | no |
| skeeter | foe-skeeter-v1.png (Pixel-Art_Mosquito_Swarm_Sprite_Sheet; lone second-row stance ignored) | stance, hurt, attack1, attack2 | 2026-10-29 | no |
| grump | foe-grump-v1.png (Mossy_Toad_Action_Sprite_Sheet) | stance, hurt, attack1, attack2 | 2026-10-29 | no |
| toad | foe-toad-v1.png (Four-Frame_Lily-Pad_Frog_Sprite_Sheet) | stance, hurt, attack1, attack2 | 2026-10-29 | no |
| log | foe-log-v1.png (Log_Monster_Attack_Sprite_Sheet) | stance, hurt, attack1, attack2 | 2026-10-29 | no |
| bigone | foe-bigone-v1.png (Chubby_Sea_Monster_Sprite_Sheet) | stance, hurt, attack1 to attack4 (6th frame reads as a follow-through close to the stance) | 2026-10-29 | no |
| bigshake | foe-bigshake-v1.png (boss, 6 frames; lone stance on a second row ignored) | stance, hurt, attack1 to attack4 | 2026-10-29 | no |
| tarblob | foe-tarblob-v1.png (stray grey specks removed by DROP_GREY) | stance, hurt, attack1, attack2 | 2026-10-29 | no |
| gridlock | foe-gridlock-v1.png | stance, hurt, attack1, attack2 | 2026-10-29 | no |
| coyote | foe-coyote-v1.png | stance, hurt, attack1, attack2 | 2026-10-29 | no |
| tickets | foe-tickets-v1.png (Ticket Flurry) | stance, hurt, attack1, attack2 | 2026-10-29 | no |
| smoglet | foe-smoglet-v1.png | stance, hurt, attack1, attack2 | 2026-10-29 | no |
| soggysock | foe-soggysock-v1.png (5 cells; the 5th is a duplicate stance, cut with `--frames stance,hurt,attack1,attack2,extra`) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| bobber | foe-bobber-v1.png | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| tangle | foe-tangle-v1.png | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| snag | foe-snag-v1.png | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| irongill | foe-irongill-v1.png (boss, 6 frames; lone stance on a second row ignored) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |
| boommoth | foe-boommoth-v1.png (Boom Mic Moth) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| clapper | foe-clapper-v1.png (Clapper Snapper) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| cuecrab | foe-cuecrab-v1.png (Cue Card Crab) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| fogwisp | foe-fogwisp-v1.png (Fog Wisp, now faces right as asked) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| directorscut | foe-directorscut-v1.png (boss, 6 frames; lone stance on a second row ignored; baked with `--trim-edges`) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |
| popquiz | foe-popquiz-v1.png (Pop Quiz) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| tardybell | foe-tardybell-v1.png (Tardy Bell) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| glitterglue | foe-glitterglue-v1.png (Glitter Glue) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| dodgeball | foe-dodgeball-v1.png (Dodgeball Dread) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| redpen | foe-redpen-v1.png (The Red Pen, boss, 6 frames, baked with `--trim-edges`) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |
| chairman | foe-chairman-v1.png (Chairman Cheeks, boss, 6 frames; lone stance on a second row ignored; `--trim-edges 60`) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |
| peanutgallery | foe-peanutgallery-v1.png | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| shusher | foe-shusher-v1.png | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| stickysap | foe-stickysap-v1.png | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| twigspy | foe-twigspy-v1.png | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| cliffhanger | foe-cliffhanger-v1.png (The Cliffhanger) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| popup | foe-popup-v1.png (Pop-Up Panic) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| unread | foe-unread-v1.png (The Unread, boss, 6 frames, baked with `--trim-edges`) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |
| thedraft | foe-thedraft-v1.png (The Draft) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| pickyeater | foe-pickyeater-v1.png (The Picky Eater) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| wetblanket | foe-wetblanket-v1.png (Wet Blanket) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| ironbelly | foe-ironbelly-v1.png (Old Ironbelly, boss, 6 frames, baked with `--trim-edges`) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |
| velvetrope | foe-velvetrope-v1.png (Velvet Rope) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| stuffedshirt | foe-stuffedshirt-v1.png (Stuffed Shirt; 78 rows tall) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| coathanger | foe-coathanger-v1.png (The Hanger-On) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| soreloser | foe-soreloser-v1.png (The Sore Loser) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| mirrorball | foe-mirrorball-v1.png (The Mirrorball, boss, 6 frames, `--trim-edges`) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |
| carryon | foe-carryon-v1.png (Carry-On; source had a white streak artifact between frames, removed from the saved source; 5th cell is a spare stance, cut with `--frames stance,hurt,attack1,attack2,extra --extra-ok`) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| jetlag | foe-jetlag-v1.png (Jet Lag) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| unclaimed | foe-unclaimed-v1.png (The Unclaimed) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| armresthog | foe-armresthog-v1.png (The Armrest Hog) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| lastcall | foe-lastcall-v1.png (The Last Call, boss, 6 frames, `--trim-edges`) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |
| lostluggage | foe-lostluggage-v1.png (4 frames) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| redeye | foe-redeye-v1.png (4 frames, `--cut-y 385`) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| standbysprite | foe-standbysprite-v1.png (4 frames) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| finalcall | foe-finalcall-v1.png (chapter 11 boss, 6 frames, `--trim-edges`) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |
| gridlockprime | foe-gridlockprime-v1.png (chapter 12 boss, 6 frames, `--cut-y 385 --trim-edges`) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |
| hushling | foe-hushling-v1.png (4 frames plus a spare stance on the right, `--extra-ok`; white streak and specks between x 1697 and 1797 blanked in the saved source) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| turnstile | foe-turnstile-v1.png (Turnstile Grump, 4 frames, lone stance on row 2) | stance, hurt, attack1, attack2 | 2026-10-30 | no |
| drillworm | foe-drillworm-v1.png (Dual-Coast Drill Worm, chapter 13 boss, 6 frames, `--cut-y 370 --trim-edges`) | stance, hurt, attack1 to attack4 | 2026-10-30 | no |

## How it is installed (built 2026-10-29, first six sheets)

- Real sheets arrive about 2170 x 725 (not 640 x 160), transparent background, one row, frames of unequal width (a tongue or splash makes one wider). `tools/sprite-bake/bake_foe.py <id>` cuts them at the emptiest columns, so no cell size is assumed.
- One command per enemy: `python3 tools/sprite-bake/bake_foe.py <id>`. Source goes in `tools/sprite-bake/src/foe-<id>-v1.png`. It writes `art/foes/<id>.webp`, `data/foes/<id>-hires.js` and a contact sheet `tools/shots/foe-<id>-bake.png`.
- Eye and mouth points (what Boop, Flashcard Flurry and the lock reticle aim at) are hand set as fractions of the stance in the `MARK` table at the top of bake_foe.py. Add the new id there; check them on the contact sheet (red = eyes, cyan = mouth).
- Stance width is 44 cells (boss 42), which keeps the on-screen width the old pixel sprite had (b2LayoutFoes scales by width); the painted height follows the painting.
- Wiring is shared: add the `<id>-hires.js` script tag before `data/foes/use.js` in index.html (after nara-hires-use.js). use.js installs every FOE_HIRES entry; it keeps the old rows as `sprite0`. `FOE_PAINT_OFF=true` (or `{log:true}`) before use.js turns painting off.
- Frame choice is `b2FoeFrame` in engine/battle2-ui.js: hurt while hit or dying, attack frames in order across a lunge, otherwise stance; calm (un-grumped) hop uses the stance. Overworld and the turn ribbon use the stance.
- The painted Big One already wears a rusty tin, so Deedee's pie tin overlay is drawn lower (`tinY`) on it instead of floating above.
- Sheets can arrive with colored fringe on almost-transparent pixels (alpha 1 to 9); bake_foe zeroes alpha under 10, so it never shows. A second row is detected by a tall run below a gap of 4 rows or more. Hovering or standing enemies keep the shadow painted in their sheet, so a faint second shadow can show under the engine's own ellipse.
- Test: `python3 tools/foes_test.py [ids]` writes `tools/shots/foes-<id>.png` (stance, hurt, attacks in a real battle); look at it.
