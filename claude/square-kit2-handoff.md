# Square kit 2 handoff (2026-11-01 21:40). Read this with claude/square-kit-handoff.md.

## REVISED DIAGNOSIS (21:40, Tom's message "prompt 00 does nothing and prompt 1 talks about an image that was just created")
The two "treated as an edit" failures (21:23 v1, 21:27 v2) were most likely MY packaging, not the prompt wording: the zip put a README as file 00 and the review message as file 02, both numbered like prompts, and my chat reply listed "the rest of the txts" starting with the README. A README (talks about images, editing, painting, layers) or the review message ("the painting you just made") pasted into the same chat BEFORE or WITH the first message puts an image-edit context in front of the generator. Not confirmed (cannot see his chat), but it fits both failures and Tom's complaint. The earlier theory that the 14 KB length or the words cutout/magenta caused it is now secondary; v2 wording is kept (harmless).

FIX DONE: files renamed so only paste-ready prompts start with PASTE_, in order: PASTE_1_FIRST_MESSAGE, PASTE_2_REVIEW_MESSAGE_only_after_a_painting_exists, PASTE_3A to 3D layer messages only_after_approval. README is READ_ME_DO_NOT_PASTE.txt and says so on its first line. Other files: REF_ (for Tom or Claude), ATTACH_WITH_PASTE_2_ (attachments for the review step). Content of the prompts is unchanged from the 21:30 v2 (PASTE_1) and the 21:15 files.

## STOP-LOSS still applies
If PASTE_1, sent ALONE as the first message of a brand-new chat with no images and nothing else pasted before it, is STILL answered as an edit: do not rewrite it. Run the control test: paste the ORIGINAL kit message (claude/square-first-thread-prompt.txt) in the same kind of chat. If the original paints, the long prompt is the problem: take the painting, run the review, then add roof landmarks, the eight signs and the three exit boards as separate edit passes. If the original also fails, it is the tool or the project context: new chat outside any project or another image tool.

## What kit 2 is
Tom found the ORIGINAL First Thread Kit and asked for a new kit that keeps its specs and adds: cutouts for 3D (trees, lamp posts, building tops), each building designed for its purpose with a custom sign blended into the house, and exit signs with an arrow pointing to the area. Project copies: claude/square-kit2-01 to 08 (names keep the old numbering; the zip The_Square_Kit_2.zip uses the PASTE_ names).

## Calls made
| Topic | Call |
|---|---|
| Style | Original kit's STYLE AND CAMERA, SETTING, LIGHT AND COLORS and exclusions verbatim. |
| Lettering | Eight shop signs and three exit boards only; fix a bad sign by repainting only that sign. |
| Fountain | About 16 percent of picture width, just below the upper east-west band, left of center; re-derive the walk mask at install. |
| Props | No notice board, no shop direction sign; exit signposts are the three arrow boards. |
| Layers | Four edit messages (PASTE_3A to 3D) after approval; Claude cuts any layer that does not line up. |

## Supersedes
claude/square-kit-01 (v1 and unsaved v2); claude/square-kit-02 to 05 are replaced by the kit 2 layer messages.

## Install later
claude/square-cutout-spec.md and docs/AREA_PAINTINGS.md (11 words letter by letter, PLATE_SIGNS town to []).
