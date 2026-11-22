# Builds battle-ux.html (the battle screen redesign proposal, card c-battleux-plan) from the files in this folder.
# Repo root:  python3 -I claude/battleux-mock/src/build.py --split battle-ux      the page on the site (big pictures stay in battle-ux/)
#             python3 -I claude/battleux-mock/src/build.py /tmp/one-file.html     everything inside one file
import base64,os,json,sys
H=os.path.dirname(os.path.abspath(__file__))
rd=lambda n: open(os.path.join(H,n),encoding='utf-8').read()
def b64(n,mime='image/jpeg'): return 'data:%s;base64,%s'%(mime,base64.b64encode(open(os.path.join(H,n),'rb').read()).decode())
SMALL=['tom','grace','rose','deedee','log','skeeter']
BIG=['scene','today-steps','today-duo','today-desk','today-duofold-up','today-duofold-side','today-iphone-up','today-iphone-side']
split=None
if '--split' in sys.argv: split=sys.argv[sys.argv.index('--split')+1]; sys.argv=[a for a in sys.argv if a not in ('--split',split)]
IMG={k:b64(k+'.jpg') for k in SMALL}
BIGDIR=os.path.join(H,'..','..','..','battle-ux')
for k in BIG: IMG[k]=(split+'/'+k+'.jpg') if split else 'data:image/jpeg;base64,'+base64.b64encode(open(os.path.join(BIGDIR,k+'.jpg'),'rb').read()).decode()
s=rd('shell.html')
s=s.replace('/*APP_CSS*/',rd('app.css')).replace('/*VIEW_CSS*/',rd('view.css')).replace('<!--VIEW_HTML-->',rd('view.html')).replace('/*IMG*/',json.dumps(IMG)).replace('/*APP_JS*/',rd('app.js')).replace('/*VIEW_JS*/',rd('view.js'))
out=sys.argv[1] if len(sys.argv)>1 else os.path.join(H,'..','..','..','battle-ux.html')
os.makedirs(os.path.dirname(out),exist_ok=True); open(out,'w',encoding='utf-8').write(s); print(out,len(s))
