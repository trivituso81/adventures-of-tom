# board-sync stuck since 2026-11-19 19:45 PT: diagnosis and fix (build tag syncfix1)

Found 2026-11-19 22:50 PT by a session that could read the repo but was refused push access (add_repo denied), so nothing below is pushed yet.

## What is stuck

The board-sync job has not committed since 02c4fbf (03:45 UTC, 19:45 PT). Every run since then fails at its "Check the board file" step, so no card has moved for an hour. Seven Claude cards shipped (their `## <tag>` heading is in docs/CHANGES.md) but still sit in In progress: c-clipposes, c-reports, c-ch1retext1, c-heistart, c-fix-ch1starving, c-bannerhold1, plus c-artgen1 claims.

## Cause (confirmed by running tools/board_sync.py then tools/board_check.py on a local copy of main)

`r7_inbox` in tools/board_sync.py: in the same run, `r3_heading` closes c-reports (reports-2026-11-19c heading). The inbox still holds one open report (mxvd), and r7 looks only for an OPEN card with id `c-reports`. It finds none and adds a new card with the same id `c-reports`. board_check refuses: `duplicate card id c-reports`. The job exits before pushing, and the next run hits the same thing.

## Fix (tested: sync then board_check gives "board ok (232 cards, 5 lanes)"; c-reports goes Done, a new c-reports-2 "Fix the report backlog (1 open)" is added in Up next)

```diff
-        card = next((c for c in B.cards if c['id'] == 'c-reports' and c['col'] != 'done'), None)
+        card = next((c for c in B.cards if (c['id'] == 'c-reports' or c['id'].startswith('c-reports-')) and c['col'] != 'done'), None)
...
-                B.add({'id': 'c-reports', 'tag': 'reports-' + B.today, ...
+                B.add({'id': next(i for i in ['c-reports'] + ['c-reports-%d' % n for n in range(2, 999)] if not B.get(i)), 'tag': 'reports-' + B.today, ...
```

Add a test in the board tests: a board with c-reports Done plus one open inbox report must produce a unique id and pass board_check.

## Other stuck cards (not caused by the job)

| Card | Why stuck | Action |
|---|---|---|
| c-cutpolish5 | START run could not read claude/cutscene-polish-plan.md (not in repo then). copydocs has since copied it (claude/cutscene-polish-plan.md and claude/handoff-rules.md now return 200 on main). | Move back to Up next with a history line, so START reruns it. |
| c-nextclean | Same: claude/next.md was not in the repo. Now copied by copydocs. | Move back to Up next, same. |
| c-takes-2337ed | Card tag is takes-2026-11-19 but the work shipped as takes1 (board-sync made a separate Done card b-takes1). The tag never matches, so it never closes. | Retire to Done with a history line pointing to takes1. |
