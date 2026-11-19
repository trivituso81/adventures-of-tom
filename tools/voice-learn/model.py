import os; WORK=os.environ.get('VL_WORK','/tmp/vl')
import numpy as np,pandas as pd,warnings;warnings.filterwarnings('ignore')
from sklearn.linear_model import LogisticRegression
rng=np.random.default_rng(11)
df=pd.read_pickle('df.pkl')
meas=[c[2:] for c in df.columns if c.startswith('z_')]
Zc=['z_'+m for m in meas]
def cv_hit(d,C,seed,perm=False,folds=10,cols=Zc):
    ls=np.array(sorted(d.line.unique())); r=np.random.default_rng(seed); r.shuffle(ls)
    fold={l:i%folds for i,l in enumerate(ls)}
    d=d.copy(); d['f']=d.line.map(fold)
    y=d.kept.values.copy()
    if perm:   # permute kept within line
        y=y.copy()
        for l,ix in d.groupby('line').indices.items():
            y[ix]=y[rng.permutation(ix)] if False else y[ix][rng.permutation(len(ix))]
    X=d[cols].values; hits=[]
    for k in range(folds):
        tr=(d.f!=k).values; te=~tr
        clf=LogisticRegression(C=C,max_iter=500).fit(X[tr],y[tr])
        p=clf.decision_function(X[te]); sub=d[te].reset_index(drop=True); yy=y[te]
        for l,ix in sub.groupby('line').indices.items():
            hits.append(float(yy[ix][np.argmax(p[ix])]))
    return np.mean(hits)
def study(d,name,Cs=(0.003,0.03,0.3),nperm=60,cols=Zc):
    ch=np.mean(1/d.groupby('line').size())
    print(f'\n== {name}: {d.line.nunique()} lines, chance {ch:.3f}')
    for C in Cs:
        h=np.mean([cv_hit(d,C,s,cols=cols) for s in range(5)])
        nul=[cv_hit(d,C,s,perm=True,cols=cols) for s in range(nperm)]
        print(f' C={C}: hit {h:.3f}  null mean {np.mean(nul):.3f} 95th {np.percentile(nul,95):.3f}  p={(np.array(nul)>=h).mean():.3f}')
study(df,'ALL')
study(df[df.same],'SAME-SCRIPT')
study(df[~df.same],'CHANGED-SCRIPT')
# per voice, same-script
for v in ('deedee','tom','amy'):
    d=df[(df.voice==v)&df.same]
    if d.line.nunique()>=15: study(d,f'{v} SAME-SCRIPT',Cs=(0.03,),nperm=40)
