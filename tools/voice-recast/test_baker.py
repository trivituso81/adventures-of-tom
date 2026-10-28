# python3 tools/voice-recast/test_baker.py <baker.html> <out recast.json> [shots dir]
# Runs the baker headless with ElevenLabs mocked: designs both voices (Ellie hits the voice limit once, so the delete path runs),
# generates every line, redoes one, saves recast.json.
import base64,json,sys,os,glob
from playwright.sync_api import sync_playwright
HTML,OUT=sys.argv[1],sys.argv[2]; SH=sys.argv[3] if len(sys.argv)>3 else '/tmp'
B64=base64.b64encode(open('/home/claude/work/tone.mp3','rb').read()).decode()
calls={'design':[],'create':0,'delete':[],'tts':[],'limit_hit':False}
def handle(route):
    u=route.request.url;m=route.request.method
    if '/text-to-voice/design' in u:
        b=json.loads(route.request.post_data);assert len(b['text'])>=100;calls['design'].append(b['voice_description'][:60])
        route.fulfill(status=200,content_type='application/json',body=json.dumps({'previews':[{'generated_voice_id':'g%d_%d'%(len(calls['design']),i),'audio_base_64':B64} for i in range(3)]}))
    elif u.split('?')[0].endswith('/v1/text-to-voice'):
        b=json.loads(route.request.post_data);calls['create']+=1
        if 'Ellie' in b['voice_name'] and not calls['limit_hit']:
            calls['limit_hit']=True;route.fulfill(status=400,content_type='application/json',body=json.dumps({'detail':{'status':'voice_limit_reached','message':'You have reached your voice limit.'}}));return
        route.fulfill(status=200,content_type='application/json',body=json.dumps({'voice_id':'V_'+b['voice_name'].split(' ')[1]+str(calls['create'])}))
    elif '/v1/voices/' in u and m=='DELETE':
        calls['delete'].append(u.split('/v1/voices/')[1]);route.fulfill(status=200,content_type='application/json',body='{}')
    elif '/text-to-speech/' in u:
        b=json.loads(route.request.post_data);calls['tts'].append((u.split('/text-to-speech/')[1].split('?')[0],b['text']));route.fulfill(status=200,content_type='audio/mpeg',body=base64.b64decode(B64))
    else: route.continue_()
with sync_playwright() as p:
    br=p.chromium.launch(executable_path=glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome')[0] if glob.glob('/opt/pw-browsers/chromium*/chrome-linux*/chrome') else None,args=['--headless=new','--no-sandbox'])
    pg=br.new_page(viewport={'width':1280,'height':900},accept_downloads=True);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
    pg.route('https://api.elevenlabs.io/**',handle);pg.goto('file://'+os.path.abspath(HTML))
    pg.fill('#key','xi-test')
    for ch,name in (('deedee','Deedee'),('ellie','Aunt Ellie')):
        pg.click('.char[data-ch=%s]'%ch);pg.click('#vdesign');pg.wait_for_selector('[data-act=duse]');pg.click('[data-act=duse][data-i="0"]')
        pg.wait_for_selector('text=Voice set:')
    pg.screenshot(path=SH+'/baker_voice.png')
    pg.click('#genAll');pg.wait_for_function("document.getElementById('bulkMsg').textContent.includes('finished')",timeout=120000)
    pg.click('.char[data-ch=deedee]');pg.screenshot(path=SH+'/baker_done.png')
    pg.click('#filter button[data-f=kept]');pg.click('[data-act=gen]');pg.wait_for_timeout(800)
    with pg.expect_download() as d: pg.click('#save')
    d.value.save_as(OUT);br.close()
j=json.load(open(OUT))
nb=sum(len(v) for c in j['clips'].values() for v in c.values());nd=len(j['dialog']['clips'])
print('errors',errs);print('designs',len(calls['design']),'deletes',calls['delete'],'limit path',calls['limit_hit'])
print('tts calls',len(calls['tts']),'battle clips',nb,'dialogue clips',nd,'voices',list(j['voices']),list(j['dialog']['voices']))
t=[x for x in calls['tts'] if 'Tommy' in x[1]][0];print('sample sent:',t[1][:140]);e=[x for x in calls['tts'] if x[0].startswith('V_Aunt')][0];print('ellie sent:',e[1][:150])
print('deedee id',j['voices']['deedee']['voice_id'],'ellie id',j['dialog']['voices']['ellie']['voice_id'])
