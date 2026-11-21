#!/usr/bin/env python3
"""night1 (card c-nightshift, claude/night-plan.md section 5 step 4): the text of the card Last night, written for Tom each morning.
Pure: lastnight(board_dict, night_key, tests) returns {'next', 'sections', 'news'}; tools/board_sync.py (R14) puts it on the card t-lastnight.
Ran = cards the night shift started; Shipped = builds named in history lines dated that night; Tests = branch `night` tests/latest.json (may be None);
Closed for you = cards the night QA closed; Needs you = Tom cards that appeared overnight; Starts used = n of max."""
import datetime, re

SHIP = re.compile(r'^(?:Shipped as|Part shipped as|Ran as) ([^\s:]+):? ?(.*)$')


def lastnight(B, key, tests=None):
    night = B.get('night') or {}
    cards = {c['id']: c for c in B['cards']}
    nxt = (datetime.date.fromisoformat(key) + datetime.timedelta(days=1)).isoformat()
    days = (key, nxt)
    ran, shipped, closed = [], [], []
    for e in (night.get('log') or {}).get(key, []):
        c = cards.get(e['id'])
        if not c: ran.append('%s: gone from the board' % e['id']); continue
        ended = 'still running' if c['col'] == 'prog' else ('finished' if c['col'] == 'done' or (c.get('nightly') and (c.get('last_run') or {}).get('date') in days) else 'back in the queue')
        if any('ended without shipping' in h.get('t', '') and h.get('d') in days for h in c.get('history', [])): ended = 'ended without shipping'
        ran.append('%s (%s): %s' % (c['title'], e.get('kind', 'queued'), ended))
    for c in B['cards']:
        for h in c.get('history', []):
            if h.get('d') not in days: continue
            m = SHIP.match(h.get('t', ''))
            if m and c.get('lane') == 'claude' and c['id'] in {e['id'] for e in (night.get('log') or {}).get(key, [])}:
                shipped.append('%s: %s' % (m.group(1), m.group(2).strip() or c['title']))
            if h.get('t', '').startswith('Checked by the night QA'): closed.append('%s: %s' % (c['title'], h['t'].split(':', 1)[-1].strip()))
    needs = ['%s' % c['title'] for c in B['cards'] if c['lane'] == 'tom' and c['col'] != 'done' and c['id'] != 't-lastnight' and (c.get('created') in days) and not c.get('fyi')]
    tl = None
    if tests:
        bad = [t.get('id') for t in tests.get('failed', [])] if isinstance(tests.get('failed'), list) else []
        tl = '%s passed, %s failed%s' % (tests.get('passed', '?'), len(bad) if bad else tests.get('failed', 0), (': ' + ', '.join(bad[:8])) if bad else '')
    used = len((night.get('log') or {}).get(key, []))
    secs = [('Ran', ran or ['nothing started']), ('Shipped', shipped or ['nothing']), ('Tests', [tl] if tl else ['no test run yet (it is built by card c-nighttests)']),
            ('Closed for you', closed or ['nothing']), ('QA limits', ['the test browser is Chromium on a server, not Safari on the iPhone: it cannot hear, cannot judge touch and cannot see the Duo fold']), ('Needs you', needs or ['nothing']), ('Starts used', ['%d of %d' % (used, night.get('max', 0))])]
    text = 'Night of %s. ' % key + ' '.join('%s: %s.' % (h, '; '.join(x).rstrip('.')) for h, x in secs)
    news = bool(ran or shipped or closed or needs)
    return {'next': text[:1500], 'sections': secs, 'news': news}
