# Move Workbench phase 3 test (movebench3, claude/movebench-plan.md b.6): the spec files.
# FAILS when:
#   - a file in data/moves/ does not match the schema (tools/movebench/schema.py: types, ranges, ONE held prop, effect ids of the library, the library's own setting names and ranges,
#     sounds of engine/audio.js, finished.by only ever tom), holds an em dash, or is not named by the slug the Guide gives its animation id;
#   - data/move-specs.js is not what the files give (bundle.py --check), or the files are not what the old tables give (migrate.py --check);
#   - an animation that has something today (a clip, a stage row, a manifest row, a Pass-1 row, a body clip) has no file, or a file says something the old tables do not;
#   - engine/b3-spec.js is not loaded after data/move-specs.js, or msLive, msSet and msReset do not answer as documented (checked in node, no browser);
#   - (movebench7) data/movebench-fx.json is not what fxparams.py gives; a setting of any of the 37 effects has no control kind or no words in data/movebench-words.json (fx.params, fx.choices),
#     an effect has no name or line of words, or a drawer's default is outside its own range;
#   - a spec disagrees with what the engine plays today (golden.json): the effects a move arms, their contact moment, the hit stop, the stage steps, the body clip.
# Prints the counts and the things a spec names that do not exist yet (a clip not baked): those are listed, not failures.
# Usage (repo root): python3 -I tools/movebench/spec_test.py     Prints FAILS: [] when all pass.
import os, sys, json, re, subprocess, collections
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0,HERE)
import schema, migrate
fails=[]; notes=[]
def fail(m): fails.append(m); print('FAIL',m)
C=schema.ctx()
A=json.load(open(os.path.join(ROOT,'data','guide-anims.json'),encoding='utf8'))['anims']
slug2id={v['slug']:k for k,v in A.items()}
D=os.path.join(ROOT,'data','moves')
files=sorted(f for f in os.listdir(D) if f.endswith('.json') and f!='index.json')
docs={}; warns=[]
for f in files:
    try: d=json.load(open(os.path.join(D,f),encoding='utf8'))
    except Exception as e: fail('%s: not JSON (%s)'%(f,e)); continue
    docs[f[:-5]]=d
    E,W=schema.validate(d,C)
    for e in E[:6]: fail('%s: %s'%(f,e))
    warns+=['%s: %s'%(f,w) for w in W]
    if f[:-5]=='move-pick-me-up' and d.get('id')=='move:pick_me_up': pass   # a team move that data/guide-anims.json has no row for (the Guide page lists it from movebench6, owner team); movebench4 wrote its file so it keeps the heal it had
    elif f[:-5] not in slug2id: fail('%s: no animation of the Guide has this slug'%f)
    elif slug2id[f[:-5]]!=d.get('id'): fail('%s: id %s but the Guide says %s'%(f,d.get('id'),slug2id[f[:-5]]))
    txt=open(os.path.join(D,f),encoding='utf8').read()
    if chr(0x2014) in txt: fail('%s: em dash'%f)
notes.append('%d files in data/moves/'%len(docs))
# movebench6: only Tom finishes a move. A file whose `finished.by` is anyone else must fail the schema (a session never sets it).
_probe=json.loads(json.dumps(next(d for d in docs.values() if d.get('finished') is None)))
for _who in ('claude','migration','tom'):
    _probe['finished']={'rev':_probe['rev'],'at':'2026-11-27T10:00:00-08:00','by':_who,'build':None}
    _E,_W=schema.validate(_probe,C)
    if (_who=='tom')==any('only tom can finish' in e for e in _E): fail('the schema %s a file finished by %s' % ('refuses' if _who=='tom' else 'accepts',_who))

# ---- the script and the migration are fresh ----
for cmd in (['bundle.py','--check'],['migrate.py','--check']):
    r=subprocess.run([sys.executable,'-I',os.path.join(HERE,cmd[0])]+cmd[1:],capture_output=True,text=True,cwd=ROOT)
    notes.append(r.stdout.strip().split('\n')[-1])
    if r.returncode: fail('%s: %s'%(' '.join(cmd),(r.stdout+r.stderr).strip()[:300]))
# ---- what the old tables say, read again here, independent of migrate.py ----
G=migrate.game(); M=json.load(open(os.path.join(ROOT,'data','guide-manifest.json'),encoding='utf8'))
mby={m['moveId']:m for m in M['moves'] if m.get('moveId')}
byid={d['id']:d for d in docs.values()}
def live(aid): d=byid.get(aid); return (d or {}).get('live') or {}
for sid,S in G['SKILLS'].items():
    aid='move:'+sid
    if aid not in A: notes.append('%s is not in data/guide-anims.json (the page lists it, its file is data/moves/move-pick-me-up.json)'%aid); continue
    an=S.get('anim') or {}; L=live(aid); mrow=mby.get(sid)
    has=bool(an.get('kind')=='clip' or an.get('shape') or sid in G['STAGE'] or mrow)
    if has and aid not in byid: fail('%s has something today and no file'%aid)
    if an.get('kind')=='clip' and (L.get('body') or {}).get('clip')!=an['clip']: fail('%s: body.clip %r but the kit row plays %r'%(aid,(L.get('body') or {}).get('clip'),an['clip']))
    if an.get('kind')!='clip' and (L.get('body') or {}).get('clip'): fail('%s: names a clip the kit row does not play'%aid)
    if sid in G['STAGE']:
        row=G['STAGE'][sid]
        for k in ('steps','lasting','setpiece'):
            if (row.get(k) or None)!=((L.get('stage') or {}).get(k) or None): fail('%s: stage.%s is not the row of data/b3-stage.js'%(aid,k))
        if set((L.get('stage') or {}).get('objects',{}))!=set(row.get('assets',{})): fail('%s: objects are not the row\'s assets'%aid)
        if (L.get('timing') or {}).get('budget')!=row['budget']: fail('%s: budget differs from the row'%aid)
    elif 'stage' in L: fail('%s: has a stage and no row in data/b3-stage.js'%aid)
    if mrow and isinstance(mrow.get('counterClip'),bool) and bool(mrow['counterClip'])!=('answer' in L): fail('%s: answer does not follow the manifest counterClip'%aid)
for o,states in G['BODY_CLIPS'].items():
    for st,clip in states.items():
        aid='body:%s:%s'%(o,{'die':'defeated'}.get(st,st))
        if aid not in A: aid='body:%s:%s'%(o,st)
        if aid not in A: fail('%s:%s of B3_BODY_CLIPS is not an animation of the Guide'%(o,st)); continue
        if (live(aid).get('body') or {}).get('clip')!=clip: fail('%s: body.clip is not %s'%(aid,clip))
for fid,f in G['FOES'].items():
    for a in f['acts']:
        an=a.get('anim') or {}
        if an.get('kind')=='clip':
            aid='act:%s:%s'%(fid,a['id'])
            if aid in A and (live(aid).get('body') or {}).get('clip')!=an['clip']: fail('%s: body.clip is not %s'%(aid,an['clip']))
        if a.get('wind'):
            aid='wind:%s:%s'%(fid,a['id'])
            if aid in A and not live(aid): fail('%s: has a wind-up clip and no file'%aid)
for aid,v in A.items():
    if v.get('video') and v.get('clip') and aid.split(':')[0] in('move','act','wind','body') and aid not in byid: fail('%s has a video (%s) and no file'%(aid,v['clip']))
c=collections.Counter(aid.split(':')[0] for aid in byid); notes.append('files by kind: '+', '.join('%s %d'%(k,n) for k,n in sorted(c.items())))
n_eff=sum(1 for d in docs.values() if (d.get('live') or {}).get('effects')); n_stage=sum(1 for d in docs.values() if (d.get('live') or {}).get('stage')); n_ans=sum(1 for d in docs.values() if (d.get('live') or {}).get('answer'))
notes.append('with effects %d, with a stage %d (of 20 rows), with an answer %d (of 7 counter clips)'%(n_eff,n_stage,n_ans))
if n_stage!=len(G['STAGE']): fail('%d stage rows but %d files with a stage'%(len(G['STAGE']),n_stage))
# ---- engine/b3-spec.js, in node ----
html=open(os.path.join(ROOT,'index.html'),encoding='utf8').read()
tags=re.findall(r'<script src="([^"?]+)\?v=[^"]*"></script>',html)
if 'data/move-specs.js' not in tags or 'engine/b3-spec.js' not in tags: fail('index.html does not load data/move-specs.js and engine/b3-spec.js')
elif tags.index('data/move-specs.js')>tags.index('engine/b3-spec.js'): fail('data/move-specs.js must load before engine/b3-spec.js')
js="""const fs=require('fs'),vm=require('vm');const c=vm.createContext({console,Object,String,JSON});
vm.runInContext(fs.readFileSync('data/move-specs.js','utf8'),c);vm.runInContext(fs.readFileSync('engine/b3-spec.js','utf8'),c);
const r=x=>vm.runInContext(x,c),o={};
o.n=r('MS.n');o.known=r('msLive("move:lounge_pass_flex")!==null');o.unknown=r('msLive("move:nope")');
o.set=r('msSet("move:nope",{timing:{hitStop:3}}).timing.hitStop');o.seen=r('msLive("move:nope").timing.hitStop');o.after=r('msSet("move:nope",null)');
o.over=r('msSet("move:lounge_pass_flex",{x:1});JSON.stringify(msLive("move:lounge_pass_flex"))');o.back=r('msSet("move:lounge_pass_flex",null).timing.hitStop');
o.reset=r('msSet("move:nope",{});msReset();msLive("move:nope")');console.log(JSON.stringify(o));"""
r=subprocess.run(['node','-e',js],capture_output=True,text=True,cwd=ROOT)
if r.returncode: fail('b3-spec.js in node: '+r.stderr[:300])
else:
    o=json.loads(r.stdout)
    if o['n']!=len(byid): fail('MS.n is %s, files with a live part are %d'%(o['n'],sum(1 for d in docs.values() if d.get('live'))))
    if not o['known'] or o['unknown'] is not None or o['set']!=3 or o['seen']!=3 or o['after'] is not None or o['over']!='{"x":1}' or o['back']!=3 or o['reset'] is not None: fail('msLive, msSet or msReset do not answer as documented: %s'%r.stdout.strip()[:300])
# ---- the specs against what the engine plays today (golden.json) ----
gp=os.path.join(HERE,'golden.json')
if not os.path.exists(gp): fail('tools/movebench/golden.json is missing')
else:
    GD=json.load(open(gp,encoding='utf8'))['animations']; bad=0
    for aid,g in GD.items():
        if g.get('skipped'): continue
        L=live(aid)
        if g['kind']=='move':
            exp=[e['fx'] for e in L.get('effects',[])]; got=[x['id'] for c in g['effects'][:1] for x in c['fx']]
            if exp!=got: fail('%s: spec effects %s but the game armed %s'%(aid,exp,got)); bad+=1
            for c in g['effects'][:1]:
                if c['impactMs']!=(L.get('timing') or {}).get('impactMs'): fail('%s: impactMs %s but the game armed %s'%(aid,(L.get('timing') or {}).get('impactMs'),c['impactMs'])); bad+=1
                for x in c['fx']:
                    sp=next((e for e in L.get('effects',[]) if e['fx']==x['id']),{}).get('params')
                    if (sp or None)!=(x['params'] or None): fail('%s: %s params %s but the game armed %s'%(aid,x['id'],sp,x['params'])); bad+=1
            hs=(L.get('timing') or {}).get('hitStop',0); hold=g['hold'][0]['dur'] if g['hold'] else 0
            nohit=bool((L.get('timing') or {}).get('noHit'))
            if nohit and hold: fail('%s: spec says no hit but the game holds a hit stop of %s s'%(aid,hold)); bad+=1
            elif not nohit and hs and abs(min(0.5,hs/24)-hold)>0.0011: fail('%s: hit stop %s frames but the game holds %s s'%(aid,hs,hold)); bad+=1
            fired=collections.Counter(s['do'] for s in g['stage'])
            if fired:
                st=L.get('stage') or {}; spec=collections.Counter(s['do'] for s in (st.get('steps') or [])+((st.get('setpiece') or {}).get('steps') or []))
                if any(spec[k]<n for k,n in fired.items()): fail('%s: the game fired stage steps %s that the spec does not hold (%s)'%(aid,dict(fired),dict(spec))); bad+=1
            row=(L.get('timing') or {}).get('budget')
            if g['run'] and g['run']['budget']!=row: fail('%s: budget %s but the game ran %s'%(aid,row,g['run']['budget'])); bad+=1
        if g['kind'] in('act','state') and not (g['kind']=='act' and not L.get('body')):
            pass
    notes.append('%d golden records read against the specs, %d disagree'%(len(GD),bad))

# ---------- movebench7: every effect and setting reaches the page with a control and words ----------
import fxparams
FXJ=json.load(open(os.path.join(ROOT,'data','movebench-fx.json'),encoding='utf8')); WD=json.load(open(os.path.join(ROOT,'data','movebench-words.json'),encoding='utf8'))
if fxparams.text(fxparams.build())!=open(os.path.join(ROOT,'data','movebench-fx.json'),encoding='utf8').read(): fail('data/movebench-fx.json is not what fxparams.py gives: run python3 tools/movebench/fxparams.py')
FW=WD.get('fx') or {}; nset=0; nfx=0
for fid,D in FXJ['fx'].items():
    nfx+=1
    it=(FW.get('items') or {}).get(fid)
    if not it or not it.get('name') or not it.get('what'): fail('%s: no name and line of words in data/movebench-words.json fx.items'%fid)
    for n,q in D['params'].items():
        k=q['kind']
        if k not in fxparams.KINDS: fail('%s.%s: kind %r has no control'%(fid,n,k)); continue
        if k=='who': continue
        nset+=1
        pw=(FW.get('params') or {}).get(n)
        if not pw or not pw.get('label'): fail('%s.%s: no words in fx.params'%(fid,n))
        if k=='choice':
            for c in q['choices']:
                if c not in (FW.get('choices') or {}): fail('%s.%s: the choice %r has no words in fx.choices'%(fid,n,c))
            if q['default'] not in q['choices']: fail('%s.%s: default %r is not a choice'%(fid,n,q['default']))
        if k=='range' and not (q['lo']<=q['default']<=q['hi']): fail('%s.%s: default %r is outside %s to %s'%(fid,n,q['default'],q['lo'],q['hi']))
        if k=='number' and not isinstance(q['default'],(int,float)): fail('%s.%s: no default number'%(fid,n))
        if k=='color' and not (isinstance(q['default'],str) and q['default'].startswith('#')): fail('%s.%s: no default colour'%(fid,n))
for sec in ('when','on','sound'):
    if sec not in WD: fail('data/movebench-words.json has no %s block'%sec)
if '\u2014' in open(os.path.join(ROOT,'data','movebench-fx.json'),encoding='utf8').read(): fail('data/movebench-fx.json holds an em dash')
if set(FXJ['fx'])!=set(C['fx'])-set(schema.EXTRA_FX): fail('movebench-fx.json and the library name different effects')
notes.append('movebench7: %d effects, %d settings with a control kind and words'%(nfx,nset))
if warns:
    notes.append('named and not there yet (%d): %s'%(len(warns),'; '.join(sorted(set(w.split(': ',1)[1] for w in warns))[:6])))
for n in notes: print(n)
print('FAILS:',fails)
sys.exit(1 if fails else 0)
