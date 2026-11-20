#!/usr/bin/env python3
"""fix-ch1starving-2: Tom's line "Thank you for telling me, Rose..." never shows "I'm starving!" in the Voice Library script box,
whichever way an old script reached the page: saved edit (straight or curly apostrophe, with or without "!"), a direction stored from
ElevenLabs history (also a stray [direction] left at the end), or a take script in an export. Phone portrait and landscape.
Usage: python3 tools/voice-library/starving_test.py   (serves the repo itself on port 8012)"""
import json, os, subprocess, sys, time
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KEY="d|tom|Thank you for telling me, Rose. That one's yours. Grace, I'm so sorry, but number two can't wait."
GOOD="[wary, disgusted, amused] Thank you for telling me, Rose... [pause, very very deadpan] That one's yours. [very dismissive] Grace, I'm so sorry but number two can't wait."
CASES={
 'clean':{},
 'saved edit':{'aot-vl-scripts':{KEY:GOOD+" [hungry] I'm starving!"}},
 'curly, no !':{'aot-vl-scripts':{KEY:GOOD+" [hungry] I’m starving"}},
 'own line':{'aot-vl-scripts':{KEY:GOOD+"\n[hungry] I'm starving!"}},
 'history':{'aot-vl-hist':{KEY:GOOD+" [hungry] I'm starving!"}},
 'history tag left':{'aot-vl-hist':{KEY:GOOD+" [hungry]"}},
}
srv=subprocess.Popen([sys.executable,'-m','http.server','8012'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1.2)
fails=[]
def check(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+(' '+info if not ok else '')); 
    if not ok: fails.append(name)
try:
    with sync_playwright() as p:
        b=p.chromium.launch()
        for name,ls in CASES.items():
            for (w,h),tag in (((390,844),'portrait'),((844,390),'landscape')):
                ctx=b.new_context(viewport={'width':w,'height':h}); pg=ctx.new_page(); errs=[]
                pg.on('pageerror',lambda e:errs.append(str(e)))
                pg.add_init_script("(()=>{if(localStorage.getItem('__s'))return;const d=%s;for(const k in d)localStorage.setItem(k,JSON.stringify(d[k]));localStorage.setItem('__s','1');})()"%json.dumps(ls))
                pg.goto('http://127.0.0.1:8012/voices.html'); pg.wait_for_function('()=>window.__VL&&__VL.IDX&&__VL.IDX.items',timeout=60000); pg.wait_for_timeout(600)
                pg.fill('#q','telling me, Rose'); pg.wait_for_timeout(700); pg.locator('.row').first.click(); pg.wait_for_timeout(400)
                v=pg.locator('textarea.line').first.input_value()
                check(f'{name} / {tag}: box is the kept script, no "I\'m starving!"',v==GOOD,repr(v))
                check(f'{name} / {tag}: no page errors',not errs,str(errs))
                if name=='history' and tag=='portrait':
                    pg.screenshot(path='/tmp/starving-history-portrait.png')
                ctx.close()
        b.close()
finally:
    srv.terminate()
print('FAILS:',fails); sys.exit(1 if fails else 0)
