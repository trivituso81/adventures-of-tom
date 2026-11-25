#!/usr/bin/env python3
"""guideflow1: checks every file in .github/workflows/ before a push (the startpics12 mistake, an unquoted colon in a group name, broke a workflow).
Rules: loads with yaml.safe_load; has `on` and `jobs`; every `concurrency` is a mapping (or a string) whose `group` is a string; in a workflow that uses
FAL_KEY, XAI_API_KEY or ELEVENLABS_API_KEY a `concurrency` sits on the job, never at the top of the file (CLAUDE.md wanstuck1).
Run: python3 tools/workflow_check.py [folder]. One line per problem, exit 1 on any."""
import os, sys
try: import yaml
except ImportError: print('workflow_check: PyYAML is missing (pip install pyyaml)'); sys.exit(1)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAID = ('FAL_KEY', 'XAI_API_KEY', 'ELEVENLABS_API_KEY')
# Files that had a top-level concurrency (all with cancel-in-progress: false) before this check existed. The plan says the real folder must pass, so they are
# listed here by name instead of being rewritten blind; a NEW paid workflow gets no such pass. Move one to its job, then delete its name here.
LEGACY_TOP_LEVEL = {'art-factory.yml', 'clip-gate.yml', 'clip-gen.yml', 'costs-sync.yml', 'guide-draft.yml', 'guide-reconcile.yml', 'music-gen.yml', 'night-tests.yml', 'voice-take.yml'}

def conc_problem(c):
    if isinstance(c, str): return None
    if not isinstance(c, dict): return 'concurrency must be a mapping with a group'
    if not isinstance(c.get('group'), str): return 'concurrency group must be a string (an unquoted colon in a group name turns it into a mapping; put the whole name in quotes)'
    return None

def check(folder):
    out = []
    for fn in sorted(os.listdir(folder)):
        if not fn.endswith(('.yml', '.yaml')): continue
        txt = open(os.path.join(folder, fn), encoding='utf-8').read()
        try: d = yaml.safe_load(txt)
        except Exception as e: out.append('%s: the file does not load as YAML (%s)' % (fn, str(e).splitlines()[0] if str(e) else e)); continue
        if not isinstance(d, dict): out.append('%s: the file is not a workflow (no mapping at the top)' % fn); continue
        if 'on' not in d and True not in d: out.append('%s: no `on` section' % fn)   # YAML reads a bare `on` as True
        if not isinstance(d.get('jobs'), dict): out.append('%s: no `jobs` section' % fn)
        paid = any(k in txt for k in PAID)
        if 'concurrency' in d:
            p = conc_problem(d['concurrency'])
            if p: out.append('%s: %s' % (fn, p))
            if paid and fn not in LEGACY_TOP_LEVEL: out.append('%s: uses a paid secret, so its concurrency must be on the job, not at the top of the file' % fn)
        for j, jd in (d.get('jobs') or {}).items():
            if isinstance(jd, dict) and 'concurrency' in jd:
                p = conc_problem(jd['concurrency'])
                if p: out.append('%s: job %s: %s' % (fn, j, p))
    return out

def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '.github', 'workflows')
    probs = check(folder)
    for p in probs: print('workflow_check: ' + p)
    if not probs: print('workflow_check: all workflow files are fine')
    return 1 if probs else 0

if __name__ == '__main__': sys.exit(main())
