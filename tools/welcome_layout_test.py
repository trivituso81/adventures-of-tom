# Welcome layout editor test (ADMIN > WELCOME LAYOUT, engine/splash-edit.js). Start 'python3 tools/serve.py 8011' first, then
# python3 tools/welcome_layout_test.py [port land duoland duoport]. Shots go to /tmp/wl. Each case drags Deedee, sizes her, sizes ALL, saves (device only), reloads.
import os,sys,json
from playwright.sync_api import sync_playwright
CH=os.environ['CHROMIUM']; out='/tmp/wl'; os.makedirs(out,exist_ok=True)
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
def run(name,w,h,q='',turn=False):
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=CH,args=['--no-proxy-server'])
        cx=b.new_context(viewport={'width':w,'height':h},user_agent=UA,has_touch=True,is_mobile=True)
        pg=cx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        pg.goto('http://127.0.0.1:8011/index.html'+q,wait_until='load',timeout=180000)
        pg.wait_for_function("typeof splash!=='undefined'&&splash.active&&PAINTED.tomOw&&PAINTED.tomOw.ready",timeout=180000)
        pg.wait_for_timeout(2500)
        if turn: pg.evaluate("toggleLayout()"); pg.wait_for_timeout(600)
        key=pg.evaluate("splashEditKeyNow()")
        pg.screenshot(path=f'{out}/{name}-0plain.png')
        base=pg.evaluate("splashEditItems().map(m=>[m.id,Math.round(m.mx),Math.round(m.feet),Math.round(m.hh)])")
        pg.evaluate("splashSetMode('admin'); splashPick(7)"); pg.wait_for_timeout(400)
        pg.screenshot(path=f'{out}/{name}-1open.png')
        # tap + drag Deedee with real pointer input (screen coordinates; rotated stage turns them)
        d=pg.evaluate("(()=>{const m=splashEditItems().find(q=>q.id==='deedee');return {x:m.mx,y:m.feet-m.hh/2};})()")
        rot=pg.evaluate("layout.rotated")
        S=(lambda x,y:(w-y,x)) if rot else (lambda x,y:(x,y))
        x0,y0=S(d['x'],d['y']); x1,y1=S(d['x']-20,d['y']-40)
        pg.mouse.move(x0,y0); pg.mouse.down(); pg.mouse.move((x0+x1)/2,(y0+y1)/2); pg.mouse.move(x1,y1); pg.mouse.up()
        for i in range(8): pg.click('#sp-edit button[data-k="1"]')
        pg.click('#sp-edit button[data-n="1,0"]')
        sel=pg.evaluate("splashEdit.sel"); pg.wait_for_timeout(300)
        pg.screenshot(path=f'{out}/{name}-2edited.png')
        pg.click('#spe-all'); 
        for i in range(5): pg.click('#sp-edit button[data-k="-1"]')
        pg.wait_for_timeout(300); pg.screenshot(path=f'{out}/{name}-3all.png')
        pg.click('#spe-save'); pg.wait_for_timeout(800)
        msg=pg.inner_text('#spe-msg'); pg.click('#spe-done'); pg.wait_for_timeout(400)
        mode=pg.evaluate("splash.mode+':'+splash.sel+':'+splash.edit")
        adj=pg.evaluate("JSON.stringify(SPLASH_ADJ)")
        pg.reload(wait_until='load',timeout=180000)
        pg.wait_for_function("typeof splash!=='undefined'&&splash.active&&PAINTED.tomOw&&PAINTED.tomOw.ready",timeout=180000); pg.wait_for_timeout(2500)
        if turn: pass  # le-layout persisted
        after=pg.evaluate("splashEditItems().map(m=>[m.id,Math.round(m.mx),Math.round(m.feet),Math.round(m.hh)])")
        pg.screenshot(path=f'{out}/{name}-4reload.png')
        others=pg.evaluate("Object.keys(SPLASH_LAYOUTS).filter(k=>Object.keys(SPLASH_ADJ[k]||{}).length)")
        print(name,key,'sel',sel,'msg',msg,'|',mode,'| changed-layouts',others,'| moved',sum(1 for a,b in zip(sorted(base),sorted(after)) if a!=b),'errs',[e for e in errs if 'api.github' not in e][:3])
        print('  ',adj[:300])
        b.close()
which=sys.argv[1:]
C={'port':(390,844,'',False),'land':(390,844,'',True),'duoland':(951,648,'?duo=1',False),'duoport':(669,869,'?duo=1',False)}
for n in which or C: run(n,*C[n])
