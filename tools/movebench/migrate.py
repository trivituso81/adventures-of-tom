#!/usr/bin/env python3
# tools/movebench/migrate.py (movebench3): writes data/moves/<slug>.json, one file per animation that has anything today, from the places the engine reads now (claude/movebench-plan.md b.5 step 1):
#   data/b3-stage.js rows (stage, marks, the hit, the budget, objects)   data/guide-manifest.json (contact, hit stop, effects, their settings, the ward's answer)
#   anim and wind of data/b3-kit-*.js and data/b3-foes-ch*.js   B3_BODY_CLIPS (data/b3-clips.js)
# The engine does not read these files yet. A file whose rev is above 1, or whose log has a line by tom or claude, is Tom's or a session's work and is never overwritten.
#   python3 -I tools/movebench/migrate.py            writes the files (and removes none)
#   python3 -I tools/movebench/migrate.py --check    exits 1 when a file on disk is not what this would write (only files still at rev 1 and written by the migration)
# Importable: build() returns {slug: doc}.
import json, os, subprocess, sys
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0,HERE)
OUT=os.path.join(ROOT,'data','moves')
AT='2026-11-26T22:00:00-08:00'   # the migration's own stamp; fixed so the same tables always give the same files
NAMES={'carryon':'Carry-on bag','suitedoor':'Suite doors','porsche':'Black Porsche','runwaylights':'Runway lights','glare':'High-beam glare','jetwash':'Jet wash','controller':'Game controller','wingedshell':'Winged shell','bluebang':'Blue blast','fireball':'Fireball','starbeam':'Star beam','meteor':'Meteor','cushion':'Floor cushion','comet':'Comet','lamby':'Lamby','backuplamby':'Backup Lamby','cushionwall':'Cushion wall','castle':'Blanket castle','ripple':'Ripple','whoopee':'Whoopee cushion'}
BODY_ALIAS={'defeated':'die'}   # the Guide's id says defeated, the game's table says die
def game():
    r=subprocess.run(['node',os.path.join(HERE,'export_game.js')],capture_output=True,text=True,cwd=ROOT)
    if r.returncode: raise RuntimeError('export_game.js failed: '+r.stderr[:400])
    return json.loads(r.stdout)
def jread(f): return json.load(open(os.path.join(ROOT,f),encoding='utf8'))
def ref(row,name):
    """A hit named in a stage row is a mark of its body clip or the id of one of its steps."""
    if name in (row['body'].get('marks') or {}): return {'mark':name}
    ids=[s.get('id') for s in (row.get('steps') or [])+((row.get('setpiece') or {}).get('steps') or [])]
    if name in ids: return {'step':name}
    raise ValueError('hit %r is neither a mark nor a step id'%name)
def stage_section(row):
    st={}
    if row.get('steps'): st['steps']=row['steps']
    if row.get('lasting'): st['lasting']=row['lasting']
    if row.get('setpiece'): st['setpiece']=row['setpiece']
    objs={}
    for oid,a in (row.get('assets') or {}).items():
        tail=oid.split('/')[-1]; o={'name':NAMES.get(tail,tail),'kind':a['kind'],'bg':a['bg'],'size':a['size']}
        if a.get('loop'): o['loop']=True
        o['entry']='stage-'+oid.replace('/','-')
        for k in ('prompt','motion'):
            if a.get(k): o[k]=a[k]
        objs[oid]=o
    if objs: st['objects']=objs
    return st
def own_live(aid):
    """The live part of the file this animation already has on disk, or None when it has no file."""
    try: A=jread('data/guide-anims.json')['anims']; return (json.load(open(os.path.join(OUT,A[aid]['slug']+'.json'),encoding='utf8')).get('live'))
    except Exception: return None
def build():
    G=game(); A=jread('data/guide-anims.json')['anims']; M=jread('data/guide-manifest.json')
    mby={m['moveId']:m for m in M['moves'] if m.get('moveId')}
    docs={}; skipped=[]
    def put(aid,live,log=None):
        if not live: return
        slug=A[aid]['slug']
        docs[slug]={'v':1,'id':aid,'rev':1,'live':live,'draft':None,'finished':None,
                    'log':[{'rev':1,'at':AT,'by':'migration','what':'written from the tables the engine reads today'}]+(log or [])}
    for aid in A:
        kind=aid.split(':')[0]; p=aid.split(':')
        if kind=='move':
            S=G['SKILLS'][p[1]]; an=S.get('anim') or {}; row=G['STAGE'].get(S['id']); mrow=mby.get(S['id'])
            live={}; log=[]
            body={}
            if an.get('kind')=='clip': body['clip']=an['clip']
            if an.get('shape'): body['motion']=an['shape']
            if row:
                if row['body'].get('marks'): body['marks']=row['body']['marks']
                if row['body'].get('hand'): body['hand']=row['body']['hand']
            if an.get('pair'): body['pair']=an['pair']
            if an.get('sound'): body['sound']=an['sound']
            if body: live['body']=body
            t={}
            # movebench4: the engine reads the contact moment of the effects, the hit stop, the shake, the run-in and the effects from the spec, so a file that exists owns them (data/pass1-meta.js, which held the
            # 7 Pass-1 rows, and the manifest's effectParams are gone); only a move with no file yet is filled from the manifest
            ol=own_live(aid); ot=(ol or {}).get('timing') or {}
            valid=mrow is not None and isinstance(mrow.get('contactSec'),(int,float)) and mrow['contactSec']>=0
            if row:
                if row['hit']=='late': t['contact']=ref(row,row['late'])
                else: t['contact']=ref(row,row['hit'])
                t['budget']=row['budget']
            elif an.get('at') is not None: t['contact']={'share':an['at']}
            if not S.get('hits') or (any(e.get('op')=='later' for e in S['effects']) and not any(e.get('op')=='damage' for e in S['effects'])): t['noHit']=True   # no swing in its own beats (a ward, a pass, a hit that comes later): b3PlayMove arms no hit stop for it
            if ol is not None:
                for k in ('impactMs','hitStop','shake','approach'):
                    if k in ot: t[k]=ot[k]
            elif valid:
                t['impactMs']=round(mrow['contactSec']*1000)
                f=int(round(mrow.get('hitStopFrames') or 0))
                if f>0: t['hitStop']=f
            if t: live['timing']=t
            if row:
                st=stage_section(row)
                if st: live['stage']=st
            fx=[]
            if ol is not None: fx=[dict(e) for e in (ol.get('effects') or [])]
            elif valid: fx=[{'fx':i} for i in (mrow.get('libraryAssets') or [])]
            if fx: live['effects']=fx
            if mrow and mrow.get('counterClip'): live['answer']={'clip':None,'effects':[]}
            put(aid,live,log)
        elif kind=='act':
            f=G['FOES'][p[1]]; a=next(x for x in f['acts'] if x['id']==p[2]); an=a.get('anim') or {}
            body={}
            if an.get('kind')=='clip': body['clip']=an['clip']
            if an.get('shape'): body['motion']=an['shape']
            live={}
            if body: live['body']=body
            if an.get('at') is not None: live['timing']={'contact':{'share':an['at']}}
            put(aid,live)
        elif kind=='wind':
            f=G['FOES'][p[1]]; a=next(x for x in f['acts'] if x['id']==p[2])
            w=next((x for x in f['acts'] if x.get('then')==a['id']),None)
            clip=(w and w.get('wind')) or a.get('wind')
            if clip: put(aid,{'body':{'clip':clip}})
        elif kind=='body':
            st=BODY_ALIAS.get(p[2],p[2]); clip=(G['BODY_CLIPS'].get(p[1]) or {}).get(st)
            if clip: put(aid,{'body':{'clip':clip}})
    for s in G['SKILLS'].values():
        if not any(a.get('id')==('move:'+s['id']) for a in []) and ('move:'+s['id']) not in A: skipped.append('move:'+s['id'])
    return docs,skipped
def text(doc): return json.dumps(doc,indent=1,ensure_ascii=False)+'\n'
def mine(path):
    """True when the file on disk is still the migration's own (rev 1, no line by tom or claude)."""
    try: d=json.load(open(path,encoding='utf8'))
    except Exception: return False
    return d.get('rev')==1 and all(l.get('by')=='migration' for l in d.get('log',[])) and d.get('draft') is None and d.get('finished') is None
def main():
    docs,skipped=build(); check='--check' in sys.argv; os.makedirs(OUT,exist_ok=True); n=w=kept=0; bad=[]
    for slug,doc in sorted(docs.items()):
        path=os.path.join(OUT,slug+'.json'); n+=1
        if os.path.exists(path) and not mine(path): kept+=1; continue
        if os.path.exists(path) and open(path,encoding='utf8').read()==text(doc): continue
        if check: bad.append(slug); continue
        open(path,'w',encoding='utf8').write(text(doc)); w+=1
    if check:
        if bad: print('NOT WHAT THE MIGRATION WRITES:',', '.join(bad[:10]),'(%d)'%len(bad)); return 1
        print('migration files match the tables (%d files, %d edited by hand and left alone)'%(n,kept)); return 0
    print('migrate: %d animations have something today; wrote %d files, %d left alone (edited since); not in the Guide, no file: %s'%(n,w,kept,', '.join(skipped) or 'none'))
    return 0
if __name__=='__main__': sys.exit(main())
