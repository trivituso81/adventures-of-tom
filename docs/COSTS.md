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

"Add a charge" and "Record the balance" save to this browser only (localStorage `aot-costs-local`). They count in the totals on that computer and are marked "Added on this computer". A session files them into data/costs.json when Tom says what he added (as a `balances` row, which the page then turns into a moving estimate).

## How the page fills itself in (built as costs2, 2026-11-21, card c-costs2)

Tom's notes on the first look (card t-costs1look): "all good", so nothing in the page's layout or wording changed for them.

| Part | What it does | Where |
|---|---|---|
| Balances, once a day | The `costs-sync` Action (06:23 Pacific in winter) reads what each service says is left and writes `balances` rows. One row a day per service: a second read the same day replaces the first, a row filed by hand never is replaced. A read spends nothing. By hand it is a dry run unless `dry_run` is `false` | `.github/workflows/costs-sync.yml`, `tools/costs_sync.py` |
| Spend, every run | Every Action that spends calls `tools/costlog.py` at the end and appends rows to `usage`: art-gen (xAI pictures and their QA checks, WAN on fal), clip-gen (xAI videos and the gate's look checks), the Battle Guide take step of clip-gen (gate look checks), clip-gate (xAI vision), voice-gen and the board's voice job (ElevenLabs credits), wan-gen (fal), the QA replay of art-gen | `tools/costlog.py`, the jobs' own scripts |
| The estimate | A balance read earlier, less the dollar use logged after it, shown as "About $X" until the next read. With no read balance a prepaid service whose log is complete shows paid less logged use. A credits row (ElevenLabs) is shown as credits and never taken off a dollar figure | `balanceOf` in `costs.html` |
| A balance that cannot be read | A dated note on the service page, filed once, and a line under Needs a look until a balance is read | `costs_sync.py`, `flags()` in `costs.html` |

### What each service lets a job read (facts from the providers' docs, 2026-11-21)

| Service | Reads a balance with | Secret | State |
|---|---|---|---|
| ElevenLabs | `GET /v1/user/subscription` (the call `voicegen.py` already makes): credits left = `character_limit` less `character_count` | `ELEVENLABS_API_KEY` (set) | Works with the repo's key |
| fal | `GET https://api.fal.ai/v1/account/billing?expand=credits`. fal's docs say this needs an **admin scope** key; an API scope key is answered 401 or 403 | `FAL_ADMIN_KEY`, else `FAL_KEY` | Unknown until the first run: the job notes it on the fal page if the key is refused |
| xAI | `GET https://management-api.x.ai/v1/billing/teams/{team}/prepaid/balance`. Needs a **Management key** and the team id; the inference key `XAI_API_KEY` cannot read it. The total is in US cents and the docs' examples show it **negative** when credit is left; the job shows its size as dollars. This sign is an inference from examples: check the first live figure against the xAI console | `XAI_MANAGEMENT_KEY`, `XAI_TEAM_ID` | Not set: skipped. Until then the xAI figure is the last balance recorded, less the use logged after it |

### The ledger rows

| Field of a `usage` row | Meaning |
|---|---|
| `service`, `date` (Pacific), `at` (UTC time), `amount`, `what`, `source` | As before. `amount` keeps four decimals |
| `unit` | `credits` for ElevenLabs (credits are spent from the plan, not bought, so they are never dollars). Absent means dollars |
| `run` | The Actions run URL. A row with the same `run`, `service` and `what` is never written twice, so a retried step cannot double count |

A `balances` row the job writes carries `read: true` (its own rows, so a repeat the same day replaces them); a note it writes carries `job: true`.

`services[].usage_logged_from` is the day from which the game's log holds ALL of a service's use (xai: 2026-11-21, the day every Action began logging). A read balance on or after that day is turned into a moving estimate. `usage_complete` is the same claim from the start (fal).

### How `costlog.py` writes

It fetches the newest main (depth 1), changes `data/costs.json` as read from THAT commit, builds a commit with git plumbing (temporary index, `write-tree --missing-ok`, `commit-tree`) and pushes it to main with `[skip ci]`. The job's own checkout (HEAD, index, working files, its output folder) is never touched, and a partial clone does not fetch every blob. A push refused because main moved is retried from a fresh fetch, 8 times. It does nothing unless `COSTS_LOG_REPO` names a git checkout (each spending workflow sets it to the workspace); tests and sessions leave it unset, so no session can write a spend row by accident. `art-gen` calls `log_usage` itself on its own checkout.

### Not covered, on purpose

- `voice-take` (Voice Library takes) and `music-gen` spend ElevenLabs credits and do not log: the daily balance read already shows the credits left, and a take is a few hundred characters.
- Spend before 2026-11-21 stays as filed from change notes (`usage_logged_from` marks the day the log became complete).

### Tests

`python3 tools/costs2_test.py` (stand-in git remotes including a partial clone, stand-in ElevenLabs, fal and xAI servers, the page on a desktop and a Duo-width window, and a wiring check of every spending job and workflow), `python3 tools/costs_test.py`, `python3 tools/costs_duo_test.py`, `python3 tools/art-library/artgen_test.py`, `python3 tools/art-library/wangen_test.py` (W12), `python3 -I tools/voice-learn/voicegen_test.py` (the credits row). Three tests already failed on main before costs2 and still do for the same reasons: `clipgen_test.py` (a video file its harness expects is not made), `vision_test.py` (clip `clip-tom-guard` is no longer in the data) and one voicegen check that counts 258 lines (the list is shorter now).

## iPhone Duo layouts (built as costsduo1, 2026-11-21)

One page, three layouts chosen by width (`layout()` in costs.html, re-read on every resize, so unfolding the phone switches it without a reload; `html[data-lay]` and `body[data-lay]` hold it):

| Width | Layout | Duo view |
|---|---|---|
| under 900 px | Pocket: one column, four tabs at the bottom, a filter pill (Dates, Show, and on Ledger Service, Kind, Subtotal by, tick boxes), charge details in a sheet from the bottom | Folded (382, 466) and open upright (669) |
| 900 to 1,099 px | Open book: a rail of the four screens, the list on the left half, what was tapped on the right half (a service, or the subtotals and the charge) | Open sideways (951) |
| 1,100 px and up | Desktop, as built in costs1 | Desktop browser |

A finger replaces hover: tap a month bar, the share bar or the running total for the split. Same `#/` addresses everywhere. Plan and rules: `claude/costs-duo-plan.md`. Test: `python3 tools/costs_duo_test.py` (four sizes, every screen: no sideways scroll, totals equal the file, no text under 12 px, no tap target under 36 px, first Overview screen, taps, tabs, rail, resize). The desktop test `tools/costs_test.py` passes unchanged.
