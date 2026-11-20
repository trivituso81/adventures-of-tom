# Animation tool test, addendum: the Boop is APPROVED and in the Lab; the old chop is PURGED (build clippurge1, main fb55d93, 2026-11-18 15:55)

Read `claude/animation-tool-test-exam.md` first for everything else. Where the two differ, THIS FILE WINS (the exam file's NEWEST table still describes the first long Boop prompt and "waiting on Tom", and its NEXT SESSION purge list: both are over).

Prompt Tom pastes next time: **"Read claude/animation-tool-test-exam.md and claude/animation-tool-test-boop2.md, then continue the animation tool test. You have my full permission to access the repo."** Nothing for Tom to do first. Model Claude Fable 5.2, effort high.

## READ THIS FIRST: how Claude failed here, and the rule that came out of it
Tom, 15:12: "that didnt work either - youre overcorrecting, swinging like a pendulum between extremes and it's really unimpressive and disspointing. i thought has Fable 5.2 high you would be more nuanced than this. this is costing me Fable credits and API credits from xai. i need you to correct this behavior going forwad immediately. i used gemini with this prompt and got an accetable result, so i approved it"

| Step | What Claude did | Result |
|---|---|---|
| 1 | About 330 words; one reach described three ways, aimed "at the height of her own nose" | Finger up at an adult's nose; with Tom's own tightened edits, two pokes (twice) |
| 2 | Swing: 49 words, lite, 3 s. Dropped the facing and the planted feet | "she points towards the viewer and doesnt stay in the same position then wiggles her hips after" |
| 3 | Swing: a different method (pictures pinned into the video, full model, 2 s, 33 words) | "that didnt work either" (no detail given; do not ask) |
| 4 | Tom had Gemini write a prompt: 158 words, the original three-part shape with the repeats cut | Acceptable. APPROVED. |

The rule is in repo `CLAUDE.md`: **"Fix a miss with the smallest change"** (start from the closest version that worked or nearly worked, change only what the note names, one change per try, a note about one fault is not a new absolute rule, every try costs Tom money). Also in his memory preferences. It applies to all work.

## State of the Boop (unchanged)
| Thing | Fact |
|---|---|
| Approved video | `art/raw/clips/clip-rose-boop-v1.mp4`: 640 x 480, 3.04 s, 73 pictures. One jab with the pointer finger (slightly above level), then hands on hips, held to the end. Marks: start 0, hit 1.399, end 3.03. |
| The approved prompt | `BOOP_APPROVED` in `tools/art-library/clip-prompts.js`, word for word (158 words; never reword it). Pattern for every new clip prompt (CLAUDE.md, "Image and video prompts: clean, each thing once"). |
| Entry | `clip-rose-boop`: approved, lite model, 3 s, start picture only. |
| Baked clip | `rose_boop` (`data/clips/rose-boop.js`, `art/clips/rose-boop.webp`): 37 pictures, hit at video frame 34, 2.06 s at 1.5x. |
| In the game | Battle Lab > CLIP TEST: ROSE > ATTACK > Boop (messages "Pointer finger out.", "Boop. One finger. Right on the nose."). Tom has NOT said he watched it in the Lab. |

## DONE in clippurge1 (main fb55d93, 15:55): the chop purge
Removed: entries `clip-rose-strike`, `-lite`, `-2s` (clip-prompts.js and data/art-prompts.json), the `STRIKE` text, `art/raw/clips/clip-rose-strike*`, `art/clips/rose-strike.webp`, `data/clips/rose-strike.js` and its tag, the `rose_strike` halves of `RM.rose.boop` and `Rm.boopClip` (messages are now always the Boop's), the Lab fight sub text, comments. `LOOK` and `END` stay (nap uses them), `LOOK_FOE` stays (Mudling). Grep `rose-strike` and `rose_strike`: zero outside docs/CHANGES.md and build history.
Tests now: `tools/art-library/clip_lib_test.py` runs on `clip-rose-boop` (its study checks set `clip.test=true` on that entry in the page for the run, since no study entry exists any more; the Library now has 3 clip entries: Boop, nap, Mudling), `tools/clip_test.py` and `tools/clip_kinds_test.py` use `rose_boop`; all passed, smoke FAILS []. If the Library test crashes midway: `pkill -f "http.server 8813"; pkill -f art-library/stub.py`.
`node tools/art-library/validate.js` still reports `clip-rose-boop: banned word: sprite` (Tom's approved Gemini prompt says "2D sprite animation"; it must not be reworded: leave it or relax the check for that entry) and `bad tab Clips` on the nap and Mudling entries (old).
Not checked: the live site after the push (shell cannot reach github.io); `gh run list --workflow publish.yml --limit 3` shows the publish.

## NEXT SESSION: nothing queued. Only what Tom asks for.
- Do not start new clip entries or new prompts without him: each costs money; a new prompt is an edit of `BOOP_APPROVED`'s MOTION part, nothing more.
- Open engine work (listed in the exam file): the `B2.labClip` gate (`bclipWanted`, `bclipFor`, `RM.rose.boop`), per-frame cropping of the atlas, hurt and attack pictures for a monster whose idle is a clip, and the Battle 3 question (read docs/BATTLE3.md first; ask Tom one question if the answer changes the work).

## Still open (not asked of Tom; do not raise more than one)
- The battle text for Boop still ends "Right on the nose." Tom said the jab is "not necessarily on the nose"; he did not ask for the text to change.
- Rejected videos are not saved, so Claude could not see any of the misses. Saving a rejected video's address with its note would have shortened today. Not built.
