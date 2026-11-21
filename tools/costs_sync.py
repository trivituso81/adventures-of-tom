#!/usr/bin/env python3
"""costs2: read what each service says is left and write it to `balances` in data/costs.json (the Action `costs-sync`, once a day).

Reading a balance spends nothing. Each reader answers one of:
  ok    a balance was read: a row {service, date, at, left, limit?, unit, source} is written (one row per service per day: a second read the same
        day replaces the first)
  skip  the key this reader needs is not in the repo secrets: nothing is written, the reply says which secret
  fail  the service refused the key or answered something unreadable: a dated note row {service, date, text, source} is written ONCE (not again while it
        says the same thing), so the service page shows why there is no figure
The three readers, and what each needs:
  ElevenLabs  GET /v1/user/subscription with ELEVENLABS_API_KEY (the call tools/voice-learn/voicegen.py already makes): credits left = character_limit
              minus character_count. The repo's key reads it.
  fal         GET /v1/account/billing?expand=credits with FAL_ADMIN_KEY, else FAL_KEY. fal's docs: this endpoint needs an ADMIN scope key; a key made
              with API scope is answered 401 or 403, which becomes a note.
  xAI         GET /v1/billing/teams/{team}/prepaid/balance on management-api.x.ai with XAI_MANAGEMENT_KEY and XAI_TEAM_ID. xAI's docs say a Management key
              is needed (the inference key XAI_API_KEY cannot read it) and show the total as a NEGATIVE number of US cents when credit is left; the reader
              shows the size of that number as dollars (the first live read is to be checked against the xAI console).
Usage: python3 -I tools/costs_sync.py [--dry-run] [--root DIR]   (--dry-run reads and prints, writes nothing)
Env: ELEVENLABS_API_KEY, FAL_ADMIN_KEY, FAL_KEY, XAI_MANAGEMENT_KEY, XAI_TEAM_ID (never printed); ELEVENLABS_BASE, FAL_API, XAI_MANAGEMENT_BASE (test stand-ins);
COSTS_LOG_REMOTE (default origin)."""
import os, sys, json, argparse
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import costlog   # noqa: E402

EL_BASE = lambda: os.environ.get('ELEVENLABS_BASE', 'https://api.elevenlabs.io').rstrip('/')
FAL_BASE = lambda: os.environ.get('FAL_API', 'https://api.fal.ai').rstrip('/')
XAI_BASE = lambda: os.environ.get('XAI_MANAGEMENT_BASE', 'https://management-api.x.ai').rstrip('/')


def scrub(text, *secrets):
    t = str(text)
    for s in secrets:
        if s: t = t.replace(s, '<key>')
    return t[:200]


def get(url, headers, secrets=()):
    """(status, json or None, text). Never raises; the keys are scrubbed from any message."""
    import requests
    try:
        r = requests.get(url, headers=headers, timeout=30)
    except Exception as x:
        return 0, None, scrub(type(x).__name__ + ': ' + str(x), *secrets)
    try: j = r.json()
    except Exception: j = None
    return r.status_code, j, scrub(r.text, *secrets)


def read_elevenlabs(env):
    key = env.get('ELEVENLABS_API_KEY', '')
    if not key: return 'skip', 'the repo secret ELEVENLABS_API_KEY is not set'
    st, j, tx = get(EL_BASE() + '/v1/user/subscription', {'xi-api-key': key}, (key,))
    if st != 200 or not isinstance(j, dict): return 'fail', 'ElevenLabs answered %s to the subscription call%s' % (st or 'nothing', (': ' + tx[:100]) if tx else '')
    used, limit = j.get('character_count'), j.get('character_limit')
    if not isinstance(used, (int, float)) or not isinstance(limit, (int, float)): return 'fail', 'ElevenLabs answered without a credit count'
    row = {'service': 'elevenlabs', 'left': int(limit - used), 'limit': int(limit), 'unit': 'credits', 'source': 'Read from ElevenLabs by the costs-sync job (%s plan, %s credits used).' % (j.get('tier') or 'unknown', format(int(used), ','))}
    return 'ok', row


def read_fal(env):
    key = env.get('FAL_ADMIN_KEY', '') or env.get('FAL_KEY', '')
    which = 'FAL_ADMIN_KEY' if env.get('FAL_ADMIN_KEY') else 'FAL_KEY'
    if not key: return 'skip', 'neither FAL_ADMIN_KEY nor FAL_KEY is set'
    st, j, tx = get(FAL_BASE() + '/v1/account/billing?expand=credits', {'Authorization': 'Key ' + key}, (key,))
    if st in (401, 403): return 'fail', 'fal refused %s for the billing call (it needs an admin scope key); set the repo secret FAL_ADMIN_KEY' % which
    cur = ((j or {}).get('credits') or {}) if isinstance(j, dict) else {}
    if st != 200 or not isinstance(cur.get('current_balance'), (int, float)): return 'fail', 'fal answered %s to the billing call without a balance' % (st or 'nothing')
    if (cur.get('currency') or 'USD').upper() != 'USD': return 'fail', 'fal reported the balance in %s, not dollars' % cur.get('currency')
    return 'ok', {'service': 'fal', 'left': round(float(cur['current_balance']), 2), 'unit': 'usd', 'source': 'Read from fal by the costs-sync job (%s).' % which}


def read_xai(env):
    key, team = env.get('XAI_MANAGEMENT_KEY', ''), env.get('XAI_TEAM_ID', '')
    if not key or not team: return 'skip', 'the repo secrets XAI_MANAGEMENT_KEY and XAI_TEAM_ID are not both set (the inference key XAI_API_KEY cannot read a balance)'
    st, j, tx = get('%s/v1/billing/teams/%s/prepaid/balance' % (XAI_BASE(), team), {'Authorization': 'Bearer ' + key}, (key, team))
    if st in (401, 403): return 'fail', 'xAI refused the management key for the balance call'
    val = (((j or {}).get('total') or {}).get('val')) if isinstance(j, dict) else None
    try: cents = abs(int(str(val)))
    except Exception: return 'fail', 'xAI answered %s to the balance call without a readable total' % (st or 'nothing')
    if st != 200: return 'fail', 'xAI answered %s to the balance call' % st
    return 'ok', {'service': 'xai', 'left': round(cents / 100.0, 2), 'unit': 'usd', 'source': 'Read from xAI by the costs-sync job (prepaid balance, xAI reports it as a negative number of cents).'}


READERS = [('elevenlabs', read_elevenlabs), ('fal', read_fal), ('xai', read_xai)]


def apply(doc, results, today, at):
    """Writes the reads into doc (balances). results: {service: (kind, row-or-text)}. Returns {service: what was written}."""
    bl = doc.setdefault('balances', [])
    done = {}
    for sid, (kind, v) in results.items():
        if kind == 'ok':
            row = dict(v, date=today, at=at)
            bl[:] = [b for b in bl if not (b.get('service') == sid and b.get('left') is not None and b.get('date') == today and b.get('read'))]
            row['read'] = True   # a row this job wrote, so a second read the same day replaces it and a hand-filed row never does
            bl.append(row); done[sid] = 'balance %s' % v['left']
        elif kind == 'fail':
            text = 'The costs-sync job could not read the balance: %s.' % v
            mine = [b for b in bl if b.get('service') == sid and ((b.get('text') and b.get('job')) or b.get('read'))]   # this job's own rows, oldest first
            if mine and mine[-1].get('text') == text: done[sid] = 'same note already filed'; continue   # a balance read since then lets the same trouble be noted again
            bl.append({'service': sid, 'date': today, 'at': at, 'text': text, 'source': 'costs-sync job', 'job': True}); done[sid] = 'note: ' + v
        else:
            done[sid] = 'skipped: ' + v
    if any(k == 'ok' for k, _ in results.values()): doc['updated'] = max(doc.get('updated') or '', today)
    return done


def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--root', default=os.path.abspath(os.path.join(HERE, '..')))
    a = ap.parse_args(argv)
    env = os.environ
    results = {sid: fn(env) for sid, fn in READERS}
    for sid, (k, v) in results.items():
        print('%-11s %-5s %s' % (sid, k, v if k != 'ok' else '%s %s left' % (v['left'], v['unit'])), flush=True)
    today, at = costlog.today(), costlog.now_iso()
    if a.dry_run:
        print('dry run: nothing written'); return 0
    if not any(k in ('ok', 'fail') for k, _ in results.values()):
        print('nothing to write'); return 0
    out = {}
    costlog.update(a.root, lambda d: out.update(apply(d, results, today, at)), 'costs: balances read [skip ci]', remote=os.environ.get('COSTS_LOG_REMOTE', 'origin'))
    for sid, w in out.items(): print('wrote', sid, w)
    return 0


if __name__ == '__main__':
    sys.exit(main())
