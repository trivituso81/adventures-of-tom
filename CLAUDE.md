# CLAUDE.md: The Adventures of Tom

Read this first. It is the working agreement for Claude in this repo. Claude runs this repo end to end for Tom.

## What this is

A JRPG starring Tom's real family, with hand-painted realistic caricature characters (the "32-bit realistic" look; the old 16-bit pixel style is retired for characters), written as plain browser JavaScript (no framework, no bundler, no npm build).
Chapters 1 to 10 are built (the story bible plans 20 chapters in two Parts). It runs as a static site on GitHub Pages, played from an iPhone home-screen app.
Title: **The Adventures of Tom**. Home towns: Long Island and Los Angeles. (Older files and docs still say "Little Elsewhere"; that was the demo town name.)

## The person you are working for

Tom is a product director. He designs and directs; he does **not** code and does not want to read code.

- You do all the technical work. Never ask him to run a command, edit a file, or choose between implementation options.
- Make the call, say in one line which call you made. Ask a question only when a choice cannot be undone or is expensive to redo, and then ask one short question.
- He plays on an iPhone (portrait first) and reports what he sees. Report back in a few plain sentences. Dense tables beat prose. No flourish.
- Define any technical term you must use. Say whether you are stating a fact, recommending, or asking for a decision.
- No em dashes in anything you write for him or put in the game.

## How every reply to Tom is shaped (standing rule, Tom 2026-11-12 19:19)

Tom: "I would love for your first statement to me to be what you actually did... Explicitness is essential." Every reply that follows work has two parts, in this order:

1. **First line: what I did.** One plain statement of the action taken, in the past tense: "I installed...", "I implemented...", "I created a plan for...", "I tested... and it passed/failed". Say what was pushed (commit and tag) or that nothing was pushed. Say what was NOT done or not looked at.
2. **Right below it: what Tom must do next, as exact steps.** Name the place and the action: "Open Admin > Art Library, find the entry `tomride-night`, press Generate, then Approve", or "Paste this into the next conversation: <exact line>". If he has nothing to do, say "Nothing needed from you" and give the exact prompt that starts the next session. Never "let me know", never a list of options, never vague ("check it on your phone"): say which screen, which button, what he should see.

Then only what he needs to judge the work (decisions I made, one line each). The two-line handoff and next prompt at the end of a session stay as before.

## The board: check every request against it (standing rule, Tom 2026-11-19 12:42)

Tom: "for any conversation i initiate, check against the board to see if it's an update or change to an existing item, or a new item needs to be added." `data/board.json` (ADMIN > BOARD) is the one list of open work. Rules in `claude/handoff-rules.md` section "The board"; facts in `claude/next-addendum-board1.md`. In short, at the START of every session, whatever Tom opens with, read the board and decide which of these his request is, and say it in the first line of your reply ("Board: updates card X", "Board: new card Y", "Board: no change"):

- **Update or change to an existing card** (more work on it, feedback on it, it is finished, it is no longer wanted): change that card (move it, rewrite `next`, add a history line quoting his words, mark it Done or remove it).
- **A new item** (work that will outlast this reply: a build, a fix, something Tom must do or decide, a wait on a service): add a card in the same push (lane, theme, next step, and for Claude work the full prompt with before-steps, model and effort).
- **No change** (a question, a lookup, a one-off answer).

**board2 (2026-11-19): the board follows the repo.** `.github/workflows/board-sync.yml` runs `tools/board_sync.py` on every push and moves cards itself (approvals, shipped builds, finished blockers, running jobs); Tom never moves a card. Your part: (1) your FIRST push of a session is a commit whose subject is `board: start <card id>` (it moves the card to In progress and links this conversation); (2) a Claude card needs a `tag` equal to the build name you will push (the `## <tag>` heading in docs/CHANGES.md closes it, `<tag>` plus one letter marks a part shipped); (3) `bump_tags.py` stops a push whose build is on no card (`board_check.py --push <tag>`); (4) at the end write the result and the next card's full prompt (no `<` blank for Tom); the job moves the rest; (5) a stale card you find, retire it yourself and say so. Tom's cards that block a Claude card name that card in `next`. Facts: `claude/next-addendum-board2.md`. Tests: `python3 tools/board_sync_test.py`, `python3 tools/board_test.py /tmp/board`.

**board3 (2026-11-19): asks, answers on the card, START.** (1) Every Tom card has an `ask` (play, pictures, animations, voice, script, decide, setup); a decide card has 2 to 4 `choices` (first one is yours and ends "(Recommended)") and one `leads` line each. (2) Every Tom card blocks a Claude card or is `fyi: true`. (3) Tom never goes back to a card's conversation: his note (`note`) and answer (`answer`) are on the card and in the history of the card it unblocks. FIRST read the card you are working on and the Tom cards that blocked it. (4) The card you ship needs `after`: the Tom card (created in the same push, with its ask) that your work hands to him, or "nothing for Tom: <next Claude card id or end>"; `board_check.py --push` stops without it. (5) A session that ends without shipping writes one history line saying why and moves the card to Stuck with what it waits on. (6) `auto: true` only on Sonnet 5.5 medium cards; START runs the task in repo secrets, details in `claude/next-addendum-board3.md`. Tests: `python3 tools/board_sync_test.py`, `python3 tools/board_test.py /tmp/board`.

**board4 (2026-11-19): Something is wrong.** A Tom card with ask play, pictures, animations, voice or script has All good and Something is wrong (no I did this). Something is wrong writes a Claude fix card (`fix: true`, `reports` with his words, screenshot on branch inbox `board-shots/`), Sonnet 5.5 medium and auto-started for play, Opus 5.5 medium for the rest; the tested card waits on it and comes back to Tom when the fix ships. A fix session: first push `board: start <fix id>`, read `reports`, run `python3 tools/reports.py list` for pencil reports filed since, rewrite the tested card's `next` to what to look at again, keep `after` on it. Prompts the page writes name repo files only (a START run cannot read the Project's claude/ docs). Facts: docs/CHANGES.md "board4", docs/REPORTS.md "The board link".

**copydocs (2026-11-20): a START run reads the repo copy.** The `claude/` folder in this repo holds copies of the Project's claude/*.md docs that this file or an open card names; a START run (no Project attached) reads those, and a session that changes one of them in the Project writes the same text there in the same push (`claude/README.md`).

**artgen1 (2026-11-20): pictures from the board.** An open Tom card with ask pictures and `done_when.art_approved` has Generate all N pictures (two taps) on the board page. The tap saves `gen` on the card with the commit `board: generate <id>`; the `art-gen` Action (`.github/workflows/art-gen.yml`, `tools/art-library/artgen.py`, repo secret `XAI_API_KEY`; by hand it takes `card`, `ids`, `cap`, `dry_run` and defaults to a dry run) makes the pictures, keeps them on branch `artgen` (never merge it) and writes `gen.run` on the card. It approves nothing: the Art Library imports them (`artgen-seen`, Setup > Check for pictures made for you, `art.html?review=<ids>`) for Tom's APPROVE or REJECT. A session never runs it for real; the first paid run is Tom's tap. Plan and Built notes: `claude/artgen-plan.md`. Tests: `python3 tools/art-library/artgen_test.py`, `artgen_lib_test.py`, `python3 tools/board_artgen_test.py`.

**artgen2 (2026-11-20): QA of generated pictures.** `tools/art-library/artqa.py` (a vision model answers a fixed checklist plus requirements read from the prompt, three runs, majority; policy in `artqa-policy.json`) runs in the `art-gen` Action right after each picture and puts "QA 11 of 12" and the failed lines on the card (`gen.run.qa`) and in the Art Library review; approve and reject write `qa` and `qaFail`, `artqa_report.py` tabulates them against Tom's decisions. Report only: nothing is auto-approved until artgen3. The paid replay is the `replay` input of `art-gen` (a session runs it with cap 1.5). Tests: `python3 tools/art-library/artqa_test.py`. Notes: `claude/artgen-plan.md` Built.

**cardlinks1 (2026-11-20): open the Library entry from the card.** A Tom card that sends Tom to the Art, Voice or Music Library has `links` (`to`, `ids`, `label`; a card with `done_when.art_approved` gets its Art Library button from those ids); the board shows Open in the ... Library buttons, and `art.html?open=<ids>`, `voices.html?line=<key>` or `?chapter=<n>&show=<filter>`, `music.html?track=<id>` open that entry. `board_check.py` refuses a card that names a Library with no link. Test: `python3 tools/cardlinks_test.py`. Notes: `claude/artgen-plan.md` "cardlinks1".

**backlog1 (2026-11-20): the backlog.** Tom can park any open card with Send to backlog (`backlog: {at, from}` on the card, lane kept, In progress goes to Up next). Parked cards show only in BACKLOG at the bottom of the board, closed by default, each with a one-tap Add to <lane>'s to-do that removes the flag. Never start, ship to or count a parked card as open work for a session; the sync job never auto-starts one. Test: `python3 tools/board_backlog_test.py`.

**attn1 (2026-11-20): Needs attention fixes itself.** `tools/board_sync.py` rule R11 gives every flagged card one automatic move within the hour (plan `claude/attn-plan.md`, facts `claude/next-addendum-attn1.md`): a free fix (waits on a finished card goes to Up next, a Shipped note with its CHANGES heading closes, START failed is tried once more then becomes the For you card Start this by hand, a failed service run is re-run once, out of credit goes to Tom), or one rescue session on the Board START task (card field `rescue`; Sonnet 5.5 medium; 1 per card, 4 a day). A second stall makes the For you card Stuck twice (ask `unstick`: Start again, Not needed). **A session that stops without shipping** must, in its last push, either move its card to Queued behind a Tom card it creates, or write a history line containing "ended without shipping" with the reason. Tests: `python3 tools/board_sync_test.py`, `python3 tools/board_test.py /tmp/board`.

**newcard1 (2026-11-20): Tom makes his own cards.** `+ New card` on the board page: he types one idea, and the page (`sizeIdea`, `ideaPrompt`, `sendNew` in `board.html`) names the card, picks the theme, sizes the model and effort by the logic in `claude/handoff-rules.md`, writes the prompt and saves a Claude card (`c-idea-...`, tag `idea-...`, his words in `idea.words`); a Sonnet 5.5 medium card starts by itself through START. A session started on an idea card: check the size against the logic (clearly wrong: rewrite the prompt, push, tell Tom, stop), check the open cards for one that already covers it, then rewrite the title and next step and do the work. If you change the model or effort tables in handoff-rules, change `sizeIdea` and the test's `SIZES` in the same push. Test: `python3 tools/board_newcard_test.py`.

A request that makes other cards obsolete retires them. Push the board change with the work (or alone, tag `board-<short>`), run `python3 tools/board_check.py`, and finish with "Theme: <theme>. Pending your action: yes/no."

## No breathing in the overworld or scenes (standing rule, Tom 2026-11-20)

Tom (11-20, t-cutpolish5): "Undo this change, and remember forever that we don't make characters in the overworld breathing that breathing animation is only while in battle." People in the overworld and in story scenes never get a breathing (idle size pulse) animation, however a plan or card words it. Battle idle breathing (`battle2-ui.js`, `b3-play.js`) stays. `actorLife` (`engine/emotions.js`) has no breath; `tools/cut_life_test.py` fails if one comes back. Squash on a pose change, listener turns, hops and pips were not named and stay.

## Battle animations are out of scope for the battle system (standing rule, Tom 2026-11-19 17:01)

Tom: reviewing battle animations is not part of the battle system; he handles it as a separate task, because the mechanics and the animations have no direct dependency (Battle 3 resolves the whole result first and plays it as beats; a clip only calls `reveal(share)` and the rules never wait on it). For every battle system session (stages 9 to 23, balance, story switches): never ask Tom to review, judge or approve a battle animation or clip, not at a milestone, in a closing reply or on a card; never wait on an animation to finish a stage (a move uses `anim:{kind:'default'}` until an animation task changes its row); do not build, wire, tune or fix clips or animation timing as part of a stage, only keep the seam working (the `anim` and `wind` fields default sensibly, a hit lands with or without its clip). Tom judges mechanics only at Milestones A to D: fun, pace, readable screen and turn bar, fight length, kits that feel like the family. An animation note arriving in a battle session becomes a card in the Battle Animations theme and is not acted on there. Details: `claude/battle-scope.md` in the Project.

## Hard rules

1. **Everything is a classic script in one shared global scope.** No ES modules, no import/export, no bundler. Files load in the order of the `<script>` tags in `index.html`. A new file must be added to `index.html` at the right point. See `docs/ARCHITECTURE.md` for the load order and what each group depends on.
2. **Keep the game runnable at every commit.** Run `python3 tools/smoke.py` before you finish. Look at the screenshots it writes to `tools/shots/`. A change you did not look at is not done.
3. **Phone first.** Portrait is the main layout; landscape is a toggle that rotates the whole stage. Keep both working. Controls: on-screen D-pad and A button, keyboard (arrows or WASD, Enter, M, L), any standard gamepad.
4. **Do not hand-edit generated or baked data.** `data/voice-clips.js` and `data/voice/*.js` hold the baked audio (full set, see `docs/VOICE.md`). Change them only when Tom sends a `voices.json` and asks for a merge, or to purge unused clips (see No unused voice).
5. **Changing a spoken line silences it.** Baked clips play only when the clip text exactly matches the line in `data/lines.js` or the dialogue text. If you reword a line, say so; it needs a re-bake. Prefer not to reword spoken lines unless asked.
6. **Canon is in `docs/CANON.md`.** Characters, voice and tone, and what is decided. Read it before writing any dialogue, move or scene.
7. **Reuse the battle animation primitives** before inventing new systems (`docs/BATTLE_SYSTEM.md`).
8. **This repo is the live app.** Tom plays https://trivituso81.github.io/adventures-of-tom/ from his iPhone home screen (decided 2026-10-27: "the actual app is on GitHub"). Every finished change goes to `main` (which updates GitHub Pages). The claude.ai artifact is only a scratch copy for building and testing; it means nothing to Tom, so never tell him something is "live" because it is on the artifact. Read `docs/WORKFLOW.md` for the exact routine.

## Images only in the Art Library (standing rule, 2026-11-03)

Tom (11-02, and again 11-03 14:49 with "ALWAYS"): he creates images only in the Art Library (he presses Generate, then Approve or Reject). Never plan on, suggest or write prompts for him to run in any outside image AI, not even as a fallback after repeated misses. When the Library keeps missing, the options are a different Library method (a reference picture, a different entry shape) or an input he supplies into the Library. Older notes that mention his outside AI are history.

## Battle clip videos are made in the Art Library too (clipgen1, 2026-11-17)

ADMIN > ART LIBRARY > Clips: an entry with a `clip` field (`tools/art-library/clip-prompts.js`, run it with node to add entries) is a short video of a character made on the xAI video API from a start picture (`python3 tools/clip-bake/make_start.py <owner>`, built from the battle idle frame). Tom presses GENERATE VIDEO, marks START, HIT and END in REVIEW, then APPROVE; the art-bake Action cuts the clip (`art_bake.py` `bake_clip`, `tools/clip-bake/bake_clip.py`). Code: `engine/art-clips.js`, engine side `engine/clips.js`. Kinds (`clip.kind`, clipkinds1): `strike` (START, HIT, END), `loop` (a monster's idle, START and END) and `state` (ends in a held pose such as asleep, START and END); loop and state clips play in the Battle Lab clip fights (`bclipFor` in `engine/clips.js`). New entries use the cheap model `grok-imagine-video-1.5-lite`, 3 seconds for attacks. Their prompts follow the approved Boop prompt's pattern (rule below). A baked clip's pictures are trimmed and packed (`rects` in `data/clips/<id>.js`, clippack1): about 10 MB in phone memory each, so clips are loaded per fight and never all at once. Tests: `python3 tools/art-library/clip_lib_test.py`, `python3 tools/clip_test.py`, `python3 tools/clip_kinds_test.py`. State and next steps of the animation test: `claude/animation-tool-test-pack1.md` in the Project.

**Chapter by chapter (clipbatch1, 2026-11-18; Tom: "im tired of testing each animation one by one").** Plan and build order: `claude/animation-chapter-plan.md` in the Project (it wins over the older animation-test files). A Clips group named `Chapter <n>` has a GENERATE CHAPTER button (`clipBatchStart`, `engine/art-clips.js`): it makes every clip of the group that is not made yet (up to 3 videos at once, never past the spend cap, a result already waiting is not made again), finds each clip's marks from the video itself (`clipAutoMarks`: START the first picture, END after the last movement plus half a second, HIT where the limb reaches farthest; loops: first and last picture, `clip.calm` picks the stretch), writes them to the result as if Tom had marked them, and approves it (`decide(..., auto)`). A clip whose video barely moves is left for Tom's REVIEW. A rejected clip is made again only after its prompt was rewritten (`promptRev` above the rejection's `rev`). Tom then watches the chapter once in Battle Lab > CHAPTER <n> REVIEW (`engine/clip-review.js`): PLAY or PLAY ALL show each clip on its owner in a real fight, REDO saves a rejection with his note. The art-bake Action also cuts any approved clip the game does not have yet (`art_bake.stale_clips`, the stamp `// Baked from:` in `data/clips/<id>.js`), because a batch starts dozens of runs and GitHub drops all but the newest waiting one; one clip that fails to cut no longer stops the rest. Tests: `python3 tools/art-library/clip_batch_test.py`, `python3 tools/clip_review_test.py`. Chapter 1's entries (clipch1) are the `CH1` block of `clip-prompts.js`: people are `BOOP_APPROVED` with only the MOTION changed, monsters the Mudling idle's prompt with only the MOTION changed. A Battle Lab fight that is not a review names the clips it loads (`clips:[...]`), so a fight never loads every clip of everyone on the field.

**The videos made for him (clipgen2, 2026-11-19).** The `clip-gen` Action (`.github/workflows/clip-gen.yml`, `tools/art-library/clipgen.py`, `clipmarks.py`; manual only, repo secret `XAI_API_KEY`) makes every clip of a `Chapter <n>` group that is not approved, finds the marks (a Python port of `clipAutoMarks`), approves it the way the Library does, and starts art-bake. Start it with `gh api repos/trivituso81/adventures-of-tom/actions/workflows/clip-gen.yml/dispatches -f ref=main -f 'inputs[dry_run]=false' ...` (inputs `group`, `ids`, `limit`, `cap`, `dry_run`). After clipch1fix raises `promptRev` on an entry, run it again: it makes only those. Its state is on branch `clipgen` (never merge it). Test: `python3 tools/art-library/clipgen_test.py`. Detail: docs/CHANGES.md "clipgen2".

## Clip quality gate (clipgate1, 2026-11-19)

Tom (11-19): build a quality gate "before any re-make" and spend nothing until it flags the clips he rejected. `tools/clip-gate/gate.py` judges a battle clip the way the game plays it (baked stretch, speed, loops forward and back) with measured checks taken from his chapter 1 review notes; `replay.py` replays it against those notes (`review-ch1.json`); `gate_test.py` tests it on made-up videos. The look checks are `vision.py` (clipgate2, 2026-11-19): an xAI vision model answers a fixed checklist per kind of move; only the questions listed under `hold` in `vision-policy.json` hold a clip, the rest are advisory (the replay showed it cannot judge his invented moves). The key is a repo secret, so vision runs in the `clip-gate` Action (answers on branch `clipgate`, never merge it); the `clip-gen` Action runs the whole gate on each fresh video (`gate` input, `--gate`) and holds a failing clip instead of approving it. `grab.py` measures the figure's drawn size across the stance-to-clip switch in the real game. Replay result: 34 of his 44 rejected clips flagged, 1 of 23 approved (pass bar not met, stop-loss; plan section 4.5 in `claude/clip-gate-plan.md`). clipch1fix (2026-11-19): people's idles and the Grump, Toad and Log idles play their whole stretch at 1x (no `calm`); a loop with `wrap: true` plays forward only (something in it falls or turns); a drift-only rejected clip is made again with its prompt unchanged by listing it in `REMAKE` in `clip-prompts.js`. Before re-making any clip, run the gate on it; for his invented moves (give, cast, blockade, tackle, lava, giddyup, squeeze, wet floor, scrub, lounge pass) his CHAPTER 1 REVIEW of the re-made clip is the check. Tests: `vision_test.py`, `grab_test.py`, `gate_test.py`, `replay.py`, `replay_vision.py <vision.json>`.

## Fix a miss with the smallest change (standing rule, Tom 2026-11-18)

Tom (11-18 15:12), after Claude rewrote one video prompt three times and each rewrite missed a new way: "youre overcorrecting, swinging like a pendulum between extremes and it's really unimpressive and disspointing... this is costing me Fable credits and API credits from xai. i need you to correct this behavior going forwad immediately." This applies to every kind of work (prompts, dialogue, art, code), not only prompts:

- When something misses, start from the closest version that worked, or nearly worked, and change only what the feedback names. Keep everything it did not name.
- One change per try, so the result says what that change did. Never change the wording, the length, the model and the method in one step.
- Feedback about one fault is not a new rule for everything. "Too long and repetitive" means cut the repeats, not cut to a fifth of the length. Do not turn a note into an absolute ("never mention X") unless Tom states it as one.
- Before pushing a fix, name what was kept and what was changed. If nearly nothing was kept, that is a swing: stop and redo it as an edit.
- Every try costs Tom money (video and picture generations, Claude credits). Do not hand him a try whose only basis is a guess; say what the evidence is.
- What happened, so it is not repeated: the first Boop prompt was about 330 words and said one reach three ways (finger went up; then two pokes). Tom asked for "concise clean and only describe the exact motion". Claude swung to 49 words, which dropped the facing and the planted feet (she pointed at the viewer and moved off her spot), then swung again to a different method (pictures pinned into the video, another model, 2 seconds), which also missed. A 158 word prompt written by Gemini, the same three-part shape as the original with the repeats cut, worked on the next try.

## Image and video prompts: clean, each thing once (standing rule, Tom 2026-11-18)

Tom (11-18 13:58): "a common issue you have with image and video prompt generation is that you confuse the generator with extraneous information and duplicating information. it needs to be concise clean and only describe the exact motion. you must remember this going forward."

- The pattern for a clip video is the approved Boop prompt, `BOOP_APPROVED` in `tools/art-library/clip-prompts.js` (never reword it): about 150 words in three labelled parts. WHAT THIS IS: the exact character of the first-frame picture, face, proportions, outfit and drawing style kept. CAMERA AND BACKGROUND: locked camera, which way she faces, feet planted on the same spot, flat magenta background, silent. MOTION: two sentences that name the gesture, say how many times ("once", "without repeating the gesture") and end in a pose that is held for the rest of the clip.
- Say each thing once. Describing one action two or three ways comes back as two or three actions.
- Keep the rules that hold the picture steady (facing, feet, camera, background). Cutting them is not "concise": the video drifts.
- Leave out backstory, long lists of things to avoid, and anything about speed.

When a prompt of an existing entry is rewritten, `clip-prompts.js` raises the entry's `promptRev`, and the Library drops an older edit of that prompt saved on Tom's device (`retireOldEdits` in `art.html`), so GENERATE uses the new text. A rejected entry goes back under To do.

## Purge replaced files completely (standing rule, Tom 2026-11-05)

Tom (11-05 18:40): "remember from now on to purge old files completely after replacing them." When a new picture, sheet, sound, script or data file replaces an old one, remove everything the old one left behind in the same change: the old files, the code that drew or loaded the old thing (fallbacks, wrappers, helper functions, constants), stale comments, tag or cache entries, and Project or doc notes that describe it. Then grep for the old names and ids and confirm zero references. Git history keeps the old copy, so deleting is safe. Do not keep an old version "as a fallback" unless Tom asks. Frozen `demo/` is the one exception (never edited). Approved sources in `art/raw/` stay: the Art Library reads them.

## Head sizes (Tom, 2026-11-05: the no head resizing rule of 2026-11-03 is LIFTED)

Tom (11-05): "Let's undo the no head resizing rule." `docs/CHARACTER_PIPELINE.md` section 7 (heads, heights, widths by age) is in force again, including the head row and the head tools (`kidhead.py` `grow_head`, `headwarp.py`). Head share is top of hair to chin over full height: about .21 to .22 for adults, about .25 for Grace and the style key's kids (Rose follows her ratio to Grace), and the older baked kid art uses .373 walking and .43 battle until a character is regenerated. Still true: a head row is shown to Tom before and after, the body keeps its size, and nothing is re-baked unless Tom asks for that character in that conversation (lifting the rule changed no art).

## One head multiplier across all states (standing rule, Tom 2026-11-12)

Tom (11-12 08:37): "i just want the head sizes to be amplified with the same multiplier across all states." The HEAD SIZES factor (`tools/sprite-bake/head_tweak.json`) applies to the walk, the talk face, the 8 mood poses and the mood faces. After any `head_adjust.py apply` or `apply-requests`, also run `emotion_frames.py <ids>`, `bake_emotion_faces.py <ids>`, `bake_story_poses.py` (about 11 minutes, run in the background), `bake_talk_faces.py <ids>`, bump `EMO_V` and `TALK_V`. Mechanism and the `hg` field: docs/CHANGES.md "headmood1". In the mood frames the head grows about each frame's own measured chin row (`tools/sprite-bake/emotion_chin.py`, `emotion_chin.json`, docs/CHANGES.md "headchin1"); after a rebake look at `CHECK=/tmp/chin.png python3 tools/sprite-bake/emotion_chin.py <ids>` and correct a wrong line with `FIX`.

## Pose Editor (standing rule, Tom 2026-11-14)

Tom (11-14 20:32): automatic head and height sizing kept missing, so he sets the lines himself. ADMIN > POSE EDITOR (`poses.html`): walking, feelings and talking poses; per pose two lines (top of the skull, chin); a pose he has checked is resized by rule (head = Tom's head x the person's head target, body from the real height) with a hand fine tune; a real height and a head target per person. It saves `data/pose-requests.json` on `main`. The rules in force are `docs/POSE_EDITOR.md` (it wins over the Project plan files): every checked pose gets the person's one head size and is EXACTLY the person's real height, the body shrinking or stretching to fit (Tom 11-14 21:55: "can't deviate"). The build is in six phases; the tracker, the maths and the rules are `claude/pose-editor-plan.md` in the Project and its addendum `claude/pose-editor-poseedit2.md`, which wins where they differ (prompt: "Read claude/pose-editor-plan.md and claude/pose-editor-poseedit2.md, then build the next phase."). Until the apply build lands nothing reads the request file: if Tom says "apply my pose sizes" before then, say so and build it. Never overwrite his request file with an older copy. Once a frame has Tom's lines, no bake guesses its chin. Dialogue faces of a pose he has lined are cut by those lines at the master heights in `data/portrait-frame.json` (`tools/pose-editor/pose_faces.py`), so applying a save also means rebaking the faces (docs/POSE_EDITOR.md). After any walk sheet, chin anchor, height or HEAD SIZES change run `python3 tools/pose-editor/manifest.py` (the page's "in the game now" comes from it). Test: `python3 tools/pose_editor_test.py`.

## Real heights (standing rule, Tom 2026-11-11)

Tom (11-11 12:23): "main character height should always be a factor of the head size set in the head sizes function, and their hardcoded heights using a character like Tom as a baseline." A real height is typed in ONE place, `data/heights.json`. Tom is the baseline (42 rows, 5'11); everyone's standing walk figure is drawn at 42 x inches / 71 at any head size. Adults' heads are Tom's head times their own HEAD SIZES factor, so changing Tom's head moves all adults. The game's draw scales are generated (`python3 tools/sprite-bake/heights.py write` into `data/walk-scale.js`); never type a `set.k` or `OW.<id>.k` for a main character. `python3 tools/heights_test.py` must pass (smoke runs it). Details and the change recipe: `docs/CHARACTER_PIPELINE.md` section 7, "Real heights in the overworld".

## Tom's painted frames are used as painted (standing rule, 2026-11-05)

Tom (11-05 08:13): "Remember these rules going forward because in the next build instructions I will provide Grace's new walking and standing frames." When Tom supplies painted walking or standing frames for a character, the bake uses them exactly as painted: no head or body resizing, no flipping or substituting a frame, his own standing paintings are the stand frames, and his painted second steps are used. A frame that cannot be used as painted (a repeated cell, a wrong direction) is named to Tom in plain words, with the reason, before or when it is changed. This overrides the head share targets in `docs/CHARACTER_PIPELINE.md` section 7 for any frame Tom painted or supplied. Before changing any bake, rebake once with no change and confirm it reproduces the repo files byte for byte. Show Tom the frames (stand next to steps, and a head row) before pushing. Tom's walk is the model: `tools/sprite-bake/bake_tom_walk_v4.py`, CHANGES 183.

## Dialogue faces never use hero paintings (standing rule, Tom 2026-11-11)

Tom (11-11 06:47): hero paintings appear only in the main menus (status screen) and battle menus (Tombos, turn order). Dialogue always uses the character's emotion sheet (mood lines, `portraits/emo/`, `bake_emotion_faces.py`) or walking sheet (no-mood lines, `portraits/talk/`, `bake_talk_faces.py`), cropped and centred to the dialogue box. A new speaker gets a talk face in the same change (add the id, rebake, look at the contact sheet). Never point a dialogue portrait at a hero crop.

## Monster dialogue portraits (standing rule, Tom 2026-11-06)

Every monster that speaks in a dialogue box gets a portrait: a zoomed-in crop of its face, taken from the stance frame of its painted enemy sheet. Monsters that never speak need none. The list of speakers is `docs/MONSTER_PORTRAITS.md`; the baker is `tools/sprite-bake/bake_foe_portraits.py` (add the id to `SPEAKERS`, and to the `foe_` key list in `engine/menu.js` and the speaker name in `DIALOG_PORTRAIT_IDS` in `engine/overworld.js`). When you write a new line for a monster, or install a new monster sheet for a speaker, add its portrait in the same change and look at the contact sheet before pushing. People who are villains (Vance, Marlowe) are not monsters: they need a painted face of their own, not a boss crop.

## In-game reports and "Fix the backlog" (standing rule, 2026-11-14)

Tom files bugs and changes from inside the game with the pencil tab (REPORT): a note, a picture of the frozen screen with pins, and the full game state, saved on branch `inbox`. When Tom says "Fix the backlog" (or "check the backlog"), follow `docs/REPORTS.md`: `python3 tools/reports.py list`, look at every picture, reproduce, fix, test, push, quote his note and the report id in docs/CHANGES.md, then `python3 tools/reports.py done <ids>` for the ones that are fixed. A report that needs Tom stays open and is named in the reply with the one thing needed. `engine/report.js` loads first and wraps frames, timers and the clock: keep it first in `index.html`.

## Script Editor (standing rule, 2026-11-14)

Tom edits the story's words in ADMIN > SCRIPT EDITOR (`script.html`, `docs/SCRIPT_EDITOR.md`) and sends them with Send to Claude (`data/script-edits.json` on `main`). When Tom says "Apply my script edits": follow docs/SCRIPT_EDITOR.md (`python3 tools/script-index/apply.py`, look at each edited scene, test, push, tell him which lines now wait for a recording). Whenever you add or change a scene, run `python3 tools/script-index/build.py` and commit `data/script-index.json` (and `stage.py <id>` for a new scene). Before writing new dialogue read `docs/tom-edits.tsv`: his rewrites are the humor guide. Conversations and Workshop (scriptconvo1): every scene is split into conversations with a review status (`docs/script-convos.tsv`, `data/script-review.json`); when Tom says "Workshop my flagged conversations", follow docs/SCRIPT_EDITOR.md (`tools/script-index/workshop.py`). **Locked lines:** before changing a line in a built scene, check `data/script-review.json`; a line in a Locked conversation changes only when Tom says so in chat. A new scene gets its purposes and plot lines in `docs/script-convos.tsv` in the same push.

## Enemy sprite sheets (standing rule, 2026-10-29)

Tom may drop a PNG enemy sprite sheet into any conversation, often with no words. That means "install this enemy". Follow `docs/ENEMY_SHEETS.md`: identify the enemy id, bake the sheet (tools/sprite-bake), wire the painted frames, test a fight against it, push, and log it in that doc's table.

## Room paintings (standing rule, 2026-10-30)

Tom is redoing every interior as one square painting per room that fills the iPhone screen in portrait and landscape. He may drop a zip of these paintings into any conversation, often with no words. That means "install these rooms". Follow `docs/ROOM_PAINTINGS.md`: check each image against the art requirements (square, full bleed, no people or text), convert to `art/<id>.webp`, update PLATES, grid size, walk maps, doors, residents and props, test portrait and landscape with screenshots, push to `main`, and tell Tom which rooms are live and which need a redo. Never ask him to unpack or resize anything.

## Long Island area paintings (standing rule, 2026-10-30)

Tom is redoing every Long Island outdoor area (Square, Rivituso Row, Grump Hollow, Cattail Pier, Whispering Marsh, Sundial Hollow, the school yard) one at a time. **Do not install them one by one.** When all are finished he will upload the pictures (a zip or a batch, often with no words). That means "install these areas". Follow `docs/AREA_PAINTINGS.md`: identify each picture, scale to the plate size, check every painted word letter by letter, check no sign overlaps a door, re-derive each walk mask (`python3 tools/mask_overlay.py <id>`), close dead-end paths, fix exits, objects and scene coordinates, restore the Square's large fountain if the new painting reverted it, test portrait and landscape with screenshots, push to `main`, and tell Tom which areas are live and which need a redo. The generator paints the sign lettering; the game does not draw words on boards any more. Never ask him to unpack or resize anything.

## Justin's ability sheets (standing rule, 2026-10-31)

Justin (Amy's husband) is becoming a party member. Tom will drop a zip of his painted battle and ability animation sheets into a conversation, often with no words. That means "install Justin with his kit". Follow `docs/JUSTIN_ABILITIES.md`: it holds the approved kit (moves, MP, lines, special), the frame keys for every sheet, and the install steps (bake, party data, `engine/justin-moves.js`, recruiting at GREGORI, tests, push). Never ask him to unpack, rename or resize anything.

## New characters and ability pose sheets (standing rule, 2026-10-31)

When Tom gives photos of a new character, or asks for poses for an ability, do not ask him to describe the image prompt requirements and never make him rewrite them. **Real height in feet and inches is required before anything else; ask if it is missing.** Show Tom a head row so he can judge face sizes against the cast, and match the head to its age target (see Head sizes above). Follow `docs/CHARACTER_PIPELINE.md`: write the character spec from the photo, then the three standard prompts (ONE large full-body hero pose, a 3 x 3 walking sheet, a 4 x 4 standard battle sheet), and for any ability a sheet of **4 to 7 poses only** (keep the critical frames, no walking in or out, no prep or aftermath filler, about 2 spoken lines, painted props only when held, effects left to the game). Send the prompts as files, hero pose first. When the sheets come back, install them per section 6 of that doc.

## No unused voice (standing rule, 2026-11-01)

Tom has asked repeatedly: voice lines and clips the full game never plays must not exist in this repo. Every line in `data/lines.js` and every baked clip shows up in the Voice Library and bake lists and can cost him ElevenLabs credits. So:

- Never add a line that nothing plays. Every new line is wired to a move, scene or dialogue in the same change. If an animation drops a line, delete the line in the same change.
- Before every push that touches `data/lines.js`, a move animation, a scene or any voice file, run `python3 tools/clip-audit/unused_voice.py`. It must report 0 for all four checks. Fix anything it finds (`node tools/clip-audit/purge_unused.js <spec> --apply`, remove the lines from `data/lines.js`, rebuild the index with `python3 tools/voice-library/battle-scripts.py && node tools/voice-library/make-index.js`, bump `?v=`).
- Record what you removed in `docs/PURGED_VOICE.md` and `docs/CHANGES.md`. Git history keeps the audio, so deleting is safe. This is the one exception to hard rule 4: purging unused clips does not need a `voices.json`.
- Lines that are live but have no clip yet are not dead. They are the bake list.

## ElevenLabs voice limit (standing fact, 2026-11-02)

Tom's ElevenLabs account is **maxed out at 30 custom voices** (voices added from the library count too, and every Voice Design save takes one). Never plan a new or recast voice without a slot plan: delete the voice it replaces first, or ask Tom which unused voice to delete. For Deedee use `recast-deedee.html` (built by `node tools/voice-recast/build-deedee.js`); it deletes the old voice for him and shows the new voice id. When Tom sends the id, set the new id in the Deedee override in `tools/voice-library/make-index.js` (never in the baked `data/voice-clips.js`), rebuild the Voice Library index, and note it in `docs/CHANGES.md`. Other recast bakers in `tools/voice-recast/` follow the same delete-old-voice rule.

## Load time (standing rule, 2026-11-02)

Fact: the title screen waits for 51.5 MB of blocking scripts (306 `<script>` tags), 37 MB of which is voice audio stored as base64 text in `data/voice/*.js` and ~10 MB baked sprite data; after the title, the chapter voice files (`data/voice/dialog-ch*.js`, about 94 MB, mostly untagged) and the art load on demand, about 230 MB in all. Before `sw1` there was no service worker, so an iPhone home-screen app re-downloaded it all whenever Safari dropped its cache. Tom (11-02 10:20) decided:

- **DONE in `sw1` (2026-11-02): service worker `sw.js` at the repo root, registered at the end of `index.html`.** `?v=` files are cache-first; `index.html` always comes from the network; files with no tag (184 scripts, the chapter voice files, music) are used from the saved copy only after the server answers 304 to If-None-Match or If-Modified-Since; `cache:'reload'` (the RELOAD button) goes to the network and refreshes the copy. CORRECTION to the plan: not every file carried a `?v=` tag (184 scripts and the chapter voice files had none), which is why the untagged path asks the server instead of trusting the cache. `tools/tag_check.py` (run by `tools/smoke.py`) fails when a modified file's tag, or the folder constant that tags it (`ART_V`, `BG_V`, prop `V`, flight `v`), did not move since `origin/main`; `tools/sw_test.py` tests the worker (second load: 0 tagged files reach the server, untagged ones get 304, a bumped tag downloads, offline start works). Details: docs/WORKFLOW.md "Cache tags and the service worker". Last resort for a stale phone: change `SW_VER` in `sw.js`.
- **DONE in `mem1` (2026-11-03, Tom approved): memory for long sessions.** Battle and enemy painted sheets load on demand and are released when unused (`paintedTick` in `engine/painted.js`; overworld sheets still load at boot). Decoded voice clips are capped (`lruSet` in `engine/speech.js`). A new painted atlas whose id starts with a cast prefix (PAINTED_CAST) or `foe_` is lazy automatically; give a new cast member's prefix to PAINTED_CAST. Details: docs/CHANGES.md (118).
- **POST-BUILD ONLY. Do not start these until Tom asks for them by name**, however slow loading looks: (1) voice clips as real `.mp3` files fetched on demand instead of base64 in JS, (2) a loading bar on the title screen, (3) sprite data loaded per party member and per area instead of at boot. Mention them at most once per session if loading comes up, then leave them alone.

## Build label and build history (standing rule, Tom 2026-11-14)

Tom (11-14 08:53) tells builds apart by the build label: a chip at the top left of the welcome screen and a Build box in the menu, each showing the build name and the time it was made. Tapping either opens BUILD HISTORY (`engine/build-history.js`), one day at a time, today first. Every push gets its own build name and its own entry: write the build's heading in `docs/CHANGES.md` first (`## <tag> (<date>): <one plain line>`, it becomes the line Tom reads), then run `python3 tools/art-library/bump_tags.py <TAG> --base origin/main`, which sets the stamp and calls `tools/build_history.py add <TAG>` (time now). Never reuse a build name and never push without a new one. Never hand-edit `data/build-history.js`; on a rebase conflict take upstream and run `python3 tools/build_history.py add <TAG>` again. Smoke fails when the stamp's build is not the newest entry. Test: `python3 tools/buildlog_test.py`.

## How to work

1. Read only the files the task needs. The repo is large (`engine/battle2-kind.js` alone is 400 KB). Use search to find the section; do not open whole files.
2. Make the change.
3. `python3 tools/smoke.py` (default characters), or `IDS=grace,rose python3 tools/smoke.py` for a specific character. For a move you touched: `python3 tools/kit_test.py <id> --only=<move_key> --speed2` and look at the contact sheet in `tools/shots/`.
4. Check portrait and landscape (smoke does both) for anything visual.
5. Summarise in a few sentences what changed and what Tom should look for on his phone.

## Setup (once per environment)

```
pip install playwright pillow
python3 -m playwright install chromium
python3 tools/serve.py        # http://localhost:8000/index.html
```

The game must be served over http. Opening `index.html` as a file will not work.

## Where things live

| Want to change | Look in |
|---|---|
| The admin page (every admin tool as grouped buttons) and `index.html?go=welcome-layout\|battle-lab\|block-break-lab` | `admin.html` (https://trivituso81.github.io/adventures-of-tom/admin.html), `battle-lab.html` (the Battle Lab's own address, hands over to `?go=battle-lab`), `splashGoTool` in `engine/splash.js`, `python3 tools/admin_hub_test.py` |
| A cutscene or story beat | `data/scenes.js` (steps documented at `SCENE_OPS` in `engine/story.js`) |
| A map, building, room, NPC, NPC dialogue | `data/maps-le.js` (Long Island), `data/maps-la.js` (Los Angeles) |
| A monster (stats, lines, sprite) | `data/*-monsters.js` (one file per area), numbers in `data/battle2-data.js` |
| A character's attack animation | `engine/<name>-moves.js` (Tom, Grace, Rose, Amy, Deedee, Boppy, TNB), `engine/nara.js` |
| A Tombo or Family Finish or Director's Cut (two-character combo) | `data/battle2-data.js` (numbers), `engine/battle2-kind.js` (animation) |
| Spoken battle lines | `data/lines.js` |
| Spoken dialogue speakers and voices | `data/dialog-cast.js` |
| The pause between two speakers in a story scene (snap, normal, beat) | `docs/line-gaps.tsv`, then `python3 tools/gap-apply.py` (seconds: `DA_GAP` in `engine/dialog-auto.js`) |
| The new battle system ("Battle 3", v11 rules, Battle Lab > NEW BATTLE only for now) | `docs/BATTLE3.md`; numbers and moves in `data/b3-*.js`, rules in `engine/b3-core.js` and the other rules files, screen in `engine/b3-play.js` and `engine/b3-ui.js`; `node tools/b3-sim.js check`, `python3 tools/b3_test.py` |
| Vibes (the new battle system's jobs: Main and Pocket Vibe, Quirks, Ranks, rows) | Rules in `engine/b3-progress.js`, the Vibes screen and the save fields in `engine/b3-menu.js` (pause menu > VIBES, and Battle Lab > NEW BATTLE > VIBES AND RANKS); Vibe rows in `data/b3-kit-<id>.js`; `python3 tools/b3_test.py s4` |
| Difficulty modes | `B7_DIFF` in `engine/feel.js` |
| Stats, items, party members | `data/party.js`, `data/abilities.js`, `data/progress.js` |
| Menus | `engine/menu.js`, `engine/progress.js`, `engine/shop.js` |
| Music tracks, their prompts, makes and merges | `tools/music-library/tracks.json` (prompts), `music.html` (ADMIN > MUSIC LIBRARY), `docs/MUSIC_LIBRARY.md`, `engine/music-clips.js` (what plays where) |
| How big a map painting must be, how outdoor maps zoom to fill the phone screen | `docs/MAP_SIZES.md` |

## Debug handle

`window.__LE` exposes the engine to tests and to you in the browser console (`__LE.b2Start`, `__LE.B2`, `__LE.go(mapId)`, `__LE.setFlag`, `__LE.chapterJump`). Extend it in `engine/main.js` or at the end of the file that owns the thing.
