#!/usr/bin/env python3
"""guidegen1: the request files the Battle Guide commits to main (data/guide-reconcile.json; guideflow7: the use requests moved to queue.json) and how an Action
takes its requests off them BEFORE it pays (same pattern as clipgen.py take_requests, keysecrets2).
  load(path, root)                       {'requests': [...]} (empty when the file is missing or unreadable)
  take(path, ats, root, remote, msg)     remove the requests with these `at` stamps from the file on main, retried against a main that moved"""
import json, os, subprocess, time

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))


def jdump(d): return json.dumps(d, indent=1, ensure_ascii=False) + '\n'
def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)


def load(path, root=ROOT):
    try: return json.load(open(os.path.join(root, path), encoding='utf-8'))
    except (OSError, ValueError): return {'requests': []}


def take(path, ats, root=ROOT, remote='origin', msg='guide: requests taken [skip ci]'):
    def git(*a, check=True):
        p = subprocess.run(['git', '-C', root] + list(a), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        if check and p.returncode: raise RuntimeError('git %s failed: %s' % (' '.join(a[:2]), p.stdout[-300:]))
        return p
    for k in range(8):
        git('fetch', '--depth', '1', remote, 'main'); git('checkout', '-q', '-B', 'main', 'FETCH_HEAD'); git('reset', '-q', '--hard', 'FETCH_HEAD')
        doc = load(path, root); doc['requests'] = [r for r in doc.get('requests') or [] if r.get('at') not in ats]
        open(os.path.join(root, path), 'w', encoding='utf-8').write(jdump(doc))
        git('add', path)
        if not git('status', '--porcelain', '--', path, check=False).stdout.strip(): return
        git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-q', '-m', msg)
        if git('push', remote, 'HEAD:main', check=False).returncode == 0: return
        say('push refused, trying again (%d)' % (k + 1)); time.sleep(3 + 2 * k)
    raise RuntimeError('could not push the emptied request list 8 times')
