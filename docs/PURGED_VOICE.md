# Purged voice (2026-11-01)

Tom asked (again) for voice lines and clips that the full game never plays to be removed, because every unused line shows up in the Voice Library and the bake lists and costs ElevenLabs credits. This is the record. The audio itself is not lost: it is in git history at commit `6624b03` (the parent of the purge commit), so `git show 6624b03:data/voice/<id>.js` brings any of it back.

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
