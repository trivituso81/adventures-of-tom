# Rose Mode picture battle UI (spec, queued 2026-10-27; last in the queue, build after everything in claude/next.md)

Why: Rose (6) cannot really read yet. In Rose Mode the battle must be playable from pictures alone. Images are the primary information; words are small, simple, one or two per thing, never required.

## Where it lives
- Tied to the DIFFICULTY option ROSE MODE (pause menu > OPTIONS, engine/feel.js). Rose Mode on = picture UI on. Grace and Director Modes keep the text UI as built.
- Files: engine/battle2-ui.js (b2RenderCmd and the lists), engine/feel.js (mode check), a new data/battle-icons.js for the icon art (pixel art, same 3x5 font rules for labels), index.html (script tag after data/battle2-data.js, before engine/battle2-ui.js), CSS in index.html.

## Command cross (Up / Right / Left / Down / middle)
- Each of the five commands is a big icon with one small word under it: Up = fist (ATTACK), Right = star burst (MOVES), Left = two joined hearts (TOMBO), Down = heart with a bag (CARE), middle = the actor's portrait with a magnifying glass (LOOK).
- Greyed icons when a command cannot be used (no Tombo yet, no VP).
- The Rose Mode gold glow (b7Recommend) still marks the suggested icon.

## Move lists (Skills, Care & Bag, Tombo, Snack Bag)
- Every move gets its own custom pixel icon (one per key in B2_SKILLS, per signature special, per Tombo, per item) drawn in place of the move name. The name becomes a small label under the icon. One icon per character per move; 16x16 or 24x24, a crisp outline, readable at phone size.
- Every marker on a row becomes a picture with a very simple label:
  - Strength: 1 to 3 small fists (from the move's mult; Tombos 3), label BIG / BIGGER / BIGGEST.
  - VP cost: blue drops, one per VP (6 max shown), FREE shows an open hand.
  - Element: the element chip as its existing color plus a tiny symbol (Kinetic fist, Cozy flame, Splash drop, Sparkle star, Chatter speech bubble, Amber hourglass).
  - Heals: a green plus heart. Helps a friend: a hand on a shoulder. Kindness: a pink heart. Hits everyone: three small figures. Not enough VP: a grey lock.
- Target list: portraits for allies, the enemy sprite for enemies, with a short label (a name is fine).
- Grid: two columns, big rows, the cursor and tap targets stay the same as today.

## Rules
- No new words for Rose to read; every label is one or two plain words. No em dashes.
- Icons are original pixel art, no copied game art.
- Keyboard, gamepad and tap-to-target behave exactly as in the text UI.
- Test: Rose Mode on (localStorage aot-diff 'rose'), open every list for every character in the Battle Lab, screenshot each, check nothing text-only remains; Grace Mode screenshots unchanged; kit_test.py and smoke.py pass.
