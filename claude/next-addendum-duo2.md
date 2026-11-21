# duo2 and duo3 (2026-11-11 morning): iPhone Duo battle layout, sideways

This replaces the line in claude/next.md that says battles on the Duo were not changed. docs/DUO.md in the repo is current.

## duo2 (09:40)
- Tom 09:29: in landscape make the left side (the scene) as big as possible while the right side stays usable; stack the characters on the right vertically.
- Built: `html.duo.landscape #battle.v2` rules in the `html.duo` block at the end of the last `<style>` in index.html. Strip `--b2pw` 188 px (was 280), party one card per row with 30 px faces, command cross text 11 px. Scene 763 x 429 at 951 x 648 (was 671 x 377). Upright Duo, phones and iPads unchanged.
- Fact: the scene is a fixed 16:9 canvas limited by width, so the strip width is the only knob for scene size. Dark bands remain above and below.
- If Tom says the strip is too tight: raise `--b2pw` (each 10 px costs the scene about 10 x 6 px). If he wants the scene bigger still: the next step is cropping the battle painting taller than 16:9 on the Duo, which is an engine change (canvas is 576 x 324 everywhere); propose first.
- An attack list of 8 moves scrolls a little inside the strip (Back is partly below the edge until scrolled).

## duo3 (09:50)
- Tom 09:40: double the size of the turn order tiles.
- Built (same CSS block): tiles 44 px times `--ts` (55 px at 951 x 648, was 27.5), current tile 52 (65 px), TURN label and gaps scaled. The row is about 560 px wide and fits at 867 x 669 too (scene 679 wide). Scene size unchanged.
- Tested in Chromium emulation only at 951 x 648, 867 x 669, 951 x 589. Smoke FAILS [], tag_check ok.
