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
