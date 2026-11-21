#!/usr/bin/env python3
"""costs2 test fixture: a stand-in GitHub for the tests of tools/costlog.py, tools/costs_sync.py and the jobs that log their spend.
A bare repository with `main` holding data/costs.json (a small ledger) and a few other files; clones of it (full, shallow, or partial with no blobs).
Never touches the real repo and never makes a network call."""
import os, json, subprocess, tempfile

SEED = {
    'version': 1, 'updated': '2026-11-20', 'timezone': 'America/Los_Angeles', 'about': 'test ledger',
    'services': [{'id': 'xai', 'name': 'xAI API', 'slot': 3, 'scope': 'game', 'billing': 'prepaid', 'balance_unit': 'usd'},
                 {'id': 'elevenlabs', 'name': 'ElevenLabs', 'slot': 5, 'scope': 'game', 'billing': 'subscription', 'balance_unit': 'credits'},
                 {'id': 'fal', 'name': 'fal.ai', 'slot': 6, 'scope': 'game', 'billing': 'prepaid', 'balance_unit': 'usd'}],
    'transactions': [], 'usage': [{'service': 'xai', 'date': '2026-11-19', 'amount': 5.34, 'what': 'earlier', 'source': 'docs/CHANGES.md'}], 'balances': [],
}


def sh(*a, cwd=None, check=True, env=None):
    p = subprocess.run(list(a), cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, env=env)
    if check and p.returncode: raise RuntimeError('%s failed: %s' % (' '.join(a[:3]), p.stdout[-300:]))
    return p


def jdump(d):
    return json.dumps(d, indent=1, ensure_ascii=False) + '\n'


def make_remote(tmp=None):
    """A bare repo with main, and the path of a throwaway working clone used to seed it. Returns the bare path."""
    tmp = tmp or tempfile.mkdtemp(prefix='costsfx-')
    bare, seed = os.path.join(tmp, 'remote.git'), os.path.join(tmp, 'seed')
    sh('git', 'init', '-q', '--bare', '-b', 'main', bare)
    sh('git', '--git-dir', bare, 'config', 'uploadpack.allowFilter', 'true'); sh('git', '--git-dir', bare, 'config', 'uploadpack.allowAnySHA1InWant', 'true')
    sh('git', 'clone', '-q', bare, seed)
    os.makedirs(os.path.join(seed, 'data')); os.makedirs(os.path.join(seed, 'art'))
    open(os.path.join(seed, 'data', 'costs.json'), 'w').write(jdump(SEED))
    for i in range(6): open(os.path.join(seed, 'art', 'big%d.bin' % i), 'wb').write(os.urandom(20000))
    open(os.path.join(seed, 'README.md'), 'w').write('seed\n')
    sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'add', '-A', cwd=seed)
    sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'seed', cwd=seed)
    sh('git', 'push', '-q', 'origin', 'HEAD:main', cwd=seed)
    return bare


def clone(bare, dest, shallow=True, partial=False):
    """The kind of checkout an Action has: depth 1 (and, for art-gen, with no blobs and a sparse tree)."""
    args = ['git', 'clone', '-q']
    if shallow: args += ['--depth', '1']
    if partial: args += ['--filter=blob:none', '--sparse']
    sh(*args, 'file://' + bare, dest)
    return dest


def main_costs(bare):
    return json.loads(sh('git', '--git-dir', bare, 'show', 'main:data/costs.json').stdout)


def main_sha(bare):
    return sh('git', '--git-dir', bare, 'rev-parse', 'main').stdout.strip()


def push_competing(bare, tmp, fn, msg='competing change'):
    """Another writer pushes to main (the way a second job or Tom's phone does): fn(costs doc) changes it."""
    d = tempfile.mkdtemp(prefix='compete-', dir=tmp)
    sh('git', 'clone', '-q', bare, d)
    p = os.path.join(d, 'data', 'costs.json'); doc = json.load(open(p)); fn(doc); open(p, 'w').write(jdump(doc))
    sh('git', '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-am', msg, cwd=d)
    sh('git', 'push', '-q', 'origin', 'HEAD:main', cwd=d)
