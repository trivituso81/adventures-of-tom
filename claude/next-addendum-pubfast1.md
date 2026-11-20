# pubfast1 (2026-11-18): why new versions reach the phone slowly, what was changed, and the plan for pubfast2

Tom (11-18 09:00): "when claude make a new version of the app in github, its been taking longer and longer for it to become available to me on the web".

## Status (11-18 09:35 PT): the new publish is ON and its first run worked

- Tom changed Settings > Pages > Source to "GitHub Actions" at about 09:29 PT. Nothing is waiting on Tom.
- Checked with a manual run of `publish.yml` (run 44359608054, main b6798f4): `check` read "Pages source: workflow", `build` took 2 min 14 s (1.93 GB bundle), `deploy` reported success, deployment status "success" at https://trivituso81.github.io/adventures-of-tom/. Whole run: 2 min 40 s.
- That deploy step took only 9 s because the built-in publish had put the same commit live 4 minutes earlier. Expect about 60 to 100 s on changed content, so about 3.5 to 4 min a publish until pubfast2.
- Not yet seen (the pubfast2 session checks these with `gh run list --workflow publish.yml --limit 20`, then `gh run view <id> --json jobs`): a publish started by an ordinary push; several pushes close together (one runs to the end, only the newest waiting one follows, older waiting ones show "cancelled", which is correct); a publish after `art-bake` (event `workflow_run`); the deploy time on changed content.
- The live page could not be opened from the sandbox (curl is blocked). GitHub's deployment status is the evidence.
- If a publish ever fails: read the deploy log, fix publish.yml; the way back is Source = "Deploy from a branch" (branch main, folder root).

## Facts (measured from 1,105 publishes, 2026-11-11 to 11-18, before the switch)

| Thing | Number |
|---|---|
| One publish (GitHub's built-in "pages build and deployment") | about 3.7 min: checkout 76 s, bundle and upload 82 s, GitHub deploy 64 s |
| Published site size | 2.17 GB (GitHub's limit is 1 GB; a deploy times out at 10 min) |
| Warning in every publish log | "Uploaded artifact size of ... bytes exceeds the allowed size of 1 GB. Deployment might fail." (still there at 1.93 GB) |
| Biggest folders | art/raw 1.3 GB (grows with every APPROVE), tools/sprite-bake/src 244 MB, data/voice 219 MB, art/chars 155 MB |
| Publishes cancelled by the next push | 60 to 90 percent on busy days (11-11: 390 of 436; 11-14: 301 of 359) |
| Real wait from a push to live | 6.7 min typical, 14.4 min for the slowest tenth, 43.8 min worst |

Two causes: (1) the built-in publish cancelled the one in progress whenever another push landed, and an Art Library APPROVE alone makes three pushes; (2) each publish carries the whole repo, and that grows.

## What pubfast1 did (main f121740)

- `.github/workflows/publish.yml`: publishes main itself, one at a time, never cancelled, newest waiting push next, also after `art-bake`. Leaves `tools/sprite-bake/src` off the site (no page reads it).
- Replaying the week's real pushes through the new queue at 3.8 min a publish: 5.5 min typical, 7.6 min worst. docs/WORKFLOW.md says "4 to 5 typical, under 7 at worst" and that the workflow is off until the setting changes: correct both lines in pubfast2.
- docs/WORKFLOW.md "How main reaches the phone" holds the facts and the rule for leaving folders off the site.

## pubfast2 plan (not built): take art/raw off the site

Goal: site about 0.75 GB (under the limit), a publish about 1.5 min, wait about 2 min typical and 3 min worst.

Who reads art/raw from the site today (checked 11-18): only three admin pages. The game never does.

| Page | What it reads | Plan |
|---|---|---|
| art.html | reference thumbnails (`refMiss`, line about 270 and 428), the "is it published" HEAD probe (about 247, message "the site has not published it yet"), reference pictures for GENERATE (about 386) | read `art/raw/` paths from `https://raw.githubusercontent.com/trivituso81/adventures-of-tom/main/<path>` first (public repo, no token, fresh seconds after a push, so the "give it 2 minutes" wait goes away), then the site, then the GitHub API with the token (use `Accept: application/vnd.github.raw` so a picture comes as bytes in one call) |
| portraits.html | `art/raw/characters/<id>-hero-v{3,2,1}.png` and `-hero-ref-v1.png`, drawn on a canvas | keep these 34 files (97 MB) on the site: add them back in the sparse list |
| flight-preview.html | approved `art/raw/flight` files, drawn on a canvas | keep `art/raw/flight` (13 MB) on the site |
| engine/art-clips.js | approved videos in `art/raw/clips` | keep `art/raw/clips` (3.4 MB) on the site |

Sparse list for publish.yml then: `/*`, `!/art/raw/*`, `/art/raw/clips/`, `/art/raw/flight/`, `/art/raw/characters/*-hero-v*.png`, `/art/raw/characters/*-hero-ref-v1.png`, `!/tools/sprite-bake/src/` (test the pattern on a local copy: `git clone --no-checkout --depth 1 file://$PWD /tmp/trim; cd /tmp/trim; git sparse-checkout set --no-cone <patterns>; git checkout main`).

Test before pushing: serve the trimmed copy, open every admin page (art, portraits, flight-preview, poses, heads, areas, voices, script, music) and the game with Playwright, log every 404, and compare with the same run on the full tree; in art.html route raw.githubusercontent.com to the full tree and check every visible thumbnail loads and a chained entry is not shown as blocked. Risk to watch: raw.githubusercontent.com can throttle heavy unauthenticated use, which is why the API fallback stays.

Order: make the art.html change first and push it (it works with art/raw still on the site), let Tom use the Art Library once, then add the sparse lines.

Prompt for that conversation: "Read claude/next-addendum-pubfast1.md and build pubfast2."
