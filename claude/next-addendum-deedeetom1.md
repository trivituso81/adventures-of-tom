# next-addendum-deedeetom1 (2026-11-11 ~13:30, main b702ae8)

Read with claude/next.md (the live plan there is unchanged by this task).

## Done and pushed: Deedee says "Tom", not "Tommy" (Tom 12:56)
- Fact: 40 Deedee occurrences changed (28 dialogue lines, 1 toast, 2 battle lines `hug` and `moon_back`, travel stay-home lines, recruit and walking lines, map home-visit chatter). Full file list in docs/CHANGES.md (deedeetom1).
- Not changed (not Deedee's words, Tom has not asked): Boppy "Stand down, Tommy", "Take the key, Tommy", "My back doesn't hurt, Tommy"; Sal and Sol lines in chapters 13 and 17; the depot driver quoting Deedee in `engine/story.js` ("tell Tommy the letter has a SEAL"). If Tom says "all Tommy", these are the remaining ones.
- Mood tags re-keyed through the tsv files and `emotion-apply.py 1 ... 21` plus `npc-emotion-apply.py` (all lines found).
- VOICE: 30 baked Deedee clips with the old wording were purged, so those 30 lines are silent until Tom bakes them (Voice Library, filter No clip yet, speaker Deedee). Directions in `directions-20261101.json` and `battle-overrides.json` carry the new wording.
- Tests: smoke FAILS [], tag_check ok, unused_voice 0. Not looked at in the running game: a Deedee dialogue box on a phone (text and mood face).
- Tom's phone check: a Deedee scene (chapter 1 farmhouse, chapter 9 letter) shows "Tom" in the box, and she is silent on those lines.

## Rule learned
- A "change every X in a character's dialogue" order touches: scene and map text, `lines.js`, travel and follower strings, mood tsv rows (then the apply tools), baked clips (purge), harvest and directions JSON, the bake-list docs. Speaker-check every hit: other characters also say the word.
