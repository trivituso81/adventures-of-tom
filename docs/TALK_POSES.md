# Talking poses (talk1, Tom 2026-11-13)

Tom 23:17: "we need some new frames for every main character ... four talking poses ... full body, same as always ... only used when a character is talking and whatever they're saying does not really have a strong emotion associated with it ... there also might be some emotions that we've overindexed on because we had no other choice at the time."

## The four talk types (frame order on the sheet)

Picked from the game's cast dialogue (1,997 lines in docs/emotion-index-lines.tsv). Of the lines that are plain talk, these four patterns cover all of them:

| # | Key | Pose | What lines | Lines (first pass) |
|---|---|---|---|---|
| 1 | `tell` | standing easy, one hand up at chest height, palm open | explaining, describing what they see, reporting a clue, laying out a plan | 573 |
| 2 | `point` | one arm out, pointing, head turned toward it | "look", "over there", directions, orders and rules ("Stay close", "No touching, please", "Up, everybody") | 145 |
| 3 | `ask` | head tilted, both palms up at the waist | every question | 85 |
| 4 | `answer` | weight on one leg, small one-shoulder shrug, loose hand | short replies and one-liners, five words or fewer ("Probably.", "By default.", "Twelve.") | 127 |

## Line-by-line review (talk2, 2026-11-14)

Tom 06:57: "what about tagging all of the dialog with the correct talking pose?" The first pass was a keyword rule over the scene lines only. talk2:
- Coverage: every cast line the game speaks is now a row (2,387): the 51 scene lines the emotion index lacked, plus press-A chats with family, recruit, decline, follower, travel, departure, arrival and pool lines (from tools/voice-library/harvest.json).
- Every row that is not sad, angry or scared (2,006) was read and judged by hand; 461 corrections. Main kinds: 291 lines put back to their mood because the words do carry the feeling (boasts, jokes, loving lines, deadpan); 85 tell to point (orders, "look", rally calls like "Up, everybody", assigning jobs); 42 to answer (short replies); 20 rhetorical complaints ("A school? At night? My stomach says no.") from ask to answer.
- Result: 955 talk lines (tell 500, point 223, answer 149, ask 83); the rest keep their mood. Sad, angry and scared lines (340) were not changed. The 400 non-scene lines have no mood in either index, so they all use a talk pose.
- From now on docs/talk-lines.tsv is hand-judged: never rerun `talk-index.py --init`. New lines: `--add`, then read and correct each new row.

## Which lines use them (first pass, talk1; superseded where talk2 corrected a row)

- Every cast line tagged `none` (110).
- Borderline moods (820): lines tagged happy, loving, proud, surprised or unimpressed whose words carry no sign of that feeling: no "!", no shouted word in capitals, none of that mood's cue words (tools/talk-index.py `CUES`). Example: Amy "Here's the plan. Tom up front, girls with me." was proud, now `point`; Tom "That's five coins. The sundial, the steamer..." was surprised, now `tell`.
- Kept as moods: every sad, angry and scared line; lines with the feeling in the words; unimpressed (Tom's deadpan voice, the comic beat) except orders and plans (22 moved).
- Nara is a dog: no talking poses. Michael and Jojo (townsfolk mood sets) are not included yet.
- Source of truth: docs/talk-lines.tsv (column `talk`: tell, point, ask, answer, or empty = keeps its mood). Corrections are one-word edits there, then `python3 tools/talk-apply.py` (writes data/talk-types.js). New emotion-index rows: `python3 tools/talk-index.py --add` (keeps existing rows). A line with no row and no mood uses the same rule live (`talkRule` in engine/emotions.js; keep it in step with tools/talk-index.py `talk_type`).

## In the game (engine/emotions.js `emoApply`)

- A talk line of a person whose talking sheet is baked: that person stands in `tk_<type>` on the map while the line shows, the dialogue face is the plain talk face (portraits/talk). Cleared when the line advances, like a mood pose.
- A person with no baked sheet: nothing changes (the mood pose, or the plain stance), so the game looks exactly as before until the sheets are installed.
- Listener reactions (docs/emotion-reactions.tsv) are unchanged.

## The sheet (Art Library, tab Characters, entry `<id>-talk`)

- Ten entries: Tom, TNB, Grace, Rose, Amy, Justin, Deedee, Boppy, Aunt Ellie, Olivia. Builder tools/art-library/talk-prompts.js, prompt tools/art-library/prompts/char-talk-sheet.txt (one generic prompt for everyone).
- 4 x 1 row of tall cells, ar 2:1, magenta, full body head to shoes, facing the viewer in the slight three-quarter view, same figure size and ground line in every cell.
- Reference: the person's newest approved emotion sheet (the mood poses the talking poses sit beside on the map).

## Install (after Tom approves sheets)

- Facing (facing1): after baking, add one row per new frame to docs/pose-facing.tsv (l, r or f: the screen side the painted face or gesture is turned to), judged by looking at the frames, then `python3 tools/pose-facing-apply.py`. Smoke fails until every frame has a row.

1. `python3 tools/sprite-bake/talk_frames.py <ids>` (no ids = every approved sheet): cuts the 4 figures (emotion_frames.clean_cell), grows the head by the HEAD SIZES factor about the person's measured chin share, writes art/talk/<id>.webp. `CHECK=/tmp/talk.png` writes a contact sheet: look at it.
2. `nohup python3 tools/sprite-bake/bake_story_poses.py > /tmp/sp.log 2>&1 &` (about 11 minutes): every strip found becomes the set `<id>talk` (frames tk_tell, tk_point, tk_ask, tk_answer) in data/story-poses.js, sized so the Telling figure is the overworld stand height.
3. Look at each person's talking frames next to their standing frame and a mood frame on the map (reaction_test.py on a scene with plain lines, e.g. `ch2Starter`); if a size is off, give that set its own factor in bake_story_poses.py.
4. bump_tags, smoke, push, CHANGES entry.

Test without art (engine only): a `reaction_test.py` case whose first `scenes` entry copies mood frames into `tk_` frames, e.g. `"!(()=>{const M={tell:'proud',point:'surprised',ask:'loving',answer:'unimpressed'};for(const id of ['tom','tnb']){const S=STORY_POSES[id];for(const t of TALK_LIST){S['tk_'+t]=S['em_'+M[t]];S.pals['tk_'+t]=S.pals['em_'+M[t]];}}})()"`, then `ch2Starter` (map `tomhouse`, start `[8,13,"up"]`, party tom, tnb, nara, flag `ch2-nara`, unflag `ch2-starter`). Expected (talk1): TNB `tk_tell`, Tom `tk_ask`, TNB `tk_answer` on pages 2 to 4, moods on the rest.
