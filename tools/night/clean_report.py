#!/usr/bin/env python3
"""clean_report (nightclean, claude/night-plan.md section 7 step 1). No AI, no network. Writes what the nightly cleanup (c-night-clean) works from:
  sizes      CLAUDE.md, claude/next.md, claude/INDEX.md, data/board.json (bytes), file counts of claude/ tools/ docs/, script tags in index.html;
             with the change since yesterday when --prev points at yesterday's JSON
  unused     files nothing names: a tools/ script named by no doc, workflow, card, page or other script; an engine/ or data/ script with no tag in any page;
             an art/ file whose name appears in no data, engine, tool or page file (weak: code that builds names may still use it); a claude/ note named by
             no open card, CLAUDE.md, claude/next.md or other note and untouched for 3 days
  identical  files with the same content (tools, engine, data scripts, docs, claude; art by size first)
  known_fail rows of tools/night/tests.json that carry a known_fail flag
Never listed (night-plan.md section 4, "Never touched"): art/raw/, demo/, voice clips and takes (data/voice*, tools/voice-library takes), the saved files of Tom,
and anything in the backlog. A listing is a candidate, never a proof: the cleanup session greps each file before it deletes it.
Usage: python3 tools/night/clean_report.py [--root DIR] [--out FILE] [--prev FILE] [--max N]"""
import hashlib, json, os, re, subprocess, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT0 = os.path.dirname(os.path.dirname(HERE))
TEXT = ('.py', '.js', '.json', '.md', '.html', '.tsv', '.yml', '.yaml', '.txt', '.css', '.sh', '.csv')
NEVER = ('art/raw/', 'demo/', 'data/voice', 'tools/voice-library/takes', 'data/welcome-layout.json', 'data/pose-requests.json', 'data/script-edits.json',
         'data/script-review.json', 'data/portrait-frame.json', 'tools/shots/', '.git/', 'node_modules/', '__pycache__/')
SKIPCORPUS = ('art/', 'demo/', 'data/voice', 'data/build-archive/', 'data/board-archive.json', 'tools/shots/', '.git/', 'node_modules/', '__pycache__/')
NOTE_DAYS = 3

def never(rel): return rel.startswith(NEVER) or '/__pycache__/' in rel

def walk(root, top):
    for dp, dn, fs in os.walk(os.path.join(root, top)):
        dn[:] = [d for d in dn if d not in ('__pycache__', '.git', 'node_modules')]
        for f in fs: yield os.path.relpath(os.path.join(dp, f), root).replace(os.sep, '/')

def tokens(text): return set(re.findall(r'[A-Za-z0-9_][A-Za-z0-9_.\-]*', text)) | set(re.findall(r'\w+', text))

def corpus(root):
    """token -> set of files that hold it (text files under 3 MB outside the skipped folders)."""
    idx = {}
    tops = [f for f in os.listdir(root) if os.path.isfile(os.path.join(root, f))]
    rels = list(tops)
    for t in ('tools', 'engine', 'data', 'docs', 'claude', '.github'): rels += list(walk(root, t))
    for rel in rels:
        if rel.startswith(SKIPCORPUS) or not rel.endswith(TEXT): continue
        p = os.path.join(root, rel)
        try:
            if os.path.getsize(p) > 3_000_000: continue
            s = open(p, encoding='utf-8', errors='ignore').read()
        except OSError: continue
        for tk in tokens(s): idx.setdefault(tk, set()).add(rel)
    return idx

def named_by(idx, rel, only=None):
    """files other than rel (optionally limited by a predicate) that hold the file's basename or stem."""
    base = os.path.basename(rel); stem = os.path.splitext(base)[0]
    hit = set(idx.get(base, ())) | (set(idx.get(stem, ())) if rel.endswith(('.py', '.js')) and len(stem) > 3 else set())
    hit.discard(rel)
    return {h for h in hit if (only is None or only(h))}

def last_touch(root):
    """claude/ file -> unix time of its last commit (one git pass)."""
    out = {}
    try:
        txt = subprocess.run(['git', '-C', root, 'log', '--name-only', '--format=@%ct', '--', 'claude'], capture_output=True, text=True, timeout=300).stdout
    except Exception: return out
    cur = 0
    for ln in txt.split('\n'):
        if ln.startswith('@'): cur = int(ln[1:])
        elif ln and ln not in out: out[ln] = cur
    return out

def build(root, now=None, prev=None, maxn=200, touched=None):
    now = now or time.time()
    idx = corpus(root)
    ishtml = lambda f: f.endswith('.html')
    board = os.path.join(root, 'data/board.json')
    open_cards = ''
    try:
        b = json.load(open(board, encoding='utf-8'))
        open_cards = json.dumps([c for c in b.get('cards', []) if c.get('col') != 'done' and not c.get('backlog')])
    except (OSError, ValueError): pass
    open_tokens = tokens(open_cards)
    unused = {'tools': [], 'engine_data': [], 'art': [], 'claude': []}
    for rel in walk(root, 'tools'):
        if never(rel) or not rel.endswith(('.py', '.js', '.sh')): continue
        base = os.path.basename(rel)
        if base.endswith('_test.py') or base == 'test.py': continue   # named by tools/night/tests.json, checked by manifest_check
        if not named_by(idx, rel) and base not in open_tokens: unused['tools'].append(rel)
    for top in ('engine', 'data'):
        for rel in (walk(root, top)):
            if never(rel) or not rel.endswith('.js') or (top == 'data' and rel.count('/') > 1): continue
            if not named_by(idx, rel, ishtml): unused['engine_data'].append(rel)
    code_idx = {tk: {f for f in fs if f.startswith(('engine/', 'data/', 'tools/')) or ishtml(f)} for tk, fs in idx.items()}
    for rel in walk(root, 'art'):
        if never(rel): continue
        base = os.path.basename(rel)
        if not (code_idx.get(base) or code_idx.get(os.path.splitext(base)[0])): unused['art'].append(rel)
    notes_dir = [f for f in walk(root, 'claude') if f.endswith('.md')]
    touched = touched if touched is not None else last_touch(root)
    for rel in notes_dir:
        if rel in ('claude/INDEX.md', 'claude/README.md', 'claude/next.md', 'claude/handoff-rules.md', 'claude/canon-addendum.md', 'claude/build-plan.md'): continue
        if touched.get(rel, 0) > now - NOTE_DAYS * 86400: continue
        by = named_by(idx, rel, lambda f: f != 'claude/INDEX.md')
        by_ok = {f for f in by if f == 'CLAUDE.md' or f.startswith('claude/')} 
        if not by_ok and os.path.basename(rel) not in open_tokens: unused['claude'].append(rel)
    # identical content
    seen = {}; dup = []
    bysize = {}
    for top in ('tools', 'engine', 'data', 'docs', 'claude', 'art'):
        for rel in walk(root, top):
            if never(rel): continue
            try: sz = os.path.getsize(os.path.join(root, rel))
            except OSError: continue
            if sz: bysize.setdefault(sz, []).append(rel)
    for sz, fs in bysize.items():
        if len(fs) < 2: continue
        groups = {}
        for rel in fs: groups.setdefault(hashlib.md5(open(os.path.join(root, rel), 'rb').read()).hexdigest(), []).append(rel)
        dup += [sorted(g) for g in groups.values() if len(g) > 1]
    dup.sort()
    kf = []
    try:
        for r in json.load(open(os.path.join(root, 'tools/night/tests.json'), encoding='utf-8'))['tests']:
            if r.get('known_fail'): kf.append({'id': r['id'], 'why': r['known_fail']})
    except (OSError, ValueError): pass
    def sz(p):
        try: return os.path.getsize(os.path.join(root, p))
        except OSError: return 0
    def n(top): return sum(1 for _ in walk(root, top))
    try: tags = len(re.findall(r'<script\b', open(os.path.join(root, 'index.html'), encoding='utf-8', errors='ignore').read()))
    except OSError: tags = 0
    sizes = {'CLAUDE.md': sz('CLAUDE.md'), 'claude/next.md': sz('claude/next.md'), 'claude/INDEX.md': sz('claude/INDEX.md'), 'data/board.json': sz('data/board.json'),
             'files:claude': n('claude'), 'files:tools': n('tools'), 'files:docs': n('docs'), 'index.html script tags': tags}
    change = {k: v - (prev or {}).get('sizes', {}).get(k, v) for k, v in sizes.items()} if prev else {}
    for k in unused: unused[k] = sorted(unused[k])
    return {'date': time.strftime('%Y-%m-%d', time.gmtime(now)), 'sizes': sizes, 'change_since_prev': change,
            'unused': {k: {'count': len(v), 'files': v[:maxn]} for k, v in unused.items()}, 'identical': {'count': len(dup), 'groups': dup[:maxn]}, 'known_fail': kf}

def main(argv):
    a = dict(zip(argv[::2], argv[1::2]))
    root = a.get('--root', ROOT0)
    prev = None
    if '--prev' in a:
        try: prev = json.load(open(a['--prev'], encoding='utf-8'))
        except (OSError, ValueError): prev = None
    r = build(root, prev=prev, maxn=int(a.get('--max', 200)))
    s = json.dumps(r, indent=1)
    if '--out' in a: open(a['--out'], 'w', encoding='utf-8').write(s)
    else: print(s)
    u = r['unused']
    print('clean_report: unused tools %d, engine/data %d, art %d, claude notes %d; identical groups %d; known_fail rows %d' % (u['tools']['count'], u['engine_data']['count'], u['art']['count'], u['claude']['count'], r['identical']['count'], len(r['known_fail'])), file=sys.stderr)
    return 0
if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
