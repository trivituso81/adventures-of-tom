import json,re,collections
AUTO={'mellow','laid-back','low-key'}
def brackets(s):
    out=[]
    for b in re.findall(r'\[([^\]]*)\]',s):
        ws=[w.strip().lower() for w in b.split(',')]
        ws=[w for w in ws if w and 'accent' not in w and not w.startswith('grounded and natural') and 'when the line calls' not in w and 'when it calls' not in w and w not in AUTO and 'drawl' not in w and 'voice' not in w]
        out.append(ws)
    return out
def words(s): return [w for b in brackets(s) for w in b]
QUICK={'quick','quickly'}
def stats(train):
    """per voice and global: deleted / kept-from-draft counts, substitutions, quick rate"""
    S={'del':collections.defaultdict(collections.Counter),'keep':collections.defaultdict(collections.Counter),'sub':collections.defaultdict(lambda:collections.defaultdict(collections.Counter)),'gdel':collections.Counter(),'gkeep':collections.Counter(),'gvo':collections.defaultdict(set),'q':collections.Counter(),'n':collections.Counter(),'add':collections.defaultdict(collections.Counter)}
    for p in train:
        v=p['voice'];fb,kb=brackets(p['first']),brackets(p['kept']);fw=[w for b in fb for w in b];kw=[w for b in kb for w in b]
        S['n'][v]+=1
        kk=collections.Counter(kw)
        for w in set(fw):
            if kk[w]: S['keep'][v][w]+=1;S['gkeep'][w]+=1
            else: S['del'][v][w]+=1;S['gdel'][w]+=1;S['gvo'][w].add(v)
        for w in set(kw)-set(fw): S['add'][v][w]+=1
        if (set(kw)&QUICK) and not (set(fw)&QUICK): S['q'][v]+=1
        if len(fb)==len(kb):
            for a,b in zip(fb,kb):
                gone=[w for w in a if w not in b];new=[w for w in b if w not in a]
                if len(gone)==1 and len(new)==1: S['sub'][v][gone[0]][new[0]]+=1
    return S
def predict(p,S,mode,dmin=2):
    v=p['voice'];out=[]
    for b in brackets(p['first']):
        nb=[]
        for w in b:
            d,k=S['del'][v][w],S['keep'][v][w]
            gd,gk=S['gdel'][w],S['gkeep'][w]
            kill=False
            if 'A' in mode and d>=dmin and d>k: kill=True
            if 'G' in mode and gd>=3 and len(S['gvo'][w])>=2 and gd>gk and k==0: kill=True
            if kill:
                if 'B' in mode and S['sub'][v][w]:
                    x,c=S['sub'][v][w].most_common(1)[0]
                    if c>=2 and x not in nb: nb.append(x)
                continue
            nb.append(w)
        out.append(nb)
    if 'D' in mode and S['n'][v]>=4 and S['q'][v]/S['n'][v]>=0.25 and out and not any(w in QUICK for b in out for w in b):
        out[0].append('quickly')
    return out
def score(pred,kept):
    pw=collections.Counter(w for b in pred for w in b);kw=collections.Counter(kept)
    hit=sum((pw&kw).values());return hit,sum(pw.values()),sum(kw.values())
if __name__=='__main__':
    P=json.load(open('pairs.json'))
    CH=[p for p in P if words(p['first'])!=words(p['kept'])]
    cut=1795040040000  # 2026-11-18 22:14Z: the Aunt Ellie door session
    def run(test,trainf,label):
        print(label,'lines',len(test))
        for mode,dmin in [('',2),('A',2),('A',1),('G',2),('AG',2),('AB',2),('AGB',2),('AD',2),('AGBD',2)]:
            H=Pn=Kn=0
            for p in test:
                S=stats(trainf(p));h,a,b=score(predict(p,S,mode,dmin),words(p['kept']));H+=h;Pn+=a;Kn+=b
            pr=H/Pn if Pn else 0;rc=H/Kn if Kn else 0
            print('  %-5s dmin%d  my words he kept %3d of %3d (%.0f%%) | his words I had %3d of %3d (%.0f%%) | F1 %.3f'%(mode or 'base',dmin,H,Pn,100*pr,H,Kn,100*rc,2*pr*rc/(pr+rc) if pr+rc else 0))
    run(CH,lambda p:[q for q in CH if q['line']!=p['line']],'LEAVE ONE OUT, the lines he retuned')
    old=[q for q in CH if q['t']<cut]
    door=[p for p in P if p['t']>=cut-1 or 'They gave you a seat' in p['line']]
    door=[p for p in P if any(k in p['line'] for k in ["travel wrinkle","look at you again","From Deedee's muffin","stay up there","reading Tata","Am I? What","new curtains","I did. And","|Rose licked a muffin.","curtains are three","did you miss","street was quieter","They gave you a seat"])]
    run(door,lambda p:old,'FORWARD TEST: Aunt Ellie door scene (13 lines, every line heard), trained only on earlier takes')
    S=stats(CH)
    json.dump({'del':{v:dict(c) for v,c in S['del'].items()},'keep':{v:dict(c) for v,c in S['keep'].items()},'sub':{v:{w:dict(c) for w,c in d.items()} for v,d in S['sub'].items()},'n':dict(S['n']),'q':dict(S['q'])},open('stats.json','w'),ensure_ascii=False)
