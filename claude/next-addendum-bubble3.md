# bubble3 + bubble4 (2026-11-12 ~09:45). Read with claude/next.md (not edited there: it is large and other sessions write it)

- Tom: he approved new speech bubbles in admin (`prop-bubble-a`) and did not see them in the game; then "I don't want pixel text".
- bubble3 (fact): bubble2 (11-11) painted only the battle bubble bodies. The overworld talk prompt (`drawTarget` in `engine/town-render.js`) was still drawn with code rectangles; it now uses `BUBBLE.draw('rect',...)`.
- bubble4 (fact): words and marks in bubbles were still the pixel `label()` font. New `BUBBLE.text(txt,x,y,color,sc)` in `engine/prop-art.js` (bold Trebuchet, squeezed to the label width). Wired in the overworld prompt (A, !, round dots), `bubble()` in battle2-kind.js, intro TATA shout, nara.js (2), tom-moves.js Know-It-All, tnb-moves.js Foraged at Dawn.
- Tested: Square screenshot at a sign (portrait, A is smooth); kit_test tom know_it_all and tnb foraged_at_dawn FAILS [] with frames looked at; smoke FAILS []; tag_check ok. Landscape overworld ran with 0 errors, frame not viewed.
- Not changed: other pixel text outside bubbles (TAP! prompt, REC, FACT CHECK stamp, HUD labels). If Tom means all pixel text in the game, that is a larger change: ask which screens.
- Not checked: Boppy's SLOW DOWN! bubble and any other drawn bubble; grep `fff1cb` in engine/.
- Tom's phone check: stand next to a person or sign (painted bubble, smooth A or dots); a battle with Foraged at Dawn.
