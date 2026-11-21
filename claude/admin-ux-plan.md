# Admin area UX plan (2026-11-12, PLAN, not built)

Source: Tom 11-12 07:48. Method: read every admin page in the repo at main c474434, rendered each at 390 x 844 (iPhone portrait), 951 x 648 (iPhone Duo landscape) and 1440 x 900 (desktop) and looked at the screens. Supersedes the open phases of claude/ux-audit-builders.md (its Art phase 1 is built as uxart1; its phases 2 to 4 are folded in here).

Everything in sections 1 and 2 is fact. Sections 3 to 7 are recommendations. Nothing here changes the game or canon.

## 1. Inventory: what the admin area holds today

ADMIN is a flat list of 9 entries on the Welcome screen. Each opens a separate page built on its own, with its own header, breakpoints, key box and export.

| Entry | Page | What Tom does there | Items | Filters and pickers | Needs a key | Sends work to Claude by |
|---|---|---|---|---|---|---|
| DEMO | demo/ | Play the frozen demo | 1 | none | no | n/a |
| VOICE LIBRARY | voices.html | Hear a line, edit direction, new take, record, choose take, bulk regenerate | 4,244 lines | Search + 5 chip groups (Who about 30, Type 3, Chapter about 22, Show, Order) | ElevenLabs | Export phone clips (file) |
| ART LIBRARY | art.html | Generate, Review (approve or reject), edit prompt, add photo, Flight Preview | 10 tabs of entries | Search + 10 tabs + 7 status chips | xAI key, GitHub token, optional relay address, spend cap | EXPORT ZIP; approvals save to GitHub |
| MUSIC LIBRARY | music.html | Hear, loop test, edit prompt, new take, choose take, bulk remake | 38 tracks | Search + 4 chip groups (Group, Kind, Use, Show) | ElevenLabs | Export music takes (file) |
| AREA BUILDER | areas.html | Paint walk, block, door, exit tiles; move portals; Check; Export | 45 areas, 29 interiors | Section picker, map picker, chapter, 6 layer toggles | no | Export (text) |
| PORTRAIT CROPS | portraits.html | Set each face crop | 13 characters | Character chips | GitHub token | SAVE (GitHub) or EXPORT all |
| HEAD SIZES | heads.html | Set each head size | 63 characters | 2 group chips + character chips | GitHub token | SAVE (GitHub) or EXPORT |
| WELCOME LAYOUT | in the game (splash-edit.js) | Size and place each welcome character | 11 | none | GitHub token | Save (GitHub) |
| BATTLE LAB | in the game | Fight any boss, or solo with any fighter | 21 bosses, 10 fighters | Pages of 6 | no | n/a |

Admin features that sit outside ADMIN:

| Feature | Where it is now | Problem |
|---|---|---|
| RELOAD (fetch the newest build) | Welcome screen, next to ADMIN | Fine there; also belongs in admin Settings |
| Save sync (cloud saves, second GitHub token with Gists permission) | In-game menu > Options | A fourth place to paste a token |
| Recast Deedee | recast-deedee.html, no link anywhere | Unreachable without the address; has its own copy of the ElevenLabs key |
| Flight Preview | Button inside the Art Library | Hidden; it is a viewer, not an art task |
| Chapter jump, difficulty | NEW GAME | Fine; listed so the test tools are all in view |

## 2. Findings

### 2.1 Redundant or scattered functions

| Function | Copies today | Detail |
|---|---|---|
| ElevenLabs key | 3 input boxes, 2 storage names | Voice and Music share one stored key but each draws its own box; Recast Deedee stores a separate copy, so the key is pasted twice |
| GitHub token | 1 input box, 4 users | Only the Art Library can set it. Head Sizes, Portrait Crops and Welcome Layout fail with "set it on the Art Library page" |
| Second GitHub token (save sync) | 1 | Lives in the game's Options, apart from the other keys |
| xAI key, relay, spend cap | 1 each | Art Library only (correct owner, wrong place: first card on the page) |
| Send work to Claude | 6 different mechanisms | File share (Voice, Music), zip (Art), pasted text (Areas), direct save to GitHub with export as fallback (Heads, Portraits, Welcome) |
| Character picker | 3 separate builds | Heads, Portraits, Voice "Who" each list the cast their own way and in a different order |
| Header and back | 4 styles | "‹ Game", "Back", "‹ Exit" (gold, left), "Exit" (gold, right) |
| Breakpoints (the width where the layout switches) | 4 sets | Voice and Music 860 px; Art 760 and 1000; Areas 700 and 1000; Heads and Portraits none |
| Remove phone data | 2 | Voice (bottom of the list), Music (per take); no single view of what this device holds |

### 2.2 Space taken by controls before the first item (measured)

| Page | iPhone portrait (844 px tall) | Duo landscape (648 px tall) | Desktop |
|---|---|---|---|
| Voice | First line starts at 625 px: 74% of the screen is key box and filters | Left column is 1,080 px of filters in a 488 px window; Who and Chapter are clipped scroll boxes | Same clipping; chips cut in half |
| Music | First track at 560 px (66%) | Filter column runs off the bottom | Works, key box always open |
| Art | First entry at about 300 px with Setup folded, 712 px with it open | Setup and Export fill the left column | Works |
| Heads | Stage starts at 295 px after two chip rows | Fits | Fits |
| Portraits | 201 px | Fits | Fits |
| Areas | Picker screen first, fine | Fine | Fine |

### 2.3 Voice Library desktop overlap (the side note): FIXED today

Fact: at 860 px and wider the filter column is pinned to the screen (sticky) and the Export / Remove block sat in the same column at the bottom of the page. Scrolled to the end, the Export button, the Remove button and the how-to paragraph were drawn through the Who, Type and Chapter chips. Fix pushed (tag-free change to voices.html, CHANGES entry `voicefoot1`): the block now sits under the list in the right column. Checked at all three sizes; the phone layout is unchanged. The full plan below moves Export out of the page bottom altogether.

## 3. Best practice this plan follows

| Practice | Source | How it applies here |
|---|---|---|
| On a phone, filters get their own layer (full screen or a sheet rising from the bottom) opened by a clearly labelled button, never a squeezed sidebar | Baymard Institute | "Filters" button + bottom sheet replaces the five chip rows |
| Always show which filters are applied, each removable on its own, plus Clear all; a bare count is not enough | Baymard Institute | One row of removable chips above the list; the button also shows the count |
| Touch targets at least 44 px | Apple Human Interface Guidelines (standing rule already used in the audit) | Row open target, checkboxes, chips |
| Progressive disclosure: the few most used options visible, the rest one tap away | Nielsen Norman Group guidance, standard practice | Quick views on top; long groups collapsed |
| Master and detail on wide screens; one column on phones | Standard admin console pattern | List left, open item right at desktop width |
| One settings place for credentials; pages only report status | Standard admin console pattern | Section 4.3 |

Sources: https://baymard.com/learn/ecommerce-filter-ui and https://baymard.com/research-articles/how-to-design-applied-filters

## 4. The reorganization

### 4.1 New structure: one Studio hub, five groups

ADMIN on the Welcome screen opens one page, the Studio (admin.html), instead of a list of nine. RELOAD stays on the Welcome screen.

| Group | Contains | Was |
|---|---|---|
| INBOX (top of the hub, not a menu) | Counts that need Tom, each a one-tap jump: "Art waiting on you: N", "Lines with no clip: N", "Takes on this phone not yet sent: N", "Keys missing: N" | Did not exist |
| LIBRARIES (make, review, choose) | Art, Voice, Music | 3 separate entries |
| CAST (how people look) | One Cast Editor with three tabs: Head size, Face crop, Welcome position. One shared character picker. | HEAD SIZES, PORTRAIT CROPS, WELCOME LAYOUT |
| WORLD (places) | Area Builder (Areas, Interiors), Flight Preview | AREA BUILDER, a button inside Art |
| PLAYTEST | Battle Lab (bosses, solo), Demo | BATTLE LAB, DEMO |
| SETTINGS (gear icon on every admin page) | Keys, Spend, This device, Voice tools | Scattered, see 2.1 |

Welcome position and Battle Lab run inside the game engine, so the hub links into the game for those two (the game already accepts an address flag that opens ADMIN; the same method opens them directly).

### 4.2 One shared shell (built once, used by every admin page)

Two shared files, `admin/shell.css` and `admin/shell.js`, loaded by every admin page. Each page keeps its own logic and drops its private header, key box, filter rows, toast, confirm and export code.

| Part | Behaviour |
|---|---|
| Header | Left: "‹ Studio". Centre: page title, tap to switch to another admin page. Right: status pill ("2 generating", "bulk 5 of 17"), gear. Same on every page. |
| Search + filter bar | The component in section 5 |
| List and detail | Phone: tap a row, it opens full width. Desktop: list left, open item in a right panel that stays in view |
| Action bar | Sticky bottom bar that appears only when there is something to act on (N selected, unsaved change, Send to Claude) |
| Send to Claude | One button, same place on every page. With a GitHub token it saves straight to the repo (as Heads, Portraits and Welcome do now). Without one it shares a file. Shows "sent 11-12 08:10" afterwards |
| Messages | One toast style, one confirm style (hold or second tap, button never changes width) |

### 4.3 Settings: keys set once, read everywhere

| Card | Fields | Used by |
|---|---|---|
| Keys | ElevenLabs key; xAI image key; GitHub token (repo); GitHub token (save sync); relay address (advanced, folded) | Voice, Music, Recast use ElevenLabs. Art uses xAI and relay. Art, Cast Editor use the repo token. The game's Options uses the sync token |
| Spend | Art spend so far, cap, +$10, reset; ElevenLabs credits left (read from the account) | Art, Voice, Music |
| This device | What is stored here (voice takes, music takes, art results, edits) with sizes; Send all to Claude; Remove, per kind | All |
| Voice tools | Recast Deedee; Load directions from ElevenLabs history | Voice |
| App | Reload newest build; build tag | All |

Abstraction rule: no page draws a key box. A page asks the shell "is the ElevenLabs key set" and, when it is not, shows one line with a button: "ElevenLabs key missing. Open Settings." The key is tested when saved (one cheap call) so a wrong key is caught in Settings, not mid bake. The Recast copy of the key is merged into the shared one and the old storage name is purged. The game's Options keeps its sync on and off switch but reads the token from the same store.

## 5. The filter component (one build, used on Voice, Music, Art, Cast, Areas)

### 5.1 Anatomy

| Piece | What it is |
|---|---|
| Quick views | 3 to 4 saved filters as a single short row, the jobs Tom actually does. Voice: All, No clip yet (N), My phone takes (N). Art: Waiting on me (N), To do (N), All. Music: All, No take yet, Re-made here |
| Search | One box, always visible |
| Filters button | "Filters · 2" (the number applied). Opens the panel |
| Applied row | One line: each applied filter as a chip with an x, then the result count ("212 lines"), then Clear all. Hidden when nothing is applied |
| Sort | A small menu at the right of the applied row (Voice: story order, by speaker; Music: by area) instead of a chip row |
| Panel | Every group as a collapsible section with counts. Short groups (Type, Kind, Show) are segmented buttons. Long groups get the right control: Who is a searchable list in three sub-groups (Family, Townsfolk, Monsters) with multi-select; Chapter is a compact number grid split Part 1, Part 2, Bonus |
| Live result | The panel's main button reads "Show 212 lines" and updates as filters change; nothing is lost if it is closed |

### 5.2 Layout per screen

| Screen | Filter layout | Height used above the list |
|---|---|---|
| iPhone portrait (under 700 px wide) | Sticky bar: search + Filters button. Quick views above, applied row below. Panel is a bottom sheet, 85% height, thumb reach | About 150 px (now 550 on Voice, 485 on Music) |
| iPhone Duo landscape (700 to 1099 px wide, or under 700 px tall) | Same bar across the top of the list. Panel slides in from the left as a 320 px drawer over the list, own scroll, one section open at a time. No permanent filter column: the screen is only 648 px tall | About 100 px, list gets the full width |
| Desktop (1100 px and wider) | Permanent left rail, 280 px, sections collapsible, no inner scroll boxes (long groups show the first rows plus "Show all"). Applied row above the list. Detail panel on the right | Rail beside the list, 0 px above it beyond search |

One set of breakpoints for every admin page: under 700 phone, 700 to 1099 compact, 1100 and up desktop, and any screen under 700 px tall is treated as compact.

## 6. Page by page changes

| Page | Change |
|---|---|
| Voice | Filter component. Key box gone (Settings). Rows become plain text with a 44 px play and a 44 px open target; editing happens inside the open row with direction and words in separate boxes (words carry the "changing this silences the baked clip" warning). Checkboxes appear only after tapping Select. Sticky chapter headers; list loads as you scroll (no "Show more"). Export and Remove move to Send to Claude and Settings. How-to paragraph becomes a "?" sheet |
| Music | Same filter component and shell. Key box gone. Prompt folded in the row; Play, Loop test and New take stay visible |
| Art | Tabs become the first filter group (Category) so there is one filter system, with Waiting on me as the default quick view. Setup card gone (Settings). Status pill for generations in progress. Two-column open card on desktop. Review viewer unchanged |
| Cast Editor | Heads, Portrait Crops and Welcome position become tabs of one editor with one character picker (same order as the game's cast, searchable, check mark when saved). Picking Boppy and switching tabs keeps Boppy. SAVE and Send to Claude in the shared action bar |
| Area Builder | Shell header only (‹ Studio, gear). Map picker uses the shared search and filter (Area, Interior, town, has edits). The editor canvas and tools stay as they are |
| Battle Lab | Reached from the hub. One scrolling list of the 21 bosses with a chapter filter instead of 4 pages of 6; difficulty as a segmented control on the same screen |
| Flight Preview | Moves from an Art button to WORLD |
| Recast Deedee | Moves to Settings > Voice tools |

## 7. Build order

Each phase is one push with before and after screenshots at 390 x 844, 951 x 648 and 1440 x 900, and a test that opens every admin page at the three sizes and fails on any overlap of two controls (the check that would have caught 2.3).

| Phase | Scope | Why this order |
|---|---|---|
| 0 (done 11-12) | Voice desktop overlap fix | Bug |
| 1 | Shared shell files, Settings with all keys, Studio hub with Inbox, new ADMIN entry. Every page gets the header and loses its key box. Old key boxes and the Recast key copy purged | Removes the redundancy first; every later phase builds on the shell |
| 2 | Filter component, installed on Voice, then Music, then Art (tabs folded in) | Tom's biggest complaint; Voice is the worst case so it proves the component |
| 3 | Voice row anatomy, select toggle, sticky chapters, desktop master and detail; Art status pill and two-column card | Remaining items from the 11-08 audit |
| 4 | Cast Editor (three tabs, shared picker); Area Builder and Battle Lab alignment; Flight Preview and Recast moved | Smaller tools, lower traffic |
| 5 | Send to Claude unified, This device storage view, overlap test added to smoke | Needs the shell and all pages in place |

Risks (fact): admin pages carry no cache tag, so they update on the next open with no tag work. Phone takes live in the browser's storage under existing names; no phase renames those stores, so no take is lost. The Welcome editor and Battle Lab stay in the game engine; only their entry point moves.
