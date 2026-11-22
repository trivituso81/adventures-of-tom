#!/usr/bin/env python3
"""voicefast1: each ElevenLabs/music Action checks out only the files its sparse-checkout lists. This copies exactly those paths into an empty folder and
starts the job's script there with --help, so a new import in a shared module (falq, costlog) that the list lacks fails here, not on a runner.
Run: python3 tools/voice-library/sparse_files_test.py"""
import os, re, shutil, subprocess, sys, tempfile
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
JOBS = [('.github/workflows/voice-take.yml', 'tools/voice-library/voicetake.py'), ('.github/workflows/music-gen.yml', 'tools/music-library/musicgen.py')]
bad = 0
for wf, script in JOBS:
    txt = open(os.path.join(ROOT, wf)).read()
    m = re.search(r'sparse-checkout: \|\n((?:\s+/\S*\n)+)', txt)
    paths = [p.strip() for p in m.group(1).splitlines()] if m else []
    tmp = tempfile.mkdtemp()
    for p in paths:
        src = os.path.join(ROOT, p.lstrip('/'))
        dst = os.path.join(tmp, p.lstrip('/'))
        if os.path.isdir(src): shutil.copytree(src, dst, dirs_exist_ok=True)
        elif os.path.exists(src): os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy(src, dst)
    r = subprocess.run([sys.executable, '-I', os.path.join(tmp, script), '--help'], cwd=tmp, capture_output=True, text=True, timeout=60)
    ok = r.returncode == 0 and 'Traceback' not in r.stderr
    print(('PASS' if ok else 'FAIL'), wf, '' if ok else r.stderr.strip().splitlines()[-1])
    bad += 0 if ok else 1
    shutil.rmtree(tmp, ignore_errors=True)
sys.exit(1 if bad else 0)
