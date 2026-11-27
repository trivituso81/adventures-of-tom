#!/usr/bin/env python3
"""Takes the pictures of the Move Workbench mock. Usage, from the repo root (CHROMIUM set as for the other page tests):
   python3 claude/movebench-mock/src/build.py && python3 claude/movebench-mock/src/shoot.py
Writes claude/movebench-mock/shots/<name>-<width>x<height>.jpg for the four Duo sizes (docs/DUO.md), <name>-466x657-editing.jpg (the small
player while a setting is changed), <name>-phone-whole-page.jpg (the phone page at full length) and <name>-3440x1440.jpg (a pane of the Admin Dashboard)."""
import os, sys
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, 'shots'); os.makedirs(OUT, exist_ok=True)
SIZES = [(466, 657), (678, 445), (951, 648), (669, 869)]
ONLY = sys.argv[1:]
with sync_playwright() as pw:
    kw = {'args': ['--headless=new', '--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path'] = os.environ['CHROMIUM']
    br = pw.chromium.launch(**kw)
    for name in ('basic', 'skill', 'capstone', 'monster'):
        if ONLY and name not in ONLY: continue
        for w, h in SIZES:
            pg = br.new_page(viewport={'width': w, 'height': h}, device_scale_factor=2)
            pg.goto('file://' + os.path.join(HERE, name + '.html')); pg.wait_for_timeout(200)
            pg.screenshot(path=os.path.join(OUT, '%s-%dx%d.jpg' % (name, w, h)), type='jpeg', quality=82); pg.close()
        pg = br.new_page(viewport={'width': 466, 'height': 657}, device_scale_factor=2)
        pg.goto('file://' + os.path.join(HERE, name + '-editing.html')); pg.wait_for_timeout(200)
        pg.screenshot(path=os.path.join(OUT, '%s-466x657-editing.jpg' % name), type='jpeg', quality=82); pg.close()
        pg = br.new_page(viewport={'width': 466, 'height': 657}, device_scale_factor=2)
        pg.goto('file://' + os.path.join(HERE, name + '-long.html')); pg.wait_for_timeout(200)
        pg.screenshot(path=os.path.join(OUT, '%s-phone-whole-page.jpg' % name), type='jpeg', quality=80, full_page=True); pg.close()
        pg = br.new_page(viewport={'width': 3440, 'height': 1440})
        pg.goto('file://' + os.path.join(HERE, 'dash-' + name + '.html')); pg.wait_for_timeout(500)
        pg.screenshot(path=os.path.join(OUT, '%s-3440x1440.jpg' % name), type='jpeg', quality=84); pg.close()
        print('shot', name)
    br.close()
