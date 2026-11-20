#!/usr/bin/env python3
"""cardlinks1 test (python3 tools/cardlinks_test.py [outdir]): the board shows an Open in the ... Library button with the right address for each kind of
link, and each Library page opens and scrolls to a real entry (ids picked from the repo data now), at 390 px; an unknown id says so. Prints FAILS: []."""
import json, os, subprocess, sys, time, urllib.parse
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/cardlinks'; os.makedirs(out, exist_ok=True)
fails = []
art = json.load(open(os.path.join(ROOT, 'data', 'art-prompts.json'), encoding='utf-8'))['entries']
e0 = next(e for e in art if e['tab'] != 'Clips' and e['status'] == 'approved'); e1 = next(e for e in art if e['tab'] == e0['tab'] and e['id'] != e0['id'])
vox = json.load(open(os.path.join(ROOT, 'data', 'voice-index.json'), encoding='utf-8'))
vit = next(i for i in vox['items'] if i['t'] == 'd' and i['c'] and not i.get('dup')); vkey = ('d|' if vit['t'] == 'd' else 'b|') + vit['v'] + '|' + vit['x']
vch = vit['c'][0]
trk = json.load(open(os.path.join(ROOT, 'data', 'music-index.json'), encoding='utf-8'))['tracks'][-1]['id']
b = json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
def tc(i, **kw):
    d = {'id': i, 'lane': 'tom', 'col': 'up', 'theme': 'Tools', 'title': 'Link card ' + i, 'next': 'Open it.', 'blocks': [], 'fyi': True, 'changed': '2026-11-20', 'created': '2026-11-20', 'ask': 'play', 'chat': {'url': '', 'opening': 'x'}, 'history': []}
    d.update(kw); return d
b['cards'] += [tc('t-la', links=[{'to': 'art', 'ids': [e0['id'], e1['id']], 'label': 'two pictures'}]),
               tc('t-lv', links=[{'to': 'voice', 'ids': [vkey], 'label': 'one line'}, {'to': 'voice', 'ids': {'chapter': vch, 'show': 'none'}, 'label': 'no clip yet'}]),
               tc('t-lm', links=[{'to': 'music', 'ids': [trk], 'label': 'a track'}]),
               tc('t-ln', next='Nothing to open.')]
srv = subprocess.Popen([sys.executable, os.path.join(HERE, 'serve.py'), '8095'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(2)
H = 'http://127.0.0.1:8095/'
try:
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        pg = br.new_context(viewport={'width': 390, 'height': 844}).new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/data/board.json*', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(b)))
        pg.goto(H + 'board.html'); pg.wait_for_selector('.card[data-id="t-la"]'); pg.wait_for_timeout(400)
        def hrefs(i): return pg.locator('.card[data-id="%s"]' % i).first.locator('a.lnk').evaluate_all('e=>e.map(x=>[x.textContent,x.getAttribute("href")])')   # a card shows in two views; the first is enough
        got = hrefs('t-la'); want = 'art.html?open=%s,%s' % (e0['id'], e1['id'])
        if got != [['Open in the Art Library: two pictures', want]]: fails.append('art link %s' % got)
        got = hrefs('t-lv')
        if got != [['Open in the Voice Library: one line', 'voices.html?line=' + urllib.parse.quote(vkey, safe='')], ['Open in the Voice Library: no clip yet', 'voices.html?chapter=%s&show=none' % vch]]: fails.append('voice links %s' % got)
        if hrefs('t-lm') != [['Open in the Music Library: a track', 'music.html?track=' + trk]]: fails.append('music link %s' % hrefs('t-lm'))
        if hrefs('t-ln'): fails.append('a card with no link shows a button')
        if not hrefs('t-heistart'): fails.append('t-heistart has no automatic Art Library button (done_when.art_approved)')
        pg.click('.card[data-id="t-la"] .t'); pg.wait_for_selector('#sheet a.lnk')
        if pg.eval_on_selector_all('#sheet a.lnk', 'e=>e.length') != 1: fails.append('sheet link missing')
        pg.screenshot(path=out + '/board-sheet.png')
        pg.goto(H + 'board.html'); pg.wait_for_selector('.card[data-id="t-la"]'); pg.locator('.card[data-id="t-la"]').first.scroll_into_view_if_needed(); pg.screenshot(path=out + '/board-list.png')
        # art.html?open=
        pg.goto(H + 'art.html?open=%s,%s' % (e0['id'], e1['id'])); pg.wait_for_selector('.item.linked'); pg.wait_for_timeout(500)
        st = pg.evaluate("""(a)=>({tab:document.querySelector('.tab.on')&&document.querySelector('.tab.on').textContent,open:a.map(i=>{const el=document.querySelector('.item[data-id="'+i+'"]');return !!el&&el.querySelector('.card')!=null}),top:Math.round(document.querySelector('.item.linked').getBoundingClientRect().top)})""", [e0['id'], e1['id']])
        if not st['tab'].startswith(e0['tab']): fails.append('art tab %s' % st)
        if not all(st['open']): fails.append('art entries not open %s' % st)
        if not (0 <= st['top'] < 300): fails.append('art not scrolled to the entry %s' % st)
        pg.screenshot(path=out + '/art-open.png')
        pg.goto(H + 'art.html?open=no-such-entry'); pg.wait_for_timeout(1200)
        if 'does not have' not in pg.inner_text('#toast') if pg.query_selector('#toast') else True: fails.append('art unknown id shows no message')
        # voices.html
        pg.goto(H + 'voices.html?line=' + urllib.parse.quote(vkey, safe='')); pg.wait_for_selector('.row.linked'); pg.wait_for_timeout(800)
        top = pg.evaluate("document.querySelector('.row.linked').getBoundingClientRect().top"); op = pg.evaluate("document.querySelector('.row.linked').classList.contains('open')")
        if not op or not (-5 <= top < 300): fails.append('voice line not open/scrolled: open=%s top=%s' % (op, top))
        pg.screenshot(path=out + '/voice-line.png')
        pg.goto(H + 'voices.html?chapter=%s&show=none' % vch); pg.wait_for_selector('#fShow .chip.on'); pg.wait_for_timeout(600)
        on = pg.eval_on_selector_all('#fShow .chip.on, #fChap .chip.on', 'e=>e.map(x=>x.textContent)')
        if not any(x.startswith('No clip yet') for x in on) or not any(x.startswith('Ch %s' % vch) for x in on): fails.append('voice filters %s' % on)
        pg.screenshot(path=out + '/voice-filter.png')
        pg.goto(H + 'voices.html?line=nope'); pg.wait_for_selector('#linkmsg'); 
        if 'does not have' not in pg.inner_text('#linkmsg'): fails.append('voice unknown line message')
        # music.html
        pg.goto(H + 'music.html?track=' + trk); pg.wait_for_selector('.card.linked'); pg.wait_for_timeout(500)
        top = pg.evaluate("document.querySelector('.card.linked').getBoundingClientRect().top")
        if not (-5 <= top < 300): fails.append('music not scrolled: %s' % top)
        pg.screenshot(path=out + '/music-track.png')
        pg.goto(H + 'music.html?track=nope'); pg.wait_for_timeout(800)
        if 'does not have' not in pg.inner_text('#toast'): fails.append('music unknown track message')
        if errs: fails.append('page errors %s' % errs[:3])
        br.close()
finally:
    srv.terminate()
print('FAILS:', fails); sys.exit(1 if fails else 0)
