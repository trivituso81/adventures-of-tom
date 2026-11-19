# voicelearn2: does any measure of the sound pick the take Tom kept?

Stage 2 of claude/voice-learning-plan.md (Project). Input: branch `takes` (his real send of 2026-11-18 15:48 PT: 922 takes of 345 lines, every take with its audio, one kept take per line). Rebuild everything with `tools/voice-learn/run.sh`.

## Facts about the data
- Chance is 45.0%, not 25%: most lines have 2 takes (282 of 345).
- The kept take is the newest take on 341 of 345 lines. "Kept" is therefore almost "the one he stopped on". Only pure re-rolls (same script in every take, 180 lines) are free of script differences.
- 41 takes contain 3 or more spoken words that are not in the script (the line looped, or a tag was read aloud). Those distort every pace and duration measure, so each test is also run without them.

## Measures (per take)
Pace (words and letters per second of speech), loudness (LUFS, RMS, peak, dynamics), pitch (median, spread, range, start, end, slope, jitter), pauses (count, total, longest, share), spectral shape (centroid, rolloff, flatness, high band share, 12 voice-colour values), and a transcript check (Whisper tiny.en, sherpa-onnx): words in the take that are not in the script, script words missing, wrong words. Clipping never happens (loudest peak is -0.03 dBFS), so it was dropped.

## The test
Each line is held out; the rule or model is fitted on the other lines and must pick the kept take. Reported against chance and against a permutation null (which take is kept shuffled within each line; for the best-of-38-measures case the null is the best of 38).

| Set | Lines | Chance | Best single measure (corrected p) | 10-fold model on all measures | Verdict |
|---|---|---|---|---|---|
| Pure re-rolls (same script every take) | 178 to 180 | 49.5% | mfcc8 56.2% (p 0.94) | 49.3% (null 48.2%, p 0.45) | nothing separates |
| Script changed between takes, looped takes removed | 138 | 38.8% | pace 53.6% (p 0.008) | not run | pace, caused by his script words (he adds "quickly" and similar) |
| All lines, looped takes removed | 316 | 44.8% | mfcc1 51.9% (p 0.30) | not run | nothing separates |
| All lines, looped takes kept in | 344 | 45.0% | pace 53.8% (p 0.03) | 53.1% (p 0.017) | the pace result is the looped takes (they run 1.5x long) |

Per voice on pure re-rolls (Deedee 32 lines, Tom 24): 39% and 37% against 49%: no signal, sample too small to say more. With about 180 pure re-roll lines the standard error is about 3.7 points: a method that picks right 65% of the time would have shown; one at 55% could hide.

## What does separate kept from thrown away: a transcript check
| Fact | Number |
|---|---|
| Takes with 3+ extra spoken words | 41 (33 lines); 2 of them kept (5%), against 37% of all takes |
| Lines mixing looped and clean takes | 32; the kept take is the clean one in 31 |
| Threshold (1, 2, 3, 4, 6 extra words) | the pattern holds at all of them; threshold picked leave-one-line-out |
| Hit rate if flagged takes are vetoed and the rest picked at random | 48.6% against 45.0% chance (permutation p below 0.001) |
| Same, on pure re-rolls | no change (49.5%): only 2 of 180 pure re-roll lines have a looped take |
| Cause | the first bracket tag. 100+ characters: 31 of 48 takes fail (65%), all Deedee's old long tag block. Under 60 characters: about 1%. |
| Exposure in the game now | `data/voice-index.json`: 1 script with a first tag over 100 characters (a Washington line that already has a clip); the 91 unrecorded Deedee lines have a median first tag of 39 characters |

It is a failure filter, not a taste picker: among clean takes it adds nothing. 61% of the flagged takes are also 1.3x or more longer than their sibling takes (a real repeat in the audio); the rest are tag read aloud or an ASR repeat. A tighter detector would use both.

## Pace and loudness per voice (cheap things the plan asked for)
Kept over thrown pace, lines where his script changed (the same on pure re-rolls is 1.00 for everyone, so the generator itself is not faster in his kept takes):

| Voice | Lines | Kept take pace | Same-script control |
|---|---|---|---|
| Washington | 7 | +15% | no re-rolls |
| Deedee | 40 | +9% | 1.005 |
| TNB | 11 | +7% | no re-rolls |
| Tom | 30 | +5% | 1.009 |
| Amy | 18 | -1% | 1.019 |

Not applied to `voices[...].speed`: the speed comes from his script words, and on a re-roll he does not prefer the faster take. Kept-take loudness (LUFS, mean): Deedee -17.9, Amy -19.1, Toad -20.6, TNB -21.7, Ellie -21.0, Grace -24.0, Tom -24.1, Big One -23.8, Boppy -25.8 (voices with 5+ kept takes: results/final.json). Grace sits 3 LU under Ellie in kept takes, not 6 to 10.

## Files
`decode.py`, `features.py`, `asr.py`, `asrfeat.py`, `analyze.py`, `analyze_clean.py`, `model.py`, `final.py`; `results/features.json` (measures per take id), `results/asr_tiny.json` (transcript per take id), `results/final.json`. Audio stays on branch `takes`.
