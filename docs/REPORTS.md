# In-game reports (report1, 2026-11-14)

Tom reports bugs and changes from inside the game. Claude works through them when Tom says **"Fix the backlog"**.

## What Tom does

1. Taps the pencil tab on the right edge of the screen (drag it up or down to move it). The game freezes on that exact frame: animation, timers, the game clock and sound all stop.
2. Types or dictates the note, taps the picture to drop numbered pins (up to 9, UNDO PIN removes the last), picks BUG, CHANGE, ART or DIALOGUE.
3. Taps SEND. The game continues where it stopped. A message at the top says "Report sent." or why it is waiting on the phone.

The tab shows on any device that has the GitHub token saved (the same token the Art Library uses, `aot-gh-token`), or when ADMIN > REPORT TAB is ON. ADMIN > REPORT TAB: OFF hides it. The report form is always drawn the way the phone itself is held, so the keyboard lines up with it; in the game's turned landscape layout Tom holds the phone upright to type. SHARE (iPhone only) hands the picture and the note to the share sheet instead of filing it, for pasting into a chat.

## Where a report goes

Branch `inbox` of this repo (no shared history with `main`, never served), two files per report, written by the phone through the GitHub contents API:

| File | Holds |
|---|---|
| `reports/<id>.jpg` | The frozen screen with the pins drawn on it, in the game's own orientation |
| `reports/<id>.json` | `note`, `kind`, `pins` (x and y as shares of the picture), `at` (Tom's local time), and `where` |

`where` records: `mode` (title, map, dialog, cutscene, battle, menu, shop, closeup), `build`, `screen` (layout, rotated, Duo, size), `story` (chapter, goal text), `map` (id, Tom's tile and facing, camera, zoom), `party`, `bench`, `walkers` and nearby NPCs with tiles and facings, `scene` (the SCENES id that was playing, from `intro.sid`), `dialog` (speaker, page, full line, text shown so far), `battle` (actor, move, foes, HP, message), `flags` (all story flags), `faults` and `errors` (the last game hiccups and page errors), and `save` (a full save snapshot of that moment).

A report that cannot be sent (no connection, no token, GitHub error) stays on the phone in IndexedDB `aot-reports` and goes out by itself on the next report, when the phone comes back online, or 9 seconds after the next launch.

## "Fix the backlog": what Claude does

1. `python3 tools/reports.py list` (fetches `inbox`, copies every open report to /tmp/aot-reports, prints the backlog). Read each note, LOOK at each picture, read the json when the note needs the exact place.
2. Group reports that touch the same thing. Reproduce before fixing: the json gives a `reaction_test.py` case almost directly (`ch` = story.chapter, `map` = map.id, `start` = [map.x, map.y, map.facing], `party`, `bench`, `scenes` = [scene.id], `flags`, `layout` = screen.layout).
3. Fix, test, look at frames in portrait and landscape, push to `main` as usual. Each fix's docs/CHANGES.md entry quotes Tom's note and the report id, so the history holds the record.
4. `python3 tools/reports.py done <id> ...` for every report that is fixed and pushed. This deletes its two files from `inbox`.
5. A report that needs Tom (a decision, new art from the Art Library, something that cannot be reproduced) is NOT deleted: say so in the reply with the one question or the one Library step, and leave it open. The stop-loss rule applies per report.
6. Tell Tom per report: fixed (and what to look at on the phone), or still open and why.

## How it works (engine/report.js, loaded first in index.html)

- Freeze: the file wraps `requestAnimationFrame`, `setTimeout` and `performance.now` at load. While frozen, frames and timers that come due are held and the clock stands still; on thaw they are released and the clock continues from where it stopped, so nothing in the game needs to know. `sound.ctx` is suspended; `wakeAudio` (engine/audio.js) will not wake it while frozen. `setInterval` is not held (the 60 second "came back to the app" reload in engine/main.js skips while a report is open).
- Tests must not use Playwright `wait_for_function` while a report is open (it polls with frames or timers, which are held): poll with `evaluate` in a loop, as tools/report_test.py does.
- Picture: iPhone Safari cannot screenshot a page, so `brpCapture` paints `#stage` itself: every canvas, box (colour, gradients, background pictures, borders, rounded corners, clipping), `<img>` and word of text, in the stage's own orientation. Known gaps: box shadows, CSS clip-path shapes (battle command arrows draw as squares), a few icon glyphs. The json carries the exact state for anything the picture misses.
- Test: `python3 tools/report_test.py [OUT]` (stand-in GitHub through the game's `?gh=` address; portrait and landscape; title, map, dialogue, menu, battle). Look at `OUT/*-sheet.png`: real screen left, phone picture right.
