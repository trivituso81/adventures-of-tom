# How Tom tags voice lines, and how Claude's tags differed (2026-11-20). READ BEFORE WRITING ANY VOICE SCRIPT.

Source (fact): chapter 1's voice scripts as Claude wrote them (build ch1tags1, 2026-11-17) compared with the scripts of Tom's kept takes now in `tools/voice-library/scripts/ch01-story-directions.json` and `zzzz-kept-takes.json`. Tom changed the tags on 52 of the 95 chapter 1 lines (55%). Every one of those 52 pairs is the model: read them in that file before tagging.

This page beats the tag rules in claude/voice-studio.md, the v4 research notes (claude/next-addendum-ch1tags1.md) and the limits in `tools/voice-library/apply-scripts.py` where they differ. Tom's kept takes win over every rule.

## WHY Tom tags this way (Tom, 2026-11-20 18:12, and the data under it). This section beats everything below.
Tom: "your tagging is too subtle ... you are trying to make the tagging reflect the person's personality, but ... the tagging itself has to be done in some kind of extreme because otherwise it's not picked up in the voice accurately ... a lot of tags in a row within the same set of brackets dilutes ... they start to get mixed together."

The principle: **a tag is a direction to an actor about the sound of the next few words, not a description of the character.** The character lives in the words of the line. The tag only has to move the voice, and the voice only moves when the tag is strong, simple and audible.

| # | Why | What Claude did wrong | Evidence in the 52 lines |
|---|---|---|---|
| W1 | **The generator under-delivers, so tag at the extreme.** The take comes out at a fraction of the tag. A mild tag lands near the default read, which sounds like no tag. | Mild, polite words: warm, proud, pleased, curious, careful, gracious, important, sincere, cool, certain, mild interest | Tom's new words: disgusted, outraged, astounded, dumbfounded, accusatory, threatening, not amused, suspicious, very dismissive, very very deadpan |
| W2 | **Only a sound can be heard.** A tag must name something the voice can do: pace, flatness, volume, pitch, breath, a pause, a laugh, stress, or an obvious emotion. A personality, a job or a thought has no sound, so the model ignores it or guesses. | dignified, honored, charge nurse, small teacher, taking notes in his head, settling into a story, a promise | Tom's new brackets: 52 sound words (quick, flat, deadpan, pause, sigh, under his breath, low, fast, deep voice, emphasized) against Claude's 34 in 99 brackets |
| W3 | **One idea per bracket.** Several words in one bracket are averaged together, and opposites cancel (warm + formal, mock wounded, cool + elegant, dignified + defending). | Brackets of mixed directions and multi-word phrases: 17 descriptors of 3+ words | 54% of the brackets Tom wrote himself are ONE word. When he uses two or three, they point the same way (flat, deadpan) or the last one is only the pace (quick) |
| W4 | **Change the sound by placing a new bracket, not by stacking words.** A new bracket at the exact word where the voice should turn. | 1.9 brackets a line, packed with adjectives | 2.4 brackets a line, short, mid-sentence: `[noting] They're for you, [mildly annoyed, quick] so [emphasized] nobody's allowed...` |
| W5 | **Give the actor an action.** A speech act (informing, accusatory, taunting, conceding, announcing) is a clear thing to do with the voice and comes out stronger than an adjective. | 8 speech acts in 99 brackets | 28 in his 74 new brackets |
| W6 | **Comedy is fast.** The default read is slow and earnest, which kills a joke. | No pace words | "quick" is his most added word (12) |
| W7 | **Each bracket resets the voice** (Claude's reading of why he repeats it; not tested), so whatever must hold (accent, TNB's mellow) is repeated in every bracket, even a one-word one. | Accent named 0 times | 61 accent mentions; TNB's "mellow, laid-back, low-key" in every bracket |
| W8 | **Point at the word.** Caps alone are unreliable and break names; `[emphasized]` right before the word says exactly where the stress goes. Pauses are written, not hoped for. | Caps only, caps on names | 12 `[emphasized]`, `[pause]`, `...`, more ! for energy |

How to tag a line now (do it in this order):
1. Decide what the listener should HEAR on each beat (faster, flatter, louder, a sigh, a stop, one stressed word). Not who the character is.
2. Pick ONE strong word per beat, pushed to the extreme (disgusted, not wary; very flat, not level). Add "quick" if it is a joke beat.
3. Put a new bracket at the exact word where the sound changes. Never two directions in one bracket.
4. Accented speakers and TNB: repeat the accent or the mellow trio in every bracket.
5. Read the brackets alone, without the line: if they describe a person rather than a sound, rewrite them.

## The numbers (52 changed lines, Claude's version against Tom's)
| Measure | Claude | Tom |
|---|---|---|
| Brackets per line | 1.9 | 2.4 |
| Lines ending in ! | 6 | 16 |
| Brackets that name an accent | 0 | 61 |
| "quick" or "fast" | 3 | 17 |
| [emphasized] before a word | 0 | 12 |
| [punchline] | 13 | 8 (all kept from Claude's; he added none) |
| Words in CAPS (spoken text) | 42 | 37 (names never in caps) |

## The patterns
| # | Tom's habit | Claude wrote | Tom wrote |
|---|---|---|---|
| 1 | **The accent goes in EVERY bracket** of an accented speaker, including a one-word bracket in the middle of a line. Deedee: `warm Long Island accent`. Boppy: `thick New York accent` (sometimes `deep voice,` first). Amy and Aunt Ellie: `heavy Long Island accent`. Sal: `thick long island accent`. | `[shocked, loud] That thing took my good twelve-cup PAN!` | `[warm Long Island accent, shocked, loud] That thing took my good twelve-cup PAN! [warm Long Island accent, low, indignant] I don't even put that pan in the [warm Long Island accent, emphasized]DISHWASHER.` |
| 2 | **Delivery words, not a description of the character or what is in his head.** Tags say how it sounds (flat, quick, under his breath, mild disdain), not who he is or what he is thinking. | `[serious, taking notes in his head]`, `[dignified, defending himself]`, `[honored, serious]`, `[mock wounded]`, `[bossy, small teacher]` | `[very flat, confirming, quick]`, `[mild disdain]`, `[fast, serious]`, `[under his breath]`, `[bossy]` |
| 3 | **A tag names what the sentence does to the listener** (already found 2026-11-13 in claude/next-addendum-voicetags1.md, and not applied in chapter 1): informing, announcing, noting, educating, conceding, admitting, exclaiming, accusatory, threatening, taunting, calling, greeting, comparing, showcasing, stating plainly. | `[proud, loud] Cinnamon! From Deedee's MUFFIN!` | `[announcing] Cinnamon! [educating] From Deedee's MUFFIN!` |
| 4 | **Fast.** "quick" is his most added word. Lines move. | `[reading aloud] Number two. Deedee made apple muffins.` | `[quick, reading aloud] Number two. [quick, flat, announcing] Deedee made apple muffins.` |
| 5 | **A new bracket at every beat**, even mid-sentence, and the tone turns inside the line. | `[strict] They're for you, so nobody's allowed to have one yet.` | `[noting] They're for you, [mildly annoyed, quick] so [emphasized] nobody's allowed to have one yet.` |
| 6 | **Strength words** turn a tone up or down: very, very very, mild, mildly. | `[warm, formal] Thank you for telling me, Rose.` | `[wary, disgusted, amused] Thank you for telling me, Rose... [pause, very very deadpan] That one's yours. [very dismissive] ...` |
| 7 | **Tom (the character) is dry, not warm or earnest.** Deadpan, flat, sheepish, defensive, dismissive. Claude kept writing him warm, formal, dignified, honored. | `[warm, a little defensive] Hi, Aunt Ellie. [earnest, explaining] It's a TRAVEL wrinkle.` | `[defensive] Hi, Aunt Ellie. [sheepish] It's a [emphasized] TRAVEL wrinkle. [informing, flat] It's supposed to fall out by dinner.` |
| 8 | **Grace is flat and deadpan**, a sigh and a fast correction, not a warm little teacher. | `[flat, writing as she talks, punchline] Number three. Rose licked a muffin.` | `[sigh, resigned, quick] Number three. [flat, deadpan] Rose licked a muffin.` |
| 9 | **[emphasized] right before the stressed word**, usually with the caps too. Caps only on the word that carries the joke; never on a name (TOM reads "tomb", DEEDEE became Deedee). | `I wrote down EVERYTHING` | `I wrote down [emphasized] EVERYTHING` |
| 10 | **Timing marks**: `[pause]` and `...` where he wants a beat. | `[cheerful confession] I licked one. [quick, reassuring] Only the TOP!` | `[excited confession] I licked one... [pause] [quick, excusing] Only the TOP!` |
| 11 | **More lines end in !** (energy), including Tom's "Hi, Mom!" | `...since you left. Number one. Boppy saw the Big One again.` | `...Boppy saw the Big One again!` |
| 12 | **TNB carries `mellow, laid-back, low-key` in every bracket**, lower case, no exclamation marks. | `[tossed off] the smog over 2nd ave turned purple this morning.` | `[mellow, laid-back, low-key, tossed off] the smog over 2nd ave turned purple this morning.` |
| 13 | **What he kept:** brackets that were already delivery words (`[flat, correcting]`, `[real scream]`, Boppy's `[finishing his story, pleased, has noticed nothing]`, every `[punchline, level]` on Aunt Ellie and Deedee). He changes what is wrong and leaves the rest. | | |
| 14 | **He rewrites words while tagging.** Amy's ski boots became the sand at Robert Moses; the Big One gives a coin, not the pan; Deedee's "Twelve more. Forty minutes." became "Give me an hour and we'll have 12 more." These are dialogue edits: they go in claude/tom-line-edits.md and the line rules. | | |

## What this does NOT mean (fact, from claude/voice-learning-plan.md)
Rules that try to predict Tom's exact tag WORDS line by line were tested on 11-18 and did not beat leaving the script alone (the same word is kept on one line and cut on the next). So this page is about structure and habits (accents everywhere, delivery not description, speech acts, pace, beats, emphasis, dryness), which are consistent across all 52 lines. Measure success by the share of lines whose tags Tom changes, not by matching his words.

## The checker conflicts with Tom (fact)
`tools/voice-library/apply-scripts.py` allows at most 2 descriptors per bracket, each at most 2 words. Every one of Tom's accent brackets breaks it (`heavy Long Island accent` is 3 words, and he adds 2 or 3 more descriptors after it). Tom's style wins: the next session that touches voice scripts relaxes those two limits (keep the body, prop and sound word check) and says so in docs/CHANGES.md.

## Checklist before any voice script reaches Tom
1. Accented speaker: the accent is in every bracket.
2. No bracket describes the character or his thoughts; each says how it sounds or what the sentence does.
3. One bracket per beat; "quick" unless the moment is slow on purpose.
4. Tom dry, Grace flat, TNB mellow trio, Rose loud and excited.
5. [emphasized] before the one stressed word; no name in caps.
6. [pause] or ... where the joke needs a beat.
7. Compare against 3 of Tom's kept lines for the same speaker in ch01-story-directions.json.

Goal: on chapter 2, Tom changes the tags on well under half the share he changed in chapter 1 (55%).
