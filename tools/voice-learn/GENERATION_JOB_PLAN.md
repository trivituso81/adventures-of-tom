# Plan: a job that makes one take for every unrecorded line (written voicelearn4, 2026-11-18; NOT built, NOT run)

Why: Tom will not record or tune the rest of the game. Voice lines with no clip are silent (or computer speech) until a take exists. This job makes the takes, checks them with `guard.py`, and hands them to a normal merge. It does not choose between takes (no picker exists) and makes one take per line.

## Numbers (from `data/voice-index.json` on main, 2026-11-18)
| Fact | Number |
|---|---|
| Lines with no clip (`f` below 0, a voice chosen) | 258 (Tom 66, TNB 37, Grace 25, Big One 24, Bernadette 22, Deedee 17, Rose 15, Washington 12, Boppy 10, 9 smaller voices) |
| Characters ElevenLabs would be sent (the script with its tags) | 28,384 (15,572 of them spoken words) |
| Add the regenerate-once for flagged takes (4.5% of takes failed in Tom's real send; a flagged take is regenerated once) | about 29,700 characters |
| Credits | ElevenLabs bills text to speech per character, 1 credit per character on its standard models, so about 28,400 credits for one pass and about 29,700 with regenerates. Model in use is `eleven_v4`; I could not confirm its per-character rate (public pages list v3 at 1 credit per character and a separate v4 line), so treat 1 per character as the working figure and check the first run's usage in ElevenLabs before the rest. |
| Dollars if billed at the public API rate of $0.10 per 1,000 characters | about $2.84 one pass, $2.97 with regenerates (a guess for v4, and Tom's plan may bill by credits instead) |

The plan page's "91 unrecorded Deedee lines" does not match the index (17 Deedee lines have no clip); the index is the count used here.

## Design
| Piece | Decision |
|---|---|
| Trigger | GitHub Action `voice-gen`, manual run only (`workflow_dispatch`), inputs: `voices` (empty = all), `limit` (default 5, so the first run is a small test), `dry_run` (default true, prints the lines and character count and calls nothing). |
| Key | Repo secret `ELEVENLABS_API_KEY`. Tom adds it (Before-step below). The job never prints it and the workflow does not run on push. |
| Input | The 258 items of `data/voice-index.json` with `f` below 0 and no `nv`. Each one's script `s` is sent unchanged (Claude's drafted tags; `lint_tags.py` runs first and a script over the limit is skipped and listed). Voice id, model, stability, similarity and speed come from the index's `voices` entry for `dialog|<voice>`, the same body the Voice Library sends (`voices.html`, line 438). |
| Take | One request per line, random seed. `guard.check_audio` transcribes it. Flagged (3+ extra words): one regenerate with a new seed. Flagged twice: no third try; the line goes on a list `needs-human.txt` and no clip is made for it (a looped clip in the game is worse than a silent line). |
| Output | Commits an export file in the format `merge-local.js` reads (`{clips:[{kind,voice,lineKind,text,mp3,script,takeId,t}]}`) to a branch `generated` (never main, never served), plus `report.json` (per line: attempts, extra words, characters sent). |
| Merge | A normal session merges it: `node tools/voice-library/merge-local.js <export> data <outdir>`, copy data and tools, bump tags, `make-index.js`, `unused_voice.py`, smoke, push (the "Phone clip exports" steps in claude/next.md). The merge writes each line's script as the kept script. |
| Loudness | Not levelled. New clips would sit at a different level from the same voice's old clips (Deedee's old kept takes are 4.6 dB hotter than the median), which is worse than a flat set. Levelling needs the per-voice playback gain described in README; a separate small build if Tom wants it. |
| Not in the job | No scoring of takes, no several takes per line, no changes to any script, no changes to a baked clip. |

## What to expect (fact, from his earlier take history)
The scripts are Claude's untested drafts. On the 113 lines Tom tuned, 67% of the words Claude had written were still in his kept take, and no method tested could improve on the untouched script. So the clips will play, with the right words and no loops; whether each one has the delivery he would pick is not something these tools can learn. The record to keep per round: lines he tunes afterwards and how many of Claude's words he keeps.

## Before the job can run (Tom decides, after reading this)
1. Open github.com/trivituso81/adventures-of-tom > Settings > Secrets and variables > Actions > New repository secret. Name `ELEVENLABS_API_KEY`, value his ElevenLabs API key, Add secret.
2. Tell the next session "voice-gen is approved, run the 5-line test". That session builds the workflow (it does not exist yet), runs it with limit 5, and reports the credits it actually used before anything else runs.
