# AI Costs (ADMIN > AI COSTS, costs.html)

Built as costs1 (2026-11-20). Tom: "an admin screen for all the AI services we are connected to, the subscription type i have, what it allows, what my balance is, how much ive spent so far ... a complete history of my spend with dates for each transaction so i can total and subtotal in any way that i want ... a final cost total screen ... including with claude ... optmized only for landscape on desktop browser ... a unique URL".

Address: https://trivituso81.github.io/adventures-of-tom/costs.html (also the AI Costs button on admin.html). It loads no game code. Its tab icon is a gold receipt with a dollar sign (`icon-costs-32.png`, `icon-costs-180.png`, drawn by `python3 tools/make_costs_icon.py`, costs1icon).

## The screens

| Screen | Address | What it shows |
|---|---|---|
| Overview | costs.html | Total paid, this month, plans renewing each month, next charge, paid each month by service, renewals coming up, every service in one table, Needs a look, latest charges |
| Services | costs.html#/services | One card per service |
| A service | costs.html#/service/<id> | Paid, balance, next charge, the plan, what it allows (each line with where it was read), plan changes, holes in the records, use written in the game's log, its charges |
| Ledger | costs.html#/ledger | Every charge. Search, service chips, kind, sort by any column, subtotal by service, month, week, kind or paid through, tick rows to add them up, download the shown rows as CSV |
| Totals | costs.html#/totals | The grand total, the running total, service by month (click a figure to open its charges), by kind, by where it was billed |

The Dates and Show controls at the top apply to every screen. "Game tools only" leaves out services with `scope: "personal"`.

## The data: data/costs.json

| Field | Meaning |
|---|---|
| `services[]` | `id`, `name`, `slot` (chart colour 1 to 6, fixed per service, 0 for a service with no charges), `scope` (`game` or `personal`), `billing` (`subscription`, `prepaid`, `free`, `unknown`), `used_for`, `plan` (`name`, `price`, `period`, `since`, `renews`, `via`, `price_note`), `allows[]` (`text`, `source`), `history[]` (plan changes), `console` and `console_name` (the billing page), `keys`, `balance_unit` (`usd` or `credits`, when the service has a balance), `balance_kind`, `usage_complete` (true when the game's log holds all of the service's use), `gaps[]` |
| `transactions[]` | One row per charge on a receipt: `id`, `date` and `time` (Pacific), `service`, `type` (`subscription`, `credits`, `refund`), `amount` (dollars, a refund is negative), `what`, `via` (Apple App Store, Google Play, Card), `ref` (order or invoice number), `source`, and when needed `verify` (why the amount needs confirming) or `note` |
| `usage[]` | Credit spent by the game's jobs, from docs/CHANGES.md or a job's own log: `service`, `date`, `amount`, `what`, `source`. Use of money already paid: never added to a total |
| `balances[]` | Either a note (`service`, `date`, `text`, `source`) or a read balance (`service`, `date`, `left`, `limit`, `unit`, `source`). The page shows the newest read balance |

## Rules for a session that files charges

- Every charge comes from a receipt (email, or a statement Tom sends). Never file a charge that is only expected, and never estimate an amount. An amount that could not be read line by line gets `verify` with the reason.
- Dates and times are Pacific time, taken from the receipt's own time.
- Never put a card number, the last four digits, a billing address or an email link in the file. The repo is public.
- A prepaid top-up is the charge. What a job later spends from that credit goes in `usage`, not in `transactions`, so nothing is counted twice.
- A new service gets the next free `slot`. A service keeps its slot for good (the colour follows the service).
- A plan change: add the charge, update `plan`, add a `history` row, and re-read what the plan allows from the provider's own page (write the source and the date read).
- Where the receipts are: Claude is billed by Apple (App Store receipts, which do not include renewals unless Tom turns renewal receipts on), Google AI by Google Play, xAI and ElevenLabs by Stripe emails, fal by Orb emails.
- After any change run `python3 tools/costs_test.py` and look at the pictures it writes.

## What a browser keeps (not in the repo)

"Add a charge" and "Record the balance" save to this browser only (localStorage `aot-costs-local`). They count in the totals on that computer and are marked "Added on this computer". A session files them into data/costs.json when Tom says what he added.

## Next: costs2 (card c-costs2)

| # | Step |
|---|---|
| 1 | A `costs-sync` Action, once a day: read ElevenLabs credits (`/v1/user/subscription`, the same call as `tools/voice-learn/voicegen.py`) with the repo secret and write a read balance into `balances`. Do the same for fal and xAI only if their APIs give a balance to the keys the repo has; if not, say so on the card |
| 2 | Every Action that spends (art-gen, clip-gen, clip-gate, voice-gen, wan-gen) appends what the run cost to `usage`, so the estimate of a prepaid balance becomes paid less logged use for all of them (artfallback1, 2026-11-21: art-gen already appends its WAN pictures to `usage` as service `fal`, the estimate booked per run; xAI picture spend and the other Actions are still to do) |
| 3 | Tom's notes from card t-costs1look |
| 4 | Test with stand-in servers. Never run a paid call from a session |

## iPhone Duo layouts (built as costsduo1, 2026-11-21)

One page, three layouts chosen by width (`layout()` in costs.html, re-read on every resize, so unfolding the phone switches it without a reload; `html[data-lay]` and `body[data-lay]` hold it):

| Width | Layout | Duo view |
|---|---|---|
| under 900 px | Pocket: one column, four tabs at the bottom, a filter pill (Dates, Show, and on Ledger Service, Kind, Subtotal by, tick boxes), charge details in a sheet from the bottom | Folded (382, 466) and open upright (669) |
| 900 to 1,099 px | Open book: a rail of the four screens, the list on the left half, what was tapped on the right half (a service, or the subtotals and the charge) | Open sideways (951) |
| 1,100 px and up | Desktop, as built in costs1 | Desktop browser |

A finger replaces hover: tap a month bar, the share bar or the running total for the split. Same `#/` addresses everywhere. Plan and rules: `claude/costs-duo-plan.md`. Test: `python3 tools/costs_duo_test.py` (four sizes, every screen: no sideways scroll, totals equal the file, no text under 12 px, no tap target under 36 px, first Overview screen, taps, tabs, rail, resize). The desktop test `tools/costs_test.py` passes unchanged.
