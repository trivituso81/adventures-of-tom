# Plan: a job that makes one take for every unrecorded line (written voicelearn4, 2026-11-18; BUILT in voicegen1 as .github/workflows/voice-gen.yml and tools/voice-learn/voicegen.py; copy of tools/voice-learn/GENERATION_JOB_PLAN.md in the repo)

Why: Tom will not record or tune the rest of the game. Voice lines with no clip are silent (or computer speech) until a take exists. This job makes the takes, checks them with `tools/voice-learn/guard.py`, and hands them to a normal merge. It does not choose between takes (no picker exists) and makes one take per line.

## Numbers (from `data/voice-index.json` on main, 2026-11-18)
| Fact | Number |
|---|---|
| Lines with no clip (`f` below 0, a voice chosen) | 258 (Tom 66, TNB 37, Grace 25, Big One 24, Bernadette 22, Deedee 17, Rose 15, Washington 12, Boppy 10, 9 smaller voices) |
| Characters ElevenLabs would be sent (the script with its tags) | 28,384 (15,572 of them spoken words) |
| Add the regenerate-once for flagged takes (4.5% of takes failed in Tom's real send) | about 29,700 characters |
| Credits | ElevenLabs bills text to speech per character, 1 credit per character on its standard models: about 28,400 credits for one pass, about 29,700 with regenerates. The model in use is `eleven_v4`; its per-character rate was not confirmed (public pages list v3 at 1 credit per character and a separate v4 line). Treat 1 per character as the working figure and check the first run's usage in ElevenLabs before the rest. MEASURED in voicegen1: see "Built and first run" below (about 0.39 per character on a 5-line sample). |
| Dollars at the public API rate of $0.10 per 1,000 characters | about $2.84 one pass, $2.97 with regenerates (a guess for v4; his plan may bill by credits instead) |

The older plan page said "91 unrecorded Deedee lines"; the index says 17 Deedee lines have no clip. The index count is the one used here.

## Design
| Piece | Decision |
|---|---|
| Trigger | GitHub Action `voice-gen`, manual run only (`workflow_dispatch`), inputs `voices` (empty = all), `limit` (default 5, so the first run is a small test), `dry_run` (default true: prints the lines and character count, calls nothing). |
| Key | Repo secret `ELEVENLABS_API_KEY`. Never printed. The workflow never runs on push. |
| Input | The 258 items of `data/voice-index.json` with `f` below 0 and no `nv`. Each script `s` is sent unchanged. `lint_tags.py` runs first; a script over the limit is skipped and listed. Voice id, model, stability, similarity and speed come from the index's `voices` entry for `dialog|<voice>`, the same body the Voice Library sends (`voices.html`, line 438). |
| Take | One request per line, random seed. `guard.check_audio(raw_mp3, script)` transcribes it. Flagged (3+ extra words): regenerate once with a new seed. Flagged twice: no third try; the line goes on `needs-human.txt` and no clip is made for it (a looped clip in the game is worse than a silent line). |
| Output | An export file in the format `merge-local.js` reads (`{clips:[{kind,voice,lineKind,text,mp3,script,takeId,t}]}`) committed to a branch `generated` (never main, never served), plus `report.json` (per line: attempts, extra words, characters sent). |
| Merge | A normal session merges it per "Phone clip exports" in claude/next.md. The merge writes each line's script as the kept script. |
| Loudness | Not levelled. New clips would sit at a different level from the same voice's old clips (Deedee's old kept takes are 4.6 dB hotter than the median), which is worse than a flat set. Levelling needs a per-voice playback gain (the game plays every clip at one level; `dvPlay` does not know the speaker); a separate small build if Tom wants it. Gains are in `tools/voice-learn/results/gains.json`. |
| Not in the job | No scoring of takes, no several takes per line, no script changes, no change to a baked clip. |

## What to expect (fact, from his earlier take history)
The scripts are Claude's untested drafts. On the 113 lines Tom tuned, 67% of Claude's words were still in his kept take, and no method tested could improve on the untouched script. The clips will play with the right words and no loops; whether each one has the delivery he would pick is not something these tools can learn. Record per round: lines he tunes afterwards and how many of Claude's words he keeps.

## Built and first run (voicegen1, voicegen1b, voicegen1c; 2026-11-18; fact, not plan)
| Fact | Result |
|---|---|
| What exists | `.github/workflows/voice-gen.yml` (GitHub > Actions > voice-gen > Run workflow; manual only), `tools/voice-learn/voicegen.py`, `tools/voice-learn/voicegen_test.py` (26 checks on a stand-in ElevenLabs server). Inputs: `voices`, `limit` (default 5; 0 = all), `dry_run` (default true), `retry_failed`. Output on branch `generated`: `export-NNN.json` (20 clips each, the format `merge-local.js` reads), `report-<time>.json` (per line attempts and extra words, characters sent, the account's character count before and after), `needs-human.json` and `.txt`, `unchecked/` (a paid take whose check failed). A run restores what the branch holds first, so a line already made is never made again; the branch is force-pushed with its full contents each run. Limits: stops at 35,000 characters sent in one run (`--max-chars`) and at the first 401. |
| Dry run (run 44449086075) | 5 lines, 623 characters, nothing sent. Order is round robin over voices, so limit 5 = tom, tnb, grace, bigone, bernadette. |
| Real run 1 (44449327362) | Made nothing. The GitHub runner has no ffmpeg; the transcript check failed after each paid take and the job threw the takes away (623 characters sent, 5 takes lost). My bug in two places (the workflow's `ffmpeg -version \| head -1` hid the failure; a checker error was treated as a line error). Fixed in voicegen1b: ffmpeg installed on the runner, a preflight test before any paid request (exit 2, nothing sent), a paid take is kept in `unchecked/` if the check fails and the run stops. |
| Real run 2 (44449938129) | 5 lines, 5 clips, 0 flagged, 0 regenerates, 623 characters sent (354 spoken). The account's character count went from 162,540 to 162,785 of 600,000 (plan tier `pro`): **245 credits for this run, about 0.39 per character sent (0.69 per spoken character)**, from one 5-line sample. The reading before run 1 was 162,237, so the first (failed) run read 303 and may include other use of the account in between; run 2 is the clean figure. |
| What it says for the other 253 lines | About 27,800 characters: roughly 11,000 credits at the sampled rate, about 11,500 with the regenerates of flagged takes (4.5%), about 2% of the 600,000. Upper bound at 1 credit per character: 29,700. Check the first big run's report against this. |
| Words check | The 5 takes were transcribed again here with Whisper tiny: right words, no loops, no tag read aloud (extra spoken words 0 or 1; tiny's own mis-hearings such as "Scare here" for "Scarier" are not flagged). |
| Merge check | `merge-local.js` reads `export-001.json` unchanged (5 clips added to dialog-ch2.js and dialog-ch8.js in a scratch folder; nothing merged into the game). |
| Not done | The other 253 lines are not made; nothing is merged into the game; no loudness levelling. Voice files grow by about 123 KB of base64 per clip, so about 31 MB for the rest. |

## Next: voicegen2 (run all, merge)
1. Run the workflow with `dry_run` false and `limit` 0 (GitHub API: `gh api repos/trivituso81/adventures-of-tom/actions/workflows/voice-gen.yml/dispatches -f ref=main -f 'inputs[dry_run]=false' -f 'inputs[limit]=0'`; `gh workflow run` does not work from a session, it needs GraphQL). Poll the run with `gh api .../actions/runs/<id>`. About 25 to 40 minutes. Read its report: credits used, flagged lines, needs-human list.
2. Fetch branch `generated` (`git fetch --depth 1 origin generated; git archive FETCH_HEAD | tar -x -C /tmp/gen`), merge every `export-*.json` per "Phone clip exports" in claude/next.md (comma list), then `make-index.js`, `unused_voice.py`, smoke, push. A Justin line in `justin-dialogue.json` with a 110-character first tag is skipped by the job: shorten it by hand first only if its line is in the index with no clip.
3. Tell Tom: how many lines now have a clip, which are on needs-human (silent), the credits used, and that new clips are not levelled.
