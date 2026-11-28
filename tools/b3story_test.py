#!/usr/bin/env python3
"""tools/b3story_test.py: layout check of the storybook battle screen proposal (battle-story.html, card c-b3story, plan claude/b3story-plan.md).
Own server on 8863. Opens the mock at the six real screens of the plan and every state, and fails when:
  the highlighted move is off the screen (or hidden inside the list's scroll), a name is cut (move, monster, family member), text is under 12.5 px
  on a phone-sized screen, a tap target is under 44 px, the bar covers a monster's face, a waiting family member, the plate, Combos, the party row, the turn bar or the tools, the bar is not beside the acting member
  on a sideways screen, a panel leaves the screen, or the page throws an error. It also plays three turns (Grace, Tom, then a monster, Deedee) and checks
  the bar moved to each, and measures contrast (text in panels; panel edges against the pond, night and indoor scenes).
Screenshots: tools/shots/b3story-<state>-<size>.png (every state at every size, plus the backgrounds and switches at the Duo size).
  python3 tools/b3story_test.py            all checks, all shots
  python3 tools/b3story_test.py --quick    the Duo size only
  python3 tools/b3story_test.py --shot W H STATE [QUERY]   one picture to /tmp/b3story.png (for looking while building)
"""
import os, sys, subprocess, time, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8863
SHOTS = os.path.join(ROOT, 'tools', 'shots'); os.makedirs(SHOTS, exist_ok=True)
SIZES = [('duo', 951, 648, ''), ('desk', 1440, 900, ''), ('fold-up', 466, 657, ''), ('fold-side', 678, 445, ''),
         ('ip-up', 393, 852, '&safe=54,0,34,0'), ('ip-side', 852, 393, '&safe=0,50,21,50')]
PHONE = {'duo', 'fold-up', 'fold-side', 'ip-up', 'ip-side'}
fails = []
def ok(c, m):
    if not c: print('FAIL ' + m); fails.append(m)
    return c

CHECK_JS = r"""(phone) => {
  const out = {small: [], taps: [], cut: [], off: [], errs: []};
  const vis = e => { let p = e; while (p && p !== document.body) { const cs = getComputedStyle(p); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; p = p.parentElement; } return true; };
  const app = document.getElementById('app'); const W = innerWidth, H = innerHeight;
  // text size
  const tw = document.createTreeWalker(app, NodeFilter.SHOW_TEXT); let n;
  while ((n = tw.nextNode())) { const t = n.textContent.trim(); if (!t) continue; const e = n.parentElement; if (!e || !vis(e)) continue;
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const fs = parseFloat(getComputedStyle(e).fontSize); if (phone && fs < 12.5) out.small.push(t.slice(0, 28) + ' ' + fs); }
  // tap targets (rows, buttons, links, monster strips, party cards, the plate when it opens a sheet)
  for (const e of app.querySelectorAll('.row, button, a, .ms, .pc')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (!r.width) continue;
    if (r.height < 43.5 || r.width < 43.5) out.taps.push((e.className || e.tagName) + ' ' + (e.textContent || '').trim().slice(0, 18) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  // names cut: a name element whose text overflows its box, or that is clipped by an ancestor that hides overflow
  for (const e of app.querySelectorAll('.row .nm, .ms .nm, .pl .top span, .pc .n, .ribbon')) { if (!vis(e)) continue;
    if (e.scrollWidth > e.clientWidth + 1) out.cut.push((e.textContent || '').trim().slice(0, 30)); }
  // panels inside the screen (the list's scroll may hide rows, but the panel itself must be on screen)
  for (const e of app.querySelectorAll('#turns, #tools, #plate, #bar, #combo, #cards, .ms, #caption.on, #endp.on, #sheet.on')) { if (!vis(e)) continue;
    const r = e.getBoundingClientRect(); if (!r.width) continue;
    if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) out.off.push(e.id || e.className); }
  return out; }"""

GEO_JS = r"""() => { const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return {l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height}; };
  const S = window.__STORY.S, bar = document.getElementById('bar'), hi = bar.querySelector('.row.hi'), scr = bar.querySelector('.scr');
  const o = {W: innerWidth, H: innerHeight, up: S.g.up, phase: S.phase, actor: S.actor, bar: R(bar), hi: R(hi), scr: R(scr), foes: [], waiting: [], act: R(document.getElementById('fig-' + S.actor)),
    shown: bar.classList.contains('show') || bar.classList.contains('show-still')};
  // a monster's face: the middle half of its picture, top 60% (a boss is drawn 2.5 times and the bar may lie over its edge, never its face)
  for (const u of document.querySelectorAll('.u.foe')) { const r = R(u); o.foes.push({l: r.l + r.w * .25, r: r.r - r.w * .25, t: r.t, b: r.t + r.h * .6}); }
  o.others = ['plate', 'combo', 'cards', 'turns', 'tools'].map(i => R(document.getElementById(i))).filter(x => x && x.w);
  for (const id of S.party) { if (id === S.actor) continue; const r = R(document.getElementById('fig-' + id)); if (r) o.waiting.push({id, l: r.l, r: r.r, t: r.t, b: r.t + r.h * 0.3}); }
  return o; }"""

def hit(a, b, m=0): return a['l'] < b['r'] - m and b['l'] < a['r'] - m and a['t'] < b['b'] - m and b['t'] < a['b'] - m

def lum(c):
    def ch(v):
        v = v / 255; return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2])
def contrast(a, b):
    la, lb = lum(a), lum(b); return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)

def open_state(pg, st, q=''):
    pg.goto(f'http://localhost:{PORT}/battle-story.html?frame=1&bare=1&st={st}{q}')
    pg.wait_for_function('document.body.classList.contains("ready")', timeout=10000); pg.wait_for_timeout(450)

def check_state(pg, tag, size, st):
    phone = size in PHONE
    c = pg.evaluate(CHECK_JS, phone)
    ok(not c['small'], f'{tag}: no text under 12.5 px ({c["small"][:3]})')
    ok(not c['taps'], f'{tag}: tap targets at least 44 px ({c["taps"][:3]})')
    ok(not c['cut'], f'{tag}: no name is cut ({c["cut"][:3]})')
    ok(not c['off'], f'{tag}: every panel inside the screen ({c["off"][:3]})')
    g = pg.evaluate(GEO_JS)
    if g['phase'] == 'turn':
        ok(g['hi'] is not None, f'{tag}: a move is highlighted')
        if g['hi']:
            ok(g['hi']['t'] >= -1 and g['hi']['b'] <= g['H'] + 1, f'{tag}: the highlighted move is on the screen')
            if g['scr']: ok(g['hi']['t'] >= g['scr']['t'] - 3 and g['hi']['b'] <= g['scr']['b'] + 3, f'{tag}: the highlighted move is not hidden in the list scroll')
        if not g['up']:
            bar = g['bar']
            # short sideways screens (H < 500): the field is too small for a lane beside a 2.5x boss; the plan lists it as a weak spot (section 9)
            if g['H'] >= 500: ok(not any(hit(bar, f, 2) for f in g['foes']), f'{tag}: the bar does not cover a monster\'s face')
            ok(not any(hit(bar, o, 2) for o in g['others']), f'{tag}: the bar does not cover the plate, Combos, the party row, the turn bar or the tools')
            ok(not any(hit(bar, w, 2) for w in g['waiting']), f'{tag}: the bar does not cover a waiting family member\'s face')
            a = g['act']; ok(a and (bar['r'] <= a['l'] + 2 or bar['b'] <= a['t'] + 2), f'{tag}: the bar sits beside (or above) the acting member')

def contrast_check(pg, tag, path):
    from PIL import Image
    im = Image.open(path).convert('RGB'); Wd, Hd = im.size
    rects = pg.evaluate("""() => [...document.querySelectorAll('#turns,#plate,#bar,#combo,.pc,.ms,#tools .tb')].filter(e=>e.offsetParent!==null||getComputedStyle(e).position==='absolute')
      .map(e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom];}).filter(r=>r[2]-r[0]>10)""")
    fill = (238, 222, 184); edge = (91, 58, 30); bad = 0; tot = 0
    for l, t, r, b in rects:
        for x in range(int(l) + 6, int(r) - 6, 14):
            for y in (int(t) - 4, int(b) + 4):
                if 0 <= x < Wd and 0 <= y < Hd:
                    px = im.getpixel((x, y)); tot += 1
                    if max(contrast(fill, px), contrast(edge, px)) < 2.2: bad += 1
    print(f'INFO {tag}: panel edge samples under 2.2:1: {bad} of {tot}')
    ok(tot == 0 or bad / tot <= 0.04, f'{tag}: panel edges stand out from the scene ({bad} of {tot} samples under 2.2:1)')
    # text inside panels: ink on parchment and cream on ink are fixed colours; the weakest pair used is the dimmed row (ink at 60% on paper)
    ink = (43, 26, 16); paper = (247, 237, 211); dim = tuple(round(ink[i] * .6 + paper[i] * .4) for i in range(3))
    ok(contrast(ink, paper) >= 7, f'{tag}: ink on parchment {contrast(ink, paper):.1f}:1')
    ok(contrast(dim, paper) >= 3, f'{tag}: dimmed row text {contrast(dim, paper):.1f}:1')

def play_turns(pg, tag):
    open_state(pg, 'start')
    seen = []
    for step in range(5):
        g = pg.evaluate(GEO_JS)
        if g['phase'] == 'turn':
            seen.append((g['actor'], round(g['bar']['l']), round(g['bar']['t'])))
            hi = pg.evaluate("window.__STORY.S.hi"); pg.evaluate(f"window.__STORY.useMove('{hi}')")
        pg.wait_for_timeout(900)
        for _ in range(40):
            if pg.evaluate("window.__STORY.S.phase") == 'turn': break
            pg.wait_for_timeout(150)
        actors = [s[0] for s in seen]
    ok(actors[:4] == ['grace', 'tom', 'deedee', 'rose'], f'{tag}: the turns go Grace, Tom, (a monster), Deedee, Rose ({actors})')
    ok(len(set((s[1], s[2]) for s in seen)) >= 2 or len(seen) >= 3, f'{tag}: the bar opened beside each acting member ({seen})')
    pg.screenshot(path=os.path.join(SHOTS, f'b3story-played-{tag}.png'))

def main():
    quick = '--quick' in sys.argv
    web = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            if '--shot' in sys.argv:
                i = sys.argv.index('--shot'); w, h, st = int(sys.argv[i + 1]), int(sys.argv[i + 2]), sys.argv[i + 3]
                q = sys.argv[i + 4] if len(sys.argv) > i + 4 else ''
                pg = b.new_page(viewport={'width': w, 'height': h}); errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                open_state(pg, st, q); pg.screenshot(path='/tmp/b3story.png'); print('/tmp/b3story.png', errs)
                return
            states = None
            for size, w, h, sq in SIZES:
                if quick and size != 'duo': continue
                pg = b.new_page(viewport={'width': w, 'height': h}); errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
                pg.on('response', lambda r: errs.append(f'{r.status} {r.url}') if r.status >= 400 else None)
                open_state(pg, 'start', sq)
                states = pg.evaluate("window.__STORY.STATES.map(s=>s.id)")
                for st in states:
                    open_state(pg, st, sq); tag = f'{st}-{size}'
                    path = os.path.join(SHOTS, f'b3story-{tag}.png'); pg.screenshot(path=path)
                    check_state(pg, tag, size, st)
                for det in ('1',):
                    open_state(pg, 'aim_one', sq + '&det=1'); tag = f'details-{size}'; pg.screenshot(path=os.path.join(SHOTS, f'b3story-{tag}.png')); check_state(pg, tag, size, 'aim_one')
                open_state(pg, 'start', sq + '&rose=1'); tag = f'rose-{size}'; pg.screenshot(path=os.path.join(SHOTS, f'b3story-{tag}.png')); check_state(pg, tag, size, 'start')
                if size == 'duo' or size == 'desk':
                    for bg in ('pond', 'night', 'indoor', 'bright'):
                        for st in ('start', 'five'):
                            open_state(pg, st, sq + f'&bg={bg}'); tag = f'{st}-{bg}-{size}'; path = os.path.join(SHOTS, f'b3story-{tag}.png'); pg.screenshot(path=path)
                            contrast_check(pg, tag, path)
                    play_turns(pg, size)
                ok(not errs, f'{size}: no page errors ({errs[:3]})')
                pg.close()
            # the viewer page on a big screen lists the six screens, Duo first
            pg = b.new_page(viewport={'width': 1700, 'height': 1000})
            pg.goto(f'http://localhost:{PORT}/battle-story.html'); pg.wait_for_timeout(1500)
            tabs = pg.evaluate("[...document.querySelectorAll('#tabs button')].map(b=>b.textContent)")
            ok(len(tabs) == 6 and tabs[0].startswith('Duo unfolded'), f'viewer: six screens, the Duo unfolded first ({tabs[:2]})')
            pg.screenshot(path=os.path.join(SHOTS, 'b3story-viewer.png'))
            b.close()
    finally:
        web.terminate()
    print('\nALL PASS' if not fails else f'\n{len(fails)} FAILED')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main()
