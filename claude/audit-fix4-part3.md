# Audit fix 4, part 2 finished: no more freezes (2026-11-02, NO PUSH, nothing changed in the repo)

Read this together with claude/next.md. It closes item 11's "rest of part 2" and replaces that list.

Source: claude/battle-animation-audit.md finding 4. The detector flagged 12 moves nobody had looked at. Method: captured 12 frames each (0.5 s steps) and read contact sheets.
Commands: `PARTY=<id>,tom,grace,amy FRAMES=0.5,...,6.0 python3 tools/kit_test.py <id> --only=<move>` and `FRAMES=0.5,...,6.0 python3 tools/tombo_test.py <id>...`. Frames land in tools/shots/ (git-ignored). A move shorter than 6 s has fewer frames; a Tombo's first second or so is covered by the TOMBO banner, so its anim clock starts late.

| Move | Result |
|---|---|
| tom.sourdough_snob | Live: chart text builds line by line, bread slice, boule. Left alone. |
| tom.skincare_10 | Live: step counter, mask pulse, sparkles. Left alone. |
| tom.seat_1a | Live: door slam, duvet, pod. Left alone. |
| nara.puppy_eyes | Close-up face is held about 1 s while the eyes close: a held beat. Left alone. |
| nara.doodle_fluff | Live: FLOOF, blanket spread. Left alone. |
| tnb.throw_down | Live: bowl throw, hits, retreat. Left alone. |
| Tombo amy3 | Couch scene: text pops and props appear each beat. Left alone. |
| Tombo tnb3 | Live. Left alone. |
| Tombo ff4 | Family poses change (arms up). Left alone. |
| Tombo deedee1 | Live: PSST and NO bubbles, wine. Left alone. |
| Tombo rose3 | Looked still at 1.0 to 2.5 s, but that is the TOMBO banner plus the dark; code (engine/battle2-kind.js line 1883) shows Rose's hop and line at 0.9 s, ribbon at 1.8 s, notes floating throughout. Left alone. |
| Tombo ff1 | Live. Left alone. |

Result: all 12 are detector false positives or held beats. Fix 4 (mid-move freezes) is DONE: freeze1 (4 moves), freeze2 (rose1_dc), plus the checks above. boppy1_dc, deedee.beanie_master, grace3 were already left alone.
Not run: the audit scripts to measure quiet stretches numerically; the phone.

Next code-only items for a session with no phone report and no style key: audit fix 2b (per-attack variation) and 3 (victory, KO, flee, defeat variety); item 14 (painted rooms whose trigger objects sit a tile off their prop, see `elev1`); item 16 (Row leftovers). Do NOT start Phase B or any regeneration before Tom approves the style key.
