# How Tom tags voice lines, and how Claude's tags differed (2026-11-20). READ BEFORE WRITING ANY VOICE SCRIPT.

Source (fact): chapter 1's voice scripts as Claude wrote them (build ch1tags1, 2026-11-17) compared with the scripts of Tom's kept takes now in `tools/voice-library/scripts/ch01-story-directions.json` and `zzzz-kept-takes.json`. Tom changed the tags on 52 of the 95 chapter 1 lines (55%). Every one of those 52 pairs is the model: read them in that file before tagging.

This page beats the tag rules in claude/voice-studio.md, the v4 research notes (claude/next-addendum-ch1tags1.md) and the limits in `tools/voice-library/apply-scripts.py` where they differ. Tom's kept takes win over every rule.

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
