# Monster dialogue portraits (Tom 2026-11-06 01:05, `foeport1`, CHANGES 317, main af8dd7c)

- Tom: "monsters should have portraits for their dialogue, zoomed in crops of the monsters face. Only monsters with dialogue, so first make that list. then create the portraits."
- Standing rule now in repo CLAUDE.md ("Monster dialogue portraits") and docs/ENEMY_SHEETS.md step 7b. List: docs/MONSTER_PORTRAITS.md (51 monsters: 40 Part 1, 7 Part 2, 4 Nine Scoops).
- Baker: tools/sprite-bake/bake_foe_portraits.py (SPEAKERS list; ZOOM 2.6 x face size from FOE_HIRES eyes and mouth; per-monster ZOOM_FOR, SHIFT_FOR, CROP_FOR; CHECK=/tmp/x.png contact sheet). Output portraits/foes/<id>.webp 256 x 256.
- Wiring: PORTRAITS['foe_<id>'] in engine/menu.js, speaker names in DIALOG_PORTRAIT_IDS in engine/overworld.js (not preloaded). Tested portrait and landscape with Old Ironbelly; smoke FAILS [].
- Not done on purpose: Marlowe, Vance, Julian Vance, Archivist (people, need a painted face of their own: ask Tom once if he wants that); talking objects and places; battle-only lines.
- Weak crops to judge on the phone: coathanger (face is a dark mask on a hanger), irongill (mostly haze), ironbelly and redpen are tight but fine. If Tom flags one, adjust its entry in the baker and rebake that id only, bump `foeport1` in index.html menu.js and overworld.js tags.
- New speaking monster later: add id to SPEAKERS, the foe_ id list in menu.js, the name in DIALOG_PORTRAIT_IDS, rebake, add a row to docs/MONSTER_PORTRAITS.md.
- Ask Tom ONE line: do the monster faces read well in dialogue?
