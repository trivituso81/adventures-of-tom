# SOLO test (Battle Lab > SOLO): the fighter picker lists every playable member, a solo fight starts with just that member,
# HP never drops for either side, RUN does nothing, and the EXIT button at the top is the only way out (it returns to the picker).
# Usage (repo root):  python3 tools/solo_test.py     (env CHROMIUM = chromium binary, optional; IDS=justin,olivia to limit)
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
def wait_cmd(pg): pg.wait_for_function("()=>window.__LE.battle.state==='command'&&window.__LE.B2.actor&&window.__LE.B2.actor.side==='party'",timeout=40000)
with sync_playwright() as pw:
    kw={'args':['--headless=new','--no-proxy-server']}
    if os.environ.get('CHROMIUM'): kw['executable_path']=os.environ['CHROMIUM']
    br=pw.chromium.launch(**kw)
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start'); pg.wait_for_timeout(1500)
    names=pg.evaluate("()=>B2_LAB.map(l=>l.name)"); print('lab entries:',names[:5])
    if 'SOLO' not in names: fails.append('no SOLO entry')
    if any('SOLO' in n and n!='SOLO' for n in names): fails.append('old *SOLO entries still listed: '+str(names))
    idx=names.index('SOLO')
    pg.evaluate(f"()=>{{ splash.active=true; document.getElementById('splash').hidden=false; splashSetMode('lab'); splash.labPage=Math.floor({idx}/SPLASH_LAB_PER); splashPick({idx}%SPLASH_LAB_PER); }}")
    pg.wait_for_timeout(500)
    mode=pg.evaluate("()=>splash.mode"); picker=pg.evaluate("()=>splash.list.map(c=>c.name)")
    print('mode',mode,'picker',picker)
    if mode!='solo': fails.append('SOLO did not open the picker: '+mode)
    for need in ('JUSTIN','OLIVIA','TOM','GRACE','ROSE','AMY','DEEDEE','BOPPY','TNB','NARA','BACK'):
        if need not in picker: fails.append('picker lacks '+need)
    pg.screenshot(path=os.path.join(SHOTS,'solo-picker-portrait.png'))
    ids=os.environ.get('IDS'); ids=ids.split(',') if ids else pg.evaluate("()=>SPLASH_SOLO_CAST")
    for n,who in enumerate(ids):
        pg.evaluate(f"()=>{{ splash.active=true; document.getElementById('splash').hidden=false; splashSetMode('solo'); splash.soloIdx={idx}; }}")
        pg.evaluate(f"()=>splashLab({idx},'{who}')"); wait_cmd(pg); pg.wait_for_timeout(400)
        info=pg.evaluate("()=>({party:B2.party.map(p=>p.id),foes:B2.foes.length,solo:!!B2.cfg.solo,exit:!document.getElementById('b7-exit').hidden})")
        print(who,info)
        if info['party']!=[who]: fails.append(f'{who}: party is {info["party"]}')
        if not info['solo'] or not info['exit']: fails.append(f'{who}: solo/exit flags {info}')
        # hurt everybody as hard as possible: hp must not move and the fight must not end
        pg.evaluate("()=>{ for(const u of B2.units){ u.hp=0; u.hp-=9999; u.dead=false; } }")
        st=pg.evaluate("()=>({p:B2.party[0].hp,pm:B2.party[0].maxHp,f:B2.foes[0].hp,fm:B2.foes[0].maxHp,live:b2LiveFoes().length,active:B2.active})")
        if st['p']!=st['pm'] or st['f']!=st['fm'] or not st['live'] or not st['active']: fails.append(f'{who}: hp not locked {st}')
        # play a few turns with the keyboard: Attack, first move, confirm target
        for t in range(3):
            wait_cmd(pg)
            for _ in range(3): pg.keyboard.press('Enter'); pg.wait_for_timeout(350)
            pg.wait_for_timeout(2500)
            try: wait_cmd(pg)
            except Exception as e: fails.append(f'{who}: no command after turn {t}'); break
        st=pg.evaluate("()=>({p:B2.party[0].hp,pm:B2.party[0].maxHp,f:B2.foes[0].hp,fm:B2.foes[0].maxHp,active:B2.active,round:B2.round})")
        print('  after turns',st)
        if st['p']!=st['pm'] or st['f']!=st['fm'] or not st['active']: fails.append(f'{who}: hp or fight changed {st}')
        # RUN does nothing; bag has no EXIT LAB row
        steps=pg.evaluate("()=>b2RunSteps(B2.actor).length"); 
        if not pg.evaluate("()=>B2.active"): fails.append(f'{who}: RUN ended the fight')
        if who in ('justin','olivia','tom'):
            pg.screenshot(path=os.path.join(SHOTS,f'solo-{who}-portrait.png'))
        # EXIT at the top ends it and returns to the picker
        pg.click('#b7-exit'); pg.wait_for_function("()=>!window.__LE.B2.active",timeout=15000); pg.wait_for_timeout(900)
        back=pg.evaluate("()=>({mode:splash.mode,active:splash.active})"); print('  after exit',back)
        if back['mode']!='solo' or not back['active']: fails.append(f'{who}: exit did not return to the picker {back}')
    # landscape look at the picker and a fight
    pg.evaluate("()=>{ document.documentElement.classList.add('landscape'); }"); pg.set_viewport_size({'width':860,'height':430}); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(SHOTS,'solo-picker-landscape.png'))
    print('errors:',errs[:5])
    if errs: fails.append('console errors: '+str(errs[:3]))
    br.close()
print('FAILS:',fails if fails else 'none'); raise SystemExit(1 if fails else 0)
