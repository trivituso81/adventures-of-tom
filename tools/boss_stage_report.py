# Reads boss_stage_test.py output: per scene, pages with people overlapping (same column within two rows) and pages with someone facing away from the boss.
import json,sys,collections
r=json.load(open(sys.argv[1]))
def dirto(dx,dy): return ('left' if dx<0 else 'right') if abs(dx)>abs(dy) else ('up' if dy<0 else 'down')
rows=[]
for name,d in r.items():
    by=collections.OrderedDict()
    for s in d['snaps']: by.setdefault(s['scene'],[]).append(s)
    for sc,ss in by.items():
        pages=len(ss); ov=0; face=0; worst=set(); fworst=set(); stacked=0
        for s in ss:
            P=[p for p in s['party'] if not p['hidden']]
            o=False
            for i in range(len(P)):
                for j in range(i+1,len(P)):
                    a,b=P[i]['pos'],P[j]['pos']
                    if abs(a[0]-b[0])<1 and abs(a[1]-b[1])<3: o=True; worst.add(P[i]['id']+'/'+P[j]['id'])
                    if abs(a[0]-b[0])<.01 and abs(a[1]-b[1])<.01: stacked+=1
            ov+=o
            if s['boss']:
                bx,by_=s['boss']['pos']; f=False
                for p in P:
                    if p['pose']: continue
                    want=dirto(bx-p['pos'][0],by_-p['pos'][1])
                    if p['facing']!=want: f=True; fworst.add(p['id'])
                face+=f
        rows.append((name,sc,pages,ov,face,sorted(worst),sorted(fworst),stacked))
print('case|scene|pages|pages w/ overlap|pages w/ wrong facing|overlapping pairs|facing wrong')
for x in rows: print('|'.join(str(v) for v in x[:7]))
for n,d in r.items():
    if d['errs']: print('ERR',n,d['errs'])
