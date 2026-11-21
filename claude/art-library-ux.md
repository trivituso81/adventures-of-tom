# Art Library UX assessment and build spec (2026-11-03)

Assessed art.html and data/art-prompts.json (342 entries, all draft). Tom's report: the Characters list is far too long; other tabs have the same problem.

## The problem (fact)
Every tab is one flat scroll of full cards. Each card shows the whole prompt in a text box (average 4,200 characters, up to 8,700), reference thumbnails, shape picker, GENERATE, results and notes, all open at once. Characters is about 53 phone screens long. No search, no filter, no collapse, no jump, page always starts at Characters.

| Tab | Entries | Grouping that exists in the data but the page ignores |
|---|---|---|
| Characters | 53 | 13 people x 4 steps (hero scene, hero cut, walk, battle); steps 2 to 4 wait on the earlier approval |
| Enemies | 87 | 1 test + 86 enemies in chapter order |
| Rooms | 61 | By area and chapter (town shops, houses, school, library, airport, tower, memories) |
| Areas | 39 | 8 plates x (painting + 3 or 4 stencils that wait on the painting) plus 6 standalone |
| Props | 34 | By owner (Tom, Grace, Tombo moves, etc.) |
| Battle | 29 | Numbered by chapter |
| Portraits 12, Flight 12, NPCs 11, Title 4 | | Fine flat |

## Findings, ranked
| # | Finding | Why it hurts | Severity |
|---|---|---|---|
| 1 | Cards open full size by default, prompt box included | Tom scrolls past prompts he never edits | High |
| 2 | No sub-grouping inside a tab | Characters should read as 13 rows, Areas as 8 plates, Enemies by chapter | High |
| 3 | Blocked steps look identical to ready ones | 62 entries have refs under art/raw/ that do not exist until an earlier approval; only hint is "(needs step 2 approved)" in the title; GENERATE fails after a fetch | High |
| 4 | No status filter | Cannot see "what still needs me" (ready, generated undecided, rejected, approved) | High |
| 5 | No search | Finding one entry means scrolling | Medium |
| 6 | Always lands on first tab; scroll position lost after APPROVE or REJECT (paintList rebuilds the whole tab) | Back near the top after every decision | Medium |
| 7 | Tab counts are totals only | "Characters (53)" says nothing about progress | Medium |
| 8 | Keys and spend cards fill the first screen every visit | Needed once a session | Low |
| 9 | Full-DOM render per tab is slow at this size | 87 cards of 4k-char textareas | Low |
| 10 | Titles carry workflow instructions ("same chat, send after...") | Belongs in a badge or hint line | Low |

## Build spec (recommendation, in priority order)
1. Collapsed rows by default: one line per entry (title, status chip, ready/blocked dot), tap to expand; only the expanded card shows prompt, refs, results. Expanded state remembered per entry (localStorage).
2. Groups inside tabs: Characters by person with the four steps as ordered rows; Areas by plate; Enemies, Rooms, Battle by chapter; Props by owner. Group headers collapse. Needs a `group` field per entry from make-prompts.js (and its modules), with validate.js checking it.
3. Status filter strip under the tabs: All, Ready, Waiting on me (generated, undecided), Rejected, Approved, Blocked. Default view Ready + Waiting on me.
4. Blocked entries greyed with the reason in plain words ("Approve Tom step 2 first"); GENERATE disabled until the needed art/raw file exists (HEAD request on load, cached).
5. Search box at the top filtering all tabs by title or id.
6. Remember last tab and scroll position; re-render only the changed card after APPROVE, REJECT or GENERATE.
7. Fold keys and spend into one collapsed Setup row once both keys are set.
8. Tab labels show progress (done/total) not just total.

Items 1 to 4 fix Tom's report; 5 to 8 are quality of life. Scope: art.html, make-prompts.js modules (group field), validate.js, test.py. No change to prompts or the approve flow. Bump the art.html `?v=` tags and the stamp, add a CHANGES entry, test with `python3 tools/art-library/test.py` and look at it in portrait and landscape.
