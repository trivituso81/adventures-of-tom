# Purged voice (2026-11-01)

Tom asked (again) for voice lines and clips that the full game never plays to be removed, because every unused line shows up in the Voice Library and the bake lists and costs ElevenLabs credits. This is the record. The audio itself is not lost: it is in git history at commit `6624b03` (the parent of the purge commit), so `git show 6624b03:data/voice/<id>.js` brings any of it back.

## 2026-11-11 `deedeetom1`: 30 Deedee clips with the old wording "Tommy"

Tom asked for Deedee to call him Tom. The game text was changed and the 30 baked clips that said "Tommy" were removed (deedee.js hug and moon_back "Group hug! Tommy, you too!"; 28 dialogue clips in dialog-ch1, ch2, ch9, ch25, ch26, ch28). They need a re-bake with the new text. Audio is in git history (commit before deedeetom1).

## 2026-11-02 `ch2clips`: ten dialogue clips with superseded wording

Tom re-recorded chapter 2 and reworded ten lines in the script box; the game text was changed to his words and the old-wording clips were removed (dialog-ch2.js: Michael "Nobody is coming for mine...", Tom "Fifty grams... Proud of you.", "Sit, paw, treat... Very strong paw.", "TNB said he'd be home... He's never home."; dialog-ch25.js: Tom "The starter is the bonus.", "Mad? I'm proud. And a little mad."; TNB "Don't be mad.", "this whole block", "Sounds premium. Like your seat.", "I hate it."). Audio: parent of the `ch2clips` commit.

## Lines removed from `data/lines.js` (never called by any move, scene or dialogue)

| Character | Kind | Words |
|---|---|---|
| justin | loose_wire_zap | Ow. Okay. A little bit my problem. |
| justin | wire_nuts_1 | Yellow! |
| justin | wire_nuts_2 | Red! |
| justin | wire_nuts_3 | And BLUE! |
| justin | bad_call_yell | WHO IS PAYING YOU?! |
| justin | bad_call_sit | Unbelievable. |
| justin | fresh_fit_shades | Collar. Cuff. Shades. |
| justin | fresh_fit_wink | You're welcome. |
| justin | demo_day_look | Nobody liked this wall. |
| justin | demo_day_one | ONE! |
| justin | demo_day_two | TWO! |
| justin | breaker_flip_which | Which one of you is it. |
| justin | breaker_flip_found | There you are. |
| justin | breaker_flip_count | Three. Two. One. |
| justin | breaker_flip_salute | Licensed and insured. |
| justin | giant_sneeze_twitch | Hang on. Hang on. |
| justin | giant_sneeze_excuse | Excuse me. |
| justin | foot_tap_wave | Rosie. No. |
| justin | foot_tap_ouch | OUCH!!!!!! |
| justin | foot_tap_light | IT WAS SO LIGHT! |
| justin | foot_tap_fine | I'm fine. I'm FINE. |
| justin | drywall_screws | Four screws. |
| justin | drywall_tap | Solid. |
| justin | drywall_dry | Let it dry. |
| tom | attack | Excuse me! |
| tom | attack | Take THAT! |
| tom | attack | Right, then! |
| grace | attack | Hi-yah! |
| grace | attack | Take that, Kevin! |
| grace | attack | Watch me, Ta-Ta! |
| rose | attack | Boop! |

Justin: these were the extra spoken beats written in the approved kit (see `docs/JUSTIN_ABILITIES.md`), but the move animations in `engine/justin-moves.js` only say the other lines. Tom, Grace and Rose: the generic `attack` shout pools were only a fallback for a move with no line of its own; every live move has its own line, so nothing played them (Grace's Move Lab volume sample now uses her `dance` line).

## Old clips removed (the line was reworded, so the old audio could never match)

| Character | Kind | Old words |
|---|---|---|
| amy | hurt | Ow. Okay. I'm okay. Deep breath. |
| amy | tombo2 | Ketchup, pickles, cereal, one sock. It's a Ymamot Creation! |
| amy | hills | Hill repeats! Up the slime, down the slime! |
| amy | marathon | Twenty-six point two! Straight through the slime! |
| amy | marathon_ult | Right on Hereford, left on Boylston! Sprint to the tape! |
| grace | ymamot | Ketchup, pickles, cereal, one sock. It's a Ymamot Creation! |
| rose | ymamot | Yama-Mott. It's Tom backwards. We were six. |
| tnb | round_with_jojo | Jojo, you're up. ...Jojo. JOJO. ...Nice. |
| tom | button_mash | Ugh, it's not charged! |
| justin | (no kind) | OUCH!!!!!! |


## 2026-11-01 (`fish1`): four dialogue clips removed because their lines were reworded

Tom: Boppy catches fish all the time; the joke is that he exaggerates how big they were. The four lines that said he never catches anything were rewritten, so their clips no longer matched any live line (the audit's source check matches on the first 40 characters, which the new lines share, so these were removed by hand). Audio is in git history (parent commit of `fish1`).

| Voice | File | Old words |
|---|---|---|
| rose | data/voice/dialog-ch25.js | He said if you were late he'd catch the fish without you. He's never caught a fish. |
| tom | data/voice/dialog-ch3.js | Then we had better go help him not catch one. |
| gus (Reel) | data/voice/dialog-ch3.js | Your father has been fishing this pier since before the pier. He has caught nothing. Very consistent. |
| boppy | data/voice/dialog-ch1.js | Here, take my spare cap. For luck. I caught nothing in it, so the luck is all still inside. |

## Second pass (same day): lines for moves that were replaced

Tom found `chalk_up` (Grace) still in the Voice Library. These moves were replaced by new ones (for example chalk_up became bedazzle_blast) but their lines stayed, because the old animation code still mentions the name, so the first audit counted them as used. 23 lines and their 23 clips removed. The old animation functions in `engine/*-moves.js` are dead code and were left in place.

| Character | Kind | Words |
|---|---|---|
| tom | controller_tap | One button. Entirely sufficient. |
| tom | crumb_shot | Still warm. The steam is the BEST part. |
| tom | mint_unboxing | It just arrived. It was NOT cheap! |
| tom | window_seat | Window seat. Shade down. Do NOT disturb. |
| tom | proofing_drawer | A proofing drawer. For emotional support. |
| tom | toast_negotiations | Both halves are EXACTLY fair. |
| tom | warranty_void | That warranty was holding us BACK. |
| tom | crumb_barrier | The crumbs are STRUCTURAL. |
| tom | five_minute_review | Five-minute review. This WILL be useful. |
| tom | dpad_detour | The D-pad says take the SCENIC route. |
| tom | save_sandwich | Save first. Sandwich second. BOTH essential. |
| tom | radical_solutions | A radical solution. Very LITERALLY. |
| tom | patch_notes | Patch notes: touching has been REMOVED. |
| grace | split_leap | Split leap! All the way over! |
| grace | chalk_up | Chalk up! Clap clap! Now my tumbling pass! |
| boppy | cap_check | Cap check. Not past me. |
| boppy | closing_time | Closing time. That nonsense is closed. |
| boppy | sensible_pepper | One pepper. Sensible size. Stomach may disagree. |
| boppy | jar_lid_negotiations | Jar-lid negotiations. I was being polite before. |
| tnb | clay_offcut | Clay offcut. Waste not, bonk not. |
| tnb | lost_found_warmth | Lost warmth. Found scarf. Nice connection. |
| tnb | practical_effects | Practical effects. The string is part of the charm. |
| tnb | clay_pigeon | Clay pigeon. Literally. I worked on that pun. |


## Third pass (`dead1`, 2026-11-01 night)

Lines whose only player was an old animation deleted in this pass:

| Character | Kind | Line |
|---|---|---|
| tom | starter_inspection | Bready Mercury has NOTES. |
| grace | beam_dismount | Beam dismount! Ten out of ten! |

## Fourth pass (`deedee1`, 2026-11-02)

Deedee's greeting and kitchen line were reworded at Tom's request (see CHANGES 74), so the baked clips of the old words can never play:

| Character | Kind | Line |
|---|---|---|
| deedee | greet (battle) | There's my Tommy! |
| deedee | dialogue (dialog-ch1) | There's my Tommy! |
| deedee | dialogue (dialog-ch25) | There's my Tommy! And my girls! Come here, come here. |
| deedee | dialogue (dialog-ch25) | Tom, you're skin and bones. Sit. The crisp needs ten minutes on the counter. |
| deedee | dialogue (dialog-ch26) | There's my Tommy! And my girls! And my... oh. OH. Why is Rose in an ice cube. |

Audio is in git history (the parent of the `deedee1` commit).

## 2026-11-07 (440): takes dropped from phone export 13

38 battle takes that arrived in the export for lines the game does not play: amy hills, hurt, marathon, marathon_ult, tombo2; grace attack, chalk_up, ymamot; rose ymamot; tom controller_tap, crumb_shot, window_seat; tnb tombo, round_with_jojo; and 24 Justin beats (bad_call, breaker_flip, demo_day, drywall, foot_tap, fresh_fit, giant_sneeze, loose_wire_zap, wire_nuts, and one empty-kind OUCH). They were never merged into a committed file; the audio stays in Tom's export.

## 2026-11-08 (voice14): old bigone stand-ins for The Mirrorball

17 dialogue clips under the `bigone` voice (the fallback used until Tom baked The Mirrorball): dialog-ch9 (13: Guests! GUESTS!, I CAUGHT it, Then they can come UP, Every full moon (two takes), One dance, From the top!, Round 2 to 5 The band plays on, one more song, see you next moon), dialog-ch26 (Fine. The party is over; Here. One of my little mirrors) and dialog-ch27 and ch26 (If I'm the brightest thing in the sky, two takes). Replaced by the 17 `mirrorball|` clips in dialog-ch28. Audio is in git history (the parent of the `voice14` commit).

Also dropped, not merged: 38 battle takes in phone export 14 for lines the game does not play (the same 38 as export 13: amy hills, hurt, marathon, marathon_ult, tombo2; grace attack, chalk_up, ymamot; rose ymamot; tom controller_tap, crumb_shot, window_seat; tnb tombo, round_with_jojo; 24 Justin beats). The audio stays in Tom's export.

## 2026-11-12 (`dialogclear1`): old wording of the 283 reworded dialogue lines

Tom decided on a full dialogue clarity rewrite (docs/CHANGES.md `dialogclear1`). The baked dialogue clips for the old wording (clip key is `voice|text`) can never play, so 275 were purged (about 10.8 MB). Audio is in git history (the parent of the `dialogclear1` commit). Clips per voice: tom 90, tnb 32, amy 26, boppy 18, bigone 16, michael 15, deedee 12, sal 12, grace 12, rose 8, penny 7, page 4, pagew 4, grump 3, kit 3, mudling 2, la_woman 2, log 2, skeeter 2, oolong 1, olivia 1, carmen 1, narrator 1, mirrorball 1. The old texts are the `old` column of the "Lines to bake" table in docs/CHANGES.md `dialogclear1`.
