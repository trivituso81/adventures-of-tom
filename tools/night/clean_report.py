#!/usr/bin/env python3
"""nightclean: the report the nightly cleanup reads. No AI, no network.
Prints a table and writes JSON (--json PATH). Sections: sizes (with change since the last report, --prev PATH), files nothing names, files with identical
content, tests marked known_fail for more than 7 nights. Voice is report only (tools/clip-audit/unused_voice.py keeps its own rule).
Never listed as removable: the "Never touched" row of claude/night-plan.md section 4 (voice clips and takes, art/raw/, demo/, Tom's saved files).
Usage: python3 tools/night/clean_report.py [--json out.json] [--prev yesterday.json] [--root DIR] [--limit N]"""
import hashlib, json, os, re, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT0 = os.path.dirname(os.path.dirname(HERE))
SIZED = ['CLAUDE.md', 'claude/next.md', 'claude/INDEX.md', 'data/board.json']
COUNTED = ['claude', 'tools', 'docs']
NEVER = ('data/voice', 'data/voice-clips.js', 'art/raw/', 'demo/', 'takes/', 'data/welcome-layout.json', 'data/pose-requests.json', 'data/script-edits.json',
         'data/script-review.json', 'data/portrait-frame.json', '.git/', 'data/board-archive.json', 'data/build-history.js', 'data/build-archive/')
TEXT = ('.py', '.js', '.json', '.md', '.html', '.css', '.yml', '.yaml', '.txt', '.tsv', '.sh', '.mjs', '.svg')
SKIPDIRS = {'.git', 'node_modules', '__pycache__', 'shots', 'demo'}
MAXTEXT = 3_000_000
NOTE_DAYS = 3


def never(rel):
    return any(rel == n or rel.startswith(n) for n in NEVER)


def walk(root, sub=''):
    base = os.path.join(root, sub) if sub else root
    for dp, ds, fs in os.walk(base):
        ds[:] = [d for d in ds if d not in SKIPDIRS]
        for f in fs:
            yield os.path.relpath(os.path.join(dp, f), root)


def corpus(root, skip_under=()):
    """All text in the repo (not art/, not baked voice or clip data) as one lowercase string per file, for substring lookups."""
    out = {}
    for rel in walk(root):
        if not rel.endswith(TEXT) or rel.startswith('art/') or rel.startswith('data/voice') or rel.startswith('data/clips/'): continue
        p = os.path.join(root, rel)
        try:
            if os.path.getsize(p) > MAXTEXT: continue
            out[rel] = open(p, encoding='utf-8', errors='ignore').read()
        except OSError:
            pass
    return out


def mentions(corp, needle, exclude):
    """Files (other than `exclude`) whose text holds needle."""
    return [r for r, t in corp.items() if r != exclude and needle in t]


def sizes(root):
    out = {}
    for f in SIZED:
        p = os.path.join(root, f)
        out[f] = os.path.getsize(p) if os.path.exists(p) else 0
    for d in COUNTED:
        out[d + '/ (files)'] = sum(1 for _ in walk(root, d))
    try:
        out['index.html script tags'] = len(re.findall(r'<script\b', open(os.path.join(root, 'index.html'), encoding='utf-8').read()))
    except OSError:
        out['index.html script tags'] = 0
    return out


def unused(root, corp, limit):
    rows = []
    cmd = lambda: None
    wf = ' '.join(t for r, t in corp.items() if r.startswith('.github/'))
    # tools/ scripts named by no doc, workflow, card or other script
    for rel in sorted(walk(root, 'tools')):
        if not rel.endswith(('.py', '.js')) or never(rel) or '/' in rel[len('tools/'):] and rel.count('/') > 3: continue
        base = os.path.basename(rel)
        if base == '__init__.py' or base.endswith('_test.py') or base == 'test.py': continue
        stem = base.rsplit('.', 1)[0]
        hits = mentions(corp, base, rel) + mentions(corp, rel[len('tools/'):] if False else 'tools/' + base, rel)
        if not hits and not mentions(corp, stem + '.', rel) and not mentions(corp, 'import ' + stem, rel):
            rows.append({'kind': 'tools script', 'file': rel})
    # engine/ and data/ scripts with no tag in any page
    pages = {r: t for r, t in corp.items() if r.endswith('.html')}
    for sub in ('engine', 'data'):
        for rel in sorted(walk(root, sub)):
            if not rel.endswith('.js') or never(rel) or rel.startswith('data/clips/'): continue
            base = os.path.basename(rel)
            if not any(base in t for r, t in corp.items() if r.endswith(('.html', '.js', '.py', '.json', '.md', '.yml')) and r != rel):
                rows.append({'kind': sub + ' script', 'file': rel})
    # art/ files named by no data, engine or tool file
    for rel in sorted(walk(root, 'art')):
        if never(rel): continue
        base = os.path.basename(rel)
        stem = base.rsplit('.', 1)[0]
        if not any((base in t or ('/' + stem) in t or ("'" + stem) in t) for r, t in corp.items() if r != rel and (r.startswith(('data/', 'engine/', 'tools/')) or r.endswith('.html'))):
            rows.append({'kind': 'art file', 'file': rel})
    # claude/ notes named by no open card, CLAUDE.md, claude/next.md or other note, untouched for 3 days
    try:
        board = json.load(open(os.path.join(root, 'data', 'board.json'), encoding='utf-8'))
        opentxt = json.dumps([c for c in board.get('cards', []) if c.get('col') != 'done'])
    except (OSError, ValueError):
        opentxt = ''
    now = time.time()
    for rel in sorted(walk(root, 'claude')):
        if not rel.endswith('.md') or never(rel) or rel in ('claude/INDEX.md', 'claude/README.md'): continue
        base = os.path.basename(rel)
        if now - os.path.getmtime(os.path.join(root, rel)) < NOTE_DAYS * 86400: continue
        if base in opentxt: continue
        if any(base in t for r, t in corp.items() if r != rel and r not in ('claude/INDEX.md',) and (r.startswith('claude/') or r in ('CLAUDE.md',))): continue
        rows.append({'kind': 'claude note', 'file': rel})
    return rows[:limit] if limit else rows, len(rows)


def duplicates(root):
    by = {}
    for rel in list(walk(root, 'tools')) + list(walk(root, 'engine')) + list(walk(root, 'docs')) + list(walk(root, 'art')):
        if never(rel): continue
        p = os.path.join(root, rel)
        try:
            if os.path.getsize(p) < 200: continue
            by.setdefault(hashlib.sha1(open(p, 'rb').read()).hexdigest(), []).append(rel)
        except OSError:
            pass
    return [sorted(v) for v in by.values() if len(v) > 1]


def known_fail(root):
    out = []
    try:
        d = json.load(open(os.path.join(root, 'tools', 'night', 'tests.json'), encoding='utf-8'))
    except (OSError, ValueError):
        return out
    today = time.strftime('%Y-%m-%d')
    for r in d.get('tests', []):
        if not r.get('known_fail'): continue
        since = r.get('known_since')
        nights = None
        if since:
            try: nights = int((time.mktime(time.strptime(today, '%Y-%m-%d')) - time.mktime(time.strptime(since, '%Y-%m-%d'))) // 86400)
            except ValueError: pass
        out.append({'id': r['id'], 'why': r['known_fail'], 'since': since, 'nights': nights, 'over7': (nights is not None and nights > 7)})
    return out


def build(root, limit=0):
    corp = corpus(root)
    un, total = unused(root, corp, limit)
    return {'date': time.strftime('%Y-%m-%d'), 'sizes': sizes(root), 'unused': un, 'unused_total': total, 'duplicates': duplicates(root), 'known_fail': known_fail(root)}


def main(argv):
    a = {'root': ROOT0, 'json': '', 'prev': '', 'limit': '0'}
    i = 0
    while i < len(argv):
        if argv[i].startswith('--') and i + 1 < len(argv): a[argv[i][2:]] = argv[i + 1]; i += 1
        i += 1
    rep = build(a['root'], int(a['limit']))
    prev = {}
    if a['prev']:
        try: prev = json.load(open(a['prev'], encoding='utf-8')).get('sizes', {})
        except (OSError, ValueError): prev = {}
    print('Cleanup report %s' % rep['date'])
    print('| What | Size | Change |\n|---|---|---|')
    for k, v in rep['sizes'].items():
        ch = (v - prev[k]) if k in prev else None
        print('| %s | %s | %s |' % (k, v, ('%+d' % ch) if ch is not None else 'no earlier report'))
    print('\nFiles nothing names: %d' % rep['unused_total'])
    for r in rep['unused']: print('  %-13s %s' % (r['kind'], r['file']))
    print('\nIdentical files: %d groups' % len(rep['duplicates']))
    for g in rep['duplicates'][:30]: print('  ' + '  =  '.join(g))
    print('\nTests marked known_fail: %d (over 7 nights: %d)' % (len(rep['known_fail']), sum(1 for k in rep['known_fail'] if k['over7'])))
    for k in rep['known_fail']:
        if k['over7']: print('  %s (%d nights): %s' % (k['id'], k['nights'], k['why']))
    if a['json']:
        json.dump(rep, open(a['json'], 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
