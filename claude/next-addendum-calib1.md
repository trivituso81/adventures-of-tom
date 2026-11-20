# calib1 (2026-11-18, last updated 11:25 after round 2; read-only clone at main 3e190f3, nothing pushed)

Read with claude/next-addendum-ch1tags1.md and claude/next-addendum-linegap1.md. Where this page disagrees with the tag rules in claude/next-addendum-voicetags1.md, this page wins: it comes from takes Tom tuned by ear and kept.

## STOP-LOSS IS IN FORCE on tag drafting
Two tag proposals for chapter 1 scene 2 were written in this session. Tom retuned every line of the second one (about 30 minutes of "combing") and said "we've still got a long way to go". Of the 19 tag words in that proposal, 4 survived in his kept takes (quick, quick, emphasized on one word, deadpan). Do NOT draft tags for more lines until step 2 of the build list (the take trail) is done and the trail for rounds 1 and 2 has been read.

What is going wrong (analysis, 11:20):
1. Nobody writing tags can hear. Rules were derived from five or six kept scripts and then applied everywhere (deadpan on every voice, `[emphasized]` as word stress, a tag at every conjunction).
2. Tags were written from script analysis: what the character feels or means. Tom tags what the voice sounds like. His words, 10:55: "there is a different between how the character feels and how they sound - the tagging is for how they sound."
3. Only the script he KEPT reaches Claude. The scripts he tried and threw away in those 30 minutes are the real lesson (which word failed on which voice) and they never leave his phone.

Change of method: export the trail (build step 2). Fact, read in voices.html: every take is stored on his device with its own script (`addTake` writes {id, line, mp3, label, script, t} to the `takes` store), and the pending export sends only the take in use. Sending every take's script (text only) costs him nothing and turns one 30 minute round from 5 examples into every attempt he made.

## Tom's corrections, 10:55 (authoritative)
- "`emphasized` ... just makes them sound louder or amplifies the previous emotion." It is NOT a way to stress one word. It needs an emotion already set before it.
- Tags are for how the voice SOUNDS, not how the character feels.

## The record: his kept scripts, verbatim, in play order
merge-local.js drops `script`, so until that is fixed these are the only copy. Do not correct spelling.

Round 1 (export local-clips-pending_1_.json, made 16:45:48Z):
| # | Voice | takeId | Script as exported |
|---|---|---|---|
| 1 | grace | tmwmbvpffansu | `[reading aloud] Number two. [announcing, cheerfull] Deedee made apple muffins. [cheerful] They're for you, [very stern, quick] so [emphasized] nobody's allowed to have one yet.` |
| 2 | rose | tmwmchzpjw2r6 | `[excited confession] I licked one... [quick, excusing] Only the TOP!` |
| 3 | tom | tmwmcam92tzll | `[warm] Thank you for telling me, Rose. [deadpan] That one's yours. [dry] Grace, I'm so sorry but [flat, smirkingly] number two [emphasized] can't wait.` |
| 4 | grace | tmwmcr7g3l1kn | `[sigh, resigned, quick] Number three. [flat, deadpan] Rose licked a muffin.` |
| 5 | amy | tmwmc9bzukcd8 | SUPERSEDED by round 2 line 6. `[heavy Long Island accent, loud, teasing] Brother! I'm watching you from the window. [heavy Long Island accent, punchline, cheerful] I've seen people walk faster in SKI boots.` |

Round 2 (export local-clips-pending_2_.json, made 18:54:19Z):
| # | Voice | takeId | Script as exported |
|---|---|---|---|
| 6 | amy | tmwmfdhw6ffo6 | `[heavy Long Island accent, calling] Brother! [heavy Long Island accent, taunting, teasing] I'm watching you from the window. [heavy Long Island accent, joking] I've seen people move faster walking on the sand at Robert Moses!` |
| 7 | tom | tmwmfsx1kkq13 | `[mild disdain] I'm carrying a child and receiving a news report!` |
| 8 | amy | tmwmh4h3k1u63 | `[heavy Long Island accent, comparing, smirking, quick] I carried BOTH of them up that street [heavy Long Island accent, emphasized] with the groceries! [heavy Long Island accent, busy] Go see Mom, [heavy Long Island accent, informing] I'm coming over after my run.` |
| 9 | tom | tmwmhc8fuse8j | `[under his breath, annoyed] Your mother says I'm slow.` |
| 10 | grace | tmwmhbcuthu8d | `[quick, flat] You [emphasized]ARE slow. [deadpan] I've been on number four since the mailbox!` |
| 11 | ellie | tmwmeusf7rlak | `[heavy Long Island accent, cool, elegant] Tom. [heavy Long Island accent, measured, faintly disappointed] They gave you a seat that turns into a BED, [heavy Long Island accent, punchline, level] and you still got off that plane wrinkled.` |

Line 11 is the repo script unchanged and was made at 09:44, before his round 2 tuning. An unchanged script is NOT approval: line 5 was also unchanged in round 1 and he rewrote it in round 2. Draw no rules from line 11.

Word changes he made while tuning (the export `text` and `id` still carry the old words):
| Line | Old | New |
|---|---|---|
| 3 | Grace, I'm so sorry. Number two can't wait. | Grace, I'm so sorry but number two can't wait. |
| 6 | I've seen people walk faster in ski boots. | I've seen people move faster walking on the sand at Robert Moses! |
| 8 | with the groceries. Go hug Mom. I'm coming over | with the groceries! Go see Mom, I'm coming over |
| 7, 10 | full stop at the end | exclamation mark at the end |

## Round 2: the proposal against what he kept
| Line | Proposed tags | His tags | Lesson |
|---|---|---|---|
| 7 Tom | `[calm, dignified]` ... `and [deadpan]` ... `[emphasized] news report.` | `[mild disdain]` and an exclamation mark | One breath, one tag. "Calm, dignified" is how he carries himself; "mild disdain" is what you hear. |
| 8 Amy | `[gleeful, quick]` ... `[smug] with the groceries.` `[warm, bossy] Go hug Mom.` `[cheerful, brisk]` | `[comparing, smirking, quick]` ... `[emphasized] with the groceries!` `[busy] Go see Mom,` `[informing]` | The topper goes UP (more of the same smirk, louder), not thrown away. She does not soften: busy and informing, not warm. "hug" became "see". |
| 9 Tom | `[mock hurt, quiet]` ... `[emphasized] slow.` | `[under his breath, annoyed]` | "Mock" is subtext; a voice cannot perform it. He SOUNDS annoyed; the listener supplies the joke. |
| 10 Grace | `[quick, matter of fact] You [emphasized] are slow. [tired, deadpan]` ... `mailbox.` | `[quick, flat] You [emphasized]ARE slow. [deadpan]` ... `mailbox!` | CAPS does the word stress; `[emphasized]` only adds volume. "Tired" is a feeling: cut. |
| 6 Amy | (round 1 script, wrongly read as accepted) | `[calling]`, `[taunting, teasing]`, `[joking]`, new punchline | "Brother!" is its own sound (calling out a window). The joke became local to Long Island. "punchline" as a tag word is gone. |

## Rules, version 2 (these replace rules 1 to 13 of the earlier version of this page)
1. Tag the audible surface. Test: what would a stranger hearing it through a wall say the voice is doing? Three kinds of word pass:
   - what the voice is doing to the listener: calling, taunting, teasing, joking, comparing, informing, announcing, excusing, reading aloud, confession
   - how it is produced: quick, flat, deadpan, under his breath, sigh, smirking, busy
   - a plain, unironic attitude you can hear: annoyed, mild disdain, stern, cheerful, warm, excited, resigned, dry
2. Never tag subtext, inner state or analysis: mock, faintly, playing, tired, calm, dignified, hurt, smug, gleeful, bossy, proud, "punchline". If the character is only pretending to be annoyed, the tag is still "annoyed".
3. `[emphasized]` means: from here, louder and more of the emotion already set. Use it where intensity steps up, usually on the tail of a topper ("with the groceries!", "nobody's allowed to have one yet"). Never after deadpan, flat or calm (there is nothing to amplify). Never as word stress.
4. Word stress is CAPS on that word (BOTH, ARE, TOP). `[emphasized]` directly before a CAPS word is his form for the hardest hit (`[emphasized]ARE`).
5. Every tag inside a sentence makes a small break in the flow (measured: 0.13 to 0.4 s). A line that is one breath gets ONE tag at the front and no tag inside (lines 7 and 9). Add a tag inside a line only where the sound truly changes or steps up. No default tag at a conjunction.
6. Endings go where the character's energy goes, and that is often UP. Round 2 added an exclamation mark to four line endings. "Punchlines go down" (old rule 3) is withdrawn. Deadpan is one colour, mostly Tom's and Grace's, and even their lines can end on an exclamation mark.
7. Play each line off the one before, and show Tom every block with the preceding line on top (his request, 09:47). Before tags, state the exchange's goal and tone in one sentence.
8. This family bickers. In scene 2 nobody sounds affectionate: taunting, disdain, smirking, busy, annoyed, flat. The affection is in the situation, not in the voices. Do not add warmth to a voice unless the words are warm (line 3, "Thank you for telling me, Rose", is `[warm]`).
9. He rewrites words while tuning (a local reference, a quicker join, a softer verb). The screen WORDS follow the kept take. Punctuation added for delivery (exclamation marks, ellipses, a comma join) is voice only, like CAPS: the screen keeps its own punctuation. Decision made here; Tom was told.
10. He uses no pause tags. Timing is punctuation plus the tags themselves.
11. Accent voices: the tool writes the accent into every bracket, and `[heavy Long Island accent, emphasized]` is in a kept take (line 8), so `[emphasized]` is usable on Amy.
12. An unchanged script in an export is not approval.

## Tag bank: words in his KEPT takes, by voice (draft from these first)
| Voice | Words |
|---|---|
| Tom | warm, deadpan, dry, flat, smirkingly, mild disdain, under his breath, annoyed, emphasized |
| Grace | reading aloud, announcing, cheerful, very stern, quick, sigh, resigned, flat, deadpan, emphasized |
| Rose | excited confession, quick, excusing |
| Amy | calling, taunting, teasing, joking, comparing, smirking, quick, busy, informing, emphasized |
| Aunt Ellie, Deedee, Boppy, TNB, the Big One, Mudling | none yet |

## Measured from the audio (timing and level only; nobody here can hear)
| Finding | Numbers |
|---|---|
| `[emphasized]` raises level in 3 of its 4 uses | Peak level of the words after the tag against the words before it: Grace line 1 about 10 dB louder, Amy line 8 about 9 dB, Grace line 10 ("ARE", with CAPS) about 9 dB. Tom line 3 shows no level change. 10 dB is roughly twice as loud. This matches Tom's correction; the earlier "it stretches the next word" reading was wrong. |
| CAPS alone | BOTH (Amy) is the loudest word in its phrase. BED (Aunt Ellie) is not louder than its neighbours. |
| A tag inside a sentence makes a break | 0.13 s before "so", about 0.4 s after "but", 0.25 s before "can't" (round 1). Lines 7 and 9, one tag each, run with no internal break (3.1 s and 1.5 s of speech). |
| Loudness of the kept takes (LUFS, the standard loudness measure; 10 units is about half as loud) | Round 1: Rose -17.0, Amy -17.9, Grace -20.8, Tom -23.8, Grace number three -30.2. Round 2: Amy -16.4 and -17.5, Ellie -22.0, Grace -22.3, Tom -22.5, Tom "under his breath" -27.2. |
| Silence at clip ends | 0.1 to 0.4 s in the raw takes. Fact from the repo: merge-local.js already trims to 0.05 s at the head and 0.12 s at the tail (threshold -50 dB, so the sigh that opens line 4 survives). No extra trim is needed. merge-local.js does NOT level loudness. |

Limits: one script can give different reads on different generations. Word timings come from an automatic aligner and are approximate.

## Next build session, in order (needs push access; this session had read only)
1. Clone with push. Tom attaches BOTH exports again (local-clips-pending_1_.json and local-clips-pending_2_.json). Round 2's Amy line replaces round 1's.
2. THE TRAIL. In voices.html, make the pending export also carry, for every line in the export, all takes still stored for that line: `{line, takeId, t, script, kept:true|false}`, text only, no audio, oldest first. Ask Tom to export again without re-recording so rounds 1 and 2 come with their trails (they exist only if he has not deleted the takes). Read the trails before any drafting: for each line, list which words he tried and dropped per voice, and add a "tried and dropped" column to the tag bank.
3. Fix tools/voice-library/merge-local.js so it writes each kept take's `script` into the matching line of scripts/chNN-story-directions.json. The scripts in the record above must end up there exactly as exported.
4. Screen text (rule 9): change the WORDS of lines 3, 6 and 8 in the scene, in claude/story-ch01-draft2.md, docs/line-gaps.tsv and the scripts file, and key the merged clips to the new text. Screen versions: "Grace, I'm so sorry, but number two can't wait." / "I've seen people move faster walking on the sand at Robert Moses." / "I carried both of them up that street with the groceries. Go see Mom. I'm coming over after my run."
5. Merge the takes. Check by listening on the phone (Tom) whether Grace's number three (-30 LUFS) and Tom's muttered line (-27 LUFS) are audible next to Amy (-17). If not, add leveling to the merge with a ceiling on how far a quiet line is raised, so quiet stays quieter.
6. Voice Library: show the previous line in play order (speaker, words, play button if it has a clip) above each story line's script (order is in docs/line-gaps.tsv).
7. Only after step 2 is read: draft tags for the next conversation unit using rules version 2 and the tag bank, with its goal sentence and the preceding line on top. Track one number per round: how many of the drafted tag words survive in his kept takes (round 2 baseline: 4 of 19).

## Not known
- Whether the repeated `[cheerful]` in line 1 does anything.
- Whether Aunt Ellie's line 11 (repo tags, including "punchline" and "faintly disappointed") is a take he likes.
- Why `[emphasized]` raised no level on Tom's line 3. Possibly it amplified the smirk instead; only Tom can say.
- Tag bank for six voices.
