# Damage balance review (25 Oct 2026, artifact v255)

Method: claude/dmgprobe.js reads B2_SKILLS, B8_KITS and B2_STATS and resolves what each Stampcard slot actually plays
(b8Move logic). Damage = b2Damage base (atk x2.5 - def x1.2) x mult x hits, vs the average non-boss monster at that level,
at the slot's gate level (2/6/10/16/22/26) and at level 30. Totals assume 3 monsters (row 2, splash 1.8, all 3).
Ignores polish, buffs, elements, traits (Trending Meter, Shoulder Ride), crit chance under 100%.

## Verdict
- Tier ladder is sound: basic x1.0, node 1 x1.35 to 1.5, node 2 x1.2 to 1.5 (row) or 1.5 single, node 4 x1.6 to 2.0,
  node 5 x1.4 to 1.6 row or 1.8 to 1.9 single, Ultimates x3.2 to 4.0 on all. Most paths rise with each stamp.
- Root cause of the outliers: the move's stat does not match the character's strong stat (POW move on a WARMTH character
  or the reverse). The multiplier is fine; the character's stat is 20 to 40% lower than the one the path should use.
- Remix stand-ins (legacy moves that play until each Remix is built) are off-tier both ways; they disappear as Remixes are built.

## Problems found (Primary versions): ALL APPLIED in v270 (2026-10-26)
| Move | Problem | Fix |
|---|---|---|
| Rose A5 Floor Is Lava | POW on a WARMTH path: L30 59/119, worse than her A3 Giggle Storm (81/161) at higher cost | stat warmth, x1.6 |
| Tom B5 Know-It-All | 6 VP, x1.1 all: same total as B2 Konami Code (3 VP, 16 levels earlier) | x1.4 |
| Grace B path (Dance Battle, Beam Dismount, Split Leap, Chalk Up) | POW, her weakest stat: Acro-Star is the weakest path in the game; Chalk Up barely beats Beam Dismount | stat hybrid all four; Dance Battle x1.4, Chalk Up x1.8 |
| Deedee A4 Wine O'Clock | POW on the healer: 61 at L30, under half her other node-4 move | stat warmth, x1.6 |
| Deedee overall | WARMTH 16 to 99 is the top stat in the game: highest node-4, node-5 and Ultimate damage while also the main healer | Beanie Master x1.8 to 1.6, To the Moon and Back x3.7 to 3.4 |
| Amy A5 Pop Quiz | WARMTH on a POW character: 85 at L30 vs her node-4 136 | stat hybrid, x2.0 |
| TNB A5 Rush-Hour Racks | POW on a WARMTH path | stat warmth |
| TNB B3 Curb Appeal | POW, weakest node-3 damage | stat hybrid |
| Rose B2 Piggyback Pounce | x1.5 single at node 2, barely above node 1 | x1.7 |
| Nara A2 Don't Leave Me! | 4 VP, weaker than the 3 VP stand-in | 3 VP |
| Boppy B2 Seeds of Trouble | 4 VP; node 2 standard is 3 | 3 VP |

Probe result after the fix (L30 single/total): Rose A5 107/215, Tom B5 76/228, Grace B1 82, B2 82/165, B4 106, B5 106/212,
Deedee A4 138, B4 138, B6 294/882, Amy A5 128, TNB A5 117/234, B3 92/184, Rose B2 67.

## Left alone on purpose
- Kids' basics are 40 to 60% of adults' (Grace 44, Rose 40 vs Tom 70 at L30): low POW is the role. Grace's crits (x1.5 x Trend up to 1.5)
  and Rose's Shoulder Ride double hits make up much of it.
- Grace B6 Diamond Leotard Finale is single-target (344 at L30, always crits): the best boss hit, weakest vs groups. Intended.
- Tom's Ultimates are lowest in raw damage (A6 635 total) but carry shield break, 35% party heal and 3 VP.
- Remix rule: when a Remix is built, give it its Primary's tier multiplier (stand-in Ultimates run x2.0 to 2.8; some stand-in
  node-2/3 moves run high, e.g. TNB B3 Cone Six Kiln x2.1 splash).
