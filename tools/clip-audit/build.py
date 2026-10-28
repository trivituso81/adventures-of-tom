import json,re,datetime,collections,sys
sys.path.insert(0,'/home/claude/bk'); from fixtext import tr
from keepscript import convert,check,caps_from_text
import os
ORIG=json.load(open('orig-scripts.json')) if os.path.exists('orig-scripts.json') else {}
IDX={}
kept=0; lost=[]
def handscript(i,text):
    global kept
    o=ORIG.get(str(i))
    if not o: lost.append((i,text,'no original found')); return None
    sc,_=convert(o['script'],text)
    if not check(sc,text): lost.append((i,text,'convert failed: '+o['script'])); return None
    kept+=1; return sc
BAD=json.load(open(sys.argv[1])); B=json.load(open('baked.json'))
ONES='zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']
def words(n):
    if n<20: return ONES[n]
    if n<100: return TENS[n//10]+('-'+ONES[n%10] if n%10 else '')
    if n<1000: return ONES[n//100]+' hundred'+(' '+words(n%100) if n%100 else '')
    return str(n)
def speak(t):
    t=re.sub(r'\bTa-?ta\b',lambda m:'TAH TAH' if m.group(0).isupper() else 'Tah Tah',t,flags=re.I)
    for a,b in (('Mr.','Mister'),('Mrs.','Missus'),('Ms.','Miss'),('Dr.','Doctor')): t=t.replace(a,b)
    t=re.sub(r'\b(\d{1,3})\b',lambda m:words(int(m.group(1))),t)
    return t.replace(' — ',', ').replace('—',', ').replace('’',"'")
BASE={'tom':'dry, calm','grace':'bossy, bright nine-year-old','rose':'six-year-old, bubbly','amy':'Long Island accent, warm','deedee':'Long Island accent, energetic grandma','boppy':'thick New York accent, gruff grandpa','tnb':'chill, easy-going','brainfreeze':'flat, cold, slow monotone, humming','skeeter':'tiny, squeaky, furious','sal':'thick Long Island accent, gruff cabbie','mudling':'gloopy, silly','toad':'deep, croaky'}
CV=B['cast']['voices']
def desc_tag(v):
    d=(CV.get(v) or {}).get('desc') or ''
    parts=[x.strip() for x in d.split('.')[0].split(',')][1:3]
    return ', '.join(' '.join(x.split()[:6]) for x in parts if x)
def auto(v,t,sp=None):
    own=not sp or (CV.get(v) or {}).get('name') in (None,sp)
    p=[BASE[v]] if v in BASE and own else ([desc_tag(v)] if own and desc_tag(v) else [])
    if t.startswith('...'): p.append('trailing off')
    elif '!' in t: p.append('animated')
    return ('['+', '.join(p)+'] ' if p else '')+speak(t)
def wwwfix(sc):
    sc=re.sub(r'(ell, well, well)\.\.\.',r'\1,',sc)
    m=re.match(r'\s*\[([^\]]*)\]',sc); rest=sc[m.end():] if m else sc
    old=[x.strip() for x in m.group(1).split(',')] if m else []
    keep=[x for x in old if x.lower() not in {'slow','drawn out','slow grin','creepy','amused','settling in','whispering','pun delivery'} and not x.lower().startswith('slow')]
    return '['+', '.join(['quick','snappy','rolling','amused']+keep)+']'+rest
def bare(s): return re.sub(r'[^a-z0-9\']+',' ',re.sub(r'\[[^\]]*\]','',s).lower().replace('’',"'")).split()
def fixscript(sc,miss,text):
    for c,e in miss:
        sc=re.sub(r'\b'+re.escape(e).replace(r'\ ',r'\s+')+r'\b',lambda m:(c[0].upper()+c[1:]) if m.group(0)[0].isupper() else c,sc,flags=re.I)
    return sc if bare(sc)==bare(speak(text)) else None
LOAN={'bun':'penny','fern':'luna','kit':'bean','kenji':'justin','dolores':'ellie'}
dialog=[];battle=[];handkept=0
for bi,b in enumerate(BAD):
    note=('Wording fixed (was: "'+b['old_text']+'"). ' if b['old_text']!=b['text'] else '')+'Old clip says: "'+b['asr']+'"'
    if b['kind']=='dialog':
        v,t=b['newkey'].split('|',1)
        sc=handscript(bi,t) or auto(v,t,b.get('speaker'))
        if v=='tnb' and re.search(r'[Ww]ell, well, well',t): sc=wwwfix(sc)
        dialog.append(dict(key=b['newkey'],voice=v,speaker=b.get('speaker') or next((n for n,vv in B['cast']['speakers'].items() if vv==v),v),text=t,ctx=b.get('file',''),tag='rebake',note=note,after='',script=sc,hand=False))
    else:
        m=re.match(r'(\w+)\.(\w+)\[\d+\]',b['key']); ch,kind=m.group(1),m.group(2); t=b['text']
        old=(B['voices'].get(ch,{}).get('scripts') or {}).get(kind+'|'+b['old_text'])
        sc=handscript(bi,t) or auto(ch,t)
        if ch=='tnb' and re.search(r'[Ww]ell, well, well',t): sc=wwwfix(sc)
        battle.append(dict(key=ch+'|'+kind+'|'+t,ch=ch,kind=kind,text=t,tag='rebake',note=note,script=sc,hand=bool(old)))

# ---- Deedee recast: every Deedee line, original hand-written scripts (tags and CAPS kept) ----
BAN=re.compile(r"\b(old|elderly|frail|weary|drowsy|tired|fussing|scratchy|quavering|sleepy)\b,?\s*",re.I)
def clean_tags(sc):
    def f(m):
        inner=BAN.sub('',m.group(1)).strip().strip(',').strip()
        inner=re.sub(r'\s*,\s*,\s*',', ',inner)
        return '['+inner+']' if inner else ''
    return re.sub(r'\s+',' ',re.sub(r'\[([^\]]*)\]',f,sc)).strip()
dd_kept=0; dd_lost=[]
if os.path.exists('dd-orig-scripts.json'):
    DDL=json.load(open('dd-to-match.json')); DDO=json.load(open('dd-orig-scripts.json'))
    have_d={d['key'] for d in dialog}; have_b={(b['ch'],b['text']) for b in battle}
    for x in DDL:
        o=DDO.get(x['id']); t=x['text']; sc=None
        if o:
            c,_=convert(o['script'],t)
            if check(c,t): sc=clean_tags(caps_from_text(c,t)[0])
            else: dd_lost.append((x['id'],t,'convert failed: '+o['script']))
        else: dd_lost.append((x['id'],t,'no original'))
        if sc: dd_kept+=1
        else: sc=auto('deedee',t)
        note='Deedee recast: original direction and emphasis restored.'
        if x['kind']=='dialog':
            k='deedee|'+t
            if k in have_d:
                for d in dialog:
                    if d['key']==k: d['script']=sc; d['note']=d['note']+' '+note; d['dd']=True
                continue
            dialog.append(dict(key=k,voice='deedee',speaker='Deedee',text=t,ctx='Deedee recast',tag='rebake',note=note,after='',script=sc,hand=bool(o),dd=True))
        else:
            if ('deedee',t) in have_b: continue
            battle.append(dict(key='deedee|'+x['kind']+'|'+t,ch='deedee',kind=x['kind'],text=t,tag='rebake',note=note,script=sc,hand=bool(o),dd=True))

# ---- battle lines never recorded (found 2026-10-28 while checking chapter 8) ----
if os.path.exists('extra-battle.json'):
    have_b={(b['ch'],b['text']) for b in battle}
    for ch,kind,t,sc in json.load(open('extra-battle.json')):
        if (ch,t) in have_b: continue
        battle.append(dict(key=ch+'|'+kind+'|'+t,ch=ch,kind=kind,text=t,tag='new',note='Never recorded. New hand-written direction.',script=sc,hand=True))
need=sorted({d['voice'] for d in dialog})
fam={i:{k:B['voices'][i][k] for k in ('voice_id','name','settings','direction') if k in B['voices'][i]} for i in B['cast']['family'] if i in B['voices']}
cv={v:B['cast']['voices'][v] for v in need if v in B['cast']['voices']}
designed={v:B['dvoices'][v] for v in need if v in B['dvoices'] and v not in fam}
for v,o in LOAN.items():
    if v in need and o in B['dvoices']: designed[v]={'voice_id':B['dvoices'][o]['voice_id'],'name':B['dvoices'][o]['name']}
names={v:next((n for n,vv in B['cast']['speakers'].items() if vv==v),v) for v in need}; names['tnb']='TNB'
vl={ch:({k:v[k] for k in v if k!='scripts'} if isinstance(v,dict) else v) for ch,v in B['voices'].items()}
dialog.sort(key=lambda d:(d['voice'],d['text']))

# ---- Deedee voice picker: her current voice, two samples of it, and the recast design brief ----
def dd_pick():
    R='/home/claude/adventures-of-tom/'
    line=[l for l in open(R+'data/voice/deedee.js',encoding='utf8').read().split('\n') if l.startswith('VOICE_CLIPS.clips.deedee=')][0]
    C=json.loads(line[len('VOICE_CLIPS.clips.deedee='):].rstrip(';'))
    def one(kind,pref=None):
        for c in C.get(kind,[]):
            if c and c.get('mp3') and (not pref or pref in c['text']): return {'text':c['text'],'mp3':c['mp3']}
    samples=[x for x in (one('greet',"Tommy"),one('moon_ult'),one('dinner')) if x]
    js=open(R+'tools/voice-recast/build.js',encoding='utf8').read()
    desc=re.search(r"deedee:\{.*?desc:'((?:[^'\\]|\\.)*)'",js,re.S).group(1).replace("\\'","'")
    sample=re.search(r"deedee:\{.*?sample:'((?:[^'\\]|\\.)*)'",js,re.S).group(1).replace("\\'","'")
    v=B['voices']['deedee']
    return {'deedee':{'desc':desc,'sample':sample,'old_id':v['voice_id'],'old_name':v['name'],'samples':samples}}
data=dict(pick=dd_pick(),accent={'deedee':'warm Long Island accent'},built=datetime.date.today().isoformat(),battle=battle,dialog=dialog,voicesLive=vl,fam=fam,castVoices=cv,designed=designed,vnames=names)
js=json.dumps(data,ensure_ascii=False).replace('</','<\\/')
head=open('tpl_head.html').read(); body=open('tpl_body.js').read()
out=head.rstrip()[:-len('/*__DATA__*/;')]+js+';\n'+body
open('out/Contraction-Fix-Baker.html','w').write(out)
print('dialog',len(dialog),'battle',len(battle),'battle scripts kept from old',handkept,len(out)//1024,'KB')
print(collections.Counter(d['voice'] for d in dialog)); print('no voice id:',[v for v in need if v not in fam and not (designed.get(v) or {}).get('voice_id')])

print('hand-written scripts kept',kept,'of',len(BAD)); [print('  LOST',x) for x in lost]

print('deedee recast kept',dd_kept,'lost',len(dd_lost)); [print('  DD LOST',x) for x in dd_lost]
