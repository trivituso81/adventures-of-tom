#!/usr/bin/env python3
"""guidestatus1: where a new Battle Guide video is while it is being made, for the Animations list.

  mark(anim, take, stage)   stage: 'line' (the service accepted it and has it waiting), 'making' (the service says it is working on it),
                            'checking' (the video is back: marks, clip gate, preview)

Writes {anims: {<anim>: {take, stage, at}}} to status.json on the branch `guidegen` through keep.py (merged by animation, newest `at` wins), so two jobs
never overwrite each other. 'Requested' (sent, not picked up yet) is read by the page from the request files on main; 'Ready to review' from takes.json.
Off unless GUIDE_STATUS=1 (the workflows set it); GUIDE_STATUS_URL sends it to another remote (tests). A failed mark never stops the job."""
import json, os, sys, tempfile, time, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
STAGES = ('line', 'making', 'checking')
_last = {}


def mark(anim, take, stage):
    if os.environ.get('GUIDE_STATUS') != '1' or stage not in STAGES or _last.get((anim, take)) == stage: return False
    _last[(anim, take)] = stage
    d = tempfile.mkdtemp(prefix='guidestatus-')
    try:
        at = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        json.dump({'anims': {anim: {'take': int(take), 'stage': stage, 'at': at}}}, open(os.path.join(d, 'status.json'), 'w'))
        sys.path.insert(0, HERE); import keep
        url = os.environ.get('GUIDE_STATUS_URL', '')
        return keep.main([d, '--msg', 'guidegen: %s take %s %s [skip ci]' % (anim, take, stage)] + (['--url', url] if url else [])) == 0
    except Exception as x:
        print('status mark failed (the job goes on):', str(x)[:200], flush=True); return False
    finally:
        shutil.rmtree(d, ignore_errors=True)


def fal_stage(s):
    return {'IN_QUEUE': 'line', 'IN_PROGRESS': 'making'}.get(s or '')
