# Grump Hollow: freeze or lag after a fight (Tom, 2026-11-05 09:29). NOT reproduced, nothing changed in the repo.

Tom's words: "i fought a monster in grumps hallow and the game freezes or at least lags after". No monster name, orientation or detail given yet.

## What was tested (headless Chromium, software rendering, repo at 5c61c14, Hollow installed in 192 `hollow4`)
| Test | Result |
|---|---|
| Fight each Hollow monster, win, measure frames after (portrait) | Hollow walking 20 ms avg, after fight 24 ms avg, one 100 ms frame, no stall |
| Compare map cost: town 18.5 ms, row 18.1 ms, hollow 20.4 ms | Hollow slightly heavier (31 foreground zones), not a freeze |
| Six fights in a row in the Hollow | JS heap flat at 445 MB, frame times flat, no leak (B7.mapFx, card timers, battle texts, music voices all 0) |
| Music: area loop vs battle loop (MAXLOOPS 3) | Hollow loop stays decoded through a fight, no re-decode after |
| saveGame auto after a win | 3 ms |
| Chapter 1 Hollow scenes via the real triggers (Mudling, Skeeter, Grump, Big Mudling and Big One, auto-won fights) | All four scenes finish, no stall, one 283 ms frame gap, no page errors |
| Monster chase code (engine/feel.js b7MonsterTick) | Greedy step only, no loop that can hang |

## Conclusion
Not reproducible on a desktop. Likely phone-only: memory pressure on iPhone Safari (about 445 MB JS heap before any painting or audio is decoded, plus plates, music loops, battle sheets) or a stale cache mixing old and new files after hollow4. Neither can be seen from here.

## Next step
Need from Tom: which monster, whether the victory card had been tapped, whether it recovers after a few seconds or needs the app closed, and whether a fresh reload (RELOAD button) then fights fine. If he wants it chased: add a small on-phone frame-time log (shows slowest frames and memory after each fight) so one fight on his phone gives the answer. Test scripts used are not in the repo (scratch only); the method is in tools/serve.py plus a rAF frame-gap loop around `__LE.startBattle(npc)`.
