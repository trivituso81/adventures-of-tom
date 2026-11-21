# C11 proposal: Chapter 11, The Layover Between Worlds (start of PART 2)

Proposed 2026-10-27, waiting for Tom's OK. Follows claude/part2-map.md row 11. Two build sessions: C11a (opening to the meeting), C11b (Vance, the boss, the ending).

## Start
- START NEW > PART 2 from a Part 1 clear save (everything carries over), or the chapter-select jump (level 13). CHAPTERS[11].start = the Rivituso house, the morning after Sunday dinner. SCENES.part2Open replaces today's "still being built" toast.

## Maps
| Map | New or reused | Notes |
|---|---|---|
| Rivituso house, Row, taxi depot, Terminal Zero, Gate Zero | Reused | Morning versions; Sal's cab |
| Flight Zero cabin | Reused flight cutscene | Glitches, tears, falls through a pixel sky |
| Terminal Infinity: Gate 00 | NEW (terminal renderer, recolored dusk gold) | Arrival gate, big window showing two glass domes (Long Island, LA) |
| Terminal Infinity: the Endless Concourse | NEW | Gates to paused towns (GATE 7 CHICAGO: PAUSED), moving walkways, Boarding Gate benches (swap spots), monsters |
| Lost & Found | NEW room | Optional: the counter of things nobody came back for; Heart-Trace |
| Gate Infinity | NEW | Departures board; boss arena |

## Beats in order
1. Rivituso house, morning. Deedee packs Tom a crisp for the flight. Glasses beat: they're in the crisp tin. Boppy in the recliner turns a gold card over in his hand and pockets it when Tom looks: "Junk mail." (the seed).
2. Tom's pass buzzes: YOUR LAYOVER IS NOW BOARDING. Goodbyes. Sal drives Tom alone to Terminal Zero. Party: Tom only.
3. Flight Zero. Rose BOOs out from under the legroom blanket, Grace right behind her. Amy sprints down the jet bridge as the door closes. The sky glitches, rips, and the plane drops through.
4. Gate 00. Party Tom, Amy, Grace, Rose. Speaker announcements; a goal toast.
5. Concourse fights (story fights with tips), then TNB and Nara come up the far jet bridge (their plane from LAX tore too). Nara bolts to Tom; puddle. The meeting: TNB meets Amy and the girls for real. Rose rides TNB's longboard; Nara licks Grace's glitter nails; Amy and TNB size each other up, then team up.
6. The girls turn the gate lounge into a blanket fort: SLEEPOVER AT TATA'S. Sets tombo:ff1 (Sleepover at Tom's: Tom, TNB, Grace, Rose). Tip in the next fight.
7. The bench: six people now, four fight. Any Boarding Gate bench swaps who's out front (Tom stays in). Tutorial toast.
8. Lost & Found (optional): a counter of things nobody came back for, each tagged with a little gold clock. Heart-Trace.
9. Gate Infinity. The man in the long coat takes off his hat: Julian Vance. Short, calm, sad. Every other town on Earth is paused at its happiest afternoon. Long Island and LA kept moving because Tom kept flying. He thanks Tom for opening Gate Zero. He wants to keep everyone safe "in the good part, forever". Tom: "No, thank you." Vance calls FINAL CALL and leaves.
10. Boss: FINAL CALL.
11. After: the board flaps. LONG ISLAND: CLOSED. Through the window, the Long Island dome turns amber. Amy calls Deedee: it rings and rings. Rose: "Is Deedee okay?" Tom: "We'll go get them. We always make our connection." Only LOS ANGELES is open. Heart-Trace, CHAPTER 11 COMPLETE, autosave, toast that chapter 12 is still being built.

## Monsters (Friction Sprites of air travel; Claude draws them until Tom sends art)
| Monster | Level | Gimmick | Weak to | Kindness favorites |
|---|---|---|---|---|
| Lost Luggage | 12 | Steals a bag item; goofable | Kinetic, Chatter | SILLY, Squishy Squeeze |
| Red-Eye | 13 | Yawn: Drowsy on one member | Sparkle, Cozy | DANCE, Bedtime Story |
| Standby Sprite | 13 | Pushes a member back on the turn ribbon | Splash, Kinetic | WARDROBE, PEP TALK |

## Boss: FINAL CALL (level 15, Gatekeeper Automaton: a departures board on robot legs)
- NOW BOARDING GROUP N: every third turn it calls a party slot; that member is sent to the bench for one turn unless someone DEFENDs them (teaches the bench and DEFEND).
- GATE CLOSED shield: 2 Sparkle or Chatter hits, or any Tombo / Family Finish (Sleepover at Tom's is the hinted answer).
- Below half: DELAYED, DELAYED, CANCELLED (a party-wide hit, telegraphed).
- Kindness: it has never once got to fly. Favorites: Sleepover at Tom's, SILLY, Next Stop. Un-Grumped, it flips its own board to ON TIME.

## Dialogue samples
- Boppy: "Junk mail. They send it to the guy in the recliner now."
- Amy (out of breath): "I'm their ride home. And I'm faster than you."
- Rose: "BOO! We're stowaways! Tata, what's a stowaway?"
- TNB: "So you're Grace. Tom shows me all your videos. You're very good at telling people to subscribe."
- Grace: "Thank you. Subscribe."
- Vance: "You opened every door I couldn't. Thank you for flying nowhere, Tom."
- Tom: "No, thank you. We have a connection to make."

## Engine work
- Party of up to 7 in Part 2 (PARTY_MAX 4 fighting; the rest on a bench), swap menu at bench objects; save format keeps the bench.
- FINAL CALL boss branch (b2BossOpen / b2BossTurn / b2CheckPhase), the bench-call move.
- New map specs in data/maps-le.js style (or a new data/maps-p2.js), reusing engine/terminal-render.js.
- CHSEL_LAST 11, CHAPTERS[11] party rules, chapter 12 locked with a toast.
