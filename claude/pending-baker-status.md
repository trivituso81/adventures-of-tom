# Pending Baker: MERGED AND LIVE (2026-10-27, game v323)

Tom baked everything and returned dialogue-pending.json (864 clips), voices_24.json (86 battle clips), music_2.json (6 tracks). All merged and published to the same artifact link in 3 batches (v321 to v323).

## Merge outcome
| Part | Result |
|---|---|
| Dialogue | New data/voice/dialog-ch22..24.js listed in DIALOG_CAST.files. 682 superseded old clips pruned from dialog-ch1..10 and ch21 (about 30 MB saved). Per-line speaker fx applied (206 re-baked monster/shared-voice lines). Boomie2 designed voice present. |
| Battle | data/voice-clips.js and data/voice/{tom,grace,rose,amy,deedee,boppy,tnb}.js rebuilt with vm.js. |
| Music | 6 mp3s in music/, MC_TRACKS updated, loudnorm via mm.py. |
| Tests | All 864 lines resolve via dvClip; smoke 0 errors; music routing tested headless. |

## Music wiring (engine/music-clips.js)
Bonus chapter 21 only: ns_party (default, and after ns-clear), ns_frozen (bakery), ns_hunt (hollow, or town once ns-goal), ns_boss (Brainfreeze fight), ns_win jingle after it. levelup plays once per level-up card after the victory jingle; synth chime is the fallback.

## Leftovers
- 10 lines for deleted ElevenLabs voices (Bun, Kenji, Fern, Dolores, Kit) keep old clips via the contraction alias. Re-bake only if Tom asks.
- 5 held Tombo-five clips are baked but unused.
- 3 Amy "story decline" lines (ch3, 4, 6) from engine/story.js were never checked to be spoken through a dialogue box.
- Lines in engine/*.js strings were not scanned by the baker.

## Tools (project docs)
pending-baker-template.html, pending-baker-mkdata.js, pending-baker-scripts.js build the baker. Merge: voice-merge.js (battle), voice-merge-dialog.js (dialogue), music-merge.py (music). Working copies vm.js, vmd.js, mm.py were adapted from these.
