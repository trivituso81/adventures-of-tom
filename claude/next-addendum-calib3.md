# calib3 (2026-11-18 14:30 PT, read-only clone at main eeec494, nothing pushed): the take history is read, the tag bank is rebuilt from it, scene 2b is drafted and waits for Tom

Read with claude/next-addendum-calib1.md (Tom's corrections, rules version 2) and claude/next-addendum-calib2.md (merge procedure, loudness table). Where this page disagrees with either, this page wins: it is built from every take on his phone, not from 10 kept scripts.

## Status
| Item | State |
|---|---|
| Stop-loss on tag drafting | LIFTED by Tom's condition (history read). It comes back if the scene 2b draft below survives no better than round 2 (4 of 19 tag words). |
| Take history | Read in full by script, and every line he retuned (97 lines) read by eye. File: take-history made 2026-11-18T21:52Z, 2,707 takes on 2,159 lines, 11-02 to 11-18. |
| Scene 2b draft (12 lines) | Written below, shown to Tom in chat. NOT in the repo. Goes into tools/voice-library/scripts/ch01-story-directions.json only when Tom says so. |
| Round 3 | Tom re-recorded three merged lines after calib2 (table below). The game's built-in clips still hold the round 2 takes. Needs his pending export (audio is not in the take history). |
| Push access | add_repo (access push) was refused once by the permission check in this session and was not retried. The public clone works for reading. Tom's next prompt carries his permission in words. |

## What the take history holds
| Kind of line | Lines | What it is worth |
|---|---|---|
| One take, never touched | 1,824 | Nothing. An untouched script is not approval (calib1 rule 12). |
| Same script generated again | 181 | Nothing about tags (almost all are one batch re-run on 11-03). |
| Only the long voice description removed | 37 | Deedee: the description at the front of every bracket went on 11-02 and 11-03. |
| Only "quickly" added | 20 | Speed (rule 13 below). |
| Really retuned (tags, words or punctuation changed by hand) | 97 | THE EVIDENCE. Deedee 24 lines with tag changes, Tom 24, Amy 16, TNB 10, Washington 7, Grace 5, and 1 to 3 each for Big One, Fern, Kenji, Olivia, Rose, Sal, Penny, Michael, Grump. |
| Aunt Ellie | 23 takes, 0 retuned | No bank. Every Aunt Ellie script on his phone is a draft he never changed. One of her lines ("Somebody once told me I was too much...") has a take and no take in use. |

Totals over the retuned lines: 124 of Claude's draft tag words removed, 152 of his own words added and kept (27 of them "quickly"), 69 of his own words tried and then dropped. In 37 of the 97 lines he changed the spoken WORDS, 21 gained an exclamation mark, 11 gained an ellipsis. In 3 lines the take in use is not the last one he made (he went on, then came back).

## Round 3 (after calib2): the takes now in use, verbatim
| Voice | Line key in the history | takeId | Script |
|---|---|---|---|
| tom | Your mother says I'm slow. | tmwmnmgc8baom | `[under his breath] Your mother says I'm slow!` |
| grace | You are slow. I've been on number four since the mailbox. | tmwmnpl7tz6oh | `[quick, flat] You [emphasized]ARE slow. [flat, deadpan] I've been on number four since the mailbox!` |
| amy | ...with the groceries. Go see Mom. I'm coming over after my run. (NEW words) | tmwmnou6zws69 | `[heavy Long Island accent, comparing, smirking, quick] I carried BOTH of them up that street [heavy Long Island accent, emphasized] WITH the groceries! [heavy Long Island accent, busy] Go see Mom, [heavy Long Island accent, informing] I'm coming over after my run.` |
| amy | same line under its OLD words (not exported any more: the line is gone) | tmwmhp6p64w1h | `... [heavy Long Island accent, emphasized, teasing] with the groceries! ...` (19:03, between the two) |

What round 3 says:
- Tom's muttered line: "annoyed" came OUT again. A production tag plus an exclamation mark was enough. He then tried a tag before the last word four ways (`[annoyed]`, `[low, annoyed]`, `[emphasized]`, `[emphasized, low]`) and kept none.
- Grace: `[deadpan]` became `[flat, deadpan]`. Her other deadpan line was also kept as `[flat, deadpan]` after 12 takes. For Grace, deadpan is written `[flat, deadpan]`.
- Amy: `[emphasized]` plus CAPS on the next word (WITH) is the form in use.

## Rules, additions and corrections to version 2
| # | Rule | Evidence |
|---|---|---|
| 10 (CORRECTED) | He DOES use pause words. `[pause]` in its own bracket before a turn, or `beat` inside a tag. The earlier "he uses no pause tags" was wrong. He also writes hesitation as an ellipsis. | Kept: Deedee `Say it. [pause] [rising] Louder!`, Deedee `[pause] [threatening, teasing] Tom is due for a checkup...`, Tom `[teasing, low, quickly, beat] and maybe the starter.`, Deedee `[beat, bossy, playful]`. Dropped: long beat, no pause, immediately. |
| 13 Speed | The voices run slow. "quickly" is the word he adds most: kept 27 times (Tom 8, Washington 7, Deedee 5, Big One 3, TNB 3, Olivia, Grump). On 11-18 he writes "quick". Put quick on a short reply in a fast exchange. Build idea, not done: raise `voices[...].speed` in make-index.js for Tom, Deedee, TNB and the Big One so the word is not needed on every line (check first whether another session already did). | 20 lines where "quickly" was the ONLY change. |
| 14 One word | Claude's drafts are pairs (adjective, adjective) and the second word is usually an inner state. He cuts to the one you can hear. | `[deadpan, tickled]` to `[deadpan]`; `[flat, uneasy]` to `[uneasy]`; `[smug, fond]` to `[smug]`; `[firm, calm]` to `[calm]`; `[easy, teasing]` to `[teasing]`; `[dry, suspicious]` to `[suspicious]`; `[proud, mock formal]` to `[formal]`; `[mock stern]` to `[mildly stern]`. |
| 15 The words he reaches for | About half of what he adds is what the speaker is DOING to the listener: joking, teasing, taunting, explaining, confirming, informing, comparing, calling, announcing, urging, commanding, instructioning, excusing, caveating, questioning, realizing, stating a fact, matter of fact, listing out, reading, changing her mind, exception, threatening. Draft with these first. | his_kept lists below. |
| 16 Claude's default words | The words he deletes most from drafts: dry 14, firm 8, deadpan 7, then fond, warm, flat 4 each, then brisk, wry, tired, mild, proud, tender, bright, punchline. "dry" on Tom: removed 9 times, added by him once. Do not open a Tom line with dry by default; do not use firm at all. | draft_removed counts. |
| 17 Pointing at one word with a tag | Tried on 14 lines, kept on 7, abandoned on 7. Kept forms: `[emphasis]` or `[emphasized]` before the word (ORGANIZED, there, ARE, can't wait), `[quoting someone else]` or `[contrasting]` before a word in quotes, `[lower pitch]` before a last word. Abandoned: comparing, clarifying, distinguishing, referential, air quotes, higher pitch, rising pitch, drawn out, annoyed, low, quoting. When it fails he REWORDS the line ("Then who's seventeen?", "He's been saying that for a while, babe.", `"assistant" Steve`). Do not draft these; leave them to him. | Tom seventeen (10 takes), Fern Assistant Steve (10), Fern 1994 (8), Deedee "that again" (8), Tom news report (13), Tom slow (12), Rose TOP (8). |
| 18 "defensive" is "excusing"; "calm superior" is "mild disdain"; a dismissal is "busy" | Each was reached after several tries on the same move. Rose: reassuring, defensive, then excusing. Tom: dry unbothered, calm dignified, smug, annoyed, bothered, skepticism, judgment, disapproval, then mild disdain. Amy "Go see Mom": bossy warm, cheerful bossy, cheerful, then busy. | 11-18 trails. |
| 19 He cuts the line after the joke | Words he deleted while tuning are mostly a last sentence that explains or tops the joke. This is for whoever writes lines, not tags. | TNB "Sounds premium. Like your seat." cut; Tom "He's never home." cut; TNB "I hate it." cut; Amy "With a little heart." cut; TNB "Don't be mad." cut; Deedee "It is nine in the morning and it is a crisp." became "Yes, I know it's nine in the morning."; Michael "Nobody wants bedtime." became "Not even AI wants that!" |
| 20 Deedee says Tom | He changed "Tommy" to "Tom" in three Deedee lines (11-06, 11-07) and kept "Oh, Tommy." once (11-09). Observed, not a canon decision. | |

"Tata" in a written script is fine: voices.html (speakText) turns it into "Tah Tah" before the generator hears it. All 61 takes that say the word were sent as "Tah Tah".

## Tag bank, rebuilt (his own words only; draft words he left alone are NOT evidence and are not listed)
| Voice | Added by him and kept | Tried by him and dropped | Deleted from Claude's drafts |
|---|---|---|---|
| Tom | warm, deadpan, dry (once), flat, smirkingly, mild disdain, under his breath, emphasized, quickly x8, quick, amused, confirming, confused, incredulous, joking, laughing, listing out, low, reading, realizing, teasing, diminishing, beat | annoyed (kept in round 2, removed in round 3; also dropped on the news report line), admitting x2, bothered, skepticism, judgment, disapproval, smug, quoting, clarifying, comparing, rising, higher rising pitch, fast, leading, toning it down, gently teasing, long beat, out of side of mouth, wryly, CAPS on CAN'T | dry x9, deadpan x5, firm x2, emphasized x2 (as word stress), calm, dignified, tired, mild, resigned, wry, fond, formal, steady, unbothered, mock hurt, truly apologetic, urgent, outraged |
| Grace | reading aloud, announcing, cheerful, very stern, quick, sigh, resigned, flat, deadpan (as `[flat, deadpan]`), emphasized, annoyed, joking | interrupting, "i told you so", smug, disgusted, condescending, trailing, stern (became very stern), deadpan with quick | punchline, writing as she talks, strict, tired, perky, sulky |
| Rose | excited confession, quick, excusing, questioning, confused | defensive, reassuring, drawn out, emphasized (before TOP) | cheerful confession, innocent, earnest |
| Amy | calling, taunting, teasing, joking, comparing, smirking x2, quick, fast, busy, informing, emphasized / emphasis / emphasizing (3 lines), commanding, complete disbelief, confirming, deadpan, exception, formal, grabbing urgently, helpless, matter of fact, pittying, realizing, urging, vindictive | announcing, cheerful, loud | dry x3, brisk x2, firm x2, bossy, bragging, cheerful, confiding, controlled, deadpan, delighted, determined, flat, fond, grave, indignant, intense, mock formal, pointed, proud, punchline, softening, sympathetic, tender, thinking, warm, yielding |
| Deedee | quickly x5, `[pause]` x2, rising x2, stern x2, teasing x2, trailing x2, announcing an achievement, apologizingly, beat, changing her mind, commanding, confused, curious, instructioning, joking, kind, knowingly, laughing, low, matter of fact, mildly stern, perplexed, secretive, smirkingly, softly, stating a fact, suspicious, threatening, urgent, urging, yet slightly annoyed | scoldingly, jokingly scolding, easily scolding, cheerful scolding, hiding, higher pitch, lower pitch, no pause, immediately, mumbling, exclaiming, acknowledging | firm x4, warm x3, bright x2, bustling x2, fond x2, fussing x2, brisk, chatty, cheerful, conspiratorial, delighted, eager, impatient, mild, mock stern, proud, scolding, sweet, tender, thrilled, upbeat, warning; the long voice description (37 lines) |
| TNB (takes are from 11-02, before "mellow, laid-back, low-key" went into every bracket) | quickly x3, cautious, caveating, quoting someone else, taunting | air quotes, referential, changes mind | easy x2, dry, flat, smug, teasing |
| Mr. Washington (old voice) | quickly x7 | | slow |
| The Big One | quickly x3, deep | | |
| Fern | explaining x2, contrasting | distinguishing (5 forms), making a point, contrast, emphasized | dry, soft |
| Kenji | explaining, flat x2, excusing, polite, straightforward, lower pitch, japanese accent (own bracket) | deadpan, rudely | respectful |
| Olivia | annoyed, caveating, quickly | | flat |
| Sal | offhand, matter-of-fact | | deadpan, wry |
| Penny | emphasis (before ORGANIZED) | | |
| Aunt Ellie, Boppy, Mudling, Justin, Michael and the rest | none | | Michael: tickled |

## Scene 2b draft (ch1Ellie, 12 lines). Shown to Tom 2026-11-18. NOT in the repo yet.
Goal of the exchange: Aunt Ellie inspects everyone at her door and finds fault, politely. Nobody raises their voice, and the one kind thing she says comes out sounding like a complaint.

Line before the block (in the game, not redrafted, and not approved either): Aunt Ellie, "Tom. They gave you a seat that turns into a bed, and you still got off that plane wrinkled."

The tool adds "heavy Long Island accent" to every Aunt Ellie bracket; it is left out here.

| # | Voice | Script |
|---|---|---|
| 1 | tom | `[polite] Hi, Aunt Ellie. [excusing] It's a TRAVEL wrinkle. It's supposed to fall out by dinner.` |
| 2 | ellie | `[matter of fact] Then I'll look at you again at dinner. Come in. [suspicious] Rose, darling, what is that on your hands?` |
| 3 | rose | `[excited] Cinnamon! From Deedee's muffin!` |
| 4 | ellie | `[mildly stern] Then you'll stay up there, please. [explaining, flat] Your uncle wipes clean. My CHAIRS don't.` |
| 5 | grace | `[announcing] Aunt Ellie, I'm reading Tata everything he missed. [informing, cheerful] You're number four!` |
| 6 | ellie | `[curious] Am I? What did I do?` |
| 7 | grace | `[reading aloud] You got new curtains.` |
| 8 | ellie | `[confirming] I did. [suspicious] And what's number THREE?` |
| 9 | grace | `[flat, deadpan] Rose licked a muffin.` |
| 10 | ellie | `[stating a fact] Then the curtains are three, Grace. Fix your list. [mild disdain] I'm not coming in behind a LICKED muffin.` |
| 11 | rose | `[questioning] Aunt Ellie, did you MISS Tata?` |
| 12 | ellie | `[sigh, resigned] Fine. [matter of fact] The street was quieter without him, and I didn't care for it. [busy] Now go and see your mother, Tom, before I change my mind.` |

Count for the survival number: 24 tag words, 5 CAPS words (TRAVEL, CHAIRS, THREE, LICKED, MISS), one exclamation mark added for the voice only (line 5; the screen keeps its full stop). All 24 words are in takes he kept. 7 are from that voice's own bank (Grace 5, Rose 2). 17 are borrowed from another voice: all 14 of Aunt Ellie's, Tom's polite (Kenji) and excusing (Rose), Grace's informing (Amy). Line 9 is his own kept script for the same sentence.

Not known, and only his ear settles it: whether Aunt Ellie's toppers go up like Amy's or stay level; whether "mild disdain", found on Tom's voice, works on hers.

## Lines in the game where the voice and the subtitle say different words (from the history against data/voice-index.json at eeec494)
He reworded these while tuning before calib2, when the merge did not carry words back. calib1 rule 9 says the screen follows the kept take. Check data/script-review.json first: a Locked conversation changes only when Tom says so.
| Voice | Screen now | Spoken |
|---|---|---|
| deedee (battle) | Ten thousand steps! Keep up, honey! | Ten thousand steps! Keep up! |
| deedee (battle) | Retired registered nurse! Little pinch, honey! | Retired registered nurse! Little pinch. |
| deedee | Up, up. Everybody up. Deedee kisses it better. | ...Deedee will make it better. |
| fern | Today's special is celery. Doña Carmen says that's not a meal. She's right. | (last sentence not spoken) |
| fern | We opened in March. The pupuseria next door has been here since 1994. We're learning a lot. | (last sentence not spoken) |
| kenji | It's not. But you're trying very hard, and I respect that. | Actually, it's not. But... |
| kenji | Tom-san, your Japanese is very good. | Tomu-san, ... (pronunciation spelling: screen stays) |
| rose | BOO! We're stowaways! Tata, what's a stowaway? | ...Tata... what's a stowaway anyways? |
| tom | Nobody here is racing. | Nobody here is racing, Amy |
| tom | Who is number seventeen? | Then who's seventeen? |
Also still live and fine: six "Round {n}." lines (known, clipfix1) and Boppy's "STIIILL" (delivery spelling). 30 more reworded takes belong to lines no longer in the game.

## Next build session (calib3 build), in order
1. Clone with push (add_repo, access push; Tom's prompt says he permits it).
2. Merge Tom's new pending export per the procedure in calib2. It should carry the three round 3 takes. Check the three scripts in tools/voice-library/scripts/ch01-story-directions.json equal the round 3 table above character for character. If the export is not attached, skip this step and say so.
3. Only if Tom's prompt says the scene 2b draft is approved: write the 12 scripts above into tools/voice-library/scripts/ch01-story-directions.json (script field only; no takeId), `node tools/voice-library/make-index.js`, check in voices.html that each shows under chapter 1 with its line before. Grace's "Rose licked a muffin." is its own line (text without "Number three.").
4. Fix the subtitle mismatches in the table above that are not Locked (procedure: next.md "Changing a spoken line", merge `--retext` is not needed because the clips are already in the game under the old key: reword text and key together). Name any Locked ones to Tom instead.
5. Tests, CHANGES entry `## calib3`, bump tags, push.
6. Then Tom tunes scene 2b in the Voice Library and sends a pending export plus a fresh take history. The session after that: count how many of the 24 words survive, fill Aunt Ellie's row of the bank from her trail, then draft the next unit (ch1Theft, 13 lines: Deedee 5, Boppy 4, Tom 2, Rose 1, Grace 1) with its goal sentence and the line before on top. If fewer than half of the 24 survive, stop-loss again: do not draft, tell Tom, and propose he tunes Aunt Ellie's and Boppy's first lines cold so their banks exist before anything is drafted for them.

## Still waiting on Tom's ears (from calib2)
Whether Grace "Number three. Rose licked a muffin." (-31 LUFS) and Tom "Your mother says I'm slow." are too quiet next to Amy. He re-recorded the Tom line with an exclamation mark; its loudness is unmeasured until the export arrives.
