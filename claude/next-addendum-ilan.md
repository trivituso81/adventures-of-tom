# ILAN: new playable Los Angeles character (queued 2026-11-06 09:55, Tom: "Add to build instructions to introduce a new playable LA character named Ilan")

Build nothing from this file until Tom sends Ilan's sheets and height (see Needed from Tom). Two parts: A installs Ilan and the Sol recruit option, B writes his ability prompts into the Art Library after Tom designs the abilities.

## Facts from Tom (09:55)
- Name Ilan, male (Tom said "him"), a Los Angeles character, home town Los Angeles (homes `la`, same as TNB and Nara: he never leaves LA).
- Tom already has Ilan's walk sheet and standard battle sheets. He will design Ilan's abilities later, then ask for the ability prompts.
- Recruit: in chapters that take place in Los Angeles, talk to the cab company owner (Sol, Angel City Cab Co., downtown map `blvd`) and pick an option.
- Party full of recruits (a fourth member such as Olivia): offer the swap-in option, same swap-out prompt as Amy and Deedee use.
- Block: if the party has four members and all four are required by that chapter's story, Ilan cannot be added.

## Needed from Tom (ask ONE line when the session starts, do not guess)
| Need | Why |
|---|---|
| Ilan's walk sheet and two standard battle sheets (attach to the Project or the chat) | Not in the Project docs yet. Save as art/raw/characters/ilan-walk-sheet-v1.png, ilan-battle-sheet-1-v1.png, ilan-battle-sheet-2-v1.png |
| Real height in feet and inches | Required before any spec, prompt or bake (project rule) |
| Ilan's look and a few lines of personality (job, what he loves, one quirk) | Canon, join line, dialogue. Until Tom gives them, keep to what is on the sheets and write nothing about his past |
| Optional: a hero pose picture | Portrait and Status art. Without it, crop the portrait from battle sheet 1 stance frame (same method as `FACE[...]` in bake_portraits.py) and say so |

## Part A: install Ilan and the recruit option (starts when Tom sends the sheets)
### A1. Character install (follow docs/CHARACTER_PIPELINE.md section 6 and the Deedee, TNB and Olivia installs)
| Step | What |
|---|---|
| Sheets | Cut walk sheet with `tools/sprite-bake/walk_sheet_frames.py` (add `ilan`), battle sheets with `battle_sheet_frames.py ilan`, painted frames used as painted. Add `ilan` to the bake lists the other 8 playable characters use. |
| Head size | Tom's rule: all adult faces the same size. Measure Ilan's walking head against Tom's head height (top of hair to chin, hair included; claude/next-addendum-walkhead.md) and apply the walk-head factor the same way. Show Tom ONE head row with Ilan added, do not argue the measurement against his eyes. |
| Member entry | `ilan` in MEMBERS (name Ilan, height from Tom, home `la`), shared XP like everyone (joins at Tom's level and XP), no gear or stamps beyond the basics. |
| Temporary kit | B8_KITS `ilan` with the shared basics only (Attack, Defend, Item, Flee, the normal Kindness command) and, if the engine needs at least one ability, one plain placeholder `Ilan Strike`. Stamps page shows no skills. Replaced in Part B. Tell Tom the kit is a placeholder. |
| Portrait and emotions | Portrait via bake_portraits.py (see Needed). No emotion sheet exists, so Ilan speaks with his default face and has no `em_<mood>` poses until Tom approves an emotion sheet (then same recipe as `emo14`). |
| Voice | Ilan needs a speaker in data/dialog-cast.js. 29 of 30 ElevenLabs voices are cast: Ilan takes the last one. New lines play through speech synthesis until Tom records or bakes them. Tell Tom the voice slots are now full. |
| Other lists | Party UI and Status page (roster grows), Art Library NPC builder refs (new character sheets), docs/CANON.md cast table (one row), tools that loop over party ids (kit_test, smoke IDS, cross_test). |

### A2. Recruit rules (engine/story.js CHAPTERS[n].party, partyRules(), RECRUIT_TALK)
Use the same code path Olivia's recruit uses (check whether it exists; if not, build one generic `recruitFromNpc(id)` that Olivia can reuse). Ilan's gates, checked in this order when Tom picks the option:
| # | Check | Result |
|---|---|---|
| 1 | Current map region is `la` (Sol's shop is on `blvd`) | Option exists only there |
| 2 | Chapter rules: `bar` contains `ilan`, or `allow` is set and lacks `ilan` | Option is hidden |
| 3 | Ilan already in the party | Option is hidden |
| 4 | Party has fewer than 4 members | Sol's offer, Ilan's join line, yes/no. Yes: he joins. |
| 5 | Party has 4 and at least one member is not locked and not forced | Same offer, then the swap-out prompt (pick who leaves; locked and forced members are never listed; Tom is always locked). The member picked goes home per `homes`. |
| 6 | Party has 4 and every member is locked or forced by this chapter | Option is shown but Sol says the party is full and nobody can sit this one out (new Sol line, mirrors Deedee's `recruit:full`). Ilan is not added. |
After a swap-out Ilan is re-recruited the same way, through Sol. Rules are re-applied after every load and setChapter as for all members: if a chapter bars Ilan, he goes home; a chapter that forces a full roster of others pushes him out the same way TNB and Nara are pushed.

Chapter availability, decided by the data not by memory:
1. List every chapter whose maps are in region `la` (CHAPTERS and the map specs) plus Part 2 chapters that return to LA (story bible: chapter 12 and the LA parts of 10, 11, 13).
2. For each, read its `party` rule. Add `ilan` to `allow` wherever `allow` is set for LA chapters (chapter 2 allows only TNB and Nara today). Do not add him to chapters whose roster is fixed by the story (lock plus force making four).
3. Put the result in ONE table for Tom: chapter, who is locked, can Ilan join (yes, swap only, no).
4. Part 2 bench (4 active plus bench, tag-swap): in chapters that use the bench, check how Olivia and TNB join and make Ilan follow the same rule. If it is unclear, ask Tom ONE line. Never break a chapter's forced roster.

### A3. Sol's menu and flight goodbye
- Find Sol's taxi menu (the AIRPORT, PLEASE option; likely engine/travel.js) and add an option for Ilan (label `ILAN`, shown only when gates 1 to 3 pass; the exact label and Sol's lines are my call, short, in Sol's cabbie voice, no em dashes, contractions in dialogue).
- Sol's recruit lines are new lines (speaker Sol, voice `sal` as his other lines): the offer, the swap prompt line, the full line. Never edit a baked line.
- Flying home: when Tom flies east, Ilan says goodbye at the cab and goes home first, exactly like TNB and Nara (add him to that goodbye scene and to `homes`).
- Sol being grounded (`noFlight`) must not hide the Ilan option; only the airport run is blocked.

### A4. Tests, push
| Test | Pass |
|---|---|
| Party-rule cases (scripted, one per row of the gate table, plus a chapter with a full locked roster) | Each gives the result in the table; locked members never listed in swap-out |
| Save and load with Ilan in the party and benched | He stays, shared XP matches Tom |
| Chapter jump to each LA chapter | Option present or absent as in the table for Tom |
| Walk, battle (kit_test basics), dialogue portrait, Status page in portrait and landscape | Frames looked at; no crop or overlap |
| `python3 tools/tag_check.py`, `node --check`, `python3 tools/smoke.py` (FAILS []), `unused_voice.py` 0 | Clean |
Push per next.md, bump ART_V and tags, CHANGES entry. Final line to Tom: where Sol's option is, which chapters allow Ilan, that his abilities are placeholders until he designs them.

## Part B: Ilan's ability prompts (starts only when Tom sends his ability designs)
- Tom designs the moves; I do not invent them. For each move Tom gives (name, what it does, story beat), add Art Library entries `ilan-ab-<move>` (3 x 2 ability sheet) and `ilan-fx-<move>` (4 x 3 fx sheet on magenta) in the Characters tab, group Ilan, using the same blocks as TNB and Olivia: `tools/art-library/char-prompts.js` (ABILITIES, FX, GROUP, PRONOUN `he`, plus the height) with Ilan's battle sheets and walk sheet as refs (cap 5 refs per entry).
- Edit data/art-prompts.json directly (never make-prompts.js, see next.md WARNING), mirror in the JS, print entry counts before and after, assert no other entry changed, rebase first, `node tools/art-library/validate.js`, update the Characters EXPECT count in test.py.
- Painted look only; banned words (16-bit, 32-bit, SNES, Final Fantasy, pixel art, retro, sprite) never appear; FLINCH, TIRED, NAP, not hurt or KO; no left or right words.
- Also write the kit data (B8_KITS `ilan` real moves, replace the placeholder) only after Tom approves the sheets; install the approved sheets like TNB (claude/next-addendum-tnb-install.md). Say the Generate cost to Tom BEFORE he presses: one press per sheet.
- "rt library" in Tom's message is read as the Art Library.
