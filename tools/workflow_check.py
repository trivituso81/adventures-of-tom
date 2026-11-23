#!/usr/bin/env python3
"""guideflow1: check every file in .github/workflows/ before a push.
Each file must load as YAML, have `on` and `jobs`, and every `concurrency` must be a mapping whose `group` is a string.
In a workflow that uses a paid secret (FAL_KEY, XAI_API_KEY, ELEVENLABS_API_KEY) a `concurrency` sits on the job, never at the top of the file
(CLAUDE.md wanstuck1: at the top, an unrelated push cancels a waiting paid run). guide-use.yml uses none of those secrets.
Usage: python3 tools/workflow_check.py [folder]. Prints one line per problem, exits 1 on any."""
import os, sys, glob
try:
    import yaml
except ImportError:
    print('workflow_check: PyYAML is not installed'); sys.exit(1)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAID = ('FAL_KEY', 'XAI_API_KEY', 'ELEVENLABS_API_KEY')

def conc_problems(name, where, c):
    if not isinstance(c, dict): return ['%s: the concurrency %s must be a block with a group, not a plain value' % (name, where)]
    if not isinstance(c.get('group'), str): return ['%s: the concurrency group %s must be text (an unquoted colon or a missing group turns it into something else)' % (name, where)]
    return []

def check(folder):
    out = []
    files = sorted(glob.glob(os.path.join(folder, '*.yml')) + glob.glob(os.path.join(folder, '*.yaml')))
    for f in files:
        name = os.path.basename(f); text = open(f, encoding='utf-8').read()
        try: doc = yaml.safe_load(text)
        except yaml.YAMLError as e:
            out.append('%s: does not load as YAML (%s)' % (name, str(e).splitlines()[0] if str(e) else 'error')); continue
        if not isinstance(doc, dict): out.append('%s: is not a workflow (no top level block)' % name); continue
        if 'on' not in doc and True not in doc: out.append('%s: has no `on` (nothing starts it)' % name)
        jobs = doc.get('jobs')
        if not isinstance(jobs, dict) or not jobs: out.append('%s: has no `jobs`' % name); continue
        if 'concurrency' in doc:
            out += conc_problems(name, 'at the top of the file', doc['concurrency'])
            if any('secrets.' + k in text for k in PAID) and name != 'guide-use.yml':
                out.append('%s: uses a paid secret, so its concurrency must be on the job, not at the top of the file' % name)
        for jn, j in jobs.items():
            if isinstance(j, dict) and 'concurrency' in j: out += conc_problems(name, 'of job %s' % jn, j['concurrency'])
    return out

if __name__ == '__main__':
    folder = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '.github', 'workflows')
    probs = check(folder)
    for p in probs: print(p)
    print('workflow_check: %s' % ('%d problem(s)' % len(probs) if probs else 'all %d workflow files ok' % len(glob.glob(os.path.join(folder, '*.y*ml')))))
    sys.exit(1 if probs else 0)
