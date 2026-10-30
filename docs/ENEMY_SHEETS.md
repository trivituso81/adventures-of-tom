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
| (none yet) | | | | |
