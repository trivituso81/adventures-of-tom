# Battle Guide makes and remakes battle videos (guidegen), plan and state

Card c-guidegen. Tom (2026-11-21 09:25): "This UI seems like a good place for me to be able to just regenerate images on the fly using the WAN service. whether it's if there is no video present, I can just generate the video assuming that this part of the application has reference to exactly what the animation should look like and thus provide a prompt to the service, and then if there's already a video, I need a way to enter my feedback and then reconcile that feedback. I need you then to reconcile that feedback with the existing prompt, making sure that what I put in makes sense and seamlessly integrates with the prompt and then allows me to regenerate" (by image he means video too).

Rules in force (repo CLAUDE.md): no painted poses in battle; fix a miss with the smallest change; image and video prompts: clean, each thing once; keysecrets1 (no key on any page). Route (claude/video-battle-plan.md): family on Wan 3.0 through fal, monsters on xAI Grok lite.

## 1. Facts on 2026-11-21 (counted, not assumed)

| Fact | Value |
|---|---|
| Animations in the guide (body, move, act, wind) | 346 |
| With a video / old painted pose / no video and no pose | 68 / 5 / 273 |
| Wan jobs in `tools/art-library/wangen-jobs.json` | 46 clip jobs (`<who>-<state or move>`) and 4 start-picture jobs, prompt files in `tools/art-library/prompts/wan-<who>-<name>-v<rev>.txt`, for Tom, Grace, Rose, Deedee only |
| Monster prompts | entries of `tools/art-library/clip-prompts.js` (`module.exports.entries`; id `clip-<owner>-<key>`, `clip.id` `<owner>-<key>`), 6 monsters of chapter 1 |
| Start pictures | family: `art/clips/start/<who>-hero.png` for Tom, Grace, Rose, Deedee; monsters: `art/clips/start/<id>.png` for the 6 of chapter 1. Nobody else has one |
| Price | Wan 3.0, 5 s at 720p: $0.50 (`est_per_s` in wangen-jobs.json; $0.50 on 11-20). xAI lite, 3 s at 480p: `cost()` of clipgen.py = $0.07 |
| How the game names a clip | the id the data rows use has underscores (`tom_loungepass`); the file is `data/clips/tom-loungepass.js`; the Wan job and the entry use the hyphen form |
| Tom's REDO notes | 34 saved in `data/art-prompts.json` `rejects` with `from: 'review'` (chapter 1 review, 11-19), faults sorted in `tools/clip-gate/review-ch1.json` |

## 2. Which text model the reconcile step calls (decided, nothing new asked of Tom)

Secrets the repo has: `XAI_API_KEY` (clip-gen, clip-gate vision, art-gen, art QA), `FAL_KEY` (wan-gen), `ELEVENLABS_API_KEY`, the `CLAUDE_TASK_*` tokens (they start Claude sessions: not a text API).

Call made: **xAI chat completions with `XAI_API_KEY`**, the same endpoint and client shape `tools/clip-gate/vision.py` already uses (`/v1/chat/completions`, JSON answer, cost from `usage.cost_in_usd_ticks`). The model is picked from `/v1/language-models` as vision.py does, but for text: a non-reasoning model (its reasoning tokens would be billed as output), the strongest listed, because a reconcile call is about 3,000 tokens in and 700 out (a few cents) and the quality of an edit is worth more than the saving. An input `model` overrides it. No new key, no Tom setup card.

Why the model is not trusted alone: the smallest-change rule is checked by code after every answer (section 4). An answer that breaks it is asked again once with the broken rule named; a second failure is shown to Tom as it is, marked "check this one", never silently kept.

## 3. Design

Every tap is a request committed to the repo (page needs only the GitHub token it already has), fulfilled by an Action, answered on a branch the page polls. Pattern: `claude/keysecrets-plan.md`.

| Part | Request file (main) | Action | Answer |
|---|---|---|---|
| 1 | none | `tools/guidegen/build_map.js` writes `data/guide-anims.json` (also run by the Actions below) | the page reads the file |
| 2 reconcile | `data/guide-reconcile.json` (message `guide: update prompt <anim>`) | `guide-reconcile` (python, requests, no ffmpeg; secret XAI_API_KEY) | branch `guidegen`, `reconcile/<request id>.json` |
| 3 family video | `data/wan-requests.json` (message `wan: generate <anim>`) | `wan-gen` with `requests` mode (secret FAL_KEY), then the clip gate, then a preview bake | branch `guidegen`, `takes.json` and `takes/<slug>/t<n>.*` |
| 3 monster video | `data/clip-requests.json` (`guide` field on the request) | `clip-gen` with `--requests` and `review: true` (made and gated, never approved by itself) | the same |
| 3 use | `data/guide-use.json` (message `guide: use <anim>`) | `guide-use` (bake, wire, purge, tags, commit to main) | main, and `used/<id>.json` on `guidegen` |

Every request empties the queue before anything is paid (a second run cannot pay twice), carries its own cap, and a session only commits dry requests (`dry: true`). The first paid run is Tom's tap.

### 3.1 The generated file `data/guide-anims.json` (Part 1)

`tools/guidegen/build_map.js` loads `data/b3-*.js` as `tools/b3-sim.js` does and lists the animations the way the page's `buildAnims` does, then adds, per animation id: `owner`, `kind`, `name`, `clip` (the id the game plays now, or null), `newClip` (the id it will get), `route` (`wan` family, `xai` monster), `job` (Wan job name or null), `entry` (Art Library entry id or null), `prompt`, `promptSource` (`job`, `entry`, `used` through the guide, `model-draft`, `rule-draft`), `promptRev`, `start` (picture path or null), `missing` (what is missing, in words), `price`, `priceNote`, `settings` (what the request sends), `bake` (the recipe name of section 5). A move or act is matched to its job or entry by the name in the entry's label (`Lounge Pass Flex (shows off his lounge pass)` is the move Lounge Pass Flex), a body state by `<owner>-<state>`; a test fails on any job or entry that matches no animation or two.

DRAFT prompt (an animation with no prompt): the same person's approved idle prompt is the pattern; everything before `MOTION:` is kept word for word and only the MOTION part is new. A monster's pattern is the same monster's idle entry (a monster without one uses the Mudling's: `LOOK_FOE` is generic). The MOTION comes from the move's own data (name, desc, flavor, shape, target, effects), the row of `claude/battle-animation-list-ch1-v11.md` where there is one, and the pattern's gesture sentences ("once", "without repeating the gesture", ends in a held pose). The first file carries a rule-made MOTION (`rule-draft`, honest label STARTER DRAFT); the `draft` request of Part 2 has the model write the real ones in one capped run and commits them to `data/guide-prompts.json` (`model-draft`).

### 3.2 The page (`battle-guide.html`, no engine, four Duo sizes)

The animation sheet gets one block under the player. With a video: box **What should change**. With no video: the draft prompt and the optional box **Anything to add**. A family member or monster with no start picture shows "Cannot be made yet: <what is missing>" and no Generate. Tap **Update the prompt** commits the reconcile request; the page shows the new prompt (an editable box) and three plain lines (Kept, Changed, Could not use); a question comes back as one line in place of a prompt. **Generate this video** shows the price and takes a second tap ("Yes, make it, $0.50"). The result row shows the new take beside the current clip with the gate's verdict in plain words and three buttons: **Use this one**, **Try again with a note** (back to the box), **Keep the old one**. A second miss the same way on one animation stops the loop and offers **Ask Claude** (today's Send to Claude card, kept). Per animation: Prompt vN, Takes made, Spent.

## 4. The reconcile step (`tools/guidegen/reconcile.py`)

Input: current prompt (the one that made the current clip, or the draft), Tom's words, the brief (move facts, owner, the pattern's fixed parts), what happened before (his earlier notes on this animation and whether those takes were kept). Output: `{prompt, kept, changed, unused}` or `{question}`.

The model is told the rules of CLAUDE.md in its own system text: start from the given prompt; change only what the note names; say each thing once; keep the lines that hold the picture steady (facing, feet planted, locked camera, flat magenta background, silent); never change model, length and method in one step; leave out backstory, lists of things to avoid and anything about speed; a note that contradicts itself or the move, or asks for something a video cannot show (sound, a spoken word, a camera move, an effect the engine draws), is answered with one plain question and no prompt.

Checked by code after the answer (`validate`): (1) the three labelled parts exist in order (WHAT THIS IS, CAMERA AND BACKGROUND, MOTION: <name>; a monster prompt keeps its own parts); (2) the parts the note did not name are byte for byte the old ones (a note that names the facing, feet, camera or background may change that part, and only that); (3) at least 70 percent of the old prompt's words survive (below that is a swing: redo as an edit); (4) length within 20 percent of the old prompt unless the note asks for more or less; (5) no sentence says the same action twice (a repeated verb phrase inside MOTION); (6) the count words ("once", "without repeating") stay in MOTION; (7) no banned word (16-bit, 32-bit, SNES, pixel art, retro, sprite, Final Fantasy, Chrono Trigger). A broken check is sent back once.

## 5. Generate, gate, use (Part 3)

Settings sent are the ones that made the clips Tom liked: Wan 3.0 `alibaba/wan-3.0/image-to-video`, the start picture as first and last frame fitted to 720 x 1280 (`wangen.fit_frame`, `pad` when the move reaches wide or high), 720p, 5 s, no audio, seed 81, prompt expansion left on. A monster: xAI `grok-imagine-video-1.5-lite`, 480p, 3 s, the start picture as first frame. The cap of a request is at most 2 takes' price; the ledger (branch `wangen`, branch `clipgen`) counts it too.

A made video goes through `tools/clip-gate/hold.py` (measured checks, then the vision questions that hold). The Action never approves it: it bakes a preview with the recipe, keeps video, preview and the gate's words on branch `guidegen`, and the page shows it beside the current clip.

Recipe by kind of animation (the numbers wanch1 and clipch1 settled): idle = loop, every 3rd picture, forward only; run = loop, one stride cycle, forward only; guard = kind guard with rise and lowering marks; hit, ko, victory, give, cast, dodge = state, the action stretch, every 2nd picture at 1.5x; a move or attack = strike (marks from `clipmarks.py`: START, HIT, END), every 3rd picture at 1.5x (1x for cast, lounge pass, wet floor); a wind-up = state. Figure rows from the owner's table in `clip-prompts.js` (`PEOPLE`, `FOES`).

**Use this one** (`guide-use`): copies the take's video to `art/raw/clips/clip-<id>-v<n>.mp4`, bakes `data/clips/<id>.js` and `art/clips/<id>.webp`, adds the script tag to `index.html`, points the row at it (`B3_BODY_CLIPS` for a body state, `anim:{kind:'clip',clip:'<id>'}` for a move or act, `wind:` for a wind-up), removes the painted pose it replaces (`B3_BODY_PAINT` row; CLAUDE.md purge rule), writes the prompt that made it to `data/guide-prompts.json` (rev + 1) and to the Wan job file or the entry (`promptRev` + 1), moves the tags, adds the docs/CHANGES.md heading and the build history line, commits to main. Keep the old one: writes `kept` on the take, changes nothing else.

## 6. Tests

| Test | Covers |
|---|---|
| `tools/guidegen/build_map_test.py` | counts (346, 68, 5), every job and entry matched once, drafts keep the pattern head, start pictures exist where claimed |
| `tools/guidegen/guidegen_test.py` | reconcile with a stand-in xAI (answers, questions, a swing sent back once, a second failure marked), the validator on good and bad prompts, the Boop history and the 34 REDO notes through the stand-in and through the validator, request file handling (queue emptied first, caps), take bookkeeping, use on a copy of the repo |
| `tools/battle_guide_test.py` | the page at the four Duo sizes with a stand-in GitHub and stand-in Actions for all three parts |
| existing | `tools/art-library/clipgen_test.py`, wan-gen dry run, `tools/art-library/wangen_test.py`, `python3 tools/b3_test.py s8`, `python3 tools/smoke.py`, `python3 tools/board_check.py` |

## 7. Order and tags

guidegen1a (Part 1: the file, the script, the page shows the prompt and why it cannot be made), guidegen1b (Part 2: reconcile Action and page), guidegen1 (Part 3: generate, gate, compare, use; docs/BATTLE_GUIDE.md; the Tom card). Each pushed when its tests pass.

## 8. Results

**Part 1 (guidegen1a, pushed fb0877f).** `data/guide-anims.json`: 346 animations (68 video, 5 painted, 278 none), 79 with a real prompt, the rest with a draft that keeps the person's approved prompt and changes only MOTION. Unmapped on purpose and listed: four cast jobs and seven entries (deedee-cast, grace-cast, rose-boop, rose-cast, rose-sleep, tom-cast, tom-give).

**Part 2 (guidegen1b, pushed 2cf608a), real replay on 2026-11-21.** Model `grok-4.20-0309-non-reasoning` (the dearest non-reasoning xAI text model; the existing `XAI_API_KEY`, nothing new asked of Tom). 24 notes replayed (Tom's chapter 1 REDO notes and the Boop history), cost $0.0447 of a $0.48 cap.

| Outcome | Count | Cases |
|---|---|---|
| New prompt accepted by the checks | 6 | deedee-wetfloor, grace-cast, grump-idle, rose-lava, toad-idle, tom-loungepass |
| One plain question back (vague, contradictory or impossible note) | 13 | the vague notes, Boop with sound, Boop camera, Boop both ways, log-idle, deedee-cast, deedee-scrub and others |
| Prompt came back unchanged (no wording can carry the note) | 5 | Boop pointed at the viewer, Boop three reaches, tom-give, grace-cubepop, tom-cast |

The five unchanged answers first showed as "check this one"; they are now their own outcome (`nochange`: the page shows what could not be used and offers nothing to keep). No answer broke the smallest-change rule after the one resend. Not re-run with the real model after the `nochange` fix (stand-in tests cover it).

**Part 3 (guidegen1).** Built and tested against stand-ins only; nothing paid was run (`dry:true`, stand-in fal and xAI). The first real paid take is Tom's tap on the Tom card the session ends with. Facts worth knowing:
- The take is cut by `tools/guidegen/recipe.py` with the same baker as the game (`bake_clip.py`), in a scratch copy, so the preview Tom sees is the clip the game would play.
- The gate on a take is `hold.py` as the clip-gen Action uses it; its vision part needs `XAI_API_KEY`, so it runs only in the Actions. Where the gate cannot run, the take says so in words.
- Two jobs write the same branch at once (a Wan take and a reconcile answer): `tools/guidegen/keep.py` lays each job's files over the newest copy and pushes with a lease, retrying.
- The Wan `guide_days` counter caps guide spending at $10 a day; a request past it comes back as a refused take with words.
- Pre-existing failures that are not from this work: `python3 tools/board_sync_test.py` R5 and `python3 tools/art-library/clipgen_test.py` (`clip-tom-give-rev0.mp4` missing); both fail on the commit before guidegen1.


## Built: guideprompts1 (2026-11-21, card c-guideprompts): model-written prompts for the starter drafts

Tom (11-21 11:14): "why is this the prompt for cartridge blow, it seems generic". Cause: the 267 animations without a job, entry or used prompt carried the rule-made MOTION (one canned gesture per shape). `tools/guidegen/draft.py` (Action `guide-draft`, manual, inputs `ids`, `cap`, `dry_run`) asks the xAI text model for a MOTION written from the move's name and what it does, copies the head and tail in code, checks the answer in code (`check_motion`), retries once, and keeps the file on branch `guidegen`; a session copies it into `data/guide-prompts.json` and runs `node tools/guidegen/build_map.js`. Facts: three runs, 267 of 267 written, about $0.41 in all; two fixes found by reading the output (Nara's "its" pronoun; the game's hit-type labels such as racket and clobber were being drawn as props, 92 rewritten). Rules a reader of the output should know: flavor and tag words are labels, never objects; a motion of two beats (Pocket Pretzel and Pat) is allowed when the move's name has two. To write a prompt again for one animation, run the Action with `ids` (a named id is asked again even if it has one). No video was made. Test: `python3 tools/guidegen/draft_test.py`.
