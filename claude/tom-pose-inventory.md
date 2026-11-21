# Tom: poses beyond standard (inventory, 2026-11-01)

Scope: everything Tom needs besides the standard pose, walking poses and the standard battle poses (the 16 frames of claude/tom-battle-sheet-prompt.txt). Built from the repo code (engine/tom-moves.js, engine/battle2-kind.js, data/tom-hires-use.js, engine/intro.js, data/tomride-use.js) and docs/CHANGES.md. Nothing here is installed in the new caricature style yet. The current painted Tom (older style, dark tee) already has sheets for groups A, C and D.

## A. In battle, already in the game (old style, to be redone in the new style): 24 poses

| Pose key | What it shows | Used by | Wired? |
|---|---|---|---|
| hold | thumbs on a controller | Press Start | yes |
| annoyed | holding the controller out | Press Start | yes |
| tw_windup | throw wind-up | Press Start | yes |
| tw_follow | throw follow-through | Press Start | yes |
| carry | carrying the sourdough jar | Starter Splash | yes |
| raise | jar raised overhead | Starter Splash | yes |
| lidpop | opening the jar lid | Starter Splash | yes |
| splash | jar tipped, starter flying | Starter Splash | yes |
| goo | face covered in starter | Starter Splash | yes |
| proud | hands on hips, calm | Starter Splash, Popcorn Jump, DEFEND intro | yes |
| bowlsit | seated with a popcorn bowl | Popcorn Jump (with TNB) | yes |
| spook | startled, bowl held | Popcorn Jump | yes |
| scream | mid-jump scream | Popcorn Jump | yes |
| cower | crouched, hands over face | Popcorn Jump | yes |
| lift | lifting something | Sourdough Snob (Dutch Oven) | no |
| fling | arm flung out | Starter Splash (alt) | no |
| unbox | unboxing | Retail Therapy, Mint Unboxing | no |
| flick | flicking a card | Flashcard Flurry | no |
| brush | brush stroke | Kanji Strike | no |
| limit | big arms wide, laughing | Cartridge Tilt (Final Boss) | no |
| startled | hands up, alarmed | none yet | no |
| direct | pointing | none yet | no |
| bowlthrow | throwing the bowl | none yet | no |
| frozen | frozen in fear | none yet | no |

## B. In battle, stand-in used today (candidates for dedicated poses)

| Pose | Where the stand-in shows | Stand-in today |
|---|---|---|
| Sit on the floor, no props | Cuddle (Nara in his lap), Pick the Rhubarb | kneel frame |
| Lying flat, eyes closed | Amy's airplane pod scene (Wing Walk) | drawn under a duvet |
| Mid-cartwheel wobble, then face down on the ground | Judge Grace (Grace 2, Director's Cut) | drawn tilt |
| Headphones on, finger on ear cup | Noise-Canceling | idle plus drawn headphones |
| LED mask on, eyes closed | 10-Step Skincare | idle plus drawn mask |
| Finger raised, "um, actually" | Know-It-All, Sourdough Snob lecture | act frame |
| Pulling a plane shade down / slamming a door | Seat 1A, Peasants | act frame |
| Leaning back on a rope | Tug of War (Nara) | idle |
| Cupped hands low, a stirrup | Uncle Spotter Toss | drawn hands |
| Straining, sweating | Garden Lesson (Director's Cut) | idle |
| Raised cup toast | Cone Six Across the Miles (with TNB) | drawn cup |
| Arms out holding a plate stack | Wine and Gossip / Clean As You Go (Deedee) | idle |

Most of the ~48 team-move animations use only stock frames (idle, act, celeb, kneel) plus drawn props. Only Popcorn Jump uses the painted extras today.

## C. Rose on his shoulders (separate figure, data/tomride-*.js)
Tom carrying Rose as one painted figure: overworld 9 frames (down, up, left, 3 each), battle 11 poses with the same names as Tom's standard battle set, plus a KO. Used on the welcome screen, overworld and battle whenever Rose rides.

## D. Out of battle
| Pose set | Count | Where |
|---|---|---|
| Arrival stretch, front facing: tired, start, full, side, crack, neck, exhale, fresh | 8 | Opening cab-line scene (engine/intro.js) |
| Kiss lean, hug lean | 0 art | done in code by leaning the walk sprite; no dedicated frames |
| Story cutscenes | 0 | use the walking sprite; no Tom-specific poses in scenes |

Totals: A 24 + B 12 candidates + C 21 (9 + 11 + KO) + D 8.
