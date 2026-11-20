# next-addendum: buildlog1 (2026-11-14 09:05, main 0b05552)

Read this together with claude/next.md. This session did NOT rewrite next.md: another session (amberspot1) had edited it minutes earlier and was still working, and a full overwrite risked wiping its notes. Merge the lines below into next.md the next time you rewrite it.

## buildlog1: build label with its time, tap it for the build history. DONE, pushed, waiting on Tom's phone check
- Tom 08:53: a better way to see which build is running, on the welcome screen and in the menu; a timestamped history of build names he can open by tapping the label; one day at a time (today first) because the whole history is hard to use.
- Welcome screen: the label is now a framed chip at the TOP LEFT (was 10 px faint text at the bottom left): `build <name>` with day and time under it. Menu: a Build box under Time and Coins. Tapping either opens BUILD HISTORY (engine/build-history.js): which build this phone runs, a day bar (arrows skip days with no builds, ALL DAYS button), one row per build (time, name, one line of what changed), the phone's own build marked ON THIS PHONE. The list asks the server for the newest list, so a phone that is behind says how many builds are newer and shows a RELOAD button.
- Data: data/build-history.js (94 builds back to 2026-11-12, backfilled from the commit log). Written only by tools/build_history.py.

## Standing rule for every session (also in the repo CLAUDE.md, "Build label and build history")
- Every push gets its own new build name. Never reuse one (clips11 was used twice on 11-13 and 11-14; the history can only show one of them).
- Write the build's heading in docs/CHANGES.md FIRST, shaped `## <tag> (<date>): <one plain line>`. That line is what Tom reads in the history.
- Then `python3 tools/art-library/bump_tags.py <TAG> --base origin/main`. It now also runs `tools/build_history.py add <TAG>`, which stamps the build with the time now. No extra step.
- Never hand-edit data/build-history.js. Rebase conflict in it: take upstream, run `python3 tools/build_history.py add <TAG>` again.
- tools/smoke.py now fails when the title stamp's build is not the newest history entry (fix: the `add` command it prints).
- The stamp line in engine/main.js is still exactly `d.textContent='build <tag>';`. The stamp element is now a button with id `build-stamp`; `BUILD_TAG` is a global.

## Test
- `python3 tools/buildlog_test.py [OUT]` (26 checks, portrait and landscape, screenshots in OUT). Passed on the pushed code, frames looked at in both layouts. Smoke FAILS [].
- NOT done: Duo, a real iPhone, gamepad (the list is touch, mouse and keyboard only; Escape closes it).

## Waiting on Tom
- Welcome screen, top left: a chip reading `build buildlog1` (or later) with a date and time. Tap it: BUILD HISTORY opens on today. Menu: Build box under Coins, tap it: same list.

## If Tom reports
- Label too small, too big or in the way: `#build-stamp` and `.mbuild` styles at the end of the `<head>` in index.html.
- Wants other filters (search, this week): `buildHistoryRender` in engine/build-history.js.
- A build missing from the list: `python3 tools/build_history.py sync` fills in anything found in the commit log.
- Times look wrong: they are shown in the phone's own time zone, and are the moment the build was tagged, a minute or two before GitHub Pages serves it.
