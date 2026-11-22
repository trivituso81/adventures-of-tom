#!/usr/bin/env python3
"""startpics10: a phone notification for each status change of a Battle Guide picture or video.

Sent through ntfy.sh (free, no account, no key): the topic is in data/notify.json (or the env var NTFY_TOPIC); the phone has the ntfy app subscribed to it.
send() never raises and never waits more than 8 seconds, so a notification can never stop a job. NOTIFY_OFF=1 turns it off (tests)."""
import json, os, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATES = {'idle': 'Idle', 'guard': 'Guard', 'hit': 'Getting hit', 'dodge': 'Dodge', 'ko': 'Knocked out', 'victory': 'Victory', 'run': 'Running', 'give': 'Giving', 'slip': 'Slipping', 'flustered': 'Flustered', 'die': 'Defeated', 'cast': 'Cast'}


def config(root=None):
    t, srv = os.environ.get('NTFY_TOPIC', ''), 'https://ntfy.sh'
    try:
        c = json.load(open(os.path.join(root or ROOT, 'data', 'notify.json')))
        t = t or c.get('topic', ''); srv = c.get('server') or srv
    except Exception: pass
    return t, srv.rstrip('/')


def label(anim):
    """'body:amy:idle' -> 'Amy: Idle'; 'move:gold_star_sticker' -> 'Gold star sticker'; 'amy' (a start picture) -> 'Amy'."""
    p = str(anim or '').split(':')
    if p[0] == 'body' and len(p) == 3: return '%s: %s' % (p[1].capitalize(), STATES.get(p[2], p[2].capitalize()))
    if p[0] in ('move', 'act', 'wind') and len(p) >= 2: return p[-1].replace('_', ' ').capitalize()
    return str(anim or '').replace('_', ' ').capitalize()


def send(title, message, tags='', root=None, click=''):
    if os.environ.get('NOTIFY_OFF') == '1': return False
    t, srv = config(root)
    if not t: return False
    try:
        h = {'Title': str(title)[:120].encode('ascii', 'replace').decode(), 'Priority': 'default'}
        if tags: h['Tags'] = tags
        if click: h['Click'] = click
        rq = urllib.request.Request('%s/%s' % (srv, t), data=str(message).encode('utf-8'), headers=h, method='POST')
        urllib.request.urlopen(rq, timeout=8).read()
        return True
    except Exception as x:
        print('notification not sent (the job goes on):', str(x)[:120], flush=True); return False
