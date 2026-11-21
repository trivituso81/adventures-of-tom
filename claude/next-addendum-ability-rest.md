# ABILITY REST: STATUS FIRST (2026-11-06 09:00)
- TNB DONE (`tnbab1`, CHANGES 349, pushed): 14 ab + 14 fx entries in tools/art-library/char-prompts.js and data/art-prompts.json (now 558 entries, Characters 151; test.py Characters EXPECT 151). Tom must press Generate 28 times.
- NEXT: Nara (dog wording, no hands; frames from engine/nara.js), then Boppy, Olivia, Justin. One character per push. Copy the TNB block pattern in char-prompts.js: add `<id>: [...]` to ABILITIES (after the tnb block), `<id>: {...}` to FX (after tnb), add the id to GROUP (and PRONOUN if she). Splice into the json after `deedee-ab-moon-ult` / `deedee-fx-moon-ult` order (ab entries after the last ab entry, fx after the last fx entry; new entries are `{status:'draft', id, tab, group, title, ar, refs, prompt}` with no versions key, same as prop-find entries). Assert every existing entry equal before and after.
- Gotchas: the shared fx template contains the word "left" once and "not pixel art" (same as Deedee's, fine); avoid "right" ("be right back") and any left/right word in your own frames. Get frame beats with a script that prints setMessage/scene calls of the LAST `T.<key>=` definition in the engine file (later definitions win). Move names: data/abilities.js `key:"x",name:"..."`.
- test.py: it has pre-existing failures (counts, blocked-row timing); the prompt check line must PASS (no banned words or dashes).

# ABILITY REST cost table (2026-11-06 07:30). Fact-checked against data/abilities.js B8_KITS and engine files.

| Character | Ability sheets | Effects sheets | Generate presses |
|---|---|---|---|
| TNB (DONE) | 14 | 14 | 28 |
| Nara (dog wording, no hands) | 14 | 14 | 28 |
| Boppy | 14 | 14 | 28 |
| Olivia | 11 | 11 | 22 |
| Justin | 9 | 9 | 18 |

Moves per character (Primary key):
- Justin: loose_wire, drywall, wire_nuts, bad_call, fresh_fit, demo_day, breaker_flip, giant_sneeze, foot_tap
- Boppy: cap_swat, grumble, patient_angler, recliner_reservation, headcount_again, lockdown, everybody_waits, fish_ult, pepper_breath, seeds_of_trouble, mild_for_company, nineteen_seventy, five_alarm_jar, xc_ult
- Olivia: fact_check, snack_bag, livnews_live, inverted_pyramid, double_under, story_time, michael, better_than_bobby, is_this_real, marine_layer, lachlan_no
- Nara: jump_up, puppy_eyes, tennis_ball_fetch, dont_leave_me, just_one_bite, counter_surfer, stranger_alert, squirrel_ult, doodle_fluff, shake_everyone, not_leaving, happy_puddle, food_inspector, pack_ult

Refs per ability entry: `<id>-hero-ref-v1.png`, `-walk-sheet-v1.png`, `-battle-sheet-1-v1.png`, `-2-v1.png` in art/raw/characters (check they exist). Justin, Boppy, Olivia, Nara all have them per next.md.
