# Animation tool test: STATE AT 2026-11-17 17:00 (newest file of the thread; also read claude/battle-animation-states-v10.md; background only if needed: claude/animation-tool-test.md, -nara-results.md, -sorceress-tools.md)

Prompt Tom pastes next time: **"Read claude/animation-tool-test-rose-results.md and continue the animation tool test."**
Tom was tired of deciding. Do NOT hand him options. Make the call, ask for at most one thing, keep his steps to: attach image, paste prompt, generate, save or send the result. Tom wants it snip-snap: check, it works, move on.

## GOAL (Tom, 16:31)
Better animation for the main party AND the monsters in battle, including epic bosses and epic final ability animations. Find the right solution without assumptions, and the most cost-efficient tool route.

## TOM'S DIRECTION (binding)
- Tom does NOT want Claude to hand-build animation (painted key poses plus code tweening). Do not propose it again unless every tool route has failed, and then say so plainly.
- Spend credits on targeted tests only, never "video after video" without a plan. Tom has spent about $5.
- 14:47: Tom saw Rose's Wan strike and cheer keyed over the Square plate: "the animation looks fantastic". Do NOT rerun Nara.
- 14:53: do NOT ask whether Sorceress or other outside tools are allowed (he is experimenting; the repo Art Library rule is superseded for this experiment).
- 16:27: Tom said animating the party but not the enemies would look strange. Claude agreed and reversed its earlier call (below).
- 16:34: Tom approved the six-shot exam plan ("sounds good") including about $5 to $8 of spend, and asked to start it in a new conversation.
- Sorceress "unlimited" covers only the non-AI Pro tools (the $49 pass). AI generation always costs credits ($1 = 100). Tom does not need sound: switch audio off. Do NOT buy the Pro pass.

## PLAN APPROVED 16:34: THE SIX-SHOT EXAM
Purpose: settle the model, the tool route and the epic format in one pass.
Routes compared: (A) Wan 3.0 and (B) Grok Imagine Video 1.5. Both are in Sorceress AI Video Gen (Wan 70 credits, Grok 20 credits per about 5 s, per the earlier tool notes), so Tom can run both there with no build. Grok matters because the game's Art Library already calls the xAI API (fact: `art.html` uses `api.x.ai` with `grok-imagine-image-2.0`, and `.github/workflows/art-bake.yml` bakes approved pictures into the game; the rest of that code was not read). If Grok video holds the style, Claude builds video generation into the Art Library (Tom presses Generate, then Approve; no copy and paste) and Sorceress is dropped. Direct prices found 16:31: xAI Grok video $0.05 per second at 480p and $0.07 at 720p; Grok 1.5 $0.08 at 480p and $0.14 at 720p plus $0.01 per input image; fal.ai Wan 2.5 $0.05 to $0.15 per second; no direct Wan 3.0 price found. Whether the xAI video API takes an END frame is NOT checked.

| # | Shot | Proves | Needs first |
|---|---|---|---|
| 1 | Rose strike | Baseline. Wan already passed; run on Grok only | Rose magenta hero (Tom has it, sorceress-20d75deb) |
| 2 | Rose holding a prop (Lamby boomerang wind-up) | Held props: almost every move has one | A Rose-with-Lamby magenta hero (Nano Banana, hero as reference) |
| 3 | KO fall | Hardest body state | Hero with wide margin; END frame EMPTY; no hurt or knocked-out wording (she gets sleepy and flops down for a nap) |
| 4 | One monster idle | Odd bodies | A monster stance frame on flat magenta from the repo's painted enemy sheets (`art/enemies`, docs/ENEMY_SHEETS.md); Claude prepares the image and sends it to Tom |
| 5 | One boss attack | Scale and menace | A boss stance frame, same way |
| 6 | One capstone cut-in (Tom's Tarmac Porsche Transfer) | The epic full-screen format | A start picture of the scene (Nano Banana), not a cutout |

Score each clip: style holds, clean cutout (shots 1 to 5), cost per clip, Tom's minutes per clip. 11 new clips, about $5 to $8.
Prompts for shots 2 to 6 are NOT written. Write them as generic .txt files in `claude/anim-test/` (no banned words, no em dashes), one batch, and give Tom one numbered run list.

## DECISIONS AND RECOMMENDATIONS SO FAR
- Method that passed: one magenta left-facing hero per character; a video model animates it; Claude cuts frames, keys the magenta (`key_magenta.py`), crops to one fixed box (`clip_to_frames.py`); the game plays the strip in battle.
- Epic bosses and Capstones: full-screen cut-ins (a 3 to 5 s video with its own painted background that takes over the screen, played as a normal video file, no cutout). Recommended, untested.
- Monsters (revised 16:27): every monster gets an idle clip; attack clips in a second pass; hit and defeated stay engine-made (shake, flash, fade); Elites and Bosses add charge-up, guard and Flustered. The built game has 86 monsters; the v10 bestiary is not written. `claude/battle-animation-states-v10.md` section 5 still says "monsters stay on painted sheets": that line is superseded by this one; fix the file when it is next edited.
- Clip list for the party under v10: 11 core body clips per character plus 9 to 12 move clips, about 210 to 240 clips, about 300 to 340 generations; first playable pass about 150. Statuses, Primes, Detonations, shields and set pieces are engine layers. One battle outfit per character (an outfit per Vibe adds about 220 clips). Full tables in `claude/battle-animation-states-v10.md`.
- Cost: by hand in Sorceress about $210 to $340 in credits and about 30 to 35 hours of Tom's time. The Art Library route would cut his time to a few hours of approving.
- Scope: battle only. Not overworld walking, not feelings or talk faces. Cutscene beats later.
- Style question still open: test heroes are pencil and ink; monsters, backgrounds and the project instructions are painted "32-bit realistic". It will show side by side in battle. Tom has been told twice and has not chosen. Needs an answer before any batch, not before the exam.
- v10 rules are a design draft and are NOT built; the built battle is "battle 2" (14 moves per character).

## AFTER THE EXAM
1. Report one table (6 shots x 2 models), pick the model and route, and say so.
2. No-credit engine prototype: Rose's strike clip playing in a real battle with damage on the impact frame. Needs a session where the repo is attached with PUSH access (`add_repo` push was denied in the 11-17 session; read worked). Files to read: repo `CLAUDE.md`, `docs/BATTLE_SYSTEM.md`, `engine/stage.js`, `engine/battle-draw.js`, `data/battle2-data.js`, `data/abilities.js`. Test `python3 tools/kit_test.py`, `python3 tools/smoke.py`, look at `tools/shots/` in portrait and landscape.
3. If Grok holds style: build video into the Art Library. If only Wan does: look for a direct Wan route before more hand work.

## GAME FACTS (read-only clone of trivituso81/adventures-of-tom main, 4.2 GB, `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1`)
- Battle stage 576 x 324 stage px; moves are timelines (`ST.play`, `ST.keys`, `pathOf`) that move STILL frames; impact is `landHit`. Sizes in `data/battle-size.js` (Tom 143, TNB 141, Boppy 135, Amy and Deedee 131, Grace about 126, Rose about 95 battle px).
- A clip is not a drop-in: it needs a new "clip" frame type (frame strip with an impact frame marker), scaled by `BATTLE_SIZE`, with `landHit` at the impact frame.
- A phone needs about 300 px tall frames. A 5 s clip at 30 fps is about 2.5 MB of WebP and 150 frames: trim to 1 to 2 s at 12 to 15 fps and load per battle.
- Repo rules: classic scripts in one global scope; bump `?v=` tags and ART_V; `docs/CHANGES.md` entry; purge replaced files.

## TEST RESULTS SO FAR
- Kling 3.0 Omni: idle passes (Tom, Nara); big moves fail on style (heavy outlines mid-move).
- Wan 3.0: Rose cheer and strike PASS (style steady, loop 1.5 of 255, inside frame, crisp feet, no halo, clean cutout). Clips 716 x 1284, 30 fps, 150 frames, 5 s.
- Nara on Wan (idle, pounce): motion and style pass; background failed only because the start picture was cream. Production fix: magenta dog hero first (`hero-leftfacing-magenta-dog-v1.txt`).
- `measure_clip.py` head width is NOT usable when arms are out; judge head size by eye.
- Hero images in Sorceress work: Nano Banana 2.1 with the existing hero as reference gave on-model, left-facing, flat magenta pictures in one try (`hero-leftfacing-magenta-v1.txt`).
- Tom has not reported the real credit cost of a 5 s Wan clip: ask once, with the exam.
- Nothing from this thread is in the game repo.

## Files (claude/anim-test/)
Prompts: `anim-test-1-idle-v4.txt`, `anim-test-2-strike-v4.txt`, `anim-test-5-cheer-v4.txt` (people, magenta, left-facing, no shadow); `anim-test-nara-1-idle-v4.txt`, `anim-test-nara-2-pounce-v4.txt`, `hero-leftfacing-magenta-dog-v1.txt`; `hero-leftfacing-magenta-v1.txt` (people); older v2 and v3 sets remain. Scripts: `measure_clip.py`, `key_magenta.py`, `clip_to_frames.py`, `make_magenta_start.py`. Not saved here: Tom's MP4s and the hero images (he has them).
