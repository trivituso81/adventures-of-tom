#!/usr/bin/env python3
"""Tests the word comparison of retext_audit.py (madelot). No audio, no model: python3 -I tools/voice-library/retext_audit_test.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import retext_audit as R

FAILS = []
def check(name, ok):
    print(('ok   ' if ok else 'FAIL ') + name)
    if not ok: FAILS.append(name)

# the same words, written differently: not a difference
check('contractions and numbers fold', R.ratio("I am 6 hours late.", "I'm six hours late.") >= 0.95)
check('Tah Tah is Tata, names Whisper mishears are folded', R.ratio("Tada, Bobby, gray dee dee.", "Tata, Boppy, grey Deedee.") >= 0.95)
check('the script words of a take drop the tags', R.spoken("[calm] Tom, wait. [dry] Go.") == "Tom, wait. Go.")
# real rewordings found in madelot: a difference
check('Deedee reworded', R.ratio("Give me an hour and we'll have 12 more.", "Twelve more. Forty minutes. The first one's still yours.") < 0.9)
check('Tom reworded', R.ratio("On it. Can I borrow a pencil?", "I have a job. Yes. Does the job come with a pencil?") < 0.9)
check('a dropped sentence is a difference', R.ratio("The fish ate them, Boppy.", "The fish ate them, Boppy. The last three.") < 0.9)
# a looped take is a repeat, not a rewording
loop = "Nobody needs to go anywhere. Nobody needs to go anywhere. Nobody needs to get any older."
check('a repeated sentence is found', R.repeats(loop))
check('after dropping the repeat it is the screen line', R.ratio(' '.join(R.dedupe(R.fold(loop))), "Nobody needs to go anywhere. Nobody needs to get any older.") == 1.0)
check('a clean line has no repeat', not R.repeats("Nobody needs to go anywhere. Nobody needs to get any older."))
print('FAILS:', FAILS)
sys.exit(1 if FAILS else 0)
