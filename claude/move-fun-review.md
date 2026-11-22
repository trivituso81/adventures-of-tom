# Move fun review (movefun1, 2026-11-21)

Tom (2026-11-21 20:02): "But what makes it giddy up Tata? These moves need to be fun. Are we making them too short?"

Question asked of every family move that has a video: would a kid watching say that is the move? Method: a contact sheet of each baked clip (16 evenly spaced pictures plus the hit picture, from `data/clips/<id>.js` and its sheet in `art/clips/`), judged against the move's name, its description in `data/b3-kit-*.js`, and the person in docs/CANON.md. Ten moves have a video (Tom 2, Grace 2, Rose 3, Deedee 3); every other family move still plays the default animation and is not judged here. No prompt was changed and no run was started.

Lengths now (fact): every move plays 2.1 to 3.4 s. Basics should be 2 to 3 s and signature and team moves may run up to 5 s (canon-addendum, pairmove1). Length is not why a move is flat: Scrub and Floor Is Lava are 2.8 s and read well. The flat ones are flat because the picture does not say the name.

## Verdicts

| Who | Move (slot) | What the video shows | Verdict | One fix |
|---|---|---|---|---|
| Tom | Lounge Pass Flex (basic) | Pulls a gold card from his pocket, flashes it beside his face with a smug grin, then holds it out at arm's length toward the monster and puts it away. 2.8 s | Fun | None |
| Tom | Zone One Blockade (s1, held state) | Raises both palms like "stop" and holds them still for about 1.5 s, then lowers them. The hip bump the prompt asked for, and the move's description promises (a hip-check back), never happens. 2.1 s | Flat | Prompt change, one sentence: the hip bump moves out of the pose sentence into its own sentence after it ("Then he bumps his hip to the left once."). Kept: everything else, Wan 3.0, start picture, seed, 5 s |
| Grace | Soup-Dumpling Squeeze (basic) | Takes out a white dumpling squishy, holds it out with both hands, squeezes with her eyes shut and a big grin; it puffs a little steam cloud. 2.9 s | Fun | None |
| Grace | Crunchy Sugar-Cube Pop (s2) | Takes out a blue cube squishy and throws a straight punch to the left; it splats in her fist. Reads as "Grace punches", not "Grace crunches her squishy"; a punch is not Grace (gymnastics, crafts, squishies), and the signature plays shorter than her basic. 2.6 s | Flat | Prompt change, one sentence: "grips it in one fist and punches it forward toward the left once at chest height, crushing it so it squishes out between her fingers" becomes "holds it up beside her ear and squeezes it once with both hands so it crunches and squishes out between her fingers". Bake at 1.25x instead of 1.5x (about 3.5 s; a play speed, not a new video). Kept: the rest of the prompt, Wan 3.0, start picture, seed, 5 s |
| Rose | Lamb-Tuck Ankle Tackle (basic) | Pulls out her lamb, tucks it under one arm and dives low across the floor toward the monster's ankles on all fours, laughing, then pops back up. 2.8 s | Fun | None |
| Rose | The Floor Is Lava! (s1) | Holds a cushion, drops it, jumps onto it with a gasp, then bounces on it with both arms up, laughing. The game draws the lava. 2.8 s | Fun | None |
| Rose | "Giddyup, Tata!" Launch (s2) | Solo: waves one hand overhead, crouches, does one tucked jump and lands. No Tom, no riding, nothing that says "giddyup". 2.9 s | Wrong | Already in hand: the two-person video (pairmove1, job `tom-rose-giddyup`, 5 s, played at 1x) on cards t-pairmove1-gen and c-fix-pairmove1-gen. Nothing new here; the solo stays only for when Tom is down or absent |
| Deedee | Windex Spritz (basic) | Brings a blue spray bottle out, aims it, one squeeze with a small mist puff, tucks it away. 2.2 s | Fun | None (the Drench effect the game draws carries the hit) |
| Deedee | Wet-Floor Hazard (s1) | A mop appears, she makes one short sweep beside her feet, winks, and the mop is gone. Nothing says "wet floor": a kid sees a lady holding a mop for a second. 3.4 s | Flat | Prompt change, last sentence only: "Without repeating the sweep, she puts the mop behind her back and returns to her starting relaxed stance." becomes "Without repeating the sweep, she sets a small yellow wet-floor sign on the floor beside her feet and wags one finger at it." The sweep sentence (9 tries to get right) is kept word for word. Bake at 1.25x instead of 1.5x (about 4 s). Kept: Kling 4.0, start picture, 5 s, pad 0.55 |
| Deedee | "Hand Me My Glasses" Scrub (s2) | Puts her glasses on, peers, pulls out a scrub brush and scrubs the air in front of her with a satisfied smile, then puts it away. 2.8 s | Fun | None |

## Summary

| Verdict | Count | Moves |
|---|---|---|
| Fun | 6 | Lounge Pass Flex, Soup-Dumpling Squeeze, Lamb-Tuck Ankle Tackle, The Floor Is Lava!, Windex Spritz, Hand Me My Glasses Scrub |
| Flat | 3 | Zone One Blockade, Crunchy Sugar-Cube Pop, Wet-Floor Hazard (all three are signature moves) |
| Wrong | 1 | Giddyup, Tata! (fix already running: pairmove1) |

## Cost of the fixes (estimate, from `est_per_s` in `tools/art-library/wangen-jobs.json`)

| Job | Model | First try | Most the Action may spend (wanauto1) |
|---|---|---|---|
| tom-blockade | Wan 3.0 720p, 5 s | $0.50 | $3.20 |
| grace-cubepop | Wan 3.0 720p, 5 s | $0.50 | $3.20 |
| deedee-wetfloor | Kling 4.0 720p, 5 s | $0.79 | $3.20 |
| All three | | about $1.80 | $9.60 (inside the $15 a day cap) |

## For the fix session (c-movefun-fix)

- Each fix is one new prompt file (`wan-tom-blockade-v3.txt`, `wan-grace-cubepop-v4.txt`, `wan-deedee-wetfloor-v6.txt`), the job's `rev` raised by one, `auto_from` set to now, a `why` line naming the one change and what was kept.
- `tom-blockade` and `grace-cubepop` have no `bake` or `wire` on their jobs yet: copy the settings from the header of their current `data/clips/<id>.js` (start, end, step, speed, kind) so the Action can bake and wire them; Cube Pop gets speed 1.25, Wet-Floor speed 1.25, Blockade keeps 1.5.
- Only the moves Tom picks on t-movefun-pick. Start their run the wanauto1 way (`wgen.want` on a Tom watch or generate card named in `wan_card`, last commit subject `board: wan generate <card>`). Never run wangen.py from the session.
