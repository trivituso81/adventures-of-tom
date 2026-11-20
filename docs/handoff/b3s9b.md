# Handoff: b3s9b (Battle 3, stage 9 part b: TNB), 2026-11-19

TNB's two Sig Vibes are built, 14 lines in all. Stage 9 is split: b3s9a (Tom's skill card note, done), b3s9b TNB (this), b3s9c Nara and Boppy plus the late joiners' pool.

| Item | State |
|---|---|
| Kit | `data/b3-kit-tnb.js`: Ceramicist (Wheel-Thrown Lump, Center the Bowl, Three-AM Kiln Firing, Grand Amphora Masterpiece, Wet Clay to Stoneware, Coaster Policy, Kintsugi Gold Seam) and Longboarder (Longboard Push & Carve, E-Bike Tag-Along, Waymo Tailgate Rescue, Baxter Hill Longboard Express, Carving Momentum, TAP-Card Transfer, No Car, No Tickets). Every Skill has a full plain `desc` for its card. |
| Own functions | Wet Clay (`wetClay`), TAP-Card (`tapCard`), the `vitrify`, `double` and `rebalance` ops, the vessel (`b3VesselTake`, `b3VesselBurst`, `b3VesselExpire`, `b3VesselOwnerKo`), all in `engine/b3-custom.js`. Seams are in `docs/BATTLE3.md` "What stage 9b holds". |
| Lab | `new7`: TNB takes Deedee's place (Grace, Tom, TNB, Rose) against Log Lump. His Vibe Points use the normal start until 9c. |
| Tests | `node tools/b3-sim.js check` (1123 checks, FAILS: []); `python3 tools/b3_test.py s9b` (portrait and landscape; frames `tools/shots/b3-s9b*.png`). `tools/b3-check-s5.js` now lists the five one-off switches. |
| Not done on purpose | Pictures and clips for the vase, clay shields and TNB's moves (every Skill uses `anim:{kind:'default'}`; animation work is its own theme). |

For stage 9c: Nara and Boppy follow the same recipe. A late joiner's Vibe Points start from a pool (spec 3.8). TNB's `vp` start is the first user of that pool, so 9c wires TNB to it too.
