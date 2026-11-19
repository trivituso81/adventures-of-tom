import os; WORK=os.environ.get('VL_WORK','/tmp/vl')
import numpy as np,pandas as pd,json,warnings;warnings.filterwarnings('ignore')
rng=np.random.default_rng(3)
D=pd.read_pickle('df2.pkl'); D['dur_ratio']=D.dur/D.groupby('line').dur.transform('median')
out={}
# 1. failure detector: leave-one-line-out threshold choice
ths=[1,2,3,4,6]; lines=sorted(D.line.unique()); byl={l:g for l,g in D.groupby('line')}
def clean_kept(g,th):  # 1 if kept take is unflagged, only for mixed lines
    fl=g.a_ins>=th
    if fl.any() and (~fl).any(): return int(not fl[g.kept].iloc[0])
    return None
sc={l:{th:clean_kept(byl[l],th) for th in ths} for l in lines}
hits=[];chs=[]
for l in lines:
    best=max(ths,key=lambda th:np.mean([sc[m][th] for m in lines if m!=l and sc[m][th] is not None] or [0]))
    g=byl[l]; fl=(g.a_ins>=best).values; k=g.kept.values
    pool=~fl if (~fl).any() else np.ones(len(g),bool)      # veto flagged takes, then pick at random among the rest
    hits.append(float(k[pool].sum()/pool.sum())); chs.append(1/len(g))
out['veto_hit']=float(np.mean(hits)); out['chance']=float(np.mean(chs)); out['lines']=len(lines)
mixed=[l for l in lines if sc[l][3] is not None]; out['mixed_lines_th3']=len(mixed); out['kept_clean_th3']=int(sum(sc[l][3] for l in mixed))
f=D[D.a_ins>=3]; out['flagged']=len(f); out['flagged_kept']=int(f.kept.sum()); out['flagged_lines']=int(f.line.nunique())
out['discarded']=int((~D.kept).sum()); out['flagged_dur_ge1.3']=float((f.dur_ratio>=1.3).mean())
# veto only on same-script lines
S=[l for l in lines if byl[l].same.iloc[0]]
hs=[];cs=[]
for l in S:
    g=byl[l]; fl=(g.a_ins>=3).values; k=g.kept.values; pool=~fl if (~fl).any() else np.ones(len(g),bool)
    hs.append(float(k[pool].sum()/pool.sum())); cs.append(1/len(g))
out['veto_hit_same']=float(np.mean(hs)); out['chance_same']=float(np.mean(cs)); out['same_lines']=len(S); out['same_lines_with_flag']=int(sum(1 for l in S if (byl[l].a_ins>=3).any()))
# permutation: veto hit vs random kept within line
null=[]
for _ in range(2000):
    h=[]
    for l in lines:
        g=byl[l]; fl=(g.a_ins>=3).values; pool=~fl if (~fl).any() else np.ones(len(g),bool)
        j=rng.integers(len(g)); h.append(float(pool[j])/pool.sum())
    null.append(np.mean(h))
out['veto_perm_p']=float((np.array(null)>=out['veto_hit']).mean()); out['veto_null_mean']=float(np.mean(null))
# 2. per-voice pace and loudness on CLEAN takes
C=D[D.a_ins<3].groupby('line').filter(lambda g:len(g)>=2 and g.kept.any())
rows=[]
for v,gv in C.groupby('voice'):
    for kind,sel in (('changed',~gv.same),('same',gv.same)):
        r=[];
        for l,g in gv[sel].groupby('line'):
            k=g[g.kept]; o=g[~g.kept]
            if len(k) and len(o): r.append(np.log(k.wps.iloc[0]/o.wps.mean()))
        if len(r)>=3: rows.append((v,kind,len(r),float(np.exp(np.mean(r))),float(np.std(r)/np.sqrt(len(r)))))
P=pd.DataFrame(rows,columns=['voice','kind','lines','kept_over_thrown_pace','se_log']); 
out['pace']=P.round(3).to_dict('records')
K=D[D.kept&(D.a_ins<3)].groupby('voice').agg(n=('lufs','size'),lufs=('lufs','mean'),f0=('f0_med','mean'),wps=('wps','mean')).round(2)
out['kept_by_voice']=K[K.n>=5].reset_index().to_dict('records')
json.dump(out,open('final.json','w'),indent=1)
for k,v in out.items():
    if k not in('pace','kept_by_voice'): print(k,v)
print(P.round(3).to_string(index=False)); print(K[K.n>=5].to_string())
