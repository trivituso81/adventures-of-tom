# Props fix addendum (2026-11-09, main at 87a5e7e, CHANGES "propsfix1")

Tom reported ch04 switches wrong; audit had missed it (see claude/props-audit-11-09.md). Stop-loss method change: EDIT entries that attach the approved sheet and change only named cells ("EDIT THE ATTACHED IMAGE", precedent: Hollow lettering).

## In the Art Library, waiting on Tom (press Generate, then Approve or Reject)
- Edit entries (Props, Trail clues/finds): `prop-find-ch04-fix`, `prop-find-ch07-fix`, `prop-find-ch08-fix`.
- Redrafted full sheets (strict mode, exact count and order): `prop-find-ch10`, `prop-find-ch11-13`, `prop-find-ch19`.
- Code: tools/art-library/dungeonfind-prompts.js (`STRICT`, `editSheet`, `strict:true` on ch10, ch11-13, ch19).

## When Tom approves any of them
1. Check the new picture the same way as the audit: count, order, and POSE of every paired cell (levers up vs down, lamps on vs off, open vs shut).
2. Cut approved props by what is drawn, not cell index (key by border flood fill, tolerance 70).
3. If an edit entry misses twice, stop and tell Tom (stop-loss); do not send a third wording.

## Also pending (unblocked)
Crumb placement for Grump Hollow: `prop-trail-hollow` is approved. Follow claude/next-addendum-crumbs.md.

## Note
tools/art-library/test.py fails on main (Props counts out of date); not caused by this change.
