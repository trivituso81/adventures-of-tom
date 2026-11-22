# Battle Guide animation flow: the plan (guideflow-plan, 2026-11-22)

Card `c-guideflow-plan`. A planning session wrote this. It changed no code and started no paid run. The build cards are `c-guideflow-1` to `c-guideflow-9` and the Tom card is `t-guideflow-phone`.

## 1. The answer

| Question | Answer |
|---|---|
| Why does it keep failing? | The page saves a request as a commit on `main`, then guesses what a GitHub job is doing from four different files and its own memory. Every fix so far patched one guess. |
| What changes? | One small status file, `queue.json`, on its own branch `guideq`. Every request is one row in it. Only the job that does the work changes a row's status. The page shows that row and nothing else. |
| What does Tom see? | One status line per request (Queued, Making, Checking, Ready, Failed), the same on every screen and every device, updating by itself every 5 seconds. The result plays in the row the moment it exists. |
| How fast? | A video in about 3.5 minutes instead of 6 (measured today). A picture in about 1 minute instead of 1 minute 49. Four videos at a time and four pictures at a time, in separate lines. |
| What does it cost? | The same service prices as today: $0.15 a picture, $0.50 a family video. No new service, no new account. |
| What is blocked right now? | Fact: the Guide has its own $10 a day limit that Tom never asked for, and 14 of his requests failed on it today. Card `c-guideflow-1` removes it first. |

Terms used below. A **job** is a program GitHub runs for us (GitHub calls it an Action). A **branch** is a separate shelf of files in the repo; `main` is the game, side branches hold working files and are never served to players. **fal** is the paid service that makes the pictures and the family videos. A **take** is one made video waiting for Tom's choice. A **start picture** is the hero redrawn facing left on flat magenta; it is the first and last frame given to the video model and is never drawn in a fight.

## 2. What the investigation found

Sources: the code on `main` at commit f712e2c, the last 30 runs of each of the three workflows plus all 134 real video runs, and the files on the branches `guidegen` and `startpic`. "Fact" means read in a log or file. "Inference" means my reading of the cause.

| # | Finding | Kind | Evidence |
|---|---|---|---|
| F1 | The Guide has its own spending limit of $10 a day (`--day-cap` in `wangen.py`), separate from the one Tom removed in wannoday1. 14 requests failed on it today with "The guide has spent its $10.00 for today already". The day turns over at 4 PM Los Angeles time. | Fact | `takes.json` on `guidegen`: tnb run, amy guard, hit, dodge, ko, victory, run, suite_door_slide takes 3 and 4 |
| F2 | 28 of 38 Guide video runs were cancelled, 4 failed, 6 succeeded. Each tap starts its own run; GitHub keeps one running and one waiting run per line and cancels older waiting ones. The requests survive in the file, but which run makes them is luck. | Fact | Run list of `wan-gen.yml` |
| F3 | A single video took 6 minutes 7 seconds from tap to take (TNB idle, 20:55:56 to 21:02:03 UTC). fal needed 2 minutes 7 seconds. The check needed 51 seconds. The other 3 minutes were the job downloading the whole repo, restoring and re-saving every old video on branch `wangen` twice (79 seconds each time), and installing tools. | Fact | Step times of run 45069196819 |
| F4 | A picture took 1 minute 49 seconds; fal and the checks needed 42 seconds, downloading the repo 52 seconds. | Fact | Run 45075367833 |
| F5 | Use this one took 5 minutes 19 seconds before the publish even started (92 seconds to download the full history). It failed 3 of 6 times. | Fact | Runs of `guide-use.yml` |
| F6 | Status is spread over six places: `data/wan-requests.json` and `data/clip-requests.json` on `main`, `status.json` and `takes.json` on `guidegen`, `startpic-results.json` on `startpic`, and the page's own storage on one device (`aot-guide-pend`, `aot-guide-kept`, `STARTING`). No place holds "failed before it started" or "the job died". | Fact | `loadProgress`, `stageOf`, `doStart` in `battle-guide.html` |
| F7 | `status.json` is never cleared. 19 animations still say "checking", some from 01:48 UTC. The page hides that only because a take exists. A video with no take shows CHECKING until the 90 minute STALLED rule. | Fact | `status.json` on `guidegen` |
| F8 | Every request makes two commits on `main` (the request, then "requests taken"). Each one also starts a skipped run of `wan-gen` and competes with every build push. | Fact | Run list: most `wan-gen` runs are "skipped" pushes |
| F9 | A request refused by the day limit or by "waits for staging" is taken off the list, fails in 2 seconds, and the job then spends 4 more minutes saving nothing. The page hears about it only if the animation's sheet is open. | Fact | Run 45076793655: Make it 2 seconds, total 5 minutes 49 |
| F10 | The picture and Use waits live in a loop inside the open sheet (`doStart`, `waitTake`, `pollUse`). Closing the sheet or reloading ends the wait. The picture's video button needs `data/guide-anims.json` to be republished, then a reload. | Fact | `battle-guide.html` lines 827 to 1030 |
| F11 | 2 of the 2 newest start pictures (Boppy, Olivia) came back facing right and were mirrored. Mirroring reverses lettering (Boppy's cap). Amy faced left. | Fact | `startpic-results.json` on `startpic` |
| F12 | The bulk run and a Guide run both overwrite the money ledger on `wangen` when they end, so one can erase the other's lines. | Fact | Noted in startpics12b, confirmed in the workflow |
| F13 | A broken workflow file (unquoted colon) switched off all video jobs for 10 minutes. Only one test parses one workflow file. | Fact | Run 45077560089; `queue_test.py` line 70 |
| F14 | fal lets an asked video be picked up again by its request number, so a job that dies after paying need not pay twice. Today that number lives only on the runner until the checkpoint step. | Inference from `falq.py` and guidestuck1 | |
| F15 | The token saved in Tom's browser can start a job directly (GitHub calls this a repository dispatch; it needs the same permission the page already uses to save files). | Inference, to be proved free in card 3 | GitHub's rules for tokens |

The nine problems listed in the request are all confirmed. F1, F7, F8, F9 and F11 are new.

## 3. The design

### 3.1 In words

```
Tom taps  ->  page adds one row to queue.json (status: queued)  ->  page pokes GitHub: "work"
                                                                         |
            picture line (4 at a time)   <---  the worker job  --->   video line (4 at a time)
                     |                                                        |
        claims the row (making) -> fal -> checks (checking) -> saves the result -> row: done or failed
                     |                                                        |
                     +---------> every change is written to the row, and the phone is told <--+
                                                                         |
page reads queue.json every 5 seconds on every screen and shows each row as it is

Tom taps Use this one -> row: use wanted -> the apply job takes ALL wanted rows at once
   -> one build, one push to main -> checks the files are really on main -> row: in the game (or the reason)
```

### 3.2 The decisions

| # | Decision | Why |
|---|---|---|
| D1 | One source of truth: `queue.json` on a new branch `guideq`. Nothing else holds status. | One file, one read. Not on `main`, so a request never collides with a build and never starts a skipped run. |
| D2 | Who may write what. The page: add a row, cancel a queued row, mark Use this one, mark Keep the old one. The worker and the apply job: every status change. | The page never guesses. A status is written by the program that just did the thing. |
| D3 | Every write is "compare and swap": read the file with its version, change it, save only if the version is unchanged, else read again (GitHub's file API refuses a stale save with code 409). | Two writers can never overwrite each other. A row can never be claimed twice. |
| D4 | A row is `done` only after its result files are confirmed saved. A Use is `live` only after the files are confirmed on `main`. | No false "done". |
| D5 | Every row being worked on carries the number of the job run working on it. The **reaper** (a check at the start of every worker run, and every 10 minutes) asks GitHub whether that run is still alive. If not: a row that already paid fal is put back in line to be picked up by its fal request number (no second payment), once; anything else becomes `failed` with the reason. | No "making" forever. |
| D6 | The page pokes GitHub to start the worker (repository dispatch). A run is never tied to one request: any run works through everything queued, keeps looking while it works, and stays 2 minutes after the line is empty. | GitHub cancelling a waiting run loses nothing, because the requests are in the file, not in the run. Back to back taps start in seconds. |
| D7 | Two lines in one workflow: `guide-pic` (pictures, uploads) and `guide-vid` (videos). Four at a time in each. The bulk card line `wan-gen-bulk` is not touched. | Pictures never wait behind videos. |
| D8 | The worker downloads only the folders it needs and never restores branch `wangen`. Results go to `guidegen` (takes, start pictures). The fal request number and the cost are written on the row. | Removes about 3 minutes of the 6. Ends the ledger overwrite (F12). |
| D9 | Results reach the game through one batched job, `guide-apply`: it takes every row marked Use at once, cuts and wires them with the existing `use_take.py`, makes one build, and pushes with the existing "start again from the newest main" loop (startpics11). New start pictures ride in the same push. | One push per batch, not per tap. The loop that already works is kept. |
| D10 | A start picture is usable for videos the moment its row is `done`: the worker and the page read it from `guidegen`. It is copied to `main` by the next apply. | No "wait two minutes and reload". |
| D11 | Upload my own start picture: the page saves the file to `guidegen/uploads/`, adds a row of kind `upload`; the picture line runs the free measured checks (no fal, no vision model) and uses the picture exactly as painted. An uploaded picture is never replaced by a generated one unless Tom taps Go back to a generated picture. | CLAUDE.md: Tom's painted frames are used as painted. One set of checks (the tested Python ones), not a second copy in the page. |
| D12 | The Guide's $10 a day limit is removed. The limits that stay: $1 per video request, $0.30 per picture request, and the price on every button. | Tom, wannoday1: "i will manage the limit myself with my balance". |
| D13 | One tap makes one thing; the price is on the button; a queued row has Cancel (free). A batch over $2 asks once. | Simple and fast, with an undo instead of a second tap. |
| D14 | Phone notifications are sent from one place (the function that changes a row), once per change, for: ready, failed, start picture ready, in the game, not in the game. Not for queued, making, checking. Each one opens the Guide at that animation. | Twenty videos should not mean eighty buzzes. |
| D15 | A mirrored picture says so on its row and offers Make another and Upload my own. Why pictures come back facing right is not fixed here (section 12). | Looks are Tom's call; the page gives him the two ways out. |
| D16 | Every workflow file is parsed and checked before any push (`tools/workflow_check.py`, called by `bump_tags.py`). | F13. |
| D17 | Monsters (xAI) go through the same queue and the same worker; only the call that makes the video differs. | One flow for B. |

### 3.3 What the browser can do alone, and what needs a job

| Step | Where | Why |
|---|---|---|
| Show status, play takes, show start pictures | Browser | Reading needs only the GitHub token already in the browser. |
| Add, cancel, mark Use, mark Keep | Browser | Saving one small file. |
| Upload a picture file | Browser | Saving one file to `guidegen/uploads/`. |
| Start the worker | Browser | One call with the same token. |
| Call fal or xAI | Job only | The keys are repo secrets (keysecrets1). They reach only code running on GitHub. |
| Check a picture or video, cut a clip | Job only | Needs ffmpeg and the tested Python checks. |
| Change `main` | Job only (`guide-apply`) | One writer, one batch. |

### 3.4 The fastest path, and what each choice costs

| Path | Picture | One video | 7 poses | Extra cost | Chosen |
|---|---|---|---|---|---|
| Today (commit on `main`, heavy job), measured | 1 min 49 | 6 min 7 | about 25 min when nothing is cancelled | none | no |
| This plan (poke, light job, 4 at a time, checks per video), estimate | about 1 min cold, 45 s warm | about 3.5 min cold, 3 min warm | about 8 min | none | **yes** |
| A small server of our own holding the fal key, estimate | about 45 s | about 3 min | about 7 min | a new account Tom must create, a second home for the keys, and the checks still need a job | no: saves under a minute |
| The browser calls fal itself | about 40 s | about 3 min | about 7 min | breaks keysecrets1 | no |

"Cold" means no worker is running, so GitHub needs about 30 seconds to start one. "Warm" means a worker is already running or left less than 2 minutes ago. The floor is fal itself: about 2 minutes 7 seconds for a 5 second video and 40 seconds for a picture (both measured today), plus about 50 seconds of checks.

## 4. Data shapes

### 4.1 `queue.json` on branch `guideq`

```json
{
 "v": 1,
 "items": {
  "v-body-tnb-run-t2": {
   "id": "v-body-tnb-run-t2",
   "kind": "video",
   "lane": "vid",
   "anim": "body:tnb:run",
   "who": "tnb",
   "take": 2,
   "route": "wan",
   "prompt": "...",
   "promptRev": 1,
   "start": "tnb",
   "note": "",
   "cap": 1.0,
   "at": "2026-11-23T01:02:03Z",
   "state": "making",
   "since": "2026-11-23T01:02:31Z",
   "run": 45100000001,
   "fal": {"endpoint": "...", "request_id": "..."},
   "tries": 1,
   "cost": 0,
   "why": "",
   "do": "",
   "result": null,
   "use": null,
   "left": false,
   "dry": false,
   "replay": ""
  }
 }
}
```

| Field | Meaning |
|---|---|
| `id` | `p-<who>-<stamp>` picture, `u-<who>-<stamp>` upload, `v-<slug>-t<n>` video. The page makes it; adding an id that exists is refused, so a double tap cannot make two rows. |
| `kind`, `lane` | `picture` or `upload` in lane `pic`; `video` in lane `vid`. |
| `state` | `queued`, `making`, `checking`, `done`, `failed`, `cancelled`. |
| `since` | When it entered this state (the worker's clock). The page shows minutes and seconds from it. |
| `run` | The GitHub run working on it. The reaper uses it. |
| `fal` | Written the moment fal accepts the request, before waiting, so a later run can pick it up without paying again. |
| `why`, `do` | On `failed`: the plain reason and the one thing to do (section 6). |
| `result` | Picture: `{path, mirrored, own, checks, main}`. Video: `{n, js, img, frames, kb, words, gate}` (what `takes.json` holds today). |
| `use` | `null`, or `{state: "wanted" | "applying" | "live" | "failed", at, since, build, why}`. |
| `left` | Tom chose Keep the old one. |
| `dry` | Make nothing, spend nothing, walk every state (tests). |
| `replay` | The path of a video already paid for; the worker uses it instead of calling fal (free test of the real checks). |

Rows finished more than 7 days ago move to `queue-archive.json` on the same branch (the worker does it), so `queue.json` stays far below GitHub's 1 MiB limit (bigboard1).

### 4.2 What stays on `guidegen`

`takes/<slug>/t<n>.*` and `takes.json` (written by `make_take.py` and `keep.py` as today; the page reads the clip files from here), `startpics/<who>-hero.png` (new), `uploads/<who>-<stamp>.png` (new), `use-report.json`.

### 4.3 State changes allowed

| From | To | Who | When |
|---|---|---|---|
| (none) | queued | page | Tom taps |
| queued | cancelled | page | Tom taps Cancel |
| queued | making | worker | claimed with compare and swap; `run` set |
| making | checking | worker | fal returned a file (pictures and uploads go straight from making to checking) |
| checking | done | worker | result files confirmed on `guidegen` |
| making, checking | failed | worker or reaper | section 6 |
| making, checking | queued | reaper | the run died, the row has a fal request number, `tries` is 1 |
| done (video) | use wanted | page | Tom taps Use this one |
| use wanted | use applying, then live or failed | apply job | section 3.2 D9 |

Any other change is refused by `store.py` and is a test failure.

## 5. Screens and exact words

One rule: a request shows the same line in three places: on its row in the Animations list, inside its sheet, and in Activity.

### 5.1 The status line

| State | Line | Buttons |
|---|---|---|
| queued, nothing ahead | `Queued. Starts in under a minute.` | Cancel (free) |
| queued, N ahead in its line | `Queued. N ahead of it.` | Cancel (free) |
| queued over 90 seconds with no worker | `Queued. GitHub is slow to start. It will start by itself.` | Cancel (free) |
| making, picture | `Making the picture. About 1 minute. 0:42` | none |
| making, video | `Making the video. About 2 minutes. 1:10` | none |
| checking | `Made. Checking it. About 1 minute. 0:20` | none |
| done, video | `Ready. Watch it here.` (the take plays beside the current one) | Use this one, Make another ($0.50), Keep the old one |
| done, picture | `Start picture ready.` | Make another ($0.15), Upload my own |
| done, picture, mirrored | `Start picture ready. It faced right, so it was flipped. Lettering and anything worn on one side are now reversed.` | Make another ($0.15), Upload my own |
| done, upload | `Your picture is in use, exactly as you made it.` | Upload a different one, Go back to a generated picture |
| failed | `Failed: <why> <do>` | the one button named in section 6 |
| cancelled | `Cancelled. Nothing was spent.` | none (the row leaves Activity after a minute) |
| use wanted or applying | `Putting it in the game. About 4 minutes. 1:05` | none |
| use live | `In the game (build <name>). Close and reopen the game to see it.` | none |
| use failed | `Not in the game: <why> Tap Use this one again.` | Use this one |

The clock at the end counts by itself. Nothing on any screen says "reload", "refresh" or "keep this page open".

### 5.2 A person's Animations screen

| Part | What it shows |
|---|---|
| Top | The person's start picture, small, with its status line. One action: `Make the start picture ($0.15)` when there is none, plus the link `Upload my own`. |
| Standard poses | Idle, Guard, Hit, Dodge, Knocked out, Victory, Running. Each row: name, the status line or VIDEO or NO VIDEO YET, and one button `Make this video ($0.50)`. Above the list: `Make all N missing poses ($X.XX)`. |
| Moves, Attacks, Wind-ups | Same rows. |
| No start picture yet | The video buttons are replaced by one line: `Needs the start picture first.` |

### 5.3 The sheet of one animation

Player on top (as today). Then the status line. Then the one action for its state (section 5.1). The prompt, Update the prompt and Send a note to Claude stay below, unchanged.

### 5.4 Activity (new, the bar at the top of every Guide screen)

| Part | Words |
|---|---|
| Bar, something active | `3 making, 2 queued, 1 ready` (tap opens Activity) |
| Bar, nothing active | hidden |
| Activity list | Newest first, last 24 hours: name (`TNB: Running`), the status line, its buttons. Tapping the name opens the sheet. |
| Empty | `Nothing is being made.` |

### 5.5 Upload my own

| Step | Words |
|---|---|
| Button | `Upload my own` opens the phone's file picker. |
| Before sending | `Use this picture for every video of <Name>? It is used exactly as it is.` with the picture shown. Buttons: `Use it`, `Cancel`. |
| Refused at once (free, in the page) | `That file is not a picture.` or `That picture is too small. It needs to be at least 600 pixels tall.` or `That file is over 8 MB.` |
| While checked | `Checking your picture. About 30 seconds. 0:12` |
| Refused by the check | One of the upload lines in section 6. |

### 5.6 Phone notifications

| Event | Title | Text |
|---|---|---|
| Video ready | `TNB: Running is ready` | `Tap to watch it.` |
| Picture ready | `Boppy: start picture ready` | `Tap to look at it.` (adds `It was flipped.` when mirrored) |
| Failed | `TNB: Running failed` | `<why> <do>` |
| In the game | `TNB: Running is in the game` | `Close and reopen the game to see it.` |
| Not in the game | `TNB: Running is not in the game` | `<why> Tap Use this one again.` |

Each opens `battle-guide.html#anims/<who>/<animation id>`.

## 6. The failure table

"Auto" means the system tries again by itself, once, before Tom hears of it.

| # | Failure | How it is detected | What Tom sees (`why` then `do`) | Next | Auto |
|---|---|---|---|---|---|
| X1 | The save of a tap fails (no signal, GitHub down) | The save call returns an error | In the page, at the button: `Could not send. Nothing was made. Tap again.` | Nothing queued | no |
| X2 | This browser has no GitHub token | No token stored | `This browser is not signed in to GitHub. Open the Board, tap the three dots, paste the token, then come back.` | Nothing queued | no |
| X3 | The poke fails or GitHub is slow to start | Row still queued after 90 seconds | The slow line of 5.1 | The page pokes again every 2 minutes; the 10 minute timer starts a worker anyway | yes |
| X4 | Two taps on the same thing | The id already exists | Nothing new; the row is already there | none | n/a |
| X5 | fal refuses: out of credit | fal answers with its balance error | `fal is out of credit. Add credit at fal, then tap Try again.` | Rows still queued stay queued and the worker stops claiming | no |
| X6 | fal refuses or errors, no video | fal error or no file | `The video service returned no video. Nothing was spent. Tap Try again.` | failed | yes, once |
| X7 | fal is too busy (limit of requests at once) | fal answers 429 | Stays `Queued` | Claimed again as slots free | yes |
| X8 | The worker run dies or GitHub loses the runner | Reaper: the row's `run` is finished but the row is not | Nothing if it recovers. Else: `The job stopped before it finished. Tap Try again.` plus `The video was paid for and is kept; Try again costs nothing.` when a fal number is on the row | Back in line once by its fal number, then failed | yes, once |
| X9 | The video hardly moves | `make_take.py` status `still` | `The video hardly moves. Change the prompt, then tap Make another.` | failed, video kept | no |
| X10 | The clip gate holds the take | `gate.hold` | The take is shown as Ready with the gate's words in red above it | done; Tom decides | no |
| X11 | Picture fails a measured check | `startpic.py` `judge_picture` | `The picture came back <reason>. Tap Make another.` (reasons: with a background that is not flat magenta, cut off at the edge, too small in the frame) | failed, cost shown | yes, once, within the $0.30 limit |
| X12 | Picture faces right | Facing check | Mirrored, done, the flipped line of 5.1 | done | n/a |
| X13 | Upload: background not flat magenta and not see-through | Measured check | `The background is not one flat magenta. Paint the background plain magenta, or send a picture with a see-through background, then tap Upload my own.` | failed | no |
| X14 | Upload: figure touches an edge | Measured check | `The figure touches the edge of the picture. Leave a little empty space on every side, then tap Upload my own.` | failed | no |
| X15 | A move waits for staging | `staging_waits` | The button is not shown; the row says `This move is being rebuilt in layers. It cannot be made yet.` | Never queued | n/a |
| X16 | Result saved but the save to `guidegen` fails | `keep.py` returns 1 | `It was made but could not be saved. Tap Try again; it costs nothing.` | failed with the fal number kept | yes, once |
| X17 | Use: `main` keeps moving | The push loop fails 6 times | `GitHub was too busy to save it.` | use failed | yes: the apply job starts itself once more |
| X18 | Use: the take cannot be cut | `use_take.py` reports it | `The take could not be cut: <its reason>. Send a note to Claude from this sheet.` | use failed, Claude card as today | no |
| X19 | Use: pushed, but a file is not on `main` | The check after the push | `It did not reach the game.` | use failed | yes, once |
| X20 | A workflow file is broken | `workflow_check.py` in `bump_tags.py` | Never reaches GitHub | The session fixes it before pushing | n/a |
| X21 | `queue.json` is unreadable | The page's read fails 3 times | Bar: `Cannot read the status right now. Trying again.` Old rows stay on screen, greyed. | The page keeps trying | yes |
| X22 | The request's own limit is below the price | Worker compares before sending | `This costs more than its limit. Send a note to Claude from this sheet.` | failed, nothing spent | no |

Every `failed` row has exactly one button: Try again (free when a fal number is kept, otherwise the price is on it), Make another, or Upload my own, as the line says.

## 7. The test plan (no money is spent by any of these)

| Test | File | What it proves |
|---|---|---|
| T1 Store rules | `tools/guidegen/store_test.py` | Every allowed change of 4.3 works; every other change is refused; two writers racing never lose a row or claim one twice (a stand-in GitHub that returns 409); a second add of the same id is refused; archive after 7 days. |
| T2 Reaper | same | A dead run with a fal number goes back in line once, then fails; without a number it fails; a live run is left alone. |
| T3 Notifications | same | Exactly one message per change of D14, none for the others (`NOTIFY_OFF` and a recording stand-in). |
| T4 Worker, pictures | `tools/guidegen/worker_test.py` | With a stand-in fal: queued to done; mirrored; a failed check retried once; out of credit stops claiming; four at a time; a new row added while working is picked up; `dry` walks every state and calls nothing. |
| T5 Worker, uploads | same | A good upload is used byte for byte; X13 and X14 give their lines; no fal and no vision call is made (the stand-ins fail the test if called). |
| T6 Worker, videos | same | queued to done with a real stored video through the real `make_take.py`; X6, X7, X8, X9, X16; picking up by fal number pays once (the stand-in counts calls). |
| T7 Workflow files | `tools/workflow_check.py` (also run by `bump_tags.py` and `smoke.py`) | Every file under `.github/workflows/` parses; `concurrency.group` is a quoted string; a paid job's `concurrency` is on the job (wanstuck1). |
| T8 Page | `tools/battle_guide_test.py` (new cases G1 to G12) | With the stand-in GitHub the page already uses (`?gh=`): each line of 5.1 for each state, word for word; the line changes with no reload when the file changes; it survives a reload and another tab; the take plays when `done` arrives; the video button appears when the picture row is `done`; Cancel; double tap; X1, X2, X3, X21; no "reload" or "refresh" text anywhere; portrait and landscape pictures. |
| T9 Apply | `tools/guidegen/apply_test.py` | Three wanted rows become one commit with one build; `main` moving during the push still lands; a file missing after the push gives X19; nothing is `live` before the check. |
| T10 Old path gone | `tools/guidegen/purge_test.py` | No reference to the deleted files and names (section 9) anywhere in the repo. |
| T11 Free run on GitHub itself | Card 9 | One `dry` picture row, one `replay` video row (a stored paid video) and one upload row go through the real workflows on GitHub: poke, claim, every state, notification, result on `guidegen`. Then the replay take goes through `guide-apply` with `dry` (everything but the push). Run ids and frames go in docs/CHANGES.md. |

The first paid run is Tom's tap in the phone check (card `t-guideflow-phone`): one picture, $0.15.

## 8. Cost and speed numbers

| Thing | Price | Limit that stays |
|---|---|---|
| Start picture (fal Nano Banana 2.1) plus the facing check | $0.15 plus a few cents | $0.30 a request (one automatic retry fits) |
| Family video (Wan 3.0, 5 seconds, 720p) | $0.50 | $1.00 a request |
| Monster video (xAI Grok lite, 3 seconds, 480p) | at most $0.15 | $0.15 a request |
| Upload my own | free | none |
| Use this one | free | none |
| GitHub jobs | free (the repo is public) | none |

| Stage | Today, measured | Target | Page shows |
|---|---|---|---|
| Tap to worker started | 4 s to 15 min | 30 s cold, 5 s warm | Queued |
| Picture at fal plus checks | 42 s | 42 s | Making the picture |
| Video at fal | 2 min 7 s | 2 min 7 s | Making the video |
| Video checks and preview | 51 s, after all videos of the run | 51 s, per video as it arrives | Made. Checking it. |
| Saving the result | 3 min (two saves of all old videos) | 20 s | still Checking |
| Use: tap to on `main` | 5 min 19 s | about 3 min | Putting it in the game |
| Publish to the phone | about 2 min | about 2 min | In the game |

Inference: fal's limit on requests at the same time for this account is not known. Four is what the code uses today. X7 covers a lower limit.

## 9. Keep, change, delete

| Part | Verdict | Why |
|---|---|---|
| `tools/art-library/falq.py` (talking to fal) | Keep | Works. Shared with the Art Library. Never copied. |
| `startpic.py`: measured checks, facing check, mirror | Keep | Tested (S1 to S10). The worker calls them. |
| `startpic.py` `publish` (push to `main` per picture) | Change | The picture goes to `guidegen/startpics/`; `guide-apply` copies it to `main`. |
| `wangen.py` `run_one`, the pool of 4 | Keep | Works. The worker calls it. |
| `wangen.py` `run_guide_requests`, `--requests`, `--startpics`, `--day-cap`, `next_guide_run`, the pictures-first deferral | Delete (card 9; the day limit in card 1) | Replaced by the worker. |
| `wangen.py --bulk`, `wanbulk.py`, `wanqa.py`, `wanbake.py`, the `wan-gen-bulk` line | Keep, untouched | Board cards' bulk videos are a different flow and are not part of this plan. |
| `make_take.py` (clip gate, preview), the take gate | Keep | Works. Called per video instead of after all. |
| `keep.py` | Keep | Safe save to `guidegen`. |
| `use_take.py` | Keep | Works. Called by `guide-apply` for a batch. |
| The push loop of `guide-use.yml` (startpics11) | Keep, moved into `guide-apply.yml` | It is the part that made Use work. |
| `guide-use.yml`, `data/guide-use.json` | Delete (card 7) | Replaced by `guide-apply.yml` and the `use` field. |
| `startpic-gen.yml`, `data/startpic-requests.json`, branch `startpic` | Delete (card 9) | Replaced by the picture line. |
| The guide mode of `wan-gen.yml`, the sweep step, `data/wan-requests.json` | Delete (card 9) | Replaced by the video line. `wan-gen.yml` keeps bulk and manual jobs. |
| `progress.py`, `status.json` | Delete (card 9) | Status is the row. |
| `gqueue.py` | Keep | `guide-reconcile` still uses it. |
| `tools/notify.py`, `data/notify.json`, the ntfy card on the page | Keep | Works. Called from one place now. |
| Page: `loadProgress`, `stageOf`, `stageBadge`, `watchProgress`, `queueLine`, `doStart`'s loop, `waitTake`, `pollUse`, `STARTING`, `GPEND`, `GKEPT`, STALLED | Delete (card 5 and 7) | Replaced by one reader of `queue.json`. |
| Page: the player, the take comparison, Update the prompt, Send a note, `GW` (a kept prompt) | Keep | Not part of the problem. |
| Page: the two step "Yes, spend" boxes | Change | Price on the button and Cancel while queued (D13). |
| `data/guide-anims.json` and `build_map.js` | Keep | Still the list of animations. The page lays `queue.json` over it for start pictures. |
| `tools/videohist/publish.py` step | Change | Runs once in `guide-apply`, not after every video. |
| `tools/costlog.py` | Keep | The worker logs each run once at its end. |

## 10. Order of work

| # | Card | Build | What it does | Model | Starts by itself |
|---|---|---|---|---|---|
| 1 | `c-guideflow-1` | guideflow1 | Removes the $10 a day limit. Adds the workflow check. | Sonnet 5.5 medium | yes |
| 2 | `c-guideflow-2` | guideflow2 | The status store and its rules, reaper, notifications. | Sonnet 5.5 medium | yes |
| 3 | `c-guideflow-3` | guideflow3 | The worker and its workflow, picture line, uploads check, the poke. | Sonnet 5.5 medium | yes |
| 4 | `c-guideflow-4` | guideflow4 | The video line. | Sonnet 5.5 high | no, one paste |
| 5 | `c-guideflow-5` | guideflow5 | The page reads and writes the queue: lines, Activity, one tap, Cancel. | Sonnet 5.5 high | no, one paste |
| 6 | `c-guideflow-6` | guideflow6 | Upload my own. Make all missing poses. | Sonnet 5.5 medium | yes |
| 7 | `c-guideflow-7` | guideflow7 | The batched apply job and the Use lines. | Sonnet 5.5 medium | yes |
| 8 | `c-guideflow-8` | guideflow8 | Monsters through the same queue. | Sonnet 5.5 medium | yes |
| 9 | `c-guideflow-9` | guideflow9 | Deletes the old path, runs the free test on GitHub, hands Tom the phone check. | Sonnet 5.5 medium | yes |
| 10 | `t-guideflow-phone` | | Tom's one phone check. | | |

The old flow keeps working until card 5 switches the page for pictures and family videos, card 7 for Use and card 8 for monsters. Card 1 is first because it is the one thing failing every request today and it is a one line change.

## 11. Where each requirement is delivered

| Requirement | Plan section | Card |
|---|---|---|
| A. Start picture from the hero, and upload my own | 3.2 D10, D11, D15; 5.2; 5.5; 6 X11 to X14 | 3 (make, check), 6 (upload screen) |
| B. Every animation as video | 3.2 D7, D17; 5.2 | 4 (family), 8 (monsters) |
| C. Any number at once, queued, nothing dropped | 3.2 D1, D3, D5, D6, D7; 4.3 | 2, 3, 4 |
| D. One true status, everywhere, no refresh | 3.2 D1, D2, D4, D5; 5.1 to 5.4 | 2 (store), 5 (page) |
| E. Phone notification on each change that matters | 3.2 D14; 5.6 | 2 |
| F. Use this one is true, no collisions on `main` | 3.2 D4, D9; 6 X17 to X19 | 7 |
| G. Simple and fast, with the costs | 3.3, 3.4, 5, 8 | 1 (unblock), 3, 4, 5 |
| H. Tests without money, and a dry first run | 7 | every card; T11 in 9; the first paid tap in `t-guideflow-phone` |

## 12. Out of scope

| Thing | Why not here |
|---|---|
| Why 2 of 3 start pictures come back facing right | A prompt change that can only be proved with paid tries. The store now counts `mirrored`, so a later card has evidence. Upload my own and Make another cover it meanwhile. |
| Boppy's reversed cap lettering | Tom's call on the phone check: Make another or Upload my own. |
| Update the prompt (`guide-reconcile`) | Works by its own request file and a 5 minute wait in the sheet. Not named in the requirements. A later card can move it to the queue. |
| Bulk videos from board cards (`wan-gen` bulk, wanauto1) | A different flow with its own checks and cards. Untouched. |
| The Art Library's pictures and clips | Untouched. |
| A server of our own | Section 3.4: under a minute saved for a new account and a second home for keys. |
| A kept prompt living only on one device (`GW`) | The prompt travels with the request, so a made video is never wrong. Moving the draft to the queue is a later card. |
