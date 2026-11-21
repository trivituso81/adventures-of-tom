#!/usr/bin/env python3
"""rules_check (nightclean, claude/night-plan.md section 7 step 2): no standing rule and no sentence of Tom's is ever dropped from the working agreement.
tools/night/rules.json holds, taken from main on 2026-11-21: every heading of CLAUDE.md that says "standing rule" or "standing fact", every bold lead
(`**name (date)`) of CLAUDE.md, and every quoted sentence (30+ characters between straight double quotes) of CLAUDE.md and claude/handoff-rules.md.
A cleanup may shorten the story around a rule; it may never drop the rule or Tom's words. This fails when one is missing.
Usage: python3 tools/night/rules_check.py            check (smoke.py calls it)
       python3 tools/night/rules_check.py --add      add what the files hold now (a new rule or quote); never removes a row
       python3 tools/night/rules_check.py --root DIR --rules FILE   (tests)"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
FILES = ('CLAUDE.md', 'claude/handoff-rules.md')

def norm(s): return re.sub(r'\s+', ' ', s).strip()

def harvest(root):
    out = {'headings': [], 'leads': [], 'quotes': {}}
    for f in FILES:
        t = open(os.path.join(root, f), encoding='utf-8').read()
        out['quotes'][f] = sorted({norm(q) for q in re.findall(r'"([^"\n]{30,}?)"', t)})
        if f == 'CLAUDE.md':
            for m in re.finditer(r'^(#{1,4} .*)$', t, re.M):
                if re.search(r'standing (rule|fact)', m.group(1)): out['headings'].append(norm(m.group(1)))
            out['leads'] = [m.group(1) for m in re.finditer(r'^\*\*([A-Za-z0-9]+ \(\d{4}-\d\d-\d\d\))', t, re.M)]
    return out

def check(root, rules):
    miss = []
    t = open(os.path.join(root, 'CLAUDE.md'), encoding='utf-8').read()
    heads = {norm(m.group(1)) for m in re.finditer(r'^(#{1,4} .*)$', t, re.M)}
    leads = {m.group(1) for m in re.finditer(r'^\*\*([A-Za-z0-9]+ \(\d{4}-\d\d-\d\d\))', t, re.M)}
    for h in rules['headings']:
        if h not in heads: miss.append('heading gone: ' + h)
    for l in rules['leads']:
        if l not in leads: miss.append('rule lead gone: ' + l)
    for f, qs in rules['quotes'].items():
        body = norm(open(os.path.join(root, f), encoding='utf-8').read())
        for q in qs:
            if q not in body: miss.append('Tom quote gone from %s: "%s"' % (f, q[:80]))
    return miss

def main(argv):
    root, rp = ROOT, os.path.join(HERE, 'rules.json')
    if '--root' in argv: root = argv[argv.index('--root') + 1]
    if '--rules' in argv: rp = argv[argv.index('--rules') + 1]
    now = harvest(root)
    if '--add' in argv:
        try: rules = json.load(open(rp, encoding='utf-8'))
        except OSError: rules = {'headings': [], 'leads': [], 'quotes': {}}
        for k in ('headings', 'leads'):
            rules[k] = rules[k] + [x for x in now[k] if x not in rules[k]]
        for f, qs in now['quotes'].items():
            have = rules['quotes'].setdefault(f, [])
            have += [q for q in qs if q not in have]
        json.dump(rules, open(rp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False); print('rules.json written:', len(rules['headings']), 'headings,', len(rules['leads']), 'leads,', sum(len(v) for v in rules['quotes'].values()), 'quotes')
        return 0
    rules = json.load(open(rp, encoding='utf-8'))
    miss = check(root, rules)
    for m in miss: print('FAIL ' + m)
    print('rules_check: %s (%d headings, %d leads, %d quotes)' % ('FAILED' if miss else 'ok', len(rules['headings']), len(rules['leads']), sum(len(v) for v in rules['quotes'].values())))
    return 1 if miss else 0

if __name__ == '__main__': sys.exit(main(sys.argv[1:]))
