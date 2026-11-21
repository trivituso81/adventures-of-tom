# Adventures of Tom: build plan (pending work only)

Last updated 2026-11-08. On 2026-11-06 every completed section was moved, verbatim, to **claude/build-plan-archive.md** (Foundation sessions F1 to F7 and D, the Chapter sessions table with the C1, C2 and C3a Done notes, the C3 proposal, the C3b brief, the Part 2 run cycle and rules, Parts, the Part 2 Done table, the engine notes for chapter sessions, and V voice baking). Read the archive only when a task needs history or the engine notes (spawn, TRIGGERS, STORY_WORLD, STORY_HOLD, STORY_MAPFX, planArea, B2_TOMBOS, B6_XP and similar). Source docs: claude/story-bible.md (story), claude/battle-design.md (battle), claude/canon-addendum.md and the repo's CLAUDE.md (engine, files, canon, how to work). Per-chapter notes for chapters 11 to 20 are in the repo, docs/C11-DONE.md to docs/C20-DONE.md. Kept current by Claude.

**Keeping this file short (standing rule, Tom 2026-11-06):** when a session is finished and Tom has no open fix on it, move its full entry and Done note to claude/build-plan-archive.md in the same push, leave one row on the Status board below, and add the heading to the archive's Contents line. Pending work stays here in full. Read the archive's Contents line, not the whole archive, unless the task needs it.

## How each session works

Tom's opening prompt is always **"Read claude/next.md and continue."** (project instructions, section 1). claude/next.md names the one task and the docs to read; this plan is read for that task's entry only.

1. Read claude/next.md, the task's entry below, and only the docs it lists. Read the archive only for engine notes or history the task needs.
2. New-chapter work (not currently open; the story is complete): first post a short proposal for Tom and wait for his OK. Tool and library sessions skip this unless a design choice is open.
3. Build. Keep the game runnable; test and look at the frames in portrait and landscape before pushing.
4. Push to main of trivituso81/adventures-of-tom (fetch and rebase first). Bump the `?v=` tags and ART_V when art or scripts change. Add a docs/CHANGES.md entry on every push. (Updated 2026-11-06: the old step "publish to the artifact" is retired, the artifact is a stale scratch copy.)
5. Update this doc: tick the session on the Status board and add a one-line Done note. Rewrite claude/next.md. Add canon changes, one dated line each, to claude/canon-addendum.md.
6. Tell Tom in two lines what the next session will do and the exact prompt to paste.
7. Run the approved art sweep (next section) before step 5, every session, whatever the task was.

Demo rule: the demo is a frozen copy of the game as it was on 2026-10-19 in demo/. Never edit files under demo/. Everything here builds the FULL GAME only.

Rules: one session per entry (split if it runs long; add "b" entries). If a session finds the bible wrong or unbuildable, propose the change to Tom, then edit the bible before building. New spoken lines go in data/lines.js and play through speech synthesis until baked in the Voice Library (ADMIN).

## Approved art sweep (standing, Tom 2026-11-08: "keep checking for approved art in batches until everything has been implemented")

Goal: every Art Library entry Tom has approved ends up installed in the game. No asking (Tom 2026-11-07: "don't ask me ever again when there is approved art, just implement them"). Say which choices were made, in plain words, in the reply.

Each session, and again after every push inside a session:
1. List what is approved: `gh api repos/trivituso81/adventures-of-tom/contents/data/art-prompts.json -H "Accept: application/vnd.github.raw"` (2.8 MB; parse with `python3 -I`), entries with status `approved`.
2. Subtract what is installed. Tombo sheets: `INSTALLED` in tools/sprite-bake/tombo_frames.py. Other kinds: the art file exists in the repo and the code references it (ART_V, PLATES, props lists, ability fx files; grep to confirm). An approved entry with no installed file is due.
3. Group the due entries by kind (Tombo frames, ability fx, character sheets, areas and rooms, props, enemies). Install one batch per push: up to about 5 entries of one kind, with that kind's tests and the Move Lab or frame check. Push, then go back to step 1.
4. If a kind has no install spec, first write a short spec in claude/ (read the Library entry and how existing art of that kind is installed), install one entry as a pilot, then the rest in batches.
5. Skip only entries that are blocked, deferred by Tom (2g Ilan) or marked "do not install" in their own Library note. Say what was skipped and why.
6. After every batch, write a line in claude/next.md under APPROVED ART SWEEP: approved total, installed total, due by kind. If due is more than 0 when the session ends, the sweep stays ORDER NOW item 1 for the next session, with the next batch named.
7. The sweep is finished only when a fresh list shows 0 due. Then tell Tom in one line, and remove the standing ORDER NOW item (keep this section, since Tom approves new art all the time and the next approval starts it again).

Stop-loss and the splice rule (next.md, INCIDENT 11-07) apply to every batch. Two failed batches of the same kind in a row: stop, say what is wrong, recommend the fix.

## Status board

| Session | What | Status |
|---|---|---|
| F1 to F7, D | Foundation: story engine, demo freeze, data-driven maps, battle core, party and signatures, Kindness/HEART/Tombos, traits, progression, feel and accessibility | done 2026-10-19 to 2026-10-20 (archive) |
| C1 to C10, PT, NS | Part 1 (chapters 1 to 10), the Parts split on the title screen, bonus chapter Nine Scoops | done (archive; claude/status.md; claude/bonus-chapter-nine-scoops.md) |
| P2-MAP, C11 to C20 | Part 2 story map and chapters 11 to 20: the story is complete | built by 2026-10-30 (archive; repo docs/C11-DONE.md to docs/C20-DONE.md) |
| V | Voice baking | replaced 2026-11-02: all baking goes through the Voice Library (ADMIN); chapter 11 to 20 dialogue is unvoiced (archive) |
| ART-SWEEP | Approved art sweep: install every approved Art Library entry in batches until none are due | standing 2026-11-08; runs every session (section above) |
| C11-20 PLAY | Tom's phone play-through and sign-off of chapters 11 to 20 | not recorded in these docs; Tom to report (docs/NEXT.md lists the owed play-tests) |
| ST | Status screen redesign: hero art, three pages (About, Numbers, Tombos), no overlap with other tabs | approved by Tom 2026-11-02, todo (can run between chapters) |
| AL-UX | Art Library UX rebuild: collapsed rows, groups inside tabs, status filter, blocked state, search (claude/art-library-ux.md) | queued 2026-11-03, next task in claude/next.md (check next.md for what is current) |
| AL-LA | Art Library: stencil (layer cutout) entries for five Los Angeles areas, about 18 to 20 new entries | queued 2026-11-04 by Tom; starts only when Tom names it |
| SL | Sound Library: sfx.html to hear, locate and Keep / Tweak / Replace every sound effect (claude/sound-library.md) | queued 2026-11-03 by Tom; runs after AL-UX; starts only when Tom names it |
| REV | Revive: some advanced healing abilities also revive a knocked-out character; shops sell revive items at about 10 times a healing item | queued 2026-11-06 by Tom; starts only when Tom names it |
| P | Polish and superbosses | open; the current polish list is docs/NEXT.md in the repo |

## Open items (from the chapter DONE docs and docs/NEXT.md, not all verified in play)

- No chapter's phone play-through or sign-off by Tom is recorded in these docs.
- Every new chapter 11 to 20 dialogue line is unvoiced (Voice Library); some speakers have no voice mapping (chapter 11: Speaker, Standby Sprite, Nara, Lost and Found, Julian Vance, FINAL CALL).
- Leftover "Chapter N is still being built" toasts remain in the scene code for chapters 1, 7, 8, 11, 14, 15, 17 and 18 (and Part 1's part2Open). Not yet checked whether any can show at the wrong time; check with a chapter-select run through 11 to 20.
- Known gaps from the C11 note: no battle music for FINAL CALL; coin nine is narrated, not an inventory item.
- Aunt Ellie's bets and prizes (`ellie1`) cover chapters 1 to 10 only.

## Pending sessions

**ST. Status screen redesign (approved by Tom 2026-11-02).** One session, can run between chapters. Scope: only the STATUS page (renderStatusTab in engine/progress.js, its CSS in index.html). The Stamps, Gear, Items, Party, Load and Options pages do not change in any way; Tom likes Stamps as it is.

Goal: Status is the one read-only place that answers "who is this person and what can they do," built around the painted hero art. Every editing action stays on the screen that owns it.

Ownership rule (what each screen owns; Status never duplicates it):
| Screen | Owns | Status may show |
|---|---|---|
| Party roster | Overview: LV, HP, unspent SP, next level in | Only LV and HP in its header |
| Gear | Equip, compare, "now -> new" preview, BEST GEAR | Worn item names only, with a GEAR jump button |
| Stamps | Every skill with gates, costs, stamp, polish, remix, loadouts | Nothing; one STAMPS jump button |
| Items | Use and wear | Nothing |
| Status (new) | Identity and art, stat breakdown, Tombos, trait, records | All read-only |

Layout: one screen, three pages, chosen with pills at the top of the right window and by swiping left or right; Q/E (L/R) still switch character; Esc/B goes back to the roster as today. The hero art stays fixed (left in landscape, top in portrait) while pages change. Status remembers the last page while the menu is open and opens on ABOUT the next time the menu opens.

Page 1 ABOUT (default):
| Element | Content |
|---|---|
| Hero art | The painted hero pose (art/ hero pose PNG per character, the same files docs/CHARACTER_PIPELINE.md makes), as large as the window allows without cropping the head or feet; greyed and a little desaturated when knocked out |
| Header | Name large, title under it, LV badge, HP bar and XP bar (reuse the roster and tab bar components; no new rules) |
| Bio card | Three short lines in game voice: who they are to Tom, what they love, one quirk. Source: docs/CANON.md and canon-addendum.md. Claude drafts all 13 and Tom approves them before they ship. No stats in the bio |
| Trait card | Trait name, its one-line rule (B6_TRAITS), and the live counter when one carries over between fights (Tom's Upgrade Miles); a dash with "builds up in battle" for traits that only exist inside a fight |
| Voice line | A play button that speaks one signature line (the baked clip if it exists, else speech synthesis). Pick one existing line per character; no new lines |
| Facts strip | Height (from the cast table), home street, battles won (member.wins), chapter joined |

Page 2 NUMBERS:
| Element | Content |
|---|---|
| Six stats | One row each (HP, POW, GRIT, WARMTH, COOL, PEP): the total, then the breakdown "base N + gear N + charm N%". The charm percent (perk.stat) is applied in battle but shown nowhere today; base and gear appear here as a breakdown, not a preview, so they do not compete with Gear |
| Stat help | Tap a stat row: its plain meaning (B6_STAT_NOTES) and "who excels" from battle-design section 3 |
| Battle facts | VP cap 10, start 5 plus any charm start VP, regen 2 per turn; Kindness power shown as the WARMTH / 50 multiplier |
| Perks card | As today (b6Perks, b6PerkText) |
| Worn gear | Three lines (TOOL, OUTFIT, CHARM; SASH for Grace when she has it), item names only, with a GEAR jump button that opens that character's Gear page |

Page 3 TOMBOS:
| Element | Content |
|---|---|
| Tombo list | For Tom: every Tombo in B2_TOMBOS and B8_COMBOS, with partner portrait, tier, HEART cost, one-line description. For a partner: their Tombos with Tom. Family Finishes listed at the end for everyone in them. Locked ones show "???" for the name and a hint ("Unlocks in Part 1" or "Unlocks in Part 2", never the chapter number) |
| Director's Cut | Shown under its Primary when b8DcOpen is true; otherwise "Both at level 30" as the hint |
| Skills jump | One STAMPS button showing unspent SP ("STAMPS · 3 SP"); no move list on this page |

Removed from Status:
| Removed | Now lives |
|---|---|
| MOVES card | Stamps |
| "Stamp Points to spend" note | Party roster and the Stamps gold dot |
| "Next level in" text | Party roster (the XP bar stays in the header) |
| 128 px head crop | Replaced by the hero art |

Build steps and sizes:
| Step | Size | Notes |
|---|---|---|
| Hero art in the menu | Medium | Load the hero pose PNGs on demand, fit rules for portrait and landscape, KO grey; fall back to the head crop if a character has no hero pose yet |
| Bio text for 13 characters | Small | Claude drafts from canon, Tom approves in the session before building the page |
| Trait counter out of battle | Small | Read the trait state engine/battle2-traits.js keeps between fights |
| Charm percent math | Small | Reuse b6Perks |
| Tombo data | Small | B2_TOMBOS, B8_COMBOS, unlock flags, b8DcOpen |
| Pages, pills, swipe, keys, gamepad | Medium | Follow the existing focus system (menuKey, menuPad, menuMove); pills are focusable, left/right on the pill row changes page |

Tests before pushing: open Status for all 13 characters in portrait and landscape and look at the frames (hero art never cropped, header readable); Q/E through every character on each page; a knocked-out member shows grey art and the KO note; stat breakdown sums equal the Gear panel's totals for the same character; a member with a charm shows its percent; Tom's Tombo list matches the battle Tombo menu for the same save; a Part 1 clear save and a fresh save both open with no errors; keyboard and a fake gamepad reach every pill and button; Stamps, Gear, Items, Party, Load and Options are pixel-identical to before (screenshot compare). Bump the ?v= tags, add a docs/CHANGES.md entry, and note in claude/next.md that the old project-instructions.md menu section is historical.

**AL-UX. Art Library UX rebuild (queued 2026-11-03).** Tom's report: the lists in art.html are far too long (Characters is about 53 phone screens of open cards). Full assessment and build spec: claude/art-library-ux.md. Items 1 to 4 first (collapsed rows, groups inside tabs with a `group` field from make-prompts.js, status filter strip, blocked state with GENERATE disabled), then 5 to 8 (search, remembered tab and scroll, folded setup row, progress counts on tabs). Files: art.html, tools/art-library/*-prompts.js and make-prompts.js, validate.js, test.py. No prompt text changes. It is the next task in claude/next.md (check next.md; other sessions have pushed since this line was written).

**AL-LA. Stencil entries for the Los Angeles areas (queued 2026-11-04, Tom: "write it to the build instructions").** Tom asked why the Art Library has no layers for the Los Angeles area maps. Facts, checked in the repo on 2026-11-04: the six LA entries (area-blvd Downtown LA, area-jpark Jefferson Park, area-griffith Griffith Park, area-studio Studio Gate, area-backlot The Backlot, area-oakpark Old Oak Park) come from the `la()` template in tools/art-library/area-prompts.js, which writes a painting entry only. The seven Long Island areas use `area()`, which also writes 3 to 4 chained stencil entries each (`area-<id>-cut1` and so on: trees, posts and signs, roofs and eaves, tall props). Nothing in the docs records leaving LA out as a decision. The LA painting prompts say "the game cuts trees, lamps, boards and roofs out as separate layers", which is true in the game only for Downtown LA: `art/blvd-fg.webp` is cut from the painting by a script (`tools/make_blvd_fg.py`, CHANGES 2026-10-31), no stencils used. Jefferson Park and Griffith Park are painted plates with no foreground layer (no fgSrc in PLATES, no PLATE_BEHIND zones), so Tom's sprite draws over their trees, roofs and lamps. Studio Gate, The Backlot and Old Oak Park have painting files in art/ but were not found in the PLATES list in engine/plate.js; check whether they are installed plates before any install work.

The call (Claude, 2026-11-04): add stencil entries for the five areas that have none, 20 new Art Library entries, same chained template and wording style as the Long Island stencils. Downtown LA keeps its script-cut layer and gets no stencils.
| Area | New entry ids | Stencils |
|---|---|---|
| Jefferson Park | area-jpark-cut1 to cut4 | trees and tall plants (jacarandas, palms); lamps, posts, boards and signs; roofs, porch roofs and awnings of the shops and four homes; tall props |
| Griffith Park | area-griffith-cut1 to cut3 | trees and tall plants (sycamores, oaks, brush); posts and exit boards; boulders and tall props. No buildings, so 3 stencils like the Marsh |
| Studio Gate | area-studio-cut1 to cut4 | trees and tall plants; lamps, posts, boards and signs; roofs, canopies and awnings; tall props |
| The Backlot | area-backlot-cut1 to cut4 | trees and tall plants; lamps, posts, boards and signs; roofs, set-building tops and awnings; tall props |
| Old Oak Park | area-oakpark-cut1 to cut3 | the huge oak and other trees; posts, lamps and exit boards; tall props (play equipment, garden structures). No buildings, so 3 stencils |
That is 18 entries if Griffith and Old Oak use 3 each; the session writes the exact keep and rest wording for each from the painting prompts' own props lists (the `props` field of each `la()` call), so the count may differ by one or two. State the final count to Tom.

Rules for the session:
- Stencils are sent only after the painting for that area is approved, in the same chat that painted it (the entry titles already say "same chat, send after the painting is approved"). Adding the entries costs nothing until then.
- Extend `la()` in tools/art-library/area-prompts.js to take a stencils list and reuse the existing `stencil()` helper. Do not change any existing painting prompt text.
- Group: groups.js currently sends only the six painting ids to 'Los Angeles paintings' (the `LA_PLATES` set). Add the new cut ids to that same group, or to a 'Los Angeles stencils' group; the call is the first, one section per tab group stays short. validate.js must pass.
- data/art-prompts.json has hand edits that make-prompts.js would undo (see claude/next.md, the WARNING section). Do NOT regenerate the json. Patch it directly, mirror the text in area-prompts.js, print the entry count before and after (300 before; expect 318 to 320 after), and compare every other entry to a copy taken before. Rebase first, because Tom's approvals commit to this file.
- Tests: `node tools/art-library/validate.js`, `python3 tools/art-library/test.py` (9 known out-of-date checks), `python3 tools/art-library/bake_test.py`. Look at the Areas tab on a phone-size screenshot. Add a docs/CHANGES.md entry on push; no game files change, so no tag bump.
- Install is NOT part of this session. After Tom approves a painting and its stencils, a later session builds `art/<id>-fg.webp` (the pattern of tools/make_row_fg.py and make_town_fg.py), adds `fgSrc` to PLATES and `PLATE_BEHIND.<id>` zones in engine/plate.js, bumps tags, and tests with tools/reach_test.py and phone-size frames. The Art Library has no install bake for the Areas tab yet. (Updated 2026-11-08: that later session is the approved art sweep; once a painting and its stencils are approved they are due, no asking.)
- Tom's rules still hold: images only in the Art Library, never an outside image AI; painted look only; no em dashes in anything Tom reads.
Starts only when Tom names it ("add the Los Angeles stencils").

**SL. Sound Library (queued 2026-11-03, Tom: "add it").** Fact: every sound effect is a synthesizer recipe in engine/audio.js and the per-character move files (about 126 named effects, about 3,000 call sites), not an audio file, and nothing lets Tom hear one outside the game, see where it is used, or swap it. Spec: claude/sound-library.md. One session: a generated index (data/sfx-index.json from `tools/sound-library/make-index.js`), a page sfx.html in the shape of music.html with grouped collapsed rows, PLAY through the real recipe, where-used, Keep / Tweak / Replace with a note saved through GitHub like art.html, and Replace letting a recorded or generated audio file stand in for a recipe with the recipe as fallback. Runs after AL-UX. Starts only when Tom names it ("build the Sound Library").

**REV. Revive abilities and revive items (queued 2026-11-06, Tom: "add to the building instructions").** Tom's two decisions: (1) modify some of the more advanced healing abilities so they can also revive a knocked-out character; (2) throughout the game, shops sell items that revive a knocked-out character, priced at about 10 times a healing item. Not yet checked in the repo: what revive items or revive abilities exist today. Step 1 of the session is to check and report in two lines.

Facts from the docs (claude/ability-revamp-brief.md, claude/adventures-of-tom-ability-revamp.md, claude/shops.md):
- The engine already has a `revive` op and an `allyko` target (a knocked-out ally). Signature moves such as WARDROBE already heal or revive. The revamp doc already uses `revive(.25,party)` and the rule "heal living allies before reviving, so revived allies do not receive both amounts".
- Shops: Penny's Pockets (Long Island) and Nickel's (Los Angeles) sell a HEALING tab. Tier supplies unlock at chapters 4, 7 and 10 (SHOP_TIER_GATES [3,6,9]) at base price x2, x3, x4 (SHOP_TIER_MULT). Bandage (single-target heal, 140/200/280) costs 30/45/60 coins, so its base price is 15. Picnic costs 52/78/104. Selling pays half.

The call (Claude, 2026-11-06):
| Part | Decision |
|---|---|
| Which abilities | A handful, not all. Pick the top-tier single-target and party heals in each healer's path (heavy weight, high level, 4 or more VP), only where reviving fits that character's personality. List the picks for Tom in the session report with the old and new menu line for each. Healers include Deedee, TNB, Amy, Grace and Tom, but the session chooses from the real kits. |
| How they revive | Add `revive` to the ability's effects with target `ally / allyko`, so the menu can aim it at a knocked-out ally. A revived ally returns at a low share of max HP (recommend 25%, the revamp doc's number), so a revive ability is a rescue, not a full heal. Heal living allies first, then revive. Costs and level gates stay high so the ability is a real investment. |
| Shop items | One revive item per shop tier in the HEALING tab, unlocked with each tier like the other supplies. Price is 10 times the Bandage of the same tier: base 150, then 300 / 450 / 600 coins at tiers 1 / 2 / 3. Usable only on a knocked-out ally; it does nothing to a living one and cannot be used with no one down. Sells for half like other supplies. |
| Item strength | Recommend revive at 50% / 65% / 80% of max HP by tier, stronger than the ability revive, which is what the price pays for. The session may adjust the numbers and says so. |
| Names and look | Game-voice names, no em dashes. Item icons are made through the Art Library only, never an outside image AI. |
| Voice | New spoken lines only, in data/lines.js. Never edit a baked line. |

Files to expect: data/party.js (SHOP_TIER_* and supply definitions), engine/shop.js (shopStockFor), the item-use and battle item code, the per-character move files and the ability data the Stamps screen reads, data/lines.js, index.html (item icons or CSS if needed), docs/CHANGES.md.

Tests before pushing:
- Run `BUILD=/home/claude/live2 python3 -I /home/claude/tools/shoptest.py` (copy: claude/shoptest.py), and add checks that each tier's revive item price equals 10 times that tier's Bandage price.
- In a battle with one ally down: the revive item and each changed ability list the knocked-out ally as a legal target, revive at the stated HP share, and cap HP normally; neither works on a living ally; with nobody down the item is not offered.
- Stamps screen shows the new revive wording for each changed ability; skill costs and gates match the doc.
- A Part 1 clear save and a fresh save both load with no errors; the HEALING tab looks right in portrait and landscape; BUY, SELL and coin totals are correct.
- Add a docs/CHANGES.md entry and bump the `?v=` tags.
Starts only when Tom names it ("build the revive abilities and items").

**P. Polish.** Superbosses (battle-design section 11), Mint-State coins and ultimate gear, remaining side quests, a Kindness Scrapbook screen (STORY.flags 'kind:<id>' already counts), balance pass across all 20 chapters, music for new areas, High-Five art and sound polish, tuning Director Mode and monster chase radius in play. Side quests (bible section 7) slot into the chapter where their town is next visited, or here; each finished side quest gives its character 1 bonus Stamp Point: `member.spBonus++` (engine/progress.js counts it; it is saved).
