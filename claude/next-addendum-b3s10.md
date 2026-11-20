# Addendum: facts from stage 10 (b3s10, 2026-11-20)

Where this and `claude/battle-build.md` differ, this wins until stage 11 folds it in.

| Topic | Fact |
|---|---|
| What is built | Amy, Justin and Olivia complete (Fitness Queen, Classroom Boss, Basement Boss, Live Wire, Rope Champ, Working Mom): `data/b3-kit-amy.js`, `-justin.js`, `-olivia.js`. All 10 characters have both Sig Vibes. Armchair Ref and News Anchor stay in `B3_SOON`. |
| Lab | `new10`: Tom, Amy, Justin, Olivia against The Big One. |
| Counters | Reps, Cadence and Mom Prep are `counter` rows on their Vibe (they travel in the Pocket). A counter row can carry `extra` listeners; a Skill gates an effect with `needCounter:{id,min}`; `hitsBy{counter,base,per,max,grow}` sets a hit count (use `b3HitsOf`, never `S.hits` directly). |
| New hooks and conditions | `mix`, `counterFull`; `notBasic`, `supportTurn`, `partySkill`, `lacksCustom`, `everyOwnTurn`, `tgtGuarded`, `tgtHasStatus`, `tgtPrimeAny`, `tgtDebuffedBy`; limit `roundAll`. |
| New ops | `refresh`, `prybar` (add to `B3_OP_LIST` and `B3_OPS`). Target kind `either` needs `allyEffects`. |
| Timeline | `b3Pull` is capped by `u.wait` (0 during one's own action); `pull` with `next:true` sets `nextPull`, applied in `b3EndTurn` after the wait is set. |
| Speed | `b3Stat` is now a function with a `paceRun` override; `b3StatPlain` is the plain read. |
| Tests | Check file `tools/b3-check-s10.js` (registered in `tools/b3-sim.js`), screen test `python3 tools/b3_test.py s10`. Test harness: build loadouts with `b3NewLoadout`, `b3SetMain`, `b3SetQuirk`; Quirks only equip when set explicitly. |
| Gotchas | A `//` comment at the end of a line that continues with code swallows the code (it broke `b3Info` once; `node --check` passes the sim, only the browser fails). `unused_voice.py` check 4 shows 39 old dialogue clips before and after; not from this work. |
