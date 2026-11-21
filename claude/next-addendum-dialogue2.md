# Dialogue overhaul handoff (dialogue2, rewritten 2026-11-12 23:50). STOP-LOSS APPLIED. claude/next.md was NOT edited by this session.

## State (fact)
- claude/voice-sheet.md: APPROVED by Tom 2026-11-12 23:15 (its own status line still says DRAFT; treat it as approved for WHO the people are).
- claude/dialogue-ch12-script.md (v2) is REJECTED. Nothing is built. Main is unchanged for dialogue (487a58e).
- A readable copy of the rejected v2 is the Docs artifact "Chapter 12 script: Welcome to Jefferson Park, Girls" (https://claude.ai/artifact/EEPhVyVJpDUmefUuKMoVGK). Reuse that doc for the next draft (replace its sections) so Tom has one link.

## What was tried and Tom's verdicts
| Try | What it was | Tom's verdict |
|---|---|---|
| v1 (23:20) | Full chapter 12 to the voice sheet, same page counts, 32 lines kept word for word | "It needs to be funnier and wittier" |
| v2 (23:45) | 40 lines sharpened in place | "It feels like there's just light tweaks happening rather than a total restructuring based on the entire sequence of the dialog." |

Tom, 23:43, close to his words: "Anything can change here: the amount of stuff that one person says to the other, the pacing, the number of interactions, all of these things are open for change. I just really want it to be really funny and especially witty, something that makes the viewer chuckle or smirk instead of roll their eyes because it's some corny kids dialog."

## Why it failed (diagnosis)
1. I wrote inside the old skeleton. Same page count per scene, same speaker order, 32 old lines protected for their recordings. A joke swapped into an old slot is still the old scene: kid asks, adult answers, neighbor says a cute line.
2. Wit is structure, not line polish. v1 and v2 have single gags and almost no setups that pay off later, no escalation, no scene where two people want different things and are funny about it.
3. The kept neighbor and boss lines are in the corny register and they anchor every scene they sit in.
4. This conversation is full of the rejected drafts. A third pass here would anchor on them.

## CONSTRAINTS NOW (replaces the "Hard constraints" table in claude/dialogue-overhaul-brief.md)
- OPEN (Tom 23:43): number of pages, who speaks, how long anyone talks, pacing, number of exchanges, order of exchanges inside a scene. No old line is protected. Assume every line gets re-recorded.
- STILL FIXED: the nine scenes and their order, maps, fights, art, the plot facts below, the canon rules (contractions, no em dashes, "Tata", Tom and TNB caring, nothing inappropriate, a child can still follow it). If a new scene needs a staging step that does not exist, list it for Tom.

## Plot facts each scene must land (no dialogue here on purpose)
1. ch12Open: the layover door's clock shows 3 4 6 8, Tom's LA house number; everyone goes through together.
2. ch12Arrive: Jefferson Park is not paused; first visit for Amy and the girls; the pupuseria and the neighbors exist; go inside.
3. ch12House: Bready Mercury the nine year old sourdough; the photo wall of the girls that Tom greets every morning.
4. ch12Loft: TNB teaches Rose clay; Amy and TNB bond over Tom (door checking, Chester the cat, the thermos at 3 a.m.); Tom overhears; Rose's bowl goes in the kiln.
5. ch12Marlowe: Marlowe, Vance's fixer, takes the color and sound off the block; Mr. Washington is found in amber on his porch (warm, hard); go check the neighbors.
6. ch12Carmen: Dona Carmen is in amber mid-sentence; a hot pupusa, Tom talking to her and Nara's sneeze; she wakes; sends pupusas next door.
7. ch12Alvarez: the Alvarez family is in amber, Daisy is not; Amy runs laps with the girls and they wake; Tombo Run With Us, Mommy unlocks; lemons.
8. ch12Prime: Marlowe returns and introduces Gridlock Prime (stuck, not angry); swap at benches; fight.
9. ch12After: Prime leaves kindly or beaten; green lamp keepsake; color returns, Mr. Washington and Larry wake; Marlowe says Long Island is under a dome and Deedee is making the same crisp over and over; next stop Sol's cab stand.
Amber rule to keep unless Tom says otherwise: a person comes out when their own favorite thing happens in front of them (canon: "warmth the person loves", never said in those words).

## What the next session does differently
1. FRESH CONVERSATION. Do not read claude/dialogue-ch12-script.md, claude/dialogue-ch12-pilot-script.md, the clarity rewrite files, data/scenes-ch12.js dialogue, or the artifact's current text. Read: this file, claude/voice-sheet.md (people only), claude/canon-addendum.md.
2. Use Tom's reference titles (asked for 23:50; if he gave them, they are in his prompt) as the target register.
3. Build each scene from a comic engine before writing a line: who wants what, who is in whose way, what running bit escalates, what pays off from an earlier scene. Plan callbacks across all nine scenes first (one page), then write.
4. Write ONE scene first (scene 5, Marlowe and Mr. Washington) at whatever length is funniest, and show Tom before writing the other eight.
5. Before showing Tom, have a separate agent that has not seen the drafting read it cold and mark every line that is corny, cute or a single flat gag. Rewrite those. Only then show it.
6. If that scene misses, do not iterate: ask Tom to mark the lines he smirked at and the ones he rolled his eyes at.

## Prompt for Tom to paste (new conversation)
"Read claude/next-addendum-dialogue2.md and follow it. My reference titles: ___"
