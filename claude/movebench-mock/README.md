# Move Workbench: the mock (movebench-design, 2026-11-26)

Drawings of the page planned in `claude/movebench-plan.md`. Nothing here is built. The pictures inside the preview box are real frames of the game's own engine (taken in the Battle Lab on 2026-11-26), so the preview shows what the game draws today. Everything around them is a drawing.

Four animations, one of each kind:

| Name in the files | Animation | What it shows |
|---|---|---|
| `basic` | Tom, Lounge Pass Flex (a Basic) | A move in progress: video, timing, one stage step, two effects, one sound |
| `skill` | Deedee, Wet-Floor Hazard (a Skill that holds a prop) | Held and worn props, a start picture that still has to be made, her answer when a monster slips |
| `capstone` | Tom, Tarmac Porsche Transfer (a Capstone) | A set piece, objects on the stage, two objects with no picture yet (the pink boxes) |
| `monster` | Mudling, Mud Pie (a monster attack with a wind-up) | A finished animation, and who set that |

## The phone, held upright (466 x 657): the whole page from top to bottom

| Basic | Skill with a held prop | Capstone | Monster attack |
|---|---|---|---|
| ![](shots/basic-phone-whole-page.jpg) | ![](shots/skill-phone-whole-page.jpg) | ![](shots/capstone-phone-whole-page.jpg) | ![](shots/monster-phone-whole-page.jpg) |

## The phone, held upright: what fits on the screen

Top of the page, then the same page while a setting is changed (the preview shrinks to a small player that stays on screen).

| | Basic | Skill | Capstone | Monster |
|---|---|---|---|---|
| Top | ![](shots/basic-466x657.jpg) | ![](shots/skill-466x657.jpg) | ![](shots/capstone-466x657.jpg) | ![](shots/monster-466x657.jpg) |
| Changing a setting | ![](shots/basic-466x657-editing.jpg) | ![](shots/skill-466x657-editing.jpg) | ![](shots/capstone-466x657-editing.jpg) | ![](shots/monster-466x657-editing.jpg) |

## The phone, folded, held sideways (678 x 445)

| Basic | Skill |
|---|---|
| ![](shots/basic-678x445.jpg) | ![](shots/skill-678x445.jpg) |

| Capstone | Monster |
|---|---|
| ![](shots/capstone-678x445.jpg) | ![](shots/monster-678x445.jpg) |

## The Duo open, held sideways (951 x 648)

| Basic | Skill |
|---|---|
| ![](shots/basic-951x648.jpg) | ![](shots/skill-951x648.jpg) |

| Capstone | Monster |
|---|---|
| ![](shots/capstone-951x648.jpg) | ![](shots/monster-951x648.jpg) |

## The Duo open, held upright (669 x 869)

| Basic | Skill | Capstone | Monster |
|---|---|---|---|
| ![](shots/basic-669x869.jpg) | ![](shots/skill-669x869.jpg) | ![](shots/capstone-669x869.jpg) | ![](shots/monster-669x869.jpg) |

## The wide monitor (3440 x 1440): a new Admin Dashboard layout, Animations

The Battle Guide pane is 1589 wide, so the list, the preview and the settings fit side by side. Tap a picture to see it full size.

![](shots/basic-3440x1440.jpg)
![](shots/skill-3440x1440.jpg)
![](shots/capstone-3440x1440.jpg)
![](shots/monster-3440x1440.jpg)

## How these were made

`python3 claude/movebench-mock/src/build.py` writes the pages (`basic.html`, `skill.html`, `capstone.html`, `monster.html`, their `-editing` and `-long` forms, and `dash-*.html`); `python3 claude/movebench-mock/src/shoot.py` takes the pictures in `shots/`. The pages are plain HTML with no script: open one in a browser and resize the window to see every layout.
