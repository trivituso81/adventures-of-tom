#!/usr/bin/env python3
"""nightshift (claude/night-plan.md section 5 step 4): the text of the card "Last night" that Tom reads each morning.
Pure: build(cards, log, night_key, today, max_starts, tests) returns (title, next, has_news). tools/board_sync.py (rule R14) calls it at the
first run after night.fixes_until and writes the card t-lastnight. No AI, no credits."""

LIMITS = ('The night browser is Chromium on a server, not Safari on the iPhone: it cannot hear, cannot judge touch, and cannot see the Duo fold.')


def _first(s, n=110):
    s = ' '.join(str(s or '').split())
    return s if len(s) <= n else s[:n - 1].rstrip() + '.'


def _shipped(card, dates):
    out = []
    for h in card.get('history', []):
        t = str(h.get('t', ''))
        if h.get('d') in dates and (t.startswith('Shipped as ') or t.startswith('Part shipped as ')):
            out.append(_first(t.replace('Part shipped as ', '').replace('Shipped as ', ''), 100))
    return out


def build(cards, log, night_key, today, max_starts, tests=None):
    by_id = {c['id']: c for c in cards}
    dates = {night_key, today}
    ran, shipped = [], []
    for e in log:
        c = by_id.get(e.get('card'))
        if not c: continue
        end = {'done': 'finished', 'prog': 'still running', 'up': 'back in Up next', 'wait': 'waiting on someone'}.get(c['col'], c['col'])
        if c.get('lane') == 'tom': end = 'handed to you'
        ran.append('%s (%s, %s)' % (c.get('title', c['id']), e.get('kind', 'queued'), end))
        shipped += _shipped(c, dates)
    for c in cards:
        if c.get('nightly') and (c.get('last_run') or {}).get('date') in dates and (c['last_run'].get('build')):
            if c['last_run']['build'] not in ' '.join(shipped): shipped.append(c['last_run']['build'])
    closed = [c['title'] for c in cards if c.get('col') == 'done' and (c.get('machine') or {}).get('verdict') == 'pass' and str((c.get('machine') or {}).get('at', ''))[:10] in dates]
    needs = [c['title'] for c in cards if c.get('lane') == 'tom' and c.get('col') != 'done' and c['id'] != 't-lastnight' and c.get('created') in dates and not c.get('fyi')]
    lines = []
    lines.append('Ran: ' + ('; '.join(ran) if ran else 'nothing ran last night.'))
    lines.append('Shipped: ' + ('; '.join(shipped) if shipped else 'nothing.'))
    if tests: lines.append('Tests: %s passed, %s failed (%s).' % (tests.get('passed', '?'), tests.get('failed', '?'), tests.get('date', 'latest run')))
    else: lines.append('Tests: no night test run yet.')
    lines.append('Closed for you: ' + ('; '.join(closed) if closed else 'nothing.'))
    lines.append('Needs you: ' + ('; '.join(needs) if needs else 'nothing new.'))
    lines.append('Starts used: %d of %d.' % (len(log), max_starts))
    lines.append(LIMITS)
    news = bool(ran or shipped or closed or needs)
    return 'Last night', ' '.join(lines), news
