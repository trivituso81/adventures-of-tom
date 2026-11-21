# Size and performance remediation plan (2026-11-08, measured on main a94d312)

## Measurements (fact)
| Item | Size | Limit or note |
|---|---|---|
| Published site (whole repo tree, Pages deploys from main root) | 1.14 GB | GitHub: published Pages sites may be no larger than 1 GB. Deploys still succeed today. |
| Repo with history (GitHub API size) | 2.14 GB | GitHub recommends under 1 GB for a Pages source repo. Every re-bake adds a full new copy of the file to history. |
| art/raw (source sheets, never loaded by the game) | 368 MB | Art Library checks art/raw with HEAD requests on the site. |
| tools/sprite-bake/src (bake sources) | 252 MB | Not loaded by the game. |
| data/ (mostly data/voice, audio as base64 inside .js) | 202 MB | dialog-ch28.js is 64.6 MB (GitHub warns at 50 MB, rejects at 100 MB). |
| Baked character sheets art/chars + art/tombo | 102 MB | The pose work. About 9% of the site. |
| docs/reference | 35 MB | Not loaded by the game. |
| Boot scripts in index.html (319 tags) | 56 MB | Mostly per-character voice clips as base64. Downloaded and parsed before the title on a cold start. |
| Decoded image memory per character (all sheets) | Grace 58, TNB 56, Tom 49, Deedee 46, Rose 42 MB | engine/painted.js already lazy-loads and releases sheets (mem1), but a fight can hold a whole party's sheets: Tom+TNB+Grace+Rose up to about 200 MB. |

## Duplicate poses (fact, tools: /tmp/dup2.py method, 40x60 luminance+alpha compare, mirror-aware, same character only)
- 836 painted pose frames in 61 sheets (ability, poses, battle, extra, story, ko, Tombo).
- Pixel-identical copies: 2.
- Same body pose (distance under 0.08): 136 frames (16%), 12% of pose pixels. Most of these differ in face or held prop (scared vs happy, pie vs tray).
- Above 0.08 the frames are visibly different poses.
- Removing every near duplicate would save roughly 10 MB of download. Hygiene, not the cause of the size problem.

## Risk (assessment)
| Concern | Level | Why |
|---|---|---|
| Repo / site size | HIGH | Already over the 1 GB site limit and 2x the repo recommendation. Cause is source files and base64 voice, not poses. |
| Phone performance | MEDIUM | 56 MB boot download, and up to ~200 MB decoded images in a full-party fight (iOS Safari reloads the page under memory pressure). |
| Duplicate poses | LOW | 16% share a body pose, mostly with different faces or props. |

## Plan (recommended order)
1. Publish only the game (reversible, biggest size win). Add a Pages deploy workflow (actions/upload-pages-artifact + deploy-pages) that copies only what the game and the two library pages load; exclude art/raw, tools/, docs/, demo/ sources. Change art.html's art/raw HEAD checks and image URLs to raw.githubusercontent.com/trivituso81/adventures-of-tom/main/art/raw/... . Switch Pages source from "branch" to "GitHub Actions" (Tom clicks one setting, or confirm it can be set by API). Target site: about 0.5 GB. Test: smoke.py, art.html and voices.html load, phone check.
2. Voice out of boot (biggest performance win). Convert base64 clips in data/voice/*.js to real audio files (art-style folder voice/<speaker>/<hash>.m4a or .mp3), keep a small index JS, load per chapter/fight on demand. Keep baked lines byte-identical in sound (no re-encode loss: keep source format). Splits dialog-ch28 under the 50 MB warning. Target boot under 8 MB.
3. Pose memory per fight. Split each -ab atlas per move (or per Stampcard path) so a fight loads only the moves the formation can use; paintedTick already handles release. Target under 80 MB decoded for a full party.
4. Pose reuse going forward. Shared per-character base frames (stance, idle, run, hit, celebrate) referenced by ability and Tombo choreography; new sheets ask the generator only for new poses. Bake tools run a dedupe check: a new frame within 0.06 of an existing frame of the same character is reported and reused instead of stored. Clean the 136 existing near duplicates only where face and prop also match.
5. Guardrails. A budget check in smoke.py or tag_check.py: site size under 800 MB, no file over 25 MB, boot scripts under 10 MB, any atlas over 30 MB decoded flagged.
6. History (irreversible, Tom decides). After 1 and 2, the repo history still holds 2+ GB of old sheet and voice versions. Options: leave it (works, GitHub may email), or rewrite history with git filter-repo to drop old versions of art/raw, art/chars and data/voice (every clone and session must re-clone; old commits lose those files). Recommendation: leave it until GitHub complains, unless pushes start failing.
