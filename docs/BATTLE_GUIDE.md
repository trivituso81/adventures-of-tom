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
| Generate this video | shows the price on the button; the first tap asks ("This spends $0.50"), the second sends. A family member goes to Wan 3.0 (5 s, 720p, $0.50, cap $1 a request, $10 a day for the guide); a monster goes to xAI Grok lite (3 s, 480p, $0.07, cap $0.15) | `data/wan-requests.json`, `wan: generate <id>`; monsters `data/clip-requests.json`, `clip: generate guide <id>` (a request with a `guide` field) | `wan-gen` (secret `FAL_KEY`) or `clip-gen` (`XAI_API_KEY`), then `tools/guidegen/make_take.py` | `takes.json`, `takes/<slug>/t<n>.mp4 .js .webp` |
| Compare | the new take plays next to the clip now in the game (or "No video yet"), cut exactly as the game would play it, with the clip gate's words (`hold.py`: measured checks, then the vision questions that hold) | none | none | none |
| Use this one | asks first ("This changes the game"), then sends | `data/guide-use.json`, `guide: use <id>` | `guide-use` (`tools/guidegen/use_take.py`) | `use-report.json`, the commit on `main`, the build `guideuse-<run>` |
| Try again with a note | goes to the note box; the next Generate carries the note | as Generate | as Generate | as Generate |
| Keep the old one | leaves the take on file, changes nothing | none | none | none |

**Family moves wait for staging (movestage1, 2026-11-22).** A family move is now three layers: a body video of the person acting, the stage the engine draws across the battlefield, and for a Capstone a set piece (`claude/move-staging-plan.md`). A family move with a staging row in `data/b3-stage.js` shows its body prompt (from the Wan job the row names), a chip with its ladder step and time budget, and Generate as before. A family move with no row shows **Waits for staging** with one line why, on the sheet and as a badge on the list: no Generate and no Update the prompt; its video, if it has one, still plays. Its model or rule draft shows under OLD DRAFT, NOT FOR USE (kept in `data/guide-prompts.json` with `notForUse`). The `wan-gen` Action refuses a request for a move that waits (`staging_waits` in `tools/art-library/wangen.py`) and the `guide-draft` Action never drafts one. Body states and monsters are unchanged. Test: `python3 -I tools/movestage_test.py`.

The Action never approves a take. A take is `new`, `still` (the video hardly moves, so there is nothing to cut) or `failed` (nothing came back; no charge). Per animation the sheet shows the prompt version, takes made and dollars spent (`takes.json`).

**Where a new video is (guidestatus1).** On the Animations list a stage label replaces VIDEO or NO VIDEO YET while a new video is on its way, and the filter In the works lists only those rows. The page reads the request files on `main`, `status.json` and `takes.json` on branch `guidegen`, every 15 seconds while the list is open (once, in a browser with no token).

| Label | What it means | Who says so |
|---|---|---|
| REQUESTED | The tap was saved; GitHub has not picked it up yet | the request is still in `data/wan-requests.json` or `data/clip-requests.json` (or this phone just sent it) |
| IN LINE · n MIN | The video service accepted it and has it waiting | fal answers IN_QUEUE (family only) |
| MAKING · n MIN | The service is working on it | fal answers IN_PROGRESS; xAI only says pending, so a monster is MAKING from the moment it is sent |
| CHECKING · n MIN | The video is back: marks, clip gate, preview | the video was downloaded |
| READY TO REVIEW | A take waits for Use this one or Keep the old one (a failed take shows here too, with why inside) | `takes.json`; it clears when the take is used (`used` on the take) or kept on this phone |

The jobs write a stage with `tools/guidegen/progress.py` (`mark`, on only when `GUIDE_STATUS=1`, which `wan-gen` and `clip-gen` set), through `keep.py`, which merges `status.json` by animation (newest wins). `falq.Fal.wait` reports each fal status to a `tell` callback.

**Stop rule.** Generate refuses, sends nothing and offers the note box to Claude when the last two takes were held by the clip gate for the same fault (`stop` in `takes.json`, set by `make_take.py`; a take that passes clears it) or when the new try's note shares half its words with the note of the try before (the page, `stopFor`). Two misses the same way is the stop-loss in CLAUDE.md.

**What Use this one changes** (`use_take.py`, no paid call): the take's video is kept as `art/raw/clips/wan-<job>-v<rev>.mp4` (family; the job in `tools/art-library/wangen-jobs.json` goes to rev + 1 with the prompt in `tools/art-library/prompts/wan-<job>-v<rev>.txt`) or `art/raw/clips/clip-<id>-v<n>.mp4` (monster; a new version of the entry in `data/art-prompts.json`, `promptRev` raised, status approved, a new entry when it had none); `tools/clip-bake/bake_clip.py` cuts `data/clips/<clip>.js` and `art/clips/<clip>.webp` by the recipe of its kind (`tools/guidegen/recipe.json`); the `<script>` tag goes into `index.html`; a body state is named in `B3_BODY_CLIPS` and its painted row leaves `B3_BODY_PAINT` (No painted poses in battle); a move or attack row gets `anim:{kind:'clip',clip:'<clip>'}` and a wind-up row `wind:'<clip>'` (`data/b3-kit-*.js`, `data/b3-foes-ch*.js`); `data/guide-prompts.json` records the prompt used (source `used`); `data/guide-anims.json` is rebuilt; `docs/CHANGES.md` gets the heading; `bump_tags.py` moves the cache tags; the job pushes to `main` and starts the publish. The player then shows the new clip and the guide says to press RELOAD on the title screen.

**Keeping `data/guide-anims.json` fresh.** It is generated from the game's data, so any session that adds or changes a move, a monster act or a clip runs `node tools/guidegen/build_map.js` in the same push (`--check` says when it is stale; `tools/guidegen/build_map_test.py` fails when it is).

**Tests.** `python3 tools/guidegen/build_map_test.py` (the file), `python3 tools/guidegen/guidegen_test.py` (reconcile and its checks), `python3 tools/guidegen/take_test.py` (wangen and clipgen request modes against stand-ins, takes, the branch keeper, use on a copy of the repo), `python3 tools/battle_guide_test.py` (the page at the four Duo sizes with a stand-in GitHub and stand-in Actions). A session never runs a paid generation: Wan requests with `dry:true` plan only.

## Test

**battleguide2 additions** (same command): the generator (ten third Vibes whole and none in the game, 26 planned monsters none in the game, stages in order, no em dash, `--check` passes and fails when a source hash is wrong); each size (an In a fight button on each of Tom's four moves with the address, his PLANNED Vibe with no Play or fight button, it fits the page); the planned monsters, What is coming, the cheat sheet's BAG line; Search with Planned and All; the drop-by-itself cases (a third Vibe, a monster, chapter 11 and the BAG rule added to the game's data through the page's own requests: the planned items go and the real ones show); and the game opened at the address for a move and for a monster attack, checking the owner opens with the move and the monster uses the attack first. Look at `battleguide-*-planned-vibe.png`, `battleguide-planned-monster.png` and `battleguide-coming.png`.

`python3 tools/battle_guide_test.py [outdir]` (needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH as for the other page tests; about 1 minute): the four sizes, counts against the data files, a video that moves, the no-video message, notes saved through a stand-in GitHub and accepted by `tools/board_check.py`, search. Look at `battleguide-*.png`.


## Start pictures (startpics1, 2026-11-22)

An animation of a person with no `art/clips/start/<who>-hero.png` shows Cannot be made yet and, under it, Make the start picture ($0.15, two taps). The tap commits a request to `data/wan-requests.json` (`{startpic, take, at, cap}`, message `wan: generate startpic <who>`); the wan-gen Action makes it from the `start-<who>` job, checks it (`tools/art-library/startpic.py`: flat magenta, whole figure inside the frame, facing left by xAI vision, mirrored when it faces right) and commits it to main with a rebuilt `data/guide-anims.json`. The answer for the page is `startpic-results.json` on branch `wangen`. A person needs a `start-<who>` job in `tools/art-library/wangen-jobs.json` (their hero picture) and a height in `tools/guidegen/figrows.json` (`python3 -I tools/guidegen/figrows.py <id>`). Test: `python3 -I tools/art-library/startpic_test.py`.
