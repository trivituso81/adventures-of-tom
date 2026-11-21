# Loading screen gate (11-06 18:44, CHANGES 415, `bootgate1`, push bb71aae)

- Fact: the #boot card used to hide on the first game frame, before `art/welcome.webp` (or `welcome-land.webp`), `art/title-logo.webp` and the nine welcome atlases (`tomOw`, `graceOw`, `roseOw`, `tnbOw`, `amyOw`, `deedeeOw`, `boppyOw`, `naraOw`, `justinOw`) had downloaded, so they popped in after.
- Change: `bootReady()` in engine/main.js holds the card until those are loaded and decoded; 25 s fallback; failed files count as done. If a new character joins the welcome cast, add its id to the list in `bootReady()`.
- Tested: throttled phone profile in Playwright (screenshot at the moment the card hides shows the whole welcome screen), smoke FAILS [], tag_check ok. Phone not tested: Tom to check the welcome screen after the card fades, and whether the card now stays up a bit longer (it waits for about 1 MB more art).
- Still POST-BUILD only (CLAUDE.md Load time rule): voice as mp3, a real progress bar, per-character data loading. Mention at most once.
- next.md was not rewritten for this (it is over its size cap); fold this into it at the next handoff.
