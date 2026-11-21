# YOUNG BOPPY (Tom 2026-11-06 11:51): item 1y

STATUS (CHANGES 375 and 377, pushed 11-06 ~12:55): Tom supplied the hero (12:38) and the walk sheet (12:49) himself.
- `art/raw/characters/boppy-young-hero-ref-v1.png` (1024 x 1536; cream background, inked watercolor look with outlines, big head, green tank with white stripe, navy shorts, white socks, dark shoes).
- `art/raw/characters/boppy-young-walk-sheet-ref-v1.png` (1247 x 1261, 3 x 3 on magenta: front, back, profile rows; stand plus two steps each).
- The `boppy-young-hero` and `boppy-young-walk-sheet` Library entries and prompts were removed (two Generate presses saved).
- Two drafts remain in group Boppy: `boppy-young-battle-sheet-1` (4 x 2, 8 frames; refs hero ref, walk ref, adult battle sheet 1 for angle and size) and `boppy-young-battle-sheet-2` (3 x 2, 6 frames; refs hero ref, young battle 1). Source `tools/art-library/boppy-young-prompts.js`. Battle 2 points at a file that exists only after Tom approves battle 1. 2 Generate presses.

NEXT: (1) Tom generates and approves battle 1, then battle 2. (2) Show a head row next to adult Boppy (adult head share about .21 to .22; the supplied hero's head looks bigger, so check). (3) After both are approved, repoint `boppy-ab-xc-ult` (the real id of the Van Cortlandt Park '70 entry; refs now adult Boppy files) to the hero ref, walk ref, battle 1 and 2 (keep prior versions), and change frame 1 to "a running number pinned to his tank top". That is a third Generate press; say so first. Install is later, only after approval; the walk ref is the source for his overworld walk if one is ever needed (painted as supplied, no resizing).

Watch: the hero ref has black outlines and a cream background, while the battle prompts say painted, no thick outlines, magenta background. Prompts say copy the pictures exactly; if sheets come back outlined or cream, change the prompt wording to match, not Tom's art.

## Canon (copied to canon-addendum-2026-11-06b.md)
- Young Boppy, October 1970, college freshman, about 20: clean-shaven, full head of dark black hair, Italian American looking, skimpy vintage track uniform (tank top, short running shorts, socks, shoes), no cap. 5'7. Hero and walk sheet painted by Tom. Not the Boppy recruit; flashback move only.

Style rules: painted, realistic caricature. Never 16-bit, 32-bit, SNES, pixel art, retro, sprite, no "sepia" in character prompts (the game adds the sepia overlay). No hurt or knocked-out wording. No left/right words. No em dashes.

## Install (later; not part of this item)
Replace the old pixel young-Boppy frames (youngOn/youngOff injected by the `xc_ult` wrapper in engine/boppy-moves.js; bare_* frames stay for Cap Swat). Follow claude/next-addendum-ability-rest.md recipe. Keep numbers and line unchanged. Test: kit_test boppy --only=xc_ult --speed2, smoke, portrait and landscape.
