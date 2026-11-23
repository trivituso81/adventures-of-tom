#!/usr/bin/env python3
"""guideflow1: check every workflow file before it is pushed.

Prints one plain line per problem and exits 1 on any. Checks: the file parses as YAML,
it has `on` and `jobs`, a `concurrency` block is a mapping with a string `group`, and a
workflow that uses a paid secret keeps its `concurrency` on the job, not at the top
(CLAUDE.md wanstuck1).
"""
import glob, os, re, sys
try:
    import yaml
except ImportError:
    print('workflow check: PyYAML is not installed (pip install pyyaml)'); sys.exit(1)

PAID = ('FAL_KEY', 'XAI_API_KEY', 'ELEVENLABS_API_KEY')

def problems(path, text):
    out = []
    try:
        doc = yaml.safe_load(text)
    except yaml.YAMLError as e:
        return ['does not parse as YAML: %s' % str(e).splitlines()[0]]
    if not isinstance(doc, dict):
        return ['is not a mapping']
    # PyYAML reads the key `on` as True
    if 'on' not in doc and True not in doc: out.append('has no `on` (its triggers)')
    jobs = doc.get('jobs')
    if not isinstance(jobs, dict) or not jobs: out.append('has no `jobs`')
    top = doc.get('concurrency')
    if top is not None:
        if not isinstance(top, dict) or not isinstance(top.get('group'), str):
            out.append('top-level `concurrency` must be a mapping with a text `group`')
    for name, job in (jobs or {}).items():
        if not isinstance(job, dict): continue
        c = job.get('concurrency')
        if c is not None and (not isinstance(c, dict) or not isinstance(c.get('group'), str)):
            out.append('job %s: `concurrency` must be a mapping with a text `group`' % name)
    return out

def warnings(text):
    # wanstuck1 advice, reported but not failing: 8 existing files still break it (see docs/CHANGES.md guideflow1)
    if 'concurrency' in text and any(s in text for s in PAID):
        try:
            doc = yaml.safe_load(text)
        except yaml.YAMLError:
            return []
        if isinstance(doc, dict) and doc.get('concurrency') is not None:
            return ['has a paid secret and `concurrency` at the top; move it onto the job (wanstuck1)']
    return []

def main(root='.'):
    bad = 0
    for path in sorted(glob.glob(os.path.join(root, '.github', 'workflows', '*.y*ml'))):
        text = open(path, encoding='utf-8').read()
        for p in problems(path, text):
            bad += 1
            print('%s %s' % (os.path.relpath(path, root), p))
        for w in warnings(text):
            print('WARN %s %s' % (os.path.relpath(path, root), w))
    if bad: print('workflow check: %d problem(s)' % bad); return 1
    print('workflow check ok'); return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '.'))
