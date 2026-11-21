# Justin: ability kit and animation sheets (approved 2026-10-31)

Tom will drop a zip of Justin's painted animation sheets into a conversation, often with no words. That means "install Justin as a party member with this kit". This doc is the whole spec. Justin has overworld walk art already (`tools/sprite-bake/src/justin-walk-v1.png`, baked by `tools/sprite-bake/bake_justin.py`); he has no battle art, moves, lines or party entry yet.

## Canon (decided 2026-10-31)

- Justin is Amy's husband and the girls' dad: electrician, watches sports and yells at the screen, is refinishing the basement, dresses in designer clothes, extremely sensitive feet. 6'5", the tallest person in the game.
- Recruiting: he is usually at work. He is found at home (GREGORI) on the couch watching the game, and joins as a fourth option for the fourth slot alongside Amy, Deedee and Boppy, with the same yes/no and swap-out prompts. Chapter availability follows `CHAPTERS` in `engine/story.js`; add him to the same lists as Amy.
- Interface and messages say Justin. Nobody calls him Dad in menus.

## Kit

| Slot | Key | Move | MP | What happens | Spoken line (data/lines.js) |
|---|---|---|---|---|---|
| Basic | loose_wire | Loose Wire | 0 | Yanks a loose wire from an invisible wall, jabs the bare copper end at the enemy, spark (game fx), gets a little zap himself, drops it, smirks | "Loose wire. Not my problem any more." |
| Start | wire_nuts | Wire Nuts | 3 | Flings fistfuls of colored wire nuts, underhand burst then an overhand throw, three quick hits (game draws the nuts in flight as props) | "Wire nuts! Never have enough of these." |
| Start | bad_call | Bad Call | 4 | Jumps up from the couch, points at the enemy like a ref, yells with his whole body, stomps, sits back down muttering | "ARE YOU KIDDING ME WITH THAT CALL?" |
| Start | fresh_fit | Fresh Fit | 5 | Runway walk, collar fix, sunglasses on, fashion poses, a dazzle flash (game fx) hits the enemy, wink, strut back | "This shirt cost more than your pond." |
| Lv 2 | demo_day | Demo Day | 6 | Hoists a sledgehammer, two swings into a basement wall (game draws the wall, crack and chunks falling on the enemy) | "Demo day! Wall's coming down!" |
| Lv 3 | breaker_flip | Breaker Flip | 7 | Opens a breaker panel, flips one OFF (screen goes dark), counts down, flips ON, lightning (game fx) strikes the enemy | "Breaker's off. Breaker's... on." |
| Lv 4 | giant_sneeze | Giant Sneeze | 8 | Slow exaggerated build, then a deafening sneeze. Enemy slides backwards across the screen and loses its next turn (enemyStunned 1, same timer as confusion). New sfx: very loud sneeze. | "Ah... ah... AH CHOOOOO!" |
| Lv 5 | foot_tap | Foot Tap | 10 | Rose walks over (her own sprites) and taps his sneaker toe as lightly as possible. He screams; the scream is the hit. Biggest damage in his kit. Grace taps if Rose is KO. | "MY FOOT! WHO TOUCHED MY FOOT?!" |
| Special | drywall | DRYWALL | 0 | Carries in a drywall sheet, stands it in front of the party, screws it in with a drill. All damage to the party halved for one round. | "Drywall's up. Let it dry." |

Other lines: hurt "Not the jacket!", low "Somebody turn the game back on.", ko "Tell the basement I loved it.", win "And THAT is how you close out a game."

Damage multipliers follow the standard cost ladder (see Boppy's entry in `data/abilities.js` and `data/party.js`). No em dashes in any of it.

## The zip that arrives

Ten PNG sheets, magenta background, square cells of about 256 px, Justin facing left, painted no-outline caricature, standing height about 200 px. The image AI will not hit these numbers exactly: cut cells by magenta gaps with `tools/sprite-bake/sheet.py slice_sheet`, never by fixed pixel positions. The prompts are in the Project doc `claude/justin-ability-prompts` zip; the file names below are the prompt names, Tom's image file names may differ, so match by content.

| Sheet | Grid | Frame keys in order (left to right, top to bottom) |
|---|---|---|
| 00 battle stances | 4 x 2 | ju_idleA, ju_idleB, ju_walkA, ju_walkB, ju_hurt, ju_low, ju_ko, ju_win |
| 01 loose wire | 4 x 2 | lw_spot, lw_grab, lw_pull, lw_present, lw_jab, lw_zap, lw_drop, lw_smirk |
| 02 wire nuts | 4 x 4 | wn_walkA, wn_walkB, wn_reach, wn_grab, wn_show, wn_wind, wn_throwA, wn_throwB, wn_throwC, wn_reload, wn_windB, wn_throwD, wn_throwE, wn_dust, wn_pocket, wn_nod |
| 03 bad call | 4 x 4 | bc_watch, bc_lean, bc_shock, bc_rise, bc_point, bc_yellA, bc_yellB, bc_yellC, bc_pace, bc_armsOut, bc_headGrab, bc_stomp, bc_yellD, bc_huff, bc_sit, bc_mutter |
| 04 fresh fit | 4 x 4 | ff_walkA, ff_walkB, ff_stop, ff_collar, ff_sleeve, ff_shades, ff_poseA, ff_poseB, ff_turn, ff_poseC, ff_cuff, ff_poseD, ff_lookBack, ff_wink, ff_shadesOff, ff_strut |
| 05 demo day | 4 x 4 | dd_walkA, dd_walkB, dd_lookUp, dd_crack, dd_lift, dd_shoulder, dd_windA, dd_windB, dd_swingA, dd_swingB, dd_impact, dd_recoil, dd_swingC, dd_impactB, dd_rest, dd_wipe |
| 06 breaker flip | 4 x 4 | bf_walkA, bf_walkB, bf_open, bf_scan, bf_trace, bf_found, bf_grip, bf_flipOff, bf_dark, bf_wait, bf_count, bf_flipOn, bf_flash, bf_brace, bf_close, bf_salute |
| 07 giant sneeze | 4 x 4 | gs_walkA, gs_twitch, gs_sniff, gs_rub, gs_buildA, gs_buildB, gs_buildC, gs_peak, gs_sneezeA, gs_sneezeB, gs_sneezeC, gs_recoil, gs_stagger, gs_sniffB, gs_wipe, gs_excuse |
| 08 foot tap | 4 x 4 | ft_idle, ft_notice, ft_wave, ft_glance, ft_tapped, ft_freeze, ft_screamA, ft_screamB, ft_screamC, ft_hop, ft_clutch, ft_hopB, ft_screamD, ft_pant, ft_point, ft_fine |
| 09 drywall | 4 x 4 | dw_walkA, dw_walkB, dw_reach, dw_lift, dw_carryA, dw_carryB, dw_swing, dw_set, dw_lean, dw_driverA, dw_driverB, dw_driverC, dw_tap, dw_step, dw_admire, dw_thumbs |

Props painted into the sheets (do not add PROPART copies for these): wire (01, frames 2 to 6), wire nuts in hand (02, frames 4 to 6 and 11; the thrown ones are game props), sunglasses (04, frames 6 to 16), sledgehammer (05, frames 5 to 16), breaker panel and glove (06, frames 3 to 16), drywall sheet and drill (09). Bad Call has no couch: the seated frames sit on air.

## Install steps (follow the Boppy pattern; he is the closest kit)

1. Save every sheet as `tools/sprite-bake/src/justin-<sheet>-v1.png` (`justin-battle-v1.png` for 00, then `justin-loosewire-v1.png` and so on). Commit the sources. If a sheet is missing or has the wrong cell count, say so in one line and install the rest.
2. Write `tools/sprite-bake/bake_justin_battle.py` by copying `bake_boppy.py` plus `bake_boppy_extra.py` (head warp, black eye on ju_low, KO swirl, magenta fringe removal). Cut every sheet by gaps. Emit `art/chars/justin-battle.webp`, `justin-ko.webp`, one `justin-<move>.webp` per ability sheet, and extend `data/justin-hires.js` (rows, palette, atlas rects for all keys above). Write a contact sheet to `tools/shots/justin-bake.png` and look at it. Head and height: he stays the tallest party member (see the ratios in `bake_justin.py`); keep the battle idle at roughly the same row height as Michael plus a few rows.
3. Party data: add `justin` to `data/party.js` (stats on Amy's curve, slightly more HP, slightly less speed), `data/abilities.js` (the kit table above, standard cost ladder), `data/progress.js` level unlocks at 2, 3, 4, 5, and `data/lines.js` (move keys plus hurt, low, ko, win, special). Portrait: `portraits/justin.png` cut from ju_idleA like the others.
4. Moves: new file `engine/justin-moves.js`, loaded right after `engine/boppy-moves.js` in `index.html`. Build every move from the queue primitives in `docs/BATTLE_SYSTEM.md` (`ST.keys` and `ST.play` for frame runs, `battle.fx` for the spark, dazzle flash, lightning, wall chunks and the dark screen, `battle.props` for thrown wire nuts). Giant Sneeze: knockback slide on the enemy sprite plus `enemyStunned = 1` and a new `sfx.sneeze` in `engine/audio.js` (long, loud, pitched down). Foot Tap: move Rose's sprite to his foot with her walk frames, one tiny toe tap, then his frames; fall back to Grace when Rose is KO. DRYWALL: a `battle.guard` style flag halving party damage for one enemy round, the drywall drawn in front of the formation from dw_set's prop rect.
5. Recruiting: GREGORI interior in `data/maps-le.js` gets Justin on the couch with the game on, dialogue through `engine/followers.js` with the same yes/no and swap prompts as Amy. Add him to the fourth-slot lists wherever Amy, Deedee and Boppy are enumerated (search `'boppy'` in `engine/followers.js`, `engine/story.js`, `engine/menu.js`).
6. Test: `python3 tools/kit_test.py justin --speed2` (every move, look at every contact sheet in `tools/shots/`), `IDS=justin python3 tools/smoke.py`, then a real fight with him in slot 4, portrait and landscape. Check: he is taller than everyone, Foot Tap's tapper walks and returns, the sneeze knockback and skipped enemy turn, the drywall halves damage for exactly one round.
7. Commit (`feat(justin): party member, kit and painted sheets`), push to main, tell Tom in a few lines what landed, which sheets had problems, and that the spoken lines need a voice bake (new character, no clips yet: speech synthesis fallback plays until then).
