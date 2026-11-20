# Voice scripts: Tom's standing requirement and the plan to meet it (2026-11-18 15:40 PT; stage 1 built 16:00 PT, voicelearn1, main dabf7fc; stage 2 run 16:10 PT, voicelearn2, main df8de85, corrected in voicelearn2fix, main 82853da; stage 2b run 17:20 PT, voicelearn3, main 74eadc4; stage 3 built 18:25 PT, voicelearn4, main 7fcf140)

This page wins over claude/next-addendum-calib3build.md where they differ: that page's "Change of method" paragraph (Tom tunes, Claude merges) and its calib4 list are WITHDRAWN. Its facts (merge, bank additions, loudness, corrections 16 to 23) stand.

## The requirement (Tom, 2026-11-18 15:22, not negotiable)
"i absolutely will not be reviewing and revising every line in this game ... my warranted expectation is that from every tweak i make you learn and are able to do this for the rest of the game alone? you have no choice in this matter."

Never again propose that Tom tunes every scene or every line. Never hand the tuning back to him. His tweaks are training material; the rest of the game is Claude's job. Every reply on this work reports one number: on lines he did tune, how many of Claude's words he kept.

## Where it stands (facts, measured 15:30 from his take history: 2,170 lines with a kept take)
| Fact | Number |
|---|---|
| Lines where he changed the tag words | 113 (Deedee 26, Tom 25, Amy 16, TNB 10, Grace 7, Washington 7, Aunt Ellie 5, others 17) |
| Days he listened line by line (11-06, 11-07, 11-09, 11-18) | He changed 49 of 102 lines. On 11-18: 18 of 23. |
| Bulk days (11-03, 11-04, 11-13) | 1,828 lines generated, 22 changed. An untouched script there is not approval. |
| On the 113 lines, words of the script he started from that are still in his kept take | 308 of 459 (67%). His kept takes hold 500 words, so 192 are his own. |

## What was tested and failed (do not repeat)
| Method | Test | Result |
|---|---|---|
| Rules written by reading his kept scripts (calib1 round 2) | He tuned the lines | 4 of 19 words kept |
| Words borrowed from his other voices (calib3 draft, Aunt Ellie's door) | Blind comparison with what he kept | 3 of 24 |
| Per-voice word statistics from all 113 retuned lines: delete the words he deletes, swap in his usual replacement, add "quickly" where he adds it, global deletions, first or last word of each bracket only | Each line predicted from the other 112 (leave one out), and the door scene predicted from earlier takes only. Scripts: /home/claude/work/learn/pairs.py and model.py (rebuild from the take history: first take against kept take per line; copies in this Project: claude/voice-learn/pairs.py and model.py). | No rule beat leaving the script alone. Best rule: 68% of words kept against 67% untouched, and it lost some of his words. Adding "quickly" made it worse (64%). |
| Sound measures of each take (voicelearn2, 11-18 16:10): pace, loudness, pitch, pauses, voice colour (38 measures) | Each line held out; rule or 10-fold model fitted on the other lines must pick the kept take | On 180 pure re-roll lines (same script in every take): best measure 56% against 49.5% chance (corrected p 0.94), 10-fold model 49%. See "Stage 2 results". |
| Learned speech embeddings (voicelearn3, 11-18 17:20): wav2vec2-base, HuBERT-base, an emotion-tuned wav2vec2; layer 6 mean over speech frames | Same held-out test, bar 60% with p below 0.05 fixed beforehand | 49.3%, 50.3%, 49.0% on 179 pure re-roll lines. FAIL. See "Stage 2b results". |

Why (analysis, updated after stage 2b): the same word is kept on one line and deleted on the next in the same voice, and neither summary numbers of the sound (speed, level, pitch, pauses, voice colour) nor a speech model's view of the audio tells his kept take from the one he threw away when both are clean and the script is the same. Five methods have now failed the same question (rules from words three times, summary measures of sound once, learned speech embeddings once). This is the stop-loss, twice over. Possible reasons, none tested: "kept" is the take he stopped on (341 of 345 lines), not necessarily the take he preferred; with 179 pure re-roll lines a picker at 55% could hide; what he hears may be a property of one performance (a breath, a stress) that these models average away. Nothing further is tried on this data. More takes (new sends) are the only thing that makes the question testable again.

## The change of method: learn from the sound, then make and check takes without Tom
Every take he makes, kept or thrown away, is saved on his phone WITH its audio (voices.html `takes` store: {id, line, mp3, label, script, t}). Only the kept take's audio had ever reached Claude before stage 1.

| Stage | Build name | What | Test that decides if it goes on |
|---|---|---|---|
| 1 | voicelearn1 (BUILT 11-18, main dabf7fc) | Voice Library button "Send my takes to Claude (N waiting)". See "Stage 1 as built" below. | Stand-in test passed; a REAL send arrived 11-18 15:48 PT (922 takes, 345 lines, 8 parts). |
| 2 | voicelearn2 (RUN 11-18, main df8de85) | Measure each take (pace, loudness, pitch, pauses, voice colour, transcript check) and test on held-out lines whether any measure picks the kept take. | Result: none does on re-rolls, so STOP. One filter works (looped or tag-read takes). "Stage 2 results" below. |
| 2b | voicelearn3 (RUN 11-18, main 74eadc4) | Same held-out test with learned speech embeddings (huggingface.co was reachable). | Bar 60% with p below 0.05 on pure re-rolls. Result: 49% to 50%. FAIL, so no picker. "Stage 2b results" below. |
| 3 | voicelearn4 (BUILT 11-18 18:25 PT, main 7fcf140) | The failure guard tools: `guard.py` (transcript check), `lint_tags.py`, `results/gains.json` (loudness report), and the written plan for the take-making job. See "Stage 3 as built" below. The job itself (GitHub Action, his ElevenLabs key as a repo secret, one take per unrecorded line, check, regenerate once) is NOT built: next is voicegen1, after Tom adds the key. No scorer, no several-takes-per-line. Claude tells Tom plainly that taste among clean takes cannot be learned from his takes with these tools; it does not ask him to tune lines. | Track per round: lines he tunes afterwards, words of Claude's script kept. |
| 4 | | When new takes arrive (a new send is a new session folder on `takes`), the stage 2 and 2b pipelines run again on all takes: `tools/voice-learn/run.sh`, `embed.py`, `embtest.py`. A bar passed on new data would reopen the picker. | |

Cost to flag to Tom before the build job, once, as a fact: generating takes uses ElevenLabs credits. See claude/voice-generation-plan.md: 258 unrecorded lines, 28,384 characters, about 29,700 with the regenerates, about 1 credit per character (the v4 rate is unconfirmed). Several takes a line is NOT planned (no scorer to choose with).

## Stage 3 as built (voicelearn4, 2026-11-18, main 7fcf140; code and numbers: tools/voice-learn/README.md section "voicelearn4")
| Piece | Fact |
|---|---|
| `guard.py` | Whisper tiny.en transcript at 16 kHz; a take with 3 or more spoken words not in its script is flagged. `guard.py takes <dir>` for a send, `guard.py wav <mp3> --script "<script>"` for one take (exit 3 = flagged), `check_audio(raw_mp3, script)` for the job. All 922 takes, fresh: 39 flagged (31 lines), 2 kept (Boppy "Nobody take them fast", said twice and kept; Kenji "Irasshaimase", Whisper mishears Japanese). The stage 2 run said 41: the 2 extra were Whisper hallucinating on 24 kHz audio of normal-pace takes; the 16 kHz read is right. A flag means regenerate once, never delete. Results: results/guard_takes.json. A duration check was tried and dropped (37 of 38 flagged run slow, but so do 82 of 873 clean). |
| `lint_tags.py` | First bracket tag of 100+ characters, over data/voice-index.json and tools/voice-library/scripts/*.json (11,023 scripts): 2 found. Washington "Back in 1979, this whole block..." (105 characters, clip already baked) and a Justin line in justin-dialogue.json "Grace, Rose, come here..." (110, not in the index, no clip). Neither changed; shorten the Justin one when it is recorded. |
| Loudness | results/gains.json, target -22.5 LUFS (median of voices with 5+ kept takes): Deedee -4.6 dB, Amy -3.4, Toad -1.9, Luna -1.6, Ellie -1.5, Rose -1.1, TNB -0.8, Grump -0.1, Washington +0.3, Big One +1.3, Grace +1.5, Tom +1.6, Skeeter +1.8, Mudling +1.9, Log +2.9, Boppy +3.3. REPORT ONLY: the baker applies no per-voice gain and the game plays every clip at one level (dvPlay does not know the speaker), so nothing was wired and no baked clip changed. Levelling needs a per-voice playback gain: a separate small build if Tom asks. |
| Takes branch | No newer send than the 922 takes (session 20261118T234857-q6s). |
| Unrecorded lines | 258 in the index (f below 0, voice chosen); the older "91 unrecorded Deedee lines" is 17 in the index. |

## Stage 2 results (voicelearn2, 2026-11-18 16:10 PT; code, numbers and files: tools/voice-learn/README.md and results/ in the repo)
Data: his real send, branch `takes`, session 20261118T234857-q6s: 922 takes of 345 lines, exactly one kept take per line.
| Fact | Number |
|---|---|
| Chance of picking the kept take | 45.0% over 344 lines (not "about 1 in 4": 282 of the 345 lines have only 2 takes) |
| Kept take is the newest take of its line | 341 of 345. "Kept" is nearly "the one he stopped on", so only lines with the identical script in every take (pure re-rolls, 180 lines, chance 49.5%) are free of script differences. |
| Pure re-rolls, best single measure | mfcc8 56.2%, corrected for trying 38 measures p 0.94. Ten-fold model of all measures: 49.3% (null 48.2%). Per voice (Deedee 32 lines, Tom 24): no signal. With about 180 lines the standard error is about 3.7 points: a 65% picker would have shown, a 55% one could hide. |
| Pace looked significant on all lines | 53.8% against 45.0% (p 0.03). It was 41 looped takes (about 1.5x long). Without them: 50.9% against 44.8% (p 0.59). |
| Lines where his script changed between takes | pace 53.6% against 38.8% (p 0.008) even without loops: that is his own script words ("quickly"), not something a re-roll can give |
| What does separate kept from thrown away | A transcript check (Whisper tiny.en through sherpa-onnx, model from the GitHub release `asr-models`): 3 or more spoken words that are not in the script. 41 takes, 2 kept. In the 32 lines that mix looped and clean takes the kept take is clean in 31. Hit rate if flagged takes are vetoed and the rest picked at random: 48.6% against 45.0% (p below 0.001); on pure re-rolls no change (only 2 of 180 lines have such a take). |
| What those takes have in common | The first bracket tag. 100+ characters: 49 takes, all Deedee, all the identical block "grounded and natural; warm and loving when the line calls for it, firm and commanding when it calls for that, ..."; 32 of them fail (65%). Under 100 characters: 871 takes, 9 fail (1%). The link is measured; that the voice reads long tags aloud is not tested. |
| Exposure in the game now | `data/voice-index.json`: one script with a first tag over 100 characters (a Washington line that already has a clip). Nothing to fix. |
| Per voice pace, his kept take over his thrown take, lines where his script changed (same-script control is 1.00 everywhere) | Washington +15% (7 lines), Deedee +9% (40), TNB +7% (11), Tom +5% (30), Amy -1% (18). NOT applied to `voices[...].speed`: it comes from his script words, and on a re-roll he does not prefer the faster take. |
| Loudness of kept takes (LUFS, voices with 5+ kept takes) | Deedee -17.9, Amy -19.1, Toad -20.6, Ellie -21.0, TNB -21.7, Washington -22.8, Big One -23.8, Grace -24.0, Tom -24.1, Boppy -25.8 (results/final.json). Grace is 3 LU under Ellie, not 6 to 10. |
| Not available in that sandbox | Clipped words: nothing clips (loudest peak -0.03 dBFS). huggingface.co was blocked then; it is reachable now (voicelearn3). |

Verdict (the plan's rule: "if no measure separates them, say so and stop"): no sound measure picks his kept take on re-rolls. The transcript check is a failure filter only; among clean takes it adds nothing.

## Stage 2b results (voicelearn3, 2026-11-18 17:20 PT; code and files: tools/voice-learn/ embed.py, embtest.py, README section "voicelearn3", results/embtest_*)
Same data (no newer send had arrived). 922 takes, 854 after removing looped takes; 179 pure re-roll lines (363 takes, chance 49.5%), 317 clean lines in all.
| Fact | Number |
|---|---|
| Models | facebook/wav2vec2-base, facebook/hubert-base-ls960, superb/wav2vec2-base-superb-er (all from huggingface.co; reachable, weights download in under a minute) |
| Method | per take, mean over speech frames of each layer; line mean subtracted; logistic regression, 10-fold by line, 3 regularisation strengths; permutation null (kept take shuffled within line) |
| Primary tests (layer 6, pure re-rolls), best strength | wav2vec2 49.3% (p 0.90), HuBERT 50.3% (p 0.75), emotion model 49.0% (p 0.95). Bar 60%. FAIL. |
| Same on all clean lines (317, chance 44.9%) | 48.9%, 48.3%, 48.5% (p 0.28 to 0.35) |
| Exploratory sweep after the failure (other layers, 4 emotion scores), pure re-rolls | Two of 21 variants reached 60.3% (wav2vec2 layer 2) and 58.7% (HuBERT layer 10). Neighbouring layers and the other models sit from 42% to 56%. Best of 21 on shuffled labels averages 59.1% (95th percentile 63.2%); corrected p 0.32. Chance, not signal; not used. |
| Cost to repeat | about 20 min on 2 CPU cores; pip torch is about 3 GB |

Verdict: no picker is built. Stage 3 is the failure guard only.

## Stage 1 as built (voicelearn1, 2026-11-18, main dabf7fc)
| Piece | Fact |
|---|---|
| Button | voices.html footer, id `sendtakes`: "Send my takes to Claude (N waiting)". Code: `sendTakes`, `takesToSend`, `tkEnsureBranch`, `tkPut`, `autoSendTakes` in voices.html (section "send every take to Claude"). Uses the Art Library token `aot-gh-token`; `?gh=` swaps the GitHub address (tests). |
| Which takes | Lines with MORE THAN ONE take, every take (kept or not) not yet sent. A line with one take waits until it gets a second. Sent ids: localStorage `aot-vl-takes-sent` on his phone, so a later press carries only new takes. |
| Branch | `takes` (created 11-18 by an orphan commit with a README; the phone also creates it if missing). Never merged into main, never served. |
| Files | `takes/<session>/part-NNN.json`: `{"kind":"takes-part","session":...,"takes":[{id,line,t,label,script,kept,mp3}]}` where `mp3` is the base64 text exactly as the phone stores it, `line` is the Voice Library key (`d|voice|text` or `b|...`), `kept` is a boolean, true for the take the phone plays at send time; `t` is a string of milliseconds. Each part is at most 13 MB of JSON (under 20 MB on the wire). `takes/<session>/state.json`: `{"kind":"takes-state",...,"trail":[...]}`, the words of every take (kept, thrown away, deleted: deleted ones have no audio) at that moment. A later send has a new session folder. |
| Reading it | `tools/voice-learn/run.sh` fetches and decodes everything. By hand: `git fetch --depth 1 origin +refs/heads/takes:refs/remotes/origin/takes`, then `git ls-tree -r --name-only origin/takes` and `git show origin/takes:<path>`. Later sessions' `kept` flags win over earlier ones for the same take id (the newest state.json is the truth about which take is kept). |
| Automatic | Two quiet minutes after the last new take the page sends by itself (silent). |
| Limits | Takes made before a line's second take, and takes whose audio is no longer on the phone, are not sent. Thrown away takes he DELETED have words only (the audio went when he deleted). That is why he must not delete takes. |

## Rules for the sessions
- No tag redrafting by word rules, and no pass over the unrecorded scripts, until a method beats the untouched script on held out lines. Stages 2 and 2b found none; the rule stands. Pushing changes that tested no better is not learning.
- Do not try a sixth method on the same 922 takes. A new method waits for new data (a new send), and its bar is fixed before the run.
- A kept take's script is the record (never retyped or overwritten).
- Tom must not be asked to delete or re-export anything. He should not delete takes: the thrown away ones are the evidence.
- If he records before a send, nothing is lost: the takes stay on the phone and the first send carries them. More takes make a later test stronger: a new send arrives as a new session folder on the branch.

## Next session
voicegen1 (the take-making job), ONLY after Tom has put `ELEVENLABS_API_KEY` into the repo secrets. Read claude/voice-generation-plan.md (same text as tools/voice-learn/GENERATION_JOB_PLAN.md). Steps: (1) check the secret exists (`gh secret list` may be refused; the workflow's dry run says so). (2) Build `.github/workflows/voice-gen.yml` and `tools/voice-learn/gen_takes.py` as the plan describes: manual run, inputs voices, limit (default 5) and dry_run (default true); lint, one take, `guard.check_audio`, one regenerate, `needs-human.txt`, output export and `report.json` on branch `generated`. (3) Dry run, then a real run with limit 5; report the credits actually used (ElevenLabs usage) against the 1 per character estimate BEFORE anything larger. (4) Test the merge of those 5 takes into a scratch copy with `merge-local.js`, do not push the merge. (5) Do not run the other 253 lines until Tom says so after seeing the 5-line numbers. No scoring, no several takes per line, no script changes.
