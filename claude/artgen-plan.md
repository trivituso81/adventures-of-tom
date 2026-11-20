# Pictures from the board: approve the generation once, QA, auto-approve (artgen plan, 2026-11-19)

Written by the planning session `board-artgen` (Fable 5.2) for Sonnet 5.5 sessions to build. Also in the Project as claude/artgen-plan.md: a session that changes one copy writes the same text to the other in the same push.

## 1. What Tom asked for (11-19, 22:16 to 22:19, his words)

1. "Make a way for me to approve the auto generation of images within the Kanban board for cards that require new image generation, all images required for a given card at once."
2. "Then a way to imitate a qa of images to ensure they meet the prompt criteria and see the results. If hitting a certain qa threshold we can auto approve."
3. "Create these instructions and choose to design another prompt for a lesser model to execute your vision."

## 2. The design in one table

| Piece | Call made |
|---|---|
| Where Tom approves | On the board card itself (board.html). One button makes every picture the card needs. Two taps (arm, confirm), with the dollar estimate on the button. |
| Which cards | Open Tom cards with `ask: "pictures"` and `done_when.art_approved` (the entry ids are already there). No new card field is needed to say which pictures. |
| Who generates | A new GitHub Action `art-gen` with the repo secret `XAI_API_KEY` (same secret clip-gen uses). Tom can close the phone. The browser does not generate. |
| How the tap reaches the Action | The page saves `gen` on the card with the commit message `board: generate <card id>` (Tom's token, so it is a real push). `art-gen.yml` runs on a push to main that touches data/board.json and has `if: startsWith(github.event.head_commit.message, 'board: generate ')`, so every other push skips it without a checkout. |
| Where a made picture waits | Branch `artgen` (never merged, never served, like `clipgen`): the PNG plus `index.json`. The Art Library imports it into this device's results, so REVIEW, APPROVE and REJECT work exactly as today. |
| QA (phase 2) | An xAI vision model answers a fixed list of questions per picture plus the requirements it reads out of the prompt, three runs, majority. Result: "QA 11 of 12" and the failed lines with a reason, shown on the board card and in the Library's review. Report only in phase 2. |
| Auto-approve (phase 3) | A second button on the card: "Generate and auto-approve what passes QA". A picture is approved by the Action only when every hold question passes and the score is at or above the threshold in `tools/art-library/artqa-policy.json` (starts at 0.9). Everything else waits for Tom as in phase 1. |
| Honesty about the QA | Nobody has measured this QA against Tom's eye. The repo holds 1,284 approved pictures and 90 reject notes but no rejected pictures, so before phase 3 only false alarms can be measured. Phase 2 starts a record of QA score against each of Tom's decisions; the card shows that record next to the auto button. The clip gate lesson (repo CLAUDE.md "Clip quality gate") applies: the model cannot judge his invented ideas, only what is visible. |

Limits to state on the card, not hide: an entry with `own` (a photo that lives only on Tom's phone, 14 entries) cannot be made by the Action and is listed as "make this one in the Art Library"; a prompt edit saved only on Tom's device (`aot-art-edits`) is not seen by the Action, which uses the prompt in data/art-prompts.json; an entry whose reference picture is not approved yet is listed as waiting with the name of that picture.

## 3. Rules for all three phases

- One phase per conversation. First push `board: start <card id>`. Read repo CLAUDE.md and claude/handoff-rules.md first.
- Reuse, do not reinvent: `tools/art-library/clipgen.py` is the model for the Action script (class `Repo` with `sync` and the retried push, the state branch, spend cap checked before each send, preflight before the first paid request, a paid result saved the moment it downloads, the report file). `tools/art-library/gen.js` `buildRequest` and `generate()` in art.html are the exact request (model `grok-imagine-image-2.0`, `aspect_ratio` = entry `ar` or `3:4`, `resolution` = entry `res` or `1k`, `response_format: b64_json`, with references `POST /v1/images/edits` and `images:[{type:'image_url',url:<data URI>}]`, at most 5, else `POST /v1/images/generations`). A reference path under art/raw that names another entry means that entry's NEWEST approved version (`rp()` in art.html, `CHAIN`). Cost: $0.04 a picture plus $0.01 per reference (`SPEND_PER`, `SPEND_REF`).
- Approving from the Action writes exactly what `decide('ok')` writes for a picture: file `art/raw/<tab lowercased>/<id>-v<k>.png` (k = highest version n plus 1, raised while the file exists), and in data/art-prompts.json `prompt`, `status: "approved"`, a `versions` entry `{n: k-1, file, date, from: "artgen", at: <ms>}` (the same n rule clipgen copies). Then start `art-bake` by workflow_dispatch with the `files` input (a push with the Actions token starts nothing by itself).
- data/art-prompts.json and data/board.json are written with indent 1, `ensure_ascii=False`, plus a newline. Re-read from the newest main right before every write (other sessions, the board-sync job and Tom's phone edit both).
- Never print the key. A step never hides a failed command behind a pipe. `set -o pipefail` where output is piped to tee.
- The stub server `tools/art-library/stub.py` already fakes the two image endpoints and GitHub. Tests use it; no test calls the real xAI.
- Every new thing Tom sees on the board is plain words, no em dashes, no "<" in card text.
- Fix a miss with the smallest change. Stop-loss: two failures of the same thing, stop, write why on the card, move it to Stuck.
- Before pushing: `python3 tools/board_check.py`, `python3 tools/board_test.py /tmp/board`, `python3 tools/board_sync_test.py`, the phase's own test, `python3 tools/smoke.py`, look at the screenshots in portrait width (390 px). CHANGES heading first, then `bump_tags.py <tag> --base origin/main`, then push (claude/next.md "Push procedure").
- Docs in the same push: a short section in repo CLAUDE.md under the board rules, docs/CHANGES.md, and the "Built" section at the end of this file (what exists, what differs from this plan and why).

## 4. Phase 1, build `artgen1` (card c-artgen1): Generate all from the card

### 4.1 Board page (board.html)

On an open Tom card with ask pictures and `done_when.art_approved`, in the list card and near the top of its sheet (above "How did it go?"):

- A section "Pictures on this card". The page loads data/art-prompts.json once per page load (same origin; it is about 1.5 MB, so only when such a card is on the board) and shows one row per entry id: short title, state in words (Approved, Rejected with your note, Ready to make, Waiting for "<title of the reference>", Needs your photo: make it in the Art Library, Made: waiting for your review).
- Button "Generate all N pictures (about $X)". N and X count only rows that are Ready to make or Rejected. Two taps to confirm, like APPROVE in the Library. Disabled with the reason when N is 0 or a run is already asked for or running.
- On confirm it saves through the page's own `save()` with message `board: generate <card id>`: `c.gen = {want: true, at: <ISO>, ids: [...], est: X, mode: "review"}` and a history line "Tom approved generating N pictures (about $X).". Then the sheet says: "Started. The pictures are made for you (about a minute each). This card shows them when they are ready."
- While `gen.run.state` is `running`: "Making N pictures...". When `done`: one line per id from `gen.run` (made, skipped with the reason, failed with the reason), the money spent, and a link "Review them in the Art Library" to `art.html?review=<ids comma separated>` (add that parameter to art.html: it opens the review viewer on those entries after the import in 4.3).
- A card in Waiting (for example t-heistart while its Claude card is open) shows the section but the button says what it waits on.
- All good and Something is wrong stay as they are.

### 4.2 The Action

`.github/workflows/art-gen.yml`: `on: push` (branches main, paths data/board.json) guarded by the `if` in section 2, plus `workflow_dispatch` with inputs `card`, `ids`, `cap`, `dry_run` (default true) for sessions. `permissions: contents: write, actions: write`. `concurrency: group art-gen, cancel-in-progress: false`. Checkout with `filter: blob:none` and sparse paths `data`, `tools`, `art/raw`, `.github` (the full repo is 2 GB; a reference outside art/raw is read with `git show HEAD:<path>`, which fetches it on demand). Steps: restore branch `artgen` into `$RUNNER_TEMP/artgen`, run the script, save the branch (always), upload the folder as a workflow artifact.

`tools/art-library/artgen.py` (`python3 -I`, flags `--card`, `--ids`, `--cap`, `--dry-run`, `--out`, `--repo`; env `XAI_API_KEY`, `XAI_BASE`, `ARTGEN_REMOTE`):

1. Read the card. On a push run, take every card with `gen.want` true. Mark `gen.want = false`, `gen.run = {state: "running", at, run: <Actions run URL>}` on main first, so a second tap cannot pay twice.
2. Classify each id (function `classify`, tested on its own): approved (skip); has `clip` (skip, say so); has `own` (needs the phone); a reference entry not approved (waiting, name it); a result for the same id and the same prompt text already waiting on branch `artgen` with no later decision in `versions` or `rejects` (already made, not paid again); else make.
3. Money: estimate before anything is sent; cap = `--cap` or twice the estimate, at least $1; checked before each send; the run stops before passing it.
4. Preflight before the first paid request (key present, push to main and to `artgen` would work, `/v1/models` does not answer 401).
5. Make up to 3 at once. Each picture is written to `OUT/results/<id>/<UTC stamp>.png` and added to `OUT/index.json` the moment it arrives, and the branch is pushed after each one. `index.json`: `{"results": [{"key": "<id>@<stamp>", "id", "file", "t": <ms>, "prompt", "refs": [...], "card", "cost"}]}`. Drop results from the index and the folder when the entry has a decision newer than the result, or after 30 days.
6. Finish: on main, `gen.run = {state: "done" or "failed", at, made: [...], skipped: [{id, why}], failed: [{id, why}], spent}` and one history line in plain words. `OUT/artgen-report.json` holds the same.

`tools/board_sync.py`: add `'art-gen': 'xai'` to `SERVICE_LANE` and `art-gen` to the `workflow_run` list in board-sync.yml, so the xAI lane shows the run and a failed run becomes a Claude card as for clip-gen.

### 4.3 Art Library (art.html)

- After `loadResults()` and on a new small button "Check for pictures made for you" in Setup: fetch `index.json` from `https://raw.githubusercontent.com/trivituso81/adventures-of-tom/artgen/index.json` (test override `?artgen=<base url>`; a 404 means none, say nothing). For each result whose key is not in localStorage `aot-artgen-seen` and that is newer than the entry's last decision, download the PNG and store it as the next result of that entry (same record shape `addResult` writes, with `t` from the index, plus `srv: <key>`), then add the key to the seen list. The entry then shows as waiting on Tom, exactly like a picture made on the phone.
- `decide()` adds `srv` to the `versions` or `rejects` record it writes when the result has one (phase 2 needs it).
- `?review=<ids>` opens the review viewer on those entries.

### 4.4 Tests for phase 1

- New `tools/art-library/artgen_test.py`, in the shape of clipgen_test.py: `classify` on a made-up entry list (every state above); a run against stub.py and a local bare git remote: two entries made, one with references (assert the edits endpoint, at most 5 pictures, the newest approved version sent), cap stops a third, a second run pays nothing for what is already waiting, the board card on the remote's main ends `done` with the right lists, the branch `artgen` holds the PNGs and the index.
- board_test.py: a test card with two entries shows the section, the count and the estimate; two taps write `gen` and the commit message `board: generate ...`; a card with a run `done` shows the result lines and the review link; 390 px screenshot looked at.
- A Playwright check that art.html with `?artgen=` pointing at a local folder imports one result, shows the entry as waiting and that APPROVE through the stub writes `srv`.
- A dry run on GitHub: `gh api repos/trivituso81/adventures-of-tom/actions/workflows/art-gen.yml/dispatches -f ref=main -f 'inputs[card]=t-heistart' -f 'inputs[dry_run]=true'`, read the log, confirm the estimate ($0.06 for ch1-mudling-heist2: one picture, two references). Do NOT run it for real: the first paid run is Tom's tap.

### 4.5 Cards at the end of phase 1

- `after` of c-artgen1 = new Tom card `t-artgen1try`: ask pictures, theme Tools, blocks c-artgen2, `done_when` not set (he ends it with All good or Something is wrong). Next step text: "ADMIN > BOARD, open the card Generate and approve the new Mudling sheet. Tap Generate all 1 pictures (about $0.06), tap again to confirm. In about two minutes the card says the picture is made. Tap Review them in the Art Library: the Mudling sheet opens waiting for you. APPROVE or REJECT it as usual. All good here if the button, the wait and the review worked; Something is wrong if any step did not. This starts card QA for generated pictures (artgen2)." If t-heistart is no longer open, name the oldest open pictures card instead; if there is none, add one Library entry worth making is NOT allowed: say so on the card and mark t-artgen1try fyi with the instruction to try it on the next pictures card.
- Rewrite t-heistart's `next` to offer both ways (the new button, or GENERATE in the Library).

## 5. Phase 2, build `artgen2` (card c-artgen2): QA and seeing the results

### 5.1 The judge

`tools/art-library/artqa.py`, library plus CLI. Reuse from `tools/clip-gate/vision.py`: class `Xai` (`chat`, `models`), `pick_model` (cheapest model with image input that does not reason), `usd` (spend from the returned usage), `parse` (JSON out of the answer), `verdict` (majority over runs). Do not copy them: import them.

Per picture one call per run, 3 runs: the made picture (longest side 1536, JPEG), then each reference picture that was sent (labelled "Reference 1", ...), the prompt text, and the question list. The answer is JSON `{id: {yes: true|false, why: "<one short sentence>"}}`; yes means fine; an answer that is missing or unsure counts as no.

Fixed questions (id, text, who gets it). These are the hold questions:

| id | Question | Asked when |
|---|---|---|
| f_one | Is this one single image (not a collage of separate attempts, no borders or frames added around it)? | always |
| f_paint | Is it a smooth hand-painted picture with soft shading and no thick black outlines, and clearly not pixel art? | tab is not Clips |
| f_text | Is the picture free of letters, words, numbers, watermarks and signatures that the prompt does not ask for? | always |
| f_bg | Does the background match what the prompt asks for (for a flat color background: one flat color with no gradient, floor, shadow band or scenery)? | the prompt names a background |
| f_crop | Is every figure and object fully inside the picture with space around it, nothing cut off at an edge? | the prompt asks for a character, creature, prop or sheet |
| f_count | Does the picture show exactly the number of poses, cells or items the prompt asks for, laid out as asked? | the prompt states a number or a grid |
| f_same | Is the character or creature the same one as in the reference picture (same face, colors, proportions, outfit, finish)? | references were sent |
| f_anat | Do faces, eyes and hands look right (no extra or missing fingers or limbs, no warped face)? | the prompt shows a person or creature |

Prompt questions (advisory in phase 2, never hold): one text-only call asks the model to list up to 10 requirements from the prompt that a viewer can check by looking (each a yes or no question, each thing once, nothing about style already covered above). Cache the list on branch `artgen` as `criteria/<sha1 of the prompt>.json` so a re-make of the same prompt is judged on the same list. Ids `p1` to `p10`.

Score = questions answered yes by the majority, over all questions asked. Stored in the result's index record: `qa: {score, yes, of, model, runs, spent, items: [{id, q, kind: "fixed"|"prompt", yes, why}]}`. Vision money counts against the run's cap and is in the report; if the cap would be passed, the picture is kept without QA and says so.

`artgen.py` runs the judge right after each picture arrives (flag `--qa`, on by default in the workflow).

### 5.2 Seeing the results

- Board card, per picture in the "Pictures on this card" section after a run: a thumbnail from the `artgen` branch (raw address), "QA 11 of 12", and each failed line with its reason. Tapping the thumbnail opens the Library review for that entry.
- Library review viewer: under the picture, the same list (failed lines first, passed lines folded). The import in 4.3 carries `qa` into the stored result.
- `decide()` also writes `qa: <score>` and `qaFail: [ids]` into the `versions` or `rejects` record, so data/art-prompts.json becomes the record of QA against Tom's decisions.

### 5.3 Measuring before trusting

- `python3 -I tools/art-library/artqa.py --replay 40 --cap 1.5`: judges the 40 newest approved pictures of entries with no `clip` (file in art/raw, prompt and references from the entry) and prints, per question, how often it said no to a picture Tom approved, and the share of pictures at score 0.9 or more with every fixed question yes. Run it in the Action (workflow_dispatch input `replay`), since the key is a repo secret. This costs real money: keep the cap, and write the numbers into the "Built" section and onto card c-artgen2.
- A fixed question that said no to more than 1 in 10 of the approved pictures moves from hold to advisory in `tools/art-library/artqa-policy.json` (`{"threshold": 0.9, "hold": [...], "advisory": {id: reason}, "min_record": 20}`), with the number as the reason. Do not reword a question to make the number look better; one change per try.
- `python3 -I tools/art-library/artqa_report.py`: from data/art-prompts.json, the table of Tom's decisions on judged pictures: approved and passed, approved and failed, rejected and passed, rejected and failed. The board page shows one line from it under the generate button: "QA so far: agreed with you on A of B pictures" or "QA has not been checked against your decisions yet".

### 5.4 Tests for phase 2

`tools/art-library/artqa_test.py` with a stand-in chat endpoint added to stub.py (`POST /v1/chat/completions`, answers chosen by a marker word in the prompt, `GET /v1/language-models`): question selection per entry, majority over 3 runs, a missing answer counts as no, score maths, the criteria cache is reused, the cap stops QA but keeps the picture, the index record shape. board_test.py: a card whose run has QA shows the score and the failed lines. Screenshots at 390 px looked at.

### 5.5 Cards at the end of phase 2

`after` of c-artgen2 = Tom card `t-artgen2look`: ask pictures, blocks c-artgen3. Next step: "On the next card that needs pictures, tap Generate all. When they are made, the card shows a QA score and what failed for each picture. Decide each picture in the Art Library as usual. All good if the QA lines matched what you saw; Something is wrong with what it missed or wrongly flagged. This starts card Auto-approve pictures that pass QA (artgen3)." Name the open pictures cards that exist at that time.

## 6. Phase 3, build `artgen3` (card c-artgen3): auto-approve at the threshold

- Board card: a second button under the first, "Generate and auto-approve what passes QA" (`gen.mode: "auto"`), with the record line from 5.3 right above it and one line saying the rule in plain words: "A picture is approved for you only when every must-pass check is yes and at least 9 of 10 checks pass. The rest wait for you."
- `artgen.py --auto`: a picture is approved by the Action (section 3 rule) only when ALL hold: QA ran in full (3 runs, not cut by the cap); every question in the policy's `hold` list is yes; score at or above `threshold`; the entry has no earlier rejection by Tom (`rejects` empty: once he has rejected an entry, his eye decides it); the entry has no `own`. Anything else waits for review as in phase 1.
- The version record carries `from: "artgen"`, `qa`, `srv`. After approvals in a run, entries that were waiting on one of them as a reference become ready in the same run (loop until nothing new is ready or the cap is reached). Then dispatch art-bake with the approved files.
- `r2_art` in board_sync.py: when every picture on a card is approved and at least one newest version has `from: "artgen"`, the history line says which were approved by QA and which by Tom, instead of "you approved".
- Board card after the run: per picture "Approved by QA (11 of 12)" with the thumbnail, and "Not this one" which opens that entry in the Library (REJECT there works on an approved entry: check, and if it does not, make the review viewer offer REJECT for the newest `artgen` version).
- When the record (5.3) shows a picture Tom rejected that QA passed at the threshold, the page shows that count in the record line. The threshold is changed only in the policy file by a session, on evidence, never guessed.
- Tests: artgen_test.py auto cases (passes and is approved with the exact files and record; a hold question no, a low score, an earlier reject, a QA cut by the cap each leave it waiting; a chain of two entries finishes in one run; art-bake dispatch called with the files), board_sync_test.py for the new history line, board_test.py for the second button and the result lines.
- `after` of c-artgen3 = Tom card `t-artgen3try` (ask pictures, fyi): try the auto button on the next pictures card, look at what QA approved, All good or Something is wrong.

## 7. Build `cardlinks1` (card c-cardlinks1): open the right Library entry straight from a card

Tom (11-19 22:21): "Can we also create a prompt to link to the corresponding art library voice library music library directly from the kanban card". Today a card says "ADMIN > ART LIBRARY, Enemies tab, group Chapter 1, entry ..." and he finds it by hand; none of art.html, voices.html and music.html reads an address parameter that opens an entry. Runs after artgen1 (both change board.html and art.html).

| Piece | Call made |
|---|---|
| Card field | `links`: a list of `{to, ids, label}`. `to` is `art`, `voice` or `music`. `ids`: Art Library entry ids; for voice the line keys the Voice Library lists (or `{chapter, show}` for a filtered list such as chapter 8, No clip yet); for music the track ids in tools/music-library/tracks.json. `label` is the button's words. |
| No field needed | A card with `done_when.art_approved` gets its Art Library link from those ids automatically. |
| Board page | A row of buttons right under "Next step" on the list card and in the sheet: "Open in the Art Library: (label)", "Open in the Voice Library: (label)", "Open in the Music Library: (label)". Plain links, same tab, so the page's Back returns to the board. |
| Art Library | `art.html?open=<ids>`: switches to the entry's tab, sets the filter so it is visible, opens its group and row, scrolls to it. Several ids: all opened, scrolled to the first. Keep artgen1's `?review=` and make both use one function. An unknown id shows one line saying so, never a blank page. |
| Voice Library | Read voices.html first to see how its Show filter, chapter choice and search work, then add `?line=<key>` (one line opened and scrolled to) and `?chapter=<n>&show=<filter name>`. |
| Music Library | Read music.html, add `?track=<id>` (that track opened and scrolled to). |
| Backfill | Every open Tom card whose next step names one of the three Libraries gets its `links` in this push; the "ADMIN > ..." words stay in `next` as the fallback. |
| Check | board_check.py: an open Tom card whose `next` contains ART LIBRARY, VOICE LIBRARY or MUSIC LIBRARY must have a link to that Library (`links` or `done_when.art_approved`); `to` must be one of the three; `ids` not empty. claude/handoff-rules.md (Project and repo copy) gets one line in "The board": a card that sends Tom to a Library carries `links`. |
| The page that writes cards | board.html's Something is wrong keeps the tested card's `links` on it. |
| Tests | board_test.py: a card with each kind of link shows the button with the right address; a Playwright check per Library page that the parameter opens and scrolls to a real entry (pick ids from the repo data at test time), at 390 px, screenshots looked at; an unknown id shows the message. |
| After | `after` of c-cardlinks1 = Tom card `t-cardlinks1try` (ask play, fyi): "ADMIN > BOARD, open any card with an Open in the ... Library button and tap it. The Library should open on that exact entry. All good or Something is wrong." |

## 8. Built

(Each phase's session writes here: what exists, the measured numbers, what differs from this plan and why.)

### artgen1 (2026-11-20, Sonnet 5.5): built as section 4 says, with these differences

- Files: `tools/art-library/artgen.py` (the job), `.github/workflows/art-gen.yml`, `tools/art-library/artgen_test.py` (classify and a full run against stub.py and a local bare remote), `tools/art-library/artgen_lib_test.py` (art.html import, `?review=`, `srv`), `tools/board_artgen_test.py` (board page; separate from board_test.py so its PUT counts stay as they were). The stub now logs the aspect ratio, size and a hash of each reference picture sent.
- The job reads the board from the checked out main and restores and saves branch `artgen` itself (a commit made with a separate work tree, pushed with the checkout's credentials), after every picture and at the end. The workflow's extra step `--save-only` saves again after a crash.
- The cap does not refuse the whole run. A picture that would pass it is skipped and named on the card ("the spend cap ... would be passed"), the others are made. Reason: the plan's "cap stops a third" test needs that.
- `board-sync.yml`: the service step ignores `art-gen` runs started by an ordinary push to main (they start and skip on every board change; without this each would have made a failed-run card). Manual runs and taps count.
- The list card shows a compact line plus the button; the full rows are in the sheet, above How did it go.
- A rejected entry is counted as Ready (made again) in the estimate. A Library prompt edited only on Tom's phone is not seen by the job (stated limit, shown nowhere on the card yet).
- Not done on GitHub: the dry run of section 4.4 (dispatch needs the workflow on main first): see the card c-artgen1 history for whether it was run after the push.
- Measured: nothing, no xAI call was made. The first paid run is Tom's tap on t-artgen1try.
- Checkout: the workflow checks out only data/art-prompts.json, data/board.json, tools/art-library and .github (not data, tools and art/raw as section 4.2 says; data holds about 100 MB of voice files). The first dry run sat in the checkout step for minutes because art/raw holds every approved picture; reference pictures are read with `git show HEAD:<path>`, which the job already does.

### cardlinks1 (2026-11-20, Sonnet 5.5): built as section 7 says, with these differences

- Files: board.html (`linkList`, `linksHtml`: buttons under Next step on the list card and in the sheet), art.html (`?open=<ids>` with `linkIds`, shared with `?review=`; the opened row gets a gold outline), voices.html (`voiceLink`), music.html (`?track=`), tools/board_check.py (the link rules), tools/cardlinks_test.py (board buttons plus each Library page at 390 px, ids picked from the repo data).
- Voice: `?line=<key>` takes the line's Library key (`d|<voice>|<spoken text>`, the same string `lk()` builds), clears every filter, opens the row and scrolls to it. `?chapter=<n>&show=<name>` sets those filters; `show` is the chip's value (all, none, phone, pending, sent, builtin, old, retake) or its words ("No clip yet"). In a card, voice `ids` is a list of keys (one button each) or one `{chapter, show}` object. Music `ids` gives one button per track.
- An unknown id: art and music show their toast, voices shows one red line above the list. Nothing is left blank.
- Backfill: t-heistart gets its button from `done_when.art_approved` (no field); t-artgen1try (art) and t-ch1starving (voice) carry `links`. The other open Tom cards do not name a Library.
- board_check: a link needs `to` of art, voice or music and non-empty ids; an open Tom card whose next step names a Library must link it. Something is wrong keeps the card, so `links` stay on it (nothing was changed there).
- claude/handoff-rules.md (repo copy; write the same line in the Project copy): one line under "The board".
- Measured: no xAI or ElevenLabs call was made.
