# bubble1 (2026-11-13, main d57bb80): NPC talk bubble sits directly above the head

- Tom 12:44: the three-dot bubble over an NPC sat beside the head, not directly above it.
- Cause: `drawTarget` (engine/town-render.js) placed the bubble at a fixed height above the feet and at the tile centre, ignoring the drawn figure height and the talking-gap nudge.
- Fix: for non-monster NPCs with a drawn height (`a._figH`, written by `drawSheetActor`), the bubble is centred on the figure (tile centre plus `a._tg.x`) and its tail ends 3 px above the head top (`base - _figH + _tg.y - 30`). Monsters and objects unchanged.
- Looked at: portrait and landscape with Dot and Pip on the Square. Not checked: Duo, an adult painted townsperson in landscape, a phone. Note: sprite frames with transparent padding above the head would leave a gap; if Tom reports a floating bubble on one person, measure that sheet's top padding.
- Waiting on Tom: title stamp `build bubble1` or later. Walk up to any NPC and face them: the dots bubble sits straight above their head.
- Not merged into claude/next.md (a rewrite of the whole file was skipped for a one-function fix): the next session should add a one-line bubble1 entry there.
