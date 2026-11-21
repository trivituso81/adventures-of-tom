# Picture generator fallback: xAI first, WAN after 2 misses (artfallback, 2026-11-21)

Tom, 2026-11-21 09:49: "I've noticed that there are some requests that have come up on the board more than three times, possibly more than five times, and I feel like we should use XAI as the default for images, but then if there are more than two failed attempts with XAI, then we should switch the image service to WAN." Approved 09:54 ("I say go") with the five refinements below.

Scope: Art Library pictures only (the `art-gen` Action, `tools/art-library/artgen.py`, and the Library's own GENERATE requests through `data/art-requests.json`). Battle videos keep their own route (`claude/video-battle-plan.md`). Voices and music are not touched.

Evidence for the rule (from `data/board.json`, 2026-11-21): the item sheets went through 4 fix rounds (c-fix-itembannerart-pics to -4), the chapter 1 picture check 3 (c-fix-cutpolish4b to -3), the gate pictures 2. Round 4 of the item sheets was fixed on xAI by changing one phrase, so some misses are prompt problems, not service problems.

## The rule

| # | Rule | Detail |
|---|---|---|
| 1 | Count per picture | Failures are counted on the Art Library entry (its `rejects` list), never per card, so a new Fix card does not reset the count. |
| 2 | What a failure is | Tom's REJECT of a generated result, or a generator refusal or error with no picture. A reject of his own upload (UPLOAD MY OWN) does not count. |
| 3 | Service ladder | Tries 1 and 2 on xAI (`grok-imagine-image-2.0`, today's model). After 2 xAI failures, the next try goes to WAN on fal (`fal-ai/wan/v2.7/edit` when the entry has reference pictures, `fal-ai/wan/v2.7/text-to-image` when it has none; repo secret `FAL_KEY`, already set). Read the live fal price before each call, as `wangen.py` does. Prices read 2026-11-21: Wan 2.6 text-to-image $0.03, Wan 2.2 image-to-image $0.05; 2.7 to be read live. |
| 4 | Smallest change on the switch | The first WAN try sends the last xAI prompt word for word, with the same reference pictures. Only the service changes. After that, a WAN miss is fixed by a prompt edit on WAN (CLAUDE.md "Fix a miss with the smallest change"). |
| 5 | Hard stop | After 2 WAN failures (4 paid tries in all), the entry is not generated again automatically. The board gets one Tom card (ask `pictures` or `decide`) naming the one thing that would fix it, usually a reference picture he supplies into the Library. This is the stop-loss rule made automatic. |
| 6 | Show the service | Every result and every reject records `svc: "xai"` or `svc: "wan"`. The Art Library review shows "made by xAI" or "made by WAN" on each result. `artqa_report.py` (or a small new report) tabulates approvals by service and by try number, so the rule can be tuned on evidence after about 20 switches. |

Decision made here: rejects already on entries before this build have no `svc` and are counted as xAI (every picture so far was made on xAI). So an entry already rejected twice goes to WAN on its next make.

## What to build

1. `artgen.py`: a service chooser per entry from the rules above; a fal client (reuse the queue, polling, ledger and cap code from `wangen.py`, do not duplicate it: move the shared parts into one module both import); `svc` on every result in the index; the hard stop as a state (`stopped`, with the reason) that `classify` returns and the card shows.
2. `art.html`: show `svc` on results; write `svc` into the reject record; show "Stopped after 4 tries: needs your reference picture" on a stopped entry.
3. The `art-gen` run: when an entry reaches the hard stop, add two cards in one board update. A Tom card (ask `pictures`, `links` to the entry, "Add a reference picture to <entry> in the Art Library") that blocks a Claude card ("Remake <entry> from Tom's reference picture", Opus 5.5 medium, row D: a generator prompt). One pair per entry, never a second pair for the same entry.
4. `.github/workflows/art-gen.yml`: pass `FAL_KEY`.
5. Costs: append WAN calls to the costs `usage` log like the other spending Actions (docs/COSTS.md row 2).
6. Tests: extend `tools/art-library/artgen_test.py` (ladder: 0, 1, 2 xAI rejects, 1 and 2 WAN rejects, upload rejects ignored, refusal counts, old rejects without `svc` count as xAI, stop state) with a fal stand-in (`FAL_QUEUE` env, as `wangen_test.py` does). No paid call in the session: the first real WAN picture is Tom's tap.
7. Docs: a CLAUDE.md paragraph (artfallback1) under artgen2, a docs/CHANGES.md entry, this file's Built section.

## Built (artfallback1, 2026-11-21, card c-artfallback)

Built as the plan says, with these decisions where the plan left a choice. No paid call was made; every test uses the stand-in xAI (`stub.py`) and a stand-in fal queue (`FAL_QUEUE`, `FAL_API`) in `tools/art-library/artgen_test.py`.

| Plan item | What was built |
|---|---|
| 1 Chooser, fal client, stop state | `plan_service(entry)` in `artgen.py` (2 xAI tries, then WAN, then stop); `classify` returns `stopped` ("Stopped after 4 tries: needs your reference picture") and a `svc` and `try` on every make row. The fal queue code (price, send, poll, download, errors, key scrubbing) moved out of `wangen.py` into `tools/art-library/falq.py`; `wangen.py` and `artgen.py` both import it, nothing is copied. WAN calls: `fal-ai/wan/v2.7/edit` with the references as data addresses, `fal-ai/wan/v2.7/text-to-image` with none, the last prompt word for word, `num_images` 1, and for text-to-image an `image_size` from the entry's shape (long side 1024). The live fal price is read before each call and the higher of it and the $0.08 estimate is booked and counted against the run's cap. The picture fal returns (often a JPEG) is kept as a real PNG. |
| 2 `art.html` | `svcPlan` (same rule, tested against the Python in node), "made by xAI" or "made by WAN (try n)" on each result in the entry and in the review, `svc` and `try` (or `up` for his own upload) written next to every approve and reject, the stopped banner on a stopped entry. |
| 3 Stop cards | When an entry is stopped (found stopped when asked for, or stopped by this run's own failures) the run adds `t-artstop-<id>` (ask pictures, link to the entry, `done_when.art_approved`, blocks the Claude card) and `c-artstop-<id>` (Opus 5.5 medium, row D, waits on Tom). Ids are fixed per entry, so never a second pair; the archive is checked too. The cards pass `tools/board_check.py`. |
| 4 Action | `art-gen.yml` passes `FAL_KEY`, and checks out `data/costs.json` and `data/board-archive.json`. |
| 5 Costs | A run that spent on WAN appends one row to `usage` in `data/costs.json` (service fal, the estimate booked, the entry ids, the run address). Fact: no other Action appends to `usage` yet (COSTS.md row 2 is still open), so this is the first; xAI spend is not logged by this build. |
| 6 Tests | `artgen_test.py` section 7: the ladder for 0, 1, 2 xAI rejects, 1 and 2 WAN rejects, upload rejects ignored, refusals counted, old rejects with no service counted as xAI, the stop and `genreset`; the same cases in `art.html` via node; end to end through the stand-ins. Report: `tools/art-library/artsvc_report.py` (by service and try number). |

Decisions made here (the plan did not say):

| Question | Decision |
|---|---|
| What counts as a "generator refusal or error with no picture" | An xAI or fal answer that is a 4xx other than the key (401, 403) and a rate limit (429), or an answer with no picture. A 5xx, a timeout, a missing or refused key, or fal saying the request body does not fit its schema (a 422 whose detail lists fields) never counts: nothing was judged about the prompt, so burning a try would be wrong. Those runs report the failure and write nothing to the entry. |
| How a refusal is recorded | A reject on the entry with `auto: true`, `from: "gen"`, `svc`, `try`, a note, and the time as `gat` (not `at`), so it counts as a failed try but is never read as Tom's decision on a picture (the Library's "waiting for review" logic only reads `at`). |
| Tom's own uploads | New reject records of an upload carry `up: true` and never count. Rejects of uploads made before this build have no marker and cannot be told apart, so they count as xAI. |
| How a stopped entry starts again | The remake card's session sets the entry's `genreset` to the current time in milliseconds; only failures after it count. |
| Try number | `try` is the try within the service (xAI 1 or 2, WAN 1 or 2), so the report has four rows. Records with no `try` are numbered by their place among the entry's records of that service, so old xAI rows run past 2 in the report. |
| What the stop card asks Tom | UPLOAD MY OWN on the entry and APPROVE: approving saves the picture under `art/raw`, where the Claude card can read it (a picture left unapproved lives only in his browser). |

Open fact for the first real WAN picture (Tom's tap): the fal input schema of `wan/v2.7/edit` and `wan/v2.7/text-to-image` could not be read in this session (the page fetch needed approval nobody gave), so the body fields are the ones the other fal image models use (`prompt`, `image_urls`, `num_images`, `image_size`). If fal answers 422 with a field list, the run reports it as a bug and counts no try; the fix is one change to `wan_make` in `artgen.py`.

