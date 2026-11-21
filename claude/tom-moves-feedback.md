# Tom moves: Tom's feedback (26 Oct 2026), to build next
Source: Tom's verdicts after watching the Tom Moves viewer (https://claude.ai/artifact/QYVvBSvjYLd453ZTVLdv3n, db collection tom-feedback), pasted into chat.
Files: engine/tom-moves.js (RM.tom.* shows; later IIFEs tv_, t3_, tp_ win), data/battle2-data.js (B2_SKILLS.tom.o3, rows at lines ~149-182), data/abilities.js (B8_KITS.tom, B8_LIKE_ALIAS tom.starter -> sourdough_snob), data/lines.js (LINES.tom), engine/audio.js (sfx).

| Move | Verdict | Tom's note | Build decision |
|---|---|---|---|
| Button Mash (basic) | tweak | Tom says "Smashing all the buttons always works!" | Change only the spoken line to "Smashing all the buttons always works!" (replaces "A, A, A, A. Very technical!!!"). Animation and numbers stay. New line goes in status.md "Lines to bake" and claude/voice-baker-scripts-tombo.json (until baked it is silent). |
| DEFEND (sig) | keep | | No change. |
| Starter Splash (A1) | keep | | No change. |
| Sourdough Snob (A2) | replace | Make the theme about building a really complicated cake and feeding everyone | New scene and new name. Decision: rename to "Seven-Tier Showstopper" and keep the key sourdough_snob so likes, saves and aliases keep working. Tom builds an absurdly complicated multi-tier cake (scaffolding, piping bag, a tiny ladder, sparklers), it wobbles but holds, then he slices it and feeds the whole party plus the ally he targets. Keep the numbers: cozy, heals the chosen ally 30%, clears Amber-Stuck, kind on a monster (kindFoe 30), VP 3. Wording stays dry and calm. Rewrite the desc in data/battle2-data.js and the spoken line (LINES.tom.sourdough_snob) to match the cake; log the new line to bake. No em dashes. |
| Overpriced Gadget (A3) | keep | | No change. |
| Noise-Canceling (A4) | keep | | No change. |
| Seat 1A, Peasants (A5) | tweak | He does not need to lie down in the animation (he can still say it) | Remove the lie-flat pose and rotation from the animation; Tom stays upright (idle or act frame) while the privacy door slams and the shade comes down. Keep the spoken line "Wait your turn, Boarding Group 5. I'm lying flat now." exactly (the baked clip still plays). Numbers unchanged. |
| Boarding Group Zero (A6) | keep | | No change. |
| Flashcard Flurry (B1) | tweak | The flashcards should have kanji on them | Draw real kanji on every flying card (pixel kanji, e.g. 火 水 木 山 日 月, chosen per card; the 3x5 font has no kanji, so draw them as small pixel rows or short strokes on the card face). Effect, timing and line unchanged. |
| Konami Code (B2) | keep | | No change. |
| 10-Step Skincare (B3) | keep | | No change. |
| Kanji Strike (B4) | tweak | Combine video games with Kanji, more dramatic fire | Rebuild the show: a video-game frame (pixel HUD, a "boss HP bar", a 火 power-up pickup or a kanji "cartridge" loading screen) around the brushstroke; the brush draws 火 in glowing strokes, then it erupts into a big dramatic fire (layered flames, embers, screen flash, shake) on the target. Keep the line "That one means fire! You should have STUDIED!" and the numbers (sparkle, warmth x2, +35% on a debuffed target, VP 4). |
| Know-It-All (B5) | keep | | No change. |
| Cartridge Tilt (B6) | keep | | No change. |

## Notes for the build
- Only five moves change: Button Mash (line), Sourdough Snob (replace), Seat 1A (animation), Flashcard Flurry (kanji), Kanji Strike (rebuild). Do not touch the other nine.
- Any changed line is silent until the all-voices bake; add it to status.md "Lines to bake" and claude/voice-baker-scripts-tombo.json. Seat 1A and Kanji Strike lines stay as they are.
- After the build, republish the Tom viewer (copy changed game files server side from the GAME artifact: files:{path:{artifact:<game url>,path}}), keep engine/tom-viewer.js (update its SETUP/desc text for the changed moves). Clear tom-feedback only after Tom reviews. Do not publish the game link until Tom approves.
- Test: smoke.py, kit_test.py tom --speed2, and the Tom viewer test (all 14 moves, portrait and landscape).
