# tools/movebench/schema.py (movebench3): the shape of a move spec file, data/moves/<slug>.json (claude/movebench-plan.md section b).
# validate(doc, ctx) returns (errors, warnings). An error is a file the game or the page must not read; a warning names something a spec mentions that does not exist yet
# (a clip not baked, an effect the library drops), which the engine skips while it plays the rest.
# ctx() builds the lists a file is checked against: the 37 library effects and their params, the sounds of engine/audio.js, the baked clips, the animations of the Guide.
import json, os, re
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB=os.path.join(ROOT,'art-factory','aot-stage2c-vfx-library-v11.json')
EXTRA_FX=['vfx_red_stud_led_ping']
MOTIONS=['strike','cast','throw','give']
STAGE_DO=['fly','hover','drop','cross','rain','surround','place','pop','words','foe','shake','flash','dim','glow','sfx']
ON_WORDS=['auto','target','each_target','self','each_ally','field']
APPROACH=['auto','stay','run']
SECTIONS=['start','body','timing','stage','effects','answer','note']
WHO_PARAMS={'chainTargets','dualFlavor','targetIds','targetId','allyIds','targetAllyIds','targetAllyId','startPos','endPos','targetEnemyId','rewindAllyId','offenderEnemyId'}
# the ranges of plan section b.2 for a stage step's numbers
STEP_RANGE={'dur':(0.05,6),
  'hold':(0.1,8),'in':(0.05,4),'out':(0.05,4),'arc':(0,120),'amp':(0,12),'amount':(0,0.95),'size':(1,4),'px':(0,40),'n':(1,40)}
EM_DASH=chr(0x2014)
def split_top(s):
    out=[];cur='';d=0;q=False
    for ch in s:
        if ch=='"': q=not q
        if not q:
            if ch in '[{': d+=1
            if ch in ']}': d-=1
            if ch==',' and d==0: out.append(cur); cur=''; continue
        cur+=ch
    if cur.strip(): out.append(cur)
    return [x.strip() for x in out]
def parse_params(txt):
    """The library's params line -> {name: {'kind':..., ...}} with kinds range, choice, bool, number, color, list, text, who, sprite, effect."""
    t=txt.strip()
    if t.startswith('{'): t=t[1:]
    if t.endswith('}'): t=t[:-1]
    out={}
    for item in split_top(t):
        if ':' not in item:
            out[item]={'kind':'who' if item in WHO_PARAMS else 'sprite' if item=='spriteId' else 'effect' if item in ('impactVfxId','onCatchVfxId') else 'number'}; continue
        n,v=[x.strip() for x in item.split(':',1)]
        if n in WHO_PARAMS: out[n]={'kind':'who'}
        elif n=='spriteId': out[n]={'kind':'sprite'}
        elif n in ('impactVfxId','onCatchVfxId'): out[n]={'kind':'effect'}
        elif re.match(r'^-?\d+(\.\d+)?\.\.-?\d+(\.\d+)?$',v):
            a,b=v.split('..'); out[n]={'kind':'range','lo':float(a),'hi':float(b)}
        elif v.startswith('"') and '|' in v: out[n]={'kind':'choice','choices':[x.strip().strip('"') for x in v.split('|')]}
        elif v in ('bool','true','false'): out[n]={'kind':'bool','default':{'true':True,'false':False}.get(v)}
        elif v.startswith('['): out[n]={'kind':'list'}
        elif v.startswith('"#'): out[n]={'kind':'color','default':v.strip('"')}
        elif v.startswith('"'): out[n]={'kind':'text','default':v.strip('"')}
        else:
            try: out[n]={'kind':'number','default':float(v)}
            except ValueError: out[n]={'kind':'text'}
    return out
def sound_names():
    s=open(os.path.join(ROOT,'engine','audio.js'),encoding='utf8').read()
    i=s.index('const sfx={'); j=s.index('\n};',i)
    return sorted(set(re.findall(r'^  ([A-Za-z0-9_]+)\(',s[i:j],re.M)))
def ctx():
    lib=json.load(open(LIB,encoding='utf8'))
    fx={a['id']:parse_params(a['params']) for a in lib['assets']}
    for e in EXTRA_FX: fx[e]={}
    clips=sorted(f[:-3] for f in os.listdir(os.path.join(ROOT,'data','clips')) if f.endswith('.js'))
    return {'fx':fx,'sounds':set(sound_names()),'clips':set(clips)}
def isnum(x): return isinstance(x,(int,float)) and not isinstance(x,bool)
def isint(x): return isinstance(x,int) and not isinstance(x,bool)
def _rng(v,lo,hi,path,E):
    if not isnum(v) or v<lo or v>hi: E.append('%s: %r is not a number from %s to %s'%(path,v,lo,hi))
def at_ok(a):
    if isnum(a): return a>=0
    if isinstance(a,str): return bool(a)
    if isinstance(a,dict): return any(k in a for k in ('pic','mark','step','sec','f','hit'))
    return False
def check_effects(lst,path,C,E,W):
    if not isinstance(lst,list): E.append(path+': must be a list'); return
    for i,e in enumerate(lst):
        p='%s[%d]'%(path,i)
        if not isinstance(e,dict): E.append(p+': must be an object'); continue
        for k in e:
            if k not in ('fx','at','on','params','sfx','off'): E.append('%s: unknown field %s'%(p,k))
        fx=e.get('fx')
        if fx not in C['fx']: E.append('%s: effect %r is not in the library'%(p,fx)); continue
        a=e.get('at','contact')
        if a!='contact':
            if not isinstance(a,dict) or sum(k in a for k in ('plus','mark','sec'))!=1: E.append(p+'.at: contact, {plus}, {mark} or {sec}')
            elif 'plus' in a: _rng(a['plus'],-2,6,p+'.at.plus',E)
            elif 'sec' in a: _rng(a['sec'],0,12,p+'.at.sec',E)
        if e.get('on','auto') not in ON_WORDS: E.append('%s.on: %r is not one of %s'%(p,e.get('on'),ON_WORDS))
        if e.get('sfx') is not None and e['sfx'] not in C['sounds']: E.append('%s.sfx: no sound named %r in engine/audio.js'%(p,e['sfx']))
        if 'off' in e and e['off'] is not True: E.append(p+'.off: true or absent')
        pr=e.get('params')
        if pr is not None:
            if not isinstance(pr,dict): E.append(p+'.params: must be an object'); continue
            spec=C['fx'][fx]
            for n,v in pr.items():
                d=spec.get(n)
                if d is None: E.append('%s.params.%s: effect %s has no such setting'%(p,n,fx)); continue
                k=d['kind']
                if k=='range':
                    if not isnum(v) or v<d['lo'] or v>d['hi']: E.append('%s.params.%s: %r is not from %s to %s'%(p,n,v,d['lo'],d['hi']))
                elif k=='choice':
                    if v not in d['choices']: E.append('%s.params.%s: %r is not one of %s'%(p,n,v,d['choices']))
                elif k=='bool':
                    if not isinstance(v,bool): E.append('%s.params.%s: must be true or false'%(p,n))
                elif k=='number':
                    if not isnum(v): E.append('%s.params.%s: must be a number'%(p,n))
                elif k=='color':
                    if not (isinstance(v,str) and re.match(r'^#[0-9a-fA-F]{6}$',v)): E.append('%s.params.%s: must be a colour like #d97706'%(p,n))
                elif k=='text':
                    if not isinstance(v,str): E.append('%s.params.%s: must be text'%(p,n))
def check_stage(st,path,C,E,W):
    if not isinstance(st,dict): E.append(path+': must be an object'); return
    for k in st:
        if k not in ('steps','lasting','setpiece','objects'): E.append('%s: unknown field %s'%(path,k))
    objs=st.get('objects') or {}
    if not isinstance(objs,dict): E.append(path+'.objects: must be an object'); objs={}
    refs=[]
    def steps(lst,p):
        if not isinstance(lst,list): E.append(p+': must be a list'); return
        ids=set(s.get('id') for s in lst if isinstance(s,dict) and s.get('id'))
        for i,s in enumerate(lst):
            q='%s[%d]'%(p,i)
            if not isinstance(s,dict): E.append(q+': must be an object'); continue
            if s.get('do') not in STAGE_DO: E.append('%s.do: %r is not one of the 15 actions'%(q,s.get('do')))
            if 'at' in s and not at_ok(s['at']): E.append(q+'.at: seconds, a mark name, {pic}, {mark, plus} or {step, plus}')
            for k,(lo,hi) in STEP_RANGE.items():
                if k in s and isnum(s[k]): _rng(s[k],lo,hi,q+'.'+k,E)
            if s.get('do')=='sfx' and s.get('sfx') not in C['sounds']: E.append('%s.sfx: no sound named %r'%(q,s.get('sfx')))
            if s.get('asset'): refs.append((q,s['asset']))
    steps(st.get('steps',[]),path+'.steps')
    if 'setpiece' in st and st['setpiece'] is not None:
        sp=st['setpiece']
        if not isinstance(sp,dict): E.append(path+'.setpiece: must be an object')
        else:
            if 'dur' in sp: _rng(sp['dur'],3,10,path+'.setpiece.dur',E)
            if 'dim' in sp: _rng(sp['dim'],0,0.95,path+'.setpiece.dim',E)
            steps(sp.get('steps',[]),path+'.setpiece.steps')
    lasting=st.get('lasting',[])
    if not isinstance(lasting,list): E.append(path+'.lasting: must be a list'); lasting=[]
    for i,l in enumerate(lasting):
        q='%s.lasting[%d]'%(path,i)
        if not isinstance(l,dict) or not isinstance(l.get('while'),str): E.append(q+': needs a while'); continue
        if l.get('asset'): refs.append((q,l['asset']))
    for oid,o in objs.items():
        q='%s.objects.%s'%(path,oid)
        if not isinstance(o,dict): E.append(q+': must be an object'); continue
        for k in o:
            if k not in ('name','kind','bg','size','loop','entry','prompt','motion','words'): E.append('%s: unknown field %s'%(q,k))
        if o.get('kind') not in ('prop','obj'): E.append(q+'.kind: prop or obj')
        if o.get('bg') not in ('magenta','black'): E.append(q+'.bg: magenta or black')
        sz=o.get('size')
        if not (isinstance(sz,dict) and len(sz)==1 and (isnum(sz.get('h')) or isnum(sz.get('sw')))): E.append(q+'.size: {h} or {sw}')
        if not isinstance(o.get('name'),str) or not o['name']: E.append(q+'.name: needs words')
        if not isinstance(o.get('entry'),str) or not o['entry']: E.append(q+'.entry: needs an Art Library entry id')
        if 'words' in o and not (isinstance(o['words'],str) and 1<=len(o['words'])<=140 and not re.search(r'[<>]',o['words'])): E.append(q+'.words: Tom\'s words about what it is, 1 to 140 letters')
    for q,a in refs:
        if a not in objs: E.append('%s: the object %r is not in objects'%(q,a))
def check_section_set(S,path,C,E,W):
    if not isinstance(S,dict): E.append(path+': must be an object or null'); return
    for k in S:
        if k not in SECTIONS: E.append('%s: unknown section %s'%(path,k))
    s=S.get('start')
    if s is not None:
        p=path+'.start'
        if not isinstance(s,dict): E.append(p+': must be an object')
        else:
            if s.get('picture','standard') not in ('standard','own'): E.append(p+'.picture: standard or own')
            h=s.get('held')
            if h is not None and not (isinstance(h,str) and len(h)<=60): E.append(p+'.held: ONE thing, a text of at most 60 letters, never a list (Pipeline Lock, One held prop)')
            w=s.get('worn',[])
            if not isinstance(w,list) or len(w)>3 or any(not(isinstance(x,dict) and isinstance(x.get('what'),str) and isinstance(x.get('where'),str)) for x in w): E.append(p+'.worn: up to 3 of {what, where}')
            if 'entry' in s and not isinstance(s['entry'],str): E.append(p+'.entry: an Art Library entry id')
    b=S.get('body')
    if b is not None:
        p=path+'.body'
        if not isinstance(b,dict): E.append(p+': must be an object')
        else:
            for k in b:
                if k not in ('clip','motion','trim','marks','pair','hand','sound'): E.append('%s: unknown field %s'%(p,k))
            c=b.get('clip')
            if c is not None:
                if not isinstance(c,str): E.append(p+'.clip: a clip id or null')
                elif c not in C['clips']: W.append('%s.clip: %s is not baked in data/clips/'%(p,c))
            if 'motion' in b and b['motion'] not in MOTIONS: E.append('%s.motion: %r is not one of %s'%(p,b['motion'],MOTIONS))
            if b.get('trim') is not None:
                t=b['trim']
                if not(isinstance(t,dict) and isint(t.get('from')) and isint(t.get('to')) and 0<=t['from']<t['to']): E.append(p+'.trim: {from, to} pictures, from below to')
            m=b.get('marks',{})
            if not isinstance(m,dict) or len(m)>12: E.append(p+'.marks: up to 12')
            else:
                for n,v in m.items():
                    if not(isinstance(v,dict) and (isint(v.get('pic')) and v['pic']>=0 and len(v)==1 or isnum(v.get('f')) and 0<=v['f']<=1 and len(v)==1)): E.append('%s.marks.%s: {pic:n} or {f:0..1}'%(p,n))
            if b.get('pair') is not None:
                x=b['pair']
                if not(isinstance(x,dict) and isinstance(x.get('with'),str) and isinstance(x.get('clip'),str)): E.append(p+'.pair: {with, clip}')
            if b.get('hand') is not None:
                x=b['hand']
                if not(isinstance(x,list) and len(x)==2 and all(isnum(v) for v in x)): E.append(p+'.hand: [x, y]')
            if b.get('sound') is not None:
                x=b['sound']
                if not(isinstance(x,dict) and isint(x.get('at')) and x['at']>=0 and x.get('sfx') in C['sounds']): E.append(p+'.sound: {at: picture, sfx: a sound of engine/audio.js}')
    t=S.get('timing')
    if t is not None:
        p=path+'.timing'
        if not isinstance(t,dict): E.append(p+': must be an object')
        else:
            for k in t:
                if k not in ('contact','noHit','hitStop','shake','approach','approachSec','returnSec','gap','budget','impactMs'): E.append('%s: unknown field %s'%(p,k))
            c=t.get('contact','auto')
            if c!='auto':
                if not isinstance(c,dict) or len(c)!=1 or next(iter(c)) not in ('mark','step','sec','share'): E.append(p+'.contact: auto, {mark}, {step}, {sec} or {share}')
                else:
                    k,v=next(iter(c.items()))
                    if k=='sec': _rng(v,0,12,p+'.contact.sec',E)
                    elif k=='share': _rng(v,0,1,p+'.contact.share',E)
                    elif not isinstance(v,str) or not v: E.append('%s.contact.%s: a name'%(p,k))
            if 'noHit' in t and t['noHit'] is not True: E.append(p+'.noHit: true or absent')
            if 'hitStop' in t and not(isint(t['hitStop']) and 0<=t['hitStop']<=12): E.append(p+'.hitStop: a whole number of frames from 0 to 12')
            if 'shake' in t and not(isint(t['shake']) and 0<=t['shake']<=12): E.append(p+'.shake: a whole number of pixels from 0 to 12')
            if 'approach' in t and t['approach'] not in APPROACH: E.append(p+'.approach: auto, stay or run')
            for k,lo,hi in (('approachSec',.2,1.2),('returnSec',.2,1.2),('gap',.15,.8)):
                if k in t: _rng(t[k],lo,hi,p+'.'+k,E)
            if 'budget' in t and not(isnum(t['budget']) and t['budget']>0): E.append(p+'.budget: seconds')
            if 'impactMs' in t and not(isint(t['impactMs']) and t['impactMs']>=0): E.append(p+'.impactMs: whole milliseconds')
    if S.get('stage') is not None: check_stage(S['stage'],path+'.stage',C,E,W)
    if S.get('effects') is not None: check_effects(S['effects'],path+'.effects',C,E,W)
    a=S.get('answer')
    if a is not None:
        p=path+'.answer'
        if not isinstance(a,dict): E.append(p+': must be an object')
        else:
            for k in a:
                if k not in ('clip','effects'): E.append('%s: unknown field %s'%(p,k))
            if a.get('clip') is not None and not isinstance(a['clip'],str): E.append(p+'.clip: a clip id or null')
            elif isinstance(a.get('clip'),str) and a['clip'] not in C['clips']: W.append('%s.clip: %s is not baked'%(p,a['clip']))
            check_effects(a.get('effects',[]),p+'.effects',C,E,W)
    n=S.get('note')
    if n is not None and not(isinstance(n,str) and len(n)<=500): E.append(path+'.note: text of at most 500 letters')
def validate(doc,C):
    E=[];W=[]
    if not isinstance(doc,dict): return ['the file is not an object'],W
    for k in doc:
        if k not in ('v','id','rev','live','draft','finished','log'): E.append('unknown field '+k)
    if doc.get('v')!=1: E.append('v must be 1')
    if not(isinstance(doc.get('id'),str) and re.match(r'^(move|act|wind|body|ruckus):[a-z0-9_:]+$',doc['id'])): E.append('id: the Guide id of the animation')
    if not(isint(doc.get('rev')) and doc['rev']>=1): E.append('rev: a whole number from 1')
    for sec in ('live','draft'):
        if sec not in doc: E.append(sec+' is missing (use null)')
        elif doc[sec] is not None: check_section_set(doc[sec],sec,C,E,W)
    f=doc.get('finished')
    if f is not None:
        if not isinstance(f,dict): E.append('finished: must be an object or null')
        else:
            if f.get('by')!='tom': E.append('finished.by: only tom can finish a move')
            for k in ('rev','at','by','build'):
                if k not in f: E.append('finished.'+k+' is missing')
    lg=doc.get('log')
    if not isinstance(lg,list) or len(lg)>20: E.append('log: a list of at most 20 lines')
    else:
        for i,l in enumerate(lg):
            if not(isinstance(l,dict) and isint(l.get('rev')) and isinstance(l.get('at'),str) and l.get('by') in ('tom','claude','migration') and isinstance(l.get('what'),str)): E.append('log[%d]: {rev, at, by tom|claude|migration, what}'%i)
    if EM_DASH in json.dumps(doc,ensure_ascii=False): E.append('the file holds an em dash')
    return E,W
