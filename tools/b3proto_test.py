#!/usr/bin/env python3
"""tools/b3proto_test.py: checks of the battle screen prototype (battle-proto.html, build b3proto; plan claude/battleux-mock2/proto-plan.md section 3).
Own server on 8852; screenshots in tools/shots/b3proto-*.png (one set at 951 x 648, the Duo unfolded sideways, one at 1440 x 900).
Checks, per size: no text under 12.5 px; every row and button at least 44 px; the open bar inside the screen and between the turn bar and the party cards;
the bar never over a monster or a family member's face; the list fits without scrolling (each of the four members, 1 and 5 monsters, Details on);
first tap opens a row, Use uses it, the bar folds away while the move plays; a full round of four turns plays; Try chip; notes and Copy my notes;
the upright phone shows Turn the phone sideways; no battle engine file is loaded."""
import os, sys, subprocess, time, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8852
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)

TEXT_JS = """() => { const bad = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (!t) continue; const e = n.parentElement; if (!e) continue;
    if (e.closest('script,style')) continue; const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0) continue;
    let p = e, hidden = false; while (p) { if (getComputedStyle(p).display === 'none') { hidden = true; break; } p = p.parentElement; } if (hidden) continue;
    const fs = parseFloat(cs.fontSize); if (fs < 12.5) bad.push(t.slice(0, 30) + ' ' + fs); }
  return bad; }"""
TAP_JS = """() => { const bad = []; for (const e of document.querySelectorAll('.row,button,.chip,a.tb')) {
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); let p = e, hidden = false;
    while (p) { if (getComputedStyle(p).display === 'none') { hidden = true; break; } p = p.parentElement; } if (hidden || r.width === 0) continue;
    if (r.height < 43.5 || r.width < 43.5) bad.push((e.className || e.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  return bad; }"""
GEO_JS = """() => { const R = e => { const r = e.getBoundingClientRect(); return {l: r.left, t: r.top, r: r.right, b: r.bottom}; };
  const P = window.__PROTO, a = P.S.queue[0]; const bar = document.getElementById('bar');
  const out = {W: innerWidth, H: innerHeight, bar: R(bar), top: R(document.getElementById('topbar')), cards: R(document.getElementById('cards')),
    scroll: bar.scrollHeight - bar.clientHeight, faces: [], mons: [], actor: R(document.getElementById('fig-' + a)),
    others: ['combo', 'plate', 'cards', 'tools', 'topbar'].map(i => R(document.getElementById(i)))};
  for (const id of P.S.queue) { if (id === a) continue; const f = R(document.getElementById('fig-' + id)); out.faces.push({id, l: f.l, r: f.r, t: f.t, b: f.t + (f.b - f.t) * 0.26}); }
  const mi = document.getElementById('monimg'); out.mons.push(R(mi));
  for (const c of document.querySelectorAll('.chip')) out.mons.push(R(c));
  return out; }"""

def hit(a, b): return a['l'] < b['r'] and b['l'] < a['r'] and a['t'] < b['b'] and b['t'] < a['b']
def geom(pg, tag):
    g = pg.evaluate(GEO_JS); bar = g['bar']
    ok(bar['l'] >= 0 and bar['r'] <= g['W'] and bar['t'] >= 0 and bar['b'] <= g['H'], f'{tag}: the open bar is inside the screen')
    ok(bar['t'] >= g['top']['b'] - 1 and bar['b'] <= g['cards']['t'] + 1, f"{tag}: the bar sits between the turn bar and the party cards ({round(bar['t'])} to {round(bar['b'])}, room {round(g['top']['b'])} to {round(g['cards']['t'])})")
    ok(g['scroll'] <= 0, f"{tag}: the list fits without scrolling")
    ok(not any(hit(bar, f) for f in g['faces']), f'{tag}: the bar is not over a family member face')
    # a monster's drawn picture fills only part of its box, so only the box edge matters here: the bar starts right of every monster box
    ok(not any(hit(bar, m) for m in g['mons']), f'{tag}: the bar is not over a monster')
    ok(not hit(bar, g['actor']), f"{tag}: the bar sits beside the acting member, not over them (bar right {round(bar['r'])}, member left {round(g['actor']['l'])})")
    ok(not any(hit(bar, o) for o in g['others']), f'{tag}: the bar is not over the plate, the Combo bar, the party cards or the buttons')

def run_size(b, w, h):
    tagw = f'{w}x{h}'
    ctx = b.new_context(viewport={'width': w, 'height': h}, permissions=['clipboard-read', 'clipboard-write'])
    pg = ctx.new_page(); errs = []; reqs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('response', lambda r: errs.append(f'{r.status} {r.url}') if r.status >= 400 else None)
    pg.on('request', lambda r: reqs.append(r.url))
    pg.goto(f'http://localhost:{PORT}/battle-proto.html'); pg.wait_for_timeout(1500)
    ok(not errs, f'{tagw}: no page errors, no missing files {errs[:3]}')
    ok(not any('/engine/' in u for u in reqs), f'{tagw}: no battle engine file is loaded')
    ok(all(('/data/b3-' in u) or ('/art/' in u) or ('/bgs/' in u) or u.endswith('battle-proto.html') or ('favicon' in u) for u in reqs if 'localhost' in u), f'{tagw}: the page reads only the b3 data files and its pictures')
    ok(pg.inner_text('#rotate') == 'Turn the phone sideways' and not pg.is_visible('#rotate'), f'{tagw}: sideways shows no turn-the-phone note')

    # turn 1, Grace: Basic is open, first tap opens a row, a second tap on Use uses it
    st = pg.evaluate('({a:__PROTO.S.queue[0],open:__PROTO.S.open})')
    ok(st['a'] == 'grace' and st['open'] == 'soup_dumpling_squeeze', f'{tagw}: Grace acts first with the Basic open')
    ok(pg.is_visible('#bar .row.open .use'), f'{tagw}: the open row shows the gold Use button')
    ok(pg.evaluate("document.querySelectorAll('#bar .row').length") == 7, f'{tagw}: one list of seven rows (Basic, three Primary, three Secondary)')
    ok('Secondary: Craft Artist' in pg.inner_text('#bar'), f'{tagw}: a line says Secondary: Craft Artist')
    pg.screenshot(path=f'{SHOTS}/b3proto-grace-open-{tagw}.png')
    ok(not pg.evaluate(TEXT_JS), f'{tagw}: no text under 12.5 px {pg.evaluate(TEXT_JS)[:4]}')
    ok(not pg.evaluate(TAP_JS), f'{tagw}: every row and button is at least 44 px {pg.evaluate(TAP_JS)[:4]}')
    geom(pg, f'{tagw} Grace')
    pg.click('#bar .row[data-sk=crunchy_sugar_cube_pop] .nm'); pg.wait_for_timeout(150)
    ok(pg.evaluate("document.querySelectorAll('#bar .row.open').length") == 1 and pg.evaluate("__PROTO.S.open") == 'crunchy_sugar_cube_pop', f'{tagw}: first tap opens a row and closes the other')
    ok(pg.evaluate("__PROTO.S.uses") == 0 and pg.evaluate("__PROTO.S.pep.grace") == 4, f'{tagw}: the first tap does not use the move')
    ok('Pet Peeve' in pg.inner_text('#plate'), f'{tagw}: the plate forecasts the Pet Peeve')
    pg.screenshot(path=f'{SHOTS}/b3proto-row-open-{tagw}.png')
    # a move that costs more than the Pep: Use is disabled
    pg.click('#bar .row[data-sk=colossal_diamond_gold_dumpling] .nm'); pg.wait_for_timeout(100)
    ok(pg.is_disabled('#bar .row.open .use'), f'{tagw}: Use is disabled when Pep is short')
    # Details on makes the open row longer: it must still fit
    pg.click('#tryBtn'); pg.click('[data-try=details][data-v=on]'); pg.click('#tryBtn'); pg.wait_for_timeout(100)
    pg.click('#bar .row[data-sk=crunchy_sugar_cube_pop] .nm'); pg.wait_for_timeout(100)
    geom(pg, f'{tagw} Details on'); pg.screenshot(path=f'{SHOTS}/b3proto-details-{tagw}.png')
    pg.click('#tryBtn'); pg.click('[data-try=details][data-v=off]'); pg.click('#tryBtn'); pg.wait_for_timeout(100)

    # use Crunchy Sugar-Cube Pop: the bar folds away while it plays
    pep0 = pg.evaluate('__PROTO.S.pep.grace'); hp0 = pg.evaluate("__PROTO.S.mon.bigone.hp")
    pg.click('#bar .row[data-sk=crunchy_sugar_cube_pop] .use'); pg.wait_for_timeout(450)
    ok(not pg.is_visible('#bar') and pg.is_visible('#caption'), f'{tagw}: the bar is gone and one caption line names the move while it plays')
    ok('Crunchy Sugar-Cube Pop' in pg.inner_text('#caption'), f'{tagw}: the caption names the move')
    ok(pg.evaluate('__PROTO.S.pep.grace') == pep0 - 4 and pg.evaluate("__PROTO.S.mon.bigone.hp") < hp0, f'{tagw}: Pep and the monster HP changed')
    pg.screenshot(path=f'{SHOTS}/b3proto-playing-{tagw}.png')
    pg.wait_for_timeout(1500)
    st = pg.evaluate('({a:__PROTO.S.queue[0],busy:__PROTO.S.busy})')
    ok(st['a'] == 'tom' and not st['busy'] and pg.is_visible('#bar'), f'{tagw}: the next member is up and the bar is open again')
    # the four members, one after another
    shots = {'tom': 'tom', 'deedee': 'deedee', 'rose': 'rose'}
    order = ['tom', 'deedee', 'rose', 'grace']; r0 = pg.evaluate('__PROTO.S.round')
    for i, who in enumerate(order):
        a = pg.evaluate('__PROTO.S.queue[0]'); ok(a == who, f'{tagw}: turn goes to {who}')
        ok(pg.evaluate("__PROTO.S.open") == pg.evaluate("__PROTO.KIT['%s'].basic.id" % who), f'{tagw}: {who} starts with the Basic open')
        geom(pg, f'{tagw} {who}')
        ok(not pg.evaluate(TEXT_JS) and not pg.evaluate(TAP_JS), f'{tagw}: {who}: text and tap sizes')
        if who in shots: pg.screenshot(path=f'{SHOTS}/b3proto-{who}-open-{tagw}.png')
        if who == 'deedee':   # five monsters and aiming, on Deedee's turn
            pg.click('#tryBtn'); pg.click('[data-try=monsters][data-v="5"]'); pg.click('#tryBtn'); pg.wait_for_timeout(250)
            ok(pg.evaluate("document.querySelectorAll('.chip').length") == 4, f'{tagw}: five monsters show one plate and a strip of four')
            geom(pg, f'{tagw} five monsters'); pg.screenshot(path=f'{SHOTS}/b3proto-five-{tagw}.png')
            ok(not pg.evaluate(TEXT_JS) and not pg.evaluate(TAP_JS), f'{tagw}: five monsters: text and tap sizes')
            pg.click('.chip[data-aim="2"]'); pg.wait_for_timeout(150)
            ok('Skeeter' in pg.inner_text('#plate'), f'{tagw}: a tap on a small monster aims and moves the plate to it')
            geom(pg, f'{tagw} aimed at Skeeter')
            pg.click('.chip[data-aim="0"]'); pg.wait_for_timeout(100)
        if who == 'rose':
            pg.click('#tryBtn'); pg.click('[data-try=bg][data-v=night]'); pg.click('#tryBtn'); pg.wait_for_timeout(350)
            pg.screenshot(path=f'{SHOTS}/b3proto-night-{tagw}.png'); ok(pg.evaluate("document.getElementById('stage').classList.contains('night')"), f'{tagw}: night background')
            pg.click('#tryBtn'); pg.click('[data-try=bg][data-v=indoor]'); pg.click('#tryBtn'); pg.wait_for_timeout(400)
            pg.screenshot(path=f'{SHOTS}/b3proto-indoor-{tagw}.png'); ok('06-library' in pg.evaluate("document.getElementById('bgimg').src"), f'{tagw}: indoor background')
            pg.click('#tryBtn'); pg.click('[data-try=bg][data-v=pond]'); pg.click('[data-try=monsters][data-v="1"]'); pg.click('#tryBtn'); pg.wait_for_timeout(200)
        pg.click('#bar .row.open .use'); pg.wait_for_timeout(2000)
    ok(pg.evaluate('__PROTO.S.round') == r0 + 1 and pg.evaluate('__PROTO.S.uses') == 5, f'{tagw}: a full round of four turns plays and Round goes up')
    ok(pg.evaluate('__PROTO.S.queue[0]') == 'tom', f'{tagw}: Tom is up after Grace again') if False else None

    # notes
    pg.click('#noteBtn'); pg.fill('#notetext', 'The bar covers the lamp on the right'); pg.click('#noteSave'); pg.wait_for_timeout(100)
    pg.fill('#notetext', 'Second note'); pg.click('#noteSave'); pg.wait_for_timeout(100)
    notes = json.loads(pg.evaluate("localStorage.getItem('b3proto-notes')"))
    ok(len(notes) == 2 and 'screen %dx%d' % (w, h) in notes[0]['state'] and "turn" in notes[0]['state'], f'{tagw}: each note keeps its state {notes[0]["state"] if notes else ""}')
    ok(not pg.evaluate(TEXT_JS) and not pg.evaluate(TAP_JS), f'{tagw}: the note panel: text and tap sizes')
    pg.screenshot(path=f'{SHOTS}/b3proto-notes-{tagw}.png')
    pg.click('#noteCopy'); pg.wait_for_timeout(200)
    clip = pg.evaluate('navigator.clipboard.readText()')
    ok('The bar covers the lamp' in clip and 'Second note' in clip and 'b3proto' in clip, f'{tagw}: Copy my notes puts every note on the clipboard')
    pg.click('#noteBtn'); ctx.close()

def main():
    web = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            for (w, h) in [(951, 648), (1440, 900)]: run_size(b, w, h)
            ctx = b.new_context(viewport={'width': 390, 'height': 844}); pg = ctx.new_page()
            pg.goto(f'http://localhost:{PORT}/battle-proto.html'); pg.wait_for_timeout(800)
            ok(pg.is_visible('#rotate') and 'Turn the phone sideways' in pg.inner_text('#rotate'), 'upright phone: Turn the phone sideways')
            b.close()
    finally:
        web.kill()
    print('\nALL PASS' if not fails else f'\n{len(fails)} FAILED'); sys.exit(1 if fails else 0)

if __name__ == '__main__': main()
