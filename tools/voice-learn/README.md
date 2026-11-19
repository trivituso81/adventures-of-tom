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
| Cause | the first bracket tag. 100+ characters: 49 takes, all Deedee, all the same tag block ("grounded and natural; warm and loving when the line calls for it, firm and commanding when it calls for that, ..."); 32 of them fail (65%). Under 100 characters: 871 takes, 9 fail (1%). The link is measured, the mechanism (the voice reads long tags aloud) is not tested. |
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

## voicelearn3 (stage 2b): the same test with learned speech embeddings
Question: does a pre-trained speech model's view of the audio pick the kept take on held-out lines? Models (huggingface.co, now reachable): `facebook/wav2vec2-base`, `facebook/hubert-base-ls960`, `superb/wav2vec2-base-superb-er` (wav2vec2-base tuned for emotion). `embed.py` writes the mean of every layer over the speech frames of each take (energy mask, 16 kHz); `embtest.py` runs the test: line mean subtracted, standardised, logistic regression (C 0.003, 0.03, 0.3), 10-fold by line, permutation null (kept take shuffled within each line). Looped takes (3+ extra spoken words) removed first. Data: the same send (922 takes, 345 lines; no newer send had arrived). 854 takes clean; 179 pure re-roll lines (363 takes, chance 49.5%).

Bar fixed before the run (plan page): 60% or more on the pure re-roll lines with p below 0.05. Primary tests were layer 6 of each of the three models (so p had to beat 0.05/3).

| Primary test, pure re-roll lines | Best C | Hit rate | Corrected p |
|---|---|---|---|
| wav2vec2-base layer 6 | 0.3 | 49.3% | 0.90 |
| HuBERT-base layer 6 | 0.3 | 50.3% | 0.75 |
| Emotion model layer 6 | 0.3 | 49.0% | 0.95 |
| Same three on all clean lines (317, chance 44.9%) | | 48.9%, 48.3%, 48.5% | 0.28, 0.35, 0.35 |

RESULT: FAIL. No primary test is within 10 points of the bar.

Exploratory sweep (not part of the bar, run after the primary failed): other layers and the emotion model's 4 class scores, pure re-rolls only. Two variants reached 60.3% (wav2vec2 layer 2) and 58.7% (HuBERT layer 10), each with its own p near 0; but the same layers in the other models are 55.0% and 56.4% (layer 2) and 46.6% and 42.5% (layer 10), and several layers sit well BELOW chance (HuBERT layer 12 44%, emotion layer 10 42%). Corrected for having looked at 21 variants (best of 21 against the best of 21 on shuffled labels, 60 shuffles): null best averages 59.1%, 95th percentile 63.2%, observed 60.3%, p 0.32. A 60% best-of-21 is what chance produces here. Not a signal.

What this does not rule out: with 179 lines the standard error is about 3.7 points, so a picker at 55% could hide. And "kept" is the take he stopped on (341 of 345 lines), not necessarily the take he preferred. Nothing here says taste among clean takes does not exist; it says these tools, on this data, cannot find it.

Files: `embed.py`, `embtest.py` (`sweep`, `maxnull` modes), `results/embtest_primary.json`, `results/embtest_sweep.json`, `results/embtest_sweep.log`, `results/embtest_maxnull.log`. Embeddings are rebuilt in about 20 minutes on 2 CPU cores (torch and transformers from PyPI, model files from huggingface.co); the pip torch wheel is large (about 3 GB with CUDA libraries).
