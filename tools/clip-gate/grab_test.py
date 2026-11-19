#!/usr/bin/env python3
"""Test of tools/clip-gate/grab.py on three real clips (about 2 minutes; needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH):
tom-give is steady in the game (no flag: the "size pulses" note is not in the pictures or the switch), grace-give and tom-victory
grow in the game's own drawing (flagged; tom-victory ends 15% bigger than the stance and pops back)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import grab
fails = []
def check(n, ok, info=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else ' ' + str(info)))
    if not ok: fails.append(n)
r = grab.grab('clip-tom-give'); check('tom-give: steady, no flag', not r['flag'] and all(abs(v - 1) < .03 for v in r['ratios'].values() if v), r['ratios'])
r = grab.grab('clip-grace-give'); check('grace-give: grows in the game, flagged', 'switch' in r['flag'] and r['ratios']['clip_max'] > 1.1, r['ratios'])
r = grab.grab('clip-tom-victory'); check('tom-victory: grows and pops back, flagged', 'switch' in r['flag'] and r['ratios']['clip_last'] > 1.1 and abs(r['ratios']['stance_after'] - 1) < .03, r['ratios'])
print('FAILS:', fails); sys.exit(1 if fails else 0)
