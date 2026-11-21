# UX audit: Art Library (art.html) and Voice Library (voices.html)

Date: 2026-11-08. Method: read both pages in full, rendered each at 390 x 844 (iPhone), 1180 x 820 (iPad landscape) and 1440 x 900 (monitor) with the local server and looked at the screens. Facts below are what the code does and what rendered; recommendations are marked as such.

Severity: H = slows or blocks Tom's main job every visit. M = friction on most visits. L = polish.

## 1. What the two pages are for (so the fixes aim at the real job)

| Page | Tom's main job | Secondary jobs |
|---|---|---|
| Art Library | Clear the "Waiting on me" queue: look at a generated picture large, Approve or Reject with a note. Second: press Generate on "Ready" rows. | Edit a prompt (rare: project rule says Tom never rewrites prompts), add a phone photo, export. |
| Voice Library | Find lines by character or chapter, hear what plays now, make a new take or record, pick which take the game uses, bake a batch (Select all shown, Regenerate), export to Claude. | Load directions from ElevenLabs history, undo script edits, remove phone clips. |

## 2. Findings: Art Library

| # | Sev | Where | Fact (what happens now) | Why it hurts |
|---|---|---|---|---|
| A1 | H | Phone, open row | Open row shows title twice (row label, then the same title as a hint), then a 150 px prompt box, then references, then Shape, then GENERATE, then results. GENERATE and the results are below the fold on a 390 x 844 screen. | The two things Tom does (Generate, Approve/Reject) are the farthest down. Prompt text he never edits takes the most space. |
| A2 | H | Phone, results | Results are 156 px squares in a horizontal strip; 2.3 fit on screen. APPROVE/REJECT are 12 px text buttons inside each 156 px cell. Tapping the picture opens a full-screen view that has no Approve, Reject, version switch or note. | A 4 x 2 sheet cannot be judged at 156 px. To decide, Tom zooms, closes, finds the right cell, taps a tiny button, then taps again (arming). Comparing v3 to v4 side by side is impossible. |
| A3 | H | Both | No queue flow. After Approve or Reject, the row stays open; Tom scrolls to find the next "Waiting on me" item, inside groups that may be folded. | The main job is a queue, but the page is a tree. |
| A4 | M | Phone, top | Two horizontally scrolling chip rows (10 tabs, 7 filters) with no edge fade or arrow; "Waiting on me" and "Rejected" are cut off. | Tom cannot see the tabs or filters that exist without scrolling each row. |
| A5 | M | Both | Generation status ("Working... up to a minute") lives only inside the open row. Folding the row or switching tabs hides it. No page-level indicator. | Tom loses track of what is generating, especially when he starts 2 or 3. |
| A6 | M | Phone | Reject needs: type in the Note field (below the results), scroll up, tap REJECT, tap again within 4 s. The "TAP AGAIN" label changes button width. | Four steps for the most frequent decision. |
| A7 | M | Wide | At 1000 px and wider the open card uses one column: prompt (230 px tall) on top, references, then results at 260 px. Right half of the card is empty beside the Shape and GENERATE row. | A monitor shows a sheet at 260 px when 700 px fits. |
| A8 | M | iPad portrait | Breakpoint is 1000 px. iPad portrait (768 to 834 px) gets the phone layout: single column, 156 px thumbnails. | The iPad is the best screen to judge art on and it gets the worst layout. |
| A9 | L | Both | Setup card (keys, spend, relay) is always the first thing on the page even when folded; spend cap errors send Tom to open it. Header back link says "Back" (Voice says "‹ Game"). | Noise at the top; inconsistent shell. |
| A10 | L | Both | Group headers show "29 of 31 approved" but not how many are waiting unless > 0; tab chips show approved/total, not waiting. | The number Tom cares about (waiting on me) is not the one shown first. |

## 3. Findings: Voice Library

| # | Sev | Where | Fact | Why it hurts |
|---|---|---|---|---|
| V1 | H | Phone, top | Key card (130 px, always open) plus five scrolling filter rows (Who has about 30 chips, Chapter about 22) plus the summary row: about 480 px before the first line. | Half a screen of controls on every visit; the list starts below the fold. |
| V2 | H | Both | Every row is an editable text box. The only way to open a row is the 14 px text link "Takes and record ›" (padding 4 px, min-height 0). Tapping the line itself focuses the keyboard. | Tom opens the keyboard when he wanted to open the row. The open target is far below the 44 px minimum. |
| V3 | H | Both | Select-mode is always on: a 24 px checkbox on all 4,230 rows. | Steals width and signals "bulk" when Tom is just listening or fixing one line. |
| V4 | M | Phone | Export phone clips, Remove all phone clips and the how-to paragraph sit at the bottom of the list (10,000 px down with 50 rows; "Show more" adds 100 at a time). Chapter headers are not sticky. No jump to chapter. | The action that sends work to Claude is the hardest to reach. |
| V5 | M | Wide | Who and Chapter chip blocks are capped at 212 px with inner scroll; a row of chips is cut in half ("Brain Freeze", "Ch 16"). | Looks broken; monsters and late chapters are hidden. |
| V6 | M | Both | Opening a row expands it in place; takes, New take and Record push the list down. On a monitor the list is one 950 px column with the right side unused. | On wide screens a master-detail layout (list left, open line right) would stop the jumping and use the width. |
| V7 | M | Both | The direction text and the spoken words share one box ("[weary, relieved] Oof, I'm finally here!"). | Editing a direction risks changing the words, which silences the baked clip (CLAUDE.md rule 5). |
| V8 | L | Both | The how-to is a 110-word paragraph at the bottom. "Story order (repeats listed once)" chip is 40 characters. Load-directions button is gold (primary) although it is a once-a-month action. | Primary colour on a rare action; long chips crowd the row. |
| V9 | L | Phone | The bake task Tom actually has (17 Mirrorball lines): Who row, scroll to Mirrorball, tap, Select all shown, Regenerate, confirm. Works, but the "No clip yet" state is three rows down in Show. | A one-tap "Bake list" entry would make this a two-step job. |

## 4. Recommendations (these are recommendations; Tom decides)

### 4.1 One shared shell for both pages

| Element | Phone (under 760 px) | Wide (760 px and up) |
|---|---|---|
| Header | Title, back to Game, a gear icon (keys, spend, relay, load directions, export, remove clips), a status pill ("2 generating", "bulk 5 of 17"). | Same header. |
| Search | One search box under the header, sticky. | In the left column, sticky. |
| Filters | One "Filters" button showing the active count ("Filters · 2"). Opens a bottom sheet with every group as wrapped chips (no horizontal scrolling). Active filters shown as removable pills under the search box. | Left column, 320 px, every group wrapped; long groups (Who, Chapter) get a "Show all" toggle instead of a clipped scroll box. |
| List | Full width, one tap opens. | Right column. Art: open card uses two columns inside. Voice: master-detail (list left, open line in a right panel). |
| Actions bar | Sticky bottom bar that changes with context (see below). | Same bar at the bottom of the right column. |
| Breakpoint | 760 px, so iPad portrait gets the wide layout. | |

### 4.2 Art Library

1. Review mode (fixes A1, A2, A3, A6). A "Review" button in the header opens a full-screen viewer over the "Waiting on me" items: one picture at a time, fit to screen, pinch to zoom, swipe left/right between versions of the same entry, swipe up/down (or Next/Prev) between entries. Fixed bottom bar: APPROVE, REJECT, note field, "3 of 11 left". Reject with an empty note focuses the note field instead of erroring. The double tap stays but as a slide-to-confirm or a 1-second hold, so the button does not change width.
2. Collapse the prompt (A1). Open rows show: blocked banner if any, references as thumbnails, Shape + GENERATE on one line, results. The prompt sits behind a "Prompt" disclosure that remembers its state; edited prompts show an "edited" pill.
3. Results grid instead of strip (A2, A7). Phone: results 2 across at full width (about 175 px each) with a tap to open the viewer; wide: 3 across at 300 px, or the viewer.
4. Page-level progress (A5). A status pill in the header lists entries generating; tapping it jumps to the row. A finished generation shows a toast "Nara sheet 1 is ready to review".
5. Counts (A10). Tabs and groups show "waiting" first in gold when it is above 0: "3 waiting · 29/31".
6. Move Setup into the gear (A9).

### 4.3 Voice Library

1. Row anatomy (V2, V3, V7). Each row: speaker, tags, the spoken words as plain text, a 44 px play button, a 44 px chevron. Tapping the row opens it. Inside the open row (or the detail panel on wide): the direction in its own box (editable), the words in a second box with a one-line warning "changing the words silences the baked clip", New take, Record, takes list.
2. Select mode as a toggle (V3). "Select" in the header turns checkboxes on; the bottom bar then shows "Select all shown · Regenerate N · Done".
3. Filters as a sheet on phone, wrapped column on wide (V1, V5). Key card folds into the gear once a key is saved.
4. Chapter navigation (V4). Sticky chapter headers; a "Jump to chapter" control in the filters; list virtualised so Show more disappears.
5. Shortcuts for Tom's real jobs (V9). Two quick chips at the top of the list: "Bake list (17)" (Show = No clip yet) and "My phone takes (n)" (Show = Re-recorded).
6. Export and Remove move into the gear menu (V4); the how-to becomes a "?" that opens a short sheet (V8).

### 4.4 Build order (recommended)

| Phase | Scope | Why first |
|---|---|---|
| 1 | Art: Review mode viewer with Approve/Reject/note, results grid, prompt collapsed, breakpoint 760. | Clears the daily approval queue fastest; the approval loop is what the whole art pipeline waits on. |
| 2 | Voice: row anatomy (tap to open, 44 px targets), select toggle, key card folded, filter sheet on phone, sticky chapter headers. | Removes the keyboard-pops-up and half-screen-of-filters problems on the phone. |
| 3 | Shared shell: header gear, status pill, master-detail on wide for Voice, two-column open card for Art, wrapped filter column. | Makes the two pages consistent and uses the iPad and monitor. |
| 4 | Polish: counts, quick chips, how-to sheet, direction/words split. | Smaller wins. |

Each phase is one push with before/after screenshots at 390, 820 and 1440 for Tom to check on his phone and iPad.
