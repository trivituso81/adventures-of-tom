# Stampcard grid test: level 1, 30 and 50 in portrait and landscape; stamp, polish, pin and compare; Rose Mode read-only.
# Usage (repo root):  python3 tools/stampgrid_test.py     Shots go to tools/shots/sg-*.png. Env: CHROMIUM = chromium binary.
import threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SHOTS=os.path.join(HERE,'shots'); os.makedirs(SHOTS,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def check(c,msg):
    if not c: fails.append(msg); print('FAIL',msg)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':390,'height':844}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE'); pg.wait_for_timeout(4000)
    pg.evaluate("()=>{ if(window.__LE.startNew) window.__LE.startNew(); if(typeof splash!=='undefined') { splash.active=false; const e=document.getElementById('splash'); if(e) e.hidden=true; } }"); pg.wait_for_timeout(800)
    def open_stamps(level,char='tom'):
        pg.evaluate("""([lv,id])=>{ if(typeof closeMenu==='function'&&menuOpen) closeMenu();
          const t=ALL_MEMBERS().find(m=>m.id===id); t.stamps=[]; t.ranks={}; t.remix=[]; t.ver={}; b6SetTotal(t,lv>=50?4900:lv===30?2900:lv===1?0:lv*100); b6Sync(); b6RefreshAll();
          delete SC.sel[id]; delete SC.pin[id]; delete SC.view[id];
          menuChar=Math.max(0,party.findIndex(p=>p.id===id)); openMenu(); setMenuTab('stamps'); }""",[level,char]); pg.wait_for_timeout(400)
    def snap(n):
        f=os.path.join(SHOTS,f'sg-{n}.png'); pg.screenshot(path=f)
        if n.startswith('l'):   # the stage is rotated in landscape: turn the shot upright so it reads like the phone held sideways
            from PIL import Image; Image.open(f).rotate(90,expand=True).save(f)
    def info():
        return pg.evaluate("""()=>{ const b=document.getElementById('menu-body'),d=document.getElementById('sc-drawer'),g=document.querySelector('.sc-grid');
          const chips=[...document.querySelectorAll('.sc-chip')];
          return {chips:chips.length,scrollH:b.scrollHeight,clientH:b.clientHeight,drawerBottom:d?Math.round(d.getBoundingClientRect().bottom):0,bodyBottom:Math.round(b.getBoundingClientRect().bottom),
                  gridBottom:g?Math.round(g.getBoundingClientRect().bottom):0,sel:document.querySelector('.sc-chip.sel')?.dataset.sc||null,pin:document.querySelector('.sc-chip.pin')?.dataset.sc||null} }""")
    for lv in (1,30,50):
        open_stamps(lv); i=info(); print('portrait',lv,i); snap(f'p{lv}')
        check(i['chips']==14,f'portrait lv{lv}: 14 chips, got {i["chips"]}')
        check(i['scrollH']<=i['clientH']+2,f'portrait lv{lv}: grid and drawer should fit one screen (scroll {i["scrollH"]} > {i["clientH"]})')
    # Level 30: tap a next chip, stamp, polish, pin, compare.
    open_stamps(30)
    nxt=pg.evaluate("()=>document.querySelector('.sc-chip.next')?.dataset.sc||null"); check(nxt,'lv30 has a next chip')
    if nxt:
        pg.click(f'.sc-chip[data-sc="{nxt}"]'); pg.wait_for_timeout(200)
        check(pg.evaluate("()=>document.querySelector('.sc-go')?.textContent")=='STAMP','next chip drawer button is STAMP')
        snap('p30-next')
        pg.click('.sc-go'); pg.wait_for_timeout(400)
        check(pg.evaluate("(s)=>b8St(party[menuChar]).includes(s)",nxt),'stamp applied')
        lab=pg.evaluate("()=>document.querySelector('.sc-go')?.textContent")
        print('after stamp button:',lab); snap('p30-stamped')
        if lab=='POLISH':
            pg.click('.sc-go'); pg.wait_for_timeout(300); check(pg.evaluate("(s)=>b8Rank(party[menuChar],s)",nxt)==2,'polish raised rank to 2')
        pg.click('.sc-sm:has-text("PIN")'); pg.wait_for_timeout(200)
        other=pg.evaluate("(s)=>[...document.querySelectorAll('.sc-chip')].map(c=>c.dataset.sc).find(x=>x!==s&&x!=='basic')",nxt)
        pg.click(f'.sc-chip[data-sc="{other}"]'); pg.wait_for_timeout(200)
        i=info(); print('compare',i); snap('p30-compare')
        check(i['pin']==nxt and i['sel']==other and pg.evaluate("()=>document.querySelectorAll('.sc-cmp .sc-pane').length")==2,'compare shows pinned left and selected right')
        pg.evaluate("()=>scBack()"); pg.wait_for_timeout(100)
        check(pg.evaluate("()=>document.querySelector('.sc-chip.pin')")is None,'Back clears the pin')
        check(info()['sel']==other,'Back (touch) leaves the selection')
    # Remix toggle and USE TICKET on a stamped move at level 50.
    open_stamps(50)
    pg.evaluate("()=>{ const m=party[menuChar]; b6AutoStamp(m,true); renderMenu(); }"); pg.wait_for_timeout(300)
    pg.click('.sc-chip[data-sc="A1"]'); pg.click('.sc-vb[data-k="sc-vr"]'); pg.wait_for_timeout(200); snap('p50-remix-view')
    print('lv50 A1 remix view button:',pg.evaluate("()=>document.querySelector('.sc-go')?.textContent"))
    # Remix path: stamp A1, view the Remix side, REMIX asks for confirmation, then SWAP appears.
    open_stamps(50)
    pg.evaluate("()=>{ const m=party[menuChar]; b6Stamp(m,'A1'); renderMenu(); }"); pg.wait_for_timeout(200)
    pg.click('.sc-chip[data-sc="A1"]'); pg.click('.sc-vb[data-k="sc-vr"]'); pg.wait_for_timeout(150)
    check(pg.evaluate("()=>document.querySelector('.sc-go')?.textContent")=='REMIX','Remix side of a stamped move offers REMIX')
    pg.click('.sc-go'); pg.wait_for_timeout(250); check(pg.evaluate("()=>document.querySelector('.sc-go')?.textContent")=='USE TICKET?','REMIX asks USE TICKET?')
    pg.click('.sc-go'); pg.wait_for_timeout(300); check(pg.evaluate("()=>(party[menuChar].remix||[]).includes('A1')"),'ticket spent, Remix unlocked')
    pg.click('.sc-chip[data-sc="A1"]'); pg.wait_for_timeout(100)
    check('SWAP' in pg.evaluate("()=>[...document.querySelectorAll('#sc-drawer button')].map(b=>b.textContent).join('|')"),'SWAP offered once unlocked')
    # A move with no build yet shows its note in the drawer.
    r=pg.evaluate("""()=>{ const m=ALL_MEMBERS().find(x=>x.id==='justin'); const out=[]; for(const s of B8_SLOTS) { if(b6NodeState(m,s)==='soon') { SC.sel[m.id]=s; const d=scDrawer(m); out.push(s+':'+(d.textContent.includes('later update')?'note':'NO NOTE')); } } return out; }""")
    print('justin soon drawers:',r); check(all(x.endswith('note') for x in r) and r,'soon moves explain themselves')
    # Landscape.
    pg.click('#rotate-menu'); pg.wait_for_timeout(500)
    for lv in (1,30,50):
        open_stamps(lv); i=info(); print('landscape',lv,i); snap(f'l{lv}')
        check(i['chips']==14,f'landscape lv{lv}: 14 chips')
    pg.click('#rotate-menu'); pg.wait_for_timeout(300)

    # Keyboard / controller cursor: arrows move the cursor and the drawer follows; Enter runs the action; Escape backs out in steps.
    pg.click('#rotate-menu') if pg.evaluate("()=>document.documentElement.classList.contains('landscape')") else None
    open_stamps(30)
    pg.evaluate("()=>{ menuKeyNav=true; document.querySelector('.sc-chip[data-sc=\"A1\"]').focus(); }"); pg.wait_for_timeout(150)
    pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(200)
    foc=pg.evaluate("()=>document.activeElement.dataset.sc"); check(foc=='B1','ArrowRight moves the cursor A1 to B1, got '+str(foc))
    check(info()['sel']=='B1','drawer follows the cursor (selected '+str(info()['sel'])+')')
    pg.keyboard.press('ArrowDown'); pg.wait_for_timeout(200); check(pg.evaluate("()=>document.activeElement.dataset.sc")=='B2','ArrowDown moves to B2')
    pg.keyboard.press('ArrowUp'); pg.keyboard.press('ArrowUp'); pg.wait_for_timeout(200); check(pg.evaluate("()=>document.activeElement.dataset.sc")in('sig','basic'),'ArrowUp from B1 reaches the core row')
    pg.evaluate("()=>document.querySelector('.sc-chip[data-sc=\"B1\"]').focus()"); pg.wait_for_timeout(150)
    pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
    check(pg.evaluate("()=>b8St(party[menuChar]).includes('B1')"),'Enter on the cursor chip stamps it')
    pg.evaluate("()=>{ document.querySelector('.sc-chip[data-sc=\"A1\"]').focus(); }"); pg.wait_for_timeout(100)
    pg.click('.sc-sm:has-text("PIN")'); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    check(info()['pin'] is None and pg.evaluate("()=>menuTab")=='stamps','Escape 1 clears the pin, stays on Stamps')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    check(info()['sel'] is None and pg.evaluate("()=>menuTab")=='stamps','Escape 2 closes the drawer, stays on Stamps')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    check(pg.evaluate("()=>menuTab")=='home','Escape 3 leaves the tab')
    # Every member renders (partial kits show Soon chips) without errors.
    r=pg.evaluate("""()=>ALL_MEMBERS().map(m=>{ try { const d=document.createElement('div'); renderStampsTab(d,m); return m.id+':'+d.querySelectorAll('.sc-chip').length+'/'+d.querySelectorAll('.sc-chip.soon').length; } catch(e) { return m.id+':ERR '+e.message; } })""")
    print('members (chips/soon):',r); check(not any('ERR' in x for x in r),'a member failed to render: '+str(r))
    # Rose Mode: read-only.
    pg.evaluate("()=>{ B7.diff='rose'; }"); open_stamps(30); pg.wait_for_timeout(300); snap('rose')
    check(pg.evaluate("()=>document.querySelectorAll('.sc-go,#sc-drawer .sc-sm:not(:last-child),.sc-strip .sc-sm').length")==0,'Rose Mode: no action, auto, respec or loadout buttons')
    pg.evaluate("()=>{ B7.diff='normal'; }")
    check(not errs,'page errors: '+'; '.join(errs[:4]))
    br.close()
print('FAILS' if fails else 'STAMPGRID OK', fails)
raise SystemExit(1 if fails else 0)
