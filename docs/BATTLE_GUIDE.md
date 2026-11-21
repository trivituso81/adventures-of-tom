# Battle Guide (build `battleguide1`, 2026-11-21)

`battle-guide.html`, ADMIN > Battle system > Battle Guide. Tom's reference for the new battle system ("Battle 3", docs/BATTLE3.md) while he tests, and the place he plays a battle animation and sends Claude a note on it.

## What it shows and where it comes from

| Tab | Shows | Source |
|---|---|---|
| Rules | Cheat sheet, turn bar, Pep, flavors and Primes, Detonations, Composure, damage and caps, rows and aim, Family Ruckus, Vibes and Ranks, the game's tips, the Lab's test fights | Words in `rulesTopics()` in the page; every number from `B3_RULES`, `B3_DETONATIONS`, `B3_LEANS`, `B3_STORY.tips`, `B3_LAB` |
| Family | Each member: who they are, their Vibes, Lean, titles, Trait, Basic, Skills, Capstone, Quirks, counter, body animations | `B3_CAST`, `B3_VIBES`, `B3_SKILLS`, `B3_TRAITS`, `B3_QUIRKS`; the one-liners are `WHO` in the page |
| Monsters | By chapter: stats, pips, Pet Peeves, resists, what it starts with, every attack and when it uses it, the Lab fights it is in | `B3_FOES`, `B3_FORMATIONS`, `B3_LAB` |
| Statuses | Every status, Prime, stance, mark and hazard, with who uses it | `B3_STATUS`, `B3_HAZARDS` |
| Animations | Per person and monster: body states, moves, attacks, wind-ups; VIDEO or NO VIDEO YET (wanch2a: no painted poses are left); NOTE OPEN when a card is open | `B3_BODY_CLIPS`, `B3_VIDEO_ONLY`, each row's `anim`, each act's `wind`, the clip files named in `index.html` |

The page loads no engine. `boot()` reads `index.html`, takes its `data/b3-*.js` script tags in order and adds them to the page, so the guide is whatever the game is. Clip data files (`data/clips/<id>.js`) call `bclipDefine`; the page has its own one-line version and loads a clip's file and picture only when it is played.

When the data gains a value the page has no plain words for, it shows the raw word with underscores removed. Add the words to the tables at the top of the script: `TARGET`, `HITS`, `TAG`, `ROLE`, `STATE`, `LEAN_PLAY`, `whenWords`. A new family member gets a line in `WHO`.

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

`python3 tools/battle_guide_test.py [outdir]` (needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH as for the other page tests; about 1 minute): the four sizes, counts against the data files, a video that moves, the no-video message, notes saved through a stand-in GitHub and accepted by `tools/board_check.py`, search. Look at `battleguide-*.png`.
