# clockwalk1 (2026-11-12 ~16:30, main 0c05a48): coin names on hover, party walks into Gate Zero after the clock

- Tom 16:07 (screenshot of the ch10 coin screen): hovering a coin in the tray should show its name. Tom 16:08: after completing the clock the party should walk into the next room by itself.
- Fact (DONE, pushed, smoke FAILS [], `python3 tools/closeup_test.py` FAILS []): engine/closeup.js gives each tray coin a `title` and, on mouse hover, the caption under the clock shows that coin's name (`closeup.hover`); leaving the coin restores the selected coin's name. Touch and keyboard already named the selected coin.
- Fact: `SCENES.ch10Door` (data/scenes.js) now ends with fade out, party moved to `gatezero` at (9,12) facing up (the same spot the door exit uses), fade in. TRIGGER `ch10-boss` (map gatezero, flag `ch10-door`) then plays the Last Call scene on arrival. Browser check: seventh coin in, map `gatezero`, `ch10-boss` set, 0 page errors.
- Tom's check: title stamp `build clockwalk1`; chapter 10, put all seven coins in: after the doors scene the screen fades and the party is in Gate Zero, then the Last Call speaks.
- Not done (fact): next.md was not rewritten this session; add this tag to its header and Live state when the next session rewrites it.
