# python3 tools/voice-recast/test_grace_baker.py <baker.html> <tone.mp3> <out recast.json>
# Grace baker headless with ElevenLabs mocked: designs 3 options, saving hits the voice limit once so the Ivy delete path runs,
# generates every line, saves recast.json.
import base64,json,sys,os,glob
from playwright.sync_api import sync_playwright
HTML,TONE,OUT=sys.argv[1:4]
B64=base64.b64encode(open(TONE,'rb').read()).decode()
calls={'design':0,'create':0,'delete':[],'tts':[],'limit':False}
def handle(route):
    u=route.request.url;m=route.request.method
    if '/text-to-voice/design' in u:
        b=json.loads(route.request.post_data);assert len(b['text'])>=100;calls['design']+=1
        route.fulfill(status=200,content_type='application/json',body=json.dumps({'previews':[{'generated_voice_id':'g%d'%i,'audio_base_64':B64} for i in range(3)]}))
    elif u.split('?')[0].endswith('/v1/text-to-voice'):
        calls['create']+=1
        if not calls['limit']:
            calls['limit']=True;route.fulfill(status=400,content_type='application/json',body=json.dumps({'detail':{'status':'voice_limit_reached','message':'You have reached your voice limit.'}}));return
        route.fulfill(status=200,content_type='application/json',body=json.dumps({'voice_id':'NEWGRACE'}))
    elif '/v1/voices/' in u and m=='DELETE':
        calls['delete'].append(u.split('/v1/voices/')[1]);route.fulfill(status=200,content_type='application/json',body='{}')
    elif '/text-to-speech/' in u:
        b=json.loads(route.request.post_data);calls['tts'].append((u.split('/text-to-speech/')[1].split('?')[0],b['text']));route.fulfill(status=200,content_type='audio/mpeg',body=base64.b64decode(B64))
    else: route.continue_()
with sync_playwright() as p:
    ex=glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome')
    br=p.chromium.launch(executable_path=ex[0] if ex else None,args=['--headless=new','--no-sandbox'])
    pg=br.new_page(viewport={'width':1280,'height':900},accept_downloads=True);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
    pg.route('https://api.elevenlabs.io/**',handle);pg.goto('file://'+os.path.abspath(HTML));pg.fill('#key','xi-test')
    pg.click('#vdesign');pg.wait_for_selector('[data-act=duse]');pg.click('[data-act=duse][data-i="1"]');pg.wait_for_selector('text=Voice set:')
    pg.screenshot(path=os.path.dirname(OUT)+'/grace_baker_voice.png')
    pg.click('#genAll');pg.wait_for_function("document.getElementById('bulkMsg').textContent.includes('finished')",timeout=180000)
    with pg.expect_download() as d: pg.click('#save')
    d.value.save_as(OUT);br.close()
j=json.load(open(OUT))
nb=sum(len(v) for c in j['clips'].values() for v in c.values());nd=len(j['dialog']['clips'])
print('errors',errs);print('design calls',calls['design'],'deletes',calls['delete'],'limit path',calls['limit'])
print('tts',len(calls['tts']),'battle clips',nb,'dialogue clips',nd,'voice',j['voices']['grace']['voice_id'],j['voices']['grace']['name'])
print('sample sent:',calls['tts'][0][1][:120])
