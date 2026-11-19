import os; WORK=os.environ.get('VL_WORK','/tmp/vl')
import json,numpy as np,pandas as pd,collections,sys
rng=np.random.default_rng(7)
meta=pd.DataFrame(json.load(open('takes_meta.json'))); F=pd.DataFrame(json.load(open('features.json')))
df=meta.merge(F,on='id'); df['t']=df['t'].astype(np.int64)
df['voice']=df.line.str.split('|').str[1]
df['syl_per_word']=df.syl_rate*df.sdur/df.nwords
df['tot_speech_lead']=df.lead+df.trail
meas=[c for c in F.columns if c not in('id','clip_frac','nwords','sdur','lead','trail')]+['syl_per_word']
df=df.dropna(subset=meas).reset_index(drop=True)
# line-level info
g=df.groupby('line')
df['n']=g.id.transform('count'); df['same']=g.script.transform(lambda s:s.nunique()==1)
df['rank']=g.t.rank(method='first')
lines=list(g.groups.keys())
# within-line deviation
for m in meas: df['d_'+m]=df[m]-g[m].transform('mean')
sd={m:df['d_'+m].std() for m in meas}
for m in meas: df['z_'+m]=df['d_'+m]/(sd[m]+1e-12)
byline={l:d.reset_index(drop=True) for l,d in df.groupby('line')}
def chance(ls): return np.mean([1/len(byline[l]) for l in ls])
def hit_sign_rule(ls,m,voice_sub=None):
    # leave-one-line-out sign from other lines (within the same line set pool)
    S={l:byline[l]['z_'+m].values for l in ls}; K={l:byline[l].kept.values for l in ls}
    kd={l:S[l][K[l]][0] for l in ls}   # kept deviation
    tot=sum(kd.values()); hits=[];
    for l in ls:
        s=np.sign(tot-kd[l]) or 1
        pick=np.argmax(s*S[l]); hits.append(float(K[l][pick]))
    return np.mean(hits),np.sign(tot)
def run(ls,name,nperm=2000):
    ls=list(ls); ch=chance(ls); rows=[]
    for m in meas:
        h,s=hit_sign_rule(ls,m); rows.append((m,h,s))
    R=pd.DataFrame(rows,columns=['measure','hit','dir']).sort_values('hit',ascending=False)
    # permutation null for the MAX over measures (permute which take is kept in each line, jointly across measures)
    mx=[]
    K0={l:byline[l].kept.values.copy() for l in ls}
    Z={l:np.stack([byline[l]['z_'+m].values for m in meas],1) for l in ls}
    for _ in range(nperm):
        kd=np.zeros((len(ls),len(meas)))
        pk=[]
        for i,l in enumerate(ls):
            j=rng.integers(len(Z[l])); pk.append(j); kd[i]=Z[l][j]
        tot=kd.sum(0); hits=np.zeros(len(meas))
        for i,l in enumerate(ls):
            s=np.sign(tot-kd[i]); s[s==0]=1
            sc=Z[l]*s; pick=np.argmax(sc,0); hits+=(pick==pk[i])
        mx.append((hits/len(ls)).max())
    mx=np.array(mx)
    print(f'\n=== {name}: {len(ls)} lines, chance {ch:.3f}, null max-over-{len(meas)}-measures: mean {mx.mean():.3f}, 95th pct {np.percentile(mx,95):.3f}')
    R['p_corrected']=[(mx>=h).mean() for h in R.hit]
    print(R.head(10).round(3).to_string(index=False))
    return R,ch
if __name__=='__main__':
    allL=lines; sameL=[l for l in lines if byline[l].same.iloc[0]]; diffL=[l for l in lines if not byline[l].same.iloc[0]]
    out={}
    for nm,ls in (('ALL',allL),('SAME-SCRIPT (pure re-rolls)',sameL),('CHANGED-SCRIPT',diffL)):
        out[nm]=run(ls,nm)
    df.to_pickle('df.pkl')
