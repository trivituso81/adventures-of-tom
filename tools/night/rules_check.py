#!/usr/bin/env python3
"""nightclean: protects the working agreement. tools/night/rules.json lists every heading of CLAUDE.md that holds "standing rule" or "standing fact" and
every quoted sentence (40 characters or more) in CLAUDE.md and claude/handoff-rules.md, as taken from main on the day of the build.
This check fails when one of them is missing. A cleanup may shorten the story around a rule; it may never drop the rule or Tom's words.
Usage: python3 tools/night/rules_check.py            check against rules.json
       python3 tools/night/rules_check.py --write    rewrite rules.json from the files now (only when Tom adds a rule: it adds, never removes)
Called by tools/smoke.py."""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
RULES = os.path.join(HERE, 'rules.json')
FILES = ['CLAUDE.md', 'claude/handoff-rules.md']
MINQ = 40


def norm(s):
    return re.sub(r'\s+', ' ', s.replace('“', '"').replace('”', '"').replace('’', "'")).strip()


def scan(root=ROOT):
    """Returns {'headings': [...], 'quotes': {file: [...]}} for the files under root."""
    out = {'headings': [], 'quotes': {}}
    for f in FILES:
        p = os.path.join(root, f)
        txt = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if f == 'CLAUDE.md':
            for line in txt.splitlines():
                if re.match(r'#{1,6} ', line) and re.search(r'standing (rule|fact)', line, re.I): out['headings'].append(norm(line))
        qs = []
        for q in re.findall(r'"([^"\n]{%d,}?)"' % MINQ, txt.replace('“', '"').replace('”', '"')):
            q = norm(q)
            if q not in qs: qs.append(q)
        out['quotes'][f] = qs
    return out


def check(rules, root=ROOT):
    """Returns the list of missing items (empty when the working agreement is whole)."""
    now = scan(root)
    bad = []
    for h in rules['headings']:
        if h not in now['headings']: bad.append('missing heading: ' + h)
    for f, qs in rules['quotes'].items():
        p = os.path.join(root, f)
        body = norm(open(p, encoding='utf-8').read()) if os.path.exists(p) else ''
        for q in qs:
            if q not in body: bad.append('missing quote in %s: "%s"' % (f, q[:90]))
    return bad


def main(argv):
    if '--write' in argv:
        now = scan()
        try: old = json.load(open(RULES, encoding='utf-8'))
        except (OSError, ValueError): old = {'headings': [], 'quotes': {}}
        for h in now['headings']:
            if h not in old['headings']: old['headings'].append(h)
        for f, qs in now['quotes'].items():
            have = old['quotes'].setdefault(f, [])
            for q in qs:
                if q not in have: have.append(q)
        old['about'] = 'Taken from main by tools/night/rules_check.py --write. A cleanup may shorten the story around a rule, never drop a heading or a quote listed here.'
        json.dump(old, open(RULES, 'w', encoding='utf-8'), indent=1, ensure_ascii=False); open(RULES, 'a').write('\n')
        print('rules.json: %d headings, %d quotes' % (len(old['headings']), sum(len(v) for v in old['quotes'].values())))
        return 0
    rules = json.load(open(RULES, encoding='utf-8'))
    bad = check(rules)
    if bad:
        print('rules_check FAIL: the working agreement dropped %d rule or quote(s):' % len(bad)); [print(' ', b) for b in bad]; return 1
    print('rules_check ok: %d headings, %d quotes kept' % (len(rules['headings']), sum(len(v) for v in rules['quotes'].values())))
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
