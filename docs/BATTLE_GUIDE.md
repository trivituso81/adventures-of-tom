# Battle Guide (build `battleguide1`, 2026-11-21)

`battle-guide.html`, ADMIN > Battle system > Battle Guide. Tom's reference for the new battle system ("Battle 3", docs/BATTLE3.md) while he tests, and the place he plays a battle animation and sends Claude a note on it.

## What it shows and where it comes from

| Tab | Shows | Source |
|---|---|---|
| Rules | Cheat sheet, turn bar, Pep, flavors and Primes, Detonations, Composure, damage and caps, rows and aim, Family Ruckus, Vibes and Ranks, the game's tips, the Lab's test fights | Words in `rulesTopics()` in the page; every number from `B3_RULES`, `B3_DETONATIONS`, `B3_LEANS`, `B3_STORY.tips`, `B3_LAB` |
| Family | Each member: who they are, their Vibes, Lean, titles, Trait, Basic, Skills, Capstone, Quirks, counter, body animations | `B3_CAST`, `B3_VIBES`, `B3_SKILLS`, `B3_TRAITS`, `B3_QUIRKS`; the one-liners are `WHO` in the page |
| Monsters | By chapter: stats, pips, Pet Peeves, resists, what it starts with, every attack and when it uses it, the Lab fights it is in | `B3_FOES`, `B3_FORMATIONS`, `B3_LAB` |
| Statuses | Every status, Prime, stance, mark and hazard, with who uses it | `B3_STATUS`, `B3_HAZARDS` |
| Animations | Per person and monster: body states, moves, attacks, wind-ups; VIDEO, NO VIDEO YET or OLD PAINTED POSE; NOTE OPEN when a card is open | `B3_BODY_CLIPS`, `B3_BODY_PAINT`, each row's `anim`, each act's `wind`, the clip files named in `index.html` |

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

## Test

`python3 tools/battle_guide_test.py [outdir]` (needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH as for the other page tests; about 1 minute): the four sizes, counts against the data files, a video that moves, the no-video message, notes saved through a stand-in GitHub and accepted by `tools/board_check.py`, search. Look at `battleguide-*.png`.
