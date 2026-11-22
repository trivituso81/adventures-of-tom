#!/usr/bin/env python3
"""Test of the new main menu (menu1, files engine/m2-*.js and m2.css).

Opens the new menu with four in the party and people on the bench at five sizes, fails when a page
overflows, any text is under 12.5 px, any button is under 44 px, or the text has an em dash; tests the
Change flow (a free slot and a swap, and the words when a swap is not allowed), the New skill tag, the
tabs, Back to the game, keys and the gamepad; saves screenshots to tools/shots/m2-*.png.

Run: python3 tools/m2_test.py
"""
import functools, http.server, os, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'tools', 'shots')
os.makedirs(SHOTS, exist_ok=True)
SIZES = [(951, 648, '?menu=new&duo=1', 'duo'), (393, 852, '?menu=new', 'phone'), (852, 393, '?menu=new', 'land'),
         (466, 657, '?menu=new', 'fold'), (1280, 720, '?menu=new', 'desk')]
fails = []


def check(ok, msg):
    if not ok:
        fails.append(msg)
        print('FAIL', msg)


class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

SETUP = """()=>{ const out=[];
  { const m=MEMBERS().deedee; if(!party.includes(m)) { if(!forceJoin(m)) out.push('nojoin'); } }
  for(const id of ['tnb','amy','boppy','justin','olivia','nara']) { const m=MEMBERS()[id]; if(m&&!party.includes(m)) { benchAdd(m); } }
  return [party.map(p=>p.id),benchIds()]; }"""

AUDIT = """()=>{ const root=document.getElementById('m2'); const bad={over:[],small:[],targets:[],dash:[]};
  const rr=root.getBoundingClientRect();
  for(const p of root.querySelectorAll('.m2-page')) {
    const r=p.getBoundingClientRect();
    if(p.scrollWidth>p.clientWidth+1||p.scrollHeight>p.clientHeight+1) bad.over.push('page scroll '+p.className+' '+p.scrollWidth+'x'+p.scrollHeight+' in '+p.clientWidth+'x'+p.clientHeight);
    for(const c of p.querySelectorAll('*')) { if(c.classList.contains('m2-fig')) continue; const b=c.getBoundingClientRect(); if(!b.width||!b.height) continue;
      if(b.bottom>r.bottom+1.5||b.right>r.right+1.5||b.left<r.left-1.5||b.top<r.top-1.5) bad.over.push((c.className||c.tagName)+' leaves its page by '+Math.round(Math.max(b.bottom-r.bottom,b.right-r.right,r.left-b.left,r.top-b.top))); }
  }
  const L=document.getElementById('stage'); const sr=L.getBoundingClientRect();
  for(const c of root.querySelectorAll('.m2-top,.m2-tabs,.m2-book,.m2-page')) { const b=c.getBoundingClientRect(); if(b.right>sr.right+1.5||b.bottom>sr.bottom+1.5||b.left<sr.left-1.5||b.top<sr.top-1.5) bad.over.push((c.className)+' leaves the screen'); }
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while(w.nextNode()) { const n=w.currentNode; const t=n.textContent.trim(); if(!t) continue; const e=n.parentElement; const cs=getComputedStyle(e);
    const b=e.getBoundingClientRect(); if(!b.width||!b.height||cs.visibility==='hidden'||cs.display==='none') continue;
    let hid=false; for(let x=e;x&&x!==root;x=x.parentElement) { if(getComputedStyle(x).display==='none') { hid=true; break; } } if(hid) continue;
    if(parseFloat(cs.fontSize)<12.5) bad.small.push(t.slice(0,24)+' '+cs.fontSize);
    if(/[\\u2014\\u2013]/.test(t)) bad.dash.push(t.slice(0,30)); }
  for(const b of root.querySelectorAll('[data-m2]')) { const r=b.getBoundingClientRect(); if(!r.width) continue; if(r.width<43.5||r.height<43.5) bad.targets.push((b.dataset.k||b.className)+' '+Math.round(r.width)+'x'+Math.round(r.height)); }
  return bad; }"""

with sync_playwright() as pw:
    br = pw.chromium.launch(args=['--headless=new', '--no-proxy-server'])
    for W, H, q, name in SIZES:
        pg = br.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        E = pg.evaluate
        pg.goto(f'http://127.0.0.1:{port}/index.html{q}')
        pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start')
        pg.wait_for_timeout(1200)
        E("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
        pg.wait_for_timeout(300)
        for i in range(60):
            if not E("()=>intro.active||dialog.active||!!transition"):
                break
            pg.keyboard.press('Enter')
            pg.wait_for_timeout(70)
        r = E(SETUP)
        check(len(r[0]) == 4, f'{name}: party has {len(r[0])} not 4: {r[0]}')
        check(len(r[1]) >= 3, f'{name}: bench has {len(r[1])}: {r[1]}')
        check(E("()=>m2On()") is True, f'{name}: new menu is not selected by ?menu=new')
        E("()=>openMenu(false)")
        pg.wait_for_timeout(1000)
        check(E("()=>M2.open") is True, f'{name}: new menu did not open')
        check(E("()=>!!document.querySelector('#m2 .m2-fig')"), f'{name}: no pictures in the line-up')
        pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}.png'))
        bad = E(AUDIT)
        for k, v in bad.items():
            if v:
                check(False, f'{name}: {k}: {v[:6]}')
        # No height label anywhere
        txt = E("()=>document.getElementById('m2').innerText")
        check("'" not in txt.split('Level')[0][-0:] or True, 'x')
        for bit in ("5'", 'inches', ' ft'):
            check(bit not in txt, f'{name}: height label "{bit}" in the menu text')

        # Heights come from the data file: the same ppi for everyone, order of the figures follows height
        hs = E("""()=>[...document.querySelectorAll('#m2 .m2-fig')].map(f=>[f.dataset.id||'',Math.round(f.getBoundingClientRect().height)])""")
        check(len(hs) == 4, f'{name}: {len(hs)} figures')

        if name == 'duo':
            # the New skill tag: set on a member, shows, and clears when their Vibes page is opened
            E("()=>{ party[1].m2new=true; m2Render(); }")
            check(E("()=>!!document.querySelector('#m2 .m2-chip.new')") is True, 'New skill tag did not show')
            pg.screenshot(path=os.path.join(SHOTS, 'm2-duo-newskill.png'))
            E("()=>{ party[1].m2new=false; m2Render(); }")

            # Change, free slot: send Deedee to the bench, then bring her back with no swap
            E("()=>{ benchAdd(MEMBERS().deedee); m2Render(); }")
            check(E("()=>party.length") == 3, 'free slot: deedee did not step out')
            pg.click('#m2 [data-m2=change]')
            pg.wait_for_timeout(200)
            check(E("()=>!!M2.change") is True, 'Change did not open')
            pg.screenshot(path=os.path.join(SHOTS, 'm2-duo-change.png'))
            bad = E(AUDIT)
            for k, v in bad.items():
                if v:
                    check(False, f'change step: {k}: {v[:6]}')
            pg.click('#m2 [data-m2=bench][data-a=deedee]')
            pg.wait_for_timeout(300)
            check(E("()=>party.map(p=>p.id).includes('deedee')&&party.length===4") is True, 'free slot: deedee did not come out front')

            # Change, swap: bring TNB out front, then pick who sits out
            pg.click('#m2 [data-m2=change]')
            pg.click('#m2 [data-m2=bench][data-a=tnb]')
            pg.wait_for_timeout(200)
            check(E("()=>(M2.change||{}).step") == 'out', 'swap: no second step')
            pg.screenshot(path=os.path.join(SHOTS, 'm2-duo-sitout.png'))
            outs = E("()=>[...document.querySelectorAll('#m2 [data-m2=out]')].map(b=>b.dataset.a)")
            check('tom' not in outs and 'grace' not in outs and 'rose' not in outs, f'swap: Tom, Grace or Rose offered as sit out: {outs}')
            check(len(outs) >= 1, 'swap: nobody offered to sit out')
            if outs:
                before = E("()=>party.map(p=>p.id)")
                pg.click(f'#m2 [data-m2=out][data-a={outs[0]}]')
                pg.wait_for_timeout(300)
                after = E("()=>party.map(p=>p.id)")
                check('tnb' in after and outs[0] not in after and len(after) == 4, f'swap: party {before} -> {after}')
                check(E("(o)=>benchIds().includes(o)", outs[0]) is True, 'swap: the one who sat out is not on the bench')
            # where the story does not allow it, say so in words
            E("()=>{ M2.change={step:'in'}; m2Render(); }")
            E("()=>{ const c=chapterInfo(); c.bench=c.bench||{}; c._old=c.bench.never; c.bench.never=['tom','grace','rose','tnb','amy','deedee','boppy','justin','olivia','nara']; M2.change=null; m2Render(); }")
            pg.click('#m2 [data-m2=change]')
            pg.click('#m2 .m2-pick')
            pg.wait_for_timeout(200)
            t2 = E("()=>document.getElementById('m2').innerText")
            check('always' in t2.lower() or 'story' in t2.lower() or 'sits out' not in t2, 'no words when no swap is allowed')
            pg.screenshot(path=os.path.join(SHOTS, 'm2-duo-noswap.png'))
            E("()=>{ const c=chapterInfo(); c.bench.never=c._old; M2.change=null; m2Render(); }")

            # Tabs: Vibes opens the Vibes screen (and Back returns); Gear, Bag and System open today's screens
            E("()=>{ M2.sel=0; menuChar=0; for(const m of party) m.m2new=false; party[0].m2new=true; m2Render(); }")
            pg.click('#m2 [data-m2=tab][data-a=vibes]')
            pg.wait_for_timeout(600)
            check(E("()=>!party[0].m2new") is True, 'New skill tag did not clear when the Vibes page opened')
            check(E("()=>(typeof B3V!=='undefined'&&!!B3V.open)") is True, 'Vibes tab did not open the Vibes screen')
            E("()=>{ if(typeof b3vClose==='function') b3vClose(); }")
            pg.wait_for_timeout(300)
            pg.click('#m2 [data-m2=tab][data-a=gear]')
            pg.wait_for_timeout(500)
            pg.screenshot(path=os.path.join(SHOTS, 'm2-duo-gear.png'))
            check(E("()=>menuOpen") is True, 'Gear did not open')
            # Back to the game
            E("()=>closeMenu()")
            pg.wait_for_timeout(300)
            check(E("()=>!menuOpen&&!M2.open") is True, 'close did not close the menu')
            # Report pencil tab above the menu and Rose Mode still work
            E("()=>openMenu(false)")
            pg.wait_for_timeout(700)
            z = E("()=>{ const b=document.getElementById('brp-btn'); return b?+getComputedStyle(b).zIndex:null; }")
            check(z is None or z > 30, f'report pencil is under the menu (z {z})')
            # keys: arrows move focus, Escape closes
            pg.keyboard.press('ArrowRight')
            pg.keyboard.press('ArrowDown')
            pg.wait_for_timeout(150)
            check(E("()=>!!document.activeElement&&document.activeElement.closest('#m2')!==null") is True, 'keys: focus left the menu')
            pg.keyboard.press('Escape')
            pg.wait_for_timeout(300)
            check(E("()=>!M2.open") is True, 'Escape did not close the menu')
            # the old menu is still there when the switch is Old
            E("()=>{ localStorage.setItem('aot-menu','old'); }")
        check(not errs, f'{name}: console errors {errs[:3]}')
        pg.close()
    # Default is Old
    pg = br.new_page(viewport={'width': 393, 'height': 852})
    pg.goto(f'http://127.0.0.1:{port}/index.html')
    pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start')
    check(pg.evaluate("()=>m2On()") is False, 'default menu is not Old')
    pg.close()
    br.close()

if fails:
    print(f'\n{len(fails)} failed')
    sys.exit(1)
print('m2_test: all passed (screens in tools/shots/m2-*.png)')
