# BATTLE REVAMP: where it stands and the one next job (updated 2026-11-18 08:00)

Prompt Tom pastes: **"Read claude/animation-tool-test.md and continue the animation tool test."**
(That file is the live handoff for the animation test. This file keeps the background.)

This is a side thread. It does not replace claude/next.md and nothing here has been built into the game. Do not edit the game repo for this thread until Tom says a method is chosen.

## Read, in this order

1. `claude/animation-tool-test.md` (results so far, Sorceress facts, remaining plan, next steps).
2. This file for background.
3. `claude/battle-animation-audit.md` (what is wrong with battle animation today, measured).
4. `claude/char-battle-sheet-1-stance-action.txt` (the current battle sheet prompt: shows the frame format the game plays and the style wording that works).
5. `docs/CHARACTER_PIPELINE.md` in the repo, only if needed (STYLE BLOCK, PHOTO FIDELITY BLOCK, hero pose section, banned prompt words).
6. `claude/battle-spec-v11.md` only when move content is needed. It is long.
7. `claude/bestiary-v11.md` only when enemy content is needed. It is long.
8. `claude/battle-v11-changelog.md` only when asked why a v11 number or rule is what it is.

## Three threads, and their state

| Thread | State (fact) |
|---|---|
| Battle rules: Vibe system spec | `claude/battle-spec-v11.md` (2026-11-18) is the current draft. It applies Gemini's balance check of v10: 6 kit lines changed (New Game Plus, Jazz-Hands Cartwheel, Crunchy Sugar-Cube Pop, Trophy Striper Haul, 1970 Cross-Country Story, E-Bike Tag-Along) and 9 rule lines added in section 2. `claude/battle-v11-changelog.md` gives the verdict on each of Gemini's 26 findings with reasons. `claude/battle-spec-v10.md` and `claude/battle-spec-v10-changelog.md` (v8 to v10) stay as history. It is a design draft, not adopted. The built battle system in the game is unchanged. The balance numbers are still untested in play. |
| Enemies: bestiary | `claude/bestiary-v11.md` (2026-11-18) is the current draft: 90 entries. It adds 13 enemy rules to its section 1.1 that entries relied on without defining, changes the Citation Slip (1,000 HP, 2 Pet Peeves), and tightens the Square's Sign, the Censor and the Collector. Nothing is owed to the spec any more. `claude/bestiary-v10.1.md` stays as history. Tom has not reviewed it. Not adopted. Its section 7 lists known gaps. Chapters 15 to 20 in it are provisional until each chapter script is locked. |
| Battle art and animation | Option 3 (AI video from one picture) is being tested with Sorceress AI Video Gen, Kling 3.0 Omni. Tom's idle clip passes and his strike clip mostly passes (measured). Rose, Nara and a held prop are still untested. Details in `claude/animation-tool-test.md`. Nothing is built into the game. |

Interactive copy of the spec for Tom's phone: the claude.ai artifact titled "Adventures of Tom Battle Spec v10" (https://claude.ai/artifact/VTcnzJYTrj9qiBB9REQtGK). It still shows v10 and has not been updated to v11. It is a reference page only and is not the game. The bestiary has no such page yet.

## How the spec got here (short)

- Tom designed a new battle system from scratch in Gemini: FFV-style jobs called Vibes (3 per character, 10 characters, 30 Vibes), a tick timeline, Pep (0 to 10), Composure pips and Break, 5 damage flavors with Prime then Detonate reactions.
- v7 and v8 came from Gemini. v9 was Claude's consistency pass. Gemini reviewed v9 and was mostly right. v10 applies that review.
- Gemini then ran a paper balance check of spec v10 and bestiary v10.1 (2026-11-17). v11 applies it (2026-11-18). Of its findings: the rule gaps were nearly all right and are now written down; the timeline swap exploit was right; three of its four "fight too short" claims and one of its four loops were wrong when run through the spec's own formulas; its Vibe nerfs were applied in smaller form. Its "no problem" rows for bosses are not proof: it seated a party of 4 with Deedee in the 3-person Los Angeles chapters.
- Calls in v10 that Tom has not yet confirmed: Pick-Me-Up (a 4 Pep revive every character has), rule-driven Dual Ruckus pair combos instead of 45 custom ones, Casual Mode defined as the reward for mastering all three Vibes, the VP budget of about 90 per chapter with 800 VP per Vibe plus overflow, the 30 Stat Lean assignments, and the wording of five rewritten visual arcs.
- Calls in bestiary v10.1 that Tom has not yet confirmed: the seven attacks of Boppy's Gold Armor and their silent versions for the Gold Knight, returning Part 1 bosses sized as 4-round gates, the working re-themes for chapters 15 to 18, and letting the player pick the 4 again at each phase of the last fight.
- Calls in v11 that Tom has not yet confirmed (section 4 of the v11 change log): 1970 Cross-Country Story's "locking foe" read as an aggro lock onto Boppy, Jazz-Hands Cartwheel capped at 25 ticks, Crunchy Sugar-Cube Pop at 4 Pep, E-Bike Tag-Along at +15% for 2 Pep, Citation Slip at 1,000 HP, a hidden marked ally makes the follow-up miss, and the REDACTED stamp doing nothing on a tie.
- En dashes in number ranges are fine (Tom, 2026-11-17). Em dashes are not.

## Animation: the problem (Tom, 2026-11-17)

Tom plans a complete revamp of character art in battles. His words: when generating separate frames for each animation, the image generator is not consistent in character proportions, size and style details, and on the game side it shows as jarring cuts and strange timing.

Facts behind that:
- The game holds about 836 painted pose frames in 61 sheets and animates by swapping one whole drawing for another.
- Each frame is a separate drawing, so the generator re-decides head size and proportions each time. The pose editor exists to correct that by hand.
- A swap between two drawings with different outlines is an instant pop, and motion can only happen when another frame exists. The audit found moves that freeze for 1 to 4 seconds.

## Animation: what was considered and where Tom landed

| Option | Verdict |
|---|---|
| Full puppet rig animated by Claude (one painting cut into limbs, moved by code) | Rejected. Tom doubts Claude can animate separate pieces well, and Claude agreed: it sets joint angles as numbers and cannot watch motion. |
| Rigging editor operated by a person (Rive, Spine) | Best possible result, but skilled and slow work for 10 characters. Keep in mind for a few hero moments only. |
| AI auto-rig from one image (Pixa and similar) | Not chosen. Aimed at simple cartoon figures, and output may be a video clip. |
| **Option 3: AI animation from one image** | **Being tested.** Method now in use: Sorceress AI Video Gen makes a 3 second video from one start picture; Claude cuts frames and removes the background itself. AutoSprite and Auto-Sprite v2 are not needed. |
| Fallback | A two-part puppet split only at the neck (breathing, head tilt, expression swaps) plus 4 to 6 painted key poses per character, with code doing the motion between them. |

The method Tom aligned on, pending the test: **one master painting per character, an animation tool turns it into motion, props and effects are separate paintings, and Claude handles playback, timing and layering.** Faces change by swapping painted heads or expressions. Props are painted once and pinned to a hand point. Large props (the Porsche, the cake, the whale) are their own layers.

Why option 3 should beat today's method: today each frame is a separate generation that only shares a reference picture. An animation tool generates the frames as one continuous motion, so each frame is tied to the one before it, and the frames are evenly spaced in time. The first measurements support this (head width within 0.3 to 2.8 percent across a clip).

## Checks used to judge a clip

| Check | Pass when |
|---|---|
| Head size | Same in every frame, within a few percent |
| Proportions and outfit | Match the master picture in every frame |
| Painted style | Not flattened, not turned into pixel art or a cartoon |
| Edges | Clean cutout, no halo or leftover background |
| Loop | The idle loops with no visible jump |
| View | Faces left in a three-quarter view from slightly above, like the current battle sheets (the pencil master faces the viewer: unresolved) |
| Size | Enough resolution for a 320 px battle cell |
| Children and the dog | Rose and Nara hold up as well as Tom (untested) |

Also still needed: show Tom the result as real motion in the Move Lab beside the current version of the same move. Static frame strips are not acceptable. If the method fails the same way twice, stop and apply the stop-loss rule. The fallback method is in the table above.

## Constraints that apply

- Tom cannot install browser extensions or allow desktop control on his computer. Any tool must be one he operates himself in a normal browser, or on his iPhone.
- Claude cannot operate these tools. Tom generates and sends the results back, as with the image generator.
- Image prompts: self-contained .txt files, no fill-in fields, Tom never rewrites a prompt.
- Never put these words in a character prompt: 16-bit, 32-bit, SNES, Super Nintendo, Final Fantasy, Chrono Trigger, pixel art, retro, sprite. No hurt or knocked-out wording.
- Current battle frame format, for comparison: cells of 320 x 320 px, character faces left, flat magenta #FF00FF background, feet on one ground line, same head size in every frame.
- Phone first. Watch file size: many frames per move across 10 characters adds up.
- Do not tell Tom to buy anything. Credits and the Sorceress pricing are in `claude/animation-tool-test.md`; the Sorceress plans page cart comes pre-filled with items he does not want.

## Open questions

- Does the pencil-on-cream look of the current tom-hero count as the game's style? Tom has not answered (project instructions say painted, "32-bit realistic").
- Can one tool cover all 10 characters, including two children and a dog? (Rose and Nara tests are next.)
- How many frames per motion are needed for it to feel smooth, and what does that cost in file size? (Test clips are 73 frames at 24 fps.)
- Which motions still need a hand-painted pose (Rose on shoulders, Lamby tucked under an arm, Grace's split leap)?
- Left-facing: the pencil hero faces the viewer; the battle sheets face left.

## Sources

- Rive vs Spine: https://rive.app/rive-vs-spine
- Pixa 2D character rigging: https://www.pixa.com/create/2d-character-rigging
- Summer Engine AI sprite sheet generator: https://www.summerengine.com/ai-sprite-sheet-generator
- Sorceress, AI animation generator from image: https://sorceress.games/blog/ai-animation-generator-from-image-game-ready-in-minutes
- Sorceress plans, credits and billing: https://sorceress.games/wiki/sorceress/plans-credits-billing
- Ludo comparison of AI sprite generators: https://new.ludo.ai/compare/best-ai-sprite-generators
