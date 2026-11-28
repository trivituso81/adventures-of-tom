#!/usr/bin/env python3
"""Test for dashboard.html (dash1, dash2: the strip under the game). Run from the repo root: python3 tools/dashboard_test.py
Own server on 8873; screenshots in tools/shots/dashboard-*.png (look at them: 3440 x 1328 is a maximized Chrome window,
3440 x 1440 is macOS full screen). Plan: claude/dashboard-plan.md. Docs: docs/DASHBOARD.md."""
import os, sys, re, json, subprocess, time
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
PORT = 8873; base = 'http://localhost:%d/' % PORT
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)

def fr(pg, n): return pg.evaluate("(n)=>__DASH.P[n].frame.contentWindow.location.pathname.split('/').pop()", n)
def frfull(pg, n): return pg.evaluate("(n)=>__DASH.P[n].frame.contentWindow.location.href", n)
def box(pg, sel): return pg.evaluate("(s)=>{var r=document.querySelector(s).getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]}", sel)
def put(pg, n, html):
    """Put one link in pane n's page; returns the locator of it (a real click goes through the page like Tom's)."""
    pg.evaluate("([n,h])=>{var d=__DASH.P[n].frame.contentDocument;var o=d.getElementById('__t');if(o)o.remove();var w=d.createElement('div');w.id='__t';w.style.cssText='position:fixed;left:8px;top:8px;z-index:99999;background:#fff;padding:6px';w.innerHTML=h;d.body.appendChild(w);}", [n, html])
    return pg.frame_locator('#pane%d iframe' % n).locator('#__t a')
def wait_loaded(pg, timeout=60000):
    pg.wait_for_function("()=>[1,2,3,4].every(n=>{try{var w=__DASH.P[n].frame.contentWindow;return w.document.readyState==='complete'&&w.location.href!=='about:blank'}catch(e){return false}})&&__DASH.strip()&&document.querySelectorAll('#fl .sb').length>0", timeout=timeout)
    pg.wait_for_function("()=>{var w=__DASH.P[2].frame.contentWindow;try{return w.eval('typeof splash==\"object\"&&splash.active')===true}catch(e){return false}}", timeout=120000)
    pg.wait_for_timeout(2500)


def gcls(pg): return pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className").split()
def gsize(pg): return pg.evaluate("[__DASH.P[2].frame.clientWidth,__DASH.P[2].frame.clientHeight]")
def geval(pg, code): return pg.evaluate("(c)=>__DASH.P[2].frame.contentWindow.eval(c)", code)
def settle(pg, ms=900): pg.wait_for_timeout(ms)

def real_board(): return json.load(open(os.path.join(ROOT, 'data', 'board.json'), encoding='utf-8'))
def open_jump_cards(board):
    """The open Tom play cards that carry a jump (the same rule as the strip and the Board pane: not Done, not Waiting, not in the backlog)."""
    return [c for c in board['cards'] if c.get('lane') == 'tom' and c.get('ask') == 'play' and c.get('col') not in ('done', 'wait') and not c.get('backlog') and c.get('jump')]
def wait_landed(pg, j, timeout=180000):
    """Wait until the game is at the place a jump names: the fight is on screen, or the chapter is up (and the map and flags, when named)."""
    if j.get('fight') == 'lab': cond = "typeof B2==='object'&&B2.active===true&&splash.active===false"
    elif 'fight' in j: cond = "typeof B3==='object'&&B3.active===true&&!!B3.F&&splash.active===false"
    else:
        cond = "typeof STORY==='object'&&STORY.mode==='full'&&STORY.chapter===%s&&splash.active===false&&!!__LE.map" % (21 if j['chapter'] == 'B' else j['chapter'])
        if j.get('map'): cond += "&&__LE.map.id===%s" % json.dumps(j['map'])
        for f in j.get('flags') or []: cond += "&&!!flag(%s)" % json.dumps(f)
    pg.wait_for_function("(c)=>{var w=__DASH.P[2].frame.contentWindow;try{return w.eval(c)===true}catch(e){return false}}", arg=cond, timeout=timeout)
    pg.wait_for_timeout(1200)

def strip_geometry(pg, tag, H, errs):
    """dash2: the strip under the game, as drawn; every screen size; the layouts' columns."""
    ok(not pg.is_visible('#nb'), '%s: no newer-build bar while the game is on the newest build' % tag)
    cols = pg.evaluate("getComputedStyle(document.getElementById('sg')).gridTemplateColumns.split(' ').length")
    ok(cols == 3 and not pg.is_visible('#sc4'), '%s: All four: the strip has three columns' % tag)
    inside = lambda c, ids: pg.evaluate("(a)=>a[1].every(i=>document.getElementById('sc'+a[0]).contains(document.getElementById('s-'+i)))", [c, ids])
    ok(inside(1, ['sizes', 'story', 'diff', 'mrow']) and inside(2, ['chap', 'fights']) and inside(3, ['next', 'keys']), '%s: sizes, story battles, difficulty, mute and report sit in column 1; chapters and fights in column 2; Next for you and the keyboard help in column 3' % tag)
    ok(pg.evaluate("document.getElementById('s-next').getBoundingClientRect().top<document.getElementById('s-keys').getBoundingClientRect().top") and 'next for you, from the board' in pg.inner_text('#s-next').lower(), '%s: Next for you sits above the keyboard help, with its heading as drawn' % tag)
    want_n = min(3, len(open_jump_cards(real_board())))
    ok(pg.evaluate("document.querySelectorAll('#nl .nc').length") == want_n and pg.evaluate("[...document.querySelectorAll('#nl .nc .go')].every(b=>b.textContent.trim()==='Take me there')"), '%s: Next for you lists the open play cards that have a jump, at most three (%d), each with Take me there' % (tag, want_n))
    ok(pg.evaluate("getComputedStyle(document.getElementById('nl')).flexDirection") == 'column', '%s: All four: the Next for you cards are stacked' % tag)
    labels = pg.evaluate("[...document.querySelectorAll('#s-sizes .sb')].map(b=>b.textContent)")
    ok(labels == ['Duo folded, upright466 x 657', 'Duo folded, sideways678 x 445', 'Duo open, sideways951 x 648', 'Duo open, upright669 x 869', 'Desktop wide1600 x 900'], '%s: the five screen sizes are listed (%s)' % (tag, labels))
    ok(pg.evaluate("document.getElementById('sz-os').getAttribute('aria-pressed')") == 'true', '%s: Duo open, sideways is the one in use' % tag)
    ok(pg.evaluate("document.querySelectorAll('#s-chap .sb').length") == 21 and pg.inner_text('#ch-B') == 'BONUS', '%s: chapters 1 to 20 and BONUS' % tag)
    n3 = len(json.load(open(os.path.join(ROOT, 'data', 'battle-lab-index.json')))['b3'])
    ok(pg.evaluate("document.querySelectorAll('#fl .sb.ft').length") == 5 and ('Show all %d test fights' % n3) in pg.inner_text('#ft-more'), '%s: five test fights, then Show all %d test fights' % (tag, n3))
    ok(pg.inner_text('#ft-new0') == 'NEW 1: TWO MUDLINGS', '%s: test fights carry the names from data/battle-lab-index.json' % tag)
    ok(pg.evaluate("document.querySelectorAll('#s-story .sb').length") == 3 and pg.evaluate("document.querySelectorAll('#s-diff .sb').length") == 3 and 'Keyboard.' in pg.inner_text('#s-keys'), '%s: Story battles and Difficulty have three choices each, the keyboard help is there' % tag)
    ok(box(pg, '#pane2 .strip')[1] >= box(pg, '#pane2 .gamewrap')[1] + 648, '%s: the strip sits under the game' % tag)
    ok(box(pg, '#pane2 .strip')[3] >= 280, '%s: the strip is at least 280 tall (%d)' % (tag, box(pg, '#pane2 .strip')[3]))
    pg.screenshot(path=os.path.join(SHOTS, 'dashboard-strip-%d.png' % H), clip={'x': 1008, 'y': 44, 'width': 960, 'height': H - 44})
    # --- every size: the frame, the box around it, the layout the game picks for it
    want = {'fu': ([466, 657], {'duofold'}, {'duo', 'tablet', 'landscape'}), 'fs': ([678, 445], {'duofold', 'landscape'}, {'duo', 'tablet'}),
            'ou': ([669, 869], {'duo', 'tablet'}, {'duofold', 'landscape'}), 'os': ([951, 648], {'duo', 'tablet', 'landscape'}, {'duofold'})}
    for sid in ('fu', 'fs', 'ou', 'os'):
        pg.click('#sz-' + sid); settle(pg)
        size, has, hasnt = want[sid]; c = gcls(pg)
        ok(gsize(pg) == size, '%s: size %s: the game frame is %s (%s)' % (tag, sid, size, gsize(pg)))
        ok(has <= set(c) and not (hasnt & set(c)), '%s: size %s: the game lays out for it (%s)' % (tag, sid, c))
        ok(pg.evaluate("document.getElementById('sz-%s').getAttribute('aria-pressed')" % sid) == 'true' and pg.evaluate("document.querySelectorAll('#s-sizes .sb[aria-pressed=true]').length") == 1, '%s: size %s is the only one marked' % (tag, sid))
        ok(box(pg, '#pane2 .gamewrap')[3] == size[1], '%s: size %s: the box around the game is %d tall' % (tag, sid, size[1]))
        fb = pg.evaluate("(()=>{var r=__DASH.P[2].frame.getBoundingClientRect(),p=document.getElementById('pane2').getBoundingClientRect();return [r.left-p.left,p.right-r.right]})()")
        ok(abs(fb[0] - fb[1]) <= 1, '%s: size %s: the game is centred in its pane (%s)' % (tag, sid, fb))
        ok(box(pg, '#pane2 .strip')[1] >= box(pg, '#pane2 .gamewrap')[1] + size[1] and box(pg, '#pane2 .strip')[3] >= 280, '%s: size %s: the strip sits under the game, %d tall' % (tag, sid, box(pg, '#pane2 .strip')[3]))
        ok(pg.evaluate("(()=>{var g=document.querySelector('#pane2 .gbody');return g.scrollWidth<=g.clientWidth})()") and pg.evaluate("(()=>{var w=__DASH.P[2].frame.contentWindow;return w.document.documentElement.scrollWidth<=w.innerWidth})()"), '%s: size %s: nothing scrolls sideways' % (tag, sid))
        ok({'fu': 'Duo folded, upright', 'fs': 'Duo folded, sideways', 'ou': 'Duo open, upright', 'os': 'Duo open, sideways'}[sid] in pg.inner_text('#pane2 .wh'), '%s: size %s: the pane header names it' % (tag, sid))
        ok(pg.evaluate("localStorage.getItem('le-duo')") is None, '%s: size %s: le-duo is still not set' % (tag, sid))
        if sid == 'ou': pg.screenshot(path=os.path.join(SHOTS, 'dashboard-strip-upright-%d.png' % H))
    # --- fix-dash3-try: a rotate button choice saved by the game (le-layout landscape) must not turn the upright Duo sideways
    geval(pg, "layout.mode='landscape';applyLayout()")
    pg.click('#sz-fs'); settle(pg); pg.click('#sz-fu'); settle(pg)
    ok(gsize(pg) == [466, 657] and 'rotated' not in gcls(pg) and 'landscape' not in gcls(pg) and geval(pg, "layout.mode") == 'auto', '%s: Duo folded, upright stays upright after a saved landscape choice (%s)' % (tag, gcls(pg)))
    geval(pg, "layout.mode='landscape';applyLayout()")   # fix-dash3-try-2: the game itself ignores the saved choice on a ?duo= page
    ok('rotated' not in gcls(pg) and 'landscape' not in gcls(pg), '%s: a ?duo= game page ignores layout.mode landscape (%s)' % (tag, gcls(pg)))
    pg.click('#sz-os'); settle(pg)
    ok(geval(pg, "location.search").count('duo=1') == 1, '%s: the game frame address carries ?duo=1 (%s)' % (tag, geval(pg, "location.search")))
    # --- Desktop wide is the Battle layout; a Duo size picked inside it stays in it
    pg.click('#sz-dw'); settle(pg, 2500)
    ok(pg.evaluate("__DASH.layout()") == 'battle' and [box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3, 4)] == [520, 1600, 860, 420], '%s: Desktop wide switches to the Battle layout' % tag)
    ok(gsize(pg) == [1600, 900] and not ({'duo', 'tablet', 'duofold'} & set(gcls(pg))), '%s: Desktop wide: the game is 1600 x 900 with the Duo off (%s)' % (tag, gcls(pg)))
    ok('duo=0' in geval(pg, "location.search") and 'duo=1' not in geval(pg, "location.search"), '%s: Desktop wide: the game address follows to ?duo=0 (%s)' % (tag, geval(pg, "location.search")))
    cols = pg.evaluate("getComputedStyle(document.getElementById('sg')).gridTemplateColumns.split(' ').length")
    ok(cols == 4 and pg.is_visible('#sc4') and pg.evaluate("document.getElementById('sc4').contains(document.getElementById('s-next'))"), '%s: Battle layout: the strip has four columns, Next for you in the last' % tag)
    ok(pg.evaluate("getComputedStyle(document.getElementById('nl')).flexDirection") == 'row', '%s: Battle layout: the Next for you cards sit side by side' % tag)
    ok(inside(1, ['sizes', 'keys']) and inside(2, ['story', 'diff', 'mrow', 'chap']) and inside(3, ['fights']), '%s: Battle layout: sizes and the keyboard help, then story/difficulty/mute/chapters, then fights' % tag)
    ok(abs(box(pg, '#pane2 .strip')[3] - (H - 44 - 16 - 40 - 900)) <= 1 or box(pg, '#pane2 .strip')[3] >= 280, '%s: Battle layout: the strip is %d tall' % (tag, box(pg, '#pane2 .strip')[3]))
    ok(pg.evaluate("(()=>{var e=document.getElementById('sg');return e.scrollWidth<=e.clientWidth})()"), '%s: Battle layout: the strip does not scroll sideways' % tag)
    pg.screenshot(path=os.path.join(SHOTS, 'dashboard-strip-battle-%d.png' % H), clip={'x': 528, 'y': 44, 'width': 1620, 'height': H - 44})
    pg.click('#sz-ou'); settle(pg, 1500)
    ok(pg.evaluate("__DASH.layout()") == 'battle' and gsize(pg) == [669, 869] and 'duo' in gcls(pg), '%s: a Duo size picked in the Battle layout stays in it' % tag)
    pg.click('#lay-all'); settle(pg, 2500)
    ok(pg.evaluate("__DASH.layout()") == 'all' and pg.evaluate("__DASH.size()") == 'os' and gsize(pg) == [951, 648], '%s: back to All four: Duo open, sideways again' % tag)
    # --- movebench16: the Animations layout (Move Workbench on the wide monitor)
    game_src = geval(pg, "location.pathname")
    pg.click('#lay-anim'); settle(pg, 3000)
    ok(pg.evaluate("__DASH.layout()") == 'anim' and [box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3)] == [420, 951, 1589] and box(pg, '.slot:nth-child(4)')[2] >= 440 - 1, '%s: Animations layout: panes 420, 951, 1589 and 440 (%s)' % (tag, [box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3, 4)]))
    ok(pg.evaluate("__DASH.size()") == 'os' and gsize(pg) == [951, 648] and 'duo' in gcls(pg) and 'duo=1' in geval(pg, "location.search"), '%s: Animations layout: the game stays Duo open, sideways, 951 x 648 (%s)' % (tag, gcls(pg)))
    ok(pg.evaluate("document.getElementById('lay-anim').getAttribute('aria-pressed')") == 'true' and pg.evaluate("document.querySelectorAll('#lay .on, #lay [aria-pressed=true]').length") == 1, '%s: Animations layout: its button is the one marked' % tag)
    ok('Battle Guide: Animations' in pg.inner_text('#pane3 .nm') and pg.evaluate("__DASH.P[3].pane.classList.contains('keys')") and not pg.evaluate("__DASH.P[2].pane.classList.contains('keys')"), '%s: Animations layout: pane 3 is named for it and has the keys' % tag)
    ok(pg.evaluate("/^#anims/.test(__DASH.P[3].frame.contentWindow.location.hash)") and pg.evaluate("__DASH.P[3].frame.contentWindow.location.pathname.endsWith('battle-guide.html')"), '%s: Animations layout: the Battle Guide is on its Animations tab (%s)' % (tag, pg.evaluate("__DASH.P[3].frame.contentWindow.location.hash")))
    ok(pg.evaluate("__DASH.P[4].frame.contentWindow.location.pathname.endsWith('admin.html')") and pg.evaluate("document.getElementById('pane4').querySelector('.nm').textContent") == 'Admin', '%s: Animations layout: pane 4 is Admin' % tag)
    ok(pg.evaluate("(()=>{var e=document.getElementById('sg');return e.scrollWidth<=e.clientWidth})()") and pg.evaluate("document.documentElement.scrollWidth<=innerWidth"), '%s: Animations layout: nothing scrolls sideways' % tag)
    ok(geval(pg, "location.pathname") == game_src, '%s: Animations layout: the game was not restarted' % tag)
    pg.evaluate("__DASH.P[3].frame.contentWindow.openPlayer('move:kettlebell_swing')")
    pg.wait_for_function("()=>{var w=__DASH.P[3].frame.contentWindow;return w.document.body.hasAttribute('data-wbwide')&&w.document.getElementById('sheet').dataset.wide==='1'}", timeout=60000)
    pg.wait_for_timeout(800)
    WB = pg.evaluate("""()=>{var w=__DASH.P[3].frame.contentWindow,d=w.document,r=e=>e.getBoundingClientRect();return {iw:w.innerWidth,detail:r(d.getElementById('detail')).width,sheetLeft:r(d.getElementById('sheet')).left,
      vid:r(d.getElementById('s-video')).left,stg:r(d.getElementById('s-stage')).left,prevW:r(d.getElementById('wbprev')).width,ver:!!d.getElementById('s-versions').closest('#wbprev'),sw:d.documentElement.scrollWidth}}""")
    ok(abs(WB['iw'] - 1589) <= 2 and abs(WB['detail'] - 300) <= 2 and abs(WB['sheetLeft'] - 300) <= 2, '%s: Animations layout: the workbench opens beside a 300 px list in the 1589 px pane (%s)' % (tag, WB))
    ok(WB['stg'] > WB['vid'] + 100 and WB['ver'] and WB['prevW'] >= 400 and WB['sw'] <= WB['iw'] + 1, '%s: Animations layout: preview, two columns of sections and Earlier versions under the preview (%s)' % (tag, WB))
    pg.screenshot(path=os.path.join(SHOTS, 'dashboard-animations-%d.png' % H))
    pg.evaluate("__DASH.P[3].frame.contentWindow.closeSheet()")
    pg.click('#lay-all'); settle(pg, 2500)
    ok(pg.evaluate("__DASH.layout()") == 'all' and [box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3)] == [1000, 951, 829] and pg.evaluate("__DASH.P[3].pane.classList.contains('keys')"), '%s: back to All four from Animations: widths 1000, 951, 829; the keys stay in pane 3' % tag)
    pg.evaluate("__DASH.setKeys(2)")
    pg.screenshot(path=os.path.join(SHOTS, 'dashboard-allfour-after-animations-%d.png' % H))
    ok(not errs, '%s: no page errors in the strip tests %s' % (tag, errs[:3]))

def standin_card(i, title, theme, **kw):
    c = {'id': 't-standin-%s' % i, 'title': title, 'theme': theme, 'lane': 'tom', 'col': 'up', 'ask': 'play', 'fyi': True, 'next': 'Open the game and look at %s.' % title,
         'created': '2026-11-21', 'changed': '2026-11-21', 'history': [{'d': '2026-11-21', 't': 'stand-in'}]}
    c.update(kw); return c
def take_me_there(pg, ctx, errs, board_standin):
    """dash3: each open Tom play card of the real board lands the game on its named place; a stand-in board with three cards (a chapter with a map and a flag, a test fight, a
    chapter), a phone card and cards that must not be listed: the strip lists three, Take me there works from the strip and from the Board pane."""
    real = real_board(); cards = open_jump_cards(real)
    ok(len(cards) >= 1, 'dash3: the real board has at least one open Tom play card with a jump (%s)' % [c['id'] for c in cards])
    ok(not [c['id'] for c in real['cards'] if c.get('lane') == 'tom' and c.get('ask') == 'play' and c.get('col') not in ('done', 'wait') and not c.get('backlog') and not c.get('jump') and c.get('where') != 'phone' and c['id'] not in ('t-dash3-try', 't-dash4-try', 't-movebench-16-try')],
       'dash3: every open Tom play card has a jump or the mark where phone (the two dashboard cards need neither)')
    for c in cards:
        j = c['jump']
        pg.evaluate("(j)=>__DASH.take(j)", j); wait_landed(pg, j)
        if 'fight' in j:
            ix = json.load(open(os.path.join(ROOT, 'data', 'battle-lab-index.json'))); names = {('new', e['i']): e['name'] for e in ix['b3']}; names.update({('lab', e['i']): e['name'] for e in ix['b2']})
            ok(names[(j['fight'], j['i'])] in pg.inner_text('#pane2 .wh') and pg.evaluate("document.getElementById('ft-%s%d')?document.getElementById('ft-%s%d').classList.contains('on'):true" % (j['fight'], j['i'], j['fight'], j['i'])), 'dash3: real card %s: the game is in the named test fight (%s)' % (c['id'], pg.inner_text('#pane2 .wh')))
            party = geval(pg, "B3.F.party.map(u=>u.id).join(',')") if j['fight'] == 'new' else geval(pg, "B2.party.map(u=>u.id).join(',')")
            ok(c['id'] != 't-guardwinplay' or 'tom' in party.split(','), 'dash3: real card %s: Tom is in the party (%s)' % (c['id'], party))
        else:
            ok(geval(pg, "STORY.chapter") == (21 if j['chapter'] == 'B' else j['chapter']), 'dash3: real card %s: the game is in chapter %s' % (c['id'], j['chapter']))
            if j.get('map'): ok(geval(pg, "__LE.map.id") == j['map'], 'dash3: real card %s: the game is on map %s' % (c['id'], j['map']))
        ok(pg.evaluate("__DASH.keys()") == 2, 'dash3: real card %s: the game has the keys' % c['id'])
    # --- stand-in board
    a = standin_card('a', 'Look at the observatory landing', 'Areas', jump={'chapter': 2, 'map': 'observatory', 'flags': ['dash3test']})
    bb = standin_card('b', 'Win the pond fight', 'Battle System', jump={'fight': 'new', 'i': 2})
    cc = standin_card('c', 'Walk chapter 3 from the start', 'Story and Dialogue', jump={'chapter': 3})
    ph = standin_card('p', 'Feel the touch controls', 'Game Shell', where='phone')
    d4 = standin_card('d', 'A fourth card is not listed', 'Tools', jump={'chapter': 4})
    wt = standin_card('w', 'A waiting card is not listed', 'Tools', jump={'chapter': 5}, col='wait', waiting_on='claude')
    bk = standin_card('k', 'A parked card is not listed', 'Tools', jump={'chapter': 6}, backlog={'at': 1, 'from': 'up'})
    ship = {'id': 'c-standin-ship', 'title': 'Built the landing', 'theme': 'Areas', 'lane': 'claude', 'col': 'done', 'done': '2026-11-21', 'tag': 'standin-1', 'after': a['id'], 'next': 'done', 'created': '2026-11-21', 'changed': '2026-11-21', 'history': []}
    board_standin[0] = {'version': 1, 'themes': real['themes'], 'columns': real['columns'], 'lanes': real['lanes'], 'cards': [ph, a, bb, cc, d4, wt, bk, ship], 'sessions': [], 'seen': {}, 'night': {}}
    pg.evaluate("__DASH.reloadBoard()"); pg.wait_for_function("document.querySelectorAll('#nl .nc').length===3", timeout=20000)
    ids = pg.evaluate("[...document.querySelectorAll('#nl .nc')].map(n=>n.getAttribute('data-id'))")
    ok(ids == [a['id'], bb['id'], cc['id']], 'dash3: the strip lists the first three open play cards that have a jump, in board order, and skips the phone, fourth, waiting and parked cards (%s)' % ids)
    ok('build standin-1' in pg.inner_text('#nl .nc:nth-child(1)').lower() and 'areas' in pg.inner_text('#nl .nc:nth-child(1)').lower() and 'play and report' in pg.inner_text('#nl .nc:nth-child(1)').lower(), 'dash3: a strip card shows its theme, Play and report, and the build that hands it to you')
    pg.screenshot(path=os.path.join(SHOTS, 'dashboard-next-1328.png'), clip={'x': 1008, 'y': 700, 'width': 960, 'height': 628})
    pg.click('#nl .nc:nth-child(1) .go'); wait_landed(pg, a['jump'])
    ok(geval(pg, "__LE.map.id") == 'observatory' and geval(pg, "!!flag('dash3test')") and geval(pg, "STORY.chapter") == 2, 'dash3: Take me there from the strip puts the game on the named map in the named chapter with its flag set (%s)' % geval(pg, "__LE.map.id"))
    ok('observatory' in pg.inner_text('#pane2 .wh') and pg.evaluate("__DASH.keys()") == 2, 'dash3: the pane header names the place and the game has the keys')
    pg.click('#nl .nc:nth-child(2) .go'); wait_landed(pg, bb['jump'])
    ok('NEW 3: POND GRUMP AND MUDLING' in pg.inner_text('#pane2 .wh') and 'ON SCREEN' in pg.inner_text('#ft-new2'), 'dash3: Take me there from the strip opens the named test fight and marks it ON SCREEN')
    pg.click('#nl .nc:nth-child(3) .go'); wait_landed(pg, cc['jump'])
    ok(geval(pg, "STORY.chapter") == 3, 'dash3: Take me there from the strip opens the named chapter')
    # --- the Board pane: Take me there on the card, only inside the dashboard; On your phone on the phone card
    pg.evaluate("__DASH.P[1].frame.contentWindow.location.reload()")
    bf = pg.frame_locator('#pane1 iframe')
    bf.locator('.card[data-id="%s"]' % cc['id']).first.wait_for(timeout=30000)
    ok(bf.locator('[data-act=goto]').count() == 4 and bf.locator('.card[data-id="%s"] [data-act=goto]' % ph['id']).count() == 0, 'dash3: the Board pane shows Take me there on every open play card that has a jump (4) and not on the phone card')
    ok(bf.locator('.card[data-id="%s"] .onphone' % ph['id']).count() == 1 and 'on your phone' in bf.locator('.card[data-id="%s"] .onphone' % ph['id']).inner_text().lower(), 'dash3: the phone card shows On your phone')
    ok(bf.locator('.card[data-id="%s"] [data-act=goto]' % wt['id']).count() == 0 and bf.locator('.card[data-id="%s"] [data-act=goto]' % bk['id']).count() == 0, 'dash3: a waiting or parked card has no Take me there')
    pg.screenshot(path=os.path.join(SHOTS, 'dashboard-board-take-1328.png'), clip={'x': 8, 'y': 44, 'width': 1000, 'height': 700})
    bf.locator('.card[data-id="%s"] [data-act=goto]' % bb['id']).click(); wait_landed(pg, bb['jump'])
    ok('NEW 3: POND GRUMP AND MUDLING' in pg.inner_text('#pane2 .wh') and pg.evaluate("__DASH.keys()") == 2, 'dash3: Take me there on the card in the Board pane opens the named test fight and gives the game the keys')
    bf.locator('.card[data-id="%s"] [data-act=goto]' % a['id']).click(); wait_landed(pg, a['jump'])
    ok(geval(pg, "__LE.map.id") == 'observatory', 'dash3: Take me there on the card in the Board pane puts the game on the named map')
    # --- the Board on its own (not in the dashboard): On your phone shows, Take me there does not
    solo = ctx.new_page(); solo.goto(base + 'board.html'); solo.locator('.card[data-id="%s"]' % ph['id']).first.wait_for(timeout=30000)
    ok(solo.locator('[data-act=goto]').count() == 0 and solo.locator('.onphone').count() == 1, 'dash3: the Board on its own has no Take me there, and still shows On your phone')
    solo.close()
    board_standin[0] = None; pg.evaluate("__DASH.reloadBoard()")

web = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None)
        for H in (1328, 1440):
            ctx = b.new_context(viewport={'width': 3440, 'height': H}); pg = ctx.new_page(); errs = []
            standin = ['']   # one extra line put at the top of data/build-history.js when the dashboard asks for it (its fetch has ?t=)
            def hist(route):
                r = route.fetch(); body = r.text()
                if standin[0]: body = body.replace('const BUILD_HISTORY=[\n', 'const BUILD_HISTORY=[\n' + standin[0] + '\n', 1)
                route.fulfill(response=r, body=body)
            ctx.route(lambda u: 'data/build-history.js?t=' in u, hist)
            board_standin = [None]   # a stand-in data/board.json for the strip and the Board pane (both fetch data/board.json?t=)
            def brd(route):
                if board_standin[0] is None: route.continue_(); return
                route.fulfill(status=200, content_type='application/json', body=json.dumps(board_standin[0]))
            ctx.route(lambda u: 'data/board.json?t=' in u, brd)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            tag = '%dpx' % H
            pg.goto(base + 'dashboard.html'); wait_loaded(pg)
            # --- four panes load and sit at the drawn sizes
            for n, name in ((1, 'board.html'), (2, 'index.html'), (3, 'battle-guide.html'), (4, 'admin.html')):
                ok(fr(pg, n) == name, '%s: pane %d shows %s' % (tag, n, name))
            ok(fr(pg, 2) == 'index.html' and pg.locator('#pane2 .strip #sg').count() == 1 and pg.locator('#pane2 .strip iframe').count() == 0, '%s: the strip (not the Builds page) is under the game' % tag)
            ok(not errs, '%s: no page errors %s' % (tag, errs[:3]))
            ok(box(pg, '#top')[3] == 44, '%s: top bar is 44 tall' % tag)
            ok([box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3, 4)] == [1000, 951, 829, 620], '%s: pane widths 1000, 951, 829, 620 (%s)' % (tag, [box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3, 4)]))
            ok(box(pg, '#pane1 .ph')[3] == 40, '%s: pane header is 40 tall' % tag)
            ok(box(pg, '#panes')[0] == 0 and box(pg, '#pane1')[0] == 8 and box(pg, '#pane2')[0] == 8 + 1000 + 8, '%s: 8 px around and between the panes' % tag)
            ok(box(pg, '#pane1 .pbody')[3] == H - 44 - 16 - 40, '%s: pane body is %d tall' % (tag, H - 44 - 16 - 40))
            ok(pg.evaluate("[__DASH.P[2].frame.clientWidth,__DASH.P[2].frame.clientHeight]") == [951, 648], '%s: game frame is 951 x 648' % tag)
            cls = pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className")
            ok('duo' in cls.split() and 'tablet' in cls.split() and 'landscape' in cls.split(), '%s: the game has the Duo layout (%s)' % (tag, cls))
            ok(pg.evaluate("localStorage.getItem('le-duo')") is None, '%s: the shared le-duo setting is not touched' % tag)
            strip_h = box(pg, '#pane2 .strip')[3]
            ok(strip_h == H - 44 - 16 - 40 - 648 - 0 or abs(strip_h - (H - 44 - 16 - 40 - 648)) <= 1, '%s: the strip under the game is %d tall' % (tag, strip_h))
            # --- no sideways scroll: the page, and every page in every pane
            ok(pg.evaluate("document.documentElement.scrollWidth<=innerWidth"), '%s: the dashboard does not scroll sideways' % tag)
            for n in (1, 2, 3, 4):
                ok(pg.evaluate("(n)=>{var w=__DASH.P[n].frame.contentWindow,e=w.document.documentElement;return e.scrollWidth<=w.innerWidth}", n), '%s: pane %d does not scroll sideways' % (tag, n))
            ok(pg.evaluate("(()=>{var e=document.getElementById('sg');return e.scrollWidth<=e.clientWidth})()"), '%s: the strip does not scroll sideways' % tag)
            # --- each page lays itself out for its pane
            ok(pg.evaluate("__DASH.P[1].frame.contentDocument.getElementById('views').getAttribute('data-v')") in ('for', 'claude') and pg.evaluate("getComputedStyle(__DASH.P[1].frame.contentDocument.getElementById('views')).display") == 'grid', '%s: the Board shows For you and Claude side by side' % tag)
            # --- top bar: counts, live build, token
            cnt = pg.evaluate("[document.querySelector('#c-for b').textContent,document.querySelector('#c-claude b').textContent]")
            bt = pg.evaluate("(()=>{var d=__DASH.P[1].frame.contentDocument;return ['for','claude'].map(v=>{var b=d.querySelector('#tabs button[data-view=\"'+v+'\"] b');return b?b.textContent.trim():null})})()")
            ok(cnt == bt and re.match(r'^\d+$', cnt[0] or '') and re.match(r'^\d+$', cnt[1] or ''), '%s: For you and Claude counts are the Board\'s own tab numbers %s' % (tag, cnt))
            newest = re.search(r'^\{"tag":"([^"]+)"', open(os.path.join(ROOT, 'data', 'build-history.js')).read(), re.M).group(1)
            ok(newest in pg.inner_text('#livet'), '%s: live build shows the newest build %s (%s)' % (tag, newest, pg.inner_text('#livet')))
            ok(re.search(r'\d{1,2}:\d{2}', pg.inner_text('#livet')) is not None, '%s: live build shows its time' % tag)
            ok('No GitHub token' in pg.inner_text('#tok'), '%s: token chip says missing without a token' % tag)
            pg.evaluate("localStorage.setItem('aot-gh-token','x')"); pg.wait_for_timeout(2600)
            ok('GitHub token saved' in pg.inner_text('#tok'), '%s: token chip says saved with a token' % tag)
            pg.evaluate("localStorage.removeItem('aot-gh-token')")
            # --- pane headers
            ok(pg.inner_text('#pane2 .nm') == 'Game' and 'Duo open, sideways' in pg.inner_text('#pane2 .wh'), '%s: game header names its size' % tag)
            ok(pg.locator('#pane2 [data-a=change]').count() == 0 and all(pg.locator('#pane%d [data-a=change]' % n).count() == 1 for n in (1, 3, 4)), '%s: Change page on every pane except the game' % tag)
            pg.screenshot(path=os.path.join(SHOTS, 'dashboard-%d.png' % H))
            strip_geometry(pg, tag, H, errs)
            if H == 1328:
                # --- links stay home
                a = put(pg, 1, '<a href="battle-guide.html#family/tom">guide</a>'); a.click(); pg.wait_for_timeout(1500)
                ok(fr(pg, 3) == 'battle-guide.html' and frfull(pg, 3).endswith('#family/tom'), 'a Board link to the Battle Guide lands in pane 3 (%s)' % frfull(pg, 3))
                ok(fr(pg, 1) == 'board.html', 'the Board stays in pane 1')
                ok(pg.inner_text('#pane3 .wh') == 'Family · Tom', 'pane 3 header says what shows (%s)' % pg.inner_text('#pane3 .wh'))
                pg.evaluate("__DASH.P[2].frame.contentWindow.__mark=7")
                pg.frame_locator('#pane4 iframe').locator('#b-art-library').click(); pg.wait_for_timeout(1500)
                ok(fr(pg, 4) == 'art.html', 'an Admin tool opens in pane 4 (%s)' % fr(pg, 4))
                ok(pg.inner_text('#pane4 .wh') != '' and 'Art Library' in pg.inner_text('#pane4 .wh'), 'pane 4 header names the tool (%s)' % pg.inner_text('#pane4 .wh'))
                a = put(pg, 4, '<a href="board.html?card=c-dash1">board</a>'); a.click(); pg.wait_for_timeout(1500)
                ok(fr(pg, 1) == 'board.html' and 'card=c-dash1' in frfull(pg, 1) and fr(pg, 4) == 'art.html', 'a Board link from pane 4 opens in pane 1, pane 4 stays')
                a = put(pg, 4, '<a href="index.html">game</a>'); a.click(); pg.wait_for_timeout(800)
                ok(pg.evaluate("__DASH.P[2].frame.contentWindow.__mark") == 7 and pg.evaluate("__DASH.keys()") == 2, 'a link to the game from pane 4 gives the game the keys and does not restart it')
                a = put(pg, 3, '<a href="voices.html">voice</a>'); a.click(); pg.wait_for_timeout(1500)
                ok(fr(pg, 4) == 'voices.html' and fr(pg, 3) == 'battle-guide.html', 'a tool link from pane 3 opens in pane 4, pane 3 stays')
                a = put(pg, 3, '<a href="battle-lab.html">lab</a>'); a.click(); pg.wait_for_timeout(2500)
                ok(fr(pg, 2) == 'battle-lab.html', 'a Battle Lab link opens in the game pane (%s)' % fr(pg, 2))
                ok(pg.evaluate("[__DASH.P[2].frame.clientWidth,__DASH.P[2].frame.clientHeight]") == [951, 648], 'the game pane keeps its size')
                a = put(pg, 3, '<a href="index.html?go=nonsense">go</a>'); a.click(); pg.wait_for_timeout(1000)
                pg.wait_for_function("()=>{var w=__DASH.P[2].frame.contentWindow;try{return w.eval('splash.mode')==='admin'}catch(e){return false}}", timeout=120000); pg.wait_for_timeout(2500)
                ok(fr(pg, 2) == 'index.html' and 'duo' in pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className").split(), 'index.html?go= in the game pane keeps the Duo layout (the ?duo= address trap)')
                with ctx.expect_page() as newp:
                    put(pg, 1, '<a href="https://example.com/x">out</a>').click()
                np_ = newp.value
                ok(np_ is not None, 'a link to another site opens a new tab'); np_.close()
                ok(fr(pg, 1) == 'board.html', 'and the pane stays where it was')
                # a script that moves a pane to another pane's page: the page goes home, the pane goes back
                pg.evaluate("__DASH.P[1].frame.contentWindow.location.href='battle-guide.html#rules'"); pg.wait_for_timeout(2500)
                ok(fr(pg, 3) == 'battle-guide.html' and frfull(pg, 3).endswith('#rules') and fr(pg, 1) == 'board.html', 'a pane moved by a script to the guide is put back, the guide pane gets the page')
                # --- Change page
                pg.click('#pane1 [data-a=change]'); pg.wait_for_selector('#menu button', state='visible')
                names = pg.evaluate("[...document.querySelectorAll('#menu button')].map(b=>b.textContent)")
                for want in ('Board', 'Art Library', 'Voice Library', 'Music Library', 'Script Editor', 'Pose Editor', 'Head Sizes', 'Portrait Crops', 'Effects', 'Area Builder', 'Battle Guide', 'Battle Lab', 'AI Costs', 'Builds'):
                    ok(want in names, 'Change page lists %s' % want)
                ok('Admin Dashboard' not in names, 'Change page does not list the dashboard itself')
                ok(names[0] == 'Admin (every tool)', 'Change page starts with Admin (every tool), so a pane can go back to the tool list')
                pg.click('#menu button:text-is("Music Library")'); pg.wait_for_timeout(1500)
                ok(fr(pg, 1) == 'music.html' and pg.inner_text('#pane1 .wh') != '', 'Change page puts the chosen tool in this pane (pane 1 shows %s)' % fr(pg, 1))
                pg.click('#pane1 [data-a=change]'); pg.wait_for_selector('#menu button', state='visible'); pg.click('#menu button:text-is("Board")'); pg.wait_for_timeout(1500)
                ok(fr(pg, 1) == 'board.html', 'Change page back to Board')
                pg.click('#pane4 [data-a=change]'); pg.wait_for_selector('#menu button', state='visible'); pg.click('#menu button:text-is("Admin (every tool)")'); pg.wait_for_timeout(1500)
                ok(fr(pg, 4) == 'admin.html', 'Change page > Admin (every tool) puts pane 4 back on the tool list')
                # --- Reload this pane
                pg.evaluate("__DASH.P[3].frame.contentWindow.__mark=1"); pg.click('#pane3 [data-a=reload]'); pg.wait_for_timeout(1500)
                ok(pg.evaluate("__DASH.P[3].frame.contentWindow.__mark") is None, 'Reload this pane reloads only that pane')
                # --- Make this pane big
                pg.click('#pane3 [data-a=big]'); pg.wait_for_timeout(500)
                bb = box(pg, '#pane3')
                ok(bb[2] > 3000 and pg.evaluate("__DASH.big()") == 3, 'Make this pane big grows it over its neighbours (%s)' % bb)
                pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
                ok(box(pg, '#pane3')[2] == 829 and pg.evaluate("__DASH.big()") == 0, 'Esc puts it back')
                pg.click('#pane3 [data-a=big]'); pg.click('#pane3 [data-a=big]'); pg.wait_for_timeout(300)
                ok(box(pg, '#pane3')[2] == 829, 'the same button puts it back')
                # --- Open in its own tab
                with ctx.expect_page() as newp:
                    pg.click('#pane3 [data-a=tab]')
                np_ = newp.value; np_.wait_for_load_state()
                ok('battle-guide.html' in np_.url, 'Open in its own tab opens the pane\'s page (%s)' % np_.url); np_.close()
                # --- keys
                pg.mouse.click(300, 600)   # a click in the Board pane
                pg.wait_for_timeout(300)
                ok(pg.evaluate("__DASH.keys()") == 1 and pg.evaluate("document.getElementById('pane1').classList.contains('keys')"), 'clicking a pane moves the keys to it')
                pg.keyboard.press('Control+2'); pg.wait_for_timeout(400)
                ok(pg.evaluate("__DASH.keys()") == 2, 'Ctrl 2 gives the game the keys')
                ok(pg.evaluate("getComputedStyle(document.getElementById('pane2')).boxShadow").count('255, 211, 77') == 1 and pg.is_visible('#pane2 .kt') and not pg.is_visible('#pane1 .kt'), 'the game pane has the gold frame and the KEYS HERE tag, the others do not')
                sel0 = pg.evaluate("__DASH.P[2].frame.contentWindow.eval('splash.sel')")
                pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(400)
                sel1 = pg.evaluate("__DASH.P[2].frame.contentWindow.eval('splash.sel')")
                ok(sel0 != sel1, 'with the keys on the game, an arrow key moves the menu (%s to %s)' % (sel0, sel1))
                ok(pg.evaluate("[1,3,4].every(n=>{var d=__DASH.P[n].frame.contentDocument;return !(d.scrollingElement.scrollTop)})"), 'the arrow key scrolled no other pane')
                pg.keyboard.press('Control+1'); pg.wait_for_timeout(300)
                ok(pg.evaluate("__DASH.keys()") == 1, 'Ctrl 1 works from inside the game frame')
                pg.keyboard.press('Control+3'); pg.keyboard.press('Control+4'); pg.wait_for_timeout(300)
                ok(pg.evaluate("__DASH.keys()") == 4, 'Ctrl 3 then Ctrl 4 ends on pane 4')
                pg.keyboard.press('Control+2')
                # a click on the For you count shows that tab in pane 1
                pg.click('#c-claude'); pg.wait_for_timeout(500)
                ok(pg.evaluate("__DASH.keys()") == 1 and pg.evaluate("__DASH.P[1].frame.contentDocument.querySelector('#tabs button[data-view=claude]').classList.contains('on')"), 'clicking the Claude count shows that tab in pane 1')
                # --- Battle layout
                pg.evaluate("__DASH.P[2].frame.contentWindow.__mark=9")
                pg.click('#lay-battle'); pg.wait_for_timeout(2500)
                ok([box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3, 4)] == [520, 1600, 860, 420], 'Battle layout: pane widths 520, 1600, 860, 420 (%s)' % [box(pg, '.slot:nth-child(%d)' % i)[2] for i in (1, 2, 3, 4)])
                ok(pg.evaluate("[__DASH.P[2].frame.clientWidth,__DASH.P[2].frame.clientHeight]") == [1600, 900], 'Battle layout: game frame is 1600 x 900')
                cls = pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className").split()
                ok('duo' not in cls and 'tablet' not in cls, 'Battle layout: the game has the desktop layout, Duo off (%s)' % cls)
                ok(pg.evaluate("__DASH.P[2].frame.contentWindow.__mark") == 9, 'switching layout does not restart the game')
                ok(fr(pg, 4) == 'builds.html' and pg.inner_text('#pane4 .nm') == 'Builds', 'Battle layout: Builds is pane 4')
                ok(pg.evaluate("__DASH.P[1].frame.contentDocument.getElementById('views').getAttribute('data-v')") != '' and pg.evaluate("getComputedStyle(__DASH.P[1].frame.contentDocument.getElementById('views')).display") == 'block', 'Battle layout: the Board is one column at 520')
                ok('Desktop wide' in pg.inner_text('#pane2 .wh'), 'Battle layout: game header says Desktop wide')
                ok(pg.evaluate("document.documentElement.scrollWidth<=innerWidth") and all(pg.evaluate("(n)=>{var w=__DASH.P[n].frame.contentWindow;return w.document.documentElement.scrollWidth<=w.innerWidth}", n) for n in (1, 2, 3, 4)), 'Battle layout: nothing scrolls sideways')
                ok(abs(box(pg, '#pane2 .strip')[3] - (H - 44 - 16 - 40 - 900)) <= 1, 'Battle layout: the strip fills what is left under the game (%d)' % box(pg, '#pane2 .strip')[3])
                pg.screenshot(path=os.path.join(SHOTS, 'dashboard-battle-%d.png' % H))
                pg.reload(); wait_loaded(pg)
                ok(pg.evaluate("__DASH.layout()") == 'battle' and pg.evaluate("__DASH.P[2].frame.clientWidth") == 1600, 'the layout choice is kept (aot-dash-layout)')
                ok('duo' not in pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className").split(), 'after a reload in Battle the game still has Duo off')
                pg.click('#lay-all'); pg.wait_for_timeout(2500)
                ok(pg.evaluate("__DASH.P[2].frame.clientWidth") == 951 and 'duo' in pg.evaluate("__DASH.P[2].frame.contentDocument.documentElement.className").split() and fr(pg, 4) == 'admin.html', 'back to All four: Duo size and Admin return')
                ok(pg.evaluate("localStorage.getItem('le-duo')") is None, 'le-duo was never set')

                # ================= dash2: what the strip does to the game =================
                st = lambda: pg.evaluate("localStorage.getItem('aot-b3-story')")
                # --- Story battles: the admin.html setting
                pg.click('#story-new'); settle(pg, 700)
                ok(st() == 'new' and pg.evaluate("document.getElementById('story-new').getAttribute('aria-pressed')") == 'true', 'Story battles: New is saved as aot-b3-story and marked')
                pg.click('#story-old'); settle(pg, 700)
                ok(st() == 'old' and pg.evaluate("document.getElementById('story-new').getAttribute('aria-pressed')") == 'false', 'Story battles: Old is saved and New is unmarked')
                pg.evaluate("localStorage.setItem('aot-b3-story','new')"); settle(pg, 1200)
                ok(pg.evaluate("document.getElementById('story-new').getAttribute('aria-pressed')") == 'true', 'Story battles: a change made elsewhere (the Admin pane) shows in the strip')
                pg.click('#story-chapter'); settle(pg, 500)
                ok(geval(pg, "b3sMode()") == 'chapter', 'Story battles: the game reads the same setting (b3sMode)')
                # --- Difficulty: the game's own b7SetDiff and the shared aot-diff
                pg.click('#diff-director'); settle(pg, 700)
                ok(geval(pg, "B7.diff") == 'director' and pg.evaluate("localStorage.getItem('aot-diff')") == 'director' and pg.evaluate("document.getElementById('diff-director').getAttribute('aria-pressed')") == 'true', 'Difficulty: HARD sets the running game (B7.diff) and aot-diff')
                pg.click('#diff-grace'); settle(pg, 700)
                ok(geval(pg, "B7.diff") == 'grace' and pg.evaluate("document.getElementById('diff-director').getAttribute('aria-pressed')") == 'false', 'Difficulty: MEDIUM sets it back')
                # --- Mute: this pane only, not saved
                geval(pg, "unlockAudio()"); settle(pg, 400)
                ok(geval(pg, "(window.__muteGains||[]).length")>=1 and geval(pg, "sound.ctx.__mg!==undefined"), 'Mute: the game audio goes through the dashboard\'s gain node (%s)' % geval(pg, "(window.__muteGains||[]).length"))
                pg.click('#mute'); settle(pg, 300)
                ok(geval(pg, "sound.ctx.__mg.gain.value") == 0 and pg.evaluate("__DASH.muted()") and pg.inner_text('#mutet') == 'Unmute game', 'Mute game: the game is silent and the button says Unmute game')
                ok(not pg.evaluate("Object.keys(localStorage).some(k=>/mute/i.test(k))"), 'Mute is not saved')
                if geval(pg, "typeof SpeechSynthesisUtterance==='function'&&'speechSynthesis' in window"):
                    ok(geval(pg, "(()=>{var u=new SpeechSynthesisUtterance('x');u.volume=1;speechSynthesis.speak(u);speechSynthesis.cancel();return u.volume})()") == 0, 'Mute: a spoken line is spoken at volume 0')
                # --- the newer-build bar (the stand-in lines go through the dashboard's own fetch)
                pg.evaluate("__DASH.P[2].frame.contentWindow.__mark=5")
                mine = geval(pg, "BUILD_TAG")
                standin[0] = '{"tag":"zz-housestandin","at":"2099-01-01T12:00:00-08:00","what":"x","kind":"house"}'
                pg.evaluate("liveBuild()"); settle(pg, 1200)
                ok(not pg.is_visible('#nb'), 'a newer housekeeping build does not raise the bar')
                standin[0] = '{"tag":"zz-standin","at":"2099-01-01T12:00:00-08:00","what":"x"}'
                pg.evaluate("liveBuild()"); settle(pg, 1500)
                ok(pg.is_visible('#nb') and box(pg, '#nb')[3] == 48, 'a newer real build raises the bar, 48 tall')
                txt = pg.inner_text('#nbt')
                ok(txt.startswith('A newer build is live: zz-standin, ') and txt.endswith('This pane is still on %s.' % mine) and re.search(r'\d{1,2}:\d{2}', txt), 'the bar names the newer build, its time and the build the pane is on (%s)' % txt)
                ok(pg.inner_text('#nbb') == 'Reload game', 'the bar has Reload game')
                pg.screenshot(path=os.path.join(SHOTS, 'dashboard-strip-bar-1328.png'), clip={'x': 1008, 'y': 44, 'width': 960, 'height': 1284})
                pg.wait_for_timeout(4000)
                ok(pg.evaluate("__DASH.P[2].frame.contentWindow.__mark") == 5, 'the game is never reloaded by itself while the bar is up')
                pg.click('#nbb')
                pg.wait_for_function("()=>{var w=__DASH.P[2].frame.contentWindow;try{return w.__mark===undefined&&w.eval('typeof splash==\"object\"&&splash.active')===true}catch(e){return false}}", timeout=120000); settle(pg, 2500)
                ok(geval(pg, "BUILD_TAG") == mine and 'duo' in gcls(pg) and gsize(pg) == [951, 648], 'Reload game reloads the game, which comes back at its size with the Duo layout')
                ok(pg.evaluate("__DASH.keys()") == 2, 'Reload game gives the game the keys')
                ok('duo=1' in geval(pg, "location.search"), 'the reloaded game keeps ?duo=1 in its address (%s)' % geval(pg, "location.search"))
                geval(pg, "unlockAudio()"); settle(pg, 400)
                ok(geval(pg, "sound.ctx.__mg.gain.value") == 0, 'Mute holds through a reload of the game')
                pg.click('#mute'); settle(pg, 300)
                ok(geval(pg, "sound.ctx.__mg.gain.value") == 1 and pg.inner_text('#mutet') == 'Mute game', 'Unmute brings the sound back')
                standin[0] = ''; pg.evaluate("liveBuild()"); settle(pg, 1200)
                ok(not pg.is_visible('#nb'), 'the bar goes away when the game is on the newest build')
                # --- jump to a chapter: from the title, then from the middle of the game
                ok(pg.evaluate("document.querySelectorAll('#s-chap .sb.dis').length") == 0, 'every chapter the game can open is enabled')
                pg.click('#ch-2')
                pg.wait_for_function("()=>{var w=__DASH.P[2].frame.contentWindow;try{return w.eval('STORY.mode===\"full\"&&STORY.chapter===2&&splash.active===false')===true}catch(e){return false}}", timeout=60000)
                ok(True, 'Jump to chapter 2 starts chapter 2 (the game\'s own chapterJump)')
                ok('Chapter 2' in pg.inner_text('#pane2 .wh') and 'here' in (pg.get_attribute('#ch-2', 'class') or ''), 'the header and the chapter button say chapter 2 (%s)' % pg.inner_text('#pane2 .wh'))
                pg.evaluate("__DASH.P[2].frame.contentWindow.__mark=6")
                pg.click('#ch-3')
                pg.wait_for_function("()=>{var w=__DASH.P[2].frame.contentWindow;try{return w.__mark===undefined&&w.eval('STORY.mode===\"full\"&&STORY.chapter===3&&splash.active===false')===true}catch(e){return false}}", timeout=180000)
                ok(gsize(pg) == [951, 648] and 'duo' in gcls(pg) and pg.evaluate("__DASH.keys()") == 2, 'Jump to chapter 3 from the middle of the game: the game starts fresh, the chapter opens, size and keys hold')
                pg.click('#ch-B'); settle(pg, 6000)
                ok(geval(pg, "splash.active") is False and 'Nine Scoops' in pg.inner_text('#pane2 .wh'), 'BONUS opens Nine Scoops (%s)' % pg.inner_text('#pane2 .wh'))
                # --- new battle test fights: index.html?go=new&i=N in the game pane
                pg.click('#ft-new1')
                pg.wait_for_function("()=>{var w=__DASH.P[2].frame.contentWindow;try{return w.eval('typeof B3===\"object\"&&!!B3.F&&splash.active===false')===true}catch(e){return false}}", timeout=180000); settle(pg, 1500)
                pg.wait_for_function("()=>document.querySelector('#pane2 .wh').textContent.indexOf('NEW 2: MUDLING AND SKEETER')>=0", timeout=20000)
                ok('NEW 2: MUDLING AND SKEETER' in pg.inner_text('#pane2 .wh'), 'a test fight opens in the game pane and the header names it (%s)' % pg.inner_text('#pane2 .wh'))
                ok(pg.evaluate("[...document.querySelectorAll('#fl .sb.ft.on')].map(b=>b.id)") == ['ft-new1'] and 'ON SCREEN' in pg.inner_text('#ft-new1'), 'the fight on screen is marked ON SCREEN, only that one')
                ok('duo' in gcls(pg) and 'tablet' in gcls(pg) and gsize(pg) == [951, 648] and 'go=' not in geval(pg, "location.search") and 'duo=1' in geval(pg, "location.search"), 'the fight opened by go= keeps the Duo layout and its address keeps ?duo=1 (the address trap) (%s)' % geval(pg, "location.search"))
                ok(pg.evaluate("__DASH.keys()") == 2, 'a test fight gives the game the keys')
                pg.click('#ft-more'); settle(pg, 400)
                idx = json.load(open(os.path.join(ROOT, 'data', 'battle-lab-index.json')))
                ok(pg.evaluate("document.querySelectorAll('#fl .sb.ft').length") == len(idx['b3']) + len(idx['b2']) and 'old battle lab fights' in pg.inner_text('#fl').lower(), 'Show all lists the %d new fights and the %d old Battle Lab fights' % (len(idx['b3']), len(idx['b2'])))
                pg.click('#ft-lab0')
                pg.wait_for_function("()=>{var w=__DASH.P[2].frame.contentWindow,b=document.getElementById('ft-lab0');try{return w.eval('splash.active===false')===true&&!!b&&b.classList.contains('on')}catch(e){return false}}", timeout=180000); settle(pg, 1500)
                ok(pg.evaluate("[...document.querySelectorAll('#fl .sb.ft.on')].map(b=>b.id)") == ['ft-lab0'], 'an old Battle Lab fight opens too and is the one marked')
                pg.click('#ft-more'); settle(pg, 300)
                ok(pg.evaluate("document.querySelectorAll('#fl .sb.ft').length") == 5, 'Show the first five folds the list again')
                # --- dash3: Take me there
                take_me_there(pg, ctx, errs, board_standin)
                # --- Report: opens the game's pencil tab; says so when the tab is off
                pg.evaluate("localStorage.removeItem('aot-report');localStorage.removeItem('aot-gh-token')")
                pg.click('#report'); settle(pg, 400)
                ok('Report tab is off' in pg.inner_text('#note'), 'Report with the Report tab off says so (%s)' % pg.inner_text('#note'))
                pg.evaluate("localStorage.setItem('aot-report','1')")
                pg.click('#report'); settle(pg, 1200)
                ok(geval(pg, "brp.open") is True and pg.evaluate("__DASH.keys()") == 2, 'Report opens the game\'s pencil tab and gives it the keys')
                geval(pg, "brpClose()"); pg.evaluate("localStorage.removeItem('aot-report')")
                pg.screenshot(path=os.path.join(SHOTS, 'dashboard-strip-fight-1328.png'), clip={'x': 1008, 'y': 44, 'width': 960, 'height': 1284})
                ok(not errs, 'no page errors in the whole run %s' % errs[:3])
            ctx.close()
        # --- narrower than 3000: one line and a link to Admin
        ctx = b.new_context(viewport={'width': 1920, 'height': 1080}); pg = ctx.new_page()
        pg.goto(base + 'dashboard.html'); pg.wait_for_timeout(600)
        ok('made for the wide monitor' in pg.inner_text('body') and pg.is_visible('#narrow a'), 'narrower than 3000: the one line and the link to Admin')
        ok(pg.evaluate("document.querySelectorAll('iframe').length") == 0, 'narrower than 3000: no frames are loaded')
        ok(pg.evaluate("document.querySelector('#narrow a').getAttribute('href')") == 'admin.html', 'the link goes to admin.html')
        pg.screenshot(path=os.path.join(SHOTS, 'dashboard-narrow.png')); ctx.close()
        b.close()
finally:
    web.terminate()
print('FAILED %d' % len(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
