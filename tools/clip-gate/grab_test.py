#!/usr/bin/env python3
"""Test of tools/clip-gate/grab.py on three real clips (about 2 minutes; needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH):
grace-give
grows in the game's own drawing (flagged). (tom-give and tom-victory were measured here until clipposes removed those clips.)"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import grab
fails = []
def check(n, ok, info=''):
    print(('ok   ' if ok else 'FAIL ') + n + ('' if ok else ' ' + str(info)))
    if not ok: fails.append(n)
r = grab.grab('clip-grace-give'); check('grace-give: grows in the game, flagged', 'switch' in r['flag'] and r['ratios']['clip_max'] > 1.1, r['ratios'])
print('FAILS:', fails); sys.exit(1 if fails else 0)
