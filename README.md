# The Adventures of Tom

A 16-bit JRPG starring Tom's real family. Plain browser JavaScript, no build step. Chapters 1 to 10 are built.

This repo is the source of the game (everything except the baked voice audio). If you are Claude, start with [`CLAUDE.md`](CLAUDE.md).

## Run it

```
pip install playwright pillow
python3 -m playwright install chromium
python3 tools/serve.py          # open http://localhost:8000/index.html
python3 tools/smoke.py          # headless test: boots, plays real battles, checks portrait and landscape
```

The game must be served over http; opening `index.html` directly will not work. It is silent in this repo because the voice clips are not included (see [`docs/VOICE.md`](docs/VOICE.md)).

## Docs

| File | What it is |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Working agreement, hard rules, where things live |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Load order, content model, saves, hosting |
| [`docs/CANON.md`](docs/CANON.md) | Cast, voice and tone, decided facts |
| [`docs/BATTLE_SYSTEM.md`](docs/BATTLE_SYSTEM.md) | Battle rules, animation primitives, gotchas |
| [`docs/MOVE_KEYS.md`](docs/MOVE_KEYS.md) | Every character's current move keys |
| [`docs/VOICE.md`](docs/VOICE.md) | What the voice stubs are, how spoken lines work |
| [`docs/WORKFLOW.md`](docs/WORKFLOW.md) | How this repo relates to the live game |
| [`docs/NEXT_TASKS.md`](docs/NEXT_TASKS.md) | The approved next builds |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Tom's vision |
| [`docs/CHANGES.md`](docs/CHANGES.md) | Change log and known gaps |

Exported from the live game, artifact version `1792983007-0e46` (v252), 25 Oct 2026.
