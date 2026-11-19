import os; WORK=os.environ.get('VL_WORK','/tmp/vl')
import json,re,numpy as np,pandas as pd
df=pd.read_pickle('df.pkl'); R=json.load(open('asr_tiny.json'))
def norm(s):
    s=s.lower().replace('’',"'"); s=re.sub(r'\[[^\]]*\]','',s)
    s=re.sub(r"[^a-z0-9' ]",' ',s); return s.split()
def ed(a,b):
    n,m=len(a),len(b); D=np.zeros((n+1,m+1),int); D[:,0]=range(n+1); D[0,:]=range(m+1)
    for i in range(1,n+1):
        for j in range(1,m+1):
            D[i,j]=min(D[i-1,j]+1,D[i,j-1]+1,D[i-1,j-1]+(a[i-1]!=b[j-1]))
    # backtrace for ins/del/sub
    i,j=n,m; ins=dele=sub=0
    while i>0 or j>0:
        if i>0 and j>0 and D[i,j]==D[i-1,j-1]+(a[i-1]!=b[j-1]):
            sub+=(a[i-1]!=b[j-1]); i-=1; j-=1
        elif i>0 and D[i,j]==D[i-1,j]+1: dele+=1; i-=1      # script word missing in speech
        else: ins+=1; j-=1                                   # extra word in speech
    return D[n,m],ins,dele,sub
rows=[]
for _,r in df.iterrows():
    a=norm(r.script); b=norm(R[r.id]); d,i,de,s=ed(a,b)
    rows.append((r.id,d/max(1,len(a)),i,de,s,d))
A=pd.DataFrame(rows,columns=['id','wer','a_ins','a_del','a_sub','a_err'])
df=df.merge(A,on='id'); 
df['asr']=df.id.map(R)
df.to_pickle('df2.pkl')
print(df[['wer','a_ins','a_del','a_sub']].describe().round(3).T.to_string())
print('takes with 0 errors',(df.a_err==0).mean().round(3))
# repeated word detector: adjacent identical words in transcript not in script
