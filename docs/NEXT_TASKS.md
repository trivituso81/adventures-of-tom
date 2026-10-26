# Next tasks (approved by Tom)

Do them in this order. Each one ends with: smoke test passes, you looked at the frames, a few plain sentences for Tom about what to look for on his phone.

## Task 1: Rebuild Grace's Cartwheel (approved 25 Oct 2026, 10:35 pm)

Grace's free basic move today spins her whole sprite like a tire. Replace that with a real two-cartwheel motion.

**Motion reference:** open `docs/reference/cartwheel-preview.html` in a browser. It is a stand-in figure that shows timing, limb positions and where hands and feet touch down. Match its motion. The real build draws Grace's own pixel art in these poses.

**Where the code is:** `G.cartwheelShow` in `engine/grace-moves.js` (search for `cartwheelShow`, about line 797). It uses `ST.keys` plus `ST.play`; scene `gv_trail`. Replace the whole-sprite spin (`rot:wheel(n)`).

**Timeline (ms):**

| Time | What happens |
|---|---|
| 0 to 250 | Lunge, arms straight up |
| 250 to 1500 | Two cartwheels pivoting on the planted hand or foot (order: left hand, right hand, right foot, left foot). Star pose upside down, arms reach past the head. Ease in on wheel 1, ease out on wheel 2. Dust puff at each contact, sparkle burst at each upside-down moment. |
| 1500 | Lands facing the Grump |
| 1650 to 1800 | Kick. Impact at 1800. Keep `['hf',1800]`, `landHit(100)`, and the HI-YAH! word at 300 ms only. |
| 2100 to 2900 | TA-DA! arms up, one hop |
| 2900 to 3500 | Hops home |
| End | 3450 to 3500 |

Two wheels, not three. Same spoken line (`grace.cartwheel`), same damage, same closing message.

**Art:** new Grace poses (lunge, hand-down, inverted star, landing, kick) in a new data file `data/grace-wheel.js`, built by redrawing the limbs with two-bone IK the way `data/recruit-rig.js` does, keeping her head and torso pixels. Front-facing during the wheel, facing left for the kick. Add the new file to `index.html` before `engine/grace-moves.js`.

**Test:** `python3 tools/smoke.py` and `python3 tools/kit_test.py grace --only=cartwheel --speed2`. Screenshot and look at these frames in portrait and landscape: lunge, hand contact, upside-down, kick, TA-DA.

**Then:** add a row to the move review notes (see `docs/CHANGES.md` for the running log) saying Cartwheel was rebuilt.

## Task 2: Director's Cuts part 9: Amy and Deedee tier 3

Two new Director's Cut rows, same shape as `grace3_dc` in `engine/battle2-kind.js` and `data/battle2-data.js`:

| Id | Name | Spoken line keys |
|---|---|---|
| `amy3_dc` | Elevator Cheat | `amy.dc3`, `tom.dcamy3` |
| `deedee3_dc` | Feast on Jefferson Park | `deedee.dc3`, `tom.dcdeedee3` |

Caps: party heal 60%, revive 50%. HEART 75 (tier 3). Unlock rule is the Director's Cut rule in `docs/BATTLE_SYSTEM.md`. Read the existing `grace3_dc` (Shadow Squishy) and `rose3_dc` (Lamby Night-Light) first and follow their structure, helper reuse and gotchas.

New spoken lines are silent until Tom bakes voices. Write the lines in `data/lines.js` and keep a list of new lines in `docs/CHANGES.md` under "Lines to bake".

## After that

Ask Tom. Do not start Part 2 or new chapters without a direction from him. See `docs/ROADMAP.md`.
