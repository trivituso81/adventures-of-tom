# Stop pasting API keys (keysecrets), plan and state

Tom, 2026-11-20: "now that we are storing api keys as secrets on the repo, can remove the ability to set API keys in the various admin UI screens?" He was told that a repo secret only reaches code that runs on GitHub (an Action), and that several admin buttons call a service straight from the phone with the pasted key. His choice: remove the key fields and route those buttons to Actions.

## What stays

The GitHub token box in the Art Library setup card. The page needs it to save approvals and to ask an Action for work. A browser cannot read a repo secret, so this one cannot move.

## The pattern (built in keysecrets1 for pictures)

1. A button commits a small request to `data/art-requests.json` on main with the message `art: generate <id>` (needs only the GitHub token the page already has).
2. The `art-gen` Action (repo secret `XAI_API_KEY`) runs on that push, empties the queue first (so it can never pay twice), makes the picture and keeps it on branch `artgen` with `index.json` and `artgen-report.json` (`at`, `asked`, `failed`, `skipped`, `made`).
3. The page polls branch `artgen` every 20 s (`pollPending` in `art.html`, pending requests kept in localStorage `aot-art-pending` for 40 minutes), imports the picture as the entry's next result and shows why when the run made nothing.
4. `publish.yml` ignores pushes that change only the request file.

A request carries the prompt text and ticked reference pictures as they were on Tom's screen; they replace the entry's own for that run. A repeat press of GENERATE makes another variant (the "already waiting" check is skipped for pressed ids).

## What cannot go through an Action

An entry made from Tom's own photo (`own` field, 14 entries, all approved today): the photo stays on his phone and must not be committed to the public repo. GENERATE says so and points to UPLOAD MY OWN.

## Stages

| Card | Scope | State |
|---|---|---|
| c-keysecrets1 | Art Library pictures through art-gen | built (keysecrets1) |
| c-keysecrets2 | Art Library videos (GENERATE VIDEO, GENERATE CHAPTER) through clip-gen; remove the xAI key and Relay boxes and the browser video code | not started |
| c-keysecrets3 | Voice Library takes and Script Editor takes through a new ElevenLabs Action; remove the ElevenLabs key box | not started |
| c-keysecrets4 | Music Library makes through a new music Action | not started |
| c-keysecrets5 | recast pages and the baker templates (`aot-baker-key`) | not started, needs a design call |

A key box goes away only in the build that moves its last button. Until then its label says what it is still for.

## Facts found while building keysecrets1

- Tests that fail identically without these changes (old, not caused here): `tools/art-library/test.py` (stale entry counts, then a click timeout), `tools/art-library/clip_batch_test.py` (five portrait checks).
- `artgen_test.py` had three stale checks (QA money counted in "spent"); fixed with `--no-qa` on those runs.
- Tests: `python3 tools/art-library/artgen_test.py` (now includes request mode), `keysecrets_test.py` (the page), `review_test.py`, `artgen_lib_test.py`.
