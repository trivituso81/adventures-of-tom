import threading, http.server, socketserver, functools, json, sys
from playwright.sync_api import sync_playwright
ROOT='/home/claude/adventures-of-tom'
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=socketserver.TCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
JS=open('/home/claude/bk/h/harvest.js').read()
with sync_playwright() as pw:
    br=pw.chromium.launch(args=['--headless=new','--no-proxy-server'])
    pg=br.new_page(viewport={'width':430,'height':860}); errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start',timeout=60000)
    pg.wait_for_function('()=>Object.keys(DIALOG_CLIPS.clips).length>2050',timeout=180000); pg.wait_for_timeout(5000)
    res=pg.evaluate(JS)
    json.dump(res,open('/home/claude/bk/h/harvest.json','w'),ensure_ascii=False)
    print(len(res['out']),'lines; clips',len(res['clipkeys']),'page errors:',errs[:3],'harvest errors:',res['errs'][:5])
    br.close()
