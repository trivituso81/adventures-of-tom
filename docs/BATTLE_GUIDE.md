# Battle Guide (builds `battleguide1` and `battleguide2`, 2026-11-21)

`battle-guide.html`, ADMIN > Battle system > Battle Guide. Tom's reference for the new battle system ("Battle 3", docs/BATTLE3.md) while he tests, and the place he plays a battle animation and sends Claude a note on it.

## What it shows and where it comes from

| Tab | Shows | Source |
|---|---|---|
| Rules | Cheat sheet, turn bar, Pep, flavors and Primes, Detonations, Composure, damage and caps, rows and aim, Family Ruckus, Vibes and Ranks, the game's tips, the Lab's test fights | Words in `rulesTopics()` in the page; every number from `B3_RULES`, `B3_DETONATIONS`, `B3_LEANS`, `B3_STORY.tips`, `B3_LAB` |
| Family | Each member: who they are, their Vibes, Lean, titles, Trait, Basic, Skills, Capstone, Quirks, counter, body animations | `B3_CAST`, `B3_VIBES`, `B3_SKILLS`, `B3_TRAITS`, `B3_QUIRKS`; the one-liners are `WHO` in the page |
| Monsters | By chapter: stats, pips, Pet Peeves, resists, what it starts with, every attack and when it uses it, the Lab fights it is in | `B3_FOES`, `B3_FORMATIONS`, `B3_LAB` |
| Statuses | Every status, Prime, stance, mark and hazard, with who uses it | `B3_STATUS`, `B3_HAZARDS` |
| Animations | A PLAN at the top (animplan1: Making, Next, Done counts and rows, from `data/guide-anims.json`, `wangen-jobs.json` and open `c-wanstop` cards); per person and monster: body states, moves, attacks, wind-ups; VIDEO or NO VIDEO YET (wanch2a: no painted poses are left); NOTE OPEN when a card is open | `B3_BODY_CLIPS`, `B3_VIDEO_ONLY`, each row's `anim`, each act's `wind`, the clip files named in `index.html` |

The page loads no engine. `boot()` reads `index.html`, takes its `data/b3-*.js` script tags in order and adds them to the page, so the guide is whatever the game is. Clip data files (`data/clips/<id>.js`) call `bclipDefine`; the page has its own one-line version and loads a clip's file and picture only when it is played.

When the data gains a value the page has no plain words for, it shows the raw word with underscores removed. Add the words to the tables at the top of the script: `TARGET`, `HITS`, `TAG`, `ROLE`, `STATE`, `LEAN_PLAY`, `whenWords`. A new family member gets a line in `WHO`.

## See it in a fight (battleguide2)

Every family move (Basic, Skills, Capstone) and every monster attack has an **In a fight** button beside Play. It opens the game at a Battle Lab fight on the new battle with that move used first, then the fight is the player's. It starts a real fight and judges nothing: no animation is built, tuned or reviewed by it (CLAUDE.md, battle animations are out of scope for the battle system).

| Part | What it does | Where |
|---|---|---|
| The address | `index.html?go=new&i=<Battle Lab fight number>&move=<move id>` or `&act=<monster id>:<act id>` (`go=new` and `i` already existed: battle-lab.html uses them) | `splashGoTool` in `engine/splash.js` passes `move` and `act` to `b3LabFirstOpt` in `engine/b3-lab.js` |
| Which fight | The page picks the first `B3_LAB` fight whose family holds the move's owner; for an attack, the first fight whose formation holds that monster (`fightMove`, `fightAct` in the page). A monster that only appears called in by another (Acorn Cache) has no fight, so no button. A reaction ("hits whoever just hit it") has no button: it cannot go first | `battle-guide.html` |
| The owner can use it | `b3LabFirst` makes the move usable: the move's Vibe becomes Main when the move is a Basic or the Vibe is in neither slot (a Vibe already in the Pocket stays there), and that Vibe is raised to the Rank that unlocks the move's slot (`B3_RULES.rankUnlock`, VP from `B3_RULES.rankVp`). Nothing else in the Lab's loadouts changes; Rose Mode keeps these loadouts (`cfg.keepLoadout`) | `engine/b3-lab.js` |
| First turn | `cfg.first` goes to `b3FirstSet` (the owner starts with wait 0 so they are first on the bar) and `b3FirstTurn` (on their first turn it uses the move on the first allowed target, tops Pep up to its cost if needed, and clears itself, so it happens once) | `engine/b3-ui.js` |
| A monster attack | `b3FoePick` takes `e.force` once: the monster starts at wait 0 and uses that act. An attack that is the second half of a wind-up (`then`) starts with the wind-up, so the attack follows on its next turn | `engine/b3-foe.js` |
| Not a fit | An owner or monster not in the fight, or a move that cannot be used, starts the fight plainly with `cfg.first` cleared | |

## Planned, not built yet (battleguide2)

Everything the battle plan has and the game does not is shown in one look: a dashed gold border, the badge **PLANNED**, and the words *not in the game yet*. It never has a Play or In a fight button and is never mixed with what can be tested: planned monsters are under their own Chapter heading below the built ones, a planned Vibe is a dashed button after the person's real Vibes, and the Rules tab has the topic **What is coming**. Search has a **Planned** chip beside All; Planned alone lists every planned thing (with no words typed) or only the planned ones that match.

**Where the list comes from.** `claude/` is not published on the game's site, so `python3 tools/guide_planned.py` reads the plan documents and writes `data/guide-planned.json`; the page loads that file and never types a planned thing itself. The script stops when a document no longer says what a row quotes (`anchors`), reads all 30 Vibes whole (it stops if any is missing a Trait, Basic, three Skills, two Quirks or three titles) and records a hash of each source (`--check` fails when one changed: run the script again).

| Planned item | Built from | The game's side it is compared with |
|---|---|---|
| The 10 third Vibes (name, titles, Lean, Trait, Basic, Skills with Pep and Rank, Quirks with Rank, as the spec words them) | `claude/battle-spec-v11.md` section 3 (30 Vibes) | The Vibes in `B3_CAST` (matched by name for that person) |
| 26 monsters and bosses of chapters 11 to 20 (stats, Pet Peeves, resists, notes and every act as the bestiary words them) | `claude/bestiary-v11.md` section 2. v11 replaces `bestiary-v10.1.md` (the old name in the card): the chapters, ids and numbers differ | `B3_FOES` (by monster id). The four bonus-chapter monsters are already in the game, so they are not listed |
| Moves a kit names that have no row yet | the game itself: `B3_SOON` and each Vibe's `skills` list (empty today) | `B3_SKILLS` |
| BAG command and Run; knocked-out members stand up at 1 HP after a win; gear counts in fights | `claude/battle-architecture.md` (gap table rows 25, 26, 30, 31 and section 4.2), `claude/battle-spec-v11.md` section 2.9; the game: the BAG button says Not yet, `b3sEnd` hands HP back as a share | Keys the rules would gain (`B3_RULES.bag`, `winStandHp`, `gear`) or a global (`B3_GEAR`) |
| Tombo skins on the Full Family Ruckus (stage 16) | `claude/battle-architecture.md` section 3 and stage 16; `docs/BATTLE3.md` (Tombo toasts) | `B3_SKINS` or `B3_RULES.skins` |
| Casual Mode | `claude/battle-spec-v11.md` section 1 | A Vibe named Casual or Freelancer, `B3_RULES.casual` |
| Helper links, the Twin Lenses stances, boss phase lines, picking the four again in the last fight, the Part 1 monsters coming back | `claude/bestiary-v11.md` sections 1.1, 3, 6 and chapters 14, 17, 20; `claude/battle-spec-v11.md` section 2.1 | A chapter (13, 17, 14, 20) in `B3_STORY.chapters` |
| Chapters 11 to 20 and the bonus chapter (which play on the new battle and which do not) | `claude/bestiary-v11.md` chapter headings; `B3_STORY.chapters` is what plays on the new battle today | `B3_STORY.chapters` |
| Stages 16, 19 to 21, 22 and 23 in plan order | `claude/battle-architecture.md` section 5 (stages 1 to 15, 17 and 18 are built) | Same rules as the rows above; stage 23 is done when no `engine/battle2*` script is in `index.html` |

Also read, and nothing taken from them that the rows above do not hold: `claude/battle-build.md` (the open items in it that name something not built are Boppy's third Vibe, Tom's Cake and TNB's Kintsugi enchantments and TNB's Spooked status, all of them part of the third Vibes) and the Not built columns of `docs/BATTLE3.md`. Not listed on purpose: animations (the guide's NO VIDEO YET already says it), and anything that has no source line in a plan document.

**How an item drops out by itself.** Each item carries a `when` rule (`any`, `all`, `vibeName`, `vibeCount`, `allVibes`, `vibeMatch`, `foe`, `chapter`, `rules`, `global`, `noScript`). `built()` in the page checks it against the game's own `data/b3-*.js` (and `index.html` for `noScript`) every time the guide opens, so a third Vibe in a person's `data/b3-kit-<id>.js`, a monster in `data/b3-foes-*.js` or a chapter in `B3_STORY.chapters` makes the planned one disappear and the real one show, with no change to the page or to `data/guide-planned.json`. Run the script again only to tidy the file or after a plan document changed. A session that adds something the plan listed: check the rule it carries still means "built" (the `when` is in the JSON); a new planned thing that the plan documents gain goes into `FEATURES` or `STAGES` in `tools/guide_planned.py` with its source line.

## Layouts (docs/DUO.md sizes)

| Pose | Page | Layout |
|---|---|---|
| Folded upright | 466 x 657 | One column, tab bar at the bottom, a tap slides the detail over the list, Back returns |
| Folded sideways | 678 x 445 | The same, thinner header and tab bar |
| Unfolded sideways | 951 x 648 | Tabs on top, list on the left (34%, 230 to 340 px), detail on the right; the player is a centred panel |
| Unfolded upright | 669 x 869 | The same two panes |

The switch is `(min-width:560px) and (min-height:560px)`. The address keeps the place: `#family/tom`, `#monsters/bigone`, `#glossary/toasty`, `#anims/tom`, and `#anims/move:lounge_pass_flex` opens one animation's player (a board card can link to it).

## The player

Draws frame `i` of a clip from its packed picture: `rects[i]` is x, y, w, h in the picture and ox, oy inside the full frame (`w*k` by `h*k`). A loop plays forward and back (forward only when `wrap`); a one-shot plays, holds 0.7 s and repeats. `impact` is the frame the hit lands on (the HIT flag). Controls: Pause, frame slider, 1x, half, quarter.

## A note becomes a card

Send to Claude writes `data/board.json` on `main` through GitHub with the token the Board page saved on the device (`aot-gh-token`), the same read, change, write and retry as `board.html` (`ghBoard`, `saveBoard`).

| Field | Value |
|---|---|
| `id`, `tag` | `c-anim-<clip or move>-<4 characters>`, tag the same without `c-` |
| `lane`, `col`, `theme` | claude, up, Battle Animations |
| `anim` | `{id, owner, ownerName, name, kind, clip, painted, what}`; `id` is `body:<owner>:<state>`, `move:<skill id>`, `act:<foe>:<act>` or `wind:<foe>:<act>` |
| `notes` | `[{at, words, build}]`, his words and the game build he was on |
| `prompt` | Opus 5.5 (row D), medium, the full text: read the rules and claude/video-battle-plan.md, make it again as a video by the smallest change, check it before Tom sees it, at most $3, end with a Tom card (ask animations) that sends him back to the guide |

A second note on an animation whose card is still Up next and not started is added to that card and its prompt is rewritten. The commit is `board: animation note <anim id>`. A session working such a card follows the card's prompt and the standing rules in CLAUDE.md (No painted poses in battle, Fix a miss with the smallest change).

## Making a video from the guide (guidegen1, card c-guidegen)

Open an animation (Animations tab). Under the player the sheet shows its prompt, what it came from, what a try costs and what is missing; no key is ever typed on the page. Every tap is a request committed to `main` with the token the Board saved (`aot-gh-token`); a GitHub Action reads it with the repo secret and answers on the branch `guidegen` (never merged, never served), which the page reads every 5 seconds.

| Step | What the page does | Request file and message | Action | Where the answer is |
|---|---|---|---|---|
| The prompt | shows the animation's prompt: its job or entry prompt when it has a video, otherwise a DRAFT (the same person's approved prompt with only MOTION new). Someone with no start picture says what is missing and cannot be made | `data/guide-anims.json`, built by `node tools/guidegen/build_map.js` (346 animations) | none | the file |
| Update the prompt | a note ("What should change" with a video, "Anything to add" without) is folded into the prompt with the smallest change; Kept / Changed / Could not use are shown; a question comes back when the note is vague or contradicts itself; a note no wording can carry says so | `data/guide-reconcile.json`, `guide: reconcile <id>` | `guide-reconcile`, xAI text model, secret `XAI_API_KEY`, about a cent | `reconcile/<slug>.json` |
| Make this video (guideflow5) | A family member: one tap, the price on the button (`Make this video ($0.50)`, `Make another ($0.50)` when it has one), no confirm box. The page adds ONE row to `queue.json` on branch `guideq` (`v-<slug>-t<n>`, kind video, lane vid, route wan; `n` is one above the highest take in `takes.json` and in the queue) and pokes the worker. A monster keeps its old button, the two-tap ask and the old path until card 8: Wan 3.0 (5 s, 720p, $0.50, cap $1 a request, no daily limit) for a family member; xAI Grok lite (3 s, 480p, $0.07, cap $0.15) for a monster | family: `queue.json` on `guideq`, commit `guide: add <row id> [skip ci]`, then `POST /repos/<repo>/dispatches {"event_type":"guide-work"}`; monsters `data/clip-requests.json`, `clip: generate guide <id>` (a request with a `guide` field) | family: `guide-work` (`tools/guidegen/worker.py`); monsters `clip-gen` | the row's `state` and `result`; `status.json` is no longer read |
| Compare | the new take plays next to the clip now in the game (or "No video yet"), cut exactly as the game would play it, with the clip gate's words (`hold.py`: measured checks, then the vision questions that hold) | none | none | none |
| Use this one | asks first ("This changes the game"), then sends | `data/guide-use.json`, `guide: use <id>` | `guide-use` (`tools/guidegen/use_take.py`) | `use-report.json`, the commit on `main`, the build `guideuse-<run>` (card 7 moves this to the row: `qUseWanted` is built and waits to be turned on) |
| Try again with a note | an older take with no row goes to the note box; the next Make carries the note. A failed row shows Try again (free when the row has a fal request number) | as Make | as Make | as Make |
| Keep the old one | a take made from a row writes `left: true` on the row (the take then shows as left alone and the animation is back to its Make button); a take with no row (older, or a monster) is remembered in this page only | `queue.json`, `guide: left <row id> [skip ci]` | none | the row |

**Family moves wait for staging (movestage1, 2026-11-22).** A family move is now three layers: a body video of the person acting, the stage the engine draws across the battlefield, and for a Capstone a set piece (`claude/move-staging-plan.md`). A family move with a staging row in `data/b3-stage.js` shows its body prompt (from the Wan job the row names), a chip with its ladder step and time budget, and Generate as before. A family move with no row shows **Waits for staging** with one line why, on the sheet and as a badge on the list: no Generate and no Update the prompt; its video, if it has one, still plays. Its model or rule draft shows under OLD DRAFT, NOT FOR USE (kept in `data/guide-prompts.json` with `notForUse`). The `wan-gen` Action refuses a request for a move that waits (`staging_waits` in `tools/art-library/wangen.py`) and the `guide-draft` Action never drafts one. Body states and monsters are unchanged. Test: `python3 -I tools/movestage_test.py`.

The Action never approves a take. A take is `new`, `still` (the video hardly moves, so there is nothing to cut) or `failed` (nothing came back; no charge). Per animation the sheet shows the prompt version, takes made and dollars spent (`takes.json`).

**Where a new video is.** The stage labels of guidestatus1 (REQUESTED, IN LINE, MAKING, CHECKING, READY TO REVIEW, STALLED), their 15 second look at the request files and `status.json`, and `tools/guidegen/progress.py` are gone for family videos and pictures: the row in `queue.json` is the one status (section "The page and the queue (guideflow5)" below). A monster video is still tracked by this page only through its take arriving in `takes.json` (the wait line shows after the tap and is lost on a reload; card 8 moves monsters to rows).

**Stop rule.** Generate refuses, sends nothing and offers the note box to Claude when the last two takes were held by the clip gate for the same fault (`stop` in `takes.json`, set by `make_take.py`; a take that passes clears it) or when the new try's note shares half its words with the note of the try before (the page, `stopFor`). A family tap that is stopped saves no row and says `Stop here. <why>` under the button, with the note to Claude filled in. Two misses the same way is the stop-loss in CLAUDE.md.

**What Use this one changes** (`use_take.py`, no paid call): the take's video is kept as `art/raw/clips/wan-<job>-v<rev>.mp4` (family; the job in `tools/art-library/wangen-jobs.json` goes to rev + 1 with the prompt in `tools/art-library/prompts/wan-<job>-v<rev>.txt`) or `art/raw/clips/clip-<id>-v<n>.mp4` (monster; a new version of the entry in `data/art-prompts.json`, `promptRev` raised, status approved, a new entry when it had none); `tools/clip-bake/bake_clip.py` cuts `data/clips/<clip>.js` and `art/clips/<clip>.webp` by the recipe of its kind (`tools/guidegen/recipe.json`); the `<script>` tag goes into `index.html`; a body state is named in `B3_BODY_CLIPS` and its painted row leaves `B3_BODY_PAINT` (No painted poses in battle); a move or attack row gets `anim:{kind:'clip',clip:'<clip>'}` and a wind-up row `wind:'<clip>'` (`data/b3-kit-*.js`, `data/b3-foes-ch*.js`); `data/guide-prompts.json` records the prompt used (source `used`); `data/guide-anims.json` is rebuilt; `docs/CHANGES.md` gets the heading; `bump_tags.py` moves the cache tags; the job pushes to `main` and starts the publish. The player then shows the new clip and the guide says to press RELOAD on the title screen.

**Keeping `data/guide-anims.json` fresh.** It is generated from the game's data, so any session that adds or changes a move, a monster act or a clip runs `node tools/guidegen/build_map.js` in the same push (`--check` says when it is stale; `tools/guidegen/build_map_test.py` fails when it is).

**Tests.** `python3 tools/guidegen/build_map_test.py` (the file), `python3 tools/guidegen/guidegen_test.py` (reconcile and its checks), `python3 tools/guidegen/take_test.py` (wangen and clipgen request modes against stand-ins, takes, the branch keeper, use on a copy of the repo), `python3 tools/battle_guide_test.py` (the page at the four Duo sizes with a stand-in GitHub and stand-in Actions). A session never runs a paid generation: Wan requests with `dry:true` plan only.

## Test

**battleguide2 additions** (same command): the generator (ten third Vibes whole and none in the game, 26 planned monsters none in the game, stages in order, no em dash, `--check` passes and fails when a source hash is wrong); each size (an In a fight button on each of Tom's four moves with the address, his PLANNED Vibe with no Play or fight button, it fits the page); the planned monsters, What is coming, the cheat sheet's BAG line; Search with Planned and All; the drop-by-itself cases (a third Vibe, a monster, chapter 11 and the BAG rule added to the game's data through the page's own requests: the planned items go and the real ones show); and the game opened at the address for a move and for a monster attack, checking the owner opens with the move and the monster uses the attack first. Look at `battleguide-*-planned-vibe.png`, `battleguide-planned-monster.png` and `battleguide-coming.png`.

`python3 tools/battle_guide_test.py [outdir]` (needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH as for the other page tests; about 1 minute): the four sizes, counts against the data files, a video that moves, the no-video message, notes saved through a stand-in GitHub and accepted by `tools/board_check.py`, search. Look at `battleguide-*.png`.


## Start pictures (startpics1, 2026-11-22; the page side is guideflow5)

The person's start picture is a row now: the top of their Animations screen shows it with its status line and, when they have none, `Make the start picture ($0.15)` (one tap: a picture row `p-<who>-<unix seconds>`, lane pic, cap 0.30, then the poke). The old two-tap box, the `data/startpic-requests.json` request and the `startpic-results.json` look are gone from the page. Until a person has a picture (`owners.<who>.start` in `data/guide-anims.json`, or a done picture row) every video row says `Needs the start picture first.` The moment the picture row is `done` the video buttons appear with no reload, and the picture shown is read from branch `guidegen` (`startpics/<who>-hero.png`, the row's `result.path`) when the row says it is not on `main` yet. The checks of the picture itself (flat magenta, whole figure inside the frame, facing left by xAI vision, mirrored when it faces right) are the worker's (`tools/art-library/startpic.py`). Not on the page yet: Upload my own (card 5.5).

## The queue (guideflow2)

Plan: `claude/guide-flow-plan.md`. The one place that holds the status of every Battle Guide picture, upload and video request is the file `queue.json` on the branch `guideq` (never merged into `main`, never served to players). Finished rows older than 7 days move to `queue-archive.json` on the same branch. Nothing on screen reads it yet; the page, worker and apply job arrive in the next cards.

| Who | May change |
|---|---|
| The page (`actor` page) | add a row (queued), cancel a queued row, mark Use this one (use wanted, also again after a failed use), mark Keep the old one |
| The worker (`worker`) | queued to making (claim), making to checking, checking to done, making or checking to failed |
| The reaper (`reaper`) | a dead run's row back to queued once (needs a fal request number and one try), else failed |
| The apply job (`apply`) | the `use` field: wanted to applying, then live or failed; applying back to wanted for its one automatic retry |

Code: `tools/guidegen/store.py` (standard library only; every save is a compare and swap on the file's sha, a 409 or 422 reads again, up to 8 tries; a file over 1 MiB is read through the blobs API; every commit message ends with `[skip ci]`). Any other change raises `store.Refused`. Every change Tom hears of (ready, failed, start picture ready, in the game, not in the game) sends exactly one phone message from the function that made it; queued, making, checking and cancelled send none. The `why` and `do` words of every failure live in `WORDS` in `store.py` and are copied to `data/guide-words.json` (`python3 tools/guidegen/store.py words`) for the page. Test: `python3 -I tools/guidegen/store_test.py`.

## The page and the queue (guideflow5, 2026-11-23)

The page reads and writes `queue.json` (plan sections 3.2, 5 and 6, card c-guideflow-5). Code: the block "the one status file" in `battle-guide.html` (`qRead`, `storeUpdate`, `qLine`, `qPaint`).

| Part | What it does |
|---|---|
| One reader (`qRead`) | Reads `queue.json` on `guideq` through the contents API with the saved token (`ghGetJson`, the blob fallback for a big file, the `?gh=` test address), sends `If-None-Match` with the last ETag (a 304 means no change). Every 5 seconds while any row is queued, making, checking or being put in the game (or a monster take is awaited), every 30 seconds otherwise, and at once when the page is shown again. It runs on every tab. A browser with no token reads once. |
| In place | A change updates the status lines where they stand (`qPaint`; each area is changed only when its text changed), so an open sheet, its scroll, a typed note and a playing clip are not touched. The clock counts from the row's `since` once a second. |
| X21 | Three failed reads show the bar `Cannot read the status right now. Trying again.` (words from `data/guide-words.json`) and the old rows stay, greyed. |
| One writer (`storeUpdate`) | GET with the sha, change, PUT with the sha; a 409 or 422 reads again (up to 4 times) and keeps what the other writer added. Used for exactly four things: add a row, cancel a queued row (refused with `It already started, so it cannot be cancelled.` if the worker took it first), mark Use this one (`qUseWanted`, built, turned on by card 7), mark Keep the old one (`left`). |
| The poke | After adding a row: `POST /repos/<repo>/dispatches {"event_type":"guide-work"}`. A failed poke is not an error. While a row has been queued over 90 seconds with no worker, the page pokes again at most once every 2 minutes. |
| X1, X2, X4 | A failed save says `Could not send. Nothing was made. Tap again.` under the button; no token says the plan's words; a second tap on the same thing makes no second row (an id that exists is refused, and the button is busy until the save ends). |
| The status line | The plan's 5.1 words, word for word, with the clock, on the animation's row in the list, in its sheet (`#gq`) and in Activity. A ready video shows `Open it` in the list and in Activity; the three decisions (Use this one, Make another, Keep the old one) are in the sheet. |
| The take | A row's take plays in the sheet as soon as the row is `done` (`result.js` and `result.img`, files from branch `guidegen`), beside the clip in the game. |
| Activity | The bar under the header (`3 making, 2 queued, 1 ready`, hidden when nothing is active) on every screen; a tap opens the list of the last 24 hours, newest first; tapping a name opens the animation. Empty: `Nothing is being made.` |

Kept: the player, the take comparison (`showTake`, `loadTakeClip`), Update the prompt, Send a note, `GW` (kept prompts), `GTR` (the notes of the tries) and the stop box (`stopFor`). Removed: `loadProgress`, `stageOf`, `stageBadge`, `watchProgress`, `STAGE`, `STALL_MIN`, `PROG`, `queueLine`, `STARTING`, the waiting loops of the old start and take flow, `GPEND` (`aot-guide-pend`), `GKEPT` (`aot-guide-kept`), the STALLED badge, the Yes, spend box for a family video. No word of the page says reload, refresh or keep this page open (test G12).

**Tests (T8, G1 to G12 in `tools/battle_guide_test.py`).** The stand-in GitHub also serves `queue.json` with an ETag, 304, compare and swap with 409 and the dispatch call; a test plays the worker by changing a row. G1 every line of 5.1 in the list, the sheet and Activity (portrait and landscape); G2 one tap, one row, the poke, no box, a double tap makes one row; G3 the slow line and the poke again once; G4 the line changes in place with the sheet, scroll, typed text and clip untouched; G5 a reload and a second tab show the same line; G6 the take plays when `done` arrives, the three buttons, Keep the old one writes `left`; G7 the person with no picture, the picture row, the video buttons when it is done, the picture from `guidegen`, mirrored and failed lines; G8 Cancel and the refused cancel; G9 two 409s keep the other writer's row, ETag 304, take numbers; G10 X1 and X2; G11 X21 and every tab; G12 the old code and keys are gone, no word of reload, the stop box. Eight older checks of the same file fail on the untouched HEAD too (the page lists 670 animations and `data/guide-anims.json` 636, What is coming, `engine/clip-ground.js` loaded by the page, the Plan counts); card guideflow5 did not change them.

## Upload my own and Make all missing poses (guideflow6, 2026-11-23)

Plan sections 3.2 D11 and D13, 5.2, 5.5 and rows X13 and X14 of section 6 (card c-guideflow-6). Code: the block "guideflow6" in `battle-guide.html` (`qUpPick`, `qUpChosen`, `qUpUse`, `qUpRetry`, `qMissing`, `qMakeAll`). Nothing here spends money by itself and no test calls a service.

| Part | What it does |
|---|---|
| Where Upload my own shows | On a person's Animations screen beside `Make the start picture ($0.15)`, and on the start picture row when it is done (`Make another ($0.15)` and `Upload my own`) or failed. A done upload shows `Upload a different one` and `Go back to a generated picture` instead. |
| Refused at once, free, in the page | `That file is not a picture.`, `That picture is too small. It needs to be at least 600 pixels tall.` (the page reads the height with an Image element), `That file is over 8 MB.` Nothing is saved or sent. The file input takes PNG, JPEG and WebP. |
| The confirm | The picture is shown with `Use this picture for every video of <Name>? It is used exactly as it is.` and the buttons `Use it` and `Cancel`. Nothing is sent before Use it. |
| Use it | Saves the bytes unchanged to branch `guidegen` at `uploads/<who>-<unix seconds>.<ext>` with the contents API (PUT, base64, message `guide: upload <who> [skip ci]`), then adds ONE row `{id u-<who>-<seconds>, kind upload, lane pic, who, upload: that path}` with `storeUpdate` and pokes the worker. The file is saved first, so a row never points at a missing file. |
| While and after | The row is a normal row: `Checking your picture. About 30 seconds.` with the clock, then `Your picture is in use, exactly as you made it.` and the video buttons at once. The measured checks run in the worker (card 3), not in the page. |
| X13, X14 | A failed upload shows `Failed: <why> <do>` from `data/guide-words.json` and one button, `Upload my own`, which opens the same picker and confirm. |
| Go back to a generated picture | One confirm, `Replace your own picture of <Name> with a generated one ($0.15)?` with `Replace it` and `Cancel`. Replace it adds a `picture` row with `force: true` (cap 0.30) and pokes. An ordinary Make another never carries `force`. |
| Make all N missing poses ($X.XX) | Above the standard poses of a person who has a start picture. N counts Idle, Guard, Hit, Dodge, Knocked out, Victory and Running that have no video in the game and no row that is queued, making, checking or done and not left (a failed, cancelled or kept-the-old-one row still counts as missing). The price is N times the video price. Hidden when N is 0. |
| Confirm | A total of $2.00 or less adds the rows at once. Above $2: `Make N videos for $X.XX?` with `Make them` and `Cancel`. All rows go in ONE `storeUpdate` (commit `guide: add N videos of <Name> [skip ci]`) and ONE poke. A pose whose last two takes missed the same way is left out and named under the button (the stop rule of `stopFor`). |

**Tests (U1 to U9 and M1 to M7 in `tools/battle_guide_test.py`).** The stand-in GitHub also takes the file save to `uploads/`; a test plays the worker with `wset`. U1 and U2 the button, the input, the three refusals word for word, nothing sent; U3 the confirm in portrait and landscape, Cancel; U4 the saved file (path, branch, message, same bytes) then one row, in that order, then one poke; U5 the checking line; U6 the done line and the video buttons; U7 Upload a different one repeats it; U8 Go back asks once and `force`; U9 X13 and X14 from a failed row. M1 to M7 Make all with 7 missing (confirm, one save), with 3 missing at $1.50 (no confirm), $2.00 (no confirm), a queued row not counted as missing, no button without a start picture or with nothing missing. Pictures: `tools/shots/guideflow-upload-*.png` (confirm, in use and make-all, portrait and landscape).
