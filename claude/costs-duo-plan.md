# AI Costs on the iPhone Duo: assessment and design (costsduoplan, 2026-11-21, PLAN, not built)

Tom (2026-11-21): "Assess the user experience and come up with an idea for supplemental design that supports layout for iPhone duo folded and unfolded views, optimizing for the screen area for each of these cases to ensure that most information, the most important information, is surfaced and that findability and navigation is simple and easy".

The page: costs.html (docs/COSTS.md). The design drawing, at the Duo's real sizes, is docs/costs-duo-mock.html (https://trivituso81.github.io/adventures-of-tom/docs/costs-duo-mock.html). On the Duo it fills the screen: folded shows the pocket frames, unfolded sideways the two-pane frames, and the Overview and Ledger tabs switch. A desktop window shows all four frames. Its numbers are typed in.

## 1. Assessment: what the desktop page does on the Duo today (measured on build costs1icon)

The page is fixed at 1,280 wide, so the phone shrinks the whole thing.

| Duo view | Screen (CSS px) | Shrunk to | Table text on screen | A filter button on screen |
|---|---|---|---|---|
| Folded, Safari | 382 x 580 | 30% | 4.2 px | 9 px tall |
| Open, upright | 669 x 869 | 52% | 7.3 px | 16 px tall |
| Open, sideways | 951 x 648 | 74% | 10.4 px | 23 px tall |

Readable text needs about 15 px and a finger needs about 44 px, so folded and open upright are unusable without pinching, and open sideways is readable but hard to tap.

| # | Problem | Why it matters on a phone |
|---|---|---|
| 1 | One fixed desktop layout | Everything is a miniature; every action starts with a pinch and a pan |
| 2 | The left rail and the top bar of filters take 216 px and a full row | They hold navigation and filters that are used once per visit, in the best part of a small screen |
| 3 | Seven-column ledger table | Cannot fit 382 px at a readable size; the amount, the one number wanted, is at the far right |
| 4 | Hover carries information | The month chart's split, the share bar and the reason behind "Confirm amount" only show on hover; a finger cannot hover |
| 5 | Overview order is a desktop order | On a 580 px tall screen the first view must answer "how much, what is next, is anything wrong"; today that takes scrolling past a chart |
| 6 | Open sideways wastes the fold | 951 px is two phone-width panes; the page uses it as one cramped desktop |

What works and stays: the four screens and their names, the date and Game tools only filters applying everywhere, subtotal by service, month, week, kind or paid through, ticked rows adding up, service colours, the numerals.

## 2. The design in one line

One page, three layouts chosen by width. The desktop layout does not change.

| Layout | Width | Duo view | Idea |
|---|---|---|---|
| Pocket | under 900 px | Folded (382, 466) and open upright (669) | One column. Answers first, tabs under the thumb, a charge is two lines, details slide up in a sheet |
| Open book | 900 to 1,099 px | Open sideways (951) | Two panes that meet at the fold: the list on the left half, what you tapped on the right half. No page changes to see a detail |
| Desktop | 1,100 px and up | Desktop browser | As built in costs1 |

The `<meta name="viewport">` becomes `width=device-width, initial-scale=1`; the 1,180 px minimum applies to the desktop layout only.

## 3. Rules for both phone layouts

| Rule | Detail |
|---|---|
| Navigation | The same four places everywhere: Overview, Services, Ledger, Totals. Pocket: a bar of four tabs at the bottom, 58 px tall. Open book: a 64 px rail of the same four at the left edge. The service list of the desktop rail moves into Services |
| Filters | One pill in the header shows the state ("All time", "Everything"). Tapping it opens a sheet with Dates (All time, This month, Last 30 days, Custom) and Show (Everything, Game tools only). On Ledger the same sheet also holds Service, Kind and Subtotal by |
| Add a charge | The round + button in the Overview header opens the same form as a full-height sheet |
| Text and touch | Body text 15 px, second lines 13 px, nothing under 12 px. Every tappable row, pill and tab at least 44 px tall (36 px for header pills) |
| No hover | Every tooltip becomes a tap: tapping a month bar or the share bar shows its split in a small panel under the chart until another tap; "Confirm amount" shows its reason in the charge's details |
| A charge | Two lines: service colour and name with the amount at the right; under it the date and what it was. "Confirm" tag beside the name when the amount needs confirming |
| Details | Tapping a charge shows what it was, when, kind, paid through, reference, source and any note. Pocket: a sheet from the bottom. Open book: the right pane |
| Sticky total | Ledger keeps "N charges shown" and the total on a bar above the tabs; ticked rows show "N ticked: $X" on the same bar |
| Addresses | The same `#/` addresses as desktop, so a link opens the same thing in any layout |

## 4. Pocket (folded 382 x 580 and 466 x 657, open upright 669 x 869)

First screen of Overview, top to bottom, with nothing to scroll at 382 x 580 (mock frame 1):

| Order | Block | Content |
|---|---|---|
| 1 | Header | "AI Costs", the filter pill, + |
| 2 | Total | "Paid for AI since <date>", the total, the share bar, one line (count and Claude's share) |
| 3 | Four tiles, 2 x 2 | This month so far; Next charge with its date; Plans each month; Needs a look (the count, in the warning colour, opens the list) |
| 4 | Coming up | The next two renewals, "All N" opens the rest |

Below the first screen, in this order: Needs a look (list), Paid each month chart (tap a bar for the split), Every service (two-line rows: name and plan, paid at the right, balance under it), Latest charges.

| Screen | Pocket layout |
|---|---|
| Services | Two-line rows (colour, name, plan and price; paid at the right). Tapping one opens the service: three figures in one row (Paid, Balance, Next), then The plan, What it allows (first line shown, "All N" opens the rest), Holes in the records, Use in the game's log, Charges |
| Ledger | Mock frame 2. Header: title, the filter pill showing the subtotal choice and the dates, a search button that opens a search field. Sticky group headers with the subtotal at the right. Two-line charges. A long press on a row, or the Select item in the filter sheet, shows tick boxes |
| Totals | The total and share bar, the running total chart (tap for the day's total), then Service by month as a list instead of a grid: a segmented switch "By month / By service"; each row a label, a bar and the amount; tapping a row opens its charges in Ledger. By kind and By where it was billed as they are |
| Open upright (669 wide) | The same layout with more room: tiles four across, Coming up and Needs a look side by side, the chart full width, the ledger rows gain a third line item at the right (kind and paid through) |

## 5. Open book (open sideways, 951 x 648)

The screen is two halves of about 475 px that meet at the fold. Left half: the 64 px rail and a 411 px list pane. Right half: the detail pane. Nothing important sits across the fold line.

| Screen | Left of the fold | Right of the fold |
|---|---|---|
| Overview (mock frame 3) | Total and share bar, the four tiles, Every service (scrolls) | The service tapped on the left: three figures, The plan, What it allows, Charges. Before any tap: Coming up, Needs a look and the month chart |
| Services | The list of services | The service tapped |
| Ledger (mock frame 4) | The charges with tick boxes always shown, sticky group header, the total bar at the bottom | Top: Subtotal by (Service, Month, Week, Kind, Paid through) as a segmented control, and the subtotals as bars with amounts; tapping one shows only its charges on the left. Under it: the details of the charge tapped |
| Totals | The total, the share bar, the running total chart | Service by month as a grid (short month names, whole dollars so six months fit), then By kind and By where it was billed |

This is the layout that answers "total and subtotal any way I want" best on the phone: the charges and their subtotals are on screen together.

## 6. Build order (card c-costsduo1)

| Part | Build name | What |
|---|---|---|
| a | costsduo1a | The viewport, the three width tiers, the pocket layout for all four screens and the service screen, the filter sheet, tap in place of hover, the details sheet. Leaves the card In progress |
| b | costsduo1 | The open book layout for all four screens. Delete docs/costs-duo-mock.html and its mentions when the real page matches it (purge rule) |

- Keep one page and one script: the layouts are CSS by width plus small render switches (`layout()` returning `pocket`, `book` or `desk`, re-read on resize, because unfolding the phone changes the width while the page is open).
- The desktop layout must come out the same: `python3 tools/costs_test.py` passes unchanged at 1,440 and 1,280 wide.
- New test `tools/costs_duo_test.py`: at 382 x 580, 466 x 657, 669 x 869 and 951 x 648 (touch, `is_mobile`), on every screen: no sideways scroll, the total equals the file's sum, no text under 12 px, no tap target under 36 px, the first screen of Overview shows the total, the four tiles and the first Coming up row at 382 x 580, tapping a charge shows its reference, tapping a month bar shows its split, the tabs and the rail reach all four screens, and resizing from 382 to 951 wide switches the layout without a reload. Look at every picture.
- If Tom's answer on card t-costsduo-go carries a note, his note wins over this plan where they differ. Change only what the note names.
- Card c-costs2 (balances and job spend) edits the data file and the jobs. If it has shipped first, rebase; the layouts read the same fields.

## 7. Not in this plan

A separate phone app, a home-screen icon set for the page, new data or new screens, and any change to the desktop layout.
