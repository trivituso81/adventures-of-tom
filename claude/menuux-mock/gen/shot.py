import sys, os
MOCK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
SIZES={'duo':(951,648),'phone':(393,852),'land':(852,393),'desk':(1280,720)}
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    for n in sys.argv[1:]:
        w,h=SIZES[n.rsplit('_',1)[1]]
        pg=br.new_page(viewport={'width':w,'height':h},device_scale_factor=2)
        pg.goto(f'file://{MOCK}/test/{n}.html'); pg.wait_for_timeout(500)
        over=pg.evaluate("""()=>{const out=[];for(const e of document.querySelectorAll('section *')){ if(e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='visible'&&e.children.length==0) out.push(e.textContent.slice(0,40)); } const m=document.querySelector('main'); return {clipped:out.slice(0,8), sections:[...document.querySelectorAll('section')].map(s=>[s.scrollHeight,s.clientHeight])}}""")
        print(n,over)
        pg.screenshot(path=f'{MOCK}/test/{n}.png'); pg.close()
    br.close()
