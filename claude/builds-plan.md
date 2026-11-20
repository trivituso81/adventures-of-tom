# Build history redesign: UX audit and plan (2026-11-20, PLAN, not built)

Source: Tom 2026-11-20 10:18: "do a UX audit of the build history screen and create a plan to improve it to make it more usable. think about me as a user looking to see which builds have been done recently, which are currently pending and any subset of deployment status, with older builds archived and easily searchable/finable etc"

This file lives in the repo only (the Project is 97% full, card c-projclean). Mockup of the target: `claude/builds-mock.png` (source `claude/builds-mock.html`; its rows and counts are examples, not real data).

Everything in sections 3 to 6 is a decision. The build sessions do not reopen them; they build them and write what differed into section 8.

## 1. What Tom needs from this screen

| # | Question he opens it with | Answered today? |
|---|---|---|
| J1 | What was built recently, in words I understand? | Partly: a flat list, 73 rows for today alone |
| J2 | What is pending: being built now, queued, waiting on my test? | No. Only on the Board |
| J3 | Where is each build: still publishing, live, or on this phone? Did a publish fail? | No. One sentence says how many builds this phone is behind |
| J4 | Find an older build by a word, a theme or a day | No search, no filter. ALL DAYS is one list of 482 rows |
| J5 | From a build, get to its card and what I should check | No. Rows cannot be tapped |

## 2. Audit of the screen as it is (build fix-effectslook-2, looked at in portrait and landscape at 430 x 860)

Facts measured from `data/build-history.js` and `data/board.json` on 2026-11-20.

| # | Finding | Evidence | Severity |
|---|---|---|---|
| A1 | The list does not scale to the build rate. One day is one flat list | 482 builds since 10-31. 73 today, 86 yesterday, 72 on 11-12. About 10 rows fit a screen, so today is 7 screens of scrolling | High |
| A2 | No status on a row. Every build looks finished and delivered | The only mark is ON THIS PHONE. A build takes about 4 minutes from push to live (pubfast1 measurements), longer in a run of pushes. The footer says "a minute or two" | High |
| A3 | Pending work is invisible | 16 Claude cards are In progress, 3 are waiting, 8 Tom cards are open. None show here | High |
| A4 | No search and no filter | Finding "the muffin theft build" means paging day by day and reading | High |
| A5 | Rows are dead ends | 263 of 482 builds match a board card by build name, but a row cannot be tapped to reach the card, the full notes or what to test | High |
| A6 | The headline is the build name, which is a code (b3s12, fix-battlelabpagetry-2). The plain sentence is the small grey line under it | Tom reads the sentence, not the code | Medium |
| A7 | Noise is mixed in with real builds | 34 builds are housekeeping (board only, art bake, "no code change"). Retries of one card show as unrelated rows (fix-battlelabpagetry, -2, -3). 25 old rows have a useless line ("CHANGES, tags, stamp") | Medium |
| A8 | Day paging is the only navigation | Arrows step one day. No week view, no jump to a date. The disabled right arrow takes space on the default view | Medium |
| A9 | Touch targets are under 44 px | Close, both arrows and ALL DAYS are 38 px tall. RELOAD is about 28 px and sits inside a sentence | Medium |
| A10 | "2 newer" says nothing about what is in them or whether they are live yet | The status line compares against the newest pushed build, which may not be on the site yet, so RELOAD can do nothing | Medium |
| A11 | Only reachable inside the game (welcome chip, menu) | Not on `admin.html`, not linked from the board's "Build <name>" label on play cards | Low |
| A12 | The whole history loads with the game and grows about 10 KB a day | 68 KB now, loaded as a blocking script at boot | Low |
| A13 | A fixed footer note uses a row of the screen for good | 2 lines, always shown | Low |

What works and stays: the gold frame look, ON THIS PHONE as an idea, the fresh fetch on open, RELOAD from the screen, Escape to close, the welcome chip and the menu box as entry points, portrait and landscape.

## 3. The redesign

### 3.1 Screen layout (top to bottom, same in portrait and landscape)

| Part | What it is |
|---|---|
| Header | BUILDS, close button (44 px) |
| Status strip, always shown | Line 1: "This phone: <build name>". Line 2: one of "The newest build." / "N newer builds are live." / "N newer builds are live. M more are publishing." / "The last publish failed at <time>." RELOAD (44 px, gold) on the right, shown only when at least one newer build is live |
| Three views | Recent (default), In the works (with a count), Archive. One row of three 44 px buttons |
| Search and Filters | One search box, always shown on Recent and Archive. Filters button with the number applied ("Filters 2") |
| List | The view's rows |

No footer note. The time zone note moves into the detail sheet.

### 3.2 A build row

| Piece | Rule |
|---|---|
| Headline | The plain sentence (`what`), at most 2 lines, then cut with "..." |
| Second line, small monospace | build name, theme, time. In Archive the time is "Nov 14, 8:51 AM" |
| Status chip, right | See 3.3. No chip on a build that is simply on this phone |
| Tries | Builds that belong to one board card on the same day are one row (the newest) with "+N earlier tries on this card". A tap on that line opens them in place |
| Tap anywhere else | Opens the detail sheet (3.6) |

### 3.3 Statuses (J3)

| Status | Meaning | How the page knows |
|---|---|---|
| BUILDING | A Claude session is working on it; no build yet | Board card, lane claude, column In progress, not in the backlog |
| QUEUED | Agreed, not started, or waiting on something | Board card, lane claude, column Up next or Waiting, not in the backlog |
| PUBLISHING | Pushed to GitHub, not yet on the site | In the pushed list but not in the live list (below) |
| LIVE, RELOAD | On the site, newer than this phone's build | In the live list, above this phone's build |
| (no chip) | On this phone | At or below this phone's build |
| YOUR TEST | A Tom card with ask play, pictures, animations, voice or script is open for this build | The Tom card that the build's Claude card names in `after` (the same link buildname1 uses) |
| PUBLISH FAILED | The last publish run failed | Status strip only, not a row chip |

Two lists, read when the screen opens and when RELOAD CHECK (pull down or the status strip tap) is used:

- Live list: `data/build-history.js` fetched from the site with `cache:'no-store'` (done today). What the site serves is what is live.
- Pushed list: the same file on `main`, read through the GitHub contents API with `Accept: application/vnd.github.raw` (not raw.githubusercontent.com, which serves copies up to 5 minutes old). Use the saved GitHub token when one is saved (read it the way `board.html` does), else no token (the repo is public; 60 reads an hour per network).
- Publish failed: one read of `actions/workflows/publish.yml/runs?per_page=3`. Newest finished run has conclusion `failure`: say so in the strip with its time.
- If GitHub cannot be read: no PUBLISHING chips, and the strip adds "Could not check GitHub." Never guess a status.

"THIS PHONE IS HERE" is a marker line across the list, directly above this phone's build. Everything under it is on the phone.

### 3.4 Recent view (J1)

- Covers the last 7 days.
- Grouped by day under 44 px day headings with the count ("TODAY, FRI, NOV 20, 41 builds"). Today is open. Other days are closed and open on a tap. If today has no builds, the newest day with builds is open.
- Housekeeping builds are hidden by default; the day heading says how many ("32 housekeeping hidden") and Filters has "Show housekeeping".
- PUBLISHING rows are first, then LIVE, RELOAD rows, then the marker, then the rest.

### 3.5 In the works view (J2), read from `data/board.json`

Read the board the way `board.html` does (the live file from GitHub, not the site copy). Groups in this order, each a heading with its count, first 3 rows shown and "N more" to open:

| Group | Rows |
|---|---|
| Publishing now | PUBLISHING builds, with "pushed <time>, usually live in 4 min" |
| Being built now | BUILDING cards: card title, build name (the card's `tag`), theme, "started <time>" from the card's last move to In progress |
| Waiting on your test | Open Tom cards with ask play, pictures, animations, voice or script: card title, build name, "on this phone" or "reload first" |
| Queued | QUEUED cards, closed by default |

The count on the view's button is Publishing plus Being built plus Waiting on your test. A tap on a card row opens that card on the board (`board.html?card=<id>`; add that parameter to `board.html` if it does not open a card yet). If the board cannot be read, the view says "Could not read the board." with a Try again button.

### 3.6 Detail sheet (J5)

Opens from the bottom over the list, close with the 44 px button or a tap outside.

| Line | Content |
|---|---|
| Sentence | The full `what` |
| Build | The name, with Copy name (44 px) |
| Made | Day and time in this phone's time zone |
| Status | The 3.3 status in a sentence ("Live. Reload to get it.") |
| Card | Card title and Open the card on the board, when the build has a card |
| What to check | The `next` of the open Tom card for this build, when there is one |
| Other tries | The other builds of the same card, newest first |

### 3.7 Archive view and search (J4)

- Archive is every build older than 7 days, grouped by month, then by day, all closed except the newest month.
- Search looks in the build name, the sentence, the theme, the card title and the day written as "nov 14" or "11-14". It searches Recent and Archive together and shows one result list, newest first, with the count ("12 builds") and the search words marked in each row.
- Filters (a sheet): Theme (the nine board themes plus "No theme"), Status (Publishing, Live not on this phone, On this phone, Your test), Show housekeeping. Applied filters show as chips with an x under the search box, then Clear all.
- An empty result says "No builds match." and offers Clear search.

### 3.8 Where it opens from (A11)

| Entry | Behaviour |
|---|---|
| Welcome chip, menu Build box | As today: the screen opens over the game |
| `builds.html` | The same screen as its own page in the Admin look, for the home screen and for links. It knows this phone's build because the game saves `BUILD_TAG` to localStorage at boot (key `aot-build`). If nothing is saved it says "Open the game once on this phone." and shows no marker |
| `admin.html` | A Builds button in the group "What is next", under Board, with one live line: "N newer than this phone" |
| Board | The "Build <name>" label on a play card opens `builds.html?build=<name>` with that build's detail sheet open |

One script draws the screen in both places (`engine/build-history.js`, which already guards every game global).

## 4. Data

| Change | Detail |
|---|---|
| New fields per build | `card` (board card id), `theme` (that card's theme), `kind` (`house` for housekeeping, absent otherwise). Written by `tools/build_history.py` in `add` and `sync`. Card match: the same rule as `board_check.py --push` (tag equal, tag plus one letter, or named in a card's history) plus `fix-<card>-<n>` |
| Housekeeping rule | Tag starts `board-` or `artbake`, or the sentence contains "board only" or "no code change" |
| Backfill | `sync` fills the three fields for all existing rows. Rows with no card keep none. The 25 weak sentences stay as they are |
| Split (phase 3) | `data/build-history.js` keeps builds from the last 7 days and always at least the newest 50. Older builds move to `data/build-archive/<YYYY-MM>.json`, with `data/build-archive/index.json` listing months and counts. The archive loads only when Archive is opened or a search is typed |
| Unchanged | `add <TAG>` is still the only thing a push runs. `check` still compares the stamp with the newest entry. Never hand-edit the files |

## 5. Checks (each phase adds its checks to `tools/buildlog_test.py`; every phase looks at portrait and landscape pictures before pushing)

| # | Check |
|---|---|
| B1 | Every button and every tappable row is at least 44 px tall |
| B2 | Recent opens with today's group open, other days closed, counts right |
| B3 | A row shows the sentence first, then name, theme and time |
| B4 | The marker sits directly above this phone's build; rows under it carry no LIVE or PUBLISHING chip |
| B5 | Builds of one card on one day are one row with the right "+N earlier tries" |
| B6 | Housekeeping is hidden by default and the heading count matches; the filter shows it |
| B7 | A tap on a row opens the detail sheet with the card link when the build has a card |
| B8 | With a stubbed pushed list holding one build the live list lacks, that build shows PUBLISHING and the strip counts it; with GitHub unreachable no PUBLISHING chip shows and the strip says so |
| B9 | With a stubbed failed publish run the strip says the publish failed |
| B10 | In the works shows the four groups with counts that match a stubbed board; a row opens the card |
| B11 | Search finds by name, by a word of the sentence, by theme, by card title and by "nov 14"; results span Recent and Archive |
| B12 | The archive files are not requested until Archive is opened or a search is typed; `data/build-history.js` holds no build older than 7 days beyond the newest 50 |
| B13 | `builds.html` shows the same screen; with no saved build it shows the "Open the game once" line; `?build=<name>` opens that sheet |
| B14 | Everything the old screen did still works: opens from the chip and the menu without starting a game, Escape closes, RELOAD reloads, no page errors |

## 6. Build order

Tom tests once, after phase 3 (his rule of 2026-11-18: build to a milestone before he tests).

| Phase | Card | Build name | Scope | Checks |
|---|---|---|---|---|
| 1 | c-builds1 | builds1 | Section 4 fields and backfill. Sections 3.1 (without the In the works and Archive buttons working yet: Recent only, the other two shown from phase 2 and 3), 3.2, 3.4, 3.6. Search over the loaded list by name and sentence. Marker from the live list only. Old day arrows and ALL DAYS removed and purged | B1 to B7, B14 |
| 2 | c-builds2 | builds2 | Section 3.3 in full (pushed list, PUBLISHING, publish failed, YOUR TEST), the status strip wording, section 3.5, Filters (Theme, Status, Show housekeeping) | B8 to B10 |
| 3 | c-builds3 | builds3 | Section 4 split and section 3.7 in full, section 3.8, docs (repo CLAUDE.md "Build label and build history", admin row in "Where things live"), then hand to Tom on card t-buildstry | B11 to B13 |

Each phase: first push `board: start <card id>`; fetch and rebase before every push; write what was built and what differs into section 8; in the last push set `start: true` on the next phase's card so it starts by itself.

## 7. Not in scope

- Rewriting old weak sentences by hand.
- Push notifications when a build goes live.
- Changing how builds are named or how `bump_tags.py` works.

## 8. Built

### Phase 1, builds1 (2026-11-20, card c-builds1)

Built as the section 6 row says: section 4 fields and backfill, 3.1, 3.2, 3.4 and 3.6, search over the loaded list, marker from the live list only, old day arrows and ALL DAYS removed and purged. Checks B1 to B7 and B14 are in `tools/buildlog_test.py` (it serves made-up builds and a made-up board relative to today, with the service worker blocked so the stubs apply) and pass in portrait and landscape. I looked at every picture of both layouts (recent, marker, tries open, housekeeping shown, search, sheet, this phone's sheet, menu).

What exists now:

| Part | Where |
|---|---|
| `card`, `theme`, `kind: "house"` on every build; `add` and `sync` fill them (`find_card`, `is_house`, `fill_card_fields` in `tools/build_history.py`) | `data/build-history.js`: 487 builds, 273 with a card and a theme, 35 housekeeping (81 KB, up from 68 KB; phase 3 splits it) |
| The screen, one script | `engine/build-history.js`; styles in the `index.html` style block |
| Test | `python3 tools/buildlog_test.py` |

What differs from the plan (decisions I made; phases 2 and 3 should read these):

| # | Plan said | What I did | Why |
|---|---|---|---|
| 1 | Three view buttons in 3.1 | No view row in phase 1; Recent is the whole screen. Phase 2 adds the row (Recent, In the works) and phase 3 adds Archive | The plan's phase 1 row says the other two appear from phase 2 and 3. A row with two dead buttons would be worse |
| 2 | A Filters button next to the search box | A 44 px "Housekeeping" toggle sits there (class `bl-hk`, `BUILDLOG.house`). Phase 2 replaces it with Filters (which holds Show housekeeping) and removes the toggle | Housekeeping had to be showable (B6) before Filters exist |
| 3 | Search "over the loaded list by name and sentence" | Also theme. Searches every build loaded, including ones older than 7 days (so nothing is out of reach until Archive exists). One flat list, newest first, with the date and time on each row, words marked, not folded into tries, housekeeping included | Phase 1 has no Archive; folding hides what a search is looking for |
| 4 | Tries: builds of one card on one day | The `card` field is the exact card (a fix try has its own card, `c-fix-<x>-<n>`); rows group by a family key: `c-fix-<x>-<n>` and `c-fix-<x>` share `c-fix-<x>`, every other card is its own family (`buildFamily`) | Fix tries are separate cards but are one thing to Tom |
| 5 | Marker above this phone's build | This phone's build always starts its own row (a newer try of the same card is never folded into it) and is never hidden as housekeeping. If it is in a closed day, that day's heading gets "THIS PHONE" | The marker must sit directly above it, and the phone's build can be a board-only push (the stamp changes on every push) |
| 6 | Day heading "41 builds, 32 housekeeping hidden" | The count is visible builds (not rows); the hidden count follows after a comma | Matches B2 and B6 as written |
| 7 | Detail sheet card line | The sheet reads `data/board.json` from the site when it first opens (the card title, and the open Tom card's `next` as What to check, only for ask play, pictures, animations, voice, script). Phase 2's 3.5 reads the board from GitHub for In the works; this one is the site copy | The sheet needs the title; the site copy is enough |
| 8 | `board.html?card=<id>` | The sheet links to `board.html?card=<id>`, but `board.html` does not read that parameter yet. Phase 2 adds it (3.5 already says to) | Link is ready; the board just opens until then |
| 9 | Status in the sheet | Phase 1 has only the live list: "On this phone. It is the build running now.", "On this phone." (older) or "Live. Reload to get it." (newer). Phase 2 adds Publishing, Your test, Publish failed | 3.3 is phase 2 |
| 10 | Status strip line 2 | "The newest build." / "N newer builds are live." (all newer builds counted, housekeeping too) / "This build is not in the list yet." when this phone's build is missing. RELOAD only when newer builds exist | 3.1, with the missing case added |
| 11 | Landscape layout "the same" | Same parts; in landscape the status strip and the search box sit side by side so the list keeps most of the height | The stacked version left about 2 rows visible |
| 12 | Not in the plan | `engine/splash.js` key handler returns while the builds list is open, so Escape closes the list on the welcome screen (it used to be swallowed there; only the menu path worked) | B14 asks Escape to close it |
| 13 | Backfill "263 of 482 match a card" | 273 of 487 match (the plan's count used a stricter rule) | The rule is the board_check rule plus card id and word-boundary history match |

Not verified: no one has looked at the screen on a phone (Tom tests once, after phase 3). `python3 tools/smoke.py` runs all its checks including `buildlog_test` and `build_history check`, but its `board_sync_test` already fails on main before this work (R5 "board_check accepts an unstick card": `t-stuck-x` must block an open Claude card or be fyi). I did not touch it.

### Phase 2, builds2 (2026-11-20, card c-builds2)

Built as the section 6 row says: 3.3 in full (pushed list, PUBLISHING, LIVE, RELOAD, YOUR TEST, publish failed), the status strip wording, 3.5 (In the works), and the Filters of 3.7 (Theme, Status, Show housekeeping). Checks B8 to B10 and the filter checks are in `tools/buildlog_test.py` (GitHub reads stubbed by route) and pass in portrait and landscape, with B1 (44 px) also checked with the filters sheet, chips and In the works. I looked at every picture of both layouts.

What differs from the plan (phase 3 should read these):

| # | Plan said | What I did | Why |
|---|---|---|---|
| 14 | Strip line 2 is one of four sentences | The failed-publish sentence is its own red third line, so the count of live and publishing builds stays visible. "Could not check GitHub." is also its own line | One line could not say both |
| 15 | N newer and M publishing: "N newer builds are live. M more are publishing." | Same; with no newer live build and M publishing: "The newest live build. M builds are publishing." | Wording for the case the plan does not give |
| 16 | Views Recent, In the works, Archive | Two buttons (Recent, In the works with its count). Phase 3 adds Archive to `buildViewsHtml` | As in phase 1 |
| 17 | Filters shows applied filters as chips with an x under the search box, then Clear all | Same. Chips are 44 px tall pills. Show housekeeping counts as one filter ("Filters 1") and shows a chip. A Status filter on a build whose card is not on the board never matches Your test | Keeps B1 |
| 18 | Search | Search still shows housekeeping builds (as in phase 1) and now also obeys Theme and Status | Filters apply to results |
| 19 | RELOAD CHECK (pull down or the status strip tap) | The status strip tap re-reads everything (`data-act="check"`). No pull down | Pull down fights the list's own scroll on a phone |
| 20 | Waiting on your test: "on this phone" or "reload first" | Also "still publishing", "build not named yet" and "build not found" when that is the case. The build is the newest shipped Claude card that hands to the Tom card (the rule of `buildOf` in board.html), else the card's `build` | Never guess |
| 21 | Being built "started <time>" from the last move to In progress | `started_at` on the card, else the newest history line with an `at` that mentions "start"; no time shown when neither exists | Cards have no move log |
| 22 | Board read from GitHub | Contents API with the raw media type (token when saved, else none), site copy as the fallback when GitHub fails | Same as board.html's fallback |
| 23 | `board.html?card=<id>` | Added: `board.html` opens the card sheet after its first load when the parameter names a card | Section 8 item 8 of phase 1 |
| 24 | Not in the plan | The details sheet is `.bl-dwrap` and the Filters sheet `.bl-fwrap` (both `.bl-sheetwrap`); Escape and a tap outside close the Filters sheet first | Two sheets on one screen |

Not verified: no one has looked at the screen on a phone, and the GitHub reads were only tried against stubs (this environment has no GitHub token for the page); the first real PUBLISHING chip will show on the next push that has not reached the site yet.


### Phase 3, builds3 (2026-11-20, card c-builds3)

Built as the section 6 row says: the section 4 split, section 3.7 in full (Archive, search over everything), section 3.8 (`builds.html`, Admin button, board link) and the docs (repo CLAUDE.md "Build label and build history" and the "Where things live" row). Checks B11 to B13 are in `tools/buildlog_test.py` and pass in portrait and landscape; B14 and all earlier checks still pass. I looked at the Archive (closed and open), search across Recent and Archive, the page saved and unsaved, the archived build's sheet on the page, in portrait and landscape.

What exists now:

| Part | Where |
|---|---|
| Split: `data/build-history.js` has the last 7 days and at least the newest 50 (304 of 490 builds today, 58 KB, down from 81 KB); the rest is in `data/build-archive/2026-10.json`, `2026-11.json` and `index.json` | `save` and `load` in `tools/build_history.py` |
| Archive view, search over everything, `buildArchiveLoad` | `engine/build-history.js` |
| The page | `builds.html`, styles in `build-history.css` (moved out of the `index.html` style block, which keeps only the welcome chip and menu box) |
| Admin button with a live line, board label link | `admin.html`, `board.html` |

What differs from the plan (decisions I made):

| # | Plan said | What I did | Why |
|---|---|---|---|
| 25 | Archive loads "when Archive is opened or a search is typed" | Same; it reads the index and every month file at once (about 12 small files after a year). Search results fill in when they arrive ("Still reading the older builds...") | Search has to span everything, and a month at a time would miss builds |
| 26 | Search matches the day written as "nov 14" or "11-14" | Also "2026-11-14". A day in the query is matched against the build's own day (this phone's time zone) and removed from the words | Typing "nov 14" must not match every build with a 14 in it |
| 27 | Search covers the card title | Only once the board has been read (the sheet and In the works read it); before that the title is not searched | No extra read just for search |
| 28 | Archive: "all closed except the newest month" | The newest month is open and its days are closed (a tap opens a day); other months closed | Reading of the plan sentence |
| 29 | Archive holds "every build older than 7 days" | Same, from the live list too (rows older than 7 days among the newest 50 are in both); this phone's build older than 7 days also shows in Recent | One rule for what is Recent and what is Archive |
| 30 | `builds.html` knows this phone's build from `aot-build` | Same; the game writes it at boot in `engine/main.js` | |
| 31 | The page "in the Admin look" | Admin colors and header with an "Admin" back link, the same gold panel inside; in a short wide window it uses the game's landscape layout | The panel needs the room in landscape |
| 32 | Admin live line "N newer than this phone" | "N builds are newer than this phone." / "This phone has the newest build." / "Open the game once on this phone." Counts the site's live list only | Full sentences |
| 33 | Board "Build <name>" label opens `builds.html?build=<name>` | The whole label (name included) is the link, 44 px tall | |
| 34 | `board_sync_test` failure noted in phase 1 | Not looked at this phase | Out of scope |

Not verified: no one has looked at the screen on a phone (Tom tries it once, card t-buildstry). The archive reads and `builds.html` were tested against stubs and the repo files; the real site serves the archive only after this push publishes.
