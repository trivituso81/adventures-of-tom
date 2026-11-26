#!/usr/bin/env python3
"""hidebf1 test (python3 tools/hidebf_test.py [outdir]): Art Library > "Hide painted battleframes" is ticked by default and then no battle-frame entry
(party battle stance sheets, young Boppy battle sheets, every -ab- ability frame sheet) appears in the list, the search or the tab counts; unticking brings them
all back; the choice survives a reload; a ?open= link to a battle frame unticks the box. Prints FAILS: []."""
import json, os, re, subprocess, sys, time
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hidebf'; os.makedirs(out, exist_ok=True)
fails = []
es = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json'), encoding='utf-8'))['entries']
BF = re.compile(r'-ab-|-battle-stance-\d|-battle-sheet-\d')
bf = [e for e in es if e['tab'] == 'Characters' and BF.search(e['id'])]; chars = [e for e in es if e['tab'] == 'Characters']
if len(bf) < 100: fails.append('expected 100+ battle-frame entries, found %d' % len(bf))
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8096'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(2)
H = 'http://127.0.0.1:8096/'
JS_ROWS = "()=>[...document.querySelectorAll('.item')].map(x=>x.dataset.id)"
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        pg = br.new_context(viewport={'width': 390, 'height': 844}).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(H + 'art.html'); pg.wait_for_selector('#hidebf'); pg.wait_for_timeout(800)
        if not pg.is_checked('#hidebf'): fails.append('box is not ticked by default')
        if 'Hide painted battleframes' not in pg.inner_text('#hidebfrow'): fails.append('label text')
        def tabtxt(): return pg.evaluate("()=>{const t=[...document.querySelectorAll('#tabs .tab')].find(x=>x.textContent.startsWith('Characters'));return t&&t.textContent}")
        def count_all():  # open every group of the Characters tab with filter All, return the ids drawn
            pg.click('#filters [data-filter="all"]'); pg.wait_for_timeout(200)
            for _ in range(60):
                g = pg.query_selector('.gh:not(.open)')
                if not g: break
                g.click(); pg.wait_for_timeout(30)
            return pg.evaluate(JS_ROWS)
        pg.click('#tabs [data-tab="Characters"]'); pg.wait_for_timeout(200)
        rows = count_all()
        hidden_seen = [i for i in rows if BF.search(i)]
        if hidden_seen: fails.append('battle frames visible while ticked: %s' % hidden_seen[:5])
        if len(rows) != len(chars) - len(bf): fails.append('rows %d, want %d' % (len(rows), len(chars) - len(bf)))
        m = re.search(r'/(\d+)', tabtxt() or ''); 
        if not m or int(m.group(1)) != len(chars) - len(bf): fails.append('tab count %s' % tabtxt())
        pg.screenshot(path=out + '/ticked.png')
        # search must not find a hidden entry
        pg.fill('#q', bf[0]['id']); pg.wait_for_timeout(300)
        if pg.evaluate(JS_ROWS) and bf[0]['id'] in pg.evaluate(JS_ROWS): fails.append('search shows a hidden battle frame')
        pg.fill('#q', ''); pg.wait_for_timeout(200)
        # reload keeps it ticked, untick shows all
        pg.reload(); pg.wait_for_selector('#hidebf'); pg.wait_for_timeout(500)
        if not pg.is_checked('#hidebf'): fails.append('ticked state lost on reload')
        pg.uncheck('#hidebf'); pg.wait_for_timeout(300)
        rows = count_all()
        if len(rows) != len(chars): fails.append('unticked rows %d, want %d' % (len(rows), len(chars)))
        pg.screenshot(path=out + '/unticked.png')
        pg.reload(); pg.wait_for_selector('#hidebf'); pg.wait_for_timeout(500)
        if pg.is_checked('#hidebf'): fails.append('unticked state lost on reload')
        pg.check('#hidebf'); pg.wait_for_timeout(200)
        # a link to a battle frame unticks the box and shows it
        pg.goto(H + 'art.html?open=' + bf[0]['id']); pg.wait_for_selector('.item.linked', timeout=5000); pg.wait_for_timeout(300)
        if pg.is_checked('#hidebf'): fails.append('open link did not untick the box')
        if errs: fails.append('page errors %s' % errs[:3])
        br.close()
finally:
    srv.terminate()
print('battle frames hidden:', len(bf), 'of', len(chars), 'Characters entries')
print('FAILS:', fails); sys.exit(1 if fails else 0)
