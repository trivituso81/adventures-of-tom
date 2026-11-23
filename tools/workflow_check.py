#!/usr/bin/env python3
"""guideflow1: checks every file in .github/workflows/ before a push, so a broken job file can never be pushed again (startpics12: an unquoted colon in a group name).
Problems, one plain line each (exit 1 on any):
  - the file does not load with yaml.safe_load, or has no `on` or no `jobs`
  - a `concurrency` that is not a mapping whose `group` is a string
  - a workflow that uses FAL_KEY, XAI_API_KEY or ELEVENLABS_API_KEY and runs on push, with `concurrency` at the top of the file (wanstuck1: at workflow level an
    unrelated push cancels a waiting paid run; it belongs on the job)
KNOWN_TOP are the paid workflows that already had a top level group when this check was written; they stay as they are (changing a running paid job's group is its own
card) and a new workflow is never added here. guide-use.yml has none of those secrets and so is never in question.
Run: python3 tools/workflow_check.py [folder]"""
import os, re, sys
import yaml
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRETS = ('FAL_KEY', 'XAI_API_KEY', 'ELEVENLABS_API_KEY')
KNOWN_TOP = {'clip-gen.yml', 'music-gen.yml', 'voice-take.yml', 'guide-reconcile.yml'}

def check(folder):
    out = []
    for f in sorted(os.listdir(folder)):
        if not f.endswith(('.yml', '.yaml')): continue
        text = open(os.path.join(folder, f), encoding='utf-8').read()
        try: d = yaml.safe_load(text)
        except yaml.YAMLError as e:
            out.append('%s: the file does not load as YAML (%s)' % (f, str(e).splitlines()[0] if str(e) else 'error')); continue
        if not isinstance(d, dict): out.append('%s: the file is not a workflow (no mapping at the top)' % f); continue
        on = d['on'] if 'on' in d else d.get(True)   # YAML reads a bare `on` as True
        if on is None: out.append('%s: the workflow has no `on` (what starts it)' % f)
        if not d.get('jobs'): out.append('%s: the workflow has no `jobs`' % f)
        conc = [('the top of the file', d['concurrency'])] if 'concurrency' in d else []
        for jn, j in (d.get('jobs') or {}).items():
            if isinstance(j, dict) and 'concurrency' in j: conc.append(('job %s' % jn, j['concurrency']))
        for where, c in conc:
            if not isinstance(c, dict) or not isinstance(c.get('group'), str):
                out.append('%s: `concurrency` at %s must be a mapping with a text `group` (quote a group name that has a colon)' % (f, where))
        pushes = on == 'push' or (isinstance(on, (dict, list)) and 'push' in on)
        if 'concurrency' in d and pushes and any(re.search(r'\b%s\b' % s, text) for s in SECRETS) and f not in KNOWN_TOP:
            out.append('%s: this workflow uses a paid secret and runs on push, so `concurrency` must be on the job, not at the top of the file' % f)
    return out

if __name__ == '__main__':
    folder = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '.github', 'workflows')
    bad = check(folder)
    for b in bad: print('PROBLEM ' + b)
    print('workflow check: ' + ('%d problem(s)' % len(bad) if bad else 'all %d files fine' % len([x for x in os.listdir(folder) if x.endswith(('.yml', '.yaml'))])))
    sys.exit(1 if bad else 0)
